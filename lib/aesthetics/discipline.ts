/**
 * The Discipline — constraint toggle for input discipline.
 * Soft constraints: one-sentence mode or 140-char mode.
 */

export type DisciplineMode = 'off' | 'one-sentence' | '140-chars';

const DISCIPLINE_KEY = 'serve:discipline-mode';

export function getDisciplineMode(): DisciplineMode {
  if (typeof window === 'undefined') return 'off';
  const stored = localStorage.getItem(DISCIPLINE_KEY);
  if (stored === 'one-sentence' || stored === '140-chars') return stored;
  return 'off';
}

export function setDisciplineMode(mode: DisciplineMode): void {
  if (typeof window === 'undefined') return;
  if (mode === 'off') {
    localStorage.removeItem(DISCIPLINE_KEY);
  } else {
    localStorage.setItem(DISCIPLINE_KEY, mode);
  }
}

/**
 * Check if text violates the one-sentence discipline.
 * A "sentence" ends with . ! ? or newline.
 */
export function violatesOneSentence(text: string): boolean {
  const trimmed = text.trim();
  if (!trimmed) return false;
  // Count sentence-ending punctuation
  const sentences = trimmed.split(/[.!?\n]+/).filter(s => s.trim().length > 0);
  return sentences.length > 1;
}

/**
 * Check if text violates the 140-char discipline.
 */
export function violates140Chars(text: string): boolean {
  return text.length > 140;
}

/**
 * Get placeholder text for the discipline mode.
 */
export function getDisciplinePlaceholder(basePlaceholder: string, mode: DisciplineMode): string {
  if (mode === 'one-sentence') return 'One line.';
  if (mode === '140-chars') return '140.';
  return basePlaceholder;
}

/**
 * Get visual constriction class for the input wrapper.
 */
export function getDisciplineInputClass(mode: DisciplineMode): string {
  if (mode === 'one-sentence') return 'border-l-2 border-white/20';
  if (mode === '140-chars') return 'border-l-2 border-white/10';
  return '';
}

/**
 * Get warning message if discipline is violated.
 */
export function getDisciplineWarning(text: string, mode: DisciplineMode): string | null {
  if (mode === 'one-sentence' && violatesOneSentence(text)) {
    return 'One sentence. That\'s the discipline.';
  }
  if (mode === '140-chars' && violates140Chars(text)) {
    return '140. That is the limit.';
  }
  return null;
}
