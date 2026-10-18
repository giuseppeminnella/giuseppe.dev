// A source on screen: a crop of the original page with the hand-made marker over the words that matter, the address
// above it, and a QR code to read it in full. Any scene can show where a claim comes from with it.
// The crops and the line boxes of the marked words come from tools/capture-sources.mjs (see tools/sources.json).
// Needs lib.js and ../assets/sources/sources.js.
//
//   const card = buildSource(svg, 'anthropic-say-no', { x: 150, y: 60, w: 1100, qr: '../assets/qr/anthropic-source-control.svg' });
//   in frame(ms): card.show(opacity); card.mark(0..1)   (the marks reveal in reading order)
function buildSource(parent, name, { x, y, w, qr, qrSize = 190, qrLabel = 'read it', mkop = 60, seed = 11 }) {
  const S = SOURCES[name], k = w / S.w, h = S.h * k, uid = 'src-' + name;
  const g = el('g', { opacity: 0, display: 'none' }, parent);
  const defs = el('defs', {}, g);
  const head = 40;   // room for the address line above the crop

  // the address: site, title, date
  const cite = el('text', { x, y: y + 24, 'font-size': 22, 'font-weight': 600, fill: grey(150), 'stroke-width': 0 }, g);
  cite.textContent = `${S.site} · ${S.title} · ${S.date}`;

  // the crop; a crop that stops mid-paragraph fades out at the bottom, so it reads as a passage from a longer page
  const img = { href: `../assets/sources/${name}.png`, x, y: y + head, width: w, height: h, preserveAspectRatio: 'none' };
  if (S.cut) {
    const lg = el('linearGradient', { id: uid + '-fade', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    [[0, 1], [.62, 1], [1, 0]].forEach(([o, a]) => el('stop', { offset: o, 'stop-color': '#fff', 'stop-opacity': a }, lg));
    const m = el('mask', { id: uid + '-mask', maskUnits: 'userSpaceOnUse', x, y: y + head, width: w, height: h }, defs);
    el('rect', { x, y: y + head, width: w, height: h, fill: `url(#${uid}-fade)` }, m);
    img.mask = `url(#${uid}-mask)`;
  }
  el('image', img, g);

  // the marks: one hand-made stroke per line, across the middle of the letters
  const lines = S.marks.flat().map(l => ({ x: x + l.x * k, y: y + head + (l.y + l.h * .56) * k, w: l.w * k, h: l.h * k }));
  const total = lines.reduce((a, l) => a + l.w, 0);
  lines.forEach((l, i) => {
    const guide = el('path', { d: `M${l.x + l.h * .3} ${l.y} L${l.x + l.w - l.h * .12} ${l.y}`, fill: 'none', stroke: 'none' }, g);   // the chisel tip overhangs: start inside the first letter
    const m = el('mask', { id: `${uid}-m${i}`, maskUnits: 'userSpaceOnUse', x: -1e4, y: -1e4, width: 2e4, height: 2e4 }, defs);
    l.rect = el('rect', { x: l.x - 30, y: l.y - 80, height: 160, width: 0, fill: '#fff' }, m);
    const mk = el('g', { class: 'mk', mask: `url(#${uid}-m${i})` }, g);
    markerPolygons(guide, { width: l.h * 1.08, jitter: l.h * .08, seed: seed + i })
      .forEach(pts => el('polygon', { points: pts, fill: 'var(--hl)', 'fill-opacity': mkop / 100 }, mk));
  });

  // the QR code, right-aligned on the frame's margin, level with the crop
  if (qr) {
    const qx = 1770 - qrSize;
    el('image', { href: qr, x: qx, y: y + head, width: qrSize, height: qrSize }, g);
    const t = el('text', { x: qx + qrSize / 2, y: y + head + qrSize + 34, 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 600, fill: grey(160), 'stroke-width': 0 }, g);
    t.textContent = qrLabel;
  }

  return {
    g, height: head + h,
    show(o) { g.setAttribute('opacity', o); g.setAttribute('display', o > .001 ? 'inline' : 'none'); },
    mark(t) { let left = t * total; lines.forEach(l => { l.rect.setAttribute('width', (l.w + 60) * clamp(left / l.w)); left -= l.w; }); },
  };
}
