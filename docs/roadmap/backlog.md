# Webiston — Backlog

> Future work, prioritized, **not started**. Move an item into `active.md` when
> it starts. Keep this file thin: an item with no file:line evidence or no
> measurable outcome is not an item — delete it.
>
> _Seeded 2026-07-29 from a verification pass over branch `dev` @ `2260c49`.
> Every number below was measured, not estimated._

---

## Needs a decision from the owner (blocking — do not guess)

- [!] **The brand colour.** `--primary` is stock Shadcn grey
      (`oklch(0.205 0 0)` light / `oklch(0.922 0 0)` dark), so every primary
      button on the site is black-or-white. Picking the hue unblocks design
      Phase A. Must pass WCAG AA on both backgrounds.
- [!] **The four parked tools.** `__http-status`, `__keycode-info`,
      `__user-agent-analyzer`, `__website-status` sit behind `_`-prefixed
      (private) route folders, so they are unreachable in production —
      **3,846 LOC across the four modules** that still builds. Finish them, or
      remove them (removal needs explicit approval). They are
      also the four worst files for hardcoded colour (122/122/101/83 hits), so
      the answer decides whether that cleanup is worth doing at all.
- [!] **`.kiro/steering/*` — update or retire?** Verified stale on `dev`: wrong
      versions for Next/React/TS/Tailwind, claims Russian support that does not
      exist, wrong pre-push description, 2 books instead of 3, a `src/lib/config/`
      that is not there. Depends on whether Kiro is still in use.
      (Details: `reference/architecture.md § 8`.)
- [!] **Image optimization.** `next.config.ts` sets `images.unoptimized: true`.
      Turning it on is a real win for a content site but interacts with
      `output: "standalone"` and the deploy target. ADR-sized.

## Code health

- [ ] **Turn on `noExplicitAny`.** `biome.json` has it `"off"`; there are
      **69** `any`s in `src/`, while `code-rules.md` and the old steering both
      claim "no any". Either enforce the rule or stop claiming it. Suggested
      path: set it to `"warn"`, fix, then `"error"`.
- [ ] **Enable `noUnusedLocals` / `noUnusedParameters`** in `tsconfig.json` —
      the steering docs already claim they are on. Expect fallout; do it in
      its own commit.
- [ ] **47 of 422 files exceed the 350-line hard limit** (9 exceed 500). Do not
      start a splitting campaign — split what you touch. Worst:
      `QrCustomizationPanel.tsx` 631 · `WebsiteStatus.tsx` 612 ·
      `useOgMetaGenerator.ts` 597 · `UserAgentAnalyzer.tsx` 589 ·
      `HttpStatus.tsx` 577 · `useQrGenerator.ts` 570 · `layout.tsx` 483.
- [ ] **Collapse the `src/components/ui/*` shim layer.** 17 files of 1–17 lines
      re-exporting `@webiston/ui`, plus a large barrel in `index.ts`. Two import
      paths for one component invites inconsistency. Touches many files → its
      own commit, after the design phases (which will rewrite these imports anyway).
- [ ] **A boundary gate.** Nothing currently prevents `packages/* → src/`. A
      dependency-cruiser config with a baseline would make
      `reference/architecture.md § 2` real instead of aspirational.

## Testing

- [ ] **`src/` has zero tests.** Start with tool business-logic hooks
      (`useQrGenerator`, `useOgMetaGenerator`, `usePasswordGenerator`,
      `useMicrophoneTest`) and `src/lib/` utils. `vitest.config.ts` already
      includes `src/**/*.test.{ts,tsx}` — no config work needed.
- [ ] **CI.** There is no `.github/workflows` and no `vercel.json`; Lefthook
      pre-push is the only gate and `--no-verify` bypasses it. A single workflow
      running `check + lint + typecheck + test + build` on PRs would close that.
- [ ] **The extension is not typechecked** by `pnpm typecheck`
      (`tsconfig.json:27` excludes `apps/extensions/**`). Add its own check to
      the gate.

## SEO & performance

- [ ] **`alternates.languages`** for the uz/en pair, so Google links the
      translations instead of treating them as duplicates.
- [ ] **Per-route `metadata`.** Audit which tool pages and book chapters fall
      back to the generic site title — those compete with themselves in search.
- [ ] **Dynamic-import the heavy deps.** `pdfjs-dist`, `mammoth`, `docx`,
      `katex`, `shiki`, `leaflet`, `flexsearch` must not be in a shared bundle.
      Measure route sizes from `pnpm build` before and after.
- [ ] **Inter loads a Latin subset only** (`layout.tsx:9`) while the product
      ships Cyrillic Uzbek. Resolve together with the `!important` font conflict.
- [ ] **Structured data** beyond the current JSON-LD: `TechArticle` for
      chapters, `SoftwareApplication` for tools, `ItemList` for the books index.

## Content & i18n

- [ ] **`messages/index.js` is a manual merger** — one explicit import pair per
      tool per locale. Adding a tool means editing it twice, and forgetting
      shows up as `undefined` strings at runtime. A glob/codegen step would
      remove the footgun.
- [ ] **uz/en key-parity check.** A tiny script comparing key sets between
      `uz.json` and `en.json` in every namespace, wired into the gate.
- [ ] **Glossary coverage pass** over the 226 chapters — the most common quality
      complaint against a long technical translation is inconsistent terminology.
      Use the `content-reviewer` subagent per book, not per chapter.
- [ ] `glossary.md` starts with a stray `’` character on line 1.

## Docs

- [ ] Seed `adr/` as decisions get made (`0003` = the Turborepo call).
- [ ] Create `archive/<initiative>.md` when the first initiative ships.

---

## Decisions on record (do not re-litigate — read `adr/` first)

- **`src/` stays at the repo root** instead of moving to `apps/web/` — one
  deployable app; the move buys config duplication and nothing else.
  → `adr/0001`
- **One stylesheet, one token block** (`src/app/globals.css`) — per-component or
  per-package stylesheets are not adopted. → `adr/0002`
