/**
 * Poetic Time — replaces clock timestamps with felt-time expressions
 * based on the user's local hour. Ambient, always-on.
 */

export interface PoeticMoment {
  label: string;
  hourStart: number; // inclusive
  hourEnd: number; // exclusive
}

const POETIC_MOMENTS: PoeticMoment[] = [
  { hourStart: 5, hourEnd: 7, label: 'the thinning' },
  { hourStart: 7, hourEnd: 10, label: 'early light' },
  { hourStart: 10, hourEnd: 12, label: 'the brightening' },
  { hourStart: 12, hourEnd: 14, label: 'high noon' },
  { hourStart: 14, hourEnd: 17, label: 'deep afternoon' },
  { hourStart: 17, hourEnd: 19, label: 'the goldening' },
  { hourStart: 19, hourEnd: 21, label: 'blue hour' },
  { hourStart: 21, hourEnd: 24, label: 'the settling' },
  { hourStart: 0, hourEnd: 3, label: 'the hollow' },
  { hourStart: 3, hourEnd: 5, label: 'the hour before dawn' },
];

/**
 * Get the poetic label for a given Date object (or now).
 */
export function getPoeticTime(date: Date = new Date()): string {
  const hour = date.getHours();
  for (const moment of POETIC_MOMENTS) {
    if (hour >= moment.hourStart && hour < moment.hourEnd) {
      return moment.label;
    }
  }
  return 'the void';
}

/**
 * Given an ISO date string, return a poetic timestamp like
 * "deep afternoon, Apr 28" or just "deep afternoon" if today.
 */
export function formatPoeticTimestamp(dateStr: string | undefined): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const poetic = getPoeticTime(date);

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return poetic;
  }

  const month = date.toLocaleDateString('en-US', { month: 'short' });
  const day = date.getDate();
  return `${poetic}, ${month} ${day}`;
}

/**
 * Relative poetic time for conversation list items
 * (e.g. "deep afternoon" for today, or just the poetic label).
 */
export function formatPoeticTimeAgo(dateStr: string | undefined): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffDay < 1) {
    return getPoeticTime(date);
  } else if (diffDay < 7) {
    const poetic = getPoeticTime(date);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    return `${poetic} — ${dayName}`;
  } else {
    return date.toLocaleDateString();
  }
}
