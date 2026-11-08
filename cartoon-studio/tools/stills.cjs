// node tools/stills.mjs film.html outDir frame1,frame2,...  → PNG кадры через window.__frame
(async () => {
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const [file, out, list] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const b = await chromium.launch(); const p = await b.newPage();
const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
await p.goto('file://' + path.resolve(file) + '?bare=1'); await p.waitForFunction(() => window.__ready || window.__error, null, { timeout: 60000 });
for (const f of list.split(',').map(Number)) {
  const d = await p.evaluate(i => window.__frame(i), f);
  fs.writeFileSync(path.join(out, `f${String(f).padStart(4, '0')}.png`), Buffer.from(d.split(',')[1], 'base64'));
}
if (errs.length) console.log('ERRORS:\n' + errs.join('\n')); await b.close();
})();
