/**
 * Edge case tests for transliteration
 * Special characters, context rules, and complex scenarios
 */

import { describe, expect, it } from "vitest"
import { toCyrillic, toLatin } from "../utils"

// =============================================================================
// CTX - Contextual logic for Е / Э
// =============================================================================

describe("CTX - Contextual logic for Е / Э", () => {
  it.each([
    ["Ер", "Yer"],
    ["Елим", "Yelim"],
    ["Етук", "Yetuk"],
    ["Мева", "Meva"],
    ["Келажак", "Kelajak"],
    ["Поезд", "Poyezd"],
    ["Океан", "Okean"],
    ["Подъезд", "Pod'yezd"],
    ["Съезд", "S'yezd"],
    ["Уев", "Uyev"],
    ["Бие", "Biye"],
    ["Элемент", "Element"],
    ["Энергия", "Energiya"],
    ["Эътибор", "E'tibor"],
    ["Эълон", "E'lon"]
  ])("%s → %s", (input, expected) => {
    expect(toLatin(input)).toBe(expected)
  })
})

// =============================================================================
// GRD - Greedy matching (Latin → Cyrillic)
// =============================================================================

describe("GRD - Greedy matching", () => {
  it.each([
    ["SHoir", "Шоир"],
    ["SHamol", "Шамол"],
    ["CHoy", "Чой"],
    ["CHaman", "Чаман"],
    ["YOz", "Ёз"],
    ["YOmg'ir", "Ёмғир"],
    ["YUlduz", "Юлдуз"],
    ["YUrak", "Юрак"],
    ["YAna", "Яна"],
    ["YAxshi", "Яхши"],
    ["Ashxobod", "Ашхобод"],
    ["Is'hoq", "Исҳоқ"],
    ["Shchuka", "Щука"],
    ["SHCH", "Щ"],
    ["shch", "щ"]
  ])("%s → %s", (input, expected) => {
    expect(toCyrillic(input)).toBe(expected)
  })
})

// =============================================================================
// CAS - Case sensitivity
// =============================================================================

describe("CAS - Case sensitivity", () => {
  it.each([
    ["O'zbekiston", "Ўзбекистон"],
    ["O'ZBEKISTON", "ЎЗБЕКИСТОН"],
    ["ShH", "ШҲ"],
    ["YaNGi", "ЯНГи"],
    ["Shch", "Щ"],
    ["SHCH", "Щ"],
    ["sHoir", "шоир"],
    ["SHe'r", "Шеър"]
  ])("%s → %s", (input, expected) => {
    expect(toCyrillic(input)).toBe(expected)
  })
})

// =============================================================================
// NRM - Apostrophe normalization
// =============================================================================

describe("NRM - Apostrophe normalization", () => {
  it.each([
    ["o`zbek", "ўзбек"],
    ["o'zbek", "ўзбек"],
    ["o'zbek", "ўзбек"],
    ["oʻzbek", "ўзбек"],
    ["O'zbek", "Ўзбек"],
    ["G'az", "Ғаз"],
    ["G`az", "Ғаз"],
    ["A'lo", "Аъло"],
    ["A`lo", "Аъло"],
    ["Ma'no", "Маъно"],
    ["O'zbek,O'zbek", "Ўзбек,Ўзбек"],
    ["G'az,G'az", "Ғаз,Ғаз"],
    ["A'lo, A'lo", "Аъло, Аъло"],
    // Curly quotes
    ["o'tirib", "ўтириб"],
    ["qo'shimcha", "қўшимча"],
    ["ma'lumot", "маълумот"]
  ])("%s → %s", (input, expected) => {
    expect(toCyrillic(input)).toBe(expected)
  })
})

// =============================================================================
// UPPERCASE - All caps handling
// =============================================================================

describe("UPPERCASE - All caps handling", () => {
  it.each([
    ["ЮСУФОВИЧ", "YUSUFOVICH"],
    ["МАМАШАЕВА", "MAMASHAYEVA"],
    ["ЧОРИ", "CHORI"],
    ["ЖУМАЕВА", "JUMAYEVA"],
    ["ШЕРЗОД", "SHERZOD"],
    ["ЎЗБЕКИСТОН", "O'ZBEKISTON"],
    ["ТОШКЕНТ", "TOSHKENT"]
  ])("%s → %s", (input, expected) => {
    expect(toLatin(input)).toBe(expected)
  })
})

// =============================================================================
// HYPHENATED - Uzbek hyphenated words
// =============================================================================

describe("HYPHENATED - Uzbek words with hyphen", () => {
  it.each([
    ["Tez-tibbiy", "Тез-тиббий"],
    ["kuch-kudrati", "куч-кудрати"],
    ["Respublikasi Tez-tibbiy yordam", "Республикаси Тез-тиббий ёрдам"],
    ["armiyamiz kuch-kudrati", "армиямиз куч-кудрати"]
  ])("%s → %s", (input, expected) => {
    expect(toCyrillic(input)).toBe(expected)
  })
})

// =============================================================================
// NUMBER+WORD - Numbers attached to words
// =============================================================================

describe("NUMBER+WORD - Numbers with attached words", () => {
  it.each([
    ["10mln", "10млн"],
    ["57ming", "57минг"],
    ["27ta", "27та"],
    ["100%", "100%"],
    ["$500", "$500"]
  ])("%s → %s", (input, expected) => {
    expect(toCyrillic(input)).toBe(expected)
  })
})
