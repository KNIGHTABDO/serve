'use client';

import { useState, useEffect } from 'react';


export function TitleBar() {
    const [isTauri, setIsTauri] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [appWindow, setAppWindow] = useState<any>(null);

    useEffect(() => {
        // Check if running in Tauri environment
        // We check for __TAURI_INTERNALS__ which is the v2 indicator, or fall back to __TAURI__ for v1 compatibility
        const isTauriEnv = typeof window !== 'undefined' &&
            ('__TAURI_INTERNALS__' in window || '__TAURI__' in window);

        if (isTauriEnv) {
            setIsTauri(true);

            // Dynamically import Tauri module to avoid SSR/Browser issues
            import('@tauri-apps/api/window').then((module) => {
                const win = module.getCurrentWindow();
                setAppWindow(win);
                win.isMaximized().then(setIsMaximized);
            }).catch(err => {
                console.error("Failed to load Tauri window module:", err);
                setIsTauri(false);
            });
        }
    }, []);

    if (!isTauri) return null;

    const handleMinimize = () => {
        appWindow?.minimize();
    };

    const handleMaximize = async () => {
        if (!appWindow) return;
        await appWindow.toggleMaximize();
        setIsMaximized(await appWindow.isMaximized());
    };

    const handleClose = () => {
        appWindow?.close();
    };

    return (
        <div className="h-8 flex items-center justify-between select-none bg-[#0a0a0a] border-b border-white/5 shrink-0 relative">
            {/* Drag Region (Title + Spacer) */}
            <div
                data-tauri-drag-region
                className="flex-1 h-full flex items-center pl-3"
            >
                <img src="/logo.png" alt="SERVE" className="h-4 w-auto opacity-60 hover:opacity-100 transition-opacity" />
            </div>

            {/* Right: window controls (No Drag) */}
            <div className="flex items-center h-full z-10">
                {/* Minimize */}
                <button
                    onClick={handleMinimize}
                    className="h-full px-3 hover:bg-white/10 transition-colors flex items-center justify-center cursor-default"
                    title="Minimize"
                >
                    <svg width="10" height="1" viewBox="0 0 10 1" fill="currentColor" className="text-white/50">
                        <rect width="10" height="1" />
                    </svg>
                </button>

                {/* Maximize / Restore */}
                <button
                    onClick={handleMaximize}
                    className="h-full px-3 hover:bg-white/10 transition-colors flex items-center justify-center cursor-default"
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
                    className="h-full px-3 hover:bg-red-500/80 transition-colors flex items-center justify-center cursor-default"
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
