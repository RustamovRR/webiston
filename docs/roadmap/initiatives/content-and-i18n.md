# Initiative — Content & internationalization

**Spec:** `../../reference/content-i18n.md` + `../../glossary.md` ·
**Status:** `[ ]` not started · **Partly blocked** on the `/books` i18n decision.

> **Locales are `uz` + `en` only.** Russian is not supported —
> `src/i18n/routing.ts:5` and `src/middleware.ts:5` both list exactly
> `["uz", "en"]`. Any doc claiming `ru` is wrong.
>
> **Scope rule: `/books` is the only i18n-exempt surface.** The book chapters
> under `content/` are a hand-translated layer — the prose *is* the translation,
> so it does not go through next-intl. **Everywhere else — tools, shared
> components, navigation, aria-labels, placeholders, error text — must use
> next-intl.** A user-facing string typed directly into a component outside
> `/books` is a bug, not a shortcut.

---

## Phase 1 — `[ ]` Correctness (broken strings ship today)

- `[x]` **Fixed the `url-encoder` runtime bug — 2026-07-29.** `useUrlEncoder.ts:133,136`
  calls `tErrors("decodeError")` / `("encodeError")`. uz had those names; **en had
  the same strings under `urlDecodeError` / `urlEncodeError`**, so every English
  user hit a broken message on any encode/decode failure. Renamed in
  `messages/tools/url-encoder/en.json`.
- `[x]` **Added the parity gate — `pnpm i18n`** (`scripts/i18n-parity.mjs`).
  Walks every message bundle and fails on any key present in one locale and not
  the other. Nothing else catches this class: typecheck cannot see inside JSON
  and the build succeeds regardless. Verified it fails by deleting a key.
- `[!]` **8 dead `en`-only keys block the gate.** Verified unused by grep:
  `Info.formatExample.exampleText` / `exampleEncoded` (the component calls
  `title`, `spacesAndSymbols`, `plainText`, `encodedUrl`, `queryParameters` —
  all present in both), and `Info.urlStructure.*` ×6 (the code calls
  `Panel.urlStructure`, a different path). Harmless at runtime but they keep
  `pnpm i18n` red. **Deleting them needs approval.**

- `[x]` **Moved 12 hardcoded strings into `messages/common/*` — 2026-07-29.**
  New `Search` namespace (8 keys) + `Common.error` / `toggleTheme` / `enterData`,
  both locales, verified in parity. Covered `ToolPanel` ("Xatolik", the Uzbek
  default-prop empty state), `Search`, `SearchDialog`, `SearchComponents`
  (including the `{query}` interpolation in the no-results hint) and
  `ThemeToggle`'s `aria-label`.
- `[ ]` **Deduplicate the locale list.** `src/middleware.ts:5` hardcodes
  `["uz","en"]` instead of importing `routing` from `src/i18n/routing.ts:5`,
  which declares the same list. Two sources of truth for the locale set means
  adding a locale silently half-works.

## Phase 2 — `[ ]` Strings that bypass next-intl

- `[ ]` **48 hardcoded Uzbek strings in `src/constants/navigation.tsx`** — chapter
  titles and descriptions across `REACT_CHAPTERS` (11), `AI_ENGINEERING_CHAPTERS`
  (5) and `JAVASCRIPT_CHAPTERS` (8). **The English homepage renders Uzbek chapter
  cards.** Move to a `HomeChapters` namespace keyed by slug; keep only `href` +
  key in the constant.
- `[ ]` Sweep for other JSX text literals, `aria-label`s, `placeholder`s and
  `title` attributes that are not `t()`.

## Phase 3 — `[ ]` The `messages/index.js` footgun

`messages/index.js` is a **manual merger** — one explicit import pair per tool per
locale. Adding a tool means editing it twice, and forgetting shows up as
`undefined` strings at runtime rather than as a build error. A glob or codegen
step removes the footgun entirely.

## Phase 4 — `[ ]` Translation quality

- `[ ]` **Glossary coverage pass** over the 226 chapters. Inconsistent terminology
  is the most common quality complaint against a long technical translation.
  Use the `content-reviewer` subagent **per book, not per chapter** — per-chapter
  loses the consistency view that is the entire point.
- `[ ]` **MDX frontmatter consistency.** A missing `description` is a missing meta
  description, which is a direct SEO loss — coordinate with
  `seo-and-rendering.md` Phase 5.
- `[ ]` `glossary.md` starts with a stray `'` character on line 1.

---

## Blocked — needs the `/books` decision first

All 226 chapters live at `src/app/books/`, a **sibling** of `(app)/[locale]/`, so
they sit outside the locale segment entirely and the middleware matcher does not
cover them. Until it is decided whether `/en/books` must exist, the following
cannot be scoped:

- whether book content needs an `en` tree at all
- the canonical/hreflang shape in `seo-and-rendering.md` Phase 2
- whether `src/app/books/` should move under `(app)/[locale]/books/`

**Recommendation regardless of the answer:** move `books/` under `(app)/[locale]/`.
Even if the books stay Uzbek-only, having one route tree instead of two removes a
permanent special case from the middleware, the sitemap and every metadata helper.
