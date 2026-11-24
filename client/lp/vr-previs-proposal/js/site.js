/* Site chrome: header, progress, nav state, "explored" tracking, reveals, hero. */
(() => {
  const header = $('#header'), progress = $('#progress');
  const sections = $$('.stage-sec');
  const navLinks = $$('#nav a');
  const mapFrames = $$('#map .frame');
  const visited = new Set();

  function onScroll() {
    const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
    header.classList.toggle('solid', y > innerHeight - 80);
    progress.style.width = (100 * y / max).toFixed(2) + '%';
    let current = null;
    for (const s of sections) { const r = s.getBoundingClientRect(); if (r.top < innerHeight * 0.45 && r.bottom > innerHeight * 0.3) current = s.id; }
    navLinks.forEach((a) => a.classList.toggle('current', a.getAttribute('href') === '#' + current));
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // a stage counts as explored once its workbench has been on screen for a moment
  const timers = new Map();
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const id = e.target.closest('.stage-sec').id;
      if (e.isIntersecting) timers.set(id, setTimeout(() => markVisited(id), 900));
      else clearTimeout(timers.get(id));
    }
  }, { threshold: 0.35 });
  sections.forEach((s) => { const wb = $('.wb', s); if (wb) io.observe(wb); });

  function markVisited(id) {
    if (visited.has(id)) return;
    visited.add(id);
    navLinks.forEach((a) => { if (a.getAttribute('href') === '#' + id) a.classList.add('visited'); });
    mapFrames.forEach((f) => { if (f.getAttribute('href') === '#' + id) { f.classList.add('visited'); $('.state', f).textContent = 'Explored'; } });
    $('#mapProgress').innerHTML = `<b>${visited.size} / ${sections.length}</b> stages explored` + (visited.size === sections.length ? ' — the whole pipeline. ✦' : '');
  }

  // reveal on scroll (staggered within a group)
  const rio = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) {
      const sibs = [...e.target.parentElement.children].filter((c) => c.classList.contains('reveal'));
      e.target.style.transitionDelay = Math.min(sibs.indexOf(e.target), 6) * 70 + 'ms';
      e.target.classList.add('in'); rio.unobserve(e.target);
    }
  }, { threshold: 0.12 });
  $$('.reveal').forEach((el) => rio.observe(el));

  // hero: rotating endings, like the studio site's tagline
  const phrases = ['rehearse the room before it exists.', 'light spaces that aren’t built yet.', 'cue the show before the walls go up.', 'fill galleries before opening day.'];
  let pi = 0; const rot = $('#heroRot');
  setInterval(() => {
    rot.classList.add('out');
    setTimeout(() => { pi = (pi + 1) % phrases.length; rot.textContent = phrases[pi]; rot.classList.remove('out'); }, 550);
  }, 4200);

  // hero: soft drifting colour fields (warm / teal), the studio's imagery feel
  const hc = $('#heroCanvas');
  const blobs = [
    { c: [228, 135, 76], x: .2, y: .35, r: .55, sx: .13, sy: .09 },
    { c: [242, 180, 138], x: .45, y: .2, r: .45, sx: .07, sy: .11 },
    { c: [95, 191, 189], x: .8, y: .45, r: .6, sx: .1, sy: .08 },
    { c: [159, 216, 211], x: .65, y: .85, r: .5, sx: .09, sy: .12 },
    { c: [120, 70, 60], x: .1, y: .9, r: .5, sx: .05, sy: .07 },
  ];
  loopWhileVisible(hc, (dt, t) => {
    const { ctx, w, h } = fitCanvas(hc);
    ctx.fillStyle = '#3a2c25'; ctx.fillRect(0, 0, w, h);
    ctx.globalCompositeOperation = 'lighter';
    for (const [i, b] of blobs.entries()) {
      const x = (b.x + Math.sin(t * b.sx + i) * 0.12) * w, y = (b.y + Math.cos(t * b.sy + i * 2) * 0.1) * h, r = b.r * Math.max(w, h);
      const g = ctx.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, rgba(b.c, .55)); g.addColorStop(1, rgba(b.c, 0));
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    }
    ctx.globalCompositeOperation = 'source-over';
    // a faint room silhouette: floor line, cyc curve, podium and the light cone
    ctx.strokeStyle = 'rgba(255,255,255,.18)'; ctx.lineWidth = 1.5;
    const fy = h * .72;
    ctx.beginPath(); ctx.moveTo(0, fy); ctx.quadraticCurveTo(w * .5, fy - h * .06, w, fy); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(w * .3, h * .3); ctx.quadraticCurveTo(w * .62, h * .36, w * .92, h * .26); ctx.lineTo(w * .92, h * .5); ctx.quadraticCurveTo(w * .62, h * .58, w * .3, h * .52); ctx.closePath(); ctx.stroke();
    const px = w * .7, cone = ctx.createLinearGradient(0, h * .08, 0, fy);
    cone.addColorStop(0, 'rgba(255,240,220,.25)'); cone.addColorStop(1, 'rgba(255,240,220,0)');
    ctx.fillStyle = cone; ctx.beginPath(); ctx.moveTo(px - 18, h * .08); ctx.lineTo(px + 18, h * .08); ctx.lineTo(px + 130, fy); ctx.lineTo(px - 130, fy); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.22)'; ctx.fillRect(px - 60, fy - 92, 120, 10); ctx.fillRect(px - 3, fy - 82, 6, 80);
    ctx.beginPath(); ctx.ellipse(px, fy, 36, 6, 0, 0, TAU); ctx.fill();
  });
})();
