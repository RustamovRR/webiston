"use client"

import {
  type RefObject,
  useCallback,
  useLayoutEffect,
  useRef,
  useState
} from "react"

import type { ExportScale } from "../constants"
import type { Layout, SnapshotOptions } from "../types"
import { fittingScale } from "../utils/canvas-limits"
import { layoutSnapshot } from "../utils/layout"
import { createMeasurer, paintSnapshot } from "../utils/paint"
import type { SnapshotTokens } from "./useSnapshotTokens"

/**
 * Everything between "here are the tokens" and "there is a picture".
 *
 * Measures the face, lays the tokens out, checks the result against the
 * browser's canvas cap, paints it, and softens the swap. Nothing in here
 * decides WHAT to draw — that is `useSnapshotSettings` and `useSnapshotTokens`
 * — and nothing outside it touches a canvas.
 */

interface UseSnapshotPainterInput {
  tokens: SnapshotTokens
  /** The CURRENT theme, which the tokens may not have caught up with yet. */
  theme: string
  options: SnapshotOptions
  scale: ExportScale
  /** Called with `"paint"` or `"tooLarge"`, or `null` once a frame lands. */
  onError: (error: string | null) => void
}

interface UseSnapshotPainter {
  canvasRef: RefObject<HTMLCanvasElement | null>
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
  /**
   * The scale actually used, which is not always the one chosen: past the
   * browser's canvas cap the export silently produces nothing, so it is
   * stepped down and the UI has to say so.
   */
  effectiveScale: ExportScale | null
}

export function useSnapshotPainter({
  tokens,
  theme,
  options,
  scale,
  onError
}: UseSnapshotPainterInput): UseSnapshotPainter {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const ghostRef = useRef<HTMLCanvasElement | null>(null)
  const [layout, setLayout] = useState<Layout | null>(null)
  const [effectiveScale, setEffectiveScale] = useState<ExportScale | null>(
    scale
  )

  /**
   * Cross-fade the frame that is about to be replaced.
   *
   * Nothing here goes through React. The ghost is a DOM node whose opacity a
   * CSS transition owns; setting it to 1 and then to 0 is the whole animation.
   * `prefers-reduced-motion` is honoured by the class on the element itself.
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

  /** The token set the canvas is currently showing, for the fade decision. */
  const paintedRef = useRef<SnapshotTokens | null>(null)

  useLayoutEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !options.fontFamily) return

    /**
     * Do not paint with colours from a theme nobody has chosen any more.
     *
     * While a newly picked theme is still downloading, the tokens in hand
     * belong to the old one, and painting anyway produces a frame with the NEW
     * geometry and the OLD palette — the first of the two flashes measured on
     * a preset change. Holding the last good picture for those few
     * milliseconds is invisible; the wrong frame is not.
     */
    if (tokens.theme !== theme) return

    const draw = () => {
      const measure = createMeasurer()
      const next = layoutSnapshot(tokens.lines, options, measure)

      // Past the browser's per-side canvas cap the picture is silently empty:
      // no throw, no event, and `toBlob` hands back null. Step down to a scale
      // that fits — or, when even 1x does not, stop rather than paint
      // something the visitor cannot download.
      const usable = fittingScale(next.width, next.height, scale)
      setEffectiveScale(usable)
      if (usable === null) {
        setLayout(null)
        onError("tooLarge")
        return
      }

      // A keystroke must not dissolve; a choice must. The token set is the
      // evidence: only a NEW one that came from typing skips the fade, so
      // changing the padding right after a keystroke still fades.
      const keystroke = tokens !== paintedRef.current && tokens.typed
      paintedRef.current = tokens
      if (!keystroke) holdPreviousFrame()

      paintSnapshot(canvas, next, options, tokens, usable)
      setLayout(next)
      onError(null)
    }

    /**
     * **Setting `ctx.font` does not download a webfont.** The CSS Font Loading
     * spec ties fetching to *rendered content*, and a canvas is not content:
     * the browser silently substitutes the fallback, and since `next/font`
     * ships a metric-adjusted fallback the result looks almost right, which is
     * worse than looking wrong. Every measurement and every glyph would come
     * from a face nobody chose.
     *
     * All three variants are asked for, because bold and italic are separate
     * downloads and a comment that renders italic would otherwise fall back on
     * its own.
     */
    const spec = `${options.fontSize}px ${options.fontFamily}`
    const variants = [spec, `700 ${spec}`, `italic ${spec}`]

    /**
     * `check` is synchronous, and using it is half of what makes typing feel
     * live. After the first paint all three faces are in memory; re-awaiting
     * `load()` anyway put a turn of the event loop between every keystroke and
     * its glyph, on top of the debounce. Ask first, await only when the answer
     * is no.
     */
    if (variants.every((variant) => document.fonts.check(variant))) {
      try {
        draw()
      } catch {
        onError("paint")
      }
      return
    }

    let cancelled = false
    Promise.all(variants.map((variant) => document.fonts.load(variant)))
      .then(() => document.fonts.ready)
      .then(() => {
        if (!cancelled) draw()
      })
      // Without this the rejection is unhandled and the preview freezes on the
      // last good frame while every control keeps responding — the state that
      // looks most like "the tool is fine" and least like a failure.
      .catch(() => {
        if (!cancelled) onError("paint")
      })

    return () => {
      cancelled = true
    }
  }, [tokens, theme, options, scale, holdPreviousFrame, onError])

  return { canvasRef, ghostRef, layout, effectiveScale }
}
