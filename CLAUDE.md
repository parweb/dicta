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
   - IPC communication handlers:
     - Recording control (`stop-recording`)
     - History management (`history:ensure-dir`, `history:save`, `history:load-all`)
   - File system operations for history storage in userData directory
   - Clipboard paste automation via OS-specific commands (AppleScript for macOS, PowerShell for Windows, xdotool for Linux)
   - Security note: Uses `contextIsolation: false` and `sandbox: false` for IPC communication

2. **Preload Process** (`src/preload/index.ts`):
   - Exposes `window.api` and `window.electron` APIs to renderer
   - Provides IPC bridge methods: `send()`, `on()`, `removeListener()`
   - Exposes `window.api.history` methods for transcription persistence
   - Requests microphone permissions on DOM load

3. **Renderer Process** (`src/renderer/`):
   - React 19 application with TypeScript
   - Pages:
     - `Home.tsx`: Main recording interface with proxy status indicators
     - `Statistics.tsx`: Usage statistics and cost visualization
   - Components:
     - `HistorySidebar.tsx`: Transcription history sidebar
   - Libraries:
     - `src/renderer/src/lib/design-system.ts`: Centralized design tokens
     - `src/renderer/src/lib/history.ts`: History utilities and date formatting
     - `src/renderer/src/lib/statistics.ts`: Usage calculations and cost estimation
   - Uses MediaRecorder API for audio capture
   - Implements CORS proxy race condition for transcription

### Key Features Implementation

**Multi-Proxy Transcription Strategy** (`src/renderer/src/pages/Home.tsx`):

- Maintains array of CORS proxy configurations (`PROXY_CONFIGS`)
- Uses `Promise.any()` to race all proxies simultaneously
- Real-time proxy status indicators showing loading/success/error/cancelled states
- First successful response wins, others are cancelled
- Automatically copies transcription to clipboard

**Transcription History** (`src/renderer/src/components/HistorySidebar.tsx`):

- Sidebar component with overlay for viewing past transcriptions
- Transcriptions stored as JSON files in userData/history directory
- Grouped by day with French date labels (Aujourd'hui, Hier, etc.)
- Uses date-fns library for relative date formatting
- Active state highlighting for currently selected transcription
- Click to restore and copy previous transcriptions
- IPC handlers in main process: `history:ensure-dir`, `history:save`, `history:load-all`

**Usage Statistics** (`src/renderer/src/pages/Statistics.tsx`):

- Full-page statistics view with recharts visualization
- Summary cards: total requests, estimated duration, estimated cost
- Daily usage bar chart showing request count over time
- Cost estimation based on OpenAI Whisper pricing ($0.006/minute)
- Duration estimation from word count (~150 words/minute)
- Statistics calculations in `src/renderer/src/lib/statistics.ts`

**Window Dragging**:

- Entire window draggable via `-webkit-app-region: drag` on main container
- Interactive elements marked as `no-drag` (buttons, transcript, sidebar)
- Allows repositioning window anywhere on screen

**Global and Local Hotkeys**:

- Global: Cmd/Ctrl+Shift+X triggers from any application
- Local: Hold X key to record, release to stop
- Main process sets window visibility and focus across workspaces when global hotkey triggered

**IPC Communication Pattern**:

- Renderer → Main: `window.api.send('stop-recording')`
- Main → Renderer: `mainWindow.webContents.send('show-mini-app-hot-key')`
- History operations:
  - `window.api.history.ensureDir()`: Create history directory if needed
  - `window.api.history.save(transcription)`: Save transcription to JSON file
  - `window.api.history.loadAll()`: Load all transcriptions sorted by timestamp
- Used for coordinating recording state, window visibility, and data persistence

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

### Design System (`src/renderer/src/lib/design-system.ts`)

- **Centralized design tokens** for consistent styling across the application
- **Color palette**:
  - Background colors (primary: #0f172a, secondary: #1e293b, tertiary: #334155)
  - Text colors (primary: #f9fafb, secondary: #e5e7eb, tertiary: #94a3b8)
  - Border colors and accent colors (blue, green, red, yellow, gray)
  - State colors for proxy indicators (success, error, loading, cancelled, idle)
- **Spacing scale**: xs (4px) to 4xl (40px)
- **Typography scale**: fontSize (xs to 2xl) and fontWeight (normal to bold)
- **Border radius values**: sm, md, lg, full
- **Shadow definitions**: for cards and elevated surfaces
- **Component style objects**: reusable styles for buttons, cards, sidebar, inputs, proxy indicators
- **Helper functions**: `getStatusColor()`, `getRecordButtonColor()`
- **Dark theme**: Applied globally with slate/gray color scheme

### Tailwind CSS (Legacy)

- **Tailwind CSS v4** via PostCSS (`@tailwindcss/postcss`)
- Theme configuration in `src/renderer/src/index.css` using Tailwind v4's `@theme` directive
- CSS custom properties for colors (HSL format): `--background`, `--foreground`, `--primary`, etc.
- Dark mode via `.dark` class with custom variant: `@custom-variant dark (&:is(.dark *))`
- shadcn/ui components in `src/renderer/src/components/ui/`
- `cn()` utility (`src/renderer/src/lib/utils.ts`) for className merging

**Note**: The application primarily uses the centralized design system for inline styles. Use design system tokens when modifying or creating components for consistency.

## Key Dependencies

- **date-fns**: Date formatting and manipulation with French locale support
- **recharts**: Data visualization for statistics charts
- **lucide-react**: Icon library for UI components

## Environment Variables

**DEPRECATED**: The `VITE_OPENAI_API_KEY` environment variable is no longer used.

**NEW**: API keys are now stored securely using Electron's `safeStorage` API:
- Configure via Settings > Model tab in the application
- Keys are encrypted using OS-level encryption (Keychain on macOS, DPAPI on Windows, libsecret on Linux)
- Stored in `userData/config/credentials.json` as encrypted data
- Migration tool available in Settings for users with existing `.env` files

## Data Storage

- **History files**: Stored as JSON in `userData/history/` directory
- Each transcription saved as `{timestamp}.json`
- Contains: id, text, timestamp, durationMs, audioAmplitudes
- Loaded on-demand when history sidebar is opened

## Secure Credentials Storage

API keys are managed through Electron's `safeStorage` API:

**IPC Handlers** (`src/main/index.ts`):
- `credentials:check-encryption-available` - Check if OS encryption is available
- `credentials:save-api-key` - Encrypt and save API key
- `credentials:load-api-key` - Load and decrypt API key
- `credentials:delete-api-key` - Remove stored API key

**Storage Location**: `userData/config/credentials.json`
- Contains Base64-encoded encrypted buffer
- Automatically encrypted on save, decrypted on load
- Falls back to plain text with user warning if encryption unavailable

**UI**: Settings > Model tab
- Input field for API key (masked by default)
- Migration tool for `.env` users
- Encryption status indicator
- Delete with confirmation

**Context**: `ApiKeyProvider` (`src/renderer/src/lib/api-key-context.tsx`)
- Provides: `apiKey`, `hasApiKey`, `isLoading`, `isEncryptionAvailable`
- Methods: `saveApiKey()`, `deleteApiKey()`, `loadApiKey()`
- Auto-loads on mount and checks encryption availability

## Important Notes

- **Linux clipboard paste** requires `xdotool` to be installed: `sudo apt-get install xdotool`
- Window frame is disabled (`frame: false` in main process)
- Auto-hides menu bar for cleaner UI
- Microphone permissions requested on mount in both preload and renderer
