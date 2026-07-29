# Initiative — Design system & token migration

**Spec:** `../../reference/design-system.md` · **Status:** `[!]` blocked on the
brand-colour decision (`../backlog.md`) · **Size:** the largest initiative in the repo.

> **Why this is blocked and stays blocked.** Phase A sets the token *values*.
> Phases C–E rewrite ~5,000 call sites to consume those tokens. Doing C before A
> means rewriting them twice. One decision — the brand hue — unblocks everything.

---

## The measured problem (2026-07-29, branch `refactor`)

| Metric | Value | Command |
| ------ | ----- | ------- |
| Tailwind palette class hits | **4,987** | `grep -rEo "(bg\|text\|border\|ring\|from\|to\|via)-(slate\|gray\|zinc\|…)-[0-9]{2,3}" src packages apps` |
| Semantic token hits | **170** | same shape, semantic names |
| Token share | **3.3%** | 170 / (170 + 4,987) |
| `dark:` variants | **1,967** | `grep -ro "dark:" src packages apps` |
| Raw hex literals | **336** | `grep -rEo "#[0-9a-fA-F]{3,8}\b" src packages apps` |

**Every one of those 1,967 `dark:` variants exists because the token underneath
is wrong.** If the token is right, dark mode is automatic. That is the single
best argument for doing Phase A before anything else.

---

## Phases

### `[!]` Phase A — the token block
**Blocked on:** the brand hue. **File:** `src/app/globals.css` (~50 lines).

Defects to fix, all verified:

- `globals.css:370` `--background: oklch(1 0 0)` and `:372` `--card: oklch(1 0 0)`
  are **identical in light mode** — there is no surface separation. (Dark mode is
  fine: `:404` `0.145` vs `:406` `0.205`.)
- `globals.css:376` `--primary: oklch(0.205 0 0)` — **zero chroma**. Every primary
  button on the site is black or white.
- `--secondary` / `--accent` / `--muted` collapse to one value.
- `globals.css:387` `--ring: oklch(0.708 0 0)` measures **1.55:1** against
  `--background` (light) and **1.87:1** (dark). WCAG requires **3:1** for a
  non-text focus indicator. Every focusable control on the site fails today.
- The font conflict: Inter is loaded at `layout.tsx:9` (`subsets: ["latin"]` only,
  so no Cyrillic) and applied at `:408`, then overridden by an `!important` rule
  at `globals.css:49`. It is downloaded on every page and never rendered.

**Target structure** — Tailwind v4 convention is a three-layer token hierarchy,
CSS-first via `@theme`, OKLCH throughout:

```
primitive   --brand-500: oklch(…)        raw values, no meaning
semantic    --color-primary: var(--brand-500)    purpose-driven
component   --color-btn-bg: var(--color-primary) variant-specific
```

**Exit condition:** `--card ≠ --background` in both modes · `--primary` chroma > 0 ·
`--ring` ≥ 3:1 measured in both modes · one font, one source of truth.

### `[ ]` Phase B — the `pnpm tokens` ratchet gate
**Depends on:** A. **Why before C:** without a gate, the next feature re-adds
hardcoded colour and phases C–E silently undo themselves.

A script that counts palette-class + hex hits **per file** against a frozen
baseline and exits non-zero on any per-file increase. Not a global count — a
global count lets one file get worse while another improves.

**Exit condition:** `pnpm tokens` exists, is wired into `lefthook.yml` pre-commit,
and fails on a deliberately-added `bg-blue-500`.

### `[ ]` Phase C — shared surfaces
**Why third:** these are consumed by every tool, so fixing them moves the most
call sites per edit.

- `packages/ui/src/constants/ui-patterns.ts` — `GLASS_PANEL`, `INPUT_PANEL`,
  `TERMINAL_PANEL` are **dark-only** (`bg-zinc-900/80` with no light variant), and
  they ship to every tool. *(Moved here from `src/constants/ui-constants.ts`
  during the code-structure initiative; the values were moved verbatim on purpose.)*
- `src/constants/ui-constants.ts` — `TEXT_STYLES` renders body text at **2.56:1**.
- `packages/ui/src/primitives/*` · `src/components/shared/*`

### `[ ]` Phase D — tools, one module per commit
**Routed tools first** — the four `__`-prefixed tools are unreachable in
production, and whether they are worth touching depends on the parked-tools
decision in `../backlog.md`. They are also the four worst offenders
(122 / 122 / 101 / 83 hardcoded-colour hits), so doing them first would be the
worst possible use of the effort.

### `[ ]` Phase E — book reader + MDX components
Last, because the book pages are read-mostly and visually simplest.

---

## What this initiative does NOT cover

- Accessibility beyond colour contrast — the 81 `pnpm check` errors
  (`noLabelWithoutControl` 42, `noSvgWithoutTitle` 16, …) live in
  `tooling-ci-and-testing.md`.
- Component API or structure changes — `code-structure.md`.
