import qrcode from "qrcode-generator"

import type { QrErrorLevel } from "../types"

/**
 * The QR matrix, plus the two things a renderer needs that the encoder does
 * not expose: which cells belong to the finder patterns, and what a cell's
 * neighbours are doing.
 *
 * The encoder is `qrcode-generator` — MIT, ~2M downloads a week, and already
 * the engine underneath every styling library in this space. It answers one
 * question, `isDark(row, col)`, and that is genuinely all a painter needs.
 * Everything visual after this point is ours, which is the whole reason for
 * this file: the styling library we were using hardcodes its six shapes in a
 * private `switch`, so no amount of configuration could ever add a seventh.
 */

/** The three orientation squares are 7x7 at three fixed corners. */
const FINDER_SIZE = 7

/** 1–40; `0` asks the encoder to pick. Mirrors the encoder's own union. */
export type TypeNumber = Parameters<typeof qrcode>[0]

/** Modules per side for a version. Version 1 is 21, and each step adds 4. */
export const sizeOfVersion = (version: number) => version * 4 + 17
/** The inverse. A matrix knows its size; the version is derived from it. */
export const versionOfSize = (size: number) => (size - 17) / 4

/**
 * Alignment-pattern centre coordinates, ISO/IEC 18004 Annex E.
 *
 * The encoder keeps this table private — `qrcode-generator` exposes exactly
 * `isDark`, `getModuleCount` and nothing else (checked in its `.d.ts`) — so it
 * has to be restated here. It is DATA, not a derivation: the published
 * "compute the step" formulas disagree with the standard at several versions
 * (32 is the usual casualty), and a wrong entry here would silently mark a
 * data module as untouchable, or worse, let a logo land on a real alignment
 * pattern.
 *
 * `matrix.test.ts` checks every row against a real encoded symbol by looking
 * for the pattern's own signature — a 5x5 dark ring, a 3x3 light ring, a dark
 * centre — so this table is verified rather than trusted.
 */
const ALIGNMENT_CENTRES: readonly (readonly number[])[] = [
  [], // version 1 has none
  [6, 18],
  [6, 22],
  [6, 26],
  [6, 30],
  [6, 34],
  [6, 22, 38],
  [6, 24, 42],
  [6, 26, 46],
  [6, 28, 50],
  [6, 30, 54],
  [6, 32, 58],
  [6, 34, 62],
  [6, 26, 46, 66],
  [6, 26, 48, 70],
  [6, 26, 50, 74],
  [6, 30, 54, 78],
  [6, 30, 56, 82],
  [6, 30, 58, 86],
  [6, 34, 62, 90],
  [6, 28, 50, 72, 94],
  [6, 26, 50, 74, 98],
  [6, 30, 54, 78, 102],
  [6, 28, 54, 80, 106],
  [6, 32, 58, 84, 110],
  [6, 30, 58, 86, 114],
  [6, 34, 62, 90, 118],
  [6, 26, 50, 74, 98, 122],
  [6, 30, 54, 78, 102, 126],
  [6, 26, 52, 78, 104, 130],
  [6, 30, 56, 82, 108, 134],
  [6, 34, 60, 86, 112, 138],
  [6, 30, 58, 86, 114, 142],
  [6, 34, 62, 90, 118, 146],
  [6, 30, 54, 78, 102, 126, 150],
  [6, 24, 50, 76, 102, 128, 154],
  [6, 28, 54, 80, 106, 132, 158],
  [6, 32, 58, 84, 110, 136, 162],
  [6, 26, 54, 82, 110, 138, 166],
  [6, 30, 58, 86, 114, 142, 170]
]

/** The 5x5 alignment blocks for a version, as centre coordinates. */
export function alignmentCentres(version: number): [number, number][] {
  const axis = ALIGNMENT_CENTRES[version - 1] ?? []
  const last = axis.at(-1)
  const centres: [number, number][] = []

  for (const row of axis) {
    for (const col of axis) {
      // The three finder corners have no alignment pattern — the finder is
      // already there.
      const onFinder =
        (row === 6 && col === 6) ||
        (row === 6 && col === last) ||
        (row === last && col === 6)
      if (!onFinder) centres.push([row, col])
    }
  }

  return centres
}

/**
 * The modules that must survive, or the symbol cannot be read at all.
 *
 * Reed–Solomon covers the data codewords and nothing else. These four groups
 * are read BEFORE a single byte is corrected: the finders say where the symbol
 * is, the timing patterns establish the module grid, the format information
 * carries the mask and the error level, and the version information carries
 * the size. Lose any of them and there is nothing to correct — the decoder
 * never gets as far as the data.
 *
 * Alignment patterns are deliberately NOT here; see `isAlignmentModule`.
 */
export function isCriticalModule(size: number) {
  const version = versionOfSize(size)

  return (row: number, col: number): boolean => {
    // Finder patterns plus their one-module separators: 8x8 at each corner.
    const nearCorner = (r: number, c: number) =>
      row >= r && row < r + 8 && col >= c && col < c + 8
    if (
      nearCorner(0, 0) ||
      nearCorner(0, size - 8) ||
      nearCorner(size - 8, 0)
    ) {
      return true
    }

    // Timing patterns: the full row 6 and column 6.
    if (row === 6 || col === 6) return true

    // Format information: row 8 and column 8, at both ends.
    if (row === 8 && (col <= 8 || col >= size - 8)) return true
    if (col === 8 && (row <= 8 || row >= size - 8)) return true

    // Version information, version 7 and up: two 3x6 blocks.
    if (version >= 7) {
      if (row < 6 && col >= size - 11 && col < size - 8) return true
      if (col < 6 && row >= size - 11 && row < size - 8) return true
    }

    return false
  }
}

/**
 * The alignment patterns — reserved, but survivable, and the distinction is
 * what makes a logo possible at all.
 *
 * They exist so a decoder can undo perspective on a photographed symbol, and
 * they are read as a SET: a missing one is interpolated from its neighbours,
 * which is why every practical generator draws logos straight over them.
 * Treating them as fatal is not the safe choice, it is the useless one —
 * measured while building this: from version 21 the patterns tile the symbol
 * every ~22 modules, so a centred logo of any size lands on one, and demanding
 * a clean centre pushed a version-21 payload to version 28. That is 129x129
 * modules for a code that needed 101 — denser, harder to scan, and worse in
 * every way than the missing pattern it was avoiding.
 */
export function isAlignmentModule(size: number) {
  const centres = alignmentCentres(versionOfSize(size))

  return (row: number, col: number): boolean =>
    centres.some(([r, c]) => Math.abs(row - r) <= 2 && Math.abs(col - c) <= 2)
}

/** Every reserved module, critical or not. For analysis and tests. */
export function isFunctionModule(size: number) {
  const critical = isCriticalModule(size)
  const alignment = isAlignmentModule(size)
  return (row: number, col: number) => critical(row, col) || alignment(row, col)
}

export interface QrMatrix {
  /** Modules per side, e.g. 21 for version 1. */
  size: number
  isDark: (row: number, col: number) => boolean
  /** True for the 7x7 finder blocks — those are drawn by the eye painter. */
  isFinder: (row: number, col: number) => boolean
  /** A dark DATA module, i.e. one this shape catalogue is responsible for. */
  isData: (row: number, col: number) => boolean
}

export function buildMatrix(
  text: string,
  level: QrErrorLevel,
  /**
   * Force a version (1–40) instead of taking the smallest that fits.
   *
   * Only one caller needs this and it needs it for a correctness reason, not a
   * cosmetic one: a centred logo has to clear the function patterns, and on a
   * small symbol there is no central space that does. Growing the symbol is the
   * fix — see `logo-fit.ts`.
   */
  typeNumber: TypeNumber = 0
): QrMatrix {
  // Type number 0 asks the encoder for the smallest version the data fits in.
  const qr = qrcode(typeNumber, level)
  qr.addData(text)
  qr.make()

  const size = qr.getModuleCount()

  const inside = (row: number, col: number) =>
    row >= 0 && col >= 0 && row < size && col < size

  const isFinder = (row: number, col: number) => {
    const near = (r: number, c: number) =>
      row >= r && row < r + FINDER_SIZE && col >= c && col < c + FINDER_SIZE
    return (
      near(0, 0) || near(0, size - FINDER_SIZE) || near(size - FINDER_SIZE, 0)
    )
  }

  const isDark = (row: number, col: number) =>
    inside(row, col) && qr.isDark(row, col)

  return {
    size,
    isDark,
    isFinder,
    isData: (row, col) => isDark(row, col) && !isFinder(row, col)
  }
}

/**
 * The four orthogonal neighbours of a data module.
 *
 * This is what separates a modern code from a grid of detached blobs: a shape
 * that knows its neighbours can round only the corners that face empty space,
 * so runs of modules fuse into continuous strokes. Diagonals are deliberately
 * not included — a diagonal neighbour does not share an edge, so it must not
 * suppress rounding.
 */
export interface Neighbours {
  top: boolean
  right: boolean
  bottom: boolean
  left: boolean
}

export function neighboursOf(
  matrix: QrMatrix,
  row: number,
  col: number
): Neighbours {
  return {
    top: matrix.isData(row - 1, col),
    right: matrix.isData(row, col + 1),
    bottom: matrix.isData(row + 1, col),
    left: matrix.isData(row, col - 1)
  }
}
