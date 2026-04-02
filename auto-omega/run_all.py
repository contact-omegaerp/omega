"""
================================================================================
run_all.py — Chạy toàn bộ scripts tự động của dự án OMEGA
================================================================================
MỤC ĐÍCH:
  Entry point duy nhất để tái tạo tất cả file được sinh tự động.
  Chạy script này mỗi khi có thay đổi nội dung quan trọng.

CÁCH CHẠY:
  cd D:\\Dev_SW\\projects\\omega
  python -X utf8 auto-omega/run_all.py

  Lưu ý: cờ -X utf8 cần thiết trên Windows để hiện đúng tiếng Việt.
  Nếu muốn bỏ cờ, set biến môi trường: set PYTHONUTF8=1

DANH SÁCH SCRIPTS:
  1. gen_sitemap.py       → sitemap.xml
  2. gen_search_index.py  → assets/js/search-index.json

KHI NÀO CẦN CHẠY?
  ✓ Sau khi thêm bài viết mới vào tin-tuc/_tools/news-data.json
  ✓ Sau khi thêm / xóa trang HTML
  ✓ Sau khi sửa title hoặc meta description của trang nào đó
  ✓ Trước khi deploy (git push) để đảm bảo file mới nhất

OUTPUT:
  sitemap.xml                    → gốc dự án (submit lên Google Search Console)
  assets/js/search-index.json    → dùng cho chức năng search trên website
================================================================================
"""

import sys
import time
import importlib.util
from pathlib import Path

# Fix Windows console encoding
if sys.stdout.encoding and sys.stdout.encoding.lower() != "utf-8":
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")

SCRIPTS_DIR = Path(__file__).parent

SCRIPTS = [
    ("gen_sync_header.py",    "Đồng bộ header / search / floating contact → 8 trang gốc"),
    ("gen_customer_pages.py", "Sinh trang khách hàng (khach-hang/*.html)"),
    ("gen_sitemap.py",        "Sinh sitemap.xml"),
    ("gen_search_index.py",   "Sinh search-index.json"),
]

def run_script(script_file: str, label: str):
    print(f"\n{'─'*60}")
    print(f"▶  {label}")
    print(f"{'─'*60}")
    t0 = time.time()
    try:
        spec = importlib.util.spec_from_file_location("_mod", SCRIPTS_DIR / script_file)
        mod  = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        # Gọi hàm main tương ứng
        if script_file == "gen_sync_header.py":
            mod.sync_all_headers()
        elif script_file == "gen_customer_pages.py":
            mod.generate_customer_pages()
        elif script_file == "gen_sitemap.py":
            mod.generate_sitemap()
        elif script_file == "gen_search_index.py":
            mod.generate_search_index()
        elapsed = time.time() - t0
        print(f"   ⏱  {elapsed:.2f}s")
    except Exception as e:
        print(f"❌ Lỗi khi chạy {script_file}: {e}")
        raise

def main():
    print("=" * 60)
    print("  OMEGA AUTO-GENERATOR")
    print(f"  {time.strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    for script_file, label in SCRIPTS:
        run_script(script_file, label)

    print(f"\n{'='*60}")
    print("  ✅ Hoàn thành tất cả scripts!")
    print(f"{'='*60}\n")

if __name__ == "__main__":
    main()
