# ADR-0003 — TypeScript 7 with Next's experimental TypeScript CLI

- **Status:** Accepted
- **Date:** 2026-07-29

## Context

The 2026-07-29 dependency upgrade moved every workspace to latest. TypeScript's
latest is **7.0.2** (the Go-native compiler port). Two things broke:

1. **`next build` failed outright:**
   > `TypeScript 7.0.2 does not provide the compiler API required by Next.js.
   > Enable experimental.useTypeScriptCli in your Next.js config to use the
   > TypeScript CLI, or install TypeScript 6 instead.`

2. **`pnpm packages:build` crashed** with
   `TypeError: Cannot read properties of undefined (reading 'useCaseSensitiveFileNames')`.
   Root cause: `tsup@8.5.1` bundles `rollup-plugin-dts@6.1.1`, which is compiled
   against `typescript@5.7.3` and calls a legacy compiler API that TS 7 removed.
   That cascaded into `pnpm ext:build`, which could not resolve
   `@webiston/transliteration` because its `dist/` was never produced.

Standalone `tsc --noEmit` worked fine on TS 7 and took **0.40s** — the speed is real.

Both options were verified building green end-to-end before deciding.

## Decision

Stay on **TypeScript 7**, enable `experimental.useTypeScriptCli` in
`next.config.ts`, and emit package declarations with `tsc --emitDeclarationOnly`
instead of `tsup --dts`.

## Alternatives considered

- **Pin TypeScript 6.x** *(recommended at the time; rejected by the owner)* — zero
  experimental surface and it was already what `node_modules` actually contained
  (6.0.3, while `package.json` declared `^5.9.3`). Lost because the owner chose
  the TS 7 compiler speed and accepted the flag risk.
- **`typescript.ignoreBuildErrors: true`** — would drop Next's build-time
  typecheck entirely. Rejected: with no CI, that removes the only remaining
  type gate at deploy time.
- **Two TypeScript versions** (TS 6 pinned inside `packages/transliteration`) —
  rejected as strictly worse than changing one build script.

## Consequences

**Easy:** a 0.40s typecheck; one TypeScript version across all four workspaces;
`package.json` finally states the version that is actually installed.

**Hard / accepted risk:** `experimental.useTypeScriptCli` can be renamed or
removed in **any Next minor**, and there is no CI — so a break would surface at
deploy time. Mitigations: `pnpm typecheck` is an independent, non-experimental
gate, and reverting is a one-line change.

**Also accepted:** `packages/transliteration` now runs two build steps instead of
one, and emits a `.d.ts` tree rather than a single bundled declaration file.
Consumers are unaffected (`types` still resolves to `dist/index.d.ts`).

## Revisit when

- Next.js supports the TypeScript 7 compiler API natively → drop the flag.
- `tsup` ships a TS 7-compatible dts plugin → restore the single-step build.
- Or a Next minor breaks the flag → fall back to TS 6 immediately.

Both follow-ups are tracked under *Blocked on upstream* in `../roadmap/backlog.md`.
