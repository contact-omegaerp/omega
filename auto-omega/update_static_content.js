#!/usr/bin/env node
/**
 * update_static_content.js
 * Fetch toàn bộ job data từ GAS và cập nhật static seed content trong 30 HTML files.
 * Chạy: node auto-omega/update_static_content.js
 */

const https = require('https');
const fs    = require('fs');
const path  = require('path');

const GAS_URL  = 'https://script.google.com/macros/s/AKfycbxZzQV4kAkI5Gx4GzZrx18B-t1gMSSJOQgJky28Wu_n69SrdLAg-4T3OkIm0u6npgxptg/exec';
const HTML_DIR = path.join(__dirname, '..', 'tin-tuc');

// ── HTTP helper (follows redirects) ──────────────────────────────────────────
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const get = (u) => {
      https.get(u, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return get(res.headers.location);
        }
        const chunks = [];
        res.on('data', d => chunks.push(d));
        res.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
        res.on('error', reject);
      }).on('error', reject);
    };
    get(url);
  });
}

async function fetchJson(url) {
  const text = await fetchUrl(url);
  return JSON.parse(text);
}

// ── HTML helpers ─────────────────────────────────────────────────────────────

// Replace content of an element by id:  id="<id>">...</<tag>
function replaceById(html, id, newContent, tag = null) {
  const re = new RegExp(
    `(id="${id}"[^>]*>)([^<]*)`,
    'g'
  );
  let found = false;
  const result = html.replace(re, (_, open, _old) => {
    found = true;
    return open + newContent;
  });
  if (!found) console.warn(`  ⚠ id="${id}" not found`);
  return result;
}

// Replace <ul id="<id>">...</ul> with new <li> items
function replaceList(html, id, items) {
  if (!items || !items.length) return html;
  const liHtml = items.filter(Boolean).map(t => `<li>${escHtml(t)}</li>`).join('');
  const re = new RegExp(`(<ul id="${id}"[^>]*>)([\\s\\S]*?)(</ul>)`, 'g');
  let found = false;
  const result = html.replace(re, (_, open, _old, close) => {
    found = true;
    return open + liHtml + close;
  });
  if (!found) console.warn(`  ⚠ ul#${id} not found`);
  return result;
}

// Replace <strong id="<id>">...</strong>
function replaceStrong(html, id, newContent) {
  const re = new RegExp(`(<strong id="${id}"[^>]*>)([^<]*)(<\\/strong>)`, 'g');
  let found = false;
  const result = html.replace(re, (_, open, _old, close) => {
    found = true;
    return open + newContent + close;
  });
  if (!found) console.warn(`  ⚠ strong#${id} not found`);
  return result;
}

// Replace all occurrences of openApply('OLD_ID', and loadJobStatus('OLD_ID')
function fixJobIds(html, oldId, newId, jobTitle) {
  // openApply('OLD_ID', ...) → openApply('NEW_ID', ...)
  html = html.replace(new RegExp(`openApply\\('${oldId}'`, 'g'), `openApply('${newId}'`);
  // loadJobStatus('OLD_ID') → loadJobStatus('NEW_ID')
  html = html.replace(new RegExp(`loadJobStatus\\('${oldId}'\\)`, 'g'), `loadJobStatus('${newId}')`);
  return html;
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Enhance loadJobStatus to also update apply button onclick ─────────────────
// Injects a snippet that dynamically fixes button onclick handlers after GAS data loads
const DYNAMIC_BTN_PATCH = `
      // ―― Live: update apply buttons with correct job id/title ――
      if (job.id && job.title) {
        document.querySelectorAll('button[onclick^="openApply"]').forEach(function(btn) {
          btn.setAttribute('onclick', "openApply('" + job.id + "','" + job.title.replace(/'/g,"\\'") + "')");
        });
      }`;

// Insert the patch into loadJobStatus if not already present
function patchLoadJobStatus(html) {
  const MARKER = '// ―― Live: update apply buttons with correct job id/title ――';
  if (html.includes(MARKER)) return html; // already patched
  // Insert before the closing } of the try block in loadJobStatus
  return html.replace(
    /(\s*if \(job\.benefits\) renderList\('jd-benefits',\s*job\.benefits\);)/,
    `$1\n${DYNAMIC_BTN_PATCH}`
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('Fetching jobs list from GAS...');
  const jobsData = await fetchJson(GAS_URL + '?action=jobs');
  if (!jobsData.jobs) { console.error('No jobs returned'); process.exit(1); }

  const jobs = jobsData.jobs;
  console.log(`Found ${jobs.length} jobs. Fetching detailed JD for each...`);

  // Fetch all job details in parallel (batches of 5 to avoid rate limit)
  const details = {};
  for (let i = 0; i < jobs.length; i += 5) {
    const batch = jobs.slice(i, i + 5);
    await Promise.all(batch.map(async (j) => {
      try {
        const d = await fetchJson(GAS_URL + '?action=job&id=' + j.id);
        if (d.job) details[j.id] = d.job;
        process.stdout.write('.');
      } catch (e) {
        console.error(`\nFailed to fetch ${j.id}:`, e.message);
      }
    }));
  }
  console.log('\n');

  let updated = 0, skipped = 0;

  for (const j of jobs) {
    const slug    = j.slug;
    const htmlPath = path.join(HTML_DIR, slug + '.html');

    if (!fs.existsSync(htmlPath)) {
      console.log(`  SKIP ${j.id} — file not found: ${slug}.html`);
      skipped++;
      continue;
    }

    const detail = details[j.id];
    if (!detail) {
      console.log(`  SKIP ${j.id} — no detail data`);
      skipped++;
      continue;
    }

    let html = fs.readFileSync(htmlPath, 'utf8');

    // 1. Salary (meta grid + sidebar)
    html = replaceById(html, 'jm-salary',         detail.salary || 'Thỏa thuận');
    html = replaceById(html, 'jm-salary-sidebar',  detail.salary || 'Thỏa thuận');

    // 2. Openings
    const opStr = (detail.openings != null ? detail.openings : 1) + ' người';
    html = replaceById(html, 'jm-openings', opStr);
    html = replaceStrong(html, 'jm-openings-sidebar', opStr);

    // 3. Deadline
    html = replaceById(html, 'jm-deadline',          detail.deadline || '');
    html = replaceStrong(html, 'jm-deadline-sidebar', detail.deadline || '');

    // 4. JD lists
    html = replaceList(html, 'jd-roles',    detail.roles);
    html = replaceList(html, 'jd-requires', detail.requires);
    html = replaceList(html, 'jd-benefits', detail.benefits);

    // 5. Fix wrong job IDs in openApply/loadJobStatus calls
    //    (find current job ID used in the file and replace with correct one)
    const idMatch = html.match(/loadJobStatus\('([^']+)'\)/);
    if (idMatch && idMatch[1] !== j.id) {
      console.log(`  FIX  ${j.id} — wrong ID in HTML: '${idMatch[1]}' → '${j.id}'`);
      html = fixJobIds(html, idMatch[1], j.id, detail.title);
    }

    // 6. Patch loadJobStatus to dynamically fix button onclick
    html = patchLoadJobStatus(html);

    fs.writeFileSync(htmlPath, html, 'utf8');
    console.log(`  OK   ${j.id} | ${j.status.padEnd(8)} | ${slug}`);
    updated++;
  }

  console.log(`\nDone: ${updated} updated, ${skipped} skipped.`);
}

main().catch(e => { console.error(e); process.exit(1); });
