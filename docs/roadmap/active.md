# Webiston — Active Roadmap

> **Read at the start of every session. Update at the start and the end.**
> Thin lines only. `[ ]` not started · `[~]` in progress · `[x]` done ·
> `[!]` blocked · `[>]` deferred.
>
> **This file is a tracker, not a plan.** Multi-phase work lives in
> `initiatives/`; completed initiatives move to `../archive/`. If an entry here
> needs more than 3 lines, it belongs in an initiative file.

_Last updated: 2026-07-31 — **the tools pass has started, with
`/tools/latin-cyrillic`** — the site's most-visited page. This was not a design
refresh: the engine was producing wrong Uzbek on ordinary words. Nine defect
classes fixed and covered by tests, the direction policy moved into
`@webiston/transliteration` so the web tool and all three extension surfaces
share it, the Chrome extension's context menu (dead since it shipped) made to
work, and chunking + the six info cards removed with the owner's approval.
Branch `refactor/infrastructure`._

---

## Snapshot

| Area | State | Evidence |
| ---- | :---: | -------- |
| Dependencies | ✅ | all latest; `pnpm outdated` → 1 (`hast`, deprecated, 0 imports) |
| Build & gates | ✅ | **all 9 gates green**; hooks 0.16s / 2.39s |
| Repo hygiene | ✅ | `git ls-files -i -c` → 0 |
| Package boundaries | ✅ | `packages/ui` `@/` imports 3 → **0**; one definition, re-exported |
| Duplicated types | ✅ | `PasswordSettings` declared twice in one file · `MetaData` ×3 with one already **drifted** · `CapturedMedia` ×4 → all consolidated. TS merges identical interfaces, so no gate saw any of it |
| Duplicated formatters | ✅ | 5 copies → `src/lib/utils/format.ts`. Had drifted into **visible** inconsistency: `formatDuration(65)` was `01:05` in one place and `1:05` in another **within the same tool**; `formatFileSize(0)` printed `NaN undefined` |
| `pnpm check` | ✅ | **81 → 0 errors.** First time this gate has ever passed |
| i18n parity | ⚠️ | `pnpm i18n` gate added; red on 8 dead `en`-only keys pending approval |
| SEO integrity | ✅ | fabricated ratings + invented reviews **deleted** (18 files, 416 lines); repo-wide grep → 0 |
| Canonical / hreflang | ✅ | every page self-canonicals; verified in served HTML for `/`, `/en`, tools, books |
| OG share cards | ✅ | `/api/og` implemented (`next/og`) — was a 404 on all 229 book pages |
| Static rendering | ✅ | **0 → 266 routes prerendered.** 34 tool pages (17 × 2 locales) + 228 book chapters + home + index pages. Only `/api/og` stays `ƒ` — it reads `searchParams`. `cacheComponents`/PPR deliberately rejected, see initiative |
| Payload | ⚠️ | search index on dialog-open (**0** requests on page load) · logo **209 KB → 5.5 KB** · **CLS measured 0** · tool-page HTML **−43%** via scoped i18n. Left: `images.unoptimized` (**25 MB of raw book figures**) |
| Soft 404s | ✅ | `/books/**` returned 200 for non-existent chapters *and* any unknown book id; both now 404 |
| Boundary contrast | ✅ | **NEW `--border-strong`.** `--border` measures **1.32:1** light / **1.33:1** dark — WCAG 1.4.11 needs **3:1** for a boundary that identifies a component. Solved: 3.16/3.02. `--border` documented decorative-only |
| `pnpm contrast` (again) | ✅ | **Was vacuous on the one token that mattered.** `--border` absent from `PAIRS` *and* unparseable (alpha) → would have `SKIP`ped. Gate now composites alpha in gamma-encoded sRGB. **32 → 36 pairs** |
| Homepage | ✅ | Search overlap **−25px → +8px gap**. nextjs.org motif (180 lines, ~4s unguarded motion) → drifting grid + CSS `view()` reveal, **zero JS**. 8 junk classes were shipping in the `<h1>`. Cards had **no background** (alpha 0). Header seam fixed via a frosted bar after a scroll-driven fade measured **inert** (`timelineProgress: 0%` at every scrollY) |
| Light-mode CTA | ✅ | The hero's primary button was **a white pill on a white page** — `ButtonLink` pinned `bg-white text-black` in both schemes. `bg-foreground text-background` flips together: **17.4:1 / 18.7:1** |
| Hero copy | ✅ | **Reverted to the owner's original** — the palette visual now answers "what is this site", which was the whole case for the rewrite. Split into `titleLead`/`titleAccent` |
| Logo | ✅ | "Terminal" mark from the brand exploration, pure markup — PNG request gone from every page. **Favicon still old — needs image generation** |
| Header seam | ✅ | Phase 7's frosted bar treated the symptom. Root cause: the glow was anchored at `top: 0` — the exact strip the header covers — so the header was the one band WITHOUT the tint. Light moved down; hairline scoped off hero pages with `:has()` |
| Hero grid | ✅ | `4rem` (64px, graph paper) → `clamp(7rem, 10vw, 14rem)`. nextjs.org spaces its rules ~500px |
| Hero legibility | ✅ | "Beam looks like it's over the text" — z-order was already correct (`elementsFromPoint` → `H1` first). Perception, not a bug. Fixed with a `--background`-derived scrim; paint order `grid → scrim → aurora` keeps the glow |
| Refresh animation | ✅ | Lines **draw** in on load — `scaleY`/`scaleX` from top/left, 180ms stagger, 2.1s. The first attempt only *faded* (invisible on a 1px line) and the scrim shipped in the same change was dimming it. Verified on a real load: caught at `scaleY(0)`, `state: running` |
| Hero motion | ✅ | Drift was running all along but **invisible**: `--border` is 1.32:1, so the lines were. New `--hero-line` token + a beam masked TO the grid (`mask-composite: add`) that lights the lines as it passes. **Zero JS** — 0 framer-motion refs in the homepage HTML |
| Missing i18n key | ✅ | `JwtDecoderPage.InputPanel.clear` added to both locales — the dev overlay's "1 Issue". Build `MISSING_MESSAGE` **2 → 0** |
| Reduced motion | ✅ | The only `prefers-reduced-motion` block on the site belonged to **Sonner**; zero of our own animations were guarded. Now gated, verified in compiled CSS |
| Design tokens | ✅ | **All 5 phases shipped.** 3-layer, hue 217°, 32/32 contrast PASS, ratchet live. **5,401 → 2,600** hits · `dark:` 1,967 → **570** · tokens 170 → **1,658**. Of what's left, 629 = parked tools, 195 = colour *data* |
| Tests in `src/` | ⚠️ | **79** across 5 files — suite 207 → **286**. `src/` had zero. Found **3 real bugs**: `rgbToHex` emitting invalid CSS, `truncateText` exceeding its own limit, and the password generator on `Math.random()` |
| Book landing pages | ✅ | `/books/<id>` ×3 rewritten. Was a `list-disc` bullet list of **the same links the sidebar already showed**, plus "pick a topic from the sidebar" — zero information of its own. The right rail was **two dead `href="#"` links** (headings had no `id`). Card grid uses **container queries**: at a fixed 1024px viewport, collapsing the sidebar takes the column 344px → **632px** and the layout follows (1 col → 2 × 308px) — a viewport breakpoint cannot see that. **17b:** owner rejected the first cards — the bottom `border-t` drew a rule under one-word titles; cards now match the homepage order exactly and their third line previews the chapter's own first 3 topics |
| Reader shell alignment | ✅ | Owner: *"chapdagi sidebar header bilan teng emas"* — correct, and measured. Header logo at **x=64**, sidebar rows were at **80** and their text at **92** (a layout `pl-4` stacked on each row's `pl-3`). Now rows at **64**, flush with the logo AND the footer's first link. Both rails inset the same 12px; right rail's right edge = **1536** = the header's |
| Sticky rails | ✅ | `TutorialLayout` hardcoded `top-[3.5rem]` (56px) while the header measures **65px** — both rails sat **9px underneath the bar**. Now `top-(--header-height)`; verified on a 5,664px chapter at scrollY 1500: `asideTop` = `railTop` = **64**, flush against the border |
| Reading page payload | ✅ | **Barrel imports were the whole story.** Chapter JS **383 → 340 KB gz**, client modules in the route manifest **30 → 16**. `CodeBlock` imported `CopyButton` from `@/components/shared`; all 16 `components/ui/*` shims re-exported the `@webiston/ui` ROOT barrel; and the last leak was a **constants** file (`ui-constants.ts` → `@webiston/ui`) reached via `Footer` on every page. lucide's chunk **111 → 15 KB** once tree-shaking could see through it. Also: `packages/ui`'s `"./composites/*"` export mapped to files that never existed |
| FlexSearch eager load | ✅ | **74 KB gz on all 269 routes.** `Search.tsx` statically imported the engine module, which imports the library AND runs `new SearchEngine()` at module scope. New `lib/search/load.ts` (memoised `import()`, no static import). Verified: `flexsearch` in **0** eager chunks, search still returns 15 hits |
| ToC anchor scrolling | ✅ | Clicks landed **165px off**. The handler used `element.offsetTop`, which is relative to the nearest POSITIONED ancestor — `TutorialLayout`'s root is `relative`, so measured `offsetTop` 522 vs true 587, then `-100` on top. Headings already had `scroll-margin-top: 80px`; deleting the handler lets native anchors do it right. Verified `scrollY` 1685 = expected, clears the header by 15px |
| Book figures | ✅ | **Not in the bundle** — 0 base64 rasters in any chunk; `.next/static/media` is fonts only. `public/` = **26 MB / 106 files**, served per-request, only on the page that uses them. Figures now show a `bg-muted` + shimmer skeleton in the already-reserved box instead of an empty hole (one chapter pulls **1,549 KB** of PNG). Real blur LQIP needs `sharp` + a build step — `placeholder="blur"` **throws** without `blurDataURL` for a string src (verified in Next's source) |
| ToC rail indicator | ✅ | Three attempts. A 2px marker **cannot** be centred on a 1px `border-l` track — that is why it looked like it hung off the line. Track and marker are now two bars with identical geometry (`left-0 w-0.5 rounded-full`), concentric by construction (both `left: 1292`, `width: 2`). Hovering the active row used to **grey out its own marker** (`hover:border-*` beats `border-primary` — different variants, `tailwind-merge` can't dedupe). One bar now animates `top`/`height`: verified on a 2-line heading, `top: 276 / height: 52` against a 52px row, 0px off top and bottom |
| ToC follows the reader | ✅ | 27 headings vs a `max-h-[calc(100vh-8rem)]` box meant the highlight sat below the panel's fold. `keepRowVisible()` scrolls **only the rail's own box**, only when the row has left it — not `scrollIntoView()`, which walks every ancestor and would drag the page. Verified: computed target **317** = the rail's exact max scroll |
| 404 / error pages | ✅ | **The site had no 404 at all.** Every unmatched URL — `/x`, `/books/unknown`, `/books/<b>/unknown`, `/en/x`, `/tools/x` — served Next's built-in "This page could not be found.", no chrome, no way back (verified on the production build). The three hand-written files under `books/` **never ran**: `dynamicParams = false` rejects unknown params at the ROUTING layer, so a segment `not-found.tsx` only fires when `notFound()` is called during a render that happens — which for a prerendered corpus it never is. New branded `app/not-found.tsx` (+ `noindex`, verified in served HTML) and `app/global-error.tsx` (inline-styled — the stylesheet lives in the layout that failed). Prerendered **269 → 270** |
| Contextual 404s | ✅ | Owner: a mistyped chapter should not eject you from the book. Correct, and Next supports it — `not-found.js` renders INSIDE its layouts. `dynamicParams` `false` → **`true`** unblocks it (costs no prerendering: **228** book HTML unchanged, route still `●`). Now a ladder: bad chapter → book shell kept (sidebar 7 items, breadcrumb, header, footer — verified in the DOM) · bad book → header+footer + the three real books · anything else → global. Split decided in the layout, whose `getTutorialInfo` guard also bounds the render surface |
| 404 metadata | ✅ | `generateMetadata` title-cased the URL, shipping `<title>ModelingXXX | AI Engineering…</title>` + canonical + OG image for a 404. Gone. Honest scope: Next discards page metadata once it 404s, so the served title is the neutral site default, not a custom one; `noindex` is auto-injected and verified present |
| 404 centring | ✅ | Owner reported it twice and was right — the description sat **64px** left, exactly `(576 − 448) / 2`, an auto margin not resolving. Fixed structurally with `flex flex-col items-center` so the parent owns alignment. Measured: six children, all text centres at **800** on a 1600px viewport, **spread 0px** |
| `dangerouslySetInnerHTML` | ✅ | Audited all ~70. **~65 are JSON-LD from hardcoded consts** — no injection path; the `<` → `\u003c` hardening belongs in the tools pass (60 of them are tool pages). **1 is the search snippet** — the only place a `content/**` string becomes markup — now escapes text BEFORE inserting `<mark>`. Measured: 1,078 docs, **0** with script/img/iframe/handler; `<script>` in `content/` is all inside code fences the indexer strips (3 → 0). **No DOMPurify needed** — nothing renders third-party or user-submitted HTML |
| Token baseline | ✅ | Re-frozen **2,605 → 2,486**: this session's −123 locked in, +4 for `global-error.tsx`, which cannot use tokens by definition (`tokens.css` is imported by the layout whose failure renders it). Values named in `FALLBACK_PALETTE` per the gate's own instruction |
| Loading states | ✅ | No `loading.tsx` anywhere, and none needed — every route is prerendered so there is no server wait, and client navigation is covered by `NextTopLoader`. `forbidden`/`unauthorized` correctly absent (no auth) |
| Sidebar collapse | ✅ | Button aligned to nothing when collapsed (`left-[calc(100%-0.5rem)] translate-x-4` = 8px into the gutter, then 16px back). Now `-left-2.5` — half the 40px control minus its 20px icon — so the **icon** lands on the content edge: measured **64 = 64** vs the logo. Animation `transition-all 500ms` → `transition-[width,border-color] 300ms` |
| Prose reflow on collapse | ✅ | Root cause was not duration: the column genuinely grew **864 → 1,152px**, so every paragraph re-wrapped on every frame, plus a `translate-x-4` + `pl-12→pl-8` + `max-w` swap on a separate 500ms transform. New `--reading-measure: 54rem` = exactly the sidebar-open width, so the extra space becomes margin. Measured across a collapse: paragraph **816×168 → 816×168**, identical, aside 288 → 0. Better typography too — 1,152px is ~150 chars/line |
| Header chrome | ✅ | Top loader was `#3b82f6` (Tailwind `blue-500`), the one thing shown on **every navigation** painted in someone else's blue → `var(--primary)`. Theme icon was wrong pre-mount (`useTheme()` is `undefined` on the server → Moon always rendered → visible flip on hydration in light mode) → both icons in the DOM, CSS picks off `.dark`. **framer-motion gone from the header**: chapter JS **340 → 299 KB gz** |
| Sidebar collapse | ✅ | **Removed, owner approved.** Once `--reading-measure` capped the column the toggle bought nothing — the prose could not widen, so it only hid navigation. No major docs site ships one on desktop |
| Reader shell → server | ✅ | `TutorialLayout` is now a **Server Component**. Two things held it client: the collapse state, and a `useEffect` hydrating the nav store that was **duplicate** — `NavigationStoreInitializer` already does it as an immediate sibling with the same arguments. Client modules on the chapter route **16 → 15** |
| Theme switch animation | ✅ | Instant was **unfixable in CSS**: `disableTransitionOnChange` injects `* { transition: none !important }` during the swap — it killed 18c's rotate/scale AND the framer-motion version before it, so that dependency animated nothing. The flag is right (1,600 token-driven elements would smear at once). Answer: animate **one** thing — `document.startViewTransition()`. First shipped as a `clip-path` circle from the button; owner called it gaudy and was right, so it is now the browser's plain cross-fade at **180ms**. Verified: `circularWipeStillInCSS: false`, `crossFadeDuration: 0.18s`. Falls back to instant on Firefox / reduced-motion |
| ⚠️ Second retraction | ✅ | I recorded that the toggle's first click "did nothing visible" under `enableSystem`. Checked: with `defaultTheme="dark"` and empty storage next-themes resolves `theme` to **"dark"**, not `"system"`, and our UI has no System option — the branch is unreachable. `resolvedTheme` is still correct for a binary toggle but fixed no observable bug. Recorded in the component |
| ⚠️ A finding I retracted | ✅ | I reported the ToC coming up **empty after client-side navigation**. It does not. Cause: the `output: standalone` server **404s every client chunk** (`.next/static` is not copied in — documented, on us), plus a probe matching `"Ushbu sahifada"` against an `uppercase` element. Disproved by rebuilding without the `key` and re-testing on `next start`. The `key` is kept on honest grounds (`cacheComponents` + `<Activity>` would break the mount-only assumption), not as a bug fix |
| Rendering model answered | ✅ | **0 JS is impossible in App Router** (React runtime + RSC payload + router always ship) — Astro is the only 0-JS answer and that's a rewrite. These pages are **SSG, not SSR**, which is correct for a fixed corpus — do not "add SSR". RSC shape was already right; the defect was leakage across the boundary. See `reference/architecture.md § 5b` |
| `pnpm tokens` blind spot | ⚠️ | `PALETTE_RE` has no `black`/`white`, so `hover:text-black dark:hover:text-white` is **invisible to the ratchet**. **124** such hits repo-wide. Widening the regex moves the ratchet for everything — needs a decision |
| CI | ✅ | `.github/workflows/ci.yml` — all **10** gates, one job, corepack-pinned pnpm. First run will be red on `i18n` (the 8 dead keys) |
| Engine: Uzbek orthography | ✅ | **307 tests passed while `ishchi` came out as `ищи`.** Every case in the old suite was a synthetic fragment ("shch", "ShH"), never a word. Fixed and covered by a real corpus: `sh`+`ch` boundary (ishchi → **ишчи**, 4/4 occurrences in the repo's own Uzbek prose were this, 0 were Russian щ) · tutuq belgisi after a consonant (san'at → **санъат**, was саньат) · the `-tsiya` family (informatsiya → **информация**, was информатсия) · `ц` positional (функция → **funksiya**, was funktsiya) · soft sign in loanwords (фильм → **film**, was fil'm, and mid-word it round-tripped to филъм) |
| Engine: protection layer | ✅ | Measured **10 of 244** everyday Uzbek words and **12 of 66** common loanwords came back still in Latin — `buni`, `bunga`, `bundan`, `o'sha`, `tan`, `tanga`, `sin`, `test`, `format`, `virus`. Three causes: `\b` splits `o'sha` because JS treats the apostrophe as a separator, suffix expansion turns 3-letter entries into common words, and absorbed loanwords were on the list. Now **0 of 244** and **1 of 66** |
| Engine: robustness | ✅ | ReDoS: 273 KB of prose with unclosed `<div` took **6,605 ms → 34 ms** (`[^>]*` scanned to end-of-input per opener). Placeholder forgery: `React \0 0 \0 salom` returned **"React React salom"** — text could impersonate a placeholder and get another span substituted into it |
| Engine: direction detection | ✅ | One link made a Cyrillic article count as Latin (`Батафсил: https://gazeta.uz/…` → 8 Cyrillic vs 34 Latin). Detection now votes on MASKED text, so URLs, emails and code — which are never converted — do not choose the direction. Also collapsed two disagreeing detectors into one |
| Shared conversion policy | ✅ | `resolveDirection` / `convert` / `convertWithPreference` / `oppositeDirection` in the package. Four surfaces had four answers: the web tool only re-detected when the length changed by **>5 characters** (typing Cyrillic never switched; deleting a paragraph silently overrode a manual choice), the popup used a 3-state preference, the popover discarded the user's choice on every keystroke, and swap meant three different things |
| Extension: dead context menu | ✅ | `background.ts` sent `REPLACE_SELECTION`; `content.ts` listened only for `CONVERT_SELECTION`. **All three right-click entries computed a conversion and threw it away** — since the day they shipped. Now handled: writes into the field or contenteditable, falls back to the clipboard |
| Extension: "Almashtirish" | ✅ | The Replace button, pencil icon and all, called `clipboard.writeText` and closed — identical to Copy. It now replaces via `setRangeText` / Range surgery, and the theme toggle no longer needs two clicks on a light-mode machine |
| Tool: data loss | ✅ | "Hammasini yuklash" wrote **only the selected chunk** and named the file `_full`; every chunk downloaded under the SAME name because `_part1` was eaten by the extension-stripping regex. Chunking removed entirely — the engine does 50,000 chars in **9.6 ms** and 1 MB in 148 ms, so it was machinery for a problem that does not exist. The 200 MB limit (also published to Google) is now a tested 10 MB |
| Tool: client boundary | ✅ | `page.tsx` imported `@/modules/tools`, whose barrel re-exports all 21 tool modules, every one `'use client'`. Measured: **92 → 50** client modules, **22 → 1** tool modules, **664 → 358 KB gz** of JS. HTML grew 24.5 → 28.7 KB gz because the alphabet table and FAQ are now server-rendered. **The other 16 tool routes still import the barrel** |
| Tool: honesty | ✅ | JSON-LD advertised **99.9% accuracy** (while the engine failed on `ishchi`), a **200 MB** limit no browser can honour, and a **PDF export that does not exist**. The six FAQ answers were emitted as `FAQPage` markup and rendered nowhere — a guidelines violation on the top-traffic URL. FAQ is now visible and reads the same i18n keys the schema does. `<meta keywords>` 144 → 15 entries |
| Tool: UX | ✅ | Direction is **Avto / → Кирилл / → Lotin**, matching the extension. Drop a file anywhere on the page (the handlers existed, wired only to a 296-line modal that closed itself after 800 ms). ⌘/Ctrl+Enter copies, Esc clears — there were **zero** key handlers before. Empty panel offers paste + sample, measured above the fold at y=474 (they were at y=878, below it). Mobile: panel min-height 400 → 200 and the tool header 36px → 24px, so the input is on the first screen |
| Tool: dead code | ✅ | Owner approved. `utils/detect-script.ts` (115 lines, 0 importers, and it disagreed with the engine) · `FileUploadZone.tsx` (200 lines, never rendered) · `downloadAllChunks()` · the two Russian samples with no UI path · 16 dead i18n keys |

**Gate (real exit codes, 2026-07-30):** `check 0` · `typecheck 0` · `lint 0` ·
`test 0` · `tokens 0` · `contrast 0 (36 pairs)` · `build 0` — **269 prerendered
HTML files, homepage still `●` SSG**. **`i18n 1`**, unchanged: still blocked on
the 8 dead-key deletion below.

---

## In progress

- `[x]` **SEO Phases 1–2 shipped.** Fabricated `aggregateRating` + invented
  reviews deleted from 18 files; canonical/hreflang made locale-correct via a new
  `src/lib/seo.ts` (`withLocale`), so `/en` and all 229 book pages stop pointing
  at the wrong URL; `/api/og` implemented. Verified in **served HTML**, not just
  in source. One item deferred with a written reason: `<html lang>` — see the
  initiative.
  → `initiatives/seo-and-rendering.md`
- `[x]` **Design system — all 5 phases shipped.** 3-layer tokens, brand hue
  **217°** (Uzbek flag blue), `pnpm contrast` 32/32 in both schemes, and a
  `pnpm tokens` ratchet that now also rejects malformed classes and
  same-colour-on-same-colour text. **5,401 → 2,600** hardcoded hits.
  Remaining work is blocked or out of scope: 629 in the parked tools, 195 in
  `color-names.ts` (colour data, not styling).
  → `initiatives/design-system.md`
- `[x]` **Code structure Phase 1 — done.** `packages/ui` `@/` imports 3 → 0, and
  the `TOOL_COLORS`/`UI_PATTERNS` duplication is closed: one definition in
  `@webiston/ui`, re-exported by `src/constants/ui-constants.ts`.
  → `initiatives/code-structure.md`

## Initiatives

| Initiative | Status | Next phase |
| ---------- | :----: | ---------- |
| [SEO & rendering](initiatives/seo-and-rendering.md) | `[~]` | Phases 1–3 shipped → **Phase 4, payload** (209 KB logo, CLS, message bundle) |
| [Design system](initiatives/design-system.md) | `[~]` | **Phases 18–18c shipped — the reading page + reader shell.** 18c: rail marker rebuilt (concentric track+marker, one sliding bar, hover no longer greys the active row), rail now follows the reader, collapse button aligned, **`--reading-measure` kills the prose reflow on collapse**, top loader on brand colour, theme toggle's dead first click fixed, framer-motion out of the header (**340 → 299 KB gz**). 18: JS 383 → 340 via barrel imports + FlexSearch. Chapter JS **383 → 340 KB gz** (barrel imports, then FlexSearch deferred), client modules **30 → 16**, ToC anchor off-by-165px fixed, `Pagination` rewritten, tokens **−123 hits**. Rendering questions answered in `reference/architecture.md § 5b`. Next: `TutorialLayoutContent` → server (229 client lines), then the 4 decisions above. Earlier: Phases 1–17b — homepage + /tools + /books + search dialog + **book landing pages + reader-shell alignment**. 17b: owner rejected 17's cards (a `border-t` under one-word titles) → homepage card order exactly, third line previews the chapter's own topics; **sidebar rows 80px → 64px, flush with the header logo and footer**; both sticky rails were **9px under the header** (`top-[3.5rem]` vs a 65px bar) → `top-(--header-height)`. Also found a **`pnpm tokens` blind spot** (no `black`/`white` in `PALETTE_RE` — 124 invisible hits). Next: the **book-reader chrome** (`Sidebar`, `TableOfContents`, `Pagination`, `ContentMeta` — still palette classes + raw `#8D8D93`) |
| [Code structure](initiatives/code-structure.md) | `[~]` | Phase 2 — collapse the `src/components/ui/*` shim layer |
| [Tooling, CI & testing](initiatives/tooling-ci-and-testing.md) | `[~]` | **Phase 3 — first tests in `src/`** (Phase 1 CI shipped) |
| [Content & i18n](initiatives/content-and-i18n.md) | `[ ]` | Phase 1 — fix `url-encoder` key parity |

- `[x]` **`globals.css` split by concern (609 → a 21-line entry + 4 files).**
  `src/styles/tokens.css` (design system — the four token blocks were at lines
  9/309/404/472 with ~350 lines of unrelated rules between them),
  `base.css`, `background-pattern.css` (180 lines for ONE component),
  `content.css` (MDX chrome + Shiki). **Proved behaviour-preserving:** the
  compiled CSS holds the same 2,271 rules, 0 added, 0 removed — only the token
  block moved earlier, and nothing it jumped over declares a custom property.
  `scripts/contrast-check.mjs` repointed at the new path.
- `[x]` **`pnpm contrast` could pass while checking nothing.** A pair that failed
  to parse was counted as `SKIP`, printed, and ignored — so a moved or reformatted
  token block would have reported "✓ All contrast requirements pass (32 skipped)"
  and exited **0**. A skip is now a failure. Verified with an injected regression:
  exit 1 with the token block mangled, exit 0 restored.

## Shipped

- `[x]` **Dependency upgrade & tooling hardening** — all 4 workspaces to latest,
  TS 7 adopted, hooks rebuilt (push no longer hangs), 46 artifacts untracked,
  3 stale docs deleted. → `../archive/2026-07_dependency-upgrade-and-tooling.md`

---

## Next up

**Homepage — awaiting one confirmation, then it is done.** The hero copy was
rewritten and needs the owner's yes or a revert. Exact strings to restore are in
git; the new pair is in `messages/common/{uz,en}.json` under `HomePage.title` /
`HomePage.description`.

**A hero visual was considered and declined, with reasons.** The covers exist
(400×525, 53–75 KB each) but: `images.unoptimized: true` makes a hero image the
worst possible LCP placement; the same three covers already appear ~200px below
in the first section, so a split hero would duplicate them; and halving the
column width forces more line breaks in Uzbek, which is long. A centred,
text-first hero is also the correct pattern when the offer is a *collection*
rather than one product with a screenshot. Revisit only after `unoptimized` is
resolved — and then with the real book covers, not an abstract illustration.

**~~41 cards is still too many for a homepage.~~** Resolved in Phase 11 — each
book now shows 5 chapters + an explicit "all chapters" door, and Phase 17 gave
that door a real destination: `/books/<id>` is now the book's own table of
contents rather than a bullet list pointing back at the sidebar.

**Testing — continue the Trophy.** The pure layer is covered (307 tests). Next:
`useOgMetaGenerator` (601 lines) and `useMicrophoneTest` (521) — both need pure
logic pulled out of their `useCallback`s before they can be tested at all — then
the fat layer, driving a whole tool with React Testing Library as a user.

**SEO Phase 4 is nearly done — what remains is one decision, not code.**
`images.unoptimized: true` (`next.config.ts:26`) means the **25 MB of book
figures in `public/` are served raw**; one chapter ships several MB of PNG. That
now dwarfs every other payload item on the site. Owner's call — see `backlog.md`.

The heavy-dep item turned out to be a non-issue: `pdfjs-dist`, `mammoth`, `docx`
and `leaflet` are **already** lazily chunked. Measured in the browser — a tool
page loads 756 KB of JS and **none** of those chunks. `katex` and `shiki` no
longer reach the client at all.

Note the `<html lang>` trade-off is now settled by evidence: static rendering
won, `lang="uz"` stays on the 19 English pages. Revisiting it means giving the
266 prerendered routes back — see the initiative.

**New from Phase 18 — four things found on the reading page that need an explicit
yes before I touch them (deletions and dependency swaps are not drive-by work):**

1. **`ContentMeta` renders an empty bordered strip.** Every child is commented
   out, so its whole contribution to 226 chapter pages is a ~40px hairline. It
   accepts `updatedAt` and never reads it, and `TutorialContent` computes
   `frontmatter.updatedAt || new Date().toISOString()` purely to feed it. Delete
   the component + the prop + the computation, or restore the "improve this page
   on GitHub" link it used to hold?
2. **`CustomParagraph.processChildren` is dead code that runs on every
   paragraph.** It recursively `React.Children.map`s + `cloneElement`s looking
   for `element.type === "div"`, but `MDXContent`'s components map defines a
   `div` override, so the child's type is that FUNCTION, never the string.
   Verified empirically: **0** occurrences of the class it would emit across
   **79** `<p>` elements in a built chapter. The component can collapse to a
   one-line `<p>`.
3. **`next-mdx-remote` is archived** (2026-04-09, "no longer supported") and sits
   on the critical path of 226 pages. Options: stay pinned, move to
   `next-mdx-remote-client`, or follow its own README's advice and compile MDX
   with the core `@mdx-js/mdx` package at build time. Needs its own initiative.
4. **`@next/mdx` config is dead.** `withMDX` + `providerImportSource:
   "@mdx-js/react"` + `pageExtensions: md/mdx` — zero `.mdx` files under
   `src/app/`, `@mdx-js/react` imported nowhere. Removing it also drops
   `@mdx-js/loader` and `@next/mdx` from `package.json`.

**Also from Phase 18, not started:** `TutorialLayoutContent` is a **229-line
`'use client'`** component computing breadcrumbs from `useParams()` when the
layout already has `params` on the server. Moving it server-side means passing
server JSX through the client `TutorialLayout` as a prop, and keeping only the
overflow dropdown as an island. Real win, bigger change.

**New from Phase 17 — needs a decision, not code:** widening `PALETTE_RE` in
`scripts/token-guardrail.mjs` to catch `black`/`white`. It would add **124** hits
to the ratchet in one go (`HttpStatus.tsx` 15, `OgMetaGenerator/PreviewPanel.tsx`
10, `Pagination.tsx` 6, `Sidebar.tsx` 4, …). Some are legitimate — `text-white`
on a brand-coloured surface — so this is a triage job, not a sweep.

**Two decisions still blocking work:**

0. **Three unreferenced items awaiting a yes/no** —
   `src/components/mdx/CodeBlock/CodeBlockSkeleton.tsx` (orphaned by server-side
   highlighting), `const _inter = Inter(...)` in `(app)/[locale]/layout.tsx:14`
   (a second Inter download the root layout already does properly), and the 8
   keys below.
1. **8 dead `en`-only keys** in `messages/tools/url-encoder/en.json`
   (`Info.formatExample.exampleText`, `exampleEncoded`, `Info.urlStructure.*` ×6).
   Re-verified unused: `InfoSection.tsx` references neither group. This is the
   only red gate (`pnpm i18n` → 1). Deleting needs an explicit yes.
2. **The four parked `__` tools** — 629 of the 2,600 remaining hardcoded-colour
   hits sit in code that has no route.
3. **`src/styles/background-pattern.css` is now orphaned** (3,624 bytes). Its
   import is replaced by `hero.css` and the only remaining mentions are two
   comments. Deleting needs an explicit yes.
4. **Duplicate animation dependency.** `framer-motion` **and** `motion` are both
   declared at `12.43.0` — `motion` is the renamed same package. 27 imports use
   `framer-motion`; **one** uses `motion/react`
   (`packages/ui/src/primitives/typing-animation.tsx:3`). Consolidating means
   picking one and dropping the other from `package.json`.

**Found in passing, not fixed (needs its own decision):**

- **`JwtDecoderPage.InputPanel.clear` is missing from BOTH locales** — surfaced
  as `MISSING_MESSAGE` twice in the build log.
  `JwtDecoder/components/InputPanel.tsx:35` reads `t("clear") || "Clear"`, so the
  `||` hides it behind an English fallback. **The `pnpm i18n` gate cannot catch
  this**: it compares uz against en, and a key absent from both is "in parity".
  A third check — every `t("…")` call resolves in at least one bundle — would.

---

## Ground rules for this file

- One line per item. Evidence (file:line or a number) or it is not an item.
- Detail goes in `initiatives/`; shipped detail goes in `../archive/`.
- Never a bare `- [x] Done` — name what and where.
