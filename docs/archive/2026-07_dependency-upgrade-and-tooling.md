# Dependency upgrade & tooling hardening — July 2026

**Status:** Complete · **Span:** 2026-07-29 → 2026-07-29 · **Branch:** `refactor`

## What was built

Every dependency across all four workspaces moved to latest, including four
major-version jumps that required real fixes rather than version bumps. The git
hooks — which had been silently broken and were hanging pushes indefinitely —
were rebuilt to run in ~2s with hard timeouts. Repository hygiene was fixed:
46 build/dependency artifacts had been committed to git despite being listed in
`.gitignore`. Finally, the steering docs were reconciled with reality: three
stale files were deleted and the testing strategy's core diagram was corrected.

## Key decisions

- **TypeScript 7 over TypeScript 6**, accepting an experimental Next flag →
  `adr/0003`
- **No Feature-Sliced Design**; keep and normalise `modules/{Feature}/` →
  `adr/0004`
- **One linter, not two.** Biome does format + lint + import sorting in a single
  pass; oxlint's fate is an open decision in
  `../roadmap/initiatives/tooling-ci-and-testing.md`.

## Measured results

| | Before | After | How measured |
| --- | --- | --- | --- |
| Outdated packages | 60+ | **1** (`hast`, deprecated, 0 imports) | `pnpm outdated -r` |
| `pnpm typecheck` | 0.4s, **exit 1** | 0.40s, **exit 0** | `/usr/bin/time -p pnpm typecheck` |
| `pnpm packages:build` | **exit 1** (crash) | **exit 0** | real exit code |
| `pnpm ext:build` | **exit 1** (cascade) | **exit 0**, 283 kB | real exit code |
| pre-commit hook | oxlint + `biome format` | **0.16s**, `biome check` | `lefthook run pre-commit` |
| pre-push hook | **hung indefinitely** | **2.39s** | `lefthook run pre-push` |
| Tracked-but-ignored files | 47 | **0** | `git ls-files -i -c --exclude-standard` |
| `packages/ui` → `@/` imports | 3 | **0** | `grep -rn '"@/' packages/` |

Gate at close: `packages:build 0` · `typecheck 0` · `lint 0` · `test 0 (207)` ·
`build 0` · `ext:build 0` · **`check 1`** (see *What it left open*).

## What was fixed along the way

Four genuine defects surfaced that were not version bumps:

1. **`MediaTrackSettings.echoCancellation` is now `string | boolean`** — the spec
   added echo-cancellation *mode* strings. TS 7 caught it; TS 5.9 had not.
   `useMicrophoneTest.ts:227`.
2. **`tsup --dts` crashes on TS 7** — its bundled `rollup-plugin-dts@6.1.1` targets
   `typescript@5.7.3`. Replaced with `tsc --emitDeclarationOnly`. This was also
   what broke `ext:build`, as a cascade.
3. **A dead `types` condition** in `@webiston/transliteration`'s export map — it
   came after `import`/`require`, so it never resolved. Moved to first.
4. **The pre-push hook pointed at a deleted binary path** (`lefthook@2.1.6` after
   the 2.1.10 upgrade) and no job had a timeout — the cause of the hour-long hang.

## Files changed

`package.json` (×4 workspaces) · `pnpm-lock.yaml` · `next.config.ts` ·
`lefthook.yml` · `biome.json` · `.gitignore` · `packages/transliteration/package.json` ·
`packages/ui/src/{index.ts, primitives/*, constants/*}` ·
`src/modules/tools/MicrophoneTest/hooks/useMicrophoneTest.ts` · `docs/**`

Deleted: `PROJECT_ARCHITECTURE.md` (claimed Plasmo; the extension uses WXT — and
claimed Turborepo patterns with no `turbo.json`) · `.kiro/steering/*` (3 files).

## What it left open

Honest list — none of this was done, and each has a home:

- **`pnpm check` still fails with 81 errors.** Verified **identical on Biome
  2.4.15**, so the upgrade did not cause them — the gate has simply never passed.
  Mostly a11y. → `initiatives/tooling-ci-and-testing.md` Phase 2.
- **The `@/` boundary fix is only half-landed.** `packages/ui` is clean, but
  `TOOL_COLORS`/`UI_PATTERNS` now exist in **both** `packages/ui/src/constants/`
  and `src/constants/ui-constants.ts`. The re-export is not written.
  → `initiatives/code-structure.md` Phase 1.
- **Still no CI.** Lefthook remains bypassable with `--no-verify`.
  → `initiatives/tooling-ci-and-testing.md` Phase 1.
- **`experimental.useTypeScriptCli` is load-bearing** and can vanish in any Next
  minor. → *Blocked on upstream* in `../roadmap/backlog.md`.
- **`hast`, `@types/hast`, `autoprefixer`, `motion`** are unused or duplicated but
  were **not removed** — removals need explicit approval.
  → `initiatives/tooling-ci-and-testing.md` Phase 5.
- The 7-dimension audit produced **97 findings; only 25 were verified** before the
  verification pass was cut short. Items carried into the initiatives from the
  unverified 72 are marked **[unverified]** — confirm the evidence before acting.
