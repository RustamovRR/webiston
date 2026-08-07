// A DEEP import, not `@/components/shared` and not the `@webiston/ui` root.
//
// This one line was putting the entire shared-component client graph on all 226
// prerendered chapters. `CodeBlock` is a Server Component, but a barrel import
// makes every CLIENT module the barrel re-exports part of this route's client
// reference manifest — measured, the chapter route was pulling `DualTextPanel`,
// `TerminalInput`, `aurora-text`, `code-highlight`, `gradient-tabs`,
// `number-ticker`, `select`, `typing-animation` and `BaseModal`. None of those
// appear on a book page; several are tool-only UI.
//
// `CopyButton` is the only client island the code block actually needs.
import { CopyButton } from "@webiston/ui/composites/CopyButton"
import { highlight } from "./highlight"

interface CodeBlockProps {
  children?: string
  /** The fence's language, e.g. ```js. Falls back to plain text when absent. */
  lang?: string
}

/**
 * A Server Component: the code is highlighted where the page is rendered, which
 * for `/books/**` means at BUILD time.
 *
 * It used to be `'use client'` and highlight in `useLayoutEffect`, so the
 * prerendered HTML carried a grey skeleton and Shiki shipped to the browser.
 * On a content site that is the worst of both — slower LCP, and the code (the
 * thing the site is actually about) was invisible to crawlers.
 *
 * `CopyButton` stays the only client island here.
 */
export default async function CodeBlock({ children, lang }: CodeBlockProps) {
  const codeString = String(children || "").trim()
  if (!codeString) return null

  const nodes = await highlight(codeString, lang ?? "")

  return (
    <div className="group relative rounded-lg border border-border bg-card py-2">
      <div className="absolute top-2 right-2 z-10">
        <CopyButton text={codeString} />
      </div>

      <div className="overflow-auto rounded-lg">{nodes}</div>
    </div>
  )
}
