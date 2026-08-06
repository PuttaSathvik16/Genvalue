---
name: premium-edutech-ui
description: Build a premium, editorial-grade landing page / marketing site for an online edutech academy (courses, cohorts, bootcamps, certifications). Use this skill whenever the user asks for an "edutech website", "online academy site", "course platform landing page", or wants a "premium", "high-end", "Apple-style", or "scroll-storytelling" website with animations, sticky scroll sections, floating 3D-style icons, and carousels — even if they only describe it loosely (e.g. "make my course site look expensive", "add scroll animations", "add a carousel for testimonials/courses"). Also trigger this any time the user references a design inspiration screenshot/recording of a scrolly, illustrated, grid-paper-background SaaS landing page and wants that aesthetic applied to education/learning content. Covers: design tokens (paper-grid background, duotone illustration, hand-drawn annotations), sticky/pinned alternating scroll sections, scroll-zoom hero image, floating rotating icon fields, drag/snap carousels for courses & testimonials, accordion FAQs, animated counters, and a full HTML/CSS/JS starter template.
---

# Premium Edutech Academy UI

This skill packages a **premium, editorial-illustration marketing-site aesthetic** (reverse-engineered from a reference architecture-software landing page: hand-drawn grid-paper background, bold rounded display type, hand-written annotation labels, duotone illustration, sticky scroll-linked storytelling, floating 3D icon fields, blueprint-style footer) and adapts every section to **online-academy content**: courses, cohorts, instructors, curriculum, student outcomes, testimonials, pricing.

Use this whenever the deliverable is a marketing/landing page (not the actual LMS app) meant to feel premium and alive rather than a generic template.

**Always read `/mnt/skills/public/frontend-design/SKILL.md` first** for the base design-token and Tailwind-safety rules of this environment, then layer this skill's patterns on top. If the deliverable needs to be a real React artifact, translate the vanilla CSS/JS below into Tailwind + React idioms (useState/useRef/useEffect + IntersectionObserver) rather than using localStorage/GSAP-from-CDN unless the user is fine with a standalone HTML file (in which case GSAP/ScrollTrigger from cdnjs is fine).

## 1. Design tokens

| Token | Value | Notes |
|---|---|---|
| `--paper` | `#EDE6D3` | warm cream base, textured with a faint graph-paper grid |
| `--paper-line` | `rgba(60,50,30,0.08)` | grid line color over paper |
| `--ink` | `#2A2A28` | near-black body/heading text |
| `--ink-soft` | `#6B6558` | secondary text, hand-annotation labels |
| `--brand-blue` | `#1E3FE0` | primary duotone / accent (courses, links, CTAs on dark) |
| `--brand-blue-deep` | `#12266E` | dark section backgrounds, footer |
| `--accent` | `#E8622E` | single "pop" accent — CTA button fill, tiny icon chip |
| `--surface-light` | `#F6F1E4` | cards on paper bg |
| `--radius-pill` | `999px` | nav bar, buttons, chips |
| `--radius-card` | `20px` | cards, carousel items |
| Display font | rounded-geometric bold sans (e.g. **General Sans**, **Cabinet Grotesk**, or **Söhne** fallback to `system-ui`) | huge headline weight 700-800 |
| Annotation font | monospace or handwriting webfont (e.g. **Caveat**, **Kalam**, or a slanted italic of the body font) | used for small "ARCHITECTURAL"-style eyebrow labels with underline squiggle |
| Body font | Inter / Neue Montreal | 16–18px, generous line-height 1.6 |

Duotone illustration rule: every hero/story illustration is **two colors only** — `--paper`/cream for light values, `--brand-blue` for dark values/shadows — like a risograph print. For an edutech site, replace the "architect at desk" scene with **a student/mentor at a desk with a laptop, sticky notes of a curriculum, a whiteboard with a roadmap** — same duotone treatment.

## 2. Section-by-section mapping (reference → edutech)

| Reference section | Edutech equivalent |
|---|---|
| Floating pill navbar: logo + Features/Pricing/FAQs + orange "Try for free" | logo + Courses/Cohorts/Pricing/FAQs + orange "Enroll Now" / "Start Free Trial" |
| Hero: "Design at the speed of thought — not software" + hand annotation "ARCHITECTURAL" + duotone illustration of architect | "Learn at the speed of curiosity — not lectures" + hand annotation "SELF-PACED" / "COHORT-BASED" + duotone illustration of a student with laptop & sticky-note curriculum |
| Scroll-zoom: hero image scales up and morphs from sketch → 3D render as you scroll | scroll-zoom: illustration scales up and morphs from a blank notebook page → a finished project/portfolio piece as you scroll (metaphor: idea → mastery) |
| Sticky alternating panel 1 "Adaptive Massing" | "Adaptive Learning Paths" — curriculum reshapes to the learner's pace/level |
| Sticky alternating panel 2 "Agentic Refinement" — "Mark up your intent, agents execute edits" | "AI Mentor Feedback" — "Submit your work, your AI mentor marks it up and explains the fix" |
| Sticky alternating panel 3 "Instant Facades" — "Explore options without manual modeling" | "Instant Portfolio" — "Every project auto-compiles into a shareable portfolio piece" |
| Dark navy section, 4 floating rotating 3D icon cubes at corners, center text fades in | dark navy section, 4 floating rotating icon cubes (certificate, laptop, community, calendar) around a center stat/claim like "12,000+ graduates hired" |
| Footer: giant line-art blueprint icon bleeding into a dark panel + giant low-opacity wordmark + link columns | footer: giant line-art graduation-cap/diploma icon bleeding into a dark panel + giant low-opacity academy wordmark + link columns (Courses, Cohorts, Scholarships / Connect: LinkedIn, Discord, Instagram) |

Sections **not** in the reference but expected on an edutech site — add these using the same visual language:
- **Course carousel** (drag/scroll-snap cards: thumbnail, level badge, duration, price, rating)
- **Instructor/mentor carousel** (photo, name, title, "taught 40+ cohorts")
- **Testimonial carousel** (student photo, quote, outcome badge e.g. "Hired at Google")
- **Animated stat counters** (students taught, completion rate, avg. salary increase) — count up on scroll into view
- **Pricing toggle** (monthly/yearly, cohort vs self-paced) with the same pill-toggle style as the nav
- **FAQ accordion** in the hand-annotated paper style

## 3. Core interaction patterns

### 3.1 Sticky floating navbar
White pill, `border-radius: 999px`, subtle shadow, sits ~24px from top, shrinks/adds shadow on scroll (`box-shadow` intensifies past 40px scrollY). Logo mark = simple 2x2 geometric grid icon (swap for an academy monogram). CTA button is the **only** orange element in the nav — this is the "pop accent, use once per viewport" rule.

### 3.2 Hand-drawn annotation labels
Small rotated (-2° to -4°) monospace/handwriting text next to headline words, often with a hand-drawn underline (a wavy SVG path) or a small arrow (`→`) pointing at the word it annotates. Use sparingly — 1-2 per section, never decorative overload.

### 3.3 Scroll-zoom / morph hero image
The hero illustration sits in a bordered frame below the headline. As the user scrolls the first ~100-150vh, the frame's `clip-path`/`width` expands to full-bleed and the image itself scales/pans (like a camera push-in) via `transform: scale()` driven by scroll progress — **not** a video, just CSS transforms keyed to `scrollY` with `requestAnimationFrame` (or GSAP ScrollTrigger `scrub`). Optionally cross-fade to a second image (sketch → final render) at the midpoint using opacity.

### 3.4 Sticky alternating story panels
Each feature is a `position: sticky; top: 0` image pinned in a tall (150-200vh) container while a text panel scrolls past beside it. Alternate image left/text right, then image right/text left, for rhythm. Small numbered/dot progress indicator in the corner ticks as you scroll (like a page counter).

### 3.5 Floating icon field (dark section)
4+ small 3D-styled icon "cubes" (CSS: two skewed parallelogram faces + a top face, or simple isometric SVGs) placed at the far corners of a dark viewport-height section, each with a slow independent `@keyframes float` (translateY ±10px, rotate ±3deg, 6-10s ease-in-out infinite, staggered delays). Center text/stat fades and slides up via IntersectionObserver as the section enters view.

### 3.6 Carousels (courses / instructors / testimonials)
Use native CSS `scroll-snap-type: x mandatory` + `overflow-x: auto` + hidden scrollbar for a buttery drag/swipe feel, with JS-driven prev/next arrow buttons (`scrollBy({left: cardWidth, behavior:'smooth'})`) and dot indicators synced via `IntersectionObserver` on each card. This out-performs heavier carousel libraries and works on touch out of the box. Add `cursor: grab` / `:active { cursor: grabbing }` and optional pointer-drag-to-scroll JS for desktop mouse users.

### 3.7 Micro-details that read as "premium"
- Faint grid-paper texture (repeating linear-gradient at 1px) under everything, even dark sections (grid line opacity ~4%).
- Subtle noise/grain overlay (`mix-blend-mode: overlay`, tiny SVG turbulence or a repeating PNG) — this is what makes the illustration feel print-like rather than flat-vector.
- A tiny live "X / Y" cursor-coordinate readout in the top-left corner (an easter egg from the reference) — optional, but a nice signature touch for a design-forward brand.
- Only **one** accent color (orange) used for interactive/actionable elements; everything else stays cream/ink/blue.
- Generous whitespace; headline sizes are extreme (clamp 48px–120px) versus body copy staying modest (16-18px).

## 4. Animation triggers checklist

Use IntersectionObserver for all "enter viewport" animations (fade + translateY(24px)→0, 600-800ms ease-out, staggered 80-120ms per sibling). Reserve scroll-scrubbed (`requestAnimationFrame`/GSAP `scrub`) transforms for the hero zoom and sticky-panel progress dots only — don't scrub everything or it feels janky/heavy.

- Navbar: shadow/blur intensify after 40px scroll
- Hero headline: annotation labels fade+rotate in after headline (stagger)
- Hero image: scroll-scrubbed scale/pan + optional crossfade
- Story panels: sticky image, text blocks fade/slide as they cross a scroll threshold, progress dots update
- Icon field: float loop (CSS-only, infinite) + one-time fade-in on scroll enter
- Stat counters: count from 0 → target once when 50% in view (don't re-trigger on scroll back up)
- Carousels: snap animation is native; card scale-up slightly (1.0 → 1.03) on the centered/active card
- Footer illustration: gentle parallax (moves slower than scroll, `translateY(scrollY * 0.15)`)

## 5. Starter template

A full working single-file HTML/CSS/JS starter implementing navbar, hero + scroll-zoom, one alternating sticky panel, floating icon dark section, a course carousel, an FAQ accordion, and the blueprint footer is at:

`assets/template.html`

Open it, copy the whole file as the base, then:
1. Swap illustration placeholders (currently inline SVG duotone shapes) for real artwork/photos.
2. Replace copy per the mapping table in §2.
3. Duplicate the `.story-panel` block for panels 2 and 3, alternating the `.reverse` class.
4. Duplicate `.carousel` markup for instructors/testimonials, changing card content.
5. Wire the CTA buttons to the real signup/checkout flow.

Read `references/build-checklist.md` before shipping — it has a short QA pass (mobile stacking, reduced-motion, contrast) that's easy to forget on scroll-heavy sites.
