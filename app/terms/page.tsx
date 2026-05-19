"use client";

import Link from "next/link";
import { Scene } from "../components/canvas/Scene";

export default function Terms() {
  return (
    <div className="relative w-full min-h-[100dvh] bg-ink selection:bg-amber-faint/30 font-body">
      <div className="noise z-50 mix-blend-overlay opacity-10 pointer-events-none fixed inset-0" />

      <Scene scrollPages={0} interactive={false} density={1500} speed={0.2} pulse={false} isBackground={true} />

      <div className="relative z-10 w-full min-h-[100dvh] pointer-events-auto px-6 py-24 sm:py-32">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="group font-mono text-[10px] text-ivory/40 hover:text-amber uppercase tracking-[0.25em] mb-16 inline-flex items-center gap-4 transition-colors">
            <div className="w-8 h-[1px] bg-amber-ghost group-hover:bg-amber transition-colors"></div>
            Return
          </Link>

          <h1 className="text-4xl md:text-6xl font-serif italic font-medium text-ivory tracking-wide mb-16">
            Terms
          </h1>

          <div className="space-y-12 text-sm md:text-base font-light text-ivory/60 leading-relaxed border-l border-amber/15 pl-6 md:pl-8">
            <section>
              <h2 className="font-serif italic font-medium text-ivory/95 text-lg md:text-xl mb-4 tracking-wide">License</h2>
              <p>SERVE is open-source software released under the MIT License. You are free to use, modify, and distribute it in accordance with those terms.</p>
            </section>

            <section>
              <h2 className="font-serif italic font-medium text-ivory/95 text-lg md:text-xl mb-4 tracking-wide">Service Availability</h2>
              <p>As a client-side application heavily reliant on third-party APIs (GitHub Copilot), SERVE is provided "as is" without warranty of any kind. We cannot guarantee uninterrupted access to the underlying LLM services.</p>
            </section>

            <section>
              <h2 className="font-serif italic font-medium text-ivory/95 text-lg md:text-xl mb-4 tracking-wide">Responsibility</h2>
              <p>You are solely responsible for the context you provide to the model and how you utilize the generated responses.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
