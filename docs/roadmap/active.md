# Webiston — Active Roadmap

> **Read at the start of every session. Update at the start and the end.**
> Thin lines only. `[ ]` not started · `[~]` in progress · `[x]` done ·
> `[!]` blocked · `[>]` deferred.
>
> **This file is a tracker, not a plan.** Multi-phase work lives in
> `initiatives/`; completed initiatives move to `../archive/`. If an entry here
> needs more than 3 lines, it belongs in an initiative file.

_Last updated: 2026-07-30 — design-system sweep now covers every shared surface
(Phases 6–17): homepage, /tools, /books, the search dialog, and the three book
landing pages. Phase 17 replaced the last `list-disc` documentation page and
found a hole in the `pnpm tokens` ratchet. Branch `refactor/infrastructure`._

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
| `pnpm tokens` blind spot | ⚠️ | `PALETTE_RE` has no `black`/`white`, so `hover:text-black dark:hover:text-white` is **invisible to the ratchet**. **124** such hits repo-wide. Widening the regex moves the ratchet for everything — needs a decision |
| CI | ✅ | `.github/workflows/ci.yml` — all **10** gates, one job, corepack-pinned pnpm. First run will be red on `i18n` (the 8 dead keys) |

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
| [Design system](initiatives/design-system.md) | `[~]` | Phases 1–17b shipped — homepage + /tools + /books + search dialog + **book landing pages + reader-shell alignment**. 17b: owner rejected 17's cards (a `border-t` under one-word titles) → homepage card order exactly, third line previews the chapter's own topics; **sidebar rows 80px → 64px, flush with the header logo and footer**; both sticky rails were **9px under the header** (`top-[3.5rem]` vs a 65px bar) → `top-(--header-height)`. Also found a **`pnpm tokens` blind spot** (no `black`/`white` in `PALETTE_RE` — 124 invisible hits). Next: the **book-reader chrome** (`Sidebar`, `TableOfContents`, `Pagination`, `ContentMeta` — still palette classes + raw `#8D8D93`) |
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
