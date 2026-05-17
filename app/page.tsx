'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FadeUp,
  SlideFromLeft,
  MonoReveal,
  GlobalBlur,
  MemoryRitual,
} from './components/LandingMotion';
import {
  WaveformGlyph,
  NodeClusterGlyph,
  SpiralGlyph,
  GitHubIcon,
  XIcon,
  ArrowRight,
  ChevronDown,
} from './components/Glyphs';

const REPO = 'knightabdo/serve';

export default function Home() {
  /* ─── Loader & nav ─────────────────────────────────────── */
  const [loaderDone, setLoaderDone] = useState(false);
  const [navVisible, setNavVisible] = useState(false);
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    const t1 = setTimeout(() => setLoaderDone(true), 1200);
    const t2 = setTimeout(() => setNavVisible(true), 1200 + 800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    let alive = true;
    fetch(`https://api.github.com/repos/${REPO}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive && d && typeof d.stargazers_count === 'number') {
          setStars(d.stargazers_count);
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="relative w-full overflow-x-hidden" data-testid="landing-root">
      {/* ─── Atmospheric Loader ─────────────────────────── */}
      <AnimatePresence>
        {!loaderDone && (
          <motion.div
            key="loader"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0C0C0D]"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            data-testid="atmospheric-loader"
          >
            <div className="amber-dot" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Global grain overlay ───────────────────────── */}
      <div className="grain-overlay" aria-hidden="true" />
      <GlobalBlur />

      {/* ─── Nav (fades in 0.8s after loader) ───────────── */}
      <motion.nav
        className="fixed top-0 left-0 right-0 z-[60] px-6 md:px-10 py-6 flex items-center justify-between pointer-events-none"
        initial={{ opacity: 0, y: -8 }}
        animate={navVisible ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        data-testid="primary-nav"
      >
        <div className="pointer-events-auto flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#C49A3C]" />
          <span
            className="font-mono text-[11px] tracking-[0.35em] uppercase text-[#EDE8DF]/70"
            data-testid="nav-wordmark"
          >
            SERVE
          </span>
        </div>
        <div className="pointer-events-auto hidden md:flex items-center gap-8">
          <a href="#manifesto" className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#EDE8DF]/40 hover:text-[#EDE8DF] transition-colors" data-testid="nav-manifesto">
            Manifesto
          </a>
          <a href="#pillars" className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#EDE8DF]/40 hover:text-[#EDE8DF] transition-colors" data-testid="nav-pillars">
            Pillars
          </a>
          <a href="#source" className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#EDE8DF]/40 hover:text-[#EDE8DF] transition-colors" data-testid="nav-source">
            Source
          </a>
          <Link
            href="/chat"
            className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#EDE8DF]/65 hover:text-[#C49A3C] transition-colors flex items-center gap-2"
            data-testid="nav-enter"
          >
            Enter
            <span className="block w-4 h-px bg-current" />
          </Link>
          <a
            href={`https://github.com/${REPO}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[10px] tracking-[0.25em] uppercase text-[#C49A3C] hover:text-[#EDE8DF] transition-colors flex items-center gap-2"
            data-testid="nav-github"
          >
            <GitHubIcon className="w-3 h-3" />
            GitHub
          </a>
        </div>
      </motion.nav>

      {/* ──────────────────────────────────────────────────────────
          SECTION 1 — HERO
          ────────────────────────────────────────────────────────── */}
      <section
        className="relative w-full h-[100svh] min-h-[640px] flex items-center justify-center overflow-hidden"
        data-testid="hero-section"
      >
        <div className="scanlines" />
        <div className="grain-hero" />

        {/* Amber orb */}
        <div
          className="amber-orb"
          style={{ left: '-80px', bottom: '40px' }}
          aria-hidden="true"
        />
        <div
          className="amber-orb"
          style={{ right: '8%', top: '12%', width: '260px', height: '260px', opacity: 0.18, animationDuration: '14s' }}
          aria-hidden="true"
        />

        <div className="relative w-full max-w-[1400px] mx-auto px-6 md:px-12 flex flex-col items-start">
          {/* Tiny eyebrow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={loaderDone ? { opacity: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex items-center gap-3 mb-10 md:mb-14"
            data-testid="hero-eyebrow"
          >
            <span className="w-6 h-px bg-[#C49A3C]" />
            <span className="font-mono text-[10px] md:text-[11px] tracking-[0.35em] uppercase text-[#C49A3C]">
              v3.1 · serve-web.tech
            </span>
          </motion.div>

          {/* SERVE wordmark with light sweep */}
          <h1
            className="serve-wordmark select-none"
            data-text="serve"
            style={{
              fontSize: 'clamp(120px, 22vw, 360px)',
              marginLeft: '-0.04em',
            }}
            data-testid="hero-wordmark"
          >
            serve
          </h1>

          {/* Subline */}
          <div className="mt-10 md:mt-14 flex items-start gap-5">
            <span className="block w-px h-12 bg-[#C49A3C]/50 mt-1" aria-hidden="true" />
            <div>
              <div
                className="font-mono uppercase tracking-[0.32em] text-[12px] md:text-[13px] text-[#EDE8DF]/85"
                data-testid="hero-subline"
              >
                {loaderDone && <MonoReveal text="not a tool. a room." delay={1.4} />}
              </div>
              <p className="mt-4 max-w-md text-sm md:text-base text-[#EDE8DF]/45 leading-relaxed">
                An anti-utility interface for unstructured reflection. Local-first.
                Open source. Built like an album, not an app.
              </p>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="scroll-indicator absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
          data-testid="scroll-indicator"
        >
          <span className="scroll-indicator-line" />
          <ChevronDown className="text-[#EDE8DF]/50" />
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          SECTION 2 — MANIFESTO
          ────────────────────────────────────────────────────────── */}
      <section
        id="manifesto"
        className="relative w-full py-32 md:py-44 px-6 md:px-12 overflow-hidden"
        data-testid="manifesto-section"
      >
        {/* Right-edge vertical watermark */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 pr-4 hidden md:block" aria-hidden="true">
          <span className="watermark-vert">utility vs. presence</span>
        </div>

        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-5 gap-12 md:gap-16 items-start">
          {/* Left 60% */}
          <SlideFromLeft className="md:col-span-3" testId="manifesto-quote">
            <span className="amber-rule mb-8" />
            <span className="mono-pill mb-8">CHAPTER · 01</span>
            <h2
              className="text-4xl md:text-6xl lg:text-7xl leading-[1.02] tracking-[-0.01em] text-[#EDE8DF] italic"
              style={{ fontFamily: 'var(--font-serif)', fontWeight: 500 }}
            >
              Most AI interfaces are built like productivity tools.
            </h2>
            <p
              className="mt-8 font-serif text-xl md:text-2xl text-[#EDE8DF]/55 italic leading-snug max-w-xl"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              SERVE is built like the room you sit in to think.
            </p>
          </SlideFromLeft>

          {/* Right 40% */}
          <FadeUp delay={0.2} className="md:col-span-2 md:pt-12 editorial-body" testId="manifesto-body">
            <p className="text-[#EDE8DF]/75 text-[15px] md:text-base leading-[1.75] tracking-[0.005em]">
              The dominant interface paradigm — bubbles, suggestions, summaries, autocompleted intent — assumes
              you arrive at the screen already knowing what you want. Most of the time, you do not. You arrive
              with a feeling. A draft. A 2am question that hasn&apos;t finished forming. The chat-bubble paradigm
              optimizes for output. SERVE optimizes for the part before output.
            </p>
            <p className="mt-6 text-[#EDE8DF]/55 text-sm md:text-[15px] leading-[1.8]">
              No assistant theater. No emoji enthusiasm. No little spinning brain reassuring you something is
              happening. The cursor blinks. The room is quiet. You write the unfinished thing.
            </p>
            <div className="mt-10 flex items-center gap-4">
              <Link
                href="/chat"
                className="group font-mono text-[10px] tracking-[0.3em] uppercase text-[#C49A3C] hover:text-[#EDE8DF] transition-colors flex items-center gap-3"
                data-testid="manifesto-continue"
              >
                <span>→ continue</span>
                <span className="block w-12 h-px bg-[#C49A3C]/40 group-hover:w-20 group-hover:bg-[#EDE8DF]/60 transition-all duration-500" />
              </Link>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          SECTION 3 — THE ROOM
          ────────────────────────────────────────────────────────── */}
      <section
        className="relative w-full py-32 md:py-48 px-6 md:px-12 overflow-hidden"
        style={{ background: 'var(--ink-3)' }}
        data-testid="the-room-section"
      >
        <div className="grain-hero opacity-50" />
        <div className="max-w-5xl mx-auto text-center relative">
          <FadeUp>
            <span className="mono-pill">02 · CORE CONCEPT</span>
          </FadeUp>
          <FadeUp delay={0.15}>
            <h2
              className="mt-10 text-5xl md:text-7xl lg:text-8xl leading-[1.02] tracking-[-0.015em] text-[#EDE8DF]"
              style={{ fontFamily: 'var(--font-serif)', fontWeight: 500 }}
              data-testid="the-room-headline"
            >
              SERVE is built like a <span className="italic">room.</span>
            </h2>
          </FadeUp>

          {/* Triptych */}
          <div className="mt-16 md:mt-20 flex flex-wrap items-center justify-center gap-x-10 md:gap-x-16 gap-y-6">
            {['Somber.', 'Warm.', 'Dark.'].map((word, i) => (
              <motion.span
                key={word}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ delay: 0.3 + i * 0.15, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="text-3xl md:text-5xl tracking-[0.04em]"
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontStyle: 'italic',
                  fontWeight: 500,
                  color: '#C49A3C',
                }}
                data-testid={`triptych-${i}`}
              >
                {word}
              </motion.span>
            ))}
          </div>

          <FadeUp delay={0.5} className="mt-16 max-w-2xl mx-auto" testId="the-room-body">
            <p className="text-[#EDE8DF]/55 text-base md:text-lg leading-relaxed">
              The walls are dark. One lamp is on. There is no chime, no badge, no streak,
              no celebratory animation. What you bring into the room is the only thing in the room.
            </p>
            <p className="mt-5 text-[#EDE8DF]/40 text-sm md:text-base leading-relaxed italic" style={{ fontFamily: 'var(--font-serif)' }}>
              You can stay for as long as you need.
            </p>
          </FadeUp>

          <FadeUp delay={0.7} className="mt-14 flex justify-center">
            <Link
              href="/chat"
              className="group inline-flex items-center gap-4 text-[#C49A3C] hover:text-[#EDE8DF] transition-colors duration-500"
              data-testid="the-room-enter"
            >
              <span
                className="text-xl md:text-2xl italic"
                style={{ fontFamily: 'var(--font-serif)' }}
              >
                open the room
              </span>
              <span className="font-mono text-base group-hover:translate-x-1 transition-transform duration-500">→</span>
            </Link>
          </FadeUp>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          SECTION 4 — FEATURE TRIO
          ────────────────────────────────────────────────────────── */}
      <section
        id="pillars"
        className="relative w-full py-32 md:py-44 px-6 md:px-12"
        data-testid="pillars-section"
      >
        <div className="max-w-6xl mx-auto">
          <FadeUp className="mb-16 md:mb-20">
            <div className="flex items-center gap-4 mb-6">
              <span className="amber-rule" />
              <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#C49A3C]">three pillars</span>
            </div>
            <h2
              className="text-3xl md:text-5xl text-[#EDE8DF] leading-[1.1] tracking-tight max-w-3xl"
              style={{ fontFamily: 'var(--font-serif)', fontWeight: 500 }}
            >
              What it does, in three sentences. <span className="italic text-[#EDE8DF]/55">Then it gets out of the way.</span>
            </h2>
          </FadeUp>

          <div className="w-full">
            {[
              {
                num: '01',
                label: 'READS THE MARGINS',
                copy: 'It responds to the hesitation, not the prompt — the question you are circling but have not asked.',
                glyph: <WaveformGlyph />,
              },
              {
                num: '02',
                label: 'REMEMBERS LOCALLY',
                copy: 'Past sessions live in IndexedDB on your device. Semantic recall happens in the browser. Nothing leaves.',
                glyph: <NodeClusterGlyph />,
              },
              {
                num: '03',
                label: 'SETS THE TONE',
                copy: 'Procedural soundscapes and ephemeral text. The interface keeps the temperature of a long conversation.',
                glyph: <SpiralGlyph />,
              },
            ].map((row, i) => (
              <motion.div
                key={row.num}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="feature-row grid grid-cols-12 gap-4 md:gap-8 items-center py-8 md:py-10 px-4 md:px-6"
                data-testid={`feature-row-${i}`}
              >
                <div className="col-span-12 md:col-span-3 flex items-center gap-3">
                  <span className="font-mono text-xs text-[#EDE8DF]/40">{row.num} /</span>
                  <span className="feature-label font-mono text-[11px] md:text-xs tracking-[0.18em] uppercase text-[#EDE8DF]/85">
                    {row.label}
                  </span>
                </div>
                <p className="col-span-12 md:col-span-6 text-[#EDE8DF]/65 text-[15px] md:text-lg leading-relaxed">
                  {row.copy}
                </p>
                <div className="col-span-12 md:col-span-3 flex md:justify-end">
                  {row.glyph}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          SECTION 5 — MEMORY RITUAL
          ────────────────────────────────────────────────────────── */}
      <MemoryRitual />

      {/* ──────────────────────────────────────────────────────────
          SECTION 6 — OPEN SOURCE
          ────────────────────────────────────────────────────────── */}
      <section
        id="source"
        className="relative w-full py-32 md:py-40 px-6 md:px-12"
        data-testid="open-source-section"
      >
        <div className="max-w-5xl mx-auto">
          <FadeUp>
            <div
              className="relative p-8 md:p-14 rounded-[2px] border"
              style={{
                borderColor: 'rgba(196,154,60,0.6)',
                background: 'linear-gradient(180deg, rgba(20,18,16,0.6) 0%, rgba(12,12,13,0.6) 100%)',
                boxShadow: '0 0 0 1px rgba(196,154,60,0.08), 0 30px 80px -40px rgba(196,154,60,0.25)',
              }}
              data-testid="open-source-card"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                <div>
                  <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-[#C49A3C]">open source · mit</span>
                  <a
                    href={`https://github.com/${REPO}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-5 font-mono text-xl md:text-3xl text-[#EDE8DF] hover:text-[#C49A3C] transition-colors break-all leading-tight"
                    data-testid="github-url"
                  >
                    github.com/<span className="text-[#EDE8DF]/50">{REPO.split('/')[0]}/</span><span className="text-[#C49A3C]">{REPO.split('/')[1]}</span>
                  </a>
                  <p
                    className="mt-6 italic text-[#EDE8DF]/50 text-base md:text-lg max-w-sm"
                    style={{ fontFamily: 'var(--font-serif)' }}
                  >
                    Built in public. Owned by no one.
                  </p>
                </div>

                <div className="flex flex-col md:items-end gap-6">
                  <div className="flex items-center gap-3" data-testid="github-stars">
                    <GitHubIcon className="text-[#EDE8DF]/70" />
                    <span className="font-mono text-xs tracking-[0.2em] uppercase text-[#EDE8DF]/40">stars</span>
                    <span className="font-serif text-4xl md:text-5xl text-[#EDE8DF]" style={{ fontFamily: 'var(--font-serif)' }}>
                      {stars === null ? '—' : stars.toLocaleString()}
                    </span>
                  </div>

                  <a
                    href={`https://github.com/${REPO}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ghost-btn"
                    data-testid="view-source-cta"
                  >
                    View Source
                    <ArrowRight />
                  </a>
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────
          SECTION 7 — BUILT BY
          ────────────────────────────────────────────────────────── */}
      <section
        className="relative w-full pt-16 pb-24 md:pt-24 md:pb-32 px-6 md:px-12"
        data-testid="built-by-section"
      >
        <FadeUp className="max-w-3xl mx-auto">
          <div className="flex items-center gap-5">
            <div
              className="w-12 h-12 rounded-full overflow-hidden shrink-0"
              style={{
                boxShadow: '0 0 0 1px rgba(196,154,60,0.7), 0 0 24px rgba(196,154,60,0.25)',
              }}
              data-testid="builder-avatar"
            >
              <div
                className="w-full h-full"
                style={{
                  background:
                    'radial-gradient(circle at 30% 30%, #2A2520 0%, #1A1815 60%, #0C0C0D 100%)',
                }}
                aria-label="@jip7e"
              />
            </div>
            <div className="flex flex-col gap-1">
              <a
                href="https://x.com/jip7e"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-sm text-[#EDE8DF] hover:text-[#C49A3C] transition-colors flex items-center gap-2"
                data-testid="builder-handle"
              >
                @jip7e
                <XIcon className="text-[#EDE8DF]/40" />
              </a>
              <a
                href="https://serve-web.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[11px] text-[#EDE8DF]/40 hover:text-[#EDE8DF] transition-colors"
                data-testid="builder-site"
              >
                serve-web.tech
              </a>
            </div>
          </div>

          <p
            className="mt-8 italic text-[#EDE8DF]/55 text-lg md:text-xl max-w-xl leading-snug"
            style={{ fontFamily: 'var(--font-serif)' }}
            data-testid="builder-bio"
          >
            SERVE is a solo experiment in building software with a point of view.
          </p>
        </FadeUp>
      </section>

      {/* ──────────────────────────────────────────────────────────
          SECTION 8 — FOOTER
          ────────────────────────────────────────────────────────── */}
      <footer
        className="relative w-full py-10 md:py-14 px-6 text-center"
        data-testid="site-footer"
      >
        <div className="grain-overlay grain-max" aria-hidden="true" />
        <div className="relative flex flex-col items-center gap-4">
          <div className="font-mono text-[10px] tracking-[0.35em] uppercase text-[#EDE8DF]/30">
            SERVE © 2026 — local-first, always.
          </div>
          <div className="flex items-center gap-6 font-mono text-[10px] tracking-[0.2em] uppercase">
            <a
              href={`https://github.com/${REPO}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#EDE8DF]/35 hover:text-[#C49A3C] transition-colors"
              data-testid="footer-github"
            >
              GitHub
            </a>
            <span className="text-[#EDE8DF]/15">·</span>
            <a
              href="https://x.com/jip7e"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#EDE8DF]/35 hover:text-[#C49A3C] transition-colors"
              data-testid="footer-x"
            >
              X
            </a>
            <span className="text-[#EDE8DF]/15">·</span>
            <a
              href="https://serve-web.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#EDE8DF]/35 hover:text-[#C49A3C] transition-colors"
              data-testid="footer-site"
            >
              serve-web.tech
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
