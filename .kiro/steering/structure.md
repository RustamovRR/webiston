---
inclusion: always
---

# Webiston — Project Structure

## Monorepo Layout

```
webiston/
├── src/                          # Next.js app (main application)
│   ├── app/
│   │   ├── (app)/[locale]/       # i18n routes (uz/en/ru)
│   │   ├── api/                  # API routes (search, etc.)
│   │   └── books/                # Book reader pages
│   ├── components/
│   │   ├── shared/               # App-specific shared components
│   │   ├── ui/                   # Re-exports from @webiston/ui
│   │   └── mdx/                  # MDX rendering components
│   ├── modules/tools/            # Developer tools (feature modules)
│   │   └── {ToolName}/           # Each tool is self-contained
│   ├── lib/                      # Content processing, search, utils
│   ├── hooks/                    # Custom React hooks
│   ├── stores/                   # Zustand stores
│   ├── types/                    # TypeScript types
│   ├── constants/                # App constants (tools, navigation, UI)
│   └── i18n/                     # next-intl config
├── content/                      # MDX book content
│   ├── ai-engineering/
│   ├── fluent-react/
│   └── javascript-definitive-guide/
├── messages/                     # i18n translations
│   ├── common/{uz,en,ru}.json
│   └── tools/{tool-name}/{uz,en,ru}.json
├── packages/
│   ├── transliteration/          # @webiston/transliteration
│   └── ui/                       # @webiston/ui
├── apps/extensions/
│   └── latin-cyrillic/           # Chrome extension (WXT)
├── public/                       # Static assets
└── scripts/                      # Build scripts (sitemap, search index)
```

## Tool Module Structure

```
src/modules/tools/{ToolName}/
├── components/       # Dumb UI components
├── hooks/            # Business logic
├── stores/           # Zustand (if needed)
├── types/            # Types
├── constants/        # Constants
├── utils/            # Pure helpers
├── {ToolName}.tsx    # Main composition component
└── index.ts          # Named exports only
```

## Key Path Aliases

| Alias | Resolves to |
|-------|------------|
| `@/*` | `src/*` |
| `@/components` | `src/components/` |
| `@/lib` | `src/lib/` |
| `@/hooks` | `src/hooks/` |
| `@/stores` | `src/stores/` |
| `@/types` | `src/types/` |
| `@/constants` | `src/constants/` |
| `@/modules` | `src/modules/` |

## File Naming

| Type | Convention |
|------|-----------|
| Components | PascalCase — `ToolHeader.tsx` |
| Hooks | camelCase — `useClipboard.ts` |
| Stores | camelCase + Store — `mobileMenuStore.ts` |
| Utils/lib | camelCase — `transliteration.ts` |
| Pages/routes | lowercase — `page.tsx`, `layout.tsx` |
| MDX content | lowercase-hyphen — `page.mdx` |
