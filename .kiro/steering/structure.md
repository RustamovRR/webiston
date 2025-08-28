# Project Structure

## Root Level Organization
- **Configuration files** at root (package.json, tsconfig.json, etc.)
- **Source code** in `src/` directory
- **Content** in `content/` directory (MDX files)
- **Public assets** in `public/` directory
- **Scripts** in `scripts/` directory
- **Internationalization** messages in `messages/` directory

## Source Directory (`src/`)

### App Router Structure (`src/app/`)
```
src/app/
├── (app)/[locale]/          # Internationalized app routes
├── api/                     # API routes
├── books/                   # Book content pages
├── globals.css              # Global styles
├── layout.tsx               # Root layout
└── manifest.ts              # PWA manifest
```

### Component Architecture (`src/components/`)
- **`shared/`** - Reusable components (Header, Footer, Search, etc.)
- **`ui/`** - Base UI components (shadcn/ui components)
- **`mdx/`** - MDX-specific components (CodeBlock, Callout, etc.)
- **`index.ts`** - Barrel exports for clean imports

### Library Functions (`src/lib/`)
- **`utils/`** - Utility functions and helpers
- **`config/`** - Configuration files
- **`search/`** - Search functionality
- **Common utilities** - transliteration, content processing, etc.

### Other Directories
- **`src/hooks/`** - Custom React hooks
- **`src/stores/`** - Zustand state management
- **`src/types/`** - TypeScript type definitions
- **`src/constants/`** - Application constants
- **`src/modules/`** - Feature-specific modules (tools)
- **`src/i18n/`** - Internationalization configuration

## Content Structure (`content/`)
```
content/
├── fluent-react/            # React tutorial content
└── javascript-definitive-guide/  # JavaScript guide content
```
- Each content section has nested folders with `page.mdx` files
- `_meta.json` files for navigation configuration

## Asset Organization (`public/`)
- **Static assets** organized by feature/book
- **Icons and favicons** at root level
- **Generated files** (sitemap.xml, search-index.json)

## Key Conventions

### File Naming
- **Components**: PascalCase (e.g., `ButtonLink.tsx`)
- **Utilities**: camelCase (e.g., `transliteration.ts`)
- **Pages**: lowercase with hyphens (e.g., `page.mdx`)
- **Types**: PascalCase interfaces/types

### Import Patterns
- Use barrel exports (`index.ts`) for clean imports
- Path aliases configured: `@/*` maps to `src/*`
- Component imports: `@/components`, `@/lib`, `@/hooks`, etc.

### Code Organization
- **Feature-based** organization in modules
- **Shared components** for reusable UI elements
- **Type definitions** centralized in `src/types/`
- **Constants** separated by domain (UI, tools, navigation)

### Internationalization Structure
- Messages organized by feature in `messages/` directory
- Nested structure: `messages/tools/[tool-name]/[locale].json`
- Common messages in `messages/common/[locale].json`