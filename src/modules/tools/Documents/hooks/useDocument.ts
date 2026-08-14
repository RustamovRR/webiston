"use client"

import { useCallback, useMemo, useState } from "react"

import { DOCUMENT_SCRIPTS } from "../constants"
import type {
  DocumentBlock,
  DocumentErrors,
  DocumentScript,
  DocumentTemplate
} from "../types"
import { plainText, toCyrillicBlocks } from "../utils/segments"

interface UseDocument<TData> {
  data: TData
  update: (patch: (current: TData) => TData) => void
  script: DocumentScript
  setScript: (script: DocumentScript) => void
  /** The document in the chosen script, as blocks — the sheet bolds `value`s. */
  blocks: DocumentBlock[]
  /** The same document flattened — what copy and the .docx get. */
  text: string
  errors: DocumentErrors
  copy: () => Promise<boolean>
  print: () => void
  downloadDocx: () => Promise<boolean>
  isExporting: boolean
  loadSample: () => void
  reset: () => void
}

/**
 * Everything a filled-in document does, for any template.
 *
 * The composition is derived during render rather than stored, and that is a
 * correctness decision, not a style one: composing the paper is string work
 * over a dozen fields and finishes in microseconds, while a stored copy could
 * show a different amount than the form — the class of bug a legal document
 * must not have.
 */
export function useDocument<TData>(
  template: DocumentTemplate<TData>
): UseDocument<TData> {
  const [data, setData] = useState<TData>(() => structuredClone(template.empty))
  const [script, setScript] = useState<DocumentScript>(DOCUMENT_SCRIPTS[0])
  const [isExporting, setExporting] = useState(false)

  const latin = useMemo(() => template.compose(data), [template, data])
  const blocks = useMemo(
    () => (script === "lotin" ? latin : toCyrillicBlocks(latin)),
    [latin, script]
  )
  const text = useMemo(() => plainText(blocks), [blocks])
  const errors = useMemo(() => template.validate(data), [template, data])

  const update = useCallback((patch: (current: TData) => TData) => {
    setData(patch)
  }, [])

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      return false
    }
  }, [text])

  /**
   * Print through the page itself, scoped by a body class.
   *
   * The print stylesheet (in `DocumentSheet`) hides everything except the
   * sheet while `document-print` is on `<body>`. The class comes off on
   * `afterprint`, NOT after `window.print()` returns — Safari can return
   * before its dialog closes, and a class removed too early prints the whole
   * page chrome.
   *
   * The TITLE is swapped for the same reason and restored the same way. A
   * browser prints `document.title` in its own header band and offers it as
   * the filename when the destination is "Save as PDF" — so the SEO title
   * ("Tilxat Yozish — Tayyor Namuna, Chop Etish | Webiston") was landing on
   * top of a document someone signs, and saving as `Tilxat Yozish — Tayyor
   * Namuna, Chop Etish _ Webiston.pdf`. The document's own file stem is the
   * honest answer to both, and it makes the PDF and the .docx come out under
   * the same name.
   *
   * The date and the URL in that band are the browser's, not ours. The only
   * CSS lever is `@page { margin: 0 }`, which would take the margin off the
   * middle pages of a multi-page document — measured as unsafe, so it is the
   * reader's "Headers and footers" checkbox that owns them.
   */
  const print = useCallback(() => {
    const pageTitle = document.title
    document.title = template.fileName
    document.body.classList.add("document-print")
    window.addEventListener(
      "afterprint",
      () => {
        document.body.classList.remove("document-print")
        document.title = pageTitle
      },
      { once: true }
    )
    window.print()
  }, [template.fileName])

  const downloadDocx = useCallback(async () => {
    setExporting(true)
    try {
      const { downloadDocumentDocx } = await import("../utils/docx")
      await downloadDocumentDocx(blocks, template.fileName)
      return true
    } catch (error) {
      console.error("DOCX export failed:", error)
      return false
    } finally {
      setExporting(false)
    }
  }, [blocks, template.fileName])

  /** Read the clock HERE, on the click — never at module scope. */
  const loadSample = useCallback(() => {
    setData(template.buildSample(new Date()))
  }, [template])

  const reset = useCallback(() => {
    setData(structuredClone(template.empty))
  }, [template])

  return {
    data,
    update,
    script,
    setScript,
    blocks,
    text,
    errors,
    copy,
    print,
    downloadDocx,
    isExporting,
    loadSample,
    reset
  }
}
