#!/usr/bin/env node
/**
 * fix_root_clones.js
 * Fix paths in root-level HTML clones that were copied from tin-tuc/ or giai-phap/.
 * Each x file is at root (depth 0), cloned from y at depth 1, so:
 *   "../something" → "something"         (remove one ../ level)
 *   "SLUG/..."     → "PARENT/SLUG/..."   (article images folder)
 *   "_tools/..."   → "PARENT/_tools/..." (shared tools folder)
 */

const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const pairs = [
  { x: 'phan-mem-erp-tot-nhat.html',                           slug: 'phan-mem-erp-tot-nhat',                           parent: 'tin-tuc' },
  { x: 'he-thong-erp-2025-xu-huong-va-giai-phap-hieu-qua.html', slug: 'he-thong-erp-2025-xu-huong-va-giai-phap-hieu-qua', parent: 'tin-tuc' },
  { x: 'chuyen-doi-so-mobile-app.html',                        slug: 'chuyen-doi-so-mobile-app',                        parent: 'tin-tuc' },
  { x: 'erp-nganh-duoc-pham.html',                             slug: 'erp-nganh-duoc-pham',                             parent: 'tin-tuc' },
  { x: 'giai-phap-erp-nganh-go-va-noi-that.html',              slug: 'giai-phap-erp-nganh-go-va-noi-that',              parent: 'giai-phap' },
  { x: 'phan-mem-erp-nganh-thuy-hai-san.html',                 slug: 'phan-mem-erp-nganh-thuy-hai-san',                 parent: 'tin-tuc' },
  { x: 'erp-nganh-fb.html',                                    slug: 'erp-nganh-fb',                                    parent: 'tin-tuc' },
  { x: 'erp-cho-nganh-co-khi-va-che-tao.html',                 slug: 'erp-cho-nganh-co-khi-va-che-tao',                 parent: 'tin-tuc' },
  { x: 'du-an-erp-la-gi.html',                                 slug: 'du-an-erp-la-gi',                                 parent: 'tin-tuc' },
  { x: 'quy-trinh-tu-van-trien-khai-cho-doanh-nghiep.html',   slug: 'quy-trinh-tu-van-trien-khai-cho-doanh-nghiep',   parent: 'tin-tuc' },
];

let ok = 0;
for (const { x, slug, parent } of pairs) {
  const filePath = path.join(ROOT, x);
  if (!fs.existsSync(filePath)) { console.log(`SKIP  ${x} (not found)`); continue; }

  let html = fs.readFileSync(filePath, 'utf8');

  // 1. Remove leading ../ in double-quoted attribute values
  html = html.replace(/="\.\.\/([^"]*)/g, '="$1');
  // 1b. Remove leading ../ in single-quoted attribute values
  html = html.replace(/='\.\.\/([^']*)/g, "='$1");
  // 1c. Remove leading ../ in CSS url()
  html = html.replace(/url\('\.\.\/([^')]*)\)/g, "url('$1)");
  html = html.replace(/url\("\.\.\/([^")]*)\)/g, 'url("$1)');

  // 2. Prefix article image folder with parent dir
  html = html.replace(new RegExp(`="${slug}/`, 'g'), `="${parent}/${slug}/`);
  html = html.replace(new RegExp(`='${slug}/`, 'g'), `='${parent}/${slug}/`);

  // 3. Prefix _tools/ with parent dir
  html = html.replace(/="_tools\//g, `="${parent}/_tools/`);
  html = html.replace(/='_tools\//g, `='${parent}/_tools/`);

  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`OK    ${x}`);
  ok++;
}

console.log(`\nDone: ${ok} files updated.`);
