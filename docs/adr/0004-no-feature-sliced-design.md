# ADR-0004 — We do not adopt Feature-Sliced Design

- **Status:** Accepted
- **Date:** 2026-07-29

## Context

The project was believed to be "started in FSD architecture". It is not, and
never was. Measured on branch `refactor`:

- **Zero** `entities/`, `features/`, `widgets/`, `pages/`, `processes/` folders
  exist anywhere in `src/`. `src/components/shared` is a folder that happens to
  be named "shared" — not the FSD `shared` layer.
- The real structure is **group-by-type** (`components/`, `hooks/`, `constants/`,
  `lib/`, `stores/`, `types/`) plus one island of **group-by-feature**
  (`modules/tools/{Tool}/`, 21 modules).

So the question was not "are we following FSD correctly" but "should we adopt it".

## Decision

**No.** Keep the existing `modules/{domain}/{Feature}/` pattern and invest the
effort in making it *consistent* instead.

## Alternatives considered

- **Adopt FSD fully.** Rejected on three independent grounds:
  1. **It fights the framework.** FSD's own Next.js guide states the App Router
     conflicts with FSD's flat slice structure, and prescribes renaming layers to
     `_app` / `_pages` so Next does not route them. That is a permanent workaround
     on every layer, forever.
  2. **There is no standard to comply with.** Next.js is explicitly unopinionated:
     *"Next.js is unopinionated about how you organize and colocate your project
     files."* Adopting FSD would be choosing a convention, not meeting one.
  3. **The payoff does not apply.** FSD's value is ownership boundaries between
     teams, and published guidance suggests it from ~20+ distinct features.
     Webiston is solo-maintained, and its 21 tools are **one feature type repeated
     21 times**, not 21 domains.
- **Partial FSD** (adopt `entities`/`features`, skip the rest) — rejected: a
  half-applied layering convention gives none of the predictability that is the
  whole reason to have one, and costs the same churn to introduce.

## Consequences

**Easy:** no repo-wide churn; `modules/tools/{Tool}/` already *is* a feature slice
with `components/`, `hooks/`, `constants/`, `utils/`, `types/`, `stores/`.

**Hard / accepted:** we keep group-by-type at the top level
(`src/components`, `src/hooks`, `src/lib`), which does not scale indefinitely.
Accepted because the growth axis here is *more tools*, and tools already live in
self-contained slices.

**The actual work this decision creates** — tracked in
`../roadmap/initiatives/code-structure.md`:

- only **LatinCyrillic** has the full module contract; `HttpStatus` (577 lines)
  and `KeycodeInfo` (531) have **no `components/` folder at all**
- 17 shim files in `src/components/ui/` re-export `@webiston/ui`, with 67 files
  importing through them — two paths to one component
- `packages/ui` has **28 consumers in `src/` and 0 in the extension**, so the
  monorepo is justified by `@webiston/transliteration` alone (3 consumers in
  `src/`, 3 in the extension). The package stays because it makes the
  design-system initiative tractable; the shim layer goes.

## Revisit when

- A second application joins the repo (not an extension — a real second app), or
- The project gains contributors who need enforced ownership boundaries, or
- `modules/` grows past ~2–3 genuinely distinct domains beyond `tools`.
