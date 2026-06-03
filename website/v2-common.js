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

  // ── Featured project tabs (projects page) ─────────────────────────
  const featTabs   = document.querySelectorAll('.pfeat-tab');
  const featPanels = document.querySelectorAll('.proj-featured [data-proj-panel]');
  if (featTabs.length && featPanels.length) {
    let activeFeat = 0;

    const playPanelVideo = panel => {
      const vid = panel.querySelector('video');
      if (!vid) return;
      const startPlay = () => {
        try { vid.currentTime = 0; } catch {}
        const p = vid.play();
        if (p && p.catch) p.catch(() => {});
      };
      if (vid.readyState >= 1) {
        startPlay();
      } else {
        vid.addEventListener('loadedmetadata', startPlay, { once: true });
        vid.load();
      }
    };

    const setActiveTabIndex = i => {
      featTabs.forEach((t, j) => {
        const isActive = j === i;
        t.classList.toggle('is-active', isActive);
        t.setAttribute('aria-selected', isActive ? 'true' : 'false');
        t.setAttribute('tabindex', isActive ? '0' : '-1');
      });
    };

    // honor URL hash on load (e.g. #west-pine)
    const hash = window.location.hash.replace('#', '');
    if (hash) {
      const idx = Array.from(featPanels).findIndex(p => p.id === hash);
      if (idx > 0) {
        featPanels[0].hidden = true;
        featPanels[idx].hidden = false;
        setActiveTabIndex(idx);
        activeFeat = idx;
        playPanelVideo(featPanels[idx]);
      }
    }

    const switchToTab = i => {
      if (i === activeFeat) return;
      setActiveTabIndex(i);
      const cur  = featPanels[activeFeat];
      const next = featPanels[i];
      cur.classList.add('fading');
      setTimeout(() => {
        cur.hidden = true;
        cur.classList.remove('fading');
        next.hidden = false;
        playPanelVideo(next);
        activeFeat = i;
        if (next.id) history.replaceState(null, '', '#' + next.id);
      }, 300);
    };

    featTabs.forEach((tab, i) => {
      tab.addEventListener('click', () => switchToTab(i));
      tab.addEventListener('keydown', e => {
        let target = null;
        if (e.key === 'ArrowRight') target = (i + 1) % featTabs.length;
        else if (e.key === 'ArrowLeft') target = (i - 1 + featTabs.length) % featTabs.length;
        else if (e.key === 'Home') target = 0;
        else if (e.key === 'End') target = featTabs.length - 1;
        if (target !== null) {
          e.preventDefault();
          switchToTab(target);
          featTabs[target].focus();
        }
      });
    });
  }

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

  // ── Gallery filter + lightbox (projects page) ─────────────────────
  const projGrid = document.querySelector('.proj-grid');
  const lb = document.getElementById('v2-lightbox');
  if (projGrid && lb) {
    const cells      = Array.from(projGrid.querySelectorAll('.proj-cell'));
    const filterBtns = Array.from(document.querySelectorAll('.proj-filter-btn'));
    const lbImg   = lb.querySelector('.lb-img');
    const lbCap   = lb.querySelector('.lb-cap');
    const btnClose = lb.querySelector('.lb-close');
    const btnPrev  = lb.querySelector('.lb-prev');
    const btnNext  = lb.querySelector('.lb-next');
    let visible = cells.slice();  // cells currently shown
    let current = 0;              // index into `visible`
    let lastFocused = null;

    // Make each cell behave like a button for keyboard users
    cells.forEach(cell => {
      const img = cell.querySelector('img');
      cell.setAttribute('role', 'button');
      cell.setAttribute('tabindex', '0');
      cell.setAttribute('aria-label', 'View ' + (img ? img.alt : 'project photo'));
      cell.addEventListener('click', () => openAt(cell));
      cell.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAt(cell); }
      });
    });

    // ── Filter ──
    const applyFilter = cat => {
      cells.forEach(c => c.classList.toggle('hidden', cat !== 'all' && c.dataset.cat !== cat));
      visible = cells.filter(c => !c.classList.contains('hidden'));
      filterBtns.forEach(b => {
        const on = b.dataset.filter === cat;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', String(on));
      });
    };
    filterBtns.forEach(b => b.addEventListener('click', () => applyFilter(b.dataset.filter)));

    // ── Lightbox ──
    const render = () => {
      const img = visible[current].querySelector('img');
      lbImg.src = img.src;
      lbImg.alt = img.alt;
      lbCap.textContent = img.alt;
      const multi = visible.length > 1;
      btnPrev.style.display = multi ? '' : 'none';
      btnNext.style.display = multi ? '' : 'none';
    };
    function openAt(cell) {
      if (cell.classList.contains('hidden')) return;
      current = visible.indexOf(cell);
      if (current < 0) return;
      lastFocused = cell;
      render();
      lb.hidden = false;
      document.body.style.overflow = 'hidden';
      btnClose.focus();
    }
    const close = () => {
      lb.hidden = true;
      document.body.style.overflow = '';
      if (lastFocused) lastFocused.focus();
    };
    const step = dir => {
      if (visible.length < 2) return;
      current = (current + dir + visible.length) % visible.length;
      render();
    };
    btnClose.addEventListener('click', close);
    btnPrev.addEventListener('click', () => step(-1));
    btnNext.addEventListener('click', () => step(1));
    lb.addEventListener('click', e => { if (e.target === lb) close(); });
    document.addEventListener('keydown', e => {
      if (lb.hidden) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
    });
  }
})();
