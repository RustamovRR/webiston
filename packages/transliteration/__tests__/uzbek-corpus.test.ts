import { describe, expect, it } from "vitest"
import { isCyrillicText, toCyrillic, toLatin } from "../src"

/**
 * The regression net for real Uzbek text.
 *
 * The suite that existed before this file had 307 passing tests and still let
 * all four of these through, because every case in it was a synthetic fragment
 * ("shch", "ShH", "YaNGi") rather than a word an Uzbek speaker would type. A
 * converter is judged on words, so this file is words.
 *
 * Add a case here whenever a conversion is reported wrong — the failing word
 * IS the bug report.
 */

// =============================================================================
// MORPHEME BOUNDARIES — where two letters meet and are not a digraph
// =============================================================================

describe("morpheme boundaries: sh + ch is not щ", () => {
  it.each([
    ["ishchi", "ишчи"], // worker — the word that exposed this
    ["ishchilar", "ишчилар"],
    ["ishchan", "ишчан"],
    ["boshchilik", "бошчилик"],
    ["yoshchilik", "ёшчилик"],
    ["qishchi", "қишчи"],
    ["Ishchi", "Ишчи"],
    ["ISHCHI", "ИШЧИ"]
  ])("%s → %s", (input, expected) => {
    expect(toCyrillic(input)).toBe(expected)
  })
})

describe("ts is ц in loanwords and two letters at a stem/suffix seam", () => {
  it.each([
    // the -tsiya family — hundreds of everyday words, all of them wrong before
    ["informatsiya", "информация"],
    ["operatsiya", "операция"],
    ["konstitutsiya", "конституция"],
    ["stantsiya", "станция"],
    ["delegatsiya", "делегация"],
    ["revolyutsiya", "революция"],
    ["konferentsiya", "конференция"],
    ["tsivilizatsiya", "цивилизация"],
    // other ц loanwords
    ["protsent", "процент"],
    ["sotsial", "социал"],
    ["printsip", "принцип"]
  ])("%s → %s", (input, expected) => {
    expect(toCyrillic(input)).toBe(expected)
  })

  it.each([
    // stem ending in t + an s-initial suffix: two letters, never ц
    ["ketsin", "кетсин"],
    ["ketsinlar", "кетсинлар"],
    ["ketsangiz", "кетсангиз"],
    ["aytsam", "айтсам"],
    ["yotsa", "ётса"],
    ["eshitsak", "эшитсак"],
    ["kreditsiz", "кредитсиз"]
  ])("%s → %s", (input, expected) => {
    expect(toCyrillic(input)).toBe(expected)
  })
})

describe("morpheme boundaries: n + g is not always нг", () => {
  it.each([
    ["yangi", "янги"],
    ["singil", "сингил"],
    ["tong", "тонг"],
    ["ko'ngil", "кўнгил"]
  ])("%s → %s", (input, expected) => {
    expect(toCyrillic(input)).toBe(expected)
  })
})

// =============================================================================
// TUTUQ BELGISI — Uzbek writes ъ after a consonant too, not the Russian ь
// =============================================================================

describe("tutuq belgisi is ъ after a consonant as well as a vowel", () => {
  it.each([
    // after a consonant — these all used to come back with ь
    ["san'at", "санъат"],
    ["qal'a", "қалъа"],
    ["mas'ul", "масъул"],
    ["in'om", "инъом"],
    ["sun'iy", "сунъий"],
    // after a vowel — already correct, kept so a future change cannot silently
    // trade one for the other
    ["ma'no", "маъно"],
    ["she'r", "шеър"],
    ["a'lo", "аъло"],
    ["e'tibor", "эътибор"],
    ["shu'la", "шуъла"]
  ])("%s → %s", (input, expected) => {
    expect(toCyrillic(input)).toBe(expected)
  })

  it.each([
    ["санъат", "san'at"],
    ["қалъа", "qal'a"],
    ["масъул", "mas'ul"],
    ["инъом", "in'om"]
  ])("%s → %s", (input, expected) => {
    expect(toLatin(input)).toBe(expected)
  })
})

// =============================================================================
// PROTECTION — must not swallow ordinary Uzbek
// =============================================================================

describe("protection leaves ordinary Uzbek alone", () => {
  // Every one of these came back still in Latin before the protected-word list
  // learnt about Uzbek homographs, apostrophe-aware boundaries, and the
  // minimum stem length for suffixes.
  it.each([
    // o' and g' are single LETTERS; `\b` splits them and offered whatever
    // followed as a standalone token. Found by scanning all 226 Uzbek chapters
    // in content/ — 22,928 distinct words, three hits, all common.
    ["o'sha", "ўша"], // 'sha' — the hash family
    ["o'shani", "ўшани"],
    ["ko'rsa", "кўрса"], // 'rsa' — the cipher
    ["ko'rsalar", "кўрсалар"],
    ["o'ram", "ўрам"], // 'ram' — the memory
    ["buni", "буни"], // 'bun' + the accusative suffix
    ["bunga", "бунга"],
    ["bundan", "бундан"],
    ["tan", "тан"], // tangent
    ["tanga", "танга"],
    ["tani", "тани"],
    ["sin", "син"], // sine
    ["bar", "бар"],
    ["bardan", "бардан"],
    ["test", "тест"], // absorbed loanwords Uzbek writes in Cyrillic
    ["format", "формат"],
    ["super", "супер"],
    ["start", "старт"],
    ["virus", "вирус"]
  ])("%s → %s", (input, expected) => {
    expect(toCyrillic(input)).toBe(expected)
  })

  it("converts a whole sentence without leaving Latin behind", () => {
    // Arrange
    const input = "Men buni tan oldim va o'sha kuni bir tanga topdim."

    // Act
    const result = toCyrillic(input)

    // Assert
    expect(result).toBe("Мен буни тан олдим ва ўша куни бир танга топдим.")
    expect(result).not.toMatch(/[a-zA-Z]/)
  })
})

describe("protection still holds for things that must not be converted", () => {
  it.each([
    ["React va Vue", "React ва Vue"],
    // stem + Uzbek suffix: the whole token stays Latin, which is the point —
    // splitting it would spell the product name and then break mid-word
    ["reactda yozdim", "reactda ёздим"],
    ["JavaScriptni o'rgandim", "JavaScriptni ўргандим"],
    [
      "https://webiston.uz saytiga kiring",
      "https://webiston.uz сайтига киринг"
    ],
    ["email: info@webiston.uz", "email: info@webiston.uz"],
    // A quoted product name is still protected — the o'/g' guard is narrow
    // enough not to catch an ordinary apostrophe used as a quote.
    ["'React' kutubxonasi", "'React' кутубхонаси"],
    // The Uzbek way of attaching a suffix to a foreign word. Whatever follows
    // the apostrophe is the suffix — the list of endings is not enumerable, so
    // the rule does not try to enumerate it.
    ["Google'da", "Google'da"],
    ["TikTok'gacha", "TikTok'gacha"],
    ["LLM'larni", "LLM'larni"],
    // Entry + plain suffix + apostrophe suffix, all three stacked.
    ["rendering'ning", "rendering'ning"],
    // A protected word followed by a closing quote keeps the quote.
    ["Remix' haqida", "Remix' ҳақида"],
    ["`const x = 1` kodi", "`const x = 1` коди"],
    ["config.json faylini oching", "config.json файлини очинг"]
  ])("%s → %s", (input, expected) => {
    expect(toCyrillic(input)).toBe(expected)
  })
})

// =============================================================================
// ROUND TRIP — the property that must hold for ordinary prose
// =============================================================================

describe("round trip is stable for everyday Uzbek", () => {
  const sentences = [
    "Assalomu alaykum! O'zbekiston — go'zal mamlakat.",
    "Toshkent shahrida ishchilar yig'ilishdi.",
    "San'at va madaniyat haqida ma'lumot.",
    "O'sha kuni biz to'g'ri qaror qabul qildik.",
    "Bu yerda 29 harf bor: A, B, D, E, F, G, H.",
    "Mas'uliyat — har bir insonning burchi."
  ]

  it.each(sentences)("latin → cyrillic → latin: %s", (input) => {
    expect(toLatin(toCyrillic(input))).toBe(input)
  })

  it.each(sentences.map((s) => toCyrillic(s)))(
    "cyrillic → latin → cyrillic: %s",
    (input) => {
      expect(toCyrillic(toLatin(input))).toBe(input)
    }
  )
})

describe("conversion is idempotent in its own script", () => {
  it("converting Cyrillic output again does not change it", () => {
    // Arrange
    const cyrillic = toCyrillic("O'zbek tilida ishchilar san'at haqida gapirdi")

    // Act
    const again = toCyrillic(cyrillic)

    // Assert
    expect(again).toBe(cyrillic)
  })
})

// =============================================================================
// ROBUSTNESS — inputs that used to break the masking layer
// =============================================================================

describe("masking survives hostile input", () => {
  it("does not let text forge a placeholder", () => {
    // Arrange — U+0000 "0" U+0000 is byte-identical to placeholder #0, so the
    // restore step used to swap in whatever span happened to be protected
    // first. This exact input returned "React React salom".
    const nul = String.fromCharCode(0)
    const input = `React ${nul}0${nul} salom`

    // Act
    const result = toCyrillic(input)

    // Assert — "React" appears once, where the user put it
    expect(result.match(/React/g)).toHaveLength(1)
    expect(result).not.toContain(nul)
  })

  it("stays linear on text full of -tsiya words", () => {
    // Arrange — the seam check used to copy the rest of the document for every
    // "ts" it met. Measured before the window was bounded: 21 ms at 30 KB,
    // 3.2 s at 480 KB, 49 s at 1.9 MB.
    const unit = "Informatsiya operatsiya stansiya konstitutsiya. "
    const small = unit.repeat(600)
    const large = unit.repeat(4800) // 8x the characters

    // Act
    let started = performance.now()
    toCyrillic(small)
    const smallMs = performance.now() - started
    started = performance.now()
    toCyrillic(large)
    const largeMs = performance.now() - started

    // Assert — linear means ~8x, quadratic means ~64x. 20x leaves room for a
    // noisy CI box without letting the quadratic version through.
    expect(largeMs).toBeLessThan(Math.max(smallMs, 1) * 20)
  })

  it("stays linear on many unclosed HTML openers", () => {
    // Arrange — the HTML-tag pattern used to scan to end-of-input for each
    // unclosed "<tag": 273 KB of this took 6.6 seconds.
    const input = "<div salom dunyo bugun havo yaxshi ".repeat(8000)

    // Act
    const started = performance.now()
    toCyrillic(input)
    const elapsed = performance.now() - started

    // Assert — a wide margin over the ~34ms it now takes; the point is that it
    // is not seconds.
    expect(elapsed).toBeLessThan(1500)
  })
})

// =============================================================================
// DIRECTION DETECTION — the vote must be taken on prose, not on links
// =============================================================================

describe("script detection ignores spans that are never transliterated", () => {
  it.each([
    // Cyrillic articles with one Latin span. Every one of these used to be
    // classified as Latin, so the converter ran the wrong way.
    "Батафсил маълумот: https://gazeta.uz/oz/2024/01/01/latin-kirill/",
    "Менга ёзинг: info@webiston.uz ёки @webiston_uz",
    "Ассалому алайкум",
    "Салом дунё"
  ])("cyrillic: %s", (input) => {
    expect(isCyrillicText(input)).toBe(true)
  })

  it.each(["Bugun havo yaxshi", "Hello world", "O'zbekiston Respublikasi"])(
    "latin: %s",
    (input) => {
      expect(isCyrillicText(input)).toBe(false)
    }
  )
})
