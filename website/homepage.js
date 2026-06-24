(function () {
  'use strict';

  // Native scrolling. The momentum smooth-scroll (Lenis) was removed to eliminate
  // scroll jitter from it competing with the hero video and the nav backdrop-blur.
  const lenis = null;

  // ── Intro splash (homepage only; armed by the inline <head> gate) ──
  // Entrance beats are CSS; this drives the lift, the skip, and gating the
  // lift on the hero video being ready so the hero is in motion the instant
  // the curtain rises.
  (function intro() {
    const root = document.documentElement;
    if (!root.classList.contains('intro-armed')) return;
    const overlay = document.querySelector('.am-intro');
    if (!overlay) return;

    const reduced = root.classList.contains('intro-reduced');
    const hero = document.querySelector('.hero-img'); // the <video>
    let lifted = false;

    function lift() {
      if (lifted) return;
      lifted = true;
      root.classList.add('intro-done');               // releases scroll lock
      overlay.classList.add('is-lifting');
      const done = () => overlay.classList.add('is-done');
      overlay.addEventListener('transitionend', done, { once: true });
      setTimeout(done, 800);                            // safety if transitionend doesn't fire
    }

    // Skip: any key / pointer / touch lifts immediately.
    window.addEventListener('keydown', lift, { once: true });
    overlay.addEventListener('pointerdown', lift, { once: true });
    overlay.addEventListener('touchstart', lift, { once: true, passive: true });

    if (reduced) {
      setTimeout(lift, 900);                            // static hold, then fade
      return;
    }

    // Normal path: pre-warm the hero video and gate the lift on it being ready.
    if (hero && hero.paused) { const p = hero.play(); if (p && p.catch) p.catch(() => {}); }
    const ready = () => hero && hero.readyState >= 3;
    setTimeout(() => {
      if (ready()) { lift(); return; }
      const onReady = () => lift();
      if (hero) {
        hero.addEventListener('canplay', onReady, { once: true });
        hero.addEventListener('loadeddata', onReady, { once: true });
      }
    }, 1900);                                           // minimum on-screen time
    setTimeout(lift, 3500);                             // hard fallback (poster covers a stalled video)
  })();

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

  // ── Quote form (Formspree) ───────────────────────────────────────
  const quoteForm = document.getElementById('quote-form');
  if (quoteForm) {
    const status = document.getElementById('form-status');
    const submitBtn = quoteForm.querySelector('[type="submit"]');
    const submitLabel = submitBtn ? submitBtn.querySelector('.form-submit-label') : null;
    quoteForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (submitBtn) submitBtn.disabled = true;
      if (submitLabel) submitLabel.textContent = 'Sending…';
      if (status) { status.textContent = ''; status.className = 'form-status'; }
      try {
        const res = await fetch(quoteForm.action, { method: 'POST', body: new FormData(quoteForm), headers: { Accept: 'application/json' } });
        if (res.ok) {
          if (status) { status.textContent = "Request sent! We'll be in touch within one business day."; status.className = 'form-status ok'; }
          quoteForm.reset();
        } else { throw new Error('bad response'); }
      } catch {
        if (status) { status.textContent = 'Something went wrong. Please email us directly at jflores@ammasonry.net.'; status.className = 'form-status err'; }
      }
      if (submitBtn) submitBtn.disabled = false;
      if (submitLabel) submitLabel.textContent = 'Send Request';
    });
  }

  // ── Featured projects carousel ───────────────────────────────────
  // Center-focus slider: the active slide sits scaled-up in the middle,
  // neighbours peek in dimmed. Arrows / dots / keyboard / swipe change the
  // active index; the whole track glides via a single translateX transform.
  document.querySelectorAll('[data-carousel]').forEach((root) => {
    const viewport = root.querySelector('.cz-viewport');
    const track    = root.querySelector('.cz-track');
    const slides   = Array.from(root.querySelectorAll('.cz-slide'));
    const prevBtn  = root.querySelector('.cz-prev');
    const nextBtn  = root.querySelector('.cz-next');
    const dots     = Array.from(root.querySelectorAll('.cz-dot'));
    if (!viewport || !track || slides.length === 0) return;

    let index = parseInt(root.dataset.start || '0', 10);
    if (!(index >= 0 && index < slides.length)) index = 0;

    const positionTrack = (animate) => {
      const active = slides[index];
      // offsetLeft/offsetWidth are layout values (ignore the scale transform),
      // so this centres the active slide regardless of its current transition.
      const target = viewport.clientWidth / 2 - (active.offsetLeft + active.offsetWidth / 2);
      if (animate) {
        track.style.transform = `translateX(${target}px)`;
      } else {
        const prevTransition = track.style.transition;
        track.style.transition = 'none';
        track.style.transform = `translateX(${target}px)`;
        void track.offsetWidth;                 // flush so the next move animates
        track.style.transition = prevTransition;
      }
    };

    const render = (animate) => {
      slides.forEach((slide, i) => {
        const active = i === index;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', String(!active));
        slide.querySelectorAll('a').forEach(a => { a.tabIndex = active ? 0 : -1; });
      });
      dots.forEach((dot, i) => {
        const active = i === index;
        dot.classList.toggle('is-active', active);
        dot.setAttribute('aria-current', active ? 'true' : 'false');
      });
      if (prevBtn) prevBtn.disabled = index === 0;
      if (nextBtn) nextBtn.disabled = index === slides.length - 1;
      positionTrack(animate);
    };

    const goTo = (i, animate = true) => {
      index = Math.max(0, Math.min(slides.length - 1, i));
      render(animate);
    };

    if (prevBtn) prevBtn.addEventListener('click', () => goTo(index - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(index + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft')  { e.preventDefault(); goTo(index - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); goTo(index + 1); }
    });

    // Swipe via pointer; suppress the click that follows a real drag so a
    // swipe doesn't also open the project link under the finger.
    let startX = 0, startY = 0, tracking = false, swiped = false;
    viewport.addEventListener('pointerdown', (e) => { startX = e.clientX; startY = e.clientY; tracking = true; swiped = false; });
    viewport.addEventListener('pointerup', (e) => {
      if (!tracking) return;
      tracking = false;
      const dx = e.clientX - startX, dy = e.clientY - startY;
      if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy)) { swiped = true; goTo(dx < 0 ? index + 1 : index - 1); }
    });
    viewport.addEventListener('pointercancel', () => { tracking = false; });
    viewport.addEventListener('click', (e) => { if (swiped) { e.preventDefault(); e.stopPropagation(); swiped = false; } }, true);

    let resizeRAF = 0;
    window.addEventListener('resize', () => {
      cancelAnimationFrame(resizeRAF);
      resizeRAF = requestAnimationFrame(() => positionTrack(false));
    }, { passive: true });

    // Image heights can shift slide offsets once they decode — re-center then.
    slides.forEach((slide) => {
      const img = slide.querySelector('img');
      if (img && !img.complete) img.addEventListener('load', () => positionTrack(false), { once: true });
    });

    render(false);
  });

})();
