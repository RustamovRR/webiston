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
  collapsed (`text-zinc-900 dark:text-zinc-100` → `text-foreground`,
  `text-green-600 dark:text-green-400` → `text-success`, …).

> ### ⚠️ Do NOT repeat the mechanical sweep — it shipped 4 real regressions
>
> The sweep matched pairs at **file level** and replaced with `\blight\b`, which
> was wrong twice over. Self-review caught it; the gate did not, because a
> *removed* `dark:` and an *unconverted* light class both keep the token count
> flat. Concretely:
>
> 1. **Greedy ordering orphaned dark variants.** The rule
>    `text-zinc-500 + dark:text-zinc-400` fired first and stripped *every*
>    `dark:text-zinc-400` in a file — including ones whose real partner was
>    `text-zinc-600`. `ToolHeader.tsx` shipped a tool-page description as
>    **dark grey on a dark background**.
> 2. **`\b` matched inside variant prefixes.** `\bbg-white\b` also matches the
>    `bg-white` inside `dark:bg-white` and `dark:hover:bg-white/10`, so
>    `ButtonLink`'s intentionally theme-invariant white CTA became `bg-card` —
>    **black text on a dark surface**.
>
> **For the remaining 20 files: convert by hand, one className at a time.** The
> detector that found these lives in the session notes; the durable check is:
> after any conversion, no line may keep an unconverted palette class while its
> `dark:` sibling was removed.
- `[x]` **Remainder converted by hand — 45 / 48 files in scope are now
  token-clean.** Done one `className` at a time, as the lesson above requires.
  Covered: `ToolPanel`, `DualTextPanel`, `LanguageSelector(+Content)`,
  `SearchComponents`, `SearchDialog`, `Search`, `SimpleCard`, `Footer`,
  `SocialMedia`, `Header`, `InfoCard`, `BaseModal`, `StatsDisplay`, `CopyButton`,
  `mode-switch`, `gradient-tabs`.

**Two real bugs surfaced during the hand pass** — neither was a styling nit:

- **5 malformed Tailwind classes** left by the earlier mechanical sweep:
  `bg-muted/50/50`, `backdrop-blur-sm/30/60`, `hover:bg-muted/90/90!`. Removing a
  `dark:` half orphaned its opacity suffix onto the class before it. These
  generate **no CSS at all**, so the elements silently rendered unstyled — and
  nothing caught it: the hit count stayed flat, typecheck cannot see inside a
  string, and the build succeeded. `pnpm tokens` now fails on this shape.
- **`mode-switch` hovered to the wrong colour.** The active tab's gradient is
  per-category (`colors.primary`), but its hover was a hardcoded blue/indigo, so
  hovering a green "generators" tab turned it blue. `TOOL_COLORS.primaryHover`
  already existed with the right ramp and had **zero consumers**.

> **Tailwind gotcha worth remembering:** the first fix for that bug —
> `` `hover:${colors.primaryHover}` `` — was wrong twice over. It prefixes only
> the *first* class of a multi-class gradient, and Tailwind only generates
> utilities it can see as **literal strings in source**, so a runtime-built class
> name yields no CSS. `primaryHover` now stores its `hover:` prefixes inline, per
> class. Verified by grepping the production CSS for all three category ramps.

**Documented exceptions — deliberately NOT converted:**

- `ButtonLink` `primary`/`secondary` — theme-**invariant** hero CTAs (a white pill
  with black text, a dark pill with white text, identical in both schemes).
  Semantic tokens are exactly wrong here: `bg-card` flips with the scheme and
  would put black text on a dark surface.

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

### `[x]` Phase D — routed tool modules · **shipped 2026-07-29**

All 17 routed tools converted: **1,142 light/dark pairs collapsed across 108
files**. The four `__`-prefixed parked tools were deliberately excluded — they
are unreachable in production and whether they are worth touching depends on the
parked-tools decision in `../backlog.md`.

| Metric | Phase C end | Phase D end |
| ------ | ----------: | ----------: |
| Hardcoded colour | 5,090 | **2,696** |
| `dark:` variants | 1,867 | **619** |
| Semantic token usage | 360 | **1,608** |

**This time the sweep was mechanical AND safe**, because the converter was
rebuilt to fix the two defects that caused the Phase C regressions:

1. **Pairs match within a single class string**, never across a file. The old
   file-level match is what orphaned `ToolHeader`'s `dark:text-zinc-400`.
2. **Whole class tokens are rewritten**, not regex-substituted inside them — so
   `/opacity` survives exactly once and `dark:`/`hover:` prefixes are never
   matched by accident. That is what produced `bg-muted/50/50`.
3. **A theme-invariance guard**: if the light and dark halves name the *same*
   colour (`bg-white` + `dark:bg-white`), the pair is deliberate and is left
   alone. That is the ButtonLink bug, encoded as a rule.

It was unit-tested against all four historical failure cases before running, then
verified after: **0 orphaned `dark:` tokens introduced, 0 malformed classes**,
full gate green. The 10 unpaired `dark:` classes that remain are **pre-existing**
— confirmed against `git show HEAD:` — elements that never had a light-mode
background at all.

### `[ ]` Phase D-2 — the pre-existing dark-only classes
10 elements carry `dark:bg-*` / `dark:border-*` with **no light counterpart**, so
they render with no background in light mode (e.g.
`GradientGenerator.tsx` colour inputs, `ChunkSelector.tsx`). Not caused by the
sweep; needs a per-case design decision, not a rule.

### `[x]` Phase E — book reader + MDX components · **shipped 2026-07-29**

`src/components/mdx/**` and `src/app/**` converted. `Callout` was rewritten by
hand: its five variants are now translucent washes of their status token
(`bg-warning/10 border-warning/30` + `text-warning`), and `tip` — which has no
status of its own — uses the brand accent.

**Final position, whole repo:**

| Metric | Session start | Now |
| ------ | ------------: | --: |
| Hardcoded colour | 5,401 | **2,600** |
| `dark:` variants | 1,967 | **570** |
| Semantic token usage | 170 | **1,658** |

Of the 2,600 remaining, **629 are the four parked `__` tools** (blocked on the
owner decision) and **195 are `src/constants/color-names.ts`**, which is colour
*data* for the converter tool, not styling. The real remaining surface is smaller
than the headline number suggests.

> ### ⚠️ A third sweep bug — and the gate it produced
>
> Collapsing status hues ignored **shade**, so `bg-amber-50` (a pale tint) became
> `bg-warning` (the solid amber). Every warning callout rendered amber text on an
> amber block — invisible. 55 occurrences across 19 files, plus a badge in
> `books/page.tsx`.
>
> Fixed three ways: the converter's `classify()` is now shade-aware
> (`bg-*-50 → bg-<status>/10`, `border-*-200 → border-<status>/30`); the 55
> existing cases were repaired by reading each one's *original* shade out of git;
> and `pnpm tokens` now fails when a class string puts `text-<status>` on a solid
> `bg-<status>`.
>
> **The gate has a known blind spot**, stated in the script: it compares within
> one class string, so a component that splits the pair across properties (as
> `Callout` did, via `containerClass`/`textClass`) slips past. Widening it to a
> line window produced false positives on legitimate
> `bg-primary text-primary-foreground` buttons. A manual sweep for that shape
> found no further real cases.

---

## What this initiative does NOT cover

- Accessibility beyond colour contrast — the 81 `pnpm check` errors
  (`noLabelWithoutControl` 42, `noSvgWithoutTitle` 16, …) live in
  `tooling-ci-and-testing.md`.
- Component API or structure changes — `code-structure.md`.
