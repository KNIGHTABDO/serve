"use client";

import Link from "next/link";
import { Scene } from "../components/canvas/Scene";

export default function Changelog() {
  return (
    <div className="relative w-full min-h-screen bg-black overflow-hidden selection:bg-white/20 font-sans">
      <div className="noise z-50 mix-blend-overlay opacity-10 pointer-events-none fixed inset-0" />

      <Scene scrollPages={0} interactive={false} density={1500} speed={0.2} pulse={false} isBackground={true} />

      <div className="relative z-10 w-full min-h-screen pointer-events-auto overflow-y-auto px-6 py-24 sm:py-32">
        <div className="max-w-3xl mx-auto">
          <Link href="/" className="text-[10px] text-white/40 hover:text-white uppercase tracking-widest mb-16 inline-flex items-center gap-4 transition-colors">
            <div className="w-8 h-[1px] bg-white/20"></div>
            Return
          </Link>

          <h1 className="text-3xl md:text-5xl font-light text-white/90 tracking-wide mb-16">
            Changelog
          </h1>

          <div className="space-y-16 border-l border-white/10 pl-6 md:pl-8">
            <section className="group">
              <h2 className="text-[10px] text-white/40 tracking-[0.3em] uppercase mb-4">Version 3.1.0 — Now</h2>
              <h3 className="text-white/90 text-xl md:text-2xl font-light mb-4 tracking-wide group-hover:text-white transition-colors">The Atmospheric Update</h3>
              <ul className="space-y-4 text-sm md:text-base font-light text-white/60 leading-relaxed list-none p-0 m-0">
                <li className="relative before:content-[''] before:absolute before:left-[-1.5rem] before:top-2.5 before:w-1 before:h-1 before:bg-white/20 before:rounded-full">Complete redesign of the landing experience.</li>
                <li className="relative before:content-[''] before:absolute before:left-[-1.5rem] before:top-2.5 before:w-1 before:h-1 before:bg-white/20 before:rounded-full">Integration of subtle 3D environments to enhance the sense of presence.</li>
                <li className="relative before:content-[''] before:absolute before:left-[-1.5rem] before:top-2.5 before:w-1 before:h-1 before:bg-white/20 before:rounded-full">Improved mobile responsiveness for input fields and selectors.</li>
              </ul>
            </section>

            <section className="group opacity-70">
              <h2 className="text-[10px] text-white/40 tracking-[0.3em] uppercase mb-4">Version 3.0.0</h2>
              <h3 className="text-white/90 text-xl md:text-2xl font-light mb-4 tracking-wide group-hover:text-white transition-colors">The Shift to Web</h3>
              <ul className="space-y-4 text-sm md:text-base font-light text-white/60 leading-relaxed list-none p-0 m-0">
                <li className="relative before:content-[''] before:absolute before:left-[-1.5rem] before:top-2.5 before:w-1 before:h-1 before:bg-white/20 before:rounded-full">Transitioned from Tauri Desktop to a fully client-side Next.js Web Application.</li>
                <li className="relative before:content-[''] before:absolute before:left-[-1.5rem] before:top-2.5 before:w-1 before:h-1 before:bg-white/20 before:rounded-full">Introduced entirely in-browser semantic search via IndexedDB and ONNX embeddings.</li>
                <li className="relative before:content-[''] before:absolute before:left-[-1.5rem] before:top-2.5 before:w-1 before:h-1 before:bg-white/20 before:rounded-full">Added Copilot Device Flow authentication.</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
