# Webiston — Active Roadmap

> **Read at the start of every session. Update at the start and the end.**
> Thin lines only. `[ ]` not started · `[~]` in progress · `[x]` done ·
> `[!]` blocked · `[>]` deferred. Done items name **what + where**.
> Shipped detail goes to `../archive/`, not here.

_Last updated: 2026-07-29 — full 7-dimension audit + dependency upgrade.
Measured on branch `refactor` @ `7c26347` + working tree. Every number below was
measured, not estimated._

---

## Snapshot

| Area                | State | Evidence                                                        |
| ------------------- | :---: | --------------------------------------------------------------- |
| Dependencies        |  ✅   | all on latest, `pnpm outdated` clean; gate green (below)          |
| Repo hygiene        |  ✅   | 46 tracked-but-ignored artifacts untracked; `git ls-files -i -c` = 0 |
| SEO integrity       |  ❌   | 18 files emit **fabricated** `aggregateRating` + fake reviews     |
| Canonical / hreflang|  ❌   | 229 book pages + every `/en` page canonical to the wrong URL      |
| Static rendering    |  ❌   | **0 routes prerendered** — no `setRequestLocale` anywhere         |
| Mobile UX           |  ❌   | hamburger opens an empty overlay on every non-book page           |
| Payload             |  ❌   | 1.05 MB search index + 209 KB logo eager on every page            |
| Design tokens       |  ❌   | 4,987 palette hits vs 170 semantic (3.3%); 1,967 `dark:`          |
| Package boundaries  |  ❌   | `packages/ui` imports `@/` in 3 files — hard-rule violation       |
| Server/client split |  ⚠️   | 101 / 208 `.tsx` are `'use client'` (49%)                         |
| Tests               |  ❌   | 6 files, all `packages/transliteration`; `src/` = 0               |
| CI                  |  ❌   | none; Lefthook pre-push runs only typecheck+test, bypassable      |

**Gate today** (real exit codes, 2026-07-29):
`packages:build 0` · `typecheck 0` · `lint 0` · `test 0 (207)` · `build 0` ·
`ext:build 0` · **`check 1`** ← 81 errors, pre-existing (identical on Biome 2.4.15).

---

## Done this session

- [x] **Upgraded every dependency to latest** — root, `packages/ui`,
      `packages/transliteration`, `apps/extensions/latin-cyrillic`.
      Next 16.1.6→16.2.12, React 19.2.4→19.2.8, TS 5.9→7.0.2, Biome 2.4→2.5.6,
      oxlint 1.50→1.76, Vitest 4.0→4.1.10, Tailwind 4.2→4.3.3, Vite 7→8,
      WXT 0.20→0.21, lucide-react 0.575→1.27, pdfjs-dist 5→6, katex 0.16→0.18.
      Closes the old "lockfile pins CVE-vulnerable next/react" item.
- [x] **Fixed the one type error the upgrade surfaced** — `MediaTrackSettings.echoCancellation`
      is now `string | boolean` (spec added mode strings) —
      `src/modules/tools/MicrophoneTest/hooks/useMicrophoneTest.ts:225`.
- [x] **Kept TS 7 working with Next 16** — Next cannot use the TS 7 compiler API;
      added `experimental.useTypeScriptCli` — `next.config.ts:18`. *(owner's call;
      revisit when Next supports TS 7 natively — see backlog)*
- [x] **Fixed `packages:build` under TS 7** — `tsup --dts` crashes because its
      bundled `rollup-plugin-dts@6.1.1` targets typescript 5.7. Replaced with
      `tsc --emitDeclarationOnly` — `packages/transliteration/package.json:19`.
      This also unblocked `ext:build`, which was failing as a cascade.
- [x] **Fixed the dead `types` condition** in the transliteration export map —
      it came after `import`/`require` so it never resolved —
      `packages/transliteration/package.json:8`.
- [x] **Untracked 46 build/dep artifacts committed in `a691ca2`** — 42 pnpm
      symlinks under `*/node_modules/`, 4 files under `packages/transliteration/dist/`.
      Files kept on disk; `git ls-files -i -c --exclude-standard` now returns 0.
- [x] **Fixed the `.vscode` ignore rule** — `.vscode/` → `.vscode/*` with
      `!settings.json` / `!extensions.json`, so the shared Biome formatter config
      is legitimately tracked instead of tracked-but-ignored — `.gitignore:89`.

---

## P0 — Correctness & integrity (ship before any refactor)

- [ ] **Delete the fabricated `aggregateRating` + fake reviews.** 18 files claim
      invented ratings (`ratingValue: "4.8"`, `ratingCount: "15000"`) and
      hand-written reviews with invented author names —
      `src/app/(app)/[locale]/tools/page.tsx:227`,
      `src/modules/tools/LatinCyrillic/seo/schemas.ts:87-108`, +16 more.
      This is a Google structured-data policy violation and a manual-action risk.
      Keep `SoftwareApplication`/`FAQPage`/`HowTo` — those describe real features.
- [ ] **Fix the mobile menu.** `src/components/shared/Header/MobileMenu.tsx:46`
      renders content only when `isOpen && tutorialId`, so on the home page,
      `/tools` and all 17 tool pages the hamburger opens an **empty overlay** —
      and `Header.tsx:84` hides search/theme/language behind `md:`, so mobile
      users have no navigation at all. Live production bug.
- [ ] **Give book chapters their own canonical.** `src/app/layout.tsx:200-207`
      sets a site-wide `canonical: "https://webiston.uz"`; `src/app/books/[...slug]/page.tsx`
      never overrides it, so 229 chapter pages tell Google they are duplicates of `/`.
- [ ] **Stop canonicalising `/en` away.** All 17 routed tool pages export a static
      `metadata` with a hardcoded Uzbek-URL canonical
      (`.../tools/json-formatter/page.tsx:95`), so every English page points at its
      Uzbek twin. Convert to `generateMetadata({ params })` and build the canonical
      from the locale.
- [ ] **`/api/og` does not exist.** `src/app/books/[...slug]/page.tsx:52,99,128`
      point every OpenGraph image at `/api/og?...`; the only API route is
      `src/app/api/search/`. Every book share card is a 404. Implement it with
      `ImageResponse` from `next/og`, or point at a static image.
- [ ] **Replace `Math.random()` in the security tools.** 12 hits in
      `usePasswordGenerator.ts`, 3 in `useUuidGenerator.ts`. A password generator
      seeded from `Math.random()` is predictable — use `crypto.getRandomValues`
      and `crypto.randomUUID`.
- [ ] **`<html lang>` follows the locale.** `src/app/layout.tsx:394` hardcodes
      `"uz"` while `:200-206` advertises an `en` alternate. The root layout sits
      above `[locale]`, so read the locale from the request.
- [ ] **Restore the package boundary.** `packages/ui` imports app code via `@/` in
      3 files — `primitives/dialog.tsx:7`, `primitives/mode-switch.tsx:2`,
      `primitives/gradient-tabs.tsx:9`. CLAUDE.md calls this a never-break rule and
      `tsc -p packages/ui` fails on it today.

## P1 — Performance (all measured, all on the critical path)

- [ ] **Turn on static rendering.** **Zero** routes are prerendered — every route
      in the build output is `ƒ` (server-rendered on demand). Cause: next-intl
      requires `setRequestLocale(locale)` in every locale layout/page to allow
      static generation, and there are **0 occurrences** in `src/`. This is the
      single biggest win available on a 226-chapter content site.
- [ ] **Stop shipping the 1.05 MB search index to every visitor.**
      `public/search-index.json` is 1,097,642 bytes and
      `src/components/shared/Search/Search.tsx:67` initialises it in a mount
      effect on every page, including pages that never open search. Move it into
      the dialog-open path.
- [ ] **Highlight code on the server.** `src/components/mdx/CodeBlock/CodeBlock.tsx:1`
      is `'use client'` and highlights in the browser, so server HTML ships grey
      skeletons instead of code for every code block — bad for both LCP and
      indexability. `MDXContent` is already an async Server Component.
- [ ] **Pass the real fence language to Shiki.** `CodeBlock.tsx:29` hardcodes
      `"ts"` for **every** code block, so JS/JSON/bash/CSS blocks are all
      mis-highlighted.
- [ ] **Fix the header logo.** `public/logo.png` is 209 KB at 1120×1120 and is
      rendered at 50×50 on every page — `Logo.tsx:7`. Ship a 100×100 WebP.
- [ ] **Reserve image dimensions.** `src/components/mdx/ImageViewer/ImageViewer.tsx:33`
      passes `width={0} height={0}`, guaranteeing CLS on every book figure.
- [ ] **Scope the message bundle.** `src/app/(app)/[locale]/layout.tsx:39` calls
      `getMessages()` with no namespace filter and passes the whole object to the
      client provider — all 19 tool namespaces on every localised page.
- [ ] **Dynamic-import the heavy deps.** `pdfjs-dist`, `mammoth`, `docx`, `katex`,
      `shiki`, `leaflet`, `flexsearch` must not sit in a shared chunk. Note: the
      Next 16 Turbopack build no longer prints per-route sizes — measure with
      `@next/bundle-analyzer` before and after.
- [ ] **Fix the double title suffix.** 37 page titles already end in `| Webiston`
      while `layout.tsx:13-16` applies a `%s | Webiston` template — they render as
      `… | Webiston | Webiston`.

## P2 — Foundation (the long refactors)

- [ ] **Design tokens, Phase A — the token block.** `--card` equals `--background`
      in light mode (`globals.css:370` vs `:372`), `--primary` has zero chroma
      (`:376`), `secondary`/`accent`/`muted` share one value, and `--ring` measures
      1.55:1 contrast (fails WCAG AA for a focus indicator). **Blocked on the brand
      colour decision** — see backlog.
- [ ] **Design tokens, Phase B — the `pnpm tokens` ratchet gate.** Per-file
      baseline, fail on increase. Without it phases C–E get undone by the next feature.
- [ ] Phase C — shared surfaces. `src/constants/ui-constants.ts:48,53,66` ship
      **dark-only** panels (`bg-zinc-900/80` with no light variant) to every tool.
- [ ] Phase D — tools, one module per commit, routed tools first.
- [ ] Phase E — book reader + MDX components.
- [ ] **Resolve the font conflict.** Inter is loaded at `layout.tsx:9` with a
      `latin`-only subset and applied at `:408`, then overridden by an
      `!important` rule at `globals.css:49` — so it is downloaded on every page
      and never rendered, and would not cover Cyrillic if it were.
- [ ] **`'use client'` audit.** 101/208. Start with the book reader and the
      components highest in the tree.
- [ ] **First tests in `src/`.** Infra already works — `vitest.config.ts:11`
      already includes `src/**/*.test.{ts,tsx}`. Start with `src/lib/utils/`
      colour conversions and the tool hooks.

## In progress

_(nothing — the dependency upgrade landed; pick a P0)_

## Next up

**P0 SEO integrity first** — the fabricated ratings are a policy risk that grows
the longer they are indexed, and the canonical bugs actively suppress 229 pages.
Then the mobile menu (a live UX bug), then P1 static rendering (the biggest
measurable perf win).

---

## Ground rules for this file

- One line per item. Evidence (file:line or a number) or it is not an item.
- Do not paste shipped-work prose here — tick the box, move detail to `archive/`.
- Do not copy feature/bug tickets in from an issue tracker; those live on their
  own branches.
