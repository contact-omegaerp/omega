#!/usr/bin/env node
/**
 * fix_omega_listing_slugs.js
 * Update tuyen-dung-omega.html to use slug instead of Job_ID as primary identifier:
 * - data-job-id="J001" → data-slug="tuyen-dung-..."
 * - id="td-badge-J001" → id="td-badge-tuyen-dung-..."
 * - openApply('J001',...) → openApply('tuyen-dung-...',...)
 * - loadAllStatus() jobMap indexed by slug, uses data-slug attribute
 * Chạy: node auto-omega/fix_omega_listing_slugs.js
 */

const fs   = require('fs');
const path = require('path');

const FILE = path.join(__dirname, '..', 'tin-tuc', 'tuyen-dung-omega.html');

// id → slug mapping (reverse of SLUG_TO_ID)
const ID_TO_SLUG = {
  'J001': 'tuyen-dung-lap-trinh-vien-backend',
  'J002': 'tuyen-dung-lap-trinh-vien-frontend',
  'J003': 'tuyen-dung-lap-trinh-vien-mobile',
  'J004': 'tuyen-dung-ky-su-qa-testing',
  'J005': 'tuyen-dung-ky-su-devops',
  'J006': 'tuyen-dung-chuyen-gia-ai-automation',
  'CS01': 'tuyen-dung-chuyen-vien-tu-van-trien-khai-erp',
  'J008': 'tuyen-dung-chuyen-vien-trien-khai-ke-toan',
  'J009': 'tuyen-dung-chuyen-vien-trien-khai-san-xuat',
  'J010': 'tuyen-dung-chuyen-vien-trien-khai-nhan-su',
  'J011': 'tuyen-dung-business-analyst',
  'J012': 'tuyen-dung-chuyen-vien-dao-tao-erp',
  'J013': 'tuyen-dung-truong-nhom-trien-khai',
  'J014': 'tuyen-dung-chuyen-vien-kinh-doanh',
  'J015': 'tuyen-dung-chuyen-vien-phat-trien-thi-truong',
  'J016': 'tuyen-dung-chuyen-vien-digital-marketing',
  'J017': 'tuyen-dung-chuyen-vien-seo-content',
  'J018': 'tuyen-dung-chuyen-vien-pre-sales',
  'J019': 'tuyen-dung-chuyen-vien-ho-tro-ky-thuat',
  'J020': 'tuyen-dung-chuyen-vien-ho-tro-nghiep-vu',
  'J021': 'tuyen-dung-chuyen-vien-cham-soc-khach-hang',
  'J022': 'tuyen-dung-quan-ly-du-an-erp',
  'J023': 'tuyen-dung-truong-nhom-phat-trien',
  'J024': 'tuyen-dung-truong-phong-kinh-doanh',
  'J025': 'tuyen-dung-truong-phong-ky-thuat',
  'J026': 'tuyen-dung-ke-toan-tong-hop',
  'J027': 'tuyen-dung-nhan-vien-hanh-chinh-nhan-su',
  'J028': 'tuyen-dung-chuyen-vien-tuyen-dung-noi-bo',
  'J029': 'tuyen-dung-chuyen-vien-thiet-ke-ui-ux',
  'J030': 'tuyen-dung-chuyen-vien-thiet-ke-do-hoa',
};

let html = fs.readFileSync(FILE, 'utf8');

// 1. data-job-id="JXXX" → data-slug="slug"
for (const [id, slug] of Object.entries(ID_TO_SLUG)) {
  html = html.replace(new RegExp(`data-job-id="${id}"`, 'g'), `data-slug="${slug}"`);
}

// 2. id="td-badge-JXXX" → id="td-badge-slug"
for (const [id, slug] of Object.entries(ID_TO_SLUG)) {
  html = html.replace(new RegExp(`id="td-badge-${id}"`, 'g'), `id="td-badge-${slug}"`);
}

// 3. openApply('JXXX', → openApply('slug',
for (const [id, slug] of Object.entries(ID_TO_SLUG)) {
  html = html.replace(new RegExp(`openApply\\('${id}'`, 'g'), `openApply('${slug}'`);
}

// 4. Fix loadAllStatus() to use slug-based jobMap and data-slug attribute
//    Old: const jobMap = {}; jobs.forEach(j => { jobMap[j.id] = j; });
//    New: const jobMap = {}; jobs.forEach(j => { jobMap[j.slug] = j; });
html = html.replace(
  /jobMap\[j\.id\]\s*=\s*j;/g,
  'jobMap[j.slug] = j;'
);

//    Old: const col = document.querySelector(`[data-job-id="${jid}"]`);
//    New: const col = document.querySelector(`[data-slug="${jid}"]`);
html = html.replace(
  /querySelector\(`\[data-job-id="\$\{jid\}"\]`\)/g,
  'querySelector(`[data-slug="${jid}"]`)'
);
// Also handle single-quote version
html = html.replace(
  /querySelector\('\[data-job-id="'\s*\+\s*jid\s*\+\s*'"\]'\)/g,
  "querySelector('[data-slug=\"' + jid + '\"]')"
);

//    Old: document.querySelectorAll('[data-job-id]')
//    New: document.querySelectorAll('[data-slug]')
html = html.replace(
  /querySelectorAll\('\[data-job-id\]'\)/g,
  "querySelectorAll('[data-slug]')"
);
html = html.replace(
  /querySelectorAll\(`\[data-job-id\]`\)/g,
  'querySelectorAll(`[data-slug]`)'
);

//    Old: col.dataset.jobId
//    New: col.dataset.slug
html = html.replace(/col\.dataset\.jobId/g, 'col.dataset.slug');

//    Old: td-badge-${j.id} or td-badge-${jid}
//    New: td-badge-${j.slug} or td-badge-${jid}
html = html.replace(/td-badge-\$\{j\.id\}/g, 'td-badge-${j.slug}');

// Also fix the apply buttons in loadAllStatus if they use j.id
// openApply('"+j.id+"' → openApply('"+j.slug+"'
html = html.replace(
  /openApply\('"\s*\+\s*j\.id\s*\+\s*"'/g,
  "openApply('\" + j.slug + \"'"
);
// job.id in button setAttribute
html = html.replace(
  /openApply\('"\s*\+\s*job\.id\s*\+\s*"'/g,
  "openApply('\" + job.slug + \"'"
);

fs.writeFileSync(FILE, html, 'utf8');
console.log('Done: tuyen-dung-omega.html updated to use slug-based identifiers.');
