'use client';

import { useState } from 'react';

export default function Loading() {
    const [videoSrc, setVideoSrc] = useState('/intro.mp4');
    const [isLooping, setIsLooping] = useState(false);

    return (
        <div className="h-full w-full flex items-center justify-center bg-black relative isolate overflow-hidden">
            {/* Video Background for seamless transition */}
            <video
                autoPlay
                muted
                playsInline
                loop={isLooping}
                onEnded={() => {
                    if (!isLooping) {
                        setVideoSrc('/loop.mp4');
                        setIsLooping(true);
                    }
                }}
                key={videoSrc}
                className="fixed inset-0 w-full h-full object-cover -z-20 opacity-60 bg-black"
                src={videoSrc}
            />

            <div className="fixed inset-0 bg-black/70 -z-10" />

            <div className="flex flex-col items-center gap-4 z-10 animate-pulse">
                <img src="/logo.png" alt="Loading..." className="w-32 h-32 opacity-90 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]" />
            </div>
        </div>
    );
}
