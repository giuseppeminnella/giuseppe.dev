/* Low-level pixel helpers. Everything is drawn at native resolution (480x270) on the
   pixel grid, then the canvas is scaled up 4x with nearest-neighbour. */
window.PX = (() => {
  const W = 480, H = 270;
  const R = Math.round;

  // Seeded RNG (mulberry32): same seed, same art, every reload.
  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function canvas(w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const g = c.getContext('2d');
    g.imageSmoothingEnabled = false;
    return [c, g];
  }

  // ---------- colour ----------
  const hex = c => [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16));
  const toHex = a => '#' + a.map(v => Math.max(0, Math.min(255, R(v))).toString(16).padStart(2, '0')).join('');
  const mix = (a, b, t) => { const A = hex(a), B = hex(b); return toHex(A.map((v, i) => v + (B[i] - v) * t)); };
  const shade = (c, t) => mix(c, '#000000', t);
  const tint = (c, t) => mix(c, '#ffffff', t);

  // ---------- primitives ----------
  function rect(g, x, y, w, h, c) {
    w = R(w); h = R(h);
    if (w <= 0 || h <= 0) return;
    g.fillStyle = c; g.fillRect(R(x), R(y), w, h);
  }
  const dot = (g, x, y, c) => { g.fillStyle = c; g.fillRect(R(x), R(y), 1, 1); };
  const hline = (g, x, y, w, c) => rect(g, x, y, w, 1, c);
  const vline = (g, x, y, h, c) => rect(g, x, y, 1, h, c);

  // 50% checkerboard of colour c over a rect (the classic 16-bit dither).
  function checker(g, x, y, w, h, c, phase = 0) {
    g.fillStyle = c;
    x = R(x); y = R(y);
    for (let j = 0; j < h; j++) for (let i = (j + phase) & 1; i < w; i += 2) g.fillRect(x + i, y + j, 1, 1);
  }
  // 25% dither (one pixel in four).
  function sparse(g, x, y, w, h, c, phase = 0) {
    g.fillStyle = c;
    x = R(x); y = R(y);
    for (let j = (phase & 1); j < h; j += 2) for (let i = ((j >> 1) + phase) & 1; i < w; i += 2) g.fillRect(x + i, y + j, 1, 1);
  }

  // Filled pixel disc / ellipse, scanline by scanline.
  function ellipse(g, cx, cy, rx, ry, c) {
    g.fillStyle = c;
    for (let y = -ry; y <= ry; y++) {
      const k = 1 - (y * y) / ((ry + 0.35) * (ry + 0.35));
      if (k < 0) continue;
      const w = Math.floor(rx * Math.sqrt(k) + 0.35);
      g.fillRect(R(cx - w), R(cy + y), w * 2 + 1, 1);
    }
  }
  const disc = (g, cx, cy, r, c) => ellipse(g, cx, cy, r, r, c);

  function line(g, x0, y0, x1, y1, c) {
    x0 = R(x0); y0 = R(y0); x1 = R(x1); y1 = R(y1);
    g.fillStyle = c;
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let err = dx + dy;
    for (;;) {
      g.fillRect(x0, y0, 1, 1);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * err;
      if (e2 >= dy) { err += dy; x0 += sx; }
      if (e2 <= dx) { err += dx; y0 += sy; }
    }
  }

  // Sprite from ASCII rows + palette ('.' = transparent). Returns a canvas.
  function sprite(rows, pal) {
    const [c, g] = canvas(rows[0].length, rows.length);
    rows.forEach((row, y) => [...row].forEach((ch, x) => { if (ch !== '.' && pal[ch]) dot(g, x, y, pal[ch]); }));
    return c;
  }
  function flipX(src) {
    const [c, g] = canvas(src.width, src.height);
    g.translate(src.width, 0); g.scale(-1, 1); g.drawImage(src, 0, 0);
    return c;
  }

  // ---------- 3x5 pixel font for signs painted into the world ----------
  const F = {
    A: '010101111101101', B: '110101110101110', C: '011100100100011', D: '110101101101110', E: '111100110100111',
    F: '111100110100100', G: '011100101101011', H: '101101111101101', I: '111010010010111', J: '001001001101010',
    K: '101101110101101', L: '100100100100111', M: '101111111101101', N: '110101101101101', O: '010101101101010',
    P: '110101110100100', Q: '010101101110011', R: '110101110101101', S: '011100010001110', T: '111010010010010',
    U: '101101101101111', V: '101101101101010', W: '101101111111101', X: '101101010101101', Y: '101101010010010',
    Z: '111001010100111', 0: '111101101101111', 1: '010110010010111', 2: '111001111100111', 3: '111001111001111',
    4: '101101111001001', 5: '111100111001111', 6: '111100111101111', 7: '111001010010010', 8: '111101111101111',
    9: '111101111001111', '.': '000000000000010', '-': '000000111000000', ':': '000010000010000', ' ': '000000000000000',
    "'": '010010000000000', '·': '000000010000000', '/': '001001010100100',
    '{': '011010110010011', '}': '110010011010110', '[': '011010010010011', ']': '110010010010110',
    '<': '001010100010001', '>': '100010001010100', '+': '000010111010000', '=': '000111000111000',
    ';': '000010000010100', '#': '101111101111101', '"': '101101000000000', '|': '010010010010010',
    '&': '010101010101011', '^': '010101000000000', '\\': '100100010001001',
    '*': '101010101000000', '_': '000000000000111', '%': '101001010100101', '?': '110001010000010', '!': '010010010000010', ',': '000000000010100', '(': '001010010010001', ')': '100010010010100',
  };
  function text3(g, str, x, y, c, spacing = 1) {
    g.fillStyle = c;
    let cx = R(x);
    for (const ch of String(str).toUpperCase()) {
      const bits = F[ch] || F[' '];
      for (let i = 0; i < 15; i++) if (bits[i] === '1') g.fillRect(cx + (i % 3), R(y) + Math.floor(i / 3), 1, 1);
      cx += 3 + spacing;
    }
    return cx - R(x) - spacing;
  }
  const text3Width = (str, spacing = 1) => String(str).length * (3 + spacing) - spacing;

  // ---------- easing ----------
  const ease = {
    linear: t => t,
    inOut: t => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
    out: t => 1 - Math.pow(1 - t, 3),
    in: t => t * t * t,
    sine: t => -(Math.cos(Math.PI * t) - 1) / 2,
  };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // Camera keyframes: [time, x, y, easing into this key]. Used by the player and by
  // scene 10, which replays the other shots inside a monitor.
  function camAt(keys, t) {
    if (t <= keys[0][0]) return { x: keys[0][1], y: keys[0][2] };
    for (let k = 1; k < keys.length; k++) {
      const [t0, x0, y0] = keys[k - 1], [t1, x1, y1, e] = keys[k];
      if (t <= t1) {
        const f = (ease[e] || ease.linear)((t - t0) / (t1 - t0));
        return { x: x0 + (x1 - x0) * f, y: y0 + (y1 - y0) * f };
      }
    }
    const last = keys[keys.length - 1];
    return { x: last[1], y: last[2] };
  }

  return { W, H, rng, canvas, mix, shade, tint, rect, dot, hline, vline, checker, sparse, ellipse, disc, line,
    sprite, flipX, text3, text3Width, ease, clamp, camAt };
})();
