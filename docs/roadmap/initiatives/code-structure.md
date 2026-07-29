# Initiative — Code structure & type safety

**Spec:** `../../reference/architecture.md` + `../../reference/code-rules.md` ·
**Status:** `[~]` in progress

> **Architectural verdict (2026-07-29, researched).** We are **not** adopting
> Feature-Sliced Design. Recorded as `adr/0004`. The short version: FSD's own
> Next.js guide says the App Router conflicts with it (you must rename layers to
> `_app`/`_pages` to stop Next routing them); Next.js is explicitly unopinionated
> about structure; and FSD's payoff is team ownership boundaries, which a solo
> maintainer does not have. `modules/tools/{Tool}/` is *already* a feature slice.
> **The work is to make it consistent, not to replace it.**

---

## Phase 1 — `[~]` Package boundaries

- `[x]` **Removed all 3 `@/` imports from `packages/ui`** — a package may never
  import app code. `dialog.tsx:7` now uses `../utils/cn` (matching the other 18
  primitives); `mode-switch.tsx:2` and `gradient-tabs.tsx:9` now use
  `../constants/ui-patterns`. `TOOL_COLORS`/`UI_PATTERNS` moved to
  `packages/ui/src/constants/ui-patterns.ts` because packages/ui is their real
  owner (2 of 3 consumers). Verified: `grep -rn '"@/' packages/` → **0**.
- `[ ]` **Re-export the moved constants from `src/constants/ui-constants.ts`** so
  `ToolPanel.tsx` and `src/constants/index.ts` keep working without duplication.
  ⚠️ Currently **both copies exist** — this phase is not finished.
- `[ ]` **A boundary gate.** Nothing prevents `packages/* → src/`; it already
  happened 3 times. A dependency-cruiser config with a baseline would make
  `architecture.md § 2` enforced rather than aspirational.

## Phase 2 — `[ ]` Collapse the shim layer

`src/components/ui/` is **17 files** of 1-line re-exports from `@webiston/ui`,
plus a large barrel in `index.ts`. **67 files** import through it. Two import
paths for one component invites drift.

- `[ ]` Rewrite the 67 files' imports `@/components/ui` → `@webiston/ui`.
- `[ ]` Delete the 17 shim files.
**Exit:** `grep -rl "@/components/ui" src/` returns nothing.

> **Monorepo note.** `@webiston/transliteration` is genuinely shared (3 files in
> `src/`, 3 in the extension) — it justifies the monorepo on its own.
> `@webiston/ui` has **28 consumers in `src/` and 0 in the extension**. We keep
> the package (it makes the design-system initiative tractable) but the shim
> layer is pure cost. See `adr/0004`.

## Phase 3 — `[ ]` Module shape consistency

Only **LatinCyrillic** has the full contract from `code-rules.md § 8`. Two tools
have **no `components/` folder at all** despite being the largest files in the repo:

| Tool | Lines | Has |
| ---- | ----- | --- |
| `HttpStatus.tsx` | 577 | `hooks` only |
| `KeycodeInfo.tsx` | 531 | `hooks` only |
| `LatinCyrillic` | — | components · hooks · constants · utils · types · stores |
| 18 others | — | components · hooks |

- `[ ]` Split `HttpStatus` and `KeycodeInfo` into `components/`.
- `[ ]` Extract tool-scoped literals into each tool's `constants/`.
**Note:** both are `__`-prefixed parked tools — do this only after the
parked-tools decision in `../backlog.md`.

## Phase 4 — `[ ]` Duplication (past the 3-consumer threshold)

- `[ ]` **`downloadBlob()`** — 26 copies of `document.createElement("a")` across
  18 tool modules. Extract to `src/lib/utils/`.
- `[ ]` **`useCopyToClipboard()`** — 11 copies.
- `[ ]` **Date/time formatting** — 42 hits of `toLocaleDateString` /
  `toLocaleTimeString` / `Intl.DateTimeFormat` across `src/`, and **no shared date
  util exists** (`src/lib/utils/` has only colour, text and url helpers). This is
  the "no static text in code" rule: a locale-aware format belongs in one place.
- `[ ]` **Zustand selectors** — `useFileTransliterate.ts:108` and
  `useLatinCyrillic.ts:36` subscribe to the whole store.

## Phase 5 — `[ ]` Type safety

- `[ ]` **Turn on `noExplicitAny`** — `biome.json` has it `"off"` while
  `code-rules.md` claims "no any". **69** `any`s in `src/`. Path: `warn` → fix →
  `error`. Start with `src/app/books/[...slug]/page.tsx:20,144` and
  `layout.tsx:11`, which type route props as `any` instead of the
  `Promise<params>` pattern already used correctly in `(app)/[locale]`.
- `[ ]` **Enable `noUnusedLocals` / `noUnusedParameters`** — the docs already
  claim these are on. oxlint reports 25 such warnings, so the fallout is known
  and small.
- `[ ]` **Consider `noUncheckedIndexedAccess`** — would have caught the
  `stream.getAudioTracks()[0]` class of bug. Real fallout; scope before starting.
- `[ ]` **Strip manual memoization** — React Compiler is on
  (`next.config.ts:19`), making most `useMemo`/`useCallback` dead weight
  (~211 wrappers). Delete file-by-file as you touch each tool, never as a campaign.

## Phase 6 — `[ ]` Resilience

- `[ ]` **Error boundaries.** Only `src/app/books/` has `error.tsx` /
  `not-found.tsx`. `(app)/[locale]` has none and there is no `global-error.tsx`.
- `[ ]` **`Math.random()` in the security tools** — 12 hits in
  `usePasswordGenerator.ts`, 3 in `useUuidGenerator.ts`. A password generator
  seeded from `Math.random()` is predictable. Use `crypto.getRandomValues` /
  `crypto.randomUUID`.
- `[ ]` **Duplicated no-op effect** — `ColorHistory.tsx:35-45` has two
  byte-identical mount effects and never uses its `currentColor` prop, so history
  never refreshes.

## Phase 7 — `[ ]` File size

47+ files exceed the 350-line hard limit (9 exceed 500). **Split what you touch —
this is not a campaign.** Worst: `QrCustomizationPanel.tsx` 631 ·
`WebsiteStatus.tsx` 612 · `useOgMetaGenerator.ts` 597 · `UserAgentAnalyzer.tsx` 589 ·
`HttpStatus.tsx` 577 · `useQrGenerator.ts` 570 · `layout.tsx` 483.
