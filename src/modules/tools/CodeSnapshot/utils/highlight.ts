import { createHighlighterCore, type HighlighterCore } from "shiki/core"
import { createJavaScriptRegexEngine } from "shiki/engine/javascript"
import { bundledLanguages, bundledLanguagesInfo } from "shiki/langs"
import { bundledThemes, bundledThemesInfo } from "shiki/themes"

import { FALLBACK_BACKGROUND, FALLBACK_FOREGROUND } from "../constants"
import type { CodeLine } from "../types"
import { toCodeLine, trimTrailingNewline } from "./tokens"

/**
 * Shiki, loaded a grammar at a time.
 *
 * The tempting import is `from "shiki"` — the full bundle, which is what
 * `components/mdx/CodeBlock/highlight.ts` uses. That one runs at BUILD time on
 * the server, where its size costs nothing. Here it would land in a visitor's
 * browser: 65 themes and 360 grammars for a page that will use one of each.
 *
 * So: `shiki/core` with no themes or languages, plus the registries from
 * `shiki/themes` and `shiki/langs`. Those registries are records of
 * `id -> () => import(...)`, so importing them costs only the arrow functions;
 * the bundler code-splits each grammar and the network only ever fetches what
 * the reader actually picks.
 */

/**
 * The JavaScript RegExp engine, not Oniguruma.
 *
 * Oniguruma is a WebAssembly build and would add a ~500 KB download before the
 * first line can be highlighted. The JS engine compiles the same TextMate
 * patterns to native `RegExp`, and `forgiving` is what makes it safe to rely
 * on across 360 grammars: a pattern it cannot express is skipped instead of
 * throwing, so an exotic language degrades to slightly plainer colours rather
 * than to a blank canvas and an unhandled rejection.
 */
let highlighter: Promise<HighlighterCore> | null = null

/**
 * The singleton caches the promise — but NEVER a rejected one.
 *
 * `highlighter ??= create…()` on its own memoises failure permanently. The
 * engine is a code-split chunk, so one dropped request on a flaky connection
 * leaves this holding a rejected promise; every later keystroke re-awaits the
 * same rejection and the canvas shows the starter snippet forever. Because the
 * singleton is module scope it survives route unmount and locale switches by
 * design, so nothing short of a full page reload recovers — the tool is bricked
 * for the session by one lost chunk.
 *
 * Clearing the slot on rejection makes the next keystroke a fresh attempt.
 */
function getHighlighter(): Promise<HighlighterCore> {
  highlighter ??= createHighlighterCore({
    engine: createJavaScriptRegexEngine({ forgiving: true }),
    themes: [],
    langs: []
  }).catch((error) => {
    highlighter = null
    throw error
  })
  return highlighter
}

/** Every theme Shiki ships, in its own order, for the "all themes" picker. */
export const ALL_THEMES = bundledThemesInfo.map((theme) => ({
  id: theme.id,
  label: theme.displayName,
  isDark: theme.type === "dark"
}))

/** Every grammar Shiki ships. `aliases` is what makes `js` find `javascript`. */
export const ALL_LANGUAGES = bundledLanguagesInfo.map((lang) => ({
  id: lang.id,
  label: lang.name,
  aliases: lang.aliases ?? []
}))

/**
 * Shiki's own name for "no grammar". It is not in `bundledLanguages`, and
 * asking the loader for it would throw — it has to be passed straight through.
 */
const PLAIN = "text"

/**
 * Resolve whatever the reader typed to a CANONICAL grammar id.
 *
 * Aliases must be checked BEFORE `bundledLanguages`, not after — the obvious
 * order is wrong. Shiki merges aliases into that record, so `"js" in
 * bundledLanguages` is `true` and an id-first lookup returns `"js"` verbatim.
 * Shiki is happy with that, but nothing else is: the picker cannot mark
 * "JavaScript" as selected, and `?lang=js` and `?lang=javascript` become two
 * URLs for one snapshot.
 */
export function resolveLanguage(input: string): string {
  const wanted = input.trim().toLowerCase()
  if (!wanted || wanted === PLAIN) return PLAIN

  const canonical = bundledLanguagesInfo.find(
    (lang) => lang.id === wanted || lang.aliases?.includes(wanted)
  )
  if (canonical) return canonical.id

  return wanted in bundledLanguages ? wanted : PLAIN
}

/**
 * Tokenise, loading whatever the request needs first.
 *
 * `loadTheme`/`loadLanguage` are idempotent — Shiki keeps a registry and
 * ignores a second load — so this stays cheap on every keystroke after the
 * first, which is the path that matters: the reader types, and re-tokenising
 * must not re-download a grammar.
 */
export async function highlightToLines(
  code: string,
  language: string,
  theme: string
): Promise<{ lines: CodeLine[]; foreground: string; background: string }> {
  const shiki = await getHighlighter()
  const lang = resolveLanguage(language)

  if (!shiki.getLoadedThemes().includes(theme) && theme in bundledThemes) {
    await shiki.loadTheme(bundledThemes[theme as keyof typeof bundledThemes])
  }
  if (lang !== PLAIN && !shiki.getLoadedLanguages().includes(lang)) {
    await shiki.loadLanguage(
      bundledLanguages[lang as keyof typeof bundledLanguages]
    )
  }

  const result = shiki.codeToTokens(trimTrailingNewline(code), { lang, theme })

  return {
    lines: result.tokens.map(toCodeLine),
    foreground: result.fg ?? FALLBACK_FOREGROUND,
    background: result.bg ?? FALLBACK_BACKGROUND
  }
}
