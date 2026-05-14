# Webiston — Monorepo Architecture

## Overview

Pragmatic monorepo: single Next.js application + shared packages + browser extensions.
Orchestrated by **Turborepo** for task caching, parallel execution, and dependency-aware builds.

```
webiston/
├── src/                           # Next.js web application (main app)
│   ├── app/                       # App Router (pages, layouts, API routes)
│   ├── components/                # UI components
│   │   ├── shared/                # App-specific shared components
│   │   ├── ui/                    # Re-exports from @webiston/ui (backward compat)
│   │   └── mdx/                   # MDX rendering components
│   ├── modules/                   # Feature modules (tools)
│   ├── lib/                       # Utilities, content processing, search
│   ├── hooks/                     # Custom React hooks
│   ├── stores/                    # Zustand state management
│   ├── types/                     # TypeScript type definitions
│   ├── constants/                 # Application constants
│   ├── i18n/                      # Internationalization config
│   └── middleware.ts              # Next.js middleware (i18n routing)
│
├── content/                       # MDX book content
│   ├── ai-engineering/
│   ├── fluent-react/
│   └── javascript-definitive-guide/
│
├── packages/                      # Shared packages (used by 2+ consumers)
│   ├── transliteration/           # @webiston/transliteration — Pure logic
│   └── ui/                        # @webiston/ui — Shared UI components
│
├── apps/
│   └── extensions/
│       └── latin-cyrillic/        # Chrome extension (WXT framework)
│
├── turbo.json                     # Turborepo task pipeline
├── pnpm-workspace.yaml            # Workspace definition
├── package.json                   # Root: Next.js app + workspace orchestration
└── next.config.ts                 # Next.js configuration
```

---

## Architecture Decision: Why `src/` at Root?

This project has **one deployable web application**. Moving it to `apps/web/` would add
complexity (path rewrites, config duplication) without benefit. The pattern follows
[Vercel's own monorepo examples](https://turbo.build/repo/docs) for single-app workspaces.

**When to migrate to `apps/web/`:**
- Adding a second deployable app (admin panel, mobile web, etc.)
- Need for selective CI/CD builds per app
- Team scaling requires independent app ownership

---

## Packages

### @webiston/transliteration
Pure TypeScript library for Uzbek Latin-Cyrillic transliteration.
- Zero framework dependencies
- Built with `tsup` → CJS + ESM + DTS
- Used by: web app, Chrome extension
- Single source of truth for transliteration logic

### @webiston/ui
Shared UI components built on Shadcn/ui + Radix UI.
- **primitives/** — Base components (Button, Input, Dialog, Select, etc.)
- **composites/** — Composed components (BaseModal, CopyButton, InfoCard, etc.)
- **utils/** — `cn()` function for class merging
- Source-level imports (no build step needed for Next.js via `transpilePackages`)
- Owns all Radix UI, CVA, framer-motion dependencies

---

## Dependency Rules

```
┌─────────────────────┐     ┌──────────────────────┐
│  apps/extensions/*  │     │   src/ (Next.js)     │
└──────────┬──────────┘     └──────────┬───────────┘
           │                           │
           └───────────┬───────────────┘
                       │
           ┌───────────▼───────────┐
           │      packages/        │
           │  ┌─────────────────┐  │
           │  │ transliteration │  │
           │  └─────────────────┘  │
           │  ┌─────────────────┐  │
           │  │       ui        │  │
           │  └─────────────────┘  │
           └───────────────────────┘
```

| Rule | Description |
|------|-------------|
| ✅ | Apps/src can import from packages |
| ✅ | Packages can import from other packages |
| ❌ | Packages cannot import from apps or src |
| ❌ | Apps cannot import from each other |

---

## Turborepo Pipeline

```json
{
  "tasks": {
    "build":      { "dependsOn": ["^build"], "outputs": [".next/**", "dist/**"] },
    "dev":        { "cache": false, "persistent": true },
    "lint":       { "dependsOn": ["^build"], "cache": true },
    "typecheck":  { "dependsOn": ["^build"], "cache": true },
    "test":       { "dependsOn": ["^build"], "cache": true }
  }
}
```

**Benefits:**
- Incremental builds — only rebuilds what changed
- Remote caching ready (Vercel Remote Cache)
- Parallel task execution
- Dependency-aware ordering (`^build` = build dependencies first)

---

## Import Patterns

```typescript
// ✅ From @webiston/ui (recommended for new code)
import { Button, CopyButton, cn } from "@webiston/ui"

// ✅ From local re-exports (backward compatible, existing code)
import { Button } from "@/components/ui/button"

// ✅ From @webiston/transliteration
import { toLatin, toCyrillic, detectScript } from "@webiston/transliteration"

// ✅ App-specific shared components
import { DualTextPanel } from "@/components/shared/DualTextPanel"
```

---

## Development Commands

```bash
# Development
pnpm dev                    # Start Next.js dev server (Turbopack, port 9999)

# Build (with Turborepo caching)
pnpm build                  # Build all (packages first, then app)
pnpm packages:build         # Build only @webiston/* packages

# Code Quality (cached via Turborepo)
pnpm lint                   # OXC linter across all workspaces
pnpm lint:fix               # Auto-fix lint issues
pnpm format                 # Biome format (write)
pnpm format:check           # Biome format (check only)
pnpm typecheck              # TypeScript type checking
pnpm check                  # Biome check (lint + format)

# Testing
pnpm test                   # Run all tests (cached)
pnpm test:watch             # Watch mode (no cache)
pnpm test:coverage          # Coverage report

# Extensions
pnpm ext:dev                # Dev Chrome extension
pnpm ext:build              # Build Chrome extension
pnpm ext:zip                # Package extension for store

# Maintenance
pnpm clean                  # Clean all build outputs
pnpm update-tools           # Regenerate tools list
```

---

## Git Hooks (Lefthook)

| Hook | Commands | Strategy |
|------|----------|----------|
| pre-commit | OXC lint + Biome format | Parallel, staged files only |
| commit-msg | Commitlint | Conventional commits |
| pre-push | Typecheck + Test | Parallel, Turborepo cached |

---

## Feature Module Structure

Each tool in `src/modules/tools/{ToolName}/` follows:

```
{ToolName}/
├── components/          # Dumb UI components
├── hooks/               # Business logic hooks
├── stores/              # Zustand stores (if needed)
├── types/               # TypeScript types
├── constants/           # Tool-specific constants
├── utils/               # Helper functions
├── {ToolName}.tsx       # Main composition component
└── index.ts             # Public API
```

---

## Key Conventions

| Category | Convention |
|----------|-----------|
| Components | PascalCase (`ButtonLink.tsx`) |
| Utilities | camelCase (`transliteration.ts`) |
| Hooks | camelCase with `use` prefix (`useDebounce.ts`) |
| Stores | camelCase with `Store` suffix (`mobileMenuStore.ts`) |
| Types | PascalCase interfaces/types |
| Imports | Path alias `@/*` → `src/*` |
| Exports | Named exports only (no `export *`) |
| Formatting | Biome (2 space indent, double quotes, no semicolons) |
| Linting | OXC (Rust-based, ultra-fast) |
