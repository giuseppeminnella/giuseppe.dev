/* Real footage on top of the pixel art. The canvas below is 480x270 blown up 4x; this
   layer is the full 1920x1080, drawn smooth, so a photo or a gif keeps its own grain
   instead of being crushed onto the pixel grid.
   Sprite sheets are built from the gifs in the June deck (see assets/README). */
window.HIRES = (() => {
  const SCALE = 4;                 // world pixel -> stage pixel
  const FEATHER = .1;              // fraction of each edge faded out, so it sits in the cloud

  const SHEETS = {
    travolta: { src: 'assets/travolta.png', fw: 220, fh: 164, cols: 7, n: 35, fps: 10 },
    qr: { src: 'assets/qr-linkedin.png', fw: 348, fh: 350, cols: 1, n: 1, fps: 1, hard: true },
  };

  Object.values(SHEETS).forEach(s => {
    s.img = new Image();
    s.img.src = s.src;
    s.img.onload = () => { s.ok = true; };
    [s.pad, s.padg] = PX.canvas(s.fw, s.fh);
  });

  // One mask per sheet size: opaque in the middle, fading out at the edges.
  function mask(s) {
    if (s.mask) return s.mask;
    const [c, g] = PX.canvas(s.fw, s.fh);
    g.fillStyle = '#fff'; g.fillRect(0, 0, s.fw, s.fh);
    g.globalCompositeOperation = 'destination-out';
    const fx = s.fw * FEATHER, fy = s.fh * FEATHER;
    const edge = (x0, y0, x1, y1, rx, ry, rw, rh) => {
      const grd = g.createLinearGradient(x0, y0, x1, y1);
      grd.addColorStop(0, 'rgba(0,0,0,1)'); grd.addColorStop(1, 'rgba(0,0,0,0)');
      g.fillStyle = grd; g.fillRect(rx, ry, rw, rh);
    };
    edge(0, 0, fx, 0, 0, 0, fx, s.fh);
    edge(s.fw, 0, s.fw - fx, 0, s.fw - fx, 0, fx, s.fh);
    edge(0, 0, 0, fy, 0, 0, s.fw, fy);
    edge(0, s.fh, 0, s.fh - fy, 0, s.fh - fy, s.fw, fy);
    s.mask = c;
    return c;
  }

  const ready = name => !!SHEETS[name]?.ok;

  /* Draw one frame of `name` into a box given in world (480x270) coordinates.
     t is seconds since the clip should have started; it loops. */
  function draw(g, name, t, wx, wy, ww, wh, alpha = 1) {
    const s = SHEETS[name];
    if (!s || !s.ok) return false;
    const f = Math.floor(Math.max(0, t) * s.fps) % s.n;
    const sx = (f % s.cols) * s.fw, sy = Math.floor(f / s.cols) * s.fh;
    s.padg.clearRect(0, 0, s.fw, s.fh);
    s.padg.drawImage(s.img, sx, sy, s.fw, s.fh, 0, 0, s.fw, s.fh);
    if (!s.hard) {                                       // a qr code must keep its edges
      s.padg.globalCompositeOperation = 'destination-in';
      s.padg.drawImage(mask(s), 0, 0);
      s.padg.globalCompositeOperation = 'source-over';
    }
    g.save();
    g.globalAlpha = alpha;
    g.imageSmoothingEnabled = true;
    g.drawImage(s.pad, wx * SCALE, wy * SCALE, ww * SCALE, wh * SCALE);
    g.restore();
    return true;
  }

  return { draw, ready, SCALE };
})();
