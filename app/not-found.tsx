'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import Link from 'next/link';

export default function NotFound() {
  const circleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!circleRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(circleRef.current, {
        scale: 1.3,
        opacity: 0.6,
        duration: 4,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="fixed inset-0 bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Atmospheric breathing circle */}
      <div
        ref={circleRef}
        className="absolute w-48 h-48 sm:w-64 sm:h-64 rounded-full border border-white/10 opacity-20"
        style={{ willChange: 'transform, opacity' }}
      />

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex flex-col items-center text-center gap-6 px-6"
      >
        <div className="flex items-baseline gap-3">
          <span className="text-[6rem] sm:text-[8rem] font-light text-white/90 leading-none tracking-tighter">
            404
          </span>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 1 }}
          className="text-white/40 text-sm sm:text-base font-light tracking-wide max-w-xs"
        >
          This path leads nowhere. Not every road was meant to be taken.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
        >
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/50 hover:text-white/80 transition-colors duration-700 text-sm tracking-widest uppercase font-light border-b border-white/10 hover:border-white/30 pb-1"
          >
            Return home
          </Link>
        </motion.div>
      </motion.div>

      {/* Subtle noise texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.015] z-20"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: '128px 128px',
        }}
      />
    </div>
  );
}
