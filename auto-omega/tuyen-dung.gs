// =====================================================
// TUYEN-DUNG.GS — Google Apps Script Backend
// Hệ thống tuyển dụng Omega Solution & Technology Co., Ltd.
// =====================================================
// Deploy: Extensions > Apps Script > Deploy > New deployment > Web app
//   - Execute as: Me
//   - Who has access: Anyone
// Sau khi deploy, dán URL vào mỗi file HTML tại biến GAS_URL
// Bật thêm Drive API v2: Apps Script > Services > Drive API (v2)
// =====================================================

const SHEET_ID     = '1JIC24VyE6VhhBl5FGXg-JbmAqXLZTSe0dulVGQ8wBdo';
const CV_FOLDER_ID = '1NNQXfNkUE4NrtOoi7Dg5Kmc27YKSAGB9';  // Thư mục Drive chứa CV ứng viên

// Keys PRIVATE — KHÔNG trả về frontend
const PRIVATE_KEYS = [
  'LLM_API_Key', 'LLM_Model',
  'HR_Emails', 'Master_Password'
];

// Tỉ trọng cho Role1–5 và Require1–5 (tổng = 105, chuẩn hóa khi tính)
const SCORE_WEIGHTS = [40, 30, 20, 10, 5];

// ─────────────────────────────────────────────────────────────────────────────
// MAIN HANDLERS
// ─────────────────────────────────────────────────────────────────────────────

function doGet(e) {
  const action   = (e.parameter.action || '').toLowerCase();
  const callback = e.parameter.callback;
  let result;
  try {
    if      (action === 'jobs')  result = getJobs();
    else if (action === 'job')   result = getJob(e.parameter.id);
    else if (action === 'stats') result = getStats();
    else                         result = { status: 'ok', message: 'Omega Tuyen Dung API v2' };
  } catch (err) {
    result = { status: 'error', message: err.toString() };
  }
  const json = JSON.stringify(result);
  if (callback) {
    return ContentService
      .createTextOutput(callback + '(' + json + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return jsonResponse(result);
}

// CORS: GAS tự set Access-Control-Allow-Origin: * cho simple requests.
// Frontend phải dùng Content-Type: text/plain (không trigger OPTIONS preflight).
function doPost(e) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) {
    return jsonResponse({ success: false, message: 'Hệ thống đang bận, vui lòng thử lại.' });
  }
  try {
    const data   = JSON.parse(e.postData.contents);
    const action = (data.action || '').toLowerCase();
    if (action === 'apply') return jsonResponse(handleApply(data));
    return jsonResponse({ success: false, message: 'Action không hợp lệ.' });
  } catch (err) {
    return jsonResponse({ success: false, message: err.toString() });
  } finally {
    lock.releaseLock();
  }
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

// ─────────────────────────────────────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────────────────────────────────────

function getConfig(ss) {
  if (!ss) ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName('Config');
  if (!sheet) return {};
  const data   = sheet.getDataRange().getValues();
  const config = {};
  for (let i = 1; i < data.length; i++) {
    const key = String(data[i][0] || '').trim();
    if (key && !key.startsWith('─') && !key.startsWith('🔒') && !key.startsWith('✅') && !key.startsWith('ℹ')) {
      config[key] = data[i][1];
    }
  }
  return config;
}

// ─────────────────────────────────────────────────────────────────────────────
// JOBS
// ─────────────────────────────────────────────────────────────────────────────

function readJobsSheet(ss) {
  if (!ss) ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName('Jobs');
  if (!sheet) return [];
  const data    = sheet.getDataRange().getValues();
  const headers = data[0].map(function(h) { return String(h).trim(); });
  const jobs    = [];
  for (let i = 1; i < data.length; i++) {
    if (!data[i][0]) continue;
    const job = {};
    headers.forEach(function(h, j) { job[h] = data[i][j] !== undefined ? data[i][j] : ''; });
    jobs.push(job);
  }
  return jobs;
}

function getJobs() {
  const ss          = SpreadsheetApp.openById(SHEET_ID);
  const config      = getConfig(ss);
  const hideInactive = String(config['Hide_Inactive'] || 'false').toUpperCase() === 'TRUE';
  const jobs        = readJobsSheet(ss);
  const applyCount  = countApplicationsByJob(ss);

  const list = jobs.map(function(j) {
    const status = String(j['Status'] || 'ACTIVE').toUpperCase();
    return {
      id:          j['Job_ID']     || '',
      slug:        j['Slug']       || '',
      title:       j['Title']      || '',
      department:  j['Department'] || '',
      dept_slug:   j['Dept_Slug']  || '',
      type:        j['Type']       || 'Toàn thời gian',
      level:       j['Level']      || '',
      location:    j['Location']   || 'TP. Hồ Chí Minh',
      salary:      j['Salary']     || '',
      openings:    j['Openings']   || 1,
      deadline:    formatDate(j['Deadline']),
      status:      status,
      excerpt:     j['Excerpt']    || '',
      apply_count: applyCount[j['Job_ID']] || 0
    };
  });

  return { status: 'success', jobs: list, total: list.length, hide_inactive: hideInactive };
}

function getJob(id) {
  if (!id) return { status: 'error', message: 'Thiếu id.' };
  const ss         = SpreadsheetApp.openById(SHEET_ID);
  const jobs       = readJobsSheet(ss);
  const applyCount = countApplicationsByJob(ss);

  const job = jobs.find(function(j) {
    return j['Job_ID'] === id || j['Slug'] === id;
  });
  if (!job) return { status: 'error', message: 'Không tìm thấy vị trí: ' + id };

  const status = String(job['Status'] || 'ACTIVE').toUpperCase();
  const config = getConfig(ss);

  return {
    status: 'success',
    job: {
      id:             job['Job_ID'],
      slug:           job['Slug'],
      title:          job['Title'],
      department:     job['Department'],
      dept_slug:      job['Dept_Slug'],
      type:           job['Type'],
      level:          job['Level'],
      location:       job['Location'],
      salary:         job['Salary'],
      openings:       job['Openings'],
      deadline:       formatDate(job['Deadline']),
      status:         status,
      excerpt:        job['Excerpt']  || '',
      apply_count:    applyCount[job['Job_ID']] || 0,
      email_reply_to: String(config['Email_Reply_To'] || 'info@omega.com.vn'),
      // Nội dung JD — frontend refresh từ đây
      roles:    ['Role1','Role2','Role3','Role4','Role5'].map(function(k){ return job[k] || ''; }).filter(Boolean),
      requires: ['Require1','Require2','Require3','Require4','Require5'].map(function(k){ return job[k] || ''; }).filter(Boolean),
      benefits: ['Benefit1','Benefit2','Benefit3','Benefit4','Benefit5'].map(function(k){ return job[k] || ''; }).filter(Boolean)
    }
  };
}

function getStats() {
  const ss     = SpreadsheetApp.openById(SHEET_ID);
  const config = getConfig(ss);
  const jobs   = readJobsSheet(ss);
  const active = jobs.filter(function(j) {
    return ['ACTIVE','HOT'].includes(String(j['Status'] || '').toUpperCase());
  });
  const depts = new Set(jobs.map(function(j) { return String(j['Dept_Slug'] || j['Department'] || '').trim(); }).filter(Boolean));
  return {
    status:           'success',
    active_jobs:      active.length,
    total_jobs:       jobs.length,
    dept_count:       depts.size,
    years_experience: parseInt(config['Years_Experience'] || '16', 10),
    total_clients:    parseInt(config['Total_Clients']    || '1000', 10)
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
// APPLY
// ─────────────────────────────────────────────────────────────────────────────

function handleApply(data) {
  const required = ['job_id', 'job_title', 'full_name', 'email', 'phone'];
  for (const field of required) {
    if (!String(data[field] || '').trim()) {
      return { success: false, message: 'Thiếu thông tin bắt buộc: ' + field };
    }
  }
  if (!isValidEmail(data.email)) {
    return { success: false, message: 'Địa chỉ email không hợp lệ.' };
  }
  if (!data.cv_file_base64) {
    return { success: false, message: 'Vui lòng đính kèm file CV.' };
  }

  const ss     = SpreadsheetApp.openById(SHEET_ID);
  const config = getConfig(ss);
  const jobs   = readJobsSheet(ss);
  // Tìm job theo Job_ID hoặc Slug (frontend gửi slug kể từ khi đổi slug-based)
  const job    = jobs.find(function(j) {
    return j['Job_ID'] === data.job_id || j['Slug'] === data.job_id;
  });
  // Job_ID thực tế từ sheet (dùng để log, filename)
  const actualJobId = (job && job['Job_ID']) ? job['Job_ID'] : data.job_id;

  if (job && ['CLOSED','PAUSED'].includes(String(job['Status'] || '').toUpperCase())) {
    return { success: false, message: 'Vị trí này đã hết hạn nộp hồ sơ.' };
  }

  // Upload CV lên Drive và trích xuất text
  let cvDriveUrl = '';
  let cvContent  = '';
  try {
    const folder   = DriveApp.getFolderById(CV_FOLDER_ID);
    const filename = Utilities.formatDate(new Date(), 'GMT+7', 'yyyyMMdd_HHmmss')
                   + '_' + actualJobId
                   + '_' + (data.full_name || 'unknown').replace(/\s+/g, '_').substring(0, 30)
                   + '_' + (data.cv_filename || 'cv.pdf').replace(/^.*[/\\]/, '');
    const blob = Utilities.newBlob(
      Utilities.base64Decode(data.cv_file_base64),
      data.cv_mimetype || 'application/pdf',
      filename
    );
    const file  = folder.createFile(blob);
    cvDriveUrl  = file.getUrl();
    cvContent   = extractTextFromDriveFile(file);
    console.log('CV uploaded:', filename, '| text length:', cvContent.length);
  } catch (err) {
    console.error('CV upload error:', err.toString());
    return { success: false, message: 'Lỗi khi lưu file CV: ' + err.toString() };
  }

  if (!cvContent) {
    cvContent = '[Không đọc được text từ file CV – định dạng không hỗ trợ]';
  }
  const coverLetter = String(data.message || '').trim();

  // AI scoring
  let aiScore = null, aiSummary = '', aiStrengths = '', aiGaps = '', aiRecommendation = '';
  try {
    const jdRoles    = ['Role1','Role2','Role3','Role4','Role5'].map(function(k){ return job ? String(job[k]||'') : ''; }).filter(Boolean);
    const jdRequires = ['Require1','Require2','Require3','Require4','Require5'].map(function(k){ return job ? String(job[k]||'') : ''; }).filter(Boolean);
    const jobTitle   = data.job_title || '';

    if (jdRoles.length === 0 && jdRequires.length === 0) {
      aiSummary = 'Chưa có Role/Require trong sheet Jobs – không thể chấm điểm.';
    } else {
      const result = scoreCVWithAI(config, jdRoles, jdRequires, cvContent, jobTitle);
      aiScore          = result.score;
      aiSummary        = result.summary        || '';
      aiStrengths      = result.strengths      || '';
      aiGaps           = result.gaps           || '';
      aiRecommendation = result.recommendation || '';
    }
  } catch (err) {
    const msg = err.toString();
    console.error('AI score error:', msg);
    aiSummary = '[Lỗi chấm điểm] ' + msg;
  }

  // Lưu vào sheet Applications
  const appSheet = ss.getSheetByName('Applications');
  if (appSheet) {
    appSheet.appendRow([
      generateAppId(),                      // App_ID
      new Date(),                           // Timestamp
      actualJobId,                          // Job_ID (thực tế từ sheet, không phải slug)
      data.job_title   || '',               // Job_Title
      data.full_name   || '',               // Full_Name
      data.email       || '',               // Email
      data.phone       || '',               // Phone
      cvDriveUrl,                           // CV_Link (Drive URL file đã upload)
      coverLetter.substring(0, 2000),       // CV_Text (thư xin việc)
      aiScore !== null ? aiScore : '',      // AI_Score (0–100)
      aiSummary,                            // AI_Summary
      aiStrengths,                          // AI_Strengths
      aiGaps,                               // AI_Gaps
      aiRecommendation,                     // AI_Recommendation
      'New',                                // HR_Status
      ''                                    // HR_Note
    ]);
  }

  try { sendConfirmationEmail(config, data); } catch (err) { console.error('Confirm email:', err); }
  try { sendHRNotification(config, data, cvDriveUrl, aiScore, aiSummary, aiStrengths, aiGaps, aiRecommendation); } catch (err) { console.error('HR email:', err); }

  return {
    success: true,
    message: 'Hồ sơ đã được ghi nhận! Chúng tôi sẽ liên hệ với bạn trong thời gian sớm nhất.',
    ai_score: aiScore
  };
}

function generateAppId() {
  const d  = new Date();
  const ds = Utilities.formatDate(d, 'GMT+7', 'yyyyMMdd');
  const r  = String(Math.floor(Math.random() * 900) + 100);
  return 'APP-' + ds + '-' + r;
}

// ─────────────────────────────────────────────────────────────────────────────
// AI SCORING — chấm điểm có tỉ trọng Role/Require
// ─────────────────────────────────────────────────────────────────────────────

function scoreCVWithAI(config, jdRoles, jdRequires, cvContent, jobTitle) {
  // LLM_Provider  = Gemini | DeepSeek | Grok  (routing)
  // LLM_Model     = gemini-2.0-flash | deepseek-chat | grok-4-latest  (model name thực)
  const provider = String(config['LLM_Provider'] || config['LLM_Model'] || 'Gemini').trim().toLowerCase();
  const apiKey   = String(config['LLM_API_Key']  || '').trim();
  const modelName = String(config['LLM_Model']   || '').trim();

  if (!apiKey) return {
    score: null, summary: 'Chưa cấu hình LLM_API_Key trong sheet Config.',
    strengths: '', gaps: '', recommendation: ''
  };

  const prompt = buildScoringPrompt(jdRoles, jdRequires, cvContent, jobTitle);
  let rawResponse = '';

  if      (provider.includes('gemini'))   rawResponse = callGemini(apiKey, prompt, config, modelName);
  else if (provider.includes('deepseek')) rawResponse = callDeepSeek(apiKey, prompt, config, modelName);
  else if (provider.includes('grok'))     rawResponse = callGrok(apiKey, prompt, config, modelName);
  else throw new Error('LLM_Provider không hợp lệ: "' + provider + '". Nhập Gemini / DeepSeek / Grok');

  return parseScoreResponse(rawResponse, jdRoles.length, jdRequires.length);
}

function buildScoringPrompt(jdRoles, jdRequires, cvContent, jobTitle) {
  const totalWeight = SCORE_WEIGHTS.reduce(function(s, w) { return s + w; }, 0);

  const roleLines = jdRoles.map(function(r, i) {
    return (i+1) + '. [' + SCORE_WEIGHTS[i] + '%] ' + r;
  }).join('\n');

  const reqLines = jdRequires.map(function(r, i) {
    return (i+1) + '. [' + SCORE_WEIGHTS[i] + '%] ' + r;
  }).join('\n');

  // Giới hạn CV content
  const cv = cvContent.substring(0, 6000);

  return `Bạn là chuyên gia tuyển dụng ERP tại Omega (Việt Nam). Đánh giá CV ứng viên theo từng tiêu chí có tỉ trọng.

=== VỊ TRÍ TUYỂN DỤNG: ${jobTitle} ===

== VAI TRÒ CÔNG VIỆC (Role) – mỗi điểm từ 0–10 ==
${roleLines}

== YÊU CẦU KỸ NĂNG / KINH NGHIỆM (Require) – mỗi điểm từ 0–10 ==
${reqLines}

== NỘI DUNG CV ỨNG VIÊN ==
${cv}

HƯỚNG DẪN CHẤM:
- role_scores: đánh giá mức độ ứng viên có thể thực hiện vai trò đó dựa trên kinh nghiệm thực tế
- require_scores: đánh giá mức độ ứng viên đáp ứng kỹ năng/kinh nghiệm yêu cầu
- Điểm 10 = hoàn toàn đáp ứng, 5 = đáp ứng một phần, 0 = không đáp ứng

Trả về ĐÚNG định dạng JSON sau (không thêm text nào khác):
{
  "role_scores": [${jdRoles.map(function(){return '<0-10>';}).join(', ')}],
  "require_scores": [${jdRequires.map(function(){return '<0-10>';}).join(', ')}],
  "summary": "<1-2 câu tóm tắt mức độ phù hợp tổng thể>",
  "strengths": "<điểm mạnh nổi bật, ngăn cách bằng dấu |>",
  "gaps": "<điểm còn thiếu, ngăn cách bằng dấu |>",
  "recommendation": "<INTERVIEW hoặc CONSIDER hoặc REJECT>"
}`;
}

function parseScoreResponse(raw, roleCount, reqCount) {
  try {
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return { score: null, summary: raw.substring(0, 300), strengths: '', gaps: '', recommendation: '' };

    const obj = JSON.parse(match[0]);
    const totalW = SCORE_WEIGHTS.slice(0, Math.max(roleCount, reqCount))
                                .reduce(function(s, w) { return s + w; }, 0) || 1;

    // Weighted role score
    let roleNum = 0, roleW = 0;
    (obj.role_scores || []).forEach(function(s, i) {
      const w = SCORE_WEIGHTS[i] || 0;
      roleNum += parseFloat(s || 0) * w;
      roleW   += w;
    });

    // Weighted require score
    let reqNum = 0, reqW = 0;
    (obj.require_scores || []).forEach(function(s, i) {
      const w = SCORE_WEIGHTS[i] || 0;
      reqNum += parseFloat(s || 0) * w;
      reqW   += w;
    });

    const roleScore = roleW > 0 ? roleNum / roleW : 0;  // 0–10
    const reqScore  = reqW  > 0 ? reqNum  / reqW  : 0;  // 0–10

    // Tổng điểm 0–100 (Role 50% + Require 50%)
    const totalScore = Math.round((roleScore + reqScore) / 2 * 10 * 10) / 10;

    return {
      score:          totalScore,
      summary:        String(obj.summary        || '').trim(),
      strengths:      String(obj.strengths      || '').trim(),
      gaps:           String(obj.gaps           || '').trim(),
      recommendation: String(obj.recommendation || '').trim().toUpperCase()
    };
  } catch (err) {
    return { score: null, summary: '[Parse error] ' + raw.substring(0, 300), strengths: '', gaps: '', recommendation: '' };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// LLM CALLERS
// ─────────────────────────────────────────────────────────────────────────────

function callGemini(key, prompt, config, modelName) {
  const model     = modelName || 'gemini-2.0-flash';
  const maxTokens = parseInt(config['LLM_Max_Token'] || 1000);
  const url = 'https://generativelanguage.googleapis.com/v1beta/models/' + model + ':generateContent?key=' + key;
  const resp = UrlFetchApp.fetch(url, {
    method: 'post', contentType: 'application/json',
    payload: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.1, maxOutputTokens: maxTokens }
    }),
    muteHttpExceptions: true
  });
  const json = JSON.parse(resp.getContentText());
  if (json.candidates?.[0]?.content?.parts?.[0]?.text)
    return json.candidates[0].content.parts[0].text;
  throw new Error('Gemini error: ' + resp.getContentText().substring(0, 400));
}

function callDeepSeek(key, prompt, config, modelName) {
  const model     = modelName || 'deepseek-chat';
  const maxTokens = parseInt(config['LLM_Max_Token'] || 1000);
  const resp = UrlFetchApp.fetch('https://api.deepseek.com/chat/completions', {
    method: 'post',
    headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
    payload: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1, max_tokens: maxTokens
    }),
    muteHttpExceptions: true
  });
  const json = JSON.parse(resp.getContentText());
  if (json.choices?.[0]?.message?.content) return json.choices[0].message.content;
  throw new Error('DeepSeek error: ' + resp.getContentText().substring(0, 400));
}

function callGrok(key, prompt, config, modelName) {
  const model     = modelName || 'grok-4-latest';
  const maxTokens = parseInt(config['LLM_Max_Token'] || 1000);
  const resp = UrlFetchApp.fetch('https://api.x.ai/v1/chat/completions', {
    method: 'post',
    headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
    payload: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1, max_tokens: maxTokens
    }),
    muteHttpExceptions: true
  });
  const json = JSON.parse(resp.getContentText());
  if (json.choices?.[0]?.message?.content) return json.choices[0].message.content;
  throw new Error('Grok error: ' + resp.getContentText().substring(0, 400));
}

// ─────────────────────────────────────────────────────────────────────────────
// DRIVE CV EXTRACTOR — đọc text từ link Google Drive
// Yêu cầu: bật Drive API v2 trong Apps Script > Services
// ─────────────────────────────────────────────────────────────────────────────

function extractDriveFileId(url) {
  if (!url) return null;
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]{25,})/,
    /\/document\/d\/([a-zA-Z0-9_-]{25,})/,
    /[?&]id=([a-zA-Z0-9_-]{25,})/,
    /\/d\/([a-zA-Z0-9_-]{25,})/
  ];
  for (const re of patterns) {
    const m = url.match(re);
    if (m) return m[1];
  }
  return null;
}

function extractCVFromDriveLink(driveUrl) {
  try {
    const fileId = extractDriveFileId(driveUrl);
    if (!fileId) return '';
    const file = DriveApp.getFileById(fileId);
    return extractTextFromDriveFile(file);
  } catch (err) {
    console.error('extractCVFromDriveLink:', err.toString());
    return '';
  }
}

function extractTextFromDriveFile(file) {
  try {
    const mime = file.getMimeType();
    if (mime === MimeType.GOOGLE_DOCS) {
      return DocumentApp.openById(file.getId()).getBody().getText();
    }
    if (mime === 'text/plain') {
      return file.getBlob().getDataAsString('UTF-8');
    }
    if (mime === MimeType.PDF ||
        mime === MimeType.MICROSOFT_WORD ||
        mime === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const tmp = Drive.Files.insert(
        { title: file.getName() + '_cv_tmp', mimeType: MimeType.GOOGLE_DOCS },
        file.getBlob()
      );
      const text = DocumentApp.openById(tmp.id).getBody().getText();
      DriveApp.getFileById(tmp.id).setTrashed(true);
      return text;
    }
    return '';
  } catch (err) {
    console.error('extractTextFromDriveFile:', err.toString());
    return '';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EMAIL
// ─────────────────────────────────────────────────────────────────────────────

const EMAIL_BANNER_URL = 'https://omega.com.vn/assets/banners/omega-banner01.webp';

function emailWrapper(innerHtml, replyTo) {
  const contactEmail = replyTo || 'info@omega.com.vn';
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
  body{margin:0;padding:0;background:#f4f6f9;font-family:Arial,sans-serif;}
  .wrap{max-width:640px;margin:24px auto;background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);}
  .banner img{width:100%;display:block;}
  .content{padding:28px 32px;}
  .content p{margin:0 0 14px;color:#333;line-height:1.6;font-size:14px;}
  .footer{background:#f4f6f9;padding:16px 32px;font-size:12px;color:#888;text-align:center;border-top:1px solid #e0e0e0;}
  .footer a{color:#1a6fc4;text-decoration:none;}
  table.info{border-collapse:collapse;width:100%;margin:16px 0;}
  table.info td{padding:7px 10px;font-size:13px;border:1px solid #e5e7eb;vertical-align:top;}
  table.info td:first-child{background:#f8f9fa;font-weight:bold;width:140px;color:#555;}
  .score-box{background:#f0f7ff;border:1px solid #b3d4f5;border-radius:6px;padding:14px 16px;margin:16px 0;}
  .score-box .score-val{font-size:28px;font-weight:bold;color:#1a6fc4;}
  .tag{display:inline-block;padding:3px 10px;border-radius:12px;font-size:12px;font-weight:bold;}
  .tag.interview{background:#d1fae5;color:#065f46;}
  .tag.consider{background:#fef3c7;color:#92400e;}
  .tag.reject{background:#fee2e2;color:#991b1b;}
  h2{color:#1a6fc4;margin:0 0 18px;font-size:18px;}
</style></head><body>
<div class="wrap">
  <div class="banner"><a href="https://omega.com.vn" target="_blank"><img src="${EMAIL_BANNER_URL}" alt="Omega ERP"></a></div>
  <div class="content">${innerHtml}</div>
  <div class="footer">
    <strong>Omega Solution &amp; Technology Co., Ltd.</strong><br>
    📞 028 3512 8448 &nbsp;|&nbsp; ✉ <a href="mailto:${contactEmail}">${contactEmail}</a> &nbsp;|&nbsp;
    <a href="https://omega.com.vn">omega.com.vn</a>
  </div>
</div>
</body></html>`;
}

function sendConfirmationEmail(config, data) {
  const companyName = String(config['Company_Name_EN'] || 'Omega Solution & Technology Co., Ltd.');
  const replyTo     = String(config['Email_Reply_To']  || 'info@omega.com.vn');
  const senderName  = String(config['Company_Name_VI'] || 'Omega Nhân Sự');

  const htmlBody = emailWrapper(`
<h2>Xác nhận nhận hồ sơ ứng tuyển</h2>
<p>Kính chào <strong>${data.full_name}</strong>,</p>
<p>Cảm ơn bạn đã nộp hồ sơ ứng tuyển vị trí <strong>${data.job_title}</strong> tại ${companyName}.</p>
<p>Chúng tôi đã nhận được hồ sơ và sẽ xem xét trong <strong>3–5 ngày làm việc</strong>. Nếu hồ sơ phù hợp, bộ phận Nhân sự sẽ liên hệ sắp xếp phỏng vấn.</p>
<p>Tìm hiểu thêm về Omega tại: <a href="https://omega.com.vn">omega.com.vn</a></p>
<p style="margin-top:20px;">Trân trọng,<br><strong>Bộ phận Nhân sự – ${companyName}</strong></p>`, replyTo);

  MailApp.sendEmail({
    to:       data.email,
    name:     senderName,
    replyTo:  replyTo,
    subject:  '[Omega] Xác nhận nhận hồ sơ – ' + data.job_title,
    body:     'Kính chào ' + data.full_name + ',\n\nCảm ơn bạn đã nộp hồ sơ ứng tuyển vị trí ' + data.job_title + ' tại ' + companyName + '.\n\nChúng tôi đã nhận được hồ sơ và sẽ xem xét trong 3–5 ngày làm việc.\n\nTrân trọng,\n' + companyName,
    htmlBody: htmlBody
  });
}

function sendHRNotification(config, data, cvDriveUrl, aiScore, aiSummary, aiStrengths, aiGaps, aiRecommendation) {
  const hrEmails   = String(config['HR_Emails']      || '').trim();
  if (!hrEmails) return;
  const replyTo    = String(config['Email_Reply_To'] || 'info@omega.com.vn');
  const senderName = String(config['Company_Name_VI'] || 'Omega Nhân Sự');

  const scoreLabel  = aiScore !== null ? String(aiScore) + '/100' : 'N/A';
  const recMap      = { INTERVIEW: 'interview', CONSIDER: 'consider', REJECT: 'reject' };
  const recText     = { INTERVIEW: '✅ Nên phỏng vấn', CONSIDER: '🟡 Cần xem xét thêm', REJECT: '❌ Không phù hợp' };
  const recClass    = recMap[aiRecommendation]  || '';
  const recDisplay  = recText[aiRecommendation] || aiRecommendation || 'N/A';

  const scoreHtml = aiScore !== null
    ? '<div class="score-box"><div>Điểm AI tổng hợp: <span class="score-val">' + aiScore + '</span><span style="font-size:16px;color:#555">/100</span>&nbsp;<span class="tag ' + recClass + '">' + recDisplay + '</span></div><div style="margin-top:8px;font-size:13px;color:#444;">📝 ' + (aiSummary || 'N/A') + '</div></div>'
    : '<p style="color:#888;">⚠️ Không chấm điểm được: ' + (aiSummary || 'N/A') + '</p>';

  const htmlBody = emailWrapper(
    '<h2>Có hồ sơ ứng tuyển mới</h2>' +
    '<table class="info">' +
    '<tr><td>Vị trí</td><td><strong>' + data.job_title + '</strong> (' + data.job_id + ')</td></tr>' +
    '<tr><td>Ứng viên</td><td>' + data.full_name + '</td></tr>' +
    '<tr><td>Email</td><td><a href="mailto:' + data.email + '">' + data.email + '</a></td></tr>' +
    '<tr><td>SĐT</td><td>' + data.phone + '</td></tr>' +
    '<tr><td>File CV</td><td>' + (cvDriveUrl ? '<a href="' + cvDriveUrl + '" target="_blank">Xem file CV trên Drive</a>' : '(không có)') + '</td></tr>' +
    '</table>' + scoreHtml +
    (aiStrengths ? '<p><strong>✅ Điểm mạnh:</strong> ' + aiStrengths.replace(/\|/g, '<br>• ') + '</p>' : '') +
    (aiGaps      ? '<p><strong>⚠️ Còn thiếu:</strong> '  + aiGaps.replace(/\|/g, '<br>• ') + '</p>' : '') +
    '<p style="margin-top:20px;"><a href="https://docs.google.com/spreadsheets/d/' + SHEET_ID + '" style="background:#1a6fc4;color:#fff;padding:10px 20px;border-radius:5px;text-decoration:none;font-size:13px;">📊 Xem danh sách hồ sơ</a></p>',
    replyTo
  );

  const plainBody = 'CÓ HỒ SƠ ỨNG TUYỂN MỚI\n\nVị trí : ' + data.job_title + ' (' + data.job_id + ')\nỨng viên: ' + data.full_name + '\nEmail  : ' + data.email + '\nSĐT    : ' + data.phone + '\nFile CV : ' + (cvDriveUrl || '(không có)') + '\n\nAI SCORE : ' + scoreLabel + '\nKẾT QUẢ  : ' + recDisplay + '\nTÓM TẮT  : ' + (aiSummary || 'N/A') + '\nĐIỂM MẠNH: ' + (aiStrengths || 'N/A') + '\nCÒN THIẾU: ' + (aiGaps || 'N/A') + '\n\nXem chi tiết: https://docs.google.com/spreadsheets/d/' + SHEET_ID;

  hrEmails.split(/[,;]+/).map(function(e) { return e.trim(); }).filter(Boolean).forEach(function(hrEmail) {
    MailApp.sendEmail({
      to:       hrEmail,
      name:     senderName,
      replyTo:  data.email,       // HR reply thẳng về ứng viên
      subject:  '[Omega TD] Hồ sơ mới – ' + data.job_title + ' – ' + data.full_name,
      body:     plainBody,
      htmlBody: htmlBody
    });
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
    return ('0'+d.getDate()).slice(-2) + '/' + ('0'+(d.getMonth()+1)).slice(-2) + '/' + d.getFullYear();
  } catch (e) { return String(val); }
}

// ─────────────────────────────────────────────────────────────────────────────
// HÀM TEST — chạy thủ công từ Apps Script editor
// ─────────────────────────────────────────────────────────────────────────────

// Chạy hàm này 1 lần để cấp quyền Drive cho script (trigger OAuth consent)
function authorizeDrive() {
  try {
    DriveApp.getRootFolder();
    console.log('Drive authorized ✅');
  } catch (e) {
    console.error('Drive auth failed:', e.toString());
  }
}

function testConfig() {
  const config = getConfig();
  console.log('LLM_Provider :', config['LLM_Provider'] || '(chưa set)');
  console.log('LLM_Model    :', config['LLM_Model']    || '(chưa set)');
  const key = String(config['LLM_API_Key'] || '(chưa set)');
  console.log('LLM_API_Key  :', key.length > 6 ? key.substring(0,6)+'...('+key.length+' chars)' : key);
  console.log('HR_Emails    :', config['HR_Emails']    || '(chưa set)');
  console.log('Hide_Inactive:', config['Hide_Inactive']);

  // Kiểm tra Drive folder CV
  try {
    const folder = DriveApp.getFolderById(CV_FOLDER_ID);
    console.log('CV Folder    :', folder.getName(), '| ID:', CV_FOLDER_ID, '✅');
  } catch (e) {
    console.error('CV Folder ERR:', e.toString());
  }
}

function testGetJobs() {
  const r = getJobs();
  console.log('Total:', r.total, '| hide_inactive:', r.hide_inactive);
  console.log('Job[0]:', JSON.stringify(r.jobs[0]));
}

function testGetJob() {
  const r = getJob('J001');
  console.log(JSON.stringify(r, null, 2));
}

function testScoreCV() {
  const config = getConfig();
  const roles    = ['Xây dựng API backend .NET / Node.js', 'Tối ưu DB SQL Server', 'Review code + unit test'];
  const requires = ['3+ năm .NET hoặc Node.js', 'Kinh nghiệm SQL Server', 'Tiếng Anh đọc hiểu tài liệu kỹ thuật'];
  const cv       = 'Nguyễn Văn Test. 4 năm kinh nghiệm .NET 6, C#, SQL Server, REST API. Đã tham gia 2 dự án ERP.';
  try {
    const result = scoreCVWithAI(config, roles, requires, cv, 'Lập trình viên Backend');
    console.log('Score         :', result.score);
    console.log('Summary       :', result.summary);
    console.log('Recommendation:', result.recommendation);
  } catch (err) {
    console.error('FAILED:', err.toString());
  }
}

function testApply() {
  // Tạo base64 của một file text giả để test (nội dung = CV mẫu)
  const sampleCVText = 'Nguyễn Văn Test. 4 năm kinh nghiệm .NET 6, C#, SQL Server, REST API. Đã triển khai ERP cho 3 doanh nghiệp sản xuất. Tiếng Anh đọc hiểu kỹ thuật tốt.';
  const sampleBase64 = Utilities.base64Encode(sampleCVText);

  const result = handleApply({
    job_id:         'J001',
    job_title:      'Lập trình viên Backend (.NET / Node.js)',
    full_name:      'Nguyễn Văn Test',
    email:          'test@example.com',
    phone:          '0901234567',
    message:        'Tôi rất quan tâm đến vị trí này và tự tin có thể đáp ứng yêu cầu công việc.',
    cv_file_base64: sampleBase64,
    cv_filename:    'CV_Nguyen_Van_Test.txt',
    cv_mimetype:    'text/plain',
  });
  console.log('Result:', JSON.stringify(result));
}
