# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands
- Development: `bun run dev`
- Build: `bun run build:win` | `bun run build:mac` | `bun run build:linux`
- Lint: `bun run lint`
- Format: `bun run format`
- Type check: `bun run typecheck`

## Project Overview
Dicta is an Electron-based voice transcription application that uses OpenAI's transcription API. The app features a global hotkey (Cmd/Ctrl+Shift+X) and local hotkey (X key) to trigger voice recording, transcribes audio using multiple CORS proxies in a race condition pattern, and automatically copies the transcription to the clipboard for pasting into other applications.

## Architecture

### Electron Process Architecture
The application follows standard Electron architecture with three distinct processes:

1. **Main Process** (`src/main/index.ts`):
   - Window management and lifecycle
   - Global shortcut registration (Cmd/Ctrl+Shift+X)
   - IPC communication handlers
   - Clipboard paste automation via OS-specific commands (AppleScript for macOS, PowerShell for Windows, xdotool for Linux)
   - Security note: Uses `contextIsolation: false` and `sandbox: false` for IPC communication

2. **Preload Process** (`src/preload/index.ts`):
   - Exposes `window.api` and `window.electron` APIs to renderer
   - Provides IPC bridge methods: `send()`, `on()`, `removeListener()`
   - Requests microphone permissions on DOM load

3. **Renderer Process** (`src/renderer/`):
   - React 19 application with TypeScript
   - Main UI in `src/renderer/src/pages/Home.tsx`
   - Uses MediaRecorder API for audio capture
   - Implements CORS proxy race condition for transcription

### Key Features Implementation

**Multi-Proxy Transcription Strategy** (`src/renderer/src/pages/Home.tsx`):
- Maintains array of CORS proxy configurations (`PROXY_CONFIGS`)
- Uses `Promise.any()` to race all proxies simultaneously
- Real-time proxy status indicators showing loading/success/error/cancelled states
- First successful response wins, others are cancelled
- Automatically copies transcription to clipboard

**Global and Local Hotkeys**:
- Global: Cmd/Ctrl+Shift+X triggers from any application
- Local: Hold X key to record, release to stop
- Main process sets window visibility and focus across workspaces when global hotkey triggered

**IPC Communication Pattern**:
- Renderer → Main: `window.api.send('stop-recording')`
- Main → Renderer: `mainWindow.webContents.send('show-mini-app-hot-key')`
- Used for coordinating recording state and window visibility

## Code Style Guidelines
- **TypeScript**: Use strong typing, avoid `any` where possible
- **React**: Functional components with hooks, use React.forwardRef for component props
- **Formatting**:
  - Single quotes, 80 char width, semicolons required
  - Use shadcn/ui patterns and cn utility for className composition
- **Imports**: Group imports by external/internal, sort alphabetically
- **Naming**:
  - PascalCase for components/types/interfaces
  - camelCase for variables/functions
- **Error Handling**: Use try/catch with specific error types
- **File Structure**: Follow Electron main/renderer architecture pattern
- **Styling**: Use Tailwind CSS with project color variables

## Path Aliases
- `@/*` maps to `src/renderer/src/*`
- Configured in `tsconfig.json` and `electron.vite.config.ts`

## Styling System
- **Tailwind CSS v4** via PostCSS (`@tailwindcss/postcss`)
- Theme configuration in `src/renderer/src/index.css` using Tailwind v4's `@theme` directive
- CSS custom properties for colors (HSL format): `--background`, `--foreground`, `--primary`, etc.
- Dark mode via `.dark` class with custom variant: `@custom-variant dark (&:is(.dark *))`
- shadcn/ui components in `src/renderer/src/components/ui/`
- `cn()` utility (`src/renderer/src/lib/utils.ts`) for className merging

## Environment Variables
- `VITE_OPENAI_API_KEY`: Required for OpenAI transcription API
- Configure in `.env` (see `.env.example`)

## Important Notes
- **Linux clipboard paste** requires `xdotool` to be installed: `sudo apt-get install xdotool`
- Window frame is disabled (`frame: false` in main process)
- Auto-hides menu bar for cleaner UI
- Microphone permissions requested on mount in both preload and renderer
