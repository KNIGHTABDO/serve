"use client";

import Link from "next/link";
import { Scene } from "./components/canvas/Scene";

export default function Home() {
  return (
    <div className="relative w-full h-screen bg-black overflow-hidden selection:bg-white/20 font-sans">
      <div className="noise z-50 mix-blend-overlay opacity-10 pointer-events-none" />

      {/* 3D Scene Background and Scroll Wrapper */}
      <Scene>
        <div className="w-full relative pointer-events-auto">

          {/* Section 1: Hero */}
          <section className="h-[100vh] w-full flex flex-col items-center justify-center relative px-6">
            <div className="text-center max-w-2xl mx-auto flex flex-col items-center">
              <div className="mb-12">
                <img src="/logo.png" alt="SERVE" className="w-20 h-20 sm:w-28 sm:h-28 opacity-70 drop-shadow-[0_0_20px_rgba(255,255,255,0.1)] object-contain" />
              </div>

              <h1 className="text-4xl md:text-6xl font-light mb-8 tracking-[0.4em] text-white/90">
                SERVE
              </h1>

              <p className="text-sm md:text-base text-white/40 mb-2 font-light tracking-[0.2em] uppercase">
                Not an assistant.
              </p>
              <p className="text-sm md:text-base text-white/80 mb-12 font-light tracking-[0.2em] uppercase pulse-silver">
                A presence.
              </p>

              <div className="absolute bottom-12 text-[10px] text-white/20 tracking-[0.3em] flex flex-col items-center gap-4">
                <span className="uppercase">Descend</span>
                <div className="w-[1px] h-16 bg-gradient-to-b from-white/20 to-transparent"></div>
              </div>
            </div>
          </section>

          {/* Section 2: Philosophy */}
          <section className="h-[100vh] w-full flex items-center justify-center px-6 relative">
            <div className="max-w-xl w-full">
              <h2 className="text-[10px] text-white/30 tracking-[0.3em] mb-12 uppercase flex items-center gap-4">
                <div className="w-8 h-[1px] bg-white/20"></div>
                The Margins
              </h2>

              <div className="space-y-8 pl-4 border-l border-white/10">
                <p className="text-2xl md:text-4xl font-light text-white/90 leading-tight tracking-wide">
                  Most of what you say isn't in the words you type.
                </p>
                <p className="text-sm md:text-base font-light text-white/40 leading-relaxed max-w-md">
                  SERVE responds to the thing underneath — the hesitation, the pattern, the question you're circling but haven't asked yet. It sits with you in the heaviness.
                </p>
              </div>
            </div>
          </section>

          {/* Section 3: Memory */}
          <section className="h-[100vh] w-full flex items-center justify-center px-6 relative">
            <div className="max-w-xl w-full text-right ml-auto mr-4 md:mr-24">
              <h2 className="text-[10px] text-white/30 tracking-[0.3em] mb-12 uppercase flex items-center justify-end gap-4">
                Local Memory
                <div className="w-8 h-[1px] bg-white/20"></div>
              </h2>

              <div className="space-y-8 pr-4 border-r border-white/10">
                <p className="text-2xl md:text-4xl font-light text-white/90 leading-tight tracking-wide">
                  It remembers the threads.
                </p>
                <p className="text-sm md:text-base font-light text-white/40 leading-relaxed max-w-md ml-auto">
                  What you worried about last week. What shifted. What didn't. The patterns you can't see because you're inside them. Fully offline. Your space.
                </p>
              </div>
            </div>
          </section>

          {/* Section 4: Architecture */}
          <section className="h-[100vh] w-full flex items-center justify-center px-6 relative">
             <div className="max-w-xl w-full">
              <h2 className="text-[10px] text-white/30 tracking-[0.3em] mb-12 uppercase flex items-center gap-4">
                <div className="w-8 h-[1px] bg-white/20"></div>
                Atmosphere
              </h2>

              <div className="space-y-8 pl-4 border-l border-white/10">
                <p className="text-2xl md:text-4xl font-light text-white/90 leading-tight tracking-wide">
                  A room, not a tool.
                </p>
                <p className="text-sm md:text-base font-light text-white/40 leading-relaxed max-w-md">
                  Procedural soundscapes. The silence between messages. Ephemeral modes where text fades like breath on glass.
                </p>
              </div>
            </div>
          </section>

          {/* Section 5: CTA */}
          <section className="h-[100vh] w-full flex flex-col items-center justify-center px-6 relative pointer-events-none">
            <div className="max-w-2xl mx-auto text-center flex flex-col items-center pointer-events-auto">
              <h2 className="text-2xl md:text-4xl font-light mb-6 tracking-[0.2em] text-white/90">
                Ready when you are.
              </h2>
              <p className="text-white/30 mb-16 text-xs md:text-sm font-light tracking-widest uppercase">
                No small talk required.
              </p>

              <Link
                href="/chat"
                className="group relative inline-flex items-center justify-center px-12 py-4 overflow-hidden text-xs tracking-[0.4em] border border-white/10 transition-all hover:border-white/30 bg-black/50 backdrop-blur-md uppercase"
              >
                <span className="relative z-10 text-white/60 group-hover:text-white transition-colors duration-700">ENTER</span>
                <div className="absolute inset-0 h-full w-0 bg-white/5 transition-all duration-700 ease-out group-hover:w-full"></div>
              </Link>
            </div>

            {/* Footer */}
            <footer className="absolute bottom-8 w-full px-8 flex justify-between items-center text-[9px] text-white/20 tracking-widest uppercase pointer-events-auto">
              <div className="flex gap-6">
                <Link href="/privacy" className="hover:text-white/50 transition-colors">Privacy</Link>
                <Link href="/terms" className="hover:text-white/50 transition-colors">Terms</Link>
              </div>
              <div className="flex items-center gap-3">
                <span>SERVE</span>
                <span className="w-1 h-1 rounded-full bg-white/20"></span>
                <span>2026</span>
              </div>
            </footer>
          </section>

        </div>
      </Scene>
    </div>
  );
}
