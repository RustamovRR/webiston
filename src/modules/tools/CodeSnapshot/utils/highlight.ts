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
 * The SAME instance, once it exists, reachable without awaiting.
 *
 * A promise cannot be read synchronously; the object it settled on can. Every
 * keystroke after the first has the engine, the theme and the grammar already
 * in memory, and `codeToTokens` is itself synchronous — so this slot is what
 * turns "tokenise" from an await into a function call, and it is the whole
 * reason `highlightSync` below can exist.
 */
let ready: HighlighterCore | null = null

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
  })
    .then((instance) => {
      ready = instance
      return instance
    })
    .catch((error) => {
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

export interface HighlightResult {
  lines: CodeLine[]
  foreground: string
  background: string
}

function tokenise(
  shiki: HighlighterCore,
  code: string,
  lang: string,
  theme: string
): HighlightResult {
  const result = shiki.codeToTokens(trimTrailingNewline(code), { lang, theme })

  return {
    lines: result.tokens.map(toCodeLine),
    foreground: result.fg ?? FALLBACK_FOREGROUND,
    background: result.bg ?? FALLBACK_BACKGROUND
  }
}

/**
 * Tokenise in the CALLER'S task, or decline.
 *
 * This is the editor's hot path and the reason typing feels live. The picture
 * IS the editor here — the textarea's own glyphs are transparent — so the only
 * text a visitor can see is the text on the canvas. Anything that defers the
 * re-tokenise by even a frame shows a caret travelling across a line that has
 * not appeared yet, and deferring it behind a trailing debounce (which is what
 * this tool did) shows nothing at all until they stop typing.
 *
 * Nothing here is async by nature. `codeToTokens` is synchronous; only the
 * engine, the theme and the grammar have to be fetched, once each. So: when all
 * three are in memory, tokenise and return. When they are not — the first
 * keystroke of a session, or the first use of a newly picked language — return
 * `null` and let the caller take the awaiting path that loads them.
 *
 * A throw is also `null`, deliberately. This runs inside a layout effect, where
 * an exception would take the render down; the async path will raise the same
 * failure a moment later with somewhere to report it.
 */
export function highlightSync(
  code: string,
  language: string,
  theme: string
): HighlightResult | null {
  if (!ready) return null

  const lang = resolveLanguage(language)
  if (!ready.getLoadedThemes().includes(theme)) return null
  if (lang !== PLAIN && !ready.getLoadedLanguages().includes(lang)) return null

  try {
    return tokenise(ready, code, lang, theme)
  } catch {
    return null
  }
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
): Promise<HighlightResult> {
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

  return tokenise(shiki, code, lang, theme)
}
