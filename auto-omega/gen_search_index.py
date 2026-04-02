"""
================================================================================
gen_search_index.py — Tự động sinh assets/js/search-index.json
================================================================================
MỤC ĐÍCH:
  Quét tất cả trang HTML + bài viết tin tức, trích xuất title & meta
  description, sinh file search-index.json dùng cho chức năng tìm kiếm
  client-side trong omega.js.

CÁCH CHẠY:
  cd D:\\Dev_SW\\projects\\omega
  python auto-omega/gen_search_index.py

YÊU CẦU:
  Python 3.7+, không cần thư viện ngoài

CẬP NHẬT KHI NÀO?
  - Thêm / xóa trang HTML
  - Thêm bài viết mới vào tin-tuc/_tools/news-data.json
  - Sửa title/description của bất kỳ trang nào

CẤU TRÚC MỖI ENTRY:
  {
    "title":    "Tiêu đề trang",
    "desc":     "Mô tả ngắn (từ meta description)",
    "url":      "duong/dan/trang.html",
    "icon":     "fa-icon-name",
    "cat":      "Nhóm danh mục",
    "keywords": "từ khóa tìm kiếm"
  }
================================================================================
"""

import os
import re
import json
from pathlib import Path
from datetime import datetime

# ── Cấu hình ──────────────────────────────────────────────────────────────────
PROJECT_ROOT = Path(__file__).parent.parent
OUTPUT_FILE  = PROJECT_ROOT / "assets" / "js" / "search-index.json"
NEWS_JSON    = PROJECT_ROOT / "tin-tuc" / "_tools" / "news-data.json"

# ── Icon mapping ──────────────────────────────────────────────────────────────
ROOT_PAGE_CONFIG = {
    "index.html":               {"icon": "fa-house",          "cat": "Trang chủ"},
    "ve-omega.html":            {"icon": "fa-building",        "cat": "Về Omega"},
    "giai-phap.html":           {"icon": "fa-lightbulb",       "cat": "Giải pháp"},
    "san-pham.html":            {"icon": "fa-cubes",           "cat": "Sản phẩm"},
    "dich-vu.html":             {"icon": "fa-wrench",          "cat": "Dịch vụ"},
    "khach-hang.html":          {"icon": "fa-star",            "cat": "Khách hàng"},
    "tin-tuc.html":             {"icon": "fa-newspaper",       "cat": "Tin tức"},
    "lien-he.html":             {"icon": "fa-envelope",        "cat": "Liên hệ"},
    "chinh-sach-bao-mat.html":  {"icon": "fa-shield-halved",   "cat": "Chính sách"},
}

GIAI_PHAP_ICONS = {
    "giai-phap-nganh-fb":           "fa-utensils",
    "giai-phap-nganh-fmcg":         "fa-box-open",
    "giai-phap-nganh-go-noi-that":  "fa-tree",
    "giai-phap-nganh-nhua":         "fa-industry",
    "giai-phap-nganh-phan-phoi":    "fa-truck",
    "giai-phap-nganh-thoi-trang":   "fa-shirt",
    "giai-phap-nganh-thuy-san":     "fa-fish",
    "giai-phap-nganh-y-te":         "fa-stethoscope",
}

SAN_PHAM_ICONS = {
    "app-omega-apv":      "fa-file-circle-check",
    "app-omega-hrm":      "fa-users-gear",
    "app-omega-mst":      "fa-chart-gantt",
    "app-omega-scr":      "fa-barcode",
    "app-omega-sor":      "fa-cart-shopping",
    "app-omega-stk":      "fa-boxes-stacked",
    "software-omega-cl":  "fa-building-columns",
    "software-omega-crm": "fa-handshake",
    "software-omega-edu": "fa-graduation-cap",
    "software-omega-erp": "fa-cubes",
    "software-omega-fa":  "fa-landmark",
    "software-omega-gl":  "fa-calculator",
    "software-omega-hr":  "fa-id-card",
    "software-omega-mc":  "fa-chart-pie",
    "software-omega-mm":  "fa-gears",
    "software-omega-pc":  "fa-coins",
    "software-omega-po":  "fa-cart-flatbed",
    "software-omega-pr":  "fa-money-bill-wave",
    "software-omega-qc":  "fa-circle-check",
    "software-omega-sd":  "fa-database",
    "software-omega-sm":  "fa-sliders",
    "software-omega-smb": "fa-store",
    "software-omega-so":  "fa-tags",
    "software-omega-wm":  "fa-warehouse",
}

NEWS_CATEGORY_CONFIG = {
    "erp-quan-tri":      {"cat": "ERP & Quản trị",       "icon": "fa-chart-line"},
    "ke-toan-tai-chinh": {"cat": "Kế toán – Tài chính",  "icon": "fa-file-invoice-dollar"},
    "chuyen-doi-so":     {"cat": "Chuyển đổi số",         "icon": "fa-rotate"},
    "su-kien":           {"cat": "Sự kiện Omega",         "icon": "fa-calendar-days"},
    "tuyen-dung":        {"cat": "Tuyển dụng",            "icon": "fa-briefcase"},
}
NEWS_DEFAULT = {"cat": "Tin tức", "icon": "fa-newspaper"}

# Trang bỏ qua (không đưa vào search index)
EXCLUDE_FILES = {"intro-omega.html"}
EXCLUDE_DIRS  = {"bizcards", "_tools", "auto-omega", "assets"}

# ── Helpers ───────────────────────────────────────────────────────────────────
def extract_meta(html: str) -> dict:
    """Trích title và meta description từ nội dung HTML."""
    title_m = re.search(r"<title[^>]*>([^<]+)</title>", html, re.IGNORECASE)
    desc_m  = re.search(
        r'<meta\s+name=["\']description["\']\s+content=["\']([^"\']+)["\']',
        html, re.IGNORECASE
    ) or re.search(
        r'<meta\s+content=["\']([^"\']+)["\']\s+name=["\']description["\']',
        html, re.IGNORECASE
    )
    title = title_m.group(1).strip() if title_m else ""
    # Bỏ phần " | Site name" cuối title nếu có
    title = re.sub(r"\s*\|[^|]*$", "", title).strip()
    desc  = desc_m.group(1).strip()[:160] if desc_m else ""
    return {"title": title, "desc": desc}

def make_entry(title, desc, url, icon, cat, keywords=""):
    if not keywords:
        keywords = f"{title} {cat}".lower()
    return {
        "title":    title,
        "desc":     desc,
        "url":      url,
        "icon":     icon,
        "cat":      cat,
        "keywords": keywords,
    }

# ── Thu thập trang ────────────────────────────────────────────────────────────
def collect_root_pages(index):
    for fname, cfg in ROOT_PAGE_CONFIG.items():
        fpath = PROJECT_ROOT / fname
        if not fpath.exists():
            continue
        html = fpath.read_text(encoding="utf-8", errors="ignore")
        m = extract_meta(html)
        index.append(make_entry(m["title"], m["desc"], fname, cfg["icon"], cfg["cat"]))

def collect_giai_phap(index):
    subdir = PROJECT_ROOT / "giai-phap"
    if not subdir.exists():
        return
    for fpath in sorted(subdir.glob("*.html")):
        key  = fpath.stem
        icon = GIAI_PHAP_ICONS.get(key, "fa-lightbulb")
        html = fpath.read_text(encoding="utf-8", errors="ignore")
        m    = extract_meta(html)
        url  = f"giai-phap/{fpath.name}"
        index.append(make_entry(m["title"], m["desc"], url, icon, "Giải pháp"))

def collect_san_pham(index):
    subdir = PROJECT_ROOT / "san-pham"
    if not subdir.exists():
        return
    for fpath in sorted(subdir.glob("*.html")):
        key  = fpath.stem
        icon = SAN_PHAM_ICONS.get(key, "fa-desktop")
        # Phân loại
        if fpath.name.startswith("app-"):
            cat = "Mobile App"
        elif fpath.name == "software-omega-smb.html":
            cat = "GAMA.SMB"
        else:
            cat = "Phần mềm ERP"
        html = fpath.read_text(encoding="utf-8", errors="ignore")
        m    = extract_meta(html)
        url  = f"san-pham/{fpath.name}"
        index.append(make_entry(m["title"], m["desc"], url, icon, cat))

def collect_news(index):
    if not NEWS_JSON.exists():
        print(f"[WARN] Không tìm thấy {NEWS_JSON}")
        return
    articles = json.loads(NEWS_JSON.read_text(encoding="utf-8"))
    for a in articles:
        slug = a.get("slug", "")
        if not slug:
            continue
        cfg  = NEWS_CATEGORY_CONFIG.get(a.get("category", ""), NEWS_DEFAULT)
        desc = (a.get("excerpt") or a.get("seo_desc") or "").replace("\n", " ")[:160]
        tags = a.get("tags", "").lower().replace(",", " ")
        kw   = f"{tags} {a.get('title','').lower()}"
        index.append(make_entry(
            title    = a.get("title", ""),
            desc     = desc,
            url      = f"tin-tuc/{slug}.html",
            icon     = cfg["icon"],
            cat      = cfg["cat"],
            keywords = kw,
        ))

def collect_khach_hang(index):
    subdir = PROJECT_ROOT / "khach-hang"
    if not subdir.exists():
        return
    for fpath in sorted(subdir.glob("*.html")):
        html = fpath.read_text(encoding="utf-8", errors="ignore")
        m    = extract_meta(html)
        url  = f"khach-hang/{fpath.name}"
        index.append(make_entry(m["title"], m["desc"], url, "fa-building", "Khách hàng"))

# ── Main ──────────────────────────────────────────────────────────────────────
def generate_search_index():
    index = []
    collect_root_pages(index)
    collect_giai_phap(index)
    collect_san_pham(index)
    collect_khach_hang(index)
    collect_news(index)

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(index, f, ensure_ascii=False, indent=2)

    # Thống kê theo category
    from collections import Counter
    cats = Counter(e["cat"] for e in index)
    print(f"✅ search-index.json → {len(index)} entries")
    for cat, count in cats.most_common():
        print(f"   {count:3d}  {cat}")
    print(f"   Đã lưu: {OUTPUT_FILE}")

if __name__ == "__main__":
    generate_search_index()
