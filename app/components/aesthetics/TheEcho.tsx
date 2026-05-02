'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface UIMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

interface TheEchoProps {
  messages: UIMessage[];
  isActive: boolean;
  onClose?: () => void;
}

/**
 * The Echo — a mirror view mode.
 * Strips user messages, renders only assistant messages as plain prose.
 * Toggle via Shift+E or header button. Not persisted.
 */
export function TheEcho({ messages, isActive, onClose }: TheEchoProps) {
  const assistantMessages = messages.filter(m => m.role === 'assistant');

  if (!isActive) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-[#0a0a0a] z-[55] overflow-y-auto px-4 sm:px-6 py-8"
      role="dialog"
      aria-modal="true"
      aria-labelledby="echo-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose?.();
      }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="fixed top-4 right-4 z-[60] p-2 text-white/20 hover:text-white/60 transition-colors"
        aria-label="Close The Echo"
      >
        <X className="w-5 h-5" />
      </button>
      <div className="max-w-2xl mx-auto">
        <div id="echo-title" className="text-[10px] uppercase tracking-[0.3em] text-white/15 text-center mb-12 select-none">
          The Echo
        </div>
        <div className="text-[10px] uppercase tracking-[0.2em] text-white/10 text-center mb-16 select-none">
          what remains when you step back
        </div>

        <div className="space-y-12 sm:space-y-16">
          {assistantMessages.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="text-white/70 text-sm sm:text-base leading-[1.8] font-light whitespace-pre-wrap"
            >
              {stripMarkdownArtifacts(m.content)}
            </motion.div>
          ))}
        </div>

        {assistantMessages.length === 0 && (
          <div className="text-center text-white/10 text-xs italic mt-20">
            Nothing echoes yet.
          </div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Strip markdown and artifact syntax for clean prose display.
 */
function stripMarkdownArtifacts(content: string): string {
  return content
    .replace(/:::artifact\[.*?\][\s\S]*?:::/g, '')
    .replace(/\*\*/g, '')
    .replace(/__/g, '')
    .replace(/#{1,6}\s/g, '')
    .replace(/`{3}[\s\S]*?`{3}/g, '')
    .replace(/`/g, '')
    .replace(/^\s*[\*\-]\s/gm, '')
    .replace(/^\s*\d+\.\s/gm, '')
    .replace(/^>{1,}\s?/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
    .trim();
}

/**
 * Hook to listen for Shift+E keyboard shortcut.
 */
export function useEchoToggle(): [boolean, () => void] {
  const [isActive, setIsActive] = useState(false);

  const toggle = () => setIsActive(prev => !prev);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key.toLowerCase() === 'e') {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return [isActive, toggle];
}
