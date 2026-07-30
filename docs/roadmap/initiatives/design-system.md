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

## Phase 6 — `[x]` Homepage composition + the boundary token (2026-07-30)

Started as "fix the search placeholder overlap", surfaced a token gap and a
second vacuous gate.

- `[x]` **Search field: placeholder overlapped the `Ctrl K` badge by a measured
  25px.** Cause: the icon and the `kbd` were both `absolute`, leaving the label
  the only element in flow — nothing constrained its width, so it slid under the
  badge at the 149px the header actually gives that button. Now a real flex row
  (`gap-2`, `truncate`, `ml-auto` badge): measured **+8px gap**. Also
  platform-correct — `⌘K` on Mac, `Ctrl K` elsewhere, resolved after mount
  (`navigator` does not exist on the server) with width reserved for both so the
  swap cannot shift the header.

- `[x]` **NEW `--border-strong` token — the Radix step-6/step-7 split.**
  `--border` was the only boundary token, and it measures **1.32:1** (light) /
  **1.33:1** (dark) against the page. WCAG 1.4.11 wants **3:1** for the boundary
  that *identifies* a component — which is what a card-that-is-a-link and an
  outline button have. Solved rather than guessed:

      light  oklch(0.655 0.012 217)   -> 3.16:1 bg · 3.03:1 card
      dark   oklch(1 0 0 / 34%)       -> 3.02:1 bg · 3.12:1 card

  `--border` stays as-is and is now documented as **decorative only** (rules,
  dividers, hairlines) — 1.4.11 does not govern those. Additive change, so no
  existing `border-border` usage moved.

- `[x]` **`pnpm contrast` was vacuous on exactly this token — twice over.**
  `--border` was **absent from `PAIRS`**, and it *could not* have been checked
  anyway: the dark value is `oklch(1 0 0 / 12%)` and `resolve()`'s regex rejected
  any value carrying alpha, so it would have been reported `SKIP`. The gate has
  claimed "32/32 PASS" all along while the one token governing 1.4.11 sat
  unexamined. Now: `resolve()` returns alpha, a new `contrastOver()` composites
  translucent tokens over their backdrop **in gamma-encoded sRGB** (what a
  browser does — compositing in linear light would overstate every ratio), and
  `--border-strong` is asserted on both `--background` and `--card`.
  **36 pairs, exit 0.**

- `[x]` **`SimpleCard` had no background at all** — measured `alpha 0`, so 41
  homepage cards were outlines rather than objects. Now `bg-card` +
  `border-border-strong`, left-aligned (a 4-column grid needs a predictable
  return point per scan line; centred text moves it per card), a
  `focus-visible` ring (it is a link and had hover-only feedback), and
  `transition-[transform,box-shadow,background-color]` instead of
  `transition-all`.

- `[x]` **The nextjs.org motif is gone** — `background-pattern.css` (180 lines
  for one component) replaced by `src/styles/hero.css`. Four measured reasons,
  not taste:
  1. It animated to a **displaced** resting position (`translateY(100%)`,
     `opacity: .3`) — the layout at rest was wherever the lines drifted to.
  2. Hardcoded percentages (`left: 15/35/65/85%`) unrelated to the content grid,
     so a dashed line crossed the headline.
  3. ~4s of motion (2s delay + 2s duration) still moving after the reader had
     started, and **the only `prefers-reduced-motion` block on the whole site
     belonged to the Sonner toast library** — zero of our own animations were
     guarded (WCAG 2.3.3).
  4. `rgba(0,0,0,.2)` / `rgba(255,255,255,.5)` — raw colour needing a `.dark`
     override per rule.

  Replacement: a **static** token-driven grid (radial-masked so it never reaches
  an edge) + one brand wash; motion only on content entrance.

- `[x]` **Motion is correctly gated — verified in the compiled CSS, not assumed.**
  `.rise` sits inside `@media (prefers-reduced-motion: no-preference)`; `.reveal`
  inside **both** that and `@supports (animation-timeline: view())`. The nesting
  is load-bearing: the hidden `from` state only exists where the browser can
  finish the animation, so an unsupported browser or a reduced-motion user gets
  content at natural `opacity: 1` — never permanently hidden, which is the
  classic way scroll-reveal breaks.

- `[x]` **Scroll reveal with zero JS.** `animation-timeline: view()` (verified
  supported: `CSS.supports` → `true`). framer-motion was rejected deliberately:
  the homepage is a Server Component and one of the prerendered routes, so
  `whileInView` would mean `'use client'` **plus** 41 IntersectionObservers, 41
  state updates and 41 re-renders for decoration. CSS does it with none. The
  dependency stays where it earns its keep — the 27 interactive sites.

- `[x]` **8 junk CSS classes were shipping to production.** The `<h1>` carried
  `//`, `Light`, `mode`, `gradient`, `Dark`, `klass`, `o'z`, `holicha` — someone
  wrote `//` comments *inside* a `className` string and Tailwind has no comment
  syntax there. Confirmed gone from the built HTML.

- `[x]` **Hero typography + hierarchy.** `text-balance` (no orphaned "teran
  nigoh"), `tracking-[-0.02em]` (72px display type at `normal` reads loose),
  `leading-[1.05]` replacing `line-height: 1` which clipped Uzbek descenders and
  apostrophes, and `p-6` removed from the `h1`. Hero dropped from **exactly
  100vh** — which hinted nothing below it — to `78svh`, so the first cards peek.
  Added an eyebrow (the old hero opened with a metaphor, so a first-time visitor
  could not tell a book library from an agency) and a **proof row derived from the
  content tree** — `225 bo'lim · 3 kitob · 17 vosita`, computed from
  `getAllTutorialPaths()`/`TOOLS_LIST`, never typed in, so it cannot go stale.

**Gate (real exit codes, 2026-07-30):** `check 0` · `lint 0` · `typecheck 0` ·
`test 0` · `tokens 0` · `contrast 0 (36 pairs)` · `build 0` · **269 prerendered
HTML files, homepage still `●` SSG**. `i18n 1` — unchanged, still the 8 dead
`en`-only keys awaiting approval.

---

## Phase 7 — `[x]` Hero backdrop, header seam, light-mode CTA (2026-07-30)

Owner reported the header looked "detached from the green". Three separate
defects behind that one observation, plus one of my own from Phase 6.

- `[x]` **The seam was real.** The header computed to
  `oklab(0.145 … / 0.95)` — effectively solid, carrying no tint — while the
  hero's brand light began *exactly* at its bottom edge. Flat dark above the
  line, teal below, `0.12` border between.

- `[x]` **The "green" was the brand colour behaving correctly.** `--brand-500`
  resolves to `lab(61.2 -27.7 -25.2)` — negative on both the green and blue
  axes, i.e. `#17A3BF`. That is right for the Uzbek flag blue at hue 217°. The
  defect was *perceptual*: one saturated cyan wash at 14% over near-black, as
  the only coloured thing on the page, reads as a stain rather than as light.
  Split into two layers (7% wide atmosphere + 9% tight core at the top edge) for
  **less** total brand alpha and a result that reads as light entering the page.

- `[x]` **A scroll-driven header fade was built, measured, and REJECTED.**
  `animation-timeline: scroll()` reported `timelineProgress: 0%` at scrollY 0,
  16, 32, 48, 64 **and** 200 — the timeline never advanced, because `scroll()`
  resolves to the nearest scrollable ancestor and `base.css` makes `body`/`html`
  a `min-height: 100vh` flex column. With `both` fill that pins the header at the
  `from` keyframe forever: **transparent permanently, page content sliding under
  unreadable navigation**. Strictly worse than the cosmetic seam it fixed, and
  the failure direction is wrong — an inert timeline must fail toward "solid and
  readable". Replaced with a frosted bar (`bg-background/65 backdrop-blur-xl`):
  the light passes through at every scroll position, no timeline, no JS, nothing
  to fall back from. The rejected approach and the numbers are recorded in
  `hero.css` so it does not get re-attempted.

- `[x]` **Grid now drifts, and the loop is provably seamless.** Translating by
  exactly one tile (`--hero-tile`) means 100% is pixel-identical to 0%, so
  `infinite` has no visible restart; the keyframe derives its distance from the
  token so changing the tile size cannot break it. 48s/tile ≈ **1.3px/s**.
  `transform` only — the obvious alternative (`background-position`) repaints the
  layer every frame, which is why animated-grid backgrounds usually cost battery.
  Required splitting the backdrop into two elements: **mask on the parent, motion
  on the child**, because a `transform` drags the element's own mask with it and
  the fade-out would have travelled across the screen.

- `[x]` **Light mode: the hero's primary CTA was invisible.** `ButtonLink`
  pinned `primary` to `bg-white text-black` in *both* schemes under a comment
  calling it a "documented exception" — reasoning that semantic tokens flip with
  the scheme. True for `bg-card`, but it made the main call to action **a white
  pill on a white page**; only its text was readable. `bg-foreground
  text-background` is the pair that was wanted: the two flip *together*, so the
  intent ("maximum-contrast pill, inverted from the page") survives both schemes.
  **17.4:1 light · 18.7:1 dark.** Dark mode is visually unchanged.
  The homepage is `ButtonLink`'s only consumer, so the blast radius was one file.

- `[x]` **`--header-height` is now a shared token.** `Header.tsx` uses
  `h-(--header-height)` and the backdrop reaches up by exactly that value —
  verified `reachesBehindHeaderBy: 64px`. Two hardcoded `4rem`s in separate files
  is the pair that drifts.

- `[x]` **Headline no longer fades at the end.** The Phase 6 diagonal gradient
  (`to-br … to-muted-foreground`) dimmed the last word of a two-line Uzbek
  headline. Now a shallow vertical `from-foreground to-foreground/80`.

**Gate (real exit codes, 2026-07-30):** `check 0` · `typecheck 0` · `lint 0` ·
`test 0` · `tokens 0` · `contrast 0` · `build 0` · **269 prerendered HTML files**.
Verified in both schemes; `header-solidify` confirmed absent from compiled CSS.

---

## Phase 8 — `[x]` Seam (properly), grid scale, aurora (2026-07-30)

Phase 7 claimed the seam was fixed. It was not — the owner's screenshots at a
wider viewport still showed it in both schemes. Phase 7 treated the symptom.

- `[x]` **The seam's actual cause was the glow's POSITION, not the header's
  opacity.** The brand light was anchored at `top: 0` — the exact strip the
  sticky header covers — so the header was the one band of the page *without*
  the tint. No amount of translucency on the bar can match a colour it does not
  have; the frosted bar in Phase 7 only softened it. The reference the hero grew
  out of makes this obvious: nextjs.org's header has a boundary line too, and it
  does not read as detached, because their hero top is **uniformly dark** and the
  decoration starts below it.
  Fixed by moving the light down behind the headline and pulling the mask's
  falloff in (`ellipse 80% 62% at 50% 55%`), leaving the top strip plain
  `--background` — which the header already is.
- `[x]` **Header hairline scoped off hero pages.** `body:has(.hero)
  [data-site-header] { border-bottom-color: transparent }` — the last visible
  edge. On every other route the divider is useful, so `:has()` scopes it rather
  than removing it globally. No JS, no scroll state; the frosted blur still
  separates the bar from content once anything scrolls under it.
- `[x]` **Grid pitch was graph paper.** `4rem` = 64px/cell read as a mesh, not as
  structure — the owner flagged it as "too small" independently. nextjs.org
  spaces its rules ~500px apart: a handful of deliberate architectural lines.
  Now `clamp(7rem, 10vw, 14rem)` — generous on a wide screen, not collapsed to
  two lines on a phone. The drift keyframe derives its distance from the token,
  so the seamless loop survives the change.
- `[x]` **Aurora replaces the static top wash.** Two soft radial blobs behind the
  headline on different periods (34s / 46s) and directions, so they never lock
  into a visible rhythm. Pure `radial-gradient` — no `filter: blur()`, which
  would force a full-layer re-blur; a gradient is soft by construction and free.
  Held at 10%/8%: `--brand-500` is a saturated `#17A3BF`, and anything stronger
  over near-black stops reading as light and starts reading as a stain, which was
  the original complaint.
- `[x]` **`JwtDecoderPage.InputPanel.clear` added to both locales** (`Tozalash` /
  `Clear`) — this was the "1 Issue" in the owner's dev overlay. `MISSING_MESSAGE`
  count in the build log: **2 → 0**. It had been invisible to `pnpm i18n` because
  the key was absent from *both* bundles, so parity held; and invisible in the UI
  because `InputPanel.tsx:35` reads `t("clear") || "Clear"`.

**Aceternity UI — evaluated, declined as a source.** Fetched and reviewed: 21
hero blocks, and per the page itself "most blocks leverage Framer Motion".
Several are canvas/shader-based (dither backgrounds, flickering lights) or
pointer-driven (mousemove, spotlight). Three reasons they are the wrong genre
here, none of them "the animation is bad":
  1. Every one of them forces `'use client'` on a page that is currently a
     prerendered Server Component.
  2. They are SaaS-landing-page grammar — spotlights and beams sell a product
     demo. This is a reading platform; the hero's job is to get out of the way.
  3. They are widely used, so they read as template rather than as identity.
The genuinely good ideas in that set are cheap without the library: the mesh /
aurora gradient is now implemented in ~40 lines of CSS with zero JS, and grid +
drift covers the "beams and grid" concept.

**Gate (real exit codes, 2026-07-30):** `check 0` · `typecheck 0` · `lint 0` ·
`test 0` · `tokens 0` · `contrast 0` · `build 0` · **269 prerendered HTML**,
**0 `MISSING_MESSAGE`**. Verified in both schemes. `i18n 1` — unchanged, the 8
dead `url-encoder` keys only.

---

## Phase 9 — `[x]` The grid beam, and why the drift was invisible (2026-07-30)

Owner said no animation had been added to the grid. The drift WAS running —
`playState: running`, transform advancing, 2.67px/s. It was invisible for a
different reason, and that reason is the real finding:

- `[x]` **The grid lines themselves were invisible, so their motion was too.**
  `--border` measures **1.32:1** against the page in light mode (12% white in
  dark). Motion you cannot see is motion you did not add. Added a dedicated
  **`--hero-line`** — `oklch(0.845 0.01 217)` light / `oklch(1 0 0 / 22%)` dark —
  sitting between `--border` and `--border-strong`, so the structure reads
  without the hero becoming a wireframe. Explicitly decorative and outside the
  1.4.11 story, unlike `--border-strong`.

- `[x]` **A beam that travels ALONG the grid lines** — the one idea worth taking
  from the Aceternity-style "beams and grid" blocks, implemented with no library
  and no JS:

      .hero-grid          drifts (existing)
        .hero-beam        masked TO the grid pattern — only line pixels can show
          .hero-beam-band a wide diagonal gradient; the only moving part

  Two details are load-bearing:
  1. **The beam is nested inside `.hero-grid`.** Both share an origin and both
     inherit the drift transform, so the light cannot slide out of register with
     the lines it is supposed to be lighting.
  2. **`mask-composite: add`.** Two mask layers (verticals + horizontals) default
     to intersecting, which resolves to just the crossing points — travelling
     *dots*, not lines. `add` unions them. Verified supported
     (`CSS.supports('mask-composite','add')` → true) before relying on it.

  16s, `linear` on purpose: an eased sweep reads as a UI transition, a constant
  one reads as light crossing a surface. Fully removed (`display: none`) under
  `prefers-reduced-motion` — a travelling highlight is exactly the moving focus
  2.3.3 covers, and the grid reads fine static.

- `[x]` **Confirmed the whole composition still ships zero JS.** `hero-grid`,
  `hero-beam`, `hero-beam-band` and `hero-aurora` are all in the prerendered
  static HTML; `framer-motion`/`IntersectionObserver` references in the homepage
  HTML: **0**. Drift + beam + aurora + entrance + scroll-reveal, all CSS.

**Gate (real exit codes, 2026-07-30):** `check 0` · `typecheck 0` · `lint 0` ·
`test 0` · `tokens 0` · `contrast 0` · `build 0` · **269 prerendered HTML**,
**0 `MISSING_MESSAGE`**. Verified in both schemes with the beam pinned mid-sweep.

> **Note on the dev overlay.** The remaining "2 Issues" are React 19 warnings
> about the JSON-LD `<script>` rendered inside the page component
> ("Scripts inside React components are never executed when rendering on the
> client"). Pre-existing and benign for its purpose: the tag IS present in the
> prerendered HTML, which is what crawlers read — verified. Worth silencing for
> noise reasons, not correctness. Not tracked as a defect.

---

## Phase 10 — `[x]` Load-in flash + the text scrim (2026-07-30)

Two owner observations, one of which was a perception problem rather than a bug.

- `[x]` **"The beam looks like it goes over the text" — z-order was already
  correct.** `elementsFromPoint` at the headline's centre returns `H1.rise`
  **first**; the backdrop is genuinely behind it. But z-order is not legibility:
  a lit line passing directly behind a headline competes with it and reads as
  crossing over. Fixed with a **scrim** — a radial gradient built from
  `--background`, so it darkens in dark mode and lightens in light mode with no
  second rule, pulling the backdrop's energy down over the content area. This is
  also why nextjs.org keeps its rules faint and away from the text.
  **Paint order is load-bearing and comes from DOM order, not z-index:**
  `grid → scrim → aurora`. The scrim dims the grid and beam; the aurora sits
  after it so the brand glow behind the headline is not flattened too. Putting
  the scrim last would have killed the glow.

- `[x]` **Refresh now brings the lines in, the way nextjs.org does.** This is
  what the original `background-pattern.css` was reaching for and got wrong: it
  animated the lines to a *displaced* final position, so they never arrived
  anywhere deliberate and the resting layout was an accident. Here the resting
  state is fixed and the arrival is separated into two throwaway layers:
  - `grid-in` — a 0.9s opacity ramp on the grid itself, running alongside the
    perpetual `grid-drift`. No conflict: one drives `opacity`, the other
    `transform`.
  - `.hero-flash-v` / `.hero-flash-h` — copies of the grid in a bright brand
    tint. **Splitting the axes and offsetting them** is what produces the read of
    *parallel* lines rather than one global flicker.

  **First attempt was too weak and was replaced (see below).**
  - Both sit inside `.hero-grid`, inheriting its drift and origin so they stay
    registered to the real lines.
  - `opacity: 0` is the BASE state, with the animation declared only under
    `no-preference` — a reduced-motion user gets no flash and there is nothing
    to override.

**Gate (real exit codes, 2026-07-30):** `check 0` · `typecheck 0` · `lint 0` ·
`test 0` · `tokens 0` · `contrast 0` · `build 0` · **269 prerendered HTML**.
`hero-flash-v`, `hero-flash-h`, `hero-scrim` all confirmed in the static HTML.

> **The hero is done.** It now has six layers with distinct jobs — structure
> (grid), arrival (grid-in + flash), depth (aurora), life (beam), focus (scrim),
> content entrance (rise) — and all of it is CSS on a prerendered Server
> Component. A seventh layer is where this tips into the Aceternity problem.
> Remaining polish, in order of actual value:
> 1. **View Transitions.** `next@16.2.12` exposes `experimental.viewTransition`
>    (currently `false`), and `document.startViewTransition` is available in the
>    target browser. Smooth homepage → chapter navigation is a bigger perceived-
>    quality win than anything further in the hero. Config change affecting ALL
>    navigation, so it needs its own decision and its own testing pass.
> 2. **Noise/grain overlay** — ~10 lines, kills gradient banding, adds tactile
>    quality. Cheap and safe.

---

## Phase 10b — `[x]` The arrival actually reads now (2026-07-30)

Owner: "on refresh nothing happens, the lines just appear." Correct, and the
Phase 10 version deserved that. Two mistakes, both mine:

- `[x]` **It only faded; it never drew.** A 400ms opacity ramp on a 1px line is
  not an event the eye registers — which is exactly why it looked like the grid
  "was just there". The request was lines that FILL IN, and that is a different
  animation. Now the lines scale into place:
  `.hero-flash-v` does `scaleY(0 → 1)` from `transform-origin: top` (verticals
  grow downward) and `.hero-flash-h` does `scaleX(0 → 1)` from `left`
  (horizontals grow rightward).
  Why scale is safe on a repeating gradient: vertical lines are uniform along Y,
  so `scaleY` never moves their X positions — they stay registered to the real
  grid while growing. Same for `scaleX` on the horizontals. And being `transform`
  it stays on the compositor; a mask wipe would repaint every frame.
  Scale completes at 55%, the bright layer fades over the remaining 45%, handing
  off to the resting grey grid underneath. 2.1s, `ease-out`, 180ms stagger so the
  verticals land and then the horizontals cross them.
- `[x]` **I shipped the scrim in the SAME change as the arrival**, so the thing
  meant to protect the headline was dimming the animation exactly where the eye
  is. Scrim eased back (48%→42% radius, 72%→88% centre but falling off much
  faster) and the flash brightened 65% → 90%, so the arrival reads through it
  while the resting state keeps its legibility.
- `[x]` **Verified on a real page load, not just pinned.** Caught at
  `elapsedMs: 0`, `state: running`, with `transform: matrix(1,0,0,0,0,0)`
  (`scaleY(0)`) on the verticals and `matrix(0,0,0,1,0,0)` (`scaleX(0)`) on the
  horizontals — genuinely starting from nothing. Pinned at 30%: verticals
  `scaleY(0.732)`, horizontals `scaleX(0.558)`, i.e. the stagger is real.
  Compiled CSS confirms the animations sit inside
  `@media (prefers-reduced-motion: no-preference)` while `opacity: 0` is the
  ungated base — so a reduced-motion user gets no arrival and nothing to
  override.

**Process note for future sessions.** The owner asked for this repeatedly and got
descriptions of what I had built instead of a yes/no on what they wanted. When a
request is restated more than twice, the honest reading is that the delivered
thing does not match the ask — the answer is to say so and change the
implementation, not to re-explain it.

**Gate (real exit codes, 2026-07-30):** `check 0` · `typecheck 0` · `lint 0` ·
`test 0` · `tokens 0` · `contrast 0` · `build 0` · **269 prerendered HTML**.

---

## What this initiative does NOT cover

- Accessibility beyond colour contrast — the 81 `pnpm check` errors
  (`noLabelWithoutControl` 42, `noSvgWithoutTitle` 16, …) live in
  `tooling-ci-and-testing.md`.
- Component API or structure changes — `code-structure.md`.
