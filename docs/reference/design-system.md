# Webiston — Design System

> The living spec for color, surface, type, and motion. Read this before ANY
> UI work. It opens with a **measured baseline** because the first job of this
> document is to stop the drift, and you cannot claim to have reduced a number
> you never measured.

---

## 1. Where we actually are (measured 2026-07-29, branch `dev`)

| Metric                                              | Count | Meaning                                 |
| --------------------------------------------------- | -----:| --------------------------------------- |
| Tailwind **palette** utilities (`bg-slate-200`, …)  | 4,988 | hardcoded color                         |
| **Semantic token** utilities (`bg-card`, …)          |   195 | token-driven color                      |
| **Token share**                                      | **3.8%** | enterprise target is ≥ 85%           |
| Raw hex literals in `.ts` / `.tsx`                   |   312 | color outside the system entirely       |
| `dark:` variants                                     | 1,963 | every colour decision written **twice** |

Re-measure with exactly these commands (run from the repo root):

```bash
grep -rEo "\b(bg|text|border|ring|from|to|via|fill|stroke|shadow|divide|outline|placeholder)-(slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-[0-9]{2,3}" src packages --include="*.tsx" --include="*.ts" | wc -l
grep -rEo "\b(bg|text|border|ring|from|to|via|fill|stroke|divide|outline)-(background|foreground|card|popover|primary|secondary|muted|accent|destructive|border|input|ring|sidebar)(-foreground)?\b" src packages --include="*.tsx" --include="*.ts" | wc -l
grep -rEo "#[0-9a-fA-F]{3,8}" src packages --include="*.tsx" --include="*.ts" | wc -l
```

The worst offenders (palette hits per file) are all tool modules:

| File                                              | Hits |
| ------------------------------------------------- | ----:|
| `src/modules/tools/WebsiteStatus/WebsiteStatus.tsx`         | 122 |
| `src/modules/tools/UserAgentAnalyzer/UserAgentAnalyzer.tsx` | 122 |
| `src/modules/tools/KeycodeInfo/KeycodeInfo.tsx`             | 101 |
| `src/modules/tools/HttpStatus/HttpStatus.tsx`               |  83 |
| `src/modules/tools/OgMetaGenerator/components/FormPanel.tsx`|  63 |
| `src/constants/ui-constants.ts`                             |  38 |

Note the first four are the **four tools currently parked behind `_`-prefixed
routes** — they are not reachable in production. Fixing their colors is
therefore the *lowest*-value work in the list, not the highest. Start with
`src/constants/ui-constants.ts` and the shared components: one edit there moves
many screens.

---

## 2. What is wrong with the foundation

All of the following is in `src/app/globals.css`.

**a. The palette is stock Shadcn neutral — there is no Webiston identity.**

```css
--primary: oklch(0.205 0 0);   /* light: near-black  */
--primary: oklch(0.922 0 0);   /* dark:  near-white  */
```

`--primary` is grey. Every "primary" button on the site is therefore
black-or-white. A portfolio product needs a brand hue.

**b. `--card` is identical to `--background` in light mode.**

```css
:root { --background: oklch(1 0 0);  --card: oklch(1 0 0); }   /* same */
.dark { --background: oklch(0.145 0 0); --card: oklch(0.205 0 0); } /* fine */
```

Light mode has **no surface separation** — cards float on nothing, which is why
the light theme reads flat while dark reads fine. This is the single highest-
leverage token fix in the file.

**c. `--secondary`, `--muted`, `--accent` are the same grey** (`oklch(0.97 0 0)`
in light, `oklch(0.269 0 0)` in dark). Three names, one value — so the names
carry no information and nobody can pick correctly.

**d. There is no status palette.** No `success` / `warning` / `info`. Only
`--destructive`. Every tool that shows a valid/invalid/pending state therefore
invents its own green/amber/blue — which is a large share of the 4,988.

**e. There are no elevation or typography tokens.** No shadow scale, no
`--font-*`, no type scale.

**f. A second, parallel colour system sits in the same file:**

```css
@theme {
  --color-primary-black: rgba(17, 17, 17);   /* legacy 3-arg rgba */
  --color-gray-primary: #757a7d;
  --color-gray-secondary: #adadad;
  --background-image-gradient-text: linear-gradient(to right, white, #757a7d);
}
```

Raw hex in the theme layer, next to the oklch token set, with no rule for which
to use. (The 3-argument `rgba()` is legal under CSS Color 4 aliasing — it is a
consistency problem, not a parse error.)

**g. Hardcoded colours further down, several with `!important`:**
`#ddd` (table borders), `#0ea5e9` / `#38bdf8` (footnote backrefs). `!important`
means a token migration cannot override them later without touching this file.

**h. The Inter font is downloaded and never rendered.**
`src/app/layout.tsx:408` sets `<body className={inter.className}>`, but
`globals.css:53–64` sets `body { font-family: system-ui, … !important }`.
`!important` wins. So the site pays for a Google font it does not display, and
the intended typography never applies. Also: `Inter({ subsets: ["latin"] })`
loads no Cyrillic subset, while the product ships Cyrillic Uzbek.

---

## 3. Target architecture

**One source of truth.** All colour lives in the `:root` / `.dark` token block
in `src/app/globals.css`. Components consume semantic names only.

### 3.1 Token layers

```
raw value        →  semantic token        →  utility class
oklch(0.55 …)       --primary                bg-primary
```

Components may only ever touch the third column.

### 3.2 The set to define

| Group      | Tokens                                                                 |
| ---------- | ---------------------------------------------------------------------- |
| Surface    | `--background`, `--card`, `--popover`, `--muted` (+ `-foreground` each) |
| Brand      | `--primary`, `--primary-foreground`, `--ring` (tracks primary)          |
| Secondary  | `--secondary`, `--accent` — must **differ** from `--muted`               |
| Status     | `--success`, `--warning`, `--info`, `--destructive` — each with          |
|            | `-foreground` and a `-subtle` background for badges                     |
| Line       | `--border`, `--input`                                                   |
| Elevation  | `--shadow-xs / -sm / -md / -lg` — low-alpha, restrained                 |
| Type       | `--font-sans`, `--font-mono`, and a small size/weight scale              |

Every token gets a `@theme inline` mapping (`--color-success: var(--success)`)
so Tailwind generates `bg-success`, `text-success-foreground`, etc.

### 3.3 Colour decisions to make (not yet made — needs the owner)

- The brand hue. Webiston has no defined brand colour. Pick one, verify
  **WCAG AA** against both `--primary-foreground` and the two backgrounds.
- Light-mode canvas: `--background` a soft off-white, `--card` pure white — or
  the inverse. Either works; what does not work is them being equal.
- Whether the book reader keeps its own reading-optimised surface.

Do not invent these silently in a refactor commit. Propose, get a yes, then
apply everywhere at once.

---

## 4. Rules for components

- **No raw hex. No Tailwind palette classes.** `bg-card` not `bg-white`,
  `text-muted-foreground` not `text-slate-500`, `border-border` not
  `border-gray-200`.
- **A `dark:` colour variant means the token is wrong.** `bg-card` is already
  correct in both themes. `bg-white dark:bg-slate-900` is two bugs.
- **Never fork a `@webiston/ui` component to restyle it.** Change the token, or
  add a variant to the component via `cva` so every consumer gets it.
- **Status colour comes from a status token**, never from a per-tool green.
- Chart / illustration / brand-gradient colours are the documented exception:
  put them in a named export in `src/constants/`, never inline in JSX.

---

## 5. Migration plan (phased — do NOT do this in one commit)

**Phase A — Foundation.** Fix the token block: give `--card` its own value in
light mode; give `--primary` a brand hue; differentiate `secondary`/`accent`
from `muted`; add status, elevation, and type tokens; resolve the duplicate
`@theme` colour system; remove the `!important` font override and decide whether
Inter (with a Cyrillic subset) or system-ui is the intended face. Nothing else.
Verify visually in both themes before moving on.

**Phase B — Ratchet gate.** Add a `pnpm tokens` script that counts palette/hex
violations per file against a frozen baseline JSON and **fails on any increase**.
This is the mechanism that makes the remaining phases safe — without it, every
new tool re-adds what the previous phase removed. A proven reference
implementation exists at
`~/Desktop/React_projects/gl-safety/scripts/token-guardrail.mjs` (per-file
baseline, `--update` mode, `token-ok` line comment and
`token-guardrail-exempt: <reason>` file-pragma escape hatches). Port it; do not
redesign it.

**Phase C — Shared surfaces first.** `src/constants/ui-constants.ts`,
`packages/ui/src/primitives/*`, `src/components/shared/*`. Highest leverage:
one file, many screens. Ratchet the baseline down after each file.

**Phase D — Tools, one module per commit.** Live routes before parked ones.
Each commit: convert one tool, screenshot light + dark, ratchet down.

**Phase E — Book reader + MDX components.** Reading surfaces have their own
contrast requirements; treat `prose` styling as its own pass.

---

## 6. Verification

Every UI change:

1. `pnpm build` green (real exit code — never pipe to `tail`).
2. Look at it in **light AND dark**. Half of this codebase's colour bugs are
   invisible in whichever theme you happen to be running.
3. Re-run the § 1 measurement commands and report the delta. "It looks better"
   is not a result; "palette hits 4,988 → 4,612" is.
4. Contrast: WCAG AA for body text and for `primary` / `primary-foreground`.

---

## 7. Anti-patterns seen in this repo

| Pattern                                        | Instead                                    |
| ---------------------------------------------- | ------------------------------------------ |
| `className="bg-white dark:bg-slate-900"`       | `className="bg-card"`                      |
| `text-gray-500 dark:text-gray-400`             | `text-muted-foreground`                    |
| `border border-gray-200 dark:border-gray-800`  | `border border-border`                     |
| `text-green-600` for a success state           | `text-success` (add the token first)       |
| `style={{ color: "#0ea5e9" }}`                 | a semantic token, or a named viz constant  |
| Copying a `@webiston/ui` component to restyle  | add a `cva` variant to the original        |
| `!important` to win a cascade fight            | fix the specificity or the token           |
