/**
 * File upload/download types
 */

// Supported file types
export type SupportedFileType = "txt" | "pdf" | "docx"

// File processing status
export type FileProcessingStatus =
  | "idle"
  | "reading"
  | "processing"
  | "success"
  | "error"

// File upload result
export interface FileUploadResult {
  success: boolean
  text: string
  fileName: string
  fileSize: number
  error?: string
}

// Download format options
export type DownloadFormat = "txt" | "docx"

// Processing progress info
export interface ProcessingProgress {
  current: number
  total: number
  percentage: number
  statusKey: string // i18n key instead of hardcoded text
}

// Text chunk for large files
export interface TextChunk {
  id: number
  text: string
  charCount: number
  label: string
}

// File upload hook return type
export interface UseFileTransliterateResult {
  // State
  isProcessing: boolean
  status: FileProcessingStatus
  progress: ProcessingProgress
  error: string | null
  fileName: string | null
  chunks: TextChunk[]
  selectedChunkId: number | null
  hasMultipleChunks: boolean

  // Actions
  uploadFile: (file: File) => Promise<string | null>
  downloadAsText: (text: string, fileName?: string) => void
  downloadAsDocx: (text: string, fileName?: string) => Promise<void>
  downloadAllChunks: (
    chunks: TextChunk[],
    format: DownloadFormat
  ) => Promise<void>
  selectChunk: (chunkId: number | null) => void
  reset: () => void

  // Drag & drop
  isDragging: boolean
  handleDragEnter: (e: React.DragEvent) => void
  handleDragLeave: (e: React.DragEvent) => void
  handleDragOver: (e: React.DragEvent) => void
  handleDrop: (e: React.DragEvent) => Promise<void>
}
