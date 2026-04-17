#!/usr/bin/env node
/**
 * fix_job_pages_v3.js
 * Fix 3 issues across all 30 job HTML pages:
 * 1. Email: hr@ → info@omega.com.vn + add id for dynamic update from Email_Reply_To
 * 2. Spacing: keep mb-3 on main-apply-btn when disabled (closed/paused)
 * 3. Hero title: width 46%→80%, add fitHeroTitle() JS to auto-size font
 */

const fs   = require('fs');
const path = require('path');

const TIN_TUC = path.join(__dirname, '..', 'tin-tuc');
const SLUGS = fs.readdirSync(TIN_TUC)
  .filter(f => f.startsWith('tuyen-dung-') && f.endsWith('.html') && f !== 'tuyen-dung-omega.html');

// ── fitHeroTitle JS snippet (injected once per file) ─────────────────────────
const FIT_TITLE_MARKER = '// ―― fitHeroTitle ――';
const FIT_TITLE_JS = `
  // ―― fitHeroTitle ――
  function fitHeroTitle() {
    const el = document.getElementById('hero-job-title');
    const hero = el && el.closest('.hero-hiring');
    if (!el || !hero) return;
    const maxW = hero.clientWidth * 0.76;
    el.style.whiteSpace = 'nowrap';
    let size = 28;
    el.style.fontSize = size + 'px';
    while (el.scrollWidth < maxW * 0.88 && size < 38) { size += 0.5; el.style.fontSize = size + 'px'; }
    while (el.scrollWidth > maxW && size > 9) { size -= 0.5; el.style.fontSize = size + 'px'; }
    el.style.whiteSpace = '';
  }`;

let ok = 0;
for (const f of SLUGS) {
  const p = path.join(TIN_TUC, f);
  let html = fs.readFileSync(p, 'utf8');
  let changed = false;

  // ── 1a. Static email in sidebar: hr@ → info@ ──────────────────────────────
  if (html.includes('hr@omega.com.vn')) {
    html = html.replaceAll('hr@omega.com.vn', 'info@omega.com.vn');
    changed = true;
  }

  // ── 1b. Add id="jm-email" to the sidebar email strong (if not yet done) ──
  //    <strong>info@omega.com.vn</strong>  (envelope icon row)
  if (!html.includes('id="jm-email"') && html.includes('<strong>info@omega.com.vn</strong>')) {
    html = html.replace('<strong>info@omega.com.vn</strong>', '<strong id="jm-email">info@omega.com.vn</strong>');
    changed = true;
  }

  // ── 1c. Dynamic update: add email update in loadJobStatus after salary-sidebar ──
  //    Insert after: if (salSide && job.salary) salSide.textContent = job.salary;
  const EMAIL_PATCH_MARKER = '// ―― email from GAS ――';
  if (!html.includes(EMAIL_PATCH_MARKER)) {
    html = html.replace(
      /const salSide\s*=\s*document\.getElementById\('jm-salary-sidebar'\);[^\n]+\n/,
      (match) => match +
        `      // ―― email from GAS ――\n` +
        `      const emailEl = document.getElementById('jm-email'); if (emailEl && job.email_reply_to) emailEl.textContent = job.email_reply_to;\n`
    );
    changed = true;
  }

  // ── 2. Button spacing: keep mb-3 when disabling main-apply-btn ────────────
  // Old: mainBtn.className = 'btn btn-secondary btn-lg w-100'
  // New: mainBtn.className = 'btn btn-secondary btn-lg w-100 mb-3'
  if (html.includes("mainBtn.className = 'btn btn-secondary btn-lg w-100'")) {
    html = html.replace(
      "mainBtn.className = 'btn btn-secondary btn-lg w-100'",
      "mainBtn.className = 'btn btn-secondary btn-lg w-100 mb-3'"
    );
    changed = true;
  }

  // ── 3a. Hero overlay width: 46% → 80% ────────────────────────────────────
  if (html.includes('width:46%;text-align:center')) {
    html = html.replace('width:46%;text-align:center', 'width:80%;text-align:center');
    changed = true;
  }

  // ── 3b. Hero font-size: remove fixed clamp, let fitHeroTitle() handle it ──
  //    Replace font-size:clamp(...) in the overlay CSS with a starting size
  if (html.includes('.hero-job-title-overlay{') && html.includes('font-size:clamp(12px,1.7vw,19px)')) {
    html = html.replace('font-size:clamp(12px,1.7vw,19px)', 'font-size:24px');
    changed = true;
  }

  // ── 3c. Inject fitHeroTitle() JS ─────────────────────────────────────────
  if (!html.includes(FIT_TITLE_MARKER)) {
    // Insert before the closing </script> of the last script block (where loadJobStatus is)
    html = html.replace(
      /(\s*async function loadJobStatus\(jobId\))/,
      FIT_TITLE_JS + '\n$1'
    );
    changed = true;
  }

  // ── 3d. Call fitHeroTitle() after hero title is updated from GAS ──────────
  //    After: if (heroTitle && job.title) heroTitle.textContent = job.title;
  if (!html.includes('fitHeroTitle()') && html.includes('heroTitle.textContent = job.title')) {
    html = html.replace(
      'if (heroTitle && job.title) heroTitle.textContent = job.title;',
      'if (heroTitle && job.title) { heroTitle.textContent = job.title; fitHeroTitle(); }'
    );
    changed = true;
  }

  // ── 3e. Also call fitHeroTitle() on DOMContentLoaded ─────────────────────
  const dcl = `document.addEventListener('DOMContentLoaded',function(){loadJobStatus(`;
  if (html.includes(dcl) && !html.includes('fitHeroTitle();document.addEventListener')) {
    html = html.replace(
      /(<script>document\.addEventListener\('DOMContentLoaded',function\(\)\{loadJobStatus\([^)]+\);\}\);)/,
      '<script>document.addEventListener(\'DOMContentLoaded\',function(){fitHeroTitle();loadJobStatus(' +
        html.match(/loadJobStatus\('([^']+)'\)/)?.[1] + '\');});'
    );
    // Simpler approach: insert fitHeroTitle() call just before loadJobStatus call on DOMContentLoaded
    // Reset and try a cleaner approach
    html = html.replace(
      /document\.addEventListener\('DOMContentLoaded',function\(\)\{loadJobStatus\(/,
      "document.addEventListener('DOMContentLoaded',function(){fitHeroTitle();loadJobStatus("
    );
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(p, html, 'utf8');
    console.log(`OK   ${f}`);
    ok++;
  }
}

console.log(`\nDone: ${ok} files updated.`);
