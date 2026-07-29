# Initiative — Content & internationalization

**Spec:** `../../reference/content-i18n.md` + `../../glossary.md` ·
**Status:** `[ ]` not started · **Partly blocked** on the `/books` i18n decision.

> **Locales are `uz` + `en` only.** Russian is not supported —
> `src/i18n/routing.ts:5` and `src/middleware.ts:5` both list exactly
> `["uz", "en"]`. Any doc claiming `ru` is wrong.

---

## Phase 1 — `[ ]` Correctness (broken strings ship today)

- `[ ]` **uz/en key parity is broken in `url-encoder`.** A deep key-set diff of
  every `messages/*/uz.json` against its `en.json` found **2 keys in uz missing
  from en** (`decodeError`, `encodeError`) and **10 dead en-only keys**. All 12
  are in `tools/url-encoder`; every other namespace is in parity. A missing key
  is a runtime `undefined`, not a TODO.
- `[ ]` **Add a key-parity check to the gate.** A small script diffing key sets
  per namespace, wired into CI. This would have caught the above automatically —
  and it is the reason to write it rather than just fix the two keys.
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
