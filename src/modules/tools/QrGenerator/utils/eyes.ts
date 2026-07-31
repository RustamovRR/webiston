/**
 * The three orientation squares — the "eyes".
 *
 * These are the riskiest thing on the page to restyle, and the reason is
 * mechanical: a reader finds a QR code by scanning lines across the image and
 * looking for the 1:1:3:1:1 dark-light-dark-light-dark ratio that a finder
 * pattern produces from ANY angle. Everything here preserves that ratio — a
 * 7x7 ring one module thick, a one-module gap, a 3x3 centre — and varies only
 * the corner geometry. Shapes that break the ratio (a star, a flower, a thin
 * outline) are not offered, because a code nobody can find is not a design
 * choice.
 *
 * Frame and centre are separate catalogues because they are separate features
 * of the pattern, and the best-looking combinations mix them.
 */

export type EyeFrameShape =
  | "square"
  | "rounded"
  | "extra-rounded"
  | "circle"
  | "leaf"
  | "leaf-mirrored"
  | "cushion"
  | "bevel"
  | "sharp"

export type EyeBallShape =
  | "square"
  | "rounded"
  | "extra-rounded"
  | "circle"
  | "leaf"
  | "leaf-mirrored"
  | "diamond-soft"
  | "bevel"
  | "sharp"
  | "bars-v"
  | "bars-h"
  | "dot-grid"

export const EYE_FRAME_SHAPES: readonly EyeFrameShape[] = [
  "square",
  "rounded",
  "extra-rounded",
  "circle",
  "leaf",
  "leaf-mirrored",
  "cushion",
  "bevel",
  "sharp"
]

export const EYE_BALL_SHAPES: readonly EyeBallShape[] = [
  "square",
  "rounded",
  "extra-rounded",
  "circle",
  "leaf",
  "leaf-mirrored",
  "diamond-soft",
  "bevel",
  "sharp",
  "bars-v",
  "bars-h",
  "dot-grid"
]

const round = (value: number) => Math.round(value * 1000) / 1000

function roundedRectPath(
  x: number,
  y: number,
  width: number,
  height: number,
  radii: [number, number, number, number]
): string {
  const limit = Math.min(width, height) / 2
  const [tl, tr, br, bl] = radii.map((r) => Math.min(r, limit))
  const right = x + width
  const bottom = y + height

  return [
    `M${round(x + tl)},${round(y)}`,
    `H${round(right - tr)}`,
    tr
      ? `A${round(tr)},${round(tr)} 0 0 1 ${round(right)},${round(y + tr)}`
      : "",
    `V${round(bottom - br)}`,
    br
      ? `A${round(br)},${round(br)} 0 0 1 ${round(right - br)},${round(bottom)}`
      : "",
    `H${round(x + bl)}`,
    bl
      ? `A${round(bl)},${round(bl)} 0 0 1 ${round(x)},${round(bottom - bl)}`
      : "",
    `V${round(y + tl)}`,
    tl ? `A${round(tl)},${round(tl)} 0 0 1 ${round(x + tl)},${round(y)}` : "",
    "Z"
  ]
    .filter(Boolean)
    .join(" ")
}

function radiiFor(
  shape: EyeFrameShape | EyeBallShape,
  extent: number
): [number, number, number, number] {
  const half = extent / 2
  const soft = extent * 0.25

  switch (shape) {
    case "rounded":
      return [soft, soft, soft, soft]
    case "extra-rounded":
      return [half * 0.8, half * 0.8, half * 0.8, half * 0.8]
    case "circle":
      return [half, half, half, half]
    case "leaf":
      return [half, 0, half, 0]
    case "leaf-mirrored":
      return [0, half, 0, half]
    case "cushion":
      return [soft * 1.6, soft * 0.4, soft * 1.6, soft * 0.4]
    case "diamond-soft":
      return [half * 0.85, half * 0.25, half * 0.85, half * 0.25]
    case "sharp":
      return [0, soft, soft, soft]
    default:
      return [0, 0, 0, 0]
  }
}

export interface EyeGeometry {
  /** Top-left corner of the 7x7 block, in user units. */
  x: number
  y: number
  /** Size of one module. */
  module: number
}

/**
 * The ring: a 7x7 outer path with a 5x5 hole, drawn as one path with
 * `fill-rule: evenodd` so the middle stays light without a second fill.
 */
export function eyeFramePath(
  shape: EyeFrameShape,
  { x, y, module }: EyeGeometry
): string {
  const outer = module * 7
  const inner = module * 5

  const outerPath =
    shape === "bevel"
      ? bevelPath(x, y, outer, outer * 0.24)
      : roundedRectPath(x, y, outer, outer, radiiFor(shape, outer))
  const innerPath =
    shape === "bevel"
      ? bevelPath(x + module, y + module, inner, inner * 0.24)
      : roundedRectPath(
          x + module,
          y + module,
          inner,
          inner,
          radiiFor(shape, inner)
        )

  return `${outerPath} ${innerPath}`
}

/** An octagon, for the shapes that want cut corners rather than round ones. */
function bevelPath(x: number, y: number, size: number, cut: number): string {
  const right = x + size
  const bottom = y + size
  return [
    `M${round(x + cut)},${round(y)}`,
    `L${round(right - cut)},${round(y)}`,
    `L${round(right)},${round(y + cut)}`,
    `L${round(right)},${round(bottom - cut)}`,
    `L${round(right - cut)},${round(bottom)}`,
    `L${round(x + cut)},${round(bottom)}`,
    `L${round(x)},${round(bottom - cut)}`,
    `L${round(x)},${round(y + cut)}`,
    "Z"
  ].join(" ")
}

/**
 * The centre: a 3x3 block inset by two modules.
 *
 * This is the one part of a finder pattern with real freedom. The scanner
 * locks onto the RING — the 1:1:3:1:1 ratio is measured across the frame — so
 * the middle can be split into bars or dots without touching detection, which
 * is why the composite shapes live here and not in the frame catalogue.
 */
export function eyeBallPath(
  shape: EyeBallShape,
  { x, y, module }: EyeGeometry
): string {
  const extent = module * 3
  const originX = x + module * 2
  const originY = y + module * 2

  if (shape === "bevel") {
    return bevelPath(originX, originY, extent, extent * 0.26)
  }

  // Three bars, with the gaps as a share of the block so they scale.
  if (shape === "bars-v" || shape === "bars-h") {
    const gap = extent * 0.14
    const band = (extent - gap * 2) / 3
    return [0, 1, 2]
      .map((index) => {
        const offset = index * (band + gap)
        return shape === "bars-v"
          ? roundedRectPath(originX + offset, originY, band, extent, [
              band / 2,
              band / 2,
              band / 2,
              band / 2
            ])
          : roundedRectPath(originX, originY + offset, extent, band, [
              band / 2,
              band / 2,
              band / 2,
              band / 2
            ])
      })
      .join(" ")
  }

  // A 2x2 of dots — the densest of the composite centres.
  if (shape === "dot-grid") {
    const gap = extent * 0.12
    const dot = (extent - gap) / 2
    return [0, 1]
      .flatMap((row) =>
        [0, 1].map((col) =>
          roundedRectPath(
            originX + col * (dot + gap),
            originY + row * (dot + gap),
            dot,
            dot,
            [dot / 2, dot / 2, dot / 2, dot / 2]
          )
        )
      )
      .join(" ")
  }

  return roundedRectPath(
    originX,
    originY,
    extent,
    extent,
    radiiFor(shape, extent)
  )
}
