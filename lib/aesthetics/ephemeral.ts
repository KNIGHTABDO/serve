/**
 * Ephemeral Mode — messages fade to 15% opacity over 3 minutes.
 * Toggle stored in localStorage. Crystallized artifacts never fade.
 */

const EPHEMERAL_KEY = 'serve:ephemeral-mode';

export function isEphemeralEnabled(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(EPHEMERAL_KEY) === 'true';
}

export function setEphemeralEnabled(enabled: boolean): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(EPHEMERAL_KEY, String(enabled));
}

/**
 * CSS class for ephemeral message wrapper.
 * The actual fading is handled via CSS transition on a data attribute.
 */
export const EPHEMERAL_WRAPPER_CLASS = 'ephemeral-message';

/**
 * Check if message content contains an artifact block.
 * Artifacts are crystallized and never fade.
 */
export function hasArtifact(content: string): boolean {
  return content.includes(':::artifact');
}
