import { toJsxRuntime } from "hast-util-to-jsx-runtime"
import type { JSX } from "react"
import { Fragment } from "react"
import { jsx, jsxs } from "react/jsx-runtime"
import { bundledLanguages, codeToHast } from "shiki"

/** Shiki treats this as a special language — it is not in `bundledLanguages`
 *  but is always accepted. Used when a fence names a grammar we do not have. */
const PLAIN = "text"

/**
 * Highlight on the server, for BOTH themes at once.
 *
 * `themes` + `defaultColor: "light"` makes Shiki emit the light colour as an
 * inline `color` and the dark one as a `--shiki-dark` custom property on the
 * same element; a rule in `globals.css` swaps them under `.dark`. That is what
 * lets this run on the server at all — the previous version needed
 * `useTheme()`, so it had to be a Client Component, so 226 prerendered chapters
 * shipped grey skeletons where the code should be.
 */
export async function highlight(
  code: string,
  lang: string
): Promise<JSX.Element> {
  // An unknown fence (`reg`, a typo, a prose block) must not throw mid-build.
  const language = lang && lang in bundledLanguages ? lang : PLAIN

  const out = await codeToHast(code, {
    lang: language,
    themes: { light: "light-plus", dark: "dark-plus" },
    defaultColor: "light"
  })

  return toJsxRuntime(out, { Fragment, jsx, jsxs }) as JSX.Element
}
