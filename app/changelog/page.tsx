"use client";

import Link from "next/link";
import { Scene } from "../components/canvas/Scene";

export default function Changelog() {
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
            Changelog
          </h1>

          <div className="space-y-16 border-l border-amber/15 pl-6 md:pl-8">
            <section className="group">
              <h2 className="font-mono text-[10px] text-amber/65 tracking-[0.3em] uppercase mb-4">Version 3.1.0 — Now</h2>
              <h3 className="font-serif italic font-medium text-ivory text-xl md:text-2xl mb-4 tracking-wide group-hover:text-amber transition-colors">The Atmospheric Update</h3>
              <ul className="space-y-4 text-sm md:text-base font-light text-ivory/60 leading-relaxed list-none p-0 m-0">
                <li className="relative before:content-[''] before:absolute before:left-[-1.5rem] before:top-2.5 before:w-1 before:h-1 before:bg-amber/40 before:rounded-full">Warm Golden Semantic Memory Constellation Canvas with 5 Gaussian centroids & typing-agitated pulse glow.</li>
                <li className="relative before:content-[''] before:absolute before:left-[-1.5rem] before:top-2.5 before:w-1 before:h-1 before:bg-amber/40 before:rounded-full">Glassmorphism staggered mobile menu drawer.</li>
                <li className="relative before:content-[''] before:absolute before:left-[-1.5rem] before:top-2.5 before:w-1 before:h-1 before:bg-amber/40 before:rounded-full">Document-level scroll restoration across all pages.</li>
                <li className="relative before:content-[''] before:absolute before:left-[-1.5rem] before:top-2.5 before:w-1 before:h-1 before:bg-amber/40 before:rounded-full">Editorial styling polish and smooth navigation behavior.</li>
              </ul>
            </section>

            <section className="group opacity-70">
              <h2 className="font-mono text-[10px] text-ivory/40 tracking-[0.3em] uppercase mb-4">Version 3.0.0</h2>
              <h3 className="font-serif italic font-medium text-ivory text-xl md:text-2xl mb-4 tracking-wide group-hover:text-amber transition-colors">The Shift to Web</h3>
              <ul className="space-y-4 text-sm md:text-base font-light text-ivory/60 leading-relaxed list-none p-0 m-0">
                <li className="relative before:content-[''] before:absolute before:left-[-1.5rem] before:top-2.5 before:w-1 before:h-1 before:bg-ivory/20 before:rounded-full">Transitioned from Tauri Desktop to a fully client-side Next.js Web Application.</li>
                <li className="relative before:content-[''] before:absolute before:left-[-1.5rem] before:top-2.5 before:w-1 before:h-1 before:bg-ivory/20 before:rounded-full">Introduced entirely in-browser semantic search via IndexedDB and ONNX embeddings.</li>
                <li className="relative before:content-[''] before:absolute before:left-[-1.5rem] before:top-2.5 before:w-1 before:h-1 before:bg-ivory/20 before:rounded-full">Added Copilot Device Flow authentication.</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
