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

export type EyeBallShape =
  | "square"
  | "rounded"
  | "extra-rounded"
  | "circle"
  | "leaf"
  | "leaf-mirrored"
  | "diamond-soft"

export const EYE_FRAME_SHAPES: readonly EyeFrameShape[] = [
  "square",
  "rounded",
  "extra-rounded",
  "circle",
  "leaf",
  "leaf-mirrored",
  "cushion"
]

export const EYE_BALL_SHAPES: readonly EyeBallShape[] = [
  "square",
  "rounded",
  "extra-rounded",
  "circle",
  "leaf",
  "leaf-mirrored",
  "diamond-soft"
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

  const outerPath = roundedRectPath(x, y, outer, outer, radiiFor(shape, outer))
  const innerPath = roundedRectPath(
    x + module,
    y + module,
    inner,
    inner,
    radiiFor(shape, inner)
  )

  return `${outerPath} ${innerPath}`
}

/** The centre: a solid 3x3 block inset by two modules. */
export function eyeBallPath(
  shape: EyeBallShape,
  { x, y, module }: EyeGeometry
): string {
  const extent = module * 3
  return roundedRectPath(
    x + module * 2,
    y + module * 2,
    extent,
    extent,
    radiiFor(shape, extent)
  )
}
