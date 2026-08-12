# Initiative — Code Snapshot (`/tools/code-snapshot`)

**Spec:** this file (no `reference/` doc — this is a product initiative, not the
execution of an existing spec) · **Status:** `[~]` Phases 0, 1, 1b and the
Phase 2 complete except the ligature toggle; Phase 3 done, SVG CUT; Phase 3b
fixed the flicker and the panel fit · **Next:** keyboard shortcuts.

> A code-to-image tool: paste code, get a shareable picture of it. The owner
> asked for "more features than the competition, modern themes, many languages,
> no login, no paywall, but still simple".
>
> **Read the Refuted table before adding anything.** Two of the assumptions this
> started from did not survive checking.

---

## Why this tool and not another one

Three reasons, in the order they actually matter:

1. **Search volume.** "code screenshot" / "code to image" is a far larger query
   family than most of the 21 tools already shipped. This is one of the few
   remaining tools with real acquisition value rather than portfolio value.
2. **We already own the hard dependency.** `shiki@4.4.2` is in `package.json`
   for MDX code blocks. The expensive part of a code-image tool — accurate
   syntax highlighting across many grammars — is already paid for.
3. **The competitors' weakness is structural, not cosmetic.** See below.

---

## The market, checked rather than assumed

| Tool | Strength | Weakness |
| --- | --- | --- |
| **carbon.now.sh** | the known name, open source | 2017-era UI, thin controls, highlight.js |
| **ray.so** | fast, modern, no account, open source (`raycast/ray-so`) | deliberately minimal — ~8–11 themes, no diff, no line focus |
| **codeimage.dev** | open source, window frames, tabs | plain design, no distribution behind it |
| **snappify** | animation, multi-window, annotation | **paid**, account required, heavy |

### Refuted

- **"ray.so is old and thin on features."** Half wrong. It is Raycast's, it is
  actively maintained, and it is minimal *by design*. Treating it as neglected
  is the wrong starting point: its UX is the bar to clear, not the thing to
  pity. What it genuinely lacks is theme range, diff, and line focus.
- **"We can beat snappify."** Not in this initiative and probably not ever.
  Animated, multi-window, annotated code presentations are a different product
  with a paid team behind it. Aiming there means never shipping.

**The gap that is actually open:** free + no account + *deep* theme and language
range + the controls ray.so left out. Nobody occupies that intersection.

---

## Verified facts (checked on disk, 2026-08-11)

| Fact | Evidence |
| --- | --- |
| Shiki is already a dependency | `package.json:80` — `shiki@^4.4.2` |
| **65 bundled themes** | `node_modules/.pnpm/@shikijs+themes@4.4.2/.../dist/*.mjs`, minus `index` |
| **360 bundled languages** | `node_modules/.pnpm/@shikijs+langs@4.4.2/.../dist/*.mjs`, minus `index` |
| Shiki is used server-side today | `src/components/mdx/CodeBlock/highlight.ts:28` — `codeToHast`, dual-theme |
| No `--font-mono` token exists site-wide | absent from `src/styles/tokens.css` |
| `next/font/google` offers all four candidates **with `cyrillic`** | `next/dist/compiled/@next/font/dist/google/index.d.ts` — `JetBrains_Mono`, `Geist_Mono`, `Fira_Code`, `IBM_Plex_Mono`, each `subsets?: … 'cyrillic' … ` |

The themes include every face people actually ask for — `catppuccin-*`,
`dracula`, `tokyo-night`, `vitesse-*`, `rose-pine-*`, `kanagawa-*`,
`everforest-*`, `nord`, `one-dark-pro`, `github-*`, `synthwave-84`, `vesper`,
`poimandres`, `ayu-*`, `gruvbox-*`, `material-theme-*`, `monokai`, `night-owl`.

**65 vs ray.so's ~8–11 is the headline number for this tool**, and it costs us
nothing to have — the themes are already on disk.

---

## The font problem — scoped to this tool, and only this tool

The exported image has to look the same on every machine. Tailwind's default
`font-mono` cannot deliver that: it resolves to a *system* stack
(`ui-monospace, SFMono-Regular, Menlo, Monaco, …`), so two people exporting the
same snippet with the same settings would get **different images**, and the
canvas exporter could not compute line widths that match the preview. It is the
same class of failure that made the privacy-policy heading disagree between two
machines.

So this tool bundles real monospace **webfonts** and never relies on the
system stack.

### The boundary — decided by the owner, 2026-08-11

**The fonts are loaded by this tool's route and applied inside this tool's
subtree only. Nothing outside `/tools/code-snapshot` changes.** The 226 book
chapters, the reader chrome, the ToC and every existing `font-mono` consumer
keep rendering exactly as they do today.

Concretely:

- The `next/font/google` instances live in the tool's route file, **not** in
  `src/app/layout.tsx`. Next scopes the generated `@font-face` and preloads to
  the routes that reference them, so no other page pays for them.
- The CSS variables they define (`--font-code-*`) are applied via `className`
  on the tool's own wrapper element.
- **No new entry in `src/styles/tokens.css`.** A token there is a site-wide
  promise; this is deliberately a local one.

The site-wide `--font-mono` gap is real but is a **separate** decision that is
not part of this initiative. If it is ever taken up, it belongs in
`initiatives/design-system.md`.

### Font choice is a feature, not a config value

ray.so lets the reader pick a font; so should we. Four are bundled, each
verified to offer a `cyrillic` subset:

| Font | Why it is in the list |
| --- | --- |
| **JetBrains Mono** — default | the most widely used code face; ligatures; the widest Cyrillic coverage of the four |
| **Fira Code** | the ligature original; many people specifically want it |
| **Geist Mono** | lighter, geometric, no ligature noise — matches a minimal look |
| **IBM Plex Mono** | a distinct, warmer alternative for people who dislike the other three |

Load them lazily so the initial route payload carries only the default.

---

## Architecture

### The preview IS the export

```
code + lang + theme
        │
        ▼
  shiki.codeToTokens()  ──►  CodeLine[]        (narrowed from ThemedToken)
        │
        ▼
  layoutSnapshot()      ──►  Layout            (pure — no canvas, no DOM)
        │
        └──► paint(ctx, layout, scale)   → the preview AND the export,
                                            one painter, one scale
```

A transparent `<textarea>` sits on top of that canvas at the layout's own
coordinates, so the picture is also the editor — see Phase 2.

**Why not `html2canvas` / `html-to-image`,** which is what most competitors do:
it re-rasterises the DOM and is famously wrong about webfonts that are not yet
loaded, about `box-shadow`, and about device pixel ratio. We already own the
tokens with their colours; drawing them ourselves removes an entire class of
"the export doesn't match the preview" bug.

Precedent: `QrGenerator/utils/matrix.ts` builds the QR matrix itself rather than
trusting a library's canvas output, for the same reason.

**Decided 2026-08-11 — the preview is a canvas, not a DOM render.** The first
draft of this file had a DOM preview beside a canvas exporter and called the
drift between them a "risk to mitigate with a test". That is solving a problem
we can simply not have: one painter makes "the preview matches the export" true
*by construction* rather than by assertion.

The stated price was that the preview could not be selectable or editable
text — and **Phase 2 removed that price** without giving up the painter: the
textarea moved from beside the canvas to on top of it. What the visitor types
into and what gets exported are now the same rectangle.

**What makes this testable:** `layoutSnapshot()` takes its text measurements
through an injected `MeasureText` and returns plain numbers. jsdom ships no
canvas implementation at all, so geometry welded to a `CanvasRenderingContext2D`
could only ever be checked by eye. Fourteen tests pin the geometry, and three
deliberate mutations (gutter measured from the first line number instead of the
last, an empty focus set read as "focus nothing", an unrounded line height)
were each caught by exactly one of them.

### Bundle size — the thing that can sink this

Shiki's full bundle is heavy (all 65 themes + 360 grammars). The tool must use
`shiki/core` with `createHighlighterCore` and **dynamic `import()` per theme and
per language, on demand**. A first paint that ships 360 grammars would fail
`reference/seo-performance.md` outright.

`'use client'` is unavoidable here (canvas, clipboard, file download) but must
sit on the **editor island**, not the page. The route stays a Server Component
that renders copy, SEO and the shell.

---

## Phases

### Phase 0 — `[ ]` Tool-scoped fonts

- `[ ]` Four `next/font/google` instances in the tool's route, subsets
      `["latin", "latin-ext", "cyrillic"]`, applied via `className` on the
      tool's wrapper. **`src/app/layout.tsx` and `tokens.css` are not touched.**
- `[ ]` Prove the boundary: build, then confirm a book chapter's HTML does not
      reference the new font files. This is the acceptance test for Phase 0.
- `[ ]` Measure the route's added payload; record the number here.

### Phase 1 — `[x]` The core: tokens → preview → PNG

Shipped 2026-08-12. 44 tests (14 layout · 12 highlight · 5 export · 13
integration); gate green.

- `[x]` `src/modules/tools/CodeSnapshot/` per §8 of `code-rules.md`.
- `[x]` `utils/highlight.ts` — `createHighlighterCore` + lazy theme/lang.
- `[x]` `utils/layout.ts` (pure) + `utils/paint.ts` (canvas), 1x/2x/3x.
- `[x]` Controls: theme, language, font, size, line height, padding, frame,
      background, window title, line numbers.
- `[x]` Export: PNG download + copy to clipboard, with a download fallback.
- `[x]` Route + SEO module + all 13 registration points.
- `[x]` uz/en/ru in the same commit.
- `[x]` Sticky preview column, matching `QrGenerator.tsx:122`.

**Four defects the tests found, all real, none review-visible:**

| Defect | Found by |
| --- | --- |
| `resolveLanguage("js")` returned `"js"` — Shiki merges aliases into `bundledLanguages`, so the id-first lookup never reached the alias table. Two URLs for one snapshot | `highlight.test.ts` |
| `FontStyle.NotSet` is `-1` — all bits set, so every unstyled token came back bold + italic + underlined + struck through | `highlight.test.ts` |
| A trailing `\n` produced a phantom empty last line: dead space inside the window that reads as bad padding. Only the line-number gutter counting to **5** on a four-line snippet made it undeniable | `CodeSnapshot.test.tsx` |
| A duplicate `title` key inside the `style` object — JSON keeps the last, so the card heading silently rendered the field label | `pnpm i18n` + reading the parsed bundle |

Plus two the browser found: `ctx.font` does not trigger a webfont download (the
CSS Font Loading spec ties fetching to rendered content, and a canvas is not
content), and `next/font` rejects a spread in `subsets` because it is a
compile-time transform — the same static-parse constraint as `src/proxy.ts`.

### Phase 1b — `[x]` Review pass (2026-08-12)

A `code-reviewer` pass in a fresh context returned **9 findings, 3 of them
blockers**. All are fixed; 59 tests in the module, gate green.

| # | Defect | Measured / evidence |
| --- | --- | --- |
| 1 | **Nothing bounded the canvas.** Over the engine's per-side cap the picture is silently empty — no throw, no event, `toBlob` returns null — so Download produces a broken file | probed in Chrome: cap **65,518**. 1,500 lines at 3x is **100,000px** and fails. `utils/canvas-limits.ts` now steps the scale down, or says no scale fits |
| 2 | **Both export paths dropped their rejections.** `onClick={download}` handed React an unawaited promise, and the copy→download fallback rejected unhandled — so the failure from #1 was invisible | both now return a boolean; errors render in an `alert` |
| 3 | **The highlighter singleton memoised a REJECTED promise.** One dropped chunk bricked the tool for the session; the module-scope cache survives route unmount and locale switches by design | the slot is cleared on rejection |
| 4 | **The preview was not the export.** `style={{ width, height }}` beat the `h-auto` class, so `max-w-full` clamped width while height stayed fixed | measured **31.5% horizontal squash** on a 100-char line → **0.03%** after switching to `aspect-ratio` |
| 4b | No max height: 300 lines made the page **11.2 screens** and left the sticky card **6,973px** — taller than the viewport, which defeats sticky entirely | page **8,092 → 3,945px**, card **6,973 → 451px**, preview scrolls in its own box |
| 5 | The paint chain had no `.catch`, so a throw froze the preview on the last good frame while every control kept responding | `.catch` feeding the same error state |
| 6 | Window width came only from the code, so the three dots and a centred title spilled outside the card on a short line | width now also clears `DOTS_WIDTH` and the measured title; three tests |
| 7 | `widest` counted trailing-whitespace tokens the painter refuses to draw — 20 trailing spaces was ~168px of empty right margin | width tracked from the last **inked** token; three tests |
| 8 | The download anchor was clicked while detached, unlike four in-repo precedents | appended, clicked, removed |
| 9 | `focusLines`, `firstLineNumber` and `isReady` were implemented but unreachable; the title input stayed live on frames that never draw it | `isReady` replaced by a real `error`; the title input is disabled off the macOS frame with a reason. The two options stay for Phase 2, which adds their UI |

Also moved the token decoder to `utils/tokens.ts` — its unit test was pulling
`shiki/core` and the 360-grammar registry into memory to check a bit field.

### Phase 2 — `[ ]` One surface, and controls you choose by looking

**The layout is wrong, and the evidence is unanimous.** carbon.now.sh,
codeimage.dev, ray.so and snappify all put the code IN the styled window —
carbon and CodeImage on CodeMirror. Our two-panel split exists only because the
preview is a canvas, which cannot be typed into. Half the screen is spent on a
textarea nobody looks at after the first paste.

The fix keeps the canvas export and makes the picture editable: a transparent
`<textarea>` over the rendered code — `-webkit-text-fill-color: transparent`
with a visible `caret-color`, the pattern `react-simple-code-editor` is built
on. Its one real hazard is that the pattern breaks if weight or ligatures
change advance widths, and **that was measured before committing to it**: in
JetBrains Mono `w("=>")` as one token is 16.79998779296875 and `w("=") + w(">")`
is the same to the digit. Monospace keeps the advance, so the caret holds.

- `[x]` **Editable preview** — shipped 2026-08-12. A transparent `<textarea>`
      absolutely positioned at the layout's own `codeX` / first-line `top`,
      with `lineHeight` in pixels from the same layout. The left column is
      controls only; the second textarea is gone.

      Verified in the browser rather than assumed:

      | | measured |
      | --- | --- |
      | textareas on the page | **1** |
      | overlay offset vs canvas | x **84**, y **124** — exactly `padding 64 + inset 20` and `+ titlebar 40` |
      | advance-width drift, DOM vs canvas | **≤ 0.006px** across a 37-character line |
      | glyphs / caret | `-webkit-text-fill-color: rgba(0,0,0,0)`, `caret-color` = theme foreground |

      Two things the change surfaced. **The editor did not exist before the
      first paint** — it was gated on `layout`, so a slow grammar download left
      a box nobody could type into; it now renders immediately and snaps onto
      the code when the geometry arrives. And **Biome believes a `<canvas>` is
      both focusable and interactive**: it strips `aria-hidden` on `--write`
      *silently* and rejects `role="presentation"`. The canvas therefore
      carries no ARIA at all — which is the behaviour we want anyway — and a
      test asserts no `img` role is exposed instead of a comment claiming it.
- `[x]` **Theme picker as swatches** — shipped 2026-08-12. All 65 themes as
      miniatures of themselves: the theme's `editor.background` with bars in
      its own keyword, identifier, string and comment colours.

      **The colours are generated, not hand-copied.**
      `scripts/theme-palette.mjs` (`pnpm themes`) highlights a fixed snippet
      with the same `codeToTokens` call `paint.ts` draws from and reads the
      colours off the result, so a swatch cannot disagree with the picture it
      previews. `pnpm themes --check` fails when the file and the installed
      Shiki have drifted.

      | | measured |
      | --- | --- |
      | palette payload | **2,885 B gzipped** (16,690 raw) |
      | the alternative — importing all 65 theme modules | **1,466,389 B raw** |
      | swatch colours matching the generated palette | **325 / 325** (65 × 5), read out of the live DOM |
      | card pixel vs swatch, after picking Dracula | both exactly `rgb(40,42,54)` |
      | keyboard | `ArrowRight` moves selection AND repaints — native radios, no roving-tabindex code |

      Hand-written labels were the first thing to go: they had already drifted
      from Shiki's own ("Dracula" vs `Dracula Theme`, "SynthWave '84" vs
      `Synthwave '84`). `FEATURED_THEMES` is now `FEATURED_THEME_IDS` — order
      only — and the label comes from the generated file.
- `[x]` **Background presets as gradient chips** — shipped 2026-08-12.
      Verified against real canvas pixels rather than by eye: `Shafaq`
      `rgba(248,113,24,255)`, `Qog'oz` `rgba(248,250,252,255)`, `Yarim tun`
      `rgba(16,24,43,255)`, and `Shaffof` **`rgba(0,0,0,0)`** — genuinely
      transparent, not a white sheet.

      A mutation exposed a weak test here and it is worth keeping: the first
      version counted `createLinearGradient` calls, and deleting the
      `kind === "none"` early return survived it — correctly, because that path
      then fills with `transparent`, which is a no-op. The requirement was
      never "do not call fillRect"; it is "nothing OPAQUE covers the canvas".
      The stub now records `fillStyle` alongside each rectangle and the test
      asserts on the colour.

**Two defects found while verifying, both fixed, neither review-visible:**

| Defect | Measured |
| --- | --- |
| **The page scrolled sideways below `lg`.** A grid item's automatic minimum size is its min-content width, and the picture is as wide as the code — so on a phone the whole document was wider than the screen. `min-w-0` on both cells, and the 1x/2x/3x control moved out of ToolCard's `shrink-0` actions row to sit beside the pixel readout it produces | document scrollWidth on a 375px viewport: **655 → 428 → 375** |
| `text-muted-foreground/70` on the theme count | **3.08:1** against the card in light mode — below AA for small text. The plain token is **5.88:1**; the `ml-2` gap already did the separating |
- `[x]` **Format the code** — shipped 2026-08-12. `prettier@3.9.6`, standalone
      build, plugins dynamically imported per language on click.

      **`babel-ts`, not the `typescript` plugin.** Both parse TS and TSX; the
      dedicated plugin is **213 KB gzipped against babel's 82 KB**, and TS/TSX
      is the most common thing anyone will format here. Verified on generics
      and JSX before the recipe table was written.

      | | measured |
      | --- | --- |
      | Prettier code in the route's INITIAL payload | **0 bytes** — the prerendered HTML references no plugin chunk |
      | fetched on the first press, TypeScript | exactly **3**: standalone, estree, babel |
      | fetched for any other language | none of the other five plugins — proof the split is per-language, not all-or-nothing |
      | languages with a parser | **18 of Shiki's 360** |

      Browser-verified end to end: `const   x={a:1,…};function  f<T>(v:T){…}`
      over two lines became five correctly formatted ones, generics intact,
      and the canvas grew to match. A syntax error raises the alert and leaves
      the code untouched.

      The button is **disabled, not hidden**, for the other 342 — a control
      that vanishes as you scroll a 360-entry dropdown is harder to understand
      than one that is visibly unavailable — and it sits beside the language
      picker because its availability is a fact about the language.

      Three mutations, each caught by exactly one test: `canFormat` always
      true, the parse error swallowed, and `format` returning its input.

      One test bug worth recording: the first version searched the drawn text
      for `"const x = 1"` and timed out. **The painter refuses to draw
      whitespace-only tokens** (that fix predates this), so the picture's
      joined text has no spaces in it at all. The observable is the line
      count, read from distinct baselines.
- `[x]` **Language auto-detect on paste** — shipped 2026-08-12. Finding one
      entry in a list of 360 is the worst moment in this tool, and it happens
      before anything else does.

      **Scored, not first-match.** A ladder of `if`s gets the common cases
      right and the interesting ones wrong: `def` is Python *and* Ruby, `func`
      is Go *and* Swift, `class` is six languages. 21 signatures, each a set of
      weighted marks; `DECISIVE` is reserved for marks that cannot legally
      appear in another language on the list.

      **It is allowed to say "I don't know", and that is the design.** A wrong
      switch silently discards a choice the visitor made. Below the confidence
      floor, or on a tie, it returns `null` and nothing happens. Probed against
      14 adversarial inputs — Swift, Kotlin, a stack trace, a `.env` file,
      TOML, invalid JSON, Uzbek prose, SQL inside a JS string — **zero wrong
      answers; every one returned `null`.**

      Detection runs on **paste only**, never on keystrokes: half-typed code
      changes its apparent language as it is written, and a picker that
      flickers between grammars while you type is unusable.

      What it did is stated and undoable — a `role="status"` line naming the
      language with an undo, announced without stealing focus from the editor.

      **Three real bugs it found in itself, each fixed and pinned by a test:**

      | Bug | Consequence |
      | --- | --- |
      | Two signatures returned `bash` and `dockerfile` — Shiki **aliases**, not canonical ids | The picker's `value` matched no option, so it silently showed an empty box. Canonical: `shellscript`, `docker`. A test now asserts every returnable id survives `resolveLanguage` unchanged |
      | `\bstd::\w+` scored `DECISIVE` for C++ | **Rust spells it identically.** `use std::collections::HashMap;` made a Rust file come back as C++ — confidently wrong, the one outcome this design exists to avoid. Narrowed to the members C++ owns (`std::cout`, `std::vector`, …) |
      | The Rust `fn` mark anchored on a bare `fn` | Missed every `pub fn`, which is most of an idiomatic file |

      Two coverage gaps the probe exposed and closed: SCSS came back as `css`
      (losing `$variable` and `&:hover` colours), and a Vue SFC came back as
      `jsx` because `</template>` matches the JSX pattern. Also added: an
      untyped React component, which loses on points to HTML and scores 2 on
      JavaScript, so the scorer alone said nothing about the single most common
      paste this tool will see.

      Browser-verified on the running dev server: prose → unchanged, Rust →
      Rust, SQL → SQL, JSX → JSX, Python → Python with the notice, and undo
      restoring TypeScript.
- `[x]` **Drag a file onto the editor** — shipped 2026-08-12. Code, language
      AND the window title in one gesture; the filename is the only reason
      anyone types in that field, and a drop already knows it.

      **The extension mapping is Shiki's, not ours.** Its alias table already
      turns `py` into `python`, `rs` into `rust`, `yml` into `yaml`. Checked on
      disk: of 71 common extensions, **60 resolve through `resolveLanguage`
      for free**, so the hand map is ten entries instead of seventy — and a
      test asserts every one of those ten is something Shiki genuinely cannot
      answer, so the list cannot grow duplicates of Shiki's own table.

      The extension outranks `detect.ts`: a `.rs` file is Rust because its
      author said so. The scorer is the fallback for what the extension cannot
      answer — verified in the browser with a `.txt` holding Python, which
      came back **Python**.

      **Two guards, both content-based:**

      | Guard | Why not the obvious version |
      | --- | --- |
      | Binary files rejected on a NUL byte | `File.type` is **empty** for most extensions this tool cares about — `.rs`, `.go`, `.vue` all arrive as `""`. A PNG renamed `.ts` otherwise fills the editor with replacement characters and paints a picture of garbage |
      | 256 KB cap | Not a round number: past the canvas cap the picture cannot be drawn at ANY scale (`canvas-limits.ts`), which lands near 3,000 lines. Larger files were never going to become an image, and reading one in freezes the tab while the tokeniser walks it |

      Browser-verified on the running dev server: `greet.rs` → Rust + title
      `greet.rs` + repaint; `notes.txt` holding Python → Python; a PNG renamed
      `.ts` → refused, code untouched; 300 KB → refused, code untouched.

      **A mutation exposed a real coverage gap and it could not be closed in
      jsdom.** Removing the `relatedTarget` guard in `dragleave` failed no
      test. That guard is what stops the highlight blinking off the instant
      the file crosses onto the canvas — which is most of the box. jsdom
      delivers `relatedTarget` as `undefined` on a synthetic `dragleave`
      (probed directly), so every drag-leave looks identical from inside a
      test. Verified in a real browser instead: crossing onto the canvas keeps
      the highlight, leaving for the body drops it. The test says so rather
      than pretending to cover it.
- `[x]` **Click a line number to focus it** — shipped 2026-08-12. `focusLines`
      and the dimming have existed since Phase 1 and were pinned by
      `layout.test.ts`; what was missing was any way to reach them.

      One real `<button>` per line, sized and placed from the same `Layout` the
      painter used, so what you click is exactly what you see. **Not** a single
      click handler over the strip with the line worked out from `offsetY`:
      that version is mouse-only, and this is the control ray.so does not have
      and snappify charges for. The gutter sits left of `codeX`, which is where
      the textarea starts, so nothing overlaps. Rendered only when the numbers
      are on — `gutterWidth` is 0 otherwise, and an invisible button would be
      sitting on the code.

      The toggle is POSITIONAL, 1-based; the label says the number PRINTED in
      the gutter. `firstLineNumber` lets a snippet lifted from line 340 print
      340 while still being line 1, and the layout dims by position.

      Measured in the browser on a real canvas — ink strength per line, focused
      against dimmed:

      | | focused line | other lines |
      | --- | --- | --- |
      | with focus | **634** | 283 · 283 · 53 |
      | after clearing | 634 | **710** · **710** · 53 |

**Two defects the owner reported or the tests found, both fixed:**

| Defect | Measured |
| --- | --- |
| **Picking a theme jumped the window down.** The swatch radios were `sr-only`, which Tailwind collapses to 1×1px with `clip-path: inset(50%)` — zero visible area. Focus lands on it, the browser scrolls a zero-area element into view, and the arithmetic runs away | page moved **906px** on a click, and **1135px** on a bare `input.focus()`; the same call with `{ preventScroll: true }` moved **0**, which named the cause. Fixed by sizing the input to the swatch: page **0**, and the scroll box still reveals a swatch below its fold. `SegmentedControl` in `@webiston/ui` still uses `sr-only` — checked rather than assumed, it moves the page **0px**, because the runaway needs a tall scroll container to happen in |
| **The canvas stub's `save`/`restore` were no-ops.** The painter halves the alpha for a line number inside a save/restore pair, so the 0.4 leaked onto every token drawn afterwards | Every alpha assertion was measuring the stub instead of the painter. A real stack now backs them, and the focus test asserts `DIMMED_OPACITY` exactly — "something is faint" is true of every snapshot, because the gutter numbers are always at 0.4 |
- `[ ]` Ligature toggle.

### Phase 2 notes — the earlier framing, kept

The honest UX verdict on Phase 1: it *works* and it is *plain*. Eight text
dropdowns in a grid is a control panel; ray.so's advantage is that its two most
visual decisions — theme and background — are made by **looking**, not by
reading a list. That is the gap to close first, before adding any more options.

- `[ ]` **Theme picker as swatches.** A small strip per theme showing its real
      background, keyword and string colours, pulled from the loaded theme
      rather than hand-copied. Replaces the dropdown.
- `[ ]` **Background presets as gradient chips.** Same argument, and the
      preset names (`Yarim tun`, `Shafaq`) mean nothing as text.
- `[ ]` **Language auto-detect on paste.** Nobody wants to find one entry in a
      list of 360. Shebang, `<?php`, `package main`, `def `, `fn `, `import …
      from` cover most of what people paste; the picker stays for corrections.
- `[x]` **Drag a file onto the editor** — shipped 2026-08-12. Code, language
      AND the window title in one gesture; the filename is the only reason
      anyone types in that field, and a drop already knows it.

      **The extension mapping is Shiki's, not ours.** Its alias table already
      turns `py` into `python`, `rs` into `rust`, `yml` into `yaml`. Checked on
      disk: of 71 common extensions, **60 resolve through `resolveLanguage`
      for free**, so the hand map is ten entries instead of seventy — and a
      test asserts every one of those ten is something Shiki genuinely cannot
      answer, so the list cannot grow duplicates of Shiki's own table.

      The extension outranks `detect.ts`: a `.rs` file is Rust because its
      author said so. The scorer is the fallback for what the extension cannot
      answer — verified in the browser with a `.txt` holding Python, which
      came back **Python**.

      **Two guards, both content-based:**

      | Guard | Why not the obvious version |
      | --- | --- |
      | Binary files rejected on a NUL byte | `File.type` is **empty** for most extensions this tool cares about — `.rs`, `.go`, `.vue` all arrive as `""`. A PNG renamed `.ts` otherwise fills the editor with replacement characters and paints a picture of garbage |
      | 256 KB cap | Not a round number: past the canvas cap the picture cannot be drawn at ANY scale (`canvas-limits.ts`), which lands near 3,000 lines. Larger files were never going to become an image, and reading one in freezes the tab while the tokeniser walks it |

      Browser-verified on the running dev server: `greet.rs` → Rust + title
      `greet.rs` + repaint; `notes.txt` holding Python → Python; a PNG renamed
      `.ts` → refused, code untouched; 300 KB → refused, code untouched.

      **A mutation exposed a real coverage gap and it could not be closed in
      jsdom.** Removing the `relatedTarget` guard in `dragleave` failed no
      test. That guard is what stops the highlight blinking off the instant
      the file crosses onto the canvas — which is most of the box. jsdom
      delivers `relatedTarget` as `undefined` on a synthetic `dragleave`
      (probed directly), so every drag-leave looks identical from inside a
      test. Verified in a real browser instead: crossing onto the canvas keeps
      the highlight, leaving for the body drops it. The test says so rather
      than pretending to cover it.
- `[ ]` **Click a line number to focus it.** `focusLines` already exists in the
      types and the layout dims correctly; it has no UI. This is a control
      ray.so does not have at all.
- `[ ]` Keyboard shortcuts, surfaced in the UI like the extension's footer.
- `[ ]` Ligature toggle (a real preference; some readers hate `=>`).

### Phase 3 — `[ ]` Sharing and convenience

- `[x]` **URL state** — shipped 2026-08-12. The whole configuration in a link,
      so it reopens the exact image.

      **In the HASH, not the query string** — the line above said "query
      string" and that was wrong. A hash never reaches the server, so no CDN
      or platform limit applies to it and Next's router does not re-render on
      it. A few thousand characters of source in a query string is how this
      ships broken: a 414 from an edge that nobody can reproduce locally.

      **Compressed with the browser's own `CompressionStream`** — zero
      dependencies. A one-character format marker (`1` packed, `0` plain)
      means an engine without it still writes a link every other browser can
      read.

      Measured in the browser on the running page:

      | pasted | link |
      | --- | --- |
      | 24 chars | 219 |
      | 1,849 chars (40 lines) | **610** — 0.33× |
      | 13,379 chars (200 lines) | **1,695** — 0.13× |

      A 200-line file becomes a 1.7 KB link. `encodeURIComponent` of the same
      JSON is 2× larger on a short snippet and far worse on a long one, since
      URL escaping inflates exactly the characters source code is made of.

      Written **on demand**, not on every keystroke: a hash that rewrites
      itself as you type fills the address bar with noise for a value nobody
      asked for yet. `replaceState`, never `pushState` — pressing a copy
      button is not navigation.

      **A link is untrusted input**, and that is where most of the code went.
      Every field is checked against the set the UI itself offers: a
      `fontSize` of 40,000 asks for a canvas the browser refuses to allocate,
      and a `focusLines` of `["x"]` breaks the layout's `Set` arithmetic in a
      way nobody would trace back to a URL. Eight tests cover junk, missing
      code, out-of-range numbers, unknown enums, a 500 KB payload and an
      unbounded title.

      `font` moved from the component into the hook while doing this — it is
      shared state, and a link that restores the code and the theme but not
      the face reopens a different picture.

      A flake surfaced and was fixed rather than re-run: the restore test
      waits on a grammar download, a font load AND several settling paints, so
      under the full suite's parallel load it was the first to exhaust a 5s
      budget. It failed twice in a full run and passed alone; its budget is
      now 15s and says why.
- `[x]` **Presets** — shipped 2026-08-12. Four, named for where the picture is
      going: *Ijtimoiy tarmoq*, *README uchun*, *Slayd*, *Minimal*.

      They answer the question a newcomer actually has — "which of these
      combinations is any good?" — before they meet a 65-swatch grid and six
      dropdowns.

      **Named for the destination, not the mood**, and that is why they are
      plain text buttons rather than swatches. `Yarim tun` had to become a
      gradient chip because the word means nothing; `README uchun` says what
      it is for, so a chip would add colour without adding meaning.

      **Buttons, not a radio group.** Change one control afterwards and the
      picture is no longer that preset; a selected state would be lying.

      **They do not set the font.** Theme, background, frame, padding and size
      are properties of the OUTPUT. The face is a preference someone already
      expressed, and overwriting it is the one thing a preset has no business
      doing — pinned by its own test and by a mutation.

      Verified in the browser: *Slayd* took the canvas from 918×304 to
      **1946×1016** and painted the corner `rgb(30,41,59)` — `#1e293b`
      exactly; *Minimal* produced **alpha 0** at both the corner and the
      centre, i.e. a genuinely transparent PNG with no card at all.
- `[x]` **Export format: PNG or WebP** — shipped 2026-08-12, and it answers
      the SVG question by replacing it.

      Measured on a real 1674×2624 export from this tool, by encoding it every
      way `toBlob` accepts and decoding each back to compare with the source:

      | | bytes | pixels changed of 4,392,576 | worst channel delta |
      | --- | --- | --- | --- |
      | **PNG** | 2,295,644 | **0** | 0 |
      | **WebP, quality 1** | **244,422** | 2,184 (0.05%) | **4** |
      | WebP, quality 0.92 | 502,592 | 4,243,498 (96.6%) | 167 |
      | JPEG, quality 0.92 | 843,905 | 2,847,382 (64.8%) | 249 |

      **WebP at quality 1 is 9.4× smaller and visually identical.** Chrome
      switches to its LOSSLESS encoder at 1, which is why it beats the lower
      quality settings on this content — flat colour and sharp edges are
      exactly what lossless compresses well and lossy destroys.

      JPEG is absent: no alpha, so a transparent background comes out black,
      and it visibly mangles text. **AVIF is absent because the browser cannot
      make one** — `toBlob(cb, "image/avif")` returns a blob of type
      `image/png`, measured rather than assumed. That silent fallback is also
      why the exporter names the file after the blob it GOT, not the one it
      asked for; a mutation proved that check was untested and it now has two.

      **The clipboard stays PNG regardless.** `ClipboardItem` is specified
      around a small set of mandatory types and `image/png` is the one every
      engine implements — a WebP on the clipboard is a picture nobody can
      paste.

      PNG remains the default: it opens everywhere without asking, and the
      choice is one click away with the size difference stated beside it.
      Verified in the browser on the starter snippet — PNG **367,269 B** →
      `code-snapshot.png`, WebP **62,954 B** → `code-snapshot.webp`.

- `[!]` **SVG export — CUT.** The whole point of SVG is that the text stays
      text. Without the font embedded as base64 it renders with a fallback face
      on someone else's machine, which breaks the one principle this tool is
      built on: *the preview IS the export*. Embedding four faces with Latin
      **and** Cyrillic adds ~100–200 KB to every file — bigger than the PNG it
      replaces, for less. This file already said "a broken SVG is worse than no
      SVG"; WebP delivers the size win SVG was wanted for, losslessly.
- `[ ]` Keyboard shortcuts, matching the extension's `⌘/Ctrl+Enter` idiom.

### Phase 4 — `[ ]` Polish

- `[ ]` Drag-and-drop a file into the editor (language from extension).
- `[ ]` Watermark toggle (`webiston.uz`, off by default).
- `[ ]` Mobile layout — the controls do not fit a phone as-is.

---

## Phase 3b — `[x]` The flicker, and the panel that did not fit (2026-08-12)

The owner reported two things after using it: the preview panel jumps between
sizes and scrolls sideways, and **every change flickers "like a re-render"**.
Both were real. Both were measured on the running page before anything was
changed.

### The flicker was two separate defects stacked

Instrumenting `canvas.width` and the element's `style` attribute across one
preset click:

| t (ms) | what happened |
| --- | --- |
| 309609.9 | backing store → **1946** while the element was still **562.8px** wide |
| 309612.5 | **2.6ms later** React caught up and set the CSS size |
| 309888.4 | the SAME picture painted **again**, 278ms later |

So one click produced: a frame with the new picture squashed into the old box
at a **3.46× ratio instead of 2×**, and then a second flash when the colours
finally arrived.

| Cause | Fix | Measured after |
| --- | --- | --- |
| **Two writers for one dimension.** The painter set the backing store; React set the CSS size one render later | The painter sets both, in the same task. The component no longer passes `style` to the canvas at all | the two writes are now in one task; nothing can be composited between them |
| **The paint effect fired on `theme` before any colours existed for it.** `lines` and `colours` were separate states, so a preset painted the new geometry with the PREVIOUS palette, then repainted | Tokens, colours and *the theme they came from* are one state, and the painter refuses to draw while they disagree | **2 paints → 1** |

Two more came out of the same work: the 120ms debounce was being applied to
theme and language changes as well as typing — it exists to collapse
keystrokes, and it was 120ms of that 278ms gap. It is now applied only when
the code actually changed.

### The panel now fits the picture

It did not before: the "Slayd" preset drew a **972.8 CSS-px** card into a
**708px** panel and put the rest behind a horizontal scrollbar. carbon.now.sh,
ray.so and codeimage all fit the preview to the panel, and for the reason this
tool needs it too — you are composing a picture, so you have to see it.

A CSS transform, never a smaller canvas: the backing store stays at export
resolution, so a scaled preview is *sharper*, and the textarea and gutter
buttons inside the same transformed box scale with it, so the caret stays on
its glyph. It only ever scales DOWN.

| preset | picture | scale | rendered | panel |
| --- | --- | --- | --- | --- |
| Ijtimoiy | 683.2 | 1 | 683 | 708 |
| **Slayd** | **972.8** | **0.728** | **708** | **708** |
| README | 523.2 | 1 | 523 | 708 |
| Minimal | 458.8 | 1 | 459 | 708 |

Horizontal overflow across all four: **0px**.

### Four traps hit while building it, all measured

| Trap | What it did |
| --- | --- |
| **`clientWidth` vs `contentRect.width`** | The seed included the padding, the observer excluded it. They disagreed by 32px and the wrong one stood until the next resize, so a picture needing 0.728 was scaled to 0.761 and still overflowed |
| **Dropping the seed instead** | `ResizeObserver` does fire on `observe()` — except in a hidden tab, where it never delivered at all and the fit stayed 1. Seed it, measured the same way |
| **A transform does not change the layout box** | The stage still measured its full unscaled width, so the scroll container kept a horizontal scrollbar for a picture already inside the panel. `overflow-hidden` on the box that reserves the scaled size |
| **`scrollbar-gutter: stable` is load-bearing** | The fit decides the height, the height decides whether a vertical scrollbar appears, and that changes the width the fit is measured from — an oscillation. Reserving the gutter makes the measurement independent of the content |

### The cross-fade, and the bug it nearly shipped with

A canvas cannot transition its contents — there is no property to ease — so
the only way to soften a repaint is to keep the previous bitmap and dissolve
it. **Not on keystrokes:** a character that fades into place reads as lag, and
copying a multi-megapixel bitmap per keystroke is work for nothing. Only
discrete changes fade.

Two things it got wrong first:

- **The copy threw and took the picture with it.** `drawImage` was missing
  from the canvas stub, the throw travelled out of the same promise chain the
  paint lives in, and **every test in the module failed at once**. A dissolve
  that fails must simply not dissolve — it is wrapped now, and the stub records
  the copy so the fade itself is testable.
- **`requestAnimationFrame` does not run in a background tab.** The nested-rAF
  trick for committing `opacity: 1` before animating to 0 left the ghost stuck
  at 1 — a stale frame permanently covering the live canvas, measured. Reading
  `offsetWidth` forces the same commit synchronously and always lands on 0.

Four tests cover it: one repaint per theme change (a mutation removing the
token gate makes it 2), the previous frame is held on a theme change, it is
NOT held while typing, and the swatch radios keep their geometry.

---

## Explicitly out of scope

Animation · multi-window comparison · annotations and arrows · accounts ·
cloud saving · server-side rendering of images. Every one of these is how this
becomes a three-month project instead of a shipped tool.

---

## Decisions taken

- **2026-08-11 — the tool is self-contained.** An earlier draft of this file
  proposed a site-wide `--font-mono` token, which would have re-rendered every
  code block in all 226 book chapters. The owner rejected it outright: the
  books are not part of this work. Phase 0 was rewritten as route-scoped, and
  the acceptance test for it is now *proving* no book page loads the new fonts.
- **2026-08-11 — four fonts, not one**, chosen by the reader in the UI. Since
  the fonts are tool-local, offering a choice costs a lazy import instead of a
  site-wide commitment.

## Still open

1. **Watermark default** — off is friendlier, on is free distribution.
