// The v3 cartoon inside the deck shell (?embed): the shell owns the clicker and the clock.
// It plays up to the alarm (slide 13) and tells the shell when there is nothing left either way.
(() => {
  const q = new URLSearchParams(location.search);
  if (!q.has('embed')) return;
  const LAST = 13;   // the alarm: after it, v3 had its plain slides; here the deck takes over
  const style = document.createElement('style');
  style.textContent = '#clock, #progress { display: none !important; }';
  document.head.appendChild(style);
  const I = window.__intro;
  const post = m => parent.postMessage(Object.assign({ deck: true }, m), '*');
  addEventListener('message', e => {
    const m = e.data;
    if (!m || !m.deck || !m.cmd) return;
    const st = I.state;
    if (m.cmd === 'next') {
      if (st.slide >= LAST && st.mode !== 'playing' && !st.cut) post({ edge: 'end' });
      else I.next();
    }
    if (m.cmd === 'prev') {
      if (st.slide === 1 && st.mode === 'waiting') post({ edge: 'start' });
      else I.prev();
    }
    if (m.cmd === 'replay') I.replay();
  });
  post({ ready: true });
})();
