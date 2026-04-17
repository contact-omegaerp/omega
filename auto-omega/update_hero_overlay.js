#!/usr/bin/env node
/**
 * update_hero_overlay.js
 * 1. Thêm title + status overlay lên banner hero của 30 HTML job pages
 * 2. Cập nhật loadJobStatus() để sync từ GAS
 * 3. Thêm job_id vào 30 entries trong news-data.json
 * Chạy: node auto-omega/update_hero_overlay.js
 */

const fs   = require('fs');
const path = require('path');

const HTML_DIR = path.join(__dirname, '..', 'tin-tuc');
const DATA_PATH = path.join(HTML_DIR, '_tools', 'news-data.json');

// Slug → job_id mapping
const SLUG_TO_ID = {
  'tuyen-dung-lap-trinh-vien-backend':          'J001',
  'tuyen-dung-lap-trinh-vien-frontend':         'J002',
  'tuyen-dung-lap-trinh-vien-mobile':           'J003',
  'tuyen-dung-ky-su-qa-testing':                'J004',
  'tuyen-dung-ky-su-devops':                    'J005',
  'tuyen-dung-chuyen-gia-ai-automation':        'J006',
  'tuyen-dung-chuyen-vien-tu-van-trien-khai-erp': 'CS01',
  'tuyen-dung-chuyen-vien-trien-khai-ke-toan':  'J008',
  'tuyen-dung-chuyen-vien-trien-khai-san-xuat': 'J009',
  'tuyen-dung-chuyen-vien-trien-khai-nhan-su':  'J010',
  'tuyen-dung-business-analyst':                'J011',
  'tuyen-dung-chuyen-vien-dao-tao-erp':         'J012',
  'tuyen-dung-truong-nhom-trien-khai':          'J013',
  'tuyen-dung-chuyen-vien-kinh-doanh':          'J014',
  'tuyen-dung-chuyen-vien-phat-trien-thi-truong':'J015',
  'tuyen-dung-chuyen-vien-digital-marketing':   'J016',
  'tuyen-dung-chuyen-vien-seo-content':         'J017',
  'tuyen-dung-chuyen-vien-pre-sales':           'J018',
  'tuyen-dung-chuyen-vien-ho-tro-ky-thuat':    'J019',
  'tuyen-dung-chuyen-vien-ho-tro-nghiep-vu':   'J020',
  'tuyen-dung-chuyen-vien-cham-soc-khach-hang':'J021',
  'tuyen-dung-quan-ly-du-an-erp':              'J022',
  'tuyen-dung-truong-nhom-phat-trien':         'J023',
  'tuyen-dung-truong-phong-kinh-doanh':        'J024',
  'tuyen-dung-truong-phong-ky-thuat':          'J025',
  'tuyen-dung-ke-toan-tong-hop':               'J026',
  'tuyen-dung-nhan-vien-hanh-chinh-nhan-su':   'J027',
  'tuyen-dung-chuyen-vien-tuyen-dung-noi-bo':  'J028',
  'tuyen-dung-chuyen-vien-thiet-ke-ui-ux':     'J029',
  'tuyen-dung-chuyen-vien-thiet-ke-do-hoa':    'J030',
};

// ── CSS replacement ───────────────────────────────────────────────────────────
const OLD_HERO_CSS = [
  /\.hero-hiring\{width:100%;border-radius:16px;overflow:hidden;margin-bottom:32px;background:#0d5c38;\}/,
  /\.hero-hiring img\{width:100%;height:auto;display:block;\}/,
];

const NEW_HERO_CSS = `
    .hero-hiring{position:relative;width:100%;border-radius:16px;overflow:hidden;margin-bottom:32px;background:#0d5c38;}
    .hero-hiring img{width:100%;height:auto;display:block;}
    .hero-job-title-overlay{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:46%;text-align:center;color:#fff;font-size:clamp(12px,1.7vw,19px);font-weight:800;line-height:1.4;text-shadow:0 2px 10px rgba(0,0,0,.85),0 0 30px rgba(0,0,0,.6);pointer-events:none;padding:4px 6px;}
    .hero-job-status{position:absolute;top:6%;right:3%;pointer-events:none;}
    .hb-badge{width:72px;height:72px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:9.5px;font-weight:800;color:#fff;line-height:1.3;text-align:center;clip-path:polygon(50% 0%,59% 28%,90% 8%,72% 35%,100% 42%,74% 57%,88% 88%,61% 72%,54% 100%,41% 72%,14% 88%,28% 57%,0% 42%,28% 35%,10% 8%,41% 28%);}
    .hb-active{background:#00A651;animation:hb-pg 1.6s ease-in-out infinite;}
    .hb-hot{background:#dc2626;animation:hb-pr 1.6s ease-in-out infinite;}
    .hb-closed{background:rgba(80,80,80,.82);clip-path:none;border-radius:50%;}
    @keyframes hb-pg{0%,100%{filter:drop-shadow(0 0 2px rgba(0,166,81,.5));}50%{filter:drop-shadow(0 0 14px rgba(0,166,81,1));}}
    @keyframes hb-pr{0%,100%{filter:drop-shadow(0 0 2px rgba(220,38,38,.5));}50%{filter:drop-shadow(0 0 14px rgba(220,38,38,1));}}`
  .trim();

// ── Hero HTML replacement ─────────────────────────────────────────────────────
// Match: <div class="hero-hiring"><img ... onerror="..."></div>
const HERO_IMG_RE = /(<div class="hero-hiring">)(<img [^>]+>)(<\/div>)/;

function buildHeroHtml(imgTag, jobTitle) {
  return `<div class="hero-hiring">\n          ${imgTag}\n          <div class="hero-job-title-overlay" id="hero-job-title">${jobTitle}</div>\n          <div class="hero-job-status" id="hero-job-status"></div>\n        </div>`;
}

// ── loadJobStatus patch — insert hero overlay update block ────────────────────
const HERO_OVERLAY_MARKER = '// ―― Hero banner overlay: sync from GAS ――';
const HERO_OVERLAY_CODE = `
      // ―― Hero banner overlay: sync from GAS ――
      const heroTitle = document.getElementById('hero-job-title');
      if (heroTitle && job.title) heroTitle.textContent = job.title;
      const heroStatus = document.getElementById('hero-job-status');
      if (heroStatus) {
        const hbMap = {
          ACTIVE:{cls:'hb-active',icon:'✅',txt:'Đang tuyển'},
          HOT:   {cls:'hb-hot',   icon:'🔥',txt:'Tuyển gấp'},
          PAUSED:{cls:'hb-closed',icon:'⏸',txt:'Tạm dừng'},
          CLOSED:{cls:'hb-closed',icon:'🔒',txt:'Đã đóng'}
        };
        const hb = hbMap[job.status] || hbMap.ACTIVE;
        heroStatus.innerHTML = '<div class="hb-badge '+hb.cls+'"><span style="font-size:15px;display:block;">'+hb.icon+'</span>'+hb.txt+'</div>';
      }`;

// ── Process a single HTML file ────────────────────────────────────────────────
function processHtml(htmlPath, jobId, jobTitle) {
  let html = fs.readFileSync(htmlPath, 'utf8');

  // 1. Replace old hero CSS lines with new block
  //    Find the two CSS lines and replace them together
  const heroCssRe = /([ \t]*)\.hero-hiring\{[^\}]+\}\n([ \t]*)\.hero-hiring img\{[^\}]+\}/;
  if (heroCssRe.test(html)) {
    html = html.replace(heroCssRe, NEW_HERO_CSS);
  } else {
    // Try single-line variants (spaces may differ)
    html = html.replace(/\.hero-hiring\{width:100%;border-radius:16px;overflow:hidden;margin-bottom:32px;background:#0d5c38;\}/, '');
    html = html.replace(/\.hero-hiring img\{width:100%;height:auto;display:block;\}/, NEW_HERO_CSS);
  }

  // 2. Replace hero HTML — add overlay divs if not already there
  if (!html.includes('id="hero-job-title"') && HERO_IMG_RE.test(html)) {
    html = html.replace(HERO_IMG_RE, (_, open, imgTag, close) => {
      return buildHeroHtml(imgTag, jobTitle || '');
    });
  }

  // 3. Patch loadJobStatus — add hero overlay block before the button patch
  if (!html.includes(HERO_OVERLAY_MARKER)) {
    html = html.replace(
      /(\s*\/\/ ―― Live: update apply buttons with correct job id\/title ――)/,
      HERO_OVERLAY_CODE + '$1'
    );
  }

  fs.writeFileSync(htmlPath, html, 'utf8');
}

// ── Update news-data.json with job_id ─────────────────────────────────────────
function updateNewsData() {
  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  let count = 0;
  data.forEach(d => {
    const jid = SLUG_TO_ID[d.slug];
    if (jid) { d.job_id = jid; count++; }
  });
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
  console.log(`news-data.json: added job_id to ${count} entries`);
}

// ── Main ─────────────────────────────────────────────────────────────────────
// Read titles from existing HTML files' h1 tags
function getJobTitle(html) {
  const m = html.match(/<h1[^>]*>([^<]+)<\/h1>/);
  return m ? m[1].trim() : '';
}

let ok = 0, skip = 0;
for (const [slug, jobId] of Object.entries(SLUG_TO_ID)) {
  const htmlPath = path.join(HTML_DIR, slug + '.html');
  if (!fs.existsSync(htmlPath)) { console.log(`SKIP ${jobId} — ${slug}.html not found`); skip++; continue; }
  const html = fs.readFileSync(htmlPath, 'utf8');
  const title = getJobTitle(html);
  processHtml(htmlPath, jobId, title);
  console.log(`OK   ${jobId} | ${title.substring(0, 50)}`);
  ok++;
}

updateNewsData();
console.log(`\nDone: ${ok} updated, ${skip} skipped.`);
