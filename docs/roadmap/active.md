# Webiston — Active Roadmap

> **Read at the start of every session. Update at the start and the end.**
> Thin lines only. `[ ]` not started · `[~]` in progress · `[x]` done ·
> `[!]` blocked · `[>]` deferred. Done items name **what + where**.
> Shipped detail goes to `../archive/`, not here.

_Last updated: 2026-07-29 — docs system created (this file included). Baselines
measured on branch `dev` @ `2260c49`._

---

## Snapshot

| Area                 | State | Evidence                                                |
| -------------------- | :---: | ------------------------------------------------------- |
| Docs / onboarding    |  ✅   | `CLAUDE.md`, `AGENTS.md`, `docs/` — created 2026-07-29   |
| Branch hygiene       |  ❌   | `dev` vs `origin/fix/issues` disagree on the build system |
| Design tokens        |  ❌   | 3.8% token share (4,988 palette vs 195 semantic)         |
| Server/client split  |  ⚠️   | 101 / 208 `.tsx` are `'use client'` (49%)                |
| Type safety          |  ⚠️   | `noExplicitAny: "off"`; 69 `any` in `src/`               |
| Tests                |  ❌   | 6 files, all in `packages/transliteration`; `src/` = 0   |
| CI                   |  ❌   | none — Lefthook pre-push is the only gate                |
| i18n correctness     |  ⚠️   | `<html lang>` hardcoded `"uz"` (`layout.tsx:394`)        |

---

## P0 — Do this before anything else

- [ ] **Reconcile the branches.** `dev` has no `turbo.json`; `origin/fix/issues`
      (2 commits ahead) adds Turborepo + a dependency bump + `packages/ui/src/constants/`.
      `dev` is also 3 ahead / 3 behind `origin/main`. Decide the trunk, merge,
      and delete the losers. **Every item below assumes this is settled** —
      refactoring onto a branch that is about to be rebased throws the work away.
- [ ] **Decide: Turborepo, yes or no.** One deployable app + 2 packages is the
      size where Turbo's caching may or may not pay for its config. Whatever the
      answer, it must be the same on every branch. Write it up as `adr/0003`.

## P1 — Design system foundation (`reference/design-system.md`)

The measured problem: **96% of colour code bypasses the token system**, light
mode has no surface separation, and there is no brand hue.

- [ ] **Phase A — token block.** Give `--card` its own light-mode value; give
      `--primary` a brand hue (needs the owner's colour decision); split
      `secondary`/`accent` from `muted`; add status + elevation + type tokens;
      resolve the duplicate `@theme` colour system; settle the font conflict
      (Inter is loaded at `layout.tsx:408` and killed by a `!important` rule at
      `globals.css:53`). — `src/app/globals.css`
- [ ] **Phase B — `pnpm tokens` ratchet gate.** Per-file baseline + fail-on-increase.
      Port `~/Desktop/React_projects/gl-safety/scripts/token-guardrail.mjs`.
      Without this, phases C–E get undone by the next feature.
- [ ] Phase C — shared surfaces (`src/constants/ui-constants.ts` = 38 hits,
      `packages/ui/src/primitives/*`, `src/components/shared/*`).
- [ ] Phase D — tools, one module per commit, **routed tools first**.
- [ ] Phase E — book reader + MDX components.

## P2 — Correctness & rendering

- [ ] **`<html lang>` follows the locale.** `src/app/layout.tsx:394` hardcodes
      `"uz"`; the root layout sits above `[locale]`, so this is not a one-liner.
- [ ] **`'use client'` audit.** Start with pages and layouts that carry it, and
      with the book reader. Target: move the boundary down, not remove interactivity.
- [ ] **First tests in `src/`.** Tool business-logic hooks are pure-ish and the
      highest value per test: `useQrGenerator` (570 lines), `useOgMetaGenerator`
      (597), `usePasswordGenerator` (486).

## In progress

_(nothing — the docs system just landed; pick a P0 item)_

## Next up

P0 branch reconciliation → then P1 Phase A, because every UI task after it
inherits the token decisions.

---

## Ground rules for this file

- One line per item. Evidence (file:line or a number) or it is not an item.
- Do not paste shipped-work prose here — tick the box, move detail to `archive/`.
- Do not copy feature/bug tickets in from an issue tracker; those live on their
  own branches.
