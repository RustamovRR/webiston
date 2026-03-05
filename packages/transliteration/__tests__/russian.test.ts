/**
 * Russian language specific tests
 * Cyrillic to Latin conversion for Russian text
 */

import { describe, expect, it } from "vitest"
import { toCyrillic, toLatin } from "../src"

// =============================================================================
// RUS - Russian specific characters
// =============================================================================

describe("Russian specific characters", () => {
  it.each([
    ["Щетка", "Shchetka"],
    ["Борщ", "Borshch"],
    ["Цех", "Tsex"],
    ["Цирк", "Tsirk"],
    ["Ёлка", "Yolka"],
    ["Ёш", "Yosh"],
    ["Юлдуз", "Yulduz"],
    ["Юбка", "Yubka"],
    ["Янги", "Yangi"],
    ["Яблоко", "Yabloko"],
    ["Ырыс", "Yrys"],
    ["Крыша", "Krysha"]
  ])("%s → %s", (input, expected) => {
    expect(toLatin(input)).toBe(expected)
  })
})

// =============================================================================
// Russian soft sign (ь) handling
// =============================================================================

describe("Russian soft sign handling", () => {
  it.each([
    ["семья", "sem'ya"],
    ["мать", "mat'"],
    ["Компьютер", "Komp'yuter"],
    ["Вьюга", "V'yuga"],
    ["Объявление", "Ob'yavleniye"],
    ["Съёмка", "S'yomka"]
  ])("%s → %s", (input, expected) => {
    expect(toLatin(input)).toBe(expected)
  })
})

// =============================================================================
// MONTH NAMES - Russian months to Uzbek
// =============================================================================

describe("Month names - Russian to Uzbek", () => {
  it.each([
    ["Январь", "Yanvar"],
    ["Февраль", "Fevral"],
    ["Июнь", "Iyun"],
    ["Июль", "Iyul"],
    ["Сентябрь", "Sentabr"],
    ["Октябрь", "Oktabr"],
    ["Декабрь", "Dekabr"],
    ["ДЕКАБРЬ", "DEKABR"],
    ["декабрь", "dekabr"]
  ])("%s → %s", (input, expected) => {
    expect(toLatin(input)).toBe(expected)
  })
})

// =============================================================================
// Russian to Latin round-trip (apostrophe → soft sign)
// =============================================================================

describe("Russian round-trip with soft sign", () => {
  it.each([
    // Apostrophe at end of word → soft sign (ь)
    ["Ochen'", "Очень"],
    ["mat'", "мать"],
    // Apostrophe before y+vowel after consonant → soft sign (ь)
    ["sem'ya", "семья"],
    ["v'yuga", "вьюга"],
    // Regular words without apostrophe
    ["perevodchik", "переводчик"]
  ])("%s → %s", (input, expected) => {
    expect(toCyrillic(input)).toBe(expected)
  })
})
