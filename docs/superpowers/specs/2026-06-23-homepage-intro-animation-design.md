# Homepage Intro Animation — "Course by Course"

**Date:** 2026-06-23
**Scope:** Homepage only (`website/index.html`, `homepage.css`, `homepage.js`)
**Status:** Approved design, ready for implementation plan

## Goal

Add a brief (~2.2s) full-screen branded splash that plays on the **first load of a
session**, builds a little anticipation, then hands off smoothly to the existing hero
video. The metaphor is masonry: the crimson brick mark is "laid" course-by-course,
then the wordmark appears, then the overlay lifts to reveal the hero already in motion.

Smoothness is the top priority — no hard cut, no jitter, must feel buttery on any device.

## Hard Requirements (from the user)

- ~1.5–2.5s full-screen intro on first load, then smooth reveal of the landing page.
- On-brand and tasteful (the masonry "build" metaphor).
- **Hero video must be ready/playing the moment the intro lifts** — no black gap.
- Show **once per session** (`sessionStorage`); **skippable** via click / tap / key.
- Respect `prefers-reduced-motion` (static fade, no movement).
- No hurt to load or SEO: real content stays in the DOM (just briefly covered); don't
  badly delay the hero.
- No new dependencies, no build step. Native scroll only. **Homepage only** — inner
  pages get no intro.

## Choreography (~2.2s)

Background is ink `#14171C` (matches the hero base, so the lift reveals a same-color
backdrop with zero flash).

| Time | Beat | Technique |
|------|------|-----------|
| 0.0s | Ink overlay covers viewport; hero buffering beneath | overlay in HTML, opaque |
| 0.2–0.9s | Crimson brick mark reveals **bottom-to-top** in ~3 eased courses | animated `clip-path: inset(100% 0 0 0)` → `inset(0 0 0 0)` with a stepped/eased timing |
| ~1.0s | Crimson **mortar rule** sweeps out beneath the mark | `transform: scaleX(0)` → `scaleX(1)`, `transform-origin:left` |
| 1.1–1.6s | **"A&M MASONRY" wordmark** wipes in left→right + fade | `clip-path: inset(0 100% 0 0)` → `inset(0 0 0 0)` + opacity |
| 1.6–1.9s | Hold a beat | — |
| 1.9–2.2s | Overlay **slides up** like a curtain, revealing the playing hero | `transform: translateY(0)` → `translateY(-100%)`, eased |

Only `transform`, `opacity`, and `clip-path` animate — no width/height/layout
animation — so the sequence stays on the compositor and buttery.

## Assets

Crop two **intro-only** images from the existing `assets/img/am-logo-nav-h.png`
(462×160; crimson brick mark on the left, **white** wordmark on the right — ideal on a
dark overlay) using built-in PowerShell `System.Drawing`. The original file and the nav
logos are untouched. No new dependency.

- `assets/img/am-intro-brick.png` — crimson brick mark only (left portion)
- `assets/img/am-intro-wordmark.png` — white "A&M MASONRY" only (right portion)

The exact crop boundary (the column where the brick ends and the wordmark begins) is
determined during implementation by scanning the PNG for the gap between the two
elements. Crops are lossless (no resampling), trimmed to their content with a small
transparent margin so each can be positioned independently.

## Smooth Handoff (top priority)

The overlay does **not** lift on a fixed timer alone. It lifts at:

```
liftTime = max(minimumDisplay ≈ 1.9s, heroVideoReady)
```

- On intro start, proactively call `.play()` on the hero `<video>`.
- Wait for the hero video to reach `readyState >= 3` (`canplay`/`canplaythrough`) — i.e.
  it can actually render frames — before lifting.
- **Hard fallback ~3.5s:** if the video stalls or errors, lift anyway. The already
  preloaded poster (`overlook-hero-poster.jpg`, `<link rel="preload">` in `<head>`)
  covers that case, so there is still no black gap.

Net effect: the hero is already in motion the instant the curtain lifts.

## Show-Once + Skippable + Reduced Motion

- **Once per session:** a tiny **inline `<head>` script** checks `sessionStorage`
  *before first paint* and only arms the intro (e.g. adds `html.intro-armed`) on a fresh
  session. On repeat navigations the overlay is `display:none` from the first frame, so
  it never even flashes. The "seen" flag is written when the intro is shown.
- **Skippable:** any `pointerdown` / `touchstart` / `keydown` runs the lift immediately
  (same lift animation, just early). A subtle "Press any key to skip" hint fades in at
  ~1.2s if the intro is still up. *(Approved.)*
- **`prefers-reduced-motion: reduce`:** the same inline gate detects it; the overlay
  shows a **static logo (brick + wordmark, no climb/sweep/slide), holds ~0.6s, then
  fades out** (opacity only). *(Approved — static-fade, not a hard skip.)*

## First-Paint / No-Flash Strategy

- Overlay markup lives in `index.html` (not injected by JS) so it covers the viewport on
  the very first paint — no flash of hero before the intro.
- The `html.js` class (already set synchronously in `<head>`, line 6) plus the inline
  gate class control visibility purely in CSS:
  - JS disabled, or session already seen → overlay `display:none` (content shows normally).
  - Fresh session + JS → overlay visible, animation runs.
- Body scroll is locked (`overflow:hidden`) while the overlay is up and released on lift.

## Accessibility

- Overlay is decorative (the same logo is in the nav) → `aria-hidden="true"`; it contains
  no focusable elements, so it does not trap keyboard focus.
- The skip hint is part of the decorative overlay; skipping is also available via any key
  or pointer, so no dedicated focusable control is required.
- Real page content remains in the DOM throughout (covered, not removed) — no SEO or
  screen-reader-structure impact.

## Where the Code Lives (per CLAUDE.md)

- **`index.html`** — overlay markup + inline `<head>` gate script. Homepage only.
- **`homepage.css`** — overlay styles + `@keyframes`.
- **`homepage.js`** — lift logic, skip handlers, hero-video-ready handoff, `sessionStorage`
  write, scroll lock/unlock.
- **Untouched:** inner pages, nav markup, SEO/meta, hero content, `styles-v2.css`,
  `v2-common.js`.

## Out of Scope (YAGNI)

- No intro on inner pages.
- No redraw of the logo into SVG or per-brick layers (faked convincingly via clip-path).
- No new libraries, build tooling, or config changes.
- No changes to the hero video, poster, carousel, or any existing section.

## Verification

- Visual check via Playwright at each beat (brick climb, mortar rule, wordmark wipe,
  lift) plus the final hero state.
- Confirm: first load shows intro; reload in same session does **not**; the hero is
  visibly playing the moment the overlay lifts (no black frame).
- Confirm `prefers-reduced-motion` path shows static-fade only.
- Confirm skip (key/click/tap) lifts immediately.
- Confirm inner pages are unchanged (no overlay).
