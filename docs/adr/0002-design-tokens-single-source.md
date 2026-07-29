# ADR-0002 — One token block as the single source of colour

- **Status:** Accepted
- **Date:** 2026-07-29

## Context

Colour in this codebase is currently written three different ways, in three
different places:

1. Semantic CSS variables — the Shadcn `:root` / `.dark` block in
   `src/app/globals.css` (`--background`, `--card`, `--primary`, …).
2. A second, parallel set in the same file's `@theme` block, in raw hex
   (`--color-primary-black`, `--color-gray-primary: #757a7d`, …).
3. Tailwind palette utilities written directly in components
   (`bg-slate-900 dark:bg-gray-800`).

Measured on branch `dev` @ `2260c49`:

| | Count |
| --- | ---: |
| Tailwind palette utilities in `src/` + `packages/` | **4,988** |
| Semantic token utilities | **195** |
| Raw hex literals in `.ts` / `.tsx` | **312** |
| `dark:` variants | **1,963** |

That is a **3.8% token share**. The practical consequence is that dark mode is
hand-maintained: nearly two thousand places where the same colour decision is
written twice and can drift independently. A theme change today means editing
five thousand call sites.

## Decision

**The `:root` / `.dark` token block in `src/app/globals.css` is the single
source of truth for colour.** Components consume semantic utility classes
(`bg-card`, `text-muted-foreground`, `border-border`) and nothing else. Raw hex
and Tailwind palette classes are not permitted in components.

**A `dark:` variant on a colour utility is a defect,** not a style: if the token
is correct, both themes are already correct.

Documented exceptions, which must be named constants rather than inline values:
chart/visualisation palettes, brand illustrations and gradients, and third-party
widget overrides (Leaflet, KaTeX, medium-zoom).

## Alternatives considered

- **Leave it as-is and rely on review.** Rejected: 4,988 violations is the
  result of relying on review. It does not scale and it has already failed.
- **Per-package or per-component stylesheets.** Rejected: it multiplies the
  number of places a colour can be defined, which is the problem, not the fix.
- **A big-bang codemod across all 4,988 sites.** Rejected: unreviewable, and it
  would land before the token *set* itself is fixed (light mode has no surface
  separation and there is no brand hue — see `../reference/design-system.md § 2`).
  Fix the foundation, gate it, then migrate in phases.

## Consequences

**Easy:** one place to change the theme; dark mode becomes free; a brand hue
becomes a one-line change instead of a project.

**Hard / accepted:**

- Migration is large and must be phased (design-system.md § 5). The interim
  state is mixed, and mixed is honest — the ratchet baseline records exactly how
  mixed.
- The rule needs a **gate** to hold. Without `pnpm tokens` (fail-on-increase
  against a frozen per-file baseline) the next feature re-adds what the last
  phase removed. The gate is a prerequisite for phases C–E, not a follow-up.
- Some genuinely one-off colours will need an escape hatch. Use a `token-ok`
  line comment or a file-level `token-guardrail-exempt: <reason>` pragma —
  with a written reason, so the exception is reviewable.

## Revisit when

The token share is above 85% and the gate has been green for a full release
cycle — at which point the escape-hatch list is worth auditing.

## See also

`../reference/design-system.md` (the full spec, the baseline, and the phase plan).
