# ADR-0001 — Hybrid monorepo: `src/` stays at the repo root

- **Status:** Accepted
- **Date:** 2026-07-29 (documenting a decision already in force)

## Context

Webiston is a pnpm workspace with one deployable web application, two shared
packages (`@webiston/ui`, `@webiston/transliteration`), and one browser
extension (`apps/extensions/latin-cyrillic`).

The conventional monorepo layout would put the web app at `apps/web/`. This repo
instead keeps the Next.js app at the root in `src/`, with `packages/` and
`apps/extensions/` beside it — a hybrid.

## Decision

**The Next.js app stays at the repo root in `src/`.** `packages/*` holds shared
code; `apps/*` holds non-Next.js deliverables (the extension).

## Alternatives considered

- **Move the app to `apps/web/`.** Rejected: with a single deployable app it
  buys nothing and costs real complexity — duplicated `tsconfig`/`postcss`/
  `next.config`, path rewrites, a deeper deploy root, and churn across every
  import and script. Turborepo's own examples use a root app for single-app
  workspaces.
- **Flatten everything (no packages).** Rejected: the transliteration engine is
  genuinely shared between the web app and the extension. Duplicating it would
  guarantee the two drift, and it is the one piece of code with real test
  coverage.

## Consequences

**Easy:** one `next.config.ts`, one `tsconfig.json`, one deploy root; the app's
imports stay short (`@/…`); the extension and the app provably share one
transliteration implementation.

**Hard / accepted:**

- The root `package.json` is both the workspace root *and* the web app's
  manifest. Root scripts and app scripts are the same list, which is confusing
  the first time you read it.
- `pnpm typecheck` runs one `tsc --noEmit` from the root and **excludes**
  `apps/extensions/**` (`tsconfig.json:27`), so the extension needs its own
  check. It does not currently have one in the gate.
- Tooling that assumes `apps/*` contains every app needs configuring by hand.

## Revisit when

A second deployable web app appears (an admin panel, a separate marketing site),
CI needs per-app selective builds, or the extension count grows past one. At
that point `apps/web/` becomes worth its cost.

## See also

`../reference/architecture.md` § 1–3.
