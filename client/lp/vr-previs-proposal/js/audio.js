/* 06 Audio: speaker library, SPL heat map with occlusion, image-source reflections, Web Audio HRTF preview.
   (Stand-in for Steam Audio: same inputs — geometry, materials, sources — simpler maths.) */
(() => {
  const LIB = [
    { id: 'pt', name: 'Point source 8"', spec: '96 dB/1W · 90°×60°', dir: (a) => -6 * (1 - Math.cos(a)) / 2 * 2, occl: 15, lvl: 92 },
    { id: 'beam', name: 'Directional beam panel', spec: 'Parametric · 15° beam', dir: (a) => (a < 12 * DEG ? 0 : a < 25 * DEG ? -18 * (a / DEG - 12) / 13 : -26), occl: 18, lvl: 88 },
    { id: 'line', name: 'Line array module', spec: '100 dB/1W · 110° H', dir: (a) => (a < 55 * DEG ? 0 : -14 * (a - 55 * DEG) / (125 * DEG)), occl: 15, lvl: 96 },
    { id: 'ceil', name: 'Ceiling speaker 6.5"', spec: '90 dB/1W · 120° cone', dir: () => 0, occl: 15, lvl: 84 },
    { id: 'sub', name: 'Subwoofer 12"', spec: '40–120 Hz · omni', dir: () => 0, occl: 6, lvl: 94 },
  ];
  const lib = (id) => LIB.find((l) => l.id === id);
  let spk = [
    { m: 'pt', x: 9.0, y: 1.6, aim: 135, level: 90, src: 'Film mix L/R' },
    { m: 'pt', x: 3.4, y: 0.9, aim: 70, level: 90, src: 'Film mix L/R' },
    { m: 'beam', x: 6.1, y: 3.2, aim: 90, level: 86, src: 'Voice-over' },
    { m: 'pt', x: 23.4, y: 2.6, aim: 165, level: 90, src: 'Film mix L/R' },
    { m: 'pt', x: 23.4, y: 5.4, aim: 195, level: 90, src: 'Film mix L/R' },
    { m: 'ceil', x: 14, y: 7, aim: 90, level: 80, src: 'Ambience bed' },
  ];
  const listener = { x: 5.2, y: 6.8 };
  let sel = spk[0], mode = 'heat', dirty = true, heat = null;
  const canvas = $('#audCanvas');
  const walls = PLAN.walls; // cyc is a thin scrim, acoustically transparent here

  const crossings = (ax, ay, bx, by, m) => { let n = 0; for (const w of walls) if (w !== m && segmentsIntersect(ax, ay, bx, by, w[0], w[1], w[2], w[3])) n++; return n; };
  function levelFrom(s, x, y) {
    const L = lib(s.m), dx = x - s.x, dy = y - s.y, d = Math.max(Math.hypot(dx, dy), .4);
    const a = Math.acos(clamp((dx * Math.cos(s.aim * DEG) + dy * Math.sin(s.aim * DEG)) / d, -1, 1));
    return s.level - 20 * Math.log10(d) + L.dir(a) - L.occl * crossings(s.x, s.y, x, y);
  }
  const alpha = () => +$('#audWall').value;
  function reverb(s) { const S = 2 * PLAN.W * PLAN.H + 2 * (PLAN.W + PLAN.H) * 4, al = Math.min(alpha() + .12, .9), R = S * al / (1 - al); return s.level + 10 * Math.log10(4 / R) + 6; }
  function total(x, y) { let e = 0; for (const s of spk) { e += 10 ** (levelFrom(s, x, y) / 10) + 10 ** ((reverb(s) - 8) / 10) * .25; } return 10 * Math.log10(e); }
  function dbColor(db) {
    const t = clamp((db - 45) / 50, 0, 1);
    const stops = [[0, [12, 14, 30]], [.35, [30, 60, 140]], [.55, [40, 170, 150]], [.75, [240, 200, 70]], [.9, [240, 100, 50]], [1, [255, 240, 240]]];
    for (let i = 1; i < stops.length; i++) if (t <= stops[i][0]) { const [t0, c0] = stops[i - 1], [t1, c1] = stops[i]; return mixRGB(c0, c1, (t - t0) / (t1 - t0)); }
    return [255, 255, 255];
  }
  function buildHeat() {
    const GX = 96, GY = 56, c = document.createElement('canvas'); c.width = GX; c.height = GY; const ctx = c.getContext('2d'); const im = ctx.createImageData(GX, GY);
    for (let j = 0; j < GY; j++) for (let i = 0; i < GX; i++) { const col = dbColor(total((i + .5) / GX * PLAN.W, (j + .5) / GY * PLAN.H)), k = (j * GX + i) * 4; im.data[k] = col[0]; im.data[k + 1] = col[1]; im.data[k + 2] = col[2]; im.data[k + 3] = 255; }
    ctx.putImageData(im, 0, 0); heat = c; dirty = false;
  }
  function reflections(s) {
    const out = [];
    for (const w of walls) {
      const [ax, ay, bx, by] = w, ux = bx - ax, uy = by - ay, l2 = ux * ux + uy * uy;
      const t = ((s.x - ax) * ux + (s.y - ay) * uy) / l2, fx = ax + ux * t, fy = ay + uy * t;
      const ix = 2 * fx - s.x, iy = 2 * fy - s.y; // image source
      // intersection of image→listener with the wall
      const dx = listener.x - ix, dy = listener.y - iy, den = dx * uy - dy * ux; if (Math.abs(den) < 1e-9) continue;
      const u = ((ax - ix) * uy - (ay - iy) * ux) / den, v = ((ax - ix) * dy - (ay - iy) * dx) / den;
      if (u <= 0 || u >= 1 || v < 0 || v > 1) continue;
      const px = ix + dx * u, py = iy + dy * u;
      if (crossings(s.x, s.y, px, py, w) || crossings(px, py, listener.x, listener.y, w)) continue;
      const d = Math.hypot(dx, dy); out.push({ px, py, lvl: s.level - 20 * Math.log10(d) + 10 * Math.log10(1 - alpha()) });
    }
    return out;
  }

  let V;
  function draw() {
    const { ctx, w, h } = fitCanvas(canvas); V = planView(w, h, 18);
    ctx.fillStyle = '#0c0d0f'; ctx.fillRect(0, 0, w, h);
    drawPlan(ctx, V, { labels: mode !== 'heat' });
    if (mode === 'heat') { if (dirty) buildHeat(); ctx.globalAlpha = .82; ctx.imageSmoothingEnabled = true; ctx.drawImage(heat, V.X(0), V.Y(0), PLAN.W * V.s, PLAN.H * V.s); ctx.globalAlpha = 1;
      ctx.strokeStyle = '#c9c6c0'; ctx.lineWidth = Math.max(3, V.s * .2); ctx.beginPath(); for (const [a, b, c, d] of walls) { ctx.moveTo(V.X(a), V.Y(b)); ctx.lineTo(V.X(c), V.Y(d)); } ctx.stroke();
      // legend
      const lw = 150, lx = w - lw - 14, ly = h - 22;
      for (let i = 0; i < lw; i++) { ctx.fillStyle = rgba(dbColor(45 + 50 * i / lw)); ctx.fillRect(lx + i, ly, 1, 7); }
      ctx.fillStyle = '#aaa'; ctx.font = '10px ui-monospace, monospace'; ctx.textAlign = 'left'; ctx.fillText('45', lx, ly - 3); ctx.textAlign = 'right'; ctx.fillText('95 dB SPL', lx + lw, ly - 3);
    } else {
      for (const s of spk) {
        const occ = crossings(s.x, s.y, listener.x, listener.y) > 0;
        for (const r of reflections(s)) { ctx.strokeStyle = `rgba(255,196,107,${clamp((r.lvl - 40) / 60, .08, .7)})`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(V.X(s.x), V.Y(s.y)); ctx.lineTo(V.X(r.px), V.Y(r.py)); ctx.lineTo(V.X(listener.x), V.Y(listener.y)); ctx.stroke(); }
        ctx.strokeStyle = occ ? 'rgba(255,100,100,.7)' : 'rgba(87,209,139,.9)'; ctx.lineWidth = 2; ctx.setLineDash(occ ? [5, 4] : []);
        ctx.beginPath(); ctx.moveTo(V.X(s.x), V.Y(s.y)); ctx.lineTo(V.X(listener.x), V.Y(listener.y)); ctx.stroke(); ctx.setLineDash([]);
      }
    }
    // speakers
    for (const s of spk) {
      const x = V.X(s.x), y = V.Y(s.y), a = s.aim * DEG, L = lib(s.m);
      if (L.id !== 'sub' && L.id !== 'ceil') {
        const spread = L.id === 'beam' ? 12 * DEG : L.id === 'line' ? 55 * DEG : 45 * DEG;
        ctx.fillStyle = s === sel ? 'rgba(255,122,61,.18)' : 'rgba(255,255,255,.07)';
        ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, V.s * 2.2, a - spread, a + spread); ctx.closePath(); ctx.fill();
      }
      ctx.save(); ctx.translate(x, y); ctx.rotate(a);
      ctx.fillStyle = s === sel ? '#ff7a3d' : '#e8e8e6'; ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5;
      if (L.id === 'sub') { ctx.beginPath(); ctx.rect(-8, -8, 16, 16); ctx.fill(); ctx.stroke(); }
      else if (L.id === 'ceil') { ctx.beginPath(); ctx.arc(0, 0, 7, 0, TAU); ctx.fill(); ctx.stroke(); }
      else { ctx.beginPath(); ctx.moveTo(-6, -6); ctx.lineTo(2, -6); ctx.lineTo(8, -10); ctx.lineTo(8, 10); ctx.lineTo(2, 6); ctx.lineTo(-6, 6); ctx.closePath(); ctx.fill(); ctx.stroke(); }
      ctx.restore();
    }
    // listener head
    const lx = V.X(listener.x), ly = V.Y(listener.y);
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(lx, ly, 8, 0, TAU); ctx.fill();
    ctx.fillStyle = '#111'; ctx.beginPath(); ctx.arc(lx - 8, ly, 3, 0, TAU); ctx.arc(lx + 8, ly, 3, 0, TAU); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.moveTo(lx - 4, ly - 7); ctx.lineTo(lx, ly - 13); ctx.lineTo(lx + 4, ly - 7); ctx.fill();
    info();
  }
  function info() {
    const direct = spk.map((s) => levelFrom(s, listener.x, listener.y));
    const refl = spk.reduce((n, s) => n + reflections(s).length, 0);
    const Vol = PLAN.W * PLAN.H * 4, S = 2 * PLAN.W * PLAN.H + 2 * (PLAN.W + PLAN.H) * 4, rt = .161 * Vol / (S * (alpha() + .12) + Vol * .003);
    const best = spk[direct.indexOf(Math.max(...direct))];
    $('#audInfo').innerHTML = `<span>Total SPL</span><b>${total(listener.x, listener.y).toFixed(1)} dB</b><span>Loudest source</span><b>${lib(best.m).name.split(' ')[0]} · ${Math.max(...direct).toFixed(0)} dB</b><span>Occluded sources</span><b>${spk.filter((s) => crossings(s.x, s.y, listener.x, listener.y)).length} / ${spk.length}</b><span>1st-order reflections</span><b>${refl}</b><span>RT60 (Sabine)</span><b>${rt.toFixed(2)} s</b>`;
  }

  /* interaction */
  let drag = null;
  const toW = (e) => { const r = canvas.getBoundingClientRect(); return V.toWorld(e.clientX - r.left, e.clientY - r.top); };
  canvas.addEventListener('pointerdown', (e) => {
    const [x, y] = toW(e);
    if (Math.hypot(x - listener.x, y - listener.y) * V.s < 14) drag = { o: listener };
    else { const s = spk.find((s) => Math.hypot(s.x - x, s.y - y) * V.s < 13); if (s) { sel = s; drag = { o: s, rot: e.shiftKey }; inspector(); } }
    if (drag) canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    const [x, y] = toW(e);
    $('#audHover').textContent = x > 0 && y > 0 && x < PLAN.W && y < PLAN.H ? `${total(x, y).toFixed(0)} dB SPL here` : '';
    if (!drag) return;
    if (drag.rot) { drag.o.aim = Math.round(Math.atan2(y - drag.o.y, x - drag.o.x) / DEG); inspector(); }
    else { drag.o.x = clamp(x, .2, PLAN.W - .2); drag.o.y = clamp(y, .2, PLAN.H - .2); }
    dirty = true; updateAudio();
  });
  canvas.addEventListener('pointerup', () => { drag = null; });
  canvas.style.cursor = 'grab';
  segButtons('audView', (d) => { mode = d.v; });

  $('#audLib').innerHTML = LIB.map((l) => `<div class="item" data-id="${l.id}"><div class="sw" style="background:#2a2c30;display:grid;place-items:center;font-size:14px">${l.id === 'sub' ? '■' : l.id === 'ceil' ? '●' : '◀'}</div><div class="t"><b>${l.name}</b><small>${l.spec}</small></div></div>`).join('');
  $('#audLib').addEventListener('click', (e) => {
    const it = e.target.closest('.item'); if (!it) return; const L = lib(it.dataset.id);
    const s = { m: L.id, x: listener.x + 1.5, y: listener.y - 1.5, aim: 135, level: L.lvl, src: 'Ambience bed' }; spk.push(s); sel = s; dirty = true; inspector(); updateAudio(); toast(`${L.name} placed. Drag to position, shift-drag to aim`);
  });
  const lvl = bindRange('audLevel', (v) => v + ' dB', (v) => { sel.level = v; dirty = true; updateAudio(); });
  const aim = bindRange('audAim', (v) => v + '°', (v) => { sel.aim = v; dirty = true; });
  $('#audSrc').addEventListener('change', (e) => { sel.src = e.target.value; restartAudio(); });
  $('#audWall').addEventListener('change', () => { dirty = true; });
  function inspector() { $('#audSelName').textContent = lib(sel.m).name; lvl.value = sel.level; lvl.refresh(); aim.value = sel.aim; aim.refresh(); $('#audSrc').value = sel.src; }

  /* Web Audio preview: HRTF panners, occlusion → lowpass + gain. */
  let ac = null, voices = [];
  function makeVoice(s, i) {
    const out = ac.createGain(), lp = ac.createBiquadFilter(), pan = ac.createPanner();
    pan.panningModel = 'HRTF'; pan.distanceModel = 'inverse'; pan.refDistance = 1; pan.rolloffFactor = 1;
    lp.type = 'lowpass'; lp.frequency.value = 18000;
    const g = ac.createGain(); g.gain.value = 0;
    const base = { 'Ambience bed': [220, 277.2, 329.6], 'Voice-over': [196], 'Film mix L/R': [146.8, 220, 293.7, 370] }[s.src] || [220];
    const nodes = [];
    base.forEach((f, k) => {
      const o = ac.createOscillator(); o.type = s.src === 'Voice-over' ? 'sawtooth' : 'triangle'; o.frequency.value = f * (1 + i * 0.0015);
      const og = ac.createGain(); og.gain.value = 0.12 / base.length;
      if (s.src === 'Voice-over') { const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = 3.3; lg.gain.value = 0.08; lfo.connect(lg).connect(og.gain); lfo.start(); nodes.push(lfo); const f2 = ac.createBiquadFilter(); f2.type = 'bandpass'; f2.frequency.value = 900; f2.Q.value = 1.5; o.connect(f2).connect(og); }
      else { const lfo = ac.createOscillator(), lg = ac.createGain(); lfo.frequency.value = .08 + k * .05; lg.gain.value = 0.05 / base.length; lfo.connect(lg).connect(og.gain); lfo.start(); nodes.push(lfo); o.connect(og); }
      og.connect(g); o.start(); nodes.push(o);
    });
    g.connect(lp).connect(pan).connect(out).connect(ac.destination);
    return { s, g, lp, pan, nodes };
  }
  function updateAudio() {
    if (!ac) return;
    for (const v of voices) {
      const { s } = v, occ = crossings(s.x, s.y, listener.x, listener.y);
      v.pan.positionX.value = s.x - listener.x; v.pan.positionZ.value = s.y - listener.y; v.pan.positionY.value = 0;
      v.lp.frequency.setTargetAtTime(occ ? 700 / occ : 16000, ac.currentTime, .05);
      v.g.gain.setTargetAtTime(10 ** ((s.level - 90) / 20) * (occ ? .35 / occ : 1), ac.currentTime, .05);
    }
  }
  function stopAudio() { voices.forEach((v) => v.nodes.forEach((n) => { try { n.stop(); } catch (e) {} })); voices = []; }
  function restartAudio() { if (!ac) return; stopAudio(); voices = spk.map(makeVoice); updateAudio(); }
  $('#audListen').addEventListener('click', (e) => {
    if (ac) { stopAudio(); ac.close(); ac = null; e.target.textContent = '▶ Listen (headphones)'; return; }
    ac = new (window.AudioContext || window.webkitAudioContext)(); ac.listener.positionX && (ac.listener.positionX.value = 0);
    restartAudio(); e.target.textContent = '■ Stop listening'; toast('Drag the listener around: sources pan, muffle behind walls and fade');
  });

  inspector();
  loopWhileVisible(canvas, draw);
})();
