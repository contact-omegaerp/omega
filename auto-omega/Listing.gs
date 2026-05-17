// =====================================================
// Listing.gs — Liệt kê bài viết và ảnh từ Google Drive
// Dùng nội bộ trên Sheet, KHÔNG cần deploy Web App
// =====================================================
// Cách dùng:
//   Mở Google Sheet → Menu "📋 OMEGA CMS" → "🔄 Cập nhật danh sách"
//   Kết quả ghi vào sheet "Listing"
//   Nhân viên copy Doc ID / URL ảnh → dán vào sheet Articles
// =====================================================

const LST_ARTICLES_FOLDER = '1R577E-v3jRYC_ynEqKBElY65T83kZRFR'; // Thư mục Google Docs bài viết
const LST_IMAGES_FOLDER   = '1wga5z84TyyIONwtd9FaCH0RNKQSxbzfe'; // Thư mục ảnh upload
const LST_SHEET_NAME      = 'Listing';

const IMG_MIMES = new Set([
  'image/jpeg', 'image/png', 'image/webp',
  'image/gif',  'image/svg+xml', 'image/avif',
]);

// ── Menu ─────────────────────────────────────────────────
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('📋 OMEGA CMS')
    .addItem('🔄 Cập nhật danh sách ảnh & bài viết', 'updateListing')
    .addToUi();
}

// ── Main ─────────────────────────────────────────────────
function updateListing() {
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  let   sheet = ss.getSheetByName(LST_SHEET_NAME);
  if (!sheet) sheet = ss.insertSheet(LST_SHEET_NAME);
  sheet.clearContents();
  sheet.clearFormats();

  const writer = new SheetWriter(sheet);

  // ═══════════════════════════════════════════════════════
  // PHẦN 1 — BÀI VIẾT (Google Docs)
  // ═══════════════════════════════════════════════════════
  writer.sectionHeader('📄  BÀI VIẾT — Google Docs', '#1565C0', '#DBEAFE');
  writer.colHeader([
    'STT', 'Tên file', 'Doc ID\n→ dán vào cột doc_id',
    'Link Google Docs', 'Ngày sửa cuối', 'Người tạo',
  ]);

  const docs = listFolder(LST_ARTICLES_FOLDER, 'application/vnd.google-apps.document');
  if (docs.length === 0) {
    writer.row(['', '(Chưa có file nào trong thư mục)', '', '', '', '']);
  } else {
    docs.forEach((f, i) => {
      writer.row([
        i + 1,
        f.name,
        f.id,
        `https://docs.google.com/document/d/${f.id}/edit`,
        f.modified,
        f.owner,
      ]);
    });
  }

  writer.blank();
  writer.infoRow(`📌 Thư mục: https://drive.google.com/drive/folders/${LST_ARTICLES_FOLDER}`);
  writer.blank();
  writer.blank();

  // ═══════════════════════════════════════════════════════
  // PHẦN 2 — ẢNH (Google Drive)
  // ═══════════════════════════════════════════════════════
  writer.sectionHeader('🖼️  ẢNH — Google Drive', '#166534', '#DCFCE7');
  writer.colHeader([
    'STT', 'Tên file', 'File ID',
    'URL dán vào cover_image / gallery_images',
    'Ngày sửa cuối', 'Kích thước', 'URL preview (w300)',
  ]);

  const imgs = listFolder(LST_IMAGES_FOLDER);
  const imgFiltered = imgs.filter(f => IMG_MIMES.has(f.mime));
  if (imgFiltered.length === 0) {
    writer.row(['', '(Chưa có ảnh nào trong thư mục)', '', '', '', '', '']);
  } else {
    imgFiltered.forEach((f, i) => {
      writer.row([
        i + 1,
        f.name,
        f.id,
        `https://drive.google.com/thumbnail?id=${f.id}&sz=w1200`,
        f.modified,
        f.sizeStr,
        `https://drive.google.com/thumbnail?id=${f.id}&sz=w300`,
      ]);
    });
  }

  writer.blank();
  writer.infoRow(`📌 Thư mục: https://drive.google.com/drive/folders/${LST_IMAGES_FOLDER}`);

  // ── Ghi hàng loạt vào sheet ──────────────────────────
  writer.flush();

  // ── Định dạng ────────────────────────────────────────
  applyFormats(sheet, writer.formatMap, writer.totalRows);

  // ── Độ rộng cột ──────────────────────────────────────
  sheet.setColumnWidth(1, 48);
  sheet.setColumnWidth(2, 210);
  sheet.setColumnWidth(3, 230);
  sheet.setColumnWidth(4, 360);
  sheet.setColumnWidth(5, 120);
  sheet.setColumnWidth(6, 90);
  sheet.setColumnWidth(7, 260);

  sheet.activate();
  SpreadsheetApp.getActiveSpreadsheet().setActiveSheet(sheet);

  SpreadsheetApp.getUi().alert(
    `✅ Hoàn tất!\n\n📄 ${docs.length} bài viết (Google Docs)\n🖼️ ${imgFiltered.length} ảnh`
  );
}

// ── List file trong folder ────────────────────────────────
function listFolder(folderId, mimeFilter) {
  const folder = DriveApp.getFolderById(folderId);
  const iter   = folder.getFiles();
  const result = [];
  while (iter.hasNext()) {
    const f    = iter.next();
    const mime = f.getMimeType();
    if (mimeFilter && mime !== mimeFilter) continue;
    const size = f.getSize();
    result.push({
      name    : f.getName(),
      id      : f.getId(),
      mime,
      modified: Utilities.formatDate(f.getLastUpdated(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm'),
      owner   : f.getOwner() ? f.getOwner().getEmail() : '',
      sizeStr : size > 1024 * 1024
                  ? (size / 1024 / 1024).toFixed(1) + ' MB'
                  : Math.round(size / 1024) + ' KB',
    });
  }
  // Mới nhất trước
  result.sort((a, b) => b.modified.localeCompare(a.modified));
  return result;
}

// ── SheetWriter — buffer rows, track format map ───────────
class SheetWriter {
  constructor(sheet) {
    this.sheet     = sheet;
    this.buffer    = [];   // [{values, type}]
    this.formatMap = [];   // [{row, type}]
    this.rowIdx    = 0;
  }

  get totalRows() { return this.rowIdx; }

  _push(values, type = 'data') {
    this.rowIdx++;
    this.buffer.push(values);
    if (type !== 'data') this.formatMap.push({ row: this.rowIdx, type });
  }

  sectionHeader(label, textColor, bgColor) {
    this._push([label], 'section');
    // store colors for applyFormats
    this.formatMap[this.formatMap.length - 1].textColor = textColor;
    this.formatMap[this.formatMap.length - 1].bgColor   = bgColor;
  }

  colHeader(cols) { this._push(cols, 'colHeader'); }
  blank()         { this._push([''], 'blank'); }
  row(vals)       { this._push(vals, 'data'); }
  infoRow(text)   { this._push([text], 'info'); }

  flush() {
    if (!this.buffer.length) return;
    const maxCols = this.buffer.reduce((m, r) => Math.max(m, r.length), 0);
    const padded  = this.buffer.map(r => {
      const copy = [...r];
      while (copy.length < maxCols) copy.push('');
      return copy;
    });
    this.sheet.getRange(1, 1, padded.length, maxCols).setValues(padded);
  }
}

// ── Áp dụng định dạng theo formatMap ─────────────────────
function applyFormats(sheet, formatMap, totalRows) {
  const lastCol = sheet.getLastColumn() || 7;

  formatMap.forEach(item => {
    const r     = item.row;
    const range = sheet.getRange(r, 1, 1, lastCol);

    if (item.type === 'section') {
      range
        .setBackground(item.bgColor)
        .setFontColor(item.textColor)
        .setFontWeight('bold')
        .setFontSize(12)
        .setVerticalAlignment('middle');
      sheet.setRowHeight(r, 30);
      // Merge cells cho section header label
      try { sheet.getRange(r, 1, 1, lastCol).mergeAcross(); } catch(e) {}

    } else if (item.type === 'colHeader') {
      range
        .setBackground('#F1F5F9')
        .setFontWeight('bold')
        .setFontSize(10)
        .setFontColor('#1E293B')
        .setHorizontalAlignment('center')
        .setWrap(true);
      sheet.setRowHeight(r, 36);

    } else if (item.type === 'info') {
      sheet.getRange(r, 1, 1, lastCol)
        .setFontColor('#64748B')
        .setFontStyle('italic')
        .setFontSize(10);

    } else if (item.type === 'blank') {
      sheet.setRowHeight(r, 10);
    }
  });

  // Zebra stripe cho data rows
  let dataRowCount = 0;
  for (let r = 1; r <= totalRows; r++) {
    const fmt = formatMap.find(f => f.row === r);
    if (!fmt || fmt.type === 'data') {
      dataRowCount++;
      if (dataRowCount % 2 === 0) {
        sheet.getRange(r, 1, 1, lastCol).setBackground('#F8FAFC');
      }
    }
  }

  // Freeze hàng đầu (sheet title không đổi)
  sheet.setFrozenRows(0);
}
