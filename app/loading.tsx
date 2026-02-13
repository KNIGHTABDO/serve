'use client';

export default function Loading() {
    return (
        <div className="h-full w-full flex items-center justify-center bg-black relative isolate overflow-hidden">
            {/* Video Background for seamless transition */}
            <video
                autoPlay
                muted
                playsInline
                onEnded={(e) => {
                    const video = e.currentTarget;
                    video.currentTime = 3; // Skip the first 3 seconds (logo intro) on loop
                    video.play().catch(() => { }); // Ignore AbortError from browser power saving
                }}
                className="fixed inset-0 w-full h-full object-cover -z-20 opacity-60"
            >
                <source src="/IMG_7957.MP4" type="video/mp4" />
            </video>
            <div className="fixed inset-0 bg-black/70 -z-10" />

            <div className="flex flex-col items-center gap-4 z-10 animate-pulse">
                <img src="/logo.png" alt="Loading..." className="w-32 h-32 opacity-90 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]" />
            </div>
        </div>
    );
}
