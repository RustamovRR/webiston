# Webiston — Code Rules & Standards (enforced)

> These rules apply to ALL code in this repo: `src/`, `packages/*`,
> `apps/extensions/*`, `scripts/`. This file is **@-imported by the root
> `CLAUDE.md`**, so it loads into every Claude Code session — keep it rules-only
> and tight. Full design spec: `design-system.md`.

---

## 1. Package Boundary Rules

```
✅ ALLOWED
src/ (Next.js app)   → packages/*
apps/extensions/*    → packages/*
packages/ui          → (standalone: React + Radix + framer-motion, no workspace deps)
packages/transliteration → (pure TS, ZERO runtime deps — keep it that way)

❌ FORBIDDEN
packages/*           → src/            (packages never import app code)
packages/*           → apps/*
packages/*           → "@/..."         (the @/ alias does not resolve inside packages)
apps/extensions/*    → src/
```

`@webiston/transliteration` is consumed by both the web app and the Chrome
extension. Anything you add there ships in the extension bundle — no DOM
assumptions, no framework imports.

---

## 2. Exports — Named Only, No `export *`

```ts
// ❌ FORBIDDEN
export * from "./components"

// ✅ CORRECT — explicit named exports
export { ToolHeader } from "./components/ToolHeader"
export type { ToolConfig } from "./types"
```

Default exports **only** for Next.js `page.tsx` / `layout.tsx` / `route.ts`
(the framework requires them).

**Two import paths exist for the same component today:**
`@webiston/ui` (canonical) and `@/components/ui/*` (a 1–17 line re-export shim
kept for backward compatibility). **New code imports from `@webiston/ui`.**
Do not add new shims.

---

## 3. Component Rules — Dumb Components

Components receive data via props. No fetching, no direct store access inside a
presentational component.

```tsx
// ❌ BAD — store reach-in inside a leaf component
export function ToolCard({ toolId }: { toolId: string }) {
  const tool = useToolStore((s) => s.tools[toolId])
  return <div>{tool.name}</div>
}

// ✅ GOOD
interface ToolCardProps {
  name: string
  description: string
  onSelect: () => void
}
export function ToolCard({ name, description, onSelect }: ToolCardProps) { … }
```

Logic lives in `hooks/`, `utils/`, `stores/`, `constants/`.

---

## 4. Server-first — `'use client'` is a cost

This is an SEO-critical content site. **101 of 208 `.tsx` files in `src/` are
`'use client'` today (49%)** — that is the number to drive down, not up.

- Put `'use client'` on the **smallest leaf** that needs interactivity. Never on
  a `page.tsx` or `layout.tsx` unless there is no alternative.
- A component that only renders props is a Server Component. Leave it alone.
- Reading a Zustand store, `useState`, `useEffect`, event handlers, browser APIs
  → client. Formatting, mapping, static markup → server.
- Book pages (`content/**`) are read-mostly: render on the server, hydrate only
  the interactive islands (TOC, search, image zoom).

---

## 5. TypeScript Rules

- **No `any`** — use `unknown` + narrowing, or generics.
  ⚠️ `noExplicitAny` is currently **`"off"`** in `biome.json` and there are
  **69 `any`s in `src/`**. The rule is real; the enforcement is not yet. Do not
  add to the pile — see `docs/roadmap/backlog.md`.
- **No type assertions** (`as Foo`) unless unavoidable — add a comment saying why.
- **Strict mode** is on (`tsconfig.json` `strict: true`).
  ⚠️ `noUnusedLocals` / `noUnusedParameters` are **not** enabled, despite older
  steering docs claiming they are. Verify before you rely on them.
- `pnpm typecheck` runs `tsc --noEmit` and **excludes `apps/extensions/**`**
  (`tsconfig.json:27`). The extension is typechecked by its own tooling only.

---

## 6. Naming Conventions

| Type          | Convention              | Example              |
| ------------- | ----------------------- | -------------------- |
| Folders       | kebab-case              | `latin-cyrillic/`    |
| Tool modules  | PascalCase folder       | `modules/tools/JsonFormatter/` |
| Components    | PascalCase              | `ToolHeader.tsx`     |
| Hooks         | camelCase + `use`       | `useClipboard.ts`    |
| Stores        | camelCase + `Store`     | `mobileMenuStore.ts` |
| Types files   | camelCase               | `tools.ts`           |
| Routes        | lowercase-hyphen        | `json-formatter/page.tsx` |
| MDX content   | lowercase-hyphen        | `page.mdx`           |

---

## 7. File Size Limits

| File type  | Ideal   | Hard limit | Action                 |
| ---------- | ------- | ---------- | ---------------------- |
| Components | 100–200 | 350        | Extract sub-components |
| Hooks      | 50–150  | 300        | Split by responsibility |
| Utils      | 50–150  | 250        | Separate files         |

⚠️ **47 of 422 `.ts`/`.tsx` files exceed 350 lines today; 9 exceed 500.** These
are triggers to look when you are already in the file — not a mandate to start a
splitting campaign. Split what you touch.

---

## 8. Tool Module Structure

Every tool in `src/modules/tools/{ToolName}/`:

```
{ToolName}/
├── components/        # dumb UI
├── hooks/             # business logic (use{ToolName}.ts)
├── stores/            # Zustand, only if state outlives the tree
├── types/             # types
├── constants/         # tool-scoped constants
├── utils/             # pure helpers
├── {ToolName}.tsx     # composition root
└── index.ts           # named exports only
```

A tool is reachable only if it has a route in
`src/app/(app)/[locale]/tools/<slug>/page.tsx`. **A route folder prefixed with
`_` is a Next.js private folder and is NOT routed** — four tools are parked this
way today (see `docs/roadmap/backlog.md`). Do not "fix" them by renaming
without asking; the parking may be deliberate.

---

## 9. Import Order

```ts
// 1. React
import { useState } from "react"

// 2. External packages
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"

// 3. Workspace packages
import { Button, cn } from "@webiston/ui"
import { toLatin } from "@webiston/transliteration"

// 4. App-local absolute
import { ToolHeader } from "@/components/shared/ToolHeader"

// 5. Relative
import { ControlPanel } from "./components/ControlPanel"
```

Biome's `organizeImports` assist is on — run `pnpm format` rather than sorting
by hand.

---

## 10. Formatting & Linting

Biome formats, oxlint lints. Double quotes, **no semicolons**, no trailing
commas, 80 columns, 2-space indent.

```bash
pnpm check      # biome check .   (read-only — does NOT write)
pnpm format     # biome format --write .
pnpm lint       # oxlint src/ packages/ apps/
```

⚠️ `pnpm check` does not write. If it reports formatting diffs, run
`pnpm format`. Biome's `files.includes` **excludes** `*.css`, `*.md`, `*.mdx`
and `content/` — those are never auto-formatted.

---

## 11. Design System & Theming

Full spec: **`design-system.md`**. The hard rules:

- One source of truth for color: the token block in `src/app/globals.css`.
- **No raw hex and no Tailwind palette classes in components.** Semantic tokens
  only: `bg-background`, `bg-card`, `text-foreground`, `text-muted-foreground`,
  `border-border`, `bg-primary`, `text-destructive`.
- **A `dark:` variant on a color utility is a smell.** If the token is right,
  dark mode is automatic. 1,963 `dark:` variants exist today because colors are
  hardcoded per class — every one of them is maintenance you pay twice.
- Never fork a `@webiston/ui` component to restyle it — change the token.
- Chart/viz/brand-illustration colors are the documented exception; they belong
  in a named constant, not inline.

---

## 12. Internationalization

- **`uz` and `en` only.** Adding a locale means `src/i18n/routing.ts`,
  `src/middleware.ts` (incl. the `matcher`), and every file under `messages/`.
- Every new user-facing string ships in **both** locales in the same commit.
  A missing key is a runtime error surface, not a TODO.
- Uzbek technical terminology comes from `glossary.md` — check it before
  inventing a translation, and add new terms there.
- `<html lang>` must follow the active locale. It is hardcoded `"uz"` in
  `src/app/layout.tsx:394` today — a known bug, see the backlog.

---

## 13. Testing — AAA Pattern

```ts
describe("toLatin", () => {
  it("converts Cyrillic to Latin preserving protected spans", () => {
    // Arrange
    const input = "Салом <code>ҳello</code>"
    // Act
    const result = toLatin(input)
    // Assert
    expect(result).toBe("Salom <code>ҳello</code>")
  })
})
```

**Priorities:** High — `packages/transliteration`, tool business-logic hooks,
`src/lib/` utils. Medium — stores, complex components. Low — presentational
components. Full spec: `testing-strategy.md`.

⚠️ Coverage today is **6 test files, all in `packages/transliteration`**. The
entire `src/` tree has zero tests. `pnpm test` runs `vitest run` across both.

---

## 14. Constants Discipline — reuse before you write

Before writing any literal that smells like configuration — a size limit, a
debounce, a palette entry, a route slug, a file-type list — look in:

1. `src/constants/` — app-wide (`tools.ts`, `tool-constants.ts`, `ui.ts`,
   `ui-constants.ts`, `navigation.tsx`, `color-names.ts`).
2. The tool's own `constants/` segment.

Placement for a NEW constant: used by 2+ tools or by both the app and the
extension → `src/constants/` or the relevant package. Tool-internal →
that tool's `constants/`, `SCREAMING_SNAKE`, with a comment saying what it means
in domain terms, not what it equals.
