# SERVE — Landing Page

## Problem Statement
Build a landing page for **SERVE** (`serve-web.tech`) — an anti-utility AI interface for deep, unstructured, local-first reflection. The page must feel like "a room at 2am with one amber lamp on" — not a productivity tool, not a chatbot wrapper. Closer to an album than an app. Reference DNA: Linear × Stripe × Apple × early Notion × Basement Studio / Rauno.

## Architecture
- **Framework**: Next.js 16 (App Router) + React 19 + Tailwind v4
- **Motion**: Framer Motion v12 (`whileInView`, `useScroll`, `useTransform`)
- **Type**: Single-page client-rendered landing (`/app/app/page.tsx`)
- **Backend**: None — landing is frontend-only. Star count fetched client-side from `api.github.com/repos/knightabdo/serve`
- **Routing**: Landing at `/`, links into existing `/chat` SERVE app
- **Fonts** (no Inter, no Space Grotesk): Cormorant Garamond (display serif) + DM Sans (body) + JetBrains Mono (data/labels)
- **Palette**: `#0C0C0D` ink → `#111012` surface → `#1A1815` lift, ivory `#EDE8DF`, single accent amber `#C49A3C`

## Core Requirements (delivered)
- [x] 1.2s atmospheric amber-dot loader
- [x] Hero with vertical light-sweep mask reveal on giant `serve` wordmark (near-black on near-black)
- [x] Monospace subline `not a tool. a room.` with 40ms letter-by-letter stagger
- [x] Drifting amber gradient orb (6px upward, 12s loop) + second smaller orb top-right
- [x] Navbar fades in 0.8s after loader exits
- [x] Scroll indicator (1px line + chevron) appearing at 2s
- [x] Editorial Manifesto: 60/40 split, italic pull-quote, rotated 90° `utility vs. presence` watermark, drop-cap body
- [x] The Room: serif headline + `Somber. Warm. Dark.` triptych (150ms stagger)
- [x] Feature Trio: three horizontal rows with monospace labels, hand-coded SVG glyphs (waveform, node cluster, spiral), hover-lift with amber label glow
- [x] Memory Ritual (Section 5): floating amber-bordered quote fragments connected by SVG thread paths drawn in via `stroke-dashoffset` driven by scroll progress. Parallax depth split (bg 0.3×, topo 0.6×, fg 1×)
- [x] Open Source card: amber 1px border, **live GitHub star count** from `api.github.com`, ghost `View Source →` CTA
- [x] Built By @jip7e block with amber-ring avatar, X icon link, italic bio
- [x] Footer with max-intensity grain and `SERVE © 2026 — local-first, always.`
- [x] Global progressive backdrop-blur (top + bottom edges only, max 1.4px past 92% scroll)
- [x] SVG noise grain overlay (4% global, 7% hero) + scanline texture in hero
- [x] All sections use Framer Motion `whileInView` fade-up (24px, 600ms, cubic-bezier(0.16,1,0.3,1))
- [x] Three quiet entry points to `/chat`: nav `Enter`, manifesto `→ continue`, and `open the room →` italic link at end of Room section
- [x] All interactive elements have `data-testid` attributes

## Files
- `/app/app/page.tsx` — landing page (sections 1–8)
- `/app/app/layout.tsx` — fonts (Cormorant + DM Sans + JetBrains Mono), scroll-allowed body
- `/app/app/globals.css` — full design system (palette tokens, grain, scanlines, light-sweep, orb drift, feature-row hover, memory fragments, ghost button, watermark, etc.)
- `/app/app/loading.tsx` — replaced video-loader with minimal amber-dot fallback
- `/app/app/components/LandingMotion.tsx` — FadeUp, SlideFromLeft, MonoReveal, GlobalBlur, MemoryRitual, ParallaxLayer
- `/app/app/components/Glyphs.tsx` — Waveform, NodeCluster, Spiral, GitHub, X, ArrowRight, ChevronDown (all hand-coded SVG)

## What's Been Implemented (2026-01-17)
- Full editorial landing page matching the detailed brief — palette, typography, motion, copy tone, and all 8 sections
- Live GitHub star count fetch with `—` fallback while loading
- Hydration-safe procedural SVG glyphs (rounded floats to 2 decimal places)
- Three subtle entry points to the existing `/chat` SERVE app — none break the editorial mood
- Existing chat / changelog / privacy / terms pages preserved (layout change is non-breaking)

## Prioritized Backlog (P1 / P2)
- P1: Open Graph + Twitter card images optimized for SERVE landing (currently uses existing `/og-image.png`)
- P1: Reduced-motion tested across the light-sweep + memory-ritual paths (initial guard added via `@media (prefers-reduced-motion)`)
- P2: Optional `?ref=` UTM hooks on the three `/chat` entry points to track which section converts best
- P2: Auto-cycle through 2–3 quote-fragment sets in the Memory Ritual canvas (subtle, opacity crossfade only)
- P2: Add `RSS · Changelog` quiet link to the footer once changelog moves to MDX
- P2: `prefers-color-scheme: light` is NOT a goal — page is intentionally dark-only

## Next Actions
- Optional: tighten the hero `serve` wordmark for ultra-wide (>2200px) viewports — currently caps at 360px via `clamp`
- Optional: replace placeholder avatar gradient with a real `/jip7e.jpg` if @jip7e provides one
