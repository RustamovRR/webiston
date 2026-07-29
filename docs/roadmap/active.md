# Webiston — Active Roadmap

> **Read at the start of every session. Update at the start and the end.**
> Thin lines only. `[ ]` not started · `[~]` in progress · `[x]` done ·
> `[!]` blocked · `[>]` deferred.
>
> **This file is a tracker, not a plan.** Multi-phase work lives in
> `initiatives/`; completed initiatives move to `../archive/`. If an entry here
> needs more than 3 lines, it belongs in an initiative file.

_Last updated: 2026-07-29 — dependency + tooling initiative shipped; roadmap
restructured into `initiatives/`. Branch `refactor`._

---

## Snapshot

| Area | State | Evidence |
| ---- | :---: | -------- |
| Dependencies | ✅ | all latest; `pnpm outdated` → 1 (`hast`, deprecated, 0 imports) |
| Build & gates | ✅ | **all 9 gates green**; hooks 0.16s / 2.39s |
| Repo hygiene | ✅ | `git ls-files -i -c` → 0 |
| Package boundaries | ✅ | `packages/ui` `@/` imports 3 → **0**; one definition, re-exported |
| `pnpm check` | ✅ | **81 → 0 errors.** First time this gate has ever passed |
| i18n parity | ⚠️ | `pnpm i18n` gate added; red on 8 dead `en`-only keys pending approval |
| SEO integrity | ❌ | 18 files emit **fabricated** ratings + invented reviews |
| Canonical / hreflang | ❌ | 229 book pages + every `/en` page canonical to the wrong URL |
| Static rendering | ❌ | **0 routes prerendered** — no `setRequestLocale` anywhere |
| Payload | ❌ | 1.05 MB search index + 209 KB logo eager on every page |
| Design tokens | 🟡 | A–D shipped (3-layer, hue 217°, 32/32 contrast PASS, ratchet live). **5,401 → 2,696** hits · `dark:` 1,967 → **619** · tokens 170 → **1,608**. Phase E (book reader/MDX) open |
| Tests in `src/` | ❌ | 0 (207 tests exist, all in `packages/transliteration`) |
| CI | ❌ | none — Lefthook only, and `--no-verify` bypasses it |

**Gate (real exit codes, 2026-07-29):** `check 0` · `typecheck 0` · `lint 0` ·
`test 0 (207)` · `tokens 0` · `contrast 0` · `packages:build 0` · `build 0` ·
`ext:build 0` — **`i18n 1`**, blocked on the 8 dead-key deletion below.

---

## In progress

- `[~]` **Design system** — Phases A–D shipped. 3-layer tokens, brand hue
  **217°**, `pnpm contrast` 32/32 both schemes, `pnpm tokens` ratchet live (and
  now also rejects malformed classes). Phase C: **45/48** shared files
  token-clean; the 3 left are documented exceptions (syntax highlighter,
  shimmer effect, theme-invariant CTA).
  Phase D: all 17 routed tools converted — 1,142 pairs across 108 files, with a
  rebuilt converter that is unit-tested against every past failure case.
  **Next: Phase E — book reader + MDX components.**
  → `initiatives/design-system.md`
- `[x]` **Code structure Phase 1 — done.** `packages/ui` `@/` imports 3 → 0, and
  the `TOOL_COLORS`/`UI_PATTERNS` duplication is closed: one definition in
  `@webiston/ui`, re-exported by `src/constants/ui-constants.ts`.
  → `initiatives/code-structure.md`

## Initiatives

| Initiative | Status | Next phase |
| ---------- | :----: | ---------- |
| [SEO & rendering](initiatives/seo-and-rendering.md) | `[ ]` | **Phase 1 — delete the fabricated ratings** |
| [Design system](initiatives/design-system.md) | `[~]` | **Phase E — book reader + MDX** (A–D shipped) |
| [Code structure](initiatives/code-structure.md) | `[~]` | Phase 2 — collapse the `src/components/ui/*` shim layer |
| [Tooling, CI & testing](initiatives/tooling-ci-and-testing.md) | `[ ]` | Phase 1 — add CI |
| [Content & i18n](initiatives/content-and-i18n.md) | `[ ]` | Phase 1 — fix `url-encoder` key parity |

## Shipped

- `[x]` **Dependency upgrade & tooling hardening** — all 4 workspaces to latest,
  TS 7 adopted, hooks rebuilt (push no longer hangs), 46 artifacts untracked,
  3 stale docs deleted. → `../archive/2026-07_dependency-upgrade-and-tooling.md`

---

## Next up

**SEO integrity (Phase 1) first.** It is small, mechanical, and it is the only
open item with an external consequence that grows over time — fabricated
structured data risks a Google manual action for as long as it stays indexed.

**Then Phase E** (book reader + MDX) closes the design-system sweep. The brand
colour is decided (hue 217°) and the ratchet holds the line, so remaining UI work
no longer adds to the pile.

---

## Ground rules for this file

- One line per item. Evidence (file:line or a number) or it is not an item.
- Detail goes in `initiatives/`; shipped detail goes in `../archive/`.
- Never a bare `- [x] Done` — name what and where.
