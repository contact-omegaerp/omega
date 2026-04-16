// =====================================================
// TUYEN-DUNG.GS — Google Apps Script Backend
// Hệ thống tuyển dụng Omega Solution & Technology Co., Ltd.
// =====================================================
// Deploy: Extensions > Apps Script > Deploy > New deployment > Web app
//   - Execute as: Me
//   - Who has access: Anyone
// Sau khi deploy, dán URL vào mỗi file HTML tại biến GAS_URL
// =====================================================

// ── CẤU HÌNH CƠ BẢN ──────────────────────────────────────────────────────────
// Điền Sheet ID sau khi tạo bảng tính trên Google Sheets
const SHEET_ID = '';   // <-- Điền vào đây sau khi upload file Excel lên GSheets

// Các key nhạy cảm — KHÔNG được trả về frontend
const PRIVATE_KEYS = [
  'LLM_API_Key', 'LLM_Model', 'LLM_Max_Token',
  'HR_Emails', 'Email_Password', 'Master_Password'
];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN HANDLERS
// ─────────────────────────────────────────────────────────────────────────────

function doGet(e) {
  const action   = (e.parameter.action || '').toLowerCase();
  const callback = e.parameter.callback; // JSONP support
  let result;
  try {
    if      (action === 'jobs')   result = getJobs();
    else if (action === 'job')    result = getJob(e.parameter.id);
    else if (action === 'stats')  result = getStats();
    else                          result = { status: 'ok', message: 'Omega Tuyen Dung API' };
  } catch (err) {
    result = { status: 'error', message: err.toString() };
  }
  const json = JSON.stringify(result);
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + json + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return createJsonResponse(result);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    return createJsonResponse({ success: false, message: 'Hệ thống đang bận, vui lòng thử lại.' });
  }
  try {
    const data   = JSON.parse(e.postData.contents);
    const action = (data.action || '').toLowerCase();
    if (action === 'apply') return createJsonResponse(handleApply(data));
    return createJsonResponse({ success: false, message: 'Action không hợp lệ.' });
  } catch (err) {
    return createJsonResponse({ success: false, message: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

function createJsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────

function getConfig(ss) {
  if (!ss) ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet  = ss.getSheetByName('Config');
  if (!sheet) return {};
  const data   = sheet.getDataRange().getValues();
  const config = {};
  for (let i = 1; i < data.length; i++) {
    if (data[i][0]) config[String(data[i][0]).trim()] = data[i][1];
  }
  return config;
}

function getSafeConfig(config) {
  const safe = {};
  for (const k in config) {
    if (!PRIVATE_KEYS.includes(k)) safe[k] = config[k];
  }
  return safe;
}

// ─────────────────────────────────────────────────────────────────────────────
// JOBS — đọc dữ liệu từ sheet "Jobs"
// ─────────────────────────────────────────────────────────────────────────────

function readJobsSheet(ss) {
  if (!ss) ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName('Jobs');
  if (!sheet) return [];
  const data    = sheet.getDataRange().getValues();
  const headers = data[0].map(function(h) { return String(h).trim(); });
  const jobs    = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    if (!row[0]) continue; // bỏ dòng trống
    const job = {};
    headers.forEach(function(h, j) { job[h] = row[j] !== undefined ? row[j] : ''; });
    jobs.push(job);
  }
  return jobs;
}

// Trả về danh sách tất cả jobs (status + openings + apply_count — không bao gồm JD đầy đủ)
function getJobs() {
  const ss   = SpreadsheetApp.openById(SHEET_ID);
  const jobs = readJobsSheet(ss);
  const applyCount = countApplicationsByJob(ss);

  const list = jobs.map(function(j) {
    return {
      id:           j['Job_ID']    || '',
      slug:         j['Slug']      || '',
      title:        j['Title']     || '',
      department:   j['Department']|| '',
      dept_slug:    j['Dept_Slug'] || '',
      type:         j['Type']      || 'Toàn thời gian',
      level:        j['Level']     || '',
      location:     j['Location']  || 'TP. Hồ Chí Minh',
      salary:       j['Salary']    || '',
      openings:     j['Openings']  || 1,
      deadline:     formatDate(j['Deadline']),
      status:       j['Status']    || 'ACTIVE',
      hot:          String(j['Hot']).toUpperCase() === 'TRUE',
      apply_count:  applyCount[j['Job_ID']] || 0
    };
  });

  return { status: 'success', jobs: list, total: list.length };
}

// Trả về chi tiết 1 job theo Job_ID hoặc Slug
function getJob(id) {
  if (!id) return { status: 'error', message: 'Thiếu id.' };
  const ss   = SpreadsheetApp.openById(SHEET_ID);
  const jobs = readJobsSheet(ss);
  const applyCount = countApplicationsByJob(ss);

  const job = jobs.find(function(j) {
    return j['Job_ID'] === id || j['Slug'] === id;
  });
  if (!job) return { status: 'error', message: 'Không tìm thấy vị trí: ' + id };

  return {
    status: 'success',
    job: {
      id:           job['Job_ID'],
      slug:         job['Slug'],
      title:        job['Title'],
      department:   job['Department'],
      dept_slug:    job['Dept_Slug'],
      type:         job['Type'],
      level:        job['Level'],
      location:     job['Location'],
      salary:       job['Salary'],
      openings:     job['Openings'],
      deadline:     formatDate(job['Deadline']),
      status:       job['Status'],
      hot:          String(job['Hot']).toUpperCase() === 'TRUE',
      apply_count:  applyCount[job['Job_ID']] || 0
    }
  };
}

// Thống kê tổng: số vị trí đang tuyển, số đơn hôm nay
function getStats() {
  const ss   = SpreadsheetApp.openById(SHEET_ID);
  const jobs = readJobsSheet(ss);
  const active = jobs.filter(function(j) {
    return ['ACTIVE','HOT'].includes(String(j['Status']).toUpperCase());
  });
  return {
    status:         'success',
    active_jobs:    active.length,
    total_jobs:     jobs.length
  };
}

function countApplicationsByJob(ss) {
  const sheet = ss.getSheetByName('Applications');
  if (!sheet) return {};
  const data    = sheet.getDataRange().getValues();
  const headers = data[0].map(function(h) { return String(h).trim(); });
  const jobIdIdx = headers.indexOf('Job_ID');
  if (jobIdIdx < 0) return {};
  const counts = {};
  for (let i = 1; i < data.length; i++) {
    const jid = String(data[i][jobIdIdx] || '').trim();
    if (jid) counts[jid] = (counts[jid] || 0) + 1;
  }
  return counts;
}

// ─────────────────────────────────────────────────────────────────────────────
// APPLY — nhận hồ sơ ứng tuyển
// ─────────────────────────────────────────────────────────────────────────────

function handleApply(data) {
  // Validate
  const required = ['job_id', 'job_title', 'full_name', 'email', 'phone'];
  for (const field of required) {
    if (!data[field] || String(data[field]).trim() === '') {
      return { success: false, message: 'Vui lòng điền đầy đủ thông tin bắt buộc: ' + field };
    }
  }
  if (!isValidEmail(data.email)) {
    return { success: false, message: 'Địa chỉ email không hợp lệ.' };
  }
  if (!data.cv_link && !data.cv_text) {
    return { success: false, message: 'Vui lòng cung cấp link CV hoặc nội dung CV.' };
  }

  const ss     = SpreadsheetApp.openById(SHEET_ID);
  const config = getConfig(ss);

  // Kiểm tra job còn tuyển không
  const jobs    = readJobsSheet(ss);
  const job     = jobs.find(function(j) { return j['Job_ID'] === data.job_id; });
  if (job && ['CLOSED','PAUSED'].includes(String(job['Status']).toUpperCase())) {
    return { success: false, message: 'Vị trí này đã hết hạn nộp hồ sơ.' };
  }

  // Chấm điểm CV bằng AI
  let aiScore    = null;
  let aiFeedback = '';
  try {
    const jd      = job ? buildJDText(job) : (data.job_title || '');
    const cvContent = data.cv_text || ('Link CV: ' + data.cv_link);
    const result    = scoreCVWithAI(config, jd, cvContent, data.job_title);
    aiScore    = result.score;
    aiFeedback = result.feedback;
  } catch (err) {
    console.error('AI score error:', err.toString());
    aiFeedback = 'Không thể chấm điểm tự động.';
  }

  // Lưu vào sheet Applications
  const appSheet = ss.getSheetByName('Applications');
  if (appSheet) {
    appSheet.appendRow([
      new Date(),                        // Timestamp
      data.job_id      || '',            // Job_ID
      data.job_title   || '',            // Job_Title
      data.full_name   || '',            // Full_Name
      data.email       || '',            // Email
      data.phone       || '',            // Phone
      data.current_role    || '',        // Current_Role
      data.current_company || '',        // Current_Company
      data.cv_link         || '',        // CV_Link
      (data.cv_text || '').substring(0, 500), // CV_Text (500 ký tự đầu)
      data.cover_letter    || '',        // Cover_Letter
      aiScore !== null ? aiScore : '',   // AI_Score
      aiFeedback,                        // AI_Feedback
      'Mới',                             // Status
      ''                                 // Notes
    ]);
  }

  // Gửi email xác nhận đến ứng viên
  try {
    sendConfirmationEmail(config, data);
  } catch (err) {
    console.error('Confirm email error:', err.toString());
  }

  // Gửi thông báo + điểm AI đến HR
  try {
    sendHRNotification(config, data, aiScore, aiFeedback);
  } catch (err) {
    console.error('HR email error:', err.toString());
  }

  return {
    success: true,
    message: 'Hồ sơ đã được ghi nhận! Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.',
    ai_score: aiScore
  };
}

// Xây dựng văn bản JD từ dữ liệu job
function buildJDText(job) {
  return [
    'VỊ TRÍ: ' + (job['Title'] || ''),
    'PHÒNG BAN: ' + (job['Department'] || ''),
    'CẤP BẬC: ' + (job['Level'] || ''),
    '',
    'MÔ TẢ CÔNG VIỆC:',
    job['Duties'] || '',
    '',
    'YÊU CẦU ỨNG VIÊN:',
    job['Requirements'] || '',
    '',
    'YÊU CẦU THÊM (LỢI THẾ):',
    job['Nice_To_Have'] || ''
  ].join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// AI SCORING — chấm điểm CV theo JD
// ─────────────────────────────────────────────────────────────────────────────

function scoreCVWithAI(config, jdText, cvContent, jobTitle) {
  const model  = String(config['LLM_Model']   || 'Gemini').trim();
  const apiKey = String(config['LLM_API_Key'] || '').trim();
  if (!apiKey) return { score: null, feedback: 'Chưa cấu hình API Key.' };

  const prompt = buildScoringPrompt(jdText, cvContent, jobTitle);

  let rawResponse = '';
  if      (model === 'Gemini')   rawResponse = callGemini(apiKey, prompt, config);
  else if (model === 'DeepSeek') rawResponse = callDeepSeek(apiKey, prompt, config);
  else if (model === 'Grok')     rawResponse = callGrok(apiKey, prompt, config);
  else throw new Error('Model không được hỗ trợ: ' + model + '. Dùng Gemini / DeepSeek / Grok.');

  return parseScoreResponse(rawResponse);
}

function buildScoringPrompt(jdText, cvContent, jobTitle) {
  return `Bạn là chuyên gia tuyển dụng tại công ty phần mềm ERP Omega (Việt Nam).
Hãy đánh giá CV ứng viên so với Mô tả công việc (JD) theo thang điểm 10.

=== MÔ TẢ CÔNG VIỆC (JD) ===
${jdText}

=== NỘI DUNG CV / HỒ SƠ ỨNG VIÊN ===
${cvContent}

=== YÊU CẦU ĐÁNH GIÁ ===
Trả về ĐÚNG định dạng JSON sau (không thêm text nào khác):
{
  "score": <số từ 0 đến 10, chính xác đến 1 chữ số thập phân>,
  "summary": "<tóm tắt 1-2 câu về mức độ phù hợp>",
  "strengths": ["<điểm mạnh 1>", "<điểm mạnh 2>"],
  "gaps": ["<điểm thiếu 1>", "<điểm thiếu 2>"],
  "recommendation": "<Nên phỏng vấn / Cần xem xét thêm / Không phù hợp>"
}`;
}

function parseScoreResponse(raw) {
  try {
    // Tách JSON từ response (đề phòng AI thêm text thừa)
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return { score: null, feedback: raw.substring(0, 500) };
    const obj   = JSON.parse(match[0]);
    const score = parseFloat(obj.score);
    const parts = [];
    if (obj.summary)        parts.push(obj.summary);
    if (obj.strengths?.length) parts.push('Điểm mạnh: ' + obj.strengths.join('; '));
    if (obj.gaps?.length)      parts.push('Cần cải thiện: ' + obj.gaps.join('; '));
    if (obj.recommendation) parts.push('→ ' + obj.recommendation);
    return {
      score:    isNaN(score) ? null : Math.min(10, Math.max(0, score)),
      feedback: parts.join('\n')
    };
  } catch (err) {
    return { score: null, feedback: raw.substring(0, 500) };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LLM CALLERS (Gemini / DeepSeek / Grok)
// ─────────────────────────────────────────────────────────────────────────────

function callGemini(key, prompt, config) {
  const maxTokens = parseInt(config['LLM_Max_Token'] || 600);
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' + key;
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { temperature: 0.2, maxOutputTokens: maxTokens }
  };
  const resp = UrlFetchApp.fetch(url, {
    method: 'post', contentType: 'application/json',
    payload: JSON.stringify(payload), muteHttpExceptions: true
  });
  const json = JSON.parse(resp.getContentText());
  if (json.candidates?.[0]?.content?.parts?.[0]?.text)
    return json.candidates[0].content.parts[0].text;
  throw new Error('Gemini error: ' + resp.getContentText().substring(0, 300));
}

function callDeepSeek(key, prompt, config) {
  const maxTokens = parseInt(config['LLM_Max_Token'] || 600);
  const resp = UrlFetchApp.fetch('https://api.deepseek.com/chat/completions', {
    method: 'post',
    headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
    payload: JSON.stringify({
      model: 'deepseek-chat',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2, max_tokens: maxTokens
    }), muteHttpExceptions: true
  });
  const json = JSON.parse(resp.getContentText());
  if (json.choices?.[0]?.message?.content) return json.choices[0].message.content;
  throw new Error('DeepSeek error: ' + resp.getContentText().substring(0, 300));
}

function callGrok(key, prompt, config) {
  const maxTokens = parseInt(config['LLM_Max_Token'] || 600);
  const resp = UrlFetchApp.fetch('https://api.x.ai/v1/chat/completions', {
    method: 'post',
    headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
    payload: JSON.stringify({
      model: 'grok-3-latest',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2, max_tokens: maxTokens
    }), muteHttpExceptions: true
  });
  const json = JSON.parse(resp.getContentText());
  if (json.choices?.[0]?.message?.content) return json.choices[0].message.content;
  throw new Error('Grok error: ' + resp.getContentText().substring(0, 300));
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL
// ─────────────────────────────────────────────────────────────────────────────

function sendConfirmationEmail(config, data) {
  const subject = '[Omega] Xác nhận nhận hồ sơ – ' + data.job_title;
  const body = `Kính chào ${data.full_name},

Cảm ơn bạn đã quan tâm và nộp hồ sơ ứng tuyển vị trí **${data.job_title}** tại Omega Solution & Technology Co., Ltd.

Chúng tôi đã nhận được hồ sơ của bạn và sẽ xem xét trong thời gian sớm nhất (thường 3–5 ngày làm việc). Nếu hồ sơ phù hợp, bộ phận Nhân sự sẽ liên hệ với bạn qua email hoặc điện thoại để sắp xếp phỏng vấn.

Trong thời gian chờ đợi, bạn có thể tìm hiểu thêm về Omega tại: https://omega.com.vn

Trân trọng,
Bộ phận Nhân sự – Omega Solution & Technology Co., Ltd.
📞 028 3512 8448 | ✉ hr@omega.com.vn | 🌐 omega.com.vn`;

  MailApp.sendEmail({
    to:      data.email,
    subject: subject,
    body:    body
  });
}

function sendHRNotification(config, data, aiScore, aiFeedback) {
  const hrEmails = String(config['HR_Emails'] || '').trim();
  if (!hrEmails) return;

  const scoreText = aiScore !== null
    ? `\n⭐ ĐIỂM AI: ${aiScore}/10\n📋 NHẬN XÉT:\n${aiFeedback}`
    : '\n⚠️ Không chấm điểm được tự động.';

  const subject = `[Omega Tuyển dụng] Hồ sơ mới – ${data.job_title} – ${data.full_name}`;
  const body = `CÓ HỒ SƠ ỨNG TUYỂN MỚI

📌 Vị trí: ${data.job_title} (${data.job_id})
👤 Ứng viên: ${data.full_name}
📧 Email: ${data.email}
📱 SĐT: ${data.phone}
🏢 Đang làm tại: ${data.current_role || 'N/A'} – ${data.current_company || 'N/A'}
🔗 Link CV: ${data.cv_link || '(Không có)'}
📝 Thư xin việc: ${data.cover_letter || '(Không có)'}
${scoreText}

──────────────────────────────
Xem toàn bộ hồ sơ trong Google Sheet: https://docs.google.com/spreadsheets/d/${SHEET_ID}`;

  const recipients = hrEmails.split(/[,;]+/).map(function(e) { return e.trim(); }).filter(Boolean);
  recipients.forEach(function(email) {
    MailApp.sendEmail({ to: email, subject: subject, body: body });
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────────

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || ''));
}

function formatDate(val) {
  if (!val) return '';
  try {
    const d = new Date(val);
    if (isNaN(d)) return String(val);
    return ('0' + d.getDate()).slice(-2) + '/' + ('0' + (d.getMonth()+1)).slice(-2) + '/' + d.getFullYear();
  } catch (e) {
    return String(val);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// HÀM TEST (chạy thủ công từ Apps Script editor)
// ─────────────────────────────────────────────────────────────────────────────

function testGetJobs() {
  const result = getJobs();
  console.log('Total jobs:', result.total);
  console.log('First job:', JSON.stringify(result.jobs[0]));
}

function testGetStats() {
  console.log(JSON.stringify(getStats()));
}

function testApply() {
  const result = handleApply({
    job_id:       'J001',
    job_title:    'Lập trình viên Backend (.NET/C#)',
    full_name:    'Nguyễn Văn A',
    email:        'test@example.com',
    phone:        '0901234567',
    current_role: 'Developer',
    current_company: 'ABC Corp',
    cv_link:      'https://drive.google.com/test',
    cover_letter: 'Tôi muốn ứng tuyển vì...'
  });
  console.log('Apply result:', JSON.stringify(result));
}
