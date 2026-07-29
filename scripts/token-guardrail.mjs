#!/usr/bin/env node

/**
 * Token drift ratchet.
 *
 * Counts hardcoded colour (Tailwind palette classes + raw hex) PER FILE and
 * compares against a frozen baseline. Fails if any file gets worse.
 *
 * Per-file, not global, on purpose: a global total lets one file regress while
 * another improves, and the regression ships. The ratchet only turns one way.
 *
 *   pnpm tokens            check against the baseline (exit 1 on any increase)
 *   pnpm tokens --update   re-freeze the baseline (only ever DOWNWARD)
 *   pnpm tokens --report   show the worst offenders, no exit code
 */

import { execFileSync } from "node:child_process"
import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const ROOT = process.cwd()
const BASELINE = join(ROOT, "scripts", "token-baseline.json")

const PALETTE =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose"
const UTILITY =
  "bg|text|border|ring|from|to|via|fill|stroke|shadow|outline|decoration|divide|accent|caret|placeholder"

// A Tailwind palette class: bg-zinc-900, text-blue-500/50, dark:border-red-200 …
const PALETTE_RE = new RegExp(
  `\\b(?:${UTILITY})-(?:${PALETTE})-\\d{2,3}\\b`,
  "g"
)
// A raw hex colour literal.
const HEX_RE = /#[0-9a-fA-F]{3,8}\b/g

/** Files the rule applies to: component/source code only.
 *
 *  NOTE: do NOT filter with a `src/**\/*.ts` pathspec. Git's `**` requires at
 *  least one intervening directory, so a file sitting directly in src/ (e.g.
 *  src/middleware.ts) silently escapes the ratchet. List the trees and filter
 *  by extension here instead. */
/** If discovery collapses, every check below silently passes on an empty set.
 *  The repo has ~429 `.ts`/`.tsx` files under these trees; anything near zero
 *  means the pathspec, the git invocation or the cwd broke — not that the
 *  codebase shrank. Fail loudly instead of reporting a clean bill of health. */
const MIN_SCANNED = 100

function targetFiles() {
  const out = execFileSync("git", ["ls-files", "src/", "packages/", "apps/"], {
    cwd: ROOT,
    encoding: "utf8"
  })
  const files = out
    .split("\n")
    .filter((f) => /\.tsx?$/.test(f))
    .filter((f) => !f.includes("/node_modules/"))

  if (files.length < MIN_SCANNED) {
    console.error(
      `✗ Only ${files.length} source file(s) found — expected at least ${MIN_SCANNED}.`
    )
    console.error(
      "  File discovery is broken, so this gate would pass without checking anything."
    )
    process.exit(1)
  }
  return files
}

function countFile(path) {
  let src
  try {
    src = readFileSync(join(ROOT, path), "utf8")
  } catch {
    return 0 // deleted since `git ls-files` — not this script's problem
  }
  return (src.match(PALETTE_RE) || []).length + (src.match(HEX_RE) || []).length
}

function measure() {
  const counts = {}
  for (const f of targetFiles()) {
    const n = countFile(f)
    if (n > 0) counts[f] = n
  }
  return counts
}

const total = (c) => Object.values(c).reduce((a, b) => a + b, 0)

/** Tailwind classes that are syntactically broken and therefore generate NO CSS.
 *
 *  Real regression, 2026-07-29: a mechanical light/dark collapse left orphaned
 *  opacity suffixes behind — `bg-muted/50/50`, `backdrop-blur-sm/30/60`. Those
 *  silently render unstyled. Nothing caught it: the count stayed flat, typecheck
 *  cannot see inside a string, and the build succeeds. So the ratchet checks it. */
const MALFORMED = [
  // two opacity modifiers on one utility: bg-muted/50/50
  /\b[a-z-]+-[a-z0-9-]+\/\d{1,3}\/\d{1,3}\b/g,
  // an opacity modifier on a utility that takes none: backdrop-blur-sm/30
  /\b(?:backdrop-)?blur-(?:xs|sm|md|lg|xl|2xl|3xl)\/\d{1,3}\b/g
]

const STATUSES = ["success", "warning", "info", "destructive", "primary"]

/** A solid status background with same-status text on top is invisible.
 *
 *  Real regression, 2026-07-29: collapsing `bg-amber-50 dark:bg-amber-950/30`
 *  to `bg-warning` turned every warning callout into amber text on solid amber.
 *  A tint must keep an opacity modifier (`bg-warning/10`); only a SOLID surface
 *  may drop it, and that pairs with `text-*-foreground`, never `text-warning`.
 *
 *  ⚠️ KNOWN LIMIT: this compares within ONE class string. It catches
 *  `className="bg-success text-success"`, but not a component that splits the
 *  pair across properties — e.g. Callout's `containerClass` / `textClass`, where
 *  the same bug hid. Widening it to a line window produced false positives on
 *  legitimate `bg-primary text-primary-foreground` buttons, so the precise
 *  version was kept. Review split-class components by eye. */
function invisibleText() {
  const hits = []
  for (const f of targetFiles()) {
    let src
    try {
      src = readFileSync(join(ROOT, f), "utf8")
    } catch {
      continue
    }
    for (const m of src.matchAll(/"([^"\n]*)"/g)) {
      const cls = m[1]
      for (const s of STATUSES) {
        const solidBg = new RegExp(`(?<![\\w/-])bg-${s}(?![\\w/-])`).test(cls)
        const sameText = new RegExp(`(?<![\\w/-])text-${s}(?![\\w/-])`).test(
          cls
        )
        if (solidBg && sameText) hits.push([f, s, cls.slice(0, 70)])
      }
    }
  }
  return hits
}

function malformedClasses() {
  const hits = []
  for (const f of targetFiles()) {
    let src
    try {
      src = readFileSync(join(ROOT, f), "utf8")
    } catch {
      continue
    }
    for (const re of MALFORMED) {
      for (const m of src.matchAll(re)) hits.push([f, m[0]])
    }
  }
  return hits
}

const mode = process.argv[2]
const current = measure()

if (mode !== "--report") {
  const broken = malformedClasses()
  if (broken.length) {
    console.error(
      `✗ ${broken.length} malformed Tailwind class(es) — these generate no CSS and render unstyled:\n`
    )
    for (const [f, c] of broken) console.error(`    ${f}: ${c}`)
    process.exit(1)
  }

  const invisible = invisibleText()
  if (invisible.length) {
    console.error(
      `✗ ${invisible.length} element(s) put text on a background of the SAME status colour — the text is invisible:\n`
    )
    for (const [f, s, cls] of invisible) {
      console.error(`    ${f}: bg-${s} + text-${s}  in  "${cls}…"`)
    }
    console.error(
      "\n  A tint keeps its opacity (bg-warning/10 + text-warning)."
    )
    console.error(
      "  A solid surface pairs with the on-colour (bg-primary + text-primary-foreground)."
    )
    process.exit(1)
  }
}

if (mode === "--report") {
  const rows = Object.entries(current)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 25)
  console.log(
    `Hardcoded colour: ${total(current)} hits across ${Object.keys(current).length} files\n`
  )
  console.log("Worst offenders:")
  for (const [f, n] of rows) console.log(`  ${String(n).padStart(4)}  ${f}`)
  process.exit(0)
}

if (mode === "--update") {
  let prev = {}
  if (existsSync(BASELINE))
    prev = JSON.parse(readFileSync(BASELINE, "utf8")).files ?? {}

  // The ratchet only turns one way: refuse to record a regression.
  const worse = Object.entries(current).filter(
    ([f, n]) => n > (prev[f] ?? Infinity)
  )
  if (worse.length && !process.argv.includes("--force")) {
    console.error("✗ Refusing to update: these files would regress.\n")
    for (const [f, n] of worse) console.error(`    ${f}: ${prev[f]} → ${n}`)
    console.error(
      "\n  Fix them, or re-run with --force if the increase is deliberate."
    )
    process.exit(1)
  }

  writeFileSync(
    BASELINE,
    `${JSON.stringify({ measuredAt: new Date().toISOString().slice(0, 10), total: total(current), files: current }, null, 2)}\n`
  )
  console.log(
    `✓ Baseline frozen: ${total(current)} hits across ${Object.keys(current).length} files`
  )
  process.exit(0)
}

if (!existsSync(BASELINE)) {
  console.error(
    "✗ No baseline. Run `pnpm tokens --update` once to freeze the current state."
  )
  process.exit(1)
}

const base = JSON.parse(readFileSync(BASELINE, "utf8"))
const regressions = []
for (const [f, n] of Object.entries(current)) {
  const allowed = base.files[f] ?? 0 // a NEW file is allowed zero
  if (n > allowed) regressions.push([f, allowed, n])
}

if (regressions.length) {
  console.error(
    `✗ Token drift: ${regressions.length} file(s) added hardcoded colour.\n`
  )
  for (const [f, was, now] of regressions)
    console.error(`    ${f}: ${was} → ${now}  (+${now - was})`)
  console.error(
    "\n  Use semantic tokens: bg-card, text-muted-foreground, border-border, text-destructive."
  )
  console.error("  Full list: docs/reference/design-system.md")
  console.error(
    "\n  If the increase is genuinely unavoidable (charts, brand illustration),"
  )
  console.error(
    "  put the value in a named constant and run `pnpm tokens --update --force`."
  )
  process.exit(1)
}

const improved = total(base.files) - total(current)
console.log(
  improved > 0
    ? `✓ No token drift — and ${improved} hit(s) removed since the baseline. Run \`pnpm tokens --update\` to lock it in.`
    : "✓ No token drift."
)
