(function () {
  'use strict';

  // ── Video crossfade ──────────────────────────────────────────────
  const FADE = 1.5;
  const vids = [
    document.getElementById('hero-vid-0'),
    document.getElementById('hero-vid-1'),
  ];
  let active = 0;
  let switching = false;

  if (vids[0] && vids[1]) {
    vids[0].play().catch(() => {});
    vids.forEach((vid, i) => {
      vid.addEventListener('timeupdate', () => {
        if (switching || active !== i) return;
        if (!vid.duration || vid.currentTime < vid.duration - FADE) return;
        switching = true;
        const next = 1 - i;
        vids[next].currentTime = 0;
        vids[next].play().catch(() => {});
        vids[i].style.transition  = `opacity ${FADE}s ease`;
        vids[next].style.transition = `opacity ${FADE}s ease`;
        vids[i].style.opacity   = '0';
        vids[next].style.opacity  = '1';
        active = next;
        setTimeout(() => { switching = false; }, (FADE + 0.5) * 1000);
      });
    });
  }

  // ── CountUp ──────────────────────────────────────────────────────
  const countEls = document.querySelectorAll('[data-countup]');
  if (countEls.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const to     = parseInt(el.dataset.countup, 10);
        const suffix = el.dataset.suffix || '';
        const dur    = 1500;
        const t0     = performance.now();
        (function tick(t) {
          const p = Math.min(1, (t - t0) / dur);
          el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
        io.unobserve(el);
      });
    }, { threshold: 0.4 });
    countEls.forEach(el => io.observe(el));
  }

  // ── Project tab switching ────────────────────────────────────────
  const projTabs   = document.querySelectorAll('.proj-tab');
  const projPanels = document.querySelectorAll('[data-proj-panel]');
  let activePanel  = 0;

  projTabs.forEach((tab, i) => {
    tab.addEventListener('click', () => {
      if (i === activePanel) return;
      projTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      const cur  = projPanels[activePanel];
      const next = projPanels[i];
      cur.classList.add('fading');
      setTimeout(() => {
        cur.hidden = true;
        cur.classList.remove('fading');
        next.hidden = false;
        activePanel = i;
      }, 300);
    });
  });

  // ── Services accordion (homepage uses .svc-head-row / .svc-row) ──
  document.querySelectorAll('.svc-head-row').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const row    = trigger.closest('.svc-row');
      const isOpen = row.classList.contains('open');
      document.querySelectorAll('.svc-row.open').forEach(r => r.classList.remove('open'));
      if (!isOpen) row.classList.add('open');
    });
  });

})();
