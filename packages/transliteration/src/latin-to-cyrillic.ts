/**
 * Latin to Cyrillic transliteration (Uzbek)
 * Handles greedy digraph matching and special character combinations
 */

import { S_INITIAL_SUFFIXES } from "./constants"
import {
  isLatinVowel,
  isUpperCase,
  isWordBoundary,
  normalizeApostrophes,
  preserveCase
} from "./helpers"
import {
  UZBEK_LATIN_TO_CYRILLIC_DIGRAPHS,
  UZBEK_LATIN_TO_CYRILLIC_SINGLE
} from "./mappings"

/**
 * Is the "ts" starting at `index` a stem/suffix seam rather than the letter ц?
 *
 * Uzbek uses both, and the two are indistinguishable without looking at what
 * follows. The seam only ever appears when a stem ending in "t" meets one of
 * the closed set of s-initial suffixes — ket+sin, ayt+sam, yot+sa, kredit+siz
 * — and the suffix must run to the end of the word. Anything else is "ц":
 * informatsiya, operatsiya, protsent, sotsial, tsivilizatsiya.
 */
function isTsMorphemeSeam(text: string, index: number): boolean {
  const rest = text.slice(index + 1).toLowerCase()

  for (const suffix of S_INITIAL_SUFFIXES) {
    if (!rest.startsWith(suffix)) continue
    const after = rest[suffix.length]
    // The suffix has to END the word; "sa" inside "informatsiya" must not count.
    if (after === undefined || !/[a-z']/.test(after)) return true
  }

  return false
}

/**
 * Transliterate Latin text to Cyrillic (Uzbek)
 * Uses greedy matching for digraphs (sh, ch, ng, etc.)
 */
export function transliterateLatinToCyrillic(text: string): string {
  const normalized = normalizeApostrophes(text)
  let result = ""
  let i = 0

  while (i < normalized.length) {
    const char = normalized[i]
    const nextChar = normalized[i + 1] || ""
    const twoChars = char + nextChar
    const lowerChar = char.toLowerCase()
    const lowerTwo = twoChars.toLowerCase()

    // NOTE: there is deliberately NO 'shch' → 'щ' rule here.
    //
    // 'щ' does not exist in the Uzbek Cyrillic alphabet — it is a Russian
    // letter, and 'shch' is its ISO 9 romanisation. But in Uzbek Latin the
    // same four characters are overwhelmingly a 'sh' + 'ch' MORPHEME BOUNDARY:
    // ish+chi, bosh+chilik, yosh+chilik, qish+chi. Those are ordinary words.
    //
    // The old rule fired on them and produced nonsense: 'ishchi' (worker) came
    // out as 'ищи'. Measured against this repo's own 226 chapters of Uzbek
    // prose, 4 of 4 'shch' occurrences were the Uzbek boundary and 0 were
    // Russian 'щ'.
    //
    // The trade is explicit and one-directional: Latin 'borshch' now yields
    // 'боршч' instead of 'борщ'. Cyrillic → Latin is unaffected — 'щ' still
    // romanises to 'shch' (see RUSSIAN_CYRILLIC_TO_LATIN), because that
    // direction has no ambiguity to resolve.

    // === SPECIAL CASE: 'y' combinations ===
    if (lowerChar === "y") {
      const nextTwo = normalized.substring(i + 1, i + 3).toLowerCase()

      // "yo'" should be "й" + "ў", not "ё"
      if (nextTwo === "o'") {
        result += preserveCase(char, "й")
        i++
        continue
      }

      // "yo" → "ё"
      if (nextChar.toLowerCase() === "o") {
        result += preserveCase(char, "ё")
        i += 2
        continue
      }

      // "ya" → "я"
      if (nextChar.toLowerCase() === "a") {
        result += preserveCase(char, "я")
        i += 2
        continue
      }

      // "yu" → "ю"
      if (nextChar.toLowerCase() === "u") {
        result += preserveCase(char, "ю")
        i += 2
        continue
      }

      // "ye" → "е" (at word start or after vowel)
      if (nextChar.toLowerCase() === "e") {
        result += preserveCase(char, "е")
        i += 2
        continue
      }

      // Standalone "y" → "й"
      result += preserveCase(char, "й")
      i++
      continue
    }

    // === SPECIAL CASE: 'e' at word start → 'э' ===
    if (lowerChar === "e" && isWordBoundary(normalized, i)) {
      result += preserveCase(char, "э")
      i++
      continue
    }

    // === DIGRAPHS with apostrophe ===
    if (lowerTwo === "g'" || lowerTwo === "o'") {
      const cyrillic = UZBEK_LATIN_TO_CYRILLIC_DIGRAPHS[lowerTwo]
      result += preserveCase(char, cyrillic)
      i += 2
      continue
    }

    // === SPECIAL CASE: "ng'" should be "н" + "ғ", not "нг" ===
    if (lowerTwo === "ng" && normalized[i + 2] === "'") {
      result += preserveCase(char, "н")
      i++
      continue
    }

    // === 'ts' → 'ц', unless it is a stem/suffix seam ===
    //
    // 'ts' used to be excluded from the digraph list outright, on the grounds
    // that it "causes issues in compound words" — true of ketsin/aytsam/yotsa,
    // and false of everything else. The blanket exclusion cost the entire
    // '-tsiya' family: informatsiya came out as 'информатсия' instead of
    // 'информация', and the same for operatsiya, konstitutsiya, stantsiya,
    // delegatsiya, revolyutsiya — hundreds of everyday words.
    if (lowerTwo === "ts" && !isTsMorphemeSeam(normalized, i)) {
      if (isUpperCase(char) && isUpperCase(nextChar)) {
        result += "Ц"
      } else {
        result += preserveCase(char, "ц")
      }
      i += 2
      continue
    }

    // === STANDARD DIGRAPHS (the seam-free ones) ===
    if (["sh", "ch", "ng"].includes(lowerTwo)) {
      const cyrillic = UZBEK_LATIN_TO_CYRILLIC_DIGRAPHS[lowerTwo]
      if (isUpperCase(char) && isUpperCase(nextChar)) {
        result += cyrillic.toUpperCase()
      } else {
        result += preserveCase(char, cyrillic)
      }
      i += 2
      continue
    }

    // === APOSTROPHE handling ===
    if (char === "'") {
      const prevChar = i > 0 ? normalized[i - 1].toLowerCase() : ""
      const nextCharLower = nextChar.toLowerCase()

      // 'h after consonant → skip apostrophe, h will become ҳ
      if (nextCharLower === "h" && !isLatinVowel(prevChar)) {
        i++
        continue
      }

      // Check for 'y + vowel pattern (like 'ya, 'ye, 'yo, 'yu)
      // This is Russian soft sign + iotated vowel: ья, ье, ьё, ью
      const afterNext = normalized[i + 2]?.toLowerCase() || ""
      if (nextCharLower === "y" && "aeou".includes(afterNext)) {
        result += "ь"
        i++
        continue
      }

      // Rus: Apostrophe at end of word → soft sign (ь)
      // Example: ochen' → очень. Uzbek orthography never ends a word in the
      // tutuq belgisi, so this branch is unambiguously Russian.
      const isEndOfWord = !nextChar || /[\s.,!?;:-]/.test(nextChar)
      if (isEndOfWord) {
        result += "ь"
        i++
        continue
      }

      // O'zbek: the tutuq belgisi is ALWAYS the hard sign (ъ) — after a vowel
      // AND after a consonant. It marks a glottal stop or a long vowel, and
      // Uzbek Cyrillic writes it the same way in both positions:
      //   after a vowel     ma'no → маъно · she'r → шеър · a'lo → аъло
      //   after a consonant san'at → санъат · qal'a → қалъа · sun'iy → сунъий
      //
      // The consonant case used to fall through to the Russian soft-sign rule
      // below and produced 'саньат' / 'қальа' / 'сунъий'→'суньий' — visibly
      // wrong to any Uzbek reader, and invisible to a round-trip test because
      // 'ь' romanises back to an apostrophe too.
      //
      // The Russian pattern this displaces (p'esa → пьеса) is rarer here by a
      // wide margin: this is an Uzbek converter, and Russian input normally
      // arrives already in Cyrillic, which is the other direction.
      result += "ъ"
      i++
      continue
    }

    // === SINGLE CHARACTER mapping ===
    const cyrillicChar = UZBEK_LATIN_TO_CYRILLIC_SINGLE[lowerChar]
    if (cyrillicChar) {
      result += preserveCase(char, cyrillicChar)
    } else {
      result += char
    }
    i++
  }

  return result
}
