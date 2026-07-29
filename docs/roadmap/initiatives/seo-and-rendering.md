# Initiative — SEO integrity & rendering performance

**Spec:** `../../reference/seo-performance.md` · **Status:** `[ ]` not started ·
**Priority:** the P0 block below is the highest-urgency work in the repo.

> **Why SEO and rendering are one initiative.** They touch the same files —
> `layout.tsx`, `generateMetadata`, the `[locale]` layout. Splitting them means
> editing the same metadata code twice.

---

## Phase 1 — `[ ]` Integrity (do this first, it is a policy risk)

Google can issue a **manual action** for fabricated structured data, and the risk
grows the longer it stays indexed. This phase is small and mechanical.

- `[ ]` **Delete the fabricated ratings and reviews.** 18 files emit invented
  `aggregateRating` and hand-written reviews with invented author names.
  Verified: `grep -rln aggregateRating src/ | wc -l` → **18**.
  Examples: `src/app/(app)/[locale]/tools/page.tsx:227-233` (`ratingValue: "4.8"`,
  `ratingCount: "15000"`) · `src/modules/tools/LatinCyrillic/seo/schemas.ts:87-108`
  (`"4.9"`, 3,250 ratings, plus two invented reviews).
  **Keep** `SoftwareApplication` / `FAQPage` / `HowTo` — those describe real features.
  **Exit:** `grep -rn "aggregateRating\|ratingValue" src/` returns nothing.

## Phase 2 — `[ ]` Canonical & locale correctness

Every item here is a page actively telling Google the wrong thing.

- `[ ]` **Book chapters canonical to the homepage.** `src/app/layout.tsx:200-207`
  sets a site-wide `canonical: "https://webiston.uz"`; `src/app/books/[...slug]/page.tsx`
  never overrides it — so **229 chapter pages declare themselves duplicates of `/`**.
- `[ ]` **`/en` is canonicalised away.** All 17 routed tool pages export a *static*
  `metadata` with a hardcoded Uzbek-URL canonical
  (e.g. `.../tools/json-formatter/page.tsx:95`), so every English page points at
  its Uzbek twin. Convert to `generateMetadata({ params })` and derive the
  canonical from the locale.
- `[ ]` **`<html lang>` is hardcoded `"uz"`** — `src/app/layout.tsx:394` — while
  `:200-206` advertises an `en` alternate. The root layout sits above `[locale]`,
  so read the locale from the request, not from `params`.
- `[ ]` **`/api/og` does not exist.** `src/app/books/[...slug]/page.tsx:52,99,128`
  point every OpenGraph image at `/api/og?…`; the only API route is
  `src/app/api/search/`. **Every book share card is a 404.** Implement with
  `ImageResponse` from `next/og` (built into Next 16, no new dependency), or
  point at a static image.
- `[ ]` **37 titles render as `… | Webiston | Webiston`** — `layout.tsx:13-16`
  applies a `%s | Webiston` template while 37 page titles already end in it.

## Phase 3 — `[ ]` Rendering (the biggest measurable win)

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
