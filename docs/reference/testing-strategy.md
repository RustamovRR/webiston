# Testing Strategy

> **Status check (verified 2026-07-29, branch `dev`).** Most of this document is
> the *target*, not the current state. What is actually true today:
>
> - **6 test files exist, all in `packages/transliteration/__tests__/`.**
>   `src/` — every tool, hook, store, and util — has **zero** tests.
> - `pnpm test` runs `vitest run`; `vitest.config.ts` already includes
>   `src/**/*.test.{ts,tsx}`, so new tests are picked up with no config work.
> - The **only** automated gate is the Lefthook `pre-push` hook (typecheck +
>   test). There is **no CI** — no `.github/workflows`, no `vercel.json`. The
>   "Pull request checks / Main branch commits" line under *CI/CD Integration*
>   below is aspirational, not a description of reality.
> - `pnpm typecheck` excludes `apps/extensions/**` (`tsconfig.json:27`).
>
> Where to start: the tool business-logic hooks (`useQrGenerator`,
> `useOgMetaGenerator`, `usePasswordGenerator`, …) are pure-ish and the highest
> value per test written. See `docs/roadmap/backlog.md`.

## Overview

This document outlines the testing strategy for Webiston project, following industry best practices and the Testing Trophy approach.

## Testing Philosophy

We follow the **Testing Trophy** model (Kent C. Dodds):

```
    ▲ E2E Tests (few)
   ▲▲▲ Integration Tests (more)
  ▲▲▲▲▲ Unit Tests (most)
 ▲▲▲▲▲▲▲ Static Analysis (TypeScript, Linting)
```

## Test Types

### 1. Static Analysis (Foundation)
- **TypeScript**: Type checking (`pnpm typecheck`)
- **OXLint**: Fast linting (`pnpm lint`)
- **Biome**: Code formatting (`pnpm format:check`)

### 2. Unit Tests
Test individual functions in isolation.

**What to test:**
- Pure utility functions
- Data transformations
- Business logic
- Edge cases

**What NOT to test:**
- React components (prefer integration)
- Third-party libraries
- Implementation details

### 3. Integration Tests
Test how components work together.

**What to test:**
- User interactions
- Component behavior
- Hook logic with components
- API integrations

### 4. E2E Tests (Future)
Test complete user flows.

**When to add:**
- Critical user journeys
- Payment flows
- Authentication

## Coverage Goals

| Type | Target | Priority |
|------|--------|----------|
| Utility functions | 90%+ | High |
| Hooks | 80%+ | Medium |
| Components | 70%+ | Medium |
| E2E | Critical paths | Low |

## Testing Tools

- **Vitest**: Unit & integration tests (fast, Vite-native)
- **React Testing Library**: Component testing
- **MSW**: API mocking (future)
- **Playwright**: E2E tests (future)

## File Structure

```
src/
├── modules/
│   └── tools/
│       └── LatinCyrillic/
│           ├── __tests__/
│           │   ├── transliterate.test.ts    # Unit tests
│           │   ├── helpers.test.ts          # Unit tests
│           │   └── integration.test.tsx     # Integration tests
│           └── ...
└── ...
```

## Naming Conventions

- Test files: `*.test.ts` or `*.test.tsx`
- Test descriptions: Use clear, behavior-focused language
- Follow AAA pattern: Arrange, Act, Assert

## Example Test Structure

```typescript
describe("toCyrillic", () => {
  describe("basic transliteration", () => {
    it("converts simple Latin text to Cyrillic", () => {
      expect(toCyrillic("salom")).toBe("салом")
    })
  })

  describe("edge cases", () => {
    it("handles empty string", () => {
      expect(toCyrillic("")).toBe("")
    })
  })
})
```

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run with coverage
pnpm test:coverage

# Run specific file
pnpm test transliterate
```

## CI/CD Integration

Tests run automatically on:
- Pre-push hook (via Lefthook)
- Pull request checks
- Main branch commits

## Best Practices

1. **Test behavior, not implementation**
2. **Keep tests simple and readable**
3. **One assertion per test (when possible)**
4. **Use descriptive test names**
5. **Avoid testing third-party code**
6. **Mock external dependencies**
7. **Test edge cases and error states**

## Module-Specific Guidelines

### LatinCyrillic Module

Priority test cases:
1. Basic Latin → Cyrillic conversion
2. Basic Cyrillic → Latin conversion
3. Uzbek-specific characters (ў, ғ, қ, ҳ)
4. Russian-specific characters (щ, ы, ъ, ь)
5. Digraphs (sh, ch, ng, g', o')
6. Apostrophe normalization
7. Protected content (URLs, emails, code)
8. Case preservation
9. Word boundary handling
10. Empty/null input handling
