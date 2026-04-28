<div align="center">

<img src="public/logo.png" alt="SERVE" width="120" />

# SERVE

**Not an assistant. A presence.**

A quiet space for conversations that matter.

[Overview](#overview) · [Features](#features) · [Architecture](#architecture) · [Installation](#installation) · [Philosophy](#philosophy)

</div>

---

## Overview

SERVE is an **anti-utility AI interface** designed for deep, unstructured, local-first reflection. It abandons the sterile chat-bubble paradigm for an atmospheric, cinematic, and deeply contextual environment.

Originally built as an experimental Tauri Desktop App, **SERVE 3.0** has been completely reimagined as a fully client-side Web Application powered by Next.js and IndexedDB.

> *"SERVE speaks with earned authority — pattern recognition, parables, and the hard questions beneath the surface."*

### Why SERVE exists

Most AI interfaces are built like productivity tools. SERVE is built like a room — somber, warm, and designed for the kind of thinking that happens in the dark, with a window cracked.

- **It reads the margins.** Transparently weaves fragments of your past conversations together via local semantic search.
- **It remembers locally.** No centralized cloud databases. Your conversations and workspace groundings never leave your personal browser profile.
- **It sets the tone.** Procedural audio soundscapes, motion-heavy interfaces, and an entire language of absence and presence.

---

## Features

### Core Experience

| Feature | Description |
|--------|-------------|
| **Local Semantic Memory** | `@xenova/transformers` ONNX embeddings run entirely in-browser. Search thousands of past messages and documents without sending data to any server. |
| **Dynamic Grounding** | Open *The Ground* — drop entire source code directories, and SERVE indexes them into a local vector store. |
| **The Reliquary (Artifacts)** | Detects crystallized intelligence and thematic resolutions, producing permanent *Artifacts* from structural markdown patterns. |
| **Persona Engine** | Multiple conversation modes — from the Dead Author Pattern (introverts, professionals) to Chaos Mode (fleeing interesting). |
| **Copilot Integration** | Authenticates via GitHub Device Flow, streaming from Copilot's LLM with zero backend state. |

### Atmospheric Systems *(New in 3.1)*

| System | Behavior |
|--------|----------|
| **The Silence Between** | Time gaps between messages become poetry — `—`, "Later.", "Three days passed." |
| **Poetic Time** | Stamps dissolve into atmosphere words: *blue hour*, *the hollow*, *deep afternoon*. |
| **Threshold States** | The `...` loading indicator is replaced: *attending → holding → listening → formulating → weighing → returning*. |
| **Seasonal Atmosphere** | Background subtly shifts temperature through the day — indigo-black at midnight, amber charcoal at dusk. |
| **The Clearing** | Fullscreen black ritual pause. One breathing white circle. No text. |
| **Ephemeral Mode** | Messages fade over three minutes. Only what crystallizes persists. |
| **The Weight** | Your input field glows brighter when your words carry grief, fear, despair. |
| **The Margins** | Double-click any word. Whisper a private annotation in the margin — your notes, invisible to the model. |
| **The Echo** | Strips your voice. Only SERVE's responses remain — spaced like a prose poem. |
| **The Discipline** | Soft constraints: One Sentence mode, or 140 characters. Visual constriction builds creative pressure. |
| **Farewell** | Close the tab. Over two seconds: desaturation, grey, one word: *"Here."* |

### Interaction Design

- **Selection Menu** — Highlight any text. Instant summarize, rewrite, argue, verify.
- **Focus Mode** — All chrome collapses. Full-screen, text-white-on-black, scrollbar-hidden.
- **TTS Narration** — Messages read aloud. Streaming voice with interrupt support.
- **Quote & Reply** — Reference any past message up-thread.
- **Branching Conversations** — Reply from any turning point, not just the end.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         SERVE 3.1.0                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐  │
│  │   Next.js 16 │    │  Tailwind v4 │    │  Framer Motion /     │  │
│  │  App Router  │    │  Typography  │    │  GSAP Animations     │  │
│  └──────────────┘    └──────────────┘    └──────────────────────┘  │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                    Client-Side Intelligence                   │   │
│  │  ┌──────────┐  ┌──────────────┐  ┌──────────────────────┐  │   │
│  │  │  Dexie   │  │ @xenova/     │  │  Copilot Device Flow │  │   │
│  │  │  (IDB)   │  │ transformers │  │  Stream via API Proxy│  │   │
│  │  │Conversations│  │ Embeddings  │  │                      │  │   │
│  │  │ Artifacts │  │Vector Search │  │                      │  │   │
│  │  │  Ground   │  │              │  │                      │  │   │
│  │  └──────────┘  └──────────────┘  └──────────────────────┘  │   │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────┐    │
│  │                    Atmospheric Engine                         │   │
│  │  silence.ts  ·  poetic-time.ts  ·  atmosphere.ts               │   │
│  │  ephemeral.ts  ·  weight.ts  ·  discipline.ts                  │   │
│  │  TheClearing · TheEcho · TheMargins · ThresholdStates           │   │
│  └────────────────────────────────────────────────────────────┘    │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Framework | **Next.js 16** (App Router) | Routing, SSR, API proxy |
| Language | **TypeScript 5** | Type safety throughout |
| Styling | **Tailwind CSS v4** + Typography plugin | Utility-first CSS |
| Animation | **Framer Motion** + **GSAP** | UI orchestration |
| Intelligence | **GitHub Copilot** (Device Flow) | Streaming LLM integration |
| Local DB | **Dexie.js** (IndexedDB) | Conversations, embeddings, artifacts |
| Embedding | **@xenova/transformers** | Local ONNX semantic search in-browser |
| Icons | **Lucide React** | Consistent icon system |
| Build | **Vercel** | Zero-config deployment |

---

## Installation

### Prerequisites

- Node.js 20+ (LTS recommended)
- An active GitHub Copilot subscription (required for authentication)

### Local Development

```bash
# Clone the repository
git clone https://github.com/knightabdo/serve.git
cd serve

# Install dependencies
npm install

# Run the development server
npm run dev
```

Visit `http://localhost:3000`. IndexedDB schemas initialize automatically on first load.

### Production Build

```bash
npm run build
npm run start
```

### Deploy to Vercel

SERVE deploys to Vercel with zero configuration.

1. Fork or push this repository to your GitHub account.
2. Create a new project on [Vercel](https://vercel.com/).
3. Select your `serve` repository.
4. Framework preset: **Next.js** (default).
5. Deploy.

> **No environment variables required.** SERVE is entirely client-side and self-contained.

---

## Project Structure

```
serve/
├── app/
│   ├── api/                    # API routes (auth, chat, title, models)
│   ├── components/             # Shared UI components
│   │   ├── aesthetics/         # Atmospheric system components
│   │   │   ├── SilenceBetween.tsx
│   │   │   ├── ThresholdStates.tsx
│   │   │   ├── TheClearing.tsx
│   │   │   ├── TheEcho.tsx
│   │   │   ├── TheMargins.tsx
│   │   │   └── Farewell.tsx
│   │   ├── AtmosphereLayer.tsx
│   │   ├── AuthModal.tsx
│   │   └── TitleBar.tsx
│   ├── chat/                   # Main conversation interface
│   ├── changelog/              # Release history
│   ├── privacy/                # Privacy policy
│   ├── terms/                  # Terms of service
│   ├── globals.css             # Tailwind + atmosphere utilities
│   ├── layout.tsx              # Root layout with atmosphere layer
│   └── page.tsx                # Landing page
├── lib/
│   ├── aesthetics/             # Atmospheric system logic
│   │   ├── silence.ts
│   │   ├── poetic-time.ts
│   │   ├── atmosphere.ts
│   │   ├── ephemeral.ts
│   │   ├── weight.ts
│   │   ├── discipline.ts
│   │   └── index.ts
│   ├── audio.ts                # Web Audio API procedural soundscapes
│   ├── auth.ts                 # Device Flow authentication
│   ├── chat.ts                 # Streaming chat helpers
│   ├── db.ts                   # IndexedDB schema (Dexie)
│   ├── embeddings.ts           # ONNX semantic search
│   ├── fs.ts                   # Directory ingest & file processing
│   ├── personas.ts             # Conversation mode definitions
│   └── utils.ts                # Shared utilities
├── public/
│   └── logo.png                # Brand asset
├── next.config.ts              # Next.js configuration
├── package.json
└── tsconfig.json
```

---

## Philosophy

### Design Principles

1. **Local-First or Die** — No data leaves the browser unless *you* initiate it. IndexedDB holds everything: conversations, groundings, embeddings, artifacts,annotations.

2. **Transparency, Not Black Boxes** — When SERVE recalls something from memory, you see it. Grounded content is visually indicated. The system never pretends to know.

3. **Atmosphere Over Interface** — Chat is a room, not a tool. Every animation, silence, and margin serves the feeling of being *met* rather than *served*.

4. **Crystallization Over Accumulation** — Not everything is worth remembering. Ephemeral mode lets noise pass. Only what resonates becomes an Artifact in the Reliquary.

5. **Presence in Absence** — The most important feature might be what is *not* there. Hidden timestamps. Invisible margins. The breathing pause between speech.

---

## License

SERVE is released under the **MIT License**.

We believe tools for deep thinking should belong to everyone.

---

<div align="center">

**SERVE 2026** — Built with profound intent.

</div>
