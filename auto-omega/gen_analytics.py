"""
================================================================================
gen_analytics.py — Inject analytics + preloader CSS vào tất cả trang HTML
================================================================================
MỤC ĐÍCH:
  Đảm bảo mọi trang .html trong dự án đều có:
  1. Analytics tracking (GA4 + Microsoft Clarity)
  2. Inline preloader CSS — ngăn FOUC (Flash of Unstyled Content) khi mạng chậm

NGUỒN CHUẨN:
  index.html — ANALYTICS block được bao bởi:
    <!-- ============ ANALYTICS ============ -->
    <!-- ============ /ANALYTICS ============ -->

  PRELOADER CSS — hardcoded trong script này (fixed optimization, không thay đổi).
  Đặt ngay sau ANALYTICS block để load trước CSS external.

CÁCH CHẠY:
  cd D:\\Dev_SW\\projects\\omega
  python auto-omega/gen_analytics.py

  Hoặc qua run_all.py (chạy đầu tiên trong pipeline).

BỎ QUA:
  - intro-omega.html (iframe nội bộ)
  - File đã có marker và nội dung giống hệt (idempotent)

THÊM CÔNG CỤ ANALYTICS MỚI:
  Chỉ cần thêm script vào block ANALYTICS trong index.html, rồi chạy lại.
================================================================================
"""

from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
SOURCE_FILE  = PROJECT_ROOT / "index.html"

# ── Markers ────────────────────────────────────────────────────────────────────
ANALYTICS_START   = "<!-- ============ ANALYTICS ============ -->"
ANALYTICS_END     = "<!-- ============ /ANALYTICS ============ -->"

PRELOADER_START   = "<!-- ============ PRELOADER CSS ============ -->"
PRELOADER_END     = "<!-- ============ /PRELOADER CSS ============ -->"

# Canonical preloader block — inline CSS ngăn FOUC khi omega.css chưa load kịp.
# Màu #0d5c38 = giá trị thực của --dark-bg (CSS variable không resolve được trước khi
# omega.css load → preloader trong suốt → HTML thô lộ ra trên mạng chậm).
PRELOADER_BLOCK = """\
<!-- ============ PRELOADER CSS ============ -->
<style>
  /* Inline preloader — ngăn FOUC: render ngay trước khi omega.css load xong */
  .preloader{position:fixed;inset:0;z-index:99999;background:#0d5c38;display:flex;align-items:center;justify-content:center;transition:opacity .6s ease,visibility .6s ease;}
  .preloader.hide{opacity:0;visibility:hidden;pointer-events:none;}
  .preloader-inner{display:flex;flex-direction:column;align-items:center;gap:16px;}
  .preloader-logo{width:120px;animation:pulse-logo 2s ease-in-out infinite;}
  @keyframes pulse-logo{0%,100%{opacity:1;transform:scale(1);}50%{opacity:.7;transform:scale(.95);}}
</style>
<!-- ============ /PRELOADER CSS ============ -->"""

# Bỏ qua những file này
SKIP_FILES = {"intro-omega.html"}

# ── Helpers ────────────────────────────────────────────────────────────────────
def extract_analytics_block(source_html: str) -> str | None:
    s = source_html.find(ANALYTICS_START)
    e = source_html.find(ANALYTICS_END)
    if s == -1 or e == -1:
        return None
    return source_html[s : e + len(ANALYTICS_END)]


def _inject_block(html: str, start_marker: str, end_marker: str,
                  canonical: str, fpath: Path) -> str | None:
    """
    Inject/update một block có marker vào html string.
    Trả về html mới nếu có thay đổi, None nếu không đổi gì.
    """
    if start_marker in html and end_marker in html:
        s = html.find(start_marker)
        e = html.find(end_marker) + len(end_marker)
        if html[s:e] == canonical:
            return None           # nội dung giống hệt → skip
        return html[:s] + canonical + html[e:]

    # Chưa có → chèn sau ANALYTICS_END (nếu có), hoặc sau <head>
    if ANALYTICS_END in html:
        pos = html.find(ANALYTICS_END) + len(ANALYTICS_END)
        return html[:pos] + "\n  " + canonical + html[pos:]

    head_end = html.find(">", html.lower().find("<head"))
    if head_end == -1:
        return None
    return html[:head_end + 1] + "\n  " + canonical + html[head_end + 1:]


def inject_into_file(fpath: Path, analytics_block: str) -> str:
    """
    Inject cả ANALYTICS và PRELOADER CSS vào một file.
    Trả về: 'skipped' | 'updated' | 'injected' | 'no-head'
    """
    if fpath.name in SKIP_FILES:
        return "skipped"

    html = fpath.read_text(encoding="utf-8")
    original = html
    changed = False

    # 1. Analytics block
    new_html = _inject_block(html, ANALYTICS_START, ANALYTICS_END,
                              analytics_block, fpath)
    if new_html is not None:
        html = new_html
        changed = True

    # 2. Preloader CSS block
    new_html = _inject_block(html, PRELOADER_START, PRELOADER_END,
                              PRELOADER_BLOCK, fpath)
    if new_html is not None:
        html = new_html
        changed = True

    if not changed:
        return "skipped"

    # Phân biệt injected (file chưa có markers) vs updated (đã có nhưng nội dung khác)
    was_injected = (ANALYTICS_START not in original or PRELOADER_START not in original)
    fpath.write_text(html, encoding="utf-8")
    return "injected" if was_injected else "updated"


# ── Main ───────────────────────────────────────────────────────────────────────
def generate_analytics():
    source_html     = SOURCE_FILE.read_text(encoding="utf-8")
    analytics_block = extract_analytics_block(source_html)

    if not analytics_block:
        print("[ERROR] Không tìm thấy ANALYTICS block trong index.html")
        return

    print(f"📊 Analytics block:   {len(analytics_block)} chars")
    print(f"🎨 Preloader CSS:     {len(PRELOADER_BLOCK)} chars")
    print()

    # Quét tất cả .html (bao gồm index.html — cần inject preloader CSS vào đó cũng)
    all_html = sorted(PROJECT_ROOT.rglob("*.html"))

    # index.html: chỉ inject preloader CSS (analytics block đã có sẵn, là nguồn)
    # Các file khác: inject cả hai
    analytics_for_index = source_html  # dùng để kiểm tra, không ghi lại

    stats = {"injected": 0, "updated": 0, "skipped": 0, "no-head": 0}

    for fpath in all_html:
        if fpath == SOURCE_FILE:
            # index.html: chỉ xử lý preloader CSS
            if fpath.name in SKIP_FILES:
                continue
            html = fpath.read_text(encoding="utf-8")
            new_html = _inject_block(html, PRELOADER_START, PRELOADER_END,
                                     PRELOADER_BLOCK, fpath)
            if new_html is None:
                stats["skipped"] += 1
            else:
                fpath.write_text(new_html, encoding="utf-8")
                was_new = PRELOADER_START not in html
                result = "injected" if was_new else "updated"
                stats[result] += 1
                icon = "✅" if was_new else "🔄"
                print(f"  {icon} index.html")
            continue

        result = inject_into_file(fpath, analytics_block)
        stats[result] = stats.get(result, 0) + 1
        if result in ("injected", "updated"):
            rel  = fpath.relative_to(PROJECT_ROOT)
            icon = "✅" if result == "injected" else "🔄"
            print(f"  {icon} {rel}")
        elif result == "no-head":
            print(f"  [WARN] Không tìm thấy <head> trong {fpath.name}")

    print()
    print(f"✅ Injected:  {stats.get('injected', 0):>4} trang (mới)")
    print(f"🔄 Updated:   {stats.get('updated', 0):>4} trang (cập nhật)")
    print(f"⏭  Bỏ qua:   {stats.get('skipped', 0):>4} trang (không đổi / intro-omega)")
    total = sum(stats.values())
    print(f"📄 Tổng:     {total:>4} trang")


if __name__ == "__main__":
    generate_analytics()
