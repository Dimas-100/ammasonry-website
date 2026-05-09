// ============ Mobile nav toggle ============
const navToggle = document.querySelector('.nav__toggle');
const navLinks = document.getElementById('nav-links');

if (navToggle && navLinks) {
  navToggle.addEventListener('click', () => {
    const open = navLinks.classList.toggle('is-open');
    navToggle.setAttribute('aria-expanded', String(open));
  });

  // Close menu when a link is clicked (mobile)
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('is-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });
}

// ============ Footer year ============
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ============ Service detail pages ============
const SERVICES = {
  'masonry-brickwork': {
    title: 'Masonry & Brickwork',
    image: '../assets/img/Brick/brick-front-1.jpg',
    summary: 'Durable brick, block, and masonry work for homes, businesses, additions, repairs, and exterior upgrades.',
    description: 'A&M Masonry handles new masonry construction, brick installation, block work, and repairs with a focus on clean layout, strong structure, and long-term curb appeal. We help clients choose the right materials and finish for the building style and project goals.',
    projects: [
      'Brick exterior installation and repair',
      'Block walls and structural masonry',
      'Columns, steps, patios, and entry features',
      'Masonry restoration and matching existing work'
    ]
  },
  'fireplaces-stoves': {
    title: 'Fireplaces & Stoves',
    image: '../assets/img/Stone/stone-wall-1.jpg',
    summary: 'Fireplace and stove masonry built for a polished finish, reliable use, and a strong focal point inside or outside the home.',
    description: 'From new fireplace surrounds to masonry updates around stove installations, we build fireplace features that match the property and the way the space is used. Our work can include brick, stone, block, and finish repairs.',
    projects: [
      'Indoor and outdoor fireplace masonry',
      'Stone or brick fireplace surrounds',
      'Hearths, mantels, and accent walls',
      'Fireplace repair and finish updates'
    ]
  },
  'plaster-gypsum-board': {
    title: 'Plaster & Gypsum Board',
    image: '../assets/img/Framing/framing-inside-1.jpg',
    summary: 'Interior wall and finish services that prepare rooms for clean, durable, ready-to-paint surfaces.',
    description: 'We support interior construction with gypsum board, plaster-related work, patching, and surface preparation. The goal is a clean finished surface that lines up with the rest of the project schedule and finish standards.',
    projects: [
      'Gypsum board installation and repair',
      'Interior patching and surface preparation',
      'Finish support for remodels and additions',
      'Coordination with painting and coating work'
    ]
  },
  'siding-installation': {
    title: 'Siding Installation',
    image: '../assets/img/Brick/brick-side-wall.JPG',
    summary: 'Exterior siding installation and replacement that improves appearance, protection, and property value.',
    description: 'A&M Masonry provides siding services for exterior upgrades, repairs, and construction projects. We focus on correct installation, reliable weather protection, and a finished look that fits the building.',
    projects: [
      'New siding installation',
      'Siding replacement and exterior updates',
      'Trim and transition details',
      'Repair coordination with masonry or painting work'
    ]
  },
  'painting-coatings': {
    title: 'Painting & Coatings',
    image: '../assets/img/Brick/brick-black.jpg',
    summary: 'Protective and decorative coatings for masonry, siding, and exterior or interior project finishes.',
    description: 'Our painting and coating work helps complete masonry and construction projects with a clean final finish. We prepare surfaces properly and apply coatings suited to the material and project conditions.',
    projects: [
      'Exterior and interior painting',
      'Masonry coatings and finish updates',
      'Surface preparation and patching',
      'Finish work for remodels and new construction'
    ]
  },
  'rough-carpentry': {
    title: 'Rough Carpentry',
    image: '../assets/img/Framing/framing-done-1.jpg',
    summary: 'Framing and rough carpentry support for additions, remodels, structural work, and build-outs.',
    description: 'We provide rough carpentry services where framing, structural support, or build-out work is needed alongside masonry and exterior projects. Our crews work with practical field conditions and project requirements.',
    projects: [
      'Wood framing and structural support',
      'Additions, remodels, and build-outs',
      'Blocking, backing, and project preparation',
      'Coordination with masonry and siding scopes'
    ]
  },
  metals: {
    title: 'Metals',
    image: '../assets/img/Block/block-1.jpg',
    summary: 'Metal-related construction support for project details, reinforcement, transitions, and durable finish elements.',
    description: 'Metal services can support masonry and construction scopes where reinforcement, flashing, edging, or durable project details are required. We align this work with the surrounding materials and project needs.',
    projects: [
      'Metal reinforcement and support details',
      'Flashing and transition coordination',
      'Durable edging or finish elements',
      'Project-specific metal installation support'
    ]
  },
  'equipment-services': {
    title: 'Equipment Services',
    image: '../assets/img/Stone/stone-pillar-1.jpg',
    summary: 'Equipment support for masonry and construction work that needs the right tools, access, and site coordination.',
    description: 'We support jobs with the equipment planning and field capability needed to complete masonry and construction work efficiently. This helps keep projects moving and gives crews the access they need for quality installation.',
    projects: [
      'Site preparation and project support',
      'Equipment-assisted masonry installation',
      'Access support for exterior work',
      'Coordination for larger residential or commercial scopes'
    ]
  }
};

function renderServicePage() {
  const servicePage = document.getElementById('service-page');
  if (!servicePage) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get('service') || 'masonry-brickwork';
  const service = SERVICES[slug];

  if (!service) {
    servicePage.innerHTML = `
      <section class="service-not-found">
        <div class="container">
          <h1>Service Not Found</h1>
          <p>The service page you requested is not available. Return to the services list to choose another option.</p>
          <a href="index.html#about" class="btn btn--primary btn--lg">View Services</a>
        </div>
      </section>
    `;
    document.title = 'Service Not Found | A&M Masonry Inc';
    return;
  }

  document.title = `${service.title} | A&M Masonry Inc`;
  const titleEl = document.getElementById('service-title');
  const summaryEl = document.getElementById('service-summary');
  const descriptionEl = document.getElementById('service-description');
  const imageEl = document.getElementById('service-image');
  const projectsEl = document.getElementById('service-projects');

  if (titleEl) titleEl.textContent = service.title;
  if (summaryEl) summaryEl.textContent = service.summary;
  if (descriptionEl) descriptionEl.textContent = service.description;
  if (imageEl) {
    imageEl.src = service.image;
    imageEl.alt = `${service.title} project by A&M Masonry`;
  }
  if (projectsEl) {
    projectsEl.innerHTML = service.projects.map(project => `<li>${project}</li>`).join('');
  }
}

renderServicePage();

// ============ Scroll reveal animations ============
function initScrollReveal() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealSelectors = [
    '.hero__content',
    '.stats-bar__stat',
    '.section-head',
    '.about__col',
    '.feature',
    '.proj-filter',
    '.proj-card',
    '.quote__form',
    '.service-hero__content',
    '.service-hero__media',
    '.service-detail__main',
    '.service-detail__side'
  ];
  const revealItems = document.querySelectorAll(revealSelectors.join(','));

  revealItems.forEach((item, index) => {
    item.classList.add('reveal');
    item.style.setProperty('--reveal-delay', `${Math.min(index % 6, 5) * 55}ms`);
  });

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealItems.forEach(item => item.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      entry.target.classList.toggle('is-visible', entry.isIntersecting);
    });
  }, {
    threshold: 0.16,
    rootMargin: '0px 0px -8% 0px'
  });

  revealItems.forEach(item => observer.observe(item));
}

initScrollReveal();

// ============ Project filter & lightbox ============
const filterButtons = document.querySelectorAll('.proj-filter');
const galleryTiles = document.querySelectorAll('.proj-card');
const galleryEmpty = document.getElementById('gallery-empty');
const galleryViewMore = document.getElementById('gallery-view-more');
const galleryLightbox = document.getElementById('gallery-lightbox');
const galleryLightboxImage = galleryLightbox?.querySelector('.gallery-lightbox__image');
const galleryLightboxCaption = galleryLightbox?.querySelector('.gallery-lightbox__caption');
const galleryLightboxClose = galleryLightbox?.querySelector('.gallery-lightbox__close');
const galleryLightboxPrev = galleryLightbox?.querySelector('.gallery-lightbox__nav--prev');
const galleryLightboxNext = galleryLightbox?.querySelector('.gallery-lightbox__nav--next');
const GALLERY_VISIBLE_LIMIT = document.getElementById('gallery-view-more') ? 6 : Infinity;
let activeGalleryFilter = 'all';
let activeGalleryImageIndex = 0;
let lastFocusedGalleryTile = null;

function getFilteredGalleryTiles(category = activeGalleryFilter) {
  return Array.from(galleryTiles).filter(tile => {
    return category === 'all' || tile.dataset.category === category;
  });
}

function applyFilter(category) {
  const matches = getFilteredGalleryTiles(category);

  galleryTiles.forEach(tile => {
    const match = category === 'all' || tile.dataset.category === category;
    const index = matches.indexOf(tile);
    tile.classList.toggle('is-hidden', !match || index >= GALLERY_VISIBLE_LIMIT);
  });

  if (galleryEmpty) galleryEmpty.hidden = matches.length !== 0;
  if (galleryViewMore) {
    galleryViewMore.hidden = matches.length <= GALLERY_VISIBLE_LIMIT;
  }

  filterButtons.forEach(btn => {
    const active = btn.dataset.filter === category;
    btn.classList.toggle('is-active', active);
    btn.setAttribute('aria-selected', String(active));
  });
}

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    activeGalleryFilter = btn.dataset.filter;
    applyFilter(activeGalleryFilter);
  });
})

applyFilter(activeGalleryFilter);

function updateGalleryLightbox() {
  if (!galleryLightbox || !galleryLightboxImage || !galleryLightboxCaption) return;
  const images = getFilteredGalleryTiles();
  const tile = images[activeGalleryImageIndex];
  const img = tile?.querySelector('img');
  if (!img) return;

  galleryLightboxImage.src = img.currentSrc || img.src;
  galleryLightboxImage.alt = img.alt;
  galleryLightboxCaption.textContent = `${img.alt} (${activeGalleryImageIndex + 1} of ${images.length})`;
  if (galleryLightboxPrev) galleryLightboxPrev.disabled = images.length <= 1;
  if (galleryLightboxNext) galleryLightboxNext.disabled = images.length <= 1;
}

function openGalleryLightbox(tile) {
  if (!galleryLightbox) return;
  const images = getFilteredGalleryTiles();
  const index = images.indexOf(tile);
  if (index === -1) return;

  activeGalleryImageIndex = index;
  lastFocusedGalleryTile = tile;
  updateGalleryLightbox();
  galleryLightbox.hidden = false;
  document.body.classList.add('lightbox-open');
  if (galleryLightboxClose) galleryLightboxClose.focus();
}

function closeGalleryLightbox() {
  if (!galleryLightbox) return;
  galleryLightbox.hidden = true;
  document.body.classList.remove('lightbox-open');
  if (lastFocusedGalleryTile) lastFocusedGalleryTile.focus();
}

function showGalleryImage(direction) {
  const images = getFilteredGalleryTiles();
  if (!images.length) return;
  activeGalleryImageIndex = (activeGalleryImageIndex + direction + images.length) % images.length;
  updateGalleryLightbox();
}

galleryTiles.forEach(tile => {
  tile.setAttribute('role', 'button');
  tile.setAttribute('tabindex', '0');
  tile.setAttribute('aria-label', `View larger image: ${tile.querySelector('img')?.alt || 'Gallery image'}`);
  tile.addEventListener('click', () => openGalleryLightbox(tile));
  tile.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openGalleryLightbox(tile);
    }
  });
});

if (galleryLightboxClose) galleryLightboxClose.addEventListener('click', closeGalleryLightbox);
if (galleryLightboxPrev) galleryLightboxPrev.addEventListener('click', () => showGalleryImage(-1));
if (galleryLightboxNext) galleryLightboxNext.addEventListener('click', () => showGalleryImage(1));
if (galleryLightbox) {
  galleryLightbox.addEventListener('click', (e) => {
    if (e.target === galleryLightbox) closeGalleryLightbox();
  });
}

document.addEventListener('keydown', (e) => {
  if (!galleryLightbox || galleryLightbox.hidden) return;
  if (e.key === 'Escape') closeGalleryLightbox();
  if (e.key === 'ArrowLeft') showGalleryImage(-1);
  if (e.key === 'ArrowRight') showGalleryImage(1);
});

// ============ Hero inquiry pill toggle ============
document.querySelectorAll('.hero__pill').forEach(pill => {
  pill.addEventListener('click', () => {
    pill.closest('.hero__inquiry-pills').querySelectorAll('.hero__pill').forEach(p => p.classList.remove('is-active'));
    pill.classList.add('is-active');
  });
});

// ============ Quote form ============
const form = document.getElementById('quote-form');
const status = document.getElementById('form-status');

if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.className = 'form-status';
    status.textContent = '';
    const submitButton = form.querySelector('button[type="submit"]');
    const endpoint = form.getAttribute('action');

    // Basic client-side validation
    const required = ['name', 'email', 'phone', 'service', 'details'];
    for (const field of required) {
      const el = form.elements.namedItem(field);
      if (!el || !String(el.value).trim()) {
        status.classList.add('error');
        status.textContent = 'Please fill in all required fields.';
        if (el && typeof el.focus === 'function') el.focus();
        return;
      }
    }

    if (!endpoint || endpoint === 'TODO_FORM_ENDPOINT') {
      console.warn('[A&M Masonry] Quote form endpoint not configured.');
      status.classList.add('error');
      status.textContent = 'The quote form is not connected yet. Please call or email us directly.';
      return;
    }

    try {
      if (submitButton) {
        submitButton.disabled = true;
        submitButton.dataset.originalText = submitButton.textContent.trim();
        submitButton.textContent = 'Sending...';
      }

      const data = new FormData(form);
      const res = await fetch(endpoint, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' }
      });
      if (res.ok) {
        status.classList.add('success');
        status.textContent = "Thanks — we'll be in touch shortly.";
        form.reset();
      } else {
        throw new Error('Bad response');
      }
    } catch (err) {
      status.classList.add('error');
      status.textContent = 'Something went wrong. Please try again or call us directly.';
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = submitButton.dataset.originalText || 'Send Request';
      }
    }
  });
}
