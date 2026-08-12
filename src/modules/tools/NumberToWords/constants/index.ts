/**
 * UI-level constants only. The numerals themselves live in
 * `src/lib/uzbek-number-words/` — shared with the tilxat generator, which
 * embeds the same sum-in-words into a document.
 */

export {
  DEFAULT_MODE,
  OUTPUT_MODES,
  type OutputMode
} from "@/lib/uzbek-number-words/constants"

/**
 * The questions this tool answers, in the order they are asked.
 *
 * One list, read by BOTH the visible FAQ and the `FAQPage` structured data —
 * so the schema cannot describe questions the page does not show, which is a
 * mistake this repo has already made and fixed once.
 */
export const FAQ_KEYS = [
  "why",
  "scripts",
  "birMing",
  "tiyin",
  "limit",
  "privacy"
] as const
