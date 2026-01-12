import { describe, expect, it } from "vitest"
import {
  isCyrillicVowel,
  isLatinVowel,
  isLowerCase,
  isUpperCase,
  isWordBoundary,
  normalizeApostrophes,
  preserveCase
} from "../src/helpers"

describe("normalizeApostrophes", () => {
  it("normalizes grave accent", () => {
    expect(normalizeApostrophes("o`zbek")).toBe("o'zbek")
  })

  it("normalizes acute accent", () => {
    expect(normalizeApostrophes("o´zbek")).toBe("o'zbek")
  })

  it("normalizes curly quotes", () => {
    expect(normalizeApostrophes("o'zbek")).toBe("o'zbek")
    expect(normalizeApostrophes("o'zbek")).toBe("o'zbek")
  })

  it("normalizes modifier letters", () => {
    expect(normalizeApostrophes("oʻzbek")).toBe("o'zbek")
    expect(normalizeApostrophes("oʼzbek")).toBe("o'zbek")
  })

  it("handles multiple apostrophes", () => {
    expect(normalizeApostrophes("o`zbek g`alaba")).toBe("o'zbek g'alaba")
  })

  it("preserves standard apostrophe", () => {
    expect(normalizeApostrophes("o'zbek")).toBe("o'zbek")
  })
})

describe("isUpperCase", () => {
  it("returns true for uppercase letters", () => {
    expect(isUpperCase("A")).toBe(true)
    expect(isUpperCase("Z")).toBe(true)
    expect(isUpperCase("Ў")).toBe(true)
  })

  it("returns false for lowercase letters", () => {
    expect(isUpperCase("a")).toBe(false)
    expect(isUpperCase("z")).toBe(false)
    expect(isUpperCase("ў")).toBe(false)
  })

  it("returns false for numbers", () => {
    expect(isUpperCase("1")).toBe(false)
    expect(isUpperCase("9")).toBe(false)
  })

  it("returns false for symbols", () => {
    expect(isUpperCase("!")).toBe(false)
    expect(isUpperCase("'")).toBe(false)
  })
})

describe("isLowerCase", () => {
  it("returns true for lowercase letters", () => {
    expect(isLowerCase("a")).toBe(true)
    expect(isLowerCase("z")).toBe(true)
  })

  it("returns false for uppercase letters", () => {
    expect(isLowerCase("A")).toBe(false)
    expect(isLowerCase("Z")).toBe(false)
  })
})

describe("preserveCase", () => {
  it("preserves uppercase for single char", () => {
    expect(preserveCase("A", "б")).toBe("Б")
  })

  it("preserves lowercase for single char", () => {
    expect(preserveCase("a", "Б")).toBe("б")
  })

  it("handles multi-char target with uppercase source", () => {
    expect(preserveCase("S", "sh")).toBe("Sh")
  })

  it("handles all uppercase source", () => {
    expect(preserveCase("SH", "ш")).toBe("Ш")
  })

  it("handles empty strings", () => {
    expect(preserveCase("", "test")).toBe("test")
    expect(preserveCase("A", "")).toBe("")
  })
})

describe("isLatinVowel", () => {
  it("returns true for Latin vowels", () => {
    expect(isLatinVowel("a")).toBe(true)
    expect(isLatinVowel("e")).toBe(true)
    expect(isLatinVowel("i")).toBe(true)
    expect(isLatinVowel("o")).toBe(true)
    expect(isLatinVowel("u")).toBe(true)
  })

  it("returns true for uppercase vowels", () => {
    expect(isLatinVowel("A")).toBe(true)
    expect(isLatinVowel("E")).toBe(true)
  })

  it("returns false for consonants", () => {
    expect(isLatinVowel("b")).toBe(false)
    expect(isLatinVowel("k")).toBe(false)
  })
})

describe("isCyrillicVowel", () => {
  it("returns true for Cyrillic vowels", () => {
    expect(isCyrillicVowel("а")).toBe(true)
    expect(isCyrillicVowel("е")).toBe(true)
    expect(isCyrillicVowel("ў")).toBe(true)
  })

  it("returns false for consonants", () => {
    expect(isCyrillicVowel("б")).toBe(false)
    expect(isCyrillicVowel("к")).toBe(false)
  })
})

describe("isWordBoundary", () => {
  it("returns true at start of string", () => {
    expect(isWordBoundary("hello", 0)).toBe(true)
  })

  it("returns true after space", () => {
    expect(isWordBoundary("hello world", 6)).toBe(true)
  })

  it("returns true after punctuation", () => {
    expect(isWordBoundary("hello.world", 6)).toBe(true)
    expect(isWordBoundary("hello,world", 6)).toBe(true)
  })

  it("returns false in middle of word", () => {
    expect(isWordBoundary("hello", 2)).toBe(false)
  })
})
