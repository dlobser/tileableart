/* 02 Materials: procedural PBR library, shaded preview sphere, and photo → tileable PBR (actually computed). */
(() => {
  const N = 128;
  /* tileable value noise */
  function noiseTex(seed, cells) {
    const r = rng(seed), g = []; for (let i = 0; i < cells * cells; i++) g.push(r());
    return (x, y) => { // x,y in [0,1)
      const fx = x * cells, fy = y * cells, ix = Math.floor(fx), iy = Math.floor(fy), tx = fx - ix, ty = fy - iy;
      const s = (t) => t * t * (3 - 2 * t), at = (i, j) => g[((j % cells + cells) % cells) * cells + ((i % cells + cells) % cells)];
      return lerp(lerp(at(ix, iy), at(ix + 1, iy), s(tx)), lerp(at(ix, iy + 1), at(ix + 1, iy + 1), s(tx)), s(ty));
    };
  }
  function fbm(seed, base = 4, oct = 4) { const ns = []; for (let o = 0; o < oct; o++) ns.push(noiseTex(seed + o * 17, base << o)); return (x, y) => { let v = 0, a = .5, t = 0; for (const n of ns) { v += n(x, y) * a; t += a; a *= .5; } return v / t; }; }
  function makeCanvas(fn) {
    const c = document.createElement('canvas'); c.width = c.height = N; const ctx = c.getContext('2d'); const im = ctx.createImageData(N, N);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const [r, g, b] = fn(x / N, y / N, x, y); const i = (y * N + x) * 4; im.data[i] = r; im.data[i + 1] = g; im.data[i + 2] = b; im.data[i + 3] = 255; }
    ctx.putImageData(im, 0, 0); return c;
  }
  const lib = [];
  const add = (name, meta, rough, metal, tile, fn) => lib.push({ name, meta, rough, metal, tile, albedo: makeCanvas(fn) });
  { const n = fbm(1, 2, 4), s = fbm(2, 8, 3);
    add('White oak plank', 'Rift-sawn · matte lacquer · FSC', .45, 0, 1.2, (x, y) => { const plank = Math.floor(y * 4), k = (plank * 0.37) % 1; const grain = Math.sin((x * 3 + n(x, (y + k) % 1) * 2.5) * 40) * .5 + .5; const seam = (y * 4) % 1 < .025 ? .55 : 1; const v = (.75 + grain * .12 + s(x, y) * .1 + k * .08) * seam; return [205 * v, 160 * v, 112 * v]; }); }
  { const r = rng(5), chips = []; for (let i = 0; i < 90; i++) chips.push([r(), r(), .01 + r() * .035, [[180, 80, 60], [60, 60, 66], [235, 230, 220], [130, 150, 140]][i % 4]]); const n = fbm(6, 4, 3);
    add('Terrazzo, warm', 'Cast-in-place · honed · 600×600', .35, 0, 0.8, (x, y) => { for (const [cx, cy, cr, col] of chips) { let dx = Math.abs(x - cx), dy = Math.abs(y - cy); dx = Math.min(dx, 1 - dx); dy = Math.min(dy, 1 - dy); if (dx * dx + dy * dy < cr * cr) return col; } const v = .85 + n(x, y) * .1; return [228 * v, 220 * v, 208 * v]; }); }
  { const n = fbm(9, 3, 5);
    add('Polished concrete', 'Grind level 3 · sealed', .3, 0, 2, (x, y) => { const v = .55 + n(x, y) * .35; return [150 * v + 20, 148 * v + 20, 144 * v + 20]; }); }
  { const n = noiseTex(11, 4), s = (() => { const r = rng(12), a = []; for (let i = 0; i < N; i++) a.push(r()); return a; })();
    add('Brushed aluminium', 'Anodised clear · #4 brush', .3, 1, 0.5, (x, y, px, py) => { const v = .7 + s[py] * .2 + n(x, y) * .08; return [200 * v, 204 * v, 210 * v]; }); }
  { const n = fbm(14, 16, 2);
    add('Wool felt, slate', '5 mm · acoustic NRC .35', .95, 0, 0.4, (x, y) => { const v = .8 + n(x, y) * .25; return [70 * v, 82 * v, 92 * v]; }); }
  { const n = fbm(17, 3, 5);
    add('Lime plaster', 'Tadelakt finish · warm white', .7, 0, 2, (x, y) => { const v = .88 + n(x, y) * .12; return [236 * v, 226 * v, 210 * v]; }); }
  { const n = fbm(20, 8, 3);
    add('Reclaimed brick', 'London stock · lime mortar', .85, 0, 1.0, (x, y) => { const row = Math.floor(y * 8), off = row % 2 ? .125 : 0; const mx = ((x + off) * 4) % 1, my = (y * 8) % 1; if (mx < .04 || my < .08) return [190, 182, 170]; const k = ((Math.floor((x + off) * 4) * 7 + row * 13) % 5) / 5; const v = .7 + n(x, y) * .3; return [(150 + k * 40) * v, (85 + k * 20) * v, 60 * v]; }); }
  { const r = rng(23), n = fbm(24, 16, 2);
    add('Cork, natural', 'Agglomerated · 6 mm tile', .9, 0, 0.6, (x, y) => { const v = .65 + n(x, y) * .45 + (r() - .5) * .12; return [170 * v, 125 * v, 80 * v]; }); }
  { const n = fbm(26, 2, 4), s = fbm(27, 12, 2);
    add('Walnut veneer', 'Crown cut · satin', .4, 0, 1.0, (x, y) => { const grain = Math.sin((y * 2 + n(x, y) * 1.6) * 34 + Math.sin(x * TAU * 2) * 2) * .5 + .5; const v = .55 + grain * .18 + s(x, y) * .08; return [120 * v, 78 * v, 52 * v]; }); }
  { const n = fbm(30, 4, 4);
    add('Blackened steel', 'Hot-rolled · waxed', .45, 1, 1.0, (x, y) => { const v = .25 + n(x, y) * .2; return [70 * v + 20, 66 * v + 20, 64 * v + 22]; }); }

  /* derived maps */
  function maps(albedoCanvas) {
    const src = albedoCanvas.getContext('2d').getImageData(0, 0, N, N).data;
    const H = new Float32Array(N * N); for (let i = 0; i < N * N; i++) H[i] = (src[i * 4] * .3 + src[i * 4 + 1] * .59 + src[i * 4 + 2] * .11) / 255;
    let mn = 1, mx = 0; for (const v of H) { mn = Math.min(mn, v); mx = Math.max(mx, v); }
    const h = (x, y) => (H[((y + N) % N) * N + ((x + N) % N)] - mn) / (mx - mn + 1e-6);
    const normal = makeCanvas((u, v, x, y) => { const dx = (h(x + 1, y) - h(x - 1, y)) * 3, dy = (h(x, y + 1) - h(x, y - 1)) * 3; const l = Math.hypot(dx, dy, 1); return [(-dx / l * .5 + .5) * 255, (-dy / l * .5 + .5) * 255, (1 / l * .5 + .5) * 255]; });
    const height = makeCanvas((u, v, x, y) => { const k = h(x, y) * 255; return [k, k, k]; });
    const rough = makeCanvas((u, v, x, y) => { const k = (0.35 + (1 - h(x, y)) * .55) * 255; return [k, k, k]; });
    return { normal, height, roughMap: rough };
  }
  lib.forEach((m) => Object.assign(m, maps(m.albedo)));

  /* ---------------- library UI ---------------- */
  let sel = lib[0];
  const sw = $('#swatches');
  function renderLib() {
    const q = $('#matSearch').value.toLowerCase();
    sw.innerHTML = '';
    lib.filter((m) => !q || (m.name + m.meta).toLowerCase().includes(q)).forEach((m) => {
      const d = document.createElement('div'); d.className = 'swatch' + (m === sel ? ' sel' : '') + (m.isNew ? ' new' : '');
      const c = document.createElement('canvas'); c.width = c.height = 80; c.getContext('2d').drawImage(m.albedo, 0, 0, 80, 80);
      d.append(c); const l = document.createElement('div'); l.textContent = m.name; d.append(l);
      d.onclick = () => { sel = m; renderLib(); info(); };
      sw.append(d);
    });
    $('#matCount').textContent = lib.length + ' materials';
  }
  $('#matSearch').addEventListener('input', renderLib);
  const rough = bindRange('matRough', (v) => v.toFixed(2), (v) => { sel.rough = v; });
  const scale = bindRange('matScale', (v) => v.toFixed(2), (v) => { sel.tile = v; });
  const applyBtn = document.createElement('button'); applyBtn.className = 'btn primary'; applyBtn.style.cssText = 'width:100%;margin-top:10px';
  $('#matScale').closest('.field').after(applyBtn);
  applyBtn.onclick = () => toast(`${sel.name} → ${$('#matTarget').value}`);
  $('#matTarget').addEventListener('change', info);
  function info() {
    $('#matInfo').innerHTML = `<span>Name</span><b>${sel.name}</b><span>Spec</span><b style="font-family:var(--font)">${sel.meta}</b><span>Maps</span><b>alb · nrm · rgh · ht${sel.metal ? ' · mtl' : ''}</b><span>Workflow</span><b>metal ${sel.metal ? '1.0' : '0.0'}</b>`;
    rough.value = sel.rough; rough.refresh(); scale.value = sel.tile; scale.refresh();
    applyBtn.textContent = `Apply to ${$('#matTarget').value}`;
    prepTex();
  }

  /* ---------------- preview sphere ---------------- */
  const canvas = $('#matCanvas');
  let A, Nm;
  function prepTex() { A = sel.albedo.getContext('2d').getImageData(0, 0, N, N).data; Nm = sel.normal.getContext('2d').getImageData(0, 0, N, N).data; }
  let img = null, rot = 0;
  const L = (() => { const v = [-.55, .6, .58], l = Math.hypot(...v); return v.map((x) => x / l); })();
  loopWhileVisible(canvas, (dt) => {
    const { ctx, w, h } = fitCanvas(canvas);
    const bg = ctx.createLinearGradient(0, 0, 0, h); bg.addColorStop(0, '#26231f'); bg.addColorStop(1, '#0d0d0e');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
    rot += dt * 0.05;
    const R = Math.floor(Math.min(w, h) * 0.34), S = R * 2;
    if (!img || img.width !== S) img = ctx.createImageData(S, S);
    const d = img.data, r = sel.rough, metal = sel.metal, tiles = 3 / sel.tile;
    const sh = clamp(2 / Math.pow(Math.max(r, .05), 4) - 2, 1, 2000), norm = (sh + 2) / 8;
    for (let py = 0; py < S; py++) for (let px = 0; px < S; px++) {
      const i = (py * S + px) * 4; const nx = (px - R + .5) / R, ny = -(py - R + .5) / R, q = 1 - nx * nx - ny * ny;
      if (q <= 0) { d[i + 3] = 0; continue; }
      let nz = Math.sqrt(q);
      const u = ((Math.atan2(nx, nz) / TAU + rot) * tiles % 1 + 1) % 1, v = Math.acos(clamp(ny, -1, 1)) / Math.PI * tiles / 2 % 1;
      const ti = ((Math.floor(v * N) % N) * N + (Math.floor(u * N) % N)) * 4;
      // tangent-space normal perturbation
      const tx = (Nm[ti] / 255 - .5) * 2, ty = (Nm[ti + 1] / 255 - .5) * 2;
      let Tx = nz, Tz = -nx; const tl = Math.hypot(Tx, Tz) || 1; Tx /= tl; Tz /= tl;
      const Bx = ny * Tz, By = nz * Tx - nx * Tz, Bz = -ny * Tx;
      let mx = nx + (tx * Tx + ty * Bx) * .5, my = ny + ty * By * .5, mz = nz + (tx * Tz + ty * Bz) * .5; const ml = Math.hypot(mx, my, mz); mx /= ml; my /= ml; mz /= ml;
      const ndl = Math.max(0, mx * L[0] + my * L[1] + mz * L[2]);
      let hx = L[0], hy = L[1], hz = L[2] + 1; const hl = Math.hypot(hx, hy, hz); const ndh = Math.max(0, (mx * hx + my * hy + mz * hz) / hl);
      const spec = norm * Math.pow(ndh, sh) * ndl;
      const fres = 0.04 + 0.96 * Math.pow(1 - mz, 5) * (1 - r);
      for (let c = 0; c < 3; c++) {
        const alb = A[ti + c] / 255, lin = alb * alb;
        const f0 = metal ? lin : 0.04;
        let col = lin * (1 - metal) * (ndl * 1.1 + 0.18) + spec * (metal ? f0 : 0.04 + fres * .3) * 1.4 + fres * (metal ? lin : .15) * .5;
        col = col / (1 + col);
        d[i + c] = Math.sqrt(col) * 255 * 1.08;
      }
      d[i + 3] = 255;
    }
    const tmp = canvas._tmp || (canvas._tmp = document.createElement('canvas')); tmp.width = S; tmp.height = S; tmp.getContext('2d').putImageData(img, 0, 0);
    const cx = w * .5 - R, cy = h * .46 - R;
    // contact shadow
    ctx.fillStyle = 'rgba(0,0,0,.5)'; ctx.beginPath(); ctx.ellipse(w * .5, h * .46 + R * 1.02, R * .85, R * .12, 0, 0, TAU); ctx.fill();
    ctx.drawImage(tmp, cx, cy);
    // flat tile strip (shows tiling scale)
    const ts = Math.min(64, w / 10), n = Math.ceil(w / ts);
    for (let i = 0; i < n; i++) ctx.drawImage(sel.albedo, i * ts, h - ts, ts, ts);
    ctx.fillStyle = 'rgba(0,0,0,.35)'; ctx.fillRect(0, h - ts, w, ts);
    for (let i = 0; i < n; i++) { ctx.globalAlpha = .85; ctx.drawImage(sel.albedo, i * ts, h - ts, ts, ts); }
    ctx.globalAlpha = 1;
    $('#matHud').innerHTML = `Preview · <b>${sel.name}</b> · roughness ${sel.rough.toFixed(2)} · ${sel.metal ? 'metal' : 'dielectric'} · tile ${sel.tile.toFixed(2)} m`;
  });

  /* ---------------- photo → tileable PBR ---------------- */
  function fromImage(img) {
    const S = 256, c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d');
    const m = Math.min(img.width, img.height); x.drawImage(img, (img.width - m) / 2, (img.height - m) / 2, m, m, 0, 0, S, S);
    const src = x.getImageData(0, 0, S, S).data;
    // de-light: divide by a very low-frequency version (8×8 average, bilinear)
    const B = 8, low = new Float32Array(B * B * 3);
    for (let y = 0; y < S; y++) for (let xx = 0; xx < S; xx++) { const bi = (Math.floor(y / (S / B)) * B + Math.floor(xx / (S / B))) * 3, i = (y * S + xx) * 4; for (let k = 0; k < 3; k++) low[bi + k] += src[i + k] / ((S / B) ** 2); }
    const mean = [0, 0, 0]; for (let i = 0; i < B * B; i++) for (let k = 0; k < 3; k++) mean[k] += low[i * 3 + k] / (B * B);
    const lowAt = (xx, y, k) => { const fx = clamp(xx / (S / B) - .5, 0, B - 1.001), fy = clamp(y / (S / B) - .5, 0, B - 1.001), ix = Math.floor(fx), iy = Math.floor(fy), tx = fx - ix, ty = fy - iy; const g = (i, j) => low[(j * B + i) * 3 + k]; return lerp(lerp(g(ix, iy), g(ix + 1, iy), tx), lerp(g(ix, iy + 1), g(ix + 1, iy + 1), tx), ty); };
    const flat = new Float32Array(S * S * 3);
    for (let y = 0; y < S; y++) for (let xx = 0; xx < S; xx++) for (let k = 0; k < 3; k++) flat[(y * S + xx) * 3 + k] = src[(y * S + xx) * 4 + k] / Math.max(lowAt(xx, y, k), 1) * mean[k];
    // seamless: blend with a half-offset copy, weighted toward the copy near the borders
    const out = makeCanvasSized(S, (xx, y) => {
      const wa = Math.pow(Math.sin(Math.PI * (xx + .5) / S) * Math.sin(Math.PI * (y + .5) / S), .8);
      const ox = (xx + S / 2) % S, oy = (y + S / 2) % S, a = (y * S + xx) * 3, b = (oy * S + ox) * 3;
      return [0, 1, 2].map((k) => flat[a + k] * wa + flat[b + k] * (1 - wa));
    });
    const alb = document.createElement('canvas'); alb.width = alb.height = N; alb.getContext('2d').drawImage(out, 0, 0, N, N);
    return alb;
  }
  function makeCanvasSized(S, fn) {
    const c = document.createElement('canvas'); c.width = c.height = S; const ctx = c.getContext('2d'); const im = ctx.createImageData(S, S);
    for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) { const v = fn(x, y), i = (y * S + x) * 4; im.data[i] = v[0]; im.data[i + 1] = v[1]; im.data[i + 2] = v[2]; im.data[i + 3] = 255; }
    ctx.putImageData(im, 0, 0); return c;
  }
  let pending = null;
  function process(img, name) {
    $('#matGen').classList.remove('hidden'); const st = $('#matGenStatus'); st.className = 'status run'; st.textContent = 'de-lighting…';
    setTimeout(() => {
      const albedo = fromImage(img); st.textContent = 'tiling + maps…';
      setTimeout(() => {
        const m = { name, meta: 'Generated from photo · Materials MCP', rough: .6, metal: 0, tile: 1, albedo, ...maps(albedo), isNew: true };
        pending = m;
        for (const [id, cv] of [['mapAlbedo', m.albedo], ['mapNormal', m.normal], ['mapRough', m.roughMap], ['mapHeight', m.height]]) $('#' + id).getContext('2d').drawImage(cv, 0, 0, 128, 128);
        const t = $('#mapTile').getContext('2d'); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) t.drawImage(m.albedo, i * 80, j * 80, 80, 80);
        st.className = 'status ok'; st.textContent = 'ready';
        $('#matName').value = name;
      }, 400);
    }, 400);
  }
  $('#matAdd').onclick = () => { if (!pending) return; pending.name = $('#matName').value || pending.name; lib.unshift(pending); sel = pending; pending = null; renderLib(); info(); toast('Added to the shared material library'); $('#matGen').classList.add('hidden'); };
  function loadFile(f) { if (!f || !f.type.startsWith('image/')) return; const im = new Image(); im.onload = () => process(im, f.name.replace(/\.[^.]+$/, '').replace(/[_-]/g, ' ')); im.src = URL.createObjectURL(f); }
  const drop = $('#matDrop'); $('#matFile').addEventListener('change', (e) => loadFile(e.target.files[0]));
  ['dragover', 'dragenter'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', (e) => loadFile(e.dataTransfer.files[0]));
  $('#matSample').onclick = () => {
    // a deliberately non-tileable "phone photo" of cobbles: voronoi stones, light falloff, vignette
    const S = 320, r = rng(77), pts = []; for (let i = 0; i < 46; i++) pts.push([r() * S, r() * S, 0.6 + r() * .4]);
    const n = fbm(78, 6, 3);
    const c = makeCanvasSized(S, (x, y) => {
      let d1 = 1e9, d2 = 1e9, k = 1; for (const [px, py, kk] of pts) { const d = Math.hypot(x - px, y - py); if (d < d1) { d2 = d1; d1 = d; k = kk; } else if (d < d2) d2 = d; }
      const edge = clamp((d2 - d1) / 6, 0, 1), light = 1.25 - (x + y) / (S * 2) * .7, vig = 1 - Math.hypot(x / S - .5, y / S - .5) * .6;
      const v = (edge * (.6 + k * .35 + n(x / S % 1, y / S % 1) * .2) + (1 - edge) * .25) * light * vig;
      return [168 * v, 156 * v, 140 * v];
    });
    const im = new Image(); im.onload = () => process(im, 'Cobble stone (sample)'); im.src = c.toDataURL();
  };

  renderLib(); info();
})();
