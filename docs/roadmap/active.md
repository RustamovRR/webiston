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
| Build & gates | ✅ | 6 of 7 gates green; hooks 0.16s / 2.39s |
| Repo hygiene | ✅ | `git ls-files -i -c` → 0 |
| Package boundaries | 🟡 | `packages/ui` `@/` imports 3 → **0**; re-export not yet written |
| `pnpm check` | ❌ | 81 errors, mostly a11y — never passed, pre-dates the upgrade |
| SEO integrity | ❌ | 18 files emit **fabricated** ratings + invented reviews |
| Canonical / hreflang | ❌ | 229 book pages + every `/en` page canonical to the wrong URL |
| Static rendering | ❌ | **0 routes prerendered** — no `setRequestLocale` anywhere |
| Payload | ❌ | 1.05 MB search index + 209 KB logo eager on every page |
| Design tokens | ❌ | 3.3% token share (170 semantic vs 4,987 palette) |
| Tests in `src/` | ❌ | 0 (207 tests exist, all in `packages/transliteration`) |
| CI | ❌ | none — Lefthook only, and `--no-verify` bypasses it |

**Gate (real exit codes, 2026-07-29):** `packages:build 0` · `typecheck 0` ·
`lint 0` · `test 0 (207)` · `build 0` · `ext:build 0` · **`check 1`**

---

## In progress

- `[~]` **Code structure** — Phase 1 half-landed: `packages/ui` boundary is clean,
  but `TOOL_COLORS`/`UI_PATTERNS` exist in **two** places until the re-export is
  written. → `initiatives/code-structure.md`

## Initiatives

| Initiative | Status | Next phase |
| ---------- | :----: | ---------- |
| [SEO & rendering](initiatives/seo-and-rendering.md) | `[ ]` | **Phase 1 — delete the fabricated ratings** |
| [Design system](initiatives/design-system.md) | `[!]` | Phase A — **blocked on the brand-colour decision** |
| [Code structure](initiatives/code-structure.md) | `[~]` | Phase 1 — finish the re-export |
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

**Then the brand colour.** One decision unblocks the largest initiative in the
repo; every UI change made before it adds to a 4,987-item pile.

---

## Ground rules for this file

- One line per item. Evidence (file:line or a number) or it is not an item.
- Detail goes in `initiatives/`; shipped detail goes in `../archive/`.
- Never a bare `- [x] Done` — name what and where.
