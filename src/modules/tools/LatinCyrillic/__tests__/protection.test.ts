/**
 * Protection system tests
 * URLs, emails, code blocks, and technical terms
 */

import { describe, expect, it } from "vitest"
import { toCyrillic } from "../utils"

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
