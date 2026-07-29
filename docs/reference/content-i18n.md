# Webiston — Content & Internationalization

> The spec for the two things that make this product what it is: **226 MDX book
> chapters translated into Uzbek**, and a bilingual UI. Read this before
> touching `content/`, `messages/`, `src/i18n/`, or any user-facing string.

---

## 1. Locales — the truth

**`uz` (default) and `en`. That is all.**

Defined in exactly three places, which must stay in sync:

| File                        | What it holds                                    |
| --------------------------- | ------------------------------------------------ |
| `src/i18n/routing.ts`       | `locales: ["uz", "en"]`, `defaultLocale: "uz"`, `localePrefix: "as-needed"` |
| `src/middleware.ts`         | the same list **plus** the `matcher` regex `/(uz|en)/:path*` |
| `messages/`                 | `common/{uz,en}.json` + `tools/<tool>/{uz,en}.json` |

⚠️ Several older steering documents claim Russian (`ru`) support. **It does not
exist** — there is no `ru` in routing, middleware, or `messages/`. Do not add it
to a doc, a type, or a language switcher without the owner deciding to build it.

`localePrefix: "as-needed"` means Uzbek URLs have **no prefix** (`/tools/qr-generator`)
and English ones do (`/en/tools/qr-generator`). Any hardcoded path in a component
must go through next-intl's navigation helpers (`src/i18n/navigation.ts`), never
a bare `<a href="/tools">`.

### Known bug

`src/app/layout.tsx:394` hardcodes `<html lang="uz">`. English pages therefore
declare the wrong language to screen readers and to search engines. Fix is in
the backlog; it needs the locale from the route segment, and the root layout
sits **above** `[locale]`, so it is not a one-liner.

---

## 2. UI strings

- **Both locales in the same commit.** A key present in `uz.json` and missing
  from `en.json` is a runtime failure surface, not a TODO.
- Messages are merged manually in **`messages/index.js`** — an explicit
  `import … from "./tools/<tool>/<locale>.json"` pair per tool. **Adding a tool
  means editing this file**, twice. It is easy to forget; check it when a new
  tool's strings come back `undefined`.
- Namespacing follows the folder: `messages/tools/qr-generator/uz.json` is read
  with `useTranslations("qrGenerator")` — match the existing convention in
  `messages/index.js` rather than inventing a new key shape.
- No string concatenation for sentences. Use next-intl interpolation so word
  order can differ between Uzbek and English.

---

## 3. Uzbek technical terminology — `glossary.md`

The repo root has a curated Uzbek↔English glossary (`glossary.md`). It is the
project's terminology contract: *state → state*, *bundle → to'plam paketi*,
*maintainability → qo'llab-quvvatlash qulayligi*.

- **Check the glossary before translating a technical term.** Inconsistent
  terminology across 226 chapters is the most common quality complaint a
  technical translation gets.
- Deliberately untranslated terms (`state`, `event`) are a decision, not an
  oversight — leave them.
- When a chapter needs a term that is not in the glossary, **add it there in the
  same commit**.

---

## 4. Book content (`content/`)

```
content/
├── ai-engineering/              _meta.json +  31 .mdx
├── fluent-react/                _meta.json + 110 .mdx
└── javascript-definitive-guide/ _meta.json +  85 .mdx
```

- Each book has a `_meta.json` that drives sidebar order and titles. A chapter
  that exists on disk but not in `_meta.json` is effectively invisible.
- Chapters are `page.mdx` inside a lowercase-hyphen folder; the folder name is
  the URL segment.
- Books are served from `src/app/books/[...slug]/` — **outside** the `[locale]`
  segment. Book content is Uzbek-only today; do not assume the locale machinery
  applies to it.
- MDX rendering components live in `src/components/mdx/` (CodeBlock, Callout,
  TableOfContents, ImageViewer, …). Add a component there and wire it through
  `MDXContent` rather than importing it per chapter.
- Rehype/remark plugins (KaTeX math, `rehype-pretty-code`/Shiki highlighting,
  GFM, slug + autolink headings) are configured centrally. A chapter should
  never need its own plugin.

### Writing rules for chapters

- Translate meaning, not word order. A literal calque of English syntax reads
  badly in Uzbek and is the main thing a reviewer should catch.
- Code, identifiers, and API names stay in English.
- Keep the original book's chapter structure — readers cross-reference.
- Prose is the product here. It gets the same review bar as code:
  use the **`content-reviewer`** subagent on a chapter diff.

---

## 5. Search

`scripts/build-search-index.js` runs in `postbuild` and produces the client
search index consumed via FlexSearch (`src/lib/search/`). New content is not
searchable until a build runs. If search is missing a chapter, check the build
step before debugging the UI.

---

## 6. The Chrome extension shares the transliteration engine

`apps/extensions/latin-cyrillic` and the web app both import
`@webiston/transliteration`. A change to the transliteration rules affects
**both** surfaces and both ship to real users. That package has the repo's only
test suite (6 files) — extend it rather than working around it.
