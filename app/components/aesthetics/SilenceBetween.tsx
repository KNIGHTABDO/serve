'use client';

import { getSilenceBetween } from '@/lib/aesthetics/silence';

interface SilenceBetweenProps {
  prevCreatedAt?: string;
  nextCreatedAt?: string;
}

/**
 * Renders a faint time-gap marker between messages.
 * Ambient, always-on.
 */
export function SilenceBetween({ prevCreatedAt, nextCreatedAt }: SilenceBetweenProps) {
  const label = getSilenceBetween(prevCreatedAt, nextCreatedAt);
  if (!label) return null;

  return (
    <div className="text-white/10 text-xs italic text-center my-6 tracking-wide select-none">
      {label}
    </div>
  );
}
