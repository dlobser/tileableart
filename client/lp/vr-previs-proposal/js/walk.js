/* 08 Navigate & interact: walk the plan, zones auto-fire cues (shared with section 07), manual triggers, interactives. */
(() => {
  const canvas = $('#walkCanvas'), stage = $('#walkStage');
  const me = { x: 1.2, y: 7, dir: 0, target: null };
  const keys = new Set();
  let mode = 'free', tourI = 0, nookColor = '#5fbfbd';
  const ZONES = [
    { name: 'Entrance', x: 1.8, y: 7, r: 1.3, trig: 'Zone: Entrance', inside: false, fired: 0 },
    { name: 'Podium', x: 6.4, y: 5.6, r: 1.4, trig: 'Zone: Podium', inside: false, fired: 0 },
    { name: 'Film nook', x: 21.3, y: 4, r: 2.0, local: 'Film nook: play “Origins” (local cue)', inside: false, fired: 0 },
    { name: 'Exit', x: 21, y: 12.8, r: 1.3, local: 'Exit: house lights + goodbye VO', inside: false, fired: 0 },
  ];
  const TOUR = [[3.5, 7], [6.4, 6], [6.4, 6], [9.5, 7], [13.5, 8.8], [14, 2.4], [18.5, 2.5], [21.3, 4.2], [20.5, 10], [21, 13.2]];

  const log = (html) => { const l = $('#walkLog'); l.insertAdjacentHTML('afterbegin', `<div><b>${new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit' })}</b> ${html}</div>`); };
  function blocked(x, y) {
    if (x < .2 || y < .2 || x > PLAN.W - .2 || y > PLAN.H - .2) return !(x < .2 && y > 6 && y < 8 && x > -.5) && !(y > PLAN.H - .2 && x > 20 && x < 22);
    for (const [a, b, c, d] of PLAN.allWalls) if (distToSeg(x, y, a, b, c, d) < .28) return true;
    for (const o of PLAN.obstacles) if (Math.abs(x - o.x) < o.w / 2 + .25 && Math.abs(y - o.y) < o.h / 2 + .25) return true;
    return false;
  }
  function move(dx, dy) { if (!blocked(me.x + dx, me.y)) me.x += dx; if (!blocked(me.x, me.y + dy)) me.y += dy; }

  stage.addEventListener('keydown', (e) => { if (/Key[WASD]|Arrow/.test(e.code)) { keys.add(e.code); e.preventDefault(); } });
  stage.addEventListener('keyup', (e) => keys.delete(e.code));
  stage.addEventListener('blur', () => keys.clear());
  let V;
  canvas.addEventListener('click', (e) => { stage.focus(); const r = canvas.getBoundingClientRect(); const [x, y] = V.toWorld(e.clientX - r.left, e.clientY - r.top); if (mode !== 'tour') me.target = [x, y]; });
  canvas.style.cursor = 'crosshair';
  segButtons('walkMode', (d) => {
    mode = d.m;
    if (mode === 'tour') { tourI = 0; me.target = null; log('Guided tour started'); }
    if (mode === 'vr') { toast('In the full tool this opens a WebXR session on a connected headset'); log('VR: <span class="tool">navigator.xr.requestSession("immersive-vr")</span>'); }
  });

  function renderLists() {
    const cues = window.PV_CUES ? PV_CUES.list() : [];
    $('#walkTriggers').innerHTML = cues.map((q, i) => `<div class="item" data-i="${i}"><div class="t"><b>${i + 1} · ${q.name}</b><small>${q.trig}</small></div><button class="btn">GO</button></div>`).join('');
    $('#walkZones').innerHTML = ZONES.map((z) => `<div class="item"><div class="t"><b>◎ ${z.name}</b><small>${z.trig || z.local}</small></div><span class="status ${z.inside ? 'ok' : ''}">${z.inside ? 'inside' : z.fired ? 'fired ×' + z.fired : 'armed'}</span></div>`).join('');
  }
  $('#walkTriggers').addEventListener('click', (e) => { const it = e.target.closest('.item'); if (!it) return; PV_CUES.go(+it.dataset.i); log(`Manual → Cue ${+it.dataset.i + 1} · ${PV_CUES.list()[+it.dataset.i].name}`); toast('Cue fired. Scroll up to section 07 to see it on the cameras'); });
  $$('[data-story]').forEach((b) => b.addEventListener('click', () => {
    nookColor = b.dataset.story; const r = PV_CUES.fire('Interactive: Touch table');
    log(`Touch table: story “${b.textContent}” → film nook content changed${r ? ' · ' + r : ''}`);
  }));

  // gesture wall mini-canvas: ripples follow the pointer
  const gc = $('#gestCanvas'); const ripples = [];
  gc.addEventListener('pointermove', (e) => { const r = gc.getBoundingClientRect(); if (Math.random() < .5) ripples.push({ x: e.clientX - r.left, y: e.clientY - r.top, a: 0 }); });

  loopWhileVisible(canvas, (dt, t) => {
    // movement
    let mx = 0, my = 0; const sp = 1.4 * dt * (keys.has('ShiftLeft') ? 2 : 1);
    if (keys.has('KeyW') || keys.has('ArrowUp')) my -= 1; if (keys.has('KeyS') || keys.has('ArrowDown')) my += 1;
    if (keys.has('KeyA') || keys.has('ArrowLeft')) mx -= 1; if (keys.has('KeyD') || keys.has('ArrowRight')) mx += 1;
    if (mode === 'tour' && !me.target) { me.target = TOUR[tourI]; }
    if (mx || my) { me.target = null; const l = Math.hypot(mx, my); move(mx / l * sp, my / l * sp); me.dir = Math.atan2(my, mx); }
    else if (me.target) {
      const dx = me.target[0] - me.x, dy = me.target[1] - me.y, d = Math.hypot(dx, dy);
      if (d < .08) { me.target = null; if (mode === 'tour') tourI = (tourI + 1) % TOUR.length; }
      else { const ox = me.x, oy = me.y; move(dx / d * Math.min(sp, d), dy / d * Math.min(sp, d)); me.dir = Math.atan2(dy, dx); if (Math.hypot(me.x - ox, me.y - oy) < 1e-4) { me.target = null; if (mode === 'tour') tourI = (tourI + 1) % TOUR.length; } }
    }
    // zones
    let changed = false;
    for (const z of ZONES) {
      const inside = Math.hypot(me.x - z.x, me.y - z.y) < z.r;
      if (inside && !z.inside) {
        z.fired++; changed = true;
        if (z.trig) { const r = PV_CUES.fire(z.trig); log(`Zone ${z.name} entered → ${r || 'no cue'}`); }
        else log(`Zone ${z.name} entered → ${z.local}`);
      }
      if (inside !== z.inside) changed = true;
      z.inside = inside;
    }
    if (changed) renderLists();
    const nearTable = Math.hypot(me.x - 13.5, me.y - 10.8) < 2.4, nearWall = me.y < 3 && me.x > 11.5 && me.x < 16.5;
    $('#walkTable').classList.toggle('hidden', !nearTable); $('#walkGesture').classList.toggle('hidden', !nearWall);
    $('#walkInteractive').classList.toggle('hidden', nearTable || nearWall);
    const where = ZONES.find((z) => z.inside);
    $('#walkWhere').textContent = `(${me.x.toFixed(1)}, ${me.y.toFixed(1)}) m${where ? ' · in zone ' + where.name : ''}${mode === 'tour' ? ' · touring' : ''}`;

    // draw
    const { ctx, w, h } = fitCanvas(canvas); V = planView(w, h, 18);
    ctx.fillStyle = '#0c0d0f'; ctx.fillRect(0, 0, w, h);
    drawPlan(ctx, V, { screenColor: { nook: nookColor, cyc: `hsl(${(t * 20) % 360},60%,60%)` } });
    for (const z of ZONES) {
      ctx.strokeStyle = z.inside ? '#57d18b' : 'rgba(255,196,107,.6)'; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5;
      ctx.fillStyle = z.inside ? 'rgba(87,209,139,.1)' : 'rgba(255,196,107,.05)';
      ctx.beginPath(); ctx.arc(V.X(z.x), V.Y(z.y), z.r * V.s, 0, TAU); ctx.fill(); ctx.stroke(); ctx.setLineDash([]);
    }
    if (mode === 'tour') { ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.setLineDash([2, 5]); ctx.beginPath(); TOUR.forEach(([x, y], i) => (i ? ctx.lineTo(V.X(x), V.Y(y)) : ctx.moveTo(V.X(x), V.Y(y)))); ctx.stroke(); ctx.setLineDash([]); }
    if (me.target) { ctx.strokeStyle = '#ff7a3d'; ctx.beginPath(); ctx.arc(V.X(me.target[0]), V.Y(me.target[1]), 5, 0, TAU); ctx.stroke(); }
    // view cone + avatar
    const ax = V.X(me.x), ay = V.Y(me.y);
    const cone = ctx.createRadialGradient(ax, ay, 0, ax, ay, V.s * 4); cone.addColorStop(0, 'rgba(255,122,61,.35)'); cone.addColorStop(1, 'rgba(255,122,61,0)');
    ctx.fillStyle = cone; ctx.beginPath(); ctx.moveTo(ax, ay); ctx.arc(ax, ay, V.s * 4, me.dir - .55, me.dir + .55); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#ff7a3d'; ctx.beginPath(); ctx.arc(ax, ay, Math.max(5, V.s * .25), 0, TAU); ctx.fill();
    ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; ctx.stroke();
    if (mode === 'vr') { ctx.fillStyle = '#fff'; ctx.font = '600 11px Figtree, sans-serif'; ctx.textAlign = 'center'; ctx.fillText('🥽 headset view', ax, ay - 14); }

    // gesture wall canvas
    if (!$('#walkGesture').classList.contains('hidden')) {
      const g = fitCanvas(gc); g.ctx.fillStyle = 'rgba(12,13,15,.25)'; g.ctx.fillRect(0, 0, g.w, g.h);
      for (const r of ripples) { r.a += dt; g.ctx.strokeStyle = `hsla(${(r.x + t * 60) % 360},80%,65%,${Math.max(0, 1 - r.a)})`; g.ctx.lineWidth = 2; g.ctx.beginPath(); g.ctx.arc(r.x, r.y, r.a * 60, 0, TAU); g.ctx.stroke(); }
      while (ripples.length && ripples[0].a > 1) ripples.shift();
    }
  });
  setTimeout(renderLists, 0);
})();
