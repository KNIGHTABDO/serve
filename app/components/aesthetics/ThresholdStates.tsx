'use client';

import { useState, useEffect } from 'react';

const THRESHOLD_WORDS = [
  'attending',
  'holding',
  'listening',
  'receiving',
  'waiting',
  'formulating',
  'weighing',
  'returning',
];

const WORD_DURATION = 3500; // ms per word

interface ThresholdStatesProps {
  isLoading: boolean;
}

/**
 * Replaces the ... loading indicator with slowly changing evocative words.
 * Ambient, always-on when loading.
 */
export function ThresholdStates({ isLoading }: ThresholdStatesProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setIndex(prev => (prev + 1) % THRESHOLD_WORDS.length);
    }, WORD_DURATION);

    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="py-6 text-white/30 text-sm italic tracking-wider animate-pulse select-none text-center">
      {THRESHOLD_WORDS[index]}
    </div>
  );
}
