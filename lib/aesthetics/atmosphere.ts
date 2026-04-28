/**
 * Seasonal Atmosphere — time-based background temperature shifts.
 * Returns CSS color values for a fixed background layer.
 * Ambient, always-on.
 */

export interface AtmosphereColor {
  hex: string;
  hourStart: number; // inclusive
  hourEnd: number; // exclusive
}

const ATMOSPHERE_COLORS: AtmosphereColor[] = [
  { hourStart: 0, hourEnd: 4, hex: '#050510' }, // deep indigo-black
  { hourStart: 4, hourEnd: 7, hex: '#0f0a08' }, // warm charcoal
  { hourStart: 7, hourEnd: 10, hex: '#0a0a0c' }, // pale grey-black
  { hourStart: 10, hourEnd: 16, hex: '#0a0a0a' }, // neutral void
  { hourStart: 16, hourEnd: 19, hex: '#0f0c08' }, // amber charcoal
  { hourStart: 19, hourEnd: 22, hex: '#080810' }, // deep blue-black
  { hourStart: 22, hourEnd: 24, hex: '#0a080f' }, // purple-black
];

/**
 * Get the atmosphere color for the current time (or a given Date).
 */
export function getAtmosphereColor(date: Date = new Date()): string {
  const hour = date.getHours();
  for (const color of ATMOSPHERE_COLORS) {
    if (hour >= color.hourStart && hour < color.hourEnd) {
      return color.hex;
    }
  }
  return '#0a0a0a';
}

/**
 * CSS custom property name used by the atmosphere background layer.
 */
export const ATMOSPHERE_CSS_VAR = '--atmosphere-bg';
