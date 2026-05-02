'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface Annotation {
  id: string;
  message_id: string;
  word: string;
  note: string;
  created_at: string;
}

interface TheMarginsProps {
  messageId: string;
  annotations: Annotation[];
  onAddAnnotation: (annotation: Omit<Annotation, 'id' | 'created_at'>) => void;
  children: React.ReactNode;
}

/**
 * The Margins — double-click any word in a SERVE message
 * to add a private annotation. Hover reveals the note.
 * Mobile: tap-and-hold.
 *
 * Uses event delegation on rendered children (works with ReactMarkdown output).
 */
export function TheMargins({ messageId, annotations, onAddAnnotation, children }: TheMarginsProps) {
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [showInput, setShowInput] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [hoveredAnnotation, setHoveredAnnotation] = useState<Annotation | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const messageAnnotations = annotations.filter(a => a.message_id === messageId);

  useEffect(() => {
    if (showInput && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showInput]);

  const getWordFromSelection = useCallback((): string | null => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return null;
    const text = selection.toString().trim();
    // Only allow single words
    if (!text || text.includes(' ') || text.length > 30) return null;
    return text;
  }, []);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    const word = getWordFromSelection();
    if (!word) return;
    setSelectedWord(word);
    setShowInput(false);
    // Clear selection after capturing
    setTimeout(() => window.getSelection()?.removeAllRanges(), 10);
  }, [getWordFromSelection]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const target = e.target as HTMLElement;
    if (!wrapperRef.current?.contains(target)) return;

    const timer = setTimeout(() => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) {
        // If no text selected, try to select the word under touch
        const touch = e.touches[0];
        let range: Range | null = null;
        if (document.caretRangeFromPoint) {
          range = document.caretRangeFromPoint(touch.clientX, touch.clientY);
        } else if ((document as any).createRange) {
          // Fallback for Firefox
          const caretPos = document.elementFromPoint(touch.clientX, touch.clientY);
          if (caretPos && caretPos.firstChild) {
            range = document.createRange();
            range.setStart(caretPos.firstChild, 0);
            range.setEnd(caretPos.firstChild, 0);
          }
        }
        if (range) {
          selection?.removeAllRanges();
          selection?.addRange(range);
          // Expand to word
          const node = range.startContainer;
          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent || '';
            const offset = range.startOffset;
            let start = offset;
            let end = offset;
            while (start > 0 && /\w/.test(text[start - 1])) start--;
            while (end < text.length && /\w/.test(text[end])) end++;
            const wordRange = document.createRange();
            wordRange.setStart(node, start);
            wordRange.setEnd(node, end);
            selection?.removeAllRanges();
            selection?.addRange(wordRange);
          }
        }
      }
      const word = getWordFromSelection();
      if (word) {
        setSelectedWord(word);
        setShowInput(false);
      }
    }, 400);

    const clear = () => clearTimeout(timer);
    target.addEventListener('touchend', clear, { once: true });
    target.addEventListener('touchmove', clear, { once: true });
  }, [getWordFromSelection]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const word = target.textContent?.trim() || '';
    if (!word || word.includes(' ') || word.length > 30) {
      setHoveredAnnotation(null);
      return;
    }
    const ann = messageAnnotations.find(a => a.word.toLowerCase() === word.toLowerCase());
    if (ann) {
      setHoveredAnnotation(ann);
      setTooltipPos({ x: e.clientX, y: e.clientY });
    } else {
      setHoveredAnnotation(null);
    }
  }, [messageAnnotations]);

  const handleAddClick = () => {
    setShowInput(true);
    setInputValue('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWord || !inputValue.trim()) return;

    onAddAnnotation({
      message_id: messageId,
      word: selectedWord,
      note: inputValue.trim(),
    });

    setShowInput(false);
    setSelectedWord(null);
  };

  const handleCancel = () => {
    setShowInput(false);
    setSelectedWord(null);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div
        onDoubleClick={handleDoubleClick}
        onTouchStart={handleTouchStart}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredAnnotation(null)}
      >
        {children}
      </div>

      {/* Add annotation button */}
      <AnimatePresence>
        {selectedWord && !showInput && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
            onClick={handleAddClick}
            className="absolute right-0 top-0 text-white/20 hover:text-white/50 text-xs transition-colors p-1 min-w-[24px] min-h-[24px] flex items-center justify-center"
            title="Add annotation"
            aria-label="Add annotation"
          >
            +
          </motion.button>
        )}
      </AnimatePresence>

      {/* Annotation input */}
      <AnimatePresence>
        {showInput && selectedWord && (
          <motion.form
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2 }}
            onSubmit={handleSubmit}
            className="absolute right-0 top-0 flex items-center gap-2 bg-[#0a0a0a] px-2 py-1 rounded border border-white/5"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') handleCancel();
              }}
              placeholder={`Note on "${selectedWord}"...`}
              className="bg-transparent border-b border-white/20 text-white/50 text-xs focus:outline-none focus:border-white/40 w-40 sm:w-48 placeholder:text-white/10"
              aria-label={`Add note for ${selectedWord}`}
            />
            <button type="submit" className="text-white/20 hover:text-white/50 text-xs px-1">
              enter
            </button>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Desktop hover tooltip */}
      <AnimatePresence>
        {hoveredAnnotation && tooltipPos && (
          <motion.span
            initial={{ opacity: 0, x: 4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 4 }}
            transition={{ duration: 0.2 }}
            className="fixed text-white/30 text-xs whitespace-nowrap pointer-events-none z-10 hidden sm:block"
            style={{
              left: tooltipPos.x + 12,
              top: tooltipPos.y - 8,
              fontStyle: 'italic',
            }}
          >
            {hoveredAnnotation.note}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Mobile annotation tooltip */}
      <AnimatePresence>
        {hoveredAnnotation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="sm:hidden fixed bottom-20 left-4 right-4 bg-[#111] border border-white/10 rounded-lg px-4 py-3 z-[70] text-white/40 text-xs italic text-center"
          >
            {hoveredAnnotation.note}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
