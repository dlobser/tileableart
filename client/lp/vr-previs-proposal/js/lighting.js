/* 03 Lighting: catalogue of (representative) fixtures, plan view with photometric pools / false-colour lux. */
(() => {
  const CAT = [
    { id: 'prof', name: 'Framing Profile 750', type: 'Ellipsoidal · zoom', beam: [19, 50], lm: 9800, w: 300, cri: 95, cct: [3000, 3000] },
    { id: 'track', name: 'Track Spot 25W', type: 'Track spot · lens set', beam: [15, 36], lm: 2200, w: 25, cri: 97, cct: [2700, 4000] },
    { id: 'down', name: 'Recessed Downlight 18W', type: 'Downlight · fixed', beam: [40, 40], lm: 1650, w: 18, cri: 90, cct: [3000, 3000] },
    { id: 'fres', name: 'LED Fresnel 300', type: 'Fresnel · tunable white', beam: [12, 60], lm: 8000, w: 300, cri: 96, cct: [2800, 6500] },
    { id: 'mover', name: 'RGBW Wash Mover', type: 'Moving head · zoom', beam: [8, 40], lm: 12000, w: 450, cri: 80, rgb: true },
    { id: 'pend', name: 'Opal Pendant 12W', type: 'Decorative · diffuse', beam: [110, 110], lm: 900, w: 12, cri: 90, cct: [2700, 2700] },
  ];
  const byId = (id) => CAT.find((c) => c.id === id);
  let fx = [
    { model: 'prof', x: 5.6, y: 4.6, z: 3.8, pan: 0, tilt: 0, beam: 26, dim: 90, cct: 3000, color: '#ff8a3d' },
    { model: 'track', x: 3.2, y: 5.6, z: 3.8, pan: 35, tilt: 38, beam: 24, dim: 80, cct: 3500, color: '#ff8a3d' },
    { model: 'track', x: 6.4, y: 7.2, z: 3.8, pan: 5, tilt: 40, beam: 24, dim: 80, cct: 3500, color: '#ff8a3d' },
    { model: 'mover', x: 8.6, y: 8.4, z: 3.9, pan: -10, tilt: 32, beam: 30, dim: 70, cct: 4000, color: '#3dc8ff' },
    { model: 'down', x: 2, y: 8.5, z: 3.9, pan: 0, tilt: 0, beam: 40, dim: 60, cct: 3000, color: '#ff8a3d' },
    { model: 'down', x: 4.5, y: 8.5, z: 3.9, pan: 0, tilt: 0, beam: 40, dim: 60, cct: 3000, color: '#ff8a3d' },
  ];
  let sel = fx[0], mode = 'pool', dirty = true, luxImg = null;
  const canvas = $('#litCanvas');
  const R = 10; // room is 10×10 m

  const colorOf = (f) => (byId(f.model).rgb ? hexRGB(f.color) : kelvinRGB(f.cct));
  const candela = (f) => { const m = byId(f.model); return m.lm * 0.85 * (f.dim / 100) / (TAU * (1 - Math.cos(f.beam / 2 * DEG))); };
  function aimVec(f) { const p = f.pan * DEG, t = f.tilt * DEG; return [Math.sin(t) * Math.sin(p), -Math.sin(t) * Math.cos(p), -Math.cos(t)]; } // pan 0 = toward back wall (−y)
  /** illuminance (lux) on the floor at x,y from fixture f */
  function luxAt(f, x, y) {
    const dx = x - f.x, dy = y - f.y, dz = -f.z, d = Math.hypot(dx, dy, dz);
    const a = aimVec(f), cosA = (dx * a[0] + dy * a[1] + dz * a[2]) / d, ang = Math.acos(clamp(cosA, -1, 1)) / DEG;
    const half = f.beam / 2, field = half * 1.6 + 3;
    const rel = ang <= half ? 1 - 0.5 * (ang / half) ** 2 : ang >= field ? 0 : 0.5 * (1 - (ang - half) / (field - half)) ** 2;
    return candela(f) * rel * (f.z / d) / (d * d);
  }
  const totalLux = (x, y) => fx.reduce((s, f) => s + luxAt(f, x, y), 0);

  function view(w, h) { const s = Math.min((w - 40) / R, (h - 40) / R); return { s, ox: (w - R * s) / 2, oy: (h - R * s) / 2 }; }
  let V;
  const X = (x) => V.ox + x * V.s, Y = (y) => V.oy + y * V.s;

  function falseColor(l) { // 0..1000 lux
    const t = clamp(Math.log10(1 + l) / 3, 0, 1);
    const stops = [[0, [10, 10, 30]], [.3, [40, 40, 160]], [.5, [30, 170, 160]], [.7, [240, 210, 60]], [.88, [240, 110, 40]], [1, [255, 255, 255]]];
    for (let i = 1; i < stops.length; i++) if (t <= stops[i][0]) { const [t0, c0] = stops[i - 1], [t1, c1] = stops[i]; return mixRGB(c0, c1, (t - t0) / (t1 - t0)); }
    return [255, 255, 255];
  }
  function buildLux() {
    const G = 110; const c = document.createElement('canvas'); c.width = c.height = G; const ctx = c.getContext('2d'); const im = ctx.createImageData(G, G);
    for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) { const l = totalLux((i + .5) / G * R, (j + .5) / G * R), col = falseColor(l), k = (j * G + i) * 4; im.data[k] = col[0]; im.data[k + 1] = col[1]; im.data[k + 2] = col[2]; im.data[k + 3] = 255; }
    ctx.putImageData(im, 0, 0); luxImg = c; dirty = false;
  }

  function draw() {
    const { ctx, w, h } = fitCanvas(canvas); V = view(w, h);
    ctx.fillStyle = '#0c0d0f'; ctx.fillRect(0, 0, w, h);
    if (mode === 'lux') { if (dirty) buildLux(); ctx.imageSmoothingEnabled = true; ctx.drawImage(luxImg, X(0), Y(0), R * V.s, R * V.s); }
    else {
      ctx.fillStyle = '#16140f'; ctx.fillRect(X(0), Y(0), R * V.s, R * V.s);
      ctx.save(); ctx.beginPath(); ctx.rect(X(0), Y(0), R * V.s, R * V.s); ctx.clip();
      ctx.globalCompositeOperation = 'lighter';
      for (const f of fx) {
        const a = aimVec(f), t = f.tilt * DEG, half = f.beam / 2 * DEG;
        const cx = f.x + a[0] / -a[2] * f.z, cy = f.y + a[1] / -a[2] * f.z;
        const slant = f.z / Math.cos(t), minor = slant * Math.tan(half) * 1.35;
        const major = (f.z * (Math.tan(Math.min(t + half, 80 * DEG)) - Math.tan(t - half))) / 2 * 1.35;
        const strength = clamp(Math.log10(1 + luxAt(f, cx, cy)) / 3, 0.05, 1);
        const col = colorOf(f);
        ctx.save(); ctx.translate(X(cx), Y(cy)); ctx.rotate(f.pan * DEG + Math.PI / 2); ctx.scale(Math.max(major, minor) / minor, 1);
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, minor * V.s);
        g.addColorStop(0, rgba(col, .85 * strength)); g.addColorStop(.6, rgba(col, .45 * strength)); g.addColorStop(1, rgba(col, 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, minor * V.s, 0, TAU); ctx.fill(); ctx.restore();
      }
      ctx.restore(); ctx.globalCompositeOperation = 'source-over';
    }
    // room
    ctx.strokeStyle = '#c9c6c0'; ctx.lineWidth = 3; ctx.strokeRect(X(0), Y(0), R * V.s, R * V.s);
    ctx.strokeStyle = 'rgba(220,216,208,.8)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(X(1.5), Y(.3));
    ctx.lineTo(X(6.5), Y(.3)); ctx.arc(X(6.5), Y(3.5), 3.2 * V.s, -Math.PI / 2, 0); ctx.lineTo(X(9.7), Y(8)); ctx.stroke();
    ctx.strokeStyle = '#5fbfbd'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(X(6.5), Y(3.5), 3.12 * V.s, -Math.PI / 2 + .25, -.25); ctx.stroke();
    ctx.save(); ctx.translate(X(5.6), Y(4.6)); ctx.rotate(Math.PI / 4); ctx.fillStyle = '#3a3c41'; ctx.fillRect(-.65 * V.s, -.22 * V.s, 1.3 * V.s, .45 * V.s); ctx.restore();
    ctx.fillStyle = '#3a3c41'; ctx.fillRect(X(2.3), Y(8.9), 2.4 * V.s, .5 * V.s);
    ctx.font = '600 10px Figtree, sans-serif'; ctx.fillStyle = 'rgba(255,255,255,.35)'; ctx.textAlign = 'center';
    ctx.fillText('CYC + SCREEN', X(7.6), Y(1.7)); ctx.fillText('PODIUM', X(5.6), Y(5.5)); ctx.fillText('BENCH', X(3.5), Y(9.8));
    // fixtures
    for (const f of fx) {
      const a = aimVec(f), cx = f.x + a[0] / -a[2] * f.z, cy = f.y + a[1] / -a[2] * f.z;
      ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.setLineDash([3, 3]); ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(X(f.x), Y(f.y)); ctx.lineTo(X(cx), Y(cy)); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = f === sel ? '#ff7a3d' : '#e8e8e6'; ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.arc(X(f.x), Y(f.y), f === sel ? 8 : 6, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.fillStyle = rgba(colorOf(f)); ctx.beginPath(); ctx.arc(X(f.x), Y(f.y), 3, 0, TAU); ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.font = '10px ui-monospace, monospace'; ctx.textAlign = 'left';
      ctx.fillText(byId(f.model).name.split(' ').slice(0, 2).join(' '), X(f.x) + 10, Y(f.y) - 8);
    }
    if (mode === 'lux') { // legend
      const lw = 160, lx = w - lw - 14, ly = h - 26;
      for (let i = 0; i < lw; i++) { ctx.fillStyle = rgba(falseColor(10 ** (i / lw * 3) - 1)); ctx.fillRect(lx + i, ly, 1, 8); }
      ctx.fillStyle = '#aaa'; ctx.font = '10px ui-monospace, monospace'; ctx.textAlign = 'left'; ctx.fillText('0', lx, ly - 3); ctx.textAlign = 'center'; ctx.fillText('30', lx + lw / 2, ly - 3); ctx.textAlign = 'right'; ctx.fillText('1000 lx', lx + lw, ly - 3);
    }
  }

  /* interaction */
  let drag = null;
  const toW = (e) => { const r = canvas.getBoundingClientRect(); return [(e.clientX - r.left - V.ox) / V.s, (e.clientY - r.top - V.oy) / V.s]; };
  canvas.addEventListener('pointerdown', (e) => {
    const [x, y] = toW(e); const hit = fx.find((f) => Math.hypot(f.x - x, f.y - y) * V.s < 12);
    if (hit) { sel = hit; drag = hit; canvas.setPointerCapture(e.pointerId); inspector(); }
  });
  canvas.addEventListener('pointermove', (e) => {
    const [x, y] = toW(e);
    if (drag) { drag.x = clamp(x, .2, R - .2); drag.y = clamp(y, .2, R - .2); dirty = true; }
    $('#litLux').textContent = x >= 0 && y >= 0 && x <= R && y <= R ? `${Math.round(totalLux(x, y))} lux on floor at (${x.toFixed(1)}, ${y.toFixed(1)}) m` : 'hover for lux';
  });
  canvas.addEventListener('pointerup', () => { drag = null; inspector(); });
  canvas.style.cursor = 'crosshair';
  segButtons('litView', (d) => { mode = d.v; dirty = true; });

  const model = $('#litModel'); model.innerHTML = CAT.map((c) => `<option value="${c.id}">${c.name}</option>`).join('');
  const ctrls = {
    pan: bindRange('litPan', (v) => v + '°', (v) => set('pan', v)),
    tilt: bindRange('litTilt', (v) => v + '°', (v) => set('tilt', v)),
    beam: bindRange('litBeam', (v) => v + '°', (v) => set('beam', v)),
    dim: bindRange('litDim', (v) => v + '%', (v) => set('dim', v)),
    cct: bindRange('litCct', (v) => v + 'K', (v) => set('cct', v)),
    z: bindRange('litZ', (v) => v.toFixed(1) + 'm', (v) => set('z', v)),
  };
  $('#litColor').addEventListener('input', (e) => set('color', e.target.value));
  function set(k, v) { sel[k] = v; dirty = true; photometrics(); }
  model.addEventListener('change', () => swap(model.value));
  function swap(id) {
    const m = byId(id); sel.model = id; sel.beam = clamp(sel.beam, m.beam[0], m.beam[1]);
    if (!m.rgb) sel.cct = clamp(sel.cct, m.cct[0], m.cct[1]);
    dirty = true; inspector(); toast(`Swapped to ${m.name} · position & aim kept`);
  }
  function inspector() {
    const m = byId(sel.model);
    $('#litName').textContent = `${m.name} · #${fx.indexOf(sel) + 1}`;
    $('#litSpec').textContent = `${m.type} · ${m.lm.toLocaleString()} lm · CRI ${m.cri} · ${m.w} W · IES ✓`;
    model.value = sel.model;
    for (const k of ['pan', 'tilt', 'beam', 'dim', 'cct', 'z']) { ctrls[k].value = sel[k]; ctrls[k].refresh(); }
    ctrls.beam.min = m.beam[0]; ctrls.beam.max = m.beam[1]; ctrls.beam.disabled = m.beam[0] === m.beam[1];
    ctrls.cct.disabled = !!m.rgb || m.cct[0] === m.cct[1];
    if (!m.rgb) { ctrls.cct.min = Math.min(1800, m.cct[0]); }
    $('#litColorRow').classList.toggle('hidden', !m.rgb); $('#litColor').value = sel.color;
    renderCat(); photometrics();
  }
  function photometrics() {
    const m = byId(sel.model), a = aimVec(sel), cx = sel.x + a[0] / -a[2] * sel.z, cy = sel.y + a[1] / -a[2] * sel.z;
    const slant = sel.z / Math.cos(sel.tilt * DEG);
    $('#litPhoto').innerHTML = `<span>Output</span><b>${Math.round(m.lm * sel.dim / 100).toLocaleString()} lm</b><span>Peak intensity</span><b>${Math.round(candela(sel)).toLocaleString()} cd</b><span>At aim point</span><b>${Math.round(luxAt(sel, cx, cy))} lx</b><span>Beam Ø at throw</span><b>${(2 * slant * Math.tan(sel.beam / 2 * DEG)).toFixed(2)} m</b><span>Throw</span><b>${slant.toFixed(2)} m</b><span>Power</span><b>${Math.round(m.w * sel.dim / 100)} W</b><span>Colour</span><b>${m.rgb ? 'RGBW ' + sel.color : sel.cct + ' K'}</b>`;
  }
  function renderCat() {
    $('#litCatalogue').innerHTML = CAT.map((c) => `<div class="item ${c.id === sel.model ? 'sel' : ''}" data-id="${c.id}"><div class="sw" style="background:radial-gradient(circle, ${c.rgb ? '#3dc8ff' : rgba(kelvinRGB(c.cct[0]))} 0 30%, #222 70%)"></div><div class="t"><b>${c.name}</b><small>${c.beam[0] === c.beam[1] ? c.beam[0] + '°' : c.beam[0] + '–' + c.beam[1] + '°'} · ${c.lm.toLocaleString()} lm · ${c.rgb ? 'RGBW' : c.cct[0] === c.cct[1] ? c.cct[0] + 'K' : c.cct[0] + '–' + c.cct[1] + 'K'}</small></div></div>`).join('')
      + `<div class="item" id="litEditCat" style="justify-content:center;color:var(--ui-muted)">+ New variant / import IES…</div>`;
  }
  $('#litCatalogue').addEventListener('click', (e) => {
    const it = e.target.closest('.item'); if (!it) return;
    if (it.id === 'litEditCat') { toast('Duplicate a fixture, edit lens & lumen package, or attach an IES/LDT file'); return; }
    swap(it.dataset.id);
  });
  $('#litAdd').onclick = () => { const f = { model: 'track', x: 5, y: 6, z: 3.8, pan: 0, tilt: 30, beam: 24, dim: 80, cct: 3000, color: '#ff8a3d' }; fx.push(f); sel = f; dirty = true; inspector(); };
  $('#litDel').onclick = () => { if (fx.length < 2) return; fx = fx.filter((f) => f !== sel); sel = fx[0]; dirty = true; inspector(); };

  inspector();
  loopWhileVisible(canvas, draw);
})();
