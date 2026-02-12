# SERVE

**AI that sees patterns. A quiet space for conversations that matter.**

SERVE is a minimalist, local-first AI desktop application powered by GitHub Copilot. It speaks with earned authority — offering pattern recognition, parables, and the hard questions beneath the surface.

## Features

- 🤖 **GitHub Copilot Integration** - Uses your existing Copilot subscription via Device Flow auth.
- 💬 **Pattern Recognition** - The local AI remembers context across sessions.
- 🎨 **Minimalist UI** - Distraction-free interface with custom window controls.
- 💾 **Local-First** - All conversations stored in a local SQLite database (`serve.db`).
- 🚀 **True Desktop App** - Single `.exe` file, no bundled server, no terminal window.
- ✨ **Beautiful Typography** - Markdown support with syntax highlighting.

## Architecture

This is a **static web application** running inside **Tauri v2**:

- **Frontend**: Next.js 16 (Static Export) + Tailwind CSS + React 19
- **Backend Context**: Rust (Tauri)
- **Database**: SQLite (via `@tauri-apps/plugin-sql`)
- **Networking**: Direct client-side HTTP calls to GitHub APIs (via `@tauri-apps/plugin-http`)
- **Storage**: Persistent key-value store for auth tokens (via `@tauri-apps/plugin-store`)

There is **no Node.js server** required at runtime. The application is a self-contained native binary.

## Installation

### Windows Desktop

1. Download the latest installer (`.exe` or `.msi`) from Releases.
2. Run the installer.
3. Launch SERVE from the Start Menu.

## Development

### Prerequisites

- Node.js 18+
- Rust (latest stable)
- Visual Studio C++ Build Tools (for Windows development)

### Setup

```bash
# Install dependencies
npm install

# Run development mode (hot reload)
npm run dev:tauri
```

### Build

To create the production installer:

```bash
# Build the Windows application
npm run build:tauri
```

The output installer will be located at:
`src-tauri/target/release/bundle/nsis/`

## Project Structure

```
SERVE/
├── app/              # Next.js Frontend (Static Export)
│   ├── chat/         # Chat interface
│   ├── components/   # React components (e.g., TitleBar, AuthModal)
│   └── layout.tsx    # Root layout with custom title bar
├── src-tauri/        # Rust Backend Context
│   ├── src/          # Rust source code
│   └── tauri.conf.json # Tauri configuration
├── lib/
│   └── tauri/        # Client-side services (Auth, DB, Chat)
└── out/              # Static build output (generated)
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT

---

*"The broom doesn't care what I become."*
