'use strict';
// Серия 5: кисти и герои (версия 2: более взрослые пропорции и лица).
// Фигуры рисуются от точки между стопами: (0,0) — пол, вверх = -y. Свет падает слева (из окна).

const INK = '#2a2128';
const C = {
  skin: '#eec3a2', skinSh: '#d19a78', skinHi: '#f8dcc4', lip: '#b8616a', blush: '#e48f86',
  temaHair: '#4a3426', temaHairHi: '#6b4a34', hoodie: '#3d6fa8', hoodieSh: '#2c5283', jeans: '#344566', jeansSh: '#26324d', sneaker: '#ece6da',
  veraHair: '#9c3f22', veraHairSh: '#6f2a15', veraHairHi: '#c45e34', sweater: '#8e2f45', sweaterSh: '#6a2133', vJeans: '#27334f', boot: '#3a2a24',
  cat: '#e8913f', catSh: '#bf6a26', catBelly: '#f8e0c0',
  smoke: '#d9d4cc', fireCore: '#fff6d6',
};

// ---------- кисти ----------
function inkLine(c, pts, w = 5, seed = 1, close = false, o = {}) {
  c.save(); c.strokeStyle = o.color || INK; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round';
  wob(c, pts, o.amp ?? 1, seed, close, { pressure: o.pressure ?? .6, freq: 1.2 }); c.restore();
}
function shp(c, pts, fill, w = 5, seed = 1, o = {}) {
  const p = curvePath(pts, true, o.corner ?? .8);
  if (fill) { c.fillStyle = fill; c.fill(p); }
  if (o.shade) { c.save(); c.clip(p); o.shade(c); c.restore(); }
  if (w) inkLine(c, pts, w, seed, true, o);
  return p;
}
// конечность переменной толщины: pts — ось, ws — ширина в каждой точке
function taper(c, pts, ws, fill, seed = 1, o = {}) {
  const q = pts, L = [], R = [];
  for (let i = 0; i < q.length; i++) {
    const a = q[Math.max(0, i - 1)], b = q[Math.min(q.length - 1, i + 1)];
    let nx = a[1] - b[1], ny = b[0] - a[0]; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    L.push([q[i][0] + nx * ws[i] / 2, q[i][1] + ny * ws[i] / 2]); R.push([q[i][0] - nx * ws[i] / 2, q[i][1] - ny * ws[i] / 2]);
  }
  return shp(c, [...L, ...R.reverse()], fill, o.w ?? 4.5, seed, { corner: .9, ...o });
}
// тень с правой стороны формы (свет слева)
const sideShade = (col, x, y, rx, ry, rot = 0, a = 1) => q => { q.save(); q.globalAlpha = a; q.fillStyle = col; q.beginPath(); q.ellipse(x, y, rx, ry, rot, 0, TAU); q.fill(); q.restore(); };
function hatchIn(c, path, box, o = {}) { hatch(c, path, box, { color: INK, alpha: .18, gap: 8, len: 14, width: 1.6, angle: .8, ...o }); }
function at(c, x, y, s, fn, flip = 1) { c.save(); c.translate(x, y); c.scale(s * flip, s); fn(); c.restore(); }
function hand(c, x, y, r, rot = 0, seed = 1, o = {}) {
  c.save(); c.translate(x, y); c.rotate(rot);
  shp(c, [[-r * .8, -r * .9], [r * .7, -r * .9], [r * .9, r * .5], [r * .2, r * 1.1], [-r * .8, r * .8]], C.skin, 3.5, seed, { shade: sideShade(C.skinSh, r, r * .4, r * .6, r * .9) });
  if (o.point) shp(c, [[r * .2, -r * .9], [r * .55, -r * .9], [r * .5, -r * 2.4], [r * .25, -r * 2.4]], C.skin, 3.5, seed + 1);
  else for (let k = 0; k < 3; k++) inkLine(c, [[-r * .5 + k * r * .45, -r * .1], [-r * .5 + k * r * .45, r * .55]], 1.6, seed + k, false, { color: alpha(INK, .5) });
  shp(c, ellPts(-r * .85, -r * .2, r * .3, r * .55, -.4), C.skin, 3, seed + 5);
  c.restore();
}

// ---------- лицо ----------
// f: {eyes:'open'|'wide'|'squint'|'shut', look:[dx,dy], brows:'calm'|'up'|'worry'|'angry'|'urgent', mouth:'neutral'|'chew'|'O'|'shout'|'tense'|'smile', female}
function face(c, rx, ry, f, seed) {
  const fem = !!f.female, jaw = fem ? .5 : .6;
  const head = [[-rx, -ry * .1], [-rx * .97, -ry * .55], [-rx * .62, -ry * .93], [0, -ry], [rx * .62, -ry * .93], [rx * .97, -ry * .55], [rx, -ry * .1],
    [rx * .92, ry * .32], [rx * jaw, ry * .78], [0, ry], [-rx * jaw, ry * .78], [-rx * .92, ry * .32]];
  for (const sx of [-1, 1]) shp(c, ellPts(sx * rx * .98, ry * .06, rx * .16, ry * .2), C.skin, 3.5, seed + 10 + sx, { shade: sideShade(C.skinSh, sx * rx * .98, ry * .1, rx * .08, ry * .12) });
  shp(c, head, C.skin, 4.5, seed, { shade: q => { sideShade(C.skinSh, rx * .95, ry * .2, rx * .45, ry * 1.1, .1, .85)(q); sideShade(C.skinHi, -rx * .45, -ry * .35, rx * .3, ry * .25, 0, .5)(q); } });
  if (fem) { c.save(); c.globalAlpha = .3; c.fillStyle = C.blush; for (const sx of [-1, 1]) { c.beginPath(); c.ellipse(sx * rx * .52, ry * .32, rx * .2, ry * .1, 0, 0, TAU); c.fill(); } c.restore(); }
  // глаза
  const ey = ry * .02, ex = rx * .42, ew = rx * .25, open = { open: 1, wide: 1.5, squint: .5, shut: 0 }[f.eyes || 'open'], eh = rx * .12 * open;
  const [lx, ly] = f.look || [0, 0];
  for (const sx of [-1, 1]) {
    c.save(); c.translate(sx * ex, ey); c.scale(sx, 1);
    if (!open) { inkLine(c, [[-ew, 0], [0, ry * .05], [ew, -ry * .01]], 3.5, seed + 20 + sx); if (f.mouth === 'tense') inkLine(c, [[ew * .9, -ry * .02], [ew * 1.3, -ry * .07]], 2, seed + 26); c.restore(); continue; }
    const al = [[-ew, eh * .1], [-ew * .35, -eh], [ew * .35, -eh * .95], [ew, -eh * .1], [ew * .4, eh * .75], [-ew * .35, eh * .7]];
    const P = curvePath(al, true, .7); c.fillStyle = '#fbf7f2'; c.fill(P);
    c.save(); c.clip(P); const ir = Math.min(eh * .95, ew * .5);
    c.fillStyle = fem ? '#5b7a3c' : '#6a4a32'; c.beginPath(); c.arc(lx * ew * .35 * sx, ly * eh * .3, ir, 0, TAU); c.fill();
    c.fillStyle = '#18121a'; c.beginPath(); c.arc(lx * ew * .35 * sx, ly * eh * .3, ir * .5, 0, TAU); c.fill();
    c.fillStyle = '#fff'; c.beginPath(); c.arc(lx * ew * .35 * sx - ir * .35, ly * eh * .3 - ir * .4, ir * .22, 0, TAU); c.fill();
    c.fillStyle = alpha(C.skinSh, .5); c.fillRect(-ew, -eh * 1.2, ew * 2, eh * .45); c.restore();
    inkLine(c, [[-ew * 1.05, eh * .15], [-ew * .35, -eh * 1.05], [ew * .35, -eh], [ew * 1.05, -eh * .05]], fem ? 4 : 3.4, seed + 22 + sx, false, { pressure: .5 });
    inkLine(c, [[-ew * .4, eh * .78], [ew * .4, eh * .8]], 1.6, seed + 24 + sx, false, { color: alpha(INK, .45) });
    if (fem) inkLine(c, [[ew * .95, -eh * .1], [ew * 1.3, -eh * .55]], 2.4, seed + 27 + sx);
    inkLine(c, [[-ew * .7, -eh - ry * .07], [ew * .6, -eh - ry * .06]], 1.4, seed + 28 + sx, false, { color: alpha(INK, .35) });   // складка века
    c.restore();
  }
  // брови
  const b = f.brows || 'calm', by = -ry * .2;
  for (const sx of [-1, 1]) {
    const inner = { calm: 0, up: -ry * .1, worry: -ry * .11, angry: ry * .07, urgent: -ry * .04 }[b], outer = { calm: -ry * .03, up: -ry * .1, worry: ry * .03, angry: -ry * .05, urgent: 0 }[b];
    const pts = [[sx * rx * .14, by + inner], [sx * rx * .38, by + (inner + outer) / 2 - ry * .05], [sx * rx * .62, by + outer]];
    inkLine(c, pts, fem ? 4 : 6, seed + 30 + sx, false, { pressure: .9, color: fem ? '#5c2414' : INK });
  }
  // нос
  inkLine(c, [[rx * .04, -ry * .02], [rx * .1, ry * .26], [rx * .02, ry * .33]], 2.6, seed + 40, false, { color: alpha(INK, .7) });
  inkLine(c, [[-rx * .1, ry * .32], [-rx * .03, ry * .35]], 2.2, seed + 41, false, { color: alpha(INK, .6) });
  // рот
  const my = ry * .58, mw = rx * (fem ? .27 : .3), m = f.mouth || 'neutral';
  if (m === 'O') shp(c, ellPts(0, my + ry * .02, mw * .55, ry * .1), '#5e2a2f', 3, seed + 50);
  else if (m === 'shout') { const P = shp(c, [[-mw * .75, my - ry * .02], [0, my - ry * .06], [mw * .75, my - ry * .02], [mw * .55, my + ry * .2], [0, my + ry * .25], [-mw * .55, my + ry * .2]], '#4a1f25', 3.5, seed + 51, { corner: .7 });
    c.save(); c.clip(P); c.fillStyle = '#f3efe8'; c.fillRect(-mw, my - ry * .08, mw * 2, ry * .07); c.fillStyle = '#b5555e'; c.beginPath(); c.ellipse(0, my + ry * .22, mw * .4, ry * .07, 0, 0, TAU); c.fill(); c.restore(); }
  else if (m === 'tense') { inkLine(c, [[-mw, my + ry * .03], [-mw * .3, my - ry * .01], [mw * .3, my - ry * .01], [mw, my + ry * .04]], 3.4, seed + 52); }
  else if (m === 'chew') { inkLine(c, [[-mw * .8, my], [0, my + ry * .02], [mw * .7, my - ry * .02]], 3.4, seed + 53); shp(c, ellPts(rx * .5, ry * .4, rx * .16, ry * .1), alpha(C.skinSh, .6), 0, seed + 54); }
  else if (m === 'smile') inkLine(c, [[-mw, my - ry * .04], [0, my + ry * .04], [mw, my - ry * .04]], 3.4, seed + 55);
  else inkLine(c, [[-mw * .8, my], [mw * .8, my + ry * .01]], 3.2, seed + 56);
  if (fem && m !== 'shout' && m !== 'O') shp(c, [[-mw * .8, my + ry * .01], [mw * .8, my + ry * .01], [mw * .3, my + ry * .1], [-mw * .3, my + ry * .1]], alpha(C.lip, .75), 0, seed + 57);
  else inkLine(c, [[-mw * .35, my + ry * .13], [mw * .35, my + ry * .13]], 1.8, seed + 58, false, { color: alpha(INK, .35) });
}

// ---------- волосы ----------
function temaHairFront(c, rx, ry, seed) {
  shp(c, [[-rx * 1.04, ry * .05], [-rx * 1.08, -ry * .5], [-rx * .75, -ry * .98], [-rx * .1, -ry * 1.16], [rx * .6, -ry * 1.04], [rx * 1.05, -ry * .6], [rx * 1.04, ry * .02],
    [rx * .9, -ry * .3], [rx * .7, -ry * .45], [rx * .45, -ry * .36], [rx * .25, -ry * .52], [0, -ry * .4], [-rx * .3, -ry * .55], [-rx * .55, -ry * .38], [-rx * .8, -ry * .45], [-rx * .92, -ry * .15]],
    C.temaHair, 4.5, seed, { corner: .45, shade: q => { sideShade(C.temaHairHi, -rx * .4, -ry * .85, rx * .4, ry * .15, -.3, .8)(q);
      hatchIn(q, rectPath(-rx * 1.2, -ry * 1.2, rx * 2.4, ry), [-rx * 1.2, -ry * 1.2, rx * 2.4, ry], { angle: 1.2, alpha: .22, gap: 7 }); } });
}
function temaHairBack(c, rx, ry, seed) {
  shp(c, [[-rx * 1.04, ry * .1], [-rx * 1.06, -ry * .5], [-rx * .7, -ry * .98], [0, -ry * 1.12], [rx * .7, -ry * .98], [rx * 1.06, -ry * .5], [rx * 1.04, ry * .1], [rx * .8, ry * .55], [rx * .3, ry * .62], [-rx * .3, ry * .62], [-rx * .8, ry * .55]],
    C.temaHair, 4.5, seed, { shade: q => { sideShade(C.temaHairHi, -rx * .4, -ry * .5, rx * .4, ry * .3, -.4, .7)(q); hatchIn(q, rectPath(-rx * 1.2, -ry * 1.2, rx * 2.4, ry * 2), [-rx * 1.2, -ry * 1.2, rx * 2.4, ry * 2], { angle: 1.5, alpha: .2, gap: 7 }); } });
}
function veraHairBack(c, rx, ry, seed) {
  shp(c, [[-rx * 1.1, -ry * .6], [-rx * .7, -ry * 1.08], [rx * .7, -ry * 1.08], [rx * 1.12, -ry * .6], [rx * 1.25, ry * .4], [rx * 1.45, ry * 1.3], [rx * 1.6, ry * 2.1], [rx * 1.2, ry * 2.4], [rx * .9, ry * 2.1],
    [rx * .6, ry * .9], [-rx * .6, ry * .9], [-rx * .9, ry * 2.1], [-rx * 1.2, ry * 2.45], [-rx * 1.6, ry * 2.15], [-rx * 1.45, ry * 1.3], [-rx * 1.25, ry * .4]], C.veraHairSh, 4.5, seed, { corner: .7,
    shade: q => hatchIn(q, rectPath(-rx * 1.8, -ry, rx * 3.6, ry * 3.6), [-rx * 1.8, -ry, rx * 3.6, ry * 3.6], { angle: 1.4, alpha: .2, gap: 8, color: '#3b1508' }) });
}
function veraHairFront(c, rx, ry, seed) {
  // пробор слева, пряди обрамляют лицо и ложатся на плечи
  shp(c, [[-rx * 1.12, ry * .9], [-rx * 1.2, -ry * .3], [-rx * .9, -ry * .92], [-rx * .3, -ry * 1.14], [rx * .5, -ry * 1.08], [rx * 1.05, -ry * .7], [rx * 1.2, -ry * .1], [rx * 1.25, ry * .7],
    [rx * 1.35, ry * 1.6], [rx * 1.05, ry * 1.9], [rx * .95, ry * 1.2], [rx * .9, ry * .3], [rx * .75, -ry * .4], [rx * .2, -ry * .72], [-rx * .3, -ry * .6], [-rx * .7, -ry * .2], [-rx * .88, ry * .4], [-rx * .95, ry * 1.3], [-rx * 1.2, ry * 1.75]],
    C.veraHair, 4.5, seed, { corner: .75, shade: q => { sideShade(C.veraHairHi, -rx * .5, -ry * .8, rx * .5, ry * .18, -.4, .9)(q); sideShade(C.veraHairSh, rx * 1.1, ry * .9, rx * .3, ry * 1.1, 0, .7)(q);
      hatchIn(q, rectPath(-rx * 1.5, -ry * 1.2, rx * 3, ry * 3.2), [-rx * 1.5, -ry * 1.2, rx * 3, ry * 3.2], { angle: 1.35, alpha: .2, gap: 9, color: '#3b1508' }); } });
  for (const [x0, y0, x1, y1] of [[-.2, -.95, -.75, -.1], [.25, -.9, .85, -.2], [1.0, .2, 1.15, 1.4], [-.98, .3, -1.05, 1.4]]) inkLine(c, [[rx * x0, ry * y0], [rx * (x0 + x1) / 2 + rx * .08, ry * (y0 + y1) / 2], [rx * x1, ry * y1]], 1.8, seed + x0 * 10, false, { color: alpha('#3b1508', .6) });
  c.save(); c.fillStyle = '#e8c35a'; for (const sx of [-1, 1]) { c.beginPath(); c.arc(sx * rx * .98, ry * .32, rx * .07, 0, TAU); c.fill(); } c.restore();   // серьги
}

// ---------- Тёма (14 лет): рост ~760 ----------
function temaHead(c, x, y, f, back = false, s = 1) {
  at(c, x, y, s, () => {
    const rx = 48, ry = 60;
    if (back) { for (const sx of [-1, 1]) shp(c, ellPts(sx * rx * .98, ry * .06, rx * .16, ry * .2), C.skin, 3.5, 200 + sx); temaHairBack(c, rx, ry, 202); return; }
    face(c, rx, ry, f, 210); temaHairFront(c, rx, ry, 230);
  });
}
function temaNeck(c, x, y, w = 30, h = 40) { shp(c, [[x - w / 2, y], [x + w / 2, y], [x + w / 2 + 2, y + h], [x - w / 2 - 2, y + h]], C.skin, 4, 240, { shade: sideShade(C.skinSh, x + w / 2, y + h / 2, w * .4, h) }); }
// поза 'back': со спины у окна, телефон поднят
const lerpPts = (A, B, u) => A.map((p, i) => [lerp(p[0], B[i][0], u), lerp(p[1], B[i][1], u)]);
function temaLegs(c) {
  for (const sx of [-1, 1]) {
    taper(c, [[sx * 36, -330], [sx * 40, -175], [sx * 42, -30]], [64, 50, 40], C.jeans, 250 + sx, { shade: sideShade(C.jeansSh, sx * 60, -180, 20, 200) });
    shp(c, [[sx * 42 - 26, -36], [sx * 42 + 26, -36], [sx * 42 + 30, 0], [sx * 42 - 30, 0]], C.sneaker, 4, 252 + sx, { corner: .4 });
  }
}
// стоит лицом к зрителю; f.armsUp 0..1 — руки вскинуты от испуга
function temaStand(c, f = {}) {
  temaLegs(c);
  temaNeck(c, 0, -642, 32, 46);
  shp(c, [[-82, -606], [82, -606], [92, -470], [86, -330], [-86, -330], [-92, -470]], C.hoodie, 5, 255,
    { shade: q => { sideShade(C.hoodieSh, 80, -460, 40, 160)(q); q.fillStyle = C.hoodieSh; q.fillRect(-100, -352, 200, 30); } });
  shp(c, [[-50, -614], [50, -614], [36, -570], [-36, -570]], C.hoodieSh, 4, 262);
  inkLine(c, [[-16, -590], [-20, -520]], 2.5, 263); inkLine(c, [[16, -590], [20, -520]], 2.5, 264);
  shp(c, [[-56, -440], [56, -440], [62, -372], [-62, -372]], C.hoodieSh, 3.5, 265, { corner: .3 });
  const u = f.armsUp || 0;
  for (const sx of [-1, 1]) {
    const A = lerpPts([[sx * 78, -590], [sx * 104, -470], [sx * 98, -360]], [[sx * 78, -590], [sx * 130, -560], [sx * 120, -660]], u);
    taper(c, A, [40, 34, 30], C.hoodie, 266 + sx, { shade: sideShade(C.hoodieSh, sx * 100, -480, 10, 100) });
    hand(c, A[2][0], A[2][1] + (u > .5 ? -14 : 14), 17, u > .5 ? Math.PI : 0, 268 + sx);
  }
  temaHead(c, 0, -700, f);
}
function temaBack(c, arm = 1) {
  temaLegs(c);
  temaNeck(c, 0, -642, 32, 46);
  shp(c, [[-82, -606], [82, -606], [92, -470], [86, -330], [-86, -330], [-92, -470]], C.hoodie, 5, 255,
    { shade: q => { sideShade(C.hoodieSh, 80, -460, 40, 160)(q); q.fillStyle = C.hoodieSh; q.fillRect(-100, -352, 200, 30); } });
  shp(c, [[-56, -612], [56, -612], [44, -530], [0, -510], [-44, -530]], C.hoodieSh, 4, 256);                                 // капюшон
  taper(c, [[-78, -590], [-104, -470], [-98, -360]], [40, 34, 30], C.hoodie, 257, { shade: sideShade(C.hoodieSh, -86, -470, 10, 120) });
  hand(c, -98, -345, 17, 0, 258);
  const A = lerpPts([[78, -592], [102, -470], [98, -360]], [[78, -592], [134, -690], [146, -800]], arm);
  taper(c, A, [40, 34, 30], C.hoodie, 259, { shade: sideShade(C.hoodieSh, A[1][0] + 14, A[1][1], 14, 120) });
  const hx = A[2][0], hy = A[2][1] - 12;
  if (arm > .55) { shp(c, [[hx - 28, hy - 88], [hx + 30, hy - 84], [hx + 26, hy + 12], [hx - 32, hy + 8]], '#22252e', 4, 260, { corner: .3 });   // телефон
    c.save(); c.globalAlpha = .9; c.fillStyle = '#ffe9a8'; c.fillRect(hx - 22, hy - 80, 44, 80); c.restore(); }
  hand(c, hx, hy, 17, -.2, 261);
  temaHead(c, 0, -700, {}, true);
}
// поза 'sit': за столом; (0,0) — уровень столешницы под центром
function temaSit(c, f) {
  shp(c, [[-82, -300], [82, -300], [92, -170], [88, 20], [-88, 20], [-92, -170]], C.hoodie, 5, 270,
    { shade: q => sideShade(C.hoodieSh, 80, -150, 40, 180)(q) });
  shp(c, [[-50, -306], [50, -306], [36, -262], [-36, -262]], C.hoodieSh, 4, 271);
  inkLine(c, [[-16, -280], [-20, -200]], 2.5, 272); inkLine(c, [[16, -280], [20, -200]], 2.5, 273);
  temaNeck(c, 0, -346, 30, 46);
  temaHead(c, 0, -400, f);
  taper(c, [[-78, -284], [-112, -150], [-50, -20]], [40, 34, 30], C.hoodie, 274, { shade: sideShade(C.hoodieSh, -60, -60, 10, 60) });
  hand(c, -40, -18, 17, 1.2, 275);
  taper(c, [[78, -284], [116, -220], [122, -150]], [42, 38, 34], C.hoodie, 276, { shade: sideShade(C.hoodieSh, 130, -210, 12, 70) });
  taper(c, [[122, -146], [108, -250], [84, -330]], [34, 30, 28], C.hoodie, 280, { shade: sideShade(C.hoodieSh, 120, -240, 8, 60) });
  shp(c, [[40, -380], [104, -392], [110, -364], [46, -352]], '#d9a560', 4, 277);           // бутерброд
  shp(c, [[42, -384], [106, -396], [104, -388], [44, -376]], '#f2c94c', 2.5, 278);
  hand(c, 78, -346, 17, -.3, 279);
}
// поза 'crouch': сидит на полу у стены, колени к груди, руки на голове
function crouchBody(c, cloth, clothSh, legs, legsSh, shoe, seed, head, knees = false) {
  shp(c, [[-76, -400], [76, -400], [80, -220], [70, -60], [-70, -60], [-80, -220]], cloth, 5, seed + 6, { shade: sideShade(clothSh, 80, -220, 36, 180) });
  for (const sx of [-1, 1]) {
    taper(c, [[sx * 40, -300], [sx * 52, -160], [sx * 62, -40]], [64, 50, 38], legs, seed + 7 + sx, { shade: sideShade(legsSh, sx * 100, -150, 12, 110) });   // голень
    shp(c, ellPts(sx * 40, -304, 33, 26), legs, 4.5, seed + 12 + sx, { shade: q => { sideShade(legsSh, sx * 62, -300, 12, 24)(q); sideShade(alpha('#ffffff', .2), sx * 32, -314, 12, 6)(q); } });   // колено
    shp(c, [[sx * 62 - 30, -46], [sx * 62 + 30, -46], [sx * 62 + 34, -4], [sx * 62 - 34, -4]], shoe, 4, seed + 3 + sx, { corner: .4 });
  }
  head();
  for (const sx of [-1, 1]) {
    if (knees) { taper(c, [[sx * 74, -388], [sx * 96, -330], [sx * 50, -318]], [38, 32, 28], cloth, seed + 8 + sx, { shade: sideShade(clothSh, sx * 100, -340, 10, 30) }); hand(c, sx * 40, -318, 17, sx * 1.5, seed + 10 + sx); continue; }
    taper(c, [[sx * 74, -388], [sx * 116, -480], [sx * 40, -548]], [38, 32, 28], cloth, seed + 8 + sx, { shade: sideShade(clothSh, sx * 120, -470, 10, 60) });
    hand(c, sx * 32, -552, 17, sx * 1.4, seed + 10 + sx);
  }
}
function temaCrouch(c, f, knees = false) {
  crouchBody(c, C.hoodie, C.hoodieSh, C.jeans, C.jeansSh, C.sneaker, 290, () => { temaNeck(c, 0, -440, 30, 40); temaHead(c, 0, -490, f); }, knees);
}

// ---------- Вера (22 года): рост ~820 ----------
function veraHead(c, x, y, f, s = 1) {
  at(c, x, y, s, () => { const rx = 44, ry = 57; veraHairBack(c, rx, ry, 300); face(c, rx, ry, { ...f, female: true }, 310); if (f.k) noseBleed(c, rx, ry, f.k); veraHairFront(c, rx, ry, 330); });
}
function veraNeck(c, x, y) { shp(c, [[x - 13, y], [x + 13, y], [x + 15, y + 44], [x - 15, y + 44]], C.skin, 4, 340, { shade: sideShade(C.skinSh, x + 14, y + 22, 10, 40) }); }
function veraTorso(c, y0) {   // свитер с высоким горлом, приталенный
  shp(c, [[-70, y0], [70, y0], [66, y0 + 110], [50, y0 + 200], [64, y0 + 272], [-64, y0 + 272], [-50, y0 + 200], [-66, y0 + 110]], C.sweater, 5, 350,
    { shade: q => { sideShade(C.sweaterSh, 64, y0 + 140, 30, 160)(q); for (let k = 0; k < 9; k++) inkLine(q, [[-56 + k * 14, y0 + 20], [-50 + k * 13, y0 + 260]], 1.2, 351 + k, false, { color: alpha(INK, .18), pressure: 0 }); } });
  shp(c, [[-24, y0 - 34], [24, y0 - 34], [28, y0 + 6], [-28, y0 + 6]], C.sweater, 4, 352, { shade: sideShade(C.sweaterSh, 26, y0 - 14, 10, 30) });
}
// поза 'shout': стоит, указывает рукой влево, кричит
function veraShout(c, f, point = 1) {
  for (const sx of [-1, 1]) {
    taper(c, [[sx * 34, -400], [sx * 32, -210], [sx * 30, -40]], [62, 44, 32], C.vJeans, 360 + sx, { shade: sideShade('#1c2539', sx * 46, -210, 12, 200) });
    shp(c, [[sx * 30 - 22, -100], [sx * 30 + 22, -100], [sx * 30 + 26, -8], [sx * 30 + 34, 0], [sx * 30 - 26, 0], [sx * 30 - 24, -40]], C.boot, 4, 362 + sx, { corner: .3 });
  }
  veraNeck(c, 0, -716); veraTorso(c, -672);
  taper(c, [[66, -655], [104, -560], [112, -470]], [34, 28, 24], C.sweater, 365, { shade: sideShade(C.sweaterSh, 116, -560, 10, 90) });
  hand(c, 112, -456, 15, 0, 366);
  veraHead(c, 0, -770, f);
  const A = lerpPts([[-64, -655], [-100, -560], [-110, -470]], [[-64, -655], [-150, -630], [-236, -654]], point);
  taper(c, A, [34, 28, 24], C.sweater, 367, { shade: sideShade(C.sweaterSh, A[1][0], A[1][1] + 14, 40, 10) });
  if (point > .6) hand(c, A[2][0] - 16, A[2][1] - 2, 15, -1.6, 368, { point: true }); else hand(c, A[2][0], A[2][1] + 14, 15, 0, 368);
}
function veraCrouch(c, f, knees = false) {
  crouchBody(c, C.sweater, C.sweaterSh, C.vJeans, '#1c2539', C.boot, 380, () => { veraNeck(c, 0, -446); veraHead(c, 0, -500, f); }, knees);
}

// ---------- Бублик (реалистичнее: меньше голова, миндалевидные глаза) ----------
function bublik(c, pose) {
  const puff = pose === 'hiss' ? 1 : 0, flat = pose === 'flat' ? 1 : 0, sill = pose === 'sill';
  const body = sill ? ellPts(0, 0, 140, 56) : warp(ellPts(0, 10 * flat, 130 + 8 * puff, 60 - 14 * flat + 12 * puff), 7, 6 * puff, true, 14);
  shp(c, [[120, 20], [200, 6], [250, -40 - 30 * puff], [236, -52 - 30 * puff], [196, -14], [120, -4]], C.cat, 5, 150, { corner: .3, shade: sideShade(C.catSh, 220, -20, 40, 10) });
  shp(c, body, C.cat, 5, 151, { shade: q => { q.fillStyle = C.catSh; for (let k = 0; k < 5; k++) { q.beginPath(); q.ellipse(-70 + k * 36, -40, 9, 40, .2, 0, TAU); q.fill(); } sideShade(C.catSh, 60, 40, 120, 30, 0, .6)(q); } });
  shp(c, ellPts(-40, 30 - 8 * flat, 64, 22), C.catBelly, 0, 152);
  const hx = -120, hy = sill ? -18 : -40 + 26 * flat;
  at(c, hx, hy, .85, () => {
    const ear = flat ? [[-44, -26], [-84, -22], [-52, -4]] : [[-40, -34], [-36, -92], [-6, -50]];
    shp(c, ear, C.cat, 4, 153); shp(c, ear.map(([x, y]) => [-x, y]), C.cat, 4, 154);
    shp(c, [[-56, -10], [-44, -40], [0, -50], [44, -40], [56, -10], [40, 26], [0, 40], [-40, 26]], C.cat, 5, 155, { shade: sideShade(C.catSh, 40, 10, 20, 30) });
    shp(c, ellPts(0, 22, 24, 15), C.catBelly, 0, 156);
    for (const sx of [-1, 1]) {
      if (sill) { inkLine(c, [[sx * 30, -4], [sx * 18, 2], [sx * 6, -2]], 3, 157 + sx); continue; }
      const P = shp(c, [[sx * 8, -6], [sx * 20, -16], [sx * 36, -10], [sx * 32, 0], [sx * 14, 0]], puff ? '#f2e46b' : '#c9d86a', 2.5, 158 + sx, { corner: .6, pressure: .2 });
      c.fillStyle = INK; c.beginPath(); c.ellipse(sx * 22, -8, puff ? 2 : 3.5, 8, 0, 0, TAU); c.fill();
    }
    shp(c, [[-5, 12], [5, 12], [0, 18]], '#d9707a', 2.5, 160);
    if (puff) shp(c, [[-12, 24], [12, 24], [0, 36]], '#6e2a32', 2.5, 161);
    for (const sx of [-1, 1]) for (const k of [-1, 1]) inkLine(c, [[sx * 20, 18 + k * 3], [sx * 70, 12 + k * 10]], 1.6, 162 + sx + k * 3, false, { pressure: .9, color: alpha(INK, .7) });
  });
}

// ---------- текст ----------
function subtitle(c, text, y = 1560) {
  c.save(); c.font = '800 52px Rubik'; c.textAlign = 'center'; c.lineJoin = 'round';
  text.split('\n').forEach((ln, k) => { const yy = y + k * 66; c.strokeStyle = 'rgba(20,14,20,.9)'; c.lineWidth = 13; c.strokeText(ln, CX, yy); c.fillStyle = '#fff'; c.fillText(ln, CX, yy); });
  c.restore();
}
function label(c, text, x, y, o = {}) {
  c.save(); c.font = `800 ${o.size || 40}px Rubik`; const w = c.measureText(text).width + 56, h = (o.size || 40) * 1.7;
  c.translate(x, y); c.rotate(o.rot ?? -.02);
  shp(c, [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]], o.bg || '#fffaf0', 4, 170, { corner: .2, pressure: .3 });
  c.fillStyle = o.color || INK; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(text, 0, 3); c.restore();
}

// ---------- серия 1, финал: соседи, спасатель, недомогание ----------
// кровь из носа поверх лица: рисовать после головы, в тех же координатах (rx, ry головы)
function noseBleed(c, rx, ry, k = 1) {
  c.save(); c.strokeStyle = '#b3121f'; c.lineCap = 'round'; c.lineWidth = rx * .07;
  c.beginPath(); c.moveTo(-rx * .06, ry * .34); c.quadraticCurveTo(-rx * .1, ry * .44, -rx * .07, ry * (.34 + .2 * k)); c.stroke(); c.restore();
}
// обычный взрослый в зимнем: o = {coat, coatSh, pants, hat, hair, f, pose: 'stand'|'cough'|'hold', female, k: кровь 0..1}
function person(c, o) {
  const P = o.pose || 'stand';
  c.save(); if (P === 'cough') c.rotate(.08);
  for (const sx of [-1, 1]) {
    taper(c, [[sx * 32, -300], [sx * 34, -160], [sx * 36, -30]], [58, 46, 36], o.pants || '#3a3a46', 1950 + sx);
    shp(c, [[sx * 36 - 26, -36], [sx * 36 + 26, -36], [sx * 36 + 30, 0], [sx * 36 - 30, 0]], '#2a2224', 4, 1952 + sx, { corner: .4 });
  }
  shp(c, [[-30, -654], [30, -654], [34, -620], [-34, -620]], C.skin, 4, 1955);
  shp(c, [[-84, -620], [84, -620], [96, -460], [100, -250], [-100, -250], [-96, -460]], o.coat, 5, 1956,
    { shade: q => { sideShade(o.coatSh, 90, -440, 40, 200)(q); inkLine(q, [[0, -610], [0, -260]], 2, 1957, false, { color: alpha(INK, .5) }); } });
  shp(c, [[-60, -640], [60, -640], [70, -598], [-70, -598]], o.coatSh, 4, 1958, { corner: .4 });   // воротник
  const arm = (sx, A, cloth) => { taper(c, A, [38, 32, 28], o.coat, 1960 + sx, { shade: sideShade(o.coatSh, A[1][0] + 10, A[1][1], 10, 80) }); return A[2]; };
  const L = arm(-1, [[-80, -600], [-108, -470], [-100, -350]]);
  hand(c, L[0], L[1] + 12, 16, 0, 1963);
  let R;
  if (P === 'cough') R = arm(1, [[80, -600], [96, -520], [24, -660]]);
  else R = arm(1, [[80, -600], [108, -470], [100, -350]]);
  at(c, 0, -712, 1, () => {
    const rx = 46, ry = 58; face(c, rx, ry, { ...o.f, female: o.female }, 1970);
    if (o.k) noseBleed(c, rx, ry, o.k);
    if (o.hair) shp(c, [[-rx * 1.02, ry * .05], [-rx, -ry * .6], [-rx * .4, -ry * 1.02], [rx * .5, -ry * 1.02], [rx, -ry * .6], [rx * 1.02, ry * .05], [rx * .8, -ry * .45], [-rx * .8, -ry * .45]], o.hair, 4, 1990, { corner: .6 });
    if (o.hat) { shp(c, [[-rx * 1.12, -ry * .25], [-rx * 1.05, -ry * .9], [0, -ry * 1.22], [rx * 1.05, -ry * .9], [rx * 1.12, -ry * .25]], o.hat, 5, 1991, { shade: q => hatchIn(q, rectPath(-rx * 1.2, -ry * 1.3, rx * 2.4, ry * 1.1), [-rx * 1.2, -ry * 1.3, rx * 2.4, ry * 1.1], { angle: 1.57, alpha: .25, gap: 9 }) });
      shp(c, [[-rx * 1.18, -ry * .32], [rx * 1.18, -ry * .32], [rx * 1.14, -ry * .1], [-rx * 1.14, -ry * .1]], mix(o.hat, '#ffffff', .25), 4, 1992, { corner: .3 }); }
  });
  if (P === 'cough') {   // платок у рта
    c.save(); c.translate(R[0] - 6, R[1] + 6);
    shp(c, [[-34, -26], [34, -30], [38, 24], [-30, 28]], '#f6f3ee', 3.5, 1993, { corner: .5 });
    if (o.k) { c.fillStyle = '#b3121f'; c.beginPath(); c.ellipse(4, 0, 12 * o.k, 8 * o.k, .4, 0, TAU); c.fill(); }
    c.restore(); hand(c, R[0], R[1] + 18, 16, .3, 1994);
  } else hand(c, R[0], R[1] + 12, 16, 0, 1994);
  c.restore();
}
// спасатель в защитном костюме и противогазе; dose 0..1 — дозиметр в руке
function rescuer(c, o = {}) {
  const suit = '#e9e4cf', suitSh = '#c5bd9c';
  for (const sx of [-1, 1]) {
    taper(c, [[sx * 36, -320], [sx * 38, -170], [sx * 40, -30]], [70, 58, 50], suit, 2001 + sx, { shade: sideShade(suitSh, sx * 60, -170, 16, 160) });
    shp(c, [[sx * 40 - 32, -50], [sx * 40 + 32, -50], [sx * 40 + 36, 0], [sx * 40 - 36, 0]], '#2a2a2a', 4, 2003 + sx, { corner: .3 });
  }
  shp(c, [[-96, -620], [96, -620], [104, -450], [96, -300], [-96, -300], [-104, -450]], suit, 5, 2005, { shade: q => { sideShade(suitSh, 96, -450, 40, 180)(q); inkLine(q, [[-60, -520], [60, -515]], 2, 2006, false, { color: alpha(INK, .35) }); } });
  shp(c, [[-64, -560], [64, -560], [62, -520], [-62, -520]], '#e8862a', 3, 2007, { corner: .2 });   // светоотражающая полоса
  const pointA = o.point ? [[90, -600], [170, -600], [250, -620]] : [[90, -600], [120, -480], [70, -400]];
  taper(c, [[-90, -600], [-120, -480], [-80, -400]], [44, 38, 34], suit, 2008); shp(c, ellPts(-80, -392, 22, 22), '#2a2a2a', 4, 2009);
  taper(c, pointA, [44, 38, 34], suit, 2010); shp(c, ellPts(pointA[2][0], pointA[2][1] + 8, 22, 22), '#2a2a2a', 4, 2011);
  if (o.dose !== undefined) {   // дозиметр в левой руке
    shp(c, rectPts(-130, -470, 90, 60), '#f2c13d', 4, 2012, { corner: .2 }); c.fillStyle = '#1f2a1f'; c.fillRect(-120, -462, 70, 26);
    c.save(); c.font = '800 18px Rubik'; c.fillStyle = o.dose > .6 ? '#ff4a3a' : '#7dff8a'; c.textAlign = 'center'; c.fillText((o.dose * 9.9).toFixed(1), -85, -443); c.restore();
  }
  at(c, 0, -700, 1, () => {   // капюшон и противогаз
    shp(c, ellPts(0, 0, 70, 82), suit, 5, 2013, { shade: sideShade(suitSh, 60, 10, 26, 70) });
    shp(c, ellPts(0, 10, 52, 62), '#3b3d3a', 5, 2014);
    for (const sx of [-1, 1]) { shp(c, ellPts(sx * 22, -6, 17, 17), '#b9d6e4', 4, 2015 + sx); c.fillStyle = alpha('#fff', .6); c.beginPath(); c.arc(sx * 22 - 6, -12, 5, 0, TAU); c.fill(); }
    shp(c, ellPts(0, 52, 24, 20), '#55574f', 4, 2018); shp(c, rectPts(-14, 64, 28, 34), '#6b6d63', 4, 2019, { corner: .2 });
  });
}
