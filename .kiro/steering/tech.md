# Technology Stack

## Framework & Runtime
- **Next.js 15.3.3** - React framework with App Router
- **React 19.1.0** - UI library
- **TypeScript 5.8.3** - Type-safe JavaScript
- **Node.js** - Runtime environment

## Styling & UI
- **Tailwind CSS 4.1.8** - Utility-first CSS framework
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
- **clsx & tailwind-merge** - Conditional styling

## Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **lint-staged** - Pre-commit linting
- **Commitlint** - Commit message linting

## Analytics & Monitoring
- **Google Analytics** - Web analytics
- **Yandex Metrica** - Russian analytics
- **OpenReplay** - Session recording

## Common Commands

```bash
# Development
pnpm dev              # Start development server with Turbopack
pnpm build            # Build for production
pnpm start            # Start production server

# Code Quality
pnpm lint             # Run ESLint
pnpm format           # Format code with Prettier

# Content Management
pnpm update-tools     # Update tools list
pnpm postbuild        # Post-build tasks (sitemap, search index)
```

## Build Process
1. Next.js build with standalone output
2. Tools list generation
3. Sitemap generation with next-sitemap
4. Search index building