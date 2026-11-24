/* 01 Environment: imports, isometric scene, select + tag, Blender MCP request queue (simulated). */
(() => {
  const canvas = $('#envCanvas');
  const C30 = Math.cos(30 * DEG), S30 = 0.5;
  const cycPath = (() => { // corner cyc around the back corner (0,0), inset 0.3 m
    const pts = [[6, 0.3]];
    for (let i = 0; i <= 18; i++) { const a = -Math.PI / 2 - (Math.PI / 2) * i / 18; pts.push([2.5 + 2.2 * Math.cos(a), 2.5 + 2.2 * Math.sin(a)]); }
    pts.push([0.3, 6]);
    return pts;
  })();
  const screenPath = cycPath.slice(4, 17).map(([x, y]) => { const dx = x - 2.5, dy = y - 2.5, l = Math.hypot(dx, dy); return [x - dx / l * 0.03, y - dy / l * 0.03]; });

  let objects = [
    { id: 'wallB', name: 'Wall_Back', kind: 'wall', axis: 'y', tags: ['existing', 'paint TBC'] },
    { id: 'wallL', name: 'Wall_Left', kind: 'wall', axis: 'x', tags: ['existing'] },
    { id: 'cyc', name: 'Cyc', kind: 'path', path: cycPath, z0: 0, z1: 3.6, col: [222, 220, 215], tags: ['matte white', 'cove 600'] },
    { id: 'screen', name: 'Screen_Curved', kind: 'path', path: screenPath, z0: 1.0, z1: 3.0, col: [90, 160, 190], media: true, tags: ['media', 'UV mapped'] },
    { id: 'podium', name: 'Podium', kind: 'box', col: [60, 60, 66], tags: ['touchable', 'client-supplied'], parts: [
      { x: 4.0, y: 4.0, z: 0, w: 0.6, d: 0.45, h: 0.04 }, { x: 4.25, y: 4.18, z: 0.04, w: 0.1, d: 0.1, h: 0.86 }, { x: 3.65, y: 4.0, z: 0.9, w: 1.3, d: 0.45, h: 0.08 }] },
    { id: 'bench', name: 'Bench', kind: 'box', col: [150, 112, 80], tags: ['seating'], parts: [{ x: 4.3, y: 7.6, z: 0, w: 2.4, d: 0.5, h: 0.45 }] },
    { id: 'plinthA', name: 'Plinth_A', kind: 'box', col: [200, 198, 192], tags: ['plinth'], parts: [{ x: 7.4, y: 2.4, z: 0, w: 0.6, d: 0.6, h: 1.0 }] },
    { id: 'plinthB', name: 'Plinth_B', kind: 'box', col: [200, 198, 192], tags: ['plinth'], parts: [{ x: 7.4, y: 4.4, z: 0, w: 0.6, d: 0.6, h: 1.0 }] },
    { id: 'spot', name: 'Spot_01', kind: 'box', col: [30, 30, 32], light: true, tags: ['fixture'], parts: [{ x: 4.15, y: 4.05, z: 3.5, w: 0.3, d: 0.3, h: 0.3 }] },
  ];
  let selected = null;
  const polys = new Map(); // id -> [[pts...]]
  let view = null;

  const P = (x, y, z) => [view.ox + (x - y) * C30 * view.S, view.oy + (x + y) * S30 * view.S - z * view.S];
  function computeView(w, h) {
    const pts = [[0, 0, 4.2], [10, 0, 0], [0, 10, 0], [10, 10, 0], [10, 0, 4.2], [0, 10, 4.2]].map(([x, y, z]) => [(x - y) * C30, (x + y) * S30 - z]);
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    const S = Math.min((w - 40) / (Math.max(...xs) - Math.min(...xs)), (h - 50) / (Math.max(...ys) - Math.min(...ys)));
    view = { S, ox: w / 2 - (Math.max(...xs) + Math.min(...xs)) / 2 * S, oy: h / 2 - (Math.max(...ys) + Math.min(...ys)) / 2 * S + 6 };
  }
  function poly(ctx, pts, fill, stroke) {
    ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath();
    if (fill) { ctx.fillStyle = fill; ctx.fill(); }
    if (stroke) { ctx.strokeStyle = stroke; ctx.stroke(); }
  }
  const shade = (c, f, a = 1) => rgba(c.map((v) => v * f), a);

  function drawBox(ctx, o, b, sel) {
    const { x, y, z, w, d, h } = b;
    const top = [P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)];
    const right = [P(x + w, y, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x + w, y, z + h)];
    const front = [P(x, y + d, z), P(x + w, y + d, z), P(x + w, y + d, z + h), P(x, y + d, z + h)];
    ctx.lineWidth = sel ? 2 : 0.6;
    const st = sel ? '#ff7a3d' : 'rgba(0,0,0,.35)';
    poly(ctx, right, shade(o.col, 0.72), st); poly(ctx, front, shade(o.col, 0.56), st); poly(ctx, top, shade(o.col, 1.0), st);
    const outline = [P(x, y, z + h), P(x + w, y, z + h), P(x + w, y, z), P(x + w, y + d, z), P(x, y + d, z), P(x, y + d, z + h)];
    polys.get(o.id).push(outline);
  }

  function draw(t) {
    const { ctx, w, h } = fitCanvas(canvas);
    computeView(w, h);
    ctx.fillStyle = '#0c0d0f'; ctx.fillRect(0, 0, w, h);
    polys.clear(); objects.forEach((o) => polys.set(o.id, []));
    // floor
    poly(ctx, [P(0, 0, 0), P(10, 0, 0), P(10, 10, 0), P(0, 10, 0)], '#2a2622');
    ctx.strokeStyle = 'rgba(255,255,255,.05)'; ctx.lineWidth = 1; ctx.beginPath();
    for (let i = 1; i < 10; i++) { let a = P(i, 0, 0), b = P(i, 10, 0); ctx.moveTo(...a); ctx.lineTo(...b); a = P(0, i, 0); b = P(10, i, 0); ctx.moveTo(...a); ctx.lineTo(...b); }
    ctx.stroke();
    // light pool under the spot
    const spot = objects.find((o) => o.id === 'spot');
    if (spot) {
      const sp = spot.parts[0], c = P(sp.x + .15, sp.y + .15, 0);
      ctx.save(); ctx.translate(c[0], c[1]); ctx.scale(1, S30 / C30 * 1.15);
      const g = ctx.createRadialGradient(0, 0, 0, 0, 0, view.S * 1.6);
      g.addColorStop(0, 'rgba(255,235,200,.55)'); g.addColorStop(1, 'rgba(255,235,200,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, view.S * 1.6, 0, TAU); ctx.fill(); ctx.restore();
    }
    for (const o of objects.filter((o) => o.kind === 'wall')) {
      const sel = selected === o.id;
      const pts = o.axis === 'y' ? [P(0, 0, 0), P(10, 0, 0), P(10, 0, 4), P(0, 0, 4)] : [P(0, 0, 0), P(0, 10, 0), P(0, 10, 4), P(0, 0, 4)];
      ctx.lineWidth = sel ? 2 : 1;
      poly(ctx, pts, o.axis === 'y' ? '#4a4743' : '#3c3936', sel ? '#ff7a3d' : 'rgba(255,255,255,.06)');
      polys.get(o.id).push(pts);
    }
    for (const o of objects.filter((o) => o.kind === 'path')) {
      const sel = selected === o.id;
      for (let i = 0; i < o.path.length - 1; i++) {
        const [ax, ay] = o.path[i], [bx, by] = o.path[i + 1];
        const nx = -(by - ay), ny = bx - ax, nl = Math.hypot(nx, ny);
        const lit = 0.65 + 0.35 * Math.abs((nx + ny) / nl / Math.SQRT2);
        let col = o.col;
        if (o.media) { const u = i / (o.path.length - 1); col = [128 + 110 * Math.sin(t * .8 + u * 4), 128 + 110 * Math.sin(t * .6 + u * 3 + 2), 160 + 90 * Math.sin(t * .7 + 4 - u * 2)]; }
        const q = [P(ax, ay, o.z0), P(bx, by, o.z0), P(bx, by, o.z1), P(ax, ay, o.z1)];
        poly(ctx, q, o.media ? rgba(col) : shade(col, lit), o.media ? null : rgba(col.map((v) => v * lit)));
        polys.get(o.id).push(q);
      }
      if (sel) {
        ctx.strokeStyle = '#ff7a3d'; ctx.lineWidth = 2; ctx.beginPath();
        o.path.forEach(([x, y], i) => (i ? ctx.lineTo(...P(x, y, o.z1)) : ctx.moveTo(...P(x, y, o.z1))));
        for (let i = o.path.length - 1; i >= 0; i--) ctx.lineTo(...P(o.path[i][0], o.path[i][1], o.z0));
        ctx.closePath(); ctx.stroke();
      }
    }
    // boxes, painter's order
    const parts = [];
    for (const o of objects.filter((o) => o.kind === 'box')) for (const b of o.parts) parts.push([o, b]);
    parts.sort((a, b) => (a[1].x + a[1].w / 2 + a[1].y + a[1].d / 2 + a[1].z * .01) - (b[1].x + b[1].w / 2 + b[1].y + b[1].d / 2 + b[1].z * .01));
    for (const [o, b] of parts) drawBox(ctx, o, b, selected === o.id || o.flash > 0);
    // spot beam
    if (spot) {
      const sp = spot.parts[0];
      const a = P(sp.x + .15, sp.y + .15, sp.z), l = P(sp.x + .15 - 1.2, sp.y + .15 + 1.2, 0), r = P(sp.x + .15 + 1.2, sp.y + .15 - 1.2, 0);
      const g = ctx.createLinearGradient(a[0], a[1], a[0], l[1]); g.addColorStop(0, 'rgba(255,235,200,.22)'); g.addColorStop(1, 'rgba(255,235,200,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...l); ctx.lineTo(...r); ctx.fill();
    }
    objects.forEach((o) => { if (o.flash > 0) o.flash -= 0.02; });
    // tag pills for selected
    const so = objects.find((o) => o.id === selected);
    if (so) {
      const pts = polys.get(so.id).flat(); const minY = Math.min(...pts.map((p) => p[1])), cx = pts.reduce((s, p) => s + p[0], 0) / pts.length;
      ctx.font = '600 11px Figtree, sans-serif'; const label = so.name + (so.tags.length ? '  #' + so.tags.join(' #') : '');
      const tw = ctx.measureText(label).width + 16;
      ctx.fillStyle = 'rgba(255,122,61,.95)'; ctx.beginPath(); ctx.roundRect(cx - tw / 2, minY - 28, tw, 20, 10); ctx.fill();
      ctx.fillStyle = '#111'; ctx.textAlign = 'center'; ctx.fillText(label, cx, minY - 14);
    }
  }

  function inside(pt, poly) {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if ((yi > pt[1]) !== (yj > pt[1]) && pt[0] < (xj - xi) * (pt[1] - yi) / (yj - yi) + xi) c = !c;
    }
    return c;
  }
  canvas.addEventListener('click', (e) => {
    const r = canvas.getBoundingClientRect(), pt = [e.clientX - r.left, e.clientY - r.top];
    // front-most first: boxes (reverse draw order), then paths, then walls
    const order = [...objects.filter((o) => o.kind === 'box').reverse(), ...objects.filter((o) => o.id === 'screen'), ...objects.filter((o) => o.kind === 'path' && o.id !== 'screen'), ...objects.filter((o) => o.kind === 'wall')];
    const hit = order.find((o) => (polys.get(o.id) || []).some((p) => inside(pt, p)));
    select(hit ? hit.id : null);
  });
  canvas.style.cursor = 'pointer';

  function select(id) {
    selected = id;
    const o = objects.find((x) => x.id === id);
    $('#envSelName').textContent = o ? o.name : 'nothing selected';
    $('#envInspector').classList.toggle('hidden', !!o);
    $('#envInspectorBody').classList.toggle('hidden', !o);
    if (o) {
      $('#envObjName').textContent = o.name;
      $('#envObjDims').textContent = dims(o);
      renderTags();
    }
    renderOutline();
  }
  function dims(o) {
    if (o.kind === 'wall') return '10.00 × 4.00 m · existing';
    if (o.kind === 'path') return `curved · ${o.z0.toFixed(1)}–${o.z1.toFixed(1)} m high`;
    const xs = o.parts.flatMap((p) => [p.x, p.x + p.w]), ys = o.parts.flatMap((p) => [p.y, p.y + p.d]), zs = o.parts.flatMap((p) => [p.z, p.z + p.h]);
    return `${(Math.max(...xs) - Math.min(...xs)).toFixed(2)} × ${(Math.max(...ys) - Math.min(...ys)).toFixed(2)} × ${(Math.max(...zs) - Math.min(...zs)).toFixed(2)} m`;
  }
  function renderTags() {
    const o = objects.find((x) => x.id === selected); if (!o) return;
    $('#envTags').innerHTML = o.tags.map((t, i) => `<span class="chip warm">#${t}<button data-i="${i}">×</button></span>`).join('') || '<span class="note" style="margin:0">No tags</span>';
  }
  $('#envTags').addEventListener('click', (e) => {
    const b = e.target.closest('button'); if (!b) return;
    const o = objects.find((x) => x.id === selected); o.tags.splice(+b.dataset.i, 1); renderTags();
  });
  $('#envTagInput').addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || !e.target.value.trim()) return;
    const o = objects.find((x) => x.id === selected); o.tags.push(e.target.value.trim().replace(/^#/, '')); e.target.value = ''; renderTags();
  });
  function renderOutline() {
    $('#envOutline').innerHTML = objects.map((o) => `<div class="item ${o.id === selected ? 'sel' : ''}" data-id="${o.id}"><div class="sw" style="background:${rgba(o.col || [90, 88, 84])}"></div><div class="t"><b>${o.name}</b><small>${o.tags.map((t) => '#' + t).join(' ') || '—'}</small></div></div>`).join('');
  }
  $('#envOutline').addEventListener('click', (e) => { const it = e.target.closest('.item'); if (it) select(it.dataset.id); });
  $$('[data-suggest]').forEach((b) => b.addEventListener('click', () => { $('#envReq').value = b.dataset.suggest; }));

  /* ---------------- imports ---------------- */
  const sources = [];
  const KIND = [
    [/\.(jpe?g|png|heic|webp)$/i, 'Sketch / photo', 'vision → block-out', 'Blockout'],
    [/\.pdf$/i, 'PDF drawing', 'vector trace → walls', 'Traced'],
    [/\.(dwg|dxf)$/i, 'CAD linework', 'layers → extruded walls', 'Partition'],
    [/\.(ifc|rvt)$/i, 'BIM model', 'categories → tagged objects', 'BIM'],
    [/\.(skp|3dm|fbx|obj|gltf|glb|usdz?|blend|stl)$/i, 'Mesh / model', 'mesh import → USD', 'Model'],
  ];
  const SAMPLE_OBJ = {
    'napkin_sketch.jpg': { name: 'Blockout_Kiosk', col: [150, 150, 158], parts: [{ x: 1.4, y: 3.6, z: 0, w: 0.8, d: 0.8, h: 1.6 }], tags: ['from sketch', 'TBC'] },
    'level2_plan.dwg': { name: 'Wall_Partition', col: [120, 116, 110], parts: [{ x: 9.2, y: 5.2, z: 0, w: 0.15, d: 3.6, h: 3.0 }], tags: ['from DWG', 'layer A-WALL'] },
    'lectern_v3.skp': { name: 'Lectern_v3', col: [90, 70, 120], parts: [{ x: 1.8, y: 7.2, z: 0, w: 0.6, d: 0.5, h: 1.15 }], tags: ['client-supplied'] },
    'bench_oak.fbx': { name: 'Bench_Oak', col: [170, 125, 80], parts: [{ x: 6.4, y: 8.6, z: 0, w: 2.0, d: 0.45, h: 0.45 }], tags: ['seating', 'oak'] },
  };
  function importFile(name) {
    const k = KIND.find(([re]) => re.test(name)) || [null, 'Unknown', 'attached as reference', 'Ref'];
    const s = { name, type: k[1], how: k[2], status: 'uploading' };
    sources.unshift(s); renderSources();
    setTimeout(() => { s.status = 'interpreting'; renderSources(); }, 700);
    setTimeout(() => {
      s.status = 'in scene'; renderSources();
      let spec = SAMPLE_OBJ[name];
      if (!spec && k[0]) {
        const r = Math.random;
        spec = { name: k[3] + '_' + name.replace(/\.[^.]+$/, '').slice(0, 14), col: [120 + r() * 80, 120 + r() * 60, 120 + r() * 80], parts: [{ x: 1 + r() * 7, y: 5.5 + r() * 3, z: 0, w: 0.5 + r(), d: 0.5 + r() * 0.6, h: 0.6 + r() * 1.4 }], tags: ['imported'] };
      }
      if (spec && !objects.some((o) => o.name === spec.name)) {
        const o = { id: 'imp' + Math.random().toString(36).slice(2, 7), kind: 'box', ...JSON.parse(JSON.stringify(spec)), flash: 1 };
        objects.push(o); select(o.id); toast(`${name} → ${o.name} added to scene`);
      } else if (!k[0]) toast(`${name} attached as a reference document`);
    }, 1900 + Math.random() * 800);
  }
  function renderSources() {
    $('#envSources').innerHTML = sources.map((s) => `<div class="item"><div class="t"><b>${s.name}</b><small>${s.type} · ${s.how}</small></div><span class="status ${s.status === 'in scene' ? 'ok' : 'run'}">${s.status}</span></div>`).join('') || '<div class="note" style="margin:0">Nothing imported yet.</div>';
  }
  $$('[data-sample]').forEach((b) => b.addEventListener('click', () => importFile(b.dataset.sample)));
  const drop = $('#envDrop'), file = $('#envFile');
  file.addEventListener('change', () => [...file.files].forEach((f) => importFile(f.name)));
  ['dragover', 'dragenter'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.add('over'); }));
  ['dragleave', 'drop'].forEach((ev) => drop.addEventListener(ev, (e) => { e.preventDefault(); drop.classList.remove('over'); }));
  drop.addEventListener('drop', (e) => [...e.dataTransfer.files].forEach((f) => importFile(f.name)));

  /* ---------------- Blender MCP requests ---------------- */
  const queue = [];
  function plan(text, o) {
    const t = text.toLowerCase(); const ops = []; const m = t.match(/(\d+(?:\.\d+)?)\s*(cm|m)\b/); const amt = m ? (+m[1]) * (m[2] === 'cm' ? 0.01 : 1) : null;
    if (/remove|delete/.test(t)) ops.push(['delete_objects', `["${o.name}"]`, { del: true }]);
    if (/taller|higher|raise/.test(t)) ops.push(['transform', `scale_z=${amt ? '+' + amt + 'm' : '1.25'}`, { dz: amt, sz: amt ? null : 1.25 }]);
    if (/shorter|lower/.test(t)) ops.push(['transform', 'scale_z=0.8', { sz: 0.8 }]);
    if (/wider|bigger|larger/.test(t)) ops.push(['transform', 'scale_xy=1.25', { sxy: 1.25 }]);
    if (/narrower|smaller/.test(t)) ops.push(['transform', 'scale_xy=0.8', { sxy: 0.8 }]);
    const mv = amt || 1;
    if (/\bleft\b/.test(t)) ops.push(['transform', `translate=(-${mv},0,0)`, { mx: -mv }]);
    if (/\bright\b/.test(t)) ops.push(['transform', `translate=(${mv},0,0)`, { mx: mv }]);
    if (/forward|closer|front/.test(t)) ops.push(['transform', `translate=(0,${mv},0)`, { my: mv }]);
    if (/round|bevel|soft/.test(t)) ops.push(['add_modifier', 'BEVEL width=0.02 segments=4', { tag: 'bevelled' }]);
    const colours = { red: [190, 60, 50], blue: [60, 90, 190], black: [25, 25, 28], white: [230, 228, 222], oak: [170, 125, 80], green: [70, 150, 90], orange: [230, 130, 60] };
    for (const [k, c] of Object.entries(colours)) if (t.includes(k)) ops.push(['set_material', `"${k}"`, { col: c }]);
    if (!ops.length) ops.push(['edit_with_prompt', JSON.stringify(text.slice(0, 40)), { tag: 'edited' }]);
    return ops;
  }
  function renderQueue() {
    $('#envQueue').innerHTML = queue.map((q, i) => `<div class="item" style="flex-direction:column;align-items:stretch;cursor:default">
      <div class="row"><b style="flex:1;font-weight:500">${q.obj}</b><span class="status ${q.status === 'applied' ? 'ok' : q.status === 'rejected' ? 'err' : 'run'}">${q.status}</span></div>
      <small style="color:var(--ui-muted)">“${q.text}”</small>
      <div class="log" style="margin-top:4px">${q.log.map((l) => `<div>${l}</div>`).join('')}</div>
      ${q.status === 'ready for review' ? `<div class="row fill" style="margin-top:6px"><button class="btn primary" data-acc="${i}">Accept diff</button><button class="btn" data-rej="${i}">Reject</button></div>` : ''}</div>`).join('');
  }
  $('#envSubmit').addEventListener('click', () => {
    const o = objects.find((x) => x.id === selected); const text = $('#envReq').value.trim();
    if (!o || !text) { toast('Select an object and describe the change'); return; }
    const q = { obj: o.name, id: o.id, text, status: 'queued', log: [], ops: plan(text, o) };
    queue.unshift(q); $('#envReq').value = ''; renderQueue();
    const steps = [
      () => { q.status = 'blender working'; q.log.push(`<span class="tool">mcp.blender</span> get_scene_context(selection=["${o.name}"], tags=[${o.tags.map((t) => '"' + t + '"').join(',')}])`); },
      ...q.ops.map((op) => () => q.log.push(`<span class="tool">mcp.blender</span> ${op[0]}(${op[1]})`)),
      () => q.log.push(`<span class="tool">mcp.blender</span> export_usd_diff() <b>→ 1 prim changed</b>`),
      () => { q.status = 'ready for review'; },
    ];
    steps.forEach((s, i) => setTimeout(() => { s(); renderQueue(); }, 500 + i * 650));
  });
  $('#envQueue').addEventListener('click', (e) => {
    const a = e.target.dataset.acc, r = e.target.dataset.rej;
    if (a !== undefined) { const q = queue[+a]; apply(q); q.status = 'applied'; q.log.push('<b>✓ committed to scene · v' + (12 + queue.length) + '</b>'); renderQueue(); }
    if (r !== undefined) { queue[+r].status = 'rejected'; renderQueue(); }
  });
  function apply(q) {
    const o = objects.find((x) => x.id === q.id); if (!o) return;
    for (const [, , f] of q.ops) {
      if (f.del) { objects = objects.filter((x) => x !== o); select(null); toast(`${o.name} removed`); return; }
      if (f.col) o.col = f.col;
      if (f.tag && !o.tags.includes(f.tag)) o.tags.push(f.tag);
      if (o.kind === 'path') { if (f.sz) o.z1 = o.z0 + (o.z1 - o.z0) * f.sz; if (f.dz) o.z1 += f.dz; continue; }
      if (!o.parts) continue;
      const xs = o.parts.flatMap((p) => [p.x, p.x + p.w]), ys = o.parts.flatMap((p) => [p.y, p.y + p.d]);
      const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
      const top = Math.max(...o.parts.map((p) => p.z + p.h));
      for (const p of o.parts) {
        if (f.sz) { p.z *= f.sz; p.h *= f.sz; }
        if (f.dz) { const k = (top + f.dz) / top; p.z *= k; p.h *= k; }
        if (f.sxy) { p.x = cx + (p.x - cx) * f.sxy; p.w *= f.sxy; p.y = cy + (p.y - cy) * f.sxy; p.d *= f.sxy; }
        if (f.mx) p.x += f.mx; if (f.my) p.y += f.my;
      }
    }
    o.flash = 1; select(o.id);
  }

  renderSources(); renderOutline(); select('podium');
  loopWhileVisible(canvas, (dt, t) => draw(t));
})();
