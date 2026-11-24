/* 07 Cues: authoring (looks per light group + media) and a QLab-style runner, viewed through 4 cameras. */
(() => {
  const GROUPS = ['House', 'Front wash', 'Cyc LED', 'Podium spot'];
  const L = (c, b) => ({ c, b });
  const cues = [
    { name: 'Preset · house up', fade: 0, trig: 'Manual (GO)', look: [L('#ffd9b0', 85), L('#ffe4c4', 0), L('#202020', 10), L('#fff2dd', 0)], video: 'stop', audio: 'amb' },
    { name: 'Doors · house to half', fade: 3, trig: 'Zone: Entrance', look: [L('#ffd9b0', 40), L('#ffe4c4', 10), L('#2bd4c8', 45), L('#fff2dd', 0)], video: '', audio: 'amb' },
    { name: 'Welcome', fade: 4, trig: 'Zone: Podium', look: [L('#ffd9b0', 10), L('#ffe4c4', 55), L('#ff6a2b', 70), L('#fff2dd', 100)], video: '', audio: 'vo' },
    { name: 'Film', fade: 2, trig: 'Follow previous', look: [L('#ffd9b0', 0), L('#ffe4c4', 0), L('#000000', 0), L('#fff2dd', 12)], video: 'intro', audio: '' },
    { name: 'Film out · loop', fade: 5, trig: 'Manual (GO)', look: [L('#ffd9b0', 30), L('#ffe4c4', 20), L('#2bd4c8', 60), L('#fff2dd', 40)], video: 'loop', audio: 'amb' },
    { name: 'Interactive moment', fade: 1.5, trig: 'Interactive: Touch table', look: [L('#ffd9b0', 25), L('#ffe4c4', 20), L('#9be564', 85), L('#fff2dd', 60)], video: 'loop', audio: '' },
    { name: 'Close · house up', fade: 8, trig: 'Manual (GO)', look: [L('#ffd9b0', 100), L('#ffe4c4', 0), L('#000000', 0), L('#fff2dd', 0)], video: 'stop', audio: 'stop' },
  ];
  // live state
  const live = GROUPS.map(() => ({ c: [0, 0, 0], b: 0 }));
  let from = live.map((g) => ({ ...g })), to = cues[0].look.map((g) => ({ c: hexRGB(g.c), b: g.b }));
  let fadeT = 1, fadeDur = 0.01, liveIdx = -1, standby = 0, editIdx = 0, video = null, videoStart = 0, audio = null, followTimer = null;

  /* ---------------- runner ---------------- */
  function go(idx = standby) {
    if (idx < 0 || idx >= cues.length) return;
    const q = cues[idx];
    from = live.map((g) => ({ c: [...g.c], b: g.b }));
    to = q.look.map((g) => ({ c: hexRGB(g.c), b: g.b }));
    fadeDur = Math.max(q.fade, .01); fadeT = 0; liveIdx = idx;
    if (q.video === 'stop') video = null; else if (q.video) { video = q.video; videoStart = performance.now() / 1000; }
    if (q.audio === 'stop') audio = null; else if (q.audio) audio = q.audio;
    standby = Math.min(idx + 1, cues.length - 1);
    clearTimeout(followTimer);
    const nq = cues[standby];
    if (standby !== idx && nq.trig === 'Follow previous') followTimer = setTimeout(() => go(standby), (fadeDur + 1.5) * 1000);
    render();
  }
  window.PV_CUES = {
    fire(trigger) { const i = cues.findIndex((q) => q.trig === trigger); if (i >= 0) { go(i); return `Cue ${i + 1} · ${cues[i].name}`; } return null; },
    list: () => cues,
    go: (i) => go(i),
  };
  $('#cueGo').onclick = () => go();
  $('#cueBack').onclick = () => { standby = Math.max(0, standby - 1); render(); };
  $('#cueNext').onclick = () => { standby = Math.min(cues.length - 1, standby + 1); render(); };
  $('#cuePanic').onclick = () => { clearTimeout(followTimer); from = live.map((g) => ({ c: [...g.c], b: g.b })); to = live.map((g) => ({ c: g.c, b: 0 })); fadeDur = 1; fadeT = 0; video = null; audio = null; liveIdx = -1; render(); toast('Panic: all lights out, media stopped'); };
  const wb = $('#cues .wb'); let over = false;
  wb.addEventListener('mouseenter', () => (over = true)); wb.addEventListener('mouseleave', () => (over = false));
  addEventListener('keydown', (e) => { if (over && e.code === 'Space' && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); go(); } });

  segButtons('cueMode', (d) => {
    const author = d.m === 'author';
    $('#cueAuthor').classList.toggle('hidden', !author);
    $('#cueBody').style.gridTemplateColumns = author ? '330px 1fr 260px' : '1fr 300px';
  });

  /* ---------------- authoring ---------------- */
  function render() {
    $('#cueTable tbody').innerHTML = cues.map((q, i) => `<tr class="${i === editIdx ? 'sel' : ''} ${i === liveIdx ? 'live' : ''} ${i === standby ? 'next' : ''}" data-i="${i}"><td>${i + 1}</td><td>${q.name}</td><td>${q.fade}s</td><td style="color:var(--ui-muted);font-size:11px">${q.trig.replace('Manual (GO)', 'GO').replace('Follow previous', '↳ follow').replace('Interactive: ', '☝ ').replace('Zone: ', '◎ ')}</td></tr>`).join('');
    $('#cueStandby').textContent = `${standby + 1} · ${cues[standby].name}`;
    $('#cueLive').textContent = liveIdx >= 0 ? `${liveIdx + 1} · ${cues[liveIdx].name}` : '—';
  }
  $('#cueTable').addEventListener('click', (e) => { const tr = e.target.closest('tr[data-i]'); if (!tr) return; editIdx = +tr.dataset.i; standby = editIdx; editor(); render(); });
  function editor() {
    const q = cues[editIdx];
    $('#cueEditNum').textContent = '#' + (editIdx + 1);
    $('#cueName').value = q.name;
    $('#cueGroups').innerHTML = GROUPS.map((g, i) => `<div class="g"><span>${g}</span><input type="color" data-g="${i}" value="${q.look[i].c}"><input type="range" data-b="${i}" min="0" max="100" value="${q.look[i].b}"><output>${q.look[i].b}%</output></div>`).join('');
    $('#cueVideo').value = q.video; $('#cueAudio').value = q.audio; $('#cueTrig').value = q.trig;
    fade.value = q.fade; fade.refresh();
  }
  $('#cueGroups').addEventListener('input', (e) => {
    const q = cues[editIdx], t = e.target;
    if (t.dataset.g !== undefined) q.look[+t.dataset.g].c = t.value;
    if (t.dataset.b !== undefined) { q.look[+t.dataset.b].b = +t.value; t.nextElementSibling.textContent = t.value + '%'; }
    if (liveIdx === editIdx) { to = q.look.map((g) => ({ c: hexRGB(g.c), b: g.b })); from = to; fadeT = 1; } // live edit (“tracking”)
  });
  $('#cueName').addEventListener('input', (e) => { cues[editIdx].name = e.target.value; render(); });
  $('#cueVideo').addEventListener('change', (e) => { cues[editIdx].video = e.target.value; });
  $('#cueAudio').addEventListener('change', (e) => { cues[editIdx].audio = e.target.value; });
  $('#cueTrig').addEventListener('change', (e) => { cues[editIdx].trig = e.target.value; render(); });
  const fade = bindRange('cueFade', (v) => v + 's', (v) => { cues[editIdx].fade = v; render(); });
  $('#cueNew').onclick = () => { const q = JSON.parse(JSON.stringify(cues[editIdx])); q.name = 'New cue'; q.trig = 'Manual (GO)'; cues.splice(editIdx + 1, 0, q); editIdx++; editor(); render(); };
  $('#cueRecord').onclick = () => go(editIdx);

  /* ---------------- cameras ---------------- */
  const cams = $$('#cams .cam');
  cams.forEach((c) => c.addEventListener('click', () => { const solo = !c.classList.contains('solo'); cams.forEach((x) => x.classList.remove('solo')); $('#cams').classList.toggle('solo', solo); if (solo) c.classList.add('solo'); }));
  const CAMS = [
    { vx: .5, vy: .42, bw: .5, bh: .45, pod: 1 },
    { vx: .55, vy: .3, bw: .9, bh: .75, pod: 2.4 },
    { overhead: true },
    { vx: .2, vy: .45, bw: .38, bh: .38, pod: .8 },
  ];
  function videoColor(t) {
    if (!video) return [8, 8, 10];
    const k = t - videoStart;
    return video === 'intro' ? [140 + 110 * Math.sin(k * .9), 90 + 80 * Math.sin(k * .6 + 2), 150 + 100 * Math.sin(k * .4 + 4)] : [60 + 50 * Math.sin(k * .3), 140 + 60 * Math.sin(k * .25 + 1), 150 + 60 * Math.sin(k * .2 + 3)];
  }
  function drawCam(c, cam, t) {
    const { ctx, w, h } = fitCanvas(c);
    const lit = live.map((g) => g.c.map((v) => v * g.b / 100 / 255));
    const [house, front, cyc, pod] = lit;
    const vid = videoColor(t).map((v) => v / 255);
    const sum = (...cs) => [0, 1, 2].map((k) => cs.reduce((s, c) => s + c[k], 0));
    const tone = (c) => c.map((v) => 255 * (1 - Math.exp(-v * 1.6)));
    const wallC = sum(house.map((v) => v * .55), front.map((v) => v * .12), cyc.map((v) => v * .35), vid.map((v) => v * .12));
    const cycC = sum(house.map((v) => v * .6), cyc.map((v) => v * 1.1), vid.map((v) => v * .15));
    const floorC = sum(house.map((v) => v * .4), front.map((v) => v * .25), cyc.map((v) => v * .18), vid.map((v) => v * .1));
    if (cam.overhead) {
      ctx.fillStyle = rgba(tone(floorC)); ctx.fillRect(0, 0, w, h);
      const g = ctx.createRadialGradient(w * .55, h * .55, 0, w * .55, h * .55, h * .35); g.addColorStop(0, rgba(tone(pod), .9)); g.addColorStop(1, rgba(tone(pod), 0)); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = rgba(tone(cycC)); ctx.lineWidth = h * .05; ctx.beginPath(); ctx.moveTo(w * .1, h * .1); ctx.lineTo(w * .62, h * .1); ctx.arc(w * .62, h * .1 + w * .26, w * .26, -Math.PI / 2, 0); ctx.lineTo(w * .88, h * .9); ctx.stroke();
      ctx.strokeStyle = rgba(tone(vid.map((v) => v * 1.4))); ctx.lineWidth = h * .03; ctx.beginPath(); ctx.arc(w * .62, h * .1 + w * .26, w * .24, -Math.PI / 2 + .3, -.3); ctx.stroke();
      ctx.save(); ctx.translate(w * .55, h * .55); ctx.rotate(Math.PI / 4); ctx.fillStyle = '#222'; ctx.fillRect(-w * .06, -h * .03, w * .12, h * .06); ctx.restore();
      return;
    }
    const vx = w * cam.vx, vy = h * cam.vy, bw = w * cam.bw, bh = h * cam.bh;
    const bx0 = vx - bw / 2, by0 = vy - bh / 2, bx1 = vx + bw / 2, by1 = vy + bh / 2;
    const quad = (pts, fill) => { ctx.fillStyle = fill; ctx.beginPath(); pts.forEach((p, i) => (i ? ctx.lineTo(...p) : ctx.moveTo(...p))); ctx.fill(); };
    quad([[0, 0], [w, 0], [bx1, by0], [bx0, by0]], rgba(tone(wallC.map((v) => v * .5))));
    quad([[0, 0], [bx0, by0], [bx0, by1], [0, h]], rgba(tone(wallC.map((v) => v * .85))));
    quad([[w, 0], [bx1, by0], [bx1, by1], [w, h]], rgba(tone(wallC.map((v) => v * .75))));
    quad([[0, h], [bx0, by1], [bx1, by1], [w, h]], rgba(tone(floorC)));
    // cyc back wall with cove gradient + screen
    const g = ctx.createLinearGradient(0, by0, 0, by1); g.addColorStop(0, rgba(tone(cycC.map((v) => v * .8)))); g.addColorStop(1, rgba(tone(cycC.map((v) => v * 1.15))));
    ctx.fillStyle = g; ctx.fillRect(bx0, by0, bw, bh);
    const sx = bx0 + bw * .15, sy = by0 + bh * .18, sw = bw * .7, sh = bh * .42;
    ctx.fillStyle = rgba(tone(vid.map((v) => v * 1.6))); ctx.fillRect(sx, sy, sw, sh);
    if (video) { const k = t - videoStart; ctx.fillStyle = 'rgba(255,255,255,.5)'; ctx.beginPath(); ctx.arc(sx + sw * (.5 + .3 * Math.sin(k * .8)), sy + sh * .5, sh * .2, 0, TAU); ctx.fill(); }
    // screen spill on floor
    let sp = ctx.createRadialGradient(vx, by1, 0, vx, by1, bw * .8); sp.addColorStop(0, rgba(tone(vid), .5)); sp.addColorStop(1, 'rgba(0,0,0,0)'); ctx.fillStyle = sp; ctx.fillRect(0, by1, w, h - by1);
    // podium with spot pool
    const px = vx + bw * .05, py = by1 + (h - by1) * .45, ps = h * .09 * cam.pod;
    sp = ctx.createRadialGradient(px, py + ps * .4, 0, px, py + ps * .4, ps * 2.2);
    sp.addColorStop(0, rgba(tone(pod.map((v) => v * 1.4)), .95)); sp.addColorStop(1, rgba(tone(pod), 0));
    ctx.save(); ctx.translate(0, py + ps * .4); ctx.scale(1, .32); ctx.translate(0, -(py + ps * .4)); ctx.fillStyle = sp; ctx.beginPath(); ctx.arc(px, py + ps * .4, ps * 2.2, 0, TAU); ctx.fill(); ctx.restore();
    const podC = tone(sum(pod.map((v) => v * .9), front.map((v) => v * .6), house.map((v) => v * .2)));
    ctx.fillStyle = rgba(podC.map((v) => v * .35 + 10)); ctx.fillRect(px - ps * .06, py - ps * .9, ps * .12, ps * 1.3);
    ctx.fillStyle = rgba(podC.map((v) => v * .8 + 15)); ctx.fillRect(px - ps * .7, py - ps * 1.05, ps * 1.4, ps * .2);
    // beam cone
    if (live[3].b > 1) { const bc = ctx.createLinearGradient(0, 0, 0, py); bc.addColorStop(0, rgba(tone(pod), .25)); bc.addColorStop(1, rgba(tone(pod), 0)); ctx.fillStyle = bc; ctx.beginPath(); ctx.moveTo(px - 6, 0); ctx.lineTo(px + 6, 0); ctx.lineTo(px + ps * 2, py + ps * .4); ctx.lineTo(px - ps * 2, py + ps * .4); ctx.fill(); }
  }

  editor(); render();
  setTimeout(() => go(0), 300);
  loopWhileVisible($('#cams'), (dt, t) => {
    if (fadeT < 1) {
      fadeT = Math.min(1, fadeT + dt / fadeDur);
      const e = fadeT * fadeT * (3 - 2 * fadeT);
      live.forEach((g, i) => { g.c = mixRGB(from[i].c, to[i].c, e); g.b = lerp(from[i].b, to[i].b, e); });
    }
    $('#cueFadeBar').style.width = (fadeT * 100).toFixed(1) + '%';
    cams.forEach((c, i) => { if (!$('#cams').classList.contains('solo') || c.classList.contains('solo')) drawCam($('canvas', c), CAMS[i], t); });
  });
})();
