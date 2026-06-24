# Homepage Image-Driven Redesign — Design

**Date:** 2026-06-23
**Status:** Implemented locally (not pushed — pending client preview)

## Goal
Make the site feel like an established, professional contractor (per two client-provided
references: a photo hero à la "BESTBUILD", and a featured-project triptych), and replace all
video with optimized photography.

## Decisions
- **Structure:** Hybrid. Keep the 4 inner pages for SEO; rebuild the **homepage** into a
  self-contained landing page.
- **Look:** "Blend" — dark dramatic hero + dark footer; light, clean body sections.
  Keep the existing brand (crimson/ink/paper, Archivo + Fraunces italic + JetBrains Mono).
- **Hero:** Full-bleed **WestPoint1** photo behind the existing dark gradient overlay.
  Headline kept: "Quality masonry, built to last."
- **Credibility bar:** Slim dark (`--ink-2`) band under the hero — **3 honest stats only:
  10+ Years · 5 States · 100% Family-Owned.**
- **Services:** Two-column "sticky scroll" section (modeled on a client reference): a `position:
  sticky` intro on the left + a scrollable list of all 5 services on the right that reveal on
  scroll and **highlight crimson on hover**. Coming-soon trades (Siding, Drywall, Painting) carry
  a badge. Collapses to a clean stacked list on mobile (intro un-sticks). No scroll-jacking.
  Verified the sticky pins correctly despite `body { overflow-x: hidden }` and Lenis.
- **Featured Projects:** Center-focus **carousel** (replacing the old dark video rows), modeled
  on the client's reference: active project large/crisp in the middle, neighbours dimmed and
  scaled back as peeks; circular ‹ › arrows + dots + keyboard + swipe; the whole track glides
  via one `translateX` transform (GPU, ~0.66s easing). Active slide carries the elevated caption
  card. All 4 projects included (West Pine, Douglas, Pine Crest, West Point), starting on Douglas.
  The earlier static triptych and its choppy hover-zoom were removed.
- **projects.html:** Videos → optimized photos. **Overlook removed** (no still frame
  available) and replaced with **Pine Crest**.
- **Navigation (all 5 pages):** Dropped the filled "Free Quote" nav button for a restrained,
  right-aligned text nav ending in a **Contact** link (Presson-inspired); "Free Quote" stays on
  the hero + closing strip. Added a **Projects dropdown** (All Projects · West Point · West Pine ·
  Douglas · Pine Crest) — hover/click on desktop, tap-to-expand accordion on mobile. Implemented in
  both nav systems (`.nav` + homepage.js, `.v2-nav` + v2-common.js) via shared `.nav-dd*` classes.
  - **Transparent nav over hero:** Nav is now transparent at the top of every page (with a soft
    top-down scrim `::before` for legibility) and frosts into a solid bar on scroll (existing
    `.is-scrolled` state). Works site-wide because all first sections are already dark (homepage
    photo hero + inner `.page-hero-v2` ink heroes) — the nav blends into the hero for a seamless flow.
- **Hero (final, after exploring options):** Settled back on a **full-bleed dark photo hero**
  (`min-height: 100svh`) — headline overlaid left on a left-weighted dark gradient. Image is
  **`douglas1-hero.jpg`** (a finished green/brick building under a dramatic cloudy sky; optimized
  from `Douglas1.png`, 1898px, ~342 KB), chosen as a fresh, more architectural shot than the
  original WestPoint aerial. Explorations that were tried and dropped: full-height cream editorial
  hero (two-image collage → 3-up photo band → single feature photo). Followed by a short dark
  **"Who We Are" band** (`.about-strip`) folding in the three stats (replaced `.stats-band`).
- **Landing-page nav:** Transparent with **white text + white logo + a soft top scrim** over the
  photo hero, frosting to a **dark bar** on scroll. (A dark-logo variant `am-logo-nav-dark.png` was
  generated for the cream-hero experiment and is retained for possible future use.) Mobile drawer is
  dark with the white logo + white toggle.
  **TODO (later pass):** the four inner pages already use the matching dark/transparent `.v2-nav`
  over their dark `.page-hero-v2` heroes, so the site is consistent again — no extra mirroring
  needed for this hero direction.

## Honesty corrections (important)
- Removed the **"4.9 Average Rating"** stat — no published reviews exist; the reviews page
  was deliberately removed; Google disallows self-collected stars (JSON-LD already omits them).
- Removed **"500+ Projects Completed"** — client confirmed there is no honest figure yet.
- These were pulled from **both** the homepage credibility bar and the About page stats band.

## Image pipeline
Converted 7 drone-frame PNGs (2.9–3.8 MB each) → optimized JPGs via PowerShell System.Drawing
(no ImageMagick). Outputs in `website/assets/img/Project/`:
`westpoint-hero.jpg` (1920w, ~378 KB), `westpoint.jpg`, `westpine.jpg`, `douglas.jpg`,
`pinecrest.jpg` (1500w, ~220–306 KB).

## Files changed
`index.html`, `homepage.css`, `homepage.js` (removed all video JS), `projects.html`,
`about.html`, `styles-v2.css`.

## Open items (need client input)
1. **Real project count** — add a 4th stat ("Projects Completed") once a defensible number exists.
2. **Featured/Pine Crest descriptions** — currently placeholders ("write-up coming soon",
   "details coming soon"); awaiting cousin's copy. Look for `PLACEHOLDER` HTML comments.
3. **Overlook still image** — send a drone frame to re-add Overlook to projects.html.

## Rollback
Local git tag `pre-image-redesign-2026-06-23` marks the pre-change state.
