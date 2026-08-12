"use client"

import { type RefObject, useCallback, useEffect, useRef, useState } from "react"

import {
  type CodeFontId,
  DEFAULT_EXPORT_FORMAT,
  DEFAULT_EXPORT_SCALE,
  DEFAULT_FONT,
  DEFAULT_LANGUAGE,
  DEFAULT_OPTIONS,
  DEFAULT_THEME,
  type ExportFormatId,
  type ExportScale,
  FALLBACK_BACKGROUND,
  FALLBACK_FOREGROUND
} from "../constants"
import { STYLE_PRESETS } from "../constants/presets"
import type { CodeLine, Layout, SnapshotOptions } from "../types"
import { fittingScale } from "../utils/canvas-limits"
import { detectLanguage } from "../utils/detect"
import { copySnapshotToClipboard, downloadSnapshot } from "../utils/export"
import { readDroppedFile } from "../utils/file-drop"
import { canFormat, formatCode } from "../utils/format"
import { highlightToLines, resolveLanguage } from "../utils/highlight"
import { layoutSnapshot } from "../utils/layout"
import { createMeasurer, paintSnapshot } from "../utils/paint"
import { decodeSnapshot, encodeSnapshot } from "../utils/share-url"

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
  /**
   * The chosen face.
   *
   * Held HERE rather than in the component because it is part of the shared
   * state: a link that restores the code, the theme and the padding but not
   * the font reopens a different picture.
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
  /**
   * A second canvas holding the PREVIOUS frame, dissolved over the new one.
   *
   * A canvas cannot transition its contents — there is no property to ease —
   * so the only way to soften a repaint is to keep the old bitmap and fade it
   * out. Driven from here rather than from the component because the copy has
   * to be taken BEFORE the new frame is drawn, and this is where that happens.
   */
  ghostRef: RefObject<HTMLCanvasElement | null>
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
  /**
   * Put a link to this exact picture on the clipboard, and in the address bar.
   *
   * False when the clipboard refused — the caller has to say so, because a
   * share button that silently does nothing is worse than no share button.
   */
  copyLink: () => Promise<boolean>
  reset: () => void
}

const STARTER_CODE = `export function greet(name: string) {
  const greeting = \`Assalomu alaykum, \${name}!\`
  return greeting
}
`

export function useCodeSnapshot(
  fontFamilies: Record<CodeFontId, string>
): UseCodeSnapshot {
  const [code, setCode] = useState(STARTER_CODE)
  const [font, setFont] = useState<CodeFontId>(DEFAULT_FONT)
  const fontFamily = fontFamilies[font]
  const [language, setLanguageState] = useState(DEFAULT_LANGUAGE)
  const [theme, setTheme] = useState<string>(DEFAULT_THEME)
  const [scale, setScale] = useState<ExportScale>(DEFAULT_EXPORT_SCALE)
  const [exportFormat, setExportFormat] = useState<ExportFormatId>(
    DEFAULT_EXPORT_FORMAT
  )
  const [options, setOptions] = useState<SnapshotOptions>({
    ...DEFAULT_OPTIONS,
    fontFamily
  })

  /**
   * Tokens, colours and the theme they came from — in ONE piece of state.
   *
   * They used to be two (`lines`, `colours`), which meant the paint effect
   * could run with a new `options` object and colours from the PREVIOUS theme.
   * Choosing a preset changes both the theme and the options, so the picture
   * jumped to the new size in the old colours and then flashed again 278ms
   * later when the tokens landed — measured on the running page. Carrying the
   * theme alongside the tokens is what lets the painter refuse the first,
   * wrong frame.
   */
  const [tokens, setTokens] = useState<{
    lines: CodeLine[]
    foreground: string
    editorBackground: string
    theme: string
  }>({
    lines: [],
    foreground: FALLBACK_FOREGROUND,
    editorBackground: FALLBACK_BACKGROUND,
    theme: DEFAULT_THEME
  })
  const [layout, setLayout] = useState<Layout | null>(null)
  const [error, setError] = useState<string | null>(null)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const ghostRef = useRef<HTMLCanvasElement | null>(null)

  /**
   * Cross-fade the frame that is about to be replaced.
   *
   * NOT on every repaint. Typing must feel immediate — a character that
   * dissolves into place reads as lag, not polish — and copying a 1946×1016
   * bitmap on every debounced keystroke is real work for no gain. Only the
   * discrete changes get the dissolve: a theme, a preset, a font, a padding.
   *
   * Nothing here goes through React. The ghost is a DOM node whose opacity a
   * CSS transition owns; setting it to 1 and then to 0 on the next frame is
   * the whole animation. `prefers-reduced-motion` is honoured by the class on
   * the element itself.
   */
  const holdPreviousFrame = useCallback(() => {
    const canvas = canvasRef.current
    const ghost = ghostRef.current
    if (!canvas || !ghost || canvas.width === 0) return

    const context = ghost.getContext("2d")
    if (!context) return

    /**
     * The fade must never be able to take the picture down with it.
     *
     * It is decoration; the snapshot is the product. This is not theoretical —
     * adding the copy broke EVERY paint in the test suite at once, because the
     * canvas stub had no `drawImage` and the throw propagated out of the same
     * promise chain the paint lives in. A dissolve that fails should simply
     * not dissolve.
     */
    try {
      ghost.width = canvas.width
      ghost.height = canvas.height
      ghost.style.width = canvas.style.width
      ghost.style.height = canvas.style.height
      context.drawImage(canvas, 0, 0)
    } catch {
      return
    }

    /**
     * Commit the opaque state, then animate away from it — WITHOUT `rAF`.
     *
     * A transition needs the browser to have committed `opacity: 1` before it
     * will animate to 0; setting both in one task is a no-op. The obvious way
     * to get that commit is a nested `requestAnimationFrame`, and it is a trap:
     * **rAF does not run in a background tab.** Measured here — the ghost took
     * opacity 1 and never left it, so a stale frame sat permanently on top of
     * the live canvas and the picture looked frozen. A decoration that can
     * hide the product is not a decoration.
     *
     * Reading `offsetWidth` forces a synchronous style-and-layout flush, which
     * commits the 1 whatever the tab is doing. The next line then always
     * lands on 0, visible transition or not.
     */
    ghost.style.opacity = "1"
    void ghost.offsetWidth
    ghost.style.opacity = "0"
  }, [])

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
  const previousCode = useRef(code)
  /** True when the pending repaint was caused by typing, so it must not fade. */
  const typedRef = useRef(false)

  useEffect(() => {
    /**
     * The debounce is for TYPING, and only for typing.
     *
     * Picking a theme or a language is one discrete decision, not a burst, and
     * making it wait 120ms for a timer that exists to collapse keystrokes just
     * makes the tool feel slow — it was 120ms of the 278ms gap the owner saw
     * between a preset landing and the colours catching up.
     */
    const typed = previousCode.current !== code
    previousCode.current = code
    if (typed) typedRef.current = true

    let stale = false
    const timer = setTimeout(
      () => {
        highlightToLines(code, language, theme)
          .then((result) => {
            if (stale) return
            // One update, carrying the theme it was produced under. Two separate
            // ones let a paint slip between them.
            setTokens({
              lines: result.lines,
              foreground: result.foreground,
              editorBackground: result.background,
              theme
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
      },
      typed ? RETOKENISE_DELAY : 0
    )

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

    /**
     * Do not paint with colours from a theme nobody has chosen any more.
     *
     * The tokens carry the theme they were produced under. While a new theme
     * is still tokenising they belong to the old one, and painting anyway
     * produces a frame with the NEW geometry and the OLD palette — the first
     * of the two flashes measured on a preset change. Holding the last good
     * picture for those few milliseconds is invisible; the wrong frame is not.
     */
    if (tokens.theme !== theme) return

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
        const next = layoutSnapshot(tokens.lines, options, measure)

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

        if (!typedRef.current) holdPreviousFrame()
        typedRef.current = false
        paintSnapshot(canvas, next, options, tokens, usable)
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
  }, [tokens, theme, options, scale, holdPreviousFrame])

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
      await downloadSnapshot(canvas, options.title, exportFormat)
      return true
    } catch {
      setError("export")
      return false
    }
  }, [options.title, exportFormat])

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

  /**
   * Reopen a shared picture, once, on arrival.
   *
   * Read from the HASH: it never reaches the server, so a few thousand
   * characters of source cannot produce a 414 from an edge nobody can
   * reproduce locally, and Next's router does not re-render on it.
   *
   * A link that does not decode is IGNORED rather than reported. Junk after
   * the `#` is far more often a stray character in a chat client than a
   * message worth showing, and the visitor still gets a working tool.
   */
  useEffect(() => {
    const fragment = window.location.hash.slice(1)
    if (!fragment) return

    let cancelled = false
    decodeSnapshot(fragment)
      .then((shared) => {
        if (!shared || cancelled) return
        setCode(shared.code)
        setLanguageState(shared.language)
        setTheme(shared.theme)
        setFont(shared.font)
        setScale(shared.scale)
        // `fontFamily` is a CSS variable this build generated; it belongs to
        // the machine, never to the link.
        setOptions((current) => ({
          ...shared.options,
          fontFamily: current.fontFamily
        }))
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [])

  /**
   * Build the link, put it on the clipboard, and show it in the address bar.
   *
   * Written ON DEMAND, not on every keystroke. A hash that rewrites itself as
   * you type fills the address bar with noise for a value nobody asked for
   * yet, and the button has to produce a fresh link anyway.
   *
   * `replaceState`, never `pushState`: pressing a copy button is not
   * navigation, and stacking history entries would turn the back button into
   * an undo nobody expects.
   */
  const copyLink = useCallback(async () => {
    try {
      const fragment = await encodeSnapshot({
        code,
        language,
        theme,
        font,
        scale,
        options
      })
      const url = `${window.location.origin}${window.location.pathname}#${fragment}`
      await navigator.clipboard.writeText(url)
      window.history.replaceState(null, "", `#${fragment}`)
      return true
    } catch {
      setError("link")
      return false
    }
  }, [code, language, theme, font, scale, options])

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
    setExportFormat(DEFAULT_EXPORT_FORMAT)
    setOptions({ ...DEFAULT_OPTIONS, fontFamily })
  }, [fontFamily])

  return {
    code,
    setCode,
    language,
    setLanguage,
    font,
    setFont,
    theme,
    setTheme,
    options,
    updateOptions,
    applyPreset,
    toggleLineFocus,
    clearLineFocus,
    scale,
    setScale,
    exportFormat,
    setExportFormat,
    canvasRef,
    ghostRef,
    layout,
    foreground: tokens.foreground,
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
    copyLink,
    reset
  }
}
