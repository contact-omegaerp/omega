"""
_patch_khach_hang_html.py
Cập nhật khach-hang.html: thay hardcoded sections bằng render động từ GAS
"""
import re, sys

SRC = 'khach-hang.html'
OUT = 'khach-hang.html'

with open(SRC, encoding='utf-8') as f:
    html = f.read()

# ═══════════════════════════════════════════════════════════════════
# 1. Thêm CSS skeleton vào <style> cuối head
# ═══════════════════════════════════════════════════════════════════
SKEL_CSS = """
    /* ── GAS CMS: Skeleton loading ── */
    .kh-skel-grid { display:flex; flex-wrap:wrap; gap:20px; justify-content:center; }
    .kh-skel-logo { width:150px; height:80px; border-radius:12px; background:linear-gradient(90deg,#e8e8e8 25%,#f5f5f5 50%,#e8e8e8 75%); background-size:400% 100%; animation:kh-shimmer 1.5s infinite; }
    .kh-skel-card { background:#fff; border-radius:16px; padding:24px; flex:1; min-width:260px; max-width:340px; box-shadow:0 4px 24px rgba(0,0,0,0.06); }
    .kh-skel-line { height:14px; border-radius:6px; background:linear-gradient(90deg,#e8e8e8 25%,#f5f5f5 50%,#e8e8e8 75%); background-size:400% 100%; animation:kh-shimmer 1.5s infinite; margin-bottom:10px; }
    .kh-skel-line.w60 { width:60%; }
    .kh-skel-line.w80 { width:80%; }
    .kh-skel-line.w40 { width:40%; }
    @keyframes kh-shimmer { 0%{background-position:100% 0} 100%{background-position:-100% 0} }
    .kh-error-msg { text-align:center; padding:40px; color:#888; font-style:italic; }
"""

html = html.replace(
    '  </style>\n</head>',
    SKEL_CSS + '  </style>\n</head>',
    1
)

# ═══════════════════════════════════════════════════════════════════
# 2. Thay toàn bộ logo-grid (hardcoded items → skeleton + ID)
# ═══════════════════════════════════════════════════════════════════
LOGO_GRID_OLD_START = '      <!-- Logo Grid -->\n      <div class="logo-grid wow fadeInUp">'
LOGO_GRID_OLD_END   = '      </div><!-- /logo-grid -->'

LOGO_GRID_NEW = """      <!-- Logo Grid — populated via GAS CMS (khach-hang.gs) -->
      <div class="logo-grid" id="kh-logo-grid">
        <!-- Skeleton while GAS loads -->
        <div class="kh-skel-grid" id="kh-logo-skeleton">
""" + "".join(
    '          <div class="kh-skel-logo"></div>\n' for _ in range(19)
) + """        </div>
      </div><!-- /logo-grid -->"""

# Tìm đoạn từ start đến end
pattern = re.escape(LOGO_GRID_OLD_START) + r'.*?' + re.escape(LOGO_GRID_OLD_END)
new_html, n = re.subn(pattern, LOGO_GRID_NEW, html, count=1, flags=re.DOTALL)
if n == 0:
    print('WARN: Không tìm thấy logo-grid section!')
else:
    html = new_html
    print(f'OK: Replaced logo-grid ({n})')

# ═══════════════════════════════════════════════════════════════════
# 3. Thay case study row
# ═══════════════════════════════════════════════════════════════════
CS_OLD_START = '      <div class="row g-4">\n        <!-- Card 1: SKYPEC -->'
CS_OLD_END   = '      </div>\n    </div>\n  </section>\n  <!-- ============ /CASE STUDIES ============ -->'

CS_NEW = """      <!-- Case Study cards — populated via GAS CMS -->
      <div class="row g-4" id="kh-case-grid">
        <!-- Skeleton -->
        <div class="col-md-4"><div class="kh-skel-card"><div class="kh-skel-line w40"></div><div class="kh-skel-line w80"></div><div class="kh-skel-line w60"></div><div class="kh-skel-line w80"></div><div class="kh-skel-line w40"></div></div></div>
        <div class="col-md-4"><div class="kh-skel-card"><div class="kh-skel-line w40"></div><div class="kh-skel-line w80"></div><div class="kh-skel-line w60"></div><div class="kh-skel-line w80"></div><div class="kh-skel-line w40"></div></div></div>
        <div class="col-md-4"><div class="kh-skel-card"><div class="kh-skel-line w40"></div><div class="kh-skel-line w80"></div><div class="kh-skel-line w60"></div><div class="kh-skel-line w80"></div><div class="kh-skel-line w40"></div></div></div>
      </div>
    </div>
  </section>
  <!-- ============ /CASE STUDIES ============ -->"""

pattern_cs = re.escape(CS_OLD_START) + r'.*?' + re.escape(CS_OLD_END)
new_html, n = re.subn(pattern_cs, CS_NEW, html, count=1, flags=re.DOTALL)
if n == 0:
    print('WARN: Không tìm thấy case study section!')
else:
    html = new_html
    print(f'OK: Replaced case study ({n})')

# ═══════════════════════════════════════════════════════════════════
# 4. Thay testimonial swiper-wrapper
# ═══════════════════════════════════════════════════════════════════
TM_OLD_START = '          <div class="swiper-wrapper">\n\n            <!-- Testimonial 1 -->'
TM_OLD_END   = '          </div>\n          <div class="swiper-pagination"'

TM_NEW = """          <!-- Swiper slides — populated via GAS CMS -->
          <div class="swiper-wrapper" id="kh-testimonial-wrapper">
          </div>
          <div class="swiper-pagination\""""

pattern_tm = re.escape(TM_OLD_START) + r'.*?' + re.escape(TM_OLD_END)
new_html, n = re.subn(pattern_tm, TM_NEW, html, count=1, flags=re.DOTALL)
if n == 0:
    print('WARN: Không tìm thấy testimonial section!')
else:
    html = new_html
    print(f'OK: Replaced testimonial ({n})')

# ═══════════════════════════════════════════════════════════════════
# 5. Thay DOMContentLoaded script (tái cấu trúc để re-init sau render)
# ═══════════════════════════════════════════════════════════════════
OLD_SCRIPT = """  <script>
    // Testimonial Swiper
    document.addEventListener('DOMContentLoaded', function () {
      if (typeof Swiper !== 'undefined') {
        new Swiper('#testimonialSwiper', {
          slidesPerView: 1,
          spaceBetween: 24,
          loop: true,
          autoplay: { delay: 5000, disableOnInteraction: false },
          pagination: { el: '.swiper-pagination', clickable: true },
          breakpoints: {
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 }
          }
        });
      }

      // Logo tab filtering
      var tabBtns = document.querySelectorAll('.tab-btn');
      var logoItems = document.querySelectorAll('.logo-grid-item');

      tabBtns.forEach(function(btn) {
        btn.addEventListener('click', function() {
          tabBtns.forEach(function(b) { b.classList.remove('active'); });
          btn.classList.add('active');
          var tab = btn.getAttribute('data-tab');
          logoItems.forEach(function(item) {
            if (tab === 'all' || item.getAttribute('data-tab') === tab) {
              item.classList.remove('hidden');
            } else {
              item.classList.add('hidden');
            }
          });
        });
      });
    });
  </script>"""

NEW_SCRIPT = """  <script>
    // ── Helper: init/re-init Testimonial Swiper ──────────────────
    var _swiperInstance = null;
    function initTestimonialSwiper() {
      if (typeof Swiper === 'undefined') return;
      if (_swiperInstance) { _swiperInstance.destroy(true, true); _swiperInstance = null; }
      var wrapper = document.getElementById('kh-testimonial-wrapper');
      if (!wrapper || !wrapper.children.length) return;
      _swiperInstance = new Swiper('#testimonialSwiper', {
        slidesPerView: 1,
        spaceBetween: 24,
        loop: true,
        autoplay: { delay: 5000, disableOnInteraction: false },
        pagination: { el: '.swiper-pagination', clickable: true },
        breakpoints: { 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }
      });
    }

    // ── Helper: bind logo filter tabs ────────────────────────────
    function initLogoTabs() {
      var tabBtns   = document.querySelectorAll('.tab-btn');
      var logoItems = document.querySelectorAll('.logo-grid-item');
      if (!tabBtns.length || !logoItems.length) return;
      // Giữ tab đang active
      var curTab = (document.querySelector('.tab-btn.active') || tabBtns[0]).getAttribute('data-tab') || 'all';
      logoItems.forEach(function(item) {
        item.classList.toggle('hidden', curTab !== 'all' && item.getAttribute('data-tab') !== curTab);
      });
      tabBtns.forEach(function(btn) {
        btn.onclick = null; // clear cũ
        btn.addEventListener('click', function() {
          tabBtns.forEach(function(b) { b.classList.remove('active'); });
          btn.classList.add('active');
          var tab = btn.getAttribute('data-tab');
          logoItems.forEach(function(item) {
            item.classList.toggle('hidden', tab !== 'all' && item.getAttribute('data-tab') !== tab);
          });
        });
      });
    }
  </script>"""

if OLD_SCRIPT in html:
    html = html.replace(OLD_SCRIPT, NEW_SCRIPT, 1)
    print('OK: Replaced DOMContentLoaded script')
else:
    print('WARN: Không tìm thấy DOMContentLoaded script gốc — kiểm tra lại!')

# ═══════════════════════════════════════════════════════════════════
# 6. Thêm GAS fetch script trước </body>
# ═══════════════════════════════════════════════════════════════════
GAS_SCRIPT = """
  <!-- ============ GAS CMS — Khách hàng ============ -->
  <!--
    HƯỚNG DẪN:
    1. Deploy khach-hang.gs lên Google Apps Script (Web App, Anyone)
    2. Copy URL deploy → thay vào GAS_KH_URL bên dưới
    3. Xóa cache: menu 📋 OMEGA CMS → Xóa cache
  -->
  <script>
  (function () {
    // ── CONFIG ──────────────────────────────────────────────────────
    var GAS_KH_URL  = 'PASTE_YOUR_GAS_WEB_APP_URL_HERE';
    var CACHE_KEY   = 'omega_kh_v2';
    var CACHE_TTL   = 30 * 60 * 1000; // 30 min client-side
    var LOGO_BASE   = 'assets/omega-media/khach-hang/';

    // ── LocalStorage cache ──────────────────────────────────────────
    function getCached() {
      try {
        var raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        var obj = JSON.parse(raw);
        if (Date.now() - obj.ts > CACHE_TTL) return null;
        return obj.data;
      } catch (e) { return null; }
    }
    function setCache(data) {
      try { localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: data })); } catch (e) {}
    }

    // ── Stars renderer ──────────────────────────────────────────────
    function starsHtml(n) {
      var s = '';
      var full = Math.floor(n), half = (n % 1 >= 0.5) ? 1 : 0, empty = 5 - full - half;
      for (var i = 0; i < full;  i++) s += '<i class="fa-solid fa-star"></i>';
      if (half)                        s += '<i class="fa-solid fa-star-half-stroke"></i>';
      for (var i = 0; i < empty; i++) s += '<i class="fa-regular fa-star"></i>';
      return s;
    }

    // ── Avatar initial ──────────────────────────────────────────────
    function avatarChar(name) {
      var m = name.match(/\\b(\\w)/g);
      return m ? m[m.length - 1].toUpperCase() : '?';
    }

    // ── Render: Logo Grid ───────────────────────────────────────────
    function renderLogos(logos) {
      var grid = document.getElementById('kh-logo-grid');
      if (!grid) return;
      if (!logos || !logos.length) {
        grid.innerHTML = '<p class="kh-error-msg">Chưa có dữ liệu khách hàng.</p>';
        return;
      }
      var html = '';
      logos.forEach(function (c) {
        var imgSrc  = LOGO_BASE + c.logo_file;
        var hasQuote = c.quote && c.quote.trim();
        var hasPerson = c.nguoi_quote && c.nguoi_quote.trim();

        html += '<div class="logo-grid-item" data-tab="' + esc(c.tab) + '">';
        html += '<div class="client-logo-box">';
        html += '<img src="' + esc(imgSrc) + '" alt="' + esc(c.ten_ngan) + '"'
              + ' onerror="this.style.display=\'none\'">';
        html += '</div>';

        // Tooltip
        html += '<div class="client-tooltip">';
        html += '<div class="ct-header">';
        html += '<div class="ct-logo-wrap"><img src="' + esc(imgSrc) + '" alt="' + esc(c.ten_ngan) + '"></div>';
        html += '<div><div class="ct-company">' + esc(c.ten_ngan) + '</div>';
        html += '<span class="ct-industry-tag">' + esc(c.nganh) + '</span></div>';
        html += '</div>';

        html += '<div class="ct-body">';
        if (c.mo_ta) html += '<p class="ct-desc">' + esc(c.mo_ta) + '</p>';
        if (hasQuote) {
          html += '<div class="ct-quote">“' + esc(c.quote) + '”</div>';
          if (hasPerson) html += '<p class="ct-person">— ' + esc(c.nguoi_quote) + '</p>';
        }
        if (c.url) html += '<a class="ct-link" href="' + esc(c.url) + '">Xem chi tiết <i class="fa-solid fa-arrow-right"></i></a>';
        html += '</div></div></div>';
      });

      grid.innerHTML = html;
      initLogoTabs();
    }

    // ── Render: Case Study ──────────────────────────────────────────
    function renderCaseStudy(cards) {
      var row = document.getElementById('kh-case-grid');
      if (!row) return;
      if (!cards || !cards.length) {
        row.innerHTML = '<p class="kh-error-msg col-12">Chưa có case study.</p>';
        return;
      }
      var html = '';
      var delays = ['0.1s','0.2s','0.3s'];
      cards.forEach(function (c, idx) {
        html += '<div class="col-md-4 wow fadeInUp" data-wow-delay="' + (delays[idx] || '0.1s') + '">';
        html += '<div class="case-card">';
        html += '<span class="industry-tag"><i class="fa-solid ' + esc(c.icon) + '"></i> ' + esc(c.nganh_tag) + '</span>';
        html += '<h3>' + esc(c.tieu_de) + '</h3>';
        html += '<p>' + esc(c.mo_ta) + '</p>';
        html += '<div class="result-badge"><i class="fa-solid fa-chart-line"></i> ' + esc(c.ket_qua) + '</div>';
        if (c.url) html += '<a href="' + esc(c.url) + '" class="btn-link-omega">Xem chi tiết <i class="fa-solid fa-arrow-right"></i></a>';
        html += '</div></div>';
      });
      row.innerHTML = html;
    }

    // ── Render: Testimonials ────────────────────────────────────────
    function renderTestimonials(items) {
      var wrapper = document.getElementById('kh-testimonial-wrapper');
      if (!wrapper) return;
      if (!items || !items.length) return;
      var html = '';
      items.forEach(function (t) {
        html += '<div class="swiper-slide"><div class="testimonial-card">';
        html += '<div class="stars">' + starsHtml(t.so_sao) + '</div>';
        html += '<p class="quote">“' + esc(t.quote) + '”</p>';
        html += '<div class="author">';
        html += '<div class="author-avatar">' + avatarChar(t.ten) + '</div>';
        html += '<div><div class="author-name">' + esc(t.ten) + '</div>';
        html += '<div class="author-title">' + esc(t.chuc_danh) + '</div></div>';
        html += '</div></div></div>';
      });
      wrapper.innerHTML = html;
      initTestimonialSwiper();
    }

    // ── HTML escape ─────────────────────────────────────────────────
    function esc(s) {
      if (!s) return '';
      return String(s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // ── Main render ─────────────────────────────────────────────────
    function render(data) {
      renderLogos(data.logos);
      renderCaseStudy(data.caseStudy);
      renderTestimonials(data.testimonials);
    }

    // ── Fetch from GAS ──────────────────────────────────────────────
    function loadFromGAS() {
      if (!GAS_KH_URL || GAS_KH_URL.indexOf('PASTE') !== -1) {
        console.warn('[OMEGA CMS] GAS_KH_URL chưa được cấu hình trong khach-hang.html');
        return;
      }

      var cached = getCached();
      if (cached) { render(cached); return; }

      fetch(GAS_KH_URL, { redirect: 'follow' })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (data && data.ok) {
            setCache(data);
            render(data);
          }
        })
        .catch(function (err) {
          console.warn('[OMEGA CMS] Lỗi load dữ liệu:', err);
        });
    }

    // Kick off fetch immediately; render after DOM ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', loadFromGAS);
    } else {
      loadFromGAS();
    }
  })();
  </script>
  <!-- ============ /GAS CMS ============ -->
"""

if '</body>' in html:
    html = html.replace('</body>', GAS_SCRIPT + '</body>', 1)
    print('OK: Thêm GAS fetch script')
else:
    print('WARN: Không tìm thấy </body>!')

# ═══════════════════════════════════════════════════════════════════
# Ghi file
# ═══════════════════════════════════════════════════════════════════
with open(OUT, 'w', encoding='utf-8') as f:
    f.write(html)

print(f'\nDone! Ghi ra: {OUT}')
