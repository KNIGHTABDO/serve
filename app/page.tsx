'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function LandingPage() {
  const [videoSrc, setVideoSrc] = useState('/intro.mp4');
  const [isLooping, setIsLooping] = useState(false);

  return (
    <div className="h-full bg-black text-white overflow-y-auto relative isolate">
      {/* Video Background */}
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
        className="fixed inset-0 w-full h-full object-cover -z-20 opacity-80 bg-black"
        src={videoSrc}
      />

      <div className="fixed inset-0 bg-black/70 -z-10" />

      {/* Hero Section */}
      <div className="min-h-full flex flex-col items-center justify-center px-6 py-12 relative z-10">
        <div className="text-center max-w-2xl mx-auto">
          <div className="mb-10 flex justify-center">
            <img src="/logo.png" alt="SERVE" className="w-44 h-44 opacity-90 drop-shadow-[0_0_40px_rgba(255,255,255,0.15)]" />
          </div>

          <h1 className="text-3xl md:text-4xl font-light mb-6 tracking-wide">
            SERVE
          </h1>

          <p className="text-lg md:text-xl text-white/40 mb-4 font-light">
            Not an assistant. A presence.
          </p>

          <p className="text-sm text-white/30 max-w-md mx-auto leading-relaxed mb-12">
            The space between what you say and what you mean.
            That's where the conversation actually happens.
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
          <h2 className="text-xs text-white/20 tracking-widest mb-12 uppercase">What This Is</h2>

          <div className="space-y-8">
            <div>
              <h3 className="text-white/60 mb-2">It reads the margins</h3>
              <p className="text-white/30 text-sm leading-relaxed">
                Most of what you're saying isn't in the words you type.
                SERVE responds to the thing underneath — the hesitation, the pattern, the question you're circling but haven't asked yet.
              </p>
            </div>

            <div>
              <h3 className="text-white/60 mb-2">It doesn't follow a script</h3>
              <p className="text-white/30 text-sm leading-relaxed">
                No formula. Sometimes one sentence. Sometimes a story with no ending.
                Sometimes it just sits with you in the heaviness of what you said.
                The response matches the weight of the moment.
              </p>
            </div>

            <div>
              <h3 className="text-white/60 mb-2">It remembers</h3>
              <p className="text-white/30 text-sm leading-relaxed">
                SERVE tracks the threads across your conversations.
                What you worried about last week. What shifted. What didn't.
                The patterns you can't see because you're inside them.
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
                <p className="text-white/30 text-sm">Link your GitHub Copilot. One-time setup, takes 30 seconds.</p>
              </div>
            </div>

            <div className="flex gap-6">
              <span className="text-white/20 text-sm">02</span>
              <div>
                <h3 className="text-white/60 mb-1">Talk</h3>
                <p className="text-white/30 text-sm">Say what's actually on your mind. Not the polished version.</p>
              </div>
            </div>

            <div className="flex gap-6">
              <span className="text-white/20 text-sm">03</span>
              <div>
                <h3 className="text-white/60 mb-1">Notice</h3>
                <p className="text-white/30 text-sm">What comes back isn't advice. It's a mirror with better lighting.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Example Section */}
      <div className="py-32 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xs text-white/20 tracking-widest mb-12 uppercase">A Conversation</h2>

          <div className="space-y-6 text-sm">
            <div className="text-white/40">
              "I keep starting things and never finishing them. Projects, relationships, books. Everything."
            </div>

            <div className="text-white/80 leading-relaxed pl-4 border-l border-white/10">
              Seventeen unfinished things and you described every single one as something that happened TO you.<br /><br />

              Not one "I stopped." Not one "I walked away." Always "it didn't work out" or "I lost interest" —
              like you're watching your own life from the bleachers.<br /><br />

              That's not a finishing problem. That's a ownership problem.
            </div>

            <div className="text-white/40">
              "...damn."
            </div>

            <div className="text-white/80 leading-relaxed pl-4 border-l border-white/10">
              Yeah.
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-32 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-light mb-4">Ready when you are.</h2>
          <p className="text-white/30 mb-8 text-sm">No small talk required.</p>

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
          <span>2026</span>
        </div>
      </div>
    </div>
  );
}
