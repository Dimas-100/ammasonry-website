# A&M Masonry Inc — Project Guide

## Overview
Static marketing website for A&M Masonry Inc, a masonry and construction company based in Lawrenceville, GA. Pure HTML/CSS/JS — no framework, no build step. Deploys to Vercel as a static folder.

## File Structure
```
ammasonry/
├── website/
│   ├── index.html        # Homepage (hero, stats, services, process, projects, reviews, why us, CTA, footer)
│   ├── services.html     # Full services accordion (all 5 services)
│   ├── projects.html     # Full project gallery — bento grid with filter + lightbox + featured video cards
│   ├── about.html        # Company story, values, stats
│   ├── reviews.html      # Full testimonials page
│   ├── contact.html      # Quote request form + contact info sidebar
│   ├── homepage.css      # Homepage-only stylesheet (linked by index.html)
│   ├── styles-v2.css     # Shared stylesheet for inner pages (services, projects, about, reviews, contact)
│   ├── homepage.js       # Homepage-only JS: video crossfade, countup, project tabs, services accordion
│   ├── v2-common.js      # Shared JS for inner pages: reveal, accordion, filter, lightbox, form, data-year
│   ├── vercel.json       # Vercel config (cleanUrls, trailingSlash)
│   └── assets/
│       ├── img/          # Project photos (Brick/, Stone/, Framing/, Block/), am-logo-nav-h.png, favicon-black.png
│       ├── video/        # Drone footage (West Point*/West pine .mp4) + video/projects/ card clips
│       └── lenis.min.js  # Vendored smooth-scroll library (no npm)
├── .gitignore
├── README.md
└── CLAUDE.md             # This file
```

## Design System

**Colors** (CSS custom properties in `:root`):
- `--crimson: #C8102E` — primary brand color, accents, CTAs, active states
- `--crimson-deep: #A60C25` — hover state for crimson elements
- `--ink: #14171C` — nav, hero, testimonials, footer backgrounds
- `--ink-2: #1B1F26` — stats bar, process rail, project cards
- `--paper: #F4F1EB` — body background, light sections
- `--paper-2: #EAE4D8` — slightly darker light background (projects section)
- `--line: rgba(20,23,28,0.10)` — hairline borders/dividers on light backgrounds
- `--line-d: rgba(244,241,235,0.10)` — hairline borders/dividers on dark backgrounds
- `--muted: #5F6573` — body text, descriptions
- `--muted-d: rgba(244,241,235,0.62)` — muted text on dark backgrounds

**Typography:**
- `--display: 'Archivo'` — headings (weight 700–900), nav, buttons, stats
- `--serif: 'Fraunces'` — italic accent text in headings (`.accent` inside `h1`/`h2`)
- `--body: 'Inter'` — body copy
- `--mono: 'JetBrains Mono'` — eyebrows, tags, metadata, footer labels

**Key utility classes:**
- `.eyebrow` — mono, uppercase, crimson, small — used above section headings
- `.accent` — crimson color; on headings also switches to Fraunces italic
- `.it` — Fraunces italic (used in CTA strip subheading)
- `.reveal` + `.in` — scroll reveal via IntersectionObserver (add `data-delay="ms"` for stagger)
- `.section` — vertical padding clamp(80px, 10vw, 140px)
- `.wrap` — max-width container with fluid gutters

## CSS Architecture

**homepage.css** is the homepage-only stylesheet, linked from `index.html` via `<link rel="stylesheet" href="homepage.css">`. It is kept separate because the homepage has unique sections (hero video, stats bar, process rail, project tabs, testimonials grid, why-us grid) not shared with inner pages.

**styles-v2.css** covers inner pages only: nav (`.v2-nav`), page heroes (`.page-hero-v2`), buttons (`.btn-v2`), services accordion (`.svc-acc-*`), projects bento (`.proj-bento`), reviews grid (`.reviews-grid-v2`), about layout (`.about-*`), contact layout (`.contact-*`), footer (`.v2-footer`), lightbox (`.v2-lb`), and shared utilities (`.reveal`, `.eyebrow`, `.section`).

**Note:** The homepage uses different class names than inner pages for shared components (nav: `.nav` vs `.v2-nav`, buttons: `.btn` vs `.btn-v2`). This is a known inconsistency to resolve in a future CSS consolidation pass.

## JavaScript

**v2-common.js** (inner pages):
- `data-year` — fills current year
- `.reveal` — IntersectionObserver scroll reveal (supports `data-delay`)
- `.svc-acc-trigger` / `.svc-acc-row` — services accordion
- `.proj-filter-v2` / `.proj-cell[data-cat]` — gallery filter
- `#v2-lightbox` + `.fpc-thumb` + `.proj-cell` — lightbox with keyboard nav
- `#quote-form` — Formspree form submit

**homepage.js** (index.html only):
- Hero video crossfade — `#hero-vid-0` / `#hero-vid-1` with 1.5s opacity transition
- CountUp — `[data-countup]` with `data-suffix` attribute, triggered by IntersectionObserver
- Project tab switching — `.proj-tab` / `[data-proj-panel]` with fade
- `.svc-head-row` / `.svc-row` — services accordion (homepage class names differ from inner pages)

## Pages & Nav

Every page shares the same nav and footer HTML markup. Nav pattern:
- Logo → centered links → "Free Quote" CTA button
- Active page gets `class="is-current"` on its nav link
- All CTA buttons link to `contact.html`
- Nav links: Services | Projects | Reviews | About (no Home link — logo is the home link)

## Deployment

- **GitHub repo:** `github.com/Dimas-100/ammasonry-website`
- **Hosting:** Vercel, connected to GitHub. Root directory set to `website/`.
- **Deploy workflow:** edit files → `git commit` → `git push origin main` → Vercel auto-redeploys in ~60 seconds. No manual steps needed in Vercel.
- **Domain:** `ammasonryinc.net` or `ammasonryinc.co` — pending client (uncle) payment confirmation. Once purchased, point DNS to Vercel via the Vercel dashboard.

## Workflow Rules
- **Before any major push:** `git tag v0.x-description` to preserve a rollback point
- **Page changes:** work page-by-page. Confirm design direction before implementing.
- **No new dependencies:** pure HTML/CSS/JS. No npm, no bundlers.
- **Images:** all in `website/assets/img/`. Paths from HTML files use `assets/img/` (assets folder lives inside `website/` so Vercel deploys it).
- **CSS edits (inner pages):** edit `styles-v2.css`. Add new section CSS before the final `@media` blocks.
- **CSS edits (homepage):** edit `homepage.css`.
- **Formspree endpoint:** `https://formspree.io/f/xnjwbjjo` (in contact.html form action)
