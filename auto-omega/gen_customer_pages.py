"""
================================================================================
gen_customer_pages.py — Sinh trang HTML chi tiết cho từng khách hàng tiêu biểu
================================================================================
MỤC ĐÍCH:
  Tự động tạo 19 trang con trong thư mục khach-hang/ từ dữ liệu khách hàng.
  Header và footer được trích trực tiếp từ khach-hang.html để luôn đồng bộ
  với giao diện chính của website.

CÁCH CHẠY:
  cd D:\\Dev_SW\\projects\\omega
  python -X utf8 auto-omega/gen_customer_pages.py

CẬP NHẬT KHI NÀO?
  - Thêm / xóa khách hàng
  - Sửa thông tin, kết quả triển khai, sản phẩm sử dụng
  - Sau khi sửa header/footer trong khach-hang.html (chạy lại để đồng bộ)

LƯU Ý KỸ THUẬT:
  - Dùng <base href="../"> để mọi path (CSS/JS/ảnh/nav) resolve đúng
  - Header & footer trích tự động từ khach-hang.html qua marker comment
================================================================================
"""

import re
from pathlib import Path
from datetime import datetime

PROJECT_ROOT   = Path(__file__).parent.parent
OUTPUT_DIR     = PROJECT_ROOT / "khach-hang"
SOURCE_PAGE    = PROJECT_ROOT / "khach-hang.html"
OUTPUT_DIR.mkdir(exist_ok=True)

# ── Trích header / footer từ khach-hang.html ─────────────────────────────────
def extract_block(html: str, begin_marker: str, end_marker: str) -> str:
    """Trích đoạn HTML giữa hai comment marker."""
    start = html.find(begin_marker)
    end   = html.find(end_marker)
    if start == -1 or end == -1:
        raise ValueError(f"Không tìm thấy marker: {begin_marker!r} → {end_marker!r}")
    return html[start : end + len(end_marker)]

def load_source_blocks():
    """Đọc khach-hang.html và trích header, footer."""
    raw = SOURCE_PAGE.read_text(encoding="utf-8")
    header = extract_block(raw,
        "<!-- ============ HEADER ============ -->",
        "<!-- ============ /HEADER ============ -->")
    footer = extract_block(raw,
        "<!-- ============ FOOTER ============ -->",
        "<!-- ============ /FOOTER ============ -->")
    return header, footer

# ── Dữ liệu khách hàng ────────────────────────────────────────────────────────
CUSTOMERS = [
    {
        "slug": "cao-su-dau-tieng",
        "name": "Cao su Dầu Tiếng",
        "fullname": "Tổng Công ty Cao su Dầu Tiếng",
        "short": "Cao su Dầu Tiếng",
        "industry": "Sản xuất – Chế biến cao su",
        "industry_icon": "fa-industry",
        "tab": "san-xuat",
        "logo_ext": "png",
        "about": (
            "Công ty TNHH MTV Cao su Dầu Tiếng được thành lập từ năm 1917 – với hơn 100 "
            "năm lịch sử, là đơn vị dẫn đầu ngành cao su Việt Nam. Công ty hiện quản lý "
            "hơn 27.000 ha cao su với 3 nhà máy chế biến (Long Hòa, Phú Bình, Bến Súc), "
            "tổng công suất 47.000 tấn/năm, sản lượng thực tế trên 37.000 tấn mủ mỗi "
            "năm. Chất lượng sản phẩm đạt trên 98% tiêu chuẩn xuất khẩu, được trao nhiều "
            "giải thưởng: Sao vàng đất Việt Top 10, Cúp vàng Thương hiệu Việt, Top 20 "
            "Nhãn hiệu nổi tiếng Việt Nam và nhiều danh hiệu cao quý khác."
        ),
        "challenge": (
            "Trước đây, Cao su Dầu Tiếng đã từng triển khai phần mềm ERP khác nhưng không "
            "mang lại hiệu quả như mong muốn, đặc biệt không phù hợp với đặc thù ngành "
            "cao su: hàng nghìn lao động nông trường phân tán, quy trình khai thác – chế "
            "biến – xuất khẩu phức tạp qua nhiều đơn vị. Quy trình chốt lương nông trường "
            "mỗi tháng tốn rất nhiều thời gian và dễ phát sinh sai sót."
        ),
        "solution": (
            "Tháng 4/2019, Cao su Dầu Tiếng chọn OMEGA là đối tác tin cậy sau quá trình "
            "đánh giá kỹ lưỡng, nhờ OMEGA đã triển khai thành công cho nhiều tập đoàn lớn "
            "như SASCO, Him Lam, Vitajean, Vstar School. OMEGA.ERP được triển khai theo "
            "đặc thù ngành cao su: quản lý sản lượng khai thác từng nông trường, lệnh chế "
            "biến tại 3 nhà máy, lương lao động nông trường và kế toán toàn tổng công ty. "
            "Tháng 12/2019, hai bên chính thức nghiệm thu thành công giải pháp."
        ),
        "quote": "Quy trình chốt lương trước đây mất cả tuần, nay chỉ còn 1 ngày. Hệ thống ERP của Omega giúp chúng tôi quản lý hàng nghìn lao động nông trường và hàng trăm điểm khai thác một cách chính xác.",
        "person": "Ông Lê Quốc Minh",
        "person_title": "Phó Tổng Giám đốc – Tổng Công ty Cao su Dầu Tiếng",
        "products": ["OMEGA.ERP", "OMEGA.MM", "OMEGA.WM", "OMEGA.GL", "OMEGA.HR", "OMEGA.PR", "OMEGA.CL"],
        "results": [
            {"icon": "fa-users",      "num": "40%",  "label": "Giảm nhân lực hành chính"},
            {"icon": "fa-clock",      "num": "1 ngày", "label": "Chốt lương nông trường (giảm từ 1 tuần)"},
            {"icon": "fa-chart-line", "num": "100%",  "label": "Báo cáo quản trị real-time"},
        ],
        "seo_desc": "Tổng Công ty Cao su Dầu Tiếng triển khai OMEGA.ERP: số hóa sản xuất cao su, tiết kiệm 40% nhân lực, chốt lương nông trường từ 1 tuần → 1 ngày.",
    },
    {
        "slug": "skypec",
        "name": "SKYPEC",
        "fullname": "Công ty Xăng dầu Hàng không Việt Nam (SKYPEC)",
        "short": "SKYPEC",
        "industry": "Thương mại – Nhiên liệu hàng không",
        "industry_icon": "fa-oil-can",
        "tab": "thuong-mai",
        "logo_ext": "png",
        "about": (
            "Công ty TNHH MTV Nhiên liệu Hàng không Việt Nam (SKYPEC) được thành lập năm "
            "1993, có trụ sở tại cả 3 miền Bắc – Trung – Nam. Sau hơn 26 năm phát triển, "
            "SKYPEC là đơn vị dẫn đầu lĩnh vực cung ứng nhiên liệu hàng không tại Việt "
            "Nam: cung cấp nhiên liệu cho toàn bộ hãng bay nội địa và hơn 60 hãng hàng "
            "không quốc tế đang khai thác tại Việt Nam. Ngoài cung ứng nhiên liệu Jet A-1, "
            "SKYPEC còn kinh doanh xăng dầu, vận chuyển, pha chế, xuất nhập khẩu sản "
            "phẩm dầu mỏ và kinh doanh bất động sản, kho cảng."
        ),
        "challenge": (
            "Hoạt động cung ứng nhiên liệu hàng không tại nhiều sân bay đồng thời đòi hỏi "
            "quản lý chính xác xuất – nhập – tồn nhiên liệu tại từng điểm, đối soát hàng "
            "nghìn phiếu giao nhận với các hãng bay mỗi ngày. Quy trình làm việc giữa các "
            "phòng ban chưa được chuẩn hóa, thông tin không kế thừa lẫn nhau, báo cáo cho "
            "ban lãnh đạo không kịp thời và cần tổng hợp thủ công tốn nhiều nhân lực."
        ),
        "solution": (
            "Ngày 21/11/2018, SKYPEC và OMEGA chính thức khởi động triển khai OMEGA.ERP "
            "theo đặc thù ngành vận tải xăng dầu hàng không. SKYPEC đã chọn OMEGA sau khi "
            "đánh giá nhiều nhà cung cấp, nhờ OMEGA có kinh nghiệm triển khai thành công "
            "cho SASCO và Tập đoàn Him Lam. Ngày 12/12/2019, hai ban dự án chính thức ký "
            "nghiệm thu: OMEGA.ERP chuẩn hóa toàn bộ quy trình làm việc, các phòng ban "
            "kế thừa thông tin lẫn nhau, ban lãnh đạo có báo cáo nhanh và tức thời."
        ),
        "quote": "Sau khi triển khai Omega ERP, chúng tôi kiểm soát được toàn bộ dòng tiền và tồn kho theo thời gian thực. Ban giám đốc có thể xem báo cáo tổng hợp chỉ sau 1 cú click mà không cần chờ bộ phận kế toán tổng hợp như trước.",
        "person": "Ông Nguyễn Văn Thành",
        "person_title": "Giám đốc Tài chính – SKYPEC",
        "products": ["OMEGA.ERP", "OMEGA.WM", "OMEGA.SO", "OMEGA.PO", "OMEGA.GL", "OMEGA.MC"],
        "results": [
            {"icon": "fa-chart-line", "num": "35%",  "label": "Giảm thời gian đối soát chứng từ"},
            {"icon": "fa-warehouse",  "num": "99%",  "label": "Độ chính xác tồn kho nhiên liệu"},
            {"icon": "fa-eye",        "num": "1 click", "label": "Báo cáo tổng hợp tức thì"},
        ],
        "seo_desc": "SKYPEC – Xăng dầu Hàng không Việt Nam triển khai OMEGA.ERP: giảm 35% thời gian đối soát, độ chính xác kho 99%, báo cáo lãnh đạo real-time.",
    },
    {
        "slug": "vipharco",
        "name": "Vipharco",
        "fullname": "Công ty Cổ phần Dược phẩm Vipharco",
        "short": "Vipharco",
        "industry": "Sản xuất – Phân phối dược phẩm",
        "industry_icon": "fa-capsules",
        "tab": "y-te",
        "logo_ext": "png",
        "about": (
            "Công ty Cổ phần Dược phẩm Vipharco thành lập năm 1982, là công ty đa năng "
            "hoạt động trong lĩnh vực dược phẩm, trang thiết bị y tế, mỹ phẩm và thực "
            "phẩm dinh dưỡng. Vipharco chuyên nghiên cứu, đăng ký, marketing và phân "
            "phối các sản phẩm chất lượng cao theo tiêu chuẩn châu Âu tại thị trường Việt "
            "Nam. Hiện Vipharco là một trong những công ty dẫn đầu về nhập khẩu, sản xuất "
            "nhượng quyền và phân phối dược phẩm, trang thiết bị y tế, dược mỹ phẩm của "
            "châu Âu tại Việt Nam với chiến lược phát triển bền vững dựa trên năng lực "
            "marketing và bán hàng vượt bậc."
        ),
        "challenge": (
            "Ngành dược phẩm yêu cầu kiểm soát chặt chẽ lô – hạn dùng theo chuẩn GMP, "
            "truy xuất nguồn gốc đến từng đơn vị sản phẩm và tuân thủ quy định Bộ Y tế. "
            "Quy trình làm việc giữa các phòng ban (mua hàng – kho – bán hàng – kế toán) "
            "chưa được chuẩn hóa, thiếu hệ thống báo cáo phân tích thông minh (BI) để "
            "hỗ trợ ban lãnh đạo ra quyết định nhanh trong công tác điều hành."
        ),
        "solution": (
            "Tháng 5/2019, Vipharco và OMEGA chính thức khởi động triển khai OMEGA.ERP "
            "theo đặc thù ngành dược. Tháng 11/2019, hai bên ký nghiệm thu thành công: "
            "OMEGA.ERP chuẩn hóa toàn bộ quy trình làm việc của Vipharco, tích hợp đồng "
            "bộ mua hàng – kho – bán hàng – kế toán trên một nền tảng. Đặc biệt, hệ thống "
            "báo cáo phân tích thông minh (BI) giúp ban lãnh đạo ra quyết định nhanh "
            "trong công tác điều hành, thay thế hoàn toàn các báo cáo thủ công."
        ),
        "quote": "Kiểm kê hàng tồn kho giảm từ 2 ngày xuống chỉ còn 1.5 giờ — nhanh hơn 10 lần. Đội ngũ tư vấn của Omega hiểu rất rõ đặc thù ngành dược, từ quản lý lô hàng, hạn sử dụng đến báo cáo theo chuẩn Bộ Y tế.",
        "person": "Bà Trần Thị Hương",
        "person_title": "Trưởng phòng Kế hoạch – Vipharco",
        "products": ["OMEGA.ERP", "OMEGA.WM", "OMEGA.SO", "OMEGA.PO", "OMEGA.MM", "OMEGA.QC", "OMEGA.GL"],
        "results": [
            {"icon": "fa-shield-halved", "num": "100%",  "label": "Truy xuất nguồn gốc lô dược phẩm"},
            {"icon": "fa-boxes-stacked", "num": "28%",   "label": "Tối ưu hàng tồn kho"},
            {"icon": "fa-clock",         "num": "10×",   "label": "Tốc độ kiểm kê kho (1.5h thay vì 2 ngày)"},
        ],
        "seo_desc": "Vipharco triển khai OMEGA.ERP ngành dược: truy xuất nguồn gốc 100%, tối ưu tồn kho 28%, kiểm kê kho từ 2 ngày → 1.5 giờ.",
    },
    {
        "slug": "thanh-nam",
        "name": "Tập đoàn Thành Nam",
        "fullname": "Tập đoàn Thành Nam",
        "short": "Thành Nam",
        "industry": "Sản xuất – Kinh doanh đa ngành",
        "industry_icon": "fa-building",
        "tab": "san-xuat",
        "logo_ext": "png",
        "about": (
            "Tập đoàn Thành Nam là tập đoàn kinh tế tư nhân hoạt động đa ngành: từ sản "
            "xuất công nghiệp, xây dựng, thương mại đến bất động sản. Với nhiều công ty "
            "thành viên hoạt động song song, Thành Nam đặt ra yêu cầu cao về tích hợp "
            "thông tin quản trị tập đoàn, đồng bộ hóa quy trình giữa các đơn vị thành "
            "viên và báo cáo hợp nhất cho ban lãnh đạo cấp cao."
        ),
        "challenge": (
            "Thành Nam từng trải qua nhiều lần triển khai ERP thất bại với các nhà cung "
            "cấp khác nhau. Vấn đề chính là phần mềm không phù hợp với đặc thù đa ngành, "
            "thiếu khả năng tùy chỉnh theo nghiệp vụ cụ thể của từng công ty thành viên, "
            "và không có sự đồng hành bài bản từ đơn vị tư vấn triển khai."
        ),
        "solution": (
            "OMEGA.ERP được tiếp cận theo phương pháp tư vấn nghiệp vụ chuyên sâu — "
            "phân tích quy trình từng công ty thành viên trước khi cấu hình hệ thống. "
            "Nền tảng đa đơn vị của OMEGA.ERP cho phép mỗi công ty thành viên vận hành "
            "độc lập nhưng số liệu được hợp nhất tập đoàn tức thì. Từ sản xuất – kho – "
            "mua bán đến kế toán tài chính, tất cả chạy trên một hệ thống thống nhất."
        ),
        "quote": "Sau 3 lần triển khai ERP thất bại với các nhà cung cấp khác, OMEGA.ERP đã vận hành đồng bộ từ sản xuất, kho vận đến kế toán. Đây là lần đầu tiên chúng tôi thực sự kiểm soát được toàn bộ hệ thống.",
        "person": "Ông Cường",
        "person_title": "Tổng Giám đốc – Tập đoàn Thành Nam",
        "products": ["OMEGA.ERP", "OMEGA.MM", "OMEGA.WM", "OMEGA.SO", "OMEGA.PO", "OMEGA.GL", "OMEGA.HR", "OMEGA.CL"],
        "results": [
            {"icon": "fa-rotate",      "num": "1 nền tảng", "label": "Tích hợp toàn bộ công ty thành viên"},
            {"icon": "fa-cubes",       "num": "3 lần",  "label": "Thất bại ERP trước → thành công với Omega"},
            {"icon": "fa-chart-pie",   "num": "100%",   "label": "Báo cáo hợp nhất tập đoàn real-time"},
        ],
        "seo_desc": "Tập đoàn Thành Nam triển khai thành công OMEGA.ERP sau nhiều lần thất bại: đồng bộ đa ngành, hợp nhất tập đoàn real-time.",
    },
    {
        "slug": "truecare",
        "name": "Truecare",
        "fullname": "Truecare – Phân phối thiết bị y tế",
        "short": "Truecare",
        "industry": "Phân phối thiết bị y tế",
        "industry_icon": "fa-stethoscope",
        "tab": "y-te",
        "logo_ext": "png",
        "about": (
            "Truecare là doanh nghiệp chuyên phân phối thiết bị y tế, vật tư tiêu hao và "
            "hóa chất xét nghiệm cho hệ thống bệnh viện và phòng khám trên toàn quốc. "
            "Với danh mục hàng nghìn mặt hàng thiết bị y tế đòi hỏi quản lý nghiêm ngặt "
            "về lô số, serial number, hạn dùng và hồ sơ bảo hành, Truecare cần một hệ "
            "thống ERP chuyên biệt cho ngành y tế."
        ),
        "challenge": (
            "Phân phối thiết bị y tế đòi hỏi truy xuất nguồn gốc chính xác đến từng serial "
            "number, quản lý hạn dùng nghiêm ngặt tránh xuất nhầm hàng hết hạn, và theo "
            "dõi bảo hành sau bán cho từng thiết bị. Đồng thời, yêu cầu tuân thủ quy định "
            "quản lý trang thiết bị y tế của Bộ Y tế ngày càng chặt chẽ hơn."
        ),
        "solution": (
            "OMEGA.ERP được cấu hình đặc biệt cho ngành thiết bị y tế: quản lý kho theo "
            "lô số và serial number, cảnh báo tự động hàng sắp hết hạn, phong tỏa xuất "
            "kho hàng quá hạn, tích hợp hồ sơ bảo hành theo từng thiết bị. Kế toán và "
            "báo cáo tài chính đồng bộ toàn hệ thống phân phối theo thời gian thực."
        ),
        "quote": None,
        "person": None,
        "person_title": None,
        "products": ["OMEGA.ERP", "OMEGA.WM", "OMEGA.SO", "OMEGA.PO", "OMEGA.GL", "OMEGA.QC"],
        "results": [
            {"icon": "fa-barcode",    "num": "100%",   "label": "Truy xuất theo serial & lô số y tế"},
            {"icon": "fa-warehouse",  "num": "0 sai sót", "label": "Xuất nhầm hàng hết hạn"},
            {"icon": "fa-file-invoice-dollar", "num": "Realtime", "label": "Kế toán đồng bộ toàn hệ thống"},
        ],
        "seo_desc": "Truecare triển khai OMEGA.ERP thiết bị y tế: quản lý kho theo serial – lô số hạn dùng, đồng bộ kế toán và báo cáo toàn hệ thống phân phối.",
    },
    {
        "slug": "nam-thai-son",
        "name": "Nam Thái Sơn",
        "fullname": "Công ty CP XNK Nam Thái Sơn",
        "short": "Nam Thái Sơn",
        "industry": "Xuất nhập khẩu – Thương mại",
        "industry_icon": "fa-ship",
        "tab": "thuong-mai",
        "logo_ext": "png",
        "about": (
            "Công ty Cổ phần Xuất Nhập Khẩu Nam Thái Sơn là doanh nghiệp XNK đa ngành "
            "với lịch sử hoạt động lâu dài trong lĩnh vực thương mại quốc tế. Công ty "
            "thực hiện các hoạt động xuất nhập khẩu hàng hóa đa dạng, quản lý chuỗi "
            "cung ứng từ nguồn hàng nước ngoài đến phân phối trong nước, đòi hỏi hệ "
            "thống ERP có khả năng xử lý nghiệp vụ ngoại thương phức tạp."
        ),
        "challenge": (
            "Nghiệp vụ XNK phức tạp với nhiều loại chứng từ thông quan, quản lý hợp đồng "
            "ngoại thương, theo dõi L/C, tỷ giá ngoại tệ và chi phí nhập khẩu (thuế, "
            "phí, vận chuyển). Đồng thời cần tích hợp với hệ thống kế toán theo chuẩn "
            "VAS và báo cáo quản trị đa chiều cho ban lãnh đạo."
        ),
        "solution": (
            "OMEGA.ERP được triển khai toàn diện từ quản lý hợp đồng XNK, theo dõi lô "
            "hàng nhập khẩu, phân bổ chi phí nhập khẩu vào giá vốn hàng tồn kho, đến "
            "quản lý kho, bán hàng và kế toán tài chính theo chuẩn VAS. Báo cáo quản "
            "trị đa chiều giúp lãnh đạo kiểm soát toàn bộ hoạt động XNK theo thời gian thực."
        ),
        "quote": "ERP không chỉ là phần mềm mà còn là giải pháp quản trị gắn liền với sự đồng hành lâu dài của Omega.",
        "person": "Ông Vân",
        "person_title": "Phó Tổng Giám đốc – Công ty CP XNK Nam Thái Sơn",
        "products": ["OMEGA.ERP", "OMEGA.WM", "OMEGA.SO", "OMEGA.PO", "OMEGA.GL", "OMEGA.MC"],
        "results": [
            {"icon": "fa-rotate",    "num": "1 hệ thống", "label": "Tích hợp toàn bộ chuỗi XNK"},
            {"icon": "fa-chart-bar", "num": "Realtime",   "label": "Báo cáo quản trị tức thì"},
            {"icon": "fa-handshake", "num": "10+năm",     "label": "Đồng hành lâu dài cùng Omega"},
        ],
        "seo_desc": "Nam Thái Sơn triển khai OMEGA.ERP XNK: tích hợp ngoại thương – kho – kế toán, báo cáo quản trị real-time, đồng hành chiến lược lâu dài.",
    },
    {
        "slug": "lidovit",
        "name": "Lidovit",
        "fullname": "Lidovit – Dược phẩm & Thực phẩm chức năng",
        "short": "Lidovit",
        "industry": "Dược phẩm – Thực phẩm chức năng",
        "industry_icon": "fa-pills",
        "tab": "y-te",
        "logo_ext": "png",
        "about": (
            "Lidovit là doanh nghiệp hoạt động trong lĩnh vực sản xuất và phân phối dược "
            "phẩm, thực phẩm chức năng và mỹ phẩm tại Việt Nam. Với mạng lưới phân phối "
            "rộng khắp trên toàn quốc qua nhiều kênh: nhà thuốc, phòng khám, siêu thị và "
            "thương mại điện tử, Lidovit cần hệ thống quản lý đa kênh bền vững và linh hoạt."
        ),
        "challenge": (
            "Quản lý đồng thời nhiều dòng sản phẩm (dược phẩm, TPCN, mỹ phẩm) với các "
            "quy định riêng về lô số, hạn dùng, số đăng ký theo chuẩn GMP. Hệ thống phân "
            "phối đa kênh cần theo dõi công nợ, hạn mức tín dụng từng đại lý, và tồn kho "
            "tối ưu cho hàng có hạn sử dụng ngắn."
        ),
        "solution": (
            "OMEGA.ERP cấu hình đa dòng sản phẩm với quy tắc lô số và hạn dùng riêng, "
            "phân quyền bán hàng theo kênh phân phối, quản lý công nợ và hạn mức tín dụng "
            "tự động. Kho được quản lý FEFO (First Expired First Out) đảm bảo hàng gần "
            "hết hạn được xuất trước. Báo cáo doanh số theo kênh, theo nhân viên kinh "
            "doanh được cập nhật thời gian thực."
        ),
        "quote": None,
        "person": None,
        "person_title": None,
        "products": ["OMEGA.ERP", "OMEGA.WM", "OMEGA.SO", "OMEGA.MM", "OMEGA.GL", "OMEGA.QC", "OMEGA.CRM"],
        "results": [
            {"icon": "fa-pills",    "num": "FEFO",    "label": "Xuất kho theo hạn dùng, giảm hàng hết date"},
            {"icon": "fa-truck",    "num": "Đa kênh", "label": "Phân phối đồng bộ toàn quốc"},
            {"icon": "fa-calculator", "num": "Auto",  "label": "Kiểm soát công nợ & tín dụng đại lý"},
        ],
        "seo_desc": "Lidovit triển khai OMEGA.ERP: quản lý lô số hạn dùng chuẩn GMP, xuất kho FEFO, tối ưu phân phối dược phẩm đa kênh toàn quốc.",
    },
    {
        "slug": "hoa-an",
        "name": "Hoa An",
        "fullname": "Hoa An",
        "short": "Hoa An",
        "industry": "Thương mại",
        "industry_icon": "fa-store",
        "tab": "thuong-mai",
        "logo_ext": "jpg",
        "about": (
            "Hoa An là doanh nghiệp thương mại hoạt động trong lĩnh vực mua bán và phân "
            "phối hàng hóa, với hệ thống khách hàng và đại lý trên nhiều tỉnh thành. "
            "Doanh nghiệp cần kiểm soát chặt chẽ quá trình bán hàng, công nợ khách hàng "
            "và báo cáo tài chính nhằm đảm bảo dòng tiền lành mạnh và tăng trưởng bền vững."
        ),
        "challenge": (
            "Quản lý công nợ hàng trăm khách hàng, theo dõi đơn hàng và trạng thái giao "
            "hàng thủ công dễ dẫn đến sai sót, chậm thu hồi công nợ và không nắm bắt "
            "được tình hình tài chính kịp thời để ra quyết định kinh doanh."
        ),
        "solution": (
            "OMEGA.ERP tích hợp bán hàng – kho – kế toán trên một nền tảng: từ đặt hàng, "
            "xử lý đơn, xuất kho đến thu tiền và ghi nhận kế toán tự động. Báo cáo công "
            "nợ theo tuổi nợ, cảnh báo khách hàng vượt hạn mức, và bảng cân đối tài "
            "chính real-time giúp lãnh đạo kiểm soát dòng tiền hiệu quả."
        ),
        "quote": None,
        "person": None,
        "person_title": None,
        "products": ["OMEGA.ERP", "OMEGA.SO", "OMEGA.WM", "OMEGA.GL", "OMEGA.CRM"],
        "results": [
            {"icon": "fa-tags",         "num": "Auto",    "label": "Xử lý đơn hàng – xuất kho tự động"},
            {"icon": "fa-file-invoice", "num": "Realtime","label": "Báo cáo công nợ & tài chính"},
            {"icon": "fa-chart-line",   "num": "Tăng",    "label": "Hiệu quả thu hồi công nợ"},
        ],
        "seo_desc": "Hoa An triển khai OMEGA.ERP thương mại: tự động hóa bán hàng – kho – kế toán, kiểm soát công nợ và báo cáo tài chính real-time.",
    },
    {
        "slug": "sasco",
        "name": "SASCO",
        "fullname": "Công ty CP Dịch vụ Hàng không Sân bay Tân Sơn Nhất (SASCO)",
        "short": "SASCO",
        "industry": "Dịch vụ – Thương mại hàng không",
        "industry_icon": "fa-plane",
        "tab": "dich-vu",
        "logo_ext": "png",
        "about": (
            "SASCO (Saigon Airport Service Company) – Công ty CP Dịch vụ Hàng không Sân "
            "bay Tân Sơn Nhất là doanh nghiệp kinh doanh dịch vụ thương mại và bán lẻ "
            "tại sân bay quốc tế Tân Sơn Nhất, bao gồm hệ thống cửa hàng miễn thuế, "
            "nhà hàng, dịch vụ phòng chờ và các tiện ích hàng không. SASCO phục vụ hàng "
            "triệu lượt hành khách quốc nội và quốc tế mỗi năm."
        ),
        "challenge": (
            "Mô hình kinh doanh hàng không đòi hỏi quản lý đồng thời nhiều loại hình dịch "
            "vụ (duty-free, F&B, lounge), nhiều đơn vị kinh doanh, với yêu cầu báo cáo "
            "doanh thu theo ca, theo điểm bán và kiểm soát hàng tồn kho duty-free theo "
            "đúng quy định hải quan."
        ),
        "solution": (
            "OMEGA.ERP được triển khai với cấu hình đa đơn vị kinh doanh: quản lý kho "
            "duty-free theo lô hàng nhập khẩu, tích hợp POS tại các điểm bán, quản lý "
            "nhân sự theo ca làm việc, tài chính hợp nhất toàn tập đoàn. Báo cáo doanh "
            "thu theo điểm bán, theo sản phẩm và theo ca giúp ban quản lý tối ưu hiệu "
            "quả kinh doanh tại từng vị trí trong sân bay."
        ),
        "quote": None,
        "person": None,
        "person_title": None,
        "products": ["OMEGA.ERP", "OMEGA.WM", "OMEGA.SO", "OMEGA.GL", "OMEGA.HR", "OMEGA.CRM", "OMEGA.CL"],
        "results": [
            {"icon": "fa-plane",      "num": "Đa điểm", "label": "Quản lý kho duty-free & điểm bán sân bay"},
            {"icon": "fa-users-gear", "num": "Tự động", "label": "Nhân sự ca & lương đồng bộ"},
            {"icon": "fa-chart-pie",  "num": "Realtime","label": "Doanh thu hợp nhất tức thì"},
        ],
        "seo_desc": "SASCO triển khai OMEGA.ERP: quản lý duty-free, POS, nhân sự ca và tài chính hợp nhất tại sân bay quốc tế Tân Sơn Nhất.",
    },
    {
        "slug": "lyprodan",
        "name": "Lyprodan",
        "fullname": "Lyprodan",
        "short": "Lyprodan",
        "industry": "Phân phối thương mại",
        "industry_icon": "fa-truck",
        "tab": "thuong-mai",
        "logo_ext": "png",
        "about": (
            "Lyprodan là doanh nghiệp phân phối hàng hóa thương mại với mạng lưới đại lý "
            "và khách hàng rộng khắp. Hoạt động phân phối đa tầng đòi hỏi quản lý chặt "
            "chẽ đơn hàng từ nhiều kênh, theo dõi giao hàng, kiểm soát công nợ và tối "
            "ưu dòng tiền trong suốt chuỗi phân phối."
        ),
        "challenge": (
            "Quản lý hàng trăm đại lý với các mức giá, chiết khấu và hạn mức tín dụng "
            "khác nhau; theo dõi tình trạng đơn hàng, giao hàng và thu tiền trên diện "
            "rộng mà không có hệ thống tích hợp dẫn đến chậm trễ và thất thoát thông tin."
        ),
        "solution": (
            "OMEGA.ERP tích hợp quản lý đại lý – đơn hàng – kho – công nợ – kế toán trên "
            "một nền tảng. Chính sách giá, chiết khấu theo từng nhóm khách hàng được cấu "
            "hình linh hoạt. Báo cáo doanh thu theo đại lý, theo khu vực và phân tích "
            "dòng tiền theo tuần/tháng giúp ban lãnh đạo điều phối nguồn lực hiệu quả."
        ),
        "quote": None,
        "person": None,
        "person_title": None,
        "products": ["OMEGA.ERP", "OMEGA.SO", "OMEGA.WM", "OMEGA.PO", "OMEGA.GL", "OMEGA.CRM"],
        "results": [
            {"icon": "fa-network-wired", "num": "Tự động", "label": "Quản lý đại lý & chính sách giá"},
            {"icon": "fa-cart-shopping", "num": "Realtime","label": "Theo dõi đơn hàng & giao hàng"},
            {"icon": "fa-money-bill-wave","num": "Tối ưu", "label": "Dòng tiền toàn chuỗi phân phối"},
        ],
        "seo_desc": "Lyprodan triển khai OMEGA.ERP phân phối: quản lý đại lý – đơn hàng – công nợ – kế toán tích hợp, tối ưu dòng tiền toàn chuỗi.",
    },
    {
        "slug": "trieu-phu-loc",
        "name": "Triều Phú Lộc",
        "fullname": "Công ty TNHH TM DV XD SX Triều Phú Lộc",
        "short": "Triều Phú Lộc",
        "industry": "Sản xuất – Xây dựng – Thương mại",
        "industry_icon": "fa-gears",
        "tab": "san-xuat",
        "logo_ext": "png",
        "about": (
            "Công ty TNHH Thương Mại Dịch Vụ Xây Dựng Sản Xuất Triều Phú Lộc hoạt động "
            "trong lĩnh vực sản xuất công nghiệp, xây dựng và thương mại. Với quy mô hoạt "
            "động đa lĩnh vực, công ty đặt ra yêu cầu cao về quản lý lệnh sản xuất, "
            "nguyên vật liệu đầu vào, giá thành sản phẩm và kiểm soát chi phí toàn diện."
        ),
        "challenge": (
            "Quản lý đồng thời nhiều dự án sản xuất và xây dựng với nguyên vật liệu đa "
            "dạng, định mức tiêu hao khác nhau cho từng sản phẩm. Tính giá thành sản phẩm "
            "chính xác và kiểm soát chi phí vượt định mức là thách thức lớn khi quản lý "
            "thủ công trên bảng tính."
        ),
        "solution": (
            "OMEGA.ERP triển khai mô-đun sản xuất (OMEGA.MM) với định mức BOM chi tiết "
            "cho từng sản phẩm, lệnh sản xuất tự động điều phối nguyên vật liệu từ kho, "
            "tính giá thành theo phương pháp thực tế và so sánh với định mức. OMEGA.PC "
            "quản lý giá thành sản phẩm tích hợp với kế toán, đảm bảo số liệu nhất quán "
            "và phản ánh đúng chi phí thực tế sản xuất."
        ),
        "quote": None,
        "person": None,
        "person_title": None,
        "products": ["OMEGA.ERP", "OMEGA.MM", "OMEGA.WM", "OMEGA.PC", "OMEGA.GL", "OMEGA.QC"],
        "results": [
            {"icon": "fa-gears",     "num": "Auto",    "label": "Lệnh sản xuất & cấp phát NVL tự động"},
            {"icon": "fa-coins",     "num": "Chính xác","label": "Giá thành sản phẩm thực tế vs định mức"},
            {"icon": "fa-chart-bar", "num": "Realtime","label": "Báo cáo chi phí sản xuất theo lệnh"},
        ],
        "seo_desc": "Triều Phú Lộc triển khai OMEGA.ERP sản xuất – xây dựng: quản lý lệnh sản xuất, BOM định mức, giá thành thực tế và kiểm soát chi phí hiệu quả.",
    },
    {
        "slug": "tien-trien",
        "name": "Tiến Triển",
        "fullname": "Tiến Triển",
        "short": "Tiến Triển",
        "industry": "Sản xuất & Thương mại",
        "industry_icon": "fa-industry",
        "tab": "san-xuat",
        "logo_ext": "png",
        "about": (
            "Tiến Triển là doanh nghiệp hoạt động trong lĩnh vực sản xuất và thương mại, "
            "với quy trình sản xuất nhiều công đoạn và hệ thống phân phối hàng hóa đến "
            "các đại lý và khách hàng doanh nghiệp. Mục tiêu của Tiến Triển là số hóa "
            "toàn bộ chuỗi giá trị từ sản xuất đến bán hàng trên một nền tảng thống nhất."
        ),
        "challenge": (
            "Quản lý song song cả sản xuất và thương mại trên các hệ thống rời rạc dẫn "
            "đến thông tin không nhất quán giữa kho sản xuất và kho thương mại, khó theo "
            "dõi tình trạng tồn kho thực tế và tối ưu kế hoạch sản xuất theo nhu cầu bán hàng."
        ),
        "solution": (
            "OMEGA.ERP tích hợp toàn bộ từ lập kế hoạch sản xuất theo đơn hàng bán, "
            "quản lý nguyên liệu – bán thành phẩm – thành phẩm trong một hệ thống kho "
            "thống nhất, đến bán hàng và kế toán. Thông tin đồng bộ real-time giúp "
            "bộ phận kinh doanh nắm bắt tình trạng tồn kho để xác nhận đơn hàng nhanh chóng."
        ),
        "quote": None,
        "person": None,
        "person_title": None,
        "products": ["OMEGA.ERP", "OMEGA.MM", "OMEGA.WM", "OMEGA.SO", "OMEGA.PO", "OMEGA.GL"],
        "results": [
            {"icon": "fa-rotate",    "num": "Tích hợp","label": "Sản xuất – kho – bán hàng đồng bộ"},
            {"icon": "fa-warehouse", "num": "Realtime","label": "Tồn kho thực tế tức thì"},
            {"icon": "fa-chart-line","num": "Tăng",    "label": "Hiệu quả vận hành toàn chuỗi giá trị"},
        ],
        "seo_desc": "Tiến Triển triển khai OMEGA.ERP: số hóa sản xuất – kho – bán hàng trên một nền tảng, tối ưu tồn kho và nâng cao hiệu quả vận hành.",
    },
    {
        "slug": "vitajean",
        "name": "Vitajean",
        "fullname": "Vitajean",
        "short": "Vitajean",
        "industry": "Sản xuất dệt may – Jeans xuất khẩu",
        "industry_icon": "fa-shirt",
        "tab": "san-xuat",
        "logo_ext": "png",
        "about": (
            "Vitajean là doanh nghiệp chuyên sản xuất hàng may mặc denim và jeans xuất "
            "khẩu, phục vụ các thị trường khó tính tại châu Âu và Mỹ. Quy trình sản xuất "
            "may mặc trải qua nhiều công đoạn gia công phức tạp (cắt – may – wash – hoàn "
            "thiện), đòi hỏi quản lý nguyên phụ liệu chặt chẽ và kiểm soát chất lượng "
            "tại từng công đoạn theo tiêu chuẩn xuất khẩu quốc tế."
        ),
        "challenge": (
            "Quản lý định mức nguyên phụ liệu dệt may phức tạp (vải, chỉ, khóa, cúc, "
            "nhãn mác) cho hàng trăm mã hàng khác nhau. Kiểm soát tiến độ sản xuất theo "
            "từng công đoạn gia công, phân tích tỷ lệ lỗi và báo cáo QC theo lô hàng "
            "xuất khẩu là yêu cầu thiết yếu để đáp ứng cam kết với khách hàng nước ngoài."
        ),
        "solution": (
            "OMEGA.ERP – OMEGA.MM được cấu hình riêng cho ngành dệt may: BOM chi tiết "
            "theo mã hàng, quản lý nguyên phụ liệu theo màu – size – lô nhập, lệnh cắt "
            "tự động tính định mức vải, kiểm soát QC tại từng công đoạn may. Báo cáo "
            "tiến độ sản xuất theo đơn hàng xuất khẩu, tỷ lệ hàng lỗi và hiệu suất "
            "dây chuyền giúp quản lý nhà máy ra quyết định điều phối kịp thời."
        ),
        "quote": None,
        "person": None,
        "person_title": None,
        "products": ["OMEGA.ERP", "OMEGA.MM", "OMEGA.WM", "OMEGA.QC", "OMEGA.SO", "OMEGA.GL"],
        "results": [
            {"icon": "fa-shirt",        "num": "Chi tiết","label": "BOM & định mức NPL theo mã hàng may mặc"},
            {"icon": "fa-list-check",   "num": "100%",   "label": "QC kiểm soát từng công đoạn sản xuất"},
            {"icon": "fa-boxes-stacked","num": "Giảm",   "label": "Tỷ lệ sai lỗi & lãng phí nguyên liệu"},
        ],
        "seo_desc": "Vitajean triển khai OMEGA.ERP dệt may: BOM định mức NPL denim–jeans, QC từng công đoạn, kiểm soát tiến độ đơn hàng xuất khẩu.",
    },
    {
        "slug": "vstarschool",
        "name": "Vstar School",
        "fullname": "Vstar School – Hệ thống giáo dục",
        "short": "Vstar School",
        "industry": "Giáo dục",
        "industry_icon": "fa-graduation-cap",
        "tab": "dich-vu",
        "logo_ext": "png",
        "about": (
            "Vstar School là hệ thống trường học tư thục chất lượng cao với nhiều cơ sở "
            "đào tạo. Nhà trường triển khai mô hình giáo dục hiện đại, đòi hỏi hệ thống "
            "quản lý đồng bộ từ tuyển sinh, quản lý học sinh, lịch học, điểm số đến "
            "quản lý giáo viên, nhân sự và tài chính học phí trên toàn hệ thống."
        ),
        "challenge": (
            "Quản lý thủ công học sinh – lịch học – học phí trên nhiều cơ sở dẫn đến "
            "thiếu nhất quán thông tin, khó tổng hợp báo cáo toàn trường, và lãng phí "
            "thời gian của bộ phận hành chính. Đặc biệt, việc đồng bộ thông tin học sinh "
            "và học phí giữa bộ phận giáo vụ và kế toán thường xuyên chậm trễ."
        ),
        "solution": (
            "OMEGA.EDU kết hợp OMEGA.ERP tạo nền tảng quản lý giáo dục toàn diện: tuyển "
            "sinh – quản lý hồ sơ học sinh – lịch học – điểm số – học phí đồng bộ với "
            "kế toán. OMEGA.HR quản lý giáo viên và nhân sự, OMEGA.PR tính lương tự động "
            "theo cơ cấu phức tạp của giáo dục. Dashboard tổng hợp cho ban giám hiệu "
            "theo dõi tình hình toàn hệ thống trường học real-time."
        ),
        "quote": None,
        "person": None,
        "person_title": None,
        "products": ["OMEGA.ERP", "OMEGA.EDU", "OMEGA.HR", "OMEGA.PR", "OMEGA.GL", "OMEGA.CRM"],
        "results": [
            {"icon": "fa-graduation-cap","num": "Tự động","label": "Quản lý học sinh – lịch học – điểm số"},
            {"icon": "fa-users-gear",    "num": "Đồng bộ","label": "Nhân sự giáo viên & lương toàn trường"},
            {"icon": "fa-money-bill-wave","num": "Realtime","label": "Học phí tích hợp kế toán tức thì"},
        ],
        "seo_desc": "Vstar School triển khai OMEGA.EDU & OMEGA.ERP: quản lý học sinh – lịch học – học phí – giáo viên trên một nền tảng giáo dục tích hợp.",
    },
    {
        "slug": "earth-corp",
        "name": "Earth Corp",
        "fullname": "Earth Corp",
        "short": "Earth Corp",
        "industry": "Sản xuất công nghiệp",
        "industry_icon": "fa-industry",
        "tab": "san-xuat",
        "logo_ext": "png",
        "about": (
            "Earth Corp là tập đoàn sản xuất công nghiệp với quy mô lớn, hoạt động trong "
            "nhiều lĩnh vực sản xuất đa dạng. Với chuỗi giá trị từ nguyên liệu đầu vào "
            "đến thành phẩm xuất xưởng, Earth Corp đặt ra yêu cầu cao về quản trị sản "
            "xuất, kiểm soát chất lượng và báo cáo hiệu quả hoạt động cấp tập đoàn."
        ),
        "challenge": (
            "Quản lý chuỗi sản xuất phức tạp trải dài nhiều nhà máy, tích hợp thông tin "
            "sản xuất – kho – tài chính theo thời gian thực là thách thức lớn khi hệ "
            "thống thông tin rời rạc. Ban lãnh đạo tập đoàn cần dashboard tổng hợp để "
            "điều hành hiệu quả trên quy mô lớn."
        ),
        "solution": (
            "OMEGA.ERP triển khai mô hình đa nhà máy: mỗi nhà máy quản lý sản xuất độc "
            "lập nhưng dữ liệu hợp nhất tập đoàn tức thì. Dashboard quản trị cấp tập "
            "đoàn hiển thị KPI sản xuất, tồn kho, doanh thu và chi phí theo thời gian "
            "thực. Tích hợp với hệ thống MES tại xưởng để thu thập dữ liệu sản xuất tự động."
        ),
        "quote": None,
        "person": None,
        "person_title": None,
        "products": ["OMEGA.ERP", "OMEGA.MM", "OMEGA.WM", "OMEGA.GL", "OMEGA.MC", "OMEGA.HR", "OMEGA.CL"],
        "results": [
            {"icon": "fa-layer-group","num": "Đa nhà máy","label": "Quản lý chuỗi sản xuất tập đoàn"},
            {"icon": "fa-chart-pie",  "num": "Realtime",  "label": "Dashboard KPI sản xuất cấp tập đoàn"},
            {"icon": "fa-warehouse",  "num": "Tối ưu",    "label": "Kho vận & tồn kho liên nhà máy"},
        ],
        "seo_desc": "Earth Corp triển khai OMEGA.ERP: quản lý đa nhà máy, chuỗi sản xuất công nghiệp và dashboard KPI tập đoàn real-time.",
    },
    {
        "slug": "hanel",
        "name": "Hanel",
        "fullname": "Hanel – Tập đoàn Công nghệ & Điện tử",
        "short": "Hanel",
        "industry": "Phân phối – Công nghệ điện tử",
        "industry_icon": "fa-microchip",
        "tab": "thuong-mai",
        "logo_ext": "png",
        "about": (
            "Hanel là tập đoàn công nghệ và điện tử hàng đầu Hà Nội, hoạt động trong "
            "lĩnh vực phân phối, sản xuất và dịch vụ điện tử – công nghệ thông tin. "
            "Với hàng nghìn SKU sản phẩm điện tử từ các thương hiệu lớn, mạng lưới đại "
            "lý phủ khắp miền Bắc, Hanel đặt yêu cầu cao về quản lý kho hàng chính xác "
            "và hệ thống đại lý hiệu quả."
        ),
        "challenge": (
            "Phân phối hàng điện tử với serial number riêng cho từng thiết bị, quản lý "
            "bảo hành, theo dõi hàng trả về và bảo hành từng đơn vị sản phẩm. Mạng lưới "
            "đại lý đa tầng với chính sách giá, chiết khấu khác nhau cần quản lý linh "
            "hoạt và không bị nhầm lẫn."
        ),
        "solution": (
            "OMEGA.ERP quản lý kho điện tử theo serial number từng thiết bị, tích hợp "
            "bảo hành sau bán theo từng serial, quản lý hàng trả lại và sửa chữa. Hệ "
            "thống đại lý đa cấp được quản lý với chính sách giá linh hoạt, hạn mức "
            "tín dụng và báo cáo hiệu suất bán hàng từng đại lý real-time."
        ),
        "quote": None,
        "person": None,
        "person_title": None,
        "products": ["OMEGA.ERP", "OMEGA.WM", "OMEGA.SO", "OMEGA.PO", "OMEGA.GL", "OMEGA.CRM"],
        "results": [
            {"icon": "fa-microchip",     "num": "Serial",  "label": "Quản lý kho điện tử theo serial number"},
            {"icon": "fa-network-wired", "num": "Đa cấp",  "label": "Hệ thống đại lý & chính sách giá linh hoạt"},
            {"icon": "fa-wrench",        "num": "Tích hợp","label": "Bảo hành sau bán theo từng thiết bị"},
        ],
        "seo_desc": "Hanel triển khai OMEGA.ERP phân phối điện tử: quản lý kho serial number, hệ thống đại lý đa cấp và bảo hành sau bán tích hợp.",
    },
    {
        "slug": "mitsubishi",
        "name": "Mitsubishi",
        "fullname": "Mitsubishi – Phân phối thiết bị & máy móc tại Việt Nam",
        "short": "Mitsubishi",
        "industry": "Phân phối – Thiết bị công nghiệp",
        "industry_icon": "fa-plug",
        "tab": "thuong-mai",
        "logo_ext": "png",
        "about": (
            "Đơn vị phân phối chính thức thiết bị và máy móc công nghiệp Mitsubishi tại "
            "Việt Nam, bao gồm thiết bị điện, tự động hóa, điều hòa không khí và các "
            "dòng sản phẩm công nghiệp khác. Với hệ thống đại lý phủ khắp cả nước và "
            "kho phụ tùng dự phòng cho dịch vụ bảo hành, yêu cầu quản trị rất cao về "
            "độ chính xác tồn kho và quy trình dịch vụ sau bán."
        ),
        "challenge": (
            "Phân phối thiết bị kỹ thuật cao đòi hỏi quản lý hàng nghìn mã phụ tùng "
            "thay thế, theo dõi bảo hành theo số serial thiết bị, lập lịch bảo trì định "
            "kỳ và xử lý phiếu yêu cầu dịch vụ (service ticket) từ hệ thống đại lý. "
            "Báo cáo doanh số theo dòng sản phẩm, theo vùng địa lý là yêu cầu thường xuyên."
        ),
        "solution": (
            "OMEGA.ERP quản lý kho phụ tùng theo serial và mã phụ tùng, tích hợp quy "
            "trình bảo hành và bảo trì sau bán. Hệ thống đại lý được quản lý với báo "
            "cáo doanh số real-time, phân tích hiệu suất theo vùng. OMEGA.CRM theo dõi "
            "lịch sử khách hàng, hỗ trợ sau bán và quản lý hợp đồng bảo trì dài hạn."
        ),
        "quote": None,
        "person": None,
        "person_title": None,
        "products": ["OMEGA.ERP", "OMEGA.WM", "OMEGA.SO", "OMEGA.PO", "OMEGA.GL", "OMEGA.CRM"],
        "results": [
            {"icon": "fa-plug",       "num": "Chính xác","label": "Kho phụ tùng & serial thiết bị"},
            {"icon": "fa-wrench",     "num": "Theo dõi", "label": "Bảo hành, bảo trì sau bán tích hợp"},
            {"icon": "fa-chart-bar",  "num": "Realtime", "label": "Doanh số theo dòng sản phẩm & vùng"},
        ],
        "seo_desc": "Mitsubishi Vietnam triển khai OMEGA.ERP: quản lý kho phụ tùng, bảo hành sau bán và báo cáo doanh số hệ thống phân phối thiết bị công nghiệp.",
    },
    {
        "slug": "him-lam",
        "name": "Him Lam",
        "fullname": "Tập đoàn Him Lam",
        "short": "Him Lam",
        "industry": "Đầu tư – Phát triển bất động sản",
        "industry_icon": "fa-building-columns",
        "tab": "dich-vu",
        "logo_ext": "png",
        "about": (
            "Tập đoàn Him Lam là một trong những tập đoàn tư nhân lớn nhất Việt Nam, "
            "hoạt động chủ yếu trong lĩnh vực đầu tư và phát triển bất động sản, với "
            "danh mục dự án đa dạng từ nhà ở, khu đô thị đến bất động sản thương mại "
            "và khu công nghiệp tại TP.HCM và nhiều tỉnh thành. Him Lam cũng tham gia "
            "các lĩnh vực tài chính, hàng không và dịch vụ."
        ),
        "challenge": (
            "Tập đoàn đa ngành với hàng chục công ty thành viên cần hệ thống quản trị "
            "thống nhất: quản lý dự án bất động sản, tiến độ thi công, dòng tiền đầu tư, "
            "nhân sự quy mô lớn và báo cáo hợp nhất tập đoàn theo chuẩn tài chính quốc tế."
        ),
        "solution": (
            "OMEGA.ERP triển khai theo mô hình holding: mỗi công ty thành viên quản lý "
            "tài chính, nhân sự độc lập; OMEGA.CL hợp nhất báo cáo tài chính toàn tập "
            "đoàn. Quản lý dự án BĐS theo từng phase đầu tư, theo dõi chi phí và dòng "
            "tiền từng dự án. OMEGA.HR quản lý nhân sự quy mô lớn với cấu trúc lương "
            "và phúc lợi phức tạp theo từng đơn vị thành viên."
        ),
        "quote": None,
        "person": None,
        "person_title": None,
        "products": ["OMEGA.ERP", "OMEGA.GL", "OMEGA.HR", "OMEGA.PR", "OMEGA.MC", "OMEGA.CL"],
        "results": [
            {"icon": "fa-building",   "num": "Đa dự án","label": "Quản lý danh mục & tiến độ BĐS"},
            {"icon": "fa-users-gear", "num": "Tập đoàn","label": "Nhân sự & lương đồng bộ toàn hệ thống"},
            {"icon": "fa-landmark",   "num": "Hợp nhất","label": "Báo cáo tài chính tập đoàn chuẩn quốc tế"},
        ],
        "seo_desc": "Tập đoàn Him Lam triển khai OMEGA.ERP: quản lý dự án BĐS, tài chính hợp nhất tập đoàn và nhân sự quy mô lớn theo chuẩn quốc tế.",
    },
    {
        "slug": "stdt",
        "name": "STDT",
        "fullname": "STDT – Sản xuất công nghiệp",
        "short": "STDT",
        "industry": "Sản xuất công nghiệp",
        "industry_icon": "fa-gears",
        "tab": "san-xuat",
        "logo_ext": "png",
        "about": (
            "STDT là doanh nghiệp sản xuất công nghiệp với quy trình sản xuất phức tạp "
            "đòi hỏi quản lý chặt chẽ nguyên liệu, bán thành phẩm và thành phẩm qua "
            "nhiều công đoạn. Mục tiêu của STDT là tối ưu năng lực vận hành nhà máy, "
            "giảm lãng phí và kiểm soát chi phí sản xuất để nâng cao sức cạnh tranh."
        ),
        "challenge": (
            "Quản lý sản xuất thủ công với hàng trăm lệnh sản xuất mỗi tháng, khó kiểm "
            "soát tồn kho bán thành phẩm tại các công đoạn, và tính giá thành sản phẩm "
            "chính xác theo phương pháp thực tế là những thách thức chính cần giải quyết."
        ),
        "solution": (
            "OMEGA.ERP – OMEGA.MM cung cấp quy trình sản xuất khép kín: từ lập kế hoạch "
            "sản xuất, phát lệnh, cấp phát nguyên liệu, theo dõi tiến độ từng công đoạn "
            "đến nghiệm thu và nhập kho thành phẩm. Chi phí sản xuất được tính tự động "
            "theo phương pháp thực tế, so sánh với định mức để kiểm soát lãng phí hiệu quả."
        ),
        "quote": None,
        "person": None,
        "person_title": None,
        "products": ["OMEGA.ERP", "OMEGA.MM", "OMEGA.WM", "OMEGA.PC", "OMEGA.QC", "OMEGA.GL"],
        "results": [
            {"icon": "fa-gears",      "num": "Tự động","label": "Lệnh sản xuất & cấp phát nguyên liệu"},
            {"icon": "fa-coins",      "num": "Chính xác","label": "Giá thành thực tế vs định mức"},
            {"icon": "fa-chart-line", "num": "Giảm",   "label": "Lãng phí & chi phí sản xuất dư thừa"},
        ],
        "seo_desc": "STDT triển khai OMEGA.ERP sản xuất công nghiệp: quản lý lệnh sản xuất, kiểm soát chi phí thực tế và tối ưu năng lực vận hành nhà máy.",
    },
]

# ── Sinh HTML ─────────────────────────────────────────────────────────────────
def make_results_html(results):
    items = ""
    for r in results:
        items += f"""
              <div class="cp-result-item wow fadeInUp">
                <div class="cp-result-icon"><i class="fa-solid {r['icon']}"></i></div>
                <div class="cp-result-body">
                  <div class="cp-result-num">{r['num']}</div>
                  <div class="cp-result-label">{r['label']}</div>
                </div>
              </div>"""
    return items

def make_products_html(products):
    items = ""
    for p in products:
        items += f'<span class="cp-product-tag"><i class="fa-solid fa-check"></i> {p}</span>\n              '
    return items.strip()

def make_quote_html(c):
    if not c.get("quote"):
        return ""
    person_html = ""
    if c.get("person"):
        initial = c["person"][0] if c["person"] else "?"
        person_html = f"""
              <div class="cp-quote-author">
                <div class="cp-quote-avatar">{initial}</div>
                <div>
                  <div class="cp-quote-name">{c['person']}</div>
                  <div class="cp-quote-title">{c.get('person_title', '')}</div>
                </div>
              </div>"""
    return f"""
  <!-- ═══ QUOTE ═══ -->
  <section class="cp-quote-wrap">
    <div class="container">
      <div class="cp-quote-card wow fadeInUp">
        <i class="fa-solid fa-quote-left cp-q-icon"></i>
        <p class="cp-q-text">"{c['quote']}"</p>{person_html}
      </div>
    </div>
  </section>
  <!-- ═══ /QUOTE ═══ -->
"""

def make_page(c, header_html, footer_html):
    date_str      = datetime.today().strftime("%Y-%m-%d")
    results_html  = make_results_html(c["results"])
    products_html = make_products_html(c["products"])
    quote_html    = make_quote_html(c)
    logo_src      = f"assets/omega-media/khach-hang/{c['slug']}.{c['logo_ext']}"

    # Điều chỉnh nav active: khach-hang.html đã có class active đúng
    # Thêm ký hiệu breadcrumb cho trang con
    page_header_html = f"""  <!-- ============ PAGE HEADER ============ -->
  <section class="page-header">
    <canvas class="page-canvas" data-canvas-type="star-network"></canvas>
    <div class="page-header-overlay"></div>
    <div class="container">
      <nav aria-label="breadcrumb">
        <ol class="breadcrumb mb-3">
          <li class="breadcrumb-item"><a href="index.html">Trang chủ</a></li>
          <li class="breadcrumb-item"><a href="khach-hang.html">Khách hàng tiêu biểu</a></li>
          <li class="breadcrumb-item active" aria-current="page">{c['name']}</li>
        </ol>
      </nav>
      <h1 class="wow fadeInUp">{c['fullname']}</h1>
      <p class="wow fadeInUp" data-wow-delay="0.15s">{c['industry']} – Triển khai thành công Omega ERP</p>
    </div>
  </section>
  <!-- ============ /PAGE HEADER ============ -->"""

    return f"""<!DOCTYPE html>
<html lang="vi" prefix="og: https://ogp.me/ns#">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <!--
    base href="../" → mọi path tương đối (CSS, JS, ảnh, nav link) resolve
    về thư mục gốc dự án, không cần sửa header/footer trích từ khach-hang.html
  -->
  <base href="../">

  <!-- SEO Meta -->
  <title>{c['name']} – Khách hàng tiêu biểu | OMEGA ERP</title>
  <meta name="description" content="{c['seo_desc']}">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
  <link rel="canonical" href="https://omega.com.vn/khach-hang/{c['slug']}.html">

  <!-- Open Graph -->
  <meta property="og:type" content="article">
  <meta property="og:locale" content="vi_VN">
  <meta property="og:site_name" content="OMEGA">
  <meta property="og:title" content="{c['name']} – Case Study OMEGA ERP | {c['industry']}">
  <meta property="og:description" content="{c['seo_desc']}">
  <meta property="og:url" content="https://omega.com.vn/khach-hang/{c['slug']}.html">
  <meta property="og:image" content="https://omega.com.vn/assets/logo-png/omega-3B-square-trans-product.png">
  <meta property="og:image:width" content="3200">
  <meta property="og:image:height" content="3200">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{c['name']} – Case Study OMEGA ERP">
  <meta name="twitter:description" content="{c['seo_desc']}">
  <meta name="twitter:image" content="https://omega.com.vn/assets/logo-png/omega-3B-square-trans-product.png">

  <!-- Favicon -->
  <link rel="icon" type="image/x-icon" href="assets/images/favicon.ico">
  <link rel="apple-touch-icon" sizes="180x180" href="assets/images/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="32x32" href="assets/images/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="assets/images/favicon-16x16.png">
  <link rel="manifest" href="assets/images/site.webmanifest">

  <!-- Preconnect -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">

  <!-- CSS (path resolve qua base href) -->
  <link rel="stylesheet" href="assets/css/bootstrap.min.css">
  <link rel="stylesheet" href="assets/css/all.min.css">
  <link rel="stylesheet" href="assets/css/animate.css">
  <link rel="stylesheet" href="assets/css/swiper-bundle.min.css">
  <link rel="stylesheet" href="assets/css/slicknav.min.css">
  <link rel="stylesheet" href="assets/css/magnific-popup.css">
  <link rel="stylesheet" href="assets/css/omega.css">

  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">
  {{
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": "{c['name']} – Case study triển khai OMEGA ERP | {c['industry']}",
    "description": "{c['seo_desc']}",
    "url": "https://omega.com.vn/khach-hang/{c['slug']}.html",
    "dateModified": "{date_str}",
    "publisher": {{
      "@type": "Organization",
      "name": "OMEGA",
      "url": "https://omega.com.vn",
      "logo": {{"@type": "ImageObject", "url": "https://omega.com.vn/assets/logo-png/omega-3B-square-trans-product.png"}}
    }},
    "about": {{
      "@type": "Organization",
      "name": "{c['fullname']}",
      "description": "{c['seo_desc']}"
    }}
  }}
  </script>

  <style>
    /* ═══════════════════════════════════════════════════
       Customer Profile Page – inline styles
       (bổ sung trên nền omega.css)
    ═══════════════════════════════════════════════════ */

    /* ── Intro card (logo + tên + ngành) ── */
    .cp-intro {{
      display: flex; align-items: center; gap: 28px;
      background: #fff; border-radius: 16px;
      padding: 28px 32px; margin-top: -40px; position: relative; z-index: 2;
      box-shadow: 0 8px 40px rgba(0,0,0,0.14);
      border: 1px solid #e8f5ee;
      max-width: 720px;
    }}
    .cp-logo-wrap {{
      width: 110px; height: 72px; flex-shrink: 0;
      background: #f5f5f5; border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      padding: 8px; border: 1px solid #eee;
      overflow: hidden;
    }}
    .cp-logo-wrap img {{ max-width: 100%; max-height: 100%; object-fit: contain; }}
    .cp-logo-wrap .fa-building {{ font-size: 32px; color: #bbb; }}
    .cp-company-name {{ font-size: clamp(18px,2.5vw,24px); font-weight: 800; color: #0d1b2a; line-height: 1.25; margin-bottom: 8px; }}
    .cp-industry-tag {{
      display: inline-flex; align-items: center; gap: 6px;
      background: rgba(0,166,81,0.1); color: #00A651;
      font-size: 13px; font-weight: 700;
      padding: 5px 14px; border-radius: 50px;
    }}

    /* ── Section: Giới thiệu ── */
    .cp-section {{ padding: 56px 0; }}
    .cp-section + .cp-section {{ padding-top: 0; }}
    .cp-section.bg-light {{ background: var(--bg-light, #f8fdf9); }}
    .cp-section.bg-dark {{ background: linear-gradient(135deg,#0d2a15,#1a4a22); }}

    .cp-three-col {{
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px; margin-top: 32px;
    }}
    .cp-info-card {{
      background: #fff; border-radius: 14px;
      border: 1px solid #e8f5ee;
      padding: 28px 24px;
      box-shadow: 0 2px 16px rgba(0,0,0,0.05);
    }}
    .cp-info-card .ci-label {{
      font-size: 12px; font-weight: 700; text-transform: uppercase;
      letter-spacing: 1px; color: #00A651; margin-bottom: 10px;
      display: flex; align-items: center; gap: 6px;
    }}
    .cp-info-card p {{ font-size: 15px; color: #444; line-height: 1.75; margin: 0; }}

    /* ── Kết quả (stat cards) ── */
    .cp-results-grid {{
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px; margin-top: 32px;
    }}
    .cp-result-item {{
      background: #fff; border-radius: 14px; padding: 28px 20px;
      box-shadow: 0 4px 20px rgba(0,0,0,0.07); border: 1px solid #f0f0f0;
      display: flex; align-items: center; gap: 18px;
      transition: transform 0.3s, box-shadow 0.3s;
    }}
    .cp-result-item:hover {{ transform: translateY(-5px); box-shadow: 0 12px 32px rgba(0,166,81,0.13); }}
    .cp-result-icon {{
      width: 52px; height: 52px; border-radius: 12px; flex-shrink: 0;
      background: linear-gradient(135deg,#00A651,#7ed957);
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-size: 20px;
    }}
    .cp-result-num {{ font-size: 22px; font-weight: 900; color: #0d1b2a; line-height: 1; }}
    .cp-result-label {{ font-size: 13px; color: #666; margin-top: 3px; line-height: 1.4; }}

    /* ── Quote ── */
    .cp-quote-wrap {{ padding: 64px 0; background: linear-gradient(135deg,#0d2a15,#1a4a22); }}
    .cp-quote-card {{ max-width: 800px; margin: 0 auto; text-align: center; }}
    .cp-q-icon {{ font-size: 52px; color: rgba(126,217,87,0.35); margin-bottom: 20px; display: block; }}
    .cp-q-text {{
      font-size: clamp(17px,2.2vw,22px); color: #fff;
      font-style: italic; line-height: 1.8; margin-bottom: 28px;
    }}
    .cp-quote-author {{
      display: inline-flex; align-items: center; gap: 14px;
      background: rgba(255,255,255,0.08); border-radius: 50px;
      padding: 10px 20px 10px 10px;
    }}
    .cp-quote-avatar {{
      width: 48px; height: 48px; border-radius: 50%; flex-shrink: 0;
      background: linear-gradient(135deg,#00A651,#7ed957);
      display: flex; align-items: center; justify-content: center;
      color: #fff; font-weight: 700; font-size: 18px;
    }}
    .cp-quote-name {{ font-weight: 700; color: #fff; text-align: left; font-size: 14px; }}
    .cp-quote-title {{ font-size: 12px; color: rgba(255,255,255,0.6); text-align: left; }}

    /* ── Products ── */
    .cp-products-wrap {{ display: flex; flex-wrap: wrap; gap: 10px; margin-top: 24px; }}
    .cp-product-tag {{
      display: inline-flex; align-items: center; gap: 8px;
      background: #fff; border: 1.5px solid #c8e8d8;
      color: #0d1b2a; font-size: 14px; font-weight: 700;
      padding: 9px 18px; border-radius: 50px;
      box-shadow: 0 2px 8px rgba(0,166,81,0.07);
      transition: border-color 0.2s, box-shadow 0.2s;
    }}
    .cp-product-tag:hover {{ border-color: #00A651; box-shadow: 0 4px 14px rgba(0,166,81,0.15); }}
    .cp-product-tag i {{ color: #00A651; font-size: 12px; }}

    /* ── Responsive ── */
    @media (max-width: 767px) {{
      .cp-intro {{ flex-direction: column; align-items: flex-start; margin-top: -24px; padding: 20px; }}
      .cp-three-col {{ grid-template-columns: 1fr; }}
      .cp-results-grid {{ grid-template-columns: 1fr 1fr; }}
    }}
    @media (max-width: 480px) {{
      .cp-results-grid {{ grid-template-columns: 1fr; }}
    }}
  </style>
</head>
<body>

  <!-- ============ PRELOADER ============ -->
  <div class="preloader">
    <div class="preloader-inner">
      <img src="assets/images/omega-radar-sonar.svg" alt="Omega" class="preloader-logo">
    </div>
  </div>

  {header_html}

  {page_header_html}

  <!-- ============ INTRO CARD ============ -->
  <section class="section-gap" style="padding-bottom:0;">
    <div class="container">
      <div class="cp-intro wow fadeInUp">
        <div class="cp-logo-wrap">
          <img src="{logo_src}" alt="{c['name']}"
               onerror="this.style.display='none';this.parentElement.innerHTML='<i class=\\'fa-solid fa-building\\'></i>'">
        </div>
        <div>
          <div class="cp-company-name">{c['fullname']}</div>
          <span class="cp-industry-tag"><i class="fa-solid {c['industry_icon']}"></i> {c['industry']}</span>
        </div>
      </div>
    </div>
  </section>
  <!-- ============ /INTRO CARD ============ -->

  <!-- ============ GIỚI THIỆU / THÁCH THỨC / GIẢI PHÁP ============ -->
  <section class="cp-section section-gap">
    <div class="container">
      <div class="section-title wow fadeInUp">
        <span class="label"><i class="fa-solid fa-building"></i> Hồ sơ khách hàng</span>
        <h2>{c['name']} &amp; <span>Omega ERP</span></h2>
      </div>
      <div class="cp-three-col">
        <div class="cp-info-card wow fadeInUp" data-wow-delay="0.05s">
          <div class="ci-label"><i class="fa-solid fa-circle-info"></i> Giới thiệu</div>
          <p>{c['about']}</p>
        </div>
        <div class="cp-info-card wow fadeInUp" data-wow-delay="0.15s">
          <div class="ci-label"><i class="fa-solid fa-triangle-exclamation"></i> Thách thức</div>
          <p>{c['challenge']}</p>
        </div>
        <div class="cp-info-card wow fadeInUp" data-wow-delay="0.25s">
          <div class="ci-label"><i class="fa-solid fa-lightbulb"></i> Giải pháp Omega</div>
          <p>{c['solution']}</p>
        </div>
      </div>
    </div>
  </section>
  <!-- ============ /GIỚI THIỆU ============ -->

  <!-- ============ KẾT QUẢ ============ -->
  <section class="cp-section bg-light">
    <div class="container">
      <div class="section-title centered wow fadeInUp">
        <span class="label"><i class="fa-solid fa-chart-line"></i> Kết quả đạt được</span>
        <h2>Những thay đổi <span>thực chất</span></h2>
        <p>Kết quả đo lường được sau khi triển khai Omega ERP tại {c['short']}.</p>
      </div>
      <div class="cp-results-grid">{results_html}
      </div>
    </div>
  </section>
  <!-- ============ /KẾT QUẢ ============ -->

{quote_html}
  <!-- ============ SẢN PHẨM SỬ DỤNG ============ -->
  <section class="cp-section">
    <div class="container">
      <div class="section-title wow fadeInUp">
        <span class="label"><i class="fa-solid fa-cubes"></i> Giải pháp đã triển khai</span>
        <h2>Sản phẩm &amp; phân hệ <span>đang sử dụng</span></h2>
        <p>Các mô-đun Omega ERP được cấu hình phù hợp với đặc thù ngành {c['industry'].split('–')[0].strip()}.</p>
      </div>
      <div class="cp-products-wrap wow fadeInUp" data-wow-delay="0.1s">
        {products_html}
      </div>
    </div>
  </section>
  <!-- ============ /SẢN PHẨM ============ -->

  <!-- ============ CTA ============ -->
  <section class="cta-section">
    <div class="container position-relative" style="z-index:1;">
      <div class="row align-items-center gy-4">
        <div class="col-lg-7 wow fadeInLeft">
          <div class="section-title mb-0">
            <h2 style="color:#fff;font-size:clamp(22px,3.2vw,38px);">Doanh nghiệp bạn cũng muốn<br><strong>kết quả tương tự?</strong></h2>
            <p style="color:rgba(255,255,255,0.85);">Liên hệ Omega để được tư vấn miễn phí và nhận đề xuất giải pháp ERP phù hợp với đặc thù ngành của bạn.</p>
          </div>
        </div>
        <div class="col-lg-5 text-lg-end wow fadeInRight">
          <a href="lien-he.html" class="btn-white-omega me-3">
            <i class="fa-solid fa-paper-plane"></i> Tư vấn miễn phí
          </a>
          <a href="khach-hang.html" class="btn-red-omega">
            <i class="fa-solid fa-arrow-left"></i> Xem khách hàng khác
          </a>
        </div>
      </div>
    </div>
  </section>
  <!-- ============ /CTA ============ -->

  {footer_html}

  <!-- Back to top -->
  <a href="javascript:void(0)" id="back-to-top"
     onclick="window.scrollTo({{top:0,behavior:'smooth'}})"
     style="position:fixed;bottom:24px;right:24px;width:44px;height:44px;border-radius:50%;background:var(--gradient-green);color:#fff;display:flex;align-items:center;justify-content:center;font-size:16px;z-index:999;opacity:0;transition:opacity 0.3s;box-shadow:0 4px 16px rgba(0,166,81,0.4);"
     aria-label="Lên đầu trang">
    <i class="fa-solid fa-chevron-up"></i>
  </a>
  <style>#back-to-top.show{{opacity:1;}}</style>

  <!-- JS (path resolve qua base href="../") -->
  <script src="assets/js/jquery-3.7.1.min.js"></script>
  <script src="assets/js/bootstrap.min.js"></script>
  <script src="assets/js/swiper-bundle.min.js"></script>
  <script src="assets/js/wow.min.js"></script>
  <script src="assets/js/jquery.waypoints.min.js"></script>
  <script src="assets/js/jquery.counterup.min.js"></script>
  <script src="assets/js/jquery.magnific-popup.min.js"></script>
  <script src="assets/js/jquery.slicknav.js"></script>
  <script src="assets/js/omega.js"></script>
</body>
</html>
"""

# ── Main ──────────────────────────────────────────────────────────────────────
def generate_customer_pages():
    print(f"  Đọc header/footer từ {SOURCE_PAGE.name} ...")
    header_html, footer_html = load_source_blocks()
    print(f"  → Header: {len(header_html)} ký tự | Footer: {len(footer_html)} ký tự")

    count = 0
    for c in CUSTOMERS:
        page = make_page(c, header_html, footer_html)
        outfile = OUTPUT_DIR / f"{c['slug']}.html"
        outfile.write_text(page, encoding="utf-8")
        print(f"  ✅  {outfile.name}")
        count += 1
    print(f"\n✅ Đã sinh {count} trang khách hàng → {OUTPUT_DIR}")

if __name__ == "__main__":
    generate_customer_pages()
