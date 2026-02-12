'use client';

import { useState, useEffect } from 'react';

// Only import Tauri APIs when running in Tauri
let tauriWindow: any = null;

export function TitleBar() {
    const [isTauri, setIsTauri] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);

    useEffect(() => {
        // Detect Tauri environment
        if (typeof window !== 'undefined' && '__TAURI__' in window) {
            setIsTauri(true);
            import('@tauri-apps/api/window').then((mod) => {
                tauriWindow = mod;
                // Check initial maximized state
                mod.getCurrentWindow().isMaximized().then(setIsMaximized);
            });
        }
    }, []);

    if (!isTauri) return null;

    const handleMinimize = async () => {
        await tauriWindow?.getCurrentWindow().minimize();
    };

    const handleMaximize = async () => {
        const win = tauriWindow?.getCurrentWindow();
        if (!win) return;
        await win.toggleMaximize();
        setIsMaximized(await win.isMaximized());
    };

    const handleClose = async () => {
        await tauriWindow?.getCurrentWindow().close();
    };

    return (
        <div
            data-tauri-drag-region
            className="h-8 flex items-center justify-between select-none bg-[#0a0a0a] border-b border-white/5 shrink-0"
            style={{ WebkitAppRegion: 'drag' } as any}
        >
            {/* Left: app icon */}
            <div className="flex items-center pl-3 pointer-events-none">
                <span className="text-[10px] text-white/20 tracking-[0.15em] uppercase">SERVE</span>
            </div>

            {/* Right: window controls */}
            <div className="flex items-center h-full" style={{ WebkitAppRegion: 'no-drag' } as any}>
                {/* Minimize */}
                <button
                    onClick={handleMinimize}
                    className="h-full px-3 hover:bg-white/10 transition-colors flex items-center justify-center"
                    title="Minimize"
                >
                    <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor" className="text-white/50">
                        <rect width="10" height="1" />
                    </svg>
                </button>

                {/* Maximize / Restore */}
                <button
                    onClick={handleMaximize}
                    className="h-full px-3 hover:bg-white/10 transition-colors flex items-center justify-center"
                    title={isMaximized ? "Restore" : "Maximize"}
                >
                    {isMaximized ? (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/50">
                            <rect x="2" y="0" width="8" height="8" rx="0.5" />
                            <rect x="0" y="2" width="8" height="8" rx="0.5" />
                        </svg>
                    ) : (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1" className="text-white/50">
                            <rect x="0.5" y="0.5" width="9" height="9" rx="0.5" />
                        </svg>
                    )}
                </button>

                {/* Close */}
                <button
                    onClick={handleClose}
                    className="h-full px-3 hover:bg-red-500/80 transition-colors flex items-center justify-center"
                    title="Close"
                >
                    <svg width="10" height="10" viewBox="0 0 10 10" stroke="currentColor" strokeWidth="1.2" className="text-white/50 hover:text-white">
                        <line x1="1" y1="1" x2="9" y2="9" />
                        <line x1="9" y1="1" x2="1" y2="9" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
