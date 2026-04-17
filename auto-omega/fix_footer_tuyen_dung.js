#!/usr/bin/env node
/**
 * fix_footer_tuyen_dung.js
 * Cập nhật link "Tuyển dụng" trong footer của tất cả HTML thành tuyen-dung-omega.html
 * - Root-level files:      tin-tuc.html#tuyen-dung   → tin-tuc/tuyen-dung-omega.html
 * - Subdir files (1 level): ../tin-tuc.html#tuyen-dung → ../tin-tuc/tuyen-dung-omega.html
 * - tin-tuc/ files:         ../tin-tuc.html#tuyen-dung → tuyen-dung-omega.html
 */

const fs   = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// Collect all HTML files grouped by depth
function collectHtml(dir, depth) {
  const results = [];
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (entry === 'node_modules' || entry.startsWith('.')) continue;
    if (fs.statSync(full).isDirectory() && depth > 0) {
      results.push(...collectHtml(full, depth - 1));
    } else if (entry.endsWith('.html')) {
      results.push(full);
    }
  }
  return results;
}

const allHtml = collectHtml(ROOT, 2);

let ok = 0;
for (const filePath of allHtml) {
  let html = fs.readFileSync(filePath, 'utf8');
  const rel = path.relative(ROOT, filePath).replace(/\\/g, '/');
  const depth = rel.split('/').length - 1; // 0 = root, 1 = subdir, etc.

  let changed = false;

  if (rel.startsWith('tin-tuc/') && depth === 1) {
    // tin-tuc/*.html → tuyen-dung-omega.html (same folder)
    if (html.includes('../tin-tuc.html#tuyen-dung')) {
      html = html.replaceAll('../tin-tuc.html#tuyen-dung', 'tuyen-dung-omega.html');
      changed = true;
    }
  } else if (depth === 1) {
    // giai-phap/, khach-hang/, san-pham/, bizcards/, etc.
    if (html.includes('../tin-tuc.html#tuyen-dung')) {
      html = html.replaceAll('../tin-tuc.html#tuyen-dung', '../tin-tuc/tuyen-dung-omega.html');
      changed = true;
    }
  } else if (depth === 0) {
    // root-level
    if (html.includes('tin-tuc.html#tuyen-dung')) {
      html = html.replaceAll('tin-tuc.html#tuyen-dung', 'tin-tuc/tuyen-dung-omega.html');
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`OK   ${rel}`);
    ok++;
  }
}

console.log(`\nDone: ${ok} files updated.`);
