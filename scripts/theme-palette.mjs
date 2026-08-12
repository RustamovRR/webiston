#!/usr/bin/env node

/**
 * Extract every bundled Shiki theme's real colours, once, at build time.
 *
 *   pnpm themes            regenerate src/modules/tools/CodeSnapshot/constants/theme-palette.json
 *   pnpm themes --check    fail if the committed file is stale (CI / the gate)
 *
 * WHY THIS EXISTS
 *
 * The theme picker shows a swatch per theme — its editor background with a few
 * token colours on it — so the choice is made by looking rather than by reading
 * "Kanagawa Wave" and guessing. That needs each theme's colours.
 *
 * Reading them in the browser is not an option. A Shiki theme module is ~16–24
 * KB and there are 65 of them: rendering the picker would pull well over a
 * megabyte for information that never changes between releases. The tool's
 * whole highlighting design (`utils/highlight.ts`) exists to load ONE theme on
 * demand; a picker that eagerly loads all 65 would undo it.
 *
 * So the colours are extracted here and shipped as ~7 KB of JSON.
 *
 * WHY IT TOKENISES INSTEAD OF READING `tokenColors`
 *
 * The obvious version walks each theme's `tokenColors` and looks for a rule
 * whose `scope` mentions `keyword`. That is guesswork across 65 themes with 65
 * different scope-naming habits, and it answers a question nobody asked — what
 * the theme *declares* — rather than the one that matters: what this tool will
 * actually PAINT. So the script highlights a fixed snippet with the same
 * `codeToTokens` call the tool uses and reads the colours off the result. A
 * swatch cannot disagree with the picture it previews.
 *
 * JSON, not `.ts`, because it is generated data: nothing in it is written by
 * hand, and a diff on it should read as data changing, not as source changing.
 */

import { existsSync, readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

import { createHighlighter } from "shiki"
import { bundledThemesInfo } from "shiki/themes"

const OUT = join(
  process.cwd(),
  "src/modules/tools/CodeSnapshot/constants/theme-palette.json"
)

/**
 * The probe snippet.
 *
 * Every word in it is a landmark: the colours are found by matching token
 * CONTENT, which only works because this text is fixed and each target string
 * appears exactly once. `salom` and `note` are deliberately not English
 * keywords — a grammar must not be able to classify them as anything else.
 */
const SAMPLE = `// note
const greet = "salom"`

const LANG = "typescript"

/** Extract one theme's palette, or throw naming the field that came back empty. */
function paletteFor(highlighter, id) {
  const { tokens, fg, bg } = highlighter.codeToTokens(SAMPLE, {
    lang: LANG,
    theme: id
  })
  const flat = tokens.flat()
  const colourOf = (match) => flat.find(match)?.color

  const palette = {
    bg,
    fg,
    comment: colourOf((t) => t.content.includes("note")),
    keyword: colourOf((t) => t.content.trim() === "const"),
    identifier: colourOf((t) => t.content.trim() === "greet"),
    string: colourOf((t) => t.content.includes("salom"))
  }

  // A theme that colours nothing is a broken extraction, not a minimal theme:
  // every field here has a token to attach to in the sample above. Falling back
  // silently would ship a swatch that is a flat rectangle and looks identical
  // to every other broken one.
  const empty = Object.entries(palette)
    .filter(([, value]) => !value)
    .map(([field]) => field)
  if (empty.length) {
    throw new Error(`${id}: no colour for ${empty.join(", ")}`)
  }

  return palette
}

async function build() {
  const ids = bundledThemesInfo.map((theme) => theme.id)
  const highlighter = await createHighlighter({ themes: ids, langs: [LANG] })

  const themes = bundledThemesInfo.map((info) => ({
    id: info.id,
    label: info.displayName,
    isDark: info.type === "dark",
    ...paletteFor(highlighter, info.id)
  }))

  highlighter.dispose()
  return `${JSON.stringify({ themes }, null, 2)}\n`
}

const next = await build()

if (process.argv.includes("--check")) {
  const current = existsSync(OUT) ? readFileSync(OUT, "utf8") : ""
  if (current !== next) {
    console.error("✗ theme-palette.json is stale. Run `pnpm themes`.")
    process.exit(1)
  }
  console.log("✓ theme-palette.json matches the installed Shiki themes")
  process.exit(0)
}

writeFileSync(OUT, next)
const count = JSON.parse(next).themes.length
console.log(`✓ ${count} theme palettes → ${OUT.replace(process.cwd(), ".")}`)
