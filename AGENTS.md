# AGENTS.md — Webiston

> **For any AI coding agent that is not Claude Code** (Codex, Cursor, Copilot,
> Gemini CLI, Aider, Zed, Windsurf…). Claude Code auto-loads `CLAUDE.md` and
> does **not** read this file; every other tool reads this one and not
> `CLAUDE.md`. Both exist on purpose.
>
> **`CLAUDE.md` is the source of truth.** This is a deliberately short pointer.
> If the two disagree, `CLAUDE.md` wins — and fix this file.

---

## What this repo is

**Webiston** (webiston.uz) — a production platform for Uzbek-speaking
developers: 3 programming books translated into Uzbek (226 MDX chapters),
~20 client-side developer tools, and a Chrome extension. pnpm workspace.

| Surface          | Where                            |
| ---------------- | -------------------------------- |
| Next.js app      | `src/` (App Router, root of repo)|
| Books            | `content/`                       |
| Tools            | `src/modules/tools/`             |
| Shared UI        | `packages/ui` → `@webiston/ui`   |
| Transliteration  | `packages/transliteration`       |
| Chrome extension | `apps/extensions/latin-cyrillic` |

Stack: Next.js 16 (React Compiler ON) · React 19.2 · TypeScript 5.9 strict ·
Tailwind v4 + Shadcn · Zustand · next-intl (`uz`/`en`) · MDX · Biome + oxlint ·
Vitest.

---

## Hard rules

1. **pnpm only.** Never `npm` / `yarn`.
2. **Check your branch first.** `dev` and `origin/fix/issues` carry *different*
   `package.json` scripts and different build systems (`turbo.json` exists on
   one, not the other). Run `git rev-parse --abbrev-ref HEAD` and confirm which
   scripts exist before running anything.
3. **No `export *`.** Named exports only. Default exports only for Next.js
   `page.tsx` / `layout.tsx` / `route.ts`.
4. **Package boundaries.** `src/` and `apps/*` may import `packages/*`.
   `packages/*` may NEVER import `src/` or `apps/*`, and the `@/` alias does not
   resolve inside `packages/`.
5. **Token-driven styling.** No raw hex, no Tailwind palette classes
   (`bg-slate-200`, `text-blue-500`) in components — semantic tokens only
   (`bg-card`, `text-muted-foreground`, `border-border`). A `dark:` colour
   variant means the token is wrong. The codebase is ~96% in violation today;
   that is the active migration, not a licence to add more.
6. **Server-first.** `'use client'` goes on the smallest interactive leaf —
   never on a `page.tsx` or `layout.tsx`. It is contagious downward.
7. **Both locales.** New user-facing copy ships `uz` **and** `en` in the same
   commit, and new tools must be wired into `messages/index.js` (a manual
   merger — easy to forget).
8. **Uzbek terminology comes from `glossary.md`.** Check it before translating a
   technical term; add new terms there.
9. **No `any`.** (`biome.json` currently has the rule off and there are 69 in
   `src/` — do not add to the pile.)
10. **Never delete anything without asking.** "No consumer yet" ≠ dead code.
    This covers config keys and fields, not just files. Show the exact list and
    get an explicit yes.

Formatting is Biome: double quotes, **no semicolons**, no trailing commas,
80 columns, 2-space indent. Run `pnpm format` — do not hand-format.

---

## Before you claim you are done

Run these and report **real exit codes**. Never pipe to `tail`/`head` when
checking pass/fail — the pipe masks the exit code and a broken build reports
green.

```bash
pnpm check       # biome check .  (read-only; use `pnpm format` to fix)
pnpm lint        # oxlint src/ packages/ apps/
pnpm typecheck   # tsc --noEmit   (⚠ excludes apps/extensions — tsconfig.json:27)
pnpm test        # vitest run
pnpm build       # next build (+ postbuild: tools list, sitemap, search index)
```

⚠️ **`vitest` does not typecheck.** A test can be green and `tsc` still red.
Run both. There is **no CI** — the Lefthook `pre-push` hook is the only
automated gate, and `--no-verify` bypasses it.

For UI work, "it looks better" is not a result. Re-run the measurement commands
in `docs/reference/design-system.md § 1` and report the delta.

---

## Where to read more

Do not paste docs into your context wholesale — open what the task needs.

| Task                                       | Doc                                     |
| ------------------------------------------ | --------------------------------------- |
| Anything at all                            | `CLAUDE.md`, then `docs/README.md`      |
| The enforced rules in full                 | `docs/reference/code-rules.md`          |
| Structure, boundaries, branch reality      | `docs/reference/architecture.md`        |
| Any UI / colour / dark-mode work           | `docs/reference/design-system.md`       |
| MDX books, translations, terminology       | `docs/reference/content-i18n.md`        |
| Metadata, Core Web Vitals, bundles         | `docs/reference/seo-performance.md`     |
| Testing                                    | `docs/reference/testing-strategy.md`    |
| Why a decision was made                    | `docs/adr/` — do not re-litigate these  |
| What is in flight / next                   | `docs/roadmap/active.md`, `backlog.md`  |

**The user commits their own work.** Do not commit, and do not offer to.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
