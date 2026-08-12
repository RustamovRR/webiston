"use client"

import {
  type Dispatch,
  type SetStateAction,
  useCallback,
  useEffect,
  useState
} from "react"

import {
  type CodeFontId,
  DEFAULT_EXPORT_FORMAT,
  DEFAULT_EXPORT_SCALE,
  DEFAULT_FONT,
  DEFAULT_LANGUAGE,
  DEFAULT_OPTIONS,
  DEFAULT_THEME,
  type ExportFormatId,
  type ExportScale
} from "../constants"
import { STYLE_PRESETS } from "../constants/presets"
import type { SnapshotOptions } from "../types"
import type { SharedSnapshot } from "../utils/share-url"
import { normaliseSource } from "../utils/source-text"

/**
 * Everything the visitor has chosen, and nothing else.
 *
 * No canvas, no network, no Shiki — this hook is the tool's model, and the
 * three that follow it (`useSnapshotTokens`, `useSnapshotPainter`,
 * `useSnapshotSource`) are readers of it. Keeping the plain state here is what
 * lets each of those be reasoned about on its own: a bug in the paint cannot
 * be a bug in the preset, because the preset is a `setState` in this file and
 * the paint never writes.
 */

export const STARTER_CODE = `export function greet(name: string) {
  const greeting = \`Assalomu alaykum, \${name}!\`
  return greeting
}
`

/**
 * Everything a shared link restores.
 *
 * The decoder's own type, not a copy of it. `SharedSnapshot.options` omits
 * `fontFamily` on purpose — it is a CSS variable this build generated, so it
 * belongs to the machine and never travels in a link — and re-declaring the
 * shape here would quietly accept one that did.
 */
export type RestorableSettings = SharedSnapshot

export interface SnapshotSettings {
  code: string
  setCode: Dispatch<SetStateAction<string>>
  language: string
  /**
   * The RAW setter. The one the UI calls also retires the detection notice —
   * see `useCodeSnapshot`, which composes the two. Kept raw here so this file
   * has no opinion about a feature it does not own.
   */
  setLanguage: Dispatch<SetStateAction<string>>
  font: CodeFontId
  setFont: Dispatch<SetStateAction<CodeFontId>>
  theme: string
  setTheme: Dispatch<SetStateAction<string>>
  scale: ExportScale
  setScale: Dispatch<SetStateAction<ExportScale>>
  exportFormat: ExportFormatId
  setExportFormat: Dispatch<SetStateAction<ExportFormatId>>
  options: SnapshotOptions
  setOptions: Dispatch<SetStateAction<SnapshotOptions>>
  updateOptions: (patch: Partial<SnapshotOptions>) => void
  applyPreset: (id: string) => void
  toggleLineFocus: (line: number) => void
  clearLineFocus: () => void
  /** Reopen a shared picture. Everything at once, so no half-applied state. */
  restore: (shared: RestorableSettings) => void
  reset: () => void
}

export function useSnapshotSettings(
  fontFamilies: Record<CodeFontId, string>
): SnapshotSettings {
  const [code, setCodeState] = useState(STARTER_CODE)

  /**
   * The ONE way code enters this tool, and it normalises on the way in.
   *
   * Typing, pasting, dropping a file, Prettier and a shared link all end up
   * here, which is the point: a tab that reaches the state is a tab the canvas
   * draws as a single space while the textarea over it advances two columns,
   * and the caret is off its glyph from there on. See `utils/source-text.ts`
   * for the measurement.
   *
   * `normaliseSource` returns the same reference when there is nothing to
   * change, so the ordinary keystroke costs two scans and no re-render.
   */
  const setCode = useCallback<Dispatch<SetStateAction<string>>>((value) => {
    setCodeState((current) =>
      normaliseSource(typeof value === "function" ? value(current) : value)
    )
  }, [])
  const [font, setFont] = useState<CodeFontId>(DEFAULT_FONT)
  const fontFamily = fontFamilies[font]
  const [language, setLanguage] = useState(DEFAULT_LANGUAGE)
  const [theme, setTheme] = useState<string>(DEFAULT_THEME)
  const [scale, setScale] = useState<ExportScale>(DEFAULT_EXPORT_SCALE)
  const [exportFormat, setExportFormat] = useState<ExportFormatId>(
    DEFAULT_EXPORT_FORMAT
  )
  const [options, setOptions] = useState<SnapshotOptions>({
    ...DEFAULT_OPTIONS,
    fontFamily
  })

  // The chosen font has to reach the options, and it arrives from the route as
  // a CSS variable that is not known when the defaults are declared.
  useEffect(() => {
    setOptions((current) =>
      current.fontFamily === fontFamily ? current : { ...current, fontFamily }
    )
  }, [fontFamily])

  const updateOptions = useCallback((patch: Partial<SnapshotOptions>) => {
    setOptions((current) => ({ ...current, ...patch }))
  }, [])

  /**
   * Apply a ready-made look.
   *
   * A patch over the current options rather than a replacement: a preset is a
   * starting point, and the window title someone typed is not part of the
   * look. The font is deliberately absent from every preset — see
   * `constants/presets.ts`.
   */
  const applyPreset = useCallback((id: string) => {
    const preset = STYLE_PRESETS.find((item) => item.id === id)
    if (!preset) return
    setTheme(preset.theme)
    setOptions((current) => ({ ...current, ...preset.patch }))
  }, [])

  /**
   * Put a line in or out of the focus set.
   *
   * The number is POSITIONAL — first line is 1 — not the number printed in the
   * gutter. `firstLineNumber` lets a snippet lifted from line 340 say so, and
   * the layout dims by position (`focus.has(index + 1)`), so the two must not
   * be confused. The button's label uses the printed number, because that is
   * what the reader can see.
   */
  const toggleLineFocus = useCallback((line: number) => {
    setOptions((current) => {
      const next = new Set(current.focusLines)
      // `delete` reports whether it removed anything, which is the toggle.
      if (!next.delete(line)) next.add(line)
      return { ...current, focusLines: [...next].sort((a, b) => a - b) }
    })
  }, [])

  const clearLineFocus = useCallback(() => {
    setOptions((current) =>
      current.focusLines.length === 0 ? current : { ...current, focusLines: [] }
    )
  }, [])

  const restore = useCallback(
    (shared: RestorableSettings) => {
      setCode(shared.code)
      setLanguage(shared.language)
      setTheme(shared.theme)
      setFont(shared.font)
      setScale(shared.scale)
      // `fontFamily` is a CSS variable this build generated; it belongs to the
      // machine, never to the link.
      setOptions((current) => ({
        ...shared.options,
        fontFamily: current.fontFamily
      }))
    },
    [setCode]
  )

  const reset = useCallback(() => {
    setCode(STARTER_CODE)
    setLanguage(DEFAULT_LANGUAGE)
    setTheme(DEFAULT_THEME)
    setScale(DEFAULT_EXPORT_SCALE)
    setExportFormat(DEFAULT_EXPORT_FORMAT)
    setOptions({ ...DEFAULT_OPTIONS, fontFamily })
  }, [fontFamily, setCode])

  return {
    code,
    setCode,
    language,
    setLanguage,
    font,
    setFont,
    theme,
    setTheme,
    scale,
    setScale,
    exportFormat,
    setExportFormat,
    options,
    setOptions,
    updateOptions,
    applyPreset,
    toggleLineFocus,
    clearLineFocus,
    restore,
    reset
  }
}
