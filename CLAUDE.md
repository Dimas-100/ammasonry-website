# A&M Masonry Inc — Project Guide

## Overview
Static marketing website for A&M Masonry Inc, a masonry and construction company based in Lawrenceville, GA. Pure HTML/CSS/JS — no framework, no build step. Deploys to Vercel as a static folder.

## File Structure
```
ammasonry/
├── website/
│   ├── index.html        # Homepage (hero, intro, services, projects [dark video rows], closing CTA, footer)
│   ├── services.html     # Full services accordion (all 5 services)
│   ├── projects.html     # Featured projects as alternating video + description rows (no photo gallery)
│   ├── about.html        # Company story, values, stats (RETAINED but unlinked — not in nav/footer/sitemap)
│   ├── contact.html      # Quote request form + contact info sidebar
│   ├── homepage.css      # Homepage-only stylesheet (linked by index.html)
│   ├── styles-v2.css     # Shared stylesheet for inner pages (services, projects, about, contact)
│   ├── homepage.js       # Homepage-only JS: hero video crossfade + project feature-row video crossfade
│   ├── v2-common.js      # Shared JS for inner pages: reveal, accordion, form, data-year, mobile nav
│   ├── vercel.json       # Vercel config (cleanUrls, trailingSlash, Cache-Control: must-revalidate so deploys aren't served stale)
│   ├── robots.txt        # Allow all + Sitemap: line
│   ├── sitemap.xml       # 5 absolute page URLs (https://ammasonryinc.co)
│   └── assets/
│       ├── img/          # Project photos (Brick/, Stone/, Framing/, Block/), am-logo-nav-h.png, favicon-black.png, og-cover.jpg (1200×630 social share)
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

**homepage.css** is the homepage-only stylesheet, linked from `index.html` via `<link rel="stylesheet" href="homepage.css">`. It is kept separate because the homepage has unique sections (hero video, dark project video rows `.proj-rows`/`.pfrow`) not shared with inner pages.

**styles-v2.css** covers inner pages only: nav (`.v2-nav`), **image-backed page heroes** (`.page-hero-v2` + `.page-hero-v2-img`/`.page-hero-v2-overlay`/`.page-hero-v2-eyebrow`/`.page-hero-v2-rule`, mirroring the landing hero — dark photo + left-weighted scrim + serif-accent headline), buttons (`.btn-v2`), services editorial spreads (`.svp-row`, alternating, with a category eyebrow `.svp-cat`, crimson-dot bullets, and scroll **parallax** + hover-lift on the photos; placeholder trades use the branded dark `.coming-soon` panel), featured project **case studies** (`.pcase` — an editorial header `.pcase-head` (`.pcase-meta` / `.pcase-title` / inline `.pcase-scope`), then a large feature media `.pshow-media` (16:9, scroll parallax on `.pshow-img`, hover-lift; the `.pshow-vid` markup + scroll-focus autoplay in `v2-common.js` also supports a video feature, currently unused — the Overlook video was removed), then a `.pcase-grid` gallery of the project's other images as `.pcase-tile`s (hover-lift; 3-up on desktop, 2-up on mobile with a lone odd tile spanning full width). Each project shows all its photos, not just one; deliberately *not* the side-by-side service layout. Any project photo opens a full-screen `.lightbox` (controller in `v2-common.js` — click/tap to open, swipe/arrows/keyboard to move within that project's images, Esc/backdrop/✕ to close, scroll-locked)), CTA strip (`.ctas-v2`), about layout (`.about-*`), contact layout (`.contact-*` — image hero, two-column form + dark `.contact-info-box`, and a numbered "what happens next" `.contact-steps` strip below), footer (`.site-footer`/`.sf-*`, shared with the homepage), and shared utilities (`.reveal`, `.eyebrow`, `.section`).

The inner pages (services, projects, contact) were redesigned to match the landing page: each opens with an image hero (services → `Stone/stone-wall-1.jpg`, projects → `Project/douglas1-hero.jpg`, contact → `Project/westpoint-hero.jpg`), and the body sections carry landing-style scroll reveals + hover effects. The subtle image **parallax** (transform-only, `requestAnimationFrame`-throttled, reduced-motion-safe) lives in `v2-common.js` and targets `.svp-photo img, .pshow-media img`; the scroll-focus video autoplay there targets `.pshow-media`. Projects gallery images were optimized from large source PNGs (`Douglas3.png`, `WestPine1/2.png`, `PineCrest1.png`, `West Pine-web.jpg`, each ~3 MB) into ~250–400 KB JPEGs (`douglas3.jpg`, `westpine1/2.jpg`, `pinecrest1.jpg`, `westpine-wide.jpg`) via PowerShell `System.Drawing` (resize to 1600px, quality 82); the original PNGs remain on disk unused (safe to delete to slim the Vercel deploy). Per the user, the **Pine Crest** photos belong to the **Douglas** project, so they appear in Douglas's gallery.

**Note:** The homepage uses different class names than inner pages for shared components (nav: `.nav` vs `.v2-nav`, buttons: `.btn` vs `.btn-v2`). This is a known inconsistency to resolve in a future CSS consolidation pass.

## JavaScript

**v2-common.js** (inner pages):
- `data-year` — fills current year
- `.reveal` — IntersectionObserver scroll reveal (supports `data-delay`)
- `.svc-acc-trigger` / `.svc-acc-row` — services accordion
- Mobile nav toggle (`.v2-nav-toggle` / `.v2-nav-links`)
- `#quote-form` — Formspree form submit

**homepage.js** (index.html only):
- Hero video crossfade — `#hero-vid-0` / `#hero-vid-1` with 1.5s opacity transition
- Project feature-row video crossfade — each `[data-pcv-group]` dissolves its two `.pcv` clips (desktop only, disabled under reduced motion)

## Pages & Nav

Every page shares the same nav and footer HTML markup. Nav pattern:
- Logo → centered links → "Free Quote" CTA button
- Active page gets `class="is-current"` on its nav link
- All CTA buttons link to `contact.html`
- Nav links: Services | Projects | Contact (no Home link — logo is the home link)
- **About page is currently unlinked:** `about.html` is retained in the repo (and still deploys/resolves at `/about`) but is intentionally removed from the nav, footer, and `sitemap.xml` so it isn't part of the live site. To reintroduce it, re-add the `<a href="/about">About</a>` link to the nav + footer on `index/services/projects/contact.html` and restore its `<url>` entry in `sitemap.xml`.

## SEO
- Every page `<head>` carries: a self-referencing `<link rel="canonical">`, Open Graph + Twitter tags (`og:image` → absolute `assets/img/og-cover.jpg`), and one **identical** LocalBusiness JSON-LD block (`@type: GeneralContractor`). When editing head meta, replicate across all 5 pages — only the canonical/`og:url` path differs.
- `aggregateRating` is intentionally **omitted** from the JSON-LD — Google disallows self-collected review stars in rich results. Don't re-add it.
- Every content `<img>` has explicit `width`/`height`; page bodies are wrapped in a single `<main>` landmark.

## Deployment

- **GitHub repo:** `github.com/Dimas-100/ammasonry-website`
- **Hosting:** Vercel, connected to GitHub. Root directory set to `website/`.
- **Deploy workflow:** edit files → `git commit` → `git push origin main` → Vercel auto-redeploys in ~60 seconds. No manual steps needed in Vercel.
- **Domain:** `ammasonryinc.co` chosen (still pending client payment). It is **hardcoded** in all SEO tags — if the final domain differs, find-and-replace `https://ammasonryinc.co` across `website/*.html`, `robots.txt`, and `sitemap.xml`. Once purchased, point DNS to Vercel via the Vercel dashboard.

## Workflow Rules
- **Before any major push:** `git tag v0.x-description` to preserve a rollback point
- **Page changes:** work page-by-page. Confirm design direction before implementing.
- **No new dependencies:** pure HTML/CSS/JS. No npm, no bundlers.
- **Images:** all in `website/assets/img/`. Paths from HTML files use `assets/img/` (assets folder lives inside `website/` so Vercel deploys it).
- **CSS edits (inner pages):** edit `styles-v2.css`. Add new section CSS before the final `@media` blocks.
- **CSS edits (homepage):** edit `homepage.css`.
- **Formspree endpoint:** `https://formspree.io/f/xnjwbjjo` (in contact.html form action)
- **Local preview:** `python -m http.server` from `website/`, then open pages as `*.html` (cleanUrls only resolve on Vercel, not a plain static server). Playwright MCP works for verifying JS behavior in-browser.
- **Asset tooling:** ImageMagick/ffmpeg are NOT installed. On Windows `convert` is the disk-volume tool — do NOT run it on images. Resize raster images via PowerShell `System.Drawing`; video re-encoding needs ffmpeg on a machine that has it.
