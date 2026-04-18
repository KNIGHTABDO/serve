'use client';

import { useState, useEffect } from 'react';


export function TitleBar() {
    const [isThinking, setIsThinking] = useState(false);

    useEffect(() => {
        // Listen for thinking state from chat
        const handleStart = () => setIsThinking(true);
        const handleStop = () => setIsThinking(false);
        window.addEventListener('serve-thinking-start', handleStart);
        window.addEventListener('serve-thinking-stop', handleStop);

        return () => {
            window.removeEventListener('serve-thinking-start', handleStart);
            window.removeEventListener('serve-thinking-stop', handleStop);
        };
    }, []);

    return (
        <div className="h-8 flex items-center justify-between select-none bg-[#0a0a0a] border-b border-white/5 shrink-0 relative">
            {/* Logo */}
            <div
                className="flex-1 h-full flex items-center pl-3"
            >
                <img 
                    src="/logo.png" 
                    alt="SERVE" 
                    className={`h-4 w-auto transition-all duration-1000 ${isThinking ? 'pulse-silver opacity-100' : 'opacity-40 hover:opacity-100'}`} 
                />
            </div>
        </div>
    );
}
