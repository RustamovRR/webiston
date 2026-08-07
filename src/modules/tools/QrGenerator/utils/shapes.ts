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
 *
 * Every shape is declared ONCE, as a `ShapeSpec` in module units. The SVG path
 * and the coverage figure are both derived from that spec. They used to be two
 * hand-written `switch`es holding the same radii twice — and two radii tables
 * that can disagree make the 70% test validate a number the renderer never
 * draws. One table cannot drift from itself.
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
  | "arch"
  | "mosaic"
  | "bevel"
  | "sharp"

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
  "leaf",
  "arch",
  "mosaic",
  "bevel",
  "sharp"
]

/**
 * Shapes whose look depends on what is next to them.
 *
 * They are identical to a plain rounded square when a module stands alone —
 * that is the entire point — so any check for "are two shapes different" has
 * to compare them across several neighbour configurations, never in one.
 */
export const NEIGHBOUR_AWARE: ReadonlySet<ModuleShape> = new Set([
  "fluid",
  "fluid-soft",
  "vertical",
  "horizontal"
])

/** Corner radii in module units (1 = the full cell), clockwise from top-left. */
export type Radii = readonly [number, number, number, number]

/**
 * A shape's geometry, independent of where it is drawn.
 *
 * Deliberately small: two builders cover the whole catalogue, so two shapes
 * are the same picture exactly when their specs are equal — which is what
 * makes duplicate detection a comparison of data rather than of path strings.
 * Two different builders CAN produce the same outline (a bevel with cut 0 is a
 * square), so `bevelled` is only ever used with a real cut.
 */
export type ShapeSpec =
  | { kind: "rrect"; radii: Radii; inset: number }
  | { kind: "bevel"; cut: number }

/** Rounding used by the "soft" family, in module units. */
const SOFT = 0.28

/** Full rounding: a corner radius of half the cell turns the side into an arc. */
const FULL = 0.5

/**
 * Between SOFT and FULL: rounded enough to read as a pill, flat enough that
 * the sides are still straight.
 *
 * It is 0.4 and not 0.5 because at 0.5 the four arcs meet and the module IS a
 * circle — measured with the browser's own rasteriser, `extra-rounded` and
 * `dots` filled the identical 4,421 sample cells, so the catalogue advertised
 * sixteen shapes and drew fifteen. Matches `radiiFor` in `eyes.ts`, which has
 * always used `half * 0.8`.
 */
const GENEROUS = 0.4

const ISOLATED: Neighbours = {
  top: false,
  right: false,
  bottom: false,
  left: false
}

/**
 * Corner radii for a neighbour-aware shape: a corner is rounded only when both
 * edges meeting at it face empty space.
 */
function fluidRadii(
  { top, right, bottom, left }: Neighbours,
  radius: number
): Radii {
  return [
    top || left ? 0 : radius,
    top || right ? 0 : radius,
    bottom || right ? 0 : radius,
    bottom || left ? 0 : radius
  ]
}

const rrect = (radii: Radii, inset = 0): ShapeSpec => ({
  kind: "rrect",
  radii,
  inset
})

const uniform = (radius: number, inset = 0): ShapeSpec =>
  rrect([radius, radius, radius, radius], inset)

/** The single source of truth for what each shape is. */
export function moduleSpec(
  shape: ModuleShape,
  neighbours: Neighbours = ISOLATED
): ShapeSpec {
  switch (shape) {
    case "rounded":
      return uniform(SOFT)

    case "extra-rounded":
      return uniform(GENEROUS)

    case "dots":
      return uniform(FULL)

    // The two headline shapes: full rounding, suppressed wherever a module
    // touches another, so straight runs stay solid and only the ends curve.
    case "fluid":
      return rrect(fluidRadii(neighbours, FULL))

    case "fluid-soft":
      return rrect(fluidRadii(neighbours, SOFT))

    // Two opposite corners rounded — reads as a woven, diagonal texture.
    case "classy":
      return rrect([FULL, 0, FULL, 0])

    case "classy-rounded":
      return rrect([FULL, SOFT, FULL, SOFT])

    // The OTHER diagonal. It used to be `[FULL, SOFT * 0.4, …]`, which is
    // `classy` with a 0.112 rounding on the counter-corners — measured at 32
    // differing cells out of 5,023, i.e. 0.6%, invisible at any real size.
    // Mirroring the diagonal instead makes it a genuinely different texture.
    case "leaf":
      return rrect([0, FULL, 0, FULL])

    // An ADJACENT pair rather than a diagonal one: round on top, square at the
    // bottom. The one silhouette family the catalogue did not have.
    case "arch":
      return rrect([FULL, FULL, 0, 0])

    // Bars fuse along ONE axis only: vertical runs become continuous columns
    // while isolated modules stay pill-shaped.
    case "vertical":
      return rrect([
        neighbours.top ? 0 : FULL,
        neighbours.top ? 0 : FULL,
        neighbours.bottom ? 0 : FULL,
        neighbours.bottom ? 0 : FULL
      ])

    case "horizontal":
      return rrect([
        neighbours.left ? 0 : FULL,
        neighbours.right ? 0 : FULL,
        neighbours.right ? 0 : FULL,
        neighbours.left ? 0 : FULL
      ])

    // A squircle, not a true diamond: a rotated square covers only 50% of its
    // cell and would fail the coverage rule outright.
    case "diamond-soft":
      return rrect([FULL * 0.9, FULL * 0.3, FULL * 0.9, FULL * 0.3])

    // A deliberate gap between modules, the way a tiled mosaic reads. The
    // inset is 8% per side, so 0.84^2 minus the corners is 70.2% — the floor.
    // This is as sparse as the catalogue is allowed to get.
    case "mosaic":
      return uniform(0.06, 0.08)

    // Cut corners rather than rounded ones — an octagon reads as engineered
    // where a circle reads as friendly.
    case "bevel":
      return { kind: "bevel", cut: 0.26 }

    // Three corners soft, one square. Gives the code a consistent "grain"
    // because every module points the same way.
    case "sharp":
      return rrect([0, SOFT, SOFT, SOFT])

    default:
      return rrect([0, 0, 0, 0])
  }
}

interface Cell {
  x: number
  y: number
  size: number
  neighbours: Neighbours
}

const round = (value: number) => Math.round(value * 1000) / 1000

/** A rectangle with a per-corner radius, as an SVG path. */
function roundedRect(x: number, y: number, size: number, radii: Radii): string {
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

/** An octagon: the four corners cut by `cut` instead of rounded. */
function bevelled(x: number, y: number, size: number, cut: number): string {
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

/** Draw a spec into a cell. The only place module units become user units. */
export function pathFromSpec(spec: ShapeSpec, cell: Cell): string {
  const { x, y, size } = cell

  if (spec.kind === "bevel") {
    return bevelled(x, y, size, size * spec.cut)
  }

  const inset = size * spec.inset
  return roundedRect(
    x + inset,
    y + inset,
    size - inset * 2,
    spec.radii.map((r) => r * size) as unknown as Radii
  )
}

export function modulePath(shape: ModuleShape, cell: Cell): string {
  return pathFromSpec(moduleSpec(shape, cell.neighbours), cell)
}

/**
 * Share of the cell each shape covers, worst case (an isolated module with no
 * neighbours). Derived from the same spec the renderer draws, so it cannot
 * describe a shape that is not on screen.
 */
export function coverageOf(shape: ModuleShape): number {
  return coverageOfSpec(moduleSpec(shape, ISOLATED))
}

export function coverageOfSpec(spec: ShapeSpec): number {
  // Each cut corner removes a right triangle with legs `cut`.
  if (spec.kind === "bevel") return 1 - 2 * spec.cut * spec.cut

  const side = 1 - spec.inset * 2
  // A rounded corner removes (1 - π/4) of the square it sits in.
  const removed = spec.radii.reduce(
    (sum, r) => sum + Math.min(r, side / 2) ** 2 * (1 - Math.PI / 4),
    0
  )
  return side * side - removed
}
