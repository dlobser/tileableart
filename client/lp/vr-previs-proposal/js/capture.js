/* 10 Capture: progressive "path traced" still (noise converging to a reference render) and a keyframed camera
   with a live ray-cast preview through the shared gallery plan. */
(() => {
  segButtons('capMode', (d) => { $('#capStill').classList.toggle('hidden', d.m !== 'still'); $('#capAnim').classList.toggle('hidden', d.m !== 'anim'); });

  /* ================= still ================= */
  const pt = $('#ptCanvas');
  let ref = null, refW = 0, spp = 0, target = 1024, t0 = 0, rendering = false;
  function drawReference(W, H) {
    const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
    // floor + cyc
    x.fillStyle = '#0d0c0b'; x.fillRect(0, 0, W, H);
    const horizon = H * .63;
    let g = x.createLinearGradient(0, 0, 0, horizon); g.addColorStop(0, '#3b3733'); g.addColorStop(.75, '#7a736b'); g.addColorStop(1, '#a39a8f');
    x.fillStyle = g; x.beginPath(); x.moveTo(0, 0); x.lineTo(W, 0); x.lineTo(W, horizon - H * .05); x.quadraticCurveTo(W * .5, horizon + H * .05, 0, horizon - H * .05); x.fill();
    g = x.createLinearGradient(0, horizon - H * .08, 0, H); g.addColorStop(0, '#8c8174'); g.addColorStop(.25, '#5a4a3a'); g.addColorStop(1, '#2a2119');
    x.fillStyle = g; x.beginPath(); x.moveTo(0, horizon - H * .05); x.quadraticCurveTo(W * .5, horizon + H * .05, W, horizon - H * .05); x.lineTo(W, H); x.lineTo(0, H); x.fill();
    // floor boards
    x.strokeStyle = 'rgba(0,0,0,.12)'; x.lineWidth = 1;
    for (let i = -20; i <= 20; i++) { x.beginPath(); x.moveTo(W * .5 + i * W * .02, horizon); x.lineTo(W * .5 + i * W * .16, H); x.stroke(); }
    // curved screen
    const sx0 = W * .2, sx1 = W * .8, sy0 = H * .17, sy1 = H * .45;
    x.save(); x.beginPath(); x.moveTo(sx0, sy0); x.quadraticCurveTo(W * .5, sy0 + H * .05, sx1, sy0); x.lineTo(sx1, sy1); x.quadraticCurveTo(W * .5, sy1 + H * .06, sx0, sy1); x.closePath(); x.clip();
    g = x.createLinearGradient(sx0, 0, sx1, 0); g.addColorStop(0, '#ff6a2b'); g.addColorStop(.5, '#f2b48a'); g.addColorStop(1, '#2bd4c8'); x.fillStyle = g; x.fillRect(sx0, sy0, sx1 - sx0, sy1 - sy0 + H * .1);
    x.fillStyle = 'rgba(255,255,255,.8)'; x.beginPath(); x.arc(W * .58, H * .31, H * .07, 0, TAU); x.fill(); x.restore();
    // screen light on cyc & floor
    x.globalCompositeOperation = 'lighter';
    const glow = (cx, cy, r, col, a) => { const gg = x.createRadialGradient(cx, cy, 0, cx, cy, r); gg.addColorStop(0, rgba(col, a)); gg.addColorStop(1, rgba(col, 0)); x.fillStyle = gg; x.fillRect(0, 0, W, H); };
    glow(W * .3, H * .35, W * .35, [255, 106, 43], .35); glow(W * .72, H * .35, W * .35, [43, 212, 200], .3);
    glow(W * .35, H * .78, W * .3, [255, 106, 43], .22); glow(W * .68, H * .78, W * .3, [43, 212, 200], .2);
    // spot pool + cone
    x.save(); x.translate(W * .52, H * .79); x.scale(1, .28); glow(0, 0, W * .2, [255, 236, 210], .55); x.restore();
    g = x.createLinearGradient(0, 0, 0, H * .8); g.addColorStop(0, 'rgba(255,236,210,.18)'); g.addColorStop(1, 'rgba(255,236,210,0)'); x.fillStyle = g;
    x.beginPath(); x.moveTo(W * .5, 0); x.lineTo(W * .54, 0); x.lineTo(W * .66, H * .8); x.lineTo(W * .38, H * .8); x.fill();
    x.globalCompositeOperation = 'source-over';
    // podium shadow, podium
    x.fillStyle = 'rgba(0,0,0,.45)'; x.beginPath(); x.ellipse(W * .53, H * .8, W * .07, H * .02, 0, 0, TAU); x.fill();
    x.fillStyle = '#1a1a1c'; x.fillRect(W * .515, H * .6, W * .012, H * .2);
    x.beginPath(); x.ellipse(W * .521, H * .8, W * .035, H * .01, 0, 0, TAU); x.fill();
    g = x.createLinearGradient(0, H * .57, 0, H * .61); g.addColorStop(0, '#d8d2c8'); g.addColorStop(1, '#3a3836'); x.fillStyle = g; x.fillRect(W * .45, H * .57, W * .14, H * .035);
    // two visitors for scale
    const person = (px, s, a) => { x.fillStyle = `rgba(10,10,10,${a})`; x.beginPath(); x.arc(px, H * .845 - s * .95, s * .07, 0, TAU); x.fill(); x.beginPath(); x.roundRect(px - s * .13, H * .845 - s * .87, s * .26, s * .5, s * .05); x.fill(); x.fillRect(px - s * .1, H * .845 - s * .42, s * .08, s * .42); x.fillRect(px + s * .02, H * .845 - s * .42, s * .08, s * .42); };
    person(W * .27, H * .38, .92); person(W * .33, H * .34, .9); person(W * .8, H * .42, .95);
    // screen reflection on floor
    x.globalAlpha = .12; x.save(); x.translate(0, H * 1.25); x.scale(1, -.5); x.drawImage(c, 0, sy0, W, sy1 - sy0 + 30, 0, sy0, W, sy1 - sy0 + 30); x.restore(); x.globalAlpha = 1;
    // vignette
    g = x.createRadialGradient(W / 2, H / 2, H * .3, W / 2, H / 2, W * .7); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,.55)'); x.fillStyle = g; x.fillRect(0, 0, W, H);
    return x.getImageData(0, 0, W, H);
  }
  function startStill() { spp = 0; target = +$('#ptSpp').value; t0 = performance.now(); rendering = true; }
  $('#ptStart').onclick = startStill;
  bindRange('ptBounces');
  let img = null, noiseSeed = 0;
  new IntersectionObserver((e) => { if (e[0].isIntersecting && !rendering && spp === 0) startStill(); }, { threshold: .3 }).observe(pt);
  loopWhileVisible(pt, () => {
    if ($('#capStill').classList.contains('hidden')) return;
    const { ctx, w, h } = fitCanvas(pt);
    const W = Math.round(Math.min(w, 960)), H = Math.round(W * h / w);
    if (!ref || refW !== W * 10000 + H) { ref = drawReference(W, H); refW = W * 10000 + H; img = new ImageData(W, H); }
    if (rendering) { spp = Math.min(target, spp + Math.max(1, Math.round(target / 220))); if (spp >= target) rendering = false; }
    const den = $('#ptDenoise').value === '1';
    const sigma = 160 / Math.sqrt(Math.max(spp, 1)) * (den ? .22 : 1);
    const r = ref.data, d = img.data; noiseSeed++;
    let s = noiseSeed * 9301;
    for (let i = 0; i < r.length; i += 4) {
      s = (Math.imul(s, 1103515245) + 12345) & 0x7fffffff; const n = (s / 0x7fffffff - .5) * 2;
      s = (Math.imul(s, 1103515245) + 12345) & 0x7fffffff; const firefly = !den && spp < 64 && (s & 1023) === 0 ? 255 : 0;
      const lum = (r[i] + r[i + 1] + r[i + 2]) / 765, k = n * sigma * (.4 + lum);
      d[i] = r[i] + k + firefly; d[i + 1] = r[i + 1] + k * .95 + firefly; d[i + 2] = r[i + 2] + k * 1.05 + firefly; d[i + 3] = 255;
    }
    const tmp = pt._tmp || (pt._tmp = document.createElement('canvas')); tmp.width = W; tmp.height = H; tmp.getContext('2d').putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = true;
    if (den && spp < 128) { ctx.filter = `blur(${(128 - spp) / 128 * 1.5}px)`; }
    ctx.drawImage(tmp, 0, 0, w, h); ctx.filter = 'none';
    const el = (performance.now() - t0) / 1000;
    $('#ptHud').innerHTML = `Path tracing · <b>${spp} / ${target} spp</b> · ${$('#ptBounces').value} bounces · ${rendering ? fmtTime(el).slice(3) : 'done ' + fmtTime(el).slice(3)} · denoiser ${den ? 'on' : 'off'}`;
  });

  /* ================= camera animation ================= */
  const DUR = 12;
  let keys = [
    { t: 0, x: 1.2, y: 7, yaw: 0 },
    { t: .22, x: 4.6, y: 9, yaw: -70 },
    { t: .45, x: 8.8, y: 7.2, yaw: -10 },
    { t: .7, x: 14.5, y: 5.5, yaw: -95 },
    { t: 1, x: 19.2, y: 7.4, yaw: -35 },
  ];
  let head = 0, playing = false, selK = 0;
  const plan = $('#camPlan'), view = $('#camView'), tl = $('#camTimeline'), ticks = $('#camTicks');
  const cr = (p0, p1, p2, p3, t) => .5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);
  function pose(t) {
    const k = [...keys].sort((a, b) => a.t - b.t);
    if (t <= k[0].t) return { ...k[0] }; if (t >= k[k.length - 1].t) return { ...k[k.length - 1] };
    let i = 0; while (k[i + 1].t < t) i++;
    const a = k[Math.max(i - 1, 0)], b = k[i], c = k[i + 1], d = k[Math.min(i + 2, k.length - 1)], u = (t - b.t) / (c.t - b.t), e = u * u * (3 - 2 * u) * .35 + u * .65;
    let dy = c.yaw - b.yaw; dy = ((dy + 540) % 360) - 180;
    return { x: cr(a.x, b.x, c.x, d.x, e), y: cr(a.y, b.y, c.y, d.y, e), yaw: b.yaw + dy * e };
  }
  let PV2;
  function drawPlanView(t) {
    const { ctx, w, h } = fitCanvas(plan); PV2 = planView(w, h, 14);
    ctx.fillStyle = '#0c0d0f'; ctx.fillRect(0, 0, w, h); drawPlan(ctx, PV2, { labels: false });
    ctx.strokeStyle = '#ffc46b'; ctx.lineWidth = 2; ctx.beginPath();
    for (let i = 0; i <= 120; i++) { const p = pose(i / 120); i ? ctx.lineTo(PV2.X(p.x), PV2.Y(p.y)) : ctx.moveTo(PV2.X(p.x), PV2.Y(p.y)); } ctx.stroke();
    keys.forEach((k, i) => {
      const x = PV2.X(k.x), y = PV2.Y(k.y), a = k.yaw * DEG;
      ctx.strokeStyle = i === selK ? '#ff7a3d' : '#ffc46b'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * 18, y + Math.sin(a) * 18); ctx.stroke();
      ctx.fillStyle = i === selK ? '#ff7a3d' : '#ffc46b'; ctx.beginPath(); ctx.arc(x + Math.cos(a) * 18, y + Math.sin(a) * 18, 3, 0, TAU); ctx.fill();
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI / 4); ctx.fillRect(-5, -5, 10, 10); ctx.restore();
    });
    const p = pose(t), a = p.yaw * DEG, fov = 70 * DEG, x = PV2.X(p.x), y = PV2.Y(p.y);
    ctx.fillStyle = 'rgba(255,77,77,.18)'; ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, PV2.s * 5, a - fov / 2, a + fov / 2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ff4d4d'; ctx.beginPath(); ctx.arc(x, y, 5, 0, TAU); ctx.fill();
  }
  // ray-cast preview
  const segs = (() => {
    const s = [];
    for (const w of PLAN.walls) s.push({ w, hgt: 4, kind: 'wall' });
    PLAN.cycSegs.forEach((w, i) => s.push({ w, hgt: 3.6, kind: i >= 3 && i <= 14 ? 'cycscreen' : 'cyc' }));
    s.push({ w: [23.9, 2, 23.9, 6], hgt: 3, kind: 'nook' }); s.push({ w: [12, .1, 16, .1], hgt: 2.6, kind: 'gesture' });
    for (const o of PLAN.obstacles) { const x0 = o.x - o.w / 2, x1 = o.x + o.w / 2, y0 = o.y - o.h / 2, y1 = o.y + o.h / 2; for (const w of [[x0, y0, x1, y0], [x1, y0, x1, y1], [x1, y1, x0, y1], [x0, y1, x0, y0]]) s.push({ w, hgt: o.name === 'Bench' ? .45 : 1.0, kind: 'obj' }); }
    return s;
  })();
  function rayHits(ox, oy, dx, dy) {
    const hits = [];
    for (const s of segs) {
      const [ax, ay, bx, by] = s.w, ex = bx - ax, ey = by - ay, den = dx * ey - dy * ex; if (Math.abs(den) < 1e-9) continue;
      const t = ((ax - ox) * ey - (ay - oy) * ex) / den, u = ((ax - ox) * dy - (ay - oy) * dx) / den;
      if (t > .05 && u >= 0 && u <= 1) hits.push({ t, u, s, nx: -ey, ny: ex });
    }
    return hits.sort((a, b) => a.t - b.t);
  }
  function drawView(t, wall) {
    const { ctx, w, h } = fitCanvas(view), p = pose(t), fov = 70 * DEG, f = (w / 2) / Math.tan(fov / 2), eye = 1.6;
    const g = ctx.createLinearGradient(0, 0, 0, h); g.addColorStop(0, '#1d1c1b'); g.addColorStop(.5, '#2b2926'); g.addColorStop(.5, '#3a3129'); g.addColorStop(1, '#5a4a3a'); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    const cols = Math.ceil(w / 2);
    for (let c = 0; c < cols; c++) {
      const ang = p.yaw * DEG + Math.atan(((c + .5) * 2 - w / 2) / f), dx = Math.cos(ang), dy = Math.sin(ang), corr = Math.cos(ang - p.yaw * DEG);
      const hits = rayHits(p.x, p.y, dx, dy); const tall = hits.findIndex((x) => x.s.kind !== 'obj');
      const list = tall >= 0 ? hits.slice(0, tall + 1).reverse() : hits.reverse();
      for (const hh of list) {
        const d = hh.t * corr, yTop = h / 2 - (hh.s.hgt - eye) * f / d, yBot = h / 2 + eye * f / d;
        const nl = Math.hypot(hh.nx, hh.ny), shade = .55 + .45 * Math.abs((hh.nx * Math.cos(.6) + hh.ny * Math.sin(.6)) / nl), fog = Math.exp(-d * .05);
        let col;
        if (hh.s.kind === 'wall') col = [196, 190, 182];
        else if (hh.s.kind === 'cyc' || hh.s.kind === 'cycscreen') col = [228, 224, 216];
        else if (hh.s.kind === 'nook') col = [43 + 40 * Math.sin(wall + hh.u * 3), 180, 190];
        else if (hh.s.kind === 'gesture') col = [200 + 50 * Math.sin(wall * 2 + hh.u * 8), 120, 200];
        else col = [70, 68, 72];
        ctx.fillStyle = rgba(col.map((v) => v * shade * fog + 12 * (1 - fog)));
        ctx.fillRect(c * 2, yTop, 2, yBot - yTop);
        if (hh.s.kind === 'cycscreen') {
          const s0 = h / 2 - (3 - eye) * f / d, s1 = h / 2 - (1 - eye) * f / d, u = hh.u + (PLAN.cycSegs.indexOf(hh.s.w) - 3) ;
          ctx.fillStyle = `hsl(${(u * 22 + wall * 30) % 360},65%,${55 * fog + 10}%)`; ctx.fillRect(c * 2, s0, 2, s1 - s0);
        }
      }
    }
    $('#camHud').innerHTML = `CAM · <b>${(t * DUR).toFixed(2)}s</b> / ${DUR}s · 35 mm · f/2.8 · frame ${Math.round(t * DUR * 24)}`;
  }
  function drawTicks() {
    const { ctx, w, h } = fitCanvas(ticks); ctx.clearRect(0, 0, w, h);
    ctx.font = '10px ui-monospace, monospace';
    for (let s = 0; s <= DUR; s++) { const x = 12 + (w - 24) * s / DUR; ctx.fillStyle = '#3a3d42'; ctx.fillRect(x, h - (s % 2 ? 8 : 14), 1, s % 2 ? 8 : 14); ctx.fillStyle = '#8d9096'; if (s % 2 === 0) ctx.fillText(s + 's', x + 3, 12); }
  }
  function drawTimeline() {
    drawTicks();
    $$('.kf', tl).forEach((e) => e.remove());
    keys.forEach((k, i) => { const d = document.createElement('div'); d.className = 'kf' + (i === selK ? ' sel' : ''); d.style.left = `calc(12px + (100% - 24px) * ${k.t})`; d.dataset.i = i; tl.append(d); });
    $('#camHead').style.left = `calc(12px + (100% - 24px) * ${head})`;
  }
  // timeline interaction
  let tlDrag = null;
  tl.addEventListener('pointerdown', (e) => {
    const kf = e.target.closest('.kf');
    tlDrag = kf ? { k: +kf.dataset.i } : { head: true }; if (kf) selK = +kf.dataset.i;
    tl.setPointerCapture(e.pointerId); tlMove(e);
  });
  function tlMove(e) {
    if (!tlDrag) return; const r = tl.getBoundingClientRect(), t = clamp((e.clientX - r.left - 12) / (r.width - 24), 0, 1);
    if (tlDrag.head) head = t; else { keys[tlDrag.k].t = t; head = t; }
    drawTimeline();
  }
  tl.addEventListener('pointermove', tlMove); tl.addEventListener('pointerup', () => { tlDrag = null; });
  // plan interaction: drag keyframe cameras, drag their aim handle to set yaw
  let pDrag = null;
  plan.addEventListener('pointerdown', (e) => {
    const r = plan.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
    keys.forEach((k, i) => { const x = PV2.X(k.x), y = PV2.Y(k.y), a = k.yaw * DEG; if (Math.hypot(mx - x - Math.cos(a) * 18, my - y - Math.sin(a) * 18) < 7) pDrag = { i, aim: true }; else if (!pDrag && Math.hypot(mx - x, my - y) < 9) pDrag = { i }; });
    if (pDrag) { selK = pDrag.i; head = keys[selK].t; plan.setPointerCapture(e.pointerId); drawTimeline(); }
  });
  plan.addEventListener('pointermove', (e) => {
    if (!pDrag) return; const r = plan.getBoundingClientRect(), [x, y] = PV2.toWorld(e.clientX - r.left, e.clientY - r.top), k = keys[pDrag.i];
    if (pDrag.aim) k.yaw = Math.atan2(y - k.y, x - k.x) / DEG; else { k.x = clamp(x, .3, PLAN.W - .3); k.y = clamp(y, .3, PLAN.H - .3); }
  });
  plan.addEventListener('pointerup', () => { pDrag = null; });
  plan.style.cursor = 'grab';
  $('#camPlay').onclick = (e) => { playing = !playing; if (playing && head >= 1) head = 0; e.target.textContent = playing ? '❚❚ Pause' : '▶ Play'; };
  $('#camKey').onclick = () => { const p = pose(head); keys.push({ t: head, x: p.x, y: p.y, yaw: p.yaw }); selK = keys.length - 1; drawTimeline(); toast('Keyframe added. Drag it on the plan'); };
  $('#camDelKey').onclick = () => { if (keys.length <= 2) return; keys.splice(selK, 1); selK = 0; drawTimeline(); };
  const q = [];
  $('#camRender').onclick = () => {
    const item = { name: `Flythrough_v${q.length + 1}.mp4`, p: 0 }; q.unshift(item);
    const tick = () => { item.p = Math.min(1, item.p + .02 + Math.random() * .02); renderQ(); if (item.p < 1) setTimeout(tick, 120); else toast(`${item.name} rendered`); };
    tick();
  };
  function renderQ() {
    $('#camQueue').innerHTML = q.map((it) => `<div class="item"><div class="t"><b>${it.name}</b><small>1920×1080 · 24 fps · ${DUR * 24} frames · cues 3–4 playing · crowd silhouettes on</small><div class="pbar"><div style="width:${it.p * 100}%"></div></div></div><span class="status ${it.p >= 1 ? 'ok' : 'run'}">${it.p >= 1 ? 'ready' : 'frame ' + Math.round(it.p * DUR * 24)}</span></div>`).join('');
  }
  drawTimeline();
  addEventListener('resize', drawTimeline);
  loopWhileVisible(view, (dt, t) => {
    if ($('#capAnim').classList.contains('hidden')) return;
    if (playing) { head += dt / DUR; if (head >= 1) { head = 1; playing = false; $('#camPlay').textContent = '▶ Play'; } $('#camHead').style.left = `calc(12px + (100% - 24px) * ${head})`; }
    drawPlanView(head); drawView(head, t); drawTicks();
  });
  segButtons('capMode', () => setTimeout(drawTimeline, 0));
})();
