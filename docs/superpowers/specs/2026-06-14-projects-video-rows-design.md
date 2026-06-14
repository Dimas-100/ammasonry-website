# Design — Simplify to video-driven "Projects" (homepage + projects page)

**Date:** 2026-06-14
**Status:** Approved (pending spec review)
**Scope:** `website/index.html`, `website/projects.html`, `website/homepage.css`, `website/styles-v2.css`, `website/v2-common.js`, `website/homepage.js`

## Goal

Make the site simpler and easier to navigate on desktop and mobile. First pass:
collapse the homepage's two adjacent sections ("What sets us apart" + "Completed
projects") into a single video-driven **Projects** section, and strip the projects
page down to video + description. Photos are removed; videos stay.

## Decisions (locked)

- **Layout:** alternating feature rows — each project is a full row with a large
  video on one side and text (title, location·year, description) on the other; rows
  alternate sides on desktop and stack (video over text) on mobile.
- **Scope:** both `index.html` and `projects.html`.
- **Backgrounds:** homepage Projects section is **dark** (`--ink-2`, matching the old
  "What sets us apart"). Projects page featured section **stays light** (`--paper-2`,
  Option A — smallest, lowest-risk change).

## 1. Homepage (`index.html`)

### Remove
- The entire **"What sets us apart"** section (`<section class="section why-sec" id="why">`):
  heading + lede, the "Coming Soon" dark photo placeholder, and the 4 value props
  (Skilled Craftsmanship, Durable Materials, Clear Communication, Residential & Commercial).
- The entire old **"Completed projects"** bento (`<section class="section proj-sec" id="projects">`):
  the 12-col grid and its 4 photo cards (Stone Hearth, Custom Brick, Framing Build,
  Block Work). The West Pine video card content is carried into the new section.

### Add — one new dark Projects section
- `<section class="section proj-rows" id="projects">` on the dark `--ink-2` background.
  Retaining `id="projects"` preserves the hero's "View our projects" `#projects` anchor.
- Head: eyebrow optional; `<h2>Our <span class="accent">projects.</span></h2>` + a short
  one-line lede.
- A rows container with one **feature row** per project:
  - Row markup: `.pfrow` (CSS grid, two columns) with `.pfrow-media` (video) and
    `.pfrow-info` (text).
  - `.pfrow-info`: `<h3>` title, mono location·year tag, `<p>` description.
  - Alternating sides via `.pfrow:nth-child(even)` (flip grid column order).
  - `.reveal` (+ `data-delay`) for scroll-in, consistent with the rest of the page.
- **One project now — West Pine**, reusing its two existing drone clips as a crossfade:
  `assets/video/projects/west-pine-1.MP4.mp4` and `.../west-pine-2.MP4.mp4`, with the
  existing `[data-pcv-group]` + `.pcv` / `.pcv.is-active` mechanism.
- Keep the **"View All Projects →"** button (`.proj-foot`) linking to `/projects`.

### Copy (editable placeholders)
- Heading: `Our projects.`
- Lede: `Recent work from across the Southeast — straight from the field.`
- West Pine: title `West Pine`; tag `Buford, GA · 2024`; description:
  `A full residential build in Buford — stone and block masonry taken from the ground up. The drone footage walks the whole site, start to finish.`

## 2. Projects page (`projects.html`)

### Remove
- The **photo gallery** section (`<section class="proj-gallery">`): the
  "More from our portfolio" head, the filter group (All / Brick / Framing), and all 5
  `.proj-cell` photos.
- The **lightbox** markup (`<div id="v2-lightbox" class="v2-lb" …>`).

### Change — tabs → alternating rows
- Remove the `.pfeat-tabs` tablist.
- Show **both** featured articles (West Point, West Pine) stacked as alternating rows:
  drop `hidden`, the `role="tab"/"tabpanel"` wiring, and the `data-proj-panel` tab
  coupling. Keep the article `id`s (`west-point`, `west-pine`) and `scroll-margin-top`.
- Keep the richer per-project detail on this page: stats (`.fpc-stats`: Sq Ft / Weeks /
  Stories) and the "Discuss a similar project" CTA (`.fpc-cta`).
- Background stays light (`--paper-2`).

### Copy updates (remove photo references)
- Hero `<p>`: replace "Named projects with drone footage and detail photography, plus
  our full photo gallery below." with a video-only line, e.g.
  `Named projects with drone footage from the field.`
- West Point `.fpc-desc`: drop the "detail photography shows coursing and mortar work
  up close" clause; keep the drone/scope description.
- West Pine `.fpc-desc`: drop "detail photography captures stone selection and finished
  joint quality"; keep the aerial/scope description.

## 3. CSS

### `homepage.css`
- Remove the `.why-*` rules (`.why-sec`, `.why-head`, `.why-grid`, `.why-photo*`,
  `.why-items`, `.why-item*`, `.why-icon`) and any `why`/`proj` entries in the media
  queries.
- Remove the old projects bento rules (`.proj-sec`, `.proj-head*`, `.proj-grid`,
  `.proj-card-mini*`, `.proj-card-media`, `.proj-card-meta`, `.proj-card-title`,
  `.proj-card-tag`) — but **preserve** the `.pcv` crossfade opacity rules (reused) and
  the `.proj-foot` button rule.
- Remove `.coming-soon--dark` (only the why-photo used it). **Keep** base `.coming-soon`
  (still used by the Services "Drywall" card).
- Add new dark rows: `.proj-rows` (section bg `--ink-2`, light text), `.proj-rows-head`,
  `.pfrow`, `.pfrow:nth-child(even)` flip, `.pfrow-media` (rounded video frame,
  aspect-ratio), `.pfrow-info`, `.pfrow-title`, `.pfrow-tag`, `.pfrow-desc`. Mobile
  (`max-width` breakpoint): collapse `.pfrow` to one column, video first.

### `styles-v2.css`
- Remove gallery/filter/lightbox/tab styles: `.proj-gallery`, `.pgal-*`, `.proj-filter`,
  `.proj-filter-btn*`, `.proj-cell*`, `.proj-grid` (+ its media queries), `.v2-lb`,
  `.lb-*`, `.pfeat-tabs`, `.pfeat-tab*`. Remove `.pfeat-head`/`.pfeat-rule`/`.pfeat-count`
  if unused after tab removal.
- Repurpose `.fpc` into stacked alternating rows: add vertical spacing between rows and
  a `.fpc:nth-child(even)` (or modifier) rule to flip the `grid-template-areas` so the
  video alternates sides. Drop `.fpc[hidden]` / `.fpc.fading` reliance on tab switching
  (no harm leaving the rules, but they're no longer triggered).

## 4. JavaScript

### `v2-common.js`
- Remove the **featured-tabs** block (the `.pfeat-tab` / `[data-proj-panel]` logic,
  including hash handling and arrow-key roving).
- Remove the **gallery filter + lightbox** block (`.proj-grid` + `#v2-lightbox`).
- Keep everything else (Lenis, anchors, sticky nav, lazy fade, year, mobile nav, reveal,
  contact form).

### `homepage.js`
- Keep the project-card video crossfade. **Generalize** it from a single
  `querySelector('[data-pcv-group]')` to iterate all `[data-pcv-group]` elements, so
  future project rows with their own crossfades work. Behavior unchanged for the single
  current group; still desktop-only and disabled under reduced motion.

## Out of scope (this pass)
- No changes to `services.html`, `about.html`, `reviews.html`, `contact.html`.
- No new dependencies; pure HTML/CSS/JS (per project rules).
- No SEO/JSON-LD changes.

## Verification
- Local preview via `python -m http.server` from `website/`; open `index.html` and
  `projects.html` as `*.html`.
- Confirm: homepage shows one dark Projects section with the West Pine video row;
  no "What sets us apart"; no photo cards. Projects page shows two alternating video
  rows, no photo gallery, no filter/lightbox. Both stack cleanly on a narrow viewport.
- Playwright MCP to confirm video autoplay/crossfade and mobile stacking.
