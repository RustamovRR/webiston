/**
 * Single quotation marks in Latin text.
 *
 * The apostrophe does four jobs in Latin Uzbek and Russian, and three of them
 * are a sign on the LETTER before it: the tutuq (san'at), o' and g', and the
 * Russian soft sign (ochen'). The engines read every apostrophe as one of
 * those three, so the fourth — a plain quotation mark — came out as a letter:
 *
 *   'Salom' dedi      → 'Саломь деди     (closing quote read as ь)
 *   'kino' so'zi      → 'кинў сўзи       (closing quote eaten by o')
 *   'pedagog' so'zi   → 'педагоғ сўзи    (… and by g')
 *
 * A closing quote cannot be told from ь by looking at it. The opening quote
 * can: neither alphabet ever writes an apostrophe at the START of a word, so
 * one on a word boundary with a word right after it is a quotation mark, and
 * the next word-final apostrophe on that line is the one that closes it.
 *
 * One decision is genuinely ambiguous. Word-final g' is common Uzbek — tog',
 * bog', sog' — and so is a quoted word ending in a plain g: pedagog, katalog,
 * dialog. Inside an open quote a word-final g' is the closing mark only when
 * nothing later on the line could close the quote instead. Word-final o' has
 * no such reading — ў does not end Uzbek words — so it always closes.
 */

import { isWordBoundary } from "./helpers"
import { PLACEHOLDER_PREFIX } from "./protection"

function isLatinLetter(char: string | undefined): boolean {
  return char !== undefined && /[a-z]/i.test(char)
}

/** A word starts here: a letter, or a protected span (`'React kutubxonasi'`). */
function startsWord(char: string | undefined): boolean {
  return isLatinLetter(char) || char === PLACEHOLDER_PREFIX
}

/**
 * Does a sentence end at `index`? A terminator followed by a space, or the
 * end of the text. `baland.' dedi` is not one: the quote closes first.
 */
function endsSentence(text: string, index: number): boolean {
  const next = text[index + 1]
  return ".!?…".includes(text[index]) && (next === undefined || /\s/.test(next))
}

/**
 * With a quote open, could a LATER apostrophe in this sentence close it?
 *
 * The sentence, not the line, is the bound — and that bound was found by
 * typing a paragraph, not by a test. A paragraph is one line, so a line-wide
 * look-ahead for `'pedagog' so'zi.` ran on into the next sentence, found
 * `Ochen'`, and decided the quote closed THERE: pedagog' became педагоғ and
 * ochen' a quote mark. Single quotes do not span sentences in practice; a
 * look-ahead that does guesses across them.
 *
 * Skips the apostrophes inside words (o'zbek, ma'no) and stops at the first
 * other one, which is what keeps every scan short: the next word-final g' is
 * itself such a stop, so the scans never overlap and the pass stays linear.
 */
function quoteClosesLater(text: string, from: number): boolean {
  for (
    let j = from;
    j < text.length && text[j] !== "\n" && !endsSentence(text, j);
    j++
  ) {
    if (text[j] !== "'") continue

    const before = text[j - 1]
    const after = text[j + 1]

    if (startsWord(after)) {
      // Inside a word — not a candidate.
      if (isLatinLetter(before)) continue
      // The NEXT quotation opening: so this g' closes the current one.
      if (isWordBoundary(text, j)) return false
      continue
    }

    // Every other mark can close it: after a letter (baland'), after
    // punctuation (baland!'), after another mark (tog'').
    return true
  }

  return false
}

/**
 * The indices of every apostrophe in `text` that is a quotation mark.
 *
 * `text` must already be apostrophe-normalised and masked; a placeholder
 * counts as a word. A quote never outlives its sentence, so a quotation left
 * open — or misjudged — cannot turn the next sentence's ochen' or bog' into a
 * closing mark. A quote that does span sentences loses nothing by it: its
 * closing mark normally follows punctuation (`Qalaysan?'`), and that one is
 * a plain mark to both engines whatever this function says.
 */
export function findQuoteMarks(text: string): Set<number> {
  const marks = new Set<number>()
  if (!text.includes("'")) return marks

  let open = false

  for (let i = 0; i < text.length; i++) {
    const char = text[i]

    if (char === "\n" || endsSentence(text, i)) {
      open = false
      continue
    }
    if (char !== "'") continue

    const before = text[i - 1]
    const after = text[i + 1]

    if (!isLatinLetter(before)) {
      if (isWordBoundary(text, i) && startsWord(after)) {
        marks.add(i)
        open = true
      } else if (!startsWord(after)) {
        // 'Salom!' and 'React' — the closing mark follows punctuation or a
        // protected span rather than a letter.
        if (open) marks.add(i)
        open = false
      }
      continue
    }

    // After a letter, inside a word: a sign on that letter, not ours.
    if (!open || startsWord(after)) continue

    if (before.toLowerCase() === "g" && quoteClosesLater(text, i + 1)) continue

    marks.add(i)
    open = false
  }

  return marks
}
