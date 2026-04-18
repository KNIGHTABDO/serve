import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-white/10 font-sans">
      <div className="max-w-2xl mx-auto px-6 py-24 sm:py-32">
        <Link href="/" className="text-xs text-white/40 hover:text-white uppercase tracking-widest transition-colors mb-16 inline-block">
          ← Back
        </Link>
        
        <h1 className="text-3xl font-light mb-12 tracking-wide">Privacy Policy</h1>
        
        <div className="space-y-12 text-sm">
          <section>
            <h2 className="text-white/60 uppercase tracking-widest text-xs mb-4">The Short Version</h2>
            <p className="text-white/40 leading-relaxed">
              We don't want your data. We don't store your data on our servers. Everything you say, every file you ingest, and every workspace you create is stored locally on your device. We use Vercel simply as a bridge to securely connect you to the GitHub Copilot network.
            </p>
          </section>

          <section>
            <h2 className="text-white/60 uppercase tracking-widest text-xs mb-4">Local Storage (IndexedDB)</h2>
            <p className="text-white/40 leading-relaxed mb-4">
              SERVE acts as a "Local-First" application. This means:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-white/40 leading-relaxed">
              <li>Your conversations are saved directly to your browser's IndexedDB.</li>
              <li>Your ingested files and their semantic embeddings are processed and stored locally.</li>
              <li>Your authentication tokens are saved in your browser's Local Storage.</li>
            </ul>
            <p className="text-white/40 leading-relaxed mt-4 italic">
              Because data is tied to your specific browser profile, if you clear your browsing data or use incognito mode, your memories will be wiped.
            </p>
          </section>

          <section>
            <h2 className="text-white/60 uppercase tracking-widest text-xs mb-4">Third-Party Subprocessors</h2>
            <p className="text-white/40 leading-relaxed mb-4">
              To actually generate responses, your prompts must be sent to AI providers. When you submit a message, it is transmitted through our secure proxy to:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-white/40 leading-relaxed">
              <li><strong className="text-white/60 font-medium">GitHub Copilot:</strong> For processing chat completions utilizing models like GPT-4 and Claude 3.5 Sonnet. Their data retention policies apply.</li>
              <li><strong className="text-white/60 font-medium">Vercel:</strong> Our hosting provider acts as a middleman for API routing. They do not store the contents of your chat payloads.</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-white/60 uppercase tracking-widest text-xs mb-4">Telemetry & Tracking</h2>
            <p className="text-white/40 leading-relaxed">
              SERVE fundamentally rejects unnecessary tracking. We do not use Google Analytics, Meta Pixel, or any behavioral tracking software. We collect zero product telemetry.
            </p>
          </section>

          <div className="pt-12 border-t border-white/5 text-xs text-white/20">
            Last Updated: April 2026
          </div>
        </div>
      </div>
    </div>
  );
}
