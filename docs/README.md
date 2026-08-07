# Webiston — Documentation Hub

> **Start here.** Single entry point for any AI agent or engineer joining the
> project. Read this, then `roadmap/active.md`, then the doc relevant to your
> task. This file is the map; every other doc is reachable from here by path.

---

## What is this?

**Webiston** (webiston.uz) — a free platform for Uzbek-speaking developers:
programming books translated into Uzbek, ~20 client-side developer tools, and a
Chrome extension. **Production.** It is also the owner's portfolio project, so
visual craft counts as a requirement, not a bonus.

| Surface          | Where                            | What                                   |
| ---------------- | -------------------------------- | -------------------------------------- |
| Web app          | `src/`                           | Next.js 16 App Router — books, tools, search |
| Books            | `content/` (226 `.mdx`)          | 3 books, Uzbek translation             |
| Tools            | `src/modules/tools/` (21 modules)| client-side utilities, 17 routed       |
| `@webiston/ui`   | `packages/ui`                    | Shadcn/Radix primitives + composites   |
| `@webiston/transliteration` | `packages/transliteration` | pure TS Latin↔Cyrillic, zero deps |
| Chrome extension | `apps/extensions/latin-cyrillic` | WXT                                    |

**Stack:** Next.js 16 (App Router, React Compiler ON) · React 19.2 ·
TypeScript 5.9 strict · Tailwind v4 (CSS-first) + Shadcn · Zustand · next-intl
(`uz`/`en`) · MDX · Biome + oxlint · Vitest · pnpm · Lefthook.

Structure and boundaries in full: **`reference/architecture.md`**.

---

## The 4 doc lifecycles (this is why the folders exist)

Folders track **lifecycle, not topic**. Each doc lives in exactly one, by how it
changes:

| Lifecycle           | Folder       | What it holds                                    | Changes       |
| ------------------- | ------------ | ------------------------------------------------ | ------------- |
| **Rules / how**     | `reference/` | living authorities + spec guides                 | rarely        |
| **Decisions / why** | `adr/`       | one immutable page per decision                  | append-only   |
| **State / now**     | `roadmap/`   | `active.md` (in progress) · `backlog.md` (future)| every session |
| **History / done**  | `archive/`   | completed-work logs (read-only)                  | append-only   |

`CLAUDE.md` (repo root) is the **auto-loaded entrance** for every Claude Code
session: role, hard rules, session workflow, and an `@`-import of
`reference/code-rules.md`. `AGENTS.md` is the same rule set for non-Claude tools
(Codex, Cursor, Copilot, Gemini CLI, Aider), which do **not** read `CLAUDE.md`.

**ADR vs reference:** an ADR is a one-page *"why we chose X over Y"* (immutable);
a `reference/*` doc is the full living spec of that area. The ADR links to the
reference; it never duplicates it.

---

## File map

```
CLAUDE.md                    ← auto-loaded entrance: role, hard rules, workflow,
                               @-imports docs/reference/code-rules.md
AGENTS.md                    ← same hard rules, for non-Claude agents
glossary.md                  ← Uzbek↔English technical terminology contract

.claude/agents/              ← specialist roles (subagents, own context each)
  design-system-reviewer.md
  content-reviewer.md
  seo-performance-auditor.md
  code-reviewer.md

docs/
  README.md                  ← YOU ARE HERE — the map

  reference/                 ← living authorities (the "how", rarely change)
    code-rules.md            ← THE enforced rules (always loaded via CLAUDE.md)
    architecture.md          ← structure, boundaries, module contract
    design-system.md         ← THE design spec + the measured drift baseline
    content-i18n.md          ← MDX books, uz/en/ru parity, glossary discipline
    seo-performance.md       ← metadata, sitemap, 'use client' budget, bundles
    seo-strategy.md          ← WHERE to aim: locales, CIS, the 2 flagship tools,
                               what we will NOT do, and a Refuted list
    testing-strategy.md      ← testing spec (+ a status block on what is real)

  adr/                       ← Architecture Decision Records (append-only)
    README.md                ← template + numbering + index
    0001-hybrid-monorepo-src-at-root.md
    0002-design-tokens-single-source.md
    0003-typescript-7-with-experimental-next-cli.md
    0004-no-feature-sliced-design.md

  roadmap/                   ← state (read every session)
    active.md                ← CURRENT: tracker — in progress + next (THIN)
    backlog.md               ← standalone future items + owner decisions (THIN)
    initiatives/             ← execution plans for multi-session work
      README.md              ← the convention + index
      design-system.md       ← Phases A–E, token migration
      seo-and-rendering.md   ← SEO *mechanics*: canonicals, prerender, payload
      seo-2026.md            ← SEO *aim*: locale correctness, structure, content
      code-structure.md      ← boundaries, shim layer, module shape, types
      content-and-i18n.md    ← uz/en parity, glossary, message bundles
      tooling-ci-and-testing.md ← CI, gates, first tests in src/

  archive/                   ← completed-work logs (read-only)
    README.md
    2026-07_dependency-upgrade-and-tooling.md
```

### Where does a piece of work go?

```
small item, ≤3 lines          → roadmap/backlog.md
multi-phase, needs an order   → roadmap/initiatives/<name>.md  (+1 pointer line)
started                       → roadmap/active.md "In progress" (one line)
all phases done               → archive/YYYY-MM_<name>.md, initiative file deleted
a decision with a trade-off   → adr/NNNN-*.md
```

**Why `initiatives/` exists:** `backlog.md` is a list of *items*. A five-phase
migration is not an item — pasting it in buries the twenty small items that do
belong there. Each initiative file is the **execution plan** for one `reference/`
spec: the reference says what good looks like, the initiative says how we get
there and in what order.

---

## How to onboard (read in this order)

1. **`CLAUDE.md`** — auto-loaded; role + rules + product context (2 min)
2. **`roadmap/active.md`** — current state + next tasks (3 min)
3. **`reference/architecture.md`** — before any structural change
4. **The task-specific `reference/*` doc** — the one matching your task
5. **`adr/`** — when you are about to question *why* something is the way it is
6. **`archive/*`** — only for history on a specific shipped initiative

> Do **not** read every doc upfront. The map tells you when each is relevant.

---

## Specialist roles — one always-on, the rest on demand

**The question this answers:** should the session be a senior engineer, a
designer, a UI/UX expert, and a marketer all at once — or just an engineer?

**Answer: one always-on role, specialists invoked explicitly.**

`CLAUDE.md` is loaded into *every* conversation. Anthropic's own guidance is to
keep it short and to ask of each line *"would removing this cause a mistake?"*,
because **a bloated always-on file causes the real rules to be ignored**. Four
personas in one always-on file is four times the prose and four competing
priorities on a task that needs one. So `CLAUDE.md` carries a single default
role — **senior/staff frontend engineer** — and nothing else.

The specialist hats live in `.claude/agents/*.md` as **subagents**. Each gets its
own context window, its own system prompt, and its own tool list, so a design
review is not diluted by the implementation conversation that produced the diff
— and a fresh reviewer is measurably better at finding problems in code it did
not just write.

| Need                                                  | Subagent                  |
| ----------------------------------------------------- | ------------------------- |
| Visual/UX review, token discipline, dark-mode parity, contrast | `design-system-reviewer` |
| Uzbek technical prose, MDX, uz/en parity, glossary    | `content-reviewer`        |
| Metadata, structured data, LCP/CLS, `use client`, bundles | `seo-performance-auditor` |
| Correctness review of a diff                          | `code-reviewer`           |

Invoke explicitly: *"use the design-system-reviewer subagent on this diff."*

**When to add a fifth:** only when a real, repeated task keeps needing a
perspective none of the four provide. A pile of overlapping agents is harder to
manage than a few sharp ones. Marketing/positioning work is currently folded
into `content-reviewer` (copy, terminology) and `seo-performance-auditor`
(discoverability) — split it out only if campaign work becomes recurring.

**Cost note:** subagent-heavy runs use several times the tokens of a single
session, because each subagent carries its own context. Use them for work whose
blast radius is wide or whose answer is genuinely unknown — not for a one-file
fix you can verify by reading it.

---

## Checklist conventions (used in `roadmap/*`)

```
- [ ] Not started
- [~] In progress
- [x] Done — brief note of what was done and where
- [!] Blocked — reason
- [>] Deferred — reason + target phase
```

**Done format** (always what + where):
`- [x] Split ToolsMainPage into 3 components — src/modules/tools/`.
Never a bare `- [x] Done` — no context means useless.

---

## Doc discipline — keep this system clean

**Where does new writing go?** Match it to a lifecycle:

- A **decision** with a real trade-off / rejected alternative → a new
  `adr/NNNN-*.md` (append; never edit an accepted one — supersede it).
- A **living spec / how-to** → the matching `reference/*` doc.
- **In-progress / next work** → `roadmap/active.md` (thin — one line per phase;
  do **not** paste shipped-work prose here).
- **Future, not started** → `roadmap/backlog.md`.

**When an initiative completes:** move its block out of `active.md` into
`archive/<initiative>.md`, leave a one-line snapshot in `active.md`, and add it
to the file map above. This is what keeps `active.md` a tracker, not a changelog.

**Standing rule: an item with no file:line evidence is not an item** — delete it,
do not carry it.

**Naming:** `reference/`, `roadmap/`, `adr/` are kebab-case; `archive/` prefers a
`YYYY-MM_` prefix. No `SCREAMING_SNAKE_CASE.md`.

---

## Hard rules (never break)

- pnpm only. `pnpm check` + `pnpm lint` + `pnpm typecheck` + `pnpm test` +
  `pnpm build` before claiming done — real exit codes.
- Token-driven styling: no raw hex, no Tailwind palette classes in components.
- Named exports only (default only for Next.js `page`/`layout`/`route`).
- `packages/*` never import `src/` or `apps/*`, and never use the `@/` alias.
- `'use client'` at the smallest interactive leaf — never on a page or layout.
- New UI copy ships `uz` + `en` in the same commit.
- Deletions need evidence **and** explicit approval.
- **The user commits their own work.** Never commit, never offer to.

---

_Created 2026-07-29. Baselines in `reference/design-system.md` § 1 and
`roadmap/active.md` were measured on branch `dev` at commit `2260c49`._
