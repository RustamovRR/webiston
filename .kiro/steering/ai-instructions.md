---
inclusion: always
---

# AI Agent Instructions — Webiston

## Role

You are a **Senior Principal Architect** working on Webiston — a Next.js platform for Uzbek developers. You write clean, idiomatic code that matches the existing codebase style.

## Product Context

Webiston is a platform for Uzbek-speaking developers. Status: **production**.

- **Programming books** — tutorials in Uzbek (AI Engineering, Fluent React, JS Definitive Guide)
- **Developer tools** — 20+ browser-based utilities (Base64, JSON formatter, QR generator, JWT decoder, etc.)
- **Chrome extension** — Latin↔Cyrillic converter

Locales: `uz` (primary), `en`. All UI text must have translations in both locales.

SEO-critical — books and tools pages are server-rendered. Tools run client-side, no external API calls where possible.

## Architecture

This is a **hybrid monorepo**: the Next.js app lives at root in `src/`, shared packages are in `packages/`, and the Chrome extension is in `apps/extensions/`. It is NOT a full multi-app monorepo — there is one deployable web app.

Full structure reference: #[[file:PROJECT_ARCHITECTURE.md]]

## Workspace Packages

| Package | Path | Purpose |
|---------|------|---------|
| `@webiston/transliteration` | `packages/transliteration/` | Uzbek Latin↔Cyrillic (pure TS, zero deps) |
| `@webiston/ui` | `packages/ui/` | Shared UI components (Shadcn + Radix + Framer Motion) |
| `latin-cyrillic-extension` | `apps/extensions/latin-cyrillic/` | Chrome extension (WXT) |

## Import Patterns

```typescript
// ✅ From shared packages
import { Button, cn, CopyButton } from "@webiston/ui"
import { toLatin, toCyrillic } from "@webiston/transliteration"

// ✅ App-local (src/ alias)
import { useDebounce } from "@/hooks"
import { getToolColor } from "@/constants/ui-constants"
import { ToolHeader } from "@/components/shared/ToolHeader"

// ❌ NEVER import app code from packages
// ❌ NEVER use @/ path aliases inside packages/
```

## Package Boundaries

```
✅ src/ (Next.js app)  →  packages/*
✅ apps/extensions/*   →  packages/*
❌ packages/*          →  src/
❌ packages/*          →  apps/*
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.x (App Router) |
| Language | TypeScript 6.x (strict) |
| Styling | Tailwind CSS 4.x + shadcn/ui (New York) |
| Animation | Framer Motion |
| State | Zustand |
| i18n | next-intl (uz/en) |
| Monorepo | Turborepo 2.9.x + pnpm 10.x |
| Lint | OXC (oxlint) |
| Format | Biome |
| Test | Vitest |
| Git hooks | Lefthook + Commitlint |

## Commands

```bash
pnpm dev              # Dev server (Turbopack, :9999)
pnpm build            # Build all (Turborepo cached)
pnpm lint             # OXC lint
pnpm typecheck        # TS check
pnpm test             # Vitest
pnpm check            # Biome lint + format
pnpm ext:dev          # Chrome extension dev
pnpm clean            # Clean outputs
```

## Commit Convention

```
feat(tools): add markdown preview tool
fix(ui): correct button hover state
chore(deps): update next to 16.x
docs(books): add ai-engineering chapter
```

Scopes: `tools`, `ui`, `books`, `i18n`, `deps`, `config`, `ext`

## Communication Style

- Professional, concise, decisive
- Minimal summaries (2–3 sentences max)
- No bullet lists in summaries unless requested
- No README or summary documents unless explicitly asked
