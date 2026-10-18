// The pipeline as one tube, after Andrew Murphy's: one system the work flows through, width is capacity,
// thin dotted dividers between the areas of work. Scene C, the silos and the close all draw this same tube.
// Needs lib.js.
const TUBE = {
  y: 300, idea: 230, users: 1690, x0: 300, x1: 1620, blend: 22,
  areas: ['business', 'discovery', 'design', 'code', 'review', 'QA', 'CI / CD', 'operations'],
  CODE: 3, REVIEW: 4,
};
TUBE.n = TUBE.areas.length;
TUBE.w = (TUBE.x1 - TUBE.x0) / TUBE.n;
TUBE.left = i => TUBE.x0 + i * TUBE.w;
TUBE.mid = i => TUBE.x0 + (i + .5) * TUBE.w;

// Half the tube's height at x, for per-area heights H, blended smoothly across each divider.
TUBE.half = (H, x) => {
  const { x0, w, n, blend } = TUBE, k = Math.round((x - x0) / w), b = x0 + k * w;
  if (k > 0 && k < n && Math.abs(x - b) < blend) { const t = (x - b + blend) / (2 * blend); return (H[k - 1] + (H[k] - H[k - 1]) * t * t * (3 - 2 * t)) / 2; }
  return H[Math.min(n - 1, Math.max(0, Math.floor((x - x0) / w)))] / 2;
};
// Where an area's label sits: above the tube, never lower than a 110-high section would put it.
TUBE.labelY = h => TUBE.y - Math.max(h, 110) / 2 - 30;

// Builds the tube into parent and returns { g, labels, set }.
// set(H, { hot, hotOn, walls, wallH }): per-area heights; the narrow area to darken and how much (0..1);
// how far the dividers have risen into walls (0..1) and how tall the walls are.
function buildTube(parent) {
  const { y: Y, n } = TUBE, g = el('g', {}, parent);
  const line = { stroke: grey(229), 'stroke-width': 10, 'stroke-linecap': 'round' };
  el('line', { x1: TUBE.idea, y1: Y, x2: TUBE.x0, y2: Y, ...line }, g);
  el('line', { x1: TUBE.x1, y1: Y, x2: TUBE.users, y2: Y, ...line }, g);
  const fill = el('path', { fill: grey(250) }, g);
  const hotFill = el('path', { fill: grey(241), opacity: 0 }, g);
  const edge = { fill: 'none', 'stroke-linejoin': 'round' };
  const top = el('path', { stroke: grey(196), 'stroke-width': 5, ...edge }, g), bot = el('path', { stroke: grey(196), 'stroke-width': 5, ...edge }, g);
  const hotTop = el('path', { stroke: grey(130), 'stroke-width': 6, opacity: 0, ...edge }, g), hotBot = el('path', { stroke: grey(130), 'stroke-width': 6, opacity: 0, ...edge }, g);
  const dividers = Array.from({ length: n - 1 }, () => ({
    dots: el('line', { stroke: grey(214), 'stroke-width': 3, 'stroke-dasharray': '3 8' }, g),
    wall: el('rect', { width: 10, fill: grey(196), opacity: 0 }, g),
  }));
  const labels = TUBE.areas.map(a => {
    const t = el('text', { 'text-anchor': 'middle', 'font-size': 24, 'font-weight': 600, fill: grey(130), 'stroke-width': 8 }, g);
    t.textContent = a; return t;
  });
  const span = (H, a, b) => { const pts = []; for (let x = a; x <= b + .01; x += 3) pts.push([x, TUBE.half(H, x)]); return pts; };
  const poly = pts => 'M' + pts.map(p => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L');

  function set(H, { hot = -1, hotOn = 0, walls = 0, wallH = 400 } = {}) {
    const pts = span(H, TUBE.x0, TUBE.x1);
    const up = pts.map(([x, h]) => [x, Y - h]), down = pts.map(([x, h]) => [x, Y + h]);
    fill.setAttribute('d', poly(up.concat(down.slice().reverse())) + ' Z');
    top.setAttribute('d', poly(up)); bot.setAttribute('d', poly(down));
    if (hot >= 0) {
      const a = TUBE.left(hot) + TUBE.blend, b = TUBE.left(hot + 1) - TUBE.blend, hp = span(H, a, b);
      const hu = hp.map(([x, h]) => [x, Y - h]), hd = hp.map(([x, h]) => [x, Y + h]);
      hotFill.setAttribute('d', poly(hu.concat(hd.slice().reverse())) + ' Z');
      hotTop.setAttribute('d', poly(hu)); hotBot.setAttribute('d', poly(hd));
    }
    [hotFill, hotTop, hotBot].forEach(p => p.setAttribute('opacity', hot >= 0 ? hotOn : 0));
    dividers.forEach((d, i) => {
      const x = TUBE.left(i + 1), h = TUBE.half(H, x), wh = h * 2 + (wallH - h * 2) * walls;
      d.dots.setAttribute('x1', x); d.dots.setAttribute('x2', x); d.dots.setAttribute('y1', Y - h + 7); d.dots.setAttribute('y2', Y + h - 7);
      d.dots.setAttribute('opacity', 1 - clamp(walls * 3));
      d.wall.setAttribute('x', x - 5); d.wall.setAttribute('y', Y - wh / 2); d.wall.setAttribute('height', wh);
      d.wall.setAttribute('opacity', clamp(walls * 3));
    });
    labels.forEach((t, i) => {
      t.setAttribute('x', TUBE.mid(i));
      t.setAttribute('y', TUBE.labelY(H[i]) + (Y - wallH / 2 - 26 - TUBE.labelY(H[i])) * clamp(walls));
      t.setAttribute('fill', grey(Math.round(i === hot ? 130 - 60 * hotOn : 130)));
    });
  }
  return { g, labels, set };
}
