# Video-Driven Projects Sections — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the homepage's "What sets us apart" + "Completed projects" sections with one dark, video-driven "Projects" section of alternating feature rows, and strip the projects page to alternating video rows (no photo gallery, filter, or lightbox).

**Architecture:** Pure static HTML/CSS/JS, no build step. Homepage uses `homepage.css`/`homepage.js`; inner pages use `styles-v2.css`/`v2-common.js`. New homepage rows reuse the existing `[data-pcv-group]` video-crossfade mechanism. Projects-page rows repurpose the existing `.fpc` two-column component with a `:nth-child(even)` flip.

**Tech Stack:** HTML5, CSS (custom properties + grid), vanilla JS. No tests framework — verification is visual via `python -m http.server` from `website/` and the Playwright MCP. Deploys to Vercel (`website/` root).

**Note on verification:** There is no unit-test harness on this project (per CLAUDE.md: pure HTML/CSS/JS, no npm/bundlers). Each task's verification is a concrete visual/DOM check, not an automated assertion. Do not fabricate a test framework.

---

## Task 0: Safety rollback point

**Files:** none (git only)

- [ ] **Step 1: Tag the current clean state** (per CLAUDE.md workflow rule)

```bash
cd "C:/Users/junio/code/ammasonry"
git tag v0.4-pre-video-rows
git status   # expect: clean, on main
```

---

## Task 1: Homepage HTML — replace both sections (`website/index.html`)

**Files:**
- Modify: `website/index.html:184-298` (the WHY US + PROJECTS sections)

- [ ] **Step 1: Replace lines 184–298 with the single new dark Projects section.**

Delete the existing `<!-- WHY US -->` section (lines 184–224) AND the existing `<!-- PROJECTS -->` section (lines 226–298), and replace the whole span with:

```html
<!-- PROJECTS -->
<section class="section proj-rows" id="projects">
  <div class="wrap">
    <div class="proj-rows-head reveal">
      <h2>Our <span class="accent">projects.</span></h2>
      <p class="lede">Recent work from across the Southeast — straight from the field.</p>
    </div>

    <div class="pfrows">

      <article class="pfrow reveal" data-delay="0">
        <div class="pfrow-media" data-pcv-group>
          <video class="pcv is-active" autoplay muted loop playsinline>
            <source src="assets/video/projects/west-pine-1.MP4.mp4" type="video/mp4" />
          </video>
          <video class="pcv" muted playsinline preload="none">
            <source src="assets/video/projects/west-pine-2.MP4.mp4" type="video/mp4" />
          </video>
        </div>
        <div class="pfrow-info">
          <h3 class="pfrow-title">West Pine</h3>
          <span class="pfrow-tag">Buford, GA · 2024</span>
          <p class="pfrow-desc">A full residential build in Buford — stone and block masonry taken from the ground up. The drone footage walks the whole site, start to finish.</p>
        </div>
      </article>

    </div>

    <div class="proj-foot reveal">
      <a href="/projects" class="btn btn--out">View All Projects <svg class="arr" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
    </div>

  </div>
</section>
```

- [ ] **Step 2: Verify no orphaned markup.**

Run: `grep -n "why-\|proj-card\|Completed\|What sets us" website/index.html`
Expected: no matches (all removed).

---

## Task 2: Homepage CSS (`website/homepage.css`)

**Files:**
- Modify: `website/homepage.css:193-241` (remove old PROJECTS bento + WHY US blocks; add new feature-row styles)
- Modify: `website/homepage.css:180` (remove `.coming-soon--dark`)

- [ ] **Step 1: Remove `.coming-soon--dark`.**

Delete this line (line 180):
```css
.coming-soon--dark { background: #0E1014; color: rgba(244,241,235,0.55); }
```
Keep the base `.coming-soon` rules above it (still used by the Services "Drywall" card).

- [ ] **Step 2: Replace lines 193–241 (the `/* ── PROJECTS ── */` block through the end of the `/* ── WHY US ── */` block, including their media queries) with the new feature-row CSS.**

The replaced span is the old `.proj-sec`/`.proj-head`/`.proj-grid`/`.proj-card-*`/`.proj-foot` rules + their `@media` blocks (193–220) and the entire `.why-*` block + its `@media` blocks (222–241). Replace all of it with:

```css
/* ── PROJECTS (dark feature rows) ────────────────────────── */
.proj-rows { background: var(--ink-2); color: var(--paper); }
.proj-rows-head { text-align: left; margin-bottom: clamp(52px,6vw,80px); max-width: 720px; }
.proj-rows-head h2 { font-family: var(--display); font-weight: 800; font-size: clamp(40px,5vw,68px); letter-spacing: -0.025em; line-height: 1; margin: 0; color: #fff; }
.proj-rows-head h2 .accent { font-family: var(--serif); font-style: italic; font-weight: 600; }
.proj-rows-head .lede { margin: 14px 0 0; max-width: 560px; color: rgba(244,241,235,0.72); }

.pfrows { display: flex; flex-direction: column; gap: clamp(56px,7vw,104px); }
.pfrow { display: grid; grid-template-columns: 1.15fr 1fr; grid-template-areas: "media info"; column-gap: clamp(36px,5vw,72px); align-items: center; }
.pfrow:nth-child(even) { grid-template-columns: 1fr 1.15fr; grid-template-areas: "info media"; }

.pfrow-media { grid-area: media; position: relative; overflow: hidden; border-radius: 14px; aspect-ratio: 16/10; background: #0E1014; border: 1px solid rgba(255,255,255,0.06); box-shadow: 0 1px 2px rgba(0,0,0,0.2), 0 30px 60px -30px rgba(0,0,0,0.6); }
.pfrow-media video { position: absolute; inset: -2px; width: calc(100% + 4px); height: calc(100% + 4px); object-fit: cover; display: block; }
.pfrow-media video.pcv { opacity: 0; transition: opacity 1.5s ease; }
.pfrow-media video.pcv.is-active { opacity: 1; }

.pfrow-info { grid-area: info; min-width: 0; }
.pfrow-title { font-family: var(--display); font-weight: 800; font-size: clamp(30px,3.6vw,48px); letter-spacing: -0.025em; line-height: 1.05; color: #fff; margin: 0 0 12px; }
.pfrow-tag { display: inline-block; font-family: var(--mono); font-size: 11px; letter-spacing: .16em; text-transform: uppercase; color: var(--crimson); margin-bottom: 18px; }
.pfrow-desc { font-size: 15.5px; line-height: 1.7; color: rgba(244,241,235,0.72); margin: 0; max-width: 46ch; }

.proj-foot { display: flex; justify-content: center; margin-top: clamp(48px,5vw,72px); }

@media (max-width: 860px) {
  .pfrow, .pfrow:nth-child(even) { grid-template-columns: 1fr; grid-template-areas: "media" "info"; row-gap: 24px; }
  .pfrow-media { aspect-ratio: 16/9; }
}
```

Note: `.proj-foot` is re-declared here (it was deleted with the old block but is reused by the new section). `.btn`/`.btn--out`/`.lede`/`.accent` already exist earlier in the file.

- [ ] **Step 3: Verify no orphaned CSS.**

Run: `grep -n "why-\|proj-card\|proj-sec\|proj-head\|coming-soon--dark" website/homepage.css`
Expected: no matches.

---

## Task 3: Homepage JS — generalize the video crossfade (`website/homepage.js`)

**Files:**
- Modify: `website/homepage.js:153-181` (the "Project card video crossfade" block)

- [ ] **Step 1: Replace the single-group crossfade with a multi-group version.**

Replace lines 153–181 (from the `// ── Project card video crossfade` comment through its closing `}`) with:

```js
  // ── Project feature-row video crossfade ─────────────────────────────
  // Each [data-pcv-group] holds two clips of one project that dissolve into
  // each other. Desktop only — on mobile the second clip never downloads and
  // clip 1 just loops. Iterates all groups so future project rows work too.
  if (!isMobile && !reduceMotion) {
    document.querySelectorAll('[data-pcv-group]').forEach(group => {
      const pcVids = Array.from(group.querySelectorAll('video.pcv'));
      if (pcVids.length !== 2) return;
      let pcActive = 0;
      let pcSwitching = false;

      // Defer downloading clip 2 so it doesn't compete with the first paint
      setTimeout(() => { pcVids[1].preload = 'auto'; pcVids[1].load(); }, 2500);

      pcVids.forEach((vid, i) => {
        vid.addEventListener('timeupdate', () => {
          if (pcSwitching || pcActive !== i) return;
          if (!vid.duration || vid.currentTime < vid.duration - FADE) return;
          pcSwitching = true;
          const next = 1 - i;
          pcVids[next].currentTime = 0;
          pcVids[next].play().catch(() => {});
          pcVids[i].classList.remove('is-active');
          pcVids[next].classList.add('is-active');
          pcActive = next;
          setTimeout(() => { pcSwitching = false; }, (FADE + 0.5) * 1000);
        });
      });
    });
  }
```

`FADE` and `isMobile` are already defined earlier in the IIFE (lines 108, 113).

- [ ] **Step 2: Syntax sanity check.**

Run: `node --check website/homepage.js`
Expected: no output (valid). If `node` is unavailable, open the homepage and confirm no console errors instead.

---

## Task 4: Verify + commit the homepage

**Files:** none (verification + git)

- [ ] **Step 1: Serve and load the homepage.**

```bash
cd "C:/Users/junio/code/ammasonry/website"
python -m http.server 8000
```
Open `http://localhost:8000/index.html`.

- [ ] **Step 2: Visual + DOM checks (use Playwright MCP).**
  - Section "Our projects." appears on a dark background.
  - The West Pine video autoplays (muted, looping); on desktop the two clips crossfade.
  - No "What sets us apart" section, no value-prop grid, no photo cards.
  - "View All Projects" button present and links to `/projects`.
  - Resize to ~390px wide: the row stacks (video on top, text below); no horizontal overflow.
  - Console: no errors.

- [ ] **Step 3: Commit.**

```bash
cd "C:/Users/junio/code/ammasonry"
git add website/index.html website/homepage.css website/homepage.js
git commit -m "Replace homepage why-us + bento with dark video Projects rows

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: Projects page HTML (`website/projects.html`)

**Files:**
- Modify: `website/projects.html:92` (hero copy)
- Modify: `website/projects.html:100-103` (remove tabs)
- Modify: `website/projects.html:106,116,131,141` (article attrs + descriptions)
- Modify: `website/projects.html:158-202` (remove gallery + lightbox)

- [ ] **Step 1: Update hero subtext (line 92).**

Replace:
```html
    <p class="reveal" data-delay="100">Named projects with drone footage and detail photography, plus our full photo gallery below.</p>
```
with:
```html
    <p class="reveal" data-delay="100">Named projects with drone footage from the field.</p>
```

- [ ] **Step 2: Remove the tablist (lines 100–103).**

Delete:
```html
    <div class="pfeat-tabs reveal" role="tablist" aria-label="Featured projects">
      <button class="pfeat-tab is-active" id="tab-west-point" role="tab" aria-selected="true" aria-controls="west-point" type="button">West Point</button>
      <button class="pfeat-tab" id="tab-west-pine" role="tab" aria-selected="false" aria-controls="west-pine" tabindex="-1" type="button">West Pine</button>
    </div>
```

- [ ] **Step 3: Simplify the West Point article open tag + description.**

Replace (line 106):
```html
    <article class="fpc" id="west-point" data-proj-panel="0" role="tabpanel" aria-labelledby="tab-west-point">
```
with:
```html
    <article class="fpc reveal" id="west-point">
```

Replace the West Point description (line 116):
```html
        <p class="fpc-desc">Full exterior brick installation on a commercial property in Gwinnett County. Drone footage captures the complete scope; detail photography shows coursing and mortar work up close.</p>
```
with:
```html
        <p class="fpc-desc">Full exterior brick installation on a commercial property in Gwinnett County. Drone footage captures the complete scope of the build, from the first courses to the finished facade.</p>
```

- [ ] **Step 4: Simplify the West Pine article open tag + description.**

Replace (line 131):
```html
    <article class="fpc" id="west-pine" data-proj-panel="1" role="tabpanel" aria-labelledby="tab-west-pine" hidden>
```
with:
```html
    <article class="fpc reveal" id="west-pine">
```

Replace the West Pine description (line 141):
```html
        <p class="fpc-desc">Stone and CMU block work across a large residential property in Buford. Aerial footage shows site scale; detail photography captures stone selection and finished joint quality.</p>
```
with:
```html
        <p class="fpc-desc">Stone and CMU block work across a large residential property in Buford. Aerial footage shows the full site scale and the finished stone and joint work.</p>
```

- [ ] **Step 5: Remove the photo gallery section AND the lightbox (lines 158–202).**

Delete the entire `<!-- ─── PHOTO GALLERY ─── -->` section (`<section class="proj-gallery">…</section>`, lines 159–191) and the entire `<!-- LIGHTBOX -->` block (`<div id="v2-lightbox" …>…</div>`, lines 193–202). After this, `</main>` follows the closing `</section>` of `.proj-featured`.

- [ ] **Step 6: Verify removals.**

Run: `grep -n "pfeat-tab\|proj-gallery\|proj-cell\|v2-lightbox\|proj-filter\|detail photography\|photo gallery" website/projects.html`
Expected: no matches.

---

## Task 6: Projects page CSS (`website/styles-v2.css`)

**Files:**
- Modify: `website/styles-v2.css:640-696` (remove `.pfeat-*`)
- Modify: `website/styles-v2.css:700-709` + `847-858` (add alternating-row flip; fix mobile)
- Modify: `website/styles-v2.css:864-919` (remove gallery)
- Modify: `website/styles-v2.css:1472-1555` (remove lightbox + gallery filter)

- [ ] **Step 1: Remove the `.pfeat-head`/`.pfeat-rule`/`.pfeat-count` and `.pfeat-tabs`/`.pfeat-tab` rules (lines 640–696).**

Delete everything from `.pfeat-head {` (line 640) through `.pfeat-tab .n { … }` (line 696). Keep `.proj-featured { … }` (636–639) and the `#west-point, #west-pine { scroll-margin-top: 90px; }` rule (698).

- [ ] **Step 2: Add alternating-row styles right after the `.fpc.fading` rule (after line 709).**

Insert:
```css
.fpc + .fpc { margin-top: clamp(56px,7vw,104px); }
.fpc:nth-child(even) { grid-template-columns: 1fr 1.22fr; grid-template-areas: "info video"; }
```

- [ ] **Step 3: Fix the mobile collapse so even rows also stack (lines 847–858).**

Replace the existing block:
```css
@media (max-width: 960px) {
  .fpc {
    grid-template-columns: 1fr;
    grid-template-areas:
      "video"
      "info";
  }
  .fpc-video-wrap {
    min-height: 0;
    aspect-ratio: 16/9;
  }
}
```
with:
```css
@media (max-width: 960px) {
  .fpc,
  .fpc:nth-child(even) {
    grid-template-columns: 1fr;
    grid-template-areas:
      "video"
      "info";
  }
  .fpc-video-wrap {
    min-height: 0;
    aspect-ratio: 16/9;
  }
}
```

- [ ] **Step 4: Remove the photo-gallery CSS (lines 864–919).**

Delete from `/* ── PHOTO GALLERY ─── */` (864) through the `@media (max-width: 520px) { .proj-grid … }` block ending at line 919. This removes `.proj-gallery`, `.pgal-head`, `.pgal-h2`, `.pgal-h2 .accent`, `.proj-page` (legacy), `.proj-grid`, `.proj-cell`, `.proj-cell:hover`, `.proj-cell img`, `.proj-cell.hidden`, and the two `.proj-grid` media queries.

- [ ] **Step 5: Remove the lightbox + gallery-filter CSS (lines 1472–1555 — the tail of the file).**

Delete from `/* ── LIGHTBOX ─── */` (1472) through the last line `.proj-cell:focus-visible { … }` (1555). This removes `.v2-lb`, all `.lb-*` rules, `.pgal-head` (dup), `.proj-filter`, `.proj-filter-btn*`, and `.proj-cell` cursor/focus rules. The file then ends at the `}` on line 1470.

- [ ] **Step 6: Confirm nothing else references removed selectors.**

Run: `grep -n "pfeat-tab\|proj-gallery\|pgal-\|proj-filter\|proj-cell\|proj-grid\|proj-page\|v2-lb\|\.lb-" website/styles-v2.css`
Expected: no matches.
Run: `grep -rn "proj-page\|proj-cell\|proj-filter\|v2-lightbox" website/*.html`
Expected: no matches (confirms the removed CSS was projects-page-only and is now fully dead).

---

## Task 7: Projects page JS (`website/v2-common.js`)

**Files:**
- Modify: `website/v2-common.js:104-179` (remove featured-tabs block)
- Modify: `website/v2-common.js:213-292` (remove filter + lightbox block)

- [ ] **Step 1: Remove the featured-project tabs block (lines 104–179).**

Delete from the `// ── Featured project tabs (projects page) ──` comment (104) through its closing `}` (179). The "Contact form" block follows.

- [ ] **Step 2: Remove the gallery filter + lightbox block (lines 213–292).**

Delete from the `// ── Gallery filter + lightbox (projects page) ──` comment (213) through its closing `}` (292), just before the final `})();`. Keep the IIFE close `})();`.

- [ ] **Step 3: Syntax sanity check.**

Run: `node --check website/v2-common.js`
Expected: no output (valid). If `node` is unavailable, load `projects.html` and confirm no console errors.

---

## Task 8: Verify + commit the projects page

**Files:** none (verification + git)

- [ ] **Step 1: Serve and load the projects page.** (server still running from Task 4, else restart it)

Open `http://localhost:8000/projects.html`.

- [ ] **Step 2: Visual + DOM checks (Playwright MCP).**
  - Two featured projects (West Point, then West Pine) render stacked as rows; West Pine's row is flipped (text left, video right) on desktop.
  - Both videos autoplay (West Point) / load + play; descriptions no longer mention photography.
  - No tabs, no "More from our portfolio" gallery, no filter buttons, no lightbox.
  - Hero subtext reads "Named projects with drone footage from the field."
  - Resize to ~390px: both rows stack (video on top, text below); no overflow.
  - Console: no errors; clicking around does not throw (removed handlers gone).

- [ ] **Step 3: Commit.**

```bash
cd "C:/Users/junio/code/ammasonry"
git add website/projects.html website/styles-v2.css website/v2-common.js
git commit -m "Strip projects page to alternating video rows; remove photo gallery + lightbox

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: Update project docs (`CLAUDE.md`)

**Files:**
- Modify: `CLAUDE.md` (file-structure + JS descriptions that referenced the removed features)

- [ ] **Step 1: Update stale references.**

CLAUDE.md currently describes `projects.html` as a "bento grid with filter + lightbox + featured video cards", and lists `v2-common.js` "filter, lightbox" and homepage.js "project tabs". Update these to reflect the new reality:
  - `projects.html` → "Featured projects as alternating video + description rows (no photo gallery)."
  - `v2-common.js` → remove the `.proj-filter-btn`/lightbox bullets; note tabs/filter/lightbox removed.
  - homepage.js → describe the `[data-pcv-group]` multi-row video crossfade; remove the "project tabs" mention.
  - homepage `index.html` section list → replace "projects, … why us" with the single dark "projects (video rows)" section.

Keep edits minimal and accurate to the post-change code.

- [ ] **Step 2: Commit.**

```bash
cd "C:/Users/junio/code/ammasonry"
git add CLAUDE.md
git commit -m "Update CLAUDE.md for video-row Projects sections

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Final check
- [ ] Homepage: single dark Projects section, West Pine video row, no why-us, no photos.
- [ ] Projects page: two alternating video rows, no gallery/filter/lightbox.
- [ ] Both pages stack cleanly on mobile; no console errors.
- [ ] `grep -rn "what sets us\|Completed projects\|proj-cell\|pfeat-tab\|v2-lightbox" website/` returns nothing.
- [ ] Tell the user it's ready to push (`git push origin main` → Vercel auto-deploys); do not push without their go-ahead.
