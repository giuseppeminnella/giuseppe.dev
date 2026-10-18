// Shared playback chrome for every scene: header buttons, keys, fitting the frame, and the deck protocol.
// Load it after the scene script. The scene provides: STEPS, step, anim, frame(ms), run(dir[, from]),
// finish(), next(), prev(), play(); optionally settle(step), LIVE and SETTLE_LIVE for scenes that keep running.
//
// Embedded in the deck shell (?embed), the shell owns the clicker and sends { deck, cmd: 'go' | 'next' | 'prev' | 'replay' };
// the scene answers { deck, ready } once, { deck, step } whenever its step changes (for the shell's chapter timeline),
// and { deck, edge: 'end' | 'start' } when it has no step left that way. { deck, cmd: 'chapters', on } makes room for the timeline.
// ?from=&to= play a slice of the scene; ?enter=end opens it on its last step, settled (coming back from the next scene).
(() => {
  const q = new URLSearchParams(location.search);
  const embed = q.has('embed');
  const FIRST = Math.max(1, +(q.get('from') || 1)), LAST = Math.min(STEPS, +(q.get('to') || STEPS));
  const frameEl = document.querySelector('.frame'), stageEl = document.getElementById('stage');
  const settleAt = s => typeof settle === 'function' ? settle(s) : 1e9;
  const isLive = s => typeof LIVE !== 'undefined' && LIVE.has(s);
  const rest = () => { if (isLive(step)) run(1, SETTLE_LIVE); else frame(settleAt(step)); };

  // A safe area for every scene: everything in the frame is drawn a little smaller, around the frame's centre, so all
  // scenes keep the same side margins and the same proportions. Scaling around y = 540 leaves the sightline where it is.
  // One knob for the whole deck; ?content=1 shows a scene at full size, for comparison.
  const CONTENT = +q.get('content') || .85;
  [...frameEl.children].forEach(c => {
    if (c.classList.contains('sight')) return;
    c.style.transformOrigin = `${960 - c.offsetLeft}px ${540 - c.offsetTop}px`;
    c.style.transform = `scale(${CONTENT})`;
  });

  function fit() {
    if (document.body.classList.contains('solo') && !embed) {
      frameEl.style.transform = 'none'; stageEl.style.width = '1920px'; stageEl.style.height = '1080px';
      return;
    }
    const head = embed ? 0 : document.querySelector('header').offsetHeight, pad = embed ? 0 : 40;
    const k = Math.min((innerWidth - pad) / 1920, (innerHeight - head - pad) / 1080);
    stageEl.style.width = 1920 * k + 'px'; stageEl.style.height = 1080 * k + 'px';
    frameEl.style.transform = `scale(${k})`;
  }
  addEventListener('resize', fit);

  if (embed) {
    document.body.classList.add('embed');
    const style = document.createElement('style');
    style.textContent = 'body.embed{background:#fff;overflow:hidden}body.embed header{display:none}' +
      'body.embed #wrap{padding:0;height:100vh;align-items:center}body.embed #stage{box-shadow:none;cursor:default}' +
      'body.with-chapters .src{top:966px}';   // the sources move up, clear of the chapter timeline
    document.head.appendChild(style);
    const post = m => parent.postMessage(Object.assign({ deck: true }, m), '*');
    const enter = q.get('enter') || 'start';
    if (enter === 'end') { step = LAST; rest(); }
    else if (FIRST > 1) { step = FIRST - 1; rest(); }   // the state just before the slice; 'go' plays into it
    else { step = 1; frame(0); }
    addEventListener('message', e => {
      const m = e.data;
      if (!m || !m.deck || !m.cmd) return;
      if (m.cmd === 'go' && enter !== 'end') { if (step < FIRST) step = FIRST; run(1); }
      if (m.cmd === 'next') { if (anim) return finish(); if (step >= LAST) return post({ edge: 'end' }); step += 1; run(1); }
      if (m.cmd === 'prev') { if (anim) return finish(); if (step <= FIRST) return post({ edge: 'start' }); run(-1); }
      if (m.cmd === 'replay') play();
      if (m.cmd === 'chapters') document.body.classList.toggle('with-chapters', !!m.on);
    });
    let reported = null;
    setInterval(() => { if (step !== reported) { reported = step; post({ step }); } }, 100);
    fit();
    post({ ready: true, first: FIRST, last: LAST, content: CONTENT });
    return;
  }

  document.getElementById('next')?.addEventListener('click', next);
  document.getElementById('prev')?.addEventListener('click', prev);
  document.getElementById('replay')?.addEventListener('click', play);
  stageEl.addEventListener('click', next);
  document.getElementById('sight')?.addEventListener('change', e => document.body.classList.toggle('sightline', e.target.checked));
  addEventListener('keydown', e => {
    if (['ArrowRight', 'PageDown', ' '].includes(e.key)) { e.preventDefault(); next(); }
    if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); prev(); }
    if (e.key === 'r') play();
  });
  if (q.has('sight')) { document.body.classList.add('sightline'); const c = document.getElementById('sight'); if (c) c.checked = true; }
  if (q.has('solo')) document.body.classList.add('solo');
  fit();
  if (q.has('at')) frame(+q.get('at')); else if (q.has('still')) rest(); else play();
})();
