# SERVE

AI that sees patterns. A quiet space for conversations that matter.

## What is SERVE?

SERVE is a minimalist AI chat interface powered by GitHub Copilot. It speaks with earned authority — offering pattern recognition, parables, and the hard questions beneath the surface.

Unlike typical AI assistants, SERVE:
- **Notices patterns** in your questions across conversations
- **Reframes** your story gently but directly
- **Asks the hard questions** you're circling around
- Uses **parables and stories** to illuminate truth
- Maintains a **quiet, confident presence** without pretense

## Features

- 🤖 **GitHub Copilot Integration** - Uses your Copilot subscription
- 💬 **Pattern Recognition** - The AI remembers and connects your questions
- 🎨 **Minimalist UI** - Clean, distraction-free interface
- 💾 **Local Conversations** - SQLite database stores your chats locally
- 🔒 **GitHub Auth** - Secure device flow authentication
- ✨ **Beautiful Typography** - Markdown support with syntax highlighting
- 🪟 **Windows Desktop** - Native .exe with auto-updates

## Getting Started

### Prerequisites

- Node.js 18+
- A GitHub account with Copilot access
- For Windows desktop: Rust toolchain

### Web Version

```bash
# Clone the repository
git clone https://github.com/KNIGHTABDO/serve.git
cd serve

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Windows Desktop App

#### Option 1: Download Release (Recommended)

1. Go to [Releases](https://github.com/KNIGHTABDO/serve/releases)
2. Download `serve-1.0.0-x64.msi` or `serve-1.0.0-x64.zip`
3. Run the installer
4. SERVE will auto-update when new versions are released

#### Option 2: Build from Source

```bash
# Install Rust (if not installed)
# Download from https://rustup.rs/

# Clone and enter directory
git clone https://github.com/KNIGHTABDO/serve.git
cd serve

# Install Tauri CLI
cargo install tauri-cli

# Build the Windows app
npm run build:tauri

# Output will be in src-tauri/target/release/bundle/
```

### GitHub Authentication

1. Click "Start Login" on first visit
2. Copy the user code provided
3. Click "Open GitHub Activation" 
4. Paste the code on GitHub and authorize
5. Return to SERVE - you're authenticated!

## Usage

1. **Landing Page** - Visit `/` to learn about SERVE
2. **Start Chat** - Click "ENTER" or visit `/chat`
3. **Ask Anything** - The real question, not the safe version
4. **Listen** - SERVE responds with pattern recognition and insight

### Keyboard Shortcuts

- `Enter` - Send message
- `Shift + Enter` - New line in message
- `F11` - Toggle fullscreen (desktop only)
- `Ctrl+W` - Close window (desktop only)

## Auto-Updates

The Windows desktop app automatically checks for updates on startup. When a new version is available:
- You'll be prompted to update
- Click "Update" to download and install
- App will restart with the new version

Manual update check available in Settings.

## Architecture

- **Framework**: Next.js 16 with App Router
- **Desktop**: Tauri 2 (Rust + WebView2)
- **Styling**: Tailwind CSS
- **Database**: SQLite (Better-sqlite3)
- **AI**: GitHub Copilot API via device flow
- **State**: React hooks + localStorage

## Project Structure

```
SERVE/
├── app/
│   ├── api/           # API routes (auth, chat, conversations)
│   ├── chat/          # Chat interface
│   ├── components/    # React components
│   ├── globals.css    # Global styles
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Landing page
├── src-tauri/         # Tauri desktop app
│   ├── src/           # Rust source
│   ├── icons/         # App icons
│   └── tauri.conf.json # Tauri configuration
├── lib/
│   ├── auth/          # Authentication logic
│   ├── db.ts          # Database setup
│   └── memory.ts      # Memory/conversation management
└── prisma/            # Database schema
```

## Development

```bash
# Run web dev server
npm run dev

# Run Tauri dev (requires Rust)
npm run dev:tauri

# Build for web
npm run build

# Build Windows desktop app
npm run build:tauri
```

## Philosophy

SERVE is designed around the idea that the best conversations happen when:

1. **Truth is spoken kindly** - Direct without being harsh
2. **Patterns are seen** - Not just surface-level responses
3. **Questions open doors** - Rather than providing easy answers
4. **Silence is respected** - Minimal interface, maximum focus

Inspired by the "Nenspace" aesthetic and the desire for AI that feels like a wise friend at 2am.

## License

MIT

---

*"The broom doesn't care what I become."*
