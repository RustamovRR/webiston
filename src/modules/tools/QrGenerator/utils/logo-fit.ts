import {
  isCriticalModule,
  sizeOfVersion,
  type TypeNumber,
  versionOfSize
} from "./matrix"

/**
 * Where a centred logo lands on the module grid, and whether the symbol can
 * survive it.
 *
 * ## The bug this file exists for
 *
 * A logo used to be dropped straight into the middle at whatever size the
 * slider said, with the error level raised to H and the covered modules
 * removed from the drawing. That reasoning has a hole in it: **error
 * correction protects the DATA codewords and nothing else.** The finders, the
 * timing patterns, the format information, the version information and the
 * alignment patterns are all read before a single byte is corrected — they are
 * how a decoder locates the symbol, establishes the module grid, learns which
 * mask and which error level were used, and undoes perspective. Level H buys
 * exactly zero protection for any of them.
 *
 * Measured on the shipped code, before this file existed:
 *
 * | payload                     | version | logo | timing lost | format lost |
 * | --------------------------- | :-----: | ---: | ----------: | ----------: |
 * | `Salom`                     |    1    |  22% |      **18** |      **10** |
 * | `Salom`                     |    1    |  30% |      **22** |      **14** |
 * | `https://webiston.uz`       |    3    |  30% |           0 |       **4** |
 *
 * A code missing 18 timing modules cannot be decoded by anything, at any error
 * level. That is the "works without a logo, fails with one" report exactly.
 *
 * ## The fix
 *
 * Rather than shrink the visitor's logo behind their back, GROW the symbol.
 * A bigger version has a bigger central area of pure data, so the same logo
 * clears the function patterns. It is what commercial generators do, it keeps
 * the slider honest, and the only cost is a denser code.
 */

/**
 * The modules a logo covers, with one module of breathing room each side.
 *
 * The width is derived from the SAME geometry the logo is drawn with. It used
 * to read `size * logoSize`, but the logo is sized against the full box —
 * which spans `size + quietZone * 2` modules — so the two disagreed by exactly
 * the quiet zone: on a 21x21 code at quiet zone 8 and a 22% logo the image
 * covered 8.14 modules while only 7 were dropped, leaving five painted modules
 * under an opaque logo.
 */
export function logoFootprint(size: number, quietZone: number, ratio: number) {
  const inModules = (size + quietZone * 2) * ratio
  const covered = Math.ceil(inModules) + 2
  const from = Math.floor((size - covered) / 2)

  return { from, to: from + covered, covered }
}

/**
 * Can a symbol of this size carry this logo without losing a CRITICAL module?
 *
 * Critical, not "function": alignment patterns are excluded on purpose and the
 * reasoning is in `isAlignmentModule`. Demanding a clean centre is not the
 * conservative reading, it is the one that makes logos impossible — from
 * version 21 the alignment grid tiles the symbol closely enough that a centred
 * logo of any size touches one.
 *
 * Checked against the real reserved map rather than a margin rule of thumb,
 * because the map is not just the edges: the format information runs down
 * column 8 and across row 8, which a small symbol's centre reaches.
 */
export function logoFits(
  size: number,
  quietZone: number,
  ratio: number
): boolean {
  const { from, to } = logoFootprint(size, quietZone, ratio)
  if (from < 0 || to > size) return false

  const isCritical = isCriticalModule(size)
  for (let row = from; row < to; row++) {
    for (let col = from; col < to; col++) {
      if (isCritical(row, col)) return false
    }
  }

  return true
}

/**
 * The smallest version at or above `naturalVersion` whose centre can hold the
 * logo — or `naturalVersion` if none can.
 *
 * Not monotonic, which is why this searches instead of solving: growing the
 * symbol usually helps, but at some versions a NEW alignment pattern appears
 * near the middle and takes the space back. Version 40 is the ceiling the
 * format itself sets.
 *
 * Falling back to the natural version rather than throwing is deliberate. The
 * caller has a logo to draw either way, and a slightly damaged code the
 * visitor can see and shrink beats an error message where a preview should be.
 */
export function versionForLogo(
  naturalVersion: number,
  quietZone: number,
  ratio: number
): TypeNumber {
  for (let version = naturalVersion; version <= 40; version++) {
    if (logoFits(sizeOfVersion(version), quietZone, ratio)) {
      return version as TypeNumber
    }
  }

  return naturalVersion as TypeNumber
}

/** The version a matrix of this many modules per side represents. */
export { versionOfSize }
