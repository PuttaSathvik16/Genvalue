# Build / QA checklist for scroll-heavy premium sites

Run through this before presenting the final site.

## Motion & accessibility
- [ ] Wrap all scroll/parallax/float animations in a `@media (prefers-reduced-motion: reduce)` override that disables transforms/transitions (keep opacity fades only, or nothing).
- [ ] Sticky panels must not trap keyboard/screen-reader focus — test tabbing through the page.
- [ ] Carousel arrow buttons need `aria-label` ("Previous course", "Next course"); dots need `aria-current` on the active one.
- [ ] Text over illustrations/dark sections passes WCAG AA contrast (4.5:1 body, 3:1 large text).

## Mobile behavior (< 768px)
- [ ] Sticky alternating panels: collapse to a normal stacked flow (image above text), turn off `position: sticky` — sticky pinning across 150vh feels broken on small screens.
- [ ] Hero scroll-zoom: reduce or disable the scrub transform on mobile (short viewport = the zoom finishes instantly and feels glitchy); a simple fade-in is enough.
- [ ] Floating icon cubes: shrink and reposition inward so they don't get clipped by the viewport edge.
- [ ] Carousels: confirm native touch-swipe + scroll-snap works without any JS drag library (it should, by default).
- [ ] Nav collapses to a hamburger/menu sheet; keep the CTA button visible even collapsed.

## Performance
- [ ] Illustrations as SVG where possible (crisp at any size, tiny file size) rather than large PNGs.
- [ ] Any scroll listener uses `requestAnimationFrame` throttling, not a raw `scroll` handler running every event.
- [ ] `will-change: transform` only on the elements actually animating (hero image, sticky panels, floating icons) — not globally.
- [ ] Lazy-load below-the-fold images/carousel cards (`loading="lazy"`).

## Content correctness for edutech context
- [ ] Every stat (students taught, completion rate, salary lift, rating) is either real data the user supplied or clearly marked as placeholder — never invent specific numbers/testimonials/company names and present them as real.
- [ ] Pricing toggle math (monthly vs yearly) is actually consistent (yearly = discounted monthly × 12, or whatever the user specifies).
- [ ] Course/instructor carousel content matches what the user actually offers — don't invent course names/instructors unless explicitly asked for placeholder/lorem content, in which case label it clearly as sample content in your handoff message.

## Visual polish pass
- [ ] Only one accent color reads as "clickable" — check no other element competes with the CTA button color.
- [ ] Grid-paper texture is subtle (should almost disappear at a glance) — if you can see it clearly at 100% zoom without looking for it, opacity is too high.
- [ ] Headline sizes actually scale fluidly (`clamp()`) rather than breaking awkwardly between the tested breakpoints.
