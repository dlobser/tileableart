/* Shared helpers + the shared gallery plan used by several mock-ups. Plain script (works from file://). */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lerp = (a, b, t) => a + (b - a) * t;
const TAU = Math.PI * 2;
const DEG = Math.PI / 180;

/** Resize a canvas to its CSS box at device resolution; returns ctx (in CSS px) and size. */
function fitCanvas(c) {
  const r = c.getBoundingClientRect(), d = Math.min(window.devicePixelRatio || 1, 2);
  const w = Math.max(1, Math.round(r.width * d)), h = Math.max(1, Math.round(r.height * d));
  if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
  const ctx = c.getContext('2d');
  ctx.setTransform(d, 0, 0, d, 0, 0);
  return { ctx, w: r.width, h: r.height };
}

/** rAF loop that only runs while `el` is on screen. fn(dt, t) */
function loopWhileVisible(el, fn) {
  let visible = false, last = performance.now();
  new IntersectionObserver((e) => { visible = e[0].isIntersecting; }, { rootMargin: '100px' }).observe(el);
  function frame(now) {
    const dt = Math.min((now - last) / 1000, 0.1); last = now;
    if (visible) fn(dt, now / 1000);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/** Colour temperature (K) → [r,g,b] 0..255 (Tanner Helland approximation). */
function kelvinRGB(k) {
  const t = k / 100; let r, g, b;
  if (t <= 66) { r = 255; g = 99.47 * Math.log(t) - 161.12; b = t <= 19 ? 0 : 138.52 * Math.log(t - 10) - 305.04; }
  else { r = 329.7 * Math.pow(t - 60, -0.1332); g = 288.12 * Math.pow(t - 60, -0.0755); b = 255; }
  return [clamp(r, 0, 255), clamp(g, 0, 255), clamp(b, 0, 255)];
}
function hexRGB(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function rgbHex([r, g, b]) { return '#' + [r, g, b].map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join(''); }
function rgba([r, g, b], a = 1) { return `rgba(${r | 0},${g | 0},${b | 0},${a})`; }
function mixRGB(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]; }

function rng(seed) { return function () { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

let toastTimer;
function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), 2400);
}

/** Bind a range input to its sibling <output>. Returns the input. */
function bindRange(id, fmt, onInput) {
  const el = typeof id === 'string' ? document.getElementById(id) : id;
  const out = el.parentElement.querySelector('output');
  const upd = () => { if (out) out.textContent = fmt ? fmt(+el.value) : el.value; };
  el.addEventListener('input', () => { upd(); onInput && onInput(+el.value); });
  upd();
  el.refresh = upd;
  return el;
}
function segButtons(id, onPick) {
  const seg = document.getElementById(id);
  seg.addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    $$('button', seg).forEach((x) => x.classList.toggle('on', x === b));
    onPick(b.dataset, b);
  });
}
function segmentsIntersect(ax, ay, bx, by, cx, cy, dx, dy) {
  const d = (bx - ax) * (dy - cy) - (by - ay) * (dx - cx);
  if (Math.abs(d) < 1e-9) return false;
  const u = ((cx - ax) * (dy - cy) - (cy - ay) * (dx - cx)) / d;
  const v = ((cx - ax) * (by - ay) - (cy - ay) * (bx - ax)) / d;
  return u > 1e-6 && u < 1 - 1e-6 && v >= 0 && v <= 1;
}
function distToSeg(px, py, ax, ay, bx, by) {
  const vx = bx - ax, vy = by - ay, l = vx * vx + vy * vy;
  const t = l ? clamp(((px - ax) * vx + (py - ay) * vy) / l, 0, 1) : 0;
  return Math.hypot(px - ax - vx * t, py - ay - vy * t);
}
function fmtTime(s) {
  s = Math.max(0, Math.round(s));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
  return [h, m, x].map((v) => String(v).padStart(2, '0')).join(':');
}
function fmtMin(s) { return (s / 60).toFixed(1); }

/* ------------------------------------------------------------------ the shared gallery plan (metres, y down)
   Room A (x 0–10): cyc room. Curved cyc in its top-right corner with a screen on it, a podium in front, a bench.
   Room B (x 10–24): gesture wall, touch table, film nook, artifact case. Entrance on the left, exit bottom-right. */
const PLAN = (() => {
  const W = 24, H = 14;
  const walls = [
    [0, 0, 24, 0], [24, 0, 24, 14], [24, 14, 22, 14], [20, 14, 0, 14], [0, 14, 0, 8], [0, 6, 0, 0],
    [10, 0, 10, 5], [10, 9, 10, 14], [17, 4, 17, 10],
  ];
  const cyc = [[1.5, 0.45]];
  for (let i = 0; i <= 16; i++) { const a = -Math.PI / 2 + (Math.PI / 2) * i / 16; cyc.push([7 + 2.6 * Math.cos(a), 3.05 + 2.6 * Math.sin(a)]); }
  cyc.push([9.6, 4.5]);
  const cycSegs = []; for (let i = 0; i < cyc.length - 1; i++) cycSegs.push([...cyc[i], ...cyc[i + 1]]);
  const screens = {
    cyc: cyc.slice(3, 16),
    nook: [[23.92, 2], [23.92, 6]],
    gesture: [[12, 0.08], [16, 0.08]],
  };
  const obstacles = [
    { name: 'Podium', x: 6.1, y: 3.9, w: 1.0, h: 0.8 },
    { name: 'Bench', x: 3.4, y: 9.4, w: 2.4, h: 0.5 },
    { name: 'Touch table', x: 13.5, y: 10.8, w: 2.2, h: 1.2 },
    { name: 'Artifact case', x: 20.5, y: 8.4, w: 1.0, h: 1.0 },
  ];
  const exhibits = [
    { id: 'cyc', name: 'Cyc film', fx: 6.4, fy: 4.4, r: 2.6, rin: 1.4, cap: 30, dur: 150, attract: 1.0, kind: 'film' },
    { id: 'podium', name: 'Podium', fx: 6.1, fy: 3.9, r: 1.2, rin: 0.7, cap: 4, dur: 40, attract: 0.7, kind: 'interactive' },
    { id: 'gesture', name: 'Gesture wall', fx: 14, fy: 0, r: 2.4, rin: 0.8, cap: 8, dur: 55, attract: 0.8, kind: 'interactive' },
    { id: 'table', name: 'Touch table', fx: 13.5, fy: 10.8, r: 1.6, rin: 0.9, cap: 10, dur: 110, attract: 0.9, kind: 'interactive' },
    { id: 'nook', name: 'Film nook', fx: 24, fy: 4, r: 3.4, rin: 1.6, cap: 16, dur: 240, attract: 0.85, kind: 'film' },
    { id: 'case', name: 'Artifact case', fx: 20.5, fy: 8.4, r: 1.4, rin: 0.75, cap: 8, dur: 45, attract: 0.6, kind: 'object' },
  ];
  return { W, H, walls, cyc, cycSegs, screens, obstacles, exhibits, entrance: { x: 0, y: 7 }, exit: { x: 21, y: 14 }, allWalls: walls.concat(cycSegs) };
})();

/** Fit the plan into a canvas box. */
function planView(w, h, pad = 24) {
  const s = Math.min((w - pad * 2) / PLAN.W, (h - pad * 2) / PLAN.H);
  const ox = (w - PLAN.W * s) / 2, oy = (h - PLAN.H * s) / 2;
  return { s, ox, oy, X: (x) => ox + x * s, Y: (y) => oy + y * s, toWorld: (px, py) => [(px - ox) / s, (py - oy) / s] };
}

function drawPlan(ctx, V, o = {}) {
  const floor = o.floor || '#17181b', wall = o.wall || '#c9c6c0';
  ctx.fillStyle = floor; ctx.fillRect(V.X(0), V.Y(0), PLAN.W * V.s, PLAN.H * V.s);
  // floor grid (1 m)
  ctx.strokeStyle = o.grid || 'rgba(255,255,255,.035)'; ctx.lineWidth = 1; ctx.beginPath();
  for (let x = 1; x < PLAN.W; x++) { ctx.moveTo(V.X(x), V.Y(0)); ctx.lineTo(V.X(x), V.Y(PLAN.H)); }
  for (let y = 1; y < PLAN.H; y++) { ctx.moveTo(V.X(0), V.Y(y)); ctx.lineTo(V.X(PLAN.W), V.Y(y)); }
  ctx.stroke();
  // cyc
  ctx.strokeStyle = '#8d8a84'; ctx.lineWidth = Math.max(2, V.s * 0.12); ctx.lineCap = 'round'; ctx.beginPath();
  PLAN.cyc.forEach(([x, y], i) => (i ? ctx.lineTo(V.X(x), V.Y(y)) : ctx.moveTo(V.X(x), V.Y(y)))); ctx.stroke();
  // screens
  const sc = o.screenColor || {};
  for (const [k, pts] of Object.entries(PLAN.screens)) {
    ctx.strokeStyle = sc[k] || '#5fbfbd'; ctx.lineWidth = Math.max(3, V.s * 0.16); ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(V.X(x), V.Y(y)) : ctx.moveTo(V.X(x), V.Y(y)))); ctx.stroke();
  }
  // obstacles
  for (const ob of PLAN.obstacles) {
    ctx.fillStyle = '#34363b'; ctx.strokeStyle = '#55585e'; ctx.lineWidth = 1;
    ctx.fillRect(V.X(ob.x - ob.w / 2), V.Y(ob.y - ob.h / 2), ob.w * V.s, ob.h * V.s);
    ctx.strokeRect(V.X(ob.x - ob.w / 2), V.Y(ob.y - ob.h / 2), ob.w * V.s, ob.h * V.s);
  }
  // walls
  ctx.strokeStyle = wall; ctx.lineWidth = Math.max(3, V.s * 0.2); ctx.lineCap = 'square'; ctx.beginPath();
  for (const [a, b, c, d] of PLAN.walls) { ctx.moveTo(V.X(a), V.Y(b)); ctx.lineTo(V.X(c), V.Y(d)); }
  ctx.stroke();
  if (o.labels !== false) {
    ctx.fillStyle = o.labelColor || 'rgba(255,255,255,.35)'; ctx.font = `600 ${Math.max(9, V.s * 0.32)}px Figtree, sans-serif`; ctx.textAlign = 'center';
    for (const e of PLAN.exhibits) {
      let x = e.fx, y = e.fy;
      if (e.id === 'gesture') y = 0.9; if (e.id === 'nook') x = 22.6; if (e.id === 'cyc') { x = 4.6; y = 2.4; }
      if (e.id === 'podium') { y = 5.0; x = 7.3; }
      ctx.fillText(e.name.toUpperCase(), V.X(x), V.Y(y));
    }
    ctx.fillStyle = o.labelColor2 || 'rgba(255,255,255,.55)';
    ctx.fillText('ENTRANCE ▸', V.X(1.3), V.Y(7) + 4);
    ctx.fillText('EXIT ▾', V.X(21), V.Y(13.4));
  }
}
