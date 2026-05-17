// ═══════════════════════════════════════════════════════════════════
// khach-hang.gs  v2 — CMS Khách hàng OMEGA
// Deploy: Extensions → Apps Script → Deploy → New deployment → Web app
//         Execute as: Me  |  Who has access: Anyone
//
// Routing:
//   GET /exec                    → JSON listing (logos + caseStudy + testimonials)
//   GET /exec?slug=skypec        → JSON chi tiết 1 khách hàng
//   GET /exec?callback=fn        → JSONP listing (tránh CORS)
//   GET /exec?slug=x&callback=fn → JSONP chi tiết
// ═══════════════════════════════════════════════════════════════════

const KH_SHEET  = 'KhachHang';
const CS_SHEET  = 'CaseStudy';
const TM_SHEET  = 'Testimonial';
const CT_SHEET  = 'ChiTiet';

const CACHE_LIST_KEY   = 'kh_list_v2';
const CACHE_DETAIL_PFX = 'kh_detail_v2_';
const CACHE_LIST_TTL   = 300;   // 5 phút
const CACHE_DETAIL_TTL = 1800;  // 30 phút

// ── Menu ─────────────────────────────────────────────────────────────────────
function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('📋 OMEGA CMS')
    .addItem('🔄 Xóa toàn bộ cache', 'clearAllCache')
    .addItem('👁 Xem JSON listing',  'previewListing')
    .addItem('🛠 Khởi tạo sheet (1 lần đầu)', 'setupSheet')
    .addToUi();
}

// ── doGet — Web App endpoint ─────────────────────────────────────────────────
function doGet(e) {
  const params = (e && e.parameter) || {};
  const slug   = (params.slug || '').trim().toLowerCase();
  const cb     = (params.callback || '').trim();

  let json;
  if (slug) {
    json = getDetailJson(slug);
  } else {
    json = getListJson();
  }

  if (cb) {
    return ContentService
      .createTextOutput(cb + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService
    .createTextOutput(json)
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Listing JSON (có cache) ───────────────────────────────────────────────────
function getListJson() {
  const cache  = CacheService.getScriptCache();
  let   cached = cache.get(CACHE_LIST_KEY);
  if (cached) return cached;

  const ss  = SpreadsheetApp.getActiveSpreadsheet();
  const out = JSON.stringify({
    ok          : true,
    type        : 'listing',
    generated   : _now(),
    logos       : _readKhachHang(ss),
    caseStudy   : _readCaseStudy(ss),
    testimonials: _readTestimonial(ss),
  });

  cache.put(CACHE_LIST_KEY, out, CACHE_LIST_TTL);
  return out;
}

// ── Detail JSON (có cache per slug) ──────────────────────────────────────────
function getDetailJson(slug) {
  const cache  = CacheService.getScriptCache();
  const key    = CACHE_DETAIL_PFX + slug;
  let   cached = cache.get(key);
  if (cached) return cached;

  const ss      = SpreadsheetApp.getActiveSpreadsheet();
  const logos   = _readKhachHang(ss);
  const kh      = logos.find(function(c) { return c.slug === slug; });

  if (!kh) {
    const out = JSON.stringify({ ok: false, error: 'not_found', slug: slug });
    return out;
  }

  const allCt = _readChiTiet(ss);
  const ct    = allCt.find(function(c) { return c.slug === slug; }) || {};

  const out = JSON.stringify({
    ok        : true,
    type      : 'detail',
    generated : _now(),
    slug      : slug,
    khachHang : kh,
    chiTiet   : ct,
  });

  cache.put(key, out, CACHE_DETAIL_TTL);
  return out;
}

// ── Xóa cache ────────────────────────────────────────────────────────────────
function clearAllCache() {
  const cache = CacheService.getScriptCache();
  const ss    = SpreadsheetApp.getActiveSpreadsheet();
  const slugs = _readKhachHang(ss).map(function(c) { return c.slug; });

  const keys  = [CACHE_LIST_KEY].concat(slugs.map(function(s) { return CACHE_DETAIL_PFX + s; }));
  cache.removeAll(keys);

  SpreadsheetApp.getUi().alert('✅ Đã xóa ' + keys.length + ' cache keys!\nTrang web sẽ load dữ liệu mới ngay.');
}

// ── Preview ───────────────────────────────────────────────────────────────────
function previewListing() {
  const json = getListJson();
  const obj  = JSON.parse(json);
  SpreadsheetApp.getUi().alert(
    '✅ Listing (' + obj.generated + ')\n'
    + '· Logos: ' + obj.logos.length + '\n'
    + '· CaseStudy: ' + obj.caseStudy.length + '\n'
    + '· Testimonials: ' + obj.testimonials.length + '\n\n'
    + 'JSON (600 ký tự đầu):\n' + json.substring(0, 600) + '...'
  );
}

// ═══════════════════════════════════════════════════════════════════
// ĐỌC DỮ LIỆU TỪ SHEET
// ═══════════════════════════════════════════════════════════════════

// Sheet KhachHang: hàng 1=section, 2=note, 3=header, 4+=data
// Cols: A=STT B=slug C=ten_cong_ty D=ten_ngan E=tab F=nganh G=icon H=logo I=hien_thi
//       J=mo_ta K=quote L=nguoi_quote
function _readKhachHang(ss) {
  const ws   = ss.getSheetByName(KH_SHEET);
  if (!ws) return [];
  const rows = ws.getDataRange().getValues();
  const result = [];
  for (let r = 3; r < rows.length; r++) {
    const row = rows[r];
    if (!row[0] && !row[1]) continue;
    const shown = _bool(row[8]);
    if (!shown) continue;
    const slug = _str(row[1]);
    result.push({
      thu_tu     : Number(row[0]) || (r - 2),
      slug,
      ten_cong_ty: _str(row[2]),
      ten_ngan   : _str(row[3]),
      tab        : _str(row[4]) || 'all',
      nganh      : _str(row[5]),
      icon       : _str(row[6]) || 'fa-building',
      logo_file  : _str(row[7]),
      mo_ta      : _str(row[9]),
      quote      : _str(row[10]),
      nguoi_quote: _str(row[11]),
      url        : 'khach-hang/index.html?slug=' + slug,
    });
  }
  return result.sort(function(a, b) { return a.thu_tu - b.thu_tu; });
}

// Sheet CaseStudy: cols A=STT B=slug C=nganh_tag D=icon E=tieu_de F=mo_ta G=ket_qua H=hien_thi
function _readCaseStudy(ss) {
  const ws   = ss.getSheetByName(CS_SHEET);
  if (!ws) return [];
  const rows = ws.getDataRange().getValues();
  const result = [];
  for (let r = 3; r < rows.length; r++) {
    const row = rows[r];
    if (!row[0] && !row[1]) continue;
    if (!_bool(row[7])) continue;
    const slug = _str(row[1]);
    result.push({
      thu_tu   : Number(row[0]) || (r - 2),
      slug,
      nganh_tag: _str(row[2]),
      icon     : _str(row[3]) || 'fa-building',
      tieu_de  : _str(row[4]),
      mo_ta    : _str(row[5]),
      ket_qua  : _str(row[6]),
      url      : 'khach-hang/index.html?slug=' + slug,
    });
  }
  return result.sort(function(a, b) { return a.thu_tu - b.thu_tu; });
}

// Sheet Testimonial: cols A=STT B=ten C=chuc_danh D=quote E=so_sao F=hien_thi
function _readTestimonial(ss) {
  const ws   = ss.getSheetByName(TM_SHEET);
  if (!ws) return [];
  const rows = ws.getDataRange().getValues();
  const result = [];
  for (let r = 3; r < rows.length; r++) {
    const row = rows[r];
    if (!row[0] && !row[1]) continue;
    if (!_bool(row[5])) continue;
    result.push({
      thu_tu    : Number(row[0]) || (r - 2),
      ten       : _str(row[1]),
      chuc_danh : _str(row[2]),
      quote     : _str(row[3]),
      so_sao    : parseFloat(row[4]) || 5,
    });
  }
  return result.sort(function(a, b) { return a.thu_tu - b.thu_tu; });
}

// Sheet ChiTiet: cols A=slug B=page_h1 C=gioi_thieu D=thach_thuc E=giai_phap
//   F=kq1_icon G=kq1_num H=kq1_label I=kq2_icon J=kq2_num K=kq2_label
//   L=kq3_icon M=kq3_num N=kq3_label O=quote_text P=quote_nguoi Q=quote_chuc_danh R=san_pham
function _readChiTiet(ss) {
  const ws   = ss.getSheetByName(CT_SHEET);
  if (!ws) return [];
  const rows = ws.getDataRange().getValues();
  const result = [];
  for (let r = 3; r < rows.length; r++) {
    const row = rows[r];
    if (!row[0]) continue;
    const sanPhamRaw = _str(row[17]);
    const sanPham    = sanPhamRaw ? sanPhamRaw.split(',').map(function(s) { return s.trim(); }).filter(Boolean) : [];
    result.push({
      slug         : _str(row[0]),
      page_h1      : _str(row[1]),
      gioi_thieu   : _str(row[2]),
      thach_thuc   : _str(row[3]),
      giai_phap    : _str(row[4]),
      ket_qua      : [
        { icon: _str(row[5])  || 'fa-chart-line', num: _str(row[6]),  label: _str(row[7])  },
        { icon: _str(row[8])  || 'fa-users',       num: _str(row[9]),  label: _str(row[10]) },
        { icon: _str(row[11]) || 'fa-clock',        num: _str(row[12]), label: _str(row[13]) },
      ].filter(function(k) { return k.num || k.label; }),
      quote_text     : _str(row[14]),
      quote_nguoi    : _str(row[15]),
      quote_chuc_danh: _str(row[16]),
      san_pham       : sanPham,
    });
  }
  return result;
}

// ── Utils ─────────────────────────────────────────────────────────────────────
function _str(v)  { return String(v == null ? '' : v).trim(); }
function _bool(v) { return String(v).toUpperCase() === 'TRUE' || v === true; }
function _now()   { return Utilities.formatDate(new Date(), 'Asia/Ho_Chi_Minh', 'dd/MM/yyyy HH:mm'); }

// ═══════════════════════════════════════════════════════════════════
// SETUP SHEET — khởi tạo dữ liệu mặc định
// ═══════════════════════════════════════════════════════════════════
function setupSheet() {
  const ui   = SpreadsheetApp.getUi();
  const resp = ui.alert('⚠️ Xác nhận', 'Sẽ TẠO LẠI 4 sheet: KhachHang, CaseStudy, Testimonial, ChiTiet.\nDữ liệu hiện tại sẽ bị xóa. Tiếp tục?', ui.ButtonSet.YES_NO);
  if (resp !== ui.Button.YES) return;

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  _setupKhachHang(ss);
  _setupCaseStudy(ss);
  _setupTestimonial(ss);
  _setupChiTiet(ss);
  clearAllCache();
  ui.alert('✅ Hoàn tất! Đã tạo 4 sheet với dữ liệu mặc định.');
}

function _getOrCreate(ss, name) {
  let ws = ss.getSheetByName(name);
  if (ws) { ws.clearContents(); ws.clearFormats(); }
  else    { ws = ss.insertSheet(name); }
  return ws;
}
function _sh(ws, row, label, bg, fg, nc) {
  ws.getRange(row,1,1,nc).merge().setValue(label)
    .setBackground('#'+bg).setFontColor('#'+(fg||'FFFFFF'))
    .setFontWeight('bold').setFontSize(12).setVerticalAlignment('middle');
  ws.setRowHeight(row, 28);
}
function _note(ws, row, text, nc) {
  ws.getRange(row,1,1,nc).merge().setValue(text)
    .setBackground('#FFF9C4').setFontColor('#92400E')
    .setFontStyle('italic').setFontSize(9).setVerticalAlignment('middle');
  ws.setRowHeight(row, 28);
}
function _colH(ws, row, labels) {
  ws.getRange(row,1,1,labels.length).setValues([labels])
    .setBackground('#1E293B').setFontColor('#FFFFFF')
    .setFontWeight('bold').setFontSize(9)
    .setHorizontalAlignment('center').setVerticalAlignment('middle').setWrap(true);
  ws.setRowHeight(row, 44);
}
function _dataRows(ws, startRow, data) {
  if (!data.length) return;
  ws.getRange(startRow,1,data.length,data[0].length).setValues(data);
  for (let i=0; i<data.length; i++) {
    ws.getRange(startRow+i,1,1,data[i].length).setBackground(i%2===0?'#FFFFFF':'#F8FAFC').setVerticalAlignment('middle');
    ws.setRowHeight(startRow+i, 20);
  }
}

function _setupKhachHang(ss) {
  const ws = _getOrCreate(ss, KH_SHEET);
  _sh(ws,1,'📋  DANH SÁCH KHÁCH HÀNG','0D5C38','FFFFFF',12);
  _note(ws,2,'⚠️  Thêm dòng mới → GAS tự pickup. URL tự tính từ slug.',12);
  _colH(ws,3,['STT','Slug','Tên công ty đầy đủ','Tên ngắn (tooltip)','Tab lọc','Ngành','Icon FA','Logo file','Hiển thị','Mô tả tooltip','Quote ngắn','Người quote']);
  _dataRows(ws,4,[
    [1,'nam-thai-son','Công ty CP XNK Nam Thái Sơn','Công ty CP XNK Nam Thái Sơn','thuong-mai','Thương mại – XNK','fa-boxes-stacking','nam-thai-son.png',true,'Doanh nghiệp XNK hàng đầu, triển khai OMEGA.ERP toàn diện từ mua hàng, kho vận đến kế toán.','ERP không chỉ là phần mềm mà còn là giải pháp quản trị gắn liền với sự đồng hành lâu dài của Omega.','Ông Vân, Phó Tổng Giám Đốc'],
    [2,'vipharco','Công ty CP Dược phẩm Vipharco','Công ty CP Dược phẩm Vipharco','y-te','Dược phẩm','fa-capsules','vipharco.png',true,'Triển khai OMEGA.ERP đồng bộ hoạt động dược phẩm: mua hàng, kho, bán hàng, kế toán và báo cáo BI.','Kiểm kê hàng tồn kho giảm từ 2 ngày xuống còn 1.5 giờ — nhanh hơn 10 lần.','Bà Thu, Giám Đốc'],
    [3,'thanh-nam','Tập đoàn Thành Nam','Tập đoàn Thành Nam','san-xuat','Sản xuất – Đa ngành','fa-industry','thanh-nam.png',true,'Tập đoàn sản xuất đa ngành. OMEGA.ERP chuẩn hóa và đồng bộ toàn bộ hệ thống vận hành.','Sau 3 lần triển khai ERP thất bại, OMEGA.ERP đã vận hành đồng bộ từ sản xuất đến kế toán.','Ông Cường, Tổng Giám Đốc'],
    [4,'truecare','Truecare','Truecare','y-te','Thiết bị y tế','fa-hospital','truecare.png',true,'Phân phối thiết bị y tế chuyên nghiệp. OMEGA.ERP quản lý kho, truy xuất lô số, hạn dùng.','',''],
    [5,'cao-su-dau-tieng','Tổng Công ty Cao su Dầu Tiếng','Cao su Dầu Tiếng','san-xuat','Sản xuất cao su','fa-leaf','cao-su-dau-tieng.png',true,'Doanh nghiệp sản xuất cao su thiên nhiên hàng đầu. OMEGA.ERP quản lý từ khai thác đến xuất khẩu.','',''],
    [6,'skypec','Công ty Xăng dầu Hàng không Việt Nam (SKYPEC)','Skypec – Xăng dầu Hàng không','thuong-mai','Thương mại – Nhiên liệu','fa-oil-can','skypec.png',true,'Công ty TNHH MTV Nhiên liệu Hàng không VN ứng dụng OMEGA.ERP chuẩn hóa mua–bán–kho–tài chính.','Giảm 35% thời gian đối soát — tăng độ chính xác kho lên 99%.',''],
    [7,'lidovit','Lidovit','Lidovit','y-te','Dược phẩm – Thực phẩm chức năng','fa-pills','lidovit.png',true,'Sản xuất và phân phối dược phẩm, thực phẩm chức năng. OMEGA.ERP quản lý lô số, hạn dùng.','',''],
    [8,'hoa-an','Hoa An','Hoa An','thuong-mai','Thương mại','fa-shop','hoa-an.jpg',true,'Doanh nghiệp thương mại tối ưu bán hàng, công nợ và báo cáo tài chính với OMEGA.ERP.','',''],
    [9,'sasco','SASCO – Saigon Airport Services Company','SASCO – Saigon Airport','dich-vu','Dịch vụ – Hàng không','fa-plane','sasco.png',true,'Dịch vụ thương mại tại sân bay TSN. OMEGA.ERP quản lý duty-free, kho vận và tài chính.','',''],
    [10,'lyprodan','Lyprodan','Lyprodan','thuong-mai','Phân phối thương mại','fa-truck','lyprodan.png',true,'Phân phối thương mại. OMEGA.ERP quản lý đại lý, đơn hàng và tối ưu dòng tiền chuỗi phân phối.','',''],
    [11,'trieu-phu-loc','Triều Phú Lộc','Triều Phú Lộc','san-xuat','Sản xuất công nghiệp','fa-gear','trieu-phu-loc.png',true,'Sản xuất công nghiệp: OMEGA.ERP quản lý lệnh sản xuất, nguyên vật liệu, kiểm soát chi phí.','',''],
    [12,'tien-trien','Tiến Triển','Tiến Triển','san-xuat','Sản xuất','fa-cogs','tien-trien.png',true,'Sản xuất & thương mại. OMEGA.ERP số hóa quy trình sản xuất, tối ưu tồn kho.','',''],
    [13,'vitajean','Vitajean','Vitajean','san-xuat','Dệt may – Jeans','fa-shirt','vitajean.png',true,'Sản xuất denim & jeans. OMEGA.ERP quản lý nguyên phụ liệu và kiểm soát chất lượng thành phẩm.','',''],
    [14,'vstarschool','Vstar School','Vstar School','dich-vu','Giáo dục','fa-graduation-cap','vstarschool.png',true,'Hệ thống trường học: OMEGA.EDU & OMEGA.ERP quản lý học sinh, nhân sự giáo viên, tài chính học phí.','',''],
    [15,'earth-corp','Earth Corp','Earth Corp','san-xuat','Sản xuất','fa-industry','earth-corp.png',true,'Tập đoàn sản xuất công nghiệp: OMEGA.ERP quản lý chuỗi sản xuất, kho vận và báo cáo quản trị.','',''],
    [16,'hanel','Hanel','Hanel','thuong-mai','Phân phối điện tử','fa-microchip','hanel.png',true,'Phân phối điện tử & thiết bị Hà Nội. OMEGA.ERP quản lý kho, đại lý và chuỗi cung ứng.','',''],
    [17,'mitsubishi','Mitsubishi (đại lý VN)','Mitsubishi','thuong-mai','Phân phối – Thiết bị','fa-wrench','mitsubishi.png',true,'Phân phối thiết bị Mitsubishi tại VN. OMEGA.ERP quản lý đại lý, kho phụ tùng, dịch vụ bảo hành.','',''],
    [18,'him-lam','Tập đoàn Him Lam','Him Lam','dich-vu','Bất động sản','fa-building-columns','him-lam.png',true,'Tập đoàn đầu tư BĐS Him Lam: OMEGA.ERP quản lý dự án, tài chính và nhân sự quy mô lớn.','',''],
    [19,'stdt','STDT','STDT','san-xuat','Sản xuất công nghiệp','fa-gear','stdt.png',true,'Sản xuất công nghiệp: OMEGA.ERP đồng bộ quy trình sản xuất, kiểm soát chi phí.','',''],
  ]);
  [5,18,38,32,14,26,18,20,10,55,55,22].forEach(function(w,i){ws.setColumnWidth(i+1,w*6.5);});
  ws.setFrozenRows(3);
}

function _setupCaseStudy(ss) {
  const ws = _getOrCreate(ss, CS_SHEET);
  _sh(ws,1,'🏆  CASE STUDY — Featured cards','00A651','FFFFFF',8);
  _note(ws,2,'⚠️  Tối đa 3 dòng Hiển thị=TRUE.',8);
  _colH(ws,3,['STT','Slug KH','Nhãn ngành','Icon FA','Tiêu đề card','Mô tả','Kết quả nổi bật','Hiển thị']);
  _dataRows(ws,4,[
    [1,'skypec','Thương mại dầu khí','fa-oil-can','SKYPEC – Triển khai OMEGA.ERP thành công','Công ty Xăng dầu Hàng không Việt Nam ứng dụng OMEGA.ERP để chuẩn hóa quy trình mua – bán – kho và tài chính kế toán trên toàn hệ thống phân phối nhiên liệu.','Giảm 35% thời gian đối soát – Tăng độ chính xác kho 99%',true],
    [2,'vipharco','Dược phẩm','fa-capsules','Vipharco – OMEGA.ERP trong ngành dược phẩm','Công ty Cổ phần Dược phẩm Vipharco triển khai OMEGA.ERP tích hợp quản lý sản xuất, kiểm soát lô – hạn dùng, và hệ thống báo cáo tài chính theo chuẩn ngành dược.','Truy xuất nguồn gốc 100% – Tối ưu tồn kho 28%',true],
    [3,'cao-su-dau-tieng','Sản xuất cao su','fa-industry','Cao su Dầu Tiếng – Triển khai ERP quản lý sản xuất','Tổng Công ty Cao su Dầu Tiếng ứng dụng OMEGA.ERP để số hóa toàn bộ quy trình khai thác – chế biến – bán hàng, tích hợp kho và lương lao động nông trường.','Tiết kiệm 40% nhân lực hành chính – Báo cáo real-time',true],
  ]);
  [5,18,22,14,42,65,50,10].forEach(function(w,i){ws.setColumnWidth(i+1,w*6.5);});
  ws.setFrozenRows(3);
}

function _setupTestimonial(ss) {
  const ws = _getOrCreate(ss, TM_SHEET);
  _sh(ws,1,'💬  ĐÁNH GIÁ KHÁCH HÀNG — Testimonial','0D1B2A','FFFFFF',6);
  _note(ws,2,'⚠️  so_sao: 5 hoặc 4.5.',6);
  _colH(ws,3,['STT','Họ tên','Chức danh','Câu trích dẫn','Số sao','Hiển thị']);
  _dataRows(ws,4,[
    [1,'Ông Nguyễn Văn Thành','Giám đốc Tài chính – SKYPEC','Sau khi triển khai OMEGA.ERP, chúng tôi kiểm soát được toàn bộ dòng tiền và tồn kho theo thời gian thực. Ban giám đốc có thể xem báo cáo tổng hợp chỉ sau 1 cú click mà không cần chờ bộ phận kế toán tổng hợp như trước.',5,true],
    [2,'Bà Trần Thị Hương','Trưởng phòng Kế hoạch – Vipharco','Đội ngũ tư vấn của Omega hiểu rất rõ đặc thù ngành dược. Từ quản lý lô hàng, hạn sử dụng đến báo cáo theo chuẩn Bộ Y tế – tất cả đều được xử lý trơn tru. Chúng tôi tiết kiệm được đáng kể chi phí vận hành sau 1 năm go-live.',5,true],
    [3,'Ông Lê Quốc Minh','Phó Tổng Giám đốc – Cao su Dầu Tiếng','Hệ thống ERP của Omega giúp chúng tôi quản lý hàng nghìn lao động nông trường và hàng trăm điểm khai thác cao su một cách chính xác. Quy trình chốt lương trước đây mất cả tuần, nay chỉ còn 1 ngày.',4.5,true],
  ]);
  [5,26,34,85,12,10].forEach(function(w,i){ws.setColumnWidth(i+1,w*6.5);});
  ws.setFrozenRows(3);
}

function _setupChiTiet(ss) {
  const ws = _getOrCreate(ss, CT_SHEET);
  const nc = 18;
  _sh(ws,1,'📄  CHI TIẾT KHÁCH HÀNG — Nội dung trang khach-hang/index.html?slug=xxx','1E3A5F','FFFFFF',nc);
  _note(ws,2,'⚠️  Cột "Slug" phải khớp với KhachHang. Sản phẩm: phẩy phân cách (vd: OMEGA.ERP, OMEGA.GL).',nc);
  _colH(ws,3,[
    'Slug','Tên H1 (SEO)',
    'Giới thiệu','Thách thức','Giải pháp Omega',
    'KQ1 icon','KQ1 số','KQ1 mô tả',
    'KQ2 icon','KQ2 số','KQ2 mô tả',
    'KQ3 icon','KQ3 số','KQ3 mô tả',
    'Quote text','Người quote','Chức danh quote',
    'Sản phẩm (phẩy)',
  ]);
  // Dữ liệu mặc định nhúng sẵn — đầy đủ 19 khách hàng
  // (Dữ liệu này được trích xuất từ các trang tĩnh cũ)
  const rows = [
    ['nam-thai-son','Công ty CP XNK Nam Thái Sơn','Công ty Cổ phần Xuất Nhập Khẩu Nam Thái Sơn là doanh nghiệp chuyên kinh doanh xuất nhập khẩu hàng hóa đa ngành, với hệ thống phân phối trải rộng trong và ngoài nước.','Quản lý chuỗi cung ứng phức tạp với nhiều nhà cung cấp quốc tế, đối soát chứng từ XNK thủ công tốn thời gian, thiếu công cụ theo dõi công nợ và dòng tiền ngoại tệ theo thời gian thực.','OMEGA.ERP tích hợp toàn bộ quy trình mua hàng, kho vận, bán hàng và kế toán. Hệ thống tự động đối soát chứng từ, quản lý công nợ ngoại tệ và xuất báo cáo quản trị tức thì.','fa-boxes-stacking','1 hệ thống','Tích hợp toàn bộ XNK – kho – kế toán','fa-file-invoice','Auto','Đối soát chứng từ tự động','fa-chart-bar','Real-time','Báo cáo dòng tiền tức thì','ERP không chỉ là phần mềm mà còn là giải pháp quản trị gắn liền với sự đồng hành lâu dài của Omega.','Ông Vân','Phó Tổng Giám Đốc – Nam Thái Sơn','OMEGA.ERP, OMEGA.WM, OMEGA.SO, OMEGA.PO, OMEGA.GL'],
    ['vipharco','Công ty CP Dược phẩm Vipharco','Công ty Cổ phần Dược phẩm Vipharco là doanh nghiệp chuyên sản xuất và phân phối dược phẩm, thực phẩm chức năng với hệ thống phân phối rộng khắp toàn quốc.','Quản lý lô hàng, hạn sử dụng theo quy định của Bộ Y tế; đối soát công nợ hàng nghìn đại lý; báo cáo tài chính chưa đáp ứng chuẩn ngành dược; kiểm kê tồn kho mất nhiều ngày.','OMEGA.ERP triển khai quản lý lô số – hạn dùng tự động, tích hợp mua hàng – kho – bán hàng và kế toán theo chuẩn ngành dược. Báo cáo BI thời gian thực cho ban lãnh đạo.','fa-shield-halved','100%','Truy xuất nguồn gốc lô hàng','fa-chart-line','28%','Tối ưu tồn kho','fa-clock','1.5 giờ','Kiểm kê kho (từ 2 ngày)','Đội ngũ tư vấn của Omega hiểu rất rõ đặc thù ngành dược. Từ quản lý lô hàng, hạn sử dụng đến báo cáo theo chuẩn Bộ Y tế – tất cả đều được xử lý trơn tru.','Bà Trần Thị Hương','Trưởng phòng Kế hoạch – Vipharco','OMEGA.ERP, OMEGA.WM, OMEGA.SO, OMEGA.PO, OMEGA.GL, OMEGA.MC'],
    ['thanh-nam','Tập đoàn Thành Nam','Tập đoàn Thành Nam là tập đoàn sản xuất và kinh doanh đa ngành, hoạt động trong nhiều lĩnh vực từ sản xuất công nghiệp đến thương mại dịch vụ.','Sau nhiều lần thử nghiệm triển khai ERP thất bại, tập đoàn cần một giải pháp có thể đồng bộ toàn bộ hệ thống sản xuất, kho vận và kế toán trên nhiều đơn vị thành viên.','OMEGA.ERP triển khai theo từng giai đoạn với đội ngũ tư vấn am hiểu đặc thù đa ngành, chuẩn hóa quy trình từ sản xuất đến kế toán và đồng bộ báo cáo toàn tập đoàn.','fa-industry','1 nền tảng','Chuẩn hóa toàn tập đoàn','fa-gears','Đồng bộ','Sản xuất – kho – kế toán liền mạch','fa-check-double','Thành công','Sau 3 lần triển khai ERP thất bại','Sau 3 lần triển khai ERP thất bại, OMEGA.ERP đã vận hành đồng bộ từ sản xuất, kho vận đến kế toán.','Ông Cường','Tổng Giám Đốc – Tập đoàn Thành Nam','OMEGA.ERP, OMEGA.MM, OMEGA.WM, OMEGA.GL, OMEGA.HR, OMEGA.PR'],
    ['truecare','Truecare','Truecare là doanh nghiệp chuyên phân phối thiết bị y tế chuyên nghiệp với danh mục sản phẩm đa dạng phục vụ hệ thống bệnh viện và phòng khám toàn quốc.','Quản lý kho hàng y tế theo lô số, serial, hạn dùng theo quy định nghiêm ngặt; đối soát chứng từ nhập khẩu phức tạp; báo cáo tài chính chưa tự động hóa.','OMEGA.ERP triển khai quản lý kho thiết bị y tế theo lô – serial – hạn dùng, tích hợp nhập khẩu, phân phối và kế toán. Hệ thống tự động cảnh báo hạn dùng và tồn kho tối thiểu.','fa-hospital','100%','Truy xuất lô số thiết bị y tế','fa-triangle-exclamation','Auto','Cảnh báo hạn dùng tự động','fa-link','Liên thông','Nhập khẩu – kho – bán – kế toán','','','','OMEGA.ERP, OMEGA.WM, OMEGA.SO, OMEGA.PO, OMEGA.GL'],
    ['cao-su-dau-tieng','Tổng Công ty Cao su Dầu Tiếng','Tổng Công ty Cao su Dầu Tiếng là một trong những doanh nghiệp cao su lớn nhất Việt Nam, với hàng nghìn lao động nông trường và hàng trăm điểm khai thác cao su.','Quản lý hàng nghìn lao động nông trường phân tán tại nhiều điểm khai thác; tính lương sản phẩm phức tạp theo sản lượng; báo cáo hợp nhất từ nhiều nông trường mất nhiều thời gian.','OMEGA.ERP tích hợp quản lý nông trường, khai thác – chế biến – xuất khẩu cao su. Hệ thống tính lương theo sản lượng tự động, tổng hợp báo cáo toàn tập đoàn theo thời gian thực.','fa-leaf','40%','Tiết kiệm nhân lực hành chính','fa-users-gear','Tự động','Tính lương theo sản lượng nông trường','fa-file-lines','Real-time','Báo cáo tổng hợp toàn tập đoàn','Hệ thống ERP của Omega giúp chúng tôi quản lý hàng nghìn lao động nông trường và hàng trăm điểm khai thác cao su một cách chính xác. Quy trình chốt lương trước đây mất cả tuần, nay chỉ còn 1 ngày.','Ông Lê Quốc Minh','Phó Tổng Giám đốc – Cao su Dầu Tiếng','OMEGA.ERP, OMEGA.MM, OMEGA.WM, OMEGA.GL, OMEGA.HR, OMEGA.PR'],
    ['skypec','Công ty Xăng dầu Hàng không Việt Nam (SKYPEC)','Công ty TNHH MTV Nhiên liệu Hàng không Việt Nam (SKYPEC) được thành lập năm 1993, là đơn vị dẫn đầu lĩnh vực cung ứng nhiên liệu hàng không tại Việt Nam, cung cấp cho toàn bộ hãng bay nội địa và hơn 60 hãng quốc tế.','Quản lý xuất – nhập – tồn nhiên liệu tại nhiều sân bay đồng thời; đối soát hàng nghìn phiếu giao nhận mỗi ngày; quy trình phòng ban chưa chuẩn hóa; báo cáo cho lãnh đạo không kịp thời.','OMEGA.ERP triển khai theo đặc thù ngành vận tải xăng dầu hàng không: chuẩn hóa quy trình xuất – nhập – tồn, các phòng ban kế thừa thông tin liền mạch, ban lãnh đạo có báo cáo tổng hợp tức thì.','fa-chart-line','35%','Giảm thời gian đối soát chứng từ','fa-warehouse','99%','Độ chính xác tồn kho nhiên liệu','fa-eye','1 click','Báo cáo tổng hợp tức thì','Sau khi triển khai Omega ERP, chúng tôi kiểm soát được toàn bộ dòng tiền và tồn kho theo thời gian thực. Ban giám đốc có thể xem báo cáo tổng hợp chỉ sau 1 cú click mà không cần chờ bộ phận kế toán tổng hợp như trước.','Ông Nguyễn Văn Thành','Giám đốc Tài chính – SKYPEC','OMEGA.ERP, OMEGA.WM, OMEGA.SO, OMEGA.PO, OMEGA.GL, OMEGA.MC'],
    ['lidovit','Lidovit','Lidovit là doanh nghiệp chuyên sản xuất và phân phối dược phẩm, thực phẩm chức năng với hệ thống phân phối đa kênh trải rộng toàn quốc.','Quản lý lô số, hạn dùng theo quy định Bộ Y tế; theo dõi hệ thống đại lý đa cấp; đối soát công nợ phức tạp; báo cáo tài chính chưa tự động hóa.','OMEGA.ERP triển khai quản lý sản xuất – lô số – hạn dùng – phân phối đa kênh tích hợp kế toán. Hệ thống tự động cảnh báo hàng gần hết hạn và tối ưu tồn kho.','fa-pills','FEFO','Quản lý xuất theo FEFO tự động','fa-network-wired','Đa kênh','Phân phối đại lý toàn quốc','fa-file-medical','Chuẩn','Báo cáo chuẩn Bộ Y tế','','','','OMEGA.ERP, OMEGA.WM, OMEGA.SO, OMEGA.PO, OMEGA.GL, OMEGA.MC'],
    ['hoa-an','Hoa An','Hoa An là doanh nghiệp thương mại uy tín, chuyên kinh doanh và phân phối hàng hóa với mạng lưới khách hàng rộng khắp.','Quản lý hàng nghìn mã hàng với nhiều nhà cung cấp; theo dõi công nợ khách hàng chưa tự động; báo cáo tài chính tổng hợp mất nhiều thời gian thủ công.','OMEGA.ERP tích hợp bán hàng, quản lý công nợ và kế toán tự động. Hệ thống cảnh báo công nợ quá hạn, tổng hợp dòng tiền và xuất báo cáo tài chính tức thì.','fa-shop','Auto','Quản lý bán hàng tự động hóa','fa-coins','Kịp thời','Cảnh báo công nợ quá hạn','fa-chart-pie','Tức thì','Báo cáo tài chính thời gian thực','','','','OMEGA.ERP, OMEGA.SO, OMEGA.WM, OMEGA.PO, OMEGA.GL'],
    ['sasco','SASCO – Saigon Airport Services Company','SASCO là doanh nghiệp chuyên cung cấp dịch vụ thương mại và bán lẻ tại cảng hàng không quốc tế Tân Sơn Nhất, bao gồm hệ thống cửa hàng duty-free và dịch vụ ăn uống.','Quản lý nhiều cửa hàng tại các khu vực khác nhau trong sân bay; đồng bộ tồn kho duty-free với hải quan; báo cáo doanh thu – công nợ chưa tự động hóa.','OMEGA.ERP quản lý hệ thống cửa hàng duty-free, kho vận và tài chính. Hệ thống đồng bộ dữ liệu giữa các điểm bán, tích hợp khai báo hải quan và xuất báo cáo doanh thu tức thì.','fa-plane','Đa điểm','Quản lý chuỗi cửa hàng sân bay','fa-passport','Tự động','Đồng bộ hải quan duty-free','fa-cash-register','Tức thì','Báo cáo doanh thu real-time','','','','OMEGA.ERP, OMEGA.WM, OMEGA.SO, OMEGA.PO, OMEGA.GL, OMEGA.MC'],
    ['lyprodan','Lyprodan','Lyprodan là doanh nghiệp phân phối hàng hóa thương mại với mạng lưới đại lý và khách hàng trải rộng toàn quốc.','Quản lý hệ thống đại lý phức tạp với nhiều chính sách giá và chiết khấu khác nhau; theo dõi đơn hàng và tồn kho chưa tự động; báo cáo dòng tiền chưa kịp thời.','OMEGA.ERP tích hợp quản lý đại lý, chính sách giá – chiết khấu, đơn hàng, kho và kế toán. Hệ thống tự động tính hoa hồng, theo dõi công nợ và tối ưu dòng tiền toàn chuỗi.','fa-truck','Tự động','Quản lý đơn hàng & đại lý tự động','fa-percent','Chính xác','Tính chiết khấu – hoa hồng tự động','fa-money-bill-trend-up','Tối ưu','Dòng tiền chuỗi phân phối','','','','OMEGA.ERP, OMEGA.SO, OMEGA.WM, OMEGA.PO, OMEGA.GL'],
    ['trieu-phu-loc','Triều Phú Lộc','Triều Phú Lộc là doanh nghiệp sản xuất công nghiệp với dây chuyền sản xuất hiện đại, chuyên sản xuất các sản phẩm công nghiệp đa dạng.','Quản lý lệnh sản xuất phức tạp với nhiều BOM; theo dõi nguyên vật liệu đầu vào; kiểm soát chi phí sản xuất thực tế so với kế hoạch chưa tự động hóa.','OMEGA.ERP triển khai quản lý sản xuất theo lệnh, BOM đa cấp, tính giá thành thực tế và so sánh với kế hoạch. Hệ thống cảnh báo vật tư thiếu hụt và tối ưu lịch sản xuất.','fa-gear','Auto','Lập lịch sản xuất tự động','fa-cubes','Chính xác','Kiểm soát BOM đa cấp','fa-coins','Thực tế','Chi phí sản xuất real-time','','','','OMEGA.ERP, OMEGA.MM, OMEGA.WM, OMEGA.PC, OMEGA.GL'],
    ['tien-trien','Tiến Triển','Tiến Triển là doanh nghiệp sản xuất và thương mại với nhiều dòng sản phẩm đa dạng phục vụ thị trường trong nước và xuất khẩu.','Quản lý sản xuất và thương mại trên cùng một nền tảng; đồng bộ tồn kho giữa nhà máy và kho thành phẩm; báo cáo giá thành chưa tự động.','OMEGA.ERP số hóa quy trình sản xuất, tích hợp kho thành phẩm và bán hàng. Hệ thống tự động tính giá thành, tối ưu tồn kho và xuất báo cáo quản trị tức thì.','fa-cogs','Tích hợp','Sản xuất – kho – bán liền mạch','fa-boxes-stacking','Tối ưu','Quản lý tồn kho thông minh','fa-receipt','Tự động','Tính giá thành sản xuất','','','','OMEGA.ERP, OMEGA.MM, OMEGA.WM, OMEGA.SO, OMEGA.PC, OMEGA.GL'],
    ['vitajean','Vitajean','Vitajean là doanh nghiệp chuyên sản xuất hàng may mặc denim và jeans với công suất lớn, phục vụ thị trường trong nước và xuất khẩu sang các thị trường quốc tế.','Quản lý nguyên phụ liệu nhập khẩu đa dạng; theo dõi quy trình sản xuất qua nhiều công đoạn; kiểm soát chất lượng thành phẩm và tính định mức tiêu hao nguyên liệu.','OMEGA.ERP tích hợp quản lý nguyên phụ liệu, định mức tiêu hao, quy trình sản xuất từng công đoạn, kiểm soát chất lượng và tính giá thành chi tiết cho từng đơn hàng.','fa-shirt','Chi tiết','Theo dõi SX từng công đoạn','fa-ruler','Chính xác','Định mức tiêu hao nguyên liệu','fa-award','Chuẩn','Kiểm soát chất lượng thành phẩm','','','','OMEGA.ERP, OMEGA.MM, OMEGA.WM, OMEGA.QC, OMEGA.PC, OMEGA.GL'],
    ['vstarschool','Vstar School','Vstar School là hệ thống trường học đa cấp với nhiều cơ sở, cung cấp dịch vụ giáo dục chất lượng cao cho học sinh từ mầm non đến trung học.','Quản lý học sinh và học phí tại nhiều cơ sở; theo dõi lịch học và nhân sự giáo viên; báo cáo tài chính giáo dục chưa tự động hóa.','OMEGA.EDU & OMEGA.ERP triển khai tích hợp: quản lý hồ sơ học sinh, thu học phí, lịch học, nhân sự giáo viên và tài chính trên một nền tảng duy nhất.','fa-graduation-cap','Tự động','Quản lý học sinh & học phí','fa-chalkboard-user','Đồng bộ','Lịch học & nhân sự giáo viên','fa-file-invoice-dollar','Tức thì','Báo cáo tài chính giáo dục','','','','OMEGA.ERP, OMEGA.EDU, OMEGA.HR, OMEGA.PR, OMEGA.GL'],
    ['earth-corp','Earth Corp','Earth Corp là tập đoàn sản xuất công nghiệp với nhiều nhà máy và dây chuyền sản xuất hiện đại, chuyên sản xuất các sản phẩm công nghiệp phục vụ thị trường trong nước và xuất khẩu.','Quản lý nhiều nhà máy phân tán; đồng bộ kế hoạch sản xuất và tồn kho giữa các nhà máy; báo cáo quản trị tổng hợp chưa kịp thời.','OMEGA.ERP triển khai quản lý đa nhà máy: kế hoạch sản xuất, kho vận, giá thành và báo cáo quản trị tổng hợp. Hệ thống cho phép ban lãnh đạo theo dõi toàn bộ hoạt động sản xuất theo thời gian thực.','fa-industry','Đa nhà máy','Quản lý chuỗi sản xuất tập trung','fa-warehouse','Real-time','Kho vận đa nhà máy đồng bộ','fa-chart-gantt','Tổng hợp','Báo cáo quản trị tức thì','','','','OMEGA.ERP, OMEGA.MM, OMEGA.WM, OMEGA.PC, OMEGA.GL, OMEGA.MC'],
    ['hanel','Hanel','Hanel là tập đoàn phân phối điện tử và thiết bị hàng đầu tại Hà Nội, chuyên phân phối các thương hiệu điện tử danh tiếng trong và ngoài nước.','Quản lý kho hàng điện tử với nhiều chủng loại serial; theo dõi hệ thống đại lý và bảo hành; báo cáo doanh thu – tồn kho chưa tự động hóa.','OMEGA.ERP triển khai quản lý kho điện tử theo serial, hệ thống đại lý, dịch vụ bảo hành và kế toán. Hệ thống tự động theo dõi serial từ nhập kho đến bán hàng và bảo hành.','fa-microchip','Serial','Quản lý điện tử theo serial','fa-network-wired','Toàn diện','Hệ thống đại lý & bảo hành','fa-chart-line','Tức thì','Báo cáo tồn kho & doanh thu','','','','OMEGA.ERP, OMEGA.WM, OMEGA.SO, OMEGA.PO, OMEGA.GL'],
    ['mitsubishi','Mitsubishi (đại lý VN)','Mitsubishi (đại lý VN) là doanh nghiệp phân phối thiết bị và máy móc Mitsubishi tại Việt Nam, với mạng lưới đại lý rộng khắp và dịch vụ bảo hành chuyên nghiệp.','Quản lý phụ tùng thay thế với nhiều mã SKU; theo dõi lịch sử bảo hành từng máy theo serial; đối soát hợp đồng bảo hành với Mitsubishi Nhật.','OMEGA.ERP tích hợp quản lý đơn hàng, kho phụ tùng theo serial, hệ thống đại lý và dịch vụ bảo hành. Hệ thống tự động theo dõi lịch sử bảo hành và cảnh báo hợp đồng sắp hết hạn.','fa-wrench','Chính xác','Quản lý phụ tùng theo serial','fa-handshake','Toàn diện','Hệ thống đại lý & bảo hành','fa-file-contract','Auto','Cảnh báo hợp đồng bảo hành','','','','OMEGA.ERP, OMEGA.WM, OMEGA.SO, OMEGA.PO, OMEGA.GL'],
    ['him-lam','Tập đoàn Him Lam','Tập đoàn Him Lam là một trong những tập đoàn tư nhân lớn nhất Việt Nam, hoạt động trong lĩnh vực đầu tư và phát triển bất động sản, tài chính, hàng không và dịch vụ.','Tập đoàn đa ngành với hàng chục công ty thành viên cần hệ thống quản trị thống nhất: quản lý dự án BĐS, tiến độ thi công, dòng tiền đầu tư, nhân sự quy mô lớn và báo cáo hợp nhất theo chuẩn quốc tế.','OMEGA.ERP triển khai theo mô hình holding: mỗi công ty thành viên quản lý tài chính, nhân sự độc lập; OMEGA.CL hợp nhất báo cáo tài chính toàn tập đoàn. Quản lý dự án BĐS theo từng phase đầu tư.','fa-building-columns','Đa dự án','Quản lý danh mục & tiến độ BĐS','fa-users-gear','Tập đoàn','Nhân sự & lương đồng bộ toàn hệ thống','fa-landmark','Hợp nhất','Báo cáo tài chính tập đoàn chuẩn quốc tế','','','','OMEGA.ERP, OMEGA.GL, OMEGA.HR, OMEGA.PR, OMEGA.MC, OMEGA.CL'],
    ['stdt','STDT','STDT là doanh nghiệp sản xuất công nghiệp với năng lực sản xuất lớn và hệ thống quản lý hiện đại, chuyên cung cấp các sản phẩm công nghiệp chất lượng cao.','Quản lý quy trình sản xuất phức tạp với nhiều công đoạn; theo dõi nguyên vật liệu và tỷ lệ tiêu hao; kiểm soát chi phí sản xuất thực tế chưa tự động hóa.','OMEGA.ERP triển khai đồng bộ hóa quy trình sản xuất, tự động hóa tính toán BOM và giá thành, kiểm soát chi phí thực tế và tối ưu năng lực vận hành nhà máy.','fa-gear','Tự động','Lập lịch & kiểm soát sản xuất','fa-cubes','Đồng bộ','BOM – Định mức – Giá thành','fa-chart-line','Tối ưu','Năng lực vận hành nhà máy','','','','OMEGA.ERP, OMEGA.MM, OMEGA.WM, OMEGA.PC, OMEGA.QC, OMEGA.GL'],
  ];
  _dataRows(ws,4,rows);
  [18,30,55,55,55,14,14,34,14,14,34,14,14,34,65,26,30,50].forEach(function(w,i){ws.setColumnWidth(i+1,w*6);});
  ws.setFrozenRows(3);
  ws.setFrozenColumns(1);
}
