/**
 * File import/export types
 */

/** Where the import/export pipeline is right now. */
export type FileImportStatus =
  | "idle"
  | "reading"
  | "exporting"
  | "done"
  | "error"

/** Formats we can write. TXT and DOCX both carry Cyrillic without help. */
export type DownloadFormat = "txt" | "docx"

/** `statusKey` is an i18n key under `file.progress`, never a literal. */
export interface ImportProgress {
  percentage: number
  statusKey: string
}
