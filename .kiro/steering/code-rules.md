---
inclusion: always
---

# Webiston — Code Rules & Standards

> These rules apply to ALL code in this monorepo.

---

## 1. Package Boundary Rules

```
✅ ALLOWED:
src/ (Next.js app)     →  packages/*
apps/extensions/*      →  packages/*
packages/ui            →  (standalone, no workspace deps)

❌ FORBIDDEN:
packages/*             →  src/          (packages never import app code)
packages/*             →  apps/*
packages/ui            →  @/anything    (no app-level path aliases in packages)
```

---

## 2. Exports — Named Only, No `export *`

```ts
// ❌ FORBIDDEN
export * from "./components"

// ✅ CORRECT
export { ToolHeader } from "./components/ToolHeader"
export type { ToolConfig } from "./types"
```

No default exports except Next.js page components (`page.tsx`, `layout.tsx`).

---

## 3. Component Rules — Dumb Components

Components receive data via props. No API calls, no direct store access inside components.

```tsx
// ❌ BAD
export function ToolCard({ toolId }: { toolId: string }) {
  const tool = useToolStore((s) => s.tools[toolId]) // store in component
  return <div>{tool.name}</div>
}

// ✅ GOOD
interface ToolCardProps {
  name: string
  description: string
  onClick: () => void
}
export function ToolCard({ name, description, onClick }: ToolCardProps) {
  return <div onClick={onClick}>{name}</div>
}
```

Logic lives in: `hooks/`, `utils/`, `stores/`, `constants/`.

---

## 4. TypeScript Rules

- **No `any`** — use `unknown` + type narrowing or generics
- **Strict mode** on (`strict`, `noUnusedLocals`, `noUnusedParameters`)
- **No type assertions** (`as SomeType`) unless unavoidable — add a comment explaining why

---

## 5. Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Folders | kebab-case | `latin-cyrillic/` |
| Components | PascalCase | `ToolHeader.tsx` |
| Hooks | camelCase + `use` | `useClipboard.ts` |
| Stores | camelCase + `Store` | `mobileMenuStore.ts` |
| Type files | camelCase | `tools.ts` |
| Util files | camelCase | `transliteration.ts` |

---

## 6. File Size Limits

| Type | Ideal | Hard Limit | Action |
|------|-------|-----------|--------|
| Components | 100–200 | 350 | Extract sub-components |
| Hooks | 50–150 | 300 | Split by responsibility |
| Utils | 50–150 | 250 | Create separate files |

---

## 7. Import Order

```ts
// 1. React
import { useState, useEffect } from "react"

// 2. External packages
import { motion } from "framer-motion"
import { useTranslations } from "next-intl"

// 3. Workspace packages
import { Button, cn } from "@webiston/ui"
import { toLatin } from "@webiston/transliteration"

// 4. App-local absolute
import { ToolHeader } from "@/components/shared/ToolHeader"
import { useClipboard } from "@/hooks"

// 5. Relative
import { ControlPanel } from "./components/ControlPanel"
```

---

## 8. Biome Formatting

Double quotes, no semicolons, no trailing commas, 80 char line width, 2 space indent.

Run `pnpm check` — lint + format together.
