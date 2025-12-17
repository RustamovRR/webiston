# Webiston Project Architecture

## Overview

**Webiston** is a comprehensive educational platform for Uzbek developers, providing programming books, developer tools, and productivity utilities. Built with Next.js 15 and TypeScript, it features a modern, multilingual interface supporting Uzbek, English, and Russian.

**Tech Stack:**
- **Framework:** Next.js 15.3.3 (App Router)
- **Language:** TypeScript 5.8.3
- **Styling:** Tailwind CSS 4.1.8
- **UI Components:** Radix UI + shadcn/ui (New York style)
- **Content:** MDX with next-mdx-remote
- **i18n:** next-intl
- **State:** Zustand
- **Animation:** Framer Motion
- **Icons:** Lucide React

---

## Project Structure

```
webiston/
├── src/                          # Source code
│   ├── app/                      # Next.js App Router
│   ├── components/               # React components
│   ├── modules/                  # Feature modules (tools)
│   ├── lib/                      # Utilities & helpers
│   ├── hooks/                    # Custom React hooks
│   ├── stores/                   # Zustand state management
│   ├── types/                    # TypeScript definitions
│   ├── constants/                # App constants
│   ├── i18n/                     # Internationalization config
│   └── middleware.ts             # Next.js middleware
│
├── content/                      # MDX content (books)
│   ├── fluent-react/
│   ├── javascript-definitive-guide/
│   └── ai-engineering/
│
├── messages/                     # i18n translations
│   ├── common/                   # Shared translations
│   └── tools/                    # Tool-specific translations
│
├── public/                       # Static assets
│   ├── *.png, *.ico             # Favicons & icons
│   ├── fluent-react/            # Book images
│   ├── javascript-definitive-guide/
│   ├── ai-engineering/
│   ├── search-index.json        # Generated search index
│   └── sitemap.xml              # Generated sitemap
│
├── scripts/                      # Build & automation scripts
│   ├── build-search-index.js
│   └── update-tools-list.js
│
└── Configuration files
    ├── package.json
    ├── next.config.ts
    ├── tsconfig.json
    ├── tailwind.config.ts
    ├── eslint.config.mjs
    └── .prettierrc
```

---

## Core Architecture

### 1. App Router Structure (`src/app/`)

```
src/app/
├── (app)/[locale]/              # Internationalized routes
│   ├── page.tsx                 # Homepage
│   ├── layout.tsx               # App layout
│   └── tools/                   # Tools section
│       ├── page.tsx             # Tools listing
│       ├── layout.tsx           # Tools layout
│       ├── latin-cyrillic/      # Individual tool pages
│       ├── json-formatter/
│       ├── qr-generator/
│       ├── hash-generator/
│       ├── base64-converter/
│       ├── color-converter/
│       ├── password-generator/
│       ├── uuid-generator/
│       ├── jwt-decoder/
│       ├── url-encoder/
│       ├── og-meta-generator/
│       ├── lorem-ipsum/
│       ├── device-info/
│       ├── ip-info/
│       ├── screen-resolution/
│       ├── camera-recorder/
│       └── microphone-test/
│
├── api/                         # API routes
│   └── search/documents/        # Search API
│
├── books/                       # Book content routes
│   └── [book]/[...slug]/        # Dynamic book pages
│
├── layout.tsx                   # Root layout
├── globals.css                  # Global styles
└── manifest.ts                  # PWA manifest
```

**Key Features:**
- Dynamic internationalized routing with `[locale]` parameter
- Grouped routes with `(app)` for layout organization
- API routes for server-side functionality
- Dynamic book routes with catch-all segments

---

### 2. Component Architecture (`src/components/`)

```
src/components/
├── mdx/                         # MDX-specific components
│   ├── MDXContent/              # MDX rendering
│   │   ├── MDXContent.tsx       # Main MDX wrapper
│   │   ├── HeadingLink.tsx      # Linkable headings
│   │   ├── CustomLink.tsx       # Enhanced links
│   │   └── CustomParagraph.tsx  # Custom paragraphs
│   ├── CodeBlock/               # Code syntax highlighting
│   │   ├── CodeBlock.tsx
│   │   ├── CodeBlockSkeleton.tsx
│   │   └── highlight.ts         # Shiki integration
│   ├── Callout/                 # Info/warning boxes
│   ├── ImageViewer/             # Image zoom viewer
│   ├── VideoEmbed/              # Video embeds
│   ├── Sidebar/                 # Book navigation
│   ├── TableOfContents/         # TOC component
│   ├── TutorialLayout/          # Book layout wrapper
│   ├── TutorialContent/         # Book content + pagination
│   ├── TutorialLanding/         # Book landing page
│   └── ContentMeta/             # Book metadata
│
├── shared/                      # Reusable components
│   ├── Header/                  # Site header
│   │   ├── Header.tsx
│   │   ├── Logo.tsx
│   │   ├── MobileMenu.tsx
│   │   ├── MobileMenuButton.tsx
│   │   └── MobileMenuContent.tsx
│   ├── Footer/                  # Site footer
│   │   ├── Footer.tsx
│   │   └── SocialMedia.tsx
│   ├── Search/                  # Global search
│   │   ├── Search.tsx
│   │   ├── SearchDialog.tsx
│   │   └── SearchComponents.tsx
│   ├── ThemeToggle/             # Dark/light mode
│   ├── LanguageSelector/        # Language switcher
│   ├── ToolHeader/              # Tool page header
│   ├── CopyButton/              # Copy to clipboard
│   ├── InfoCard/                # Info display card
│   ├── SimpleCard/              # Basic card
│   ├── StatsDisplay/            # Statistics display
│   ├── DualTextPanel/           # Two-panel layout
│   ├── TerminalInput/           # Terminal-style input
│   ├── ButtonLink/              # Link styled as button
│   └── Providers.tsx            # Context providers
│
└── ui/                          # shadcn/ui base components
    ├── button.tsx
    ├── input.tsx
    ├── textarea.tsx
    ├── card.tsx
    ├── dialog.tsx
    ├── select.tsx
    ├── accordion.tsx
    ├── dropdown-menu.tsx
    ├── navigation-menu.tsx
    ├── separator.tsx
    ├── badge.tsx
    ├── skeleton.tsx
    ├── sonner.tsx               # Toast notifications
    ├── tool-panel.tsx           # Tool container
    ├── gradient-tabs.tsx        # Animated tabs
    ├── aurora-text.tsx          # Animated text
    ├── number-ticker.tsx        # Number animation
    └── AnimatedWords/           # Word animations
```

**Component Patterns:**
- **Barrel exports** via `index.ts` for clean imports
- **Composition** over inheritance
- **Separation of concerns**: MDX, shared, and base UI components
- **Consistent naming**: PascalCase for components

---

### 3. Tools Module Architecture (`src/modules/tools/`)

```
src/modules/tools/
├── ToolsMainPage.tsx            # Tools listing page
├── index.ts                     # Barrel exports
│
└── [ToolName]/                  # Individual tool structure
    ├── index.ts                 # Export
    ├── [ToolName].tsx           # Main component
    ├── components/              # Tool-specific components
    │   ├── ControlPanel.tsx
    │   ├── OutputDisplay.tsx
    │   └── InfoSection.tsx
    ├── hooks/                   # Tool-specific hooks (optional)
    │   └── use[ToolName].ts
    ├── utils/                   # Tool utilities (optional)
    │   └── calculations.ts
    └── constants/               # Tool constants (optional)
        └── config.ts

Example Tools:
├── LatinCyrillic/               # Latin-Cyrillic converter
│   ├── LatinCyrillic.tsx
│   ├── components/
│   │   ├── ConverterPanel.tsx
│   │   ├── OutputDisplay.tsx
│   │   └── InfoSection.tsx
│   └── constants/
│       └── transliteration.ts
│
├── JsonFormatter/               # JSON formatter
│   ├── JsonFormatter.tsx
│   └── components/
│       ├── EditorPanel.tsx
│       ├── FormattedOutput.tsx
│       └── InfoSection.tsx
│
├── QrGenerator/                 # QR code generator
├── HashGenerator/               # Hash generator
├── Base64Converter/             # Base64 encoder/decoder
├── ColorConverter/              # Color format converter
├── PasswordGenerator/           # Password generator
├── UuidGenerator/               # UUID generator
├── JwtDecoder/                  # JWT decoder
├── UrlEncoder/                  # URL encoder/decoder
├── OgMetaGenerator/             # OG meta tag generator
├── LoremIpsum/                  # Lorem ipsum generator
├── DeviceInfo/                  # Device information
├── IpInfo/                      # IP information
├── ScreenResolution/            # Screen resolution info
├── CameraRecorder/              # Camera recorder
└── MicrophoneTest/              # Microphone tester
```

**Tool Architecture Pattern:**
1. **Main Component**: Entry point, layout, and orchestration
2. **Sub-components**: Specific UI sections (panels, displays, info)
3. **Hooks**: Business logic and state management
4. **Utils**: Pure functions for calculations/transformations
5. **Constants**: Configuration and static data

---

### 4. Hooks Architecture (`src/hooks/`)

```
src/hooks/
├── index.ts                     # Barrel exports
└── tools/                       # Tool-specific hooks
    ├── useLatinCyrillic.ts      # Latin-Cyrillic logic
    ├── useJsonFormatter.ts      # JSON formatting logic
    ├── useHashGenerator.ts      # Hash generation logic
    ├── usePasswordGenerator.ts  # Password generation logic
    ├── useColorConverter.ts     # Color conversion logic
    └── ...
```

**Hook Patterns:**
- Encapsulate business logic
- Manage local state
- Handle side effects
- Return data and actions
- Reusable across components

---

### 5. Library & Utilities (`src/lib/`)

```
src/lib/
├── index.ts                     # Barrel exports
├── common.ts                    # Common utilities
├── content.ts                   # Content processing
├── mdx.ts                       # MDX utilities
├── transliteration.ts           # Text transliteration
├── mock-search-data.ts          # Search mock data
│
├── search/                      # Search functionality
│   └── flexsearch.ts            # FlexSearch integration
│
└── utils/                       # Utility functions
    ├── index.ts
    ├── text.ts                  # Text utilities
    ├── url.ts                   # URL utilities
    ├── color-conversions.ts     # Color conversions
    ├── color-parser.ts          # Color parsing
    ├── color-spaces.ts          # Color space math
    ├── color-palettes.ts        # Color palettes
    └── color-storage.ts         # LocalStorage helpers
```

**Utility Categories:**
- **Content**: MDX processing, front matter parsing
- **Search**: FlexSearch index and queries
- **Text**: String manipulation, transliteration
- **Color**: Color space conversions and parsing
- **URL**: URL encoding/decoding utilities

---

### 6. State Management (`src/stores/`)

```
src/stores/
├── index.ts                     # Barrel exports
├── mobileMenuStore.ts           # Mobile menu state
└── navigationStore.ts           # Navigation state (TOC, active section)
```

**Zustand Stores:**
- Lightweight global state
- Simple API with hooks
- Used for UI state (menus, navigation)
- No complex state management needed

---

### 7. Content Management (`content/`)

```
content/
├── fluent-react/                # React book
│   ├── _meta.json               # Navigation config
│   ├── page.mdx                 # Landing page
│   ├── preface/
│   │   └── page.mdx
│   ├── entry-level-stuff/
│   │   ├── _meta.json
│   │   ├── 1-what-is-react/
│   │   │   └── page.mdx
│   │   └── 2-components/
│   │       └── page.mdx
│   ├── jsx/
│   ├── virtual-dom/
│   ├── inside-reconciliation/
│   ├── concurrent-react/
│   ├── server-side-react/
│   ├── react-server-components/
│   ├── powerful-patterns/
│   ├── frameworks/
│   ├── react-alternatives/
│   └── common-questions/
│
├── javascript-definitive-guide/  # JavaScript book
│   ├── _meta.json
│   ├── preface/
│   ├── 1-introduction-to-javascript/
│   ├── 2-lexical-structure/
│   ├── 3-types-and-variables/
│   ├── 4-expressions-and-operators/
│   ├── 5-statements/
│   ├── 6-objects/
│   ├── 7-arrays/
│   └── 8-functions/
│
└── ai-engineering/              # AI Engineering book
    ├── _meta.json
    ├── preface/
    ├── praise/
    ├── 1-introduction-to-building-ai-applications-with-foundation-models/
    ├── 2-understanding-foundation-models/
    ├── 3-evaluation-methodology/
    ├── 4-evaluate-ai-systems/
    └── 5-prompt-engineering/
```

**Content Structure:**
- **`_meta.json`**: Navigation configuration (order, titles)
- **`page.mdx`**: Page content with front matter
- **Nested folders**: Chapter/section organization
- **Front matter**: Metadata (title, description, date)

---

### 8. Internationalization (`messages/`)

```
messages/
├── index.js                     # Message loader
├── README.md                    # i18n documentation
│
├── common/                      # Shared translations
│   ├── uz.json                  # Uzbek
│   └── en.json                  # English
│
└── tools/                       # Tool-specific translations
    ├── tools-page/              # Tools listing page
    │   ├── uz.json
    │   └── en.json
    ├── latin-cyrillic/
    │   ├── uz.json
    │   └── en.json
    ├── json-formatter/
    ├── qr-generator/
    ├── hash-generator/
    ├── base64-converter/
    ├── color-converter/
    ├── password-generator/
    ├── uuid-generator/
    ├── jwt-decoder/
    ├── url-encoder/
    ├── og-meta-generator/
    ├── lorem-ipsum/
    ├── device-info/
    ├── ip-info/
    ├── screen-resolution/
    ├── camera-recorder/
    └── microphone-test/
```

**i18n Pattern:**
- **Namespaced translations**: Organized by feature
- **Lazy loading**: Load only needed translations
- **Type-safe**: TypeScript integration with next-intl
- **Supported locales**: `uz` (default), `en`, `ru`

---

### 9. Constants & Configuration (`src/constants/`)

```
src/constants/
├── index.ts                     # Barrel exports
├── ui.ts                        # Tools list & categories
├── ui-constants.ts              # UI constants
├── navigation.tsx               # Navigation config
├── tools.ts                     # Tool metadata
├── tool-constants.ts            # Tool-specific constants
├── transliteration.ts           # Transliteration maps
└── color-names.ts               # Color name database
```

**Key Constants:**
- **`TOOLS_LIST`**: All tools with metadata (icon, color, category)
- **`TOOL_CATEGORIES`**: Tool grouping (converters, generators, analyzers, utilities)
- **Navigation**: Site navigation structure
- **Transliteration**: Latin-Cyrillic mapping tables

---

### 10. TypeScript Types (`src/types/`)

```
src/types/
├── index.ts                     # Barrel exports
├── common.ts                    # Common types
├── tools.ts                     # Tool types
└── ui.ts                        # UI component types
```

**Type Organization:**
- Centralized type definitions
- Shared across the application
- Strict type checking enabled
- Interface-first approach

---

## Data Flow

### Tool Interaction Flow

```
User Input
    ↓
Tool Page Component (src/app/(app)/[locale]/tools/[tool]/page.tsx)
    ↓
Tool Module Component (src/modules/tools/[Tool]/[Tool].tsx)
    ↓
Custom Hook (src/hooks/tools/use[Tool].ts)
    ↓
Utility Functions (src/lib/utils/)
    ↓
State Update
    ↓
UI Re-render (Sub-components)
    ↓
Display Result
```

### Content Rendering Flow

```
MDX File (content/[book]/[chapter]/page.mdx)
    ↓
MDX Processing (next-mdx-remote)
    ↓
Rehype/Remark Plugins (syntax highlighting, headings, etc.)
    ↓
MDXContent Component (src/components/mdx/MDXContent/)
    ↓
Custom Components (CodeBlock, Callout, etc.)
    ↓
Rendered Page
```

### Search Flow

```
Build Time:
    MDX Files → scripts/build-search-index.js → public/search-index.json

Runtime:
    User Query → Search Component → FlexSearch → Results Display
```

---

## Build & Deployment

### Build Process

```bash
pnpm build
    ↓
1. Next.js build (standalone output)
    ↓
2. postbuild script runs:
    ├── scripts/update-tools-list.js  # Generate tools-list.json
    ├── next-sitemap                  # Generate sitemap.xml
    └── scripts/build-search-index.js # Generate search-index.json
    ↓
3. Output: .next/ directory (ready for deployment)
```

### Scripts

- **`pnpm dev`**: Development server (port 9999, Turbopack)
- **`pnpm build`**: Production build
- **`pnpm start`**: Start production server
- **`pnpm lint`**: Run ESLint
- **`pnpm format`**: Format with Prettier
- **`pnpm update-tools`**: Update tools list

### Deployment Targets

- **Vercel** (current)
- **Cloudflare Pages** (recommended)
- **Netlify**
- **Self-hosted** (VPS with Node.js)

---

## Key Features

### 1. Programming Books
- **Fluent React**: Comprehensive React guide
- **JavaScript Definitive Guide**: JavaScript fundamentals
- **AI Engineering**: AI application development

### 2. Developer Tools (20+ tools)
- **Converters**: Latin-Cyrillic, JSON, Base64, Color, URL, JWT
- **Generators**: QR Code, Hash, UUID, Password, Lorem Ipsum, OG Meta
- **Analyzers**: Device Info, IP Info, Screen Resolution
- **Utilities**: Camera Recorder, Microphone Test

### 3. Multilingual Support
- Primary: Uzbek (uz)
- Secondary: English (en), Russian (ru)
- URL-based locale switching

### 4. Search Functionality
- FlexSearch integration
- Full-text search across books
- Fast client-side search

### 5. Modern UI/UX
- Dark/light mode
- Responsive design
- Smooth animations (Framer Motion)
- Accessible components (Radix UI)

### 6. SEO Optimization
- Structured data (JSON-LD)
- Sitemap generation
- Meta tags
- Open Graph support

---

## Development Guidelines

### Code Organization
- **Feature-based**: Group by feature/module
- **Barrel exports**: Use `index.ts` for clean imports
- **Path aliases**: `@/*` maps to `src/*`
- **Consistent naming**: PascalCase for components, camelCase for utilities

### Component Patterns
- **Composition**: Build complex UIs from simple components
- **Props interface**: Always define TypeScript interfaces
- **Default exports**: For page components
- **Named exports**: For utilities and hooks

### Styling
- **Tailwind CSS**: Utility-first approach
- **CSS Variables**: For theming
- **Responsive**: Mobile-first design
- **Dark mode**: System preference + manual toggle

### State Management
- **Local state**: useState for component state
- **Global state**: Zustand for shared state
- **Server state**: Native fetch (no React Query for this project)
- **URL state**: Next.js router for navigation state

### Performance
- **Code splitting**: Automatic with Next.js
- **Image optimization**: next/image (disabled for static export)
- **Font optimization**: next/font
- **Bundle analysis**: Monitor bundle size

---

## Future Enhancements

### Planned Features
- Currency Converter (CBU API integration)
- Code Screenshot Tool (Carbon.now.sh alternative)
- More programming books
- User accounts & preferences
- Tool favorites & history
- API documentation
- Blog section

### Technical Improvements
- E2E testing (Playwright)
- Unit testing (Vitest)
- Performance monitoring
- Error tracking
- Analytics dashboard
- CI/CD pipeline

---

## Summary

Webiston is a well-architected Next.js application with:
- **Clear separation of concerns**: Components, modules, utilities
- **Scalable structure**: Easy to add new tools and content
- **Type-safe**: Full TypeScript coverage
- **Modern stack**: Latest Next.js, React, and tooling
- **Developer-friendly**: Consistent patterns and conventions
- **Production-ready**: Optimized build and deployment

The architecture supports rapid feature development while maintaining code quality and performance.
