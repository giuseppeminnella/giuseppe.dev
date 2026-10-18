/* Pixel-art building blocks: sky, clouds, city, trees, cars, street furniture.
   16-bit beat-'em-up look: saturated palette, dithered gradients, soft outlines. */
window.ART = (() => {
  const { rng, canvas, mix, shade, tint, rect, dot, hline, vline, checker, sparse, ellipse, disc, line, sprite, text3 } = PX;

  const PAL = {
    sky: ['#2A5FCB', '#3169D2', '#3A76DA', '#4584E1', '#5192E7', '#5FA0EC', '#6FAEF0', '#81BBF3', '#94C8F6', '#A9D4F8', '#BEE0FA'],
    haze: '#B9D2EE',
    tree: ['#1D4520', '#2B5F27', '#3C7D2F', '#57A038', '#84C24A'],
    gold: ['#5E3712', '#8C5319', '#C1852A', '#E4B046', '#F6D884'],
    white: '#F3F1EB', whiteShade: '#D9D5CB', whiteDeep: '#BEB9AE',
    cream: '#ECE4D2', creamShade: '#CFC5AE',
    glass: '#5E7C92', glassDark: '#40596C', glassHi: '#9BB9CC',
    frame: '#8D8A83',
    asphalt: '#54575F', asphaltDark: '#474A51', asphaltLight: '#62656D',
    walk: '#C8C3B9', walkDark: '#ABA69C', curb: '#DEDAD2',
    bike: '#B45A4B', grass: ['#3F7A2A', '#559435', '#6BAA42'],
    dbBlue: '#0018A8',
  };

  // ---------- sky ----------
  function skyGradient(g, w, h, stops = PAL.sky, y0 = 0) {
    const n = stops.length, bh = h / n;
    for (let i = 0; i < n; i++) rect(g, 0, y0 + Math.floor(i * bh), w, Math.ceil(bh) + 1, stops[i]);
    for (let i = 1; i < n; i++) {
      const y = y0 + Math.floor(i * bh);
      checker(g, 0, y - 2, w, 2, stops[i], 0);
      sparse(g, 0, y - 4, w, 2, stops[i], 1);
    }
  }

  function sun(g, cx, cy) {
    const ring = (r0, r1, c, keep) => {
      for (let y = -r1; y <= r1; y++) for (let x = -r1; x <= r1; x++) {
        const d = Math.hypot(x, y);
        if (d >= r0 && d < r1 && keep(x, y)) dot(g, cx + x, cy + y, c);
      }
    };
    ring(16, 26, '#7FB6F0', (x, y) => ((x + y) & 1) === 0 && (y & 1) === 0);
    ring(12, 17, '#A9D2FA', (x, y) => ((x + y) & 1) === 0);
    ring(10, 12, '#D8ECFF', () => true);
    disc(g, cx, cy, 10, '#FFF1B8');
    disc(g, cx, cy, 8, '#FFF9DD');
    disc(g, cx, cy, 5, '#FFFFFF');
  }

  // One cumulus: a flat-bottomed body with puffs on top, lit from the upper left.
  function cloud(seed, w) {
    const r = rng(seed), h = Math.round(w * .46);
    const [c, g] = canvas(w + 8, h + 8);
    const shapes = [{ x: 4 + w * .5, y: 4 + h * .7, rx: w * .47, ry: h * .24 }];
    const n = 3 + Math.floor(r() * 3);
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1), rr = h * (.24 + r() * .1 + (1 - Math.abs(t - .5) * 2) * .2);
      shapes.push({ x: 4 + w * (.2 + .6 * t) + (r() - .5) * w * .06, y: 4 + h * .64 - rr * .6, rx: rr, ry: rr });
    }
    const base = 4 + Math.round(h * .86);
    for (let y = 0; y <= base; y++) for (let x = 0; x < w + 8; x++) {
      let best = -9;
      for (const s of shapes) {
        const dx = (x - s.x) / s.rx, dy = (y - s.y) / s.ry, d2 = dx * dx + dy * dy;
        if (d2 <= 1) best = Math.max(best, (dx * .5 + dy * .85) * -.6 + (1 - d2) * .35);
      }
      if (best === -9) continue;
      const odd = (x + y) & 1;
      let col = best > .3 ? '#FFFFFF' : best > .18 ? (odd ? '#FFFFFF' : '#EDF4FC') : best > .02 ? '#E6EFFA' : (odd ? '#E6EFFA' : '#D3E3F4');
      if (y >= base) col = '#C3D8EF';
      else if (y >= base - 2 && best < .2) col = odd ? '#CFE0F3' : '#C3D8EF';
      dot(g, x, y, col);
    }
    return c;
  }

  // ---------- the Berlin horizon ----------
  function skyline(g, w, baseY, seed) {
    const r = rng(seed);
    const C = ['#A3BEDF', '#98B4D8', '#8EABD1'];
    let x = -4;
    while (x < w) {
      const bw = 5 + Math.floor(r() * 16), bh = 4 + Math.floor(r() * 13);
      rect(g, x, baseY - bh, bw, bh, C[Math.floor(r() * 2)]);
      if (r() < .3) rect(g, x + 2, baseY - bh - 3, 2, 3, C[1]);
      x += bw + Math.floor(r() * 2);
    }
    // Fernsehturm
    const fx = 392;
    rect(g, fx - 1, baseY - 64, 3, 64, C[2]);
    rect(g, fx - 2, baseY - 12, 5, 12, C[2]);
    disc(g, fx, baseY - 50, 5, C[2]);
    hline(g, fx - 5, baseY - 47, 11, '#8AA6CB');
    rect(g, fx, baseY - 80, 1, 16, C[2]);
    // Funkturm (lattice mast)
    const kx = 58;
    for (let i = 0; i < 46; i++) { const half = Math.round(6 - i * 0.11); dot(g, kx - half, baseY - i, C[2]); dot(g, kx + half, baseY - i, C[2]); if (i % 4 === 0) hline(g, kx - half, baseY - i, half * 2 + 1, C[2]); }
    rect(g, kx - 3, baseY - 34, 7, 2, C[2]);
    vline(g, kx, baseY - 56, 10, C[2]);
    // Rathaus Charlottenburg tower
    const rx = 196;
    rect(g, rx - 3, baseY - 38, 7, 38, C[2]);
    rect(g, rx - 2, baseY - 44, 5, 6, C[2]);
    rect(g, rx - 1, baseY - 48, 3, 4, C[2]);
    dot(g, rx, baseY - 50, C[2]);
  }

  // ---------- aerial buildings (oblique: roof on top, front facade below) ----------
  const hazed = (c, hz) => (hz ? mix(c, PAL.haze, hz) : c);

  function roofFlat(g, x, y, w, d, opts = {}) {
    const hz = opts.haze || 0, r = rng(opts.seed || 1);
    const base = hazed(opts.color || '#A29C91', hz), dark = hazed(shade(opts.color || '#A29C91', .16), hz);
    rect(g, x, y, w, d, base);
    for (let i = 0; i < w * d * .18; i++) dot(g, x + r() * w, y + r() * d, dark);
    hline(g, x, y, w, hazed(tint(opts.color || '#A29C91', .35), hz));
    hline(g, x, y + d - 1, w, hazed(tint(opts.color || '#A29C91', .45), hz));
    vline(g, x, y, d, hazed(tint(opts.color || '#A29C91', .25), hz));
    if (opts.units) {
      const n = opts.units;
      for (let i = 0; i < n; i++) {
        const uw = 3 + Math.floor(r() * 6), ud = 2 + Math.floor(r() * 3);
        const ux = x + 2 + Math.floor(r() * Math.max(1, w - uw - 4)), uy = y + 1 + Math.floor(r() * Math.max(1, d - ud - 2));
        rect(g, ux, uy, uw, ud, hazed('#C9CCD1', hz));
        hline(g, ux, uy + ud, uw, hazed('#7C8087', hz));
        dot(g, ux, uy, hazed('#E6E8EB', hz));
      }
    }
  }

  function roofPitched(g, x, y, w, d, opts = {}) {
    const hz = opts.haze || 0, r = rng(opts.seed || 2);
    const tile = opts.color || '#A5503C';
    rect(g, x, y, w, d, hazed(tile, hz));
    for (let j = 1; j < d; j += 2) hline(g, x, y + j, w, hazed(shade(tile, .14), hz));
    hline(g, x + 1, y, w - 2, hazed(tint(tile, .3), hz));
    hline(g, x, y + d - 1, w, hazed(shade(tile, .35), hz));
    const dormers = Math.floor(w / 12);
    for (let i = 0; i < dormers; i++) {
      const dx = x + 5 + i * 12 + Math.floor(r() * 3);
      if (dx + 4 > x + w - 3) break;
      rect(g, dx, y + Math.floor(d / 2) - 1, 4, 3, hazed('#E9E1CF', hz));
      rect(g, dx + 1, y + Math.floor(d / 2), 2, 2, hazed('#5A6B78', hz));
    }
    if (r() < .8) rect(g, x + Math.floor(w * .7), y - 2, 2, 3, hazed('#7E4A3B', hz));
  }

  function facade(g, x, y, w, h, opts = {}) {
    const hz = opts.haze || 0, r = rng(opts.seed || 3);
    const wall = opts.wall || PAL.white, st = opts.style || 'grid';
    const W1 = hazed(wall, hz), Ws = hazed(shade(wall, .12), hz), Wd = hazed(shade(wall, .28), hz);
    const G = hazed(opts.glass || PAL.glass, hz), Gd = hazed(opts.glassDark || PAL.glassDark, hz), Gh = hazed(PAL.glassHi, hz);
    rect(g, x, y, w, h, W1);
    const fh = opts.floorH || 7;
    if (st === 'bands') {
      for (let fy = y + 2; fy + 3 <= y + h - 1; fy += fh) {
        rect(g, x + 1, fy, w - 2, Math.max(2, fh - 3), G);
        hline(g, x + 1, fy, w - 2, Gd);
        for (let i = x + 3; i < x + w - 2; i += 5) vline(g, i, fy, Math.max(2, fh - 3), hazed('#8A97A0', hz));
        if (r() < .9) dot(g, x + 2 + Math.floor(r() * (w - 4)), fy + 1, Gh);
        hline(g, x, fy + fh - 1, w, Ws);
      }
    } else if (st === 'brick') {
      const bw = opts.winW || 2;
      for (let fy = y + 2; fy + 3 <= y + h; fy += fh) {
        for (let wx = x + 2; wx + bw <= x + w - 1; wx += bw + 3) {
          rect(g, wx - 1, fy - 1, bw + 2, 4, hazed('#E8E2D6', hz));
          rect(g, wx, fy, bw, 3, Gd);
        }
      }
    } else if (st === 'balcony') {
      for (let fy = y + 1; fy + 3 <= y + h; fy += fh) {
        rect(g, x + 1, fy, w - 2, fh - 2, Ws);
        for (let wx = x + 2; wx + 3 <= x + w - 1; wx += 6) rect(g, wx, fy + 1, 3, fh - 4, Gd);
        hline(g, x, fy + fh - 2, w, hazed('#FAFAF7', hz));
        hline(g, x, fy + fh - 1, w, Wd);
      }
    } else {
      // 'grid' and 'altbau': punched windows
      const ww = opts.winW || 3, wh = opts.winH || Math.max(2, fh - 3), gap = opts.gap || 3;
      for (let fy = y + 2; fy + wh <= y + h - (opts.groundH || 0); fy += fh) {
        for (let wx = x + gap; wx + ww <= x + w - gap + 1; wx += ww + gap) {
          if (st === 'altbau') rect(g, wx - 1, fy - 1, ww + 2, wh + 2, hazed('#FBF6EA', hz));
          rect(g, wx, fy, ww, wh, G);
          hline(g, wx, fy, ww, Gd);
          if (ww >= 3 && wh >= 4) dot(g, wx + ww - 1, fy + wh - 1, Gh);
        }
      }
      if (opts.groundH) {
        const gy = y + h - opts.groundH;
        rect(g, x, gy, w, opts.groundH, Ws);
        for (let wx = x + 2; wx + 5 <= x + w - 1; wx += 7) rect(g, wx, gy + 1, 5, opts.groundH - 1, Gd);
      }
    }
    vline(g, x + w - 1, y, h, Wd);
    vline(g, x, y, h, hazed(tint(wall, .3), hz));
  }

  // ---------- trees ----------
  // A cluster of shaded blobs with leafy noise: the pixel-art tree canopy.
  function shadedBlob(g, blobs, pal, seed, light = [-0.6, -0.7]) {
    const r = rng(seed);
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    blobs.forEach(([bx, by, br]) => { x0 = Math.min(x0, bx - br); y0 = Math.min(y0, by - br); x1 = Math.max(x1, bx + br); y1 = Math.max(y1, by + br); });
    for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) for (let x = Math.floor(x0); x <= Math.ceil(x1); x++) {
      let best = -9;
      for (const [bx, by, br] of blobs) {
        const dx = (x - bx) / br, dy = (y - by) / br, d2 = dx * dx + dy * dy;
        if (d2 > 1) continue;
        best = Math.max(best, -(dx * light[0] + dy * light[1]) * .55 + (1 - d2) * .45);
      }
      if (best === -9) continue;
      const v = best + (r() - .5) * .38;
      dot(g, x, y, pal[v > .78 ? 4 : v > .52 ? 3 : v > .24 ? 2 : v > -.02 ? 1 : 0]);
    }
  }
  function treeTop(g, cx, cy, rad, seed, pal = PAL.tree) {
    const r = rng(seed), blobs = [];
    const n = 4 + Math.floor(r() * 3);
    for (let i = 0; i < n; i++) {
      const a = r() * Math.PI * 2, d = r() * rad * .42;
      blobs.push([cx + Math.cos(a) * d, cy + Math.sin(a) * d * .85, rad * (.5 + r() * .18)]);
    }
    shadedBlob(g, blobs, pal, seed + 7);
  }
  function shadow(g, cx, cy, rx, ry, a = .3) {
    g.globalAlpha = a; ellipse(g, cx, cy, rx, ry, '#101626'); g.globalAlpha = 1;
  }

  // ---------- cars, seen from above at an angle ----------
  const CAR_COLORS = ['#F2F2EF', '#2A2C31', '#B9BDC4', '#2A2C31', '#8D939C', '#C8342F', '#F2F2EF', '#39455A', '#2A2C31', '#B9BDC4', '#D9D9D4', '#6B7482'];
  function carTop(g, x, y, len, wid, col, dir = 1) {
    x = Math.round(x); y = Math.round(y);
    const dark = shade(col, .38), light = tint(col, .3), glass = '#28313D', hi = '#6A7C8F';
    g.globalAlpha = .28; rect(g, x + 1, y + 2, len, wid, '#0E1220'); g.globalAlpha = 1;
    rect(g, x + 1, y, len - 2, wid, col);
    rect(g, x, y + 1, len, wid - 2, col);
    rect(g, x + 1, y + wid - 2, len - 2, 2, dark);
    const cx = x + Math.round(len * (dir > 0 ? .3 : .24)), cw = Math.round(len * .46);
    rect(g, cx, y + 1, cw, wid - 3, glass);
    rect(g, cx + 2, y + 1, cw - 4, wid - 3, light);
    dot(g, dir > 0 ? cx + cw - 1 : cx, y + 1, hi);
    const front = dir > 0 ? x + len - 1 : x;
    dot(g, front, y + 1, '#FFF6D0');
    dot(g, dir > 0 ? x : x + len - 1, y + 1, '#C8322B');
  }
  // Car parked nose-in (seen from above, pointing up or down).
  function carTopV(g, x, y, wid, len, col) {
    x = Math.round(x); y = Math.round(y);
    const dark = shade(col, .38), light = tint(col, .3), glass = '#28313D';
    g.globalAlpha = .28; rect(g, x + 1, y + 2, wid, len, '#0E1220'); g.globalAlpha = 1;
    rect(g, x + 1, y, wid - 2, len, col); rect(g, x, y + 1, wid, len - 2, col);
    vline(g, x + wid - 1, y + 1, len - 2, dark);
    const cy = y + Math.round(len * .3), ch = Math.round(len * .42);
    rect(g, x + 1, cy, wid - 2, ch, glass);
    rect(g, x + 1, cy + 2, wid - 2, ch - 4, light);
    dot(g, x + 1, y, '#FFF6D0'); dot(g, x + wid - 2, y, '#FFF6D0');
  }
  function vanTop(g, x, y, len, wid, col, dir = 1) {
    carTop(g, x, y, len, wid, col, dir);
    const rx = dir > 0 ? x + 2 : x + Math.round(len * .38);
    rect(g, rx, y + 1, Math.round(len * .58), wid - 3, tint(col, .12));
  }

  // tiny pedestrians for the aerial shots
  const PEOPLE = ['#C8342F', '#2F5DAA', '#E7B347', '#3A3A3F', '#EDEDED', '#4F8A3A'];
  function person(g, x, y, col, step) {
    x = Math.round(x); y = Math.round(y);
    g.globalAlpha = .25; rect(g, x + 1, y + 4, 2, 1, '#0E1220'); g.globalAlpha = 1;
    dot(g, x, y, '#E9C3A0');
    rect(g, x, y + 1, 1, 2, col);
    dot(g, x + (step ? 1 : 0), y + 3, '#2A2A30');
  }

  // ---------- ground textures ----------
  function speckle(g, x, y, w, h, colors, density, seed) {
    const r = rng(seed);
    for (let i = 0; i < w * h * density; i++) dot(g, x + r() * w, y + r() * h, colors[Math.floor(r() * colors.length)]);
  }

  function road(g, x, y, w, h, seed, dashY) {
    rect(g, x, y, w, h, PAL.asphalt);
    speckle(g, x, y, w, h, [PAL.asphaltDark, PAL.asphaltLight], .08, seed);
    if (dashY != null) for (let dx = x + 4; dx < x + w; dx += 16) rect(g, dx, dashY, 7, 1, '#E9E9E4');
  }

  // Berlin sidewalk: grey mosaic cobbles, smaller towards the wall (perspective).
  function cobbles(g, x, y, w, h, seed, opts = {}) {
    const r = rng(seed);
    const P = opts.pal || ['#8F8B83', '#A19D94', '#B2AEA5', '#C1BDB4'], gap = opts.gap || '#6E6A63';
    rect(g, x, y, w, h, gap);
    let cy = y;
    while (cy < y + h) {
      const k = (cy - y) / h, sh = Math.max(2, Math.round((opts.min || 2) + k * ((opts.max || 6) - (opts.min || 2))));
      let cx = x - Math.floor(r() * sh);
      while (cx < x + w) {
        const sw = sh + Math.floor(r() * (sh + 1));
        const c = P[Math.floor(r() * P.length)];
        rect(g, cx + 1, cy + 1, sw - 1, sh - 1, c);
        dot(g, cx + 1, cy + 1, tint(c, .18));
        if (sw > 3 && sh > 3) hline(g, cx + 2, cy + sh - 1, sw - 2, shade(c, .12));
        cx += sw;
      }
      cy += sh;
    }
  }

  // ---------- street-level pieces ----------
  function glassPane(g, x, y, w, h, seed, opts = {}) {
    const r = rng(seed);
    const top = opts.top || '#7D98A6', mid = opts.mid || '#3F535D', bot = opts.bot || '#2B383F';
    for (let j = 0; j < h; j++) {
      const t = j / h;
      rect(g, x, y + j, w, 1, t < .25 ? mix(top, mid, t / .25) : mix(mid, bot, (t - .25) / .75));
    }
    for (let s = 0; s < 2; s++) {
      const sx = x + Math.floor(r() * w * .6), sw = 2 + Math.floor(r() * 4);
      for (let j = 0; j < h; j++) {
        const xx = sx + Math.floor(j * .35) - Math.floor(h * .1);
        if (xx >= x && xx + sw <= x + w) { g.globalAlpha = .18; rect(g, xx, y + j, sw, 1, '#DDEBF2'); g.globalAlpha = 1; }
      }
    }
    if (opts.lights) opts.lights.forEach(([lx, ly]) => {
      vline(g, x + lx, y, ly, '#1F2A30');
      g.globalAlpha = .35; disc(g, x + lx, y + ly + 1, 4, '#F5B84A'); g.globalAlpha = 1;
      disc(g, x + lx, y + ly + 1, 1, '#FFE6A6');
    });
  }

  function frameBox(g, x, y, w, h, c = PAL.frame, t = 2) {
    rect(g, x, y, w, t, c); rect(g, x, y + h - t, w, t, shade(c, .15));
    rect(g, x, y, t, h, tint(c, .12)); rect(g, x + w - t, y, t, h, shade(c, .2));
  }

  // The bistro chair (3/4 view). Colours: main, outline derived.
  const CHAIR_ROWS = [
    '...KKKKKKKKKK...',
    '..KCCCCCCCCCCK..',
    '.KCLLLLLLLLLLCK.',
    '.KCKKKKKKKKKKCK.',
    '.KCK........KCK.',
    '.KCKKKKKKKKKKCK.',
    '.KCLLLLLLLLLLCK.',
    '.KCKKKKKKKKKKCK.',
    '.KCK........KCK.',
    '.KCK........KCK.',
    'KKCKKKKKKKKKKCKK',
    'KCLLLLLLLLLLLLCK',
    'KCCCCCCCCCCCCCCK',
    'KDDDDDDDDDDDDDDK',
    '.KCK.KK..KK.KCK.',
    '.KCK.KCK.KCKKCK.',
    '.KCK.KCK..KCKCK.',
    '.KCK..KCK.KCKCK.',
    '.KCK..KCK..KCK..',
    '.KDK...KDK.KDK..',
    '.KK....KK...KK..',
  ];
  function chair(color) {
    return sprite(CHAIR_ROWS, { K: shade(color, .6), C: color, L: tint(color, .28), D: shade(color, .3) });
  }

  function picnicTable(g, x, y, w) {
    const top = '#6E4A33', light = '#8A6043', dark = '#46301F', edge = '#3A271A';
    // A-frame legs
    [x + 8, x + w - 14].forEach(lx => {
      line(g, lx, y + 7, lx - 6, y + 42, dark); line(g, lx + 1, y + 7, lx - 5, y + 42, dark);
      line(g, lx + 4, y + 7, lx + 10, y + 42, edge); line(g, lx + 5, y + 7, lx + 11, y + 42, edge);
      rect(g, lx - 4, y + 24, 14, 2, dark);
    });
    // top with planks, slightly receding
    for (let j = 0; j < 6; j++) rect(g, x + (5 - j), y + j, w, 1, j % 2 ? top : light);
    hline(g, x + 4, y + 2, w, dark);
    rect(g, x, y + 6, w, 3, edge);
    hline(g, x, y + 6, w, dark);
  }

  function umbrellaFolded(g, x, y, h, fabric = '#EFECE3') {
    const sh = shade(fabric, .12), deep = shade(fabric, .26);
    rect(g, x + 6, y, 2, 4, '#6B6B6B');
    const body = Math.round(h * .78);
    for (let j = 0; j < body; j++) {
      const t = j / body, half = Math.max(1, Math.round((t < .28 ? 3 + t / .28 * 4 : 7 - (t - .28) / .72 * 5.5)));
      const cx = x + 7;
      rect(g, cx - half, y + 4 + j, half * 2, 1, fabric);
      dot(g, cx + half - 1, y + 4 + j, sh);
      if (half > 3) { dot(g, cx - 1, y + 4 + j, sh); dot(g, cx + 2, y + 4 + j, deep); }
      dot(g, cx - half, y + 4 + j, tint(fabric, .5));
    }
    rect(g, x + 2, y + 4 + Math.round(body * .5), 10, 2, deep);
    rect(g, x + 6, y + 4 + body, 2, h - body - 4, '#5E5E60');
  }

  function noSmokingSign(g, x, y) {
    rect(g, x, y, 22, 30, '#F6F6F2');
    rect(g, x, y + 29, 22, 1, '#B9B6AE'); vline(g, x + 21, y, 30, '#CFCBC3');
    const cx = x + 11, cy = y + 11;
    ellipse(g, cx, cy, 9, 9, '#D2332B');
    ellipse(g, cx, cy, 7, 7, '#F6F6F2');
    rect(g, cx - 6, cy, 10, 3, '#FFFFFF'); hline(g, cx - 6, cy + 2, 10, '#9C9C9C'); hline(g, cx - 6, cy, 10, '#D9D9D9');
    rect(g, cx + 4, cy, 2, 3, '#E0782E');
    dot(g, cx + 5, cy - 2, '#9C9C9C'); dot(g, cx + 4, cy - 4, '#9C9C9C'); dot(g, cx + 6, cy - 5, '#B9B9B9');
    line(g, cx - 5, cy - 5, cx + 5, cy + 5, '#D2332B'); line(g, cx - 4, cy - 5, cx + 5, cy + 4, '#D2332B'); line(g, cx - 5, cy - 4, cx + 4, cy + 5, '#D2332B');
    [22, 24, 26].forEach(ty => hline(g, x + 4, y + ty, ty === 26 ? 8 : 14, '#D86A63'));
  }

  const PIGEON = [
    ['....KK......', '...KHHK.....', '..BHeHK.....', '...KNNK.....', '...KNPLKK...', '..KLLLLLLKK.', '..KLWWLLLLLK', '..KLWBWLLLK.', '...KLLLLLK..', '....KKKKK...', '.....F.F....'],
    ['....KK......', '...KHHK.....', '..BHeHK.....', '...KNNK.....', '...KNPLKK...', '..KLLLLLLKK.', '..KLWWLLLLLK', '..KLWBWLLLK.', '...KLLLLLK..', '....KKKKK...', '....F...F...'],
    ['............', '............', '............', '....KK......', '..BKHHKKK...', '...KeHNLLKK.', '...KNPLLLLLK', '..KLWWLLLLK.', '...KWBWLLK..', '....KKKKK...', '.....F.F....'],
  ];
  const PIGEON_PAL = { K: '#3E4048', H: '#9DA0AA', e: '#F08A24', B: '#E9E1D2', N: '#4FA674', P: '#8A6DB5', L: '#AEB1BA', W: '#8C8F99', F: '#D98C8C' };
  const pigeonFrames = () => PIGEON.map(rows => sprite(rows, PIGEON_PAL));

  // Paper cup used as an ashtray, right under the no-smoking sign.
  const CUP = ['.S..T..', '.O.SO..', 'KWWWWWK', 'KWBBBWK', 'KWBBBWK', 'KWWWWWK', '.KWWWK.', '.KKKKK.'];
  const cupSprite = () => sprite(CUP, { S: '#F2F2EE', O: '#E0913C', T: '#DADAD4', K: '#6D6A64', W: '#F6F4EE', B: '#9A6A45' });

  function dbLogo(g, x, y, s, c = PAL.dbBlue) {
    rect(g, x, y, s, 1, c); rect(g, x, y + s - 1, s, 1, c); rect(g, x, y, 1, s, c); rect(g, x + s - 1, y, 1, s, c);
    line(g, x + 1, y + s - 2, x + s - 2, y + 1, c);
  }

  // Street tree with golden leaves (the one in front of Dave B.)
  function streetTree(g, x, groundY, h, seed, pal = PAL.gold) {
    const r = rng(seed), bark = '#6A5A4C', barkD = '#4E4238', barkL = '#8B7A69';
    rect(g, x - 3, groundY - h * .45, 7, h * .45, bark);
    vline(g, x - 3, groundY - h * .45, h * .45, barkL);
    vline(g, x + 3, groundY - h * .45, h * .45, barkD);
    const tips = [];
    const branch = (bx, by, ang, len, depth) => {
      const ex = bx + Math.cos(ang) * len, ey = by + Math.sin(ang) * len;
      line(g, bx, by, ex, ey, depth > 2 ? bark : barkD);
      if (depth > 2) line(g, bx + 1, by, ex + 1, ey, bark);
      if (depth <= 0) { tips.push([ex, ey]); return; }
      branch(ex, ey, ang - .35 - r() * .3, len * .72, depth - 1);
      branch(ex, ey, ang + .3 + r() * .3, len * .7, depth - 1);
    };
    const segs = [];
    const branch2 = (bx, by, ang, len, depth) => {
      const ex = bx + Math.cos(ang) * len, ey = by + Math.sin(ang) * len;
      line(g, bx, by, ex, ey, depth > 2 ? bark : barkD);
      if (depth > 2) line(g, bx + 1, by, ex + 1, ey, bark);
      if (depth > 3) line(g, bx - 1, by, ex - 1, ey, barkD);
      if (depth <= 2) segs.push([bx, by, ex, ey]);
      if (depth <= 0) { tips.push([ex, ey]); return; }
      branch2(ex, ey, ang - .32 - r() * .34, len * .74, depth - 1);
      branch2(ex, ey, ang + .28 + r() * .34, len * .72, depth - 1);
    };
    branch2(x, groundY - h * .45, -Math.PI / 2 - .38, h * .21, 5);
    branch2(x, groundY - h * .45, -Math.PI / 2 + .42, h * .19, 5);
    // leaves: small clusters strewn along the thin branches, a few more at the tips
    const blobs = [];
    segs.forEach(([ax, ay, bx, by]) => { for (let k = .3; k <= 1; k += .35) if (r() < .7) blobs.push([ax + (bx - ax) * k + (r() - .5) * 5, ay + (by - ay) * k + (r() - .5) * 5, 2.5 + r() * 3]); });
    tips.forEach(([tx, ty]) => blobs.push([tx + (r() - .5) * 4, ty + (r() - .5) * 4, 3 + r() * 3.5]));
    shadedBlob(g, blobs, pal, seed + 11);
  }

  // Far away the city is a carpet of tiny hazy roofs.
  function cityCarpet(g, x, y, w, h, seed) {
    const r = rng(seed);
    rect(g, x, y, w, h, '#9FB5D0');
    for (let yy = y; yy < y + h; yy += 3) {
      const k = (yy - y) / h;
      const pal = ['#AFC2DA', '#A6BAD4', '#B6C4D6', '#B9B3BF', '#A9B6C4'].map(c => mix(c, '#A09A92', k * .45));
      let xx = x - Math.floor(r() * 8);
      while (xx < x + w) {
        const sw = 3 + Math.floor(r() * 10);
        if (r() < .08) { rect(g, xx, yy, sw, 3, mix('#8FAE8A', '#9FB5D0', .5 - k * .3)); }
        else { rect(g, xx, yy, sw, 2, pal[Math.floor(r() * pal.length)]); hline(g, xx, yy + 2, sw, mix('#95AAC4', '#8C867E', k * .4)); }
        xx += sw + (r() < .25 ? 1 : 0);
      }
    }
  }

  return { PAL, CAR_COLORS, PEOPLE, cityCarpet, carTopV, skyGradient, sun, cloud, skyline, roofFlat, roofPitched, facade, shadedBlob, treeTop, shadow,
    carTop, vanTop, person, speckle, road, cobbles, glassPane, frameBox, chair, picnicTable, umbrellaFolded, noSmokingSign,
    pigeonFrames, cupSprite, dbLogo, streetTree };
})();
