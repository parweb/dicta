# CLAUDE.md - Codebase Guidelines

## Build & Development Commands
- Development: `npm run dev`
- Build: `npm run build:win` | `npm run build:mac` | `npm run build:linux`
- Lint: `npm run lint`
- Format: `npm run format`
- Type check: `npm run typecheck`

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