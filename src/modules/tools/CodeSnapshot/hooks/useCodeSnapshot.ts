"use client"

import { type RefObject, useCallback, useState } from "react"

import type { CodeFontId, ExportFormatId, ExportScale } from "../constants"
import type { Layout, SnapshotOptions } from "../types"
import { useSnapshotPainter } from "./useSnapshotPainter"
import { useSnapshotSettings } from "./useSnapshotSettings"
import { useSnapshotSharing } from "./useSnapshotSharing"
import { useSnapshotSource } from "./useSnapshotSource"
import { useSnapshotTokens } from "./useSnapshotTokens"

/**
 * The composition root. It wires five hooks together and owns nothing but the
 * error slot and the two places where their concerns genuinely meet.
 *
 * | hook | question it answers |
 * | --- | --- |
 * | `useSnapshotSettings` | what has the visitor chosen? |
 * | `useSnapshotTokens` | what colour is each run of that code? |
 * | `useSnapshotPainter` | where does it go on the canvas? |
 * | `useSnapshotSource` | where did this code come from, and is it tidy? |
 * | `useSnapshotSharing` | how does the picture leave the page? |
 *
 * This file used to be all five at once, at 693 lines — more than twice the
 * 300-line ceiling in `code-rules.md` §7, and the reason a change to the paint
 * meant reading the share encoder to be sure it was safe.
 *
 * The error slot lives here rather than in any one of them because all five
 * write to it and the UI reads one line. It is a plain string key into
 * `errors.*` in the message bundle, never a sentence — the hooks are not
 * allowed to know what language the reader speaks.
 */

interface UseCodeSnapshot {
  code: string
  setCode: (code: string) => void
  language: string
  setLanguage: (language: string) => void
  /**
   * The chosen face.
   *
   * Held in the hook rather than in the component because it is part of the
   * shared state: a link that restores the code, the theme and the padding but
   * not the font reopens a different picture.
   */
  font: CodeFontId
  setFont: (font: CodeFontId) => void
  theme: string
  setTheme: (theme: string) => void
  options: SnapshotOptions
  updateOptions: (patch: Partial<SnapshotOptions>) => void
  /** Apply a ready-made look. Never touches the code, language or font. */
  applyPreset: (id: string) => void
  /** Put a line in or out of the focus set. POSITIONAL, 1-based. */
  toggleLineFocus: (line: number) => void
  clearLineFocus: () => void
  scale: ExportScale
  setScale: (scale: ExportScale) => void
  /**
   * The file the DOWNLOAD produces. The clipboard is always PNG — see
   * `utils/export.ts`; no engine reliably accepts anything else.
   */
  exportFormat: ExportFormatId
  setExportFormat: (format: ExportFormatId) => void
  canvasRef: RefObject<HTMLCanvasElement | null>
  /** A second canvas holding the PREVIOUS frame, dissolved over the new one. */
  ghostRef: RefObject<HTMLCanvasElement | null>
  layout: Layout | null
  /** The theme's foreground, so the caret belongs to the picture. */
  foreground: string
  effectiveScale: ExportScale | null
  /** Set when something the visitor did could not be completed. */
  error: string | null
  dismissError: () => void
  download: () => Promise<boolean>
  copy: () => Promise<boolean>
  format: () => Promise<boolean>
  formatting: boolean
  formattable: boolean
  onPaste: (pasted: string) => void
  detected: { from: string; to: string } | null
  undoDetection: () => void
  dropFile: (file: File) => Promise<void>
  /**
   * Put a link to this exact picture on the clipboard, and in the address bar.
   *
   * False when the clipboard refused — the caller has to say so, because a
   * share button that silently does nothing is worse than no share button.
   */
  copyLink: () => Promise<boolean>
  reset: () => void
}

export function useCodeSnapshot(
  fontFamilies: Record<CodeFontId, string>
): UseCodeSnapshot {
  const [error, setError] = useState<string | null>(null)
  const dismissError = useCallback(() => setError(null), [])

  const settings = useSnapshotSettings(fontFamilies)

  const tokens = useSnapshotTokens({
    code: settings.code,
    language: settings.language,
    theme: settings.theme,
    onError: setError
  })

  const painter = useSnapshotPainter({
    tokens,
    theme: settings.theme,
    options: settings.options,
    scale: settings.scale,
    onError: setError
  })

  const source = useSnapshotSource({
    code: settings.code,
    language: settings.language,
    setCode: settings.setCode,
    setLanguage: settings.setLanguage,
    setOptions: settings.setOptions,
    onError: setError
  })

  const sharing = useSnapshotSharing({
    canvasRef: painter.canvasRef,
    code: settings.code,
    language: settings.language,
    theme: settings.theme,
    font: settings.font,
    scale: settings.scale,
    options: settings.options,
    exportFormat: settings.exportFormat,
    restore: settings.restore,
    onError: setError
  })

  /**
   * A manual choice retires the detection notice.
   *
   * Without this the "detected X — undo" line survives the visitor picking
   * something else by hand, and its undo would then revert a decision they
   * made deliberately two clicks ago. It is composed here rather than inside
   * either hook because it is the one place both are in scope.
   */
  const { clearDetection } = source
  const { setLanguage: setLanguageState } = settings
  const setLanguage = useCallback(
    (next: string) => {
      clearDetection()
      setLanguageState(next)
    },
    [clearDetection, setLanguageState]
  )

  const { reset: resetSettings } = settings
  const reset = useCallback(() => {
    setError(null)
    clearDetection()
    resetSettings()
  }, [clearDetection, resetSettings])

  return {
    code: settings.code,
    setCode: settings.setCode,
    language: settings.language,
    setLanguage,
    font: settings.font,
    setFont: settings.setFont,
    theme: settings.theme,
    setTheme: settings.setTheme,
    options: settings.options,
    updateOptions: settings.updateOptions,
    applyPreset: settings.applyPreset,
    toggleLineFocus: settings.toggleLineFocus,
    clearLineFocus: settings.clearLineFocus,
    scale: settings.scale,
    setScale: settings.setScale,
    exportFormat: settings.exportFormat,
    setExportFormat: settings.setExportFormat,
    canvasRef: painter.canvasRef,
    ghostRef: painter.ghostRef,
    layout: painter.layout,
    foreground: tokens.foreground,
    effectiveScale: painter.effectiveScale,
    error,
    dismissError,
    download: sharing.download,
    copy: sharing.copy,
    format: source.format,
    formatting: source.formatting,
    formattable: source.formattable,
    onPaste: source.onPaste,
    detected: source.detected,
    undoDetection: source.undoDetection,
    dropFile: source.dropFile,
    copyLink: sharing.copyLink,
    reset
  }
}
