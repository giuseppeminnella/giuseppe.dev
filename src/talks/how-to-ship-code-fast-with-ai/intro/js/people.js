/* The people: procedural pixel characters, about 100px tall, drawn from a small skeleton.
   Two views: side (walking, pushing, kicking) and front (standing at the table, sitting).
   Plus the AI recognition box that follows them around. */
window.PEOPLE = (() => {
  const { rect, dot, hline, vline, line, ellipse, disc, mix, shade, tint, text3, text3Width, rng } = PX;

  const CHARS = {
    // Paul: slim, clean-shaven, around 60, grey hair.
    paul: { build: 'slim', skin: '#E7B189', hair: '#A6A39C', hairStyle: 'short', beard: null,
      shirt: '#4C79B2', trousers: '#39404E', shoes: '#2A2A2E', label: 'PAUL', pct: 90, jitter: 5, labelDy: 0 },
    // Utkan: heavier, thick dark hair, light beard, Mortal-Kombat-ish tee.
    utkan: { build: 'chubby', skin: '#D6A172', hair: '#26221F', hairStyle: 'thick', beard: 'light', beardColor: '#332B26',
      shirt: '#1D1D21', print: 'ninja', trousers: '#39495F', shoes: '#26262A', label: 'UTKAN', pct: 99, jitter: 1, labelDy: 10 },
    // Giuseppe: heavier, bald, big pale beard. The AI is sure he is Santa.
    giuseppe: { build: 'chubby', skin: '#E7B189', hair: null, hairStyle: 'bald', beard: 'big', beardColor: '#DEDAD2',
      shirt: '#A8382F', trousers: '#2E3440', shoes: '#241F1C', label: 'SANTA', pct: 94, jitter: 7, labelDy: 20 },
  };

  // Ariel: long hair, leather jacket, and the only one the AI is ever sure about.
  CHARS.ariel = { build: 'slim', skin: '#D9A87C', hair: '#2A211C', hairStyle: 'long', beard: null,
    shirt: '#3C3330', jacket: true, trousers: '#37415C', shoes: '#241F1C', label: 'ARIEL', pct: 100, jitter: 0, labelDy: 0 };

  const OUT = c => shade(c, .45);

  // ---------- limbs ----------
  function limb(g, ax, ay, bx, by, w, col) {
    const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len, h = (w - 1) / 2;
    line(g, ax - nx * (h + 1), ay - ny * (h + 1), bx - nx * (h + 1), by - ny * (h + 1), OUT(col));
    line(g, ax + nx * (h + 1), ay + ny * (h + 1), bx + nx * (h + 1), by + ny * (h + 1), OUT(col));
    for (let i = -h; i <= h; i += .5) line(g, ax + nx * i, ay + ny * i, bx + nx * i, by + ny * i, i < -h + 1 ? tint(col, .12) : col);
  }
  const joint = (x, y, ang, len, dir) => [x + Math.sin(ang) * len * dir, y + Math.cos(ang) * len];

  function leg(g, hx, hy, thigh, knee, dir, tr, shoe, fy) {
    const [kx, ky] = joint(hx, hy, thigh, 22, dir);
    const [ax, ay] = joint(kx, ky, thigh + knee, 22, dir);
    limb(g, hx, hy, kx, ky, 9, tr);
    limb(g, kx, ky, ax, ay, 7, tr);
    rect(g, ax - 4 + (dir < 0 ? -3 : 0), Math.min(ay, fy - 5), 10, 5, shoe);
    rect(g, ax - 4 + (dir < 0 ? -3 : 0), Math.min(ay, fy - 5), 10, 1, tint(shoe, .18));
  }
  function arm(g, sx, sy, sh, el, dir, sleeve, skin, hand) {
    const [ex, ey] = joint(sx, sy, sh, 16, dir);
    const [wx, wy] = joint(ex, ey, sh + el, 15, dir);
    limb(g, sx, sy, ex, ey, 8, sleeve);
    limb(g, ex, ey, wx, wy, 6, skin);
    disc(g, wx, wy, 3, skin);
    dot(g, wx, wy - 2, tint(skin, .2));
    if (hand) hand(wx, wy);
    return [wx, wy];
  }

  // ---------- head ----------
  function headSide(g, cx, cy, ch, dir) {
    const skin = ch.skin, sd = shade(skin, .16);
    ellipse(g, cx, cy, 10, 11, skin);
    ellipse(g, cx + 3 * dir, cy + 1, 7, 9, skin);
    // nose + brow
    rect(g, cx - 10 * dir, cy - 1, 3, 3, skin);
    dot(g, cx - 11 * dir, cy - 1, sd);
    hline(g, cx - 9 * dir, cy - 5, 4, sd);
    // eye
    rect(g, cx - 6 * dir, cy - 4, 2, 2, '#26221F');
    // ear
    disc(g, cx + 5 * dir, cy + 1, 2, sd);
    // beard
    if (ch.beard === 'big') {
      ellipse(g, cx - 3 * dir, cy + 8, 9, 8, ch.beardColor);
      ellipse(g, cx - 6 * dir, cy + 4, 5, 6, ch.beardColor);
      ellipse(g, cx - 4 * dir, cy + 6, 7, 6, tint(ch.beardColor, .25));
      hline(g, cx - 9 * dir, cy + 2, 5, shade(ch.beardColor, .12));
    } else if (ch.beard === 'light') {
      ellipse(g, cx - 3 * dir, cy + 7, 7, 5, ch.beardColor);
      ellipse(g, cx - 4 * dir, cy + 5, 4, 3, ch.beardColor);
    }
    // hair
    if (ch.hairStyle === 'long') {
      ellipse(g, cx + 1 * dir, cy - 8, 10, 6, ch.hair);
      rect(g, cx + (dir > 0 ? 4 : -10) * 1, cy - 9, 7, 26, ch.hair);
      ellipse(g, cx + 7 * dir, cy + 12, 5, 6, ch.hair);
      hline(g, cx - 3 * dir, cy - 13, 7, tint(ch.hair, .22));
    }
    else if (ch.hairStyle === 'short') { ellipse(g, cx + 1 * dir, cy - 8, 9, 5, ch.hair); rect(g, cx + 6 * dir, cy - 8, 4, 6, ch.hair); }
    else if (ch.hairStyle === 'thick') {
      ellipse(g, cx, cy - 8, 11, 7, ch.hair);
      rect(g, cx + 5 * dir, cy - 10, 6, 12, ch.hair);
      ellipse(g, cx - 8 * dir, cy - 7, 4, 4, ch.hair);
      hline(g, cx - 4 * dir, cy - 14, 8, tint(ch.hair, .18));
    } else {
      // bald: a shine on top, hair only around the back
      ellipse(g, cx + 5 * dir, cy - 2, 4, 6, ch.beardColor || '#CFCBC4');
      hline(g, cx - 2 * dir, cy - 10, 6, tint(skin, .3));
    }
  }

  function headFront(g, cx, cy, ch) {
    const skin = ch.skin, sd = shade(skin, .16);
    ellipse(g, cx, cy, 10, 11, skin);
    // eyes + brows
    rect(g, cx - 5, cy - 3, 3, 2, '#26221F'); rect(g, cx + 3, cy - 3, 3, 2, '#26221F');
    hline(g, cx - 6, cy - 6, 4, sd); hline(g, cx + 3, cy - 6, 4, sd);
    rect(g, cx - 1, cy - 1, 2, 3, sd);
    if (ch.beard === 'big') {
      ellipse(g, cx, cy + 9, 11, 9, ch.beardColor);
      ellipse(g, cx, cy + 7, 9, 7, tint(ch.beardColor, .22));
      rect(g, cx - 11, cy - 1, 3, 8, ch.beardColor); rect(g, cx + 9, cy - 1, 3, 8, ch.beardColor);
      rect(g, cx - 3, cy + 4, 6, 2, shade(ch.beardColor, .3));
    } else if (ch.beard === 'light') {
      ellipse(g, cx, cy + 8, 9, 5, ch.beardColor);
      rect(g, cx - 9, cy + 1, 2, 6, ch.beardColor); rect(g, cx + 8, cy + 1, 2, 6, ch.beardColor);
      rect(g, cx - 3, cy + 4, 6, 1, shade(ch.beardColor, .2));
    } else {
      hline(g, cx - 3, cy + 6, 7, sd);
    }
    if (ch.hairStyle === 'long') {
      ellipse(g, cx, cy - 8, 11, 6, ch.hair);
      rect(g, cx - 12, cy - 8, 4, 26, ch.hair); rect(g, cx + 8, cy - 8, 4, 26, ch.hair);
      ellipse(g, cx - 10, cy + 17, 4, 5, ch.hair); ellipse(g, cx + 10, cy + 17, 4, 5, ch.hair);
      hline(g, cx - 5, cy - 13, 10, tint(ch.hair, .22));
    }
    else if (ch.hairStyle === 'short') { ellipse(g, cx, cy - 8, 10, 5, ch.hair); rect(g, cx - 10, cy - 7, 3, 5, ch.hair); rect(g, cx + 8, cy - 7, 3, 5, ch.hair); }
    else if (ch.hairStyle === 'thick') {
      ellipse(g, cx, cy - 8, 12, 7, ch.hair);
      rect(g, cx - 12, cy - 9, 3, 9, ch.hair); rect(g, cx + 10, cy - 9, 3, 9, ch.hair);
      hline(g, cx - 5, cy - 14, 10, tint(ch.hair, .2));
    } else {
      ellipse(g, cx, cy - 7, 10, 5, skin);
      hline(g, cx - 4, cy - 11, 7, tint(skin, .3));
      rect(g, cx - 11, cy - 4, 3, 6, ch.beardColor || '#CFCBC4'); rect(g, cx + 9, cy - 4, 3, 6, ch.beardColor || '#CFCBC4');
    }
  }

  // Mortal-Kombat-ish print: a yellow masked face on the chest.
  function printNinja(g, cx, cy) {
    disc(g, cx, cy, 6, '#E9C33A');
    rect(g, cx - 5, cy - 1, 11, 4, '#1A1A1E');
    rect(g, cx - 4, cy, 3, 2, '#FFFFFF'); rect(g, cx + 2, cy, 3, 2, '#FFFFFF');
    hline(g, cx - 4, cy - 4, 9, '#F6DE86');
  }

  // ---------- the character ----------
  // pose: { name: 'walk'|'stand'|'push'|'kick'|'front'|'sit', phase, k, cup, cig }
  function draw(g, cx, fy, key, pose, dir = -1) {
    const ch = CHARS[key];
    const chubby = ch.build === 'chubby';
    const tw = chubby ? 15 : 12;                 // half torso width
    const hip = fy - 46, sho = fy - 76, headC = fy - 90;
    const shirtD = shade(ch.shirt, .28), skinD = shade(ch.skin, .22), trD = shade(ch.trousers, .25);

    if (pose.name === 'sit' || pose.name === 'front') {
      const seated = pose.name === 'sit';
      const hipY = seated ? fy - 2 : hip, shoY = seated ? fy - 36 : sho, hd = seated ? fy - 50 : headC;
      if (seated) {                               // thighs going forward under the table
        limb(g, cx - 7, hipY, cx - 9, hipY + 12, 10, ch.trousers);
        limb(g, cx + 7, hipY, cx + 9, hipY + 12, 10, ch.trousers);
      } else {
        leg(g, cx - 6, hipY, .06, 0, 1, ch.trousers, ch.shoes, fy);
        leg(g, cx + 6, hipY, -.06, 0, 1, ch.trousers, ch.shoes, fy);
      }
      // torso
      rect(g, cx - tw, shoY, tw * 2, hipY - shoY + 4, ch.shirt);
      ellipse(g, cx, shoY + 2, tw, 6, ch.shirt);
      if (chubby) ellipse(g, cx, hipY - 6, tw + 1, 9, ch.shirt);
      vline(g, cx - tw, shoY, hipY - shoY + 4, tint(ch.shirt, .14));
      vline(g, cx + tw - 1, shoY, hipY - shoY + 4, shirtD);
      if (ch.print) printNinja(g, cx, shoY + 14);
      if (ch.jacket) {
        const hi = tint(ch.shirt, .22), lo = shade(ch.shirt, .3);
        vline(g, cx, shoY + 4, hipY - shoY, hi);
        rect(g, cx - 7, shoY + 1, 5, 7, hi); rect(g, cx + 3, shoY + 1, 5, 7, hi);
        rect(g, cx - 2, shoY + 2, 4, 4, shade(ch.skin, .1));
        hline(g, cx - tw, hipY, tw * 2, lo); hline(g, cx - tw, hipY + 1, tw * 2, hi);
        rect(g, cx - tw + 1, shoY + 10, 3, 5, lo); rect(g, cx + tw - 4, shoY + 10, 3, 5, lo);
      }
      rect(g, cx - 4, shoY - 4, 8, 6, ch.skin);
      // arms forward onto the table
      const reach = seated ? 14 : 4, drop = seated ? 10 : 22;
      [-1, 1].forEach(s => {
        const sx = cx + s * (tw - 1), ex = cx + s * (tw + 3), ey = shoY + drop;
        limb(g, sx, shoY + 3, ex, ey, 8, ch.shirt);
        const wx = ex + s * 2, wy = ey + reach;
        limb(g, ex, ey, wx, wy, 6, ch.skin);
        disc(g, wx, wy, 3, ch.skin);
        if (s < 0 && pose.cig) cigarette(g, wx - 2, wy - 2, -1);
      });
      headFront(g, cx, hd, ch);
      return;
    }

    // ---- side view ----
    const p = pose.phase || 0, k = pose.k || 0;
    let t1 = 0, t2 = 0, k1 = 0, k2 = 0, a1 = .22, a2 = -.22, lean = 0, bob = 0;
    if (pose.name === 'walk') {
      const s = Math.sin(p * Math.PI * 2);
      t1 = s * .45; t2 = -s * .45;
      k1 = Math.max(0, -s) * .55; k2 = Math.max(0, s) * .55;
      a1 = -s * .55; a2 = s * .55;
      bob = Math.abs(Math.cos(p * Math.PI * 2)) > .7 ? 0 : -1;
    } else if (pose.name === 'push') { a1 = -1.5; a2 = -1.35; lean = .06; }
    else if (pose.name === 'kick') { t1 = -1.35 * k; k1 = .1 * k; t2 = .2 * k; a1 = .9 * k; a2 = 1.2 * k; lean = .22 * k; }

    const hy = hip + bob, sy = sho + bob, hc = headC + bob;
    const lx = cx + Math.sin(lean) * 14 * dir;
    // far leg and arm first
    leg(g, cx, hy, t2, k2, dir, shade(ch.trousers, .2), shade(ch.shoes, .18), fy);
    arm(g, lx, sy + 3, a2, pose.name === 'push' ? .1 : .35, dir, shade(ch.shirt, .3), shade(ch.skin, .25));
    // torso
    const topX = lx - tw / 2;
    rect(g, topX, sy, tw + 2, hy - sy + 4, ch.shirt);
    ellipse(g, lx, sy + 3, (tw + 2) / 2 + 2, 7, ch.shirt);
    if (chubby) ellipse(g, lx - 2 * dir, hy - 8, tw / 2 + 4, 10, ch.shirt);
    vline(g, topX, sy, hy - sy + 4, tint(ch.shirt, .12));
    vline(g, topX + tw + 1, sy, hy - sy + 4, shirtD);
    rect(g, lx - 3, sy - 5, 6, 6, ch.skin);
    if (ch.jacket) {
      const hi = tint(ch.shirt, .22), lo = shade(ch.shirt, .3);
      vline(g, lx - (tw / 2 - 1) * dir, sy + 2, hy - sy, hi);
      rect(g, lx - 4 * dir, sy - 1, 6, 6, hi);
      hline(g, topX, hy + 2, tw + 2, lo); hline(g, topX, hy + 3, tw + 2, hi);
    }
    headSide(g, lx + 1 * dir, hc, ch, dir);
    // near arm (and whatever it holds)
    arm(g, lx, sy + 3, a1, pose.name === 'push' ? .1 : .3, dir, ch.shirt, ch.skin, (wx, wy) => {
      if (pose.cup) espresso(g, wx - 3, wy - 5);
      if (pose.cig) cigarette(g, wx, wy - 3, dir);
    });
    // near leg
    leg(g, cx, hy, t1, k1, dir, ch.trousers, ch.shoes, fy);
  }

  // ---------- props ----------
  function espresso(g, x, y) {
    rect(g, x, y + 5, 8, 1, '#D9D5CC');
    rect(g, x + 1, y, 6, 5, '#F6F4EE');
    rect(g, x + 1, y, 6, 1, '#6B4A33');
    dot(g, x + 7, y + 2, '#D9D5CC');
  }
  function cigarette(g, x, y, dir) {
    rect(g, x, y, 4 * -dir > 0 ? 4 : 4, 1, '#F2F0E8');
    dot(g, x + (dir < 0 ? -1 : 4), y, '#E0782E');
  }
  // rising smoke, drawn from a point (deterministic in t)
  function smoke(g, x, y, t, seed = 0, h = 40) {
    for (let i = 0; i < 9; i++) {
      const k = ((t * .5 + i / 9 + seed) % 1);
      const sx = x + Math.sin(k * 6 + seed * 3 + t) * 3 + k * 4, sy = y - k * h;
      if (k > .85 && (i & 1)) continue;
      g.globalAlpha = 1 - k * .85;
      rect(g, sx, sy, k > .4 ? 2 : 1, k > .6 ? 2 : 1, '#F4F4F0');
      g.globalAlpha = 1;
    }
  }

  // ---------- the AI recognition box ----------
  function aiBox(g, x, y, w, h, ch, moving, t) {
    const col = '#3BE86A', dim = '#1C7A38';
    const L = 5;
    [[x, y, 1, 1], [x + w - 1, y, -1, 1], [x, y + h - 1, 1, -1], [x + w - 1, y + h - 1, -1, -1]].forEach(([bx, by, sx, sy]) => {
      rect(g, sx > 0 ? bx : bx - L + 1, by, L, 1, col);
      rect(g, bx, sy > 0 ? by : by - L + 1, 1, L, col);
    });
    for (let i = 0; i < w; i += 4) { dot(g, x + i, y, dim); dot(g, x + i, y + h - 1, dim); }
    for (let j = 0; j < h; j += 4) { dot(g, x, y + j, dim); dot(g, x + w - 1, y + j, dim); }
    const jit = moving ? Math.round(Math.sin(t * 9.3 + ch.pct) * ch.jitter * .6 + Math.sin(t * 23.7) * ch.jitter * .4) : Math.round(Math.sin(t * 1.7) * .5);
    const pct = Math.max(11, Math.min(100, ch.pct + jit));
    const txt = `${ch.label} ${pct}%`, tw = text3Width(txt);
    const ly = y - 10 - (ch.labelDy || 0);
    if (ch.labelDy) { for (let j = ly + 9; j < y; j += 2) dot(g, x + 2, j, dim); }
    rect(g, x, ly, tw + 6, 9, '#0C2A16');
    hline(g, x, ly, tw + 6, col);
    text3(g, txt, x + 3, ly + 3, col);
  }
  const boxFor = (a) => a.pose === 'sit'
    ? { x: Math.round(a.x - 22), y: Math.round(a.y - 62), w: 44, h: 68 }
    : { x: Math.round(a.x - 20), y: Math.round(a.y - 104), w: 40, h: 106 };

  // A character on its own transparent canvas (feet at the bottom), for slicing.
  function toCanvas(key, pose, dir = -1, w = 80, h = 120) {
    const [c, g] = PX.canvas(w, h);
    draw(g, w / 2, h - 4, key, pose, dir);
    return c;
  }

  return { CHARS, draw, aiBox, boxFor, espresso, smoke, cigarette, toCanvas };
})();
