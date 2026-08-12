import {
  DIMMED_OPACITY,
  DOT_GAP,
  DOT_INSET,
  DOT_RADIUS,
  GUTTER_GAP,
  MACOS_DOTS,
  TITLE_FONT_SIZE,
  WINDOW_RADIUS
} from "../constants"
import type { Layout, MeasureText, SnapshotOptions } from "../types"

/**
 * The one painter.
 *
 * Preview and export both call this, at the SAME scale — the one the visitor
 * picked. That is the whole reason "what you see is what you get" holds here
 * by construction rather than by testing: there is no second renderer to
 * disagree with, and the preview is backed by exactly the bitmap that will be
 * downloaded.
 *
 * Everything it receives is already positioned (`layout.ts`); this file only
 * knows how to put ink on a surface.
 */

/** Build the `ctx.font` string once, in the order the spec requires. */
function fontString(
  size: number,
  family: string,
  bold: boolean,
  italic: boolean
): string {
  return `${italic ? "italic " : ""}${bold ? "700 " : "400 "}${size}px ${family}`
}

/**
 * Measurement, backed by a canvas the reader never sees.
 *
 * `layoutSnapshot` needs widths before anything is drawn, and a 2D context can
 * measure without being attached to the document.
 */
export function createMeasurer(): MeasureText {
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("2D canvas context unavailable")

  return (text, font) => {
    ctx.font = fontString(font.size, font.family, font.bold, font.italic)
    return ctx.measureText(text).width
  }
}

function roundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  // `roundRect` is in every browser that ships this tool, but guarding costs
  // one branch and keeps the canvas from throwing on an older engine.
  if (typeof ctx.roundRect === "function") {
    ctx.beginPath()
    ctx.roundRect(x, y, width, height, radius)
    return
  }
  const r = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + width, y, x + width, y + height, r)
  ctx.arcTo(x + width, y + height, x, y + height, r)
  ctx.arcTo(x, y + height, x, y, r)
  ctx.arcTo(x, y, x + width, y, r)
  ctx.closePath()
}

function paintBackground(
  ctx: CanvasRenderingContext2D,
  layout: Layout,
  options: SnapshotOptions
): void {
  const { background } = options
  if (background.kind === "none") return

  if (background.kind === "solid" || !background.to) {
    ctx.fillStyle = background.from
    ctx.fillRect(0, 0, layout.width, layout.height)
    return
  }

  /**
   * CSS reads gradient angles clockwise from "to top"; canvas wants two
   * points. Rotating by −90° puts 0° at the top, and the radius is half the
   * diagonal so the gradient still covers the corners at 45°.
   */
  const angle = ((background.angle ?? 135) - 90) * (Math.PI / 180)
  const cx = layout.width / 2
  const cy = layout.height / 2
  const reach = Math.hypot(layout.width, layout.height) / 2

  const gradient = ctx.createLinearGradient(
    cx - Math.cos(angle) * reach,
    cy - Math.sin(angle) * reach,
    cx + Math.cos(angle) * reach,
    cy + Math.sin(angle) * reach
  )
  gradient.addColorStop(0, background.from)
  gradient.addColorStop(1, background.to)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, layout.width, layout.height)
}

function paintWindow(
  ctx: CanvasRenderingContext2D,
  layout: Layout,
  options: SnapshotOptions,
  editorBackground: string
): void {
  if (options.frame === "none") return
  const { x, y, width, height } = layout.window

  // The drop shadow is what separates the card from the background; without it
  // a dark theme on a dark gradient reads as one flat shape.
  ctx.save()
  ctx.shadowColor = "rgba(0, 0, 0, 0.35)"
  ctx.shadowBlur = 40
  ctx.shadowOffsetY = 16
  roundedRect(ctx, x, y, width, height, WINDOW_RADIUS)
  ctx.fillStyle = editorBackground
  ctx.fill()
  ctx.restore()

  if (options.frame !== "macos") return

  // Three dots, laid out from the left inset.
  MACOS_DOTS.forEach((colour, index) => {
    ctx.beginPath()
    ctx.arc(
      x + DOT_INSET + index * (DOT_RADIUS * 2 + DOT_GAP),
      y + layout.titleBarHeight / 2,
      DOT_RADIUS,
      0,
      Math.PI * 2
    )
    ctx.fillStyle = colour
    ctx.fill()
  })

  if (!options.title) return
  ctx.save()
  ctx.font = fontString(TITLE_FONT_SIZE, options.fontFamily, false, false)
  ctx.fillStyle = "rgba(255, 255, 255, 0.55)"
  ctx.textAlign = "center"
  ctx.textBaseline = "middle"
  ctx.fillText(options.title, x + width / 2, y + layout.titleBarHeight / 2)
  ctx.restore()
}

/**
 * Draw a snapshot onto a canvas at the given scale.
 *
 * Resizes the backing store itself, so callers cannot forget: a canvas whose
 * `width` attribute does not match `scale × layout.width` produces a blurry
 * export, and it is the single most common way this kind of tool ships soft
 * images.
 */
export function paintSnapshot(
  canvas: HTMLCanvasElement,
  layout: Layout,
  options: SnapshotOptions,
  colours: { foreground: string; editorBackground: string },
  scale: number
): void {
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("2D canvas context unavailable")

  canvas.width = Math.ceil(layout.width * scale)
  canvas.height = Math.ceil(layout.height * scale)

  /**
   * The CSS size is set HERE, in the same task as the backing store.
   *
   * It used to come from React, one render later, and the gap was measured on
   * the running page: choosing a preset set the backing store to 1946px while
   * the element was still 562.8px wide, and React caught up **2.6ms** after —
   * long enough to be composited. For that frame the new picture is squeezed
   * into the old box at a 3.46× ratio instead of 2×, which is the squash the
   * owner reported as a flicker.
   *
   * Two writers for one dimension is the bug; one writer is the fix. The
   * component no longer sets `style.width`/`style.height` at all.
   */
  canvas.style.width = `${layout.width}px`
  canvas.style.height = `${layout.height}px`

  ctx.setTransform(scale, 0, 0, scale, 0, 0)
  ctx.clearRect(0, 0, layout.width, layout.height)

  paintBackground(ctx, layout, options)
  paintWindow(ctx, layout, options, colours.editorBackground)

  ctx.textBaseline = "middle"
  ctx.textAlign = "left"

  // Line numbers are RIGHT-aligned against the gap before the code, so 9 and
  // 10 line up on their last digit instead of their first.
  const gutterX = layout.codeX - GUTTER_GAP

  for (const line of layout.lines) {
    ctx.globalAlpha = line.focused ? 1 : DIMMED_OPACITY

    if (line.number !== null) {
      ctx.font = fontString(options.fontSize, options.fontFamily, false, false)
      ctx.fillStyle = colours.foreground
      ctx.save()
      // Line numbers are furniture, not content — half strength keeps them
      // from competing with the code they label.
      ctx.globalAlpha *= 0.4
      ctx.textAlign = "right"
      ctx.fillText(line.number, gutterX, line.baseline)
      ctx.restore()
      ctx.textAlign = "left"
    }

    for (const token of line.tokens) {
      if (!token.text.trim() && !token.underline && !token.strikethrough) {
        continue
      }
      ctx.font = fontString(
        options.fontSize,
        options.fontFamily,
        token.bold,
        token.italic
      )
      ctx.fillStyle = token.color
      ctx.fillText(token.text, token.x, line.baseline)

      if (token.underline || token.strikethrough) {
        const thickness = Math.max(1, Math.round(options.fontSize / 14))
        ctx.fillRect(
          token.x,
          token.underline
            ? line.baseline + options.fontSize * 0.4
            : line.baseline,
          token.width,
          thickness
        )
      }
    }
  }

  ctx.globalAlpha = 1
}
