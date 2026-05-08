"use client";

import Link from "next/link";
import { Scene } from "../components/canvas/Scene";

export default function Privacy() {
  return (
    <div className="relative w-full min-h-[100dvh] bg-black overflow-hidden selection:bg-white/20 font-sans">
      <div className="noise z-50 mix-blend-overlay opacity-10 pointer-events-none fixed inset-0" />

      <Scene scrollPages={0} interactive={false} density={1500} speed={0.2} pulse={false} isBackground={true} />

      <div className="relative z-10 w-full min-h-[100dvh] pointer-events-auto overflow-y-auto px-6 py-24 sm:py-32">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="text-[10px] text-white/40 hover:text-white uppercase tracking-widest mb-16 inline-flex items-center gap-4 transition-colors">
            <div className="w-8 h-[1px] bg-white/20"></div>
            Return
          </Link>

          <h1 className="text-3xl md:text-5xl font-light text-white/90 tracking-wide mb-16">
            Privacy
          </h1>

          <div className="space-y-12 text-sm md:text-base font-light text-white/60 leading-relaxed border-l border-white/10 pl-6 md:pl-8">
            <section>
              <h2 className="text-white/90 text-lg md:text-xl mb-4 tracking-wide">Local-First Architecture</h2>
              <p>SERVE operates entirely within your browser. All conversations, groundings, embeddings, and artifacts are stored locally in your browser's IndexedDB. We do not maintain a central database of your data.</p>
            </section>

            <section>
              <h2 className="text-white/90 text-lg md:text-xl mb-4 tracking-wide">LLM Integration</h2>
              <p>When you interact with SERVE, prompts are sent to GitHub Copilot's API via your authenticated Device Flow token. The requests are proxied through our edge functions, but we do not log, store, or monitor your prompts or the model's responses.</p>
            </section>

            <section>
              <h2 className="text-white/90 text-lg md:text-xl mb-4 tracking-wide">Telemetry</h2>
              <p>SERVE collects zero telemetry, zero analytics, and zero tracking data. The space belongs entirely to you.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
