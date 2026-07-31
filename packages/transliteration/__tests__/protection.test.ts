/**
 * Protection system tests
 * URLs, emails, code blocks, and technical terms
 */

import { describe, expect, it } from "vitest"
import { findPreservedTerms, toCyrillic } from "../src"

// =============================================================================
// IMM - Protected content (immunity)
// =============================================================================

describe("Protected URLs and emails", () => {
  it.each([
    ["https://webiston.uz", "https://webiston.uz"],
    ["Sayt: https://example.com", "Сайт: https://example.com"],
    ["test@gmail.com", "test@gmail.com"],
    ["Pochta: test@example.com", "Почта: test@example.com"]
  ])("%s → %s", (input, expected) => {
    expect(toCyrillic(input)).toBe(expected)
  })
})

describe("Protected code blocks", () => {
  it.each([
    ["Kod: `const x = 1`", "Код: `const x = 1`"],
    ["Men React o'rganyapman", "Мен React ўрганяпман"],
    ["JavaScript dasturlash", "JavaScript дастурлаш"],
    ["React.js loyiha", "React.js лойиҳа"]
  ])("%s → %s", (input, expected) => {
    expect(toCyrillic(input)).toBe(expected)
  })
})

describe("Protected technical terms", () => {
  it.each([
    ["COVID-19", "COVID-19"],
    ["Wi-Fi", "Wi-Fi"],
    ["4G", "4G"],
    ["5G", "5G"],
    ["3G tarmoq", "3G тармоқ"],
    ["Men 5G tarmoqdan foydalanaman", "Мен 5G тармоқдан фойдаланаман"],
    ["USA", "USA"],
    ["NATO", "NATO"]
  ])("%s → %s", (input, expected) => {
    expect(toCyrillic(input)).toBe(expected)
  })
})

describe("Non-protected content", () => {
  it.each([
    ["(2+2=4)", "(2+2=4)"],
    ["100%", "100%"],
    ["$500", "$500"]
  ])("%s → %s", (input, expected) => {
    expect(toCyrillic(input)).toBe(expected)
  })
})

describe("findPreservedTerms reports what the engine leaves alone", () => {
  it("names the terms that survive a conversion", () => {
    // Arrange
    const input = "React va GitHub haqida webiston.uz saytida o'qing"

    // Act
    const terms = findPreservedTerms(input)

    // Assert
    expect(terms).toEqual(["React", "GitHub", "webiston.uz"])
    expect(toCyrillic(input)).toContain("React")
  })

  it("de-duplicates case-insensitively, keeping first-seen order", () => {
    // Arrange
    const input = "GitHub, github va yana GITHUB"

    // Act
    const terms = findPreservedTerms(input)

    // Assert
    expect(terms).toEqual(["GitHub"])
  })

  it("is empty for ordinary Uzbek prose", () => {
    // Arrange
    const input = "Bugun havo juda issiq va quyoshli"

    // Act & Assert
    expect(findPreservedTerms(input)).toEqual([])
  })

  it("returns nothing for empty input rather than scanning it", () => {
    // Arrange & Act & Assert
    expect(findPreservedTerms("")).toEqual([])
  })
})
