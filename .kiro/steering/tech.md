# Technology Stack

## Framework & Runtime

- **Next.js 16.2.6** - React framework with App Router
- **React 19.2.6** - UI library
- **TypeScript 6.0.3** - Type-safe JavaScript
- **Node.js** - Runtime environment

## Monorepo & Build

- **Turborepo 2.9.x** - Monorepo task orchestration with caching
- **pnpm 10.x** - Package manager with workspaces
- **Turbopack** - Next.js dev server bundler

## Styling & UI

- **Tailwind CSS 4.3.x** - Utility-first CSS framework
- **Radix UI** - Headless UI components
- **Framer Motion** - Animation library
- **Lucide React** - Icon library
- **shadcn/ui** - Component library (New York style)

## Content & Documentation

- **MDX** - Markdown with JSX support
- **next-mdx-remote** - Remote MDX processing
- **Gray Matter** - Front matter parsing
- **Rehype/Remark plugins** - Content processing

## Internationalization

- **next-intl** - Internationalization for Next.js
- Support for Uzbek (uz), English (en), and Russian (ru)

## State Management & Utilities

- **Zustand** - Lightweight state management
- **usehooks-ts** - React hooks collection
- **clsx & tailwind-merge** - Conditional styling (via @webiston/ui)

## Development Tools

- **OXC (oxlint)** - Ultra-fast linting (50-100x faster than ESLint, Rust-based)
- **Biome** - Fast formatting (35x faster than Prettier, Rust-based)
- **Lefthook** - Git hooks (faster than Husky, parallel execution, Go-based)
- **Commitlint** - Commit message linting (conventional commits)

## Analytics & Monitoring

- **Google Analytics** - Web analytics
- **Yandex Metrica** - Russian analytics
- **OpenReplay** - Session recording

## Common Commands

```bash
# Development
pnpm dev              # Start Next.js dev server (Turbopack, port 9999)
pnpm start            # Start production server

# Build (Turborepo cached)
pnpm build            # Build all (packages → app, with caching)
pnpm packages:build   # Build only @webiston/* packages

# Code Quality (Turborepo cached)
pnpm lint             # Run OXC linter across all workspaces
pnpm lint:fix         # Auto-fix lint issues
pnpm format           # Format code with Biome
pnpm format:check     # Check formatting (cached)
pnpm typecheck        # TypeScript type checking (cached)
pnpm check            # Biome check (lint + format)

# Testing
pnpm test             # Run all tests (cached)
pnpm test:watch       # Watch mode
pnpm test:coverage    # Coverage report

# Extensions
pnpm ext:dev          # Dev Chrome extension
pnpm ext:build        # Build Chrome extension
pnpm ext:zip          # Package extension for store

# Maintenance
pnpm clean            # Clean all build outputs
pnpm update-tools     # Regenerate tools list
```

## Git Hooks (Lefthook)

- **pre-commit**: OXC lint + Biome format (parallel, staged files only)
- **commit-msg**: Commitlint validation
- **pre-push**: TypeScript check + tests (parallel, Turborepo cached)

## Build Process

1. Turborepo builds packages first (`^build` dependency)
2. Next.js build with standalone output
3. Tools list generation
4. Sitemap generation with next-sitemap
5. Search index building

## Workspace Packages

| Package | Scope | Purpose |
|---------|-------|---------|
| `@webiston/transliteration` | `packages/transliteration` | Uzbek Latin-Cyrillic conversion |
| `@webiston/ui` | `packages/ui` | Shared UI components (Shadcn + Radix) |
| `latin-cyrillic-extension` | `apps/extensions/latin-cyrillic` | Chrome extension |
