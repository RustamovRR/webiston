import { describe, expect, it } from "vitest"
import {
  cleanText,
  countLines,
  countWords,
  getTextStats,
  isValidJson,
  truncateText
} from "./text"

describe("countWords", () => {
  it("collapses runs of whitespace instead of counting empties", () => {
    expect(countWords("a   b")).toBe(2)
    expect(countWords("a\tb\nc")).toBe(3)
  })

  it("treats blank input as zero words, not one", () => {
    expect(countWords("")).toBe(0)
    expect(countWords("   ")).toBe(0)
    expect(countWords("\n\t")).toBe(0)
  })

  it("ignores leading and trailing whitespace", () => {
    expect(countWords("  hello world  ")).toBe(2)
  })
})

describe("countLines", () => {
  it("counts an empty string as zero lines, and any content as at least one", () => {
    expect(countLines("")).toBe(0)
    expect(countLines("a")).toBe(1)
  })

  it("counts the line after a trailing newline", () => {
    // "a\n" is two lines in the split sense — pinned so a future change to use
    // a different convention is a deliberate decision, not a silent one.
    expect(countLines("a\n")).toBe(2)
    expect(countLines("a\nb")).toBe(2)
  })
})

describe("getTextStats", () => {
  it("reports characters, words and lines together", () => {
    expect(getTextStats("ab cd\nef")).toEqual({
      characters: 8,
      words: 3,
      lines: 2
    })
  })
})

describe("cleanText", () => {
  it("normalises CRLF and lone CR to LF", () => {
    expect(cleanText("a\r\nb")).toBe("a\nb")
    expect(cleanText("a\rb")).toBe("a\nb")
  })

  it("trims the ends but not the interior", () => {
    expect(cleanText("  a  b  ")).toBe("a  b")
  })
})

describe("truncateText", () => {
  it("returns the text untouched when it already fits", () => {
    expect(truncateText("abc", 3)).toBe("abc")
    expect(truncateText("abc", 10)).toBe("abc")
  })

  it("appends the suffix within the limit", () => {
    expect(truncateText("abcdefghij", 6)).toBe("abc...")
    expect(truncateText("abcdefghij", 6)).toHaveLength(6)
  })

  it("honours a custom suffix", () => {
    expect(truncateText("abcdefghij", 5, "…")).toBe("abcd…")
  })

  // REGRESSION — `maxLength - suffix.length` went negative, and a negative end
  // index in String.slice counts from the END of the string. So the function
  // returned MORE than its own limit:
  //   truncateText("abcdef", 2) -> "abcde..."  (8 chars, limit 2)
  //   truncateText("abcdef", 0) -> "abc..."    (6 chars, limit 0)
  it("never returns more characters than maxLength", () => {
    for (const max of [0, 1, 2, 3, 4, 5]) {
      const out = truncateText("abcdefghij", max)
      expect(out.length, `maxLength ${max} -> "${out}"`).toBeLessThanOrEqual(
        max
      )
    }
  })

  it("returns an empty string for a non-positive limit", () => {
    expect(truncateText("abcdef", 0)).toBe("")
    expect(truncateText("abcdef", -5)).toBe("")
  })
})

describe("isValidJson", () => {
  it("accepts objects, arrays and bare literals", () => {
    expect(isValidJson('{"a":1}')).toBe(true)
    expect(isValidJson("[1,2]")).toBe(true)
    expect(isValidJson("null")).toBe(true)
    expect(isValidJson("42")).toBe(true)
  })

  it("rejects malformed JSON and empty input", () => {
    expect(isValidJson("{a:1}")).toBe(false)
    expect(isValidJson("{")).toBe(false)
    expect(isValidJson("")).toBe(false)
  })
})
