#!/usr/bin/env node
/**
 * Tạo file news-template.docx — mẫu viết bài cho nhân viên OMEGA
 * Upload lên Google Drive → mở thành Google Doc → lấy Doc ID → dán vào Sheet
 */

const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, BorderStyle, ShadingType, TableRow, TableCell,
  Table, WidthType, NumberFormat, AbstractNumbering, Numbering,
  LevelFormat, convertInchesToTwip, UnderlineType
} = require('docx');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'tin-tuc', '_tools', 'news-template.docx');

// ── Màu sắc ──────────────────────────────────────────────
const GREEN  = '00A651';
const GRAY   = '6B7280';
const LGRAY  = 'F3F4F6';
const DARK   = '1F2937';
const ORANGE = 'D97706';

// ── Helper: đoạn văn thường ──────────────────────────────
function p(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, color: opts.color || DARK, size: opts.size || 24, bold: opts.bold || false, italics: opts.italic || false })],
    spacing: { after: opts.spaceAfter !== undefined ? opts.spaceAfter : 160 },
    alignment: opts.align || AlignmentType.LEFT,
  });
}

// ── Helper: đoạn có nhiều run ─────────────────────────────
function pRuns(runs, opts = {}) {
  return new Paragraph({
    children: runs,
    spacing: { after: opts.spaceAfter !== undefined ? opts.spaceAfter : 160 },
    alignment: opts.align || AlignmentType.LEFT,
  });
}

function run(text, opts = {}) {
  return new TextRun({ text, color: opts.color || DARK, size: opts.size || 24, bold: opts.bold, italics: opts.italic, underline: opts.underline ? { type: UnderlineType.SINGLE } : undefined });
}

// ── Helper: heading ───────────────────────────────────────
function h1(text) {
  return new Paragraph({
    text,
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
    children: [new TextRun({ text, bold: true, size: 52, color: DARK })],
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 360, after: 160 },
    children: [new TextRun({ text, bold: true, size: 32, color: GREEN })],
    border: { left: { style: BorderStyle.SINGLE, size: 12, color: GREEN, space: 8 } },
  });
}

function h3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, bold: true, size: 26, color: DARK })],
  });
}

// ── Helper: bullet ────────────────────────────────────────
function bullet(text) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { after: 80 },
    children: [new TextRun({ text, size: 24, color: DARK })],
  });
}

// ── Helper: hộp chú thích ─────────────────────────────────
function note(text, color = LGRAY, borderColor = GREEN) {
  return new Paragraph({
    children: [new TextRun({ text, size: 22, color: GRAY, italics: true })],
    spacing: { before: 80, after: 80 },
    shading: { type: ShadingType.CLEAR, fill: color },
    border: { left: { style: BorderStyle.SINGLE, size: 8, color: borderColor, space: 6 } },
    indent: { left: convertInchesToTwip(0.2) },
  });
}

// ── Tạo document ──────────────────────────────────────────
const doc = new Document({
  creator: 'OMEGA ERP',
  title: 'OMEGA News Template',
  description: 'Mẫu viết bài chuẩn cho website OMEGA',
  styles: {
    default: {
      document: { run: { font: 'Times New Roman', size: 24, color: DARK } },
    },
  },
  sections: [{
    properties: { page: { margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
    children: [

      // ── TIÊU ĐỀ TÀI LIỆU ────────────────────────────────
      new Paragraph({
        children: [new TextRun({ text: 'OMEGA NEWS — MẪU VIẾT BÀI', bold: true, size: 36, color: GREEN })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 80 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Dùng tài liệu này làm khung khi viết bài mới trên Google Docs.', size: 22, color: GRAY, italics: true })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      }),

      // ── PHẦN 1: METADATA ─────────────────────────────────
      h2('PHẦN 1 — THÔNG TIN BÀI VIẾT (điền vào Sheet, không phải vào đây)'),
      note('⚠️  Phần này KHÔNG viết trong Google Docs. Điền trực tiếp vào Google Sheet hoặc admin.html.', 'FFF9C4', ORANGE),
      p(''),

      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          new TableRow({ children: [
            new TableCell({ children: [p('Trường', { bold: true, color: GREEN, spaceAfter: 0 })], shading: { fill: 'E8F5E9' } }),
            new TableCell({ children: [p('Mô tả', { bold: true, color: GREEN, spaceAfter: 0 })], shading: { fill: 'E8F5E9' } }),
            new TableCell({ children: [p('Ví dụ', { bold: true, color: GREEN, spaceAfter: 0 })], shading: { fill: 'E8F5E9' } }),
          ]}),
          ...([
            ['slug', 'URL bài viết (chữ thường, dấu gạch ngang, không dấu)', 'erp-nganh-thuc-pham-2026'],
            ['title', 'Tiêu đề đầy đủ hiển thị trên web', 'ERP cho Ngành Thực phẩm – Giải pháp Toàn diện 2026'],
            ['category', 'Một trong 5 danh mục cố định (xem bên dưới)', 'erp-quan-tri'],
            ['published_date', 'Ngày đăng định dạng DD/MM/YYYY', '05/06/2026'],
            ['author', 'Tên tác giả hoặc nhóm', 'OMEGA R&D'],
            ['read_time', 'Ước tính thời gian đọc', '6 phút'],
            ['excerpt', 'Mô tả ngắn ~150 ký tự, hiện ở trang danh sách', 'ERP giúp doanh nghiệp thực phẩm kiểm soát...'],
            ['tags', 'Từ khóa, phân cách bằng dấu phẩy', 'ERP thực phẩm, quản lý sản xuất, FMCG'],
            ['is_featured', 'Bài nổi bật xuất hiện ở đầu trang (TRUE/FALSE)', 'FALSE'],
            ['cover_image', 'Tự điền sau khi upload ảnh trong admin.html', '(tự điền)'],
            ['doc_id', 'ID của Google Doc này — lấy từ URL', '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms'],
            ['status', 'published = đăng, draft = nháp', 'published'],
          ].map(([field, desc, ex]) => new TableRow({ children: [
            new TableCell({ children: [p(field, { bold: true, spaceAfter: 0 })] }),
            new TableCell({ children: [p(desc, { spaceAfter: 0 })] }),
            new TableCell({ children: [p(ex, { color: GRAY, size: 22, spaceAfter: 0 })] }),
          ]}))),
        ],
      }),

      p(''),
      h3('5 danh mục hợp lệ (dùng đúng chính xác):'),
      bullet('chuyen-doi-so  →  Chuyển đổi số'),
      bullet('erp-quan-tri  →  ERP – Quản trị'),
      bullet('ke-toan-tai-chinh  →  Kế toán – Tài chính'),
      bullet('su-kien  →  Sự kiện'),
      bullet('tuyen-dung  →  Tuyển dụng'),
      p(''),

      // ── PHẦN 2: NỘI DUNG ─────────────────────────────────
      h2('PHẦN 2 — NỘI DUNG BÀI VIẾT (viết từ đây trở xuống trong Google Doc)'),
      note('✅  Bắt đầu viết nội dung bài từ đây. Dùng Heading 2 (H2) cho tiêu đề chính, Heading 3 (H3) cho tiêu đề phụ.'),
      p(''),

      // ── Ví dụ bài mẫu ────────────────────────────────────
      new Paragraph({
        children: [new TextRun({ text: '━━━ BÀI MẪU BÊN DƯỚI — XOÁ KHI VIẾT BÀI THẬT ━━━', size: 20, color: GRAY, bold: true })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 200, after: 200 },
      }),

      h1('ERP cho Ngành Thực phẩm – Giải pháp Toàn diện 2026'),

      p('Ngành thực phẩm đang đối mặt với áp lực kép: tiêu chuẩn an toàn vệ sinh ngày càng khắt khe và chuỗi cung ứng phức tạp hơn bao giờ hết. Hệ thống ERP chuyên ngành là chìa khóa để doanh nghiệp kiểm soát toàn bộ quy trình từ nguyên liệu đến thành phẩm.'),

      p('[ẢNH: Chèn ảnh minh họa tại đây — ảnh được upload qua admin.html và dán URL vào bài]', { color: ORANGE, italic: true }),
      p(''),

      h2('1. Thách thức đặc thù của ngành thực phẩm'),
      p('Doanh nghiệp thực phẩm phải quản lý đồng thời hàng chục yếu tố: hạn sử dụng nguyên liệu, nhiệt độ bảo quản, truy xuất nguồn gốc theo từng lô sản xuất và các tiêu chuẩn như ISO 22000, HACCP.'),

      h3('1.1. Quản lý hạn dùng và lô sản xuất'),
      p('Mỗi lô nguyên liệu cần được gắn thẻ hạn dùng và theo dõi xuyên suốt từ kho nhập đến thành phẩm xuất kho. Sai sót trong khâu này dẫn đến rủi ro thu hồi sản phẩm với chi phí khổng lồ.'),
      bullet('Theo dõi hạn dùng tự động — cảnh báo 30 ngày trước khi hết hạn'),
      bullet('Truy xuất lô nguyên liệu — biết chính xác lô nào trong sản phẩm nào'),
      bullet('FIFO tự động — xuất kho theo đúng thứ tự nhập hàng'),

      h3('1.2. Kiểm soát chất lượng tích hợp'),
      p('Phòng QC nhập kết quả kiểm nghiệm trực tiếp vào ERP. Lô không đạt chuẩn bị khóa tự động, không thể đưa vào sản xuất. Mọi lịch sử kiểm tra được lưu trữ và xuất báo cáo theo yêu cầu kiểm định.'),
      p(''),

      h2('2. OMEGA.ERP giải quyết bài toán ngành thực phẩm như thế nào?'),
      pRuns([
        run('OMEGA.ERP ', { bold: true }),
        run('được thiết kế từ đầu cho doanh nghiệp sản xuất Việt Nam, với module chuyên biệt cho thực phẩm — không phải phần mềm nước ngoài "ép" vào thực tế Việt.'),
      ]),

      h3('2.1. Module Sản xuất & Kế hoạch MRP'),
      p('Hệ thống tự tính toán nhu cầu nguyên liệu dựa trên đơn hàng, tồn kho hiện tại và thời gian cung ứng. Kế hoạch sản xuất được điều chỉnh tự động khi có thay đổi đơn hàng.'),

      h3('2.2. Tích hợp thiết bị IoT & cân điện tử'),
      p('Dữ liệu từ cân điện tử, máy đóng gói và cảm biến nhiệt độ được đẩy thẳng vào ERP, loại bỏ nhập liệu thủ công và sai số.'),

      p('[ẢNH: Sơ đồ tích hợp IoT với OMEGA.ERP]', { color: ORANGE, italic: true }),
      p(''),

      h2('3. Kết quả thực tế từ khách hàng OMEGA'),
      pRuns([
        run('Sau 6 tháng triển khai, '),
        run('công ty thực phẩm ABC ', { bold: true }),
        run('ghi nhận:'),
      ]),
      bullet('Giảm 40% tồn kho nguyên liệu hết hạn do cảnh báo tự động'),
      bullet('Rút ngắn 60% thời gian lập kế hoạch sản xuất hàng tuần'),
      bullet('Đạt chứng nhận ISO 22000 lần đầu tiên nhờ hệ thống ghi nhận đầy đủ'),
      bullet('Tiết kiệm 2 nhân sự kho nhờ FIFO và truy xuất tự động'),
      p(''),

      h2('4. Bắt đầu như thế nào?'),
      p('OMEGA cung cấp gói tư vấn miễn phí 3 buổi để đánh giá hiện trạng và đề xuất lộ trình phù hợp với quy mô doanh nghiệp. Không cần cam kết trước.'),

      new Paragraph({
        children: [
          new TextRun({ text: '→ Liên hệ ngay: ', size: 24, bold: true, color: GREEN }),
          new TextRun({ text: 'info@omega.com.vn', size: 24, color: GREEN, underline: { type: UnderlineType.SINGLE } }),
          new TextRun({ text: ' | Hotline: 1800 000 000', size: 24, color: GREEN }),
        ],
        spacing: { after: 400 },
      }),

      // ── HƯỚNG DẪN CHÈN ẢNH ───────────────────────────────
      new Paragraph({
        children: [new TextRun({ text: '━━━ HƯỚNG DẪN CHÈN ẢNH ━━━', size: 20, color: GRAY, bold: true })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 400, after: 200 },
      }),
      h2('Cách chèn ảnh vào bài viết'),
      note('Ảnh trong Google Docs sẽ KHÔNG tự động lên website. Phải upload ảnh qua admin.html trước, lấy URL rồi ghi vào Doc như bên dưới.'),
      p(''),
      h3('Bước 1: Upload ảnh qua admin.html'),
      bullet('Mở admin.html → Tab "Soạn bài"'),
      bullet('Bấm vào khu vực Thư viện ảnh hoặc kéo thả ảnh vào'),
      bullet('Hệ thống upload lên Google Drive và tạo URL'),
      bullet('Copy URL hiện ra (dạng: https://drive.google.com/thumbnail?id=...)'),
      p(''),
      h3('Bước 2: Ghi URL vào Google Doc'),
      p('Tại vị trí muốn chèn ảnh trong Doc, viết:'),
      new Paragraph({
        children: [new TextRun({ text: '[ẢNH: https://drive.google.com/thumbnail?id=ABC123&sz=w1200]', size: 22, color: ORANGE, italics: true })],
        shading: { type: ShadingType.CLEAR, fill: 'FFF9C4' },
        spacing: { after: 80 },
      }),
      p('Hệ thống sẽ đọc URL từ nội dung Doc và tự động render ảnh vào bài viết.', { color: GRAY }),
      p(''),
      h3('Quy tắc định dạng'),
      bullet('H2 (Heading 2) = tiêu đề chính của mỗi phần → có gạch xanh bên trái'),
      bullet('H3 (Heading 3) = tiêu đề phụ'),
      bullet('Đoạn thường = nội dung chính'),
      bullet('Bullet list = danh sách điểm'),
      bullet('In đậm = từ khóa quan trọng cần nhấn mạnh'),
      bullet('In nghiêng = chú thích, nguồn dẫn'),
      p(''),
      note('💡  Không dùng màu chữ tùy ý trong Google Docs — website có CSS riêng và sẽ render màu chuẩn. Chỉ dùng bold và italic để nhấn mạnh.'),
      p(''),

      // ── CHÚ Ý CUỐI ───────────────────────────────────────
      h2('Checklist trước khi đăng bài'),
      bullet('✅ Tiêu đề rõ ràng, có từ khóa chính'),
      bullet('✅ Đã điền đủ metadata vào Sheet (slug, category, date, excerpt, tags)'),
      bullet('✅ Ảnh bìa đã upload qua admin.html và URL điền vào cover_image trong Sheet'),
      bullet('✅ Doc ID đã copy từ URL Google Docs và điền vào cột doc_id trong Sheet'),
      bullet('✅ Bài viết đủ dài (tối thiểu 600 chữ)'),
      bullet('✅ Có ít nhất 2 tiêu đề H2'),
      bullet('✅ Kiểm tra chính tả'),
      bullet('✅ Đổi status = published trong Sheet khi muốn bài lên web'),
      p(''),
      note('📌  Sau khi đổi status = published, bài xuất hiện trên website trong vài phút (GAS cache 5 phút).', 'E8F5E9', GREEN),
    ],
  }],
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync(OUT, buffer);
  console.log('✅  Đã tạo:', OUT);
});
