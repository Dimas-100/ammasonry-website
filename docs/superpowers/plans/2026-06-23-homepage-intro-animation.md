# Homepage Intro Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a ~2.2s once-per-session "Course by Course" branded splash to the homepage that lays the crimson brick mark, reveals the wordmark, then lifts to the already-playing hero video.

**Architecture:** An opaque ink overlay lives in `index.html` so it covers the viewport on first paint. A tiny inline `<head>` gate arms it only on a fresh session (and flags reduced-motion) before paint, so repeat loads never flash it. Entrance beats (brick climb, mortar sweep, wordmark wipe) are pure CSS keyframes. The lift is JS-driven and gated on the hero video being ready (`readyState >= 3`) with a hard fallback, so the hero is in motion the instant the curtain rises. A CSS failsafe clears the overlay even if `homepage.js` never runs.

**Tech Stack:** Pure HTML/CSS/JS (no framework, no build). PowerShell `System.Drawing` for lossless asset cropping. Playwright (MCP) for visual verification.

## Global Constraints

- No new dependencies, no build step, no config changes. Pure HTML/CSS/JS.
- Homepage only — `index.html`, `homepage.css`, `homepage.js`. Inner pages, nav markup, SEO/meta, hero content, `styles-v2.css`, `v2-common.js` stay untouched.
- Native scroll only (Lenis is gone).
- Animate only `transform`, `opacity`, `clip-path` — no width/height/layout animation.
- Brand: `--crimson #C8102E`, `--ink #14171C`, fonts already loaded (Archivo/Fraunces/Inter/JetBrains Mono).
- Show once per session via `sessionStorage` key `amIntroSeen`. Skippable via click/tap/key. Respect `prefers-reduced-motion` (static fade, no movement).
- Do **not** commit or push (standing user instruction).

---

### Task 1: Generate the two cropped intro assets

**Files:**
- Create: `website/assets/img/am-intro-brick.png`
- Create: `website/assets/img/am-intro-wordmark.png`
- Source (read-only): `website/assets/img/am-logo-nav-h.png` (462×160; crimson brick + white wordmark)

**Interfaces:**
- Produces: two transparent PNGs — `am-intro-brick.png` (≈201×156, crimson brick mark) and `am-intro-wordmark.png` (≈239×140, white "A&M MASONRY"). Consumed by Task 2 markup.

- [ ] **Step 1: Crop both assets via PowerShell `System.Drawing`**

```powershell
Add-Type -AssemblyName System.Drawing
$src = 'C:\Users\junio\code\ammasonry\website\assets\img\am-logo-nav-h.png'
$dir = 'C:\Users\junio\code\ammasonry\website\assets\img'
$bmp = New-Object System.Drawing.Bitmap($src)
function Crop($x,$y,$w,$h,$out){
  $rect = New-Object System.Drawing.Rectangle($x,$y,$w,$h)
  $c = $bmp.Clone($rect, $bmp.PixelFormat)
  $c.Save($out, [System.Drawing.Imaging.ImageFormat]::Png)
  $c.Dispose()
}
Crop 3 2 201 156 (Join-Path $dir 'am-intro-brick.png')      # brick mark
Crop 221 10 239 140 (Join-Path $dir 'am-intro-wordmark.png') # wordmark
$bmp.Dispose()
```

- [ ] **Step 2: Verify the files exist with expected dimensions**

```powershell
Add-Type -AssemblyName System.Drawing
foreach ($f in 'am-intro-brick.png','am-intro-wordmark.png') {
  $i = [System.Drawing.Image]::FromFile("C:\Users\junio\code\ammasonry\website\assets\img\$f")
  "{0}: {1}x{2}" -f $f,$i.Width,$i.Height; $i.Dispose()
}
```
Expected: `am-intro-brick.png: 201x156` and `am-intro-wordmark.png: 239x140`.

- [ ] **Step 3: Visually confirm crops** — Read each PNG with the image tool; brick must be the crimson brick mark only, wordmark the white "A&M MASONRY" only. (Wordmark renders white on a light bg in the viewer — that's expected; it's white-on-ink in use.)

---

### Task 2: Add overlay markup + inline head gate to `index.html`

**Files:**
- Modify: `website/index.html` (head, line ~6; body, right after `<body>` line 66)

**Interfaces:**
- Consumes: `am-intro-brick.png`, `am-intro-wordmark.png` from Task 1.
- Produces: DOM nodes `.am-intro` (overlay) containing `.am-intro-stage` > `.am-intro-brick`, `.am-intro-rule`, `.am-intro-word`, plus `.am-intro-skip`. Sets `html` classes `intro-armed` and (when reduced) `intro-reduced` before paint, and `sessionStorage.amIntroSeen`. Consumed by Tasks 3 (CSS) and 4 (JS).

- [ ] **Step 1: Add the inline gate script** immediately after the existing `<script>document.documentElement.classList.add('js');</script>` (currently line 6):

```html
<script>
(function(){
  var d = document.documentElement;
  try {
    if (!sessionStorage.getItem('amIntroSeen')) {
      d.classList.add('intro-armed');
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        d.classList.add('intro-reduced');
      }
      sessionStorage.setItem('amIntroSeen','1');
    }
  } catch (e) { /* storage blocked: don't arm the intro */ }
})();
</script>
```

- [ ] **Step 2: Add the overlay markup** immediately after `<body>` (line 66), before `<!-- NAV -->`:

```html
<!-- INTRO SPLASH (homepage only; armed once per session by the head gate) -->
<div class="am-intro" aria-hidden="true">
  <div class="am-intro-stage">
    <img class="am-intro-brick" src="assets/img/am-intro-brick.png" alt="" width="201" height="156" />
    <span class="am-intro-rule"></span>
    <img class="am-intro-word" src="assets/img/am-intro-wordmark.png" alt="" width="239" height="140" />
  </div>
  <span class="am-intro-skip">Tap to skip</span>
</div>
```

- [ ] **Step 3: Verify** — Open `website/index.html` and confirm the gate script sits in `<head>` after the `js` class line, and the `.am-intro` block is the first child of `<body>`. No other markup changed.

---

### Task 3: Add overlay styles + keyframes to `homepage.css`

**Files:**
- Modify: `website/homepage.css` (append a new clearly-commented section near the top, after the `:root`/base block, e.g. after line ~37 before `/* ── NAV ── */`, so the overlay rules are easy to find).

**Interfaces:**
- Consumes: `html.intro-armed`, `html.intro-reduced`, `.am-intro.is-lifting`, `html.intro-done` from Tasks 2 & 4.
- Produces: visual presentation + entrance keyframes + lift transition + CSS failsafe.

- [ ] **Step 1: Add the CSS block**

```css
/* ── INTRO SPLASH (homepage only) ─────────────────────────── */
/* Overlay is hidden by default; the inline head gate adds .intro-armed
   on a fresh session to reveal + animate it. Entrance beats are pure CSS;
   the lift is JS-driven (homepage.js), with a CSS failsafe at 5s so the
   overlay never traps the page if JS fails to run. */
.am-intro { display: none; }

html.intro-armed .am-intro {
  display: flex;
  position: fixed; inset: 0; z-index: 1000;
  flex-direction: column; align-items: center; justify-content: center;
  background: var(--ink);
  /* failsafe: if homepage.js never lifts it, fade out at 5s */
  animation: amIntroFailsafe .6s ease 5s forwards;
}
/* keep the page from scrolling behind the splash until it lifts */
html.intro-armed:not(.intro-done) { overflow: hidden; }
html.intro-armed:not(.intro-done) body { overflow: hidden; }

.am-intro-stage { display: flex; flex-direction: column; align-items: center; gap: 18px; }
.am-intro-brick { height: clamp(92px, 14vh, 132px); width: auto; }
.am-intro-rule  { display: block; height: 2px; width: clamp(150px, 22vw, 210px); background: var(--crimson); border-radius: 2px; transform: scaleX(0); transform-origin: center; }
.am-intro-word  { width: clamp(178px, 40vw, 250px); height: auto; }
.am-intro-skip  {
  position: absolute; bottom: clamp(28px, 7vh, 56px); left: 0; right: 0; text-align: center;
  font-family: var(--mono); font-size: 11px; letter-spacing: .22em; text-transform: uppercase;
  color: rgba(244,241,235,0.42); opacity: 0;
}

/* Entrance beats (normal motion only) */
html.intro-armed:not(.intro-reduced) .am-intro-brick { clip-path: inset(100% 0 0 0); animation: amBrickRise .72s cubic-bezier(.6,0,.2,1) .2s forwards; }
html.intro-armed:not(.intro-reduced) .am-intro-rule  { animation: amRuleSweep .5s cubic-bezier(.5,0,.2,1) .92s forwards; }
html.intro-armed:not(.intro-reduced) .am-intro-word  { clip-path: inset(0 100% 0 0); opacity: 0; animation: amWordWipe .6s cubic-bezier(.5,0,.2,1) 1.1s forwards; }
html.intro-armed:not(.intro-reduced) .am-intro-skip  { animation: amSkipIn .5s ease 1.25s forwards; }

@keyframes amBrickRise { from { clip-path: inset(100% 0 0 0); } to { clip-path: inset(0 0 0 0); } }
@keyframes amRuleSweep { from { transform: scaleX(0); } to { transform: scaleX(1); } }
@keyframes amWordWipe  { from { clip-path: inset(0 100% 0 0); opacity: 0; } to { clip-path: inset(0 0 0 0); opacity: 1; } }
@keyframes amSkipIn    { to { opacity: 1; } }
@keyframes amIntroFailsafe { to { opacity: 0; visibility: hidden; pointer-events: none; } }

/* Reduced motion: show the full lockup statically (no climb/sweep/wipe). */
html.intro-armed.intro-reduced .am-intro-rule { transform: scaleX(1); }
html.intro-armed.intro-reduced .am-intro-skip { opacity: 1; }

/* Lift (JS adds .is-lifting). Normal = slide up like a curtain. */
html.intro-armed:not(.intro-reduced) .am-intro.is-lifting {
  transform: translateY(-100%);
  transition: transform .55s cubic-bezier(.7,0,.25,1);
  animation: none; /* cancel failsafe once we are lifting for real */
}
/* Reduced motion lift = opacity fade, no movement. */
html.intro-armed.intro-reduced .am-intro.is-lifting {
  opacity: 0;
  transition: opacity .5s ease;
  animation: none;
}
/* Fully removed after the lift completes. */
.am-intro.is-done { display: none !important; }

@media (prefers-reduced-motion: reduce) {
  /* belt-and-suspenders: even if the gate missed it, kill entrance motion */
  html.intro-armed .am-intro-brick,
  html.intro-armed .am-intro-rule,
  html.intro-armed .am-intro-word,
  html.intro-armed .am-intro-skip { animation: none; }
  html.intro-armed .am-intro-brick { clip-path: inset(0 0 0 0); }
  html.intro-armed .am-intro-rule  { transform: scaleX(1); }
  html.intro-armed .am-intro-word  { clip-path: inset(0 0 0 0); opacity: 1; }
  html.intro-armed .am-intro-skip  { opacity: 1; }
}
```

- [ ] **Step 2: Verify** with a static server + Playwright (full check happens in Task 5). For now confirm CSS parses (no console errors) and, with `intro-armed` present, the overlay covers the viewport ink-colored.

---

### Task 4: Add lift / skip / handoff logic to `homepage.js`

**Files:**
- Modify: `website/homepage.js` (add a new block inside the existing IIFE, e.g. right after the `'use strict';`/lenis lines near the top so it runs first).

**Interfaces:**
- Consumes: `.am-intro` overlay, `html.intro-armed` / `html.intro-reduced`, the hero `<video class="hero-img">`.
- Produces: adds `.is-lifting` then `.is-done` to the overlay; adds `intro-done` to `<html>`; lifts at `max(1900ms, video readyState>=3)` with a 3500ms hard fallback; reduced-motion lifts at 900ms; any key/pointer/touch skips early.

- [ ] **Step 1: Add the intro controller** near the top of the IIFE (after the lenis comment block, before the smooth-anchor code):

```javascript
  // ── Intro splash (homepage only; armed by the inline <head> gate) ──
  (function intro() {
    var root = document.documentElement;
    if (!root.classList.contains('intro-armed')) return;
    var overlay = document.querySelector('.am-intro');
    if (!overlay) return;

    var reduced = root.classList.contains('intro-reduced');
    var hero = document.querySelector('.hero-img'); // the <video>
    var lifted = false;

    function lift() {
      if (lifted) return;
      lifted = true;
      root.classList.add('intro-done');               // releases scroll lock
      overlay.classList.add('is-lifting');
      var done = function () { overlay.classList.add('is-done'); };
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
    if (hero && hero.paused) { var p = hero.play(); if (p && p.catch) p.catch(function(){}); }
    var ready = function () { return hero && hero.readyState >= 3; };
    setTimeout(function () {
      if (ready()) { lift(); return; }
      var onReady = function () { lift(); };
      if (hero) {
        hero.addEventListener('canplay', onReady, { once: true });
        hero.addEventListener('loadeddata', onReady, { once: true });
      }
    }, 1900);                                           // minimum on-screen time
    setTimeout(lift, 3500);                             // hard fallback (poster covers a stalled video)
  })();
```

- [ ] **Step 2: Verify** the block is inside the IIFE and runs before the anchor/nav code (full behavior verified in Task 5).

---

### Task 5: End-to-end verification with Playwright

**Files:** none (verification only). Serve with `python -m http.server 8000` from `website/`.

- [ ] **Step 1: Start the static server** (background): `python -m http.server 8000` from `C:\Users\junio\code\ammasonry\website`.

- [ ] **Step 2: First-load sequence** — navigate to `http://localhost:8000/index.html`, screenshot at ~0.5s, ~1.0s, ~1.4s, ~2.0s (brick climb → mortar rule → wordmark → curtain lifting). Confirm beats render in order.

- [ ] **Step 3: Smooth handoff** — screenshot right after the lift. Confirm the hero video is visible and playing (not poster-frozen, no black gap). Check `document.querySelector('.hero-img').readyState >= 3` and `!.paused` via `browser_evaluate`.

- [ ] **Step 4: Once-per-session** — reload the page in the same browser context; confirm **no** overlay appears (gate read `sessionStorage.amIntroSeen`). Confirm overlay is `display:none` from first paint (no flash).

- [ ] **Step 5: Skip** — clear `sessionStorage`, reload, press a key (and separately, click) within the first second; confirm the overlay lifts immediately.

- [ ] **Step 6: Reduced motion** — open a context with `prefers-reduced-motion: reduce` (Playwright `browser_run_code_unsafe` / emulate), clear sessionStorage, load; confirm a static logo shows briefly then fades (no climb/slide), and the hero appears.

- [ ] **Step 7: Inner pages unaffected** — load `services.html`, `projects.html`, `about.html`, `contact.html`; confirm no `.am-intro` element and no console errors.

- [ ] **Step 8: Console check** — confirm zero JS errors across all of the above (`browser_console_messages`).

---

## Self-Review

**Spec coverage:**
- ~2.2s choreography (brick climb / mortar / wordmark / lift) → Tasks 2–4. ✓
- Two cropped assets from `am-logo-nav-h.png` → Task 1. ✓
- Smooth handoff gated on hero `readyState>=3` + 3.5s fallback + poster → Task 4. ✓
- Once-per-session (`sessionStorage`, pre-paint gate, no flash) → Task 2 gate + Task 5 step 4. ✓
- Skippable (key/click/tap) → Task 4 + Task 5 step 5. ✓
- Reduced motion static-fade → Task 2 gate, Task 3 reduced rules, Task 4 reduced path + Task 5 step 6. ✓
- No-flash first-paint (overlay in HTML, gate before paint) → Tasks 2–3. ✓
- Homepage only / inner pages untouched → scoping in all tasks + Task 5 step 7. ✓
- Content stays in DOM (SEO) → overlay covers, never removes content. ✓
- No deps / no build / native scroll / transform-opacity-clip-path only → Global Constraints + Task 3. ✓
- JS-failure safety (CSS failsafe) → Task 3 `amIntroFailsafe`. ✓

**Placeholder scan:** none — all steps carry real code/commands.

**Type/name consistency:** class names `am-intro`, `am-intro-stage`, `am-intro-brick`, `am-intro-rule`, `am-intro-word`, `am-intro-skip`, `is-lifting`, `is-done`, and html classes `intro-armed`, `intro-reduced`, `intro-done`, plus `sessionStorage` key `amIntroSeen`, are identical across Tasks 2/3/4. ✓
