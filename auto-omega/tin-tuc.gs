// =====================================================
// TIN-TUC.GS — Google Apps Script CMS Backend
// Quản lý bài viết tin tức cho omega.com.vn
// =====================================================
// Cách deploy:
//   Extensions > Apps Script > Deploy > New deployment > Web app
//   - Execute as: Me
//   - Who has access: Anyone
// Sau khi deploy, dán URL vào OMEGA_NEWS_GAS_URL trong:
//   - tin-tuc/bai-viet.html
//   - tin-tuc.html (biến OMEGA_NEWS_GAS_URL)
// =====================================================
// Cấu trúc Google Sheet cần tạo:
//   Sheet "Articles" — các cột (header row 1):
//     id | slug | title | category | published_date | author |
//     read_time | excerpt | tags | seo_title | seo_desc |
//     is_featured | cover_image | gallery_images | doc_id | body_html | status
//
//   Giá trị hợp lệ:
//     category  : chuyen-doi-so | erp-quan-tri | ke-toan-tai-chinh | su-kien | tuyen-dung
//     status    : published | draft
//     is_featured: TRUE | FALSE
//     published_date: DD/MM/YYYY
//     doc_id    : ID của Google Doc chứa nội dung bài (lấy từ URL doc)
//     body_html : HTML content thay thế nếu không có doc_id
//     cover_image: đường dẫn gốc, ví dụ tin-tuc/slug/00-thumbnail.webp
// =====================================================

const NEWS_SHEET_ID    = '';  // << Điền Sheet ID Google Sheet bài viết
const IMAGE_FOLDER_ID  = '';  // << Điền Drive Folder ID chứa ảnh bài viết (tạo folder, lấy ID từ URL)

// Cache trong session Apps Script (reset mỗi lần deploy hoặc timeout)
let _cache = null;
let _cacheTs = 0;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 phút

// ── doPost: upload ảnh / lưu bài / xác thực mật khẩu ────
function doPost(e) {
  let data;
  try { data = JSON.parse(e.postData.contents); }
  catch(err) { return txtResp({ success: false, error: 'invalid_json' }); }

  const action = data.action || '';
  let result;
  try {
    if      (action === 'verify_password') result = handleVerifyPassword(data);
    else if (action === 'upload_image')    result = handleUploadImage(data);
    else if (action === 'save_article')    result = handleSaveArticle(data);
    else if (action === 'delete_article')  result = handleDeleteArticle(data);
    else result = { success: false, error: 'unknown_action' };
  } catch(err) {
    result = { success: false, error: err.message };
  }
  return txtResp(result);
}

function txtResp(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.TEXT);
}

// ── Xác thực mật khẩu admin ──────────────────────────────
function handleVerifyPassword(data) {
  const cfg = getConfig();
  const adminPwd = String(cfg['Admin_Password'] || cfg['Master_Password'] || '').trim();
  if (!adminPwd) return { success: false, error: 'Admin_Password chưa cấu hình trong Config sheet' };
  const ok = adminPwd === String(data.password || '').trim();
  return { success: ok, error: ok ? undefined : 'Sai mật khẩu' };
}

function checkPassword(data) {
  const r = handleVerifyPassword(data);
  if (!r.success) throw new Error(r.error || 'Sai mật khẩu');
}

// ── Upload ảnh lên Google Drive ───────────────────────────
function handleUploadImage(data) {
  checkPassword(data);
  if (!data.file_base64 || !data.filename) throw new Error('Thiếu file_base64 hoặc filename');

  const ext  = String(data.filename).split('.').pop().toLowerCase();
  const mime = { png:'image/png', gif:'image/gif', webp:'image/webp', jpg:'image/jpeg', jpeg:'image/jpeg' }[ext] || 'image/jpeg';

  const folder = DriveApp.getFolderById(IMAGE_FOLDER_ID);
  const blob   = Utilities.newBlob(Utilities.base64Decode(data.file_base64), mime, data.filename);
  const file   = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  const fileId = file.getId();
  return {
    success : true,
    url     : 'https://drive.google.com/thumbnail?id=' + fileId + '&sz=w1200',
    file_id : fileId,
  };
}

// ── Lưu bài viết vào Sheet Articles ──────────────────────
function handleSaveArticle(data) {
  checkPassword(data);

  const slug = String(data.slug || '').trim();
  if (!slug) throw new Error('Thiếu slug');

  const ss    = SpreadsheetApp.openById(NEWS_SHEET_ID);
  const sheet = ss.getSheetByName('Articles');
  if (!sheet) throw new Error('Sheet "Articles" không tìm thấy');

  const allValues = sheet.getDataRange().getValues();
  const headers   = allValues[0].map(h => String(h).trim().toLowerCase().replace(/\s+/g,'_'));
  const idxOf     = k => headers.indexOf(k);
  const slugIdx   = idxOf('slug');

  // Auto date nếu không truyền
  const now = new Date();
  const dateStr = data.published_date ||
    `${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()}`;

  // Auto ID nếu bài mới
  let newId = String(data.id || '').trim();
  if (!newId) {
    const ids = allValues.slice(1).map(r => parseInt(r[idxOf('id')]) || 0);
    newId = String(Math.max(0, ...ids) + 1);
  }

  const rowMap = {
    id:             newId,
    slug,
    title:          data.title          || '',
    category:       data.category       || '',
    published_date: dateStr,
    author:         data.author         || 'OMEGA R&D',
    read_time:      data.read_time      || '5 phút',
    excerpt:        data.excerpt        || '',
    tags:           data.tags           || '',
    seo_title:      data.seo_title      || data.title || '',
    seo_desc:       data.seo_desc       || data.excerpt || '',
    is_featured:    data.is_featured    ? 'TRUE' : 'FALSE',
    cover_image:    data.cover_image    || '',
    gallery_images: data.gallery_images || '',
    doc_id:         data.doc_id         || '',
    body_html:      data.body_html      || '',
    status:         data.status         || 'published',
  };
  const row = headers.map(h => rowMap[h] !== undefined ? rowMap[h] : '');

  // Tìm dòng có slug tương ứng để update, không có thì append
  const existingIdx = allValues.slice(1).findIndex(r => String(r[slugIdx]).trim() === slug);
  if (existingIdx >= 0) {
    sheet.getRange(existingIdx + 2, 1, 1, row.length).setValues([row]);
  } else {
    sheet.appendRow(row);
  }

  // Xóa cache để bài mới hiển thị ngay
  _cache = null; _cacheTs = 0;
  return { success: true, action: existingIdx >= 0 ? 'updated' : 'created', slug };
}

// ── Xóa bài (chuyển sang draft) ──────────────────────────
function handleDeleteArticle(data) {
  checkPassword(data);
  const slug = String(data.slug || '').trim();
  if (!slug) throw new Error('Thiếu slug');

  const ss    = SpreadsheetApp.openById(NEWS_SHEET_ID);
  const sheet = ss.getSheetByName('Articles');
  const vals  = sheet.getDataRange().getValues();
  const hdrs  = vals[0].map(h => String(h).trim().toLowerCase().replace(/\s+/g,'_'));
  const sIdx  = hdrs.indexOf('slug');
  const stIdx = hdrs.indexOf('status');

  const rowIdx = vals.slice(1).findIndex(r => String(r[sIdx]).trim() === slug);
  if (rowIdx < 0) return { success: false, error: 'not_found' };

  sheet.getRange(rowIdx + 2, stIdx + 1).setValue('draft');
  _cache = null; _cacheTs = 0;
  return { success: true };
}

// ── Đọc Config sheet ──────────────────────────────────────
let _cfgCache = null;
function getConfig() {
  if (_cfgCache) return _cfgCache;
  const ss    = SpreadsheetApp.openById(NEWS_SHEET_ID);
  const sheet = ss.getSheetByName('Config');
  if (!sheet) return {};
  const cfg = {};
  sheet.getDataRange().getValues().forEach(r => {
    if (r[0]) cfg[String(r[0]).trim()] = r[1]; // không skip hàng đầu
  });
  _cfgCache = cfg;
  return cfg;
}

// ── Entry point GET ───────────────────────────────────────
function doGet(e) {
  const p      = e.parameter || {};
  const action = p.action || 'list';
  const cb     = p.callback; // JSONP callback name

  let result;
  try {
    if      (action === 'post')    result = handlePost(p);
    else if (action === 'list')    result = handleList(p);
    else if (action === 'related') result = handleRelated(p);
    else                           result = { success: false, error: 'unknown_action' };
  } catch (err) {
    result = { success: false, error: err.message };
  }

  const json = JSON.stringify(result);
  if (cb) {
    return ContentService.createTextOutput(cb + '(' + json + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json)
    .setMimeType(ContentService.MimeType.TEXT);
}

// ── action=post : lấy 1 bài theo slug ────────────────────
function handlePost(p) {
  const slug = String(p.slug || '').trim();
  if (!slug) return { success: false, error: 'missing_slug' };

  const articles = loadArticles();
  const article  = articles.find(a => a.slug === slug);
  if (!article)  return { success: false, error: 'not_found' };

  // Lấy nội dung: Google Doc ưu tiên, fallback body_html trong Sheet
  let content = String(article.body_html || '');
  const docId = String(article.doc_id || '').trim();
  if (docId) {
    const docHtml = fetchDocHtml(docId);
    if (docHtml) content = docHtml;
  }

  // Trả về tất cả metadata + content (không trả body_html raw)
  const data = Object.assign({}, article, { content, body_html: undefined, doc_id: undefined });
  return { success: true, data };
}

// ── action=list : danh sách bài (phân trang, lọc category) ─
function handleList(p) {
  const cat    = String(p.cat    || '').trim();
  const limit  = Math.min(parseInt(p.limit)  || 100, 500);
  const offset = Math.max(parseInt(p.offset) || 0, 0);

  let articles = loadArticles();
  if (cat) articles = articles.filter(a => a.category === cat);
  articles = articles.slice().sort((a, b) => parseVnDate(b.published_date) - parseVnDate(a.published_date));

  const total = articles.length;
  const paged = articles.slice(offset, offset + limit).map(a => ({
    id:             a.id,
    slug:           a.slug,
    title:          a.title,
    category:       a.category,
    published_date: a.published_date,
    author:         a.author,
    read_time:      a.read_time,
    excerpt:        a.excerpt,
    tags:           a.tags,
    seo_title:      a.seo_title,
    seo_desc:       a.seo_desc,
    is_featured:    a.is_featured,
    cover_image:    a.cover_image,
    source:         'gas',   // đánh dấu để frontend phân biệt với static JSON
  }));

  return { success: true, total, data: paged };
}

// ── action=related : bài liên quan ──────────────────────
function handleRelated(p) {
  const slug  = String(p.slug || '').trim();
  const cat   = String(p.cat  || '').trim();
  const limit = Math.min(parseInt(p.limit) || 3, 10);

  let articles = loadArticles().filter(a => a.slug !== slug);
  if (cat) articles = articles.filter(a => a.category === cat);
  articles.sort((a, b) => parseVnDate(b.published_date) - parseVnDate(a.published_date));

  return {
    success: true,
    data: articles.slice(0, limit).map(a => ({
      slug: a.slug, title: a.title, category: a.category,
      published_date: a.published_date, read_time: a.read_time,
      excerpt: a.excerpt, cover_image: a.cover_image, source: 'gas',
    })),
  };
}

// ── Đọc Sheet Articles (có in-memory cache 5 phút) ───────
function loadArticles() {
  const now = Date.now();
  if (_cache && (now - _cacheTs) < CACHE_TTL_MS) return _cache;

  const ss    = SpreadsheetApp.openById(NEWS_SHEET_ID);
  const sheet = ss.getSheetByName('Articles');
  if (!sheet) throw new Error('Sheet "Articles" không tìm thấy');

  const rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return [];

  const headers = rows[0].map(h => String(h).trim().toLowerCase().replace(/\s+/g, '_'));
  const idxOf   = k => headers.indexOf(k);

  const articles = rows.slice(1)
    .filter(r => String(r[idxOf('status')] || '').toLowerCase() === 'published')
    .map(r => ({
      id:             String(r[idxOf('id')]             || ''),
      slug:           String(r[idxOf('slug')]           || '').trim(),
      title:          String(r[idxOf('title')]          || ''),
      category:       String(r[idxOf('category')]       || '').trim(),
      published_date: formatSheetDate(r[idxOf('published_date')]),
      author:         String(r[idxOf('author')]         || ''),
      read_time:      String(r[idxOf('read_time')]      || ''),
      excerpt:        String(r[idxOf('excerpt')]        || ''),
      tags:           String(r[idxOf('tags')]           || ''),
      seo_title:      String(r[idxOf('seo_title')]      || ''),
      seo_desc:       String(r[idxOf('seo_desc')]       || ''),
      is_featured:    String(r[idxOf('is_featured')]    || '').toLowerCase() === 'true',
      cover_image:    String(r[idxOf('cover_image')]    || ''),
      gallery_images: String(r[idxOf('gallery_images')] || ''),
      doc_id:         String(r[idxOf('doc_id')]         || '').trim(),
      body_html:      String(r[idxOf('body_html')]      || ''),
    }))
    .filter(a => a.slug); // bỏ dòng không có slug

  _cache   = articles;
  _cacheTs = now;
  return articles;
}

// ── Lấy nội dung từ Google Doc → HTML sạch ───────────────
// Yêu cầu: Doc phải được share "Anyone with link can view"
// hoặc cùng tài khoản với GAS project
function fetchDocHtml(docId) {
  try {
    const url = 'https://docs.google.com/feeds/download/documents/export/Export?id='
              + encodeURIComponent(docId) + '&exportFormat=html';
    const res = UrlFetchApp.fetch(url, {
      headers:            { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
      muteHttpExceptions: true,
    });
    if (res.getResponseCode() !== 200) {
      Logger.log('fetchDocHtml HTTP ' + res.getResponseCode() + ' for docId=' + docId);
      return null;
    }

    let html = res.getContentText('UTF-8');

    // Trích phần body
    const m = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (!m) return null;
    html = m[1];

    return cleanDocHtml(html);
  } catch (err) {
    Logger.log('fetchDocHtml error: ' + err.message);
    return null;
  }
}

// ── Làm sạch HTML từ Google Docs export ─────────────────
function cleanDocHtml(html) {
  // Xóa <style> block
  html = html.replace(/<style[\s\S]*?<\/style>/gi, '');
  // Xóa <script>
  html = html.replace(/<script[\s\S]*?<\/script>/gi, '');

  // Chỉ giữ href trong <a>, xóa các attr khác
  html = html.replace(/<a\b([^>]*)>/gi, function(_, attrs) {
    const hm = attrs.match(/href="([^"]*)"/);
    if (!hm) return '<a>';
    // Google Docs tạo link qua google.com/url?q=... — unwrap về URL thật
    let href = hm[1];
    const qm = href.match(/[?&]q=([^&]+)/);
    if (qm) { try { href = decodeURIComponent(qm[1]); } catch(e) {} }
    return '<a href="' + href + '" target="_blank" rel="noopener">';
  });

  // Xóa tất cả thuộc tính style, class, id, dir trên các thẻ còn lại
  html = html.replace(/<(p|h[1-6]|ul|ol|li|table|thead|tbody|tr|th|td|div|blockquote|figure|figcaption)\b([^>]*)>/gi,
    function(_, tag) { return '<' + tag.toLowerCase() + '>'; });

  // Xóa <span> wrapper (giữ nội dung bên trong)
  html = html.replace(/<span[^>]*>/gi, '').replace(/<\/span>/gi, '');

  // Google Docs đặt ảnh inline qua lh3.googleusercontent.com — không accessible, bỏ
  html = html.replace(/<img[^>]*>/gi, '');

  // Gộp <b><b> và các thẻ lồng nhau thừa
  html = html.replace(/<\/b>\s*<b>/gi, ' ');
  html = html.replace(/<\/strong>\s*<strong>/gi, ' ');

  // Bỏ đoạn trống
  html = html.replace(/<p>\s*(<br\s*\/?>\s*)*<\/p>/gi, '');
  html = html.replace(/<p>\s*<\/p>/gi, '');

  // Dọn khoảng trắng thừa
  html = html.replace(/\n{3,}/g, '\n\n').trim();

  return html;
}

// ── Format ngày từ Google Sheet (Date object hoặc string) → DD/MM/YYYY ──
function formatSheetDate(val) {
  if (!val) return '';
  if (val instanceof Date) {
    const d = String(val.getDate()).padStart(2, '0');
    const m = String(val.getMonth() + 1).padStart(2, '0');
    return d + '/' + m + '/' + val.getFullYear();
  }
  const s = String(val).trim();
  // Nếu đã đúng format DD/MM/YYYY thì giữ nguyên
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(s)) return s;
  // Thử parse Date string khác (ISO, GMT string...)
  const dt = new Date(s);
  if (!isNaN(dt.getTime())) {
    const d = String(dt.getDate()).padStart(2, '0');
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    return d + '/' + m + '/' + dt.getFullYear();
  }
  return s;
}

// ── Parse DD/MM/YYYY → timestamp ─────────────────────────
function parseVnDate(str) {
  if (!str) return 0;
  const parts = String(str).trim().split('/');
  if (parts.length === 3) {
    return new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0])).getTime();
  }
  return new Date(String(str)).getTime() || 0;
}
