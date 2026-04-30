'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';

const CLEARING_DISCOVERED_KEY = 'serve:clearing-discovered';

export function useClearingDiscovered(): boolean {
  const [discovered] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(CLEARING_DISCOVERED_KEY) === 'true';
    }
    return false;
  });

  return discovered;
}

export function markClearingDiscovered(): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(CLEARING_DISCOVERED_KEY, 'true');
  }
}

interface TheClearingProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * A ritual pause overlay. Fullscreen black, breathing circle, no text.
 * Click anywhere or press Escape to exit.
 */
export function TheClearing({ isOpen, onClose }: TheClearingProps) {
  const circleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !circleRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(circleRef.current, {
        scale: 1.2,
        opacity: 0.8,
        duration: 3,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      });
    });

    return () => ctx.revert();
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          onClick={onClose}
          className="fixed inset-0 bg-black z-[100] flex items-center justify-center cursor-pointer"
        >
          <div
            ref={circleRef}
            className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border border-white/20 opacity-30"
            style={{ willChange: 'transform, opacity' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
