#!/usr/bin/env node
/**
 * WCAG contrast checker for the design tokens.
 *
 * Parses the token blocks out of src/styles/tokens.css, resolves var() chains,
 * converts OKLCH → sRGB, and verifies every foreground/background pair against
 * WCAG 2.1 in BOTH colour schemes.
 *
 * The design-system doc makes contrast claims. This is what makes them checkable
 * instead of aspirational — re-run it after any token change.
 *
 *   pnpm contrast     exit 0 if every pair passes, 1 otherwise
 */

import { readFileSync } from "node:fs"
import { join } from "node:path"

// The token blocks live in src/styles/tokens.css — globals.css is now just an
// import list. If tokens ever move again, this is the one line to update, and
// the parse below will fail loudly rather than silently checking nothing.
const CSS = join(process.cwd(), "src", "styles", "tokens.css")

/* ---------- OKLCH → sRGB → WCAG luminance ---------- */

const clamp01 = (x) => Math.min(1, Math.max(0, x))
const decodeGamma = (c) =>
  c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
const encodeGamma = (c) =>
  c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055

function oklchToLinearRgb(L, C, Hdeg) {
  const h = (Hdeg * Math.PI) / 180
  const a = C * Math.cos(h)
  const b = C * Math.sin(h)
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s
  ]
}

/** Luminance of the colour as it will ACTUALLY display (i.e. after sRGB clipping). */
function luminance([L, C, H]) {
  const [r, g, b] = oklchToLinearRgb(L, C, H)
    .map((c) => encodeGamma(clamp01(c)))
    .map(decodeGamma)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(fg, bg) {
  const a = luminance(fg)
  const b = luminance(bg)
  const [hi, lo] = a > b ? [a, b] : [b, a]
  return (hi + 0.05) / (lo + 0.05)
}

/* ---------- parse the token blocks ---------- */

const css = readFileSync(CSS, "utf8")

function blockBody(selector) {
  // Anchor to a line start so `.dark` does not match `.dark .background-pattern`.
  const re = new RegExp(`^${selector.replace(".", "\\.")}\\s*\\{`, "m")
  const m = re.exec(css)
  if (!m) throw new Error(`Token block not found: ${selector}`)
  const start = css.indexOf("{", m.index)
  let depth = 0
  for (let i = start; i < css.length; i++) {
    if (css[i] === "{") depth++
    else if (css[i] === "}" && --depth === 0) return css.slice(start + 1, i)
  }
  throw new Error(`Unbalanced braces in ${selector}`)
}

function parseTokens(selector) {
  const out = {}
  for (const m of blockBody(selector).matchAll(/(--[a-z0-9-]+):\s*([^;]+);/g)) {
    out[m[1]] = m[2].trim()
  }
  return out
}

const light = parseTokens(":root")
const dark = { ...light, ...parseTokens(".dark") }

// Returns [L, C, H, alpha]. Alpha matters: the dark scheme authors `--border`,
// `--border-strong` and `--input` as translucent white, and a translucent token
// has NO contrast ratio of its own — only the composite over a known backdrop
// does. Before this, those values failed the plain-oklch regex and were reported
// SKIP, which is why the gate could claim 32/32 while the one token that governs
// WCAG 1.4.11 sat at 1.33:1 unexamined.
function resolve(scope, value, depth = 0) {
  if (value == null || depth > 10) return null
  const v = value.replace(/\/\*[\s\S]*?\*\//g, "").trim()
  const ref = v.match(/^var\((--[a-z0-9-]+)\)$/)
  if (ref) return resolve(scope, scope[ref[1]], depth + 1)
  const m = v.match(
    /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+)(%?)\s*)?\)$/
  )
  if (!m) return null
  const alpha = m[4] === undefined ? 1 : m[5] === "%" ? +m[4] / 100 : +m[4]
  return [+m[1], +m[2], +m[3], alpha]
}

/** sRGB channels (0–1, gamma-encoded) of the colour as it will actually display. */
const srgbOf = ([L, C, H]) =>
  oklchToLinearRgb(L, C, H).map((c) => encodeGamma(clamp01(c)))

/**
 * Luminance of `fg` as the user sees it over `bg`.
 *
 * Compositing happens in gamma-encoded sRGB, which is what a browser does for
 * `background`/`border` alpha — not in linear light. Getting this backwards
 * would overstate the contrast of every translucent token.
 */
function effectiveLuminance(fg, bg) {
  const a = fg[3] ?? 1
  if (a >= 1) return luminance(fg)
  const f = srgbOf(fg)
  const b = srgbOf(bg)
  const [r, g, bl] = f.map((c, i) => decodeGamma(c * a + b[i] * (1 - a)))
  return 0.2126 * r + 0.7152 * g + 0.0722 * bl
}

/** Contrast of a possibly-translucent `fg` against an opaque `bg`. */
function contrastOver(fg, bg) {
  const a = effectiveLuminance(fg, bg)
  const b = luminance(bg)
  const [hi, lo] = a > b ? [a, b] : [b, a]
  return (hi + 0.05) / (lo + 0.05)
}

/* ---------- the requirements ---------- */

// [foreground, background, minimum ratio]
// 4.5 = WCAG AA body text · 3 = AA non-text (focus rings, UI boundaries)
const PAIRS = [
  ["--foreground", "--background", 4.5],
  ["--foreground", "--card", 4.5],
  ["--card-foreground", "--card", 4.5],
  ["--muted-foreground", "--background", 4.5],
  ["--muted-foreground", "--card", 4.5],
  ["--muted-foreground", "--muted", 4.5],
  ["--primary-foreground", "--primary", 4.5],
  ["--secondary-foreground", "--secondary", 4.5],
  ["--accent-foreground", "--accent", 4.5],
  ["--destructive", "--background", 4.5],
  ["--destructive", "--card", 4.5],
  ["--success", "--background", 4.5],
  ["--warning", "--background", 4.5],
  ["--info", "--background", 4.5],
  ["--ring", "--background", 3],
  ["--ring", "--card", 3],
  // WCAG 1.4.11 non-text contrast: the boundary that identifies an interactive
  // component. `--border` is deliberately absent — it is decorative separation
  // (1.32:1 light, 1.33:1 dark) and 1.4.11 does not govern it. Everything the
  // user must read as an object — a card that is a link, an outline button, a
  // key cap — uses `--border-strong`, and that IS governed.
  ["--border-strong", "--background", 3],
  ["--border-strong", "--card", 3]
]

let failures = 0
let skipped = 0

for (const [label, scope] of [
  ["LIGHT", light],
  ["DARK", dark]
]) {
  console.log(`\n${label}`)
  for (const [fgName, bgName, need] of PAIRS) {
    const fg = resolve(scope, scope[fgName])
    const bg = resolve(scope, scope[bgName])
    if (!fg || !bg) {
      skipped++
      console.log(
        `  ${`${fgName} on ${bgName}`.padEnd(46)} SKIP (not a plain oklch value)`
      )
      continue
    }
    const r = contrastOver(fg, bg)
    const ok = r >= need
    if (!ok) failures++
    console.log(
      `  ${`${fgName} on ${bgName}`.padEnd(46)} ${r.toFixed(2).padStart(6)}:1  need ${need}  ${ok ? "PASS" : "FAIL"}`
    )
  }
  const card = resolve(scope, scope["--card"])
  const bg = resolve(scope, scope["--background"])
  if (card && bg) {
    const sep = contrast(card, bg)
    console.log(
      `  ${"card vs background (surface separation)".padEnd(46)} ${sep.toFixed(3).padStart(6)}:1  ${sep > 1.02 ? "ok" : "NO SEPARATION"}`
    )
  }
}

// A SKIP is an UNCHECKED pair, so it must not count as success.
//
// Until now `skipped` was only printed. That made the whole gate able to report
// "✓ All contrast requirements pass (32 skipped)" and exit 0 while verifying
// nothing at all — exactly what would have happened when the token block moved
// to src/styles/tokens.css if `blockBody` had not thrown first. A check that can
// pass vacuously is worse than no check, because it is trusted.
if (skipped > 0) {
  console.error(
    `\n✗ ${skipped} pair(s) were SKIPPED — those tokens were never verified.`
  )
  console.error(
    "  Either they are no longer plain oklch() values, or the token block was not parsed."
  )
  console.error(
    `  Parsed ${Object.keys(light).length} light tokens from ${CSS}.`
  )
}

console.log(
  failures === 0 && skipped === 0
    ? "\n✓ All contrast requirements pass."
    : `\n✗ ${failures} contrast failure(s), ${skipped} unverified.`
)
process.exit(failures === 0 && skipped === 0 ? 0 : 1)
