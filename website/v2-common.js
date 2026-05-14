/* A&M Masonry — V2 Inner-page shared JS */

(function () {
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
      document.body.style.overflow = '';
    };
    navToggle.addEventListener('click', () => {
      const open = !navLinks.classList.contains('is-open');
      navLinks.classList.toggle('is-open', open);
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
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

  // ── Services accordion ────────────────────────────────────────────
  document.querySelectorAll('.svc-acc-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const row = trigger.closest('.svc-acc-row');
      const isOpen = row.classList.contains('open');
      document.querySelectorAll('.svc-acc-row.open').forEach(r => {
        r.classList.remove('open');
        r.querySelector('.svc-acc-trigger')?.setAttribute('aria-expanded', 'false');
      });
      if (!isOpen) {
        row.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ── Project filter ────────────────────────────────────────────────
  const filterBtns = document.querySelectorAll('.proj-filter-v2');
  const projCells = document.querySelectorAll('.proj-cell[data-cat]');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('is-active'));
      btn.classList.add('is-active');
      const cat = btn.dataset.filter;
      projCells.forEach(cell => {
        if (cat === 'all' || cell.dataset.cat === cat) {
          cell.classList.remove('hidden');
        } else {
          cell.classList.add('hidden');
        }
      });
    });
  });

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

  // ── Lightbox (projects page) ─────────────────────────────────────
  const lb = document.getElementById('v2-lightbox');
  if (lb) {
    const lbImg = lb.querySelector('.lb-img');
    const lbCap = lb.querySelector('.lb-cap');
    let lbItems = [];
    let lbIdx   = 0;

    function openLb(items, idx) {
      lbItems = items;
      lbIdx   = idx;
      renderLb();
      lb.hidden = false;
      document.body.style.overflow = 'hidden';
    }
    function renderLb() {
      const item = lbItems[lbIdx];
      lbImg.src = item.src;
      lbImg.alt = item.alt;
      lbCap.textContent = item.cap;
      // hide arrows when only one image
      lb.querySelector('.lb-prev').style.visibility = lbItems.length > 1 ? '' : 'hidden';
      lb.querySelector('.lb-next').style.visibility = lbItems.length > 1 ? '' : 'hidden';
    }
    function closeLb() {
      lb.hidden = true;
      document.body.style.overflow = '';
    }
    function navigate(dir) {
      lbIdx = (lbIdx + dir + lbItems.length) % lbItems.length;
      renderLb();
    }

    // ── Featured project thumbnails — grouped by project ──────────
    const thumbGroups = {};
    document.querySelectorAll('.fpc-thumb').forEach(el => {
      const proj = el.dataset.project;
      const idx  = parseInt(el.dataset.idx, 10);
      if (!thumbGroups[proj]) thumbGroups[proj] = [];
      thumbGroups[proj][idx] = {
        src: el.querySelector('img').src,
        alt: el.querySelector('img').alt,
        cap: el.querySelector('.fpc-thumb-cap')?.textContent?.trim() || '',
      };
      el.addEventListener('click', () => openLb(thumbGroups[proj], idx));
    });

    // ── Bento gallery cells — navigate as one group ───────────────
    const cells = Array.from(document.querySelectorAll('.proj-cell'));
    const cellItems = cells.map(cell => ({
      src: cell.querySelector('img').src,
      alt: cell.querySelector('img').alt,
      cap: cell.querySelector('.loc')?.textContent?.trim() || '',
    }));
    cells.forEach((cell, i) => cell.addEventListener('click', () => openLb(cellItems, i)));

    lb.querySelector('.lb-close').addEventListener('click', closeLb);
    lb.querySelector('.lb-prev').addEventListener('click', () => navigate(-1));
    lb.querySelector('.lb-next').addEventListener('click', () => navigate(1));
    lb.addEventListener('click', e => { if (e.target === lb) closeLb(); });
    document.addEventListener('keydown', e => {
      if (lb.hidden) return;
      if (e.key === 'Escape') closeLb();
      if (e.key === 'ArrowLeft') navigate(-1);
      if (e.key === 'ArrowRight') navigate(1);
    });
  }

  // ── Contact form ──────────────────────────────────────────────────
  const form = document.getElementById('quote-form');
  if (form) {
    const status = document.getElementById('form-status');
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = form.querySelector('[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Sending…';
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
      btn.textContent = 'Send Request';
    });
  }
})();
