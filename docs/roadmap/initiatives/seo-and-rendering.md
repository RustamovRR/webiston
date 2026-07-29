# Initiative — SEO integrity & rendering performance

**Spec:** `../../reference/seo-performance.md` · **Status:** `[~]` Phases 1–2
shipped (one item deferred) · **Next:** Phase 3 — static rendering.

> **Why SEO and rendering are one initiative.** They touch the same files —
> `layout.tsx`, `generateMetadata`, the `[locale]` layout. Splitting them means
> editing the same metadata code twice.

---

## Phase 1 — `[x]` Integrity (shipped 2026-07-29)

- `[x]` **Fabricated ratings and reviews deleted** — 18 files, 416 lines removed.
  `aggregateRating` blocks (up to `ratingCount: "15000"`) plus three invented
  `Review` authors ("Foydalanuvchi", "Пользователь"). Removed with a brace-matched
  codemod, not a line regex, because the blocks are nested object literals.
  `SoftwareApplication` / `FAQPage` / `HowTo` / `BreadcrumbList` kept — they
  describe real features.
- `[x]` **`inLanguage: ["uz","en","ru"]` → `["uz","en"]`** in
  `src/modules/tools/LatinCyrillic/seo/schemas.ts` — `ru` is not a routed locale,
  so the schema advertised a language the site does not serve.
- **Exit verified:** `grep -rni "aggregaterating|ratingvalue|ratingcount|reviewrating"`
  over the whole repo → **0**, and the 5 JSON-LD blocks served on
  `/tools/json-formatter` all parse and none contains a rating.

## Phase 2 — `[x]` Canonical & locale correctness (shipped 2026-07-29)

New shared helper: **`src/lib/seo.ts`** — `SITE_URL`, `localeUrl`,
`localeAlternates`, `withLocale`. One definition of "what URL is this page in
this locale", derived from `routing.localePrefix`, instead of 17 hand-written copies.

- `[x]` **Book chapters no longer canonical to the homepage.**
  `src/app/books/[...slug]/page.tsx` now sets `alternates.canonical` in every
  branch. Verified served: `/books/fluent-react/introduction` →
  `<link rel="canonical" href="https://webiston.uz/books/fluent-react/introduction">`.
- `[x]` **`/en` self-canonicals.** All 17 routed tool pages + the tools index
  converted from `export const metadata` to
  `generateMetadata({ params }) → withLocale(...)`. Verified served:
  `/en/tools/json-formatter` → canonical `…/en/tools/json-formatter`,
  `og:url` matching, `og:locale` `en_US`, `og:locale:alternate` `uz_UZ`, and a
  reciprocal `uz` / `en` / `x-default` hreflang set.
- `[x]` **`/api/og` implemented** — `src/app/api/og/route.tsx`, `ImageResponse`
  from `next/og`, no new dependency. Renders a 1200×630 brand card; verified
  `200 image/png`, and confirmed it renders Cyrillic. `path` is validated
  against a path-shaped regex before being drawn (it comes from the query string).
- `[x]` **Title doubling fixed.** Page titles no longer carry a `| Webiston`
  suffix that the root template appends again; the homepage uses
  `title: { absolute }`. Verified served: `/` → `Webiston | Dasturchilar uchun
  bepul kurslar va vositalar` (was `… | Webiston` twice).
- `[x]` **`any` removed from the books route** — `params: any` /
  `Promise<any>` became `BookPageProps` / `Promise<Metadata>`. That change alone
  surfaced **5 real type errors**: MDX frontmatter is untyped, so `title`,
  `description`, `keywords` and `author` were all being interpolated unchecked.
  Narrowed with an `asString(value: unknown)` guard.
- `[>]` **`<html lang>` is still hardcoded `"uz"`** (`src/app/layout.tsx`).
  **Deferred on purpose — do not "fix" this in isolation.** The only way to read
  the locale in the root layout is `getLocale()` from `next-intl/server`, which
  resolves through `headers()`
  (`next-intl/dist/…/server/react-server/RequestLocale.js`) and therefore opts
  the entire tree into dynamic rendering. The root layout renders *before* the
  `[locale]` layout could call `setRequestLocale`, so the cached path is not
  available to it. Cost of the bug: 19 English pages carry `lang="uz"`. Cost of
  this fix: **every route stays dynamic, including all 229 book pages.** Solve it
  with Phase 3, where the real options are (a) multiple root layouts — moving
  `<html>` into `[locale]` and `books` separately, at the price of a hard
  navigation between the two roots — or (b) accept `lang="uz"` until next-intl
  can resolve a locale statically above the segment.

## Phase 3 — `[ ]` Rendering (the biggest measurable win)

> Start here by deciding the `<html lang>` / root-layout question deferred from
> Phase 2 — it and `setRequestLocale` are the same decision.

- `[ ]` **Nothing is statically prerendered.** Every route in the build output is
  `ƒ` (server-rendered on demand); only `/_not-found` and `/manifest.webmanifest`
  are static. **Cause:** next-intl requires `setRequestLocale(locale)` in every
  locale layout/page to permit static generation, and there are **zero
  occurrences** in `src/` (`grep -rn "setRequestLocale" src/`). On a
  226-chapter content site this is the single largest performance item.
  Note `src/app/books/[...slug]/page.tsx:14` *already has* `generateStaticParams` —
  it is being defeated by the missing opt-in.
- `[ ]` **1.05 MB search index on every page load.** `public/search-index.json`
  is 1,097,642 bytes and `src/components/shared/Search/Search.tsx:67` initialises
  it in a mount effect — on every page, including pages that never open search.
  Move it into the dialog-open path.
- `[ ]` **Code is highlighted in the browser.** `src/components/mdx/CodeBlock/CodeBlock.tsx:1`
  is `'use client'`, so server HTML ships grey skeletons instead of code — bad for
  LCP *and* indexability. `MDXContent` is already an async Server Component.
- `[ ]` **Shiki gets the wrong language.** `CodeBlock.tsx:29` hardcodes `"ts"` for
  **every** block, so JS/JSON/bash/CSS are all mis-highlighted.

## Phase 4 — `[ ]` Payload

- `[ ]` **Header logo is 209 KB at 1120×1120**, rendered at 50×50 on every page
  (`Logo.tsx:7`, `public/logo.png`). Ship a 100×100 WebP.
- `[ ]` **CLS on every book figure.** `src/components/mdx/ImageViewer/ImageViewer.tsx:33`
  passes `width={0} height={0}` — no aspect ratio is reserved.
- `[ ]` **Whole message bundle to the client.** `src/app/(app)/[locale]/layout.tsx:39`
  calls `getMessages()` with no namespace filter and passes everything to the
  client provider — all 19 tool namespaces on every localised page.
- `[ ]` **Dynamic-import the heavy deps** — `pdfjs-dist`, `mammoth`, `docx`,
  `katex`, `shiki`, `leaflet`, `flexsearch`. ⚠️ The Next 16 Turbopack build **no
  longer prints per-route sizes**, so measure with `@next/bundle-analyzer`
  before and after; do not claim an improvement without both numbers.

## Phase 5 — `[ ]` Enrichment (only after Phase 1)

- `[ ]` `TechArticle` for chapters, `BreadcrumbList`, `ItemList` for the books index.
- `[ ]` Per-route metadata audit — which pages still fall back to the generic title.
- `[ ]` `scripts/build-search-index.js` indexes a hardcoded single-entry stub and
  swallows errors, instead of reading the 17 slugs from `tools-list.json`.

---

## Blocked / related decisions

- The `/books` i18n decision in `../backlog.md` changes Phase 2 — if `/en/books`
  must exist, the canonical work is larger than described here.
- `images.unoptimized: true` (`next.config.ts:25`) — decision in `../backlog.md`.
