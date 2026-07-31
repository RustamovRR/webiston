import type { Neighbours } from "./matrix"

/**
 * The module (data dot) shape catalogue.
 *
 * Two rules govern every entry, and both come from how a scanner actually
 * works rather than from taste:
 *
 * 1. A module must cover at least ~70% of its cell. A reader thresholds each
 *    cell and asks "is this dark"; a shape that leaves too much of the cell
 *    light reads as a light module and the code decodes to nothing. An
 *    inscribed circle is π/4 = 78.5%, which is why `dots` is the smallest
 *    shape here and why a star or a thin diamond is not in this list at all.
 *
 * 2. Rounding is NEIGHBOUR-AWARE where it can be. A shape that rounds all four
 *    corners regardless produces the detached-blob look; rounding only the
 *    corners that face empty space fuses runs of modules into continuous
 *    strokes. That is the difference between a 2013 QR code and a 2026 one,
 *    and it costs nothing in readability because the covered area only grows.
 */

export type ModuleShape =
  | "square"
  | "rounded"
  | "extra-rounded"
  | "dots"
  | "fluid"
  | "fluid-soft"
  | "classy"
  | "classy-rounded"
  | "vertical"
  | "horizontal"
  | "diamond-soft"
  | "leaf"

export const MODULE_SHAPES: readonly ModuleShape[] = [
  "square",
  "rounded",
  "extra-rounded",
  "dots",
  "fluid",
  "fluid-soft",
  "classy",
  "classy-rounded",
  "vertical",
  "horizontal",
  "diamond-soft",
  "leaf"
]

/** Shapes whose look depends on what is next to them. */
export const NEIGHBOUR_AWARE: ReadonlySet<ModuleShape> = new Set([
  "fluid",
  "fluid-soft",
  "vertical",
  "horizontal"
])

interface Cell {
  x: number
  y: number
  size: number
  neighbours: Neighbours
}

const round = (value: number) => Math.round(value * 1000) / 1000

/** A rectangle with a per-corner radius, as an SVG path. */
function roundedRect(
  x: number,
  y: number,
  size: number,
  radii: [number, number, number, number]
): string {
  const [tl, tr, br, bl] = radii.map((r) => Math.min(r, size / 2))
  const right = x + size
  const bottom = y + size

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

function circle(x: number, y: number, size: number): string {
  const r = size / 2
  const cx = x + r
  const cy = y + r
  return `M${round(cx - r)},${round(cy)} a${round(r)},${round(r)} 0 1 0 ${round(
    r * 2
  )},0 a${round(r)},${round(r)} 0 1 0 ${round(-r * 2)},0 Z`
}

/**
 * Corner radii for a neighbour-aware shape: a corner is rounded only when both
 * edges meeting at it face empty space.
 */
function fluidRadii(
  { top, right, bottom, left }: Neighbours,
  radius: number
): [number, number, number, number] {
  return [
    top || left ? 0 : radius,
    top || right ? 0 : radius,
    bottom || right ? 0 : radius,
    bottom || left ? 0 : radius
  ]
}

export function modulePath(shape: ModuleShape, cell: Cell): string {
  const { x, y, size, neighbours } = cell
  const half = size / 2
  const soft = size * 0.28

  switch (shape) {
    case "rounded":
      return roundedRect(x, y, size, [soft, soft, soft, soft])

    case "extra-rounded":
      return roundedRect(x, y, size, [half, half, half, half])

    case "dots":
      return circle(x, y, size)

    // The two headline shapes: full rounding, suppressed wherever a module
    // touches another, so straight runs stay solid and only the ends curve.
    case "fluid":
      return roundedRect(x, y, size, fluidRadii(neighbours, half))

    case "fluid-soft":
      return roundedRect(x, y, size, fluidRadii(neighbours, soft))

    // Two opposite corners rounded — reads as a woven, diagonal texture.
    case "classy":
      return roundedRect(x, y, size, [half, 0, half, 0])

    case "classy-rounded":
      return roundedRect(x, y, size, [half, soft, half, soft])

    // Bars fuse along ONE axis only: vertical runs become continuous columns
    // while isolated modules stay pill-shaped.
    case "vertical":
      return roundedRect(x, y, size, [
        neighbours.top ? 0 : half,
        neighbours.top ? 0 : half,
        neighbours.bottom ? 0 : half,
        neighbours.bottom ? 0 : half
      ])

    case "horizontal":
      return roundedRect(x, y, size, [
        neighbours.left ? 0 : half,
        neighbours.right ? 0 : half,
        neighbours.right ? 0 : half,
        neighbours.left ? 0 : half
      ])

    // A squircle, not a true diamond: a rotated square covers only 50% of its
    // cell and would fail the coverage rule outright.
    case "diamond-soft":
      return roundedRect(x, y, size, [
        half * 0.9,
        half * 0.3,
        half * 0.9,
        half * 0.3
      ])

    case "leaf":
      return roundedRect(x, y, size, [half, soft * 0.4, half, soft * 0.4])

    default:
      return roundedRect(x, y, size, [0, 0, 0, 0])
  }
}

/**
 * Share of the cell each shape covers, worst case (an isolated module with no
 * neighbours). Used by the test that guards the 70% rule so a future shape
 * cannot be added without measuring it.
 */
export function coverageOf(shape: ModuleShape): number {
  const SIZE = 1
  const area = (radii: number[]) => {
    // A rounded corner removes (1 - π/4) of the square it sits in.
    const removed = radii.reduce((sum, r) => sum + r * r * (1 - Math.PI / 4), 0)
    return SIZE * SIZE - removed
  }

  switch (shape) {
    case "square":
      return 1
    case "rounded":
    case "fluid-soft":
      return area([0.28, 0.28, 0.28, 0.28])
    case "extra-rounded":
    case "fluid":
    case "vertical":
    case "horizontal":
      return area([0.5, 0.5, 0.5, 0.5])
    case "dots":
      return Math.PI / 4
    case "classy":
      return area([0.5, 0, 0.5, 0])
    case "classy-rounded":
      return area([0.5, 0.28, 0.5, 0.28])
    case "diamond-soft":
      return area([0.45, 0.15, 0.45, 0.15])
    case "leaf":
      return area([0.5, 0.112, 0.5, 0.112])
    default:
      return 1
  }
}
