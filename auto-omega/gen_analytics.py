"""
================================================================================
gen_analytics.py — Inject analytics scripts vào tất cả trang HTML
================================================================================
MỤC ĐÍCH:
  Đảm bảo mọi trang .html trong dự án đều có analytics tracking,
  bao gồm tất cả thư mục con (san-pham/, giai-phap/, khach-hang/, tin-tuc/).

  Script đọc ANALYTICS block từ index.html và inject vào <head> của
  tất cả file HTML còn thiếu.

NGUỒN CHUẨN:
  index.html — block được bao bởi:
    <!-- ============ ANALYTICS ============ -->
    <!-- ============ /ANALYTICS ============ -->

  Để thêm Clarity hoặc công cụ khác: chỉ cần chỉnh block trên trong
  index.html, sau đó chạy lại script này.

CÁCH CHẠY:
  cd D:\\Dev_SW\\projects\\omega
  python auto-omega/gen_analytics.py

  Hoặc qua run_all.py (chạy đầu tiên trong pipeline).

BỎ QUA:
  - intro-omega.html (iframe nội bộ, không cần tracking)
  - File đã có marker ANALYTICS (idempotent — chạy lại không bị duplicate)

THÊM CÔNG CỤ MỚI (ví dụ Microsoft Clarity):
  Chỉ cần thêm script vào block ANALYTICS trong index.html:
    <!-- ============ ANALYTICS ============ -->
    <script async src="...gtag..."></script>   ← GA4
    <script>...clarity...</script>             ← Clarity mới thêm
    <!-- ============ /ANALYTICS ============ -->
  Rồi chạy lại: python auto-omega/gen_analytics.py
================================================================================
"""

from pathlib import Path

PROJECT_ROOT = Path(__file__).parent.parent
SOURCE_FILE  = PROJECT_ROOT / "index.html"

ANALYTICS_START = "<!-- ============ ANALYTICS ============ -->"
ANALYTICS_END   = "<!-- ============ /ANALYTICS ============ -->"

# Bỏ qua những file này
SKIP_FILES = {"intro-omega.html"}

# ── Helpers ───────────────────────────────────────────────────────────────────
def extract_analytics_block(source_html: str) -> str | None:
    s = source_html.find(ANALYTICS_START)
    e = source_html.find(ANALYTICS_END)
    if s == -1 or e == -1:
        return None
    return source_html[s : e + len(ANALYTICS_END)]

def inject_into_file(fpath: Path, analytics_block: str) -> str:
    """
    Trả về: 'skipped' | 'updated' | 'injected' | 'no-head'
    - Nếu đã có block: thay toàn bộ nội dung (update)
    - Nếu chưa có: chèn mới ngay sau <head>
    """
    if fpath.name in SKIP_FILES:
        return "skipped"

    html = fpath.read_text(encoding="utf-8")

    # Block đã tồn tại → update nội dung
    if ANALYTICS_START in html and ANALYTICS_END in html:
        s = html.find(ANALYTICS_START)
        e = html.find(ANALYTICS_END) + len(ANALYTICS_END)
        existing = html[s:e]
        if existing == analytics_block:
            return "skipped"          # nội dung giống hệt, không cần ghi
        html = html[:s] + analytics_block + html[e:]
        fpath.write_text(html, encoding="utf-8")
        return "updated"

    # Chưa có → chèn mới ngay sau <head>
    head_tag_end = html.find(">", html.lower().find("<head"))
    if head_tag_end == -1:
        return "no-head"

    insert_pos = head_tag_end + 1
    html = html[:insert_pos] + "\n  " + analytics_block + html[insert_pos:]
    fpath.write_text(html, encoding="utf-8")
    return "injected"

# ── Main ──────────────────────────────────────────────────────────────────────
def generate_analytics():
    source_html    = SOURCE_FILE.read_text(encoding="utf-8")
    analytics_block = extract_analytics_block(source_html)

    if not analytics_block:
        print("[ERROR] Không tìm thấy ANALYTICS block trong index.html")
        return

    print(f"📊 Analytics block: {len(analytics_block)} chars")
    print()

    # Quét tất cả .html trong project (trừ index.html đã có sẵn)
    all_html = sorted(PROJECT_ROOT.rglob("*.html"))
    all_html = [f for f in all_html if f != SOURCE_FILE]

    stats = {"injected": 0, "updated": 0, "skipped": 0, "no-head": 0}

    for fpath in all_html:
        result = inject_into_file(fpath, analytics_block)
        stats[result] = stats.get(result, 0) + 1
        if result in ("injected", "updated"):
            rel = fpath.relative_to(PROJECT_ROOT)
            icon = "✅" if result == "injected" else "🔄"
            print(f"  {icon} {rel}")
        elif result == "no-head":
            print(f"  [WARN] Không tìm thấy <head> trong {fpath.name}")

    print()
    print(f"✅ Injected:  {stats['injected']:>4} trang (mới)")
    print(f"🔄 Updated:   {stats['updated']:>4} trang (cập nhật)")
    print(f"⏭  Bỏ qua:   {stats['skipped']:>4} trang (không đổi / intro-omega)")
    total = sum(stats.values())
    print(f"📄 Tổng:     {total:>4} trang (không kể index.html)")

if __name__ == "__main__":
    generate_analytics()
