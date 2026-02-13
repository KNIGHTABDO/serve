/**
 * Tauri environment detection utilities.
 * Prevents Tauri APIs from being called during SSR or in a regular browser.
 */

export function isTauri(): boolean {
    if (typeof window === 'undefined') return false;
    const w = window as any;
    return !!(w.__TAURI_INTERNALS__ || w.__TAURI__ || w.__TAURI_IPC__);
}
