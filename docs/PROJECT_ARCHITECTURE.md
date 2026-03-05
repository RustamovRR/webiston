# Webiston Monorepo Architecture

## Overview

Professional monorepo structure following Google/Turborepo patterns with shared packages.

```
webiston/
├── apps/
│   └── extensions/
│       └── latin-cyrillic/     # Chrome extension (Plasmo)
├── packages/
│   ├── transliteration/        # @webiston/transliteration - Pure logic
│   └── ui/                     # @webiston/ui - Shared UI components
├── src/                        # Next.js web application
│   ├── app/                    # App Router pages
│   ├── components/
│   │   ├── ui/                 # Re-exports from @webiston/ui
│   │   ├── shared/             # App-specific shared components
│   │   └── mdx/                # MDX components
│   ├── modules/                # Feature modules (tools)
│   └── ...
└── package.json
```

## Packages

### @webiston/transliteration
Pure TypeScript library for Uzbek Latin-Cyrillic transliteration.
- No framework dependencies
- Used by both web app and extension
- Single source of truth for transliteration logic

### @webiston/ui
Shared UI components built on Shadcn/ui + Radix UI.
- **primitives/** - Base components (Button, Input, Dialog, etc.)
- **composites/** - Pure composed components (BaseModal, CopyButton, etc.)
- **utils/** - cn() function for class merging

## Component Architecture

### Pure UI (packages/ui)
Framework-agnostic components without app-specific dependencies:
- Button, Input, Dialog, Select, etc.
- BaseModal, CopyButton, InfoCard, StatsDisplay

### App-Specific (src/components/shared)
Components with Next.js/next-intl dependencies:
- DualTextPanel, ToolHeader, TerminalInput
- Header, Footer, Search
- SectionTitle, SimpleCard

## Import Patterns

```typescript
// From @webiston/ui (recommended)
import { Button, CopyButton, cn } from "@webiston/ui"

// From local re-exports (backward compatible)
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/shared/CopyButton"

// From @webiston/transliteration
import { toLatin, toCyrillic, detectScript } from "@webiston/transliteration"
```

## Dependency Rules

```
┌─────────────────┐     ┌─────────────────┐
│  apps/extension │     │   src/ (web)    │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
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

**Rules:**
- ✅ Apps can import from packages
- ✅ Packages can import from other packages
- ❌ Apps cannot import from each other
- ❌ Packages cannot import from apps

## Development

```bash
# Install dependencies
pnpm install

# Development
pnpm dev

# Type checking
pnpm typecheck

# Build
pnpm build

# Extension development
cd apps/extensions/latin-cyrillic
pnpm dev
```
