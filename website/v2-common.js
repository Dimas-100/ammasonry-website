/* A&M Masonry — V2 Inner-page shared JS */

(function () {
  'use strict';

  // Native scrolling. The momentum smooth-scroll (Lenis) was removed to eliminate
  // scroll jitter from it competing with video and the nav backdrop-blur.
  const lenis = null;

  // ── Smooth anchor links ──────────────────────────────────────────
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
  const nav = document.querySelector('.v2-nav');
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
  document.querySelectorAll('img[loading="lazy"]').forEach(img => {
    if (img.complete && img.naturalHeight !== 0) {
      img.classList.add('is-loaded');
    } else {
      img.addEventListener('load',  () => img.classList.add('is-loaded'), { once: true });
      img.addEventListener('error', () => img.classList.add('is-loaded'), { once: true });
    }
  });

  // ── Year ──────────────────────────────────────────────────────────
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  // ── Mobile nav toggle ─────────────────────────────────────────────
  const navToggle = document.querySelector('.v2-nav-toggle');
  const navLinks  = document.querySelector('.v2-nav-links');
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

  // ── Nav dropdown (Projects) ──────────────────────────────────────
  document.querySelectorAll('.nav-dd').forEach((dd) => {
    const toggle = dd.querySelector('.nav-dd-toggle');
    if (!toggle) return;
    const close = () => { dd.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); };
    toggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = !dd.classList.contains('is-open');
      dd.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', (e) => { if (!dd.contains(e.target)) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
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

  // ── Contact form ──────────────────────────────────────────────────
  const form = document.getElementById('quote-form');
  if (form) {
    const status = document.getElementById('form-status');
    const btn = form.querySelector('[type="submit"]');
    const btnLabel = btn.querySelector('.form-submit-label');
    form.addEventListener('submit', async e => {
      e.preventDefault();
      btn.disabled = true;
      btnLabel.textContent = 'Sending…';
      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' }
        });
        if (res.ok) {
          status.textContent = 'Request sent! We\'ll be in touch within one business day.';
          status.className = 'form-status ok';
          form.reset();
        } else {
          throw new Error('bad response');
        }
      } catch {
        status.textContent = 'Something went wrong. Please call or email us directly.';
        status.className = 'form-status err';
      }
      btn.disabled = false;
      btnLabel.textContent = 'Send Request';
    });
  }

  // ── Lazy-load + focus-play project videos ───────────────────────────
  // Videos use preload="none" (nothing downloads until needed); each clip
  // buffers as its row approaches (preloadIO). A clip plays only while it sits
  // in the central band of the viewport (focusIO, negative rootMargin) and
  // pauses the moment you scroll on to the next — so one plays at a time.
  const projectMedia = Array.from(document.querySelectorAll('.pshow-media'));
  if (projectMedia.length) {
    // Play only the video nearest the viewport center (and overlapping the
    // central band); pause all others. Recompute the whole set on every
    // change so a dropped exit event can't leave a stray video playing.
    let ticking = false, settleTimer = 0;
    const applyFocus = () => {
      ticking = false;
      const vh = window.innerHeight || document.documentElement.clientHeight;
      const lo = vh * 0.35, hi = vh * 0.65, mid = vh / 2;
      let best = null, bestDist = Infinity;
      projectMedia.forEach(w => {
        const r = w.getBoundingClientRect();
        if (r.top < hi && r.bottom > lo) {
          const d = Math.abs((r.top + r.bottom) / 2 - mid);
          if (d < bestDist) { bestDist = d; best = w; }
        }
      });
      projectMedia.forEach(w => {
        const vid = w.querySelector('video');
        if (!vid) return;
        if (w === best) {
          if (vid.preload !== 'auto') vid.preload = 'auto';
          const p = vid.play();
          if (p && p.catch) p.catch(() => {});
        } else if (!vid.paused) {
          vid.pause();
        }
      });
    };
    const schedule = () => {
      if (!ticking) { ticking = true; requestAnimationFrame(applyFocus); }
      if (settleTimer) clearTimeout(settleTimer);
      settleTimer = setTimeout(applyFocus, 200); // backstop for the settled position
    };

    if ('IntersectionObserver' in window) {
      const preloadIO = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const vid = entry.target.querySelector('video');
          if (vid && vid.preload !== 'auto') { vid.preload = 'auto'; vid.load(); }
          obs.unobserve(entry.target);
        });
      }, { rootMargin: '500px 0px' });
      const focusIO = new IntersectionObserver(schedule, { threshold: [0, 0.25, 0.5, 0.75, 1] });
      projectMedia.forEach(m => { preloadIO.observe(m); focusIO.observe(m); });
    }
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    if (lenis && typeof lenis.on === 'function') lenis.on('scroll', schedule);
    applyFocus();
  }

  // ── Subtle parallax on service-page spread photos ────────────────
  // Each photo's image drifts a few percent of its height as the row moves
  // through the viewport — depth that responds continuously to scrolling
  // (touch included), replacing the old hover-zoom. Transform-only + rAF,
  // and skipped entirely under reduced motion.
  const parallaxImgs = Array.from(document.querySelectorAll('.svp-photo img, .pshow-media img'));
  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (parallaxImgs.length && !reduceMotion) {
    const FACTOR = 0.07; // max drift as a fraction of the frame's height
    let pTick = false;
    const drawParallax = () => {
      pTick = false;
      const vh = window.innerHeight || document.documentElement.clientHeight;
      parallaxImgs.forEach((img) => {
        const r = img.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return; // skip offscreen
        let p = (r.top + r.height / 2 - vh / 2) / (vh / 2 + r.height / 2);
        p = p < -1 ? -1 : p > 1 ? 1 : p;        // clamp to -1..1
        img.style.transform = `translate3d(0, ${(p * r.height * FACTOR).toFixed(1)}px, 0)`;
      });
    };
    const queueParallax = () => { if (!pTick) { pTick = true; requestAnimationFrame(drawParallax); } };
    window.addEventListener('scroll', queueParallax, { passive: true });
    window.addEventListener('resize', queueParallax, { passive: true });
    drawParallax();
  }
})();
