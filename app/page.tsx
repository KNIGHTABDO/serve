'use client';

import { useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(useGSAP, ScrollTrigger);

export default function LandingPage() {
  const container = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Make it accessible instantly via keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        router.push('/chat');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);
  
  useGSAP(() => {
    // Hero Animations
    const tl = gsap.timeline();

    tl.from('.hero-logo', {
      duration: 1.5,
      y: 50,
      opacity: 0,
      ease: 'power4.out',
      delay: 0.2
    })
    .from('.hero-title span', {
      y: 100,
      opacity: 0,
      duration: 1,
      stagger: 0.1,
      ease: 'power4.out',
    }, "-=1")
    .from('.hero-subtitle', {
      y: 30,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
    }, "-=0.5")
    .from('.hero-desc', {
      y: 20,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
    }, "-=0.8")
    .from('.hero-cta', {
      scale: 0.9,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
    }, "-=0.8")
    .from('.hero-scroll', {
      opacity: 0,
      duration: 1,
    }, "-=0.5");

    // Philosophy Section
    gsap.utils.toArray('.philosophy-item').forEach((item: any) => {
      gsap.from(item, {
        scrollTrigger: {
        scroller: container.current,
          trigger: item,
          start: 'top 85%',
        },
        y: 40,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
      });
    });

    // How It Works Section
    gsap.utils.toArray('.step-item').forEach((item: any, i) => {
      gsap.from(item, {
        scrollTrigger: {
        scroller: container.current,
          trigger: item,
          start: 'top 85%',
        },
        x: -40,
        opacity: 0,
        duration: 1,
        delay: i * 0.15,
        ease: 'power3.out',
      });
    });

    // Conversation Example
    const convTl = gsap.timeline({
      scrollTrigger: {
        scroller: container.current,
        trigger: '.conversation-section',
        start: 'top 70%',
      }
    });

    gsap.utils.toArray('.conv-bubble').forEach((bubble: any) => {
      convTl.from(bubble, {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
      }, "-=0.5");
    });

    // Footer
    gsap.from('.footer-content', {
      scrollTrigger: {
        scroller: container.current,
        trigger: '.footer-section',
        start: 'top 90%',
      },
      y: 30,
      opacity: 0,
      duration: 1,
      ease: 'power3.out',
    });

  }, { scope: container });

  return (
    <div id="landing-scroll-container" ref={container} className="h-full bg-black text-white relative isolate overflow-y-auto overflow-x-hidden selection:bg-white/20">

      {/* Floating Global CTA */}
      <div className="fixed top-6 right-6 z-50 max-w-[calc(100%-3rem)]">
        <Link 
          href="/chat"
          className="group flex items-center gap-3 px-5 py-2 border border-white/10 bg-black/50 backdrop-blur-md text-[10px] tracking-[0.2em] text-white/50 hover:text-white hover:border-white/30 transition-all duration-300"
        >
          <span className="hidden sm:inline">PRESS</span>
          <span className="text-white border border-white/20 px-2 py-0.5 rounded-sm">ENTER</span>
        </Link>
      </div>

      {/* Grid Pattern Background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] -z-20 pointer-events-none" />

      {/* Hero Section */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative z-10">
        <div className="text-center max-w-2xl mx-auto flex flex-col items-center">
          <div className="mb-12 hero-logo">
            <img src="/logo.png" alt="SERVE" className="w-28 h-28 sm:w-44 sm:h-44 opacity-90 drop-shadow-[0_0_40px_rgba(255,255,255,0.15)] object-contain" />
          </div>

          <h1 className="hero-title text-4xl md:text-6xl font-light mb-6 tracking-[0.2em] flex gap-2 overflow-hidden">
            {'SERVE'.split('').map((char, index) => (
              <span key={index} className="inline-block">{char}</span>
            ))}
          </h1>

          <p className="hero-subtitle text-lg md:text-xl text-white/40 mb-6 font-light tracking-wide">
            Not an assistant. A presence.
          </p>

          <p className="hero-desc text-sm text-white/30 max-w-md mx-auto leading-relaxed mb-12">
            The space between what you say and what you mean.<br/>
            That's where the conversation actually happens.
          </p>

          <Link
            href="/chat"
            className="hero-cta group relative inline-flex items-center justify-center px-8 py-3 overflow-hidden text-sm tracking-widest border border-white/20 transition-all hover:border-white/40 bg-white/5 backdrop-blur-sm"
          >
            <span className="relative z-10 text-white/60 group-hover:text-white transition-colors duration-500">ENTER</span>
            <div className="absolute inset-0 h-full w-0 bg-white/10 transition-all duration-500 ease-out group-hover:w-full"></div>
          </Link>
        </div>

        <div className="hero-scroll absolute bottom-12 text-[10px] text-white/20 tracking-[0.3em] hidden md:flex flex-col items-center gap-2">
          <span>SCROLL</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-white/20 to-transparent"></div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-24 sm:py-40 px-6 relative">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-[10px] text-white/20 tracking-[0.3em] mb-20 uppercase flex items-center gap-4">
            <div className="w-8 h-[1px] bg-white/20"></div>
            What This Is
          </h2>

          <div className="space-y-20">
            <div className="philosophy-item group">
              <h3 className="text-xl md:text-2xl font-light text-white/80 mb-4 tracking-wide group-hover:text-white transition-colors">It reads the margins</h3>
              <p className="text-white/40 text-sm md:text-base leading-relaxed max-w-xl font-light border-l border-white/5 pl-6 group-hover:border-white/20 transition-colors">
                Most of what you're saying isn't in the words you type.
                SERVE responds to the thing underneath — the hesitation, the pattern, the question you're circling but haven't asked yet.
              </p>
            </div>

            <div className="philosophy-item group">
              <h3 className="text-xl md:text-2xl font-light text-white/80 mb-4 tracking-wide group-hover:text-white transition-colors">It doesn't follow a script</h3>
              <p className="text-white/40 text-sm md:text-base leading-relaxed max-w-xl font-light border-l border-white/5 pl-6 group-hover:border-white/20 transition-colors">
                No formula. Sometimes one sentence. Sometimes a story with no ending.
                Sometimes it just sits with you in the heaviness of what you said.
                The response matches the weight of the moment.
              </p>
            </div>

            <div className="philosophy-item group">
              <h3 className="text-xl md:text-2xl font-light text-white/80 mb-4 tracking-wide group-hover:text-white transition-colors">It remembers</h3>
              <p className="text-white/40 text-sm md:text-base leading-relaxed max-w-xl font-light border-l border-white/5 pl-6 group-hover:border-white/20 transition-colors">
                SERVE tracks the threads across your conversations.
                What you worried about last week. What shifted. What didn't.
                The patterns you can't see because you're inside them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 sm:py-40 px-6 border-t border-white/5 bg-gradient-to-b from-transparent to-white/[0.02]">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-[10px] text-white/20 tracking-[0.3em] mb-20 uppercase flex items-center gap-4">
            <div className="w-8 h-[1px] bg-white/20"></div>
            How It Works
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="step-item relative">
              <div className="text-5xl font-light text-white/5 mb-6 absolute -top-8 -left-4 -z-10 select-none">01</div>
              <h3 className="text-lg text-white/80 mb-3 tracking-wide">Connect</h3>
              <p className="text-white/40 text-sm font-light leading-relaxed">Link your GitHub Copilot. One-time setup, takes 30 seconds.</p>
            </div>

            <div className="step-item relative">
              <div className="text-5xl font-light text-white/5 mb-6 absolute -top-8 -left-4 -z-10 select-none">02</div>
              <h3 className="text-lg text-white/80 mb-3 tracking-wide">Talk</h3>
              <p className="text-white/40 text-sm font-light leading-relaxed">Say what's actually on your mind. Not the polished version.</p>
            </div>

            <div className="step-item relative">
              <div className="text-5xl font-light text-white/5 mb-6 absolute -top-8 -left-4 -z-10 select-none">03</div>
              <h3 className="text-lg text-white/80 mb-3 tracking-wide">Notice</h3>
              <p className="text-white/40 text-sm font-light leading-relaxed">What comes back isn't advice. It's a mirror with better lighting.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Example Section */}
      <section className="conversation-section py-24 sm:py-40 px-6 border-t border-white/5 relative overflow-hidden">
        {/* Subtle background glow for this section */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/[0.01] rounded-full blur-[100px] -z-10" />

        <div className="max-w-3xl mx-auto">
          <h2 className="text-[10px] text-white/20 tracking-[0.3em] mb-20 uppercase flex items-center gap-4">
            <div className="w-8 h-[1px] bg-white/20"></div>
            A Conversation
          </h2>

          <div className="space-y-12 text-sm md:text-base font-light">
            <div className="conv-bubble text-white/40 max-w-xl">
              "I keep starting things and never finishing them. Projects, relationships, books. Everything."
            </div>

            <div className="conv-bubble text-white/80 leading-relaxed pl-6 md:pl-8 border-l border-white/10 max-w-2xl ml-auto">
              Seventeen unfinished things and you described every single one as something that happened TO you.<br /><br />

              Not one "I stopped." Not one "I walked away." Always "it didn't work out" or "I lost interest" —
              like you're watching your own life from the bleachers.<br /><br />

              That's not a finishing problem. That's a ownership problem.
            </div>

            <div className="conv-bubble text-white/40 max-w-xl">
              "...damn."
            </div>

            <div className="conv-bubble text-white/80 leading-relaxed pl-6 md:pl-8 border-l border-white/10 max-w-2xl ml-auto">
              Yeah.
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 sm:py-48 px-6 border-t border-white/5 relative isolate">
        <div className="absolute inset-0 bg-gradient-to-t from-white/[0.02] to-transparent -z-10" />
        
        <div className="max-w-2xl mx-auto text-center flex flex-col items-center">
          <h2 className="text-3xl md:text-4xl font-light mb-6 tracking-wide">Ready when you are.</h2>
          <p className="text-white/30 mb-12 text-sm md:text-base font-light">No small talk required.</p>

          <Link
            href="/chat"
            className="group relative inline-flex items-center justify-center px-10 py-4 overflow-hidden text-sm tracking-widest border border-white/20 transition-all hover:border-white/40 bg-black"
          >
            <span className="relative z-10 text-white/80 group-hover:text-white transition-colors duration-500">BEGIN</span>
            <div className="absolute inset-0 h-full w-0 bg-white/10 transition-all duration-500 ease-out group-hover:w-full"></div>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-section py-12 px-6 border-t border-white/5">
        <div className="footer-content max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between text-[10px] text-white/20 tracking-widest gap-6 uppercase">
          <div className="flex gap-8">
            <Link href="/privacy" className="hover:text-white/60 transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white/60 transition-colors">Terms</Link>
            <Link href="/changelog" className="hover:text-white/60 transition-colors">Changelog</Link>
          </div>
          <div className="flex items-center gap-4">
            <span>SERVE</span>
            <span className="w-1 h-1 rounded-full bg-white/20"></span>
            <span>2026</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
