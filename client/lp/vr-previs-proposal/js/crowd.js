/* 09 Crowd: flow-field pathfinding over a nav grid, separation, capacity/queueing, age-based speed & dwell,
   groups that split and rejoin, live stats, histogram, heatmap and CSV export. */
(() => {
  const CS = 0.25, GX = Math.round(PLAN.W / CS), GY = Math.round(PLAN.H / CS);
  const EX = PLAN.exhibits, EXIT = { x: 21, y: 13.6 };
  const AGE = {
    child: { speed: 1.1, dwell: 0.6, size: .72, want: [3, 5], label: 'child' },
    adult: { speed: 1.0, dwell: 1.0, size: 1, want: [3, 6], label: 'adult' },
    senior: { speed: 0.78, dwell: 1.3, size: .96, want: [2, 5], label: 'senior' },
  };

  /* ---------------- nav grid + fields ---------------- */
  const walk = new Uint8Array(GX * GY);
  const idx = (i, j) => j * GX + i;
  function blockedPt(x, y) {
    if (x < .15 || y < .15 || x > PLAN.W - .15 || y > PLAN.H - .15) return true;
    for (const [a, b, c, d] of PLAN.allWalls) if (distToSeg(x, y, a, b, c, d) < .3) return true;
    for (const o of PLAN.obstacles) if (Math.abs(x - o.x) < o.w / 2 + .2 && Math.abs(y - o.y) < o.h / 2 + .2) return true;
    return false;
  }
  for (let j = 0; j < GY; j++) for (let i = 0; i < GX; i++) walk[idx(i, j)] = blockedPt((i + .5) * CS, (j + .5) * CS) ? 0 : 1;
  const cellOf = (x, y) => [clamp(Math.floor(x / CS), 0, GX - 1), clamp(Math.floor(y / CS), 0, GY - 1)];
  const walkable = (x, y) => { const [i, j] = cellOf(x, y); return walk[idx(i, j)] === 1; };
  const los = (ax, ay, bx, by) => !PLAN.allWalls.some((w) => segmentsIntersect(ax, ay, bx, by, w[0], w[1], w[2], w[3]));

  function dijkstra(seeds) {
    const d = new Float64Array(GX * GY).fill(Infinity), heap = [];
    const push = (v, k) => { heap.push([v, k]); let i = heap.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (heap[p][0] <= heap[i][0]) break; [heap[p], heap[i]] = [heap[i], heap[p]]; i = p; } };
    const pop = () => { const top = heap[0], last = heap.pop(); if (heap.length) { heap[0] = last; let i = 0; for (;;) { const l = i * 2 + 1, r = l + 1; let m = i; if (l < heap.length && heap[l][0] < heap[m][0]) m = l; if (r < heap.length && heap[r][0] < heap[m][0]) m = r; if (m === i) break; [heap[m], heap[i]] = [heap[i], heap[m]]; i = m; } } return top; };
    for (const k of seeds) { d[k] = 0; push(0, k); }
    while (heap.length) {
      const [v, k] = pop(); if (v > d[k]) continue; const i = k % GX, j = (k / GX) | 0;
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
        if (!di && !dj) continue; const ni = i + di, nj = j + dj; if (ni < 0 || nj < 0 || ni >= GX || nj >= GY) continue;
        const nk = idx(ni, nj); if (!walk[nk]) continue;
        if (di && dj && (!walk[idx(i + di, j)] || !walk[idx(i, j + dj)])) continue;
        const nv = v + (di && dj ? 1.414 : 1) * CS; if (nv < d[nk]) { d[nk] = nv; push(nv, nk); }
      }
    }
    return d;
  }
  function ringOK(e, x, y) {
    const d = Math.hypot(x - e.fx, y - e.fy); if (d < e.rin || d > e.r) return false;
    const fx = e.fx + (x - e.fx) / d * .25, fy = e.fy + (y - e.fy) / d * .25;
    return los(x, y, fx, fy);
  }
  EX.forEach((e) => {
    const seeds = []; for (let j = 0; j < GY; j++) for (let i = 0; i < GX; i++) if (walk[idx(i, j)] && ringOK(e, (i + .5) * CS, (j + .5) * CS)) seeds.push(idx(i, j));
    e.field = dijkstra(seeds);
  });
  const exitSeeds = []; for (let j = 0; j < GY; j++) for (let i = 0; i < GX; i++) if (walk[idx(i, j)] && Math.hypot((i + .5) * CS - EXIT.x, (j + .5) * CS - EXIT.y) < .7) exitSeeds.push(idx(i, j));
  const exitField = dijkstra(exitSeeds);
  const fieldOf = (t) => (t === 'exit' ? exitField : EX[t].field);
  const fval = (f, x, y) => { const [i, j] = cellOf(x, y); return f[idx(i, j)]; };
  function flowDir(f, x, y) {
    const [i, j] = cellOf(x, y), cur = f[idx(i, j)]; let gx = 0, gy = 0, best = cur, bx = 0, by = 0;
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
      if (!di && !dj) continue; const ni = i + di, nj = j + dj; if (ni < 0 || nj < 0 || ni >= GX || nj >= GY) continue;
      const v = f[idx(ni, nj)]; if (!isFinite(v)) continue;
      if (isFinite(cur) && v < cur) { const l = Math.hypot(di, dj); gx += (cur - v) * di / l; gy += (cur - v) * dj / l; }
      if (v < best) { best = v; bx = di; by = dj; }
    }
    if (!gx && !gy) { gx = bx; gy = by; }
    if (!isFinite(cur)) { gx = bx; gy = by; } // off-grid: step to the best neighbour
    const l = Math.hypot(gx, gy) || 1; return [gx / l, gy / l];
  }

  /* ---------------- sim state ---------------- */
  let agents, groups, simT, spawned, nextArrival, stats, density, running = false, simSpeed = 30, showHeat = false, nextId;
  const P = () => ({
    total: +$('#crVisitors').value, rate: +$('#crRate').value, kids: +$('#crKids').value / 100, seniors: +$('#crSeniors').value / 100,
    group: +$('#crGroup').value / 100, gmax: +$('#crGroupMax').value, split: +$('#crSplit').value / 100, patience: +$('#crPatience').value, attn: +$('#crAttn').value / 100,
  });
  function reset() {
    agents = []; groups = new Map(); simT = 0; spawned = 0; nextArrival = 0; nextId = 1;
    stats = { entered: 0, exited: 0, peak: 0, visits: [], log: [], ex: EX.map(() => ({ visits: 0, dwell: 0, max: 0, skipped: 0 })) };
    density = new Float32Array(GX * GY);
    updateStats(true);
  }
  const rand = Math.random, rr = (a, b) => a + rand() * (b - a);
  function pickAge(p) { const r = rand(); return r < p.kids ? 'child' : r < p.kids + p.seniors ? 'senior' : 'adult'; }
  function spawnParty(p) {
    const n = rand() < p.group ? 2 + Math.floor(rand() * (p.gmax - 1)) : 1;
    const gid = n > 1 ? nextId : null, members = [];
    for (let k = 0; k < n && spawned < p.total; k++) {
      let age = pickAge(p);
      const a = { id: nextId++, age, x: .45 + rand() * .3, y: 6.5 + rand() * 1, vx: 0, vy: 0, dir: 0, state: 'walk', target: null, slot: null, dwellLeft: 0, queueT: 0,
        visited: new Set(), want: Math.round(rr(...AGE[age].want)), enterT: simT, group: gid, attached: !!gid, solo: 0, skipped: 0, seen: [] };
      members.push(a); agents.push(a); spawned++; stats.entered++;
    }
    if (gid && members.length > 1) {
      // groups with children always have an adult leading
      if (members.some((m) => m.age === 'child') && !members.some((m) => m.age !== 'child')) members[0].age = 'adult';
      const leader = members.find((m) => m.age !== 'child') || members[0];
      const speed = Math.min(...members.map((m) => AGE[m.age].speed));
      const g = { id: gid, leader, members, speed, hue: (gid * 47) % 360 };
      groups.set(gid, g); members.forEach((m) => { m.want = leader.want; });
      choose(leader, p);
    } else { members.forEach((m) => { m.group = null; m.attached = false; choose(m, p); }); }
    return Math.max(1, members.length);
  }
  const dwellCount = (e) => agents.reduce((n, a) => n + ((a.state === 'dwell' || a.state === 'approach') && a.target === e ? 1 : 0), 0);
  function choose(a, p) {
    let best = 'exit', bs = 0;
    if (a.visited.size < a.want) for (let e = 0; e < EX.length; e++) {
      if (a.visited.has(e)) continue; const dist = fval(EX[e].field, a.x, a.y); if (!isFinite(dist)) continue;
      const occ = dwellCount(e) / EX[e].cap;
      const pref = a.age === 'child' && EX[e].kind === 'interactive' ? 1.5 : a.age === 'senior' && EX[e].kind === 'film' ? 1.3 : 1;
      const s = EX[e].attract * pref / (1 + dist / 10) * (1 - Math.min(occ, 1) * .6) * rr(.7, 1.3);
      if (s > bs) { bs = s; best = e; }
    }
    setTarget(a, best);
    const g = a.group && groups.get(a.group);
    if (g && g.leader === a) for (const m of g.members) if (m !== a && m.attached) setTarget(m, best);
  }
  function setTarget(a, t) { a.target = t; a.state = 'walk'; a.slot = null; a.queueT = 0; }
  function slotFor(e) { for (let k = 0; k < 14; k++) { const ang = rand() * TAU, r = rr(e.rin + .1, e.r - .1), x = e.fx + Math.cos(ang) * r, y = e.fy + Math.sin(ang) * r; if (walkable(x, y) && ringOK(e, x, y)) return [x, y]; } return null; }
  function dwellTime(a, e, p) {
    const base = EX[e].kind === 'film' ? EX[e].dur * rr(.3, 1.0) : EX[e].dur * rr(.45, 1.4);
    return base * AGE[a.age].dwell * p.attn;
  }
  function startDwell(a, p) {
    const e = a.target, g = a.group && groups.get(a.group);
    a.state = 'dwell'; a.visited.add(e); a.seen.push(EX[e].name); stats.ex[e].visits++;
    const isLeader = g && g.leader === a, follower = g && !isLeader && a.attached;
    a.dwellLeft = follower ? Infinity : dwellTime(a, e, p);
    a.dwellStart = simT;
    if (isLeader) for (const m of g.members) if (m !== a && m.attached && rand() < p.split) { // peel off for 1–2 exhibits
      m.attached = false; m.solo = 1 + (rand() < .4 ? 1 : 0); m.visited.add(e); choose(m, p);
    }
  }
  function endDwell(a, p) {
    stats.ex[a.target].dwell += simT - a.dwellStart;
    const g = a.group && groups.get(a.group);
    if (g && g.leader === a) { choose(a, p); return; }
    if (g && a.attached) { a.dwellLeft = Infinity; a.dwellStart = simT; return; } // wait for the group to move on
    if (g && !a.attached) { a.solo--; if (a.solo <= 0) { a.rejoin = true; setTarget(a, g.leader.target); return; } }
    choose(a, p);
  }
  function step(dt, p) {
    simT += dt;
    // arrivals: Poisson process
    while (spawned < p.total && simT >= nextArrival) { const n = spawnParty(p); nextArrival = simT + -Math.log(1 - rand()) * 60 / p.rate * n; } // rate = people per minute
    // spatial hash
    const hash = new Map();
    for (const a of agents) { const k = (Math.floor(a.x) << 8) | Math.floor(a.y); (hash.get(k) || hash.set(k, []).get(k)).push(a); }
    const counts = EX.map((_, e) => dwellCount(e));
    counts.forEach((c, e) => { stats.ex[e].max = Math.max(stats.ex[e].max, c); });
    const gone = [];
    for (const a of agents) {
      const g = a.group && groups.get(a.group);
      // rejoining: track the leader's target, reattach when close
      if (g && !a.attached && a.rejoin) {
        if (a.target !== g.leader.target && a.state !== 'dwell') setTarget(a, g.leader.target);
        if (Math.hypot(a.x - g.leader.x, a.y - g.leader.y) < 2.5) { a.attached = true; a.rejoin = false; if (a.target !== g.leader.target) setTarget(a, g.leader.target); }
      }
      let want = [0, 0], speed = (g && a.attached ? g.speed : AGE[a.age].speed);
      if (a.state === 'dwell') {
        a.dwellLeft -= dt;
        const leaderMoved = g && a.attached && g.leader !== a && g.leader.target !== a.target;
        if (leaderMoved) { stats.ex[a.target].dwell += simT - a.dwellStart; setTarget(a, g.leader.target); }
        else if (a.dwellLeft <= 0) endDwell(a, p);
      } else if (a.state === 'queue') {
        a.queueT += dt;
        const follower = g && a.attached && g.leader !== a;
        if (follower && g.leader.target !== a.target) setTarget(a, g.leader.target);
        else if (counts[a.target] < EX[a.target].cap) { a.state = 'approach'; a.slot = slotFor(EX[a.target]); counts[a.target]++; }
        else if (!follower && a.queueT > p.patience) { stats.ex[a.target].skipped++; a.skipped++; a.visited.add(a.target); choose(a, p); }
      } else if (a.target === 'exit') {
        if (Math.hypot(a.x - EXIT.x, a.y - EXIT.y) < .8) { gone.push(a); continue; }
        want = flowDir(exitField, a.x, a.y);
      } else if (a.state === 'walk') {
        const f = EX[a.target].field;
        if (fval(f, a.x, a.y) <= CS * .5) { // reached the viewing ring
          if (counts[a.target] >= EX[a.target].cap) { a.state = 'queue'; a.queueT = 0; }
          else { a.state = 'approach'; a.slot = slotFor(EX[a.target]); counts[a.target]++; }
        } else want = flowDir(f, a.x, a.y);
      }
      if (a.state === 'approach') {
        if (!a.slot) startDwell(a, p);
        else { const dx = a.slot[0] - a.x, dy = a.slot[1] - a.y, d = Math.hypot(dx, dy); if (d < .15) startDwell(a, p); else { want = [dx / d, dy / d]; speed *= .6; } }
      }
      // separation + group cohesion
      let sx = 0, sy = 0, near = 0;
      for (let ox = -1; ox <= 1; ox++) for (let oy = -1; oy <= 1; oy++) {
        const list = hash.get(((Math.floor(a.x) + ox) << 8) | (Math.floor(a.y) + oy)); if (!list) continue;
        for (const b of list) { if (b === a) continue; const dx = a.x - b.x, dy = a.y - b.y, d = Math.hypot(dx, dy); if (d < .55 && d > 1e-4) { const k = (.55 - d) / .55; sx += dx / d * k; sy += dy / d * k; near++; } }
      }
      if (g && a.attached && g.leader !== a && a.state === 'walk') { const dx = g.leader.x - a.x, dy = g.leader.y - a.y, d = Math.hypot(dx, dy); if (d > 1.5 && d < 6 && los(a.x, a.y, g.leader.x, g.leader.y)) { want[0] += dx / d * .4; want[1] += dy / d * .4; } }
      const moving = want[0] || want[1];
      const crowdF = clamp(1 - near * .1, .35, 1);
      const tvx = want[0] * speed * crowdF + sx * (moving ? .9 : .5), tvy = want[1] * speed * crowdF + sy * (moving ? .9 : .5);
      a.vx = lerp(a.vx, tvx, .35); a.vy = lerp(a.vy, tvy, .35);
      const nx = a.x + a.vx * dt, ny = a.y + a.vy * dt;
      if (walkable(nx, ny)) { a.x = nx; a.y = ny; } else if (walkable(nx, a.y)) a.x = nx; else if (walkable(a.x, ny)) a.y = ny;
      if (Math.hypot(a.vx, a.vy) > .15) a.dir = Math.atan2(a.vy, a.vx);
      const [ci, cj] = cellOf(a.x, a.y); density[idx(ci, cj)] += dt;
    }
    for (const a of gone) {
      agents.splice(agents.indexOf(a), 1); stats.exited++; const dur = simT - a.enterT; stats.visits.push(dur);
      stats.log.push([a.id, a.age, a.group || '', a.enterT.toFixed(0), simT.toFixed(0), (dur / 60).toFixed(2), a.seen.join(' > '), a.skipped]);
      const g = a.group && groups.get(a.group);
      if (g && g.leader === a) { // leader left: anyone still inside carries on alone
        for (const m of g.members) if (m !== a && agents.includes(m)) { m.group = null; m.attached = false; if (m.dwellLeft === Infinity) m.dwellLeft = rr(5, 30); else if (m.target !== 'exit' && m.state !== 'dwell') choose(m, P()); }
        groups.delete(g.id);
      }
    }
    stats.peak = Math.max(stats.peak, agents.length);
  }

  /* ---------------- drawing ---------------- */
  const canvas = $('#crowdCanvas'); let V;
  function draw() {
    const { ctx, w, h } = fitCanvas(canvas); V = planView(w, h, 18);
    ctx.fillStyle = '#d9d5cf'; ctx.fillRect(0, 0, w, h);
    drawPlan(ctx, V, { floor: '#f1eee9', wall: '#1d1d1d', grid: 'rgba(0,0,0,.04)', labelColor: 'rgba(0,0,0,.35)', labelColor2: 'rgba(0,0,0,.6)', screenColor: { cyc: '#e4874c', nook: '#e4874c', gesture: '#e4874c' } });
    if (showHeat) {
      let mx = 0; for (const v of density) mx = Math.max(mx, v);
      if (mx > 0) for (let j = 0; j < GY; j++) for (let i = 0; i < GX; i++) { const v = density[idx(i, j)] / mx; if (v < .02) continue; ctx.fillStyle = `rgba(${200 + 55 * v},${120 - 90 * v},40,${Math.min(.8, Math.sqrt(v))})`; ctx.fillRect(V.X(i * CS), V.Y(j * CS), CS * V.s + .5, CS * V.s + .5); }
    }
    // exhibit capacity gauges
    EX.forEach((e, k) => {
      const c = dwellCount(k), f = Math.min(c / e.cap, 1), px = V.X(e.id === 'gesture' ? 14 : e.id === 'nook' ? 22.6 : e.fx), py = V.Y(e.id === 'gesture' ? 1.4 : e.id === 'nook' ? 4.7 : e.id === 'cyc' ? 2.9 : e.id === 'podium' ? 5.4 : e.fy + 1.3);
      ctx.fillStyle = 'rgba(0,0,0,.1)'; ctx.fillRect(px - 20, py, 40, 4);
      ctx.fillStyle = f >= 1 ? '#d9452b' : f > .7 ? '#e4a14c' : '#3aa676'; ctx.fillRect(px - 20, py, 40 * f, 4);
      ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.font = '600 9px ui-monospace, monospace'; ctx.textAlign = 'center'; ctx.fillText(`${c}/${e.cap}`, px, py + 13);
    });
    // group links
    for (const g of groups.values()) for (const m of g.members) {
      if (m === g.leader || !agents.includes(m)) continue;
      ctx.strokeStyle = `hsla(${g.hue},60%,45%,${m.attached ? .45 : .35})`; ctx.lineWidth = 1; ctx.setLineDash(m.attached ? [] : [3, 4]);
      ctx.beginPath(); ctx.moveTo(V.X(m.x), V.Y(m.y)); ctx.lineTo(V.X(g.leader.x), V.Y(g.leader.y)); ctx.stroke();
    }
    ctx.setLineDash([]);
    // silhouettes (top-down: shoulders + head)
    for (const a of agents) {
      const s = AGE[a.age].size * V.s, x = V.X(a.x), y = V.Y(a.y);
      ctx.save(); ctx.translate(x, y); ctx.rotate(a.dir + Math.PI / 2);
      ctx.fillStyle = a.age === 'senior' ? '#3a3a3a' : '#111'; if (a.state === 'queue') ctx.fillStyle = '#9a2e1c';
      ctx.beginPath(); ctx.ellipse(0, 0, .24 * s, .13 * s, 0, 0, TAU); ctx.fill();
      ctx.beginPath(); ctx.arc(0, -.02 * s, .095 * s, 0, TAU); ctx.fillStyle = a.state === 'dwell' ? '#555' : '#000'; ctx.fill();
      ctx.restore();
    }
  }

  /* ---------------- stats UI ---------------- */
  const pct = (arr, q) => { if (!arr.length) return 0; const s = [...arr].sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor(q * s.length))]; };
  function updateStats(force) {
    $('#crowdClock').textContent = fmtTime(simT);
    $('#stIn').textContent = agents.length; $('#stPeak').textContent = stats.peak; $('#stEntered').textContent = stats.entered; $('#stExited').textContent = stats.exited;
    const avg = stats.visits.length ? stats.visits.reduce((a, b) => a + b, 0) / stats.visits.length : 0;
    $('#stAvg').innerHTML = stats.visits.length ? `${fmtMin(avg)}<i>min</i>` : '–';
    $('#stP90').innerHTML = stats.visits.length ? `${fmtMin(pct(stats.visits, .9))}<i>min</i>` : '–';
    $('#exhTable tbody').innerHTML = EX.map((e, k) => { const s = stats.ex[k]; return `<tr><td>${e.name}</td><td>${s.visits}</td><td>${s.visits ? fmtMin(s.dwell / Math.max(1, s.visits)) + 'm' : '–'}</td><td style="color:${s.max >= e.cap ? '#ff8a8a' : 'inherit'}">${s.max}/${e.cap}</td><td>${s.skipped}</td></tr>`; }).join('');
    // histogram
    const hc = $('#crowdHist'), { ctx, w, h } = fitCanvas(hc); ctx.fillStyle = '#0c0d0f'; ctx.fillRect(0, 0, w, h);
    if (stats.visits.length) {
      const bins = 24, maxMin = 48, hist = new Array(bins).fill(0); for (const v of stats.visits) hist[Math.min(bins - 1, Math.floor(v / 60 / maxMin * bins))]++;
      const m = Math.max(...hist), bw = w / bins;
      hist.forEach((c, i) => { ctx.fillStyle = '#ff7a3d'; ctx.fillRect(i * bw + 1, h - 14 - (h - 22) * c / m, bw - 2, (h - 22) * c / m); });
      ctx.fillStyle = '#8d9096'; ctx.font = '9px ui-monospace, monospace'; ctx.textAlign = 'left'; ctx.fillText('0', 2, h - 3); ctx.textAlign = 'center'; ctx.fillText('24 min', w / 2, h - 3); ctx.textAlign = 'right'; ctx.fillText('48+', w - 2, h - 3);
      const ax = avg / 60 / maxMin * w; ctx.strokeStyle = '#fff'; ctx.setLineDash([2, 2]); ctx.beginPath(); ctx.moveTo(ax, 4); ctx.lineTo(ax, h - 14); ctx.stroke(); ctx.setLineDash([]);
    } else { ctx.fillStyle = '#8d9096'; ctx.font = '11px Figtree, sans-serif'; ctx.fillText('Waiting for visitors to finish…', 8, h / 2 + 4); }
    // estimate
    const p = P();
    if (stats.visits.length >= 8) {
      const busiest = EX.map((e, k) => [e, stats.ex[k]]).sort((a, b) => b[1].max / b[0].cap - a[1].max / a[0].cap)[0];
      const thr = stats.exited / Math.max(simT / 3600, 1e-3);
      const over = EX.map((e, k) => [e, stats.ex[k]]).filter(([e, s]) => s.skipped > 2);
      $('#crowdEstimate').innerHTML = `Plan for a <b>~${Math.round(avg / 60)} minute</b> experience (90% of visitors finish within <b>${Math.round(pct(stats.visits, .9) / 60)} min</b>). At ${p.rate} arrivals/min the space peaks at <b>${stats.peak} people</b>; throughput so far is <b>${Math.round(thr)}/hr</b>. Busiest: <b>${busiest[0].name}</b> (${busiest[1].max}/${busiest[0].cap}).` + (over.length ? ` ⚠ ${over.map(([e, s]) => `${e.name} turned away ${s.skipped}`).join(', ')}: consider more capacity or shorter content.` : '');
    } else if (stats.entered) $('#crowdEstimate').innerHTML = `Simulating… <b>${agents.length}</b> visitors inside. Estimates appear once a few have completed their visit.`;
    else $('#crowdEstimate').textContent = 'Run the simulation to get estimates.';
  }

  /* ---------------- controls ---------------- */
  bindRange('crVisitors'); bindRange('crRate', (v) => v + '/min'); bindRange('crGroup', (v) => v + '%'); bindRange('crGroupMax'); bindRange('crSplit', (v) => v + '%');
  bindRange('crPatience', (v) => v + 's'); bindRange('crAttn', (v) => v + '%');
  const ages = () => { const k = +$('#crKids').value, s = +$('#crSeniors').value; $('#crAdults').textContent = `Adults: ${Math.max(0, 100 - k - s)}%`; };
  bindRange('crKids', (v) => v + '%', ages); bindRange('crSeniors', (v) => v + '%', ages); ages();
  const runBtn = $('#crowdRun');
  const setRun = (r) => { running = r; runBtn.textContent = r ? '❚❚ Pause' : '▶ Run'; };
  runBtn.onclick = () => setRun(!running);
  $('#crowdReset').onclick = () => { reset(); draw(); };
  segButtons('crowdSpeed', (d) => { simSpeed = +d.s; });
  $('#crowdHeat').onclick = (e) => { showHeat = !showHeat; e.target.classList.toggle('on', showHeat); };
  $('#crowdCsv').onclick = () => {
    const rows = [['visitor', 'age', 'group', 'entered_s', 'exited_s', 'visit_min', 'path', 'skipped'], ...stats.log, [], ['exhibit', 'visits', 'avg_dwell_min', 'max_concurrent', 'capacity', 'skipped'],
      ...EX.map((e, k) => [e.name, stats.ex[k].visits, stats.ex[k].visits ? (stats.ex[k].dwell / stats.ex[k].visits / 60).toFixed(2) : '', stats.ex[k].max, e.cap, stats.ex[k].skipped])];
    const csv = rows.map((r) => r.map((c) => (/[,"]/.test(String(c)) ? `"${String(c).replace(/"/g, '""')}"` : c)).join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'previs_crowd_run.csv'; a.click();
    toast(`Exported ${stats.log.length} visitor records`);
  };
  $('#crowdLegend').innerHTML = '<span style="color:#333">● adult · <span style="font-size:9px">●</span> child · <span style="color:#666">●</span> senior · <span style="color:#9a2e1c">●</span> queueing · lines = groups, dashed = split off</span>';

  reset();
  let statT = 0, autostarted = false;
  new IntersectionObserver((e) => { if (e[0].isIntersecting && !autostarted) { autostarted = true; setRun(true); } }, { threshold: .4 }).observe(canvas);
  loopWhileVisible(canvas, (dt) => {
    if (running) {
      const p = P(); const n = Math.min(Math.round(simSpeed * dt / .1), 300);
      for (let i = 0; i < n; i++) step(.1, p);
      if (spawned >= p.total && !agents.length) { setRun(false); toast('Simulation complete: export the CSV for the full run'); }
    }
    draw();
    statT += dt; if (statT > .25) { statT = 0; updateStats(); }
  });
  window.__crowd = { walkAt: (x, y) => walkable(x, y), exitAt: (x, y) => fval(exitField, x, y), flow: (x, y) => flowDir(exitField, x, y), nSeeds: exitSeeds.length, get agents() { return agents; }, get stats() { return stats; }, get simT() { return simT; } };
})();
