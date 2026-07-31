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

export interface QrMatrix {
  /** Modules per side, e.g. 21 for version 1. */
  size: number
  isDark: (row: number, col: number) => boolean
  /** True for the 7x7 finder blocks — those are drawn by the eye painter. */
  isFinder: (row: number, col: number) => boolean
  /** A dark DATA module, i.e. one this shape catalogue is responsible for. */
  isData: (row: number, col: number) => boolean
}

export function buildMatrix(text: string, level: QrErrorLevel): QrMatrix {
  // Type number 0 asks the encoder for the smallest version the data fits in.
  const qr = qrcode(0, level)
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
