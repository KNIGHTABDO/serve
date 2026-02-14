# SERVE v2.1.0 — Release Notes

**Release Date:** February 14, 2026

---

## ✨ What's New

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
