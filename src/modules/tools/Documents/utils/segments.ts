import { toCyrillic } from "@webiston/transliteration"

import { BLANK } from "../constants"
import type { DocumentBlock, DocumentSegment } from "../types"

/**
 * The vocabulary every composer writes in.
 *
 * Per-segment transliteration is safe because every boundary falls at a
 * value's edge — always a whole word or phrase, never inside a digraph — and
 * the one suffix glued to a value ("…gacha") starts with `g`, which no
 * preceding letter can combine with.
 */

/** Fixed prose. */
export const tpl = (text: string): DocumentSegment => ({
  text,
  kind: "template"
})

/** A writing line, for a field that is empty or invalid. */
export const blank = (text: string = BLANK): DocumentSegment => ({
  text,
  kind: "blank"
})

/** Something the visitor supplied. `translit: false` shields identifiers. */
export const val = (text: string, translit = true): DocumentSegment => ({
  text,
  kind: "value",
  translit
})

/** A validated value, or the writing line that stands in for it. */
export function field(
  value: string,
  valid: (input: string) => boolean,
  line: string = BLANK
): DocumentSegment {
  const trimmed = value.trim()
  return trimmed && valid(trimmed) ? val(trimmed) : blank(line)
}

/** One paragraph. `align` defaults to the sheet's justified body. */
export const block = (
  segments: DocumentSegment[],
  align?: DocumentBlock["align"]
): DocumentBlock => (align ? { segments, align } : { segments })

/** The Cyrillic document, segment by segment. */
export function toCyrillicBlocks(blocks: DocumentBlock[]): DocumentBlock[] {
  return blocks.map((entry) => ({
    ...entry,
    segments: entry.segments.map((segment) =>
      segment.translit === false
        ? segment
        : { ...segment, text: toCyrillic(segment.text) }
    )
  }))
}

/** Every segment's text, in order — one block flattened. */
export function blockText(entry: DocumentBlock): string {
  return entry.segments.map((segment) => segment.text).join("")
}

/**
 * The copyable text: the heading, then one blank line between paragraphs.
 *
 * This is what the clipboard and the tests see, so the blank line between
 * blocks is part of the document's definition rather than a rendering detail.
 */
export function plainText(blocks: DocumentBlock[], heading: string): string {
  return `${heading}\n\n${blocks.map(blockText).join("\n\n")}`
}
