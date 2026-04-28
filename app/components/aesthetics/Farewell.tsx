'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FarewellProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
}

/**
 * Farewell — exit animation on beforeunload / page visibility hidden.
 * Desaturates text, shows "Here.", lingers the cursor.
 */
export function Farewell({ containerRef }: FarewellProps) {
  const [isLeaving, setIsLeaving] = useState(false);
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Use beforeunload for the actual page close
    const handleBeforeUnload = () => {
      // This is synchronous — we can't animate, but we can dispatch
      window.dispatchEvent(new CustomEvent('serve-farewell'));
    };

    // Use visibilitychange for tab switching / mobile background
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        setIsLeaving(true);
        window.dispatchEvent(new CustomEvent('serve-farewell'));
      } else {
        setIsLeaving(false);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Listen for the farewell event to apply CSS class to container
  useEffect(() => {
    const handleFarewell = () => {
      if (containerRef.current) {
        containerRef.current.classList.add('farewell-active');
      }
    };

    const handleReturn = () => {
      if (containerRef.current) {
        containerRef.current.classList.remove('farewell-active');
      }
    };

    window.addEventListener('serve-farewell', handleFarewell);
    window.addEventListener('serve-farewell-return', handleReturn);

    return () => {
      window.removeEventListener('serve-farewell', handleFarewell);
      window.removeEventListener('serve-farewell-return', handleReturn);
    };
  }, [containerRef]);

  useEffect(() => {
    if (!isLeaving) {
      window.dispatchEvent(new CustomEvent('serve-farewell-return'));
    }
  }, [isLeaving]);

  return (
    <AnimatePresence>
      {isLeaving && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[90] pointer-events-none"
        >
          <div className="text-white/20 text-sm tracking-wide">Here.</div>
          <div
            ref={cursorRef}
            className="w-px h-4 bg-white/30 ml-auto mt-1 animate-pulse"
            style={{ animationDelay: '2s' }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Hook that applies a CSS class to a ref'd element when farewell is active.
 * Use this for the grayscale filter.
 */
export function useFarewellClass(ref: React.RefObject<HTMLElement | null>): void {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const handleFarewell = () => {
      el.classList.add('farewell-grayscale');
    };

    const handleReturn = () => {
      el.classList.remove('farewell-grayscale');
    };

    window.addEventListener('serve-farewell', handleFarewell);
    window.addEventListener('serve-farewell-return', handleReturn);

    return () => {
      window.removeEventListener('serve-farewell', handleFarewell);
      window.removeEventListener('serve-farewell-return', handleReturn);
    };
  }, [ref]);
}
