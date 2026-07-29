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

## Phase 3 — `[x]` Rendering (the biggest measurable win) — shipped 2026-07-29

- `[x]` **Static prerendering is on. 0 → 266 prerendered routes.** Build output
  went from every route `ƒ` to `●`/`○` everywhere except the two API routes,
  which are correctly dynamic.
  - `setRequestLocale` in `[locale]/layout.tsx`, `books/layout.tsx`, and **every
    page** (layout alone is not enough — `/[locale]` stayed `ƒ` until the page
    itself called it), plus `generateStaticParams` on `[locale]`.
  - Root cause of the dynamic-ness was not the pages: `Header` and `Footer` are
    Server Components calling `useTranslations`, which resolves the locale
    through `headers()`. Both are shared by the localised tree *and* `/books`.
  - **Two latent bugs only prerendering could expose**, both pre-existing:
    1. `react-media-recorder` → `extendable-media-recorder-wav-encoder` calls
       `new Worker(...)` at **module scope**, so importing the camera tool
       crashed any server render. A `CameraRecorderClient` wrapper with
       `ssr: false` already existed for exactly this — it was never wired up;
       the page imported `CameraRecorder` from `@/modules/tools` directly.
    2. `/books/**` had **no `NextIntlClientProvider`**, so `Search` and
       `ThemeToggle` (client components in the shared Header) threw
       "context … was not found" on all 229 chapters. The server render of that
       subtree failed and React recovered on the client, which is why it never
       looked broken. Fixed with a provider pinned to `routing.defaultLocale`
       carrying **only the `Search` + `Common` namespaces** — `/books` stays
       Uzbek-only (no `/en/books`; verified 404).
- `[x]` **1.05 MB search index no longer loads on every page.** It was fetched
  in a mount effect in `Search.tsx`; now it initialises when the dialog *opens*.
  `searchEngine.search()` already self-initialises, so a fast typist is still
  correct. **Measured in the browser**, not inferred: a book page load requested
  `/search-index.json` before, and records no such request after; opening the
  dialog and typing "virtual dom" fetches it and returns highlighted hits.
- `[x]` **Soft 404s fixed — `/books/**` returned HTTP 200 for pages that do not
  exist.** Two independent instances of the same shape, both found by looking at
  the rendered body instead of the status line:
  1. A missing chapter `throw`-ed inside a `try`, was caught, and rendered
     `<ErrorContent>` at **200**. Now `notFound()`.
  2. `getTutorialInfo()` built an info object for **any** id (`getTutorialTitle`
     falls back to the raw string), so `/books/<anything>` rendered an empty
     landing page at **200** — an unbounded indexable URL space. A book now
     exists iff its `content/<id>/_meta.json` does, with an id-shape guard before
     any filesystem access.
  - Root cause of both: `notFound()` signals by **throwing**, and both call sites
    sat inside a `try/catch` that swallowed it. Guarded with `unstable_rethrow`.
    A repo sweep confirms these were the only two `catch` blocks in `src/` that
    could swallow a `notFound()`/`redirect()`.
  - Verified: real chapters/books `200`; `/books/fluent-react/introduction`,
    `/books/no-such-book`, `/books/NoSuchBook` → **404**.
- `[x]` **Sitemap regression from static rendering, caught in review.**
  `generateStaticParams` prerenders the tools pages under `/uz/*`, and
  next-sitemap auto-discovers the prerender manifest — so **18 `/uz/*` URLs**
  entered `sitemap.xml`. Those 307-redirect (localePrefix is "as-needed"), and a
  redirecting URL in a sitemap is a Search Console error that contradicts the
  canonical each page declares. Excluded in `next-sitemap.config.js`;
  286 → **267 URLs, 0 duplicates, 0 `/uz/`**.
- `[x]` **Code is highlighted on the server.** `CodeBlock` is no longer
  `'use client'` — it is an async Server Component, so for `/books/**` the
  highlighting happens at **build** time. Verified: **143 of 228** prerendered
  chapters now contain `class="shiki"` markup in their static HTML (the other 85
  contain no code fences), **0** skeleton placeholders remain, and no JS chunk
  references shiki — it left the client bundle entirely.
  - **How it can be server-side at all:** the old version needed `useTheme()`.
    Shiki's dual-theme mode replaces that — `themes: {light, dark}` +
    `defaultColor: "light"` emits the light colour inline and the dark one as a
    `--shiki-dark` custom property on the same element, and two rules in
    `globals.css` switch them. Verified in the browser: the same span computes
    `#AF00DB` in light and `#C586C0` in dark, with no JavaScript involved.
  - Also removed `dark:[&_pre]:!bg-[#0A0A0A]` from `MDXContent`'s `pre` mapper —
    it forced a raw hex surface in dark mode while light mode used `bg-card`.
    Both themes now use the same token.
- `[x]` **Shiki gets the right language.** `CodeBlock` hardcoded `"ts"` while
  `MDXContent` was already extracting `language-(\w+)` and discarding it — so
  **every** fence in `content/` was highlighted as TypeScript: 298 `js`, 19
  `html`, 8 `jsx`, 4 `shell`/`bash`, 1 `reg`, 1 `mdx`. The language is now passed
  through, with a `text` fallback so an unknown grammar cannot throw mid-build.
  Verified on an `html` chapter: 284 HTML-tag tokens where there were none.
- `[!]` `CodeBlockSkeleton.tsx` is now unreferenced — **deletion needs approval.**

### Rendering-strategy decisions (Next 16.2.12) — checked against `node_modules`, not memory

| API | Verdict | Why |
| --- | --- | --- |
| `generateStaticParams` + `setRequestLocale` | **applied** | 266 routes prerendered |
| `dynamicParams = false` (`/books/[...slug]`) | **applied** | fixed corpus; unknown URLs 404 without invoking the page |
| `dynamic = "force-static"` (`/api/search/documents`) | **applied** | reads nothing from the request; was re-walking `content/` per call. Now `○` |
| `runtime = "nodejs"` + immutable `Cache-Control` (`/api/og`) | **applied** | must stay `ƒ` — it reads `searchParams` |
| `cacheComponents: true` (the Next 16 successor to `ppr`/`dynamicIO`) | **rejected** | it inverts the default to dynamic-unless-`"use cache"`. It exists for a static shell with per-request holes. This site has **no per-request data** and already prerenders 266 of 268 routes — adopting it is pure migration risk for zero gain |
| `"use cache"` / `cacheLife` / `cacheTag` | **unavailable** | gated on `cacheComponents`; verified in `next/dist/server/use-cache/cache-life.js:72` — throws "only available with the `cacheComponents` config" |
| `connection()`, `after()` | **not needed** | nothing to opt into dynamic, no post-response work |
| `optimizePackageImports` | **already covered** | `lucide-react` is in Next's built-in default list (`next/dist/server/config.js`) |
| ISR (`revalidate`) | **not needed** | content changes only at build |

⚠️ **Found while measuring, not yet fixed:** the search corpus exists **twice** and
the two copies disagree — `public/search-index.json` has **1,078** documents
(1.05 MB, from `scripts/build-search-index.js`) while `/api/search/documents`
returns **1,090** (682 KB, built by the route itself). Two implementations of the
same index. Folded into the Phase 5 item below.

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
- `[ ]` **One search index, not two.** `scripts/build-search-index.js` indexes a
  hardcoded single-entry stub and swallows errors instead of reading the 17 slugs
  from `tools-list.json`; separately, `src/app/api/search/documents/route.ts`
  builds the *same* corpus with different code. Measured 2026-07-29: 1,078 docs
  vs 1,090 — they already disagree. One should generate, the other should read it.

---

## Blocked / related decisions

- The `/books` i18n decision in `../backlog.md` changes Phase 2 — if `/en/books`
  must exist, the canonical work is larger than described here.
- `images.unoptimized: true` (`next.config.ts:25`) — decision in `../backlog.md`.
