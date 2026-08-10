// @vitest-environment node

import { readdirSync } from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"
import { beforeAll, describe, expect, it } from "vitest"

import { DEFAULT_STYLE, MAX_QUIET_ZONE, MIN_QUIET_ZONE } from "../constants"
import type { QrStyle } from "../types"
import { EYE_BALL_SHAPES, EYE_FRAME_SHAPES } from "./eyes"
import { logoFootprint, versionForLogo } from "./logo-fit"
import { buildMatrix, versionOfSize } from "./matrix"
import { buildQrModel, modelToSvg } from "./render"
import { MODULE_SHAPES } from "./shapes"

/**
 * Does the painted picture still say what the matrix says?
 *
 * Every other test in this tool checks a path string or a coordinate. This one
 * checks PIXELS, because that is the only level at which "will it scan" is a
 * real question. A decoder does not read our path data: it locates the symbol,
 * builds the module grid, and **samples the centre of each module**. So the
 * guarantee worth having is exactly that — for every shape, every quiet zone
 * and with or without a logo, the pixel at each module's centre matches the
 * bit the encoder put there.
 *
 * A shape that fails this is not "a bit stylised", it is a different code.
 *
 * `sharp` is not a dependency of this repo and must not become one. It is in
 * the pnpm store as a transitive optional of `next`, resolved by globbing
 * exactly as `scripts/generate-icons.mjs` does — the version hash in that path
 * changes on install, which is why it is not written out.
 */

const require = createRequire(import.meta.url)
const ROOT = path.resolve(import.meta.dirname, "../../../../..")

type Sharp = (input: Buffer) => {
  resize: (w: number, h: number) => Sharp2
}
type Sharp2 = {
  greyscale: () => Sharp2
  raw: () => { toBuffer: () => Promise<Buffer> }
}

let sharp: Sharp

beforeAll(() => {
  const store = path.join(ROOT, "node_modules", ".pnpm")
  const dir = readdirSync(store).find((name) => name.startsWith("sharp@"))
  if (!dir) throw new Error("sharp not in the pnpm store; run `pnpm install`")
  sharp = require(path.join(store, dir, "node_modules", "sharp"))
})

/** The payload every case uses. A realistic link, version 3 on its own. */
const PAYLOAD = "https://webiston.uz/tools/qr-generator"

/** Raster edge. 6x the model, so the smallest module is ~30px across. */
const RASTER = 1920
const MODEL_EXTENT = 320

/**
 * Render one style and read back the bit at every module centre.
 *
 * The `<image>` element is stripped before rasterising. The logo is a data URL
 * whose rendering depends on which SVG backend sharp was built against, and it
 * is irrelevant to this question anyway: the modules it covers are dropped
 * from the path by design, and this function skips them.
 */
async function sampleModules(style: QrStyle) {
  const level = style.logo ? "H" : "M"
  const natural = buildMatrix(PAYLOAD, level)
  // Exactly the pipeline `useQrGenerator` runs: natural version, grown only
  // when a logo needs the room.
  const matrix = style.logo
    ? buildMatrix(
        PAYLOAD,
        level,
        versionForLogo(
          versionOfSize(natural.size),
          style.quietZone,
          style.logoSize
        )
      )
    : natural

  const model = buildQrModel({
    matrix,
    style,
    extent: MODEL_EXTENT,
    quietZone: style.quietZone
  })

  const svg = modelToSvg(model).replace(/<image[^>]*\/>/g, "")
  const pixels = await sharp(Buffer.from(svg))
    .resize(RASTER, RASTER)
    .greyscale()
    .raw()
    .toBuffer()

  const scale = RASTER / MODEL_EXTENT
  const origin = style.quietZone * model.moduleSize
  const hidden = style.logo
    ? logoFootprint(matrix.size, style.quietZone, style.logoSize)
    : null

  const isPainted = (row: number, col: number) => {
    const x = Math.round((origin + (col + 0.5) * model.moduleSize) * scale)
    const y = Math.round((origin + (row + 0.5) * model.moduleSize) * scale)
    // Foreground is #000000 on #ffffff, so a painted centre is near 0.
    return pixels[y * RASTER + x] < 128
  }

  /**
   * Data modules are checked one by one; finder modules are NOT.
   *
   * That split is not a loophole, it is how decoding works. A decoder never
   * reads the finder as seven-by-seven bits: it sweeps scan lines and looks
   * for the 1:1:3:1:1 dark-light-dark-light-dark run-length ratio, then takes
   * the centre as a reference point. So a rounded or circular eye frame —
   * which by definition removes ink from the block's outer corners — deviates
   * from the matrix at those corners on purpose and is still found.
   *
   * Verified rather than asserted: an earlier version of this file checked
   * finder modules strictly and reported 8 of the 9 corner-frame shapes as
   * broken. They are not broken, the check was wrong. `finderSignature` below
   * measures the thing that actually has to hold.
   */
  const mismatches: string[] = []
  for (let row = 0; row < matrix.size; row++) {
    for (let col = 0; col < matrix.size; col++) {
      if (matrix.isFinder(row, col)) continue

      const underLogo =
        hidden &&
        row >= hidden.from &&
        row < hidden.to &&
        col >= hidden.from &&
        col < hidden.to
      if (underLogo) continue

      if (isPainted(row, col) !== matrix.isDark(row, col)) {
        mismatches.push(`(${row},${col})`)
      }
    }
  }

  /**
   * The 1:1:3:1:1 ratio, read through the centre of all three finders in both
   * axes — the signature a decoder locates the symbol by. Expressed at module
   * resolution: dark, light, dark, dark, dark, light, dark.
   */
  const RATIO = [true, false, true, true, true, false, true]
  const corners = [
    [0, 0],
    [0, matrix.size - 7],
    [matrix.size - 7, 0]
  ]
  const finderFaults: string[] = []

  for (const [top, left] of corners) {
    for (let index = 0; index < 7; index++) {
      // Centre row of this finder, then centre column.
      if (isPainted(top + 3, left + index) !== RATIO[index]) {
        finderFaults.push(`row@(${top},${left})+${index}`)
      }
      if (isPainted(top + index, left + 3) !== RATIO[index]) {
        finderFaults.push(`col@(${top},${left})+${index}`)
      }
    }
  }

  return { mismatches, finderFaults, size: matrix.size }
}

/** One assertion helper, so every case reports the same two facts. */
function expectReadable(
  result: { mismatches: string[]; finderFaults: string[] },
  label: string
) {
  expect(result.mismatches.slice(0, 8).join(" "), `data ${label}`).toBe("")
  expect(result.finderFaults.slice(0, 8).join(" "), `finder ${label}`).toBe("")
}

const styleWith = (patch: Partial<QrStyle>): QrStyle => ({
  ...DEFAULT_STYLE,
  ...patch
})

describe("every module shape paints the bit the encoder set", () => {
  it.each(MODULE_SHAPES)("dot shape: %s", async (dotType) => {
    // Arrange / Act
    const result = await sampleModules(styleWith({ dotType }))

    // Assert
    expectReadable(result, dotType)
  })
})

describe("every eye shape paints the finder the encoder set", () => {
  it.each(EYE_FRAME_SHAPES)("corner frame: %s", async (cornerSquareType) => {
    // Arrange / Act
    const result = await sampleModules(styleWith({ cornerSquareType }))

    // Assert
    expectReadable(result, cornerSquareType)
  })

  it.each(EYE_BALL_SHAPES)("corner centre: %s", async (cornerDotType) => {
    // Arrange / Act
    const result = await sampleModules(styleWith({ cornerDotType }))

    // Assert
    expectReadable(result, cornerDotType)
  })
})

describe("every quiet zone the slider offers", () => {
  const ZONES = Array.from(
    { length: MAX_QUIET_ZONE - MIN_QUIET_ZONE + 1 },
    (_, index) => MIN_QUIET_ZONE + index
  )

  it.each(ZONES)("quiet zone %i, default shapes", async (quietZone) => {
    // Arrange / Act
    const result = await sampleModules(styleWith({ quietZone }))

    // Assert
    expectReadable(result, `qz ${quietZone}`)
  })

  // The combination that was reported as failing to scan at 7 and 8.
  it.each(ZONES)("quiet zone %i, dotted modules", async (quietZone) => {
    // Arrange / Act
    const result = await sampleModules(
      styleWith({ quietZone, dotType: "dots" })
    )

    // Assert
    expectReadable(result, `qz ${quietZone} dotted`)
  })
})

describe("with a logo", () => {
  it("leaves every module outside the logo intact, at every size", async () => {
    for (const logoSize of [0.1, 0.22, 0.3]) {
      // Arrange / Act — a 1x1 transparent PNG; only its geometry matters here.
      const result = await sampleModules(
        styleWith({
          logo: "data:image/png;base64,iVBORw0KGgo=",
          logoSize
        })
      )

      // Assert
      expectReadable(result, `logo ${logoSize}`)
    }
  })
})
