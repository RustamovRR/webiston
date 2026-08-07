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
    // ц is positional, and after a word boundary Uzbek writes "s": these are
    // the spellings an Uzbek reader expects (sirk, sex, sement).
    ["Цех", "Sex"],
    ["Цирк", "Sirk"],
    ["Отец", "Otets"],
    ["Функция", "Funksiya"],
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
  /**
   * The soft sign is the one place where Uzbek and Russian want opposite
   * output from identical input, so the engine decides per TEXT, not per word:
   * ы or щ anywhere in the input means Russian, everything else is treated as
   * Uzbek. See `isRussianText` in cyrillic-to-latin.ts.
   *
   * These fixtures therefore give the words a Russian sentence to sit in —
   * which is also how a real user supplies them.
   */
  it.each([
    ["У неё была большая семья", "U neyo byla bol'shaya sem'ya"],
    ["Его мать была дома", "Yego mat' byla doma"],
    ["Мой компьютер новый", "Moy komp'yuter novyy"],
    ["Вьюга была сильный", "V'yuga byla sil'nyy"]
  ])("%s → %s", (input, expected) => {
    expect(toLatin(input)).toBe(expected)
  })

  it.each([
    // The hard sign is unambiguous — both languages romanise it the same way,
    // so it needs no language detection.
    ["Объявление", "Ob'yavleniye"],
    ["Съёмка", "S'yomka"]
  ])("%s → %s", (input, expected) => {
    expect(toLatin(input)).toBe(expected)
  })

  it.each([
    // Isolated, with no Russian-only letter to go on, the engine assumes
    // Uzbek — which is the right bias for an Uzbek converter, and the whole
    // reason "фильм" now yields "film" rather than "fil'm".
    ["семья", "semya"],
    ["мать", "mat"],
    ["Компьютер", "Kompyuter"],
    ["фильм", "film"],
    ["автомобиль", "avtomobil"]
  ])("%s → %s (assumed Uzbek)", (input, expected) => {
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
