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
function targetFiles() {
  const out = execFileSync("git", ["ls-files", "src/", "packages/", "apps/"], {
    cwd: ROOT,
    encoding: "utf8"
  })
  return out
    .split("\n")
    .filter((f) => /\.tsx?$/.test(f))
    .filter((f) => !f.includes("/node_modules/"))
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

const mode = process.argv[2]
const current = measure()

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
