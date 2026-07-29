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

- `[~]` **Clear the `pnpm check` errors — 81 → 59.** Pre-existing — **verified
  identical on Biome 2.4.15**, so the 2.5.6 upgrade did not cause them; this gate
  has never passed.

  **Policy: fix them, do not relax the rules.** They are real defects, not linter
  noise. Exactly one rule earned an exception, and it got *targeted suppressions
  with written reasons* rather than being switched off in `biome.json` — so a new
  violation of it still fails.

  | Rule | Was | Now | Action |
  | ---- | --: | --: | ------ |
  | `noSvgWithoutTitle` | 16 | **0** | 17 decorative SVGs → `aria-hidden="true"`. A `<title>` would make screen readers announce text the adjacent heading already states; `aria-hidden` is the correct fix and Biome documents it as accepted. |
  | `useMediaCaption` | 3 | **0** | Suppressed with reasons. Two are *hidden* elements — a `<video className="hidden">` used only as a screenshot frame source, and a hidden `<audio>` playing sound the user recorded seconds earlier. No caption track can exist for either. |
  | `useKeyWithClickEvents` | 9 | **6** | `<div onClick>` → `<button type="button">`. Adding `onKeyDown` to a div silences the rule while leaving the element unfocusable — the element type *is* the bug. |
  | `noLabelWithoutControl` | 42 | 42 | Not started — the largest remaining block. |

- `[ ]` **`VideoEmbed` cannot accept captions.** It takes `{url, title}` only, so
  a book chapter embedding video has no way to supply a track. Add a `captions`
  prop, then remove the suppression in
  `src/components/mdx/VideoEmbed/VideoEmbed.tsx`. The suppression there is a
  placeholder, not a verdict that captions are unnecessary.
- `[ ]` **Two pre-existing `<explanation>` placeholder suppressions** —
  `packages/ui/src/primitives/breadcrumb.tsx:54` and
  `src/modules/tools/LatinCyrillic/components/FileUploadZone.tsx:72`. Biome warns
  on a suppression with no stated reason. Give them one or delete them.
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
