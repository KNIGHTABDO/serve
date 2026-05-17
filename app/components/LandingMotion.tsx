'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

/* ─── Hero subline letter-by-letter ──────────────────────── */
export function MonoReveal({ text, delay = 0, testId }: { text: string; delay?: number; testId?: string }) {
  return (
    <span data-testid={testId} aria-label={text} className="inline-flex flex-wrap">
      {text.split('').map((ch, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + i * 0.04, duration: 0.4, ease: 'easeOut' }}
          aria-hidden="true"
        >
          {ch === ' ' ? '\u00A0' : ch}
        </motion.span>
      ))}
    </span>
  );
}

/* ─── Fade-up wrapper ────────────────────────────────────── */
export function FadeUp({
  children,
  delay = 0,
  className = '',
  amount = 0.3,
  y = 24,
  testId,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  amount?: number;
  y?: number;
  testId?: string;
}) {
  return (
    <motion.div
      data-testid={testId}
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Slide from left ────────────────────────────────────── */
export function SlideFromLeft({
  children,
  delay = 0,
  className = '',
  testId,
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  testId?: string;
}) {
  return (
    <motion.div
      data-testid={testId}
      className={className}
      initial={{ opacity: 0, x: -32 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, amount: 0.4 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

/* ─── Global progressive blur (after 80% scroll) ─────────── */
export function GlobalBlur() {
  const [blur, setBlur] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const prog = max > 0 ? window.scrollY / max : 0;
      // Subtle fog: kicks in only past 92%, max ~1.4px
      const b = prog > 0.92 ? Math.min((prog - 0.92) / 0.08, 1) * 1.4 : 0;
      setBlur(b);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 40,
        pointerEvents: 'none',
        backdropFilter: blur > 0.1 ? `blur(${blur}px)` : 'none',
        WebkitBackdropFilter: blur > 0.1 ? `blur(${blur}px)` : 'none',
        // Mask so blur only affects top + bottom edges (the fog at edges)
        maskImage:
          'linear-gradient(to bottom, black 0%, transparent 18%, transparent 82%, black 100%)',
        WebkitMaskImage:
          'linear-gradient(to bottom, black 0%, transparent 18%, transparent 82%, black 100%)',
      }}
    />
  );
}

/* ─── Memory ritual canvas (Section 5) ───────────────────── */
const FRAGMENTS = [
  { x: 8, y: 18, w: 230, text: 'i keep returning to the same paragraph.' },
  { x: 60, y: 38, w: 200, text: 'something about the door being open.' },
  { x: 22, y: 62, w: 250, text: 'last tuesday — the same exact hesitation.' },
  { x: 68, y: 74, w: 210, text: 'a pattern, not a coincidence.' },
  { x: 42, y: 50, w: 180, text: 'what was i afraid of asking?' },
];

export function MemoryRitual() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  // Draw threads as user scrolls through section (0 = drawn, 1 = invisible)
  const dashOffset = useTransform(scrollYProgress, [0.15, 0.65], [60, 0]);

  return (
    <section
      ref={ref}
      data-testid="memory-ritual-section"
      className="relative w-full py-32 md:py-40 px-6 md:px-12 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, var(--ink) 0%, #0A0A0B 50%, var(--ink) 100%)' }}
    >
      <FadeUp className="max-w-6xl mx-auto mb-12 md:mb-20">
        <div className="text-center">
          <span className="mono-pill" data-testid="memory-label">
            <span className="w-1.5 h-1.5 rounded-full bg-[#C49A3C]" />
            LOCAL_MEMORY · SCROLL TO WEAVE
          </span>
          <h2 className="mt-8 font-serif text-[#EDE8DF] text-4xl md:text-6xl leading-[1.05] tracking-tight" style={{ fontFamily: "var(--font-serif)" }}>
            Your thoughts, <span className="italic" style={{ color: '#C49A3C' }}>connected.</span>
            <br /> Locally. Privately.
          </h2>
        </div>
      </FadeUp>

      {/* Canvas with floating fragments + threads */}
      <div className="relative w-full max-w-6xl mx-auto" style={{ height: '560px' }} data-testid="memory-canvas">
        {/* Background grain layer (parallax 0.3x) */}
        <ParallaxLayer speed={0.3} className="absolute inset-0 opacity-30">
          <div className="grain-hero opacity-100" />
        </ParallaxLayer>

        {/* Topographic line illustration (parallax 0.6x) */}
        <ParallaxLayer speed={0.6} className="absolute inset-0 pointer-events-none">
          <svg className="topo-svg w-full h-full" viewBox="0 0 800 560" preserveAspectRatio="none" aria-hidden="true">
            {Array.from({ length: 12 }).map((_, i) => (
              <path
                key={i}
                d={`M0,${40 + i * 40} Q 200,${20 + i * 38} 400,${60 + i * 40} T 800,${30 + i * 42}`}
              />
            ))}
          </svg>
        </ParallaxLayer>

        {/* Thread connections */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          {FRAGMENTS.slice(0, -1).map((f, i) => {
            const next = FRAGMENTS[i + 1];
            const cx = (f.x + next.x) / 2;
            const cy = Math.min(f.y, next.y) - 6;
            return (
              <motion.path
                key={i}
                d={`M ${f.x + 6},${f.y + 4} Q ${cx},${cy} ${next.x + 6},${next.y + 4}`}
                stroke="#C49A3C"
                strokeWidth="0.22"
                fill="none"
                strokeDasharray="60"
                style={{ strokeDashoffset: dashOffset }}
                opacity="0.75"
              />
            );
          })}
        </svg>

        {/* Floating fragments (foreground 1x) */}
        {FRAGMENTS.map((f, i) => (
          <motion.div
            key={i}
            className="memory-fragment absolute text-[13px] md:text-sm"
            style={{
              left: `${f.x}%`,
              top: `${f.y}%`,
              maxWidth: f.w,
            }}
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ delay: 0.15 + i * 0.12, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            data-testid={`memory-fragment-${i}`}
          >
            &ldquo;{f.text}&rdquo;
          </motion.div>
        ))}
      </div>

      <FadeUp delay={0.2} className="text-center mt-16 md:mt-24">
        <p className="font-mono text-xs md:text-sm tracking-[0.18em] uppercase" style={{ color: '#C49A3C' }} data-testid="memory-footer">
          Zero cloud. Zero telemetry. IndexedDB only.
        </p>
      </FadeUp>
    </section>
  );
}

/* ─── Parallax layer helper ──────────────────────────────── */
function ParallaxLayer({
  children,
  speed = 0.5,
  className = '',
}: {
  children: React.ReactNode;
  speed?: number;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  const y = useTransform(scrollYProgress, [0, 1], [0, (1 - speed) * 200]);
  return (
    <motion.div ref={ref} className={className} style={{ y }}>
      {children}
    </motion.div>
  );
}
