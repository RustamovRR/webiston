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

- `[ ]` **Chrome Web Store submission — three blockers, in this order.**
  The extension builds, typechecks and now matches the site's design system;
  what is left is the store, not the code.
  1. **`_locales/{uz,en,ru}/messages.json`.** Every string in the popup, the
     popover and the context menu is a hardcoded Uzbek literal today (~25 of
     them). Use Chrome's NATIVE i18n (`browser.i18n.getMessage`, `default_locale`
     in the manifest, `__MSG_name__` placeholders) rather than next-intl — it is
     the only mechanism that also localises the STORE LISTING name and
     description per viewer, which is the larger half of the benefit. Cannot
     share `messages/**` with the site: different format, and `apps/*` may not
     import `src/`.
  2. **A privacy-policy page.** `/maxfiylik` does not exist; the store requires
     a URL. The honest content is short — `@webiston/transliteration` is pure TS
     with zero network calls, and `storage` holds only theme + the quick-convert
     toggle — but it has to be written and shipped in all three locales.
  3. **Listing assets.** Icon 128 exists; **1–5 screenshots at 1280×800 or
     640×400 do not**, and they must be captured from a real browser.
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
