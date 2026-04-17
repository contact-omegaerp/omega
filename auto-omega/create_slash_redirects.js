#!/usr/bin/env node
/**
 * create_slash_redirects.js
 * Tạo SLUG/index.html redirect về ../SLUG.html
 * để xử lý URL trailing-slash từ Google cache cũ.
 */

const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const slugs = [
  'phan-mem-erp-tot-nhat',
  'he-thong-erp-2025-xu-huong-va-giai-phap-hieu-qua',
  'chuyen-doi-so-mobile-app',
  'erp-nganh-duoc-pham',
  'giai-phap-erp-nganh-go-va-noi-that',
  'phan-mem-erp-nganh-thuy-hai-san',
  'erp-nganh-fb',
  'erp-cho-nganh-co-khi-va-che-tao',
  'du-an-erp-la-gi',
  'quy-trinh-tu-van-trien-khai-cho-doanh-nghiep',
];

const CANONICAL_BASE = 'https://omega.com.vn';

let ok = 0;
for (const slug of slugs) {
  const srcFile = path.join(ROOT, `${slug}.html`);
  if (!fs.existsSync(srcFile)) { console.log(`SKIP  ${slug}.html (not found)`); continue; }

  const dir = path.join(ROOT, slug);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  const redirectHtml =
`<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8">
<title>Chuyển hướng...</title>
<meta http-equiv="refresh" content="0;url=../${slug}.html">
<link rel="canonical" href="${CANONICAL_BASE}/${slug}.html">
<script>window.location.replace('../${slug}.html');</script>
</head>
<body></body>
</html>
`;

  fs.writeFileSync(path.join(dir, 'index.html'), redirectHtml, 'utf8');
  console.log(`OK    ${slug}/index.html → ../${slug}.html`);
  ok++;
}

console.log(`\nDone: ${ok} redirect folders created.`);
