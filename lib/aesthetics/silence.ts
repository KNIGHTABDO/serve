/**
 * The Silence Between — renders time-gap expressions between messages
 * based on created_at deltas. Ambient, always-on.
 */

export interface SilenceEntry {
  text: string;
  style: string;
}

const SILENCE_LABELS: { maxMinutes: number; text: string }[] = [
  { maxMinutes: 10, text: '' }, // no gap shown
  { maxMinutes: 60, text: '\u2014' }, // em dash
  { maxMinutes: 360, text: 'Later.' }, // 1-6 hours
  { maxMinutes: 1440, text: 'The next day.' }, // 6-24 hours
  { maxMinutes: 10080, text: 'A week passes.' }, // 1-7 days
  { maxMinutes: Infinity, text: 'Some time later.' },
];

/**
 * Given two ISO date strings, return the silence label if a gap warrants one.
 */
export function getSilenceBetween(
  earlier: string | undefined,
  later: string | undefined
): string | null {
  if (!earlier || !later) return null;
  const a = new Date(earlier).getTime();
  const b = new Date(later).getTime();
  const diffMin = Math.floor((b - a) / 60000);

  for (const entry of SILENCE_LABELS) {
    if (diffMin <= entry.maxMinutes) {
      return entry.text || null;
    }
  }
  return null;
}

/**
 * Build an array of [index, label] pairs to insert into a message list.
 */
export function buildSilenceGaps<T extends { created_at?: string }>(
  messages: T[]
): { index: number; label: string }[] {
  const gaps: { index: number; label: string }[] = [];
  for (let i = 1; i < messages.length; i++) {
    const label = getSilenceBetween(messages[i - 1].created_at, messages[i].created_at);
    if (label) {
      gaps.push({ index: i, label });
    }
  }
  return gaps;
}
