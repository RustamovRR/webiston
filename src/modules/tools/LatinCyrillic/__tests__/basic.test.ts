/**
 * Basic transliteration tests
 * Core functionality for Latin ↔ Cyrillic conversion
 */

import { describe, expect, it } from "vitest"
import { toCyrillic, toLatin } from "../utils"

// =============================================================================
// LATIN TO CYRILLIC - Basic
// =============================================================================

describe("toCyrillic - basic", () => {
  it.each([
    ["salom", "салом"],
    ["dunyo", "дунё"],
    ["", ""],
    ["2024 yil", "2024 йил"],
    ["Salom!", "Салом!"],
    ["Qanday?", "Қандай?"]
  ])("%s → %s", (input, expected) => {
    expect(toCyrillic(input)).toBe(expected)
  })
})

describe("toCyrillic - Uzbek special characters", () => {
  it.each([
    ["o'zbek", "ўзбек"],
    ["O'zbekiston", "Ўзбекистон"],
    ["g'alaba", "ғалаба"],
    ["tog'", "тоғ"],
    ["shirin", "ширин"],
    ["Toshkent", "Тошкент"],
    ["choy", "чой"],
    ["uchun", "учун"],
    ["rang", "ранг"],
    ["tong", "тонг"],
    ["tong'i", "тонғи"],
    ["qalam", "қалам"],
    ["havo", "ҳаво"]
  ])("%s → %s", (input, expected) => {
    expect(toCyrillic(input)).toBe(expected)
  })
})

describe("toCyrillic - compound vowels", () => {
  it.each([
    ["yomon", "ёмон"],
    ["yaxshi", "яхши"],
    ["yulduz", "юлдуз"],
    ["yo'l", "йўл"]
  ])("%s → %s", (input, expected) => {
    expect(toCyrillic(input)).toBe(expected)
  })
})

describe("toCyrillic - word boundary rules", () => {
  it.each([
    ["ertaga", "эртага"],
    ["Eshik", "Эшик"],
    ["yetti", "етти"],
    ["keldi", "келди"]
  ])("%s → %s", (input, expected) => {
    expect(toCyrillic(input)).toBe(expected)
  })
})

describe("toCyrillic - case preservation", () => {
  it.each([
    ["SALOM", "САЛОМ"],
    ["Salom", "Салом"],
    ["Shirin", "Ширин"]
  ])("%s → %s", (input, expected) => {
    expect(toCyrillic(input)).toBe(expected)
  })
})

// =============================================================================
// CYRILLIC TO LATIN - Basic
// =============================================================================

describe("toLatin - basic", () => {
  it.each([
    ["салом", "salom"],
    ["дунё", "dunyo"],
    ["", ""],
    ["2024 йил", "2024 yil"]
  ])("%s → %s", (input, expected) => {
    expect(toLatin(input)).toBe(expected)
  })
})

describe("toLatin - Uzbek special characters", () => {
  it.each([
    ["ўзбек", "o'zbek"],
    ["ғалаба", "g'alaba"],
    ["ширин", "shirin"],
    ["чой", "choy"],
    ["ранг", "rang"],
    ["қалам", "qalam"],
    ["ҳаво", "havo"]
  ])("%s → %s", (input, expected) => {
    expect(toLatin(input)).toBe(expected)
  })
})

describe("toLatin - compound vowels", () => {
  it.each([
    ["ёмон", "yomon"],
    ["яхши", "yaxshi"],
    ["юлдуз", "yulduz"]
  ])("%s → %s", (input, expected) => {
    expect(toLatin(input)).toBe(expected)
  })
})

describe("toLatin - case preservation", () => {
  it.each([
    ["САЛОМ", "SALOM"],
    ["Салом", "Salom"]
  ])("%s → %s", (input, expected) => {
    expect(toLatin(input)).toBe(expected)
  })
})

// =============================================================================
// ROUND-TRIP CONVERSION
// =============================================================================

describe("round-trip conversion", () => {
  it.each([
    ["Salom dunyo"],
    ["O'zbekiston Respublikasi"],
    ["Toshkent shahri"],
    ["Qanday yaxshi"]
  ])("Latin → Cyrillic → Latin: %s", (original) => {
    const cyrillic = toCyrillic(original)
    const backToLatin = toLatin(cyrillic)
    expect(backToLatin.toLowerCase()).toBe(original.toLowerCase())
  })
})
