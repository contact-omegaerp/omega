# DEV-LOG — Nhật ký phát triển website OMEGA

> Ghi lại các trao đổi, vấn đề gặp phải và hướng xử lý cuối cùng.
> Cập nhật thủ công sau mỗi phiên làm việc đáng kể.

---

## Phiên 1 — Khởi tạo & cấu trúc ban đầu

**Nội dung:** Tạo cấu trúc website tĩnh HTML/CSS/JS cho omega.com.vn.

- Khởi tạo các trang gốc: index, ve-omega, san-pham, giai-phap, dich-vu, khach-hang, tin-tuc, lien-he, chinh-sach-bao-mat
- Xây dựng hệ thống script tự động trong `auto-omega/`:
  - `gen_sitemap.py` — sinh sitemap.xml
  - `gen_search_index.py` — sinh search-index.json cho tìm kiếm client-side
  - `run_all.py` — chạy tất cả scripts cùng lúc
- Tối ưu `<head>` của index.html: GA4 `G-0T4G53DCPV`, Schema.org @graph (Organization + ProfessionalService + SoftwareApplication), OG/Twitter meta đầy đủ

---

## Phiên 2 — Trang con khách hàng (khach-hang/)

### Vấn đề
Trang `khach-hang.html` chỉ có danh sách logo, không có trang chi tiết cho từng khách hàng.
Link `ct-link` đang trỏ về WordPress cũ (`https://omega.com.vn/khach-hang-tieu-bieu/...`).

### Giải pháp

**Tạo script `gen_customer_pages.py`:**
- Đọc header và footer trực tiếp từ `khach-hang.html` qua comment marker:
  ```
  <!-- ============ HEADER ============ -->  ...  <!-- ============ /HEADER ============ -->
  <!-- ============ FOOTER ============ -->  ...  <!-- ============ /FOOTER ============ -->
  ```
- Sinh 19 file HTML trong `khach-hang/` với cấu trúc đầy đủ:
  - `<base href="../">` để resolve path về root
  - `.page-header` với `<canvas data-canvas-type="star-network">` (hiệu ứng từ khach-hang.html)
  - 3 cột nội dung: Giới thiệu | Thách thức | Giải pháp
  - Lưới kết quả (stat cards) + quote block + danh sách sản phẩm
- Khi nav thay đổi → chỉ cần chạy lại `python -X utf8 auto-omega/run_all.py`

**Thêm vào `run_all.py`:**
```python
("gen_customer_pages.py", "Sinh trang khách hàng (khach-hang/*.html)")
```

**Cập nhật `gen_sitemap.py`:**
- Thêm `"khach-hang": {"priority": "0.7", "changefreq": "monthly"}` vào `DIR_CONFIG`

**Cập nhật `gen_search_index.py`:**
- Thêm hàm `collect_khach_hang()` — quét `khach-hang/*.html`, category `"Khách hàng"`, icon `fa-building`

**Cập nhật links trong `khach-hang.html`:**
- 19 `ct-link` href: `https://omega.com.vn/khach-hang-tieu-bieu/...` → `khach-hang/{slug}.html`
- 3 nút "Xem chi tiết" case study: `#` → `khach-hang/skypec.html`, `khach-hang/vipharco.html`, `khach-hang/cao-su-dau-tieng.html`

**Làm giàu dữ liệu 3 khách hàng tiêu biểu** (từ `D:\Lazinet\Business\OMGEGA\web-omega\omega.com.vn\`):
- **SKYPEC**: thành lập 1993, 60+ hãng hàng không quốc tế, ký hợp đồng 21/11/2018, nghiệm thu 12/12/2019
- **Vipharco**: thành lập 1982, chuẩn dược phẩm Pháp, nghiệm thu 11/2019, highlight BI reporting
- **Cao su Dầu Tiếng**: thành lập 1917, 27,000+ ha, 3 nhà máy (Long Hòa, Phú Bình, Bến Súc), công suất 47,000 tấn/năm, ký 4/2019

---

## Phiên 3 — Tooltip hover gap (khach-hang.html)

### Vấn đề
Lưới logo khách hàng có tooltip "Xem chi tiết" bị biến mất khi di chuyển chuột lên — do khoảng cách 14px giữa logo box và tooltip floating.

### Giải pháp — CSS-only, không cần JS
Thêm pseudo-element vô hình vào `.logo-grid-item::before` để "lấp" khoảng trống:
```css
.logo-grid-item::before {
  content: '';
  position: absolute;
  bottom: 100%;
  left: 0; right: 0;
  height: 16px; /* ≥ khoảng cách trong bottom: calc(100% + 14px) */
}
```
Nguyên lý: pseudo-element mở rộng vùng hover của `.logo-grid-item` lên trên 16px, bao phủ đúng khoảng trống giữa trigger và tooltip.

---

## Phiên 4 — Cải thiện index.html

### Bối cảnh
`index.html` được tạo đầu tiên nên còn sơ khai; cần nâng cấp để xứng tầm cửa ngõ khách hàng.

### Các thay đổi

| # | Hạng mục | Chi tiết |
|---|----------|----------|
| 1 | Fix "15 năm" → "16 năm" | Phần About còn sót chữ cũ |
| 2 | Bật hero stats | Bỏ comment `<!-- -->` ở khối 3 con số (16+, 1000+, 20+) |
| 3 | Logo khách hàng thật | Thay 6 placeholder SVG của netzon bằng 19 logo thật từ `assets/omega-media/khach-hang/`, mỗi logo wrap trong `<a href="khach-hang/{slug}.html">` |
| 4 | Section "Khách hàng nói gì" | Thêm mới giữa client logos và tin tức — 3 card case study với số liệu thật + quote từ SKYPEC, Vipharco, Cao su Dầu Tiếng |
| 5 | Fix eco-module links | 14 link `san-pham.html#xxx` → `san-pham/software-omega-xxx.html` và `san-pham/app-omega-xxx.html` |

### Lỗi ảnh logo trong section "Khách hàng nói gì"

**Vấn đề:** Logo hiển thị ô trắng trống dù file tồn tại.

**Nguyên nhân:** CSS filter `brightness(0) invert(1)` — nếu logo có nền trắng (không transparent):
- `brightness(0)` → toàn bộ pixel thành đen (kể cả nền trắng)
- `invert(1)` → toàn bộ thành trắng → ô trắng hoàn toàn

**Fix:** Bọc logo trong container nền trắng, bỏ filter:
```html
<div style="background:#fff; border-radius:8px; padding:7px 12px; flex-shrink:0;">
  <img src="..." style="height:32px; width:auto; max-width:110px; object-fit:contain; display:block;">
</div>
```
Pattern này chuẩn cho testimonial section tối nền — logo hiển thị trên pill trắng nhỏ.

---

## Phiên 5 — Điều chỉnh màu section tối

### Vấn đề
Các section tối (`stats-section`, `ecosystem-section`, `case-study`) dùng màu gần-đen — quá nặng nề.

### Giải pháp

**`assets/css/omega.css` — CSS variables toàn site:**
```css
/* Trước */
--dark-bg:   #014120;   /* gần-đen xanh lá */
--dark-bg2:  #0d1f3c;   /* gần-đen navy */
--dark-card: #121e36;

/* Sau */
--dark-bg:   #0d5c38;   /* xanh rừng tối vừa */
--dark-bg2:  #1a3d6e;   /* navy tối vừa */
--dark-card: #1e3a5f;
```
Thay đổi này ảnh hưởng đồng bộ: stats-section, ecosystem-section, footer, và tất cả trang dùng `dark-section` class.

**`index.html` — section `#case-study`:**
```css
/* Nền riêng của section */
background: linear-gradient(135deg, #1a5c3c 0%, #154d31 100%);
```
Xanh rừng rõ, vẫn là tối nhưng không hố đen.

### Nguyên tắc màu dark section
- Vẫn dùng xen kẽ sáng/tối → tốt cho UX, tạo nhịp điệu trang
- Tối nhưng không "sâu hố": mục tiêu là tone có thể nhận ra màu (xanh lá / navy) chứ không phải đen thuần
- Text trên nền tối: `#fff` cho heading, `rgba(255,255,255,0.75–0.85)` cho body, `rgba(255,255,255,0.55)` cho metadata
- Số liệu / accent: `var(--green-light)` (#7ED957) trên nền tối — đủ tương phản

---

---

## Phiên 6 — Đồng bộ header toàn site + fix og:image

### og:image transparent → white
Ảnh chia sẻ mạng xã hội (Facebook, LinkedIn, Zalo, Twitter/X) dùng ảnh logo transparent
→ một số nền tảng tự thêm nền đen, trông rất xấu.

**Fix trong index.html** (replace_all, 5 chỗ: og:image, og:image:secure_url, twitter:image, 2× Schema.org):
```
omega-3B-square-trans-product.png  →  omega-3A-square-white-product.png
```
File `omega-3A-square-white-product.png` = logo square, nền trắng, có chữ sản phẩm.

### Script gen_sync_header.py (mới — sau đó nâng cấp)

Phát hiện: các trang đồng cấp với index thiếu **5 thành phần** quan trọng:

| # | Thành phần | Vấn đề |
|---|-----------|--------|
| 1 | `navbar-utils` (search + translate + hamburger) | Chỉ có hamburger cũ, không có search/translate |
| 2 | `<!-- SEARCH OVERLAY -->` block | Hoàn toàn thiếu |
| 3 | CSS `.navbar-utils` + `.translate-dropdown` + `html.gt-active` | Thiếu → các nút không render đúng |
| 4 | Google Translate lazy-loader `<script>` | Thiếu → nút dịch bấm không ra gì |
| 5 | `lazinet-contact-floating` widget | Hoàn toàn thiếu |

**Vòng 1** (sync 3 block): đồng bộ HEADER + SEARCH OVERLAY + FLOATING CONTACT → nút search/translate có HTML nhưng chưa hoạt động.

**Vòng 2** (sync đầy đủ): thêm 2 block còn thiếu vào index.html với comment markers, rồi cập nhật script:

```
<!-- ============ NAVBAR UTILS CSS ============ -->   (style block)
<!-- ============ /NAVBAR UTILS CSS ============ -->

<!-- ============ TRANSLATE SCRIPT ============ -->   (lazy-loader script)
<!-- ============ /TRANSLATE SCRIPT ============ -->
```

Script `gen_sync_header.py` giờ đồng bộ **5 block** qua comment markers:

```python
canon = {
    "header":    extract_block(source, HEADER_START, HEADER_END),
    "search":    extract_block(source, SEARCH_START, SEARCH_END),
    "css":       extract_block(source, CSS_START, CSS_END),       # ← mới
    "translate": extract_block(source, TRANSLATE_START, TRANSLATE_END),  # ← mới
    "float":     extract_floating(source),
}
```

**Thêm vào run_all.py** — chạy đầu tiên trước gen_customer_pages.

```
Kết quả cuối: 8/8 trang — header, search, css, translate, floating đều đồng bộ
```

**Khi nào chạy lại:**
- Sửa nav menu / mega-menu trong index.html
- Thêm / bớt nút trong navbar-utils
- Sửa Google Translate script hoặc CSS dropdown
- Thay đổi widget floating contact
→ Chạy `python -X utf8 auto-omega/run_all.py`

---

## Lệnh chạy tổng hợp

```bash
cd D:\Dev_SW\projects\omega
python -X utf8 auto-omega/run_all.py
```

Sẽ chạy theo thứ tự:
1. `gen_sync_header.py` — đồng bộ 5 block (header, search, css, translate, floating) → 8 trang gốc
2. `gen_customer_pages.py` — sinh 19 trang khach-hang/*.html
3. `gen_sitemap.py` — sinh sitemap.xml
4. `gen_search_index.py` — sinh assets/js/search-index.json

---

## Quy ước comment markers trong index.html

Tất cả block được đồng bộ tự động đều được bao bởi cặp comment:

```html
<!-- ============ TÊN BLOCK ============ -->
  ... nội dung ...
<!-- ============ /TÊN BLOCK ============ -->
```

| Marker | Nội dung | Đồng bộ bởi |
|--------|----------|-------------|
| `HEADER` / `/HEADER` | Mega-menu, navbar-utils | gen_sync_header.py |
| `SEARCH OVERLAY` / `/SEARCH OVERLAY` | Panel tìm kiếm | gen_sync_header.py |
| `NAVBAR UTILS CSS` / `/NAVBAR UTILS CSS` | CSS search + translate + gt-active | gen_sync_header.py |
| `TRANSLATE SCRIPT` / `/TRANSLATE SCRIPT` | Google Translate lazy-loader | gen_sync_header.py |
| `FOOTER` / `/FOOTER` | Footer đầy đủ | gen_customer_pages.py |

Floating contact không có marker cặp — nhận diện bằng `<!-- FLOATING CONTACT BUTTONS` đến `</div>` trước `</body>`.

---

*Cập nhật lần cuối: 2026-04-02*
