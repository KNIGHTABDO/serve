# SERVE

**Not an assistant. A presence.**

SERVE is an anti-utility AI interface designed for deep, unstructured, local-first reflection. It abandons the sterile chat-bubble paradigm for an atmospheric, cinematic, and deeply contextual environment.

Originally built as an experimental Tauri Desktop App, **SERVE 3.0** has been completely reimagined as a fully client-side Web Application powered by Next.js and IndexedDB.

![SERVE Interface Screenshot](https://raw.githubusercontent.com/KNIGHTABDO/serve/main/public/logo.png)

## Core Philosophy

1. **It reads the margins.** The system weaves fragments of your past conversations together (via local ONNX semantic searches) transparently.
2. **It remembers locally.** There are no centralized cloud databases logging your secrets. Your conversations and workspace groundings never leave your personal browser profile (via IndexedDB).
3. **It sets the tone.** Featuring procedural audio soundscapes (Web Audio API) and motion-heavy interfaces, SERVE brings weight to the conversation.

## Tech Stack (Web Era)

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind CSS + Framer Motion
- **Intelligence Engine:** GitHub Copilot (Device Flow Auth)
- **Local Database:** Dexie.js (IndexedDB wrapper)
- **Semantic Engine:** `@xenova/transformers` (Local ONNX execution in-browser)
- **Infrastructure:** Vercel (Routing + API Proxy limits to avoid CORS)

## Setup & Deployment

Because SERVE operates securely and runs fully in your browser, setting it up involves running the local development server or deploying to a cloud host.

### Prerequisites

- Node.js version 20+
- An active GitHub Copilot subscription (for Device Code auth).

### Running Locally

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Visit `http://localhost:3000`. Your browser will initiate the IndexedDB schemas automatically on visit.

### Deploying to Vercel

SERVE is fully configured to deploy automatically via Vercel.

1. Fork or push this repository to your GitHub account.
2. Log into [Vercel](https://vercel.com/) and create a new project.
3. Select your `serve` repository.
4. Keep the default settings (Framework Preset: Next.js).
5. Click **Deploy**.

*Note: Since there are no external databases required, there are ZERO Environment Variables needed during deployment!*

## Advanced Features

### The Reliquary (Artifacts)
When SERVE detects crystallized intelligence or thematic resolutions, it produces *Artifacts* utilizing structural markdown patterns. These are permanently saved into "The Reliquary" for easy citation.

### Dynamic Grounding
Tired of copying text blocks? Open the right-side panel ("The Ground") and drop in entire source code directories. SERVE embeds up to thousands of files directly into your browser's local vector index.

### Atmospheric Audio
Powered dynamically by the Web Audio API, the UI physically responds when the LLM begins "thinking" with subtle synthesized low-pass sweeps. Use the settings menu (Ctrl+,) to toggle resonance on/off.

---

*SERVE 2026. Made with profound intent.*
