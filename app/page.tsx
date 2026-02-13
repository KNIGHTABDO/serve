'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="h-full bg-black text-white overflow-y-auto relative isolate">
      {/* Video Background */}
      <video
        autoPlay
        muted
        playsInline
        onEnded={(e) => {
          const video = e.currentTarget;
          video.currentTime = 3; // Skip the first 3 seconds (logo intro) on loop
          video.play().catch(() => { }); // Ignore AbortError from browser power saving
        }}
        className="fixed inset-0 w-full h-full object-cover -z-20 opacity-80"
      >
        <source src="/IMG_7957.MP4" type="video/mp4" />
      </video>
      <div className="fixed inset-0 bg-black/70 -z-10" />

      {/* Hero Section */}
      <div className="min-h-full flex flex-col items-center justify-center px-6 py-12 relative z-10">
        <div className="text-center max-w-2xl mx-auto">
          <div className="mb-8 flex justify-center">
            <img src="/logo.png" alt="SERVE" className="w-24 h-24 opacity-80" />
          </div>

          <h1 className="text-3xl md:text-4xl font-light mb-6 tracking-wide">
            SERVE
          </h1>

          <p className="text-lg md:text-xl text-white/40 mb-4 font-light">
            AI that sees patterns
          </p>

          <p className="text-sm text-white/30 max-w-md mx-auto leading-relaxed mb-12">
            A quiet space for conversations that matter.
            Pattern recognition, parables, and the hard questions beneath the surface.
          </p>

          <Link
            href="/chat"
            className="inline-block px-8 py-3 border border-white/20 text-sm tracking-wider text-white/60 hover:text-white hover:border-white/40 transition-all"
          >
            ENTER
          </Link>
        </div>

        <div className="absolute bottom-8 text-xs text-white/20 tracking-widest hidden md:block">
          SCROLL
        </div>
      </div>

      {/* Philosophy Section */}
      <div className="py-32 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xs text-white/20 tracking-widest mb-12 uppercase">The Approach</h2>

          <div className="space-y-8">
            <div>
              <h3 className="text-white/60 mb-2">Pattern Recognition</h3>
              <p className="text-white/30 text-sm leading-relaxed">
                SERVE notices what you're really asking. Three questions, three framings of the same uncertainty.
                The pattern beneath the surface.
              </p>
            </div>

            <div>
              <h3 className="text-white/60 mb-2">The Reframe</h3>
              <p className="text-white/30 text-sm leading-relaxed">
                "You're not a failure. You're someone trying things and watching them not work. That's different."
                Turning your story on its head, gently.
              </p>
            </div>

            <div>
              <h3 className="text-white/60 mb-2">The Hard Question</h3>
              <p className="text-white/30 text-sm leading-relaxed">
                Not "How do I fix this?" but "What are you actually afraid of finding out?"
                Questions that open doors.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-32 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xs text-white/20 tracking-widest mb-12 uppercase">How It Works</h2>

          <div className="space-y-6">
            <div className="flex gap-6">
              <span className="text-white/20 text-sm">01</span>
              <div>
                <h3 className="text-white/60 mb-1">Connect</h3>
                <p className="text-white/30 text-sm">Sign in with your GitHub account. SERVE uses GitHub Copilot's API.</p>
              </div>
            </div>

            <div className="flex gap-6">
              <span className="text-white/20 text-sm">02</span>
              <div>
                <h3 className="text-white/60 mb-1">Speak</h3>
                <p className="text-white/30 text-sm">Ask anything. The real question, not the safe version.</p>
              </div>
            </div>

            <div className="flex gap-6">
              <span className="text-white/20 text-sm">03</span>
              <div>
                <h3 className="text-white/60 mb-1">Listen</h3>
                <p className="text-white/30 text-sm">Pattern recognition. Parables. The question beneath.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Example Section */}
      <div className="py-32 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xs text-white/20 tracking-widest mb-12 uppercase">An Example</h2>

          <div className="space-y-6 text-sm">
            <div className="text-white/40">
              "What should I do with my life? I'm 25 and feel completely lost."
            </div>

            <div className="text-white/80 leading-relaxed pl-4 border-l border-white/10">
              You're 25. Lost is on schedule.<br /><br />

              There's a monk who swept the same temple courtyard for decades. A visitor asked what he'd learned.
              He said: "The broom doesn't care what I become."<br /><br />

              The pressure to have it figured out, that's the trap. You're treating "what should I do with my life"
              like a test you're failing instead of a question that keeps changing its answer.<br /><br />

              What have you been doing that made you forget to ask this question?
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-32 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-light mb-4">What brings you here?</h2>
          <p className="text-white/30 mb-8 text-sm">The conversation starts when you're ready.</p>

          <Link
            href="/chat"
            className="inline-block px-8 py-3 border border-white/20 text-sm tracking-wider text-white/60 hover:text-white hover:border-white/40 transition-all"
          >
            BEGIN
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="py-12 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto flex items-center justify-between text-xs text-white/20">
          <span>SERVE</span>
          <span>2025</span>
        </div>
      </div>
    </div>
  );
}
