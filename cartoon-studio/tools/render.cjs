// node tools/render.cjs film.html out.mp4 [workers] [from] [to]  — параллельный рендер кадров в сегменты H.264 и склейка
const { chromium } = require('playwright'); const { spawn, execFileSync } = require('child_process'); const fs = require('fs'), path = require('path');
(async () => {
  const [file, out, W = 4, from, to] = process.argv.slice(2); const workers = +W;
  const b = await chromium.launch(); const probe = await b.newPage(); await probe.goto('file://' + path.resolve(file)); await probe.waitForFunction(() => window.__ready);
  const N = await probe.evaluate(() => window.__N); await probe.close();
  const A = from ? +from : 0, B = to ? +to : N, per = Math.ceil((B - A) / workers), tmp = out + '.parts'; fs.mkdirSync(tmp, { recursive: true });
  const t0 = Date.now(); let done = 0;
  const jobs = Array.from({ length: workers }, async (_, w) => {
    const s = A + w * per, e = Math.min(B, s + per); if (s >= e) return null;
    const p = await b.newPage(); p.on('pageerror', er => console.log('ERR', er.message));
    await p.goto('file://' + path.resolve(file)); await p.waitForFunction(() => window.__ready);
    const seg = path.join(tmp, `seg${w}.mp4`);
    const ff = spawn('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'image2pipe', '-framerate', '30', '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', seg]);
    for (let i = s; i < e; i++) {
      const d = await p.evaluate(k => window.__frame(k), i);
      if (!ff.stdin.write(Buffer.from(d.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
      if (++done % 300 === 0) console.log(`${done}/${B - A} кадров, ${((Date.now() - t0) / 1000).toFixed(0)} с`);
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r)); await p.close(); return seg;
  });
  const segs = (await Promise.all(jobs)).filter(Boolean); await b.close();
  fs.writeFileSync(path.join(tmp, 'list.txt'), segs.map(s => `file '${path.resolve(s)}'`).join('\n'));
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', path.join(tmp, 'list.txt'), '-c', 'copy', out]);
  console.log('готово', out, ((Date.now() - t0) / 1000).toFixed(0), 'с');
})();
