// Shared helpers for the style frames. These move into the Remotion scaffold later.

// Deterministic random, so hand-made things look the same every time.
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Point and unit tangent at distance s along a path, extrapolated past both ends.
function at(path, s, L) {
  const c = Math.min(Math.max(s, 0), L);
  const p = path.getPointAtLength(c);
  const q = path.getPointAtLength(Math.min(c + 1, L));
  const o = path.getPointAtLength(Math.max(c - 1, 0));
  let tx = q.x - o.x, ty = q.y - o.y;
  const n = Math.hypot(tx, ty) || 1; tx /= n; ty /= n;
  const e = s - c;
  return { x: p.x + tx * e, y: p.y + ty * e, tx, ty };
}

// A chisel-tip marker stroke that follows a path, a bit off and a bit wobbly.
// Long paths get two strokes that overlap, like a hand lifting and going again.
// trimEnd: stop this far before the end of the path (chisel tip included), e.g. to stay clear of a dot.
function markerPolygons(path, { width = 48, jitter = 6, seed = 1, trimEnd = 0 } = {}) {
  const L = path.getTotalLength();
  const r = rng(seed);
  const parts = L > 900 ? [[0, L * .55 + 26], [L * .55 - 26, L]] : [[0, L]];
  return parts.map(([a, b], i) => {
    const p1 = r() * 6.28, p2 = r() * 6.28, p3 = r() * 6.28;
    const bias = (r() - .5) * 9;
    const s0 = a - (i === 0 ? 4 + r() * 16 : 0);
    const tail = r();
    const s1 = i < parts.length - 1 ? b
      : trimEnd ? b - trimEnd - width * .32 - tail * 8
      : b - 6 + tail * 18;
    const n = Math.max(8, Math.ceil((s1 - s0) / 10));
    const left = [], right = [];
    for (let k = 0; k <= n; k++) {
      const s = s0 + (s1 - s0) * k / n;
      const { x, y, tx, ty } = at(path, s, L);
      const nx = -ty, ny = tx;
      const off = bias + jitter * (.65 * Math.sin(s / 110 + p1) + .35 * Math.sin(s / 37 + p2));
      const hw = width / 2 * (1 + .07 * Math.sin(s / 60 + p3));
      const cx = x + nx * off, cy = y + ny * off;
      const slant = (k === 0 || k === n) ? width * .32 : 0;   // chisel cut, same angle at both ends
      left.push([cx + nx * hw + tx * slant, cy + ny * hw + ty * slant]);
      right.push([cx - nx * hw - tx * slant, cy - ny * hw - ty * slant]);
    }
    return left.concat(right.reverse()).map(p => p.map(v => v.toFixed(1)).join(',')).join(' ');
  });
}

const NS = 'http://www.w3.org/2000/svg';
const el = (tag, attrs = {}, parent) => {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
};

const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;   // in-out, no overshoot
const swipe = t => 1 - Math.pow(1 - t, 2.4);                                      // fast start, soft landing
const clamp = v => Math.min(1, Math.max(0, v));
const grey = v => `rgb(${v},${v},${v})`;

// Smooth path through points (Catmull-Rom as cubic Beziers).
function smooth(pts) {   // Catmull-Rom through points, as cubic Beziers
  const P_ = i => pts[Math.min(Math.max(i, 0), pts.length - 1)];
  let d = `M${pts[0].map(v => v.toFixed(1))}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = P_(i - 1), p1 = P_(i), p2 = P_(i + 1), p3 = P_(i + 2);
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1.map(v => v.toFixed(1))} ${c2.map(v => v.toFixed(1))} ${p2.map(v => v.toFixed(1))}`;
  }
  return d;
}

// One AI try towards a target at (0, 0): approach, miss on one side, overshoot, then circle without closing in.
// The final try lands at distance `land`. Returns { d, pass }; pass is the closest point on the approach.
function tryPath(P0, tr, seed, land) {
  const r = rng(seed);
  const L = Math.hypot(P0[0], P0[1]), u = [-P0[0] / L, -P0[1] / L];   // towards the target
  const n = [-u[1] * tr.side, u[0] * tr.side];                           // the side it misses on
  const at2 = (a, b) => [P0[0] + u[0] * L * a + n[0] * L * b, P0[1] + u[1] * L * a + n[1] * L * b];
  if (tr.final) return { d: smooth([P0, at2(.5, .12), [-u[0] * land, -u[1] * land]]) };   // it lands
  const pass = [n[0] * tr.miss, n[1] * tr.miss];
  const pts = [P0, at2(.55, .06), pass,
    [u[0] * tr.r[1] * 1.15 + n[0] * tr.miss * .4, u[1] * tr.r[1] * 1.15 + n[1] * tr.miss * .4]];
  let ang = Math.atan2(pts[3][1], pts[3][0]);
  for (let j = 1, steps = Math.round(tr.turns * 8); j <= steps; j++) {   // circling, never closing in
    ang += -tr.side * Math.PI / 4 * (.85 + r() * .3);
    const rad = tr.r[0] + (tr.r[1] - tr.r[0]) * r();
    pts.push([Math.cos(ang) * rad * 1.25, Math.sin(ang) * rad * .82]);
  }
  return { d: smooth(pts), pass };
}
