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

## Phase 11 — `[x]` The brand exploration adopted, selectively (2026-07-30)

The owner had a full redesign made a week earlier ("Webiston.uz UIUX redesign",
Claude-designed, 16 files + brand boards). This phase ports what earns its
place and records what was declined.

**Adopted:**

- `[x]` **Logo: the "Terminal" mark** (direction 02 of 5, over Pishtoq/arch and
  Ochiq kitob/book) — the final `Webiston.dc.html` header already used it, and
  it is the only direction that says *developer*: a bold `w` with a cursor
  pixel, wordmark `webiston.uz` whose i-dot is the same accent square. Rebuilt
  as **pure markup** in `Logo.tsx`: zero image requests (the old PNG was
  priority-loaded on every page), crisp at any DPI, accent follows `--primary`
  through both schemes. The reference's dotless-`ı` trick was dropped — a
  normal `i` with the dot covered keeps copy/search/screen-readers sane.
  `/logo.png` stays canonical for share cards. **Favicon still shows the old
  mark — pending, needs image generation.**
- `[x]` **Header↔hero alignment.** The hero used `px-16` while the header used
  `px-4/6/8`, so the headline started ~32px right of the logo and the surfaces
  read as unrelated — the owner spotted it from a screenshot. Page wrapper now
  shares the header's exact padding scale and the hero shares its `max-w-[1536px]`.
  Verified: logo left **32px** = h1 left **32px**.
- `[x]` **The palette is now a live loop** (was: one query typed once). Types
  "react" → 3 real book rows → deletes → types "yarat" (uz) / "gener" (en) → 3
  real generator tools → repeats. One 14s CSS clock, two spans on ONE keyframe
  track (the second delayed 7s, `fill both` holding it empty), result sets
  crossfading on the same clock. Still zero JS, still prerendered. All queries
  are 5 chars by construction ("react"/"yarat"/"gener") so one `steps(5)`
  cadence serves every segment — recorded as a constraint in the component.
- `[x]` **Traffic lights restored via `MACOS_DOTS`.** Phase 10's removal argued
  "our UI has no window chrome" — wrong about our own codebase: the tool panels
  already draw macOS dots from `src/constants/ui-constants.ts:74`. Reusing the
  constant also keeps the token gate green (0 new hex).
- `[x]` **Animated gradient on the headline accent** ("teran nigoh") — a slow
  7s pan across a brand ramp, `background-size: 220%` so hue drifts without a
  hard edge crossing glyphs. Reduced motion: static gradient.
- `[x]` **Rain replaces the diagonal beam.** Both lit grid lines — two systems
  doing one job. The rain (3 streaks falling along real column lines, masked to
  vertical-line pixels, nested in the drifting grid for registration) is
  continuous ambience where the beam was a 16s event, and it matches the
  reference's identity. Periods 9.5/13/16.5s — deliberately non-harmonic so the
  streaks never fall in visible unison.
- `[x]` **Copy reverted to the owner's original.** The palette now answers
  "what is this site" visually, so the headline no longer has to — which was
  the entire case for my rewrite. `titleLead`/`titleAccent` split so the accent
  is a translatable unit, not a substring.
- `[x]` **Outline CTA got a surface** (`bg-background/60 backdrop-blur-sm`) —
  at full transparency the hero grid ran straight through the label.
- `[x]` **Scrim tracks the text column on lg** (ellipse at 27% x) — centred, it
  was dimming the empty middle while the headline sat over live grid.

**Declined, with reasons** (same standard as the Aceternity review):
mousemove parallax (client JS per frame, dead on touch), the marquee, the hard
infinite caret blink (ours fades 1↔0.15 — and the finite-caret rule from
Phase 9 was consciously reversed: next to *live* typing a dead caret reads as
broken), Bricolage Grotesque (a second font for a logo), `#5b8cff` accent (the
reference brands a different hue; owner confirmed ours stays), and the
reference's fabricated palette results ("parol yaratuvchi" query showing AI
Engineering chapters — ours only ever shows true matches).

**Broken in passing and fixed:** the rain rewrite swallowed `grid-drift` +
`grid-in` (caught by grep before any visual check — the keyframes sat between
the beam block and the aurora); restored verbatim.

**Gate (real exit codes, 2026-07-30):** `check 0` · `typecheck 0` · `lint 0` ·
`test 0` · `tokens 0` · `contrast 0` · `build 0` · **269 prerendered HTML** ·
0 `MISSING_MESSAGE` · `logo-100.png` gone from the homepage HTML. Verified in
both schemes; loop verified at t=10s (query B "yarat" typed, results B visible,
A at zero).

---

## Phase 12 — `[x]` Hero micro-polish from owner review (2026-07-30)

Five observations from the owner's screenshots, each measured before touching:

- `[x]` **Title→description gap was 20px under tight leading** — descenders
  nearly touched the paragraph. Now 28px measured, and `leading-[1.02]` eased
  to `1.06` (it existed to serve the old 3-line centred layout).
- `[x]` **"Too bright" was WEIGHT, not colour.** The gradient tops out at
  `--foreground` either way; `font-extrabold` (800) at 64px is what shouted.
  Now `font-bold` (700) — the reference itself uses 600.
- `[x]` **The two-edge gulf was the fr-unit stretch.** `1.05fr/.95fr` columns
  grow with the container, so at wide viewports the text hugged the left edge,
  the palette the right, ~230px of dead middle. Now
  `minmax(0,680px)/minmax(0,560px)` — capped columns, seam measured **96px**,
  spare width falls right where the backdrop fills it, and the left edge stays
  on the logo's gutter (32px = 32px re-verified).
- `[x]` **The palette floats** — ±6px, 9s, the one idea kept from the
  reference's `wbFloat`. Period chosen off every other clock on the page
  (7/14/21/48s) so nothing locks into step. Reduced motion: static.
- `[x]` **The loop grew to THREE queries** (owner asked for more variety):
  `react` → books · `yarat`/`gener` → generators · `o'gir`/`conve` →
  converters. The third pair was verified honest before shipping: it matches
  exactly Lotin-Kirill/Base64/Rang O'giruvchi (uz) and the three Converter
  titles (en), and both are 5 chars so the `steps(5)` cadence holds. CSS clock
  went 14s→21s; spans/sets are addressed by `:nth-child`, so a fourth query is
  one delay rule + a longer duration, not a component change.

**Gate:** all 7 green · build 0 · **269 prerendered HTML** · 0 MISSING_MESSAGE ·
loop pinned at t=17.5s shows segment 3 only (`o'gir` typed, converters visible,
others at zero) · both schemes screenshotted.

> Next per the owner: **the card sections below the hero.**

---

## Phase 13 — `[x]` The hover bug's root cause + motion pacing (2026-07-30)

Owner: "cards jump instantly on hover" and "the title snaps in on refresh."
Both were real, and both were MY defects from earlier phases.

- `[x]` **Hover was dead because of `animation-fill-mode: both`.** A finished
  animation in its fill phase keeps applying its keyframe values at ANIMATION
  priority, which overrides transition-driven values of the same property. So
  `.reveal`'s retained `transform: none` sat on every card forever and
  `hover:-translate-y-*` never moved — background and shadow transitioned,
  transform stayed frozen: the "instant jump" feel. Fix: `backwards` fill —
  before the range it holds the hidden `from`; after completion nothing
  applies, and the natural state equals the `to` keyframe, so release is
  seamless. **Rule for this codebase: never `both`/`forwards` fill on an
  animation whose properties must stay interactive afterwards.**
- `[x]` **The h1 snapped because it lost its `--i` in the two-column
  restructure** — delay 0, arrived with the eyebrow. Restored slot 1; palette
  moved to slot 4 (it entered at 80ms and read as a pop). Whole entrance
  slowed 0.6s/80ms → **0.8s/110ms**, travel 1.25rem → 1.5rem.
- `[x]` **Aurora moved but imperceptibly** (±6% over 34s ≈ 4px/s). Now ±12%
  on 26s/38s — ambient but visibly alive within ten seconds.
- `[x]` **Cards + dividers polished:** depth gradient `from-card to-card/60`
  (the reference's one good card idea, tokenized), p-5→p-4, hover lift −1,
  border-color in the transition set, 300ms. Dividers gained the logo's accent
  pixel + counts ("Kitoblar · 03"). Book headers gained a mono meta row
  ("11 bo'lim · fluent-react") and a colour-transitioned title link.
- `[x]` **Reference's lower page evaluated and declined as a structure.** It is
  a marketing landing ("nega webiston" bento, $0 card, ONE featured book, CTA
  band) — conversion grammar for first-time visitors. Ours is a library page:
  all three books with real chapters serves the returning reader, which is the
  actual audience. Its two good details (card depth, mono kickers) were taken.
- `[x]` **`@media print` guard.** Discovered via a pane whose view timelines
  never tick: with `backwards` fill, unticked timelines hold content at
  opacity 0. Print is the real-world case — scroll timelines do not run on
  paper, so every unrevealed card would print blank. `animation: none` under
  print for `.reveal`/`.rise`.

**Verification note.** The browser pane's ViewTimeline is inert (frozen at one
value across all scroll positions — geometry correct, ticking absent), so
scroll-reveal and the released hover cannot be demonstrated there. Verified
instead in the compiled CSS (`backwards` present in the `.reveal` rule) and by
the spec mechanism; the owner's own screenshots show reveals completing
correctly in real Chrome.

**Gate:** all 7 green · build 0 · 269 prerendered HTML · 0 MISSING_MESSAGE.

---

## Phase 14 — `[x]` The REAL hover bug, /tools, /books (2026-07-30)

Owner reported the hover jump a SECOND time — Phase 13's fill-mode fix was a
real bug but not this bug. The actual cause, proven in compiled CSS:

- `[x]` **Tailwind v4 compiles `-translate-y-*` to the `translate` PROPERTY,
  not `transform`.** Verified: `.hover\:-translate-y-1:hover { translate: … }`.
  My hand-written `transition-[transform,box-shadow,…]` lists therefore never
  covered the lift — the value changed with no transition at all: teleport.
  Fixed at both sites (HomeSections `cardBase`, `SimpleCard`) with the STOCK
  `transition` utility, whose v4 property list includes translate/scale/rotate,
  colors, shadow AND the gradient custom properties — which also enabled a
  smooth `hover:from-accent hover:to-accent/70` depth-gradient swap.
  **Rule: never hand-write a transition property list for Tailwind translate
  utilities; use `transition` / `transition-transform` (v4 covers `translate`).**

- `[x]` **/tools page brought into the design system** — it was the old
  language wholesale: zinc/blue/green palette classes, a pulsing blue Sparkles,
  AuroraText, GradientTabs, `hover:scale-[1.02] transition-all`. Now: mono
  kicker (`▪ /tools · 17`), chip filters with icons + LIVE per-category counts
  (the reference's tools-page idea), tokenized audience chips, homepage card
  language with smooth lift, tokenized search/stats/empty-state.
  framer-motion KEPT — `AnimatePresence mode="popLayout"` for filter
  enter/exit is real interactivity, the legitimate use of the dependency.
  Token gate: **−96 hardcoded hits vs baseline** (was −18 before this phase).

- `[x]` **/books page aligned** — cards got the strong boundary + depth
  gradient + smooth lift (was weak `border-border`, no motion), mono kicker
  `▪ /books`, mono meta (`31 bo'lim · ai-engineering`), two stray `blue-600`
  links → tokens, container aligned to the site gutter.

- Reference `Tools.dc.html`/`Books.dc.html` mined: took the category-count
  chips; left the per-category colour system (would add 4 accent hues against
  ADR'd single-accent brand) and the rest of its inline-styled chrome.

**Gate:** all 7 green · build 0 · 269 prerendered HTML · 0 MISSING_MESSAGE ·
tokens **−96**. /tools and /books verified in browser (screenshots, dark).

---

## Phase 15 — `[x]` Header hover, categorical colour, filter flicker (2026-07-30)

Owner rejected Phase 14's /tools result as visually flat and reported a header
hover defect. All four complaints were valid.

- `[x]` **Header hover: grey text on a grey surface.** The nav links carried
  hardcoded `text-[#8A8A8E] dark:text-[#8D8D93]` on the INNER `<Link>`. Because
  that Link is a child of `NavigationMenuTrigger`, its own colour won and the
  trigger's `hover:text-accent-foreground` never reached it — so hovering lit
  `--accent` (a dark surface) behind text still pinned at `#8D8D93`. Colour now
  lives on the trigger (`text-muted-foreground` → `hover:text-foreground`) and
  the Link inherits. Two more hardcoded hex pairs gone.

- `[x]` **The flatness was MY doing: I collapsed 17 tool colours into one.**
  `TOOLS_LIST[].color` held a per-tool palette (`bg-blue-500/20`, yellow, green,
  purple…) and Phase 14 replaced every one with a single `bg-primary/12`. The
  owner was right that the old page looked richer. But the old palette was also
  meaningless — 17 ad-hoc hues including blue three times.
  Resolution: colour by **CATEGORY**, from the `--chart-1..4` tokens that
  already exist in `tokens.css` with separate light/dark values. Four hues, one
  per category, in a new `CATEGORY_ACCENTS` constant. The icon chip and the
  active filter chip share a hue, so colour now ENCODES category — verified:
  selecting "Generatorlar" turns the chip and all six icons `chart-2` green.
  This is the documented categorical/chart exception, in a named constant, and
  it answers the owner's question — the brand accent stays for brand elements;
  category colour is data colour, a different job. **Brand hue unchanged.**

- `[x]` **Chips had no `cursor: pointer`.** They are `<button>`s, which do not
  get it by default. Added; verified `cursor: pointer` on all five.

- `[x]` **The filter flicker, root-caused.** `AnimatePresence mode="popLayout"`
  with `initial={hasAnimated.current ? false : …}`: after first mount, incoming
  cards had NO enter animation while outgoing ones still ran a 0.2s exit tween.
  That mismatch — items appearing instantly while their neighbours faded out and
  the layout reflowed — was the flicker.
  **framer-motion removed from this page entirely** (22 import sites remain
  elsewhere, all legitimate). Replaced with the site's own CSS entrance:
  a new `.grid-rise` (35ms stagger — `.rise`'s 110ms would take 1.9s across 17
  cards) on a grid whose `key` folds in the active filters, so React remounts
  and the pass replays. **No exit animation at all**, which is the point.
  Verified after a real click: 17 → 6 cards, entrance `state: running,
  elapsed: 0`, delays 0 / 35 / 70ms.

- Token gate: **−100 hits vs baseline.**

**Gate:** all 7 green · build 0 · 269 prerendered HTML · 0 MISSING_MESSAGE.
Verified in the browser with a real filter click.

---

## Phase 16 — `[x]` Search dialog + /books depth (2026-07-30)

- `[x]` **The first-open flicker, root-caused in two parts.**
  1. `searchEngine.initialize()` fetched **1.07 MB** and then indexed ~1000
     documents in ONE synchronous `forEach` — a long task starting at the exact
     moment the dialog began animating in. Second opens skipped it via the
     `initialized` flag, which is why the owner saw it "only the first time".
     Fixed three ways: a `warm()` method called on `onPointerEnter`/`onFocus` of
     the trigger (prefetch on intent), a **single-flight** `pending` promise so
     hover-then-open cannot fetch twice, and **chunked indexing** (150 docs, then
     yield) so the work interleaves with animation instead of blocking it.
     Verified: hover → 1 index request; subsequent focus → still 1.
  2. `AnimatePresence` was fading + sliding the dialog's inner state WHILE Radix
     animated the dialog itself — two entrance animations over the same pixels.
     framer-motion removed from the dialog; verified `getAnimations()` on the
     content now returns exactly `["enter"]` with **0** inner animated nodes.
  Also removed a production `console.log` of the document count.

- `[x]` **The "ugly icon" was a CAMERA.** `NoResults` rendered lucide's camera
  path (`M14.5 4h-5L7 7H4…` + `circle r=3`) for "nothing found", and its `<svg>`
  had no width/height inside an `h-12 w-12` box, so an unsized inline SVG fell
  back to its 300×150 default and overflowed. Replaced with an explicitly sized
  magnifier-with-slash in a chip. The initial state's `FileSearch` at 40% opacity
  became the **⌘K glyph** in a brand chip — it names what the user just pressed
  and teaches the shortcut.

- `[x]` **Dialog brought into the system:** mono kicker with accent pixel,
  `font-mono` query row (it is a picture of the same surface as the hero
  palette), hit rows with first-letter chips + `⏎` affordance, group headings in
  the mono/uppercase divider idiom, keyboard-legend footer, `border-border-strong`.
  Loading state gained three staggered dots (`search-dot`) — real progress
  feedback while the index builds, where before there was static text.
  Verified live: typing returned **15 hit links** with real chapter content.

- `[x]` **/books depth pass.** Covers are 400×525 PORTRAIT but sat in a
  `pt-[50%]` landscape frame with `object-contain`, so every one floated
  letterboxed. Now at true ratio beside the title. Section headings adopted the
  mono divider idiom with zero-padded counts; tag chips got the card language;
  the four "why" boxes moved their emoji into brand chips (they were rendering at
  heading weight inline, competing with the text) and gained the depth gradient.

**Gate:** all 7 green · build 0 · 269 prerendered HTML · 0 MISSING_MESSAGE ·
framer-motion sites 22 → **21**.

---

## Phase 17 — `[x]` Book landing pages `/books/<id>` (2026-07-30)

`src/components/mdx/TutorialLanding/TutorialLanding.tsx` — rewritten. The three
landing pages are the entry point to 225 chapters and were the last surface on
the site still speaking 2015 documentation.

- `[x]` **The page was pure redundancy.** A bordered "Boshlash" box whose body
  read *"pick a topic from the sidebar navigation"*, then a `list-disc` bullet
  list of the **same 7/9/12 links the sidebar was already showing two columns to
  the left** — in the same order, with no extra information. Zero design-system
  vocabulary: no cover (the book HAS one — `getTutorialInfo` returned `image` and
  nothing rendered it), no counts, no card language, no mono/accent identity.

- `[x]` **Two hard-rule violations in one utility string** —
  `hover:text-black dark:hover:text-white` on every link: a raw palette class
  AND a `dark:` variant on a colour utility. Now `hover:` on token surfaces only.

- `[x]` **`not-prose` on the root.** This subtree renders inside the
  `article.prose` wrapper `TutorialLayoutContent` puts around every book page.
  Prose is right for MDX chapters and wrong for a designed layout — it is what
  forced the old `p-8 pt-0` (padding-top ZERO on a padded card), fighting an h2
  margin the card did not control.

- `[x]` **The right rail was a list of dead links.** `TableOfContents` scrapes
  `article h2, h3, h4` and links to `element.id`; this page's two headings had
  no `id`, so "Ushbu sahifada" rendered `href="#"` twice. Headings now carry
  `id="mundarija"` / `id="mualliflik-huquqi"`. Verified: `#mundarija` scrolls to
  1067px. The count moved OUT of the `h2` into a sibling span — `textContent`
  has no concept of a flex `gap`, so an inner `<span>· 07</span>` read
  **"Mundarija· 07"** in the rail while looking correctly spaced on the page.

- `[x]` **CONTAINER queries, not viewport breakpoints — measured, not assumed.**
  This column sits between a 288px sidebar and a 256px table of contents, so
  the viewport is not what constrains it. Measured widths: **352px at `lg`**,
  608px at `xl`, 864px at the 1536px cap. A first pass with `xl:grid-cols-3`
  measured **192px per card** — too narrow for
  "1. Fundamental modellar asosida SI ilovalarini yaratish". Two columns is the
  ceiling here; a third only ever gets ~290px.
  The proof a viewport breakpoint could not do this: at a FIXED 1024px viewport,
  collapsing the sidebar took the container 344px → **632px** and the layout
  responded — header `column` → `row`, h1 30px → 36px, grid 1 col → **2 × 308px**.
  A `sm:`/`xl:` would have been frozen through that.

- `[x]` **Every number derived from `_meta.json`, never typed in.** 7/9/12
  sections and 24/76/97 topics; per-card "N mavzu" vs "Alohida sahifa" for front
  matter. Verified against the meta tree: 5+7+11+14+8+11+11+9 = **76** for the JS
  book. No invented chapter numbering — the titles already carry "1.", "2.".

- `[x]` **Latent href bug.** Cards linked `${tutorialId}/${item.path}` —
  RELATIVE, and it only resolved because `/books/<id>` carries no trailing slash.
  One `/` away from `/books/<id>/<id>/<path>` and a 404. Now absolute. All 28
  landing-page links across the three books verified **200**.

- `[x]` `navigationItems: any[]` → `TutorialNavigation[]`.

- `[x]` **New:** cover at its real 400×525 ratio (same asset `/books` already
  ships, so zero new bytes), mono `/books/<id>` kicker, derived stat row with a
  `Bepul` brand chip, and two CTAs — "O'qishni boshlash" pointing at the book's
  OWN first entry, plus "Barcha kitoblar".

- `[x]` **Fixed in passing:** `@media print` guarded `.reveal` and `.rise` but
  not `.grid-rise`, which is `backwards`-filled too — printing /tools or a book's
  table of contents produced empty card frames.

**Found, not fixed — `pnpm tokens` has a blind spot.** `PALETTE_RE` lists 22
Tailwind hues but not `black`/`white`, and those classes carry no numeric suffix
to match anyway. So `hover:text-black dark:hover:text-white` — the exact
violation removed here — was **invisible to the ratchet**. Repo-wide there are
**124** `bg|text|border|…-(black|white)` hits the gate cannot see, worst offenders
`HttpStatus.tsx` (15) and `OgMetaGenerator/PreviewPanel.tsx` (10). Widening the
regex moves the ratchet for the whole repo — owner's call.

**Also found, not fixed:** the book-reader CHROME still carries the palette
classes this page shed — `Sidebar.tsx` (2 sites), `TableOfContents.tsx`,
`Pagination.tsx` and `ContentMeta.tsx` (raw `text-[#8D8D93]`). That is the reader
surface on all 229 chapter pages, a separate pass. The breadcrumb also overflows
at 375px (`flex-nowrap whitespace-nowrap` in `TutorialLayoutContent`).

**Gate:** `check 0` · `lint 0` · `typecheck 0` · `test 0` · `tokens 0` ·
`contrast 0` · `build 0` — 269 prerendered HTML, 0 `MISSING_MESSAGE`,
`list-disc` occurrences in the built landing HTML **1 → 0**.

---

## Phase 17b — `[x]` Owner rejected 17's card + shell alignment (2026-07-30)

Owner's verdict on Phase 17: *"umuman menga yoqmadi … nimaga cardlarda title
ostida chiziq bor, nimaga kerak"* — plus a specific structural complaint that the
left sidebar is not level with the header. Both were right.

- `[x]` **The hairline under every card title.** Phase 17 put the meta row at the
  BOTTOM of the card behind a `border-t`. On a one-word title that drew a rule
  directly under the word (`E'tiroflar ─────`) and made each card read as a table
  row. The homepage's `ChapterCard` has no such rule. Cards now follow the
  homepage order **exactly**: mono accent line → title → two muted lines.

- `[x]` **The cards gained the description slot they were missing.** The homepage
  card is accent/title/description; this one had accent/title and a hairline to
  fill the space. The third line is now the chapter's **own first three topics**
  from `_meta.json`, joined with `·` — real information, and plain text rather
  than links because nesting an `<a>` inside a card that IS an `<a>` is invalid
  HTML. "3. Baholash metodologiyasi" now previews *"Fundamental modellarni
  baholashdagi qiyinchiliklar · Til modellashtirish metrikalarini tushunish ·
  Aniq baholash"*.

- `[x]` **THE ALIGNMENT BUG — measured, three numbers.** At a 1600px viewport the
  header's logo starts at **x=64** (the `max-w-[1536px]` container's content
  edge). The sidebar's rows started at **x=80** and their text at **x=92** —
  `TutorialLayout` put a `pl-4` on the aside's inner div *on top of* each nav
  row's own `pl-3`. That 28px offset is what the owner saw. Removing the `pl-4`
  puts the rows at **64, flush with the logo and with the footer's first link
  (also 64)**; the remaining 12px is the row's internal text inset, which the
  active state's `border-l` needs. The right rail was changed `px-4` → `pl-3
  pr-4` so both rails are inset by the same 12px from their own page edge, and
  its right edge stays at **1536** = the header's right content edge.

- `[x]` **Both sticky rails were sitting 9px UNDERNEATH the header.**
  `TutorialLayout` hardcoded `top-[3.5rem]` (56px) and
  `h-[calc(100vh-3.5rem)]`, but the header is `--header-height` (4rem) **plus a
  1px border = 65px measured**. Now `top-(--header-height)` and
  `calc(100vh - var(--header-height))` — one token, read in three places.
  Verified on a long chapter (`/books/fluent-react/jsx/under-the-hood`, 5,664px
  document) at scrollY 1500: `asideTop` and `railTop` both **64**,
  `gapUnderHeader` **−1px** — flush against the border, no sliver, no underlap.

- `[x]` **Top block reviewed as asked.** Cover 120→**144×189** with a
  `bg-primary/15 blur-2xl` halo — the homepage hero's brand light scoped to one
  object, and the only decoration on the page. The kicker became a bordered chip
  (the homepage's eyebrow-badge treatment). `h1` leading tightened to 1.12 and
  the description gap `mt-4`→`mt-5`, because at that leading 16px read as glued.
  `Bepul` moved to the END of the meta run — sitting between two `·` separators
  it read as a third separator.

- `[x]` **"Kitob rasmi sticky bo'lish kerakmi?" — no, and it is documented in the
  component.** The column already sits between two sticky rails, the page is
  barely two screens tall, and a cover is identity rather than navigation.
  Pinning a third element makes the layout feel nailed down and buys the reader
  nothing.

**Note on the layout change's blast radius:** `TutorialLayout` is the shell for
all 229 chapter pages, not just the 3 landing pages. Verified after the change:
build 0, 269 prerendered HTML, sticky correct on a long chapter, `3.5rem` gone
from the file except in the explanatory comment.

**Gate:** `check 0` · `lint 0` · `typecheck 0` · `test 0` · `tokens 0` ·
`contrast 0` · `build 0` — 269 prerendered HTML, 0 `MISSING_MESSAGE`.

---

## Phase 18 — `[x]` The reading page: payload, correctness, tokens (2026-07-30)

The actual chapter surface (`/books/**`, 226 prerendered pages). Owner asked for
a deep review with authority to fix architecture, plus answers on SSR/RSC and the
latest Next APIs. Answers are in `../../reference/architecture.md`; this is what
changed.

### Payload — barrel imports were the whole story

Measured from the prerendered HTML's own chunk list, gzipped:

| | chunks | JS gzip |
| --- | --- | --- |
| before | 17 | **383 KB** |
| after | 19 | **340 KB** |

Client modules in the chapter route's reference manifest: **30 → 16**.

- `[x]` **`CodeBlock.tsx:1` imported `{ CopyButton }` from `@/components/shared`.**
  A barrel drags every CLIENT module it re-exports into the importing route's
  manifest, even from a Server Component. That one line was putting
  `DualTextPanel` and `TerminalInput` — tool-only UI — on all 226 chapters.
  Now a deep import. `packages/ui`'s `exports` map had `"./composites/*":
  "./src/composites/*.tsx"`, which resolved to **files that do not exist** (every
  composite is a directory); fixed to `*/index.ts`.
- `[x]` **All 16 `src/components/ui/*` shims re-exported the `@webiston/ui`
  ROOT barrel.** Repointed at `@webiston/ui/primitives/<name>`, the subpath that
  was already declared and already resolved.
- `[x]` **The last leak was a CONSTANTS file.** `src/constants/ui-constants.ts`
  did `export { TOOL_COLORS, UI_PATTERNS } from "@webiston/ui"`, and it is
  reached from `@/constants` → `Footer` → every page. Two colour constants were
  shipping `aurora-text`, `code-highlight`, `gradient-tabs`, `number-ticker`,
  `select`, `typing-animation` and `BaseModal` to every book chapter. New
  `"./constants/*"` and `"./utils"` subpaths; lucide's chunk collapsed
  **111 KB → 15 KB gz** once tree-shaking could see through it.
- `[x]` **FlexSearch was eager: 74 KB gz on all 269 routes.** `Search.tsx`
  statically imported `@/lib/search/flexsearch`, which imports the library at
  module scope AND runs `new SearchEngine()` (→ `new Index()`) as a module side
  effect. A previous pass made the 1.07 MB *index* load on intent; the *library*
  never did. New `src/lib/search/load.ts` holds a memoised `import()` and no
  static import — it has to be its own file or the deferral is defeated.
  Verified still working: hover → open → type "react" → **15 hit links**, and
  `flexsearch` appears in **0** eagerly-loaded chunks.

### Correctness

- `[x]` **The table of contents scrolled to the wrong place.** Every link did
  `preventDefault()` then `window.scrollTo({ top: element.offsetTop - 100 })`.
  `offsetTop` is measured from the nearest POSITIONED ancestor and
  `TutorialLayout`'s root is `relative` — measured on a real chapter, a heading's
  `offsetTop` was **522** while its true document offset was **587**. Net landing
  error **165px**, and the magic `-100` existed to hide half of it. The headings
  already carry `scroll-margin-top: 80px`, which native anchor scrolling honours.
  Deleting the handler fixes it with less code: verified `scrollY` 1685 = expected
  1685, heading 80px from the top, clearing the 65px header by **15px**, and
  `location.hash` updated without `pushState`.
- `[x]` Headings with no `id` were rendered as `href="#"` in the rail — filtered.
- `[~]` **My own perf suspicion was wrong and is recorded as such.** The scroll
  handler's per-event `querySelectorAll` measured **0.028ms** on a 7-heading
  chapter. It was never the bottleneck it looked like; the DOM re-query was
  removed anyway (a prerendered document cannot change), but no perf claim is
  made for it.

### Tokens — 123 hits removed since the baseline

- `[x]` `MDXContent`: inline code `border-slate-200 bg-slate-100` + two
  `dark:[#ffffff1a]` → `border-border bg-muted`; table `border-[#ddd]` (a light
  grey that drew near-white grid lines in dark mode) → `border-border`; footnote
  `sup` links `text-sky-500` → `text-primary`.
- `[x]` `CustomLink`: prose links were the last place on the site painted in
  Tailwind's `sky` palette — a **different blue** from the 217° brand hue, two
  blues in the same paragraph. Now `text-primary`, and the external-link icon
  uses `stroke-current` instead of naming the colour twice more.
- `[x]` `HeadingLink`: four palette classes + two `dark:` variants → one token
  pair.
- `[x]` `Sidebar`: the active row's `border-[#BABABB] bg-[#E9F4FF]` /
  `dark:border-[#878787] dark:bg-[#022248]` → `border-primary border-l-2
  bg-accent`; `hover:text-black dark:hover:text-white` ×2 → `hover:text-foreground`
  (which also removed a nested `dark:hover:[&[data-state=open]>svg]` override —
  the chevron inherits `currentColor`).
- `[x]` `Callout`: `dark:[&_h3_a]:!text-white` ×2 → unconditional
  `!text-foreground`.
- `[x]` `Pagination` **rewritten**: it carried 16 hardcoded values
  (`text-[#8D8D93]` ×6, `text-black`/`dark:text-white` ×8) and looked like a
  caption, when "where do I go next" is the most important control on a reading
  page. Now two cards in the landing page's language — mono kicker, strong
  boundary, depth gradient, hover lift — on a 2-col grid instead of
  `justify-between` with an empty `<div />` spacer, so a first/last chapter's
  surviving card is not pushed around.
- `[x]` `ContentMeta`: `border-[#F2F2F7]` + `dark:border-[#151515]` →
  `border-border`.

### My own mistake, and what it taught

I wrote an arbitrary-variant pattern containing `*` inside a **code comment**.
Tailwind v4 scans raw file text including comments, harvested it as a real
utility, and emitted `.…\:\!text-foreground h* a { }` — an invalid selector that
broke the CSS parse. The production build still exited 0; only the dev server
surfaced it. Fixed, and the file now carries a warning not to do it again.
**Lesson worth keeping: `pnpm build` exiting 0 does not prove the CSS parsed.**

**Gate:** `check 0` · `lint 0` · `typecheck 0` · `test 0` · `tokens 0` ·
`contrast 0` · `build 0` — 269 prerendered HTML, 0 `MISSING_MESSAGE`.

---

## Phase 18b — `[x]` Self-review of Phase 18, ToC rail, image loading (2026-07-30)

Owner asked for a senior review of Phase 18's own code, plus two specific items.

### What the self-review found in my own work

- `[x]` **The ToC active indicator was drawing a curved arc.** `border-l-2` on a
  `rounded-md` link makes the border follow the radius, so the "you are here"
  mark read as a stray teal bracket floating beside the text. Replaced with the
  standard docs-rail pattern: the `ul` owns a continuous `border-l`, each row
  sits on it with `-ml-px border-l-2` and **no radius**, and indentation is
  `pl-3/6/9` rather than `ml-*` — a margin would push rows off the shared edge
  and break the line.
- `[x]` `Pagination` rendered an empty `<span />` as a grid placeholder that the
  "next" card's `sm:col-start-2` already made unnecessary.
- `[x]` `load.ts` wrapped a module type in `Awaited<>`, a no-op on a non-promise.

### A false alarm I raised and then disproved — recorded deliberately

I reported that the rail came up **empty after client-side navigation**. It does
not. Two measurement faults produced that claim:

1. The `output: "standalone"` server I was testing against **404s every client
   chunk** — `.next/static` is not copied into the standalone tree (documented,
   and on us). Nothing hydrated, so every client component looked broken.
2. My probe matched `innerText.includes("Ushbu sahifada")` against an element
   carrying `uppercase`, so it was comparing against `USHBU SAHIFADA`.

Settled by experiment rather than argument: rebuilt **without** the `key`, served
the normal build, navigated client-side — the rail updated correctly
(`tocAfterNav` === `articleHeadings`, `stale: false`). The `key` is **kept**, but
on honest grounds now stated at the call site: it is not fixing an observed bug,
it removes an unstated dependency on Next currently remounting the subtree, and
`cacheComponents` would break exactly that assumption because it preserves state
across navigation via React `<Activity>`.

Also corrected: I initially "fixed" this with a `[route]` effect dependency and a
`biome-ignore`. Biome was right — nothing in the effect body reads the route, so
the dependency was a lie. `key` expresses the actual intent.

**Note for `architecture.md`:** `next start` refuses to run under `output:
standalone`, and the standalone server needs `.next/static` copied in manually.
Verify UI against `next start` on a spare port, or copy static first.

### Images

- `[x]` **Figures now have a loading state.** The box was always the right size
  (`getPublicImageSize` measures on the server; CLS is 0), but until the bytes
  arrived it was an empty hole in the prose — and `public/` is **26 MB** across
  106 files, with one chapter (`modeling`) pulling **1,549 KB** of PNG across 6
  figures. A `bg-muted` skeleton with the existing `animate-shimmer` now fills
  the reserved box and the image fades in over 500ms.
  `imgRef.current.complete` is checked on mount because a cached figure paints
  before React attaches `onLoad`, which would strand the skeleton over a picture
  that is already visible; `onError` clears it too.
- **Deliberately NOT `placeholder="blur"`.** Verified in
  `next/dist/shared/lib/get-img-props.js`: for a string `src`, `placeholder="blur"`
  **throws** without `blurDataURL`, and generating 106 real LQIPs needs `sharp`
  plus a build step. `blurDataURL` becomes a CSS `background-image`, so it *would*
  work despite `images.unoptimized` — it is a good next step, but it adds a
  dependency and belongs in a decision, not a drive-by.

**Measured answer to "are the images in the bundle?" — no.** Zero base64-inlined
rasters in any chunk; `.next/static/media` (1.5 MB) is **fonts only**. `public/`
is served as static files, one request per figure, only on the page that uses it.
Bundle size and JS payload are unaffected. The real cost is per-page bytes, and
that is the `images.unoptimized: true` decision still open in `active.md`.

**Gate:** `check 0` · `lint 0` · `typecheck 0` · `test 0` · `tokens 0` ·
`contrast 0` · `build 0` — 269 prerendered HTML.

---

## Phase 18c — `[x]` Reader shell: rail marker, collapse, theme, loader (2026-07-30)

Owner rejected 18b's rail marker and reported five more things. All five were
real.

### The rail marker, third attempt — and why the first two failed

- `[x]` **The marker could never be centred on the rail.** The track was the
  `ul`'s **1px** `border-l`; the marker was a **2px** bar nudged over it with
  `-ml-px`. A 2px bar cannot be centred on a 1px border without half-pixel
  maths, which is exactly why it looked like it was hanging off the line.
  Track and marker are now two absolutely-positioned bars with **identical**
  geometry (`left-0 w-0.5 rounded-full`), so they are concentric by
  construction — verified: both `left: 1292`, both `width: 2`.
  `rounded-full` on both is the "sal border berib, sifatli chiziq" the owner
  asked for.
- `[x]` **Hovering the active row greyed out its own indicator.**
  `hover:border-border-strong` and `border-primary` are different variants, so
  `tailwind-merge` cannot dedupe them and the hover rule wins in the cascade.
  Rows now carry no border at all — there is nothing left to override.
- `[x]` **Changing section read as a jump, not movement.** One row's border
  appearing while another's disappears is two colour fades. Now a single bar
  animates `top`/`height` (300ms). Verified against a **two-line** heading —
  the case in the owner's screenshot: marker `top: 276px, height: 52px` against
  a 52px row, `alignsTop 0` / `alignsBottom 0`.
- `[x]` **The rail did not follow the reader on a long chapter.** 27 headings
  against a `max-h-[calc(100vh-8rem)]` box means the highlight ends up below the
  panel's fold. New `keepRowVisible()` scrolls **only the rail's own box**, and
  only when the row has actually left it. Deliberately not
  `row.scrollIntoView()` — that walks every scrollable ancestor and would drag
  the page, fighting the reader's own scroll. Verified: at page end the computed
  target was **317** = exactly the rail's max scroll, and applying it brought the
  row into view.

### The collapse

- `[x]` **The button matched nothing when collapsed.**
  `left-[calc(100%-0.5rem)] translate-x-4` put it 8px into the gutter then
  pushed it 16px back. Now `-left-2.5`, which is half the difference between the
  40px control and its 20px icon — so the ICON'S left edge lands on the
  container's content edge. Verified: icon left **64** = logo left **64**.
- `[x]` **The prose re-wrapped for the whole animation.** Root cause was not the
  duration: the content column genuinely grew 864px → 1,152px, so every
  paragraph reflowed on every frame, and on top of that the inner div was
  swapping `translate-x-4`, `pl-12`→`pl-8` and a `max-w` at the same time on a
  separate 500ms transform transition.
  Fixed by capping the column at a new `--reading-measure: 54rem` — which is
  *exactly* the width it already has with the sidebar open — so the extra space
  becomes margin and **the line breaks never move**. Measured across a collapse:
  paragraph `816 × 168` → `816 × 168`, byte-identical, with the aside going
  288 → 0. All the transform/padding churn deleted; nothing left to animate in
  the content column.
  It is also better typography: 1,152px of prose is ~150 characters per line.
- `[x]` `transition-all duration-500` → `transition-[width,border-color]
  duration-300` on the aside. `all` asks the browser to watch every animatable
  property on an element whose width change already forces a layout pass per
  frame.

### Header chrome

- `[x]` **The progress bar was `#3b82f6`** — Tailwind's `blue-500`, not our 217°
  brand hue. The one piece of chrome that appears on **every navigation** was
  painted in someone else's blue. Now `var(--primary)`: the library injects
  `background:${color}` into a `<style>` tag, so a custom property resolves
  normally and it follows the token through both schemes.
- `[x]` **The theme toggle's first click did nothing visible.** The handler read
  `theme`, but `ThemeProvider` runs `enableSystem`, so `theme` is the string
  `"system"` until the reader chooses. `"system" === "light"` is false → it set
  `"light"`, which for anyone on a light OS was the scheme already showing. Now
  branches on `resolvedTheme`.
- `[x]` **The icon was wrong before mount.** `useTheme()` returns `undefined` on
  the server and first client render, so the Moon rendered regardless — a
  visible flip on hydration for light-mode readers. Both icons are now always in
  the DOM, chosen by CSS off the `.dark` class `next-themes` sets in its
  blocking script before first paint. No state, no mismatch.
- `[x]` **framer-motion removed from the site header.** `AnimatePresence` +
  `motion.div` were animating a 20px icon on every route. Chapter JS
  **340 → 299 KB gz**, and framer-motion is now in **zero** eager chunks on a
  book page.

**Environment note that cost time twice:** the Browser pane does not tick CSS
transitions or `scroll-behavior: smooth`. Computed styles stay frozen at the
start value while the inline style already holds the target, which reads exactly
like a broken layout. Verify settled geometry by injecting
`*{transition:none!important}` first, or the measurement lies.

**Gate:** `check 0` · `lint 0` · `typecheck 0` · `test 0` · `tokens 0` ·
`contrast 0` · `build 0` — 269 prerendered HTML, chapter JS **299 KB gz**.

---

## Phase 18d — `[x]` Theme switch as a view transition (2026-07-30)

- `[x]` **Why 18c's icon cross-fade was instant, and why that was unfixable in
  CSS.** `Providers.tsx` sets next-themes' `disableTransitionOnChange`, which
  injects `* { transition: none !important }` for the duration of the swap. It
  kills the rotate/scale pair — and killed the framer-motion version before it,
  which means that dependency was being carried for an animation that never ran.
  The flag is correct: this site is token-driven, so without it ~1,600 elements
  would each run their own `transition-colors` at once and the page would smear
  through an intermediate colour.
  So the answer is not to animate 1,600 things better — it is to animate **one**
  thing. `document.startViewTransition()` snapshots the old page, paints the
  new one, and a `clip-path` circle wipes between the two snapshots: a single
  composited animation, origin anchored on the button, radius sized by
  `Math.hypot` to the furthest corner.
  Verified live: `data-theme-revealing` set during the swap, origin
  `x: 1510 / y: 32` = the button's centre, `r: 1741.7` = the far corner,
  `dark → light`, attribute cleaned up afterwards.
  `flushSync` is load-bearing — `startViewTransition` snapshots when its
  callback returns, so a plain `setTheme` would land after the snapshot and the
  wipe would reveal the OLD theme.
  Degrades by design: no `startViewTransition` (Firefox) or
  `prefers-reduced-motion: reduce` → plain `setTheme`, the previous behaviour.

- `[!] **A claim of mine, retracted.** 18c recorded that the toggle's *first
  click did nothing visible* because `theme` is `"system"` under `enableSystem`.
  Checked instead of assumed: with `defaultTheme="dark"` and empty storage,
  next-themes resolves `theme` to **"dark"**, not `"system"` (verified on a
  fresh load with a light OS), and our UI exposes no System option for a reader
  to pick — so that branch is unreachable today. `resolvedTheme` is still the
  right value for a binary toggle, and becomes load-bearing the moment
  `defaultTheme` changes or a System option is added, but it fixed no observable
  bug. The component comment says so.
  **The markup defect WAS real:** `useTheme()` returns `undefined` on the server
  and first client render, so `theme === "light" ? <Sun/> : <Moon/>` rendered
  the Moon regardless — a visible icon flip on hydration for every light-mode
  reader. Both icons are in the DOM now and CSS picks off a class set before
  first paint.

**Gate:** `check 0` · `lint 0` · `typecheck 0` · `test 0` · `tokens 0` ·
`contrast 0` · `build 0` — 269 prerendered HTML.

---

## Phase 18e — `[x]` Collapse removed, shell to the server, quiet theme fade (2026-07-30)

- `[x]` **Sidebar collapse deleted — owner approved.** Once `--reading-measure`
  capped the reading column the toggle bought the reader nothing: the prose
  could not get wider, so it only hid the navigation. No major docs site
  (Next.js, Tailwind, Stripe, MDN) ships one on desktop for that reason. Gone:
  `useState`, the button, two transitions, `PanelsTopLeft`/`PanelTop`, and the
  `Button` import.

- `[x]` **`TutorialLayout` is now a SERVER component.** Two things had been
  keeping the whole reader shell across the client boundary: the collapse state
  above, and a `useEffect` pushing `navigationItems` into the Zustand store —
  which was **duplicate work**. `books/[...slug]/layout.tsx` already renders
  `<NavigationStoreInitializer tutorialId navigationItems />` as this
  component's immediate sibling, same two arguments, same store key. One of the
  two was always redundant, and the redundant one was the one costing us the
  boundary.
  Verified in the route's client reference manifest: **16 → 15** client
  modules, `TutorialLayout` no longer among them. Chapter JS **299 → 298 KB gz**
  (the shell was mostly markup; the win here is architectural, not bytes).

- `[x]` **The circular theme wipe is gone.** Owner called it gaudy and was
  right — a colour scheme is a preference, not an event, and a full-viewport
  `clip-path` reveal announces it far louder than it deserves. The View
  Transition stays, because it is the only thing that CAN animate the swap while
  `disableTransitionOnChange` is on, but it is now the browser's plain
  cross-fade shortened to **180ms** (default 250ms drags on something this
  ordinary). Verified live: `circularWipeStillInCSS: false`,
  `crossFadeDuration: 0.18s`, `dark → light`, attribute cleaned up after.

- `[x]` **The icons.** They deliberately do NOT run their own keyframes on the
  theme change — they ride the page's cross-fade, so the whole change is one
  animation instead of the icon doing something separate from the page it sits
  on. The control's own motion is a hover nudge (`group-hover:rotate-45` on the
  sun, `-rotate-12` on the moon), which is *not* suppressed by
  `disableTransitionOnChange` because it is driven by hover rather than by the
  class swap — the first bit of motion this button has ever actually shown.

**Gate:** `check 0` · `lint 0` · `typecheck 0` · `test 0` · `tokens 0` ·
`contrast 0` · `build 0` — 269 prerendered HTML, chapter JS **298 KB gz**.

---

## Phase 19 — `[x]` Error & empty states audit (2026-07-30)

Owner asked whether anything is left before the per-tool pass. Audited every
special file and every zero state against the **production build**, not source.

### The finding: the site had no 404 at all

Measured on `next start`, before the fix:

| URL | status | what actually rendered |
| --- | :---: | --- |
| `/nonexistent-page` | 404 | Next's built-in "This page could not be found." |
| `/books/nonexistent-book` | 404 | same |
| `/books/<book>/nonexistent-chapter` | 404 | same |
| `/en/nonexistent` | 404 | same |
| `/tools/nonexistent-tool` | 404 | same |

No header, no footer, no branding, no way back — on **every** unmatched URL.

**Three hand-written files existed and none of them ran.** `dynamicParams =
false` makes Next reject an unknown param at the **routing** layer, before the
segment renders, so a segment-level `not-found.tsx` is only reachable when
`notFound()` is called during a render that actually happens. For a fully
prerendered corpus that never occurs. The file Next actually looks for —
`src/app/not-found.tsx` — did not exist.

- `[x]` **`src/app/not-found.tsx`** — branded, in the design system: mono/accent
  404 chip, the standard heading/description rhythm, two `ButtonLink` CTAs, and
  three mono deep links plus a ⌘K hint so the page is an exit rather than a dead
  end. Chrome is assembled locally with the same trick `books/layout.tsx` uses
  (`setRequestLocale(routing.defaultLocale)` + the two client namespaces),
  because the root layout carries only `<html>`/`<body>` and the providers.
  `robots: { index: false, follow: true }` — verified in the served HTML.
  All five URLs above now render it, with header and footer.
- `[x]` **`src/app/global-error.tsx`** — there was none, so a root-layout
  failure showed Next's unstyled default with nothing reported. Deliberately
  inline-styled and `prefers-color-scheme`-driven: the stylesheet is imported by
  the very layout whose failure gets you here, and `next-themes` sets `.dark`
  from a script in that same layout. Surfaces `error.digest`, which is the only
  handle on a production error.

### Everything else, checked

- `loading.tsx` — **none anywhere, and none needed.** Every route is prerendered,
  so there is no server wait to cover; client navigation is already covered by
  `NextTopLoader`.
- `forbidden.tsx` / `unauthorized.tsx` — Next 16 supports both behind
  `authInterrupts`. The site has no auth. Correctly absent.
- `/tools` no-match state — exists (`noResults` + `noResultsHint`, both
  translated). Plain but honest; folded into the per-tool pass.
- Search no-results — done in Phase 16.
- `/books` empty state (📚 + "Kitoblar tez orada") — unreachable: `getAllTutorials`
  returns three hardcoded books.
- `ErrorContent` — reachable only from `TutorialContent`'s catch, which cannot
  fire at runtime because the routes prerender; a throw would fail the build.

**Prerendered HTML 269 → 270** (the new `/_not-found`).

**Gate:** `check 0` · `lint 0` · `typecheck 0` · `test 0` · `tokens 0` ·
`contrast 0` · `build 0`. `i18n 1`, unchanged — still the 8 dead url-encoder keys.

---

## Phase 19b — `[x]` Contextual 404s, centring, innerHTML audit (2026-07-30)

### The 404 is now a ladder, not a single page

Owner's point, and it was right: a mistyped chapter of a book you are already
reading should not throw you out of the book. Next's own model supports exactly
that — `not-found.js` renders **between `loading.js` and `page.js`**, i.e.
*inside* its enclosing layouts (confirmed against the 16.2 docs).

What blocked it was `dynamicParams = false`: unknown params are rejected at the
ROUTING layer, before the segment renders, so `notFound()` is never reached and
a segment-level `not-found.tsx` can never run. Flipped to `true` — and note this
costs no prerendering: all **228** book HTML files are still emitted and the
route is still `●`. Only the *unknown* path behaves differently.

| URL | renders | chrome kept |
| --- | --- | --- |
| `/books/<book>/<bad-chapter>` | `[...slug]/not-found.tsx` | sidebar (7 items), breadcrumb, header, footer — **verified in the DOM** |
| `/books/<bad-book>` | `books/not-found.tsx` | header + footer; lists the three real books, read from `content/**` |
| anything else | `app/not-found.tsx` | header + footer |

The split is decided in `[...slug]/layout.tsx`: `notFound()` thrown from a
LAYOUT bubbles past that layout's own `not-found.tsx` (it would have had to
render inside the very layout that failed), so an unknown book lands one rung
up. The layout's `getTutorialInfo` guard is also what keeps
`dynamicParams = true` bounded — an invented id is rejected after one
`fs.access`, before any content lookup.

- `[x]` **Fabricated 404 titles removed.** `generateMetadata` title-cased the
  URL, so `/…/modelingXXX` shipped `<title>ModelingXXX | AI Engineering…</title>`
  with a canonical URL and an OG image, for a page returning 404. Now returns a
  not-found metadata object. **Scope, honestly:** Next discards a page's
  metadata once it 404s, so the served title is the neutral site default rather
  than "Topilmadi" — the win is that the *fabricated* title is gone, not that a
  custom one landed. `noindex` is injected by Next on 404 responses; verified
  present on both book rungs.
- `[x]` `min-h-screen` removed from all three (they render inside a shell that
  already owns the viewport, so it pushed the footer a screen down), and
  `<Link passHref><Button>` — which emits `<a><button>`, interactive content
  inside interactive content — replaced with `Button asChild`.

### The centring bug

Owner reported the 404 text was not centred, twice. It was: the description sat
**64px** left of everything else — exactly `(max-w-xl 576 − max-w-md 448) / 2`,
the signature of an auto margin not resolving. Every other child was full-width,
so nothing else revealed it.

Fixed structurally rather than by debugging the margin: the container is now
`flex flex-col items-center`, so the PARENT positions each child and a child's
own width cap can no longer decide whether it is centred. Measured after:
all six children's text centres at **800** on a 1600px viewport, **spread 0px**.

### `dangerouslySetInnerHTML` — audited, one real fix

~70 sites. Grouped by where the data comes from:

- **~65 are JSON-LD** (`JSON.stringify(schema)`), every schema a hardcoded
  module-level `const`. **No injection path today.** The standard hardening —
  escaping `<` as `<` so a value containing `</script>` cannot break out —
  is still worth applying, but 60 of the 65 sites are tool pages, so it belongs
  in the tools pass rather than as a drive-by sweep of every route.
- **1 is the search result snippet** — the only place a `content/**` string
  becomes live markup. **Fixed.** `highlightText` now escapes the text FIRST and
  inserts `<mark>` after, so the only tags that can survive are the two it wrote
  itself. The query is escaped the same way before building the regex, or a
  search for `<` would stop matching.
  Measured against the built index: **1,078 documents, 0** contain a
  script/img/iframe/handler; the 4 containing `<` at all are MDX component tags
  like `<Callout type="info"`. The `<script>` occurrences in `content/` are all
  inside fenced code blocks, which the index builder strips (verified: 3 raw
  hits → 0 after stripping). So this closed a *class* of hole, not a live one —
  three lines, no sanitiser dependency.
- **2 in `code-highlight.tsx`** (a `@webiston/ui` primitive) and **1 in
  `global-error.tsx`** (a static style literal I wrote).

**Verdict on "do we need DOMPurify?" — no.** Nothing here renders third-party or
user-submitted HTML; the inputs are our own constants and our own MDX. A
sanitiser would add a dependency and a false sense of coverage. Escaping at the
one boundary that handles non-constant text is the proportionate fix.

### Token baseline re-frozen

`pnpm tokens` correctly failed on `global-error.tsx` (+8). That file cannot use
tokens **by definition** — `tokens.css` is imported by the layout whose failure
renders it, so a token reference would resolve to nothing and leave black text
on a black page at the worst possible moment. Followed the gate's own
instruction: values moved into a named `FALLBACK_PALETTE` constant with the
reason, then `--update --force`. Baseline **2,605 → 2,486** — this session's
−123 locked in, +4 documented exception.

**Gate:** `check 0` · `lint 0` · `typecheck 0` · `test 0` · `tokens 0` ·
`contrast 0` · `build 0` — 228 book HTML unchanged, 0 `MISSING_MESSAGE`.

---

## What this initiative does NOT cover

- Accessibility beyond colour contrast — the 81 `pnpm check` errors
  (`noLabelWithoutControl` 42, `noSvgWithoutTitle` 16, …) live in
  `tooling-ci-and-testing.md`.
- Component API or structure changes — `code-structure.md`.
