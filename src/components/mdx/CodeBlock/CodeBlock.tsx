import { CopyButton } from "@/components/shared"
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
