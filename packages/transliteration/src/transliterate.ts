/**
 * Main transliteration module - Public API
 * Handles Latin ↔ Cyrillic conversion for Uzbek and Russian
 *
 * Architecture:
 * 1. Protect special content (URLs, emails, code blocks, technical terms)
 * 2. Detect script and language
 * 3. Apply appropriate transliteration algorithm
 * 4. Restore protected content
 */

import { APOSTROPHE_VARIANTS } from "./constants"
import { transliterateCyrillicToLatin } from "./cyrillic-to-latin"
import { isCyrillicDominant } from "./detect-script"
import { newLatinToOld, normaliseLatin2027, oldLatinToNew } from "./latin-2027"
import { transliterateLatinToCyrillic } from "./latin-to-cyrillic"
import { protectContent, restoreContent } from "./protection"
import type { UzbekScript } from "./types"

// =============================================================================
// PUBLIC API
// =============================================================================

/**
 * Detect if text contains predominantly Cyrillic characters.
 *
 * One implementation, in detect-script.ts. There used to be two \u2014 this one
 * counted raw characters, `detectScript` counted them again with different
 * thresholds, and callers picked whichever name they happened to import.
 */
export { isCyrillicDominant as isCyrillicText } from "./detect-script"

/**
 * Words the caller wants left alone, on top of the built-in vocabulary.
 *
 * Optional everywhere, so every existing call site keeps working unchanged.
 */
export interface ConversionOptions {
  preserve?: readonly string[]
}

/**
 * Convert Latin text to Cyrillic (Uzbek)
 * Handles: URLs, emails, code blocks, technical terms protection
 */
export function toCyrillic(text: string, options?: ConversionOptions): string {
  if (!text) return ""

  const { maskedText, protectedParts } = protectContent(text, options?.preserve)
  const transliterated = transliterateLatinToCyrillic(maskedText)
  return restoreContent(transliterated, protectedParts)
}

/**
 * Convert Cyrillic text to Latin (Uzbek + Russian support)
 * Handles: URLs, emails, code blocks, technical terms protection
 */
export function toLatin(text: string, options?: ConversionOptions): string {
  if (!text) return ""

  const { maskedText, protectedParts } = protectContent(text, options?.preserve)
  const transliterated = transliterateCyrillicToLatin(maskedText)
  return restoreContent(transliterated, protectedParts)
}

/**
 * Each target as a pipeline over masked text, built from the two existing
 * engines and the letter mapping between the Latin alphabets.
 *
 * No source detection is needed, which is the point of the shape: each engine
 * only touches its own script and passes everything else through. Cyrillic →
 * Latin leaves Latin alone, Latin → Cyrillic leaves Cyrillic alone, so text in
 * ANY mix of the three alphabets lands in the target in one pass — and mixed
 * text is exactly what the transition years will produce.
 */
const TO_SCRIPT: Record<UzbekScript, (masked: string) => string> = {
  "latin-2027": (masked) => oldLatinToNew(transliterateCyrillicToLatin(masked)),
  latin: (masked) => newLatinToOld(transliterateCyrillicToLatin(masked)),
  // The Latin → Cyrillic engine reads both Latin alphabets itself.
  cyrillic: transliterateLatinToCyrillic
}

/**
 * A protected word with an apostrophe suffix: Telegram'gacha, Google'da.
 *
 * The NAME is protected; the suffix after the apostrophe is Uzbek. Leaving it
 * in the old spelling meant one word converted two ways — Telegram'gaça typed
 * new stayed new, Telegram'gacha typed old stayed old. The stem class has no
 * `/`, `:`, `@`, `<` or backtick, so links, addresses, markup and code never
 * take this shape. A plain suffix (Reactchilar) has no seam to split on and is
 * left as typed.
 */
const SUFFIXED_WORD = new RegExp(
  `^([A-Za-z0-9+#._-]+[${APOSTROPHE_VARIANTS.join("")}])(\\p{L}+)$`,
  "u"
)

/** The Latin-to-Latin step a suffix takes. Cyrillic keeps the name AND its
 * suffix in Latin, as Google'da always has. */
const SUFFIX_SPELLING: Record<
  UzbekScript,
  ((suffix: string) => string) | null
> = {
  "latin-2027": oldLatinToNew,
  latin: newLatinToOld,
  cyrillic: null
}

function respellSuffix(part: string, target: UzbekScript): string {
  const respell = SUFFIX_SPELLING[target]
  const match = respell ? SUFFIXED_WORD.exec(part) : null
  return respell && match ? match[1] + respell(match[2]) : part
}

/**
 * Convert Uzbek text in any of its three alphabets into `target`.
 *
 * Masking comes FIRST and look-alike correction second (ș → ş, the 2019 and
 * 2021 drafts' ǵ and ŏ, decomposed accents). The other way round rewrote the
 * protected spans too — a Romanian Wikipedia link's Ș became Ş, a different
 * URL. The protection layer counts the look-alikes as letters for exactly
 * this reason.
 */
export function toUzbekScript(
  text: string,
  target: UzbekScript,
  options?: ConversionOptions
): string {
  if (!text) return ""

  // Cyrillic prose into the 1995 Latin is the converter's oldest job, and it
  // stays exactly `toLatin`. In that text a Latin word with ş, ö or ğ is a
  // Turkish or German name — Erdoğan, Gödel, Özil — far more often than a
  // new-alphabet Uzbek word, and respelling it (Erdog'an) is something the
  // Latin-Cyrillic page never did. The new-alphabet target keeps the full
  // pass: finishing a half-converted document is that target's whole job.
  if (target === "latin" && isCyrillicDominant(text)) {
    return toLatin(text, options)
  }

  const { maskedText, protectedParts } = protectContent(text, options?.preserve)
  const converted = TO_SCRIPT[target](normaliseLatin2027(maskedText))

  return restoreContent(
    converted,
    protectedParts.map((part) => respellSuffix(part, target))
  )
}
