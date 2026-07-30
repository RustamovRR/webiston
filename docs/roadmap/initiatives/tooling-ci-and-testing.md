# Initiative — Tooling, CI & testing foundation

**Spec:** `../../reference/testing-strategy.md` · **Status:** `[ ]` not started

> **Testing model: the Trophy, not the Pyramid.** Confirmed against 2026
> guidance — *"most modern applications are integration code"*; the pyramid stays
> for backend domain logic. `reference/testing-strategy.md` was corrected on
> 2026-07-29 (it had claimed Trophy while drawing a pyramid). **Integration is
> the fat layer** — that is where the effort goes, not unit.

---

## Phase 1 — `[~]` CI (nothing else is real without it)

- `[x]` **`.github/workflows/ci.yml` added — 2026-07-30.** One job, one Node
  version (24, matching the dev machine — a CI/local runtime mismatch is how
  "works on my machine" gets manufactured). Runs **all ten** gates in
  fail-fast order: static checks first (seconds), builds last (minutes).
  `check` · `lint` · `typecheck` · `test` · `tokens` · `contrast` · `i18n` ·
  `packages:build` · `build` · `ext:build`.
  - **corepack, never a pinned pnpm version in the workflow.** `packageManager`
    in package.json is the single source of truth; hardcoding a version here is
    how the pnpm 10-vs-11 `minimumReleaseAge` disagreement happened.
  - `--frozen-lockfile`, so a stale lockfile fails instead of silently resolving.
  - Verified: the workflow references only scripts that exist, contains no tabs,
    and **`pnpm build` succeeds with no `.env`** (tested by moving it aside — all
    five env vars are `NEXT_PUBLIC_*` and optional). CI has no `.env`.
- `[x]` **Extension included** — `pnpm typecheck` excludes `apps/extensions/**`
  (`tsconfig.json`), so `ext:build` is the only gate that compiles it at all.
  Ordered after `packages:build`, since `@webiston/transliteration` feeds both.
- `[x]` **A fresh clone could not build at all — found while answering "is CI
  redundant with Vercel?" (2026-07-30).** `@webiston/transliteration` resolves to
  `./dist/*`, `**/dist/` is gitignored (0 files tracked), and **nothing** built it
  on install: the package has no `prepare`/`postinstall`, the root `prepare` only
  installs lefthook, and there is no `vercel.json`. Proved by moving `dist` aside:

      pnpm build -> exit 1
      Module not found: Can't resolve '@webiston/transliteration'

  Fixed in three places, because one was not enough:
  1. `"prebuild": "pnpm packages:build"` — covers any host that only knows
     `pnpm build` (Vercel). Build order belongs in the manifest, not a dashboard.
  2. `"prepare": "lefthook install && pnpm packages:build"` — covers a fresh
     `pnpm install`.
  3. **`packages:build` as the second CI step, before the static gates** — this
     is the one that actually matters. `prebuild` only guards `build`, and
     `pnpm typecheck` **also** needs dist: on a dist-less tree `tsc --noEmit`
     exits 1 with "Cannot find module '@webiston/transliteration'". CI runs
     typecheck at step 5 and build at step 10, so the first version of this
     workflow would have gone red at typecheck on its very first run.
     `prepare` is not a sufficient guarantee either — `pnpm install` prints
     "Already up to date" and **skips `prepare`** when the tree is unchanged
     (verified: 259 ms, no prepare, dist still missing; `--force` did run it).
  - Verified by replaying all 11 workflow steps in order against a deliberately
    dist-less tree: every step exits 0 except the known `i18n`.
- `[!]` **The first CI run will be RED on `i18n`** — the 8 dead `en`-only keys in
  `messages/tools/url-encoder/en.json`, still awaiting approval to delete. All
  nine other gates pass locally. This is a real failure, not a config problem, so
  it is not being hidden.
- `[ ]` **Unverified: the GitHub Action major versions** (`actions/checkout@v5`,
  `actions/setup-node@v6`). Chosen from memory and **not** confirmed against the
  marketplace from this machine. If the first run fails at the very first step
  with "Unable to resolve action", pin them down a major.
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

- `[x]` **`pnpm check` passes — 81 → 0 errors, 2026-07-29.** Pre-existing —
  **verified identical on Biome 2.4.15**, so the 2.5.6 upgrade did not cause
  them. This gate had never passed in the project's history; it does now.

  **Policy: fix them, do not relax the rules.** They are real defects, not linter
  noise. Exactly one rule earned an exception, and it got *targeted suppressions
  with written reasons* rather than being switched off in `biome.json` — so a new
  violation of it still fails.

  | Rule | Was | Now | Action |
  | ---- | --: | --: | ------ |
  | `noLabelWithoutControl` | 42 | **0** | Two *opposite* fixes, classified per site: **28** genuinely labelled one control → gained `htmlFor` + a stable `id` derived from the label's own `t()` key. **14** were group headings where `<label>` is simply the wrong element → `<span>`. |
  | `noSvgWithoutTitle` | 16 | **0** | 17 decorative SVGs → `aria-hidden="true"`. A `<title>` would make screen readers announce text the adjacent heading already states; Biome documents `aria-hidden` as the accepted fix. |
  | `useKeyWithClickEvents` | 9 | **0** | `<div onClick>` → `<button type="button">` where the markup allowed it. Adding `onKeyDown` to a div silences the rule while leaving the element unfocusable — the element type *is* the bug. |
  | `useIterableCallbackReturn` | 4 | **0** | `forEach((t) => t.stop())` implicitly returns `stop()`'s result; braces make it a statement. |
  | `useMediaCaption` | 3 | **0** | Suppressed with reasons. Two are *hidden* elements — a `<video className="hidden">` used only as a screenshot frame source, and a hidden `<audio>` playing sound the user recorded seconds earlier. No caption track can exist for either. |
  | `noShadowRestrictedNames` | 1 | **0** | `export default function Error()` shadowed the global `Error`; renamed `BookChapterError` (a default export's name is free). |
  | `noRedeclare` | 1 | **0** | Resolved by the label pass. |

  **Where `<button>` was impossible, the fix was structural, not a suppression:**

  - `ColorFormatItem` — the card's `onClick` and its inner copy button ran the
    *same* handler. Nesting `<button>` in `<button>` is invalid HTML, so the card
    became the button and the inner control became a visual `<span>` indicator.
  - `TemplatesPanel` — same nesting problem; the click moved onto the `<Button>`
    that was already there. One obvious affordance beats a secretly-clickable card.
  - `AudioPreviewModal` — a scrub bar you can seek is a **slider**, not a button.
    Given `role="slider"`, `tabIndex`, `aria-valuemin/max/now`, and arrow /
    Home / End key handling.
  - `MobileMenu` — the only genuine suppression: its handler *only* calls
    `stopPropagation()` so clicks inside the panel don't reach the backdrop's
    close handler. There is no action for a keyboard user to trigger.

  **Two real bugs surfaced while doing this**, neither caught by any gate:
  a duplicate `id="file-upload"` shared by two inputs in `JsonFormatter`
  (the label activated the wrong one), and Radix `<Select>` rejecting `id` —
  it belongs on `<SelectTrigger>`. Both fixed; a global check now verifies every
  `htmlFor` resolves to exactly one `id`.

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

- `[x]` **`src/lib/utils/color-conversions.ts` — 16 tests, 2026-07-30.**
  `src/` had zero tests; the suite is now **223 passing across 7 files** (was 207
  across 6). Covers `hexToRgb`, `rgbToHex`, `rgbToHsl`, `hslToRgb`, `isValidHex`,
  including round-trips and the documented asymmetry that `isValidHex` requires a
  leading `#` while `hexToRgb` does not.
  - **The tests earned their keep immediately — they found a live, UI-reachable
    bug.** `rgbToHex` never clamped or rounded, so `c.toString(16)` produced
    invalid CSS outside 0–255: a fraction inserted a literal `.`, a negative
    value a `-`, and 300 produced **seven** hex digits. `parseColorInput` does not
    clamp channels either, so typing `rgb(300, 0, 0)` into the Color Converter
    displayed that 7-digit string to the user as the HEX result. Fixed with
    clamp + round; every in-range input is unchanged.
  - Verified the tests actually catch it: reinstating the original implementation
    fails exactly 2 of 223 (`exit 1`), restoring passes (`exit 0`).
  - **`pnpm tokens` now skips `*.test.ts`.** A test for a colour utility must
    contain hex literals — this file legitimately holds 19 — and the ratchet was
    flagging them as styling violations. Scope fix, not a weakening: verified it
    still exits 1 on a component containing `bg-zinc-900`.
- `[x]` **`usePasswordGenerator` — extracted, secured, 20 tests. 2026-07-30.**
  Generation lived inside a `useCallback`, which made it both untestable and
  quietly insecure: **every character came from `Math.random()`**, which is not a
  CSPRNG. For a password generator that is the product being wrong, not a style
  nit. Moved to `utils/generate-password.ts` — pure, `crypto.getRandomValues`,
  and **rejection sampling rather than `% n`** (modulo on a 32-bit draw is biased
  whenever the range does not divide 2³², so low letters came up more often).
  - `RandomInt` is injectable, so tests are deterministic where they need to be
    and use the real CSPRNG where that is the thing under test. One test stubs
    `Math.random` and asserts it is **never called**.
  - Hook went 480 → 336 lines; `PasswordSettings`, `CHAR_SETS` and
    `MEMORABLE_WORDS` now have one definition instead of two.
  - "Strong" now actually guarantees one character per enabled class and cannot
    exceed the requested length; the memorable padding loop can no longer spin
    when no alphabet is enabled.
- `[x]` **`src/lib/utils/text.ts` — 15 tests, and a second real bug. 2026-07-30.**
  `truncateText(text, maxLength)` returned **more** characters than its limit:
  `maxLength - suffix.length` goes negative, and a negative end index in
  `String.slice` counts from the end of the string, so
  `truncateText("abcdef", 2)` produced an 8-character result. Clamped. Verified
  the test catches it: reverting fails exactly 2 of 286.
- `[x]` **`src/lib/utils/url.ts` — 16 tests.** Pins the deliberate asymmetry that
  `isValidUrl("webiston.uz")` is true while `isSecureUrl("webiston.uz")` is false,
  and that `extractQueryParams` keeps the **last** value of a repeated key.
- `[x]` **`src/lib/seo.ts` — 12 tests.** The canonical/hreflang rules that fixed
  229 book chapters and every `/en` page are now pinned, including the
  `title: { template }` case where no share card can be generated.
- **Suite: 207 → 286 tests, 6 → 11 files.** `src/` had zero at session start.
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
