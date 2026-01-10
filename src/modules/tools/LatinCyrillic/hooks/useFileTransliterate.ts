/**
 * Hook for file upload and download functionality
 * Supports TXT, PDF, DOCX upload and TXT/DOCX download
 * Includes chunked processing for large files
 */

import { useState } from "react"
import type {
  DownloadFormat,
  FileProcessingStatus,
  ProcessingProgress,
  TextChunk,
  UseFileTransliterateResult
} from "../types"

// Max file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024

// Supported extensions
const SUPPORTED_EXTENSIONS = [".txt", ".pdf", ".docx"]

// Chunk size: 50,000 characters (~10-15 pages)
const CHUNK_SIZE = 50000

// Initial progress state
const INITIAL_PROGRESS: ProcessingProgress = {
  current: 0,
  total: 0,
  percentage: 0,
  statusKey: ""
}

// Split text into chunks
function splitIntoChunks(text: string): TextChunk[] {
  if (text.length <= CHUNK_SIZE) {
    return [
      {
        id: 0,
        text,
        charCount: text.length,
        label: "all"
      }
    ]
  }

  const chunks: TextChunk[] = []
  let currentIndex = 0
  let chunkId = 0

  while (currentIndex < text.length) {
    let endIndex = currentIndex + CHUNK_SIZE

    // Try to break at paragraph or sentence boundary
    if (endIndex < text.length) {
      // Look for paragraph break
      const paragraphBreak = text.lastIndexOf("\n\n", endIndex)
      if (paragraphBreak > currentIndex + CHUNK_SIZE * 0.7) {
        endIndex = paragraphBreak + 2
      } else {
        // Look for sentence break
        const sentenceBreak = text.lastIndexOf(". ", endIndex)
        if (sentenceBreak > currentIndex + CHUNK_SIZE * 0.7) {
          endIndex = sentenceBreak + 2
        }
      }
    }

    const chunkText = text.slice(currentIndex, endIndex)
    chunks.push({
      id: chunkId,
      text: chunkText,
      charCount: chunkText.length,
      label: `chunk_${chunkId + 1}`
    })

    currentIndex = endIndex
    chunkId++
  }

  return chunks
}

export function useFileTransliterate(
  onTextLoaded?: (text: string) => void
): UseFileTransliterateResult {
  const [isProcessing, setIsProcessing] = useState(false)
  const [status, setStatus] = useState<FileProcessingStatus>("idle")
  const [progress, setProgress] = useState<ProcessingProgress>(INITIAL_PROGRESS)
  const [error, setError] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [chunks, setChunks] = useState<TextChunk[]>([])
  const [selectedChunkId, setSelectedChunkId] = useState<number | null>(null)

  // Update progress helper
  const updateProgress = (
    current: number,
    total: number,
    statusKey: string
  ) => {
    setProgress({
      current,
      total,
      percentage: total > 0 ? Math.round((current / total) * 100) : 0,
      statusKey
    })
  }

  // Reset state
  const reset = () => {
    setIsProcessing(false)
    setStatus("idle")
    setProgress(INITIAL_PROGRESS)
    setError(null)
    setFileName(null)
    setChunks([])
    setSelectedChunkId(null)
  }

  // Auto-clear error after timeout
  const setErrorWithTimeout = (errorKey: string, timeout = 5000) => {
    setError(errorKey)
    setStatus("error")

    // Auto-clear after timeout
    setTimeout(() => {
      setError(null)
      setStatus("idle")
    }, timeout)
  }

  // Validate file
  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return "fileTooLarge"
    }

    const extension = `.${file.name.split(".").pop()?.toLowerCase()}`
    if (!SUPPORTED_EXTENSIONS.includes(extension)) {
      return "unsupportedFormat"
    }

    return null
  }

  // Read TXT file
  const readTextFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()

      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          updateProgress(event.loaded, event.total, "readingTxt")
        }
      }

      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new Error("txtReadError"))
      reader.readAsText(file, "UTF-8")
    })
  }

  // Read PDF file
  const readPdfFile = async (file: File): Promise<string> => {
    updateProgress(0, 100, "loadingPdfLibrary")

    const pdfjsLib = await import("pdfjs-dist")
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`

    const arrayBuffer = await file.arrayBuffer()
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise

    const totalPages = pdf.numPages
    let fullText = ""

    for (let i = 1; i <= totalPages; i++) {
      updateProgress(i, totalPages, "readingPage")

      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      const pageText = content.items
        .map((item: any) => item.str)
        .join(" ")
        .replace(/\s+/g, " ")

      fullText += `${pageText}\n\n`
    }

    return fullText.trim()
  }

  // Read DOCX file
  const readDocxFile = async (file: File): Promise<string> => {
    updateProgress(0, 100, "loadingDocxLibrary")

    const mammoth = await import("mammoth")

    updateProgress(50, 100, "readingDocx")

    const arrayBuffer = await file.arrayBuffer()
    const result = await mammoth.extractRawText({ arrayBuffer })

    updateProgress(100, 100, "docxReady")

    return result.value
  }

  // Upload file
  const uploadFile = async (file: File): Promise<string | null> => {
    reset()

    const validationError = validateFile(file)
    if (validationError) {
      setErrorWithTimeout(validationError)
      return null
    }

    try {
      setIsProcessing(true)
      setStatus("reading")
      setFileName(file.name)

      const extension = file.name.split(".").pop()?.toLowerCase()
      let text = ""

      switch (extension) {
        case "txt":
          text = await readTextFile(file)
          break
        case "pdf":
          text = await readPdfFile(file)
          break
        case "docx":
          text = await readDocxFile(file)
          break
        default:
          throw new Error("unknownFormat")
      }

      // Split into chunks
      setStatus("processing")
      updateProgress(0, 100, "processingChunks")

      const textChunks = splitIntoChunks(text)
      setChunks(textChunks)

      // If multiple chunks, select first one
      if (textChunks.length > 1) {
        setSelectedChunkId(0)
        if (onTextLoaded) {
          onTextLoaded(textChunks[0].text)
        }
      } else {
        setSelectedChunkId(null)
        if (onTextLoaded) {
          onTextLoaded(text)
        }
      }

      setStatus("success")
      updateProgress(100, 100, "ready")

      return text
    } catch (err) {
      const errorKey = err instanceof Error ? err.message : "unknownError"
      setErrorWithTimeout(errorKey)
      return null
    } finally {
      setIsProcessing(false)
    }
  }

  // Select chunk
  const selectChunk = (chunkId: number | null) => {
    setSelectedChunkId(chunkId)

    if (chunkId === null) {
      // Select all - combine all chunks
      const fullText = chunks.map((c) => c.text).join("")
      if (onTextLoaded) {
        onTextLoaded(fullText)
      }
    } else {
      const chunk = chunks.find((c) => c.id === chunkId)
      if (chunk && onTextLoaded) {
        onTextLoaded(chunk.text)
      }
    }
  }

  // Download as TXT
  const downloadAsText = (text: string, customFileName?: string) => {
    if (!text.trim()) return

    const blob = new Blob([text], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")

    const baseName = customFileName || fileName || "transliterated"
    const outputName = `${baseName.replace(/\.[^/.]+$/, "")}.txt`

    link.href = url
    link.download = outputName
    link.click()

    URL.revokeObjectURL(url)
  }

  // Download as DOCX
  const downloadAsDocx = async (text: string, customFileName?: string) => {
    if (!text.trim()) return

    try {
      setIsProcessing(true)
      setStatus("processing")
      updateProgress(0, 100, "creatingDocx")

      const { Document, Packer, Paragraph, TextRun } = await import("docx")

      const paragraphs = text.split("\n").map(
        (line) =>
          new Paragraph({
            children: [
              new TextRun({
                text: line,
                size: 24
              })
            ],
            spacing: { after: 200 }
          })
      )

      updateProgress(50, 100, "formattingDocx")

      const doc = new Document({
        sections: [{ properties: {}, children: paragraphs }]
      })

      const blob = await Packer.toBlob(doc)
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")

      const baseName = customFileName || fileName || "transliterated"
      const outputName = `${baseName.replace(/\.[^/.]+$/, "")}.docx`

      link.href = url
      link.download = outputName
      link.click()

      URL.revokeObjectURL(url)

      updateProgress(100, 100, "downloaded")
      setStatus("success")
    } catch (err) {
      console.error("DOCX export error:", err)
      setErrorWithTimeout("docxExportError")
    } finally {
      setIsProcessing(false)
    }
  }

  // Download all chunks as single file
  const downloadAllChunks = async (
    allChunks: TextChunk[],
    format: DownloadFormat
  ) => {
    const fullText = allChunks.map((c) => c.text).join("\n\n---\n\n")

    if (format === "txt") {
      downloadAsText(fullText, `${fileName || "document"}_full`)
    } else {
      await downloadAsDocx(fullText, `${fileName || "document"}_full`)
    }
  }

  // Drag & drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      await uploadFile(files[0])
    }
  }

  return {
    isProcessing,
    status,
    progress,
    error,
    fileName,
    chunks,
    selectedChunkId,
    hasMultipleChunks: chunks.length > 1,
    uploadFile,
    downloadAsText,
    downloadAsDocx,
    downloadAllChunks,
    selectChunk,
    reset,
    isDragging,
    handleDragEnter,
    handleDragLeave,
    handleDragOver,
    handleDrop
  }
}
