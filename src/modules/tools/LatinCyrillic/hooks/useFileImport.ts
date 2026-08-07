"use client"

/**
 * Read a .txt / .pdf / .docx into text, and write text back out as .txt/.docx.
 *
 * What is deliberately NOT here any more: chunking. The old version split
 * anything over 50,000 characters into parts, showed a chunk picker, and
 * converted one part at a time. Measured, the engine converts 50,000
 * characters in ~10 ms and 1,000,000 in ~150 ms — the machinery was solving a
 * problem that does not exist, and it came with a data-loss bug: "Download
 * all" wrote only the selected chunk while naming the file `_full`, and every
 * chunk downloaded under the same name because the `_partN` suffix was eaten
 * by the extension-stripping regex.
 */

import { useEffect, useRef, useState } from "react"

import {
  MAX_FILE_SIZE,
  MAX_FILE_SIZE_MB,
  SUPPORTED_EXTENSIONS
} from "../constants"
import type { DownloadFormat, FileImportStatus, ImportProgress } from "../types"

const INITIAL_PROGRESS: ImportProgress = {
  percentage: 0,
  statusKey: ""
}

/** How long an error stays on screen before the panel returns to normal. */
const ERROR_VISIBLE_MS = 6000

/**
 * How long the finished bar stays on screen after the work is done.
 *
 * Without it the bar is unmounted in the same commit that reports 100%, so it
 * disappears wherever it happened to be — the one moment the user is actually
 * watching it is the one moment it never shows.
 */
const COMPLETION_HOLD_MS = 500

/**
 * Collapse the whitespace a PDF or DOCX extractor leaves behind, without
 * destroying paragraph structure.
 */
function normalizeText(text: string): string {
  return text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => line.trim())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
}

/** `hujjat.docx` → `hujjat`. Only the real extension, never a suffix we added. */
function stripExtension(fileName: string): string {
  return fileName.replace(/\.(txt|pdf|docx)$/i, "")
}

function saveBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  // Appended before clicking and revoked on the next frame: Firefox ignores a
  // click on a detached anchor, and revoking in the same tick can cancel the
  // download before the browser has read the blob.
  document.body.appendChild(link)
  link.click()
  link.remove()
  requestAnimationFrame(() => URL.revokeObjectURL(url))
}

export function useFileImport(onText: (text: string) => void) {
  const [fileName, setFileName] = useState<string | null>(null)
  const [status, setStatus] = useState<FileImportStatus>("idle")
  const [progress, setProgress] = useState<ImportProgress>(INITIAL_PROGRESS)
  const [errorKey, setErrorKey] = useState<string | null>(null)
  const [isFinishing, setIsFinishing] = useState(false)

  // The old version left this timer running: a second upload never cancelled
  // the first one's countdown, and unmounting mid-error set state on a gone
  // component.
  const errorTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const holdTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(
    () => () => {
      if (errorTimer.current) clearTimeout(errorTimer.current)
      if (holdTimer.current) clearTimeout(holdTimer.current)
    },
    []
  )

  /** Run the bar to 100 and leave it there just long enough to be seen. */
  const holdComplete = () => {
    report(100, "done")
    setIsFinishing(true)
    if (holdTimer.current) clearTimeout(holdTimer.current)
    holdTimer.current = setTimeout(
      () => setIsFinishing(false),
      COMPLETION_HOLD_MS
    )
  }

  const fail = (key: string) => {
    if (errorTimer.current) clearTimeout(errorTimer.current)
    if (holdTimer.current) clearTimeout(holdTimer.current)
    setIsFinishing(false)
    setErrorKey(key)
    setStatus("error")
    errorTimer.current = setTimeout(() => {
      setErrorKey(null)
      setStatus("idle")
    }, ERROR_VISIBLE_MS)
  }

  const report = (percentage: number, statusKey: string) =>
    setProgress({ percentage, statusKey })

  const readTextFile = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          report(Math.round((event.loaded / event.total) * 100), "reading")
        }
      }
      reader.onload = () => resolve(String(reader.result ?? ""))
      reader.onerror = () => reject(new Error("readFailed"))
      reader.readAsText(file, "UTF-8")
    })

  const readPdfFile = async (file: File) => {
    report(0, "loadingLibrary")
    const pdfjs = await import("pdfjs-dist")
    // Bundled, not fetched from unpkg.com. The old protocol-relative CDN URL
    // meant every PDF upload hit a third party, broke offline, and could load
    // a worker whose version had drifted from the library.
    pdfjs.GlobalWorkerOptions.workerSrc = new URL(
      "pdfjs-dist/build/pdf.worker.min.mjs",
      import.meta.url
    ).toString()

    const pdf = await pdfjs.getDocument({ data: await file.arrayBuffer() })
      .promise
    const pages: string[] = []

    for (let page = 1; page <= pdf.numPages; page++) {
      report(Math.round((page / pdf.numPages) * 100), "reading")
      const content = await (await pdf.getPage(page)).getTextContent()
      const text = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim()
      if (text) pages.push(text)
    }

    return pages.join("\n\n")
  }

  const readDocxFile = async (file: File) => {
    report(0, "loadingLibrary")
    const mammoth = await import("mammoth")
    report(50, "reading")
    const { value } = await mammoth.extractRawText({
      arrayBuffer: await file.arrayBuffer()
    })
    return value
  }

  const importFile = async (file: File) => {
    const extension = file.name.includes(".")
      ? `.${file.name.split(".").pop()?.toLowerCase()}`
      : ""

    if (!SUPPORTED_EXTENSIONS.includes(extension as ".txt")) {
      return fail("unsupportedFormat")
    }
    if (file.size > MAX_FILE_SIZE) return fail("fileTooLarge")

    setStatus("reading")
    setErrorKey(null)
    setProgress(INITIAL_PROGRESS)

    try {
      const raw =
        extension === ".pdf"
          ? await readPdfFile(file)
          : extension === ".docx"
            ? await readDocxFile(file)
            : await readTextFile(file)

      setFileName(file.name)
      onText(normalizeText(raw))
      setStatus("done")
      holdComplete()
    } catch (error) {
      // The thrown message is a LIBRARY message, not one of our i18n keys.
      // Passing it through used to render `errors.Invalid PDF structure` to
      // the user as a literal string.
      console.error("File import failed:", error)
      fail("readFailed")
    }
  }

  const download = async (text: string, format: DownloadFormat) => {
    if (!text.trim()) return
    const base = stripExtension(fileName ?? "webiston-natija")

    if (format === "txt") {
      saveBlob(
        new Blob([text], { type: "text/plain;charset=utf-8" }),
        `${base}.txt`
      )
      return
    }

    setStatus("exporting")
    // Reset, or the bar opens at whatever the last import left it on and the
    // first thing the user sees is a jump backwards.
    setProgress(INITIAL_PROGRESS)
    try {
      report(10, "loadingLibrary")
      const { Document, Packer, Paragraph, TextRun } = await import("docx")
      report(45, "reading")
      const doc = new Document({
        sections: [
          {
            properties: {},
            children: text.split("\n").map(
              (line) =>
                new Paragraph({
                  children: [new TextRun({ text: line, size: 24 })],
                  spacing: { after: 160 }
                })
            )
          }
        ]
      })
      saveBlob(await Packer.toBlob(doc), `${base}.docx`)
      setStatus("done")
      holdComplete()
    } catch (error) {
      console.error("DOCX export failed:", error)
      fail("exportFailed")
    }
  }

  const resetFile = () => {
    setFileName(null)
    setStatus("idle")
    setProgress(INITIAL_PROGRESS)
    setErrorKey(null)
  }

  return {
    fileName,
    status,
    progress,
    errorKey,
    isBusy: status === "reading" || status === "exporting",
    /**
     * Whether the progress bar should be on screen. Wider than `isBusy` by the
     * completion hold — the panels must show the result the instant it exists,
     * but the bar still owes the user the last stretch to 100%.
     */
    showProgress: status === "reading" || status === "exporting" || isFinishing,
    maxFileSizeMb: MAX_FILE_SIZE_MB,
    importFile,
    download,
    resetFile
  }
}

export type UseFileImportResult = ReturnType<typeof useFileImport>
