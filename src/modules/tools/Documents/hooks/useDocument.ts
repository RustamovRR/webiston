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
  heading: string
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
  const heading = template.headings[script]
  const text = useMemo(() => plainText(blocks, heading), [blocks, heading])
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
   */
  const print = useCallback(() => {
    document.body.classList.add("document-print")
    window.addEventListener(
      "afterprint",
      () => document.body.classList.remove("document-print"),
      { once: true }
    )
    window.print()
  }, [])

  const downloadDocx = useCallback(async () => {
    setExporting(true)
    try {
      const { downloadDocumentDocx } = await import("../utils/docx")
      await downloadDocumentDocx(blocks, heading, template.fileName)
      return true
    } catch (error) {
      console.error("DOCX export failed:", error)
      return false
    } finally {
      setExporting(false)
    }
  }, [blocks, heading, template.fileName])

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
    heading,
    errors,
    copy,
    print,
    downloadDocx,
    isExporting,
    loadSample,
    reset
  }
}
