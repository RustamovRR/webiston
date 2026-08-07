/**
 * Frames — the surround, not the code.
 *
 * Worth being precise about why these are safe: a frame never touches a
 * module. It adds padding, a surface and a caption around a finished symbol,
 * so it cannot affect decoding at all. That makes it the cheapest visible
 * upgrade on this page — and the caption earns its place, because a code with
 * a "SCAN ME" instruction tells a passer-by what the black square is for.
 *
 * Kept deliberately plain. Novelty frames — coffee cups, scooters, gift boxes —
 * are what turn a tool into a toy, and none of them survive being put on a
 * company's poster.
 */

export type FrameId =
  | "none"
  | "outline"
  | "card"
  | "label-bottom"
  | "label-top"
  | "solid"
  | "brackets"

export interface FrameSpec {
  id: FrameId
  /** Space around the code, as a fraction of the code's own extent. */
  padding: number
  /** Caption strip height, same units. 0 means no caption. */
  labelHeight: number
  labelPosition: "top" | "bottom" | "none"
  surface: "none" | "solid" | "outline"
  /** Corner radius of the surround, same units. */
  radius: number
  /** Caption drawn on the accent colour rather than on the surface. */
  labelOnAccent: boolean
}

export const FRAMES: readonly FrameSpec[] = [
  {
    id: "none",
    padding: 0,
    labelHeight: 0,
    labelPosition: "none",
    surface: "none",
    radius: 0,
    labelOnAccent: false
  },
  {
    id: "outline",
    padding: 0.06,
    labelHeight: 0,
    labelPosition: "none",
    surface: "outline",
    radius: 0.08,
    labelOnAccent: false
  },
  {
    id: "card",
    padding: 0.08,
    labelHeight: 0,
    labelPosition: "none",
    surface: "solid",
    radius: 0.1,
    labelOnAccent: false
  },
  {
    id: "label-bottom",
    padding: 0.07,
    labelHeight: 0.18,
    labelPosition: "bottom",
    surface: "outline",
    radius: 0.09,
    labelOnAccent: true
  },
  {
    id: "label-top",
    padding: 0.07,
    labelHeight: 0.18,
    labelPosition: "top",
    surface: "outline",
    radius: 0.09,
    labelOnAccent: true
  },
  {
    id: "solid",
    padding: 0.08,
    labelHeight: 0.18,
    labelPosition: "bottom",
    surface: "solid",
    radius: 0.1,
    labelOnAccent: false
  },
  {
    id: "brackets",
    padding: 0.09,
    labelHeight: 0,
    labelPosition: "none",
    surface: "none",
    radius: 0,
    labelOnAccent: false
  }
]

export function frameById(id: FrameId): FrameSpec {
  return FRAMES.find((frame) => frame.id === id) ?? FRAMES[0]
}

export interface FrameLayout {
  /** Outer viewBox. */
  width: number
  height: number
  /** Where the code itself sits inside that box. */
  qrX: number
  qrY: number
  qrExtent: number
  /** Caption strip, when the frame has one. */
  label?: { x: number; y: number; width: number; height: number }
  /** Corner brackets, when the frame uses them. */
  brackets?: string
  surface?: { x: number; y: number; width: number; height: number }
}

export function layoutFrame(spec: FrameSpec, qrExtent: number): FrameLayout {
  const pad = spec.padding * qrExtent
  const labelHeight = spec.labelHeight * qrExtent

  const width = qrExtent + pad * 2
  const height = qrExtent + pad * 2 + labelHeight
  const qrY = spec.labelPosition === "top" ? pad + labelHeight : pad

  const layout: FrameLayout = {
    width,
    height,
    qrX: pad,
    qrY,
    qrExtent
  }

  if (spec.surface !== "none" || spec.labelHeight > 0) {
    layout.surface = { x: 0, y: 0, width, height }
  }

  if (spec.labelPosition !== "none") {
    layout.label = {
      x: 0,
      y: spec.labelPosition === "top" ? 0 : height - labelHeight,
      width,
      height: labelHeight
    }
  }

  if (spec.id === "brackets") {
    layout.brackets = bracketPath(
      width,
      height,
      qrExtent * 0.16,
      qrExtent * 0.02
    )
  }

  return layout
}

/** Four L-shaped corner marks, as one stroked path. */
function bracketPath(
  width: number,
  height: number,
  arm: number,
  inset: number
): string {
  const l = inset
  const r = width - inset
  const t = inset
  const b = height - inset

  return [
    `M${l},${t + arm} V${t} H${l + arm}`,
    `M${r - arm},${t} H${r} V${t + arm}`,
    `M${r},${b - arm} V${b} H${r - arm}`,
    `M${l + arm},${b} H${l} V${b - arm}`
  ].join(" ")
}
