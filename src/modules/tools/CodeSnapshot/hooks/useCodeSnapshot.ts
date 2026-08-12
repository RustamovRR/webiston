"use client"

import { type RefObject, useCallback, useEffect, useRef, useState } from "react"

import {
  DEFAULT_EXPORT_SCALE,
  DEFAULT_LANGUAGE,
  DEFAULT_OPTIONS,
  DEFAULT_THEME,
  type ExportScale,
  FALLBACK_BACKGROUND,
  FALLBACK_FOREGROUND
} from "../constants"
import type { CodeLine, Layout, SnapshotOptions } from "../types"
import { fittingScale } from "../utils/canvas-limits"
import { detectLanguage } from "../utils/detect"
import {
  copySnapshotToClipboard,
  downloadSnapshot,
  snapshotFileName
} from "../utils/export"
import { readDroppedFile } from "../utils/file-drop"
import { canFormat, formatCode } from "../utils/format"
import { highlightToLines, resolveLanguage } from "../utils/highlight"
import { layoutSnapshot } from "../utils/layout"
import { createMeasurer, paintSnapshot } from "../utils/paint"

/**
 * How long the reader may keep typing before we re-tokenise.
 *
 * Shiki's tokeniser is fast but not free, and a grammar's first use also pulls
 * a chunk over the network. 120ms is under the threshold where an edit stops
 * feeling live, and it collapses a burst of keystrokes into one pass.
 */
const RETOKENISE_DELAY = 120

interface UseCodeSnapshot {
  code: string
  setCode: (code: string) => void
  language: string
  setLanguage: (language: string) => void
  theme: string
  setTheme: (theme: string) => void
  options: SnapshotOptions
  updateOptions: (patch: Partial<SnapshotOptions>) => void
  /** Put a line in or out of the focus set. POSITIONAL, 1-based. */
  toggleLineFocus: (line: number) => void
  clearLineFocus: () => void
  scale: ExportScale
  setScale: (scale: ExportScale) => void
  canvasRef: RefObject<HTMLCanvasElement | null>
  /**
   * The geometry of the picture on screen — null before the first paint.
   *
   * The whole `Layout`, not just its size, because the editor overlay has to
   * sit at `codeX` on the first line's `top` with the layout's own line
   * height. Handing back a width and a height would make the component
   * re-derive coordinates the layout already computed, which is exactly how
   * two sources of truth start.
   */
  layout: Layout | null
  /** The theme's foreground, so the caret belongs to the picture. */
  foreground: string
  /**
   * The scale actually used, which is not always the one chosen: past the
   * browser's canvas cap the export silently produces nothing, so it is
   * stepped down and the UI has to say so.
   */
  effectiveScale: ExportScale | null
  /** Set when something the visitor did could not be completed. */
  error: string | null
  dismissError: () => void
  download: () => Promise<boolean>
  copy: () => Promise<boolean>
  /** Prettier, on the current code. False when it could not parse. */
  format: () => Promise<boolean>
  /** True while the plugin chunks are downloading — the first press is slow. */
  formatting: boolean
  /** Whether Prettier has a parser for the chosen language at all. */
  formattable: boolean
  /** Call with the text of a paste; switches the language when it is sure. */
  onPaste: (pasted: string) => void
  /**
   * The language the last paste changed, and what it changed FROM.
   *
   * Present only while the notice is on screen. A detector that silently
   * replaces a choice the visitor made is a detector nobody trusts, so what
   * it did is stated and undoable.
   */
  detected: { from: string; to: string } | null
  undoDetection: () => void
  /** A file dragged onto the editor: its contents, language and name. */
  dropFile: (file: File) => Promise<void>
  reset: () => void
}

const STARTER_CODE = `export function greet(name: string) {
  const greeting = \`Assalomu alaykum, \${name}!\`
  return greeting
}
`

export function useCodeSnapshot(fontFamily: string): UseCodeSnapshot {
  const [code, setCode] = useState(STARTER_CODE)
  const [language, setLanguageState] = useState(DEFAULT_LANGUAGE)
  const [theme, setTheme] = useState<string>(DEFAULT_THEME)
  const [scale, setScale] = useState<ExportScale>(DEFAULT_EXPORT_SCALE)
  const [options, setOptions] = useState<SnapshotOptions>({
    ...DEFAULT_OPTIONS,
    fontFamily
  })

  const [lines, setLines] = useState<CodeLine[]>([])
  const [colours, setColours] = useState({
    foreground: FALLBACK_FOREGROUND,
    editorBackground: FALLBACK_BACKGROUND
  })
  const [layout, setLayout] = useState<Layout | null>(null)
  const [error, setError] = useState<string | null>(null)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  // The chosen font has to reach the options, and it arrives from the route as
  // a CSS variable that is not known when the defaults are declared.
  useEffect(() => {
    setOptions((current) =>
      current.fontFamily === fontFamily ? current : { ...current, fontFamily }
    )
  }, [fontFamily])

  /**
   * Tokenise, debounced, and ignore results that arrive out of order.
   *
   * Two edits in flight can settle in either order — a language whose grammar
   * is already cached resolves immediately, while the previous one is still
   * fetching. Without the `stale` guard the older tokens win and the canvas
   * shows the previous snippet, intermittently and only on slow networks.
   */
  useEffect(() => {
    let stale = false
    const timer = setTimeout(() => {
      highlightToLines(code, language, theme)
        .then((result) => {
          if (stale) return
          setLines(result.lines)
          setColours({
            foreground: result.foreground,
            editorBackground: result.background
          })
          setError(null)
        })
        .catch(() => {
          // The last good tokens stay on screen — a grammar that failed to
          // download must not blank the picture. But it is SAID, because the
          // silent version leaves the reader picking a theme and watching
          // nothing change, with no way to know a retry is what they need.
          if (!stale) setError("highlight")
        })
    }, RETOKENISE_DELAY)

    return () => {
      stale = true
      clearTimeout(timer)
    }
  }, [code, language, theme])

  /**
   * Paint whenever anything visible changes — but only once the face is real.
   *
   * **Setting `ctx.font` does not download a webfont.** The CSS Font Loading
   * spec ties fetching to *rendered content*, and a canvas is not content: the
   * browser silently substitutes the fallback, and since `next/font` ships a
   * metric-adjusted fallback the result looks almost right, which is worse
   * than looking wrong. Every measurement and every glyph would come from a
   * face nobody chose.
   *
   * `document.fonts.load()` is the explicit request. All three variants are
   * asked for, because bold and italic are separate downloads and a comment
   * that renders italic would otherwise fall back on its own.
   */
  const [effectiveScale, setEffectiveScale] = useState<ExportScale | null>(
    scale
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !options.fontFamily) return

    let cancelled = false
    const spec = `${options.fontSize}px ${options.fontFamily}`

    Promise.all([
      document.fonts.load(spec),
      document.fonts.load(`700 ${spec}`),
      document.fonts.load(`italic ${spec}`)
    ])
      .then(() => document.fonts.ready)
      .then(() => {
        if (cancelled) return
        const measure = createMeasurer()
        const next = layoutSnapshot(lines, options, measure)

        // Past the browser's per-side canvas cap the picture is silently
        // empty: no throw, no event, and `toBlob` hands back null. Step down
        // to a scale that fits — or, when even 1x does not, stop rather than
        // paint something the visitor cannot download.
        const usable = fittingScale(next.width, next.height, scale)
        setEffectiveScale(usable)
        if (usable === null) {
          setLayout(null)
          setError("tooLarge")
          return
        }

        paintSnapshot(canvas, next, options, colours, usable)
        setLayout(next)
        setError(null)
      })
      // Without this the rejection is unhandled and the preview freezes on
      // the last good frame while every control keeps responding — the state
      // that looks most like "the tool is fine" and least like a failure.
      .catch(() => {
        if (!cancelled) setError("paint")
      })

    return () => {
      cancelled = true
    }
  }, [lines, options, colours, scale])

  const updateOptions = useCallback((patch: Partial<SnapshotOptions>) => {
    setOptions((current) => ({ ...current, ...patch }))
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

  /**
   * Both exits report success rather than throwing.
   *
   * An `onClick={download}` hands React a promise nobody awaits, so a
   * rejection from `toBlob` — which is exactly what an oversized canvas
   * produces — became an unhandled rejection in the console and *nothing at
   * all* on screen. Returning a boolean is what lets the caller show an error
   * instead of appearing to work.
   */
  const download = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return false
    try {
      await downloadSnapshot(canvas, snapshotFileName(options.title))
      return true
    } catch {
      setError("export")
      return false
    }
  }, [options.title])

  const copy = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return false
    try {
      await copySnapshotToClipboard(canvas)
      return true
    } catch {
      return false
    }
  }, [])

  const dismissError = useCallback(() => setError(null), [])

  const [detected, setDetected] = useState<{
    from: string
    to: string
  } | null>(null)

  /**
   * Detect the language of a paste, and only of a paste.
   *
   * Not on every keystroke: half-typed code changes its apparent language as
   * it is written — `def` alone is Python, `def foo` still is, and a picker
   * that flickers between grammars while you type is unusable. A paste is a
   * complete thought, which is the only moment the evidence is worth reading.
   *
   * `detectLanguage` returns `null` whenever it is unsure, and that is
   * honoured exactly: no guess, no change, no notice.
   */
  const onPaste = useCallback(
    (pasted: string) => {
      const guess = detectLanguage(pasted)
      if (!guess || guess === language) return
      setDetected({ from: language, to: guess })
      setLanguageState(guess)
    },
    [language]
  )

  const undoDetection = useCallback(() => {
    if (detected) setLanguageState(detected.from)
    setDetected(null)
  }, [detected])

  /**
   * A manual choice retires the notice.
   *
   * Without this the "detected X — undo" line survives the visitor picking
   * something else by hand, and its undo would then revert a decision they
   * made deliberately two clicks ago.
   */
  const setLanguage = useCallback((next: string) => {
    setDetected(null)
    setLanguageState(next)
  }, [])

  /**
   * A dropped file: code, language and window title in one gesture.
   *
   * The extension is trusted OVER the content scorer, and the order matters:
   * a `.rs` file is Rust because its author said so, and no amount of pattern
   * matching outranks that. `detectLanguage` is the fallback for the cases the
   * extension cannot answer — a `.txt` holding Python, or a file with no
   * extension at all.
   *
   * The filename also becomes the window title. That is the whole reason
   * anyone types in that field, and here it is already known.
   */
  const dropFile = useCallback(
    async (file: File) => {
      let dropped: Awaited<ReturnType<typeof readDroppedFile>>
      try {
        dropped = await readDroppedFile(file)
      } catch (failure) {
        setError(
          failure instanceof Error && failure.message
            ? failure.message
            : "unreadable"
        )
        return
      }

      const next = dropped.language ?? detectLanguage(dropped.code)
      setCode(dropped.code)
      setOptions((current) => ({ ...current, title: dropped.title }))
      setError(null)
      if (next && next !== language) {
        setDetected({ from: language, to: next })
        setLanguageState(next)
      }
    },
    [language]
  )

  const [formatting, setFormatting] = useState(false)

  /**
   * Format the code in place.
   *
   * The language is resolved first: the picker hands over canonical ids, but
   * URL state and paste-detection will not, and `canFormat("ts")` is false
   * while `canFormat("typescript")` is true — a silently dead button.
   *
   * A parse failure is REPORTED, not swallowed. Half-pasted code is the normal
   * state of a snippet, so "this does not parse" is the single most useful
   * thing this button can say when it cannot do its job.
   */
  const format = useCallback(async () => {
    const lang = resolveLanguage(language)
    if (!canFormat(lang)) return false
    setFormatting(true)
    try {
      setCode(await formatCode(code, lang))
      setError(null)
      return true
    } catch {
      setError("format")
      return false
    } finally {
      setFormatting(false)
    }
  }, [code, language])

  const reset = useCallback(() => {
    setError(null)
    setDetected(null)
    setCode(STARTER_CODE)
    // The raw setter, not the wrapper: the line above has already cleared the
    // notice, and going through `setLanguage` would put a `useCallback` in
    // this one's dependency list for no behavioural difference.
    setLanguageState(DEFAULT_LANGUAGE)
    setTheme(DEFAULT_THEME)
    setScale(DEFAULT_EXPORT_SCALE)
    setOptions({ ...DEFAULT_OPTIONS, fontFamily })
  }, [fontFamily])

  return {
    code,
    setCode,
    language,
    setLanguage,
    theme,
    setTheme,
    options,
    updateOptions,
    toggleLineFocus,
    clearLineFocus,
    scale,
    setScale,
    canvasRef,
    layout,
    foreground: colours.foreground,
    effectiveScale,
    error,
    dismissError,
    download,
    copy,
    format,
    formatting,
    formattable: canFormat(resolveLanguage(language)),
    onPaste,
    detected,
    undoDetection,
    dropFile,
    reset
  }
}
