/* 04 LED: elevation with a cove strip, an LED tile wall and a floor-edge strip; pixel effects; budget maths. */
(() => {
  const canvas = $('#ledCanvas');
  let fx = 'gradient';
  segButtons('ledFx', (d) => { fx = d.fx; });
  const speed = bindRange('ledSpeed', (v) => v.toFixed(2) + '×');
  const bri = bindRange('ledBri', (v) => v + '%');
  const sel = (id) => $('#' + id);
  ['ledStrip', 'ledPanel'].forEach((id) => sel(id).addEventListener('change', budget));

  function look(u, v, t) {
    const A = hexRGB(sel('ledA').value), B = hexRGB(sel('ledB').value), s = +speed.value;
    switch (fx) {
      case 'gradient': return mixRGB(A, B, .5 + .5 * Math.sin(TAU * (u * 1.2 - t * s * .15) + v * 2));
      case 'chase': { const p = ((u * 5 - t * s * .8) % 1 + 1) % 1; return p < .18 ? A : B.map((c) => c * .08); }
      case 'breathe': return A.map((c) => c * (.25 + .75 * (.5 + .5 * Math.sin(t * s * 2))));
      case 'video': { const k = Math.sin(u * 9 + t * s) + Math.sin(v * 7 - t * s * 1.3) + Math.sin((u + v) * 6 + t * s * .7); return mixRGB(A, B, .5 + k / 6).map((c, i) => c * (.6 + .4 * Math.sin(k + i))); }
      default: return A;
    }
  }
  function budget() {
    const ppm = +sel('ledStrip').value, pitch = +sel('ledPanel').value, rgbw = ppm === 60;
    const stripLen = 8.4 + 8.0, stripPx = Math.round(stripLen * ppm);
    const pw = Math.round(3000 / pitch), ph = Math.round(2000 / pitch), panelPx = pw * ph;
    const perUni = rgbw ? 128 : 170, unis = Math.ceil(stripPx / perUni);
    const w = stripLen * (ppm === 144 ? 28 : rgbw ? 14.4 : 9.6) + 6 * 220 * (+bri.value / 100 + .3) / 1.3;
    $('#ledBudget').innerHTML = `<span>Strip runs</span><b>${stripLen.toFixed(1)} m</b><span>Strip pixels</span><b>${stripPx.toLocaleString()}</b><span>sACN universes</span><b>${unis} (${rgbw ? 'RGBW' : 'RGB'})</b><span>LED wall</span><b>6 × 4 tiles · 3×2 m</b><span>Wall resolution</span><b>${pw} × ${ph}</b><span>Wall pixels</span><b>${panelPx.toLocaleString()}</b><span>Peak brightness</span><b>${pitch < 2.5 ? 800 : 1200} nits</b><span>Est. power (avg)</span><b>${(w / 1000).toFixed(2)} kW</b>`;
  }
  bri.addEventListener('input', budget); budget();

  loopWhileVisible(canvas, (dt, t) => {
    const { ctx, w, h } = fitCanvas(canvas);
    const b = +bri.value / 100;
    ctx.fillStyle = '#0b0b0c'; ctx.fillRect(0, 0, w, h);
    // room elevation: cyc as a curved band, floor
    const floorY = h * .82, topY = h * .14, L = w * .06, Rr = w * .94;
    const wall = ctx.createLinearGradient(0, topY, 0, floorY); wall.addColorStop(0, '#2a2a2c'); wall.addColorStop(1, '#1d1d1f');
    ctx.fillStyle = wall; ctx.fillRect(L, topY, Rr - L, floorY - topY);
    ctx.fillStyle = '#141313'; ctx.fillRect(0, floorY, w, h - floorY);
    // LED wall (3×2 m), drawn as tiles with pixel grid preview
    const px0 = w * .14, py0 = h * .3, pW = w * .42, pH = pW * 2 / 3;
    const cols = 48, rows = 32, cw = pW / cols, ch = pH / rows;
    let avgP = [0, 0, 0];
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const c = look(i / cols, j / rows, t).map((x) => x * b); avgP = avgP.map((a, k) => a + c[k]);
      ctx.fillStyle = rgba(c); ctx.fillRect(px0 + i * cw, py0 + j * ch, cw - .6, ch - .6);
    }
    avgP = avgP.map((a) => a / (cols * rows));
    ctx.strokeStyle = 'rgba(0,0,0,.6)'; ctx.lineWidth = 1.5;
    for (let i = 0; i <= 6; i++) { ctx.beginPath(); ctx.moveTo(px0 + i * pW / 6, py0); ctx.lineTo(px0 + i * pW / 6, py0 + pH); ctx.stroke(); }
    for (let j = 0; j <= 4; j++) { ctx.beginPath(); ctx.moveTo(px0, py0 + j * pH / 4); ctx.lineTo(px0 + pW, py0 + j * pH / 4); ctx.stroke(); }
    // emissive spill from the wall onto floor and surroundings
    ctx.globalCompositeOperation = 'lighter';
    let g = ctx.createRadialGradient(px0 + pW / 2, py0 + pH / 2, pH * .3, px0 + pW / 2, py0 + pH / 2, pW * .9);
    g.addColorStop(0, rgba(avgP, .35)); g.addColorStop(1, rgba(avgP, 0)); ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    g = ctx.createRadialGradient(px0 + pW / 2, floorY, 0, px0 + pW / 2, floorY, pW * .7);
    g.addColorStop(0, rgba(avgP, .45)); g.addColorStop(1, rgba(avgP, 0)); ctx.fillStyle = g; ctx.fillRect(0, floorY, w, h - floorY);
    // cove strip (top) and floor-edge strip
    const strip = (y, n, glowDown, phase) => {
      for (let i = 0; i < n; i++) {
        const u = i / n, x = L + u * (Rr - L), c = look(u, phase, t).map((v) => v * b);
        const gg = ctx.createLinearGradient(0, y, 0, y + glowDown); gg.addColorStop(0, rgba(c, .5)); gg.addColorStop(1, rgba(c, 0));
        ctx.fillStyle = gg; ctx.fillRect(x - (Rr - L) / n, glowDown > 0 ? y : y + glowDown, (Rr - L) / n * 2, Math.abs(glowDown));
        ctx.fillStyle = rgba(c.map((v) => Math.min(255, v * 1.3 + 30 * b))); ctx.fillRect(x, y - 1.5, Math.max(1.5, (Rr - L) / n - 1), 3);
      }
    };
    strip(topY + 3, 120, h * .22, 0);
    strip(floorY - 2, 120, -h * .12, .7);
    ctx.globalCompositeOperation = 'source-over';
    // right side: a figure for scale
    const fx0 = w * .74, fy = floorY;
    ctx.fillStyle = '#060606'; ctx.beginPath(); ctx.arc(fx0, fy - h * .38, h * .028, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.roundRect(fx0 - h * .04, fy - h * .345, h * .08, h * .345, h * .02); ctx.fill();
    ctx.fillStyle = 'rgba(255,255,255,.4)'; ctx.font = '10px ui-monospace, monospace'; ctx.textAlign = 'center';
    ctx.fillText('1.75 m', fx0, fy + 14); ctx.fillText('LED wall 3 × 2 m · ' + sel('ledPanel').value + ' mm', px0 + pW / 2, py0 + pH + 16);
    ctx.fillText('Cove strip · ' + sel('ledStrip').value + ' px/m', w / 2, topY - 6); ctx.fillText('Floor-edge strip', w / 2, floorY + 18);
  });
})();
