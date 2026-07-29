# Initiative — Design system & token migration

**Spec:** `../../reference/design-system.md` · **Status:** `[~]` Phases A + B
shipped 2026-07-29; C–E open · **Size:** the largest initiative in the repo.

> **Phase A set the token values, Phase B locked them in.** Phases C–E now
> rewrite ~5,400 call sites to consume those tokens. The order mattered: doing C
> before A would have meant rewriting every call site twice.

## Brand hue — decided 2026-07-29

**217°**, derived from the Uzbek flag blue `#0099B5` (= `oklch(0.63 0.112 216.9)`).
Chosen over the default indigo (~260°) because it is distinctive for a developer
platform and harmonises with the cyan/teal already in `TOOL_COLORS`.

The full ramp is fitted to the sRGB gamut — max in-gamut chroma × 0.97 per
lightness step, so no value is silently clipped by the browser. Verify any change
with `pnpm contrast`.

---

## The measured problem (2026-07-29, branch `refactor`)

| Metric | Value | Command |
| ------ | ----- | ------- |
| Tailwind palette class hits | **4,987** | `grep -rEo "(bg\|text\|border\|ring\|from\|to\|via)-(slate\|gray\|zinc\|…)-[0-9]{2,3}" src packages apps` |
| Semantic token hits | **170** | same shape, semantic names |
| Token share | **3.3%** | 170 / (170 + 4,987) |
| `dark:` variants | **1,967** | `grep -ro "dark:" src packages apps` |
| Raw hex literals | **336** | `grep -rEo "#[0-9a-fA-F]{3,8}\b" src packages apps` |

**Every one of those 1,967 `dark:` variants exists because the token underneath
is wrong.** If the token is right, dark mode is automatic. That is the single
best argument for doing Phase A before anything else.

---

## Phases

### `[x]` Phase A — the token block · **shipped 2026-07-29**

`src/app/globals.css` now carries a **three-layer** token system
(primitive `--brand-*` → semantic → Tailwind utility), plus status tokens
(`--success`/`--warning`/`--info`) that previously did not exist, which is why
components reached for `text-green-600` directly.

**Measured results** (`pnpm contrast`, both schemes, 32 pairs):

| Pair | Before | After | Need |
| ---- | ------ | ----- | ---- |
| `--ring` on `--background` (light) | **2.59:1 FAIL** | **4.22:1 PASS** | 3 |
| `--ring` on `--card` (light) | — | 4.05:1 PASS | 3 |
| `--card` vs `--background` (light) | **1.000:1** (none) | **1.043:1** | >1 |
| `--primary-foreground` on `--primary` (light) | 17.16:1 (grey) | 5.82:1 (brand) | 4.5 |
| `--primary-foreground` on `--primary` (dark) | — | 8.19:1 | 4.5 |
| every other pair | — | PASS | — |

Also fixed: the font conflict. `body { font-family: … !important }` was silently
overriding the Inter face loaded in `layout.tsx`, so Inter was downloaded on
every page and never rendered. Font is now the `--font-sans` token, and Inter
loads `latin + latin-ext + cyrillic` (it was latin-only, so Cyrillic Uzbek fell
back to a system font mid-paragraph).

> ⚠️ The audit reported `--ring` at 1.55:1. The measured value was **2.59:1** —
> still a failure, but the audit's number was wrong. Numbers in this file come
> from `scripts/contrast-check.mjs`.

<details><summary>Original defect list (all now fixed)</summary>

- `globals.css:370` `--background: oklch(1 0 0)` and `:372` `--card: oklch(1 0 0)`
  are **identical in light mode** — there is no surface separation. (Dark mode is
  fine: `:404` `0.145` vs `:406` `0.205`.)
- `globals.css:376` `--primary: oklch(0.205 0 0)` — **zero chroma**. Every primary
  button on the site is black or white.
- `--secondary` / `--accent` / `--muted` collapse to one value.
- `globals.css:387` `--ring: oklch(0.708 0 0)` measures **1.55:1** against
  `--background` (light) and **1.87:1** (dark). WCAG requires **3:1** for a
  non-text focus indicator. Every focusable control on the site fails today.
- The font conflict: Inter is loaded at `layout.tsx:9` (`subsets: ["latin"]` only,
  so no Cyrillic) and applied at `:408`, then overridden by an `!important` rule
  at `globals.css:49`. It is downloaded on every page and never rendered.

</details>

**Exit condition — met:** `--card ≠ --background` in both modes · `--primary`
chroma > 0 · `--ring` ≥ 3:1 in both modes · one font, one source of truth.

### `[x]` Phase B — the `pnpm tokens` ratchet gate · **shipped 2026-07-29**

`scripts/token-guardrail.mjs` counts palette-class + hex hits **per file**
against `scripts/token-baseline.json` and exits non-zero on any per-file
increase. Per-file, not global — a global total lets one file regress while
another improves, and the regression ships.

- **Baseline frozen at 5,401 hits across 159 files.**
- Wired into `lefthook.yml` pre-commit.
- `--update` refuses to record a regression unless `--force` is passed, so the
  ratchet only turns one way.
- **Verified it actually fails:** adding `bg-blue-500 text-red-700` to
  `SectionTitle.tsx` produced `2 → 4 (+2)` and exit 1.

Companion: `pnpm contrast` (`scripts/contrast-check.mjs`) parses the shipped
`globals.css`, resolves `var()` chains, and checks all 32 pairs in both schemes.
**Re-run it after any token change** — this is what keeps the numbers in this
file honest rather than aspirational.

### `[~]` Phase C — shared surfaces
**Why third:** these are consumed by every tool, so fixing them moves the most
call sites per edit.

**Progress: 5,401 → 5,167 hits (−234). 28 of 48 shared/ui files are now fully
token-clean.** Semantic-token usage 170 → 303.

- `[x]` `packages/ui/src/constants/ui-patterns.ts` — the panels were **dark-only**
  (`bg-zinc-900/80` with no light variant) and shipped to every tool. Now
  `bg-card` / `bg-muted` / `border-border`, with **no `dark:` variant needed**.
- `[x]` `src/constants/ui-constants.ts` — `TEXT_STYLES` was dark-only, so body
  text rendered ~2.6:1 on a light card. Now semantic, verified ≥4.5:1 on both
  surfaces in both schemes. **Also closed the code-structure Phase 1 duplication**
  by re-exporting `TOOL_COLORS`/`UI_PATTERNS` from `@webiston/ui` — there is now
  exactly one definition.
- `[x]` `TerminalInput.tsx` — **64 → 0**. Its 5 variants were light/dark pairs
  (40 palette classes); status tokens collapsed them to opacity modifiers with
  zero `dark:` variants. This is the reference example for the rest of Phase C.
- `[x]` Pair sweep across `shared/` + `packages/ui` — 26 light/dark pairs
  collapsed mechanically (`text-zinc-900 dark:text-zinc-100` → `text-foreground`,
  `text-green-600 dark:text-green-400` → `text-success`, …).
- `[ ]` **Remainder (20 files).** These are *singles* — a palette class with no
  dark partner — so each needs a judgement call rather than a mechanical rule:
  `ToolPanel` 12 · `ButtonLink` 9 · `DualTextPanel` 8 · `LanguageSelector` 7 ·
  `SearchComponents` 5 · `mode-switch` 5 · `InfoCard` 5 · 13 more.

**Documented exceptions — deliberately NOT converted:**

- `code-highlight.tsx` (42) — a **syntax highlighter**. Green there means "string
  literal", not "success"; mapping it to status tokens would be semantically
  wrong and would make code colours shift with the brand.
- `shimmer-button.tsx` (16) — a decorative brand effect.
- `TOOL_COLORS` — per-category accent *gradients*. Flattening them erases a
  deliberate visual system; the spec permits brand colour in a named constant.
- `MACOS_DOTS` — macOS traffic lights **are** red/yellow/green; they signal
  nothing and must not follow the brand.
- `src/constants/color-names.ts` (165) — colour *data* for the converter tool,
  not styling.

### `[ ]` Phase D — tools, one module per commit
**Routed tools first** — the four `__`-prefixed tools are unreachable in
production, and whether they are worth touching depends on the parked-tools
decision in `../backlog.md`. They are also the four worst offenders
(122 / 122 / 101 / 83 hardcoded-colour hits), so doing them first would be the
worst possible use of the effort.

### `[ ]` Phase E — book reader + MDX components
Last, because the book pages are read-mostly and visually simplest.

---

## What this initiative does NOT cover

- Accessibility beyond colour contrast — the 81 `pnpm check` errors
  (`noLabelWithoutControl` 42, `noSvgWithoutTitle` 16, …) live in
  `tooling-ci-and-testing.md`.
- Component API or structure changes — `code-structure.md`.
