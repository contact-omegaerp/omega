#!/usr/bin/env node
/**
 * fix_badge_remnants.js
 * Fix remaining issues after update_badge_slug.js:
 * 1. Remove trailing CSS garbage from old @keyframes
 * 2. Replace multi-line hbMap (with icons) → single-line (no icons)
 * Chạy: node auto-omega/fix_badge_remnants.js
 */

const fs   = require('fs');
const path = require('path');

const HTML_DIR = path.join(__dirname, '..', 'tin-tuc');

const SLUGS = [
  'tuyen-dung-lap-trinh-vien-backend',
  'tuyen-dung-lap-trinh-vien-frontend',
  'tuyen-dung-lap-trinh-vien-mobile',
  'tuyen-dung-ky-su-qa-testing',
  'tuyen-dung-ky-su-devops',
  'tuyen-dung-chuyen-gia-ai-automation',
  'tuyen-dung-chuyen-vien-tu-van-trien-khai-erp',
  'tuyen-dung-chuyen-vien-trien-khai-ke-toan',
  'tuyen-dung-chuyen-vien-trien-khai-san-xuat',
  'tuyen-dung-chuyen-vien-trien-khai-nhan-su',
  'tuyen-dung-business-analyst',
  'tuyen-dung-chuyen-vien-dao-tao-erp',
  'tuyen-dung-truong-nhom-trien-khai',
  'tuyen-dung-chuyen-vien-kinh-doanh',
  'tuyen-dung-chuyen-vien-phat-trien-thi-truong',
  'tuyen-dung-chuyen-vien-digital-marketing',
  'tuyen-dung-chuyen-vien-seo-content',
  'tuyen-dung-chuyen-vien-pre-sales',
  'tuyen-dung-chuyen-vien-ho-tro-ky-thuat',
  'tuyen-dung-chuyen-vien-ho-tro-nghiep-vu',
  'tuyen-dung-chuyen-vien-cham-soc-khach-hang',
  'tuyen-dung-quan-ly-du-an-erp',
  'tuyen-dung-truong-nhom-phat-trien',
  'tuyen-dung-truong-phong-kinh-doanh',
  'tuyen-dung-truong-phong-ky-thuat',
  'tuyen-dung-ke-toan-tong-hop',
  'tuyen-dung-nhan-vien-hanh-chinh-nhan-su',
  'tuyen-dung-chuyen-vien-tuyen-dung-noi-bo',
  'tuyen-dung-chuyen-vien-thiet-ke-ui-ux',
  'tuyen-dung-chuyen-vien-thiet-ke-do-hoa',
];

// New compact hbMap (no icons)
const NEW_HBMAP =
  "        const hbMap = {ACTIVE:{cls:'hb-active',txt:'Đang tuyển'},HOT:{cls:'hb-hot',txt:'Tuyển gấp'},PAUSED:{cls:'hb-closed',txt:'Tạm dừng'},CLOSED:{cls:'hb-closed',txt:'Đã đóng'}};";

let ok = 0;
for (const slug of SLUGS) {
  const htmlPath = path.join(HTML_DIR, slug + '.html');
  if (!fs.existsSync(htmlPath)) continue;

  let html = fs.readFileSync(htmlPath, 'utf8');
  let changed = false;

  // 1. Remove leftover CSS garbage after @keyframes hb-pulse block
  //    The garbage is: }}50%{filter:drop-shadow(...);}}  or similar
  //    After hb-pulse closing }}, there might be leftover from old keyframes
  if (html.includes('50%{filter:drop-shadow')) {
    // Remove the old @keyframes pg and pr fragments that appear after hb-pulse
    html = html.replace(/\}\}50%\{filter:drop-shadow[\s\S]*?\}\}/g, '}}');
    changed = true;
  }

  // 2. Replace multi-line hbMap block (with icons) with new single-line (no icons)
  //    Pattern: const hbMap = { ... CLOSED:... };
  //    Use a greedy match across lines
  const hbMapStart = html.indexOf("const hbMap = {");
  if (hbMapStart !== -1 && html.includes("icon:'✅'")) {
    // Find the closing }; of this hbMap object
    let depth = 0;
    let i = hbMapStart + "const hbMap = {".length - 1; // at the {
    let end = -1;
    for (; i < html.length; i++) {
      if (html[i] === '{') depth++;
      else if (html[i] === '}') {
        depth--;
        if (depth === 0) {
          // find the ; after it
          let j = i + 1;
          while (j < html.length && (html[j] === ' ' || html[j] === '\t')) j++;
          if (html[j] === ';') { end = j; break; }
          end = i;
          break;
        }
      }
    }
    if (end !== -1) {
      // Find the start of the line (indentation before "const hbMap")
      let lineStart = hbMapStart;
      while (lineStart > 0 && html[lineStart - 1] !== '\n') lineStart--;
      const oldBlock = html.slice(lineStart, end + 1);
      html = html.slice(0, lineStart) + NEW_HBMAP + html.slice(end + 1);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(htmlPath, html, 'utf8');
    console.log(`OK   ${slug}`);
    ok++;
  }
}

console.log(`\nDone: ${ok} files fixed.`);
