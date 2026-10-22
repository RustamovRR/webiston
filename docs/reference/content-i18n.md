# Webiston — Content & Internationalization

> The spec for the two things that make this product what it is: **226 MDX book
> chapters translated into Uzbek**, and a UI in three locales. Read this before
> touching `content/`, `messages/`, `src/i18n/`, or any user-facing string.
>
> _Verified against the code 2026-10-22. Counts drift — each one below names
> the command that re-measures it._

---

## 1. Locales — the truth

**`uz` (default, served unprefixed), `en`, `ru`.**

### One source of truth: `src/i18n/locales.ts`

| Export | What it is |
| ------ | ---------- |
| `LOCALES` | what is served — `["uz", "en", "ru"]`. Adding a locale is adding it here and shipping its `messages/**` files |
| `DEFAULT_LOCALE` | `"uz"` |
| `CATALOGUE` | per locale: the endonym the switcher shows, `htmlLang` (hreflang), `ogLocale` |
| `localePath(locale, path)` | a link from a page in `locale` — bare for `uz`, prefixed otherwise |

Everything that can import it derives from it: `src/i18n/routing.ts`
(`locales`, `defaultLocale`, `localePrefix: "as-needed"`), the language
switcher, `og:locale`, hreflang, and `pnpm i18n` (which reads `LOCALES` out of
the file with a regex).

### The copies that cannot derive it — change these by hand

| File | Why it is a copy | What catches drift |
| ---- | ---------------- | ------------------ |
| `src/proxy.ts` — `matcher` `"/(uz|en|ru)/:path*"` | Next parses `config` statically; a template literal fails the build | `src/proxy.test.ts` |
| `next-sitemap.config.js` — `['', 'en', 'ru']` | plain Node config, `''` is the unprefixed `uz` | nothing — check the sitemap |
| `scripts/build-search-index.js` — `["uz", "en", "ru"]` | plain Node script | nothing — check `public/search-index.json` |

There is no `src/middleware.ts`; the locale middleware is `src/proxy.ts`. Its
matcher also ENUMERATES the unprefixed routes under `[locale]` (`/tools/:path*`,
`/privacy-policy`, `/extension`). A route missing there is a 404 on its bare
`uz` URL, not an unprefixed page — `proxy.test.ts` derives the list from the
filesystem and fails when a new route is not in it.

### What each locale covers

- **The shell and every tool** live under `src/app/(app)/[locale]/`: the home
  page, `/tools`, `/extension`, `/privacy-policy`, and each tool route — 25
  today (`ls -d "src/app/(app)/[locale]/tools"/*/ | grep -v '/_' | wc -l`).
  All of them render in all three locales.
- **`/books/**` is Uzbek-only by design.** It sits at `src/app/books/`,
  OUTSIDE `[locale]`, and the proxy matcher deliberately never sees it. A
  `/ru/books` would be Uzbek prose under a Russian URL. `inLanguage: "uz"` on
  book pages is correct, not an oversight.

### Links

`localePrefix: "as-needed"` means `/tools/qr-generator` in Uzbek and
`/en/tools/qr-generator` in English; `/uz/...` exists only to 307 back to the
bare path. Never write a bare `<a href="/tools">`.

- **Client Components:** `Link` from `src/i18n/navigation.ts`.
- **Header and footer:** pass `locale={chromeLinkLocale(locale)}` — their
  ambient locale is the default, not the request's (the reason is in
  `navigation.ts`).
- **Server Components:** `localePath(locale, path)` with `locale` from the
  route's `params`. **Not `getLocale()`** — outside the request-scoped provider
  it answers `"uz"` on `/en`, which is how every tool card on the `/en` and
  `/ru` home pages once linked to the Uzbek tool.

### Known defect: `<html lang="uz">`

`src/app/layout.tsx:470` (and `src/app/global-error.tsx:49`) hardcode
`lang="uz"`, inherited by all three locales. **This is an accessibility defect,
not an SEO one**: screen readers use `lang`; Google states it does not, and
reads the language from the visible content. Fixing it needs multiple root
layouts, because `/books` sits outside `[locale]` — and that costs a hard
navigation between the two trees. See `../roadmap/backlog.md` first.

---

## 2. UI strings

### Where they live

```
messages/
├── common/{uz,en,ru}.json        HomePage, Metadata, Header, Common, Search,
│                                 Filters, Footer, PrivacyPage, ExtensionPage
├── tools/<folder>/{uz,en,ru}.json   one folder per tool, plus tools-page
└── index.js                       merges them per locale
```

28 bundles today: `common` plus 27 folders under `tools/`
(`ls messages/tools | wc -l`).

- **All three locales in the same commit.** `pnpm i18n` fails on any key that
  exists in one bundle and not in the others. A missing key is a runtime error
  surface, not a TODO.
- **Adding a folder means editing `messages/index.js`** — three imports and
  three spread lines. The merge is an object spread, so a top-level namespace
  that two files share is overwritten silently: the later file wins.
- **The namespace is the file's top-level key, not the folder name.** Tools use
  a PascalCase `<Tool>Page` — `messages/tools/qr-generator/uz.json` holds
  `QrGeneratorPage`, read with `useTranslations("QrGeneratorPage")`;
  `latin-cyrillic` holds `LatinCyrillicPage`, `yangi-alifbo` holds
  `NewAlphabetPage`. Match that; do not invent a key shape.
- `messages/README.md` predates `ru` and lists ten tools. Where it disagrees
  with this file, this file is right.

### How a page gets its strings

The `[locale]` layout does NOT hand the client the whole bundle (that used to
serialise ~91 KB of Uzbek strings into every page). Each route wraps its client
island in `LocaleMessages`, naming exactly the namespaces its Client
Components call:

```tsx
// Named as a constant: `pnpm i18n` reads CLIENT_NAMESPACES / TOOL_NAMESPACE
// to prove every namespace a Client Component calls is provided somewhere.
const CLIENT_NAMESPACES = ["LatinCyrillicPage", "Common"]

<LocaleMessages locale={locale} namespaces={CLIENT_NAMESPACES}>
  …
</LocaleMessages>
```

- Include `Common` — `ToolHeader` and `DualTextPanel` call it.
- `locale` is required and comes from `params`; a namespace that does not exist
  throws at render, so a typo fails the build rather than shipping key paths.
- Server Components skip the provider: `getTranslations({ locale, namespace })`,
  with the locale passed explicitly. Copy a Server Component needs (an H1, a
  FAQ) is better resolved on the server and passed down as props than shipped
  to the client in a namespace.
- `pnpm i18n` proves a namespace is provided on SOME route, not on the right
  one. Check the page in the browser.

### Writing them

- No string concatenation for sentences. Use next-intl interpolation so word
  order can differ between languages.
- Where a language inflects, use ICU `select` rather than a second key — e.g.
  ru `direction.resolved` turns the nominative `латиница` into `в латиницу`.
- Uzbek UI copy is Latin script.

### The 2027 alphabet (Law OʻRQ-1184, in force 22.04.2027)

When copy or examples use the new letters, they must be the exact code points
the law publishes on lex.uz — the look-alikes render identically and are
different letters to search engines and spell-checkers:

| Letter | Code points | Not |
| ------ | ----------- | --- |
| Ğ ğ | U+011E U+011F | ǵ (2019 draft) |
| Ö ö | U+00D6 U+00F6 | ŏ (2021 draft), ó |
| Ş ş | U+015E U+015F | **ș U+0219** (Romanian, comma below) |
| Ç ç | U+00C7 U+00E7 | |
| tutuq ʼ | U+02BC | |

The engine corrects the look-alikes in user input; the site's own copy has to
be right by itself. `LATIN_2027_LETTERS` in `@webiston/transliteration` is the
reference.

---

## 3. Uzbek technical terminology — `glossary.md`

The repo root has a curated English → Uzbek glossary (`glossary.md`, not under
`docs/`). It is the project's terminology contract for both the books and the
UI: *state → state*, *bundle → to'plam paketi*, *maintainability →
qo'llab-quvvatlash qulayligi*, *tutuq mark → tutuq belgisi*.

- **Check the glossary before translating a technical term.** Inconsistent
  terminology across 226 chapters is the most common quality complaint a
  technical translation gets — and the same term named two ways on two tool
  pages is the UI's version of it.
- Deliberately untranslated terms (`state`, `event`) are a decision, not an
  oversight — leave them.
- When a chapter or a string needs a term that is not in the glossary, **add it
  there in the same commit**.

---

## 4. Book content (`content/`)

```
content/
├── ai-engineering/              _meta.json +  31 .mdx
├── fluent-react/                _meta.json + 110 .mdx
└── javascript-definitive-guide/ _meta.json +  85 .mdx
```

(`find content -name page.mdx | wc -l` → 226.)

- Each book has a `_meta.json` that drives sidebar order and titles. A chapter
  that exists on disk but not in `_meta.json` is effectively invisible.
- Chapters are `page.mdx` inside a lowercase-hyphen folder; the folder name is
  the URL segment.
- Books are served from `src/app/books/[...slug]/` — outside `[locale]`, Uzbek
  only (§1). Do not assume the locale machinery applies to them.
- MDX rendering components live in `src/components/mdx/` (Callout, CodeBlock,
  ImageViewer, TableOfContents, VideoEmbed, …). Add a component there and wire
  it through `MDXContent` rather than importing it per chapter.
- Plugins are configured centrally, in two places: `src/lib/mdx.ts`
  (`remark-gfm`, `rehype-raw`, `rehype-slug`, `rehype-autolink-headings`) and
  `MDXContent.tsx` (`remark-math` + `rehype-katex`). Code highlighting is Shiki,
  inside `CodeBlock` (`CodeBlock/highlight.ts`), not a rehype plugin. A chapter
  should never need its own plugin.

### Writing rules for chapters

- Translate meaning, not word order. A literal calque of English syntax reads
  badly in Uzbek and is the main thing a reviewer should catch.
- Code, identifiers, and API names stay in English.
- Keep the original book's chapter structure — readers cross-reference.
- Prose is the product here. It gets the same review bar as code:
  use the **`content-reviewer`** subagent on a chapter diff.

---

## 5. Search

`postbuild` runs `scripts/update-tools-list.js`, then `next-sitemap`, then
`scripts/build-search-index.js`, which writes `public/search-index.json`: the
book chapters, plus one entry per tool per locale — the tools from
`tools-list.json` (generated from the route folders), their names from the
`Tools` key of `messages/tools/tools-page/{uz,en,ru}.json`.

The client (`src/lib/search/flexsearch.ts`, FlexSearch) fetches
`/search-index.json`; `src/app/api/search/documents/route.ts` is the fallback.
New content is not searchable until a build runs. If search is missing a
chapter or a tool, check the build step before debugging the UI.

---

## 6. The Chrome extension shares the transliteration engine

`apps/extensions/latin-cyrillic` and the web app both import
`@webiston/transliteration`, and both consume its BUILT `dist` — run
`pnpm packages:build` after changing the package, or the app keeps running the
old engine. A change to the transliteration rules affects **both** surfaces,
and both ship to real users.

- The package's tests live in `packages/transliteration/__tests__/`. When a
  conversion is reported wrong, the failing word goes into
  `uzbek-corpus.test.ts` first — it is the bug report.
- The extension's UI strings are hardcoded Uzbek and do not use `messages/**`
  (`apps/*` may not import `src/`); moving them to Chrome's native
  `_locales/` is a backlog item.
