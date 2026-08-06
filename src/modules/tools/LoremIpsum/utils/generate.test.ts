import { describe, expect, it } from "vitest"

import type { LoremOptions } from "../types"
import {
  applyFormat,
  generateLorem,
  makeSentence,
  measure,
  wordsOf
} from "./generate"

const base: LoremOptions = {
  unit: "paragraphs",
  amount: 3,
  bank: "cicero",
  format: "plain",
  startWithLorem: true
}

const encoder = new TextEncoder()

describe("the word lists", () => {
  it("never puts an option's own label into its output", () => {
    // Arrange & Act — the Uzbek list opened with `"O'zbek Lorem"`, so every
    // Uzbek text began with the name of the control that produced it.
    const uzbek = wordsOf("uzbek")

    // Assert
    expect(uzbek).not.toContain("O'zbek Lorem")
    expect(uzbek.every((word) => !word.includes(" "))).toBe(true)
  })

  it("carries the marks Uzbek layout has to survive", () => {
    // Arrange & Act — the point of the bank: `o'` and `g'` are letters, so a
    // column sized against Latin filler overflows on the real copy.
    const uzbek = wordsOf("uzbek")

    // Assert
    expect(uzbek.filter((word) => word.includes("'")).length).toBeGreaterThan(5)
    expect(uzbek).toContain("ma'lumot")
    expect(new Set(uzbek).size).toBeGreaterThan(100)
  })
})

describe("the Cyrillic list", () => {
  it("is derived from the Latin one, not a second list to maintain", () => {
    // Arrange & Act
    const latin = wordsOf("uzbek")
    const cyrillic = wordsOf("uzbekCyrillic")

    // Assert — same length, and the transliteration the site's own package
    // performs: sh/ch collapse to one letter, the tutuq belgisi becomes ъ.
    expect(cyrillic).toHaveLength(latin.length)
    expect(cyrillic).toContain("маълумот")
    expect(cyrillic).toContain("саҳифа")
    expect(cyrillic.every((word) => !/[a-z]/i.test(word))).toBe(true)
  })

  it("caches the conversion instead of re-running it per call", () => {
    // Arrange & Act
    const first = wordsOf("uzbekCyrillic")

    // Assert — identity, not equality: 113 words through the engine on every
    // keystroke would be work for an answer that cannot change.
    expect(wordsOf("uzbekCyrillic")).toBe(first)
  })
})

describe("generateLorem", () => {
  it("returns the number of paragraphs asked for", () => {
    // Arrange & Act
    const text = generateLorem({ ...base, amount: 4 })

    // Assert
    expect(text.split("\n\n")).toHaveLength(4)
  })

  it("opens with the classic line only for the classic bank", () => {
    // Arrange & Act — the old tool offered the toggle everywhere and ignored
    // it on four lists out of five.
    const latin = generateLorem(base)
    const uzbek = generateLorem({ ...base, bank: "uzbek" })

    // Assert
    // The canonical line, comma included — not eight words in a random order.
    expect(
      latin.startsWith(
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit"
      )
    ).toBe(true)
    expect(uzbek.toLowerCase()).not.toContain("lorem ipsum")
  })

  it("counts words exactly, opening included", () => {
    // Arrange & Act
    const text = generateLorem({ ...base, unit: "words", amount: 12 })

    // Assert
    expect(text.split(" ")).toHaveLength(12)
    expect(text.startsWith("Lorem ipsum")).toBe(true)
  })

  it("returns exactly the requested number of BYTES", () => {
    // Arrange & Act — the old mode sliced `String.length`, which counts UTF-16
    // code units; a byte limit that is not measured in bytes is not a limit.
    for (const amount of [16, 120, 512]) {
      const text = generateLorem({ ...base, unit: "bytes", amount })

      // Assert
      expect(encoder.encode(text).length).toBe(amount)
    }
  })

  it("wraps paragraphs as HTML, and prose as one paragraph", () => {
    // Arrange
    const html = { ...base, format: "html" } as const

    // Act
    const paragraphs = applyFormat(generateLorem({ ...html, amount: 2 }), {
      ...html,
      amount: 2
    })
    const words = applyFormat(
      generateLorem({ ...html, unit: "words", amount: 10 }),
      { ...html, unit: "words", amount: 10 }
    )

    // Assert
    expect(paragraphs.match(/<p>/g)).toHaveLength(2)
    expect(words.match(/<p>/g)).toHaveLength(1)
  })

  it("keeps the same words when only the format changes", () => {
    // Arrange — switching how text is DISPLAYED must not re-roll it.
    const text = generateLorem({ ...base, amount: 2 })

    // Act
    const asHtml = applyFormat(text, { ...base, format: "html", amount: 2 })

    // Assert
    expect(asHtml.replace(/<\/?p>/g, "").replace(/\n/g, "\n\n")).toBe(text)
  })
})

describe("makeSentence", () => {
  it("capitalises, punctuates, and puts a comma inside long sentences", () => {
    // Arrange
    const words = wordsOf("cicero")

    // Act — 200 draws, because sentence length is random by design.
    const sentences = Array.from({ length: 200 }, () => makeSentence(words))

    // Assert
    for (const sentence of sentences) {
      expect(sentence).toMatch(/^[A-Z]/)
      expect(sentence.endsWith(".")).toBe(true)
      // A comma may never be the last thing before the stop, nor follow the
      // first word — that is not where a clause breaks.
      expect(sentence).not.toMatch(/,\s*\.$/)
      expect(sentence).not.toMatch(/^\S+,/)
    }
    expect(sentences.some((sentence) => sentence.includes(","))).toBe(true)
  })
})

describe("measure", () => {
  it("reports characters, words and real bytes", () => {
    // Arrange & Act — `O'zbekiston` is 11 characters and 11 bytes; the em dash
    // is where the two part company.
    const stats = measure("Salom — dunyo")

    // Assert
    expect(stats.words).toBe(3)
    expect(stats.characters).toBe(13)
    expect(stats.bytes).toBe(15)
  })

  it("reports nothing for an empty string", () => {
    // Arrange & Act & Assert
    expect(measure("")).toEqual({ characters: 0, words: 0, bytes: 0 })
  })
})
