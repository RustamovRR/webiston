/**
 * Protection system tests
 * URLs, emails, code blocks, and technical terms
 */

import { describe, expect, it } from "vitest"
import { findPreservedTerms, normaliseUserTerms, toCyrillic } from "../src"

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

describe("user exception list", () => {
  it("leaves a word the user added alone", () => {
    // Arrange
    const input = "Ziyo kompaniyasi yangi loyiha boshladi"

    // Act
    const without = toCyrillic(input)
    const with_ = toCyrillic(input, { preserve: ["Ziyo"] })

    // Assert
    expect(without).toContain("Зиё")
    expect(with_).toContain("Ziyo")
    expect(with_).toContain("компанияси")
  })

  it("carries Uzbek suffixes on a user term, plain and apostrophed", () => {
    // Arrange
    const options = { preserve: ["Ziyo"] }

    // Act & Assert
    expect(toCyrillic("Ziyoda ishlayman", options)).toContain("Ziyoda")
    expect(toCyrillic("Ziyo'ning loyihasi", options)).toContain("Ziyo'ning")
  })

  it("treats regex metacharacters as literal text", () => {
    // Arrange — a user typing this must not protect the whole document
    const input = "Salom dunyo"

    // Act
    const result = toCyrillic(input, { preserve: [".*"] })

    // Assert
    expect(result).toBe("Салом дунё")
  })

  it("prefers a longer user term over a shorter one", () => {
    // Arrange
    const options = { preserve: ["Yandex", "Yandex Maps"] }

    // Act
    const result = toCyrillic("Yandex Maps ochildi", options)

    // Assert
    expect(result).toContain("Yandex Maps")
  })

  it("reports user terms through findPreservedTerms", () => {
    // Arrange & Act
    const terms = findPreservedTerms("Ziyo va React", { preserve: ["Ziyo"] })

    // Assert
    expect(terms).toEqual(["Ziyo", "React"])
  })

  it("drops blanks and duplicates, and caps the list", () => {
    // Arrange & Act
    const cleaned = normaliseUserTerms(["  Ziyo  ", "", "ziyo", "Bek"])

    // Assert
    expect(cleaned).toEqual(["Ziyo", "Bek"])
    expect(
      normaliseUserTerms(
        Array(500)
          .fill(0)
          .map((_, i) => `w${i}`)
      )
    ).toHaveLength(200)
  })

  it("stays linear with a full user list", () => {
    // Arrange
    const preserve = Array.from({ length: 200 }, (_, i) => `Term${i}`)
    const unit = "Bugun havo issiq va Term7 bilan Term180 keldi. "

    // Act
    const timeOf = (repeat: number) => {
      const text = unit.repeat(repeat)
      const started = performance.now()
      toCyrillic(text, { preserve })
      return performance.now() - started
    }
    timeOf(200) // warm the compiled regex
    const small = timeOf(500)
    const large = timeOf(4000)

    // Assert — 8x the input must not cost anywhere near 8^2 the time
    expect(large).toBeLessThan(Math.max(small * 24, 400))
  })
})
