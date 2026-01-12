import { describe, expect, it } from "vitest"
import {
  detectScript,
  isCyrillicText,
  isLatinText
} from "../src/detect-script"

describe("detectScript", () => {
  it("detects Latin text", () => {
    expect(detectScript("Hello world")).toBe("latin")
    expect(detectScript("O'zbekiston")).toBe("latin")
  })

  it("detects Cyrillic text", () => {
    expect(detectScript("Салом дунё")).toBe("cyrillic")
    expect(detectScript("Ўзбекистон")).toBe("cyrillic")
  })

  it("detects mixed text", () => {
    expect(detectScript("Hello Салом")).toBe("mixed")
  })

  it("returns unknown for empty string", () => {
    expect(detectScript("")).toBe("unknown")
    expect(detectScript("   ")).toBe("unknown")
  })

  it("returns unknown for numbers only", () => {
    expect(detectScript("12345")).toBe("unknown")
  })

  it("handles text with numbers", () => {
    expect(detectScript("Hello 123")).toBe("latin")
    expect(detectScript("Салом 123")).toBe("cyrillic")
  })
})

describe("isLatinText", () => {
  it("returns true for Latin text", () => {
    expect(isLatinText("Hello")).toBe(true)
  })

  it("returns false for Cyrillic text", () => {
    expect(isLatinText("Салом")).toBe(false)
  })
})

describe("isCyrillicText", () => {
  it("returns true for Cyrillic text", () => {
    expect(isCyrillicText("Салом")).toBe(true)
  })

  it("returns false for Latin text", () => {
    expect(isCyrillicText("Hello")).toBe(false)
  })
})
