"""
================================================================================
gen_sitemap.py — Tự động sinh sitemap.xml cho website OMEGA (omega.com.vn)
================================================================================
MỤC ĐÍCH:
  Quét toàn bộ trang HTML của dự án và sinh file sitemap.xml chuẩn
  sitemaps.org, đặt tại thư mục gốc của dự án.

CÁCH CHẠY:
  cd D:\\Dev_SW\\projects\\omega
  python auto-omega/gen_sitemap.py

  Hoặc chạy qua run_all.py để thực thi tất cả scripts cùng lúc.

YÊU CẦU:
  Python 3.7+, không cần thư viện ngoài (dùng thư viện chuẩn)

CẬP NHẬT SITEMAP KHI NÀO?
  - Thêm / xóa trang HTML
  - Thêm bài viết mới vào tin-tuc/_tools/news-data.json
  - Thay đổi cấu trúc URL
  Sau đó chạy lại script này hoặc run_all.py

CẤU TRÚC ƯU TIÊN (priority):
  1.0  — Trang chủ
  0.9  — Trang chính (Về Omega, Sản phẩm, Giải pháp, Dịch vụ, Tin tức, Liên hệ)
  0.8  — Trang sản phẩm chi tiết (san-pham/, giai-phap/)
  0.7  — Bài viết tin tức (tin-tuc/)
  0.3  — Trang pháp lý (chính sách, điều khoản)
================================================================================
"""

import os
import json
import re
from datetime import datetime
from pathlib import Path

# ── Cấu hình ──────────────────────────────────────────────────────────────────
BASE_URL      = "https://omega.com.vn"
PROJECT_ROOT  = Path(__file__).parent.parent        # thư mục gốc dự án
OUTPUT_FILE   = PROJECT_ROOT / "sitemap.xml"
NEWS_JSON     = PROJECT_ROOT / "tin-tuc" / "_tools" / "news-data.json"

# Trang bị loại trừ khỏi sitemap
EXCLUDE_FILES = {
    "intro-omega.html",   # splash intro, không index
    "404.html",           # error page, không đưa vào sitemap
}
EXCLUDE_DIRS = {
    "bizcards",           # trang bizcard nội bộ
    "tin-tuc/_tools",     # công cụ nội bộ
    "tin-tuc\\_tools",
    "auto-omega",
    "assets",
    "node_modules",
}

# Cấu hình theo loại trang
PAGE_CONFIG = {
    "index.html":               {"priority": "1.0", "changefreq": "weekly"},
    "ve-omega.html":            {"priority": "0.9", "changefreq": "monthly"},
    "giai-phap.html":           {"priority": "0.9", "changefreq": "monthly"},
    "san-pham.html":            {"priority": "0.9", "changefreq": "monthly"},
    "dich-vu.html":             {"priority": "0.9", "changefreq": "monthly"},
    "khach-hang.html":          {"priority": "0.8", "changefreq": "monthly"},
    "tin-tuc.html":             {"priority": "0.9", "changefreq": "weekly"},
    "lien-he.html":             {"priority": "0.8", "changefreq": "monthly"},
    "chinh-sach-bao-mat.html":  {"priority": "0.3", "changefreq": "yearly"},
}
# Mặc định cho các thư mục con
DIR_CONFIG = {
    "san-pham":   {"priority": "0.8", "changefreq": "monthly"},
    "giai-phap":  {"priority": "0.8", "changefreq": "monthly"},
    "tin-tuc":    {"priority": "0.7", "changefreq": "monthly"},
    "dich-vu":    {"priority": "0.8", "changefreq": "monthly"},
    "khach-hang": {"priority": "0.7", "changefreq": "monthly"},
}

# ── Helpers ───────────────────────────────────────────────────────────────────
def file_lastmod(filepath: Path) -> str:
    """Lấy ngày sửa đổi cuối của file, định dạng ISO 8601."""
    ts = os.path.getmtime(filepath)
    return datetime.fromtimestamp(ts).strftime("%Y-%m-%d")

def parse_vn_date(date_str: str) -> str:
    """Chuyển ngày DD/MM/YYYY sang YYYY-MM-DD cho sitemap."""
    try:
        return datetime.strptime(date_str.strip(), "%d/%m/%Y").strftime("%Y-%m-%d")
    except ValueError:
        return datetime.today().strftime("%Y-%m-%d")

def xml_url(loc: str, lastmod: str, changefreq: str, priority: str) -> str:
    return (
        f"  <url>\n"
        f"    <loc>{loc}</loc>\n"
        f"    <lastmod>{lastmod}</lastmod>\n"
        f"    <changefreq>{changefreq}</changefreq>\n"
        f"    <priority>{priority}</priority>\n"
        f"  </url>"
    )

def is_excluded(rel_path: str) -> bool:
    parts = Path(rel_path).parts
    filename = parts[-1]
    if filename in EXCLUDE_FILES:
        return True
    for excl in EXCLUDE_DIRS:
        if excl in rel_path.replace("\\", "/"):
            return True
    return False

# ── Quét HTML ─────────────────────────────────────────────────────────────────
def collect_html_pages():
    """Trả về list (url, lastmod, changefreq, priority)."""
    entries = []

    # 1. Trang gốc (cấp 1)
    for html_file in sorted(PROJECT_ROOT.glob("*.html")):
        name = html_file.name
        if name in EXCLUDE_FILES:
            continue
        cfg = PAGE_CONFIG.get(name, {"priority": "0.7", "changefreq": "monthly"})
        loc = f"{BASE_URL}/{name}" if name != "index.html" else f"{BASE_URL}/"
        entries.append((loc, file_lastmod(html_file), cfg["changefreq"], cfg["priority"]))

    # 2. Trang con trong thư mục (cấp 2) — trừ tin-tuc (xử lý riêng từ JSON)
    for subdir_name, cfg in DIR_CONFIG.items():
        if subdir_name in ("tin-tuc", "dich-vu"):
            continue  # tin-tuc lấy từ news-data.json; dich-vu là trang đơn
        subdir = PROJECT_ROOT / subdir_name
        if not subdir.exists():
            continue
        for html_file in sorted(subdir.glob("*.html")):
            rel = f"{subdir_name}/{html_file.name}"
            if is_excluded(rel):
                continue
            loc = f"{BASE_URL}/{rel}"
            entries.append((loc, file_lastmod(html_file), cfg["changefreq"], cfg["priority"]))

    return entries

def collect_news_articles():
    """Lấy bài viết tin tức từ news-data.json."""
    entries = []
    if not NEWS_JSON.exists():
        print(f"[WARN] Không tìm thấy {NEWS_JSON}")
        return entries

    with open(NEWS_JSON, encoding="utf-8") as f:
        articles = json.load(f)

    cfg = DIR_CONFIG["tin-tuc"]
    for article in articles:
        slug = article.get("slug", "")
        date = parse_vn_date(article.get("published_date", ""))
        if not slug:
            continue
        loc = f"{BASE_URL}/tin-tuc/{slug}.html"
        entries.append((loc, date, cfg["changefreq"], cfg["priority"]))

    return entries

# ── Sinh XML ──────────────────────────────────────────────────────────────────
def generate_sitemap():
    pages   = collect_html_pages()
    articles = collect_news_articles()
    all_entries = pages + articles

    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
        '        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"',
        '        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9',
        '        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">',
        f'  <!-- Generated: {datetime.today().strftime("%Y-%m-%d %H:%M")} | {len(all_entries)} URLs -->',
        "",
        "  <!-- ═══ Trang chủ & trang chính ═══ -->",
    ]

    for loc, lastmod, changefreq, priority in pages:
        lines.append(xml_url(loc, lastmod, changefreq, priority))

    lines += ["", "  <!-- ═══ Bài viết Tin tức ═══ -->"]
    for loc, lastmod, changefreq, priority in articles:
        lines.append(xml_url(loc, lastmod, changefreq, priority))

    lines.append("</urlset>")

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")

    print(f"✅ sitemap.xml → {len(pages)} trang + {len(articles)} bài viết = {len(all_entries)} URLs")
    print(f"   Đã lưu: {OUTPUT_FILE}")

# ── Main ──────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    generate_sitemap()
