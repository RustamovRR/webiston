# Webiston — Backlog

> Future work, **not started**, that does **not** belong to an initiative.
> Multi-phase work lives in `initiatives/` — this file carries one pointer line
> for each, then the standalone items.
>
> Keep this thin: an item with no file:line evidence or no measurable outcome is
> not an item — delete it.
>
> _Items marked **[unverified]** come from the 2026-07-29 audit, whose
> verification pass was cut short (25 of 97 findings verified). Confirm the
> evidence before acting on them._

---

## Initiatives (the plan lives in the linked file, not here)

| Initiative | Status | Blocked by |
| ---------- | :----: | ---------- |
| [SEO & rendering](initiatives/seo-and-rendering.md) | `[ ]` | — |
| [Design system](initiatives/design-system.md) | `[!]` | brand colour ↓ |
| [Code structure](initiatives/code-structure.md) | `[~]` | — |
| [Tooling, CI & testing](initiatives/tooling-ci-and-testing.md) | `[ ]` | — |
| [Content & i18n](initiatives/content-and-i18n.md) | `[ ]` | `/books` i18n ↓ |

---

## Needs a decision from the owner (blocking — do not guess)

- `[x]` **The brand colour — decided 2026-07-29: hue 217°**, derived from the
  Uzbek flag blue `#0099B5`. Ramp fitted to the sRGB gamut; all 32 contrast pairs
  pass WCAG AA in both schemes (`pnpm contrast`).
  → `initiatives/design-system.md`
- `[x]` **The four parked tools — DELETED 2026-08-12 on the owner's explicit
  instruction** ("shular ham kerakmas"). `__http-status`, `__keycode-info`,
  `__user-agent-analyzer`, `__website-status`: ~3,800 LOC of unrouted modules,
  their barrel exports, TOOL_COLORS entries and `Tools.*` message keys in all
  three locales. They were also the four worst files for hardcoded colour —
  removing them dropped the token-ratchet baseline by 653 hits (frozen at 449).
- `[!]` **The `/books` i18n story.** 226 chapters live at `src/app/books/`, a
  *sibling* of `(app)/[locale]/` — outside the locale segment, and the middleware
  matcher does not cover them. Uzbek-only forever, or does `/en/books` exist?
  Changes the scope of `seo-and-rendering.md` Phase 2.
- `[!]` **Image optimization.** `next.config.ts` sets `images.unoptimized: true`.
  A real win for a content site. The `output: "standalone"` complication is gone
  (removed 2026-08-07); what is left to weigh is Vercel's Hobby quota — 5K
  transformations / 300K cache reads / 100K cache writes per month. ADR-sized.
- `[x]` **Generated artifacts in git — resolved 2026-07-29 by fixing the cause,
  not by gitignoring.** `public/sitemap.xml` churned 268 insertions + 268
  deletions per build because `next-sitemap` stamps `<lastmod>` with the build
  clock. That was also an SEO defect: it told Google every page changed on every
  deploy, and an unreliable `lastmod` gets ignored wholesale. Set
  `autoLastmod: false` (omitting lastmod beats lying about it) and deduplicated
  the path list — `/` and `/tools` were emitted twice, 268 entries for 266 URLs.
  Now byte-identical across rebuilds, so the files stay tracked with zero noise
  and the deploy never risks a missing sitemap.
  → `next-sitemap.config.js`
- `[ ]` **Reintroduce a real `lastmod`** derived from each MDX file's git commit
  date. Genuinely useful for a 226-chapter site; must never come from the clock.
- `[!]` **Drop oxlint, or make it work?** It lints with 27 core rules and **no
  plugins**, and exits 0 even with 25 warnings. Biome already does format + lint
  + imports in one pass. Removal needs approval.
  → detail in `initiatives/tooling-ci-and-testing.md` Phase 2.

## Blocked on upstream

- `[>]` **Drop `experimental.useTypeScriptCli`** (`next.config.ts:18`) once Next
  supports the TypeScript 7 compiler API natively. Risk while it stands: an
  experimental flag can be renamed in any Next minor, and with no CI the break
  surfaces at deploy time. → `adr/0003`
- `[>]` **Restore `tsup --dts`** in `packages/transliteration` once tsup ships a
  TS 7-compatible dts plugin. Today it uses `tsc --emitDeclarationOnly` because
  the bundled `rollup-plugin-dts@6.1.1` targets typescript 5.7. → `adr/0003`

## Standalone items (not part of any initiative)

- `[x]` **Store submission — done.** Live on the Chrome Web Store and
  addons.mozilla.org (`src/constants/extension.ts` `EXTENSION_STORES`). All
  three former blockers shipped: native `_locales/{uz,en,ru}/messages.json`
  (parity held by `tests/locales.test.ts`), `/privacy-policy`, and the
  listing screenshots in `store-assets/`.
- `[ ]` **`host_permissions: ["<all_urls>"]` is probably removable**
  (`apps/extensions/latin-cyrillic/wxt.config.ts`). `background.ts` uses
  `contextMenus`, `tabs.query` and `tabs.sendMessage`; content-script injection
  is granted by `content_scripts.matches`, not by this. Broad host permissions
  put a submission on the extended-review track, so removing it is worth the
  test — load unpacked, exercise all four surfaces, keep it removed only if
  they all still work. `matches: ["<all_urls>"]` itself stays: converting
  selected text on any page is the product.
- `[ ]` **A CTA for the extension on `/tools/latin-cyrillic`.** The site's
  highest-traffic page is the natural distribution channel, but the link needs
  the store URL, which only exists after the first submission. Two Server
  Components, no client JS: one plain bordered row between `AlphabetTable` and
  `ConverterFaq`, plus an FAQ entry (which lands in the existing `FAQPage`
  schema for free). Store URL goes in `src/constants/`, not inline.

- `[x]` **Converter: NO hydration mismatch for a pinned switch — verified
  2026-10-22, do not "fix" it.** A review claimed the persisted
  `transliterationStore` makes the first client render differ from the
  server's. It does not: zustand 5.0.14's `useStore` passes
  `api.getInitialState()` as `useSyncExternalStore`'s server snapshot, and
  `persist` sets that to the pre-hydration defaults
  (`node_modules/zustand/esm/react.mjs:9`, `middleware.mjs:378`), so hydration
  renders the route default and the stored choice arrives in the next render.
  Checked in the browser with "Lotin" pinned (server labels "Lotin matn /
  Kirill natija", client "Kirill matn / Lotin natija"): no hydration error.
  `skipHydration` would add a step and change nothing.
- `[~]` **`/tools/ip-info` fell out of Google on 2026-10-03 — fix shipped
  to dev 2026-10-26, recovery unconfirmed.** 982 impressions (20.09–02.10) →
  2 (04.10–16.10); it ranked 1.2 for "ip manzil aniqlash". Still "Submitted
  and indexed" (URL Inspection, crawl 2026-10-21), no deploy near the date,
  rest of the site +20%. The drop sits inside Google's September 2026 spam
  update (24.09–08.10). Only page-side signal found: the server HTML said
  "xizmat bermadi" 17× per locale — every placeholder row of
  `DetailGroupCard` before the first answer — now a dash. Recheck daily
  impressions ~2 weeks after the deploy reaches main; if still ~0, the cause
  is not on the page.
- `[~]` **`/tools/latin-cyrillic` sits at ~8 for the head terms — it is a
  ceiling, not a bug.** Weekly position 7.8–8.6 for 13 straight weeks
  (GSC, 07-27 → 10-24). The SERP for "lotin kiril" (2026-10-26): an AI
  Overview that already CITES Webiston, then lotin.uz, kiril-lotin.uz ×2,
  two "Word makros" videos, uznlp.uz, uzlotin.uz — exact-match domains with
  years of history. On-page work cannot outrank that; it can win the intents
  where we already sit at 4–6. Shipped 2026-10-26: "Word" (not "DOCX") in
  all three descriptions, the file FAQ asks about Word/PDF (lands in the
  FAQPage schema), the uz extension H2 says "dasturi". **Baseline, 28d to
  10-24:** Word/file queries 96 clicks / 2,394 impr / 4.0% CTR / pos 6.3;
  "dastur" queries 69 / 801 / 8.6% / 6.1. Re-measure ~2026-11-21 with
  `pnpm gsc 28 --find "word|ворд|fayl|файл|pdf|dastur|дастур"`.
- `[~]` **Session replay — Yandex Webvisor + Microsoft Clarity, 2026-10-26.**
  Owner's decision: see the Latin-Cyrillic converter's TEXT (to find wrong
  conversions), keep everything else private. Mechanics: Metrica
  `webvisor:true` with "Record all fields" OFF (`wv_forms: 0`) — only the
  converter's textarea is `ym-record-keys` (`DualTextPanel replayVisible`).
  Clarity (`NEXT_PUBLIC_CLARITY_ID`) masks every field by itself and cannot
  show textarea contents at all. Results rendered as text are masked for both
  (`data-clarity-mask` + `ym-hide-content`) in `DualTextPanel` by default and
  via `PrivateContent`/attributes in 21 files — held by
  `PrivateContent.test.ts`. A whole-island mask was tried first and rolled
  back the same day: it hid every button and label. Converter copy and the
  privacy policy now disclose the recording. **Unverified:** whether either
  recorder skips `<img src>`, SVG paths (QR) and canvas inside a masked
  element; whether URLs with drafts (OG generator `?…`, CodeSnapshot `#…`)
  are recorded — check one real recording of each after deploy.
- `[ ]` **Recheck "yangi alifbo klaviatura" demand ~2026-10-30** —
  19 impr at 21% CTR in the first week. If it grows, add one-tap ş/ç/ğ/ö
  buttons to the converter. `pnpm gsc 7 --find "klaviatura|клавиатура"`.
- `[~]` **Extension 1.1.0: new-alphabet target — code, store copy and
  `/extension` done 2026-10-26; store upload pending (owner).** The switch
  policy (`ScriptPreference`, `resolveTarget`, `swapTarget`,
  `EXPECTED_SOURCE`, `convertToScript`) lives in
  `@webiston/transliteration/src/converter.ts`; the web tool, the popup and
  the panel import it. The popup stores its choice; the panel and the
  shortcut open on it via `openingPreference`, which falls back to auto when
  the selection is already in the stored alphabet (no selection is ever
  handed back unchanged — `tests/script-preference.test.ts`). Measured at
  380px: popup switch uz 285 / ru 288 of 340px; panel footer with Replace on
  one row in all three locales (tightest uz, 9px). Store: new `extName`
  (≤45, Edge's cap — guarded in `tests/locales.test.ts`), `extDescription`,
  detailed descriptions in `store/listing.md`, screenshots re-shot. Site:
  `/extension` copy, demo column, feature + FAQ, landing images re-shot;
  `ExtensionCallout` names the new alphabet and now renders on
  `/tools/yangi-alifbo` too. **Deploy the site AFTER the store approves
  1.1.0** — until then those pages promise a feature the installed version
  lacks. `/extension` itself was "URL is unknown to Google" on 2026-10-26
  (sitemap last read 10-22): request indexing after deploy.
  Follow-up (needs approval): `resolveDirection`, `convertWithPreference`,
  `oppositeDirection` and `DirectionPreference` have no caller left.
- `[x]` **Namespace coverage is now gated — 2026-07-30.** `pnpm i18n` grew a
  second check: every namespace a Client Component calls must be provided by some
  provider. It would have caught the `/tools` regression that survived a
  34-URL status-code sweep. Verified with an injected regression (removed two
  namespaces → exit 1 naming both; restored → clean). Current coverage 23/23.
  **Remaining limitation:** it proves a namespace is provided *somewhere*, not
  that it is provided on the *right route*. Closing that needs the
  route → component graph or a headless-browser pass per route.

- `[ ]` **Root `README.md` is unedited create-next-app boilerplate** — offers
  `npm`/`yarn`/`bun` against a pnpm-only repo and points at `localhost:3000`
  when `package.json:11` uses port 9999. **[unverified]**
- `[ ]` **Merge `refactor` into the trunk.** `CLAUDE.md`, `AGENTS.md` and `docs/`
  exist **only on `refactor`** — they are absent from `dev`, `main` and `stage`.
  Until this merges, none of these rules apply to any other branch.
  Verified clean: `git merge-tree origin/main refactor` → 0 conflicts.
- `[ ]` **Finish the audit verification.** 97 findings, 25 verified. The
  workflow can be resumed rather than re-run — run ID `wf_16f07f9f-996`.

---

## Decisions on record (do not re-litigate — read `adr/` first)

| ADR | Decision |
| --- | -------- |
| [0001](../adr/0001-hybrid-monorepo-src-at-root.md) | `src/` stays at the repo root, not `apps/web/` |
| [0002](../adr/0002-design-tokens-single-source.md) | One stylesheet, one token block (`globals.css`) |
| [0003](../adr/0003-typescript-7-with-experimental-next-cli.md) | TypeScript 7 + Next's experimental TS CLI |
| [0004](../adr/0004-no-feature-sliced-design.md) | **No FSD** — keep and normalise `modules/{Feature}/` |
