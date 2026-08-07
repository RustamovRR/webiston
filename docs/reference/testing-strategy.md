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

We follow the **Testing Trophy** (Kent C. Dodds), **not** the Testing Pyramid.

> ⚠️ **This document previously claimed "Trophy" while drawing a pyramid**
> (unit as the widest layer). That is the Trophy upside-down, and it pointed the
> whole strategy at the wrong layer. Corrected 2026-07-29.

```
      ╱‾‾‾╲        E2E              — few; only critical journeys
     ╱─────╲
    │       │      INTEGRATION      — THE FAT LAYER: most of your effort
    │       │
     ╲_____╱       Unit             — pure logic only
   ▔▔▔▔▔▔▔▔▔▔▔     Static analysis  — TypeScript + Biome, free on every save
```

**Why the Trophy and not the Pyramid, for this repo specifically:**
a React component that renders state, calls a hook, formats output and writes to
a store is not a unit — it is a small system, and its bugs live in how the pieces
connect, not inside any one of them. The Pyramid is the right shape for a backend
with heavy domain logic; the Trophy is the right shape for a frontend. Webiston is
a frontend, so integration tests earn the most confidence per line written.

**The one exception in this repo:** `packages/transliteration` is pure,
dependency-free domain logic with thousands of edge cases — that package is a
*pyramid*, and its 207 unit tests are correct exactly as they are. Shape the tests
to the code, not to a slogan.

## Test Types

### 1. Static Analysis (Foundation)
- **TypeScript**: type checking (`pnpm typecheck`) — TS 7, runs in ~0.4s
- **Biome**: formatting **and** linting (`pnpm check`) — the primary linter
- **oxlint**: secondary linter (`pnpm lint`); see `roadmap/backlog.md` — running
  two linters over the same files is redundant and is queued for a decision

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

Coverage is a **smoke detector, not a score**. A number does not tell you the
tests are good; it only tells you where there are none at all. Chase the
percentage and you get tests written to touch lines rather than to catch bugs.

| Layer | Target | Priority | Why |
|------|------|----------|-----|
| `packages/transliteration` | 90%+ | High | pure logic, huge edge-case surface, ships to 2 products |
| `src/lib/` utils | 90%+ | High | pure, and every tool depends on them |
| Tool business-logic hooks | 70%+ | High | where the actual bugs are |
| Components (integration) | behaviour, not % | High | test what a user does, via RTL |
| Presentational components | none | — | testing these tests React, not you |
| E2E | ~5 critical journeys | Medium | book reading, search, one tool round-trip |

**Current reality (2026-07-29):** 207 tests, all in `packages/transliteration`.
`src/` has zero. The first tests to write are listed in `roadmap/backlog.md`.

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
