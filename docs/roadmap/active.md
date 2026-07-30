# Webiston — Active Roadmap

> **Read at the start of every session. Update at the start and the end.**
> Thin lines only. `[ ]` not started · `[~]` in progress · `[x]` done ·
> `[!]` blocked · `[>]` deferred.
>
> **This file is a tracker, not a plan.** Multi-phase work lives in
> `initiatives/`; completed initiatives move to `../archive/`. If an entry here
> needs more than 3 lines, it belongs in an initiative file.

_Last updated: 2026-07-29 — design system shipped (5 phases); SEO integrity +
canonical correctness shipped (Phases 1–2). Branch `refactor/infrastructure`._

---

## Snapshot

| Area | State | Evidence |
| ---- | :---: | -------- |
| Dependencies | ✅ | all latest; `pnpm outdated` → 1 (`hast`, deprecated, 0 imports) |
| Build & gates | ✅ | **all 9 gates green**; hooks 0.16s / 2.39s |
| Repo hygiene | ✅ | `git ls-files -i -c` → 0 |
| Package boundaries | ✅ | `packages/ui` `@/` imports 3 → **0**; one definition, re-exported |
| Duplicated types | ✅ | `PasswordSettings` declared twice in one file · `MetaData` ×3 with one already **drifted** · `CapturedMedia` ×4 → all consolidated. TS merges identical interfaces, so no gate saw any of it |
| `pnpm check` | ✅ | **81 → 0 errors.** First time this gate has ever passed |
| i18n parity | ⚠️ | `pnpm i18n` gate added; red on 8 dead `en`-only keys pending approval |
| SEO integrity | ✅ | fabricated ratings + invented reviews **deleted** (18 files, 416 lines); repo-wide grep → 0 |
| Canonical / hreflang | ✅ | every page self-canonicals; verified in served HTML for `/`, `/en`, tools, books |
| OG share cards | ✅ | `/api/og` implemented (`next/og`) — was a 404 on all 229 book pages |
| Static rendering | ✅ | **0 → 266 routes prerendered.** 34 tool pages (17 × 2 locales) + 228 book chapters + home + index pages. Only `/api/og` stays `ƒ` — it reads `searchParams`. `cacheComponents`/PPR deliberately rejected, see initiative |
| Payload | ⚠️ | search index on dialog-open (**0** requests on page load) · logo **209 KB → 5.5 KB** · **CLS measured 0** · tool-page HTML **−43%** via scoped i18n. Left: `images.unoptimized` (**25 MB of raw book figures**) |
| Soft 404s | ✅ | `/books/**` returned 200 for non-existent chapters *and* any unknown book id; both now 404 |
| Design tokens | ✅ | **All 5 phases shipped.** 3-layer, hue 217°, 32/32 contrast PASS, ratchet live. **5,401 → 2,600** hits · `dark:` 1,967 → **570** · tokens 170 → **1,658**. Of what's left, 629 = parked tools, 195 = colour *data* |
| Tests in `src/` | ⚠️ | **79** across 5 files — suite 207 → **286**. `src/` had zero. Found **3 real bugs**: `rgbToHex` emitting invalid CSS, `truncateText` exceeding its own limit, and the password generator on `Math.random()` |
| CI | ✅ | `.github/workflows/ci.yml` — all **10** gates, one job, corepack-pinned pnpm. First run will be red on `i18n` (the 8 dead keys) |

**Gate (real exit codes, 2026-07-29):** `check 0` · `typecheck 0` · `lint 0` ·
`test 0 (207)` · `tokens 0` · `contrast 0` · `build 0` — **`i18n 1`**, blocked on
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
| [Design system](initiatives/design-system.md) | `[x]` | all phases shipped — see archive candidate |
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

**Testing — continue the Trophy.** The pure layer is covered (286 tests). Next:
the three large hooks the initiative names — `useQrGenerator` (570 lines),
`useOgMetaGenerator` (597), `useMicrophoneTest` (515) — and then the fat layer,
rendering a whole tool with React Testing Library and driving it as a user.

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

---

## Ground rules for this file

- One line per item. Evidence (file:line or a number) or it is not an item.
- Detail goes in `initiatives/`; shipped detail goes in `../archive/`.
- Never a bare `- [x] Done` — name what and where.
