/**
 * OMEGA Team Data – Google Apps Script
 * ─────────────────────────────────────────────────────────────
 * Hướng dẫn triển khai:
 *   1. Tạo Google Sheet mới, giữ nguyên cấu trúc cột như team.xlsx:
 *      ID | Đội | Portrait | Họ và Tên | Vai trò | Số điện thoại |
 *      Email | Zalo | Facebook | Omega profile | Giờ làm việc | Trạng thái
 *   2. Mở Apps Script Editor (Extensions → Apps Script)
 *   3. Dán file này vào, thay SPREADSHEET_ID bên dưới
 *   4. Deploy → New deployment → Web app
 *        Execute as: Me  |  Who has access: Anyone
 *   5. Copy Web App URL → dán vào biến GAS_URL trong dich-vu.html
 *
 * Giá trị cột "Trạng thái": Đang sẵn sàng | Đang bận | Đang nghỉ
 * Giá trị cột "Đội"       : ĐỘI NGŨ TƯ VẤN - TRIỂN KHAI | ĐỘI NGŨ HỖ TRỢ
 * Cột "Zalo": có thể là URL đầy đủ hoặc SĐT – script tự xử lý
 * ─────────────────────────────────────────────────────────────
 */

var SPREADSHEET_ID = 'YOUR_GOOGLE_SHEET_ID_HERE'; // ← thay bằng ID Google Sheet
var SHEET_NAME     = 'Team';

// Map tên cột tiếng Việt → key JSON tiếng Anh
var COL_MAP = {
  'ID'             : 'id',
  'Đội'            : '_doi',       // xử lý riêng bên dưới
  'Portrait'       : 'photo',
  'Họ và Tên'      : 'name',
  'Vai trò'        : 'role',
  'Số điện thoại'  : 'phone',
  'Email'          : 'email',
  'Zalo'           : '_zalo',      // xử lý riêng bên dưới
  'Facebook'       : 'facebook',
  'Omega profile'  : 'omegaProfile',
  'Trạng thái'     : '_status'     // xử lý riêng bên dưới
  // 'Giờ làm việc' bỏ qua
};

// Map giá trị "Trạng thái" → key ngắn cho JSON
var STATUS_MAP = {
  'Đang sẵn sàng' : 'ready',
  'Đang bận'      : 'busy',
  'Đang nghỉ'     : 'off'
};

// Map "Đội" → team key
var TEAM_MAP = {
  'ĐỘI NGŨ TƯ VẤN - TRIỂN KHAI' : 'tuvan',
  'ĐỘI NGŨ HỖ TRỢ'              : 'hotro'
};

// ─── Entry point ──────────────────────────────────────────────
function doGet(e) {
  try {
    var output = ContentService
      .createTextOutput(JSON.stringify(getTeamData()))
      .setMimeType(ContentService.MimeType.JSON);
    return output;
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.message, members: [] }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ─── Core logic ───────────────────────────────────────────────
function getTeamData() {
  var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) return { error: 'Sheet "' + SHEET_NAME + '" không tồn tại.', members: [] };

  var rows = sheet.getDataRange().getValues();
  if (rows.length < 2) return { updated: new Date().toISOString(), members: [] };

  var headers = rows[0].map(function (h) { return String(h).trim(); });

  var members = rows.slice(1)
    .filter(function (row) { return String(row[0]).trim() !== ''; })
    .map(function (row) {
      var raw = {};
      headers.forEach(function (h, i) {
        raw[h] = (row[i] !== null && row[i] !== undefined) ? String(row[i]).trim() : '';
      });

      // Chuẩn hoá photo path
      var photo = raw['Portrait'] || '';
      if (photo && !photo.startsWith('http') && !photo.startsWith('assets/')) {
        photo = 'assets/team/' + photo;
      }
      // Sửa path cũ "authors/" từ lazinet project
      photo = photo.replace(/^authors\//, 'assets/team/');

      // Chuẩn hoá Zalo: lấy số điện thoại từ URL hoặc formula
      var zaloRaw = raw['Zalo'] || raw['Số điện thoại'] || '';
      // Nếu là URL đầy đủ, lấy phần số cuối
      var zaloNum = zaloRaw.replace(/.*zalo\.me\//i, '')
                            .replace(/[^0-9]/g, '');
      if (!zaloNum) {
        zaloNum = (raw['Số điện thoại'] || '').replace(/[^0-9]/g, '');
      }

      return {
        id           : raw['ID'],
        team         : TEAM_MAP[raw['Đội']] || raw['Đội'],
        name         : raw['Họ và Tên'],
        role         : raw['Vai trò'],
        photo        : photo,
        phone        : (raw['Số điện thoại'] || '').replace(/\s/g, ''),
        email        : raw['Email'],
        zalo         : zaloNum,
        facebook     : raw['Facebook'],
        omegaProfile : raw['Omega profile'] || 'https://omega.com.vn',
        status       : STATUS_MAP[raw['Trạng thái']] || 'ready'
      };
    });

  return { updated: new Date().toISOString(), members: members };
}

// ─── Test (chạy trong Editor để kiểm tra) ────────────────────
function testGetTeamData() {
  var result = getTeamData();
  Logger.log(JSON.stringify(result, null, 2));
}
