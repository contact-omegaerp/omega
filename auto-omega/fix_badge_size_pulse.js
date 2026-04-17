#!/usr/bin/env node
// Bigger badge, bright yellow pulse ring (thicker outer burst)
const fs = require('fs'), path = require('path');
const TIN_TUC = path.join(__dirname, '..', 'tin-tuc');

// ── job pages: hb-badge ───────────────────────────────────────────────────────
const OLD_HB = '.hb-badge{display:inline-block;padding:5px 10px;border-radius:6px;font-size:10px;font-weight:800;color:#fff;white-space:nowrap;line-height:1.3;text-align:center;box-shadow:0 2px 6px rgba(0,0,0,.25);}.hb-active,.hb-hot{background:#dc2626;animation:hb-pulse 1.4s ease-in-out infinite;}.hb-closed{background:rgba(70,70,70,.82);}@keyframes hb-pulse{0%,100%{box-shadow:0 0 0 0 rgba(220,38,38,.7);}50%{box-shadow:0 0 0 9px rgba(220,38,38,0);}}';
const NEW_HB = '.hb-badge{display:inline-block;padding:7px 14px;border-radius:7px;font-size:12px;font-weight:800;color:#fff;white-space:nowrap;line-height:1.3;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,.3);}.hb-active,.hb-hot{background:#dc2626;animation:hb-pulse 1.4s ease-in-out infinite;}.hb-closed{background:rgba(70,70,70,.82);}@keyframes hb-pulse{0%,100%{box-shadow:0 0 0 2px rgba(255,220,0,.95);}50%{box-shadow:0 0 0 18px rgba(255,220,0,0);}}';

// ── tin-tuc.html: cji-badge ───────────────────────────────────────────────────
const OLD_CJI = '.cji-badge{display:inline-block;padding:3px 7px;border-radius:5px;font-size:9px;font-weight:800;color:#fff;white-space:nowrap;}.cji-active,.cji-hot{background:#dc2626;animation:cji-pulse 1.4s ease-in-out infinite;}.cji-closed{background:rgba(80,80,80,.82);}@keyframes cji-pulse{0%,100%{box-shadow:0 0 0 0 rgba(220,38,38,.65);}50%{box-shadow:0 0 0 6px rgba(220,38,38,0);}}';
const NEW_CJI = '.cji-badge{display:inline-block;padding:5px 10px;border-radius:6px;font-size:11px;font-weight:800;color:#fff;white-space:nowrap;}.cji-active,.cji-hot{background:#dc2626;animation:cji-pulse 1.4s ease-in-out infinite;}.cji-closed{background:rgba(80,80,80,.82);}@keyframes cji-pulse{0%,100%{box-shadow:0 0 0 2px rgba(255,220,0,.9);}50%{box-shadow:0 0 0 14px rgba(255,220,0,0);}}';

const SLUGS = fs.readdirSync(TIN_TUC)
  .filter(f => f.startsWith('tuyen-dung-') && f.endsWith('.html') && f !== 'tuyen-dung-omega.html');

let ok = 0;
for (const f of SLUGS) {
  const p = path.join(TIN_TUC, f);
  let html = fs.readFileSync(p, 'utf8');
  if (html.includes(OLD_HB)) {
    fs.writeFileSync(p, html.replace(OLD_HB, NEW_HB), 'utf8');
    ok++;
  }
}
console.log(`Job pages: ${ok}/${SLUGS.length} updated`);

// tin-tuc.html
const ttPath = path.join(__dirname, '..', 'tin-tuc.html');
let tt = fs.readFileSync(ttPath, 'utf8');
if (tt.includes(OLD_CJI)) {
  fs.writeFileSync(ttPath, tt.replace(OLD_CJI, NEW_CJI), 'utf8');
  console.log('tin-tuc.html updated');
} else {
  console.log('WARN: cji CSS not matched in tin-tuc.html');
}
