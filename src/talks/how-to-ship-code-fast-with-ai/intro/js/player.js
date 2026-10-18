/* The intro as slides. Each slide plays its animation when you arrive, then holds on its
   last frame (clouds, cars, smoke and the pigeon keep moving) until you click.
   No narration on screen: you talk over it.
   Two clocks: `lt` is the slide's own time (camera, choreography), `amb` is ambient life. */
(() => {
  const { W, H, ease } = PX;

  // ---------- the running order ----------
  // cam keyframes are in slide time: [time, camX, camY, easing into this key].
  // dur = when the slide has finished and starts holding. act = the choreography for that scene.
  const SLIDES = [
    { shot: 'sky', dur: 10, cam: [[0, 0, 0], [2.6, 0, 0], [9.8, 0, 760, 'inOut']] },
    { shot: 'plaza', dur: 6, cam: [[0, 0, 0], [6, 0, 40, 'sine']] },
    { shot: 'street', dur: 6, cam: [[0, 0, 0], [.8, 0, 0], [6, 0, 130, 'inOut']] },
    { shot: 'table', dur: 5, cam: [[0, 20, 0], [5, 0, 0, 'out']] },
    { shot: 'table', act: 'arrive', dur: 14.2, cam: [[0, 0, 0]] },
    // the door kick and the lift are cut. Both shots are still in shots.js:
    // { shot: 'table', act: 'door', dur: 11.6 } and { shot: 'lift', dur: 12.8 }.
    { shot: 'desk', act: 'ppt', dur: 8, cam: [[0, 0, 0]] },
    { shot: 'desk', act: 'chat', dur: 11, cam: [[0, 0, 0]] },
    // one instruction per slide: he types, the model scribbles, the scene appears
    { shot: 'desk', act: 'build1', dur: 11, cam: [[0, 0, 0]] },
    { shot: 'desk', act: 'build2', dur: 11, cam: [[0, 0, 0]] },
    { shot: 'desk', act: 'build3', dur: 11, cam: [[0, 0, 0]] },
    { shot: 'desk', act: 'build4', dur: 11, cam: [[0, 0, 0]] },
    // he stops typing and turns round to look at the room
    { shot: 'desk', act: 'turn', dur: 7, cam: [[0, 0, 0]] },
    { shot: 'desk', act: 'spent', alarm: true, dur: 1.4, cam: [[0, 0, 0]] },
    // after the alarm the pixels are gone: plain slides, one click per reveal
    ...Array.from({ length: 16 }, (_, k) => ({ deck: k + 1, dur: 0 })),
    // the room, live: it loops on its own, and each click sends the microphone to someone
    { shot: 'room', act: 'idle', dur: 9, cam: [[0, 0, 0]] },
    { shot: 'room', act: 'qa1', dur: 5, cam: [[0, 0, 0]] },
    { shot: 'room', act: 'qa2', dur: 5, cam: [[0, 0, 0]] },
    { shot: 'room', act: 'qa3', dur: 5, cam: [[0, 0, 0]] },
  ];
  const CUT = .35;          // seconds of mosaic out, and again in
  const AUTO_DELAY = .9;    // movie mode (?auto): pause on each held slide before moving on

  // ---------- setup ----------
  const $ = s => document.querySelector(s);
  const screen = $('#screen'), ctx = screen.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  const hires = $('#hires'), hctx = hires.getContext('2d');
  const deckEl = $('#deck'), sections = [...deckEl.querySelectorAll('section')];
  const alarmEl = $('#alarm'), clockEl = $('#clock'), progEl = $('#progress > i');
  let startedAt = null;                                 // the talk clock, running from PRESS START
  function paintClock() {
    const secs = startedAt === null ? 0 : Math.floor((performance.now() - startedAt) / 1000);
    clockEl.textContent = String(Math.floor(secs / 60)).padStart(2, '0') + ':' + String(secs % 60).padStart(2, '0');
    clockEl.classList.toggle('warn', secs >= 900 && secs < 1080);
    clockEl.classList.toggle('over', secs >= 1080);
  }
  // how far through the talk we are, counting reveals as well as slides
  function paintProgress() {
    const s = SLIDES[i], sec = deckOf(i);
    let frac;
    if (sec) { const max = stepsOf(sec); frac = max ? step / max : 1; }
    else frac = s.dur ? PX.clamp(lt / s.dur, 0, 1) : 1;
    progEl.style.width = ((i + frac) / SLIDES.length * 100).toFixed(2) + '%';
  }

  // data-r: appears on that click and stays. data-only: visible on that click alone.
  // data-active: stays put but lights up on that click.
  const revealsOf = sec => [...sec.querySelectorAll('[data-r],[data-only],[data-active]')];
  const stepOf = e => Math.max(+(e.dataset.r || 0), +(e.dataset.only || 0), +(e.dataset.active || 0));
  const stepsOf = sec => Math.max(0, ...revealsOf(sec).map(stepOf));
  const deckOf = j => SLIDES[j] && SLIDES[j].deck ? sections[SLIDES[j].deck - 1] : null;
  let step = 0;
  const [tiny, tctx] = PX.canvas(W, H);
  Object.values(SHOTS).forEach(s => s.init());

  const params = new URLSearchParams(location.search);
  const auto = params.has('auto');
  let i = PX.clamp((parseInt(params.get('slide'), 10) || 1) - 1, 0, SLIDES.length - 1);
  let lt = Math.max(0, parseFloat(params.get('lt')) || 0);
  let amb = 0, heldAt = 0;
  let paused = params.has('pause');
  let debug = params.has('debug');
  // waiting = the first slide on page load, frozen on the sky until the first click
  let mode = params.has('slide') || auto ? (lt >= SLIDES[i].dur ? 'held' : 'playing') : 'waiting';
  let cut = null;           // { phase: 'out' | 'in', k: 0..1, to, toLt, toMode }

  const camAt = PX.camAt;

  // SNES-style mosaic: shrink the frame into blocks, then blow it back up.
  function mosaic(size) {
    if (size <= 1) return;
    const bw = Math.ceil(W / size), bh = Math.ceil(H / size);
    tctx.clearRect(0, 0, W, H);
    tctx.drawImage(screen, 0, 0, W, H, 0, 0, bw, bh);
    ctx.drawImage(tiny, 0, 0, bw, bh, 0, 0, bw * size, bh * size);
  }
  const mosaicSize = () => !cut ? 1 : 1 + Math.round((cut.phase === 'out' ? ease.in(cut.k) : ease.out(1 - cut.k)) * 11);

  // ---------- render ----------
  const startEl = $('#press-start'), readyEl = $('#ready');
  const dbgEl = $('#debug'), dbgInfo = $('#dbg-info'), scrub = $('#dbg-scrub');
  function paintDeck() {
    const sec = deckOf(i);
    alarmEl.classList.toggle('show', !!SLIDES[i].alarm);
    deckEl.classList.toggle('show', !!sec);
    screen.classList.toggle('hide', !!sec);
    hires.classList.toggle('hide', !!sec);
    sections.forEach(x => x.classList.toggle('active', x === sec));
    if (sec) revealsOf(sec).forEach(e => {
      if (e.dataset.r !== undefined) e.classList.toggle('on', +e.dataset.r <= step);
      if (e.dataset.only !== undefined) e.classList.toggle('on', +e.dataset.only === step);
      if (e.dataset.active !== undefined) e.classList.toggle('now', +e.dataset.active === step);
    });
  }

  function render() {
    const s = SLIDES[i];
    paintDeck();
    paintClock();
    paintProgress();
    if (s.deck) {
      startEl.classList.remove('show'); readyEl.classList.remove('show');
      if (debug) dbgInfo.textContent = `slide ${i + 1}/${SLIDES.length} (deck ${s.deck}) · step ${step} of ${stepsOf(sections[s.deck - 1])}`;
      return;
    }
    const cam = camAt(s.cam, lt);
    ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    const cm = { x: Math.round(cam.x), y: Math.round(cam.y) };
    SHOTS[s.shot].render(ctx, cm, amb, lt, s.act);
    mosaic(mosaicSize());
    // anything real (photos, gifs) goes on the layer above, and hides during a cut
    hctx.clearRect(0, 0, 1920, 1080);
    if (!cut) SHOTS[s.shot].hires?.(hctx, cm, amb, lt, s.act);
    startEl.classList.toggle('show', mode === 'waiting' && !cut);
    readyEl.classList.toggle('show', mode === 'held' && !cut && i < SLIDES.length - 1);
    if (debug) {
      dbgInfo.textContent = `slide ${i + 1}/${SLIDES.length} (${s.shot}${s.act ? ' · ' + s.act : ''}) · ${lt.toFixed(2)}s of ${s.dur}s · ${mode}${paused ? ' · paused' : ''}${auto ? ' · auto' : ''}`;
      scrub.max = s.dur;
      if (document.activeElement !== scrub) scrub.value = lt;
    }
  }

  // ---------- the clock ----------
  let last = null;
  function frame(now) {
    if (last === null) last = now;
    const dt = Math.max(0, Math.min(.1, (now - last) / 1000));
    last = now;
    if (!paused) {
      amb += dt;
      if (cut) {
        cut.k += dt / CUT;
        if (cut.phase === 'out' && cut.k >= 1) {
          i = cut.to; lt = cut.toLt; mode = cut.toMode;
          if (mode === 'held') heldAt = amb;
          cut.phase = 'in'; cut.k = 0;
        } else if (cut.phase === 'in') {
          if (mode === 'playing') lt = Math.min(SLIDES[i].dur, lt + dt);
          if (cut.k >= 1) cut = null;
        }
      } else if (mode === 'playing' && !SLIDES[i].deck) {
        lt += dt;
        if (lt >= SLIDES[i].dur) { lt = SLIDES[i].dur; mode = 'held'; heldAt = amb; }
      } else if (mode === 'held' && auto && amb - heldAt > AUTO_DELAY
                 && (i < SLIDES.length - 1 || step < stepsOf(deckOf(i) || sections[0]))) {
        next();                                         // in movie mode a reveal counts as a beat
        heldAt = amb;
      }
    }
    render();
    requestAnimationFrame(frame);
  }

  // ---------- navigation: clicker friendly ----------
  function goTo(j, jlt = 0, jmode) {
    if (cut || j < 0 || j >= SLIDES.length) return;
    const to = deckOf(j), from = deckOf(i);
    // The mosaic is for changing scenery. Staying in the same shot -- the same table, the
    // same desk, the same room -- cuts straight through, so only the action changes.
    const sameShot = !to && !from && SLIDES[j].shot && SLIDES[j].shot === SLIDES[i].shot;
    if (to || from || sameShot || SLIDES[j].alarm || SLIDES[i].alarm) {
      i = j; lt = jlt;
      // a plain slide just sits there; an animated one has to start playing
      mode = jmode || (to || jlt >= SLIDES[j].dur ? 'held' : 'playing');
      step = to && jlt > 0 ? stepsOf(to) : 0;
      if (mode === 'held') heldAt = amb;
      return;
    }
    cut = { phase: 'out', k: 0, to: j, toLt: jlt, toMode: jmode || (jlt >= SLIDES[j].dur ? 'held' : 'playing') };
  }
  function next() {
    if (cut) return;
    if (mode === 'waiting') { mode = 'playing'; if (startedAt === null) startedAt = performance.now(); return; }
    const sec = deckOf(i);
    if (sec) { if (step < stepsOf(sec)) step++; else goTo(i + 1, 0); return; }
    if (mode === 'playing') { lt = SLIDES[i].dur; mode = 'held'; heldAt = amb; return; }   // finish the animation first
    goTo(i + 1, 0);
  }
  function prev() {
    if (cut) return;
    if (deckOf(i) && step > 0) { step--; return; }
    if (i > 0) goTo(i - 1, SLIDES[i - 1].dur || 1);     // back = previous slide, already settled
    else { lt = 0; mode = 'waiting'; }
  }
  function replay() { if (!cut) { lt = 0; step = 0; mode = SLIDES[i].deck ? 'held' : 'playing'; } }
  function setDebug(on) { debug = on; dbgEl.classList.toggle('show', on); }

  let numBuf = '', numAt = 0, numTimer = 0;
  window.addEventListener('keydown', e => {
    const k = e.key;
    if (k === 'ArrowRight' || k === 'ArrowDown' || k === 'PageDown' || k === ' ' || k === 'Enter') { next(); e.preventDefault(); }
    else if (k === 'ArrowLeft' || k === 'ArrowUp' || k === 'PageUp' || k === 'Backspace') { prev(); e.preventDefault(); }
    else if (k === 'r' || k === 'R') replay();
    else if (k === 'Home') { goTo(0, 0, 'waiting'); startedAt = null; }   // back to the top, clock reset
    else if (/^[0-9]$/.test(k)) {                       // type 1 for slide 1, 1 then 1 for slide 11
      const now = performance.now();
      numBuf = (now - numAt < 700 ? numBuf : '') + k; numAt = now;
      clearTimeout(numTimer);
      numTimer = setTimeout(() => { const n = parseInt(numBuf, 10); numBuf = ''; if (n >= 1) goTo(PX.clamp(n, 1, SLIDES.length) - 1, 0); }, 420);
    }
    else if (k === 'p' || k === 'P') paused = !paused;
    else if (k === 'd' || k === 'D') setDebug(!debug);
    else if (k === 'f' || k === 'F') (document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen());
  });
  $('#stage').addEventListener('click', e => { if (!e.target.closest('#debug')) next(); });
  scrub.addEventListener('input', () => { paused = true; lt = parseFloat(scrub.value); mode = lt >= SLIDES[i].dur ? 'held' : 'playing'; });

  // ---------- fit the 1920x1080 stage to the window ----------
  const stage = $('#stage');
  function fit() {
    const s = Math.min(window.innerWidth / 1920, window.innerHeight / 1080);
    stage.style.transform = `translate(-50%, -50%) scale(${s})`;
  }
  window.addEventListener('resize', fit);
  fit();
  setDebug(debug);
  window.__intro = {
    next, prev, replay, goTo, SLIDES,
    get state() { return { slide: i + 1, lt: +lt.toFixed(2), step, mode, cut: !!cut }; },
  };
  requestAnimationFrame(frame);
})();
