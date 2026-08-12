# Initiative — Code Snapshot (`/tools/code-snapshot`)

**Spec:** this file (no `reference/` doc — this is a product initiative, not the
execution of an existing spec) · **Status:** `[ ]` not started ·
**Next:** Phase 0, the font token, because everything downstream depends on it.

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
        ├──► paint(ctx, layout, scale = devicePixelRatio)   → what you see
        └──► paint(ctx, layout, scale = 1 | 2 | 3)          → what you get
```

**Why not `html2canvas` / `html-to-image`,** which is what most competitors do:
it re-rasterises the DOM and is famously wrong about webfonts that are not yet
loaded, about `box-shadow`, and about device pixel ratio. We already own the
tokens with their colours; drawing them ourselves removes an entire class of
"the export doesn't match the preview" bug.

Precedent: `QrGenerator/utils/matrix.ts` builds the QR matrix itself rather than
trusting a library's canvas output, for the same reason.

**Decided 2026-08-11 — the preview is a canvas too, not a DOM render.** The
first draft of this file had a DOM preview beside a canvas exporter and called
the drift between them a "risk to mitigate with a test". That is solving a
problem we can simply not have: one painter, called twice at different scales,
makes "the preview matches the export" true *by construction* rather than by
assertion. The price is that the preview is not selectable text — acceptable,
because the editable surface is the textarea beside it, which is real text and
carries the accessibility.

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

- `[ ]` **Editable preview**, sized from `layoutSnapshot` so the DOM and the
      canvas cannot disagree about dimensions. The left column becomes controls
      only.
- `[ ]` **Theme picker as swatches** showing each theme's real background,
      keyword and string colours, read from the loaded theme.
- `[ ]` **Background presets as gradient chips** — `Yarim tun` means nothing
      as text.
- `[ ]` **Format the code.** Prettier v3 standalone runs in the browser:
      `prettier/standalone` plus `prettier/plugins/*`, dynamically imported on
      click so the page never pays for it. `estree` is mandatory alongside
      babel/typescript. Note this is **parity, not advantage** — ray.so ships a
      Format Code button today. Disable it for languages with no parser.
- `[ ]` **Language auto-detect on paste** — nobody finds one entry in 360.
- `[ ]` **Drag a file onto the editor** — code and language in one gesture.
- `[ ]` **Click a line number to focus it.** `focusLines` already works and is
      tested; it has no UI. snappify charges for this and ray.so lacks it.
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
- `[ ]` **Drag a file onto the editor** — code and language in one gesture.
- `[ ]` **Click a line number to focus it.** `focusLines` already exists in the
      types and the layout dims correctly; it has no UI. This is a control
      ray.so does not have at all.
- `[ ]` Keyboard shortcuts, surfaced in the UI like the extension's footer.
- `[ ]` Ligature toggle (a real preference; some readers hate `=>`).

### Phase 3 — `[ ]` Sharing and convenience

- `[ ]` **URL state** — the whole configuration in the query string, so a link
      reopens the exact image. Carbon has this; ray.so partially.
- `[ ]` Presets (a few tasteful defaults, not fifty).
- `[ ]` **SVG export.** Decide first: real `<text>` needs the font embedded as
      base64 or converted to paths, otherwise it renders with a fallback face on
      someone else's machine. If that is too costly, drop it — a broken SVG is
      worse than no SVG.
- `[ ]` Keyboard shortcuts, matching the extension's `⌘/Ctrl+Enter` idiom.

### Phase 4 — `[ ]` Polish

- `[ ]` Drag-and-drop a file into the editor (language from extension).
- `[ ]` Watermark toggle (`webiston.uz`, off by default).
- `[ ]` Mobile layout — the controls do not fit a phone as-is.

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

1. **SVG export** — worth the font-embedding cost, or cut it?
2. **Watermark default** — off is friendlier, on is free distribution.
