'use client';

import { useRouter } from 'next/navigation';

export default function ChangelogPage() {
  const router = useRouter();

  const versions = [
    {
      version: '3.0.0',
      date: 'April 2026',
      title: 'The Great Unbinding',
      changes: [
        'Complete architectural rewrite moving from Tauri native to the modern web.',
        'Conversations and Workspaces are now persisted lightning-fast in the browser via IndexedDB.',
        'Device-agnostic flow allows usage on mobile, iPad, and any modern browser.',
        'Directory parsing now leverages webkitdirectory for seamless local file ingestion.',
        'Added server-side proxy routes for GitHub Copilot, ensuring secure CORS-compliant completions.',
        'Responsive layout redesign for the main chat interface.',
        'Sunset Native SQLite database and Native Window controls.'
      ]
    },
    {
      version: '2.1.0',
      date: 'February 2026',
      title: 'The Reliquary',
      changes: [
        'Added "The Reliquary" for crystallized insights and artifact generation.',
        'Overhauled the persona matrix introducing "The Mirror", "The Void", and "The Scribe".',
        'Implemented structural Markdown support for dynamic UI injection.',
        'Added "Focus" sub-menu for quoting text and returning it to context.'
      ]
    },
    {
      version: '2.0.0',
      date: 'January 2026',
      title: 'Resonance',
      changes: [
        'Introduced the Procedural Audio Resonance Engine running on the Web Audio API.',
        'Integrated Xenova/all-MiniLM-L6-v2 ONNX embeddings for hyper-local memory context.',
        'Redesigned the Workspace grounding engine.'
      ]
    },
    {
      version: '1.0.0',
      date: 'December 2025',
      title: 'Genesis',
      changes: [
        'Initial release of SERVE for Desktop.',
        'Integration with GitHub Copilot Device Flow.',
        'Cinematic UI framework and foundational SQLite schema established.'
      ]
    }
  ];

  return (
    <div className="h-screen overflow-y-auto bg-[#0a0a0a] text-white selection:bg-white/10 font-sans">
      <div className="max-w-2xl mx-auto px-6 py-24 sm:py-32">
        <button onClick={() => router.back()} className="text-xs text-white/40 hover:text-white uppercase tracking-widest transition-colors mb-16 inline-block">
          ← Back
        </button>
        
        <h1 className="text-3xl font-light mb-12 tracking-wide">Changelog</h1>
        
        <div className="space-y-16">
          {versions.map((v) => (
            <div key={v.version} className="relative pl-6 sm:pl-8 border-l border-white/5">
              <div className="absolute top-1.5 -left-[3px] w-1.5 h-1.5 bg-white/40 rounded-full" />
              
              <div className="flex items-baseline justify-between mb-2">
                <h2 className="text-lg font-medium text-white/90">{v.version} — {v.title}</h2>
                <span className="text-xs text-white/30 italic">{v.date}</span>
              </div>
              
              <ul className="space-y-3 mt-6">
                {v.changes.map((change, i) => (
                  <li key={i} className="text-sm text-white/50 leading-relaxed flex gap-3">
                    <span className="text-white/20 select-none">•</span>
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
