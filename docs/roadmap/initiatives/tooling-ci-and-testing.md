# Initiative — Tooling, CI & testing foundation

**Spec:** `../../reference/testing-strategy.md` · **Status:** `[ ]` not started

> **Testing model: the Trophy, not the Pyramid.** Confirmed against 2026
> guidance — *"most modern applications are integration code"*; the pyramid stays
> for backend domain logic. `reference/testing-strategy.md` was corrected on
> 2026-07-29 (it had claimed Trophy while drawing a pyramid). **Integration is
> the fat layer** — that is where the effort goes, not unit.

---

## Phase 1 — `[ ]` CI (nothing else is real without it)

There is **no `.github/` at all**. Lefthook is the only gate, and `--no-verify`
bypasses it silently. Every other phase here is undone by one bypassed push.

- `[ ]` One workflow, single Node 22 job (a matrix buys a solo project nothing):
  `check` · `lint` · `typecheck` · `test` · `build` · `ext:build` · `packages:build`.
- `[ ]` Must include the extension — `pnpm typecheck` **excludes**
  `apps/extensions/**` (`tsconfig.json:27`), so the extension is typechecked by
  nothing today.
- `[x]` **Pinned the package manager — 2026-07-29.** `packageManager: "pnpm@11.15.1"`.
  This was not hypothetical: a local pnpm 10.18.1 and a corepack pnpm 11.15.1
  disagreed about the `minimumReleaseAge` supply-chain policy, so `pnpm install`
  failed the policy check, never built the link layer, and every subsequent
  command re-triggered the install. It presented as "broken node_modules" and
  cost hours. Also recorded the policy explicitly in `pnpm-workspace.yaml`
  (`minimumReleaseAge: 1440`) plus `allowBuilds` decisions, so behaviour no
  longer depends on which pnpm someone runs.
- `[ ]` **Empty `minimumReleaseAgeExclude`.** 10 packages from the 2026-07-29
  upgrade were still inside the 24h publish window and are temporarily exempt.
  Each ages out on its own — delete the block once `pnpm install` passes without
  it, or those packages stay exempt from the policy forever.

**Exit:** a PR with a deliberate type error fails CI.

## Phase 2 — `[ ]` Make the linters mean something

- `[ ]` **Clear the 81 `pnpm check` errors.** Pre-existing — **verified identical
  on Biome 2.4.15**, so the 2.5.6 upgrade did not cause them. This gate has never
  passed. Breakdown: `noLabelWithoutControl` 42 · `noSvgWithoutTitle` 16 ·
  `useKeyWithClickEvents` 9 · `organizeImports` 5 · `useIterableCallbackReturn` 4 ·
  `useMediaCaption` 3 · 2 others. **Mostly a11y** — this is the accessibility
  work that `design-system.md` deliberately excludes.
  The 5 `organizeImports` are auto-fixable with `pnpm format`.
- `[ ]` **Decide oxlint's fate.** Today it lints with 27 core rules and **no
  plugins** (`oxlint.json` has no `plugins` key), so react / react-hooks / nextjs
  / jsx-a11y never run — and it exits 0 even with 25 warnings. Either enable the
  plugins and `--deny-warnings`, or drop it: Biome already does format + lint +
  import sorting in one pass, and two linters means two configs and duplicated
  noise. **Removal needs approval.**

## Phase 3 — `[ ]` First tests in `src/`

`src/` has **zero** tests; the 207 passing tests are all in
`packages/transliteration`. No config work is needed — `vitest.config.ts:11`
already includes `src/**/*.test.{ts,tsx}`.

Order by value-per-test (pure logic, high blast radius):

- `[ ]` `src/lib/utils/color-conversions.ts` — `hexToRgb`, `rgbToHsl`, `hslToRgb`,
  `rgbToHex`, `isValidHex`. Pure, and consumed by shipped UI.
- `[ ]` `usePasswordGenerator` — also the file with the `Math.random()` defect, so
  the test pins the fix.
- `[ ]` `useQrGenerator` (570 lines) · `useOgMetaGenerator` (597) · `useMicrophoneTest` (515)
- `[ ]` Per the Trophy: once the units are covered, **integration tests are the fat
  layer** — render a whole tool with React Testing Library and drive it as a user.

## Phase 3b — `[ ]` Close the gap the token ratchet cannot see

`pnpm tokens` counts hardcoded colour. It is **blind to a whole class of
regression**: removing a `dark:` variant while leaving its light partner
unconverted keeps the count flat but breaks dark mode. That is exactly how 4
regressions shipped on 2026-07-29 (see `design-system.md`).

- `[ ]` Add an `orphaned-dark` check to `scripts/token-guardrail.mjs`: fail when
  a file contains a light palette class whose `dark:` sibling was removed
  relative to the baseline.
- `[ ]` Fix already applied to the same script: it used a
  `git ls-files 'src/**/*.ts'` pathspec, and git's `**` requires an intervening
  directory — so `src/middleware.ts` was **invisible to the gate**. Now lists
  trees and filters by extension. Coverage verified 427/427.

## Phase 4 — `[ ]` Build warnings (each is a real defect)

- `[ ]` **Wrong workspace root.** The build warns Next inferred the root as
  `/Users/risqiddinrustamov/package-lock.json` — a stray lockfile in `$HOME`.
  Set `turbopack.root` in `next.config.ts`, or delete the stray file.
- `[ ]` **NFT over-tracing.** `src/lib/mdx.ts` uses `process.cwd()` with dynamic
  paths (lines 109, 127, 173, 305), so Turbopack traces the *whole project* into
  the standalone output. Scope the paths statically.
- `[ ]` **`middleware` → `proxy`.** Next 16.2 deprecates the `middleware` file
  convention and warns on every build. `src/middleware.ts`.

## Phase 5 — `[ ]` Dependency hygiene (removals need approval)

All verified by grepping for real import sites:

- `hast` — **deprecated**, **0 import sites**
- `@types/hast` — 0 uses
- `autoprefixer` — not in `postcss.config.mjs`; Tailwind v4 does not need it
- `motion` vs `framer-motion` — the same library under two names; 27 files import
  `framer-motion`, 1 imports `motion`

---

## Already done (see `../../archive/2026-07_dependency-upgrade-and-tooling.md`)

- `[x]` Hooks made fast and un-hangable — pre-commit 0.16s, pre-push 2.39s.
- `[x]` Biome's **linter** now runs in pre-commit (it previously ran
  `biome format`, so the linter ran nowhere — that is how 81 errors accumulated).
- `[x]` `packages:build` added to pre-push — the only gate covering the extension.
