/* The intro's four shots. Each shot pre-renders its static layers once (init) and draws
   moving things every frame (render). All motion is a pure function of time t, so the
   timeline can be scrubbed. cam = {x, y} is the camera's top-left in world pixels. */
window.SHOTS = (() => {
  const { W, H, rng, canvas, mix, shade, tint, rect, dot, hline, vline, checker, ellipse, disc, line, text3, text3Width, flipX } = PX;
  const A = ART, P = ART.PAL;

  const blit = (g, c, x, y) => g.drawImage(c, Math.round(x), Math.round(y));
  const wrap = (v, lo, hi) => lo + ((((v - lo) % (hi - lo)) + (hi - lo)) % (hi - lo));

  // A row of generic Berlin buildings seen from above (roofs on top, facades below).
  function cityBand(g, y, o) {
    const r = rng(o.seed);
    const walls = ['#EDE3CC', '#E7D3A6', '#E3C088', '#F1EEE6', '#D8D2C6', '#CFA27F', '#EAE6DD', '#C9B79A', '#E9E4DA'];
    const tiles = ['#A5503C', '#93463A', '#B0624A', '#80808A'];
    let x = -Math.floor(r() * 10);
    while (x < W) {
      const bw = o.w[0] + Math.floor(r() * (o.w[1] - o.w[0]));
      if (r() < (o.trees || .12)) {
        const tr = Math.max(3, Math.round(o.rd[1] * .9));
        A.treeTop(g, x + tr, y + tr, tr, Math.floor(r() * 1e6));
        x += tr * 2 + 1;
        continue;
      }
      const rd = o.rd[0] + Math.floor(r() * (o.rd[1] - o.rd[0] + 1)), fh = o.fh[0] + Math.floor(r() * (o.fh[1] - o.fh[0] + 1));
      const kind = r();
      const seed = Math.floor(r() * 1e6);
      if (kind < .42) A.roofPitched(g, x, y, bw, rd, { haze: o.haze, seed, color: tiles[Math.floor(r() * tiles.length)] });
      else A.roofFlat(g, x, y, bw, rd, { haze: o.haze, seed, color: kind < .52 ? '#7C9B57' : '#A39E94', units: Math.floor(bw / 12) });
      const wall = walls[Math.floor(r() * walls.length)];
      A.facade(g, x, y + rd, bw, fh, { haze: o.haze, seed, wall, style: kind < .42 ? 'altbau' : (r() < .5 ? 'grid' : 'balcony'),
        floorH: o.floorH || 5, winW: o.winW || 2, winH: o.winH || 2, gap: o.gap || 3 });
      x += bw + (r() < .3 ? 1 : 0);
    }
  }
  function streetBand(g, y, h, o) {
    const r = rng(o.seed);
    rect(g, 0, y, W, h, mix(P.asphalt, P.haze, o.haze));
    hline(g, 0, y, W, mix(P.walk, P.haze, o.haze));
    hline(g, 0, y + h - 1, W, mix(P.walk, P.haze, o.haze));
    for (let x = 0; x < W; x += 6 + Math.floor(r() * 18)) {
      const c = mix(A.CAR_COLORS[Math.floor(r() * A.CAR_COLORS.length)], P.haze, o.haze);
      rect(g, x, y + 1 + Math.floor(r() * (h - 3)), o.car || 3, 2, c);
    }
  }
  function groundFill(g, y, h, base, seed, haze) {
    rect(g, 0, y, W, h, base);
    const r = rng(seed);
    for (let yy = y; yy < y + h; yy += 5 + Math.floor(r() * 5)) {
      hline(g, 0, yy, W, mix(shade(base, .08), P.haze, haze * .5));
      for (let i = 0; i < 20; i++) rect(g, r() * W, yy + 1, 3 + r() * 10, 2, mix(tint(base, .1), P.haze, haze * .5));
    }
  }

  // ======================= SHOT 1: from the sky down to the BTC block =======================
  const shot1 = (() => {
    const YEND = 760;
    const L = {};
    const clouds = [
      { seed: 11, w: 76, x: 36, y: 34, v: 2.2 }, { seed: 12, w: 50, x: 226, y: 92, v: 3.1 },
      { seed: 13, w: 96, x: 318, y: 150, v: 1.7 }, { seed: 14, w: 58, x: 120, y: 190, v: 2.6 },
      { seed: 15, w: 40, x: 420, y: 60, v: 3.4 },
    ];
    // layer: canvas top y at the end of the move, and parallax factor
    const layers = [
      { k: 'sky', yEnd: -190, f: .15 },
      { k: 'clouds', f: .3 },
      { k: 'skyline', yEnd: -70 - 100, f: .55 },
      { k: 'far', yEnd: -60, f: .65 },
      { k: 'mid', yEnd: -40, f: .82 },
      { k: 'block', yEnd: 0, f: 1 },
    ];
    const layerY = (l, camY) => l.yEnd + (YEND - camY) * l.f;

    function drawBlock(g) {
      const r = rng(77);
      rect(g, 0, 0, W, H, '#8F8A82');
      A.speckle(g, 0, 0, W, 170, ['#9C978E', '#837E77'], .06, 3);

      // --- back row ---
      A.roofFlat(g, 0, 0, 58, 12, { color: '#8F8C86', units: 2, seed: 21 });
      A.facade(g, 0, 12, 58, 52, { style: 'brick', wall: '#B65B4B', floorH: 6, winW: 2, seed: 22 });
      [[70, 26, 12], [93, 18, 11], [84, 48, 13], [106, 40, 10], [64, 60, 10]].forEach(([x, y, rr], i) => { A.shadow(g, x + 4, y + 4, rr, rr * .8); A.treeTop(g, x, y, rr, 30 + i); });
      A.roofFlat(g, 112, 4, 62, 14, { color: '#7FA05A', seed: 23 });
      A.speckle(g, 112, 4, 62, 14, ['#95B96A', '#6B8C48'], .25, 24);
      A.facade(g, 112, 18, 62, 32, { style: 'grid', wall: '#E2AE52', floorH: 6, winW: 2, winH: 3, gap: 3, seed: 25 });
      // the long rear wing of the white building, roof full of machines
      A.roofFlat(g, 176, 0, 80, 60, { color: '#A7A298', units: 7, seed: 26 });
      for (let i = 0; i < 6; i++) rect(g, 190 + i * 9, 12 + i * 7, 7, 4, '#C4C7CC');
      // Deutsche Bank tower
      A.roofFlat(g, 262, 14, 118, 16, { color: '#5F6268', units: 4, seed: 27 });
      rect(g, 262, 30, 118, 8, '#EDE8DC');
      hline(g, 262, 37, 118, '#C9C2B2');
      text3(g, 'DEUTSCHE BANK', 290, 31, P.dbBlue);
      A.dbLogo(g, 346, 31, 6);
      A.facade(g, 262, 38, 118, 102, { style: 'bands', wall: '#ECE6D6', floorH: 6, seed: 28 });
      // right side: white apartments + trees
      A.roofFlat(g, 386, 6, 94, 12, { color: '#9D9A94', units: 2, seed: 29 });
      A.facade(g, 386, 18, 94, 58, { style: 'balcony', wall: '#F2F1ED', floorH: 7, seed: 30 });
      [[394, 86, 10], [414, 92, 11], [470, 84, 9]].forEach(([x, y, rr], i) => { A.shadow(g, x + 4, y + 4, rr, rr * .8); A.treeTop(g, x, y, rr, 40 + i); });

      // --- street-front row ---
      A.roofFlat(g, 0, 62, 42, 14, { color: '#98948D', units: 1, seed: 31 });
      A.facade(g, 0, 76, 42, 72, { style: 'balcony', wall: '#EEECE6', floorH: 8, seed: 32 });
      A.roofPitched(g, 42, 70, 70, 20, { color: '#A5503C', seed: 33 });
      A.facade(g, 42, 90, 70, 56, { style: 'altbau', wall: '#E8D6AA', floorH: 9, winW: 3, winH: 5, gap: 4, seed: 34 });
      rect(g, 42, 146, 70, 8, '#5E9A3E');
      [[50, 149, 4], [66, 150, 5], [86, 149, 4], [102, 150, 4]].forEach(([x, y, rr], i) => A.treeTop(g, x, y, rr, 50 + i));
      // the white building (BTC side): roof + front facade on Otto-Suhr-Allee
      A.roofFlat(g, 112, 58, 112, 34, { color: '#A7A298', units: 5, seed: 35 });
      A.facade(g, 112, 92, 112, 76, { style: 'grid', wall: P.white, floorH: 9, winW: 4, winH: 6, gap: 3, groundH: 9, seed: 36 });
      rect(g, 112, 92, 112, 5, '#7F97A8'); hline(g, 112, 92, 112, '#5E7688');
      // the plaza between the white building and the tower
      rect(g, 224, 60, 38, 112, '#D7D3CA');
      for (let y = 62; y < 172; y += 6) hline(g, 224, y, 38, '#C7C3BA');
      for (let x = 226; x < 262; x += 6) vline(g, x, 60, 112, '#C7C3BA');
      line(g, 232, 132, 240, 128, '#C8424E'); line(g, 240, 128, 248, 132, '#C8424E'); line(g, 232, 132, 240, 136, '#C8424E'); line(g, 240, 136, 248, 132, '#C8424E');
      line(g, 232, 132, 232, 124, '#C8424E'); line(g, 240, 128, 240, 120, '#E0707A'); line(g, 248, 132, 248, 124, '#C8424E'); line(g, 240, 136, 240, 128, '#8E2835');
      line(g, 232, 124, 240, 120, '#E0707A'); line(g, 240, 120, 248, 124, '#E0707A');
      rect(g, 228, 104, 5, 3, '#C8424E'); rect(g, 250, 150, 5, 3, '#C8424E');
      [[256, 94, 9], [252, 116, 10], [258, 140, 9]].forEach(([x, y, rr], i) => { A.shadow(g, x + 5, y + 4, rr, rr * .8); A.treeTop(g, x, y, rr, 60 + i); });
      // tower podium + entrance canopy
      A.roofFlat(g, 262, 140, 118, 12, { color: '#9E8467', seed: 37 });
      A.facade(g, 262, 152, 118, 16, { style: 'bands', wall: '#E8E1CF', floorH: 6, seed: 38 });
      rect(g, 298, 144, 22, 12, '#3B3F46');
      for (let x = 300; x < 320; x += 4) vline(g, x, 144, 12, '#6A7078');
      hline(g, 298, 150, 22, '#6A7078');
      // right: a grey block with red bands
      A.roofFlat(g, 426, 70, 54, 12, { color: '#8C8B88', units: 2, seed: 39 });
      A.facade(g, 426, 82, 54, 86, { style: 'bands', wall: '#B9BDC2', floorH: 7, seed: 40 });
      for (let y = 86; y < 166; y += 7) hline(g, 426, y, 54, '#B2463D');
      rect(g, 380, 100, 46, 68, '#7A7B7F');
      for (let x = 382; x < 426; x += 7) vline(g, x, 102, 10, '#E6E6E2');
      [[384, 104], [398, 104], [412, 116]].forEach(([x, y], i) => A.carTop(g, x, y, 6, 11, A.CAR_COLORS[i + 2], 1));

      // --- Otto-Suhr-Allee ---
      rect(g, 0, 166, W, 16, P.walk);
      A.speckle(g, 0, 166, W, 16, [P.walkDark, '#D3CEC4'], .06, 41);
      rect(g, 0, 178, W, 4, '#B1ACA2');
      // café chairs in front of Dave B.
      for (let i = 0; i < 9; i++) dot(g, 194 + i * 3, 168 + (i % 2) * 3, ['#E0493A', '#F2C230', '#2BA6A0'][i % 3]);
      rect(g, 196, 170, 7, 2, '#6E4A33'); rect(g, 208, 170, 7, 2, '#6E4A33');
      rect(g, 0, 182, W, 3, P.bike);
      hline(g, 0, 185, W, P.curb);
      A.road(g, 0, 186, W, 30, 42, 205);
      // parked cars along the kerb
      let x = 2;
      while (x < W - 16) {
        if (x > 222 && x < 262) { x += 6; continue; }
        const len = 15 + Math.floor(r() * 4);
        const col = A.CAR_COLORS[Math.floor(r() * A.CAR_COLORS.length)];
        (r() < .15 ? A.vanTop : A.carTop)(g, x, 187, len, 8, col, r() < .5 ? 1 : -1);
        x += len + 2 + Math.floor(r() * 6);
      }
      // the median: parking + grass
      rect(g, 0, 216, W, 20, '#6F7076');
      hline(g, 0, 216, W, P.curb); hline(g, 0, 235, W, P.curb);
      rect(g, 0, 217, 34, 18, P.grass[1]); A.speckle(g, 0, 217, 34, 18, P.grass, .4, 43);
      rect(g, 280, 217, 26, 18, P.grass[1]); A.speckle(g, 280, 217, 26, 18, P.grass, .4, 44);
      for (let px = 38; px < W - 8; px += 10) {
        if (px > 272 && px < 310) continue;
        vline(g, px - 1, 218, 16, '#D9D9D4');
        if (r() < .62) A.carTopV(g, px + 1, 219, 7, 14, A.CAR_COLORS[Math.floor(r() * A.CAR_COLORS.length)]);
      }
      A.road(g, 0, 236, W, 20, 45, 246);
      rect(g, 0, 256, W, 14, P.walk);
      A.speckle(g, 0, 256, W, 14, [P.walkDark], .1, 46);
      A.roofFlat(g, 8, 248, 60, 22, { color: '#9A978F', units: 3, seed: 47 });
      // street trees on both sidewalks (shadows first)
      const trees = [[16, 172, 11], [66, 170, 12], [120, 173, 10], [176, 171, 11], [292, 172, 11], [348, 170, 12], [404, 172, 11], [458, 171, 12]];
      trees.forEach(([tx, ty, rr]) => A.shadow(g, tx + 7, ty + 6, rr + 1, rr * .7, .32));
      trees.forEach(([tx, ty, rr], i) => A.treeTop(g, tx, ty, rr, 70 + i));
      [[96, 266, 12], [210, 268, 13], [330, 266, 12], [440, 268, 13]].forEach(([tx, ty, rr], i) => A.treeTop(g, tx, ty, rr, 90 + i));
    }

    function init() {
      let c, g;
      [c, g] = canvas(W, 460); A.skyGradient(g, W, 460); A.sun(g, 388, 108); L.sky = c;
      L.clouds = clouds.map(cl => A.cloud(cl.seed, cl.w));
      [c, g] = canvas(W, 480);
      A.cityCarpet(g, 0, 100, W, 380, 55);
      A.skyline(g, W, 100, 5);
      checker(g, 0, 98, W, 2, '#C5DBF2');
      L.skyline = c;
      [c, g] = canvas(W, 420);
      groundFill(g, 0, 420, mix('#A79F93', P.haze, .45), 6, .45);
      cityBand(g, 0, { seed: 101, w: [8, 20], rd: [2, 3], fh: [4, 6], haze: .52, floorH: 3, gap: 3 });
      cityBand(g, 12, { seed: 102, w: [10, 24], rd: [3, 4], fh: [5, 7], haze: .47, floorH: 3 });
      streetBand(g, 26, 5, { seed: 103, haze: .45, car: 2 });
      cityBand(g, 31, { seed: 104, w: [12, 28], rd: [3, 5], fh: [6, 9], haze: .42, floorH: 4 });
      cityBand(g, 48, { seed: 105, w: [14, 32], rd: [4, 6], fh: [7, 10], haze: .37, floorH: 4 });
      streetBand(g, 66, 6, { seed: 106, haze: .35, car: 3 });
      cityBand(g, 72, { seed: 107, w: [16, 36], rd: [4, 6], fh: [9, 12], haze: .32, floorH: 5 });
      L.far = c;
      [c, g] = canvas(W, 400);
      groundFill(g, 0, 400, mix('#9D958A', P.haze, .2), 8, .2);
      cityBand(g, 0, { seed: 201, w: [22, 44], rd: [5, 8], fh: [12, 16], haze: .24, floorH: 6, winW: 2, winH: 3 });
      streetBand(g, 30, 9, { seed: 202, haze: .2, car: 4 });
      cityBand(g, 39, { seed: 203, w: [26, 52], rd: [6, 9], fh: [14, 20], haze: .17, floorH: 7, winW: 3, winH: 4, trees: .2 });
      streetBand(g, 74, 10, { seed: 204, haze: .12, car: 5 });
      cityBand(g, 84, { seed: 205, w: [30, 58], rd: [7, 10], fh: [18, 24], haze: .1, floorH: 7, winW: 3, winH: 4, trees: .22 });
      L.mid = c;
      [c, g] = canvas(W, H); drawBlock(g); L.block = c;
    }

    const movers = [
      { y: 195, len: 16, v: -26, x: 420, c: '#F2F2EF' }, { y: 206, len: 17, v: -21, x: 120, c: '#C8342F' },
      { y: 238, len: 16, v: 24, x: 60, c: '#2A2C31' }, { y: 247, len: 18, v: 30, x: 300, c: '#3B5FB5', van: true },
    ];
    const walkers = [{ x: 30, y: 168, v: 6, c: 0 }, { x: 150, y: 174, v: -5, c: 1 }, { x: 330, y: 170, v: 7, c: 2 }, { x: 250, y: 120, v: 4, c: 3 }];

    function render(g, cam, t) {
      layers.forEach(l => {
        if (l.k === 'clouds') {
          clouds.forEach((cl, i) => {
            const x = wrap(cl.x + cl.v * t, -cl.w - 10, W + 10), y = cl.y - cam.y * l.f;
            if (y > -80 && y < H) blit(g, L.clouds[i], x, y);
          });
          return;
        }
        const y = layerY(l, cam.y);
        if (y < H && y + L[l.k].height > 0) blit(g, L[l.k], 0, y);
        if (l.k === 'block' && y < H) {
          movers.forEach(m => {
            const x = wrap(m.x + m.v * t, -30, W + 30);
            (m.van ? A.vanTop : A.carTop)(g, x, y + m.y, m.len, 8, m.c, m.v > 0 ? 1 : -1);
          });
          walkers.forEach(w => A.person(g, wrap(w.x + w.v * t, 0, W), y + w.y, A.PEOPLE[w.c], Math.floor(t * 4) % 2));
        }
      });
    }
    return { id: 'sky', init, render };
  })();

  // ======================= SHOT 2: closer aerial, the corner and the plaza =======================
  const shot2 = (() => {
    const WH = 310;
    let bg;
    function draw(g) {
      const r = rng(303);
      rect(g, 0, 0, W, WH, '#8F8A82');
      // left Altbau
      A.facade(g, 0, 26, 28, 146, { style: 'altbau', wall: '#E8D6AA', floorH: 17, winW: 6, winH: 10, gap: 6, seed: 1 });
      rect(g, 0, 0, 28, 26, '#A5503C'); for (let y = 1; y < 26; y += 2) hline(g, 0, y, 28, '#8E4535');
      // white building: roof with the fan unit
      A.roofFlat(g, 28, 0, 206, 44, { color: '#A9A399', units: 5, seed: 2 });
      rect(g, 148, 8, 60, 30, '#C9CCD1'); rect(g, 148, 38, 60, 2, '#7C8087'); hline(g, 148, 8, 60, '#E8EAEC');
      for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) { disc(g, 156 + i * 14, 16 + j * 14, 5, '#5A5E66'); disc(g, 156 + i * 14, 16 + j * 14, 3, '#8A8F97'); dot(g, 156 + i * 14, 16 + j * 14, '#3E4148'); }
      // facade: attic band, five floors, ground floor
      rect(g, 28, 44, 206, 128, P.white);
      rect(g, 28, 44, 206, 10, '#6F8799'); hline(g, 28, 44, 206, '#4F6778');
      for (let x = 32; x < 230; x += 12) vline(g, x, 44, 10, '#E9E6DE');
      for (let f = 0; f < 5; f++) {
        const fy = 58 + f * 20;
        for (let x = 33; x + 8 <= 232; x += 12) {
          rect(g, x - 1, fy - 1, 10, 16, '#D6D2C8');
          rect(g, x, fy, 8, 14, '#7B98AC');
          rect(g, x, fy, 8, 4, '#A8C3D4');
          vline(g, x + 5, fy, 14, '#8D8A83');
          vline(g, x + 8, fy, 15, '#C9C4B9');
        }
      }
      rect(g, 28, 156, 206, 16, '#D8D4CA');
      for (let x = 30; x < 230; x += 14) A.glassPane(g, x, 157, 11, 15, x, { top: '#7C94A0' });
      disc(g, 226, 162, 4, '#4A2F24'); dot(g, 226, 162, '#EFE3CF');
      vline(g, 233, 44, 128, P.whiteDeep);
      // plaza
      rect(g, 234, 20, 146, 172, '#D8D4CB');
      for (let y = 22; y < 192; y += 8) hline(g, 234, y, 146, '#C8C4BB');
      for (let x = 238; x < 380; x += 8) vline(g, x, 20, 172, '#C8C4BB');
      [[270, 60], [300, 150], [350, 40], [256, 176]].forEach(([mx, my]) => { disc(g, mx, my, 2, '#8C877F'); dot(g, mx, my, '#6E6A63'); });
      // the red cube sculpture (open frame, tilted)
      const cube = [[282, 118], [302, 108], [322, 118], [302, 128]];
      const up = 20;
      const C1 = '#D2485A', C2 = '#9C2B3C', C3 = '#EE7B89';
      for (let i = 0; i < 4; i++) { const [ax, ay] = cube[i], [bx, by] = cube[(i + 1) % 4]; line(g, ax, ay, bx, by, C2); line(g, ax, ay - up, bx, by - up, C3); line(g, ax, ay, ax, ay - up, i === 1 ? C2 : C1); }
      line(g, 282, 98, 322, 118, C1);
      rect(g, 256, 66, 12, 7, '#C8424E'); rect(g, 257, 67, 10, 5, '#D8D4CB');
      rect(g, 246, 138, 12, 7, '#C8424E'); rect(g, 247, 139, 10, 5, '#D8D4CB');
      // café chairs along the corner
      for (let i = 0; i < 10; i++) {
        const cx = 238 + (i % 3) * 6, cy = 150 + Math.floor(i / 3) * 8;
        rect(g, cx, cy, 4, 4, ['#E0493A', '#F2C230', '#2BA6A0', '#E86A4C'][i % 4]);
        dot(g, cx, cy, '#FFFFFF');
      }
      rect(g, 236, 186, 14, 3, '#6E4A33'); rect(g, 254, 186, 14, 3, '#6E4A33');
      // Deutsche Bank tower and podium
      A.facade(g, 392, 0, 88, 98, { style: 'bands', wall: '#ECE6D6', floorH: 10, seed: 3 });
      A.roofFlat(g, 372, 98, 108, 20, { color: '#A08466', units: 3, seed: 4 });
      A.facade(g, 372, 118, 108, 32, { style: 'bands', wall: '#E8E1CF', floorH: 8, seed: 5 });
      A.dbLogo(g, 460, 138, 7);
      // plaza trees (shadows first)
      const pt = [[334, 58, 16], [350, 96, 17], [342, 136, 15], [366, 168, 14]];
      pt.forEach(([x, y, rr]) => A.shadow(g, x + 8, y + 6, rr + 1, rr * .75, .3));
      pt.forEach(([x, y, rr], i) => A.treeTop(g, x, y, rr, 300 + i));
      // sidewalk, bike lane, parked cars, road, median parking
      rect(g, 0, 172, 234, 20, '#BAB5AB'); rect(g, 0, 192, W, 16, P.walk);
      A.speckle(g, 0, 172, W, 36, [P.walkDark, '#D6D1C7'], .04, 6);
      for (let x = 0; x < W; x += 3) dot(g, x, 200 + (x % 2), '#A9A49A');
      rect(g, 0, 208, W, 6, P.bike); hline(g, 0, 214, W, P.curb);
      A.road(g, 0, 215, W, 58, 7, 247);
      let x = 4;
      while (x < W - 28) {
        const len = 27 + Math.floor(r() * 4), col = A.CAR_COLORS[Math.floor(r() * A.CAR_COLORS.length)];
        (r() < .25 ? A.vanTop : A.carTop)(g, x, 216, len, 13, col, -1);
        x += len + 4 + Math.floor(r() * 14);
      }
      rect(g, 0, 273, W, 37, '#6F7076'); hline(g, 0, 273, W, P.curb);
      rect(g, 0, 274, 112, 16, P.grass[1]); A.speckle(g, 0, 274, 112, 16, P.grass, .5, 8);
      for (let px = 118; px < W - 12; px += 18) {
        vline(g, px - 2, 276, 30, '#D9D9D4');
        if (r() < .7) A.carTopV(g, px, 279, 13, 25, A.CAR_COLORS[Math.floor(r() * A.CAR_COLORS.length)]);
      }
      const st = [[137, 184, 16], [204, 186, 15], [300, 186, 16], [432, 184, 17]];
      st.forEach(([tx, ty, rr]) => A.shadow(g, tx + 10, ty + 8, rr + 2, rr * .7, .32));
      st.forEach(([tx, ty, rr], i) => A.treeTop(g, tx, ty, rr, 320 + i));
    }
    function init() { const [c, g] = canvas(W, WH); draw(g); bg = c; }
    const movers = [{ y: 222, len: 30, v: -40, x: 300, c: '#F2F2EF' }, { y: 236, len: 29, v: -34, x: 60, c: '#C8342F' }, { y: 252, len: 31, v: 44, x: 180, c: '#2A2C31', van: true }];
    const walkers = [{ x: 60, y: 178, v: 9, c: 3 }, { x: 180, y: 194, v: -8, c: 0 }, { x: 300, y: 70, v: 6, c: 1 }, { x: 420, y: 196, v: -7, c: 4 }];
    function render(g, cam, t) {
      blit(g, bg, -cam.x, -cam.y);
      movers.forEach(m => (m.van ? A.vanTop : A.carTop)(g, wrap(m.x + m.v * t, -40, W + 40) - cam.x, m.y - cam.y, m.len, 13, m.c, m.v > 0 ? 1 : -1));
      walkers.forEach(w => {
        const x = wrap(w.x + w.v * t, 0, W) - cam.x, y = w.y - cam.y, step = Math.floor(t * 5) % 2;
        g.globalAlpha = .25; rect(g, x + 1, y + 7, 3, 1, '#0E1220'); g.globalAlpha = 1;
        rect(g, x, y, 2, 2, '#E9C3A0'); rect(g, x, y + 2, 2, 3, A.PEOPLE[w.c]); dot(g, x + step, y + 5, '#2A2A30'); dot(g, x + 1 - step, y + 6, '#2A2A30');
      });
    }
    return { id: 'plaza', init, render };
  })();

  // ======================= SHOT 3: street level, the facade and Dave B. =======================
  const shot3 = (() => {
    const WH = 400;
    let bg, fg;
    const CHAIR_S = ['..KKKKK..', '.KCCCCCK.', '.KCKKKCK.', '.KCK.KCK.', '.KCKKKCK.', 'KKCCCCCKK', 'KCCCCCCCK', 'KDDDDDDDK', '.KK...KK.', '.KK...KK.', '.K.....K.'];
    function smallChair(color) { return PX.sprite(CHAIR_S, { K: shade(color, .6), C: color, D: shade(color, .3) }); }
    function draw(g) {
      A.skyGradient(g, W, 170, ['#3F7FDD', '#4A8BE3', '#5898E9', '#67A6EE', '#79B3F2', '#8CC0F5', '#A1CDF8', '#B7DAFA']);
      const cl = A.cloud(33, 64); g.drawImage(cl, 40, 12);
      // distant street beyond the corner
      rect(g, 452, 150, 28, 242, '#C9D5DF'); for (let y = 160; y < 380; y += 12) hline(g, 454, y, 26, '#AEBBC7'); rect(g, 452, 150, 28, 2, '#DDE6EE');
      // the building
      const X0 = 0, X1 = 452, TOP = 58, GROUND = 392;
      rect(g, X0, TOP, X1 - X0, GROUND - TOP, P.white);
      rect(g, X0, TOP, X1 - X0, 4, '#FBFAF6'); hline(g, X0, TOP + 4, X1 - X0, P.whiteDeep);
      // attic windows
      for (let x = 8; x + 26 <= X1; x += 40) { rect(g, x, 68, 26, 18, '#8D8A83'); rect(g, x + 2, 70, 22, 14, '#2F3B40'); rect(g, x + 2, 70, 22, 3, '#4E6068'); }
      hline(g, X0, 92, X1, P.whiteShade);
      // five floors of windows
      for (let f = 0; f < 5; f++) {
        const fy = 98 + f * 46;
        for (let x = 8; x + 26 <= X1; x += 40) {
          rect(g, x - 2, fy - 2, 30, 38, P.whiteShade);
          rect(g, x, fy, 26, 34, '#8D8A83');
          for (let j = 0; j < 30; j++) rect(g, x + 2, fy + 2 + j, 22, 1, mix('#C3DAE3', '#6B8C95', j / 30));
          rect(g, x + 16, fy + 2, 2, 30, '#8D8A83');
          rect(g, x + 2, fy + 9, 22, 2, '#8D8A83');
          rect(g, x + 24, fy, 2, 34, '#76736D');
          rect(g, x + 2, fy + 30, 22, 2, '#A9C3CC');
          vline(g, x + 27, fy - 2, 38, '#C6C1B6');
        }
        hline(g, X0, fy + 40, X1, '#E6E3DC');
      }
      for (let x = 34; x < X1; x += 40) { vline(g, x, 92, 230, '#FFFFFF'); vline(g, x + 13, 92, 230, '#E3E0D9'); }
      // ground floor: shopfront glass, doors, Dave B.
      rect(g, X0, 322, X1, 70, '#E4E1DA');
      hline(g, X0, 322, X1, '#C9C5BC');
      for (let x = 6; x + 34 <= X1; x += 40) {
        A.frameBox(g, x, 328, 34, 64, '#8D8A83', 2);
        A.glassPane(g, x + 2, 330, 30, 62, x, { lights: x % 80 === 6 ? [[10, 18], [22, 26]] : [[15, 22]] });
      }
      A.frameBox(g, 408, 328, 34, 64, '#7F7C76', 3);
      const SX = 366;
      rect(g, SX - 1, 314, 2, 6, '#5A5A5C');
      disc(g, SX, 340, 21, '#EFE3CF'); disc(g, SX, 340, 19, '#4A2F24'); disc(g, SX, 340, 17, '#583829');
      text3(g, 'DAVE B.', SX - Math.floor(text3Width('DAVE B.') / 2), 329, '#F4E7D1');
      hline(g, SX - 12, 336, 24, '#C9A57F');
      text3(g, 'TASTE', SX - Math.floor(text3Width('TASTE') / 2), 339, '#F4E7D1');
      text3(g, 'FIVE', SX - Math.floor(text3Width('FIVE') / 2), 346, '#F4E7D1');
      // folded umbrellas and the café tables
      [70, 190, 290].forEach(ux => A.umbrellaFolded(g, ux, 318, 72));
      const cols = ['#E0493A', '#F2C230', '#2BA6A0', '#E86A4C'];
      [[40, 0], [140, 1], [240, 2]].forEach(([tx, k]) => {
        for (let i = 0; i < 4; i++) { const s = smallChair(cols[(i + k) % 4]); g.drawImage(i % 2 ? PX.flipX(s) : s, tx - 8 + i * 14, 370 + (i % 2) * 3); }
        rect(g, tx - 2, 366, 50, 3, '#6E4A33'); rect(g, tx, 369, 3, 16, '#46301F'); rect(g, tx + 42, 369, 3, 16, '#46301F');
        for (let i = 0; i < 2; i++) { const s = smallChair(cols[(i + k + 2) % 4]); g.drawImage(s, tx + 6 + i * 22, 377); }
      });
      // red-white barriers down the street
      for (let i = 0; i < 3; i++) { const bx = 456 + i * 8; rect(g, bx, 372, 7, 10, '#E8E8E4'); rect(g, bx, 374, 7, 2, '#D8352E'); rect(g, bx, 378, 7, 2, '#D8352E'); }
      // the tree in front of the building
      A.streetTree(g, 404, GROUND, 290, 17);
      // sidewalk
      A.cobbles(g, 0, GROUND, W, WH - GROUND, 9, { min: 2, max: 3 });
    }
    function init() {
      let [c, g] = canvas(W, WH); draw(g); bg = c;
      [c, g] = canvas(W, 60);
      // the roof of a parked car, sliding in at the bottom-left
      rect(g, 0, 30, 132, 30, '#1E2A44'); rect(g, 0, 24, 124, 8, '#22304D');
      for (let j = 0; j < 14; j++) rect(g, 0, 10 + j, 104 - j, 1, PX.mix('#6F8FB5', '#26344F', j / 14));
      hline(g, 0, 10, 104, '#A9C2E2'); line(g, 18, 12, 30, 22, '#C5D8EE'); line(g, 22, 12, 34, 22, '#9DB4D4');
      hline(g, 0, 29, 128, '#3F5380'); rect(g, 124, 30, 8, 30, '#172036');
      fg = c;
    }
    function render(g, cam, t) {
      blit(g, bg, -cam.x, -cam.y);
      blit(g, fg, -cam.x * 1.25, 400 - 34 - cam.y * 1.25 + 34);
    }
    return { id: 'street', init, render };
  })();

  // ======================= SHOT 4: the coffee table, and the people =======================
  const shot4 = (() => {
    const WW = 500;
    const SEAT = { paul: 348, utkan: 452, giuseppe: 400 };   // x of each chair
    const SEAT_Y = 194, GROUND_Y = 248, TABLE_TOP = 176, KICK_AT = 7.9;
    let bgBack, bgFront, pig, cupSpr;

    function bigChair(g, x, y, color) {
      const K = shade(color, .55), C = color, L = tint(color, .3), D = shade(color, .25);
      rect(g, x + 3, y + 2, 3, 40, C); vline(g, x + 3, y + 2, 40, L); vline(g, x + 5, y + 2, 40, D);
      rect(g, x + 22, y + 2, 3, 40, C); vline(g, x + 24, y + 2, 40, D);
      for (let i = 0; i < 22; i++) { const yy = y + Math.round(2 - Math.sin((i / 21) * Math.PI) * 2); rect(g, x + 3 + i, yy, 1, 4, i < 11 ? L : C); dot(g, x + 3 + i, yy + 4, K); }
      rect(g, x + 5, y + 10, 18, 3, C); hline(g, x + 5, y + 10, 18, L); hline(g, x + 5, y + 13, 18, K);
      rect(g, x + 5, y + 17, 18, 2, C); hline(g, x + 5, y + 19, 18, K);
      for (let j = 0; j < 6; j++) rect(g, x + 1 - Math.floor(j / 2), y + 24 + j, 28 + Math.floor(j / 2) * 2 - 2, 1, j < 2 ? L : C);
      rect(g, x - 2, y + 30, 29, 2, D); hline(g, x - 2, y + 32, 29, K);
      rect(g, x - 1, y + 32, 3, 18, C); vline(g, x - 1, y + 32, 18, L); vline(g, x + 1, y + 32, 18, K);
      rect(g, x + 24, y + 32, 3, 18, C); vline(g, x + 26, y + 32, 18, K);
      rect(g, x + 5, y + 42, 2, 7, D); rect(g, x + 20, y + 42, 2, 7, D);
    }

    // everything behind the people: wall, doors, windows, umbrellas, pavement, back chairs
    function drawBack(g) {
      rect(g, 0, 0, WW, 214, P.white);
      A.speckle(g, 0, 0, WW, 214, ['#EAE7E0', '#F8F7F3'], .04, 4);
      A.frameBox(g, 30, -2, 140, 212, '#8D8A83', 5);
      rect(g, 30, 56, 140, 8, '#8D8A83'); hline(g, 30, 63, 140, '#6F6C66');
      A.glassPane(g, 35, 3, 130, 53, 1, { top: '#6E8896', mid: '#3A4B54' });
      A.glassPane(g, 35, 64, 62, 142, 2, { top: '#56707E' });
      A.glassPane(g, 103, 64, 62, 142, 3, { top: '#56707E' });
      rect(g, 97, 64, 6, 142, '#8D8A83'); vline(g, 97, 64, 142, '#A9A69F');
      g.globalAlpha = .28; ellipse(g, 58, 176, 14, 9, '#9A3A32'); rect(g, 44, 160, 24, 6, '#B8B8B8'); rect(g, 110, 150, 50, 30, '#A9AFB6'); g.globalAlpha = 1;
      rect(g, 91, 118, 2, 24, '#C9C9C6'); rect(g, 107, 118, 2, 24, '#C9C9C6');
      disc(g, 64, 126, 8, '#E9EFE6'); disc(g, 64, 126, 6, '#6FB36A'); disc(g, 64, 126, 3, '#E9EFE6');
      rect(g, 133, 84, 16, 22, '#F2F2EE'); rect(g, 134, 85, 14, 20, '#1E8F4E');
      rect(g, 139, 88, 3, 3, '#F2F2EE'); line(g, 137, 93, 144, 92, '#F2F2EE'); line(g, 140, 93, 138, 100, '#F2F2EE'); line(g, 140, 96, 144, 101, '#F2F2EE');
      rect(g, 132, 110, 18, 6, '#F2F2EE'); rect(g, 133, 111, 16, 4, '#D8483F'); hline(g, 135, 112, 10, '#F7C9C5');
      rect(g, 236, 0, 70, 214, '#8F8B83');
      vline(g, 236, 0, 214, '#A9A59D'); vline(g, 305, 0, 214, '#6F6B64');
      hline(g, 236, 62, 70, '#76726B'); hline(g, 236, 63, 70, '#A39F97');
      vline(g, 270, 64, 150, '#7A766F'); vline(g, 271, 64, 150, '#A09C94');
      A.noSmokingSign(g, 260, 98);
      rect(g, 244, 170, 44, 36, '#D3CFC6'); A.frameBox(g, 244, 170, 44, 36, '#B4B0A7', 1); dot(g, 283, 188, '#6E6A63');
      A.frameBox(g, 306, -2, 68, 204, '#8D8A83', 4);
      A.glassPane(g, 310, 2, 60, 196, 5, { top: '#3F505A', mid: '#2A363D', bot: '#20292E', lights: [[10, 74], [40, 90], [26, 52]] });
      A.umbrellaFolded(g, 318, 6, 200, '#EFECE3');
      A.frameBox(g, 440, -2, 64, 204, '#8D8A83', 4);
      A.glassPane(g, 444, 2, 60, 196, 6, { top: '#44555F', mid: '#2C383F', bot: '#222B30', lights: [[20, 66]] });
      A.umbrellaFolded(g, 452, 10, 196, '#BDB9AF');
      rect(g, 0, 206, WW, 8, '#D3CEC4'); hline(g, 0, 206, WW, '#E6E2DA'); hline(g, 0, 213, WW, '#A9A49A');
      A.cobbles(g, 0, 214, WW, 56, 10, { min: 2, max: 7 });
      g.globalAlpha = .22; rect(g, 0, 214, WW, 3, '#0E1220'); g.globalAlpha = 1;
      [[256, 226], [270, 234], [247, 243], [284, 229]].forEach(([bx, by]) => { rect(g, bx, by, 3, 1, '#F1F0EA'); dot(g, bx + 3, by, '#DE8A3C'); });
      // the three chairs behind the table
      [[SEAT.paul, '#2BA6A0'], [SEAT.giuseppe, '#E86A4C'], [SEAT.utkan, '#F2C230']].forEach(([sx, col]) => {
        A.shadow(g, sx, 220, 17, 4, .28);
        bigChair(g, sx - 12, 170, col);
      });
    }
    // everything in front of the people: the table and the near chair
    function drawFront(g) {
      A.shadow(g, 400, 220, 74, 9, .26);
      A.picnicTable(g, 330, 176, 142);
      A.shadow(g, 300, 250, 17, 5, .3);
      bigChair(g, 282, 196, '#E0493A');
    }

    function drawOpenDoor(g, k, ox, oy) {
      const kk = PX.ease.out(k);
      rect(g, 32 + ox, oy, 136, 212, '#1B2228');
      rect(g, 32 + ox, 182 + oy, 136, 30, '#2A231D'); hline(g, 32 + ox, 182 + oy, 136, '#453A30');
      g.globalAlpha = .45; disc(g, 96 + ox, 64 + oy, 18, '#6A4E29'); g.globalAlpha = 1;
      disc(g, 96 + ox, 62 + oy, 3, '#F5C978');
      for (let i = 0; i < 3; i++) rect(g, 60 + i * 26 + ox, 120 + oy, 14, 26, '#241E19');
      const w = Math.max(6, Math.round(66 * (1 - kk * .8)));
      A.frameBox(g, 30 + ox, -2 + oy, w, 212, '#8D8A83', 4);
      A.glassPane(g, 34 + ox, 2 + oy, Math.max(2, w - 8), 206, 11, { top: '#56707E' });
      A.frameBox(g, 170 - w + ox, -2 + oy, w, 212, '#8D8A83', 4);
      A.glassPane(g, 174 - w + ox, 2 + oy, Math.max(2, w - 8), 206, 12, { top: '#56707E' });
    }
    function impactFX(g, lt, ox, oy) {
      const k = (lt - KICK_AT) / .45;
      if (k < 0 || k > 1) return;
      const x = 150 + ox, y = 150 + oy, R = 12 + k * 30;
      for (let i = 0; i < 10; i++) {
        const a = i * Math.PI / 5 + .25;
        line(g, x + Math.cos(a) * R * .4, y + Math.sin(a) * R * .4, x + Math.cos(a) * R, y + Math.sin(a) * R, i % 2 ? '#FFF3B0' : '#FFFFFF');
      }
      g.globalAlpha = 1 - k; disc(g, x, y, 10 * (1 - k) + 4, '#FFF7D0'); g.globalAlpha = 1;
    }

    // ---------- choreography: [time, x, y, pose] ----------
    const SCRIPTS = {
      arrive: {
        paul: [[.4, 540, GROUND_Y, 'walk'], [2.6, 372, GROUND_Y, 'walk'], [3.4, 350, 222, 'walk'], [3.7, 350, 222, 'front'], [4.0, SEAT.paul, SEAT_Y, 'sit']],
        utkan: [[4.2, 540, GROUND_Y, 'walk'], [6.4, 476, GROUND_Y, 'walk'], [7.2, 454, 222, 'walk'], [7.5, 454, 222, 'front'], [7.8, SEAT.utkan, SEAT_Y, 'sit']],
        giuseppe: [[8.2, 540, GROUND_Y, 'walk'], [10.8, 424, GROUND_Y, 'walk'], [11.6, 402, 222, 'walk'], [11.9, 402, 222, 'front'], [12.2, SEAT.giuseppe, SEAT_Y, 'sit']],
      },
      door: {
        paul: [[0, SEAT.paul, SEAT_Y, 'sit'], [.4, 350, 222, 'front'], [1.0, 350, GROUND_Y, 'walk'], [3.2, 150, GROUND_Y, 'walk'], [3.4, 150, GROUND_Y, 'push'],
          [5.4, 150, GROUND_Y, 'stand'], [5.6, 150, GROUND_Y, 'walk'], [6.2, 214, 238, 'walk'], [6.4, 214, 238, 'stand'],
          [8.5, 214, 238, 'walk'], [9.6, 96, 238, 'walk']],
        utkan: [[0, SEAT.utkan, SEAT_Y, 'sit'], [.7, 454, 222, 'front'], [1.3, 454, GROUND_Y, 'walk'], [3.9, 262, GROUND_Y, 'walk'], [4.1, 262, GROUND_Y, 'stand'],
          [8.9, 262, GROUND_Y, 'walk'], [10.2, 96, GROUND_Y, 'walk']],
        giuseppe: [[0, SEAT.giuseppe, SEAT_Y, 'sit'], [1.0, 402, 222, 'front'], [1.6, 402, 252, 'walk'], [4.4, 286, 252, 'walk'], [4.6, 286, 252, 'stand'],
          [6.4, 286, 252, 'walk'], [7.3, 172, 252, 'walk'], [7.5, 172, 252, 'stand'], [7.7, 172, 252, 'kick'],
          [8.5, 172, 252, 'stand'], [9.4, 172, 252, 'walk'], [10.8, 96, 252, 'walk']],
      },
    };
    // when the espresso lands on the table and the cigarette is lit
    const EVENTS = {
      arrive: { paul: { cup: 4.5, cig: 5.1 }, utkan: { cup: 8.3, cig: 8.9 }, giuseppe: { cup: 12.7, cig: 13.3 } },
      door: { paul: { cup: -1, cig: -1 }, utkan: { cup: -1, cig: -1 }, giuseppe: { cup: -1, cig: -1 } },
    };

    function actorAt(keys, lt) {
      if (lt < keys[0][0]) return null;
      let i = 0;
      while (i < keys.length - 1 && lt >= keys[i + 1][0]) i++;
      const [t0, x0, y0, pose] = keys[i], nx = keys[i + 1];
      let x = x0, y = y0, moving = false, dx = 0;
      if (nx && nx[3] === pose) {
        const k = PX.clamp((lt - t0) / (nx[0] - t0), 0, 1);
        x = x0 + (nx[1] - x0) * k; y = y0 + (nx[2] - y0) * k;
        dx = nx[1] - x0;
        moving = k < 1 && (dx !== 0 || nx[2] !== y0);
      }
      return { x, y, pose, moving, dx, segT: lt - t0, segDur: nx ? nx[0] - t0 : 99 };
    }
    const kickK = (segT, segDur) => { const p = PX.clamp(segT / segDur, 0, 1); return p < .3 ? p / .3 : p < .62 ? 1 : Math.max(0, 1 - (p - .62) / .38); };

    function init() {
      let [c, g] = canvas(WW, H); drawBack(g); bgBack = c;
      [c, g] = canvas(WW, H); drawFront(g); bgFront = c;
      pig = A.pigeonFrames();
      cupSpr = A.cupSprite();
    }

    function render(g, cam, amb, lt = 0, act = null) {
      const shake = act === 'door' && lt > KICK_AT && lt < KICK_AT + .3
        ? Math.round(Math.sin((lt - KICK_AT) * 70) * 3 * (1 - (lt - KICK_AT) / .3)) : 0;
      const ox = -cam.x + shake, oy = -cam.y;
      blit(g, bgBack, ox, oy);
      if (act === 'door') {
        const k = PX.clamp((lt - KICK_AT) / .5, 0, 1);
        if (k > 0) drawOpenDoor(g, k, ox, oy);
        else {
          const j = (lt > 3.75 && lt < 3.95) || (lt > 4.6 && lt < 4.8) ? (Math.floor(lt * 40) % 2 ? 1 : -1) : 0;
          if (j) g.drawImage(bgBack, 30, 0, 140, 212, 30 + ox + j, oy, 140, 212);
        }
      }
      // who is on stage, and how
      const actors = [];
      if (act && SCRIPTS[act]) {
        for (const key of ['paul', 'utkan', 'giuseppe']) {
          const a = actorAt(SCRIPTS[act][key], lt);
          if (!a) continue;
          const ev = EVENTS[act][key];
          const pose = { name: a.pose === 'walk' && !a.moving ? 'stand' : a.pose, phase: (amb * 1.9) % 1 };
          if (pose.name === 'kick') pose.k = kickK(a.segT, a.segDur);
          if (pose.name !== 'sit' && (ev.cup < 0 ? false : lt < ev.cup)) pose.cup = true;
          if (pose.name === 'sit' && (ev.cig >= 0 ? lt >= ev.cig : true)) pose.cig = true;
          actors.push({ key, ...a, poseObj: pose, dir: a.dx > 0 ? 1 : -1, ev,
            alpha: PX.clamp((a.x - 92) / 38, 0, 1) });
        }
      }
      const drawOne = a => {
        g.globalAlpha = a.alpha;
        PEOPLE.draw(g, Math.round(a.x + ox), Math.round(a.y + oy), a.key, a.poseObj, a.dir);
        g.globalAlpha = 1;
      };
      actors.filter(a => a.y < 230).sort((p, q) => p.y - q.y).forEach(drawOne);
      blit(g, bgFront, ox, oy);
      // espressos on the table, and the smoke of whoever is sitting
      actors.forEach(a => {
        const seated = a.pose === 'sit';
        if (a.ev.cup >= 0 && lt >= a.ev.cup || (act === 'door')) PEOPLE.espresso(g, SEAT[a.key] - 5 + ox, 168 + oy);
        if (seated && a.poseObj.cig) PEOPLE.smoke(g, SEAT[a.key] - 20 + ox, 166 + oy, amb, a.key.length, 34);
      });
      actors.filter(a => a.y >= 230).sort((p, q) => p.y - q.y).forEach(drawOne);
      // the paper cup ashtray, still smoking
      blit(g, cupSpr, 384 + ox, 166 + oy);
      PEOPLE.smoke(g, 387 + ox, 165 + oy, amb, .3, 40);
      // the pigeon walks in, stops, pecks, walks on
      const cyc = (amb % 16) / 16, stop0 = .42, stop1 = .6;
      const prog = cyc < stop0 ? cyc : cyc < stop1 ? stop0 : cyc - (stop1 - stop0);
      const xx = 530 - prog * 300, walking = cyc < stop0 || cyc >= stop1;
      const f = walking ? Math.floor(amb * 6) % 2 : (Math.floor(amb * 2.5) % 2 ? 2 : 0);
      A.shadow(g, xx + 6 + ox, 257 + oy, 6, 2, .28);
      blit(g, pig[f], xx + ox, 247 + oy);
      // the AI, doing its best
      actors.forEach(a => {
        if (a.alpha < .5) return;
        const b = PEOPLE.boxFor({ x: a.x + ox, y: a.y + oy, pose: a.pose });
        PEOPLE.aiBox(g, b.x, b.y, b.w, b.h, PEOPLE.CHARS[a.key], a.moving, amb);
      });
      if (act === 'door') impactFX(g, lt, ox, oy);
    }
    return { id: 'table', init, render };
  })();

  // ======================= SHOT 5: the lift, and the doors =======================
  const shotLift = (() => {
    const OP = { x: 128, y: 26, w: 224, h: 212 };      // the door opening
    const CAB_FLOOR = 230, THRESH = 238, LOBBY = 256;
    const STAND = { paul: 166, utkan: 204, giuseppe: 306 };
    const SMASH = 3.92;
    let wall, cab, frame, torsoC, legsC;

    function drawWall(g) {
      rect(g, 0, 0, W, 244, '#D6D2C9');
      for (let x = 0; x < W; x += 60) { vline(g, x, 0, 244, '#C4C0B7'); vline(g, x + 1, 0, 244, '#E4E0D8'); }
      A.speckle(g, 0, 0, W, 244, ['#CFCBC2', '#E8E4DC'], .05, 12);
      hline(g, 0, 236, W, '#B3AFA6'); rect(g, 0, 238, W, 6, '#9E9A92');
      rect(g, 0, 244, W, 26, '#8E8A84');
      for (let y = 246; y < 270; y += 6) hline(g, 0, y, W, '#847F79');
      for (let x = 0; x < W; x += 34) vline(g, x, 244, 26, '#847F79');
      g.globalAlpha = .18; rect(g, OP.x, 244, OP.w, 12, '#EDEAE4'); g.globalAlpha = 1;
      rect(g, OP.x - 6, OP.y - 6, OP.w + 12, OP.h + 12, '#20242A');
    }
    function drawCab(g) {
      const w = OP.w, h = OP.h;
      rect(g, 0, 0, w, h, '#98A0A8');
      for (let x = 6; x < w; x += 10) { vline(g, x, 10, h - 28, '#8A939C'); vline(g, x + 1, 10, h - 28, '#A7AFB7'); }
      rect(g, 0, 0, w, 12, '#F6EFD2'); hline(g, 0, 12, w, '#C9C08F');
      g.globalAlpha = .25; rect(g, 0, 13, w, 26, '#FFF8D8'); g.globalAlpha = 1;
      rect(g, 0, 0, 16, h, '#7E868E'); rect(g, w - 16, 0, 16, h, '#7E868E');
      vline(g, 16, 0, h, '#6C747C'); vline(g, w - 17, 0, h, '#6C747C');
      rect(g, 20, 120, w - 40, 4, '#C2C8CE'); hline(g, 20, 120, w - 40, '#E4E8EC'); hline(g, 20, 123, w - 40, '#7E868E');
      rect(g, w - 34, 74, 18, 60, '#2E343A'); A.frameBox(g, w - 34, 74, 18, 60, '#6E767E', 1);
      for (let i = 0; i < 5; i++) { const by = 80 + i * 10; disc(g, w - 25, by, 3, i === 2 ? '#F2A63C' : '#767E86'); dot(g, w - 26, by - 1, '#AAB2BA'); }
      rect(g, 0, h - 26, w, 26, '#575E66');
      hline(g, 0, h - 26, w, '#6E767E');
      A.speckle(g, 0, h - 26, w, 26, ['#4C535A', '#626A72'], .08, 5);
    }
    function drawFrame(g) {
      rect(g, OP.x - 8, OP.y - 8, OP.w + 16, 8, '#A8AEB4');
      rect(g, OP.x - 8, OP.y - 8, 8, OP.h + 16, '#A8AEB4');
      rect(g, OP.x + OP.w, OP.y - 8, 8, OP.h + 16, '#A8AEB4');
      hline(g, OP.x - 8, OP.y - 8, OP.w + 16, '#D2D6DA');
      vline(g, OP.x - 8, OP.y - 8, OP.h + 16, '#D2D6DA');
      vline(g, OP.x + OP.w + 7, OP.y - 8, OP.h + 16, '#868C92');
      rect(g, OP.x - 8, THRESH, OP.w + 16, 6, '#B6BBC0');
      for (let x = OP.x - 6; x < OP.x + OP.w + 6; x += 4) vline(g, x, THRESH + 1, 4, '#9AA0A6');
      // floor indicator
      rect(g, 210, 4, 60, 18, '#1A1E24'); A.frameBox(g, 210, 4, 60, 18, '#8A9098', 1);
      line(g, 220, 16, 224, 9, '#F2A63C'); line(g, 224, 9, 228, 16, '#F2A63C');
    }
    function doorLeaf(g, x, w, side) {
      if (w <= 0) return;
      rect(g, x, OP.y, w, OP.h, '#B4BAC0');
      for (let i = 0; i < w; i += 8) vline(g, x + i, OP.y, OP.h, '#A6ACB2');
      vline(g, side > 0 ? x : x + w - 1, OP.y, OP.h, '#6E747A');
      rect(g, side > 0 ? x : x + w - 3, OP.y, 3, OP.h, '#43484E');
      hline(g, x, OP.y, w, '#D8DCE0');
      g.globalAlpha = .12; rect(g, x + (side > 0 ? 6 : w - 14), OP.y + 10, 8, OP.h - 30, '#FFFFFF'); g.globalAlpha = 1;
    }

    // ---------- blood ----------
    const SPLAT = rng(9001);
    const splats = Array.from({ length: 26 }, () => [SPLAT() * 224, SPLAT() * 150, 1 + SPLAT() * 3]);
    const drips = Array.from({ length: 7 }, () => [SPLAT() * 200, 60 + SPLAT() * 60, .4 + SPLAT() * .5]);
    // splatter lives on the leaves, so it slides with them when the doors move
    function bloodOnDoors(g, k, leafW) {
      if (k <= 0 || leafW <= 12) return;
      const half = OP.w / 2, n = Math.floor(splats.length * Math.min(1, k * 2));
      const lx = OP.x - 10, rx = OP.x + OP.w + 10 - leafW;
      for (let i = 0; i < n; i++) {
        const [sx, sy, r] = splats[i];
        const onLeft = i % 2 === 0;
        const u = (sx / 224) * half;                        // distance from the leading edge
        const x = onLeft ? lx + leafW - u : rx + u;
        if (x < lx || x > rx + leafW) continue;
        disc(g, x, OP.y + 40 + sy, r, i % 3 ? '#B0121F' : '#D8232F');
      }
      drips.forEach(([dx, dy, sp], i) => {
        const u = (dx / 200) * half * .8, onLeft = i % 2 === 0;
        const x = onLeft ? lx + leafW - u : rx + u;
        if (x < lx || x > rx + leafW) return;
        const len = Math.min(70, k * 90 * sp);
        rect(g, x, OP.y + dy, 2, len, '#8E0E1A');
        rect(g, x, OP.y + dy + len - 2, 2, 3, '#D8232F');
      });
    }
    function pool(g, x, y, w, h) { if (w < 2) return; ellipse(g, x, y, w, h, '#8E0E1A'); ellipse(g, x - w * .2, y - 1, w * .55, h * .6, '#B0121F'); dot(g, x - w * .4, y - 1, '#E0454F'); }
    function burst(g, x, y, k) {
      const r = rng(4242);
      for (let i = 0; i < 44; i++) {
        const a = r() * Math.PI * 2, d = (.2 + r() * .8) * k * 110;
        const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d * .7 - k * 6;
        if (px < 0 || px > W) continue;
        disc(g, px, py, r() < .3 ? 2 : 1, i % 2 ? '#D8232F' : '#B0121F');
      }
    }

    // ---------- the script ----------
    function visitorAt(lt) {
      if (lt < 0 || lt > SMASH) return null;
      if (lt < 1.8) return { x: 470 - (lt / 1.8) * 140, y: LOBBY, pose: 'walk' };
      if (lt < 2.6) { const k = (lt - 1.8) / .8; return { x: 330 - k * 46, y: LOBBY - k * 4, pose: 'walk' }; }
      if (lt < 3.2) return { x: 284, y: 252, pose: 'stand' };
      if (lt < 3.7) { const k = (lt - 3.2) / .5; return { x: 284 - k * 40, y: 252 - k * 4, pose: 'walk' }; }
      return { x: 244, y: 248, pose: 'stand' };
    }
    // how far the doors are closed, 0..1
    function closeAt(lt) {
      if (lt < 2.6) return 0;
      if (lt < 2.9) return PX.ease.out((lt - 2.6) / .3) * .45;
      if (lt < 3.05) return .45 - PX.ease.out((lt - 2.9) / .15) * .1 + Math.sin(lt * 60) * .02;
      if (lt < 3.4) return .35 - PX.ease.out((lt - 3.05) / .35) * .35;
      if (lt < SMASH - .12) return 0;
      if (lt < SMASH) return PX.ease.in((lt - (SMASH - .12)) / .12);
      if (lt < 4.9) return 1;
      if (lt < 5.6) return 1 - PX.ease.inOut((lt - 4.9) / .7);
      if (lt < 10.4) return 0;
      if (lt < 11.4) return PX.ease.inOut((lt - 10.4) / 1);
      return 1;
    }
    const GIU = [[0, STAND.giuseppe, CAB_FLOOR, 'front'], [7.2, STAND.giuseppe, CAB_FLOOR, 'front'],
      [7.3, 290, CAB_FLOOR, 'walk'], [8.1, 244, CAB_FLOOR, 'walk'], [8.3, 244, CAB_FLOOR, 'stand'],
      [8.45, 244, CAB_FLOOR, 'kick'], [9.0, 244, CAB_FLOOR, 'stand'], [9.2, 244, CAB_FLOOR, 'kick'],
      [9.8, 244, CAB_FLOOR, 'stand'], [10.0, 266, CAB_FLOOR, 'walk'], [10.5, STAND.giuseppe, CAB_FLOOR, 'walk'],
      [10.7, STAND.giuseppe, CAB_FLOOR, 'front']];
    function giuseppeAt(lt) { return pathAt(GIU, lt); }
    // [time, x, y, pose] keyframes; position interpolates only between keys with the same pose
    function pathAt(keys, lt) {
      let i = 0;
      while (i < keys.length - 1 && lt >= keys[i + 1][0]) i++;
      const [t0, x0, y0, pose] = keys[i], nx = keys[i + 1];
      let x = x0, y = y0, moving = false;
      if (nx && nx[3] === pose) {
        const k = PX.clamp((lt - t0) / (nx[0] - t0), 0, 1);
        x = x0 + (nx[1] - x0) * k; y = y0 + (nx[2] - y0) * k;
        moving = k < 1 && nx[1] !== x0;
      }
      return { x, y, pose: pose === 'walk' && !moving ? 'stand' : pose, moving, dir: nx && nx[1] < x0 ? -1 : 1,
        k: pose === 'kick' ? (() => { const p = PX.clamp((lt - t0) / ((nx ? nx[0] : t0 + .5) - t0), 0, 1); return p < .3 ? p / .3 : p < .62 ? 1 : Math.max(0, 1 - (p - .62) / .38); })() : 0 };
    }
    // the remains: [x, y] of the torso (inside) and the legs (outside)
    function remainsAt(lt) {
      if (lt < 4.9) return null;
      const t = { x: 206, y: 224, rot: -Math.PI / 2 }, l = { x: 258, y: 250, rot: Math.PI / 2 };
      if (lt > 8.55) { const k = PX.ease.out(PX.clamp((lt - 8.55) / 1.1, 0, 1)); t.x = 206 + k * 224; t.y = 224 + k * 28; }
      if (lt > 9.3) { const k = PX.ease.out(PX.clamp((lt - 9.3) / 1, 0, 1)); l.x = 258 + k * 192; }
      return { t, l };
    }

    // ---------- the last scene: they come back down and tape him together ----------
    const AX = 244, AY = 252;                          // where Ariel ends up standing
    const FIX = {
      // [time, x, y, pose] per character: out of the cab, over to the parts, then a wide final line
      paul: [[0, STAND.paul, CAB_FLOOR, 'front'], [1.9, STAND.paul, CAB_FLOOR, 'front'],
        [2.0, 244, LOBBY, 'walk'], [2.9, 200, LOBBY, 'walk'], [3.1, 200, LOBBY, 'stand'],
        [5.5, 200, LOBBY, 'stand'], [5.7, 214, LOBBY, 'walk'], [5.8, 214, LOBBY, 'push'],
        [7.7, 214, LOBBY, 'push'], [7.8, 196, LOBBY, 'walk'], [8.9, 92, LOBBY, 'walk'], [9.1, 92, LOBBY, 'front']],
      utkan: [[0, STAND.utkan, CAB_FLOOR, 'front'], [2.1, STAND.utkan, CAB_FLOOR, 'front'],
        [2.2, 244, LOBBY, 'walk'], [3.2, 424, LOBBY, 'walk'], [3.4, 424, LOBBY, 'push'],
        [3.6, 424, LOBBY, 'walk'], [4.5, 330, LOBBY, 'walk'], [4.7, 330, LOBBY, 'stand'],
        [7.9, 330, LOBBY, 'stand'], [8.0, 300, LOBBY, 'walk'], [9.2, 166, LOBBY, 'walk'], [9.4, 166, LOBBY, 'front']],
      giuseppe: [[0, STAND.giuseppe, CAB_FLOOR, 'front'], [2.3, STAND.giuseppe, CAB_FLOOR, 'front'],
        [2.4, 260, LOBBY, 'walk'], [3.1, 382, LOBBY, 'walk'], [3.3, 382, LOBBY, 'push'],
        [3.5, 382, LOBBY, 'walk'], [4.4, 290, LOBBY, 'walk'], [4.6, 290, LOBBY, 'stand'],
        [7.9, 290, LOBBY, 'stand'], [8.0, 320, LOBBY, 'walk'], [9.2, 396, LOBBY, 'walk'], [9.4, 396, LOBBY, 'front']],
    };
    const TAPE_FROM = 5.9, TAPE_TO = 7.6, TURN = 9.8, THUMB = 10.4, BYE = 11.0;

    // the two halves: dragged in from where they were kicked, then stood up
    // Each half is drawn from its own centre, so dragging, turning upright and standing
    // are one interpolation: lying on the floor -> stacked at (AX, AY).
    function partsAt(lt) {
      const drag = PX.ease.inOut(PX.clamp((lt - 3.5) / 1.1, 0, 1));
      const up = PX.ease.out(PX.clamp((lt - 4.8) / .8, 0, 1));
      const at = (x0, y0, y1, dir) => ({ x: x0 + (AX - x0) * drag, y: y0 + (y1 - y0) * up, rot: dir * (Math.PI / 2) * (1 - up) });
      return { legs: at(440, 252, AY - 28, 1), torso: at(400, 250, AY - 83, -1), up, standing: up >= 1 };
    }
    // silver bands across the seam, one per wrap of the roll
    function tapeBands(g, x, fy, lt) {
      const n = PX.clamp(Math.floor((lt - TAPE_FROM) / ((TAPE_TO - TAPE_FROM) / 3)), 0, 3);
      const band = [[-50, 0], [-56, 1], [-44, -1]];         // the first wrap covers the cut
      for (let i = 0; i < n; i++) {
        const [dy, tilt] = band[i], y = fy + dy;
        rect(g, x - 13, y + tilt, 26, 4, '#8A9199');
        hline(g, x - 13, y + tilt, 26, '#A8AFB6');
        hline(g, x - 13, y + 3 + tilt, 26, '#656C73');
        for (let k = -11; k < 12; k += 4) dot(g, x + k, y + 1 + tilt, '#9EA5AC');
        dot(g, x + 13, y + 1 + tilt, '#6B7279');
      }
      if (lt > TAPE_FROM && lt < TAPE_TO) {                 // the roll going round and round
        const a = (lt - TAPE_FROM) * 7.5, rx = Math.cos(a) * 20, ry = Math.sin(a) * 6;
        disc(g, x + rx, fy - 48 + ry, 5, '#B8BEC4');
        disc(g, x + rx, fy - 48 + ry, 2, '#5E646A');
        line(g, x + rx, fy - 48 + ry, x, fy - 48, '#A8AEB4');
      }
    }
    function thumbsUp(g, x, fy, k) {
      const arm = PX.ease.out(k), sx = x + 13, sy = fy - 72;
      const hx = Math.round(sx + 7 * arm), hy = Math.round(sy - 20 * arm);
      for (let i = 0; i < 4; i++) line(g, sx + i, sy, hx + i, hy + 2, '#3C3330');   // sleeve
      for (let i = 0; i < 3; i++) line(g, hx + i, hy + 6, hx + i, hy + 2, '#D9A87C');
      disc(g, hx + 2, hy, 5, '#D9A87C');                    // fist
      disc(g, hx + 1, hy - 1, 3, '#E7C6A4');
      rect(g, hx + 1, hy - 9, 4, 6, '#D9A87C');             // the thumb
      rect(g, hx + 1, hy - 9, 4, 1, '#E7C6A4');
      vline(g, hx + 4, hy - 8, 6, '#B78A63');
      if (k >= 1) [0, 1, 2].forEach(i => line(g, hx + 9 + i * 4, hy - 8 - i * 3, hx + 12 + i * 4, hy - 11 - i * 3, '#F2E74B'));
    }
    function byeBubble(g, x, y, lt) {
      const k = PX.clamp((lt - BYE) / .35, 0, 1);
      if (k <= 0) return;
      const s = k < 1 ? PX.ease.out(k) * 1.12 : 1 + Math.sin((lt - BYE) * 4) * .02;
      const w = Math.round(74 * s), h = Math.round(26 * s);
      const bx = Math.round(x - w / 2), by = Math.round(y - h);
      rect(g, bx - 1, by - 1, w + 2, h + 2, '#1C1C20');
      rect(g, bx, by, w, h, '#FFFFFF');
      rect(g, bx - 1, by + 2, 1, h - 4, '#1C1C20'); rect(g, bx + w, by + 2, 1, h - 4, '#1C1C20');
      [[8, 0], [5, 3], [3, 6]].forEach(([tw, dy], i) => {   // the tail, stepping down towards him
        const tx = bx + 12 - i * 4, ty = by + h + dy;
        rect(g, tx - 1, ty, tw + 2, 4, '#1C1C20');
        rect(g, tx, ty, tw, 3, '#FFFFFF');
      });
      if (k < 1) return;
      const [tc, tg] = canvas(40, 8);                       // small text, blown up 2x, stays crisp
      PX.text3(tg, 'BYEEEEE', 1, 1, '#1C1C20');
      g.drawImage(tc, 0, 0, 40, 8, bx + 8, by + 5, 80, 16);
    }

    function renderFix(g, cam, amb, lt) {
      const ox = -cam.x, oy = -cam.y;
      const openK = 1 - PX.ease.inOut(PX.clamp((lt - .9) / .9, 0, 1));
      const leaf = Math.round(OP.w / 2 * openK) + 10;
      const p = partsAt(lt), turn = PX.clamp((lt - TURN) / .4, 0, 1);
      blit(g, wall, ox, oy);
      g.save();
      g.beginPath(); g.rect(OP.x + ox, OP.y + oy, OP.w, OP.h); g.clip();
      blit(g, cab, OP.x + ox, OP.y + oy);
      Object.keys(FIX).forEach(k => {                        // still in the cab until they step out
        const a = pathAt(FIX[k], lt);
        if (a.y === CAB_FLOOR) PEOPLE.draw(g, Math.round(a.x) + ox, CAB_FLOOR + oy, k, { name: a.pose, cig: true }, -1);
      });
      doorLeaf(g, OP.x - 10 + ox, leaf, 1);
      doorLeaf(g, OP.x + OP.w + 10 - leaf + ox, leaf, -1);
      g.restore();
      blit(g, frame, ox, oy);
      PX.text3(g, lt < .3 ? '3' : lt < .55 ? '2' : lt < .8 ? '1' : '0', 238 + ox, 10 + oy, '#F2A63C');
      // dried blood, still there
      pool(g, 244 + ox, THRESH + 6 + oy, 30, 5);
      rect(g, 250 + ox, 250 + oy, 180, 4, '#7E0C16'); rect(g, 262 + ox, 256 + oy, 180, 3, '#7E0C16');
      // the crew, out in the lobby
      const out = Object.keys(FIX).map(k => ({ k, a: pathAt(FIX[k], lt) })).filter(o => o.a.y !== CAB_FLOOR);
      out.forEach(({ k, a }) => PEOPLE.draw(g, Math.round(a.x) + ox, Math.round(a.y) + oy, k,
        { name: a.pose, phase: (amb * 1.9) % 1, cig: a.pose === 'front' }, a.dir));
      // Ariel: two halves, then taped, then facing us
      if (turn < 1) {
        g.save();
        g.translate(Math.round(AX + ox), Math.round(oy));
        if (turn > 0) g.scale(Math.max(.06, 1 - turn), 1);   // he spins on the spot
        [[legsC, p.legs, -28], [torsoC, p.torso, -37]].forEach(([img, q, cy]) => {
          g.save();
          g.translate(Math.round(q.x - AX), Math.round(q.y));
          g.rotate(q.rot);
          g.drawImage(img, -40, cy);
          g.restore();
        });
        if (p.standing) tapeBands(g, 0, AY, lt);
        g.restore();
      } else {
        PEOPLE.draw(g, AX + ox, AY + oy, 'ariel', { name: 'front' }, -1);
        tapeBands(g, AX + ox, AY + oy, lt);
        if (lt > THUMB) thumbsUp(g, AX + ox, AY + oy, PX.clamp((lt - THUMB) / .45, 0, 1));
      }
      byeBubble(g, AX + 30 + ox, AY - 122 + oy, lt);
      // the AI, catching up
      const merge = PX.clamp((lt - 8.6) / .8, 0, 1);
      if (merge < 1 && !p.standing) {
        const half = { label: 'ARIEL', pct: 50, jitter: 0, labelDy: 0 };
        PEOPLE.aiBox(g, Math.round(p.torso.x - 22 + ox), Math.round(p.torso.y - 22 + oy), 44, 44, half, false, amb);
        PEOPLE.aiBox(g, Math.round(p.legs.x - 16 + ox), Math.round(p.legs.y - 16 + oy), 32, 34, { ...half, labelDy: 14 }, false, amb);
      } else if (p.standing) {
        const pct = Math.round(50 + 50 * PX.ease.out(merge));
        PEOPLE.aiBox(g, AX - 24 + ox, AY - 104 + oy, 48, 104, { label: 'ARIEL', pct, jitter: merge < 1 ? 6 : 0, labelDy: 0 }, merge < 1, amb);
      }
      out.forEach(({ k, a }) => {
        const b = PEOPLE.boxFor({ x: a.x + ox, y: a.y + oy, pose: 'front' });
        PEOPLE.aiBox(g, b.x, b.y, b.w, b.h, PEOPLE.CHARS[k], a.moving, amb);
      });
    }

    function init() {
      let [c, g] = canvas(W, H); drawWall(g); wall = c;
      [c, g] = canvas(OP.w, OP.h); drawCab(g); cab = c;
      [c, g] = canvas(W, H); drawFrame(g); frame = c;
      const vis = PEOPLE.toCanvas('ariel', { name: 'stand' }, -1, 80, 120);
      [c, g] = canvas(80, 74); g.drawImage(vis, 0, 0, 80, 70, 0, 0, 80, 70);
      for (let x = 22; x < 58; x++) { const h = 2 + Math.floor(Math.abs(Math.sin(x)) * 4); rect(g, x, 68, 1, h, x % 3 ? '#B0121F' : '#8E0E1A'); }
      torsoC = c;
      [c, g] = canvas(80, 56); g.drawImage(vis, 0, 70, 80, 50, 0, 6, 80, 50);
      for (let x = 24; x < 56; x++) { const h = 2 + Math.floor(Math.abs(Math.cos(x)) * 4); rect(g, x, 8 - h, 1, h, x % 3 ? '#B0121F' : '#8E0E1A'); }
      legsC = c;
    }

    function render(g, cam, amb, lt = 0, act = null) {
      if (act === 'fix') return renderFix(g, cam, amb, lt);
      const shake = lt > SMASH && lt < SMASH + .3 ? Math.round(Math.sin((lt - SMASH) * 80) * 4 * (1 - (lt - SMASH) / .3)) : 0;
      const ox = -cam.x + shake, oy = -cam.y;
      const closeK = closeAt(lt), leaf = Math.round(OP.w / 2 * closeK) + 10;
      const rem = remainsAt(lt), gi = giuseppeAt(lt), vis = visitorAt(lt);
      const bloodK = PX.clamp((lt - SMASH) / .5, 0, 1);
      blit(g, wall, ox, oy);
      // ---- inside the cab ----
      g.save();
      g.beginPath(); g.rect(OP.x + ox, OP.y + oy, OP.w, OP.h); g.clip();
      blit(g, cab, OP.x + ox, OP.y + oy);
      ['paul', 'utkan'].forEach(k => {
        PEOPLE.draw(g, STAND[k] + ox, CAB_FLOOR + oy, k, { name: 'front', cig: true }, -1);
        PEOPLE.smoke(g, STAND[k] - 17 + ox, CAB_FLOOR - 36 + oy, amb, k.length, 26);
      });
      PEOPLE.draw(g, Math.round(gi.x) + ox, CAB_FLOOR + oy, 'giuseppe',
        { name: gi.pose, phase: (amb * 1.9) % 1, k: gi.k, cig: gi.pose === 'front' }, gi.dir);
      if (gi.pose === 'front') PEOPLE.smoke(g, gi.x - 17 + ox, CAB_FLOOR - 36 + oy, amb, 2, 26);
      if (rem && rem.t.x < OP.x + OP.w) {
        g.save(); g.translate(Math.round(rem.t.x + ox), Math.round(rem.t.y + oy)); g.rotate(rem.t.rot);
        g.drawImage(torsoC, -37, -40); g.restore();
      }
      if (bloodK > 0) { pool(g, 236 + ox, 232 + oy, 28 * bloodK, 5 * bloodK); }
      // the doors
      doorLeaf(g, OP.x - 10 + ox, leaf, 1);
      doorLeaf(g, OP.x + OP.w + 10 - leaf + ox, leaf, -1);
      if (bloodK > 0) bloodOnDoors(g, bloodK, leaf);
      g.restore();
      blit(g, frame, ox, oy);
      if (lt >= 11.4) PX.text3(g, '3', 238 + ox, 10 + oy, '#F2A63C');
      else PX.text3(g, '0', 238 + ox, 10 + oy, '#F2A63C');
      // ---- out in the lobby ----
      if (bloodK > 0) {
        pool(g, 244 + ox, THRESH + 6 + oy, 34 * bloodK, 6 * bloodK);
        if (lt > 8.55) { const k = PX.clamp((lt - 8.55) / 1.1, 0, 1); rect(g, 250 + ox, 250 + oy, k * 180, 4, '#8E0E1A'); }
        if (lt > 9.3) { const k = PX.clamp((lt - 9.3) / 1, 0, 1); rect(g, 262 + ox, 256 + oy, k * 180, 3, '#8E0E1A'); }
      }
      if (rem) {
        if (rem.t.x >= OP.x + OP.w - 20) { g.save(); g.translate(Math.round(rem.t.x + ox), Math.round(rem.t.y + oy)); g.rotate(rem.t.rot); g.drawImage(torsoC, -37, -40); g.restore(); }
        g.save(); g.translate(Math.round(rem.l.x + ox), Math.round(rem.l.y + oy)); g.rotate(rem.l.rot); g.drawImage(legsC, -28, -28); g.restore();
      }
      if (vis) PEOPLE.draw(g, Math.round(vis.x) + ox, Math.round(vis.y) + oy, 'ariel', { name: vis.pose, phase: (amb * 1.9) % 1 }, -1);
      if (lt > SMASH && lt < SMASH + .45) burst(g, 240 + ox, 190 + oy, (lt - SMASH) / .45);
      // ---- the AI, still confident ----
      if (closeK < .35) {
        ['paul', 'utkan'].forEach(k => {
          const b = PEOPLE.boxFor({ x: STAND[k] + ox, y: CAB_FLOOR + oy, pose: 'front' });
          PEOPLE.aiBox(g, b.x, b.y, b.w, b.h, PEOPLE.CHARS[k], false, amb);
        });
        const gb = PEOPLE.boxFor({ x: gi.x + ox, y: CAB_FLOOR + oy, pose: 'front' });
        PEOPLE.aiBox(g, gb.x, gb.y, gb.w, gb.h, PEOPLE.CHARS.giuseppe, gi.moving, amb);
      }
      if (vis) {
        const b = PEOPLE.boxFor({ x: vis.x + ox, y: vis.y + oy, pose: 'front' });
        PEOPLE.aiBox(g, b.x, b.y, b.w, b.h, PEOPLE.CHARS.ariel, vis.pose === 'walk', amb);
      }
      if (rem && lt > 5.6) {
        const half = { label: 'ARIEL', pct: 50, jitter: 0, labelDy: 0 };
        PEOPLE.aiBox(g, Math.round(rem.t.x - 22 + ox), Math.round(rem.t.y - 22 + oy), 44, 44, half, false, amb);
        PEOPLE.aiBox(g, Math.round(rem.l.x - 16 + ox), Math.round(rem.l.y - 16 + oy), 32, 34, { ...half, labelDy: 14 }, false, amb);
      }
    }
    return { id: 'lift', init, render };
  })();

  // ======================= SHOT 6: the desk, from behind =======================
  const shotDesk = (() => {
    const MON = { x: 140, y: 46, w: 208, h: 140 };                 // bezel
    const SCR = { x: MON.x + 7, y: MON.y + 7, w: MON.w - 14, h: MON.h - 20 };   // the glass
    const SLIDE_SWAP = 4.4;
    let room, torso;

    // ---------- the two slides, rebuilt in pixels ----------
    function slideLoop(g, x, y, w, h) {
      rect(g, x, y, w, h, '#272C3E');
      const cx = x + w / 2, cy = y + h / 2 + 2, rx = w * .3, ry = h * .3;
      const labels = ['AI ADDS THINGS', 'COGNITIVE LOAD', 'MORE AI', 'INFLATES', 'OVERENGINEERING'];
      const pts = labels.map((_, i) => {
        const a = -Math.PI / 2 + i * Math.PI * 2 / 5;
        return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry];
      });
      pts.forEach(([px, py], i) => {
        const [qx, qy] = pts[(i + 1) % 5];
        const mx = px + (qx - px) * .62, my = py + (qy - py) * .62;
        line(g, px + (qx - px) * .3, py + (qy - py) * .3, mx, my, '#59607A');
        dot(g, mx, my, '#7C839C'); dot(g, mx - 1, my, '#7C839C'); dot(g, mx, my - 1, '#7C839C');
      });
      labels.forEach((t, i) => {
        const [px, py] = pts[i];
        const tw = PX.text3Width(t);
        PX.text3(g, t, PX.clamp(px - tw / 2, x + 1, x + w - tw - 1), py - 2, '#EDEFF4');
      });
      PX.text3(g, 'FROG IS COOKED.', x + 4, y + 4, '#8A90A6');
    }
    function sheep(g, x, y) {
      ellipse(g, x + 6, y + 5, 6, 4, '#F2EFE4');
      ellipse(g, x + 4, y + 3, 4, 3, '#FBF9F2');
      rect(g, x + 10, y + 2, 4, 4, '#4A4038'); dot(g, x + 11, y + 3, '#F2EFE4');
      rect(g, x + 9, y + 1, 2, 2, '#6B5C50'); rect(g, x + 13, y + 1, 2, 2, '#6B5C50');
      vline(g, x + 3, y + 8, 3, '#C9C2B4'); vline(g, x + 8, y + 8, 3, '#C9C2B4');
    }
    function collie(g, x, y) {
      ellipse(g, x + 8, y + 5, 8, 4, '#22201F');
      ellipse(g, x + 6, y + 4, 4, 2, '#F2EFE4');
      rect(g, x + 14, y + 1, 5, 5, '#22201F');
      rect(g, x + 16, y + 3, 3, 2, '#F2EFE4'); dot(g, x + 18, y + 3, '#22201F');
      rect(g, x + 13, y - 1, 2, 3, '#22201F'); rect(g, x + 17, y - 1, 2, 3, '#22201F');
      rect(g, x + 1, y + 4, 4, 2, '#F2EFE4');
    }
    function slideSheep(g, x, y, w, h) {
      A.skyGradient(g, w, Math.round(h * .62), ['#2F73CE', '#3D82DC', '#4E92E6', '#66A5EE', '#83BAF4', '#A6CFF8'], 0);
      g.save(); g.translate(x, y); g.beginPath(); g.rect(0, 0, w, h); g.clip();
      A.skyGradient(g, w, Math.round(h * .62), ['#2F73CE', '#3D82DC', '#4E92E6', '#66A5EE', '#83BAF4', '#A6CFF8'], 0);
      [[10, 8, 26], [64, 14, 34], [116, 6, 22]].forEach(([cx, cy, cw], i) => g.drawImage(A.cloud(70 + i, cw), cx, cy));
      rect(g, 0, Math.round(h * .58), w, h, '#8FA45A');
      A.speckle(g, 0, Math.round(h * .58), w, h - Math.round(h * .58), ['#A8B86C', '#7C8F4C', '#C2CE86'], .35, 3);
      rect(g, 0, Math.round(h * .55), w, 4, '#5E7A3C');
      [[14, 52], [34, 50], [54, 53], [74, 51], [94, 54]].forEach(([sx, sy]) => sheep(g, sx, sy));
      collie(g, 122, 60);
      const t = 'ENGINEERING AS CONTAINMENT';
      PX.text3(g, t, Math.round((w - PX.text3Width(t)) / 2), 6, '#FFFFFF');
      rect(g, 2, h - 28, w - 4, 26, '#F2F1EC');
      const l0 = "THAT'S HOW YOU", l1 = 'PROTECT LONG-TERM DELIVERY SPEED', l2 = 'FROM SHORT-TERM GENERATION SPEED';
      PX.text3(g, l0, 5, h - 25, '#1A1A1A');
      rect(g, 4, h - 18, PX.text3Width(l1) + 2, 7, '#F2E74B');
      PX.text3(g, l1, 5, h - 17, '#1A1A1A');
      PX.text3(g, l2, 5, h - 9, '#1A1A1A');
      g.restore();
    }
    function screenPPT(g, lt) {
      const { x, y, w, h } = SCR;
      rect(g, x, y, w, h, '#E8E6E1');
      rect(g, x, y, w, 10, '#3B4048');
      PX.text3(g, 'ENGINEERING-AS-CONTAINMENT.PPTX', x + 4, y + 3, '#D8DCE2');
      [w - 18, w - 12, w - 6].forEach((dx, i) => disc(g, x + dx, y + 5, 2, ['#E0B03C', '#6FB36A', '#D8483F'][i]));
      rect(g, x, y + 10, w, 12, '#D6D3CD');
      for (let i = 0; i < 12; i++) rect(g, x + 4 + i * 9, y + 13, 6, 6, i % 3 ? '#B7B3AC' : '#8E8A83');
      rect(g, x, y + 22, 30, h - 22, '#C6C3BC');
      for (let i = 0; i < 4; i++) {
        const ty = y + 26 + i * 16;
        rect(g, x + 4, ty, 22, 13, i === 1 ? '#F6F5F1' : '#EAE8E3');
        if (i === 1) A.frameBox(g, x + 3, ty - 1, 24, 15, '#D8483F', 1);
        rect(g, x + 5, ty + 1, 20, 11, i % 2 ? '#3F4A63' : '#7FA8CE');
      }
      const sx = x + 34, sy = y + 26, sw = w - 40, sh = h - 36;
      rect(g, sx - 1, sy - 1, sw + 2, sh + 2, '#9A968F');
      const k = PX.clamp((lt - SLIDE_SWAP) / .45, 0, 1);
      g.save(); g.beginPath(); g.rect(sx, sy, sw, sh); g.clip();
      if (k < 1) slideLoop(g, sx - Math.round(k * sw), sy, sw, sh);
      if (k > 0) slideSheep(g, sx + Math.round((1 - k) * sw), sy, sw, sh);
      g.restore();
      PX.text3(g, k > 0 ? 'SLIDE 34 OF 52' : 'SLIDE 33 OF 52', x + 34, y + h - 7, '#6E6A63');
    }

    // ---------- the chat ----------
    const CHAT = [
      { who: 'me', at: 0, lines: ['CAN YOU TURN MY TALK INTO', 'A RETRO PIXEL ANIMATION?'] },
      { who: 'ai', at: 0, lines: ['SURE. 16-BIT BEAT-EM-UP.'] },
      { who: 'me', at: 4.2, lines: ['AND PUT ME AND THE TEAM IN IT.'] },
      { who: 'ai', at: 6.4, lines: ['OK. STARTING FROM THE SKY', 'OVER THE BTC...'], type: true },
    ];
    const TYPED = 'AND PUT ME AND THE TEAM IN IT.';
    function screenChat(g, lt) {
      const { x, y, w, h } = SCR;
      rect(g, x, y, w, h, '#1E2127');
      rect(g, x, y, w, 10, '#2B2F36');
      PX.text3(g, 'CLAUDE', x + 26, y + 3, '#E6E2DA');
      [4, 5, 6].forEach((r, i) => dot(g, x + 16 + (i - 1) * 2, y + 5, '#D8783C'));
      disc(g, x + 16, y + 5, 2, '#D8783C');
      rect(g, x, y + 10, 24, h - 10, '#171A1F');
      for (let i = 0; i < 5; i++) rect(g, x + 4, y + 16 + i * 8, 16, 4, i === 1 ? '#3A4048' : '#262A31');
      let cy = y + 14;
      CHAT.forEach((m, i) => {
        if (lt < m.at) return;
        const typing = m.type && lt < m.at + 3.4;
        const full = m.lines.join(' ');
        const shown = typing ? full.slice(0, Math.floor((lt - m.at) * 14)) : full;
        if (typing && shown.length === 0) return;
        const lines = m.type ? [shown.slice(0, 25), shown.slice(25).trimStart()].filter(Boolean) : m.lines;
        const bw = Math.max(...lines.map(l => PX.text3Width(l))) + 8;
        const bh = lines.length * 8 + 6;
        const bx = m.who === 'me' ? x + w - bw - 6 : x + 30;
        rect(g, bx, cy, bw, bh, m.who === 'me' ? '#39516E' : '#2A2F36');
        if (m.who === 'ai') { disc(g, x + 26, cy + 4, 2, '#D8783C'); }
        lines.forEach((l, j) => PX.text3(g, l, bx + 4, cy + 4 + j * 8, m.who === 'me' ? '#E8EEF6' : '#D6D2CA'));
        if (typing && Math.floor(lt * 3) % 2) rect(g, bx + 4 + PX.text3Width(lines[lines.length - 1]) + 1, cy + 4 + (lines.length - 1) * 8, 3, 5, '#D6D2CA');
        cy += bh + 3;
      });
      // the input box, with the third message being typed into it
      rect(g, x + 28, y + h - 16, w - 34, 13, '#2B2F36');
      A.frameBox(g, x + 28, y + h - 16, w - 34, 13, '#3E444C', 1);
      if (lt < 4.2) {
        const shown = TYPED.slice(0, Math.max(0, Math.floor((lt - .6) * 13)));
        PX.text3(g, shown, x + 32, y + h - 12, '#E6E2DA');
        if (Math.floor(lt * 3) % 2) rect(g, x + 32 + PX.text3Width(shown) + 1, y + h - 13, 3, 6, '#D8783C');
      } else {
        PX.text3(g, 'REPLY...', x + 32, y + h - 12, '#5A606A');
      }
      rect(g, x + w - 14, y + h - 14, 9, 9, '#D8783C');
      PX.text3(g, '/', x + w - 12, y + h - 12, '#1E2127');
    }

    // ---------- the room ----------
    function drawRoom(g) {
      rect(g, 0, 0, W, 214, '#C6C9C2');
      A.speckle(g, 0, 0, W, 214, ['#BFC2BB', '#CFD2CB'], .05, 21);
      rect(g, 0, 150, W, 5, '#AFB2AB'); hline(g, 0, 150, W, '#D6D9D2');
      // window with the same sky as scene one
      A.frameBox(g, 8, 26, 104, 104, '#9FA39C', 4);
      A.skyGradient(g, 96, 96, ['#3E85DF', '#4E92E6', '#66A5EE', '#83BAF4', '#A6CFF8', '#C2DFFA'], 0);
      g.save(); g.beginPath(); g.rect(12, 30, 96, 96); g.clip();
      A.skyGradient(g, 96, 96, ['#3E85DF', '#4E92E6', '#66A5EE', '#83BAF4', '#A6CFF8', '#C2DFFA'], 30);
      g.drawImage(A.cloud(31, 40), 16, 44); g.drawImage(A.cloud(32, 28), 66, 74);
      rect(g, 12, 108, 96, 18, '#8E9AA8');
      for (let bx = 14; bx < 108; bx += 12) { rect(g, bx, 100 + (bx % 7), 9, 26, '#7F8B99'); for (let wy = 104; wy < 124; wy += 4) rect(g, bx + 2, wy, 5, 2, '#AEB9C6'); }
      g.restore();
      vline(g, 60, 30, 96, '#9FA39C'); hline(g, 12, 78, 96, '#9FA39C');
      // whiteboard with the loop scribbled on it
      rect(g, 366, 34, 106, 84, '#F4F3EF'); A.frameBox(g, 366, 34, 106, 84, '#A9ACA5', 3);
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + i * Math.PI * 2 / 5, cx = 419 + Math.cos(a) * 30, cy = 76 + Math.sin(a) * 24;
        disc(g, cx, cy, 3, '#3F6FB5');
        const [nx, ny] = [419 + Math.cos(a + 1.25) * 30, 76 + Math.sin(a + 1.25) * 24];
        line(g, cx + (nx - cx) * .25, cy + (ny - cy) * .25, cx + (nx - cx) * .75, cy + (ny - cy) * .75, '#6E87A8');
      }
      PX.text3(g, 'THE LOOP', 400, 40, '#C8453C');
      rect(g, 440, 104, 16, 12, '#F2E74B'); PX.text3(g, 'AI', 445, 108, '#4A4038');
      // desk
      rect(g, 0, 208, W, 40, '#8A6A4E'); hline(g, 0, 208, W, '#A98A68');
      A.speckle(g, 0, 209, W, 38, ['#7E6046', '#96755A'], .06, 22);
      rect(g, 0, 244, W, 6, '#5E4733');
      // monitor
      A.frameBox(g, MON.x, MON.y, MON.w, MON.h, '#2E3238', 6);
      rect(g, MON.x + 6, MON.y + MON.h - 12, MON.w - 12, 6, '#22262B');
      PX.text3(g, 'DELL', MON.x + MON.w / 2 - 8, MON.y + MON.h - 10, '#6E747C');
      rect(g, 232, MON.y + MON.h, 24, 20, '#3A3F45');
      rect(g, 206, MON.y + MON.h + 20, 76, 6, '#2E3238'); hline(g, 206, MON.y + MON.h + 20, 76, '#4A5058');
      // desk clutter
      rect(g, 96, 216, 44, 24, '#E8E4DA'); A.frameBox(g, 96, 216, 44, 24, '#C9C4B9', 1);
      for (let ly = 220; ly < 238; ly += 4) hline(g, 100, ly, 36, '#C2BCB0');
      PEOPLE.espresso(g, 352, 226);
      rect(g, 372, 232, 12, 8, '#3A3F45'); disc(g, 378, 234, 2, '#6E747C');
      rect(g, 398, 220, 26, 18, '#2E3238'); rect(g, 400, 222, 22, 14, '#4A5058');
    }

    const TURN_DUR = 7;
    const HEAD_X = 244, HEAD_Y = 214;                      // what the camera closes in on
    // Vertigo: he comes forward faster than the room does, so the space behind him stretches.
    // The shake grows with the push and keeps going while the slide holds.
    function zoomAt(act, amb, lt) {
      const z = act === 'spent' ? 1 : act === 'turn' ? PX.ease.inOut(PX.clamp((lt - .8) / 5.6, 0, 1)) : 0;
      const amp = act === 'spent' ? 0 : z * z * 9;
      return { z, room: 1 + .8 * z, man: 1 + 2.6 * z, pan: Math.round(15 * z), manPan: Math.round(55 * z),
        jx: Math.round(Math.sin(amb * 37) * amp + Math.sin(amb * 23.3) * amp * .6),
        jy: Math.round(Math.cos(amb * 31) * amp * .8 + Math.sin(amb * 19.7) * amp * .4) };
    }
    // scale about his head, and tilt up a little so his face does not slide off the bottom
    const about = (g, sc, ox, oy, pan) => {
      g.translate(0, -pan);
      g.translate(HEAD_X + ox, HEAD_Y + oy); g.scale(sc, sc); g.translate(-HEAD_X - ox, -HEAD_Y - oy);
    };
    const turnAt = (act, lt) => act === 'spent' ? 1 : act === 'turn' ? PX.ease.inOut(PX.clamp((lt - .8) / 2.6, 0, 1)) : 0;

    // His head, going round to look at the room. k: 0 the back of his head, 1 staring at us.
    // Four stages, the way a sprite sheet would do it, rather than a smooth rotation.
    const BLINKS = [[3.7, 3.84], [4.6, 4.78], [5.5, 5.62], [6.15, 6.34], [6.8, 6.92]];
    function head(g, cx, hy, k, blink, up) {
      const SKIN = '#E7B189', LIT = '#EFC098', EAR = '#D9A87C', HAIR = '#DEDAD2';
      const st = k < .22 ? 0 : k < .48 ? 1 : k < .74 ? 2 : 3;
      if (st === 0) {                                          // the back of his head
        ellipse(g, cx, hy, 26, 24, SKIN);
        ellipse(g, cx, hy - 6, 24, 16, LIT);
        ellipse(g, cx - 24, hy + 4, 6, 10, HAIR); ellipse(g, cx + 24, hy + 4, 6, 10, HAIR);
        ellipse(g, cx, hy + 16, 22, 8, HAIR);
        hline(g, cx - 10, hy - 18, 20, '#F6D8B8');
        ellipse(g, cx - 27, hy + 2, 3, 4, EAR); ellipse(g, cx + 27, hy + 2, 3, 4, EAR);
        return;
      }
      if (st === 1) {                                          // three quarters away
        ellipse(g, cx - 3, hy, 25, 24, SKIN);
        ellipse(g, cx - 3, hy - 6, 23, 16, LIT);
        ellipse(g, cx + 21, hy + 4, 7, 11, HAIR);
        ellipse(g, cx - 5, hy + 16, 21, 8, HAIR);
        ellipse(g, cx - 22, hy + 9, 9, 11, HAIR);              // the beard, coming round
        ellipse(g, cx - 22, hy + 7, 7, 8, tint(HAIR, .3));
        ellipse(g, cx + 25, hy + 2, 4, 5, EAR);
        hline(g, cx - 12, hy - 18, 18, '#F6D8B8');
        return;
      }
      if (st === 2) {                                          // in profile
        ellipse(g, cx - 5, hy, 24, 24, SKIN);
        ellipse(g, cx - 5, hy - 7, 22, 15, LIT);
        ellipse(g, cx + 17, hy + 5, 8, 12, HAIR);
        ellipse(g, cx - 17, hy + 11, 13, 13, HAIR);            // the beard, out front
        ellipse(g, cx - 16, hy + 8, 11, 9, tint(HAIR, .28));
        rect(g, cx - 28, hy + 1, 6, 5, SKIN); dot(g, cx - 29, hy + 3, EAR);
        rect(g, cx - 21, hy - 3, 3, 3, '#3A322C');             // the eye, side on
        hline(g, cx - 23, hy - 8, 7, '#C9A98C');
        ellipse(g, cx + 14, hy + 2, 4, 5, EAR);
        return;
      }
      ellipse(g, cx - 3, hy, 25, 24, SKIN);                    // looking right at you
      ellipse(g, cx - 3, hy - 8, 23, 14, LIT);
      ellipse(g, cx + 20, hy + 4, 7, 11, HAIR);
      ellipse(g, cx - 24, hy + 4, 5, 9, HAIR);
      ellipse(g, cx - 5, hy + 15, 21, 13, HAIR);               // the beard
      ellipse(g, cx - 5, hy + 12, 17, 9, tint(HAIR, .26));
      rect(g, cx - 13, hy + 6, 17, 3, tint(HAIR, .1));
      rect(g, cx - 8, hy + 1, 5, 4, EAR);                      // nose
      [[-14, 4], [3, 3]].forEach(([ex, ew], i) => {
        if (blink) { rect(g, cx + ex - 1, hy - 2, ew + 3, 1, '#3A322C'); return; }
        rect(g, cx + ex, hy - 4, ew + 2, 6, '#F4EDE3');                  // more white below
        rect(g, cx + ex + (i ? 0 : 1), hy - 4 - up, 3, 3, '#3A322C');    // pupils sitting high
        hline(g, cx + ex - 1, hy - 8 - up, ew + 4, '#C9A98C');
      });
      ellipse(g, cx + 25, hy + 2, 3, 4, EAR);
    }

    // Giuseppe from behind: bald head, white hair round the sides, red shirt, chair.
    function drawBack(g, lt, amb, act) {
      const cx = 244, headY = 214;
      const turn = turnAt(act, lt);
      const blink = act === 'turn' && BLINKS.some(([a, b]) => lt > a && lt < b);
      const up = act === 'spent' ? 1 : act === 'turn' ? Math.round(PX.clamp((lt - 4.4) / .6, 0, 1)) : 0;
      const lean = Math.round(turn * 4);
      rect(g, 150, 250, 188, 20, '#3A3F45');
      rect(g, 168, 244, 152, 26, '#4A5058'); A.frameBox(g, 168, 244, 152, 26, '#5E666F', 2);
      ellipse(g, cx, 262, 68, 30, '#A8382F');
      ellipse(g, cx - lean, 258, 60, 24, '#B94238');
      // arms on the keyboard; the tapping stops the moment he turns round
      [[-1, 186], [1, 302]].forEach(([s, hx]) => {
        const tap = !turn && Math.sin(amb * 9 + (s > 0 ? 1.7 : 0)) > .4 ? 1 : 0;
        PX.line(g, cx + s * 46, 250, hx, 236 + tap, '#8E2B24');
        ellipse(g, cx + s * 50, 252, 12, 10, '#A8382F');
        ellipse(g, hx, 234 + tap, 8, 5, '#E7B189');
        rect(g, hx - 6, 232 + tap, 12, 3, '#E7B189');
      });
      rect(g, 176, 230, 136, 14, '#D9D6CF'); A.frameBox(g, 176, 230, 136, 14, '#B4B0A7', 1);
      for (let kx = 180; kx < 308; kx += 8) for (let ky = 233; ky < 242; ky += 4) rect(g, kx, ky, 6, 3, '#EFEDE7');
      head(g, cx - lean, headY, turn, blink, up);
      rect(g, cx - 8 - lean, headY + 22, 16, 8, '#E7B189');
      g.globalAlpha = .12; ellipse(g, cx, 230, 60, 34, '#BFD8FF'); g.globalAlpha = 1;
    }

    // ---------- the build, one instruction at a time ----------
    // He types a prompt, the model scribbles code, the scene appears in the preview pane,
    // and the allowance drops while the code runs. One slide per instruction, so he can
    // talk over each one and click when he is ready.
    const BUILDS = [
      { prompt: 'START OUTSIDE. A SUNNY BTC MORNING.', shot: 'sky', to: 10,
        cam: [[0, 0, 0], [2.6, 0, 0], [9.8, 0, 760, 'inOut']] },
      { prompt: 'COME DOWN TO THE STREET.', shot: 'street', to: 6,
        cam: [[0, 0, 0], [.8, 0, 0], [6, 0, 130, 'inOut']] },
      { prompt: 'THE COFFEE TABLE. ADD ME AND THE TEAM.', shot: 'table', act: 'arrive', to: 14.2, cam: [[0, 0, 0]] },
      { prompt: 'NOW ME AT MY DESK, ON THE DECK.', shot: 'desk', act: 'ppt', to: 8, cam: [[0, 0, 0]] },
    ];
    const TYPE_END = 2.6, CODE_END = 5.2, CLIP_FOR = 5.8;   // the three phases of a build slide
    const TURN_CLIP = { shot: 'desk', act: 'turn', to: TURN_DUR, cam: [[0, 0, 0]] };
    const CLIPS = { sky: shot1, plaza: shot2, street: shot3, table: shot4, lift: shotLift };
    let depth = 0, pv = null, pvg = null;

    const buildIdx = act => (act === 'spent' || act === 'turn' ? BUILDS.length - 1 : act && act.startsWith('build') ? +act.slice(5) - 1 : -1);
    // the allowance: each instruction eats a quarter, most of it while the code is running
    function tokensAt(i, lt) {
      const code = PX.ease.inOut(PX.clamp((lt - TYPE_END) / (CODE_END - TYPE_END), 0, 1));
      const after = PX.clamp((lt - CODE_END) / 6, 0, 1);
      return PX.clamp(1 - i * .24 - .2 * code - .04 * after, 0, 1);
    }

    // ---------- the model, thinking out loud ----------
    const KW = ['CONST', 'LET', 'FOR', 'IF', 'RETURN', 'FUNCTION', 'AWAIT', 'EXPORT'];
    const FN = ['RECT(G,', 'DOT(G,', 'ELLIPSE(G,', 'BLIT(G,', 'PX.RNG(', 'MIX(', 'SHADE(', 'EASE.OUT(', 'CHECKER(G,'];
    const VAR = ['SKY', 'CLOUD', 'ROOF', 'FACADE', 'TREE', 'CAR', 'TABLE', 'CHAIR', 'SMOKE', 'FRAME', 'PAL', 'SEED', 'CX', 'CY', 'LT', 'AMB', 'K'];
    const HEX = ['#3E85DF', '#C2DFFA', '#8A6A4E', '#A8382F', '#1D1D21', '#F2E74B', '#4A4038'];
    // Stable per line number, so scrubbing back shows the same code.
    function codeLine(n) {
      const r = rng(7700 + n), pick = a => a[Math.floor(r() * a.length)];
      const ind = '  '.repeat(Math.floor(r() * 3));
      const v = pick(VAR), sh = r();
      if (sh < .12) return [ind, '', '}'];
      if (sh < .34) return [ind, pick(KW), ' ' + v + ' = ' + pick(FN) + v.toLowerCase() + ', ' + Math.floor(r() * 480) + ');'];
      if (sh < .5) return [ind, 'FOR', ' (LET I = 0; I < ' + Math.floor(8 + r() * 60) + '; I++) {'];
      if (sh < .66) return [ind, '', pick(FN) + Math.floor(r() * 480) + ', ' + Math.floor(r() * 270) + ", '" + pick(HEX) + "');"];
      if (sh < .78) return [ind, 'IF', ' (' + v + ' > ' + (r() * 2).toFixed(2) + ') ' + v + ' -= ' + (r()).toFixed(2) + ';'];
      if (sh < .9) return [ind, '', '// ' + pick(VAR) + ' PASS ' + (1 + Math.floor(r() * 4))];
      return [ind, 'RETURN', ' [' + Math.floor(r() * 99) + ', ' + Math.floor(r() * 99) + '];'];
    }
    function screenCode(g, x, y, w, h, t) {
      rect(g, x, y, w, h, '#0D1014');
      const lh = 8, rows = Math.floor(h / lh) + 1, top = Math.floor(t * 15);
      const slide = Math.round((t * 15 % 1) * lh);
      g.save();
      g.beginPath(); g.rect(x, y, w, h); g.clip();
      for (let i = 0; i < rows; i++) {
        const [ind, kw, rest] = codeLine(top + i);
        const ly = y + h - slide - (rows - i) * lh + 6;
        let lx = x + 3 + PX.text3Width(ind);
        if (kw) { PX.text3(g, kw, lx, ly, '#7EE787'); lx += PX.text3Width(kw); }
        PX.text3(g, rest.slice(0, 38), lx, ly, '#A9B2BD');
      }
      g.restore();
      rect(g, x, y, w, 1, '#0D1014');
      if (Math.floor(t * 6) % 2) rect(g, x + w - 6, y + h - 7, 3, 5, '#7EE787');
    }

    function drawPreview(g, px, py, c, k, lt) {
      const slt = k * c.to, cam = PX.camAt(c.cam, slt);
      const cm = { x: Math.round(cam.x), y: Math.round(cam.y) };
      pvg.fillStyle = '#000'; pvg.fillRect(0, 0, W, H);
      depth++;
      if (c.shot === 'desk') render(pvg, cm, lt, slt, c.act);
      else CLIPS[c.shot].render(pvg, cm, lt, slt, c.act);
      depth--;
      g.drawImage(pv, 0, 0, W, H, px, py, 160, 90);
    }

    function screenBuild(g, lt, i, act) {
      const b = BUILDS[i], { x, y, w, h } = SCR;
      const held = act === 'spent' || act === 'turn';
      rect(g, x, y, w, h, '#1E2127');
      rect(g, x, y, w, 10, '#2B2F36');
      disc(g, x + 16, y + 5, 2, '#D8783C');
      text3(g, 'CLAUDE', x + 26, y + 3, '#E6E2DA');
      text3(g, 'SCENE ' + (i + 1) + ' OF ' + BUILDS.length, x + w - 60, y + 3, '#7A818B');
      const px = x + 17, py = y + 13;
      rect(g, px - 1, py - 1, 162, 92, '#0E1013');
      if (act === 'turn') {                                  // the copy on the screen turns too
        drawPreview(g, px, py, TURN_CLIP, PX.clamp(lt / TURN_DUR, 0, 1), lt);
      } else if (held) {
        drawPreview(g, px, py, b, 1, lt);
      } else if (lt < TYPE_END) {                            // whatever was made last
        if (i > 0) drawPreview(g, px, py, BUILDS[i - 1], 1, lt);
        else { rect(g, px, py, 160, 90, '#15181D'); text3(g, 'NO SCENE YET', px + 56, py + 43, '#3E444C'); }
      } else if (lt < CODE_END) {
        screenCode(g, px, py, 160, 90, lt - TYPE_END);
      } else {
        drawPreview(g, px, py, b, PX.clamp((lt - CODE_END) / CLIP_FOR, 0, 1), lt);
      }
      A.frameBox(g, px - 1, py - 1, 162, 92, '#3E444C', 1);
      // the instruction, typed in
      const typing = !held && lt < TYPE_END;
      const typed = held ? b.prompt : b.prompt.slice(0, Math.floor(PX.clamp(lt / (TYPE_END - .5), 0, 1) * b.prompt.length));
      rect(g, x + 4, y + 106, w - 8, 12, '#2B2F36');
      A.frameBox(g, x + 4, y + 106, w - 8, 12, typing ? '#D8783C' : '#3E444C', 1);
      const tw = text3(g, '> ' + typed, x + 8, y + 109, '#E6E2DA');
      if (typing && Math.floor(lt * 3) % 2) rect(g, x + 9 + tw, y + 108, 3, 6, '#D8783C');
    }

    // The monthly AI allowance, draining as the thing gets made.
    function tokenGauge(g, ox, oy, k, lt) {
      const x = 6 + ox, y = 60 + oy, w = 18, h = 134, ih = h - 4;
      const col = k > .5 ? '#4FB477' : k > .22 ? '#E0A227' : '#D2392F';
      const blink = k < .18 && Math.floor(lt * 6) % 2 === 0;
      rect(g, 2 + ox, 36 + oy, 30, 20, '#2E3238'); A.frameBox(g, 2 + ox, 36 + oy, 30, 20, '#4A5058', 1);
      text3(g, 'DB AI', 5 + ox, 39 + oy, '#9AA2AD');
      text3(g, 'TOKENS', 5 + ox, 47 + oy, '#E6E2DA');
      rect(g, x, y, w, h, '#14171B'); A.frameBox(g, x, y, w, h, '#4A5058', 2);
      const fill = Math.max(k > 0 ? 1 : 0, Math.round(ih * k)), top = y + 2 + (ih - fill);
      if (fill > 0) {
        rect(g, x + 2, top, w - 4, fill, blink ? '#F2E74B' : col);
        vline(g, x + 3, top + 1, fill - 1, tint(col, .35));
        hline(g, x + 2, top, w - 4, tint(col, .5));
        for (let s = y + 7; s < y + 2 + ih; s += 6) hline(g, x + 2, s, w - 4, '#14171B');
      }
      for (let s = 0; s <= 4; s++) hline(g, x + w, y + 2 + Math.round(ih * s / 4), 3, '#8A9098');
      const pc = Math.round(k * 100) + '%';
      rect(g, 2 + ox, 196 + oy, 30, 9, '#2E3238');
      text3(g, pc, 17 + ox - text3Width(pc) / 2, 198 + oy, blink || k <= 0 ? '#F2E74B' : col);
    }

    // Vincent, confused, standing in an empty wallet. Only drawn if the gif has not loaded.
    function travolta(g, cx, fy, t) {
      const SUIT = '#23232B', DARK = '#15151B', SKIN = '#E8B892', HAIR = '#2A211C';
      const LEATHER = '#1E1A19', LINING = '#7A6144';
      const turn = Math.sin(t * 1.7), dx = Math.round(turn * 3);
      const up = Math.round(Math.max(0, Math.sin(t * 1.7 - 1.6)) * 3);
      const wx = 24;
      for (let i = -wx; i <= wx; i++) {
        const u = i / wx, lift = Math.round(u * u * 5);
        vline(g, cx + i, fy - 8 - lift, 10 + lift, LINING);
        dot(g, cx + i, fy - 8 - lift, tint(LINING, .3));
        if (Math.abs(i) > 2) dot(g, cx + i, fy - 4 - Math.round(lift * .6), shade(LINING, .3));
      }
      vline(g, cx, fy - 8, 10, shade(LINING, .35));
      rect(g, cx - 5 + dx, fy - 13, 4, 13, DARK);
      rect(g, cx + 2 + dx, fy - 13, 4, 13, DARK);
      rect(g, cx - 9 + dx, fy - 29, 18, 17, SUIT);
      hline(g, cx - 9 + dx, fy - 29, 18, tint(SUIT, .2));
      rect(g, cx - 2 + dx, fy - 28, 5, 10, '#EFEDE7');
      rect(g, cx - 1 + dx, fy - 25, 3, 10, '#141418');
      [[-1, -16], [1, 16]].forEach(([s, ax]) => {
        for (let a = 0; a < 3; a++) line(g, cx + dx + s * 8, fy - 27 + a, cx + dx + ax, fy - 17 - up + a, SUIT);
        ellipse(g, cx + dx + ax + s, fy - 15 - up, 3, 2, SKIN);
      });
      const hx = cx + dx * 2;
      ellipse(g, hx, fy - 36, 6, 7, SKIN);
      ellipse(g, hx, fy - 39, 7, 5, HAIR);
      rect(g, hx - 8, fy - 39, 3, 14, HAIR); rect(g, hx + 6, fy - 39, 3, 14, HAIR);
      rect(g, hx - 3 - dx, fy - 42, 7, 3, HAIR);
      const ex = hx + Math.round(turn * 2);
      dot(g, ex - 2, fy - 36, HAIR); dot(g, ex + 1, fy - 36, HAIR);
      rect(g, ex - 1, fy - 32, 2, 1, '#B07A5E');
      for (let i = -wx - 1; i <= wx + 1; i++) {
        const u = i / (wx + 1), sag = Math.round((1 - u * u) * 3);
        vline(g, cx + i, fy + 1, 11 + sag, LEATHER);
        dot(g, cx + i, fy + 1, tint(LEATHER, .3));
        dot(g, cx + i, fy + 11 + sag, shade(LEATHER, .5));
        if (Math.abs(i) % 4 < 2 && Math.abs(i) < wx - 1) dot(g, cx + i, fy + 4 + Math.round(sag * .4), '#7E6A52');
      }
      [-1, 1].forEach(s => {
        const px = cx + s * (wx + 2);
        ellipse(g, px + s * 5, fy + 7, 4, 7, SKIN);
        ellipse(g, px + s * 5, fy + 4, 3, 3, tint(SKIN, .12));
        for (let f = 0; f < 4; f++) {
          rect(g, px - (s > 0 ? 5 : 0), fy + 2 + f * 3, 6, 2, f === 1 ? tint(SKIN, .1) : SKIN);
          hline(g, px - (s > 0 ? 5 : 0), fy + 4 + f * 3, 6, shade(SKIN, .4));
        }
      });
    }

    // A thought bubble over his shoulder, kept clear of the monitor. It turns up when the
    // allowance starts to look thin.
    const CLOUD_AT = 1.2;
    function thoughtBubble(g, ox, oy, i, lt) {
      const t = i > 2 ? lt + 9 : lt;                        // already there on the last one
      const CX = 84 + ox, CY = 104 + oy;
      [[120, 170, 5], [134, 186, 4], [150, 198, 3], [164, 206, 2]].forEach(([tx, ty, r], n) => {
        const p = PX.clamp((t - (CLOUD_AT - .5 + (3 - n) * .12)) / .22, 0, 1);
        if (p <= 0) return;
        const rr = r * PX.ease.out(p);
        disc(g, tx + ox, ty + oy, rr + 1, '#3A3F45');
        disc(g, tx + ox, ty + oy, rr, '#F4F3EF');
      });
      const pop = PX.clamp((t - CLOUD_AT) / .45, 0, 1);
      if (pop <= 0) return;
      const s = PX.ease.out(pop);
      const lobes = [[0, -32, 19], [-26, -22, 16], [26, -22, 16], [-42, -2, 15], [42, -2, 15], [-30, 20, 15], [30, 20, 15], [0, 30, 17]];
      const puff = (c, o) => {
        lobes.forEach(([lx, ly, r]) => disc(g, CX + lx * s, CY + ly * s, r * s + o, c));
        ellipse(g, CX, CY, 42 * s + o, 30 * s + o, c);
      };
      puff('#3A3F45', 1.5);
      puff('#F4F3EF', 0);
      if (pop >= 1 && !HIRES.ready('travolta')) travolta(g, CX, CY + 13, t - CLOUD_AT);
    }

    function init() { const [c, g] = canvas(W, H); drawRoom(g); room = c; [pv, pvg] = PX.canvas(W, H); }

    // The real Pulp Fiction gif, playing inside the thought bubble at its own resolution.
    function hires(g, cam, amb, lt = 0, act = 'ppt') {
      const i = buildIdx(act);
      if (i < 2) return;
      const t = i > 2 ? lt + 9 : lt;
      if (t < CLOUD_AT + .45) return;
      const zm = zoomAt(act, amb, lt), sc = zm.room;
      const ox = -cam.x + zm.jx, oy = -cam.y + zm.jy;
      const px = HEAD_X + ox + (40 - HEAD_X) * sc, py = HEAD_Y + oy - zm.pan + (70 - HEAD_Y) * sc;
      HIRES.draw(g, 'travolta', t - CLOUD_AT - .45, px, py, 88 * sc, 66 * sc);
    }

    function render(g, cam, amb, lt = 0, act = 'ppt') {
      const zm = depth === 0 ? zoomAt(act, amb, lt) : { z: 0, room: 1, man: 1, jx: 0, jy: 0 };
      const ox = -cam.x + zm.jx, oy = -cam.y + zm.jy;
      if (zm.z > 0) { g.save(); about(g, zm.room, ox, oy, zm.pan); }
      blit(g, room, ox, oy);
      g.save();
      g.beginPath(); g.rect(SCR.x + ox, SCR.y + oy, SCR.w, SCR.h); g.clip();
      g.translate(ox, oy);
      const bi = depth === 0 ? buildIdx(act) : -1;
      if (bi >= 0) screenBuild(g, lt, bi, act);
      else if (act === 'chat') screenChat(g, lt);
      else screenPPT(g, lt);
      g.restore();
      g.globalAlpha = .06;
      for (let y = SCR.y; y < SCR.y + SCR.h; y += 2) hline(g, SCR.x + ox, y + oy, SCR.w, '#000000');
      g.globalAlpha = 1;
      if (zm.z > 0) { g.restore(); g.save(); about(g, zm.man, ox, oy, zm.pan + zm.manPan); }
      drawBack(g, lt, amb, act);
      PEOPLE.smoke(g, 352 + ox, 224 + oy, amb, .6, 30);
      // the label loses him as he fills the frame
      g.globalAlpha = 1 - PX.clamp(zm.z * 1.5, 0, 1);
      PEOPLE.aiBox(g, 172 + ox, 208 + oy, 146, 62, PEOPLE.CHARS.giuseppe, false, amb);
      g.globalAlpha = 1;
      if (zm.z > 0) { g.restore(); g.save(); about(g, zm.room, ox, oy, zm.pan); }
      if (bi >= 0) {
        tokenGauge(g, ox, oy, act === 'spent' ? 0 : act === 'turn' ? .04 : tokensAt(bi, lt), lt);
        if (bi >= 2) thoughtBubble(g, ox, oy, bi, act === 'spent' || act === 'turn' ? 99 : lt);   // only once the budget looks thin
      }
      if (zm.z > 0) g.restore();
    }
    return { id: 'desk', init, render, hires };
  })();

  // ---------- the whole thing crashes ----------
  // The point of the cartoon: it was never the topic. The talk falls over, VGA blue,
  // and comes back in a plain style.
  const shotBSOD = (() => {
    const BLUE = '#0000AA', BLUE_AT = .5;
    const LINES = [
      '', '',
      'A PROBLEM HAS BEEN DETECTED AND THE PRESENTATION HAS BEEN SHUT',
      'DOWN TO PREVENT DAMAGE TO THE AUDIENCE.',
      '',
      'DISTRACTED_BY_OWN_DEMO',
      '',
      'IF THIS IS THE FIRST TIME YOU HAVE SEEN THIS STOP ERROR SCREEN:',
      'YOU HAVE JUST WATCHED SIX MINUTES OF PIXEL ART ABOUT MAKING PIXEL',
      'ART, AND NOT ONE MINUTE ABOUT THE ACTUAL TOPIC.',
      '',
      'THE DEMO WAS FUN. THE DEMO WAS NOT THE POINT.',
      '',
      'IF THIS SCREEN APPEARS AGAIN, FOLLOW THESE STEPS:',
      '',
      '- STOP ADDING CAPABILITY FASTER THAN YOU CAN CONTAIN IT.',
      '- DISABLE THE PART OF YOUR HEAD THAT SAYS',
      '  \'BUT LOOK WHAT ELSE IT CAN DO\'.',
      '- RESTART THE TALK IN MINIMAL MODE.',
      '',
      'TECHNICAL INFORMATION:',
      '',
      '*** STOP: 0X000000AI (0XTOKENS, 0X0000BTC, 0XCONTAINMENT, 0XSPEED)',
      '*** ENGINEERING_AS_CONTAINMENT.SYS - ADDRESS 0X0000DEAD',
      '',
      'BEGINNING DUMP OF PHYSICAL MEMORY...',
      'PHYSICAL MEMORY DUMP COMPLETE.',
      '',
      'PRESS ANY KEY TO CONTINUE WITH THE ACTUAL TALK',
    ];
    let blue = null, frozen = null;

    function init() {
      const [c, g] = canvas(W, H);
      rect(g, 0, 0, W, H, BLUE);
      const title = 'WINDOWS', tw = text3Width(title) + 8;
      rect(g, (W - tw) / 2, 16, tw, 9, '#B8B8B8');
      text3(g, title, (W - tw) / 2 + 4, 18, BLUE);
      LINES.forEach((l, i) => text3(g, l, 56, 30 + i * 8, '#FFFFFF'));
      blue = c;
      // the last frame of the cartoon, kept to tear apart on the way out
      const [f, fg] = canvas(W, H);
      shotDesk.render(fg, { x: 0, y: 0 }, 13.8, 13.8, 'replay');
      frozen = f;
    }

    function render(g, cam, amb, lt = 0) {
      if (lt < BLUE_AT) {                                   // the picture tears, then goes
        const k = lt / BLUE_AT, r = rng(7 + Math.floor(lt * 24));
        rect(g, 0, 0, W, H, '#000000');
        for (let y = 0; y < H;) {
          const hh = 2 + Math.floor(r() * 7), sh = Math.round((r() - .5) * 60 * k * k);
          g.drawImage(frozen, 0, y, W, hh, sh, y, W, hh);
          if (r() < .35 * k) rect(g, 0, y, W, hh, r() < .5 ? BLUE : '#E8E8E8');
          y += hh;
        }
        if (k > .86) rect(g, 0, 0, W, H, '#FFFFFF');
        return;
      }
      blit(g, blue, 0, 0);
      if (Math.floor(amb * 2.5) % 2) rect(g, 56 + text3Width(LINES[LINES.length - 1]) + 4, 30 + (LINES.length - 1) * 8, 4, 6, '#FFFFFF');
    }
    return { id: 'bsod', init, render };
  })();

  // ---------- the room, from the back ----------
  // The same view as the photo: we sit with the audience and look at him. Tables gone,
  // chairs turned to face the front, both screens showing this same room. The camera is
  // held by a person, the room is never quite still, and a click sends the microphone to
  // someone with a question.
  const shotRoom = (() => {
    const WALL = '#EDEAE4', FLOOR = '#E4DFD4', PINK = '#BE9191', CHAIR = '#5C7A9E', CHAIR2 = '#8DA2BB';
    const HAIRS = ['#26221F', '#3B2C22', '#5E4632', '#A6A39C', '#1A1A1E', '#7B5A3A', '#C9B28A', '#4A3B30'];
    const TOPS = ['#4C79B2', '#1D1D21', '#8C3A32', '#3F6F5A', '#5B4A7A', '#2E6FA8', '#BFBAB0', '#7A5C3C', '#2F3C4E'];
    const SCREEN = { x: 54, y: 64, w: 142, h: 82 };        // the big one on the pink wall
    const MON2 = { x: 300, y: 92, w: 62, h: 38 };          // the one on wheels
    const PAD = 6;                                         // overscan, so the handheld wobble never shows an edge
    let bg = null, feed = null, feedg = null, deep = null, cast = null;

    // [x, floor y, chair height, seed] — four rows, the near ones wider apart
    const SEATS = [
      [108, 196, 26, 1], [152, 196, 26, 2], [196, 196, 26, 3], [240, 196, 26, 4], [284, 196, 26, 5],
      [86, 215, 32, 6], [141, 215, 32, 7], [196, 215, 32, 8], [251, 215, 32, 9], [306, 215, 32, 10],
      [58, 238, 40, 11], [124, 238, 40, 12], [190, 238, 40, 13], [256, 238, 40, 14], [322, 238, 40, 15],
      [26, 266, 50, 16], [108, 266, 50, 17], [190, 266, 50, 18], [272, 266, 50, 19], [354, 266, 50, 20],
    ];
    const EMPTY = new Set([2, 11, 16]);                     // not a full house
    const STANDERS = [[396, 254, 86, 21, true], [52, 226, 62, 22], [446, 262, 74, 23]];
    const ASKERS = [12, 7, 18];                            // who asks the three questions
    const RUN_FROM = { x: 330, y: 182 };                   // where the microphone starts out
    const askIdx = act => (act && act.startsWith('qa') ? +act.slice(2) - 1 : -1);
    const standHeight = y => 44 + (y - 190) * .36;         // how tall someone is at that depth

    function chairBack(g, x, fy, h, alt) {
      const w = Math.round(h * .64), bh = Math.round(h * .54), by = Math.round(fy - h);
      const col = alt ? CHAIR2 : CHAIR;
      rect(g, x - w / 2, by + 1, w, bh - 1, col);
      rect(g, x - w / 2 + 1, by, w - 2, 2, tint(col, .18));
      [-1, 1].forEach(s => dot(g, x + s * (w / 2 - 1), by + 1, shade(col, .3)));
      vline(g, x - w / 2, by + 2, bh - 2, shade(col, .22));
      vline(g, x + w / 2 - 1, by + 2, bh - 2, shade(col, .28));
      g.globalAlpha = .18; rect(g, x - w / 2 + 2, by + 3, 3, bh - 6, '#FFFFFF'); g.globalAlpha = 1;
      [-1, 1].forEach(s => rect(g, x + s * (w / 2) - (s < 0 ? 2 : 0), by + bh - 4, 3, Math.round(h * .16), '#2E3238'));
      rect(g, x - Math.round(w * .42), by + bh, w - Math.round(w * .16), Math.round(h * .12), shade(col, .18));
      rect(g, x - 1, by + bh + Math.round(h * .1), 3, Math.round(h * .24), '#33363C');
      [-1, -.45, .45, 1].forEach(d => {
        line(g, x, fy - Math.round(h * .1), x + d * (w * .55), fy - 1, '#33363C');
        dot(g, Math.round(x + d * (w * .55)), fy - 1, '#1E2126');
      });
      g.globalAlpha = .12; ellipse(g, x, fy, Math.round(w * .6), 2, '#000000'); g.globalAlpha = 1;
    }

    // Someone seen from behind. `rise` 0..1 lifts them out of the chair and onto their feet.
    function backOfHead(g, x, fy, h, c, o = {}) {
      const standing = !!o.standing || (o.rise || 0) > 0;
      const rise = o.standing ? 1 : (o.rise || 0);       // already up, or getting there
      const sh = (o.tall || standHeight(fy)) * (standing ? .58 + .42 * rise : 1);
      const hr = Math.max(3, Math.round((standing ? sh : h) * (standing ? .12 : .16)));   // heads do not scale with height
      const hy = Math.round(standing ? fy - sh + hr : fy - h * 1.24);
      const top = o.top || c.top;
      if (standing) {
        const by = Math.round(fy - sh * .46);
        if (!o.rise || rise > .55) {
          rect(g, x - 4, by, 3, fy - by - 2, c.trousers || '#39404E');
          rect(g, x + 2, by, 3, fy - by - 2, c.trousers || '#39404E');
          rect(g, x - 5, fy - 2, 5, 2, o.shoes || c.shoes || '#2A2A2E');
          rect(g, x + 1, fy - 2, 5, 2, o.shoes || c.shoes || '#2A2A2E');
        }
        rect(g, x - Math.round(sh * .17), hy + hr, Math.round(sh * .34), by - hy - hr + 2, top);
        ellipse(g, x, hy + hr + 1, Math.round(sh * .17), 2, top);
      } else {
        ellipse(g, x, hy + hr + 4, Math.round(h * .34), Math.round(h * .16), top);
      }
      ellipse(g, x, hy, hr, hr + 1, c.skin || '#E7B189');
      if (o.cap) {                                        // a cap, not a helmet: crown, band, strap
        ellipse(g, x, hy - Math.round(hr * .3), hr + 1, Math.round(hr * .9), o.cap);
        rect(g, x - hr - 1, hy + Math.round(hr * .2), (hr + 1) * 2, Math.max(2, Math.round(hr * .22)), shade(o.cap, .2));
        rect(g, x - Math.round(hr * .45), hy + Math.round(hr * .3), Math.round(hr * .9), 2, shade(o.cap, .38));
      } else {
        ellipse(g, x, hy - 1, hr, hr, c.hair);
        ellipse(g, x, hy + hr - 2, hr - 1, 2, shade(c.hair, .2));
      }
      if (o.mic) {                                          // holding it, listening to himself
        rect(g, x + hr + 1, hy - 1, 2, 5, '#2E3238');
        ellipse(g, x + hr + 2, hy - 2, 2, 2, '#4A5058');
        ellipse(g, x + hr + 2, hy + 5, 2, 2, c.skin || '#E7B189');
      }
      return { hy, hr, sh: standing ? sh : h };
    }

    // The runner, walking the microphone over.
    function runner(g, x, fy, k, walking, amb) {
      const h = standHeight(fy), sw = walking && Math.floor(amb * 7) % 2 ? 1 : 0;
      const hr = Math.round(h * .17), hy = Math.round(fy - h + hr), by = Math.round(fy - h * .46);
      rect(g, x - 4 - sw, by, 3, fy - by - 2, '#3A4150'); rect(g, x + 2 + sw, by, 3, fy - by - 2, '#3A4150');
      rect(g, x - 5 - sw, fy - 2, 5, 2, '#26262A'); rect(g, x + 1 + sw, fy - 2, 5, 2, '#26262A');
      rect(g, x - Math.round(h * .16), hy + hr, Math.round(h * .32), by - hy - hr + 2, '#4A4F57');
      ellipse(g, x, hy, hr, hr + 1, '#D9A87C');
      ellipse(g, x, hy - 1, hr, hr, '#2A211C');
      const ax = x + hr + 2, ay = hy + 4 - (k > .9 ? 3 : 0);    // the arm holding it out
      line(g, x + hr - 1, hy + 6, ax, ay, '#4A4F57');
      rect(g, ax, ay - 4, 2, 5, '#2E3238'); ellipse(g, ax + 1, ay - 5, 2, 2, '#4A5058');
    }

    // Him, down the far end, pacing gently while he talks.
    function speaker(g, x, fy, t, still) {
      const lift = !still && Math.sin(t * 1.6) > .3 ? 1 : 0;
      const step = !still && Math.abs(Math.cos(t * .22)) > .3 && Math.floor(t * 5) % 2 ? 1 : 0;
      const SHIRT = '#A8382F';
      rect(g, x - 6 - step, fy - 22, 5, 22, '#2E3440'); rect(g, x + 2 + step, fy - 22, 5, 22, '#2E3440');
      rect(g, x - 7 - step, fy - 2, 6, 2, '#241F1C'); rect(g, x + 2 + step, fy - 2, 6, 2, '#241F1C');
      rect(g, x - 9, fy - 44, 18, 23, SHIRT);
      ellipse(g, x, fy - 43, 9, 4, '#B94238');
      vline(g, x - 9, fy - 44, 23, tint(SHIRT, .12));
      vline(g, x + 8, fy - 44, 23, shade(SHIRT, .24));
      for (let a = 0; a < 3; a++) {
        line(g, x - 9, fy - 40 + a, x - 15, fy - 30 + lift + a, SHIRT);
        line(g, x + 8, fy - 40 + a, x + 14, fy - 31 - lift + a, SHIRT);
      }
      ellipse(g, x - 16, fy - 29 + lift, 3, 3, '#E7B189');
      rect(g, x - 18, fy - 36 + lift, 4, 8, '#2E3238'); ellipse(g, x - 16, fy - 37 + lift, 3, 3, '#4A5058');
      ellipse(g, x + 15, fy - 30 - lift, 3, 3, '#E7B189');
      ellipse(g, x, fy - 52, 7, 7, '#E7B189');
      ellipse(g, x, fy - 55, 7, 4, '#EFC098');
      ellipse(g, x, fy - 47, 7, 4, '#DEDAD2');
      ellipse(g, x - 7, fy - 51, 2, 3, '#DEDAD2'); ellipse(g, x + 7, fy - 51, 2, 3, '#DEDAD2');
      dot(g, x - 3, fy - 53, '#26221F'); dot(g, x + 2, fy - 53, '#26221F');
      rect(g, 192, fy - 26, 16, 3, '#3A3F45');              // his laptop stays put
      rect(g, 198, fy - 23, 3, 21, '#4A5058');
      rect(g, 192, fy - 33, 16, 7, '#2E3238'); rect(g, 193, fy - 32, 14, 5, '#8FA8C4');
    }

    function drawBg(g) {
      rect(g, -PAD, -PAD, W + PAD * 2, 52 + PAD, '#F3F1ED');
      for (let i = 0; i < 9; i++) { const y = Math.round(50 - i * i * .62 - i * 1.4); hline(g, -PAD, y, W + PAD * 2, '#E3E1DB'); }
      [10, 30].forEach((y, i) => {
        rect(g, 12 + i * 8, y, W - 24 - i * 16, 3, '#3A3D42');
        for (let x = 36 + i * 18; x < W - 24; x += 56 - i * 8) {
          rect(g, x, y + 3, 5, 5, '#2E3136'); ellipse(g, x + 2, y + 8, 3, 2, '#FFF6D8');
        }
      });
      rect(g, -PAD, 52, W + PAD * 2, 122, WALL);
      A.speckle(g, 0, 52, W, 112, ['#E7E3DC', '#F4F1EB'], .04, 31);
      rect(g, 22, 56, 216, 106, PINK);
      A.speckle(g, 22, 56, 216, 106, [shade(PINK, .06), tint(PINK, .06)], .05, 17);
      rect(g, 22, 56, 216, 2, tint(PINK, .14));
      rect(g, 30, 146, 200, 16, shade(PINK, .16));
      hline(g, 30, 146, 200, tint(PINK, .06));
      rect(g, SCREEN.x - 4, SCREEN.y - 4, SCREEN.w + 8, SCREEN.h + 8, '#26282C');
      rect(g, SCREEN.x - 4, SCREEN.y - 4, SCREEN.w + 8, 2, '#4A4E54');
      rect(g, -PAD, 164, W + PAD * 2, 106 + PAD, FLOOR);
      A.speckle(g, 0, 164, W, 106, ['#DAD4C8', '#EDE8DE'], .05, 32);
      g.globalAlpha = .35; rect(g, -PAD, 164, W + PAD * 2, 14, '#D2CCC0'); g.globalAlpha = 1;
      rect(g, 4, 60, 26, 11, '#2E7D4F'); PX.text3(g, 'EXIT', 11, 63, '#EAF7EE');
      rect(g, 2, 74, 18, 88, '#DCD6CC'); A.frameBox(g, 2, 74, 18, 88, '#C2BBAF', 1);
      // the paper, ready for what comes next
      rect(g, 244, 90, 34, 58, '#F7F5F0'); A.frameBox(g, 244, 90, 34, 58, '#C4BEB2', 1);
      rect(g, 246, 90, 30, 3, '#B8B2A6');
      const [qc, qg] = canvas(16, 7);
      PX.text3(qg, 'Q&A', 0, 0, '#2B3E6B');
      g.drawImage(qc, 0, 0, 16, 7, 250, 104, 32, 14);
      line(g, 250, 122, 272, 122, '#C86B60');
      line(g, 252, 132, 266, 132, '#9A948A'); line(g, 252, 138, 270, 138, '#9A948A');
      line(g, 248, 148, 244, 176, '#9A948A'); line(g, 274, 148, 278, 176, '#9A948A');
      for (let x = 278; x < W + PAD; x++) {
        const k = (x - 278) / (W - 278);
        const top = Math.round(46 - k * 30), bot = Math.round(172 + k * 46);
        vline(g, x, top, bot - top, mix('#E6F1FB', '#D2E4F6', k * .7));
      }
      let mx = 280, gap = 12;
      while (mx < W + PAD) {
        const k = (mx - 278) / (W - 278);
        vline(g, mx, Math.round(46 - k * 30), Math.round(126 + k * 76), '#A9B8C6');
        mx += gap; gap *= 1.26;
      }
      for (let x = 282; x < W + PAD; x += 9) {
        const k = (x - 278) / (W - 278);
        g.globalAlpha = .3 + (x % 18 ? 0 : .2);
        vline(g, x, Math.round(46 - k * 30), Math.round(126 + k * 76), '#FFFFFF');
        g.globalAlpha = 1;
      }
      line(g, 278, 46, W + PAD, 15, '#C8C3BA');
      line(g, 278, 172, W + PAD, 219, '#C8C3BA');
      vline(g, 278, 46, 126, '#C8C3BA');
      const px = 432, py = 208;
      rect(g, px - 11, py - 18, 22, 18, '#9A8E7E'); rect(g, px - 11, py - 18, 22, 3, '#B4A895');
      const pr = rng(88);
      for (let i = 0; i < 26; i++) {
        const a = -Math.PI / 2 + (pr() - .5) * 2.7, len = 14 + pr() * 30;
        const ex = px + Math.cos(a) * len, ey = py - 18 + Math.sin(a) * len * .85;
        line(g, px, py - 18, ex, ey, '#3C6B3E');
        ellipse(g, ex, ey, 5, 2, pr() < .5 ? '#4E8A4A' : '#3E7340');
      }
      rect(g, MON2.x + MON2.w / 2 - 2, MON2.y + MON2.h, 4, 74, '#3A3F45');
      rect(g, MON2.x + MON2.w / 2 - 16, MON2.y + MON2.h + 74, 32, 4, '#2E3238');
      rect(g, MON2.x - 3, MON2.y - 3, MON2.w + 6, MON2.h + 6, '#26282C');
      SEATS.forEach(([x, fy, h], i) => chairBack(g, x, fy, h, i % 3 === 1));
    }

    // Nobody sits perfectly still: a slow sway, and a round of giggling at the start.
    function seatState(i, lt, amb, settled) {
      const [x, fy, h, seed] = SEATS[i];
      const ph = seed * 1.37;
      const sway = Math.sin(amb * .7 + ph) * 1.1 + Math.sin(amb * .27 + ph * 2) * .7;
      const g0 = .4 + (seed % 5) * .5;                     // his own little burst of laughter
      const giggling = !settled && lt > g0 && lt < g0 + 1.3;
      const lean = giggling ? (i % 2 ? 2.2 : -2.2) : 0;
      const bob = giggling ? Math.abs(Math.sin(amb * 9 + ph)) * 1.4 : Math.sin(amb * 1.1 + ph) * .5;
      return { x: Math.round(x + sway + lean), fy: Math.round(fy - bob), h, seed };
    }

    function drawPeople(g, ox, oy, lt, amb, ask, still) {
      const prev = ask > 0 ? ASKERS[ask - 1] : -1;
      SEATS.forEach(([x0, fy0, h0], i) => {
        if (EMPTY.has(i)) return;
        const st = still ? { x: x0, fy: fy0, h: h0 } : seatState(i, lt, amb, ask >= 0);
        let o = {};
        if (ask >= 0 && i === ASKERS[ask]) {
          const rise = PX.ease.out(PX.clamp((lt - .5) / .9, 0, 1));
          o = { rise, mic: lt > 3.1 };
        } else if (i === prev) {
          o = { rise: 1 - PX.ease.inOut(PX.clamp(lt / .7, 0, 1)) };
          if (o.rise < .05) o = {};
        }
        backOfHead(g, st.x + ox, st.fy + oy, st.h, cast[i], o);
      });
      STANDERS.forEach(([x, fy, h, seed, cap], n) => {
        const sway = still ? 0 : Math.sin(amb * .6 + seed) * 1.2;
        backOfHead(g, Math.round(x + sway) + ox, fy + oy, h, cast[20 + n],
          { standing: true, tall: h, cap: cap ? '#F2C21B' : null, shoes: cap ? '#F2C21B' : null });
      });
      if (ask >= 0) {                                       // the microphone, on its way over
        const [sx, sy] = SEATS[ASKERS[ask]];
        const k = PX.ease.inOut(PX.clamp((lt - .4) / 2.5, 0, 1));
        const rx = RUN_FROM.x + (sx + 30 - RUN_FROM.x) * k, ry = RUN_FROM.y + (sy - RUN_FROM.y) * k;
        runner(g, Math.round(rx) + ox, Math.round(ry) + oy, k, k > 0 && k < 1, amb);
      }
    }

    const TAGS = [
      [0, 'YUNFEI', 95, 0], [3, 'LISA', 93, 10], [4, 'SHWETHA', 91, 0],
      [5, 'CONSTANZA', 88, 0], [6, 'IREM', 87, 12], [7, '0XC4FE', 7, 10], [8, 'NASTIA', 89, 0], [9, 'BRIAN', 86, 0],
      [10, 'PAUL', 90, 0], [12, 'K7#R2LA', 11, 12], [13, 'MICHELE', 76, 0], [14, 'UTKAN', 99, 0],
      [15, 'EMA', 81, 0], [17, 'CARO', 74, 0], [18, 'N0_M4TCH', 3, 0], [19, 'BILAL', 82, 0],
    ];

    // One copy of the room for the screens: still, and without the boxes.
    function paint(g, inner) {
      blit(g, bg, -PAD, -PAD);
      if (inner) {
        g.drawImage(inner, 0, 0, W, H, SCREEN.x, SCREEN.y, SCREEN.w, SCREEN.h);
        g.drawImage(inner, 0, 0, W, H, MON2.x, MON2.y, MON2.w, MON2.h);
      } else {
        rect(g, SCREEN.x, SCREEN.y, SCREEN.w, SCREEN.h, '#191C20');
        rect(g, MON2.x, MON2.y, MON2.w, MON2.h, '#191C20');
      }
      drawPeople(g, 0, 0, 99, 0, -1, true);
      speaker(g, 176, 182, 0, true);
    }

    function init() {
      let [c, g] = canvas(W + PAD * 2, H + PAD * 2); g.translate(PAD, PAD); drawBg(g); bg = c;
      cast = [...SEATS, ...STANDERS].map(([, , , seed]) => {
        const r = rng(seed * 733 + 5);
        return { hair: HAIRS[Math.floor(r() * HAIRS.length)], top: TOPS[Math.floor(r() * TOPS.length)],
          skin: ['#E7B189', '#D9A87C', '#C68B5E', '#8D5C3B', '#EFC7A2'][Math.floor(r() * 5)] };
      });
      [deep] = PX.canvas(W, H);
      paint(deep.getContext('2d'), null);
      [feed, feedg] = PX.canvas(W, H);
    }

    // the camera is in someone's hands; the overlay has to move with it
    const shake = amb => ({
      x: Math.round(Math.sin(amb * 2.1) * 1.1 + Math.sin(amb * .77 + 1.3) * 1.4 + Math.sin(amb * .23) * 1.5),
      y: Math.round(Math.sin(amb * 1.7 + .6) * .9 + Math.sin(amb * .41 + 2.2) * 1.1),
    });
    const QR = { x: 386, y: 16, w: 78 };                 // top right, in world pixels

    // the real qr code, on the layer above the pixels so a phone can still read it
    function hires(g, cam, amb) {
      const sh = shake(amb);
      HIRES.draw(g, 'qr', 0, QR.x - cam.x + sh.x, QR.y - cam.y + sh.y, QR.w, QR.w);
    }

    function render(g, cam, amb, lt = 0, act = 'idle') {
      const ask = askIdx(act);
      const sh = shake(amb), jx = sh.x, jy = sh.y;
      const ox = -cam.x + jx, oy = -cam.y + jy;
      const sx = 176 + Math.sin(amb * .22) * 13;            // he paces while he talks
      // the screens, live
      feedg.clearRect(0, 0, W, H);
      blit(feedg, bg, -PAD, -PAD);
      feedg.drawImage(deep, 0, 0, W, H, SCREEN.x, SCREEN.y, SCREEN.w, SCREEN.h);
      feedg.drawImage(deep, 0, 0, W, H, MON2.x, MON2.y, MON2.w, MON2.h);
      drawPeople(feedg, 0, 0, lt, amb, ask, false);
      speaker(feedg, sx, 182, amb, false);

      blit(g, bg, ox - PAD, oy - PAD);
      g.drawImage(feed, 0, 0, W, H, SCREEN.x + ox, SCREEN.y + oy, SCREEN.w, SCREEN.h);
      g.drawImage(feed, 0, 0, W, H, MON2.x + ox, MON2.y + oy, MON2.w, MON2.h);
      g.globalAlpha = .1; rect(g, SCREEN.x + ox, SCREEN.y + oy, SCREEN.w, SCREEN.h, '#FFFFFF'); g.globalAlpha = 1;
      drawPeople(g, ox, oy, lt, amb, ask, false);
      speaker(g, sx, 182, amb, false);

      // the AI works the room, one guess at a time
      TAGS.forEach(([i, label, pct, dy], n) => {
        const at = ask >= 0 ? 0 : .6 + n * .26;
        if (lt < at) return;
        const st = seatState(i, lt, amb, ask >= 0), h = SEATS[i][2];
        const bw = Math.round(h * .7), bh = Math.round(h * .92);
        PEOPLE.aiBox(g, st.x - bw / 2 + ox, st.fy - h * 1.42 + oy, bw, bh,
          { label, pct, jitter: pct < 40 ? 9 : 1, labelDy: dy }, lt < at + .5, amb);
      });
      if (lt > 2.2 || ask >= 0) PEOPLE.aiBox(g, 376 + ox, 164 + oy, 40, 92, { label: 'CLAUDIO', pct: 100, jitter: 0, labelDy: 0 }, false, amb);
      if (lt > 4.6 || ask >= 0) PEOPLE.aiBox(g, Math.round(sx) - 16 + ox, 126 + oy, 34, 58, PEOPLE.CHARS.giuseppe, false, amb);
      // a white card behind the code, so it reads against the wall
      rect(g, QR.x - 5 + ox, QR.y - 5 + oy, QR.w + 10, QR.w + 10, '#FFFFFF');
      A.frameBox(g, QR.x - 5 + ox, QR.y - 5 + oy, QR.w + 10, QR.w + 10, '#C4CCD6', 1);
    }
    return { id: 'room', init, render, hires };
  })();

  return { sky: shot1, plaza: shot2, street: shot3, table: shot4, lift: shotLift, desk: shotDesk, bsod: shotBSOD, room: shotRoom };
})();
