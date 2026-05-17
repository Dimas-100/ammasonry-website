(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Lenis smooth scroll ──────────────────────────────────────────
  // Adds momentum/inertia to wheel scrolling on desktop. Mobile falls back
  // to native touch scroll automatically. Disabled if user prefers reduced motion.
  let lenis = null;
  if (!reduceMotion && typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 1.1,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.75,
      touchMultiplier: 1.5,
    });
    const raf = (time) => { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  // ── Smooth anchor links (uses Lenis if present, native otherwise) ──
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const id = anchor.getAttribute('href');
      if (!id || id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -90 });
      else target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ── Sticky nav scroll state ──────────────────────────────────────
  // Toggle .is-scrolled on the nav once user scrolls past a sentinel
  // placed below the top of the page. Uses IntersectionObserver so
  // there are no scroll-event listeners on the main thread.
  const nav = document.querySelector('.nav');
  if (nav) {
    const sentinel = document.createElement('div');
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = 'position:absolute;top:80px;left:0;width:1px;height:1px;pointer-events:none;';
    document.body.prepend(sentinel);
    const navIO = new IntersectionObserver(([entry]) => {
      nav.classList.toggle('is-scrolled', !entry.isIntersecting);
    });
    navIO.observe(sentinel);
  }

  // ── Image lazy fade-in ───────────────────────────────────────────
  // Lazy-loaded images fade in when they finish loading instead of popping.
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    if (img.complete && img.naturalHeight !== 0) {
      img.classList.add('is-loaded');
    } else {
      img.addEventListener('load',  () => img.classList.add('is-loaded'), { once: true });
      img.addEventListener('error', () => img.classList.add('is-loaded'), { once: true });
    }
  });

  // ── Footer year ──────────────────────────────────────────────────
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  // ── Reveal on scroll ─────────────────────────────────────────────
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const delay = parseInt(e.target.dataset.delay || '0', 10);
        setTimeout(() => e.target.classList.add('in'), delay);
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  // ── Mobile nav toggle ────────────────────────────────────────────
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks  = document.querySelector('.nav-links');
  if (navToggle && navLinks) {
    const closeNav = () => {
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Open menu');
      navLinks.classList.remove('is-open');
      document.body.classList.remove('nav-open');
      document.body.style.overflow = '';
    };
    navToggle.addEventListener('click', () => {
      const open = !navLinks.classList.contains('is-open');
      navLinks.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      document.body.classList.toggle('nav-open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });
    navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && navLinks.classList.contains('is-open')) closeNav();
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 760 && navLinks.classList.contains('is-open')) closeNav();
    });
  }

  // ── Hero video — mobile loops vid-0, desktop crossfades vid-0 ↔ vid-1 ──
  const FADE = 1.5;
  const vids = [
    document.getElementById('hero-vid-0'),
    document.getElementById('hero-vid-1'),
  ];
  const isMobile = window.matchMedia('(max-width: 768px)').matches;

  if (vids[0]) {
    const reveal = () => vids[0].classList.add('is-playing');
    vids[0].addEventListener('playing', reveal, { once: true });
    if (!vids[0].paused && vids[0].readyState >= 3) reveal();
    vids[0].play().catch(() => {});
  }

  if (!isMobile && vids[0] && vids[1]) {
    // Desktop only: set up the crossfade dance with vid-1
    let active = 0;
    let switching = false;

    vids[1].addEventListener('playing', () => vids[1].classList.add('is-playing'), { once: true });

    // Give vid-0 a head start, then quietly start downloading vid-1 in the background
    setTimeout(() => {
      vids[1].preload = 'auto';
      vids[1].load();
    }, 2000);

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

  // ── Project card video crossfade (West Pine wide card) ──────────────
  // Two clips of the same project dissolve into each other. Desktop only —
  // on mobile the second clip never downloads and clip 1 just loops.
  const pcGroup = document.querySelector('[data-pcv-group]');
  if (!isMobile && !reduceMotion && pcGroup) {
    const pcVids = Array.from(pcGroup.querySelectorAll('video.pcv'));
    if (pcVids.length === 2) {
      let pcActive = 0;
      let pcSwitching = false;

      // Defer downloading clip 2 so it doesn't compete with the first paint
      setTimeout(() => { pcVids[1].preload = 'auto'; pcVids[1].load(); }, 2500);

      pcVids.forEach((vid, i) => {
        vid.addEventListener('timeupdate', () => {
          if (pcSwitching || pcActive !== i) return;
          if (!vid.duration || vid.currentTime < vid.duration - FADE) return;
          pcSwitching = true;
          const next = 1 - i;
          pcVids[next].currentTime = 0;
          pcVids[next].play().catch(() => {});
          pcVids[i].classList.remove('is-active');
          pcVids[next].classList.add('is-active');
          pcActive = next;
          setTimeout(() => { pcSwitching = false; }, (FADE + 0.5) * 1000);
        });
      });
    }
  }

})();
