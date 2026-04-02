"""
================================================================================
gen_sync_header.py — Đồng bộ header, search overlay, CSS utils và
                     translate script từ index.html sang tất cả trang gốc.
================================================================================
MỤC ĐÍCH:
  index.html là nguồn chuẩn (canonical) cho:
    1. Master menu (mega-menu desktop + SlickNav mobile)  → HEADER block
    2. Search overlay                                     → SEARCH OVERLAY block
    3. CSS navbar-utils + translate dropdown              → NAVBAR UTILS CSS block
    4. Google Translate lazy-loader script                → TRANSLATE SCRIPT block
    5. Widget liên hệ xoay vòng                          → lazinet-contact-floating

  Script đọc 5 thành phần trên từ index.html và ghi đè / chèn vào
  8 trang đồng cấp, đồng thời set class "active" đúng nav link mỗi trang.

CÁCH CHẠY:
  cd D:\\Dev_SW\\projects\\omega
  python auto-omega/gen_sync_header.py

  Hoặc chạy qua run_all.py để thực thi tất cả scripts cùng lúc.

CẬP NHẬT KHI NÀO?
  - Thay đổi nav links / mega-menu trong index.html
  - Thêm / bớt nút trong navbar-utils (search, translate, ...)
  - Sửa Google Translate script hoặc CSS dropdown
  - Thay đổi widget floating contact
  → Chạy lại script này hoặc run_all.py

COMMENT MARKERS (đều nằm trong index.html):
  <!-- ============ HEADER ============ -->           → <!-- ============ /HEADER ============ -->
  <!-- ============ SEARCH OVERLAY ============ -->   → <!-- ============ /SEARCH OVERLAY ============ -->
  <!-- ============ NAVBAR UTILS CSS ============ --> → <!-- ============ /NAVBAR UTILS CSS ============ -->
  <!-- ============ TRANSLATE SCRIPT ============ --> → <!-- ============ /TRANSLATE SCRIPT ============ -->
  <!-- FLOATING CONTACT BUTTONS ... </div> trước </body>
================================================================================
"""

from pathlib import Path

# ── Cấu hình ──────────────────────────────────────────────────────────────────
PROJECT_ROOT = Path(__file__).parent.parent
SOURCE_FILE  = PROJECT_ROOT / "index.html"

TARGET_FILES = [
    "ve-omega.html",
    "giai-phap.html",
    "san-pham.html",
    "dich-vu.html",
    "khach-hang.html",
    "tin-tuc.html",
    "lien-he.html",
    "chinh-sach-bao-mat.html",
]

# Nav link được highlight active theo từng trang
ACTIVE_NAV = {
    "ve-omega.html":           "ve-omega.html",
    "giai-phap.html":          "giai-phap.html",
    "san-pham.html":           "san-pham.html",
    "dich-vu.html":            "dich-vu.html",
    "khach-hang.html":         "khach-hang.html",
    "tin-tuc.html":            "tin-tuc.html",
    "lien-he.html":            "lien-he.html",
    "chinh-sach-bao-mat.html": None,
}

# ── Comment markers ───────────────────────────────────────────────────────────
HEADER_START    = "<!-- ============ HEADER ============ -->"
HEADER_END      = "<!-- ============ /HEADER ============ -->"
SEARCH_START    = "<!-- ============ SEARCH OVERLAY ============ -->"
SEARCH_END      = "<!-- ============ /SEARCH OVERLAY ============ -->"
CSS_START       = "<!-- ============ NAVBAR UTILS CSS ============ -->"
CSS_END         = "<!-- ============ /NAVBAR UTILS CSS ============ -->"
TRANSLATE_START = "<!-- ============ TRANSLATE SCRIPT ============ -->"
TRANSLATE_END   = "<!-- ============ /TRANSLATE SCRIPT ============ -->"
FLOAT_MARKER    = "<!-- FLOATING CONTACT BUTTONS"

# ── Helpers ───────────────────────────────────────────────────────────────────
def extract_block(html: str, start: str, end: str) -> str | None:
    s = html.find(start)
    e = html.find(end)
    if s == -1 or e == -1:
        return None
    return html[s : e + len(end)]

def extract_floating(html: str) -> str | None:
    s = html.find(FLOAT_MARKER)
    if s == -1:
        return None
    body_pos = html.find("</body>", s)
    if body_pos == -1:
        return None
    e = html.rfind("</div>", s, body_pos)
    if e == -1:
        return None
    return html[s : e + len("</div>")]

def apply_active_nav(header_html: str, active_href: str | None) -> str:
    """Thêm class active vào đúng nav-link top-level (count=1 → chỉ lần đầu)."""
    if not active_href:
        return header_html
    old = f'class="nav-link" href="{active_href}"'
    new = f'class="nav-link active" href="{active_href}"'
    return header_html.replace(old, new, 1)

def replace_or_insert_before(html: str, start_marker: str, end_marker: str,
                              new_block: str, insert_before: str) -> tuple[str, str]:
    """
    Nếu block đã tồn tại (có cả start & end marker): thay toàn bộ.
    Nếu chưa: chèn new_block ngay trước insert_before.
    Trả về (html_mới, action_string).
    """
    if start_marker in html and end_marker in html:
        old = extract_block(html, start_marker, end_marker)
        return html.replace(old, new_block, 1), "replaced"
    else:
        return html.replace(insert_before, new_block + "\n  " + insert_before, 1), "inserted"

# ── Xử lý từng trang ─────────────────────────────────────────────────────────
def sync_page(fpath: Path, canon: dict, active_href: str | None):
    html = fpath.read_text(encoding="utf-8")
    log  = []

    # 1. HEADER ─────────────────────────────────────────────────────────────
    if HEADER_START in html and HEADER_END in html:
        old = extract_block(html, HEADER_START, HEADER_END)
        new = apply_active_nav(canon["header"], active_href)
        html = html.replace(old, new, 1)
        log.append("header")
    else:
        print(f"    [WARN] Thiếu HEADER markers trong {fpath.name}")

    # 2. SEARCH OVERLAY ─────────────────────────────────────────────────────
    html, action = replace_or_insert_before(
        html, SEARCH_START, SEARCH_END,
        canon["search"], HEADER_END + "\n\n  " + canon["search"]
    )
    # Nếu đã replace, action = "replaced"; nếu insert thì block được chèn sau HEADER_END
    if SEARCH_START not in html:
        # fallback: chèn ngay sau HEADER_END
        html = html.replace(HEADER_END, HEADER_END + "\n\n  " + canon["search"], 1)
    log.append(f"search({action})" if action else "search(replaced)")

    # 3. NAVBAR UTILS CSS ───────────────────────────────────────────────────
    if CSS_START in html and CSS_END in html:
        old = extract_block(html, CSS_START, CSS_END)
        html = html.replace(old, canon["css"], 1)
        log.append("css(replaced)")
    else:
        # Tìm <style> block đơn giản đang có (thường là #back-to-top.show...)
        # và thay bằng block đầy đủ; nếu không có thì chèn trước <!-- JS -->
        simple_style_start = html.find("<style>")
        simple_style_end   = html.find("</style>", simple_style_start)
        if simple_style_start != -1 and simple_style_end != -1:
            old_style = html[simple_style_start : simple_style_end + len("</style>")]
            # Chỉ thay nếu là style block nhỏ (không phải <style> lớn hơn)
            if len(old_style) < 500:
                html = html.replace(old_style, canon["css"], 1)
                log.append("css(replaced-simple)")
            else:
                html = html.replace("  <!-- JS -->", canon["css"] + "\n\n  <!-- JS -->", 1)
                log.append("css(inserted-before-js)")
        else:
            html = html.replace("  <!-- JS -->", canon["css"] + "\n\n  <!-- JS -->", 1)
            log.append("css(inserted-before-js)")

    # 4. TRANSLATE SCRIPT ───────────────────────────────────────────────────
    if TRANSLATE_START in html and TRANSLATE_END in html:
        old = extract_block(html, TRANSLATE_START, TRANSLATE_END)
        html = html.replace(old, canon["translate"], 1)
        log.append("translate(replaced)")
    else:
        # Chèn ngay trước floating contact comment
        if FLOAT_MARKER in html:
            html = html.replace(
                "  " + FLOAT_MARKER,
                canon["translate"] + "\n  " + FLOAT_MARKER,
                1
            )
        else:
            html = html.replace("</body>", canon["translate"] + "\n</body>", 1)
        log.append("translate(inserted)")

    # 5. FLOATING CONTACT ───────────────────────────────────────────────────
    if FLOAT_MARKER in html:
        body_pos  = html.find("</body>")
        old_start = html.find(FLOAT_MARKER)
        old_end   = html.rfind("</div>", old_start, body_pos) + len("</div>")
        old_block = html[old_start:old_end]
        html = html.replace(old_block, canon["float"], 1)
        log.append("floating(replaced)")
    else:
        html = html.replace("</body>", "  " + canon["float"] + "\n</body>", 1)
        log.append("floating(inserted)")

    fpath.write_text(html, encoding="utf-8")
    print(f"  ✅ {fpath.name:<30} [{', '.join(log)}]")

# ── Main ──────────────────────────────────────────────────────────────────────
def sync_all_headers():
    source = SOURCE_FILE.read_text(encoding="utf-8")

    canon = {
        "header":    extract_block(source, HEADER_START, HEADER_END),
        "search":    extract_block(source, SEARCH_START, SEARCH_END),
        "css":       extract_block(source, CSS_START, CSS_END),
        "translate": extract_block(source, TRANSLATE_START, TRANSLATE_END),
        "float":     extract_floating(source),
    }

    for key, val in canon.items():
        if val is None:
            print(f"[ERROR] Không tìm thấy block '{key}' trong index.html")
            return

    print(f"📋 header:     {len(canon['header']):>6} chars")
    print(f"🔍 search:     {len(canon['search']):>6} chars")
    print(f"🎨 css:        {len(canon['css']):>6} chars")
    print(f"🌐 translate:  {len(canon['translate']):>6} chars")
    print(f"📞 floating:   {len(canon['float']):>6} chars")
    print()

    ok = 0
    for fname in TARGET_FILES:
        fpath = PROJECT_ROOT / fname
        if not fpath.exists():
            print(f"  [SKIP] {fname} không tồn tại")
            continue
        sync_page(fpath, canon, ACTIVE_NAV.get(fname))
        ok += 1

    print(f"\n✅ Đồng bộ hoàn tất — {ok}/{len(TARGET_FILES)} trang")

if __name__ == "__main__":
    sync_all_headers()
