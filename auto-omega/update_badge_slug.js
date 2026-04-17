#!/usr/bin/env node
/**
 * update_badge_slug.js
 * 1. Replace starburst clip-path badge → red pill + box-shadow pulse (no icons)
 * 2. Switch all 30 job HTML files from Job_ID to slug as primary identifier
 * 3. Update tin-tuc.html badge CSS similarly
 * Chạy: node auto-omega/update_badge_slug.js
 */

const fs   = require('fs');
const path = require('path');

const ROOT_DIR  = path.join(__dirname, '..');
const HTML_DIR  = path.join(ROOT_DIR, 'tin-tuc');

// Slug → job_id mapping (keep for reference / reverse lookup)
const SLUG_TO_ID = {
  'tuyen-dung-lap-trinh-vien-backend':            'J001',
  'tuyen-dung-lap-trinh-vien-frontend':           'J002',
  'tuyen-dung-lap-trinh-vien-mobile':             'J003',
  'tuyen-dung-ky-su-qa-testing':                  'J004',
  'tuyen-dung-ky-su-devops':                      'J005',
  'tuyen-dung-chuyen-gia-ai-automation':          'J006',
  'tuyen-dung-chuyen-vien-tu-van-trien-khai-erp': 'CS01',
  'tuyen-dung-chuyen-vien-trien-khai-ke-toan':    'J008',
  'tuyen-dung-chuyen-vien-trien-khai-san-xuat':   'J009',
  'tuyen-dung-chuyen-vien-trien-khai-nhan-su':    'J010',
  'tuyen-dung-business-analyst':                  'J011',
  'tuyen-dung-chuyen-vien-dao-tao-erp':           'J012',
  'tuyen-dung-truong-nhom-trien-khai':            'J013',
  'tuyen-dung-chuyen-vien-kinh-doanh':            'J014',
  'tuyen-dung-chuyen-vien-phat-trien-thi-truong': 'J015',
  'tuyen-dung-chuyen-vien-digital-marketing':     'J016',
  'tuyen-dung-chuyen-vien-seo-content':           'J017',
  'tuyen-dung-chuyen-vien-pre-sales':             'J018',
  'tuyen-dung-chuyen-vien-ho-tro-ky-thuat':       'J019',
  'tuyen-dung-chuyen-vien-ho-tro-nghiep-vu':      'J020',
  'tuyen-dung-chuyen-vien-cham-soc-khach-hang':   'J021',
  'tuyen-dung-quan-ly-du-an-erp':                 'J022',
  'tuyen-dung-truong-nhom-phat-trien':            'J023',
  'tuyen-dung-truong-phong-kinh-doanh':           'J024',
  'tuyen-dung-truong-phong-ky-thuat':             'J025',
  'tuyen-dung-ke-toan-tong-hop':                  'J026',
  'tuyen-dung-nhan-vien-hanh-chinh-nhan-su':      'J027',
  'tuyen-dung-chuyen-vien-tuyen-dung-noi-bo':     'J028',
  'tuyen-dung-chuyen-vien-thiet-ke-ui-ux':        'J029',
  'tuyen-dung-chuyen-vien-thiet-ke-do-hoa':       'J030',
};

// ── New badge CSS for individual job pages ────────────────────────────────────
const OLD_HB_CSS_RE = /\.hb-badge\{[^}]+\}\s*\.hb-active\{[^}]+\}\s*\.hb-hot\{[^}]+\}\s*\.hb-closed\{[^}]+\}\s*@keyframes hb-pg\{[\s\S]*?\}\s*@keyframes hb-pr\{[\s\S]*?\}/;

const NEW_HB_CSS =
  '.hb-badge{display:inline-block;padding:5px 10px;border-radius:6px;font-size:10px;font-weight:800;color:#fff;white-space:nowrap;line-height:1.3;text-align:center;box-shadow:0 2px 6px rgba(0,0,0,.25);}' +
  '.hb-active,.hb-hot{background:#dc2626;animation:hb-pulse 1.4s ease-in-out infinite;}' +
  '.hb-closed{background:rgba(70,70,70,.82);}' +
  '@keyframes hb-pulse{0%,100%{box-shadow:0 0 0 0 rgba(220,38,38,.7);}50%{box-shadow:0 0 0 9px rgba(220,38,38,0);}}';

// Old hbMap line (with icons)
const OLD_HBMAP_RE = /const hbMap\s*=\s*\{[\s\S]*?ACTIVE:.*?CLOSED:.*?\};/;
const NEW_HBMAP =
  "const hbMap = {ACTIVE:{cls:'hb-active',txt:'\\u0110ang tuy\\u1ec3n'},HOT:{cls:'hb-hot',txt:'Tuy\\u1ec3n g\\u1ea5p'},PAUSED:{cls:'hb-closed',txt:'T\\u1ea1m d\\u1eebng'},CLOSED:{cls:'hb-closed',txt:'\\u0110\\u00e3 \\u0111\\u00f3ng'}};";

// Old heroStatus.innerHTML line (with icon span)
const OLD_HERO_HTML_RE = /heroStatus\.innerHTML\s*=\s*'<div class="hb-badge '[\s\S]*?'<\/div>'[\s\S]*?;/;
const NEW_HERO_HTML =
  "heroStatus.innerHTML = '<div class=\"hb-badge '+hb.cls+'\">'+ hb.txt +'</div>';";

// ── New badge CSS for tin-tuc.html ────────────────────────────────────────────
const OLD_CJI_CSS_RE = /\.cji-badge\{[^}]+\}\s*\.cji-active\{[^}]+\}\s*\.cji-hot\{[^}]+\}\s*\.cji-closed\{[^}]+\}\s*@keyframes cji-pg\{[\s\S]*?\}\s*@keyframes cji-pr\{[\s\S]*?\}/;

const NEW_CJI_CSS =
  '.cji-badge{display:inline-block;padding:3px 7px;border-radius:5px;font-size:9px;font-weight:800;color:#fff;white-space:nowrap;}' +
  '.cji-active,.cji-hot{background:#dc2626;animation:cji-pulse 1.4s ease-in-out infinite;}' +
  '.cji-closed{background:rgba(80,80,80,.82);}' +
  '@keyframes cji-pulse{0%,100%{box-shadow:0 0 0 0 rgba(220,38,38,.65);}50%{box-shadow:0 0 0 6px rgba(220,38,38,0);}}';

// ── Process individual job HTML files ─────────────────────────────────────────
function processJobHtml(slug, jobId) {
  const htmlPath = path.join(HTML_DIR, slug + '.html');
  if (!fs.existsSync(htmlPath)) {
    console.log(`SKIP ${jobId} — ${slug}.html not found`);
    return false;
  }

  let html = fs.readFileSync(htmlPath, 'utf8');
  let changed = false;

  // 1. Replace badge CSS (starburst → pill)
  if (OLD_HB_CSS_RE.test(html)) {
    html = html.replace(OLD_HB_CSS_RE, NEW_HB_CSS);
    changed = true;
  } else if (!html.includes('hb-pulse')) {
    console.warn(`  WARN CSS not matched for ${slug}`);
  }

  // 2. Replace hbMap (remove icons)
  if (OLD_HBMAP_RE.test(html)) {
    html = html.replace(OLD_HBMAP_RE, NEW_HBMAP);
    changed = true;
  }

  // 3. Replace heroStatus.innerHTML (remove icon span)
  if (OLD_HERO_HTML_RE.test(html)) {
    html = html.replace(OLD_HERO_HTML_RE, NEW_HERO_HTML);
    changed = true;
  }

  // 4. Switch loadJobStatus('JOB_ID') → loadJobStatus('SLUG')
  //    Match both quoted forms
  const loadStatusRe = new RegExp(`loadJobStatus\\(['"]${jobId}['"]\\)`, 'g');
  if (loadStatusRe.test(html)) {
    html = html.replace(new RegExp(`loadJobStatus\\(['"]${jobId}['"]\\)`, 'g'), `loadJobStatus('${slug}')`);
    changed = true;
  }
  // Also replace loadJobStatus at bottom of page (onload call)
  // Some pages may already have slug — skip those
  // Additionally, check for any remaining Job_ID in loadJobStatus
  const anyJobIdRe = new RegExp(`loadJobStatus\\(['"]${jobId}['"]\\)`, 'g');
  if (anyJobIdRe.test(html)) {
    html = html.replace(anyJobIdRe, `loadJobStatus('${slug}')`);
    changed = true;
  }

  // 5. Switch openApply('JOB_ID', ...) → openApply('SLUG', ...)
  //    Static button onclicks
  const openApplyRe = new RegExp(`openApply\\(['"]${jobId}['"]`, 'g');
  if (openApplyRe.test(html)) {
    html = html.replace(new RegExp(`openApply\\(['"]${jobId}['"]`, 'g'), `openApply('${slug}'`);
    changed = true;
  }

  // 6. In loadJobStatus() dynamic button patch — use job.slug instead of job.id
  //    Old: btn.setAttribute('onclick', "openApply('" + job.id + "','" + job.title...)
  //    New: btn.setAttribute('onclick', "openApply('" + job.slug + "','" + job.title...)
  if (html.includes("openApply('\" + job.id + \"'")) {
    html = html.replace(
      /openApply\('"\s*\+\s*job\.id\s*\+\s*"'/g,
      "openApply('\" + job.slug + \"'"
    );
    changed = true;
  }
  // Also handle single-quote version
  if (html.includes("openApply('\" + job.id + \"',")) {
    html = html.replace(
      /openApply\('"\s*\+\s*job\.id\s*\+\s*"',/g,
      "openApply('\" + job.slug + \"',"
    );
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(htmlPath, html, 'utf8');
  }
  return changed;
}

// ── Process tin-tuc.html ──────────────────────────────────────────────────────
function processTinTuc() {
  const htmlPath = path.join(ROOT_DIR, 'tin-tuc.html');
  let html = fs.readFileSync(htmlPath, 'utf8');
  let changed = false;

  // Replace cji badge CSS
  if (OLD_CJI_CSS_RE.test(html)) {
    html = html.replace(OLD_CJI_CSS_RE, NEW_CJI_CSS);
    changed = true;
  } else if (!html.includes('cji-pulse')) {
    console.warn('  WARN cji CSS not matched in tin-tuc.html');
  }

  // Remove icons from cjiMap in loadJobCardStatuses()
  // Old: ACTIVE:{cls:'cji-active',icon:'✅',txt:'Đang tuyển'}, ...
  // New: ACTIVE:{cls:'cji-active',txt:'Đang tuyển'}, ...
  const OLD_CJI_MAP_RE = /const cjiMap\s*=\s*\{[\s\S]*?ACTIVE:.*?CLOSED:.*?\};/;
  if (OLD_CJI_MAP_RE.test(html)) {
    const newCjiMap =
      "const cjiMap = {" +
      "ACTIVE:{cls:'cji-active',txt:'\\u0110ang tuy\\u1ec3n'}," +
      "HOT:{cls:'cji-hot',txt:'Tuy\\u1ec3n g\\u1ea5p'}," +
      "PAUSED:{cls:'cji-closed',txt:'T\\u1ea1m d\\u1eebng'}," +
      "CLOSED:{cls:'cji-closed',txt:'\\u0110\\u00e3 \\u0111\\u00f3ng'}" +
      "};";
    html = html.replace(OLD_CJI_MAP_RE, newCjiMap);
    changed = true;
  }

  // Remove icon spans from cji badge innerHTML
  // Old: el.innerHTML = '<span class="cji-badge '+cj.cls+'"><span ...>'+cj.icon+'</span>'+cj.txt+'</span>';
  // New: el.innerHTML = '<span class="cji-badge '+cj.cls+'">'+cj.txt+'</span>';
  const OLD_CJI_HTML_RE = /el\.innerHTML\s*=\s*'<span class="cji-badge '[\s\S]*?'<\/span>'[\s\S]*?;/;
  if (OLD_CJI_HTML_RE.test(html)) {
    html = html.replace(OLD_CJI_HTML_RE,
      "el.innerHTML = '<span class=\"cji-badge '+cj.cls+'\">'+cj.txt+'</span>';");
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(htmlPath, html, 'utf8');
    console.log('OK   tin-tuc.html updated');
  } else {
    console.log('SKIP tin-tuc.html — nothing to change');
  }
}

// ── Main ─────────────────────────────────────────────────────────────────────
let ok = 0, skip = 0;

for (const [slug, jobId] of Object.entries(SLUG_TO_ID)) {
  const result = processJobHtml(slug, jobId);
  if (result) {
    console.log(`OK   ${jobId} → slug:${slug}`);
    ok++;
  } else {
    skip++;
  }
}

processTinTuc();

console.log(`\nDone: ${ok} job pages updated, ${skip} skipped.`);
