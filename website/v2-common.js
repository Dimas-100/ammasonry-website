/* A&M Masonry — V2 Inner-page shared JS */

(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Lenis smooth scroll ──────────────────────────────────────────
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

  // ── Lazy-play project videos ────────────────────────────────────────
  // Featured-project videos use preload="none" and only download + play once
  // their row scrolls near the viewport, then pause when scrolled away. This
  // keeps the initial page load light no matter how many (or how large) the
  // clips are.
  const fpcMedia = document.querySelectorAll('.fpc-video-wrap');
  if (fpcMedia.length && 'IntersectionObserver' in window) {
    const vidObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const vid = entry.target.querySelector('video');
        if (!vid) return;
        if (entry.isIntersecting) {
          if (vid.preload !== 'auto') vid.preload = 'auto';
          const p = vid.play();
          if (p && p.catch) p.catch(() => {});
        } else {
          vid.pause();
        }
      });
    }, { rootMargin: '300px 0px', threshold: 0.1 });
    fpcMedia.forEach(m => vidObserver.observe(m));
  }
})();
