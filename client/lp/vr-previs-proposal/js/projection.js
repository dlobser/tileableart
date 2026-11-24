/* 05 Projection: section + elevation. Projector frustum, visitor occluding the beam, shadow on the wall. */
(() => {
  const canvas = $('#prjCanvas');
  let mode = 'proj';
  const st = { px: 1.2, py: 2.2, vx: 6.2 };
  const WALL = 10, ROOMH = 4.2, PERSON = 1.75;
  segButtons('prjMode', (d) => { mode = d.m; });
  const thr = bindRange('prjThrow', (v) => v.toFixed(2) + ':1');
  const shift = bindRange('prjShift', (v) => (v * 100).toFixed(0) + '%');
  const gain = bindRange('prjGain', (v) => v.toFixed(1));

  function geom() {
    const D = WALL - st.px, iw = D / +thr.value, ih = iw * 9 / 16;
    const yc = st.py + +shift.value * ih;
    return { D, iw, ih, top: yc + ih / 2, bot: yc - ih / 2 };
  }
  function content(ctx, x, y, w, h, t) {
    const kind = $('#prjContent').value;
    if (kind === 'grid') {
      ctx.fillStyle = '#111'; ctx.fillRect(x, y, w, h); ctx.strokeStyle = '#e8e8e8'; ctx.lineWidth = 1;
      for (let i = 0; i <= 16; i++) { ctx.beginPath(); ctx.moveTo(x + w * i / 16, y); ctx.lineTo(x + w * i / 16, y + h); ctx.stroke(); }
      for (let j = 0; j <= 9; j++) { ctx.beginPath(); ctx.moveTo(x, y + h * j / 9); ctx.lineTo(x + w, y + h * j / 9); ctx.stroke(); }
      ctx.beginPath(); ctx.arc(x + w / 2, y + h / 2, h * .4, 0, TAU); ctx.moveTo(x, y); ctx.lineTo(x + w, y + h); ctx.moveTo(x + w, y); ctx.lineTo(x, y + h); ctx.stroke();
    } else if (kind === 'text') {
      const g = ctx.createLinearGradient(x, y, x + w, y + h); g.addColorStop(0, '#e4874c'); g.addColorStop(1, '#5fbfbd');
      ctx.fillStyle = g; ctx.fillRect(x, y, w, h); ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
      ctx.font = `700 ${h * .16}px Figtree, sans-serif`; ctx.fillText('Welcome', x + w / 2, y + h * .52);
      ctx.font = `500 ${h * .06}px Figtree, sans-serif`; ctx.fillText('A STORY IN LIGHT', x + w / 2, y + h * .65);
    } else {
      const n = 10;
      for (let i = 0; i < n; i++) {
        const hue = (i * 36 + t * 40) % 360;
        ctx.fillStyle = `hsl(${hue},70%,${50 + 10 * Math.sin(t + i)}%)`; ctx.fillRect(x + w * i / n, y, w / n + 1, h);
      }
      ctx.fillStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.arc(x + w * (.5 + .3 * Math.sin(t * .7)), y + h * .5, h * .18, 0, TAU); ctx.fill();
    }
  }
  function silhouette(ctx, cx, footY, s) { // s = px per metre; figure 1.75 m
    ctx.beginPath(); ctx.arc(cx, footY - 1.62 * s, .11 * s, 0, TAU);
    ctx.roundRect(cx - .22 * s, footY - 1.48 * s, .44 * s, .74 * s, .1 * s);
    ctx.rect(cx - .16 * s, footY - .8 * s, .13 * s, .8 * s); ctx.rect(cx + .03 * s, footY - .8 * s, .13 * s, .8 * s);
  }

  let Sec = null;
  loopWhileVisible(canvas, (dt, t) => {
    const { ctx, w, h } = fitCanvas(canvas);
    ctx.fillStyle = '#0c0d0f'; ctx.fillRect(0, 0, w, h);
    const split = w * .52, G = geom();
    /* ---------- section (left) ---------- */
    const s = Math.min((split - 40) / WALL, (h - 70) / ROOMH), ox = 20, fy = h - 36;
    Sec = { s, ox, fy };
    const X = (x) => ox + x * s, Y = (y) => fy - y * s;
    ctx.fillStyle = '#18191c'; ctx.fillRect(X(0), Y(ROOMH), WALL * s, ROOMH * s);
    ctx.strokeStyle = '#c9c6c0'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X(0), Y(0)); ctx.lineTo(X(WALL), Y(0)); ctx.lineTo(X(WALL), Y(ROOMH)); ctx.lineTo(X(0), Y(ROOMH)); ctx.stroke();
    const top = mode === 'proj' ? G.top : 3, bot = mode === 'proj' ? G.bot : 1;
    if (mode === 'proj') {
      // beam, split around the visitor
      const k = (st.vx - st.px) / G.D, beamTopAtV = st.py + (G.top - st.py) * k, beamBotAtV = st.py + (G.bot - st.py) * k;
      const g = ctx.createLinearGradient(X(st.px), 0, X(WALL), 0); g.addColorStop(0, 'rgba(255,240,210,.35)'); g.addColorStop(1, 'rgba(255,240,210,.08)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(X(st.px), Y(st.py)); ctx.lineTo(X(WALL), Y(G.top)); ctx.lineTo(X(WALL), Y(G.bot)); ctx.closePath(); ctx.fill();
      // shadow wedge behind the visitor
      if (st.vx > st.px && beamBotAtV < PERSON) {
        const hTop = Math.min(PERSON, beamTopAtV), hBot = Math.max(0, beamBotAtV);
        const proj = (hh) => st.py + (hh - st.py) / k;
        ctx.fillStyle = 'rgba(0,0,0,.65)'; ctx.beginPath(); ctx.moveTo(X(st.vx), Y(hTop)); ctx.lineTo(X(WALL), Y(proj(hTop))); ctx.lineTo(X(WALL), Y(Math.max(proj(hBot), 0))); ctx.lineTo(X(st.vx), Y(hBot)); ctx.fill();
      }
      // projector body
      ctx.fillStyle = '#e8e8e6'; ctx.fillRect(X(st.px) - 16, Y(st.py) - 8, 22, 16); ctx.fillStyle = '#ff7a3d'; ctx.fillRect(X(st.px) + 6, Y(st.py) - 4, 4, 8);
      ctx.strokeStyle = '#555'; ctx.beginPath(); ctx.moveTo(X(st.px) - 5, Y(st.py) - 8); ctx.lineTo(X(st.px) - 5, Y(ROOMH)); ctx.stroke();
    } else {
      const g = ctx.createLinearGradient(X(WALL), 0, X(WALL - 2.5), 0); g.addColorStop(0, 'rgba(120,200,255,.3)'); g.addColorStop(1, 'rgba(120,200,255,0)');
      ctx.fillStyle = g; ctx.fillRect(X(WALL - 2.5), Y(3), 2.5 * s, 2 * s);
    }
    ctx.strokeStyle = mode === 'proj' ? '#ffd9a8' : '#78c8ff'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(X(WALL) - 2, Y(top)); ctx.lineTo(X(WALL) - 2, Y(bot)); ctx.stroke();
    // visitor (side) — lit where the beam hits them
    ctx.fillStyle = '#050505'; silhouette(ctx, X(st.vx), Y(0), s); ctx.fill();
    if (mode === 'proj') {
      const k = (st.vx - st.px) / G.D, bt = st.py + (G.top - st.py) * k, bb = st.py + (G.bot - st.py) * k;
      ctx.save(); silhouette(ctx, X(st.vx), Y(0), s); ctx.clip();
      ctx.fillStyle = `hsla(${(t * 40) % 360},80%,60%,.85)`; ctx.fillRect(X(st.vx) - .25 * s, Y(Math.min(bt, 2)), .1 * s, (Math.min(bt, 2) - Math.max(bb, 0)) * s);
      ctx.restore();
    }
    ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.font = '10px ui-monospace, monospace'; ctx.textAlign = 'left';
    ctx.fillText('SECTION', X(0) + 4, Y(ROOMH) + 14);
    if (mode === 'proj') ctx.fillText(`throw ${G.D.toFixed(1)} m`, X(st.px) - 14, Y(st.py) + 22);

    /* ---------- elevation (right): what the wall shows ---------- */
    const ex = split + 16, ew = w - split - 30, eW = 9, es = Math.min(ew / eW, (h - 70) / ROOMH), eFy = h - 36;
    const EX = (z) => ex + ew / 2 + z * es, EY = (y) => eFy - y * es;
    ctx.fillStyle = '#1c1c1f'; ctx.fillRect(EX(-eW / 2), EY(ROOMH), eW * es, ROOMH * es);
    if (mode === 'proj') {
      const ix = EX(-G.iw / 2), iy = EY(G.top), iw = G.iw * es, ih = G.ih * es;
      ctx.save(); ctx.beginPath(); ctx.rect(EX(-eW / 2), EY(ROOMH), eW * es, ROOMH * es); ctx.clip();
      content(ctx, ix, iy, iw, ih, t);
      // the visitor's shadow: silhouette scaled from the lens
      if (st.vx > st.px) {
        const k = G.D / (st.vx - st.px);
        ctx.save(); ctx.beginPath(); ctx.rect(ix, iy, iw, ih); ctx.clip();
        ctx.translate(EX(0), EY(st.py)); ctx.scale(k, k); ctx.translate(-EX(0), -EY(st.py));
        ctx.fillStyle = 'rgba(0,0,0,.92)'; silhouette(ctx, EX(.35), EY(0), es); ctx.fill();
        ctx.restore();
      }
      ctx.restore();
    } else {
      content(ctx, EX(-2.4), EY(3), 4.8 * es, 2 * es, t);
      ctx.strokeStyle = '#000'; ctx.lineWidth = 3; ctx.strokeRect(EX(-2.4), EY(3), 4.8 * es, 2 * es);
    }
    // visitor in front of the wall (seen from behind)
    ctx.fillStyle = 'rgba(8,8,8,.96)'; silhouette(ctx, EX(.35), EY(0), es * .95); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.45)'; ctx.textAlign = 'left'; ctx.fillText('ELEVATION · what visitors see', EX(-eW / 2) + 4, EY(ROOMH) + 14);

    // info
    const area = mode === 'proj' ? G.iw * G.ih : 4.8 * 2, lm = +$('#prjModel').value;
    const nits = mode === 'proj' ? lm * .85 * +gain.value / (Math.PI * area) : 700;
    const amb = 50 * .8 / Math.PI;
    $('#prjInfo').innerHTML = mode === 'proj'
      ? `<span>Throw distance</span><b>${G.D.toFixed(2)} m</b><span>Image size</span><b>${G.iw.toFixed(2)} × ${G.ih.toFixed(2)} m</b><span>Luminance</span><b>${Math.round(nits)} nits</b><span>vs ambient (50 lx)</span><b>${(nits / amb).toFixed(1)} : 1</b><span>Visitor shadow</span><b>${st.vx > st.px ? 'cast · ' + (G.D / (st.vx - st.px)).toFixed(1) + '× scale' : 'none'}</b>`
      : `<span>Screen</span><b>4.8 × 2.0 m LED</b><span>Mapping</span><b>UV 0–1</b><span>Luminance</span><b>${nits} nits</b><span>vs ambient (50 lx)</span><b>${(nits / amb).toFixed(1)} : 1</b><span>Visitor shadow</span><b>none (emissive)</b>`;
    $('#prjHud').innerHTML = mode === 'proj' ? `${Math.round(nits)} nits · ${(G.D / +thr.value).toFixed(2)} m wide` : 'UV-mapped emissive screen';
  });

  let drag = null;
  canvas.addEventListener('pointerdown', (e) => {
    if (!Sec) return; const r = canvas.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
    const wx = (mx - Sec.ox) / Sec.s, wy = (Sec.fy - my) / Sec.s;
    if (Math.hypot(wx - st.px, wy - st.py) < .6) drag = 'p'; else if (Math.abs(wx - st.vx) < .5 && wy < 2) drag = 'v';
    if (drag) canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (!drag) return; const r = canvas.getBoundingClientRect(), wx = (e.clientX - r.left - Sec.ox) / Sec.s, wy = (Sec.fy - (e.clientY - r.top)) / Sec.s;
    if (drag === 'p') { st.px = clamp(wx, .3, 7.5); st.py = clamp(wy, .6, 4); } else st.vx = clamp(wx, .4, 9.6);
  });
  canvas.addEventListener('pointerup', () => { drag = null; });
  canvas.style.cursor = 'grab';
})();
