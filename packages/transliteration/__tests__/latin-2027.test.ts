import { describe, expect, it } from "vitest"
import {
  detectUzbekScript,
  findPreservedTerms,
  LATIN_2027_LETTERS,
  TUTUQ_BELGISI,
  toCyrillic,
  toLatin,
  toUzbekScript
} from "../src"

/**
 * The 2027 Uzbek Latin alphabet — Law OʻRQ-1184, signed and published
 * 21.10.2026, in force 22.04.2027 (https://lex.uz/uz/docs/8548754).
 *
 * Every expectation here comes from one of two sources: the law's own table,
 * or the 1995 spelling rules (Cabinet resolution 339,
 * https://lex.uz/uz/docs/-1625271), which stay in force until new ones are
 * adopted. Where neither source says anything, the test says so rather than
 * guessing.
 *
 * Escapes appear only where a glyph cannot show what is being tested: the
 * apostrophe-like marks, the look-alikes (ș is not ş) and the combining
 * accents. The new letters themselves are written as letters, and that is
 * safe rather than sloppy: the engine emits the table's code points, which the
 * first block pins, so a look-alike typed into an EXPECTED string fails the
 * test instead of passing it.
 */

const toNew = (text: string) => toUzbekScript(text, "latin-2027")
const toOld = (text: string) => toUzbekScript(text, "latin")
const toCyr = (text: string) => toUzbekScript(text, "cyrillic")

const codePoint = (char: string) =>
  `U+${(char.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, "0")}`

// =============================================================================
// THE TABLE — the code points the law's text on lex.uz actually uses
// =============================================================================

describe("the letters are the law's code points", () => {
  it.each([
    ["g'", "U+011E", "U+011F"],
    ["o'", "U+00D6", "U+00F6"],
    ["sh", "U+015E", "U+015F"],
    ["ch", "U+00C7", "U+00E7"]
  ])("%s → %s / %s", (old, upper, lower) => {
    // Arrange
    const letter = LATIN_2027_LETTERS.find((entry) => entry.old === old)

    // Assert
    expect(letter).toBeDefined()
    expect(codePoint(letter?.upper ?? "")).toBe(upper)
    expect(codePoint(letter?.lower ?? "")).toBe(lower)
  })

  it("lists the four changed letters in alphabet order", () => {
    // Ğ after G, Ö after O, Ş and Ç after S — the order of the law's table.
    expect(LATIN_2027_LETTERS.map((letter) => letter.old)).toEqual([
      "g'",
      "o'",
      "sh",
      "ch"
    ])
  })

  it("keeps the tutuq belgisi as the modifier letter apostrophe", () => {
    // Unchanged from 1995: the old rules on lex.uz use U+02BC for it too.
    expect(codePoint(TUTUQ_BELGISI)).toBe("U+02BC")
  })
})

// =============================================================================
// 1995 LATIN → 2027 LATIN
// =============================================================================

describe("1995 Latin → 2027 Latin", () => {
  it.each([
    ["O'zbekiston", "Özbekiston"],
    ["o'qituvchi", "öqituvçi"],
    ["g'alaba", "ğalaba"],
    // Word-final g' is everyday Uzbek — tog', bog', sog', yog'.
    ["tog'", "toğ"],
    ["bog'cha", "boğça"],
    ["Toshkent shahri", "Toşkent şahri"],
    ["choy", "çoy"],
    ["achchiq", "aççiq"],
    ["ishchi", "işçi"],
    // ш + ҳ: the sh is the letter and the h is h.
    ["Mashhura", "Maşhura"],
    // Ng leaves the alphabet as a letter, but it was always spelled n + g,
    // so nothing in the text changes.
    ["yangi", "yangi"],
    ["ko'ngil", "köngil"],
    ["dengiz", "dengiz"],
    // There is no C: ts stays two letters.
    ["informatsiya", "informatsiya"]
  ])("%s → %s", (input, expected) => {
    expect(toNew(input)).toBe(expected)
  })

  it.each([
    ["O'ZBEKISTON", "ÖZBEKISTON"],
    ["G'ALABA", "ĞALABA"],
    ["SHAHAR", "ŞAHAR"],
    ["Shahar", "Şahar"],
    ["CHOY", "ÇOY"],
    ["Choy", "Çoy"]
  ])("keeps the case: %s → %s", (input, expected) => {
    expect(toNew(input)).toBe(expected)
  })

  it.each([
    ["o\u02BBzbek", "U+02BB, the 1995 letter's own mark"],
    ["o\u2019zbek", "U+2019, what a phone keyboard types"],
    ["o\u2018zbek", "U+2018"],
    ["o`zbek", "the backtick"],
    ["o\u02BCzbek", "U+02BC"],
    ["o'zbek", "the ASCII apostrophe"]
  ])("reads %s (%s) as ö", (input) => {
    expect(toNew(input)).toBe("özbek")
  })

  it.each([
    ["ma'no", "ma\u02BCno"],
    ["san'at", "san\u02BCat"],
    ["e'lon", "e\u02BClon"],
    ["she'r", "şe\u02BCr"],
    ["mas'ul", "mas\u02BCul"]
  ])("writes the tutuq as U+02BC: %s → %s", (input, expected) => {
    expect(toNew(input)).toBe(expected)
  })

  it("keeps the tutuq where s and h are two sounds (1995 rules §17)", () => {
    // Without it, Is'hoq would read as Işoq — a different name.
    expect(toNew("Is'hoq")).toBe("Is\u02BChoq")
    expect(toNew("as'hob")).toBe("as\u02BChob")
  })

  it("leaves quotation marks alone", () => {
    // A quote is not a tutuq, and o + closing quote is not ö: word-final ў
    // does not occur in Uzbek, so `o'` before a non-letter is a quoted word.
    expect(toNew("'Salom' dedi")).toBe("'Salom' dedi")
    expect(toNew("'kino' so'zi")).toBe("'kino' sözi")
    // Word-final g' is ğ (tog') unless it closes a quote — the same call the
    // Cyrillic engine makes, from the same function.
    expect(toNew("'pedagog' so'zi")).toBe("'pedagog' sözi")
    expect(toNew("'Bu tog' baland' dedi")).toBe("'Bu toğ baland' dedi")
  })

  it("is idempotent, and finishes a half-converted text", () => {
    expect(toNew("Özbekiston")).toBe("Özbekiston")
    expect(toNew("Toşkent shahri")).toBe("Toşkent şahri")
  })

  it.each([
    ["To\u0219kent", "Toşkent", "U+0219, comma below (Romanian)"],
    ["TO\u0218KENT", "TOŞKENT", "U+0218"],
    ["\u01F5alaba", "ğalaba", "U+01F5, the May 2019 draft"],
    ["\u014Ezbekiston", "Özbekiston", "U+014E, the March 2021 draft"],
    ["Tos\u0327kent", "Toşkent", "s + combining cedilla"],
    ["g\u0306alaba", "ğalaba", "g + combining breve"],
    ["o\u0308zbek", "özbek", "o + combining diaeresis"]
  ])("replaces a look-alike: %s → %s (%s)", (input, expected) => {
    expect(toNew(input)).toBe(expected)
  })

  it.each([
    ["ChatGPT va GitHub", "ChatGPT va GitHub"],
    ["Google Chrome", "Google Chrome"],
    ["https://shahar.uz/choy", "https://shahar.uz/choy"],
    ["info@shahar.uz", "info@shahar.uz"],
    ["`git push` buyrug'i", "`git push` buyruği"]
  ])("leaves protected spans alone: %s", (input, expected) => {
    expect(toNew(input)).toBe(expected)
  })
})

// =============================================================================
// CYRILLIC → 2027 LATIN
// =============================================================================

describe("Cyrillic → 2027 Latin", () => {
  it.each([
    ["Ўзбекистон", "Özbekiston"],
    ["Тошкент шаҳри", "Toşkent şahri"],
    ["ғалаба", "ğalaba"],
    ["чой", "çoy"],
    ["ишчи", "işçi"],
    ["маъно", "ma\u02BCno"],
    ["санъат", "san\u02BCat"],
    ["Машҳура", "Maşhura"],
    ["янги", "yangi"],
    ["кўнгил", "köngil"],
    ["информация", "informatsiya"],
    ["ЎЗБЕКИСТОН", "ÖZBEKISTON"],
    ["ШАҲАР", "ŞAHAR"]
  ])("%s → %s", (input, expected) => {
    expect(toNew(input)).toBe(expected)
  })

  it("puts the tutuq between с and ҳ (1995 rules §17)", () => {
    expect(toNew("Исҳоқ")).toBe("Is\u02BChoq")
    expect(toNew("асҳоб")).toBe("as\u02BChob")
  })

  it("writes no tutuq after ў (1995 rules §32)", () => {
    expect(toNew("мўъжиза")).toBe("möjiza")
    expect(toNew("мўътабар")).toBe("mötabar")
  })

  it("converts text that mixes Cyrillic and 1995 Latin", () => {
    expect(toNew("Тошкент shahri")).toBe("Toşkent şahri")
  })
})

// =============================================================================
// 2027 LATIN → 1995 LATIN
// =============================================================================

describe("2027 Latin → 1995 Latin", () => {
  it.each([
    ["Özbekiston", "O'zbekiston"],
    ["ğalaba", "g'alaba"],
    ["toğ", "tog'"],
    ["Toşkent şahri", "Toshkent shahri"],
    ["işçi", "ishchi"],
    ["ŞAHAR", "SHAHAR"],
    ["Şahar", "Shahar"],
    ["TOŞKENT", "TOSHKENT"],
    ["ÇOY", "CHOY"],
    ["Çoy", "Choy"],
    ["ma\u02BCno", "ma'no"],
    ["Is\u02BChoq", "Is'hoq"]
  ])("%s → %s", (input, expected) => {
    expect(toOld(input)).toBe(expected)
  })

  it("converts Cyrillic to the 1995 alphabet as well", () => {
    expect(toOld("Тошкент шаҳри")).toBe("Toshkent shahri")
  })

  // Found in review: Cyrillic → 1995 Latin went through the 2027 → 1995 step
  // too, so foreign names typed in Latin inside Cyrillic prose were
  // respelled — on the Latin-Cyrillic page's default flow, which never did.
  it.each([
    [
      "Туркия президенти Recep Tayyip Erdoğan Тошкентга келди",
      "Turkiya prezidenti Recep Tayyip Erdoğan Toshkentga keldi"
    ],
    [
      "Немис математиги Kurt Gödel ҳақида",
      "Nemis matematigi Kurt Gödel haqida"
    ],
    [
      "«Бешикташ» клуби ўйинчиси Mesut Özil Тошкентга келди",
      "«Beshiktash» klubi o'yinchisi Mesut Özil Toshkentga keldi"
    ]
  ])(
    "leaves Latin names in Cyrillic prose as written: %s",
    (input, expected) => {
      expect(toOld(input)).toBe(expected)
      expect(toOld(input)).toBe(toLatin(input))
    }
  )

  it("still respells new-alphabet text that is mostly Latin", () => {
    expect(toOld("Toşkent şahri, Тошкент")).toBe("Toshkent shahri, Toshkent")
  })
})

// =============================================================================
// 2027 LATIN → CYRILLIC
// =============================================================================

describe("2027 Latin → Cyrillic", () => {
  it.each([
    ["Özbekiston", "Ўзбекистон"],
    ["Toşkent şahri", "Тошкент шаҳри"],
    ["işçi", "ишчи"],
    ["ğalaba", "ғалаба"],
    ["ma\u02BCno", "маъно"],
    ["Is\u02BChoq", "Исҳоқ"],
    ["Maşhura", "Машҳура"],
    ["ÖZBEKISTON", "ЎЗБЕКИСТОН"],
    // Half-converted text — both alphabets in one sentence.
    ["Toşkent shahri", "Тошкент шаҳри"]
  ])("%s → %s", (input, expected) => {
    expect(toCyr(input)).toBe(expected)
  })

  it("does not freeze an acronym found inside a word", () => {
    // `\b` is ASCII-only, so "körsa" is the tokens k · ö · rsa — and `rsa` is
    // a protected cipher name. The same leak o'sha / ko'rsa had in 1995 Latin.
    expect(toCyr("körsa")).toBe("кўрса")
    expect(toCyr("öram")).toBe("ўрам")
    // …and the same with the letter as TYPED: masking runs before look-alikes
    // are corrected, so the edge has to recognise them too.
    expect(toCyr("ko\u0308rsa")).toBe("кўрса")
    expect(toCyr("\u014Fram")).toBe("ўрам")
  })

  it("is what toCyrillic does with the new letters too", () => {
    // The Latin-Cyrillic converter is the site's most-used page; after
    // 22.04.2027 the text pasted into it will be in this alphabet.
    expect(toCyrillic("Özbekiston, Toşkent şahri")).toBe(
      "Ўзбекистон, Тошкент шаҳри"
    )
  })
})

// =============================================================================
// FOUND IN REVIEW — each case below was a wrong output before its fix
// =============================================================================

describe("initials and a lone O'", () => {
  // An o' before a non-letter is a quoted "kino'" — unless the o STARTS the
  // word: then it is the letter on its own, as in an initial or a vocative.
  it.each([
    ["Ўткир Ҳошимов (Ў. Ҳошимов)", "Ötkir Hoşimov (Ö. Hoşimov)"],
    ["Ў, Ватан!", "Ö, Vatan!"],
    ["O' harfi", "Ö harfi"],
    ["'o' harfi", "'o' harfi"]
  ])("%s → %s", (input, expected) => {
    expect(toNew(input)).toBe(expected)
  })
})

describe("look-alikes are corrected in prose, never inside a protected span", () => {
  it.each(["latin-2027", "latin", "cyrillic"] as const)(
    "keeps a URL's own letters (%s)",
    (target) => {
      expect(
        toUzbekScript("https://ro.wikipedia.org/wiki/\u0218tefan", target)
      ).toBe("https://ro.wikipedia.org/wiki/\u0218tefan")
    }
  )

  it("keeps inline code as typed", () => {
    expect(toNew("`x\u014F` kodi")).toBe("`x\u014F` kodi")
  })

  it("does not count a look-alike inside a link as the new alphabet", () => {
    expect(
      detectUzbekScript("Batafsil: https://ro.wikipedia.org/wiki/\u0218tefan")
    ).toBe("latin")
  })
})

describe("a product name keeps its protection with a 2027 suffix", () => {
  // The suffix branches of the protection regex were ASCII-only, so they
  // stopped at ç, and the edge check then dropped the whole match.
  it.each([
    ["Telegram'gacha", "Telegram'gaça"],
    ["Telegram'gaça", "Telegram'gaça"],
    ["Google'dagi", "Google'dagi"]
  ])("2027: %s → %s", (input, expected) => {
    expect(toNew(input)).toBe(expected)
  })
})

describe("t + sh is two letters, not ц + ҳ", () => {
  it.each([
    ["adabiyotshunos", "adabiyot\u015Funos"],
    ["adabiyot\u015Funos", "adabiyot\u015Funos"]
  ])("2027: %s → %s", (input, expected) => {
    expect(toNew(input)).toBe(expected)
  })

  it("comes back as тш from either alphabet", () => {
    expect(toCyr("adabiyot\u015Funos")).toBe("адабиётшунос")
  })
})

// =============================================================================
// ROUND TRIPS
// =============================================================================

describe("round trips through the 2027 alphabet", () => {
  const sentences = [
    "Assalomu alaykum! O'zbekiston — go'zal mamlakat.",
    "Toshkent shahrida ishchilar yig'ilishdi.",
    "San'at va madaniyat haqida ma'lumot.",
    "O'sha kuni biz to'g'ri qaror qabul qildik.",
    "Mas'uliyat — har bir insonning burchi.",
    "Is'hoq bog'da choy ichdi."
  ]

  it.each(sentences)("1995 → 2027 → 1995: %s", (input) => {
    expect(toOld(toNew(input))).toBe(input)
  })

  it.each(sentences.map((sentence) => toCyrillic(sentence)))(
    "Cyrillic → 2027 → Cyrillic: %s",
    (input) => {
      expect(toCyr(toNew(input))).toBe(input)
    }
  )
})

// =============================================================================
// DETECTION — which alphabet the text is already in
// =============================================================================

describe("detectUzbekScript", () => {
  it.each([
    ["Toshkent shahri", "latin"],
    ["Toşkent şahri", "latin-2027"],
    // One new letter is enough: half-converted text is new-alphabet text.
    ["Toşkent shahri", "latin-2027"],
    ["Тошкент шаҳри", "cyrillic"],
    // A look-alike counts as the letter it stands for.
    ["To\u0219kent", "latin-2027"]
  ])("%s → %s", (input, expected) => {
    expect(detectUzbekScript(input)).toBe(expected)
  })

  it("does not count a new letter inside a protected span", () => {
    expect(detectUzbekScript("Batafsil: https://example.com/çay")).toBe("latin")
  })
})

// =============================================================================
// PROTECTION — the leak `\b` opens in the new alphabet
// =============================================================================

describe("protection does not reach inside a 2027 word", () => {
  it.each(["körsa", "öram", "körsatkiç"])("%s keeps nothing back", (word) => {
    expect(findPreservedTerms(word)).toEqual([])
  })

  it("still protects the same acronym standing on its own", () => {
    expect(findPreservedTerms("RSA kaliti")).toEqual(["RSA"])
  })
})
