# SERVE v2.2.0 — Release Notes

**Release Date:** February 15, 2026

---

## ✨ The Pattern Recognition Update

This release transforms SERVE from a chat interface into a true instrument for thought. It introduces a suite of features designed to help you see, capture, and weave patterns across your conversations.

### 🌟 The Reliquary (Artifacts)
- **Crystallized Insights:** When the AI identifies a profound truth or parable, it now "crystallizes" it into a sleek, silver-bordered card in the chat.
- **The Archive:** Click any artifact to open **The Reliquary**—a cinematic side-panel that stores your most important insights, separate from the chat stream.
- **Motion Design:** Features a heavy, motion-blurred entrance animation that gives weight to your ideas.

### 🧶 The Loom (Thematic Memory)
- **Thematic Pivot:** The memory system now scans your history for "conceptual anchors" rather than just keywords. It finds threads that resonate with the *meaning* of your current thought.
- **Visual Indicator:** A subtle "History" icon appears next to AI responses when they are weaving in threads from past conversations.

### 👁️ The Lens (Field Study)
- **Local Context:** Drag and drop text files (`.txt`, `.md`) into the input area using the new **File** icon.
- **Grounding:** The AI digests this local context and uses it as the "ground" for your conversation, allowing for deep, project-aware analysis.

### 🔊 Resonance (Ambient Audio)
- **Procedural Soundscape:** A living, breathing audio engine generated live in your browser (no loops).
- **Reactive:** The sound shifts based on the AI's state—a deep drone when idle, a silver shimmer when thinking.
- **Toggle:** Activate "Ambient Resonance" in Settings (Ctrl+,).

### ✨ Focus (Selection Menu)
- **Contextual Quoting:** Select any text in the chat to reveal the sleek **Focus** menu.
- **Quote Bar:** Adds the selection to a dedicated quote bar above your input, allowing you to ask specific questions about past statements without clutter.
- **Clean UI:** No more generic AI emojis. Just clean, functional iconography.

### 🎬 Cinematic Background
- **New Sequence:** Updated the landing and loading experience with a seamless two-stage video sequence (Intro -> Infinite Loop).
- **Engine:** Rewritten video handling for perfect looping and transition handling.

### 🛠️ Technical
- **Dynamic Imports:** Optimized heavy libraries (Embeddings/ONNX) to load only when needed, significantly improving startup time and stability.
- **Robust Markdown:** Fixed artifact detection to handle variable whitespace and formatting.
- **Database Schema:** Updated local SQLite schema to support new embedding and workspace features.

---

## [2.1.0] - 2026-02-12


### 🔄 Auto-Updater
SERVE now updates itself automatically. When a new version is released, the app will download and install it for you. You never have to manually check for updates again.

### 🧠 Conversation Memory
SERVE remembers across conversations. It pulls context from your last 5 chats and weaves it in naturally — noticing patterns, tracking threads, referencing past exchanges without announcing "I remember."

### 🎭 Persona System
Four distinct voices, selectable before each conversation:

| Persona | Vibe |
|---------|------|
| **SERVE** | Presence, gravity, variable style — the default |
| **ORACLE** | Cryptic and poetic. Few words, maximum weight |
| **MIRROR** | Pure reflection. Restructures your own words back at you |
| **RAW** | No filter, no cushion. Says what nobody else will |

Persona selector appears as pills above the input and disappears after the first message.

### ⌨️ Variable Typing Rhythm
Responses arrive with human-like pacing — pauses after sentences, longer gaps at paragraph breaks, faster for flowing text.

### 🔍 Search Conversations
`Ctrl+K` opens a search bar in the sidebar. Searches titles and message content.

### ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+N` | New chat |
| `Ctrl+B` | Toggle sidebar |
| `Ctrl+K` | Search conversations |
| `Ctrl+,` | Settings |
| `Ctrl+Shift+E` | Export current conversation |
| `/` | Focus input |

### 📥 Export Conversations
Download any conversation as a `.md` markdown file via the toolbar button or `Ctrl+Shift+E`.

### 🏷️ Smart Auto-Generated Titles
After the first exchange, SERVE asks the AI for a concise 3–5 word title that captures the essence, not just the surface topic.

### 🕐 Message Timestamps
Relative timestamps ("2h ago", "3d ago") on every message and in the sidebar conversation list.

### 🎬 Cinematic Video Background
Full-screen looping video on the landing page and loading screen. Smart looping skips the intro on replay.

### ♾️ New Brand Identity
Premium dark-to-silver metallic infinity logo, applied across landing, loading, and title bar.

### 🤖 Updated AI Models
Models are now **dynamically fetched** from your GitHub Copilot subscription. This means as soon as GitHub adds new models (like o3-mini or future GPT-5 versions), they will arguably appear in SERVE without needing an app update.

Fallbacks include:
| Model | Provider |
|-------|----------|
| GPT-4o | OpenAI |
| Claude 3.5 Sonnet | Anthropic |
| o1-preview | OpenAI |
| o1-mini | OpenAI |

### 🎨 Refined Empty State
Minimal ◈ symbol instead of placeholder text. Rotating input placeholders cycle through prompts like *"What are you avoiding?"* and *"Start anywhere."*

### 🔊 Ambient Audio (Coming Soon)
Placeholder in settings — ready for a future update.

---

## 🔧 Technical Changes

| Area | Change |
|------|--------|
| `lib/personas.ts` | **[NEW]** 4 persona definitions with full system prompts |
| `lib/tauri/chat.ts` | Memory injection, persona support, `generateTitle` |
| `lib/tauri/db.ts` | `searchConversations`, `getRecentContext`, `exportConversation` |
| `lib/tauri/auth.ts` | Updated model list to 6 current models |
| `lib/tauri/env.ts` | **[NEW]** Tauri runtime detection utility |
| `app/chat/page.tsx` | Full rewrite — all new features |
| `app/page.tsx` | Video background, new logo, persona landing page |
| `app/loading.tsx` | Video background, larger logo |
| `app/components/TitleBar.tsx` | Updated logo reference |
| `public/` | Cleaned up 7 leftover boilerplate files |

---

## 📦 Installation

| Platform | File |
|----------|------|
| Windows (recommended) | `SERVE_2.0.0_x64-setup.exe` |
| Windows (MSI) | `SERVE_2.0.0_x64_en-US.msi` |

---

## 🚀 How to Install

1. Download the installer from Releases
2. Run the installer
3. Launch SERVE

---

## ⚠️ Notes

- Requires an active **GitHub Copilot subscription** for AI features
- First launch may take a moment while the database initializes
- `npm run dev` (browser-only) shows the UI but auth/chat require the Tauri window (`npm run dev:tauri`)
