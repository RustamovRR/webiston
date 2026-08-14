import { describe, expect, it } from "vitest"

import {
  buildTushuntirish,
  composeTushuntirish,
  validateTushuntirish
} from "./compose"
import {
  buildSampleTushuntirish,
  EMPTY_TUSHUNTIRISH,
  STANCES,
  type TushuntirishData
} from "./constants"

/**
 * The closing position is the product. Everything else on this page exists on
 * a hundred portal sites as a .doc — and every one of those ends with the same
 * sentence admitting the act, because that is the easiest template to write.
 * Which of the three endings reaches the paper is what these tests guard.
 */

const FULL: TushuntirishData = {
  organisation: "«Webiston» MChJ",
  managerRole: "direktori",
  managerName: "Aliyev Anvar Alisherovich",
  employeeName: "Karimov Salim Anvarovich",
  position: "dasturchi",
  incidentDate: "2026-08-12",
  subject: "ish kunining boshlanishiga 40 daqiqa kechikib kelganim",
  explanation: "Yo'lda tirbandlik yuzaga keldi.",
  stance: "qisman",
  documentDate: "2026-08-13"
}

describe("composeTushuntirish", () => {
  it("writes the header, the title and the opening sentence in order", () => {
    // Arrange / Act
    const { lotin } = buildTushuntirish(FULL)

    // Assert — the addressee column comes BEFORE the title on an ariza-shaped
    // document; getting that round the other way is the first thing an office
    // notices.
    expect(lotin.indexOf("«Webiston» MChJ")).toBeLessThan(
      lotin.indexOf("TUSHUNTIRISH XATI")
    )
    expect(lotin).toContain("Aliyev Anvar Alisherovichga")
    expect(lotin).toContain("dasturchi Karimov Salim Anvarovichdan")
    expect(lotin).toContain(
      "Men, Karimov Salim Anvarovich, 2026-yil 12-avgust kuni " +
        "ish kunining boshlanishiga 40 daqiqa kechikib kelganim " +
        "yuzasidan quyidagilarni ma'lum qilaman."
    )
  })

  it("ends with the sentence the chosen stance owns — all three", () => {
    // Arrange / Act / Assert — the whole reason the field exists.
    for (const stance of STANCES) {
      const { lotin } = buildTushuntirish({ ...FULL, stance: stance.id })
      expect(lotin).toContain(stance.phrase)

      // And no OTHER stance's sentence leaked onto the same paper.
      for (const other of STANCES) {
        if (other.id === stance.id) continue
        expect(lotin).not.toContain(other.phrase)
      }
    }
  })

  it("defaults to the middle stance rather than an admission", () => {
    // Arrange / Act / Assert — an untouched form must not admit fault on the
    // visitor's behalf.
    expect(EMPTY_TUSHUNTIRISH.stance).toBe("qisman")
    expect(STANCES[0].id).toBe("qisman")
  })

  it("turns each line of the explanation into its own paragraph", () => {
    // Arrange
    const data = {
      ...FULL,
      explanation: "Birinchi sabab.\n\nIkkinchi sabab.\n   \nUchinchi sabab."
    }

    // Act
    const blocks = composeTushuntirish(data)
    const prose = blocks.filter((entry) => entry.indent)

    // Assert — three paragraphs from the textarea, blank lines dropped, plus
    // the opening sentence and the closing stance.
    expect(prose).toHaveLength(5)
    expect(prose[1].segments[0].text).toBe("Birinchi sabab.")
    expect(prose[2].segments[0].text).toBe("Ikkinchi sabab.")
    expect(prose[3].segments[0].text).toBe("Uchinchi sabab.")
  })

  it("prints writing ROOM when the explanation is empty, not one rule", () => {
    // Arrange / Act — the blank form is printable on purpose, and this is the
    // field a person fills in by hand with a paragraph. Indented blocks on an
    // empty form: opening sentence, three writing rows, closing stance.
    const prose = composeTushuntirish(EMPTY_TUSHUNTIRISH).filter(
      (entry) => entry.indent
    )
    const rows = prose.slice(1, -1)

    // Assert
    expect(rows).toHaveLength(3)
    for (const row of rows) {
      expect(row.segments.every((segment) => segment.kind === "blank")).toBe(
        true
      )
      expect(row.segments[0].text).not.toContain("undefined")
    }
  })

  it("never puts a newline inside an INDENTED block", () => {
    // Arrange — the parity rule. The sheet indents the first visual line only
    // (CSS `text-indent`); the .docx exporter splits on "\n" and indents every
    // resulting Word paragraph. A multi-line indented block would print two
    // different documents.
    const cases = [EMPTY_TUSHUNTIRISH, FULL, { ...FULL, explanation: "a\nb" }]

    // Act / Assert
    for (const data of cases) {
      for (const entry of composeTushuntirish(data)) {
        if (!entry.indent) continue
        const text = entry.segments.map((segment) => segment.text).join("")
        expect(text).not.toContain("\n")
      }
    }
  })

  it("accepts a subject containing digits", () => {
    // Arrange / Act — "40 daqiqa" is ordinary prose about a workplace; a
    // name-shaped check would have blanked the whole line.
    const { lotin } = buildTushuntirish(FULL)

    // Assert
    expect(lotin).toContain("40 daqiqa kechikib kelganim")
  })

  it("blanks a subject with no letters in it at all", () => {
    // Arrange / Act
    const { lotin } = buildTushuntirish({ ...FULL, subject: "12341234" })

    // Assert — garbage never reaches a paper someone signs.
    expect(lotin).not.toContain("12341234")
    expect(lotin).toContain("______")
  })

  it("renders a wholly empty form without a single 'undefined'", () => {
    // Arrange / Act
    const { lotin, kirill } = buildTushuntirish(EMPTY_TUSHUNTIRISH)

    // Assert
    expect(lotin).not.toContain("undefined")
    expect(lotin).not.toContain("NaN")
    expect(lotin).toContain("TUSHUNTIRISH XATI")
    expect(kirill).toContain("ТУШУНТИРИШ ХАТИ")
  })

  it("transliterates the whole document, title included", () => {
    // Arrange / Act
    const { kirill } = buildTushuntirish(FULL)

    // Assert — the title is an ordinary template segment, so it converts with
    // the rest rather than needing a second copy in a config object.
    expect(kirill).toContain("ТУШУНТИРИШ ХАТИ")
    expect(kirill).toContain("Каримов Салим Анварович")
  })
})

describe("validateTushuntirish", () => {
  it("treats an empty form as valid — the blank form is a feature", () => {
    // Arrange / Act / Assert
    expect(validateTushuntirish(EMPTY_TUSHUNTIRISH)).toEqual({})
  })

  it("passes a fully filled form", () => {
    // Arrange / Act / Assert
    expect(validateTushuntirish(FULL)).toEqual({})
  })

  it("rejects a note dated BEFORE the thing it explains", () => {
    // Arrange / Act — a document describing the future.
    const errors = validateTushuntirish({
      ...FULL,
      incidentDate: "2026-08-13",
      documentDate: "2026-08-12"
    })

    // Assert
    expect(errors.documentDate).toBe("dateOrder")
  })

  it("allows a note written on the day of the incident", () => {
    // Arrange / Act / Assert — same-day is the common case, not an error.
    expect(
      validateTushuntirish({ ...FULL, documentDate: "2026-08-12" })
    ).toEqual({})
  })

  it("flags digits in a name but not in the subject", () => {
    // Arrange / Act
    const errors = validateTushuntirish({
      ...FULL,
      employeeName: "Karimov 123",
      subject: "40 daqiqa kechikkanim"
    })

    // Assert
    expect(errors.employeeName).toBe("name")
    expect(errors.subject).toBeUndefined()
  })
})

describe("buildSampleTushuntirish", () => {
  it("dates the incident the day BEFORE the note", () => {
    // Arrange / Act — the real sequence: the note is written after the
    // employer asks, never on the day itself.
    const sample = buildSampleTushuntirish(new Date(2026, 7, 13))

    // Assert
    expect(sample.incidentDate).toBe("2026-08-12")
    expect(sample.documentDate).toBe("2026-08-13")
  })

  it("crosses a month boundary backwards correctly", () => {
    // Arrange / Act — 1 September's incident is 31 August, not "0 September".
    const sample = buildSampleTushuntirish(new Date(2026, 8, 1))

    // Assert
    expect(sample.incidentDate).toBe("2026-08-31")
  })

  it("produces a sample with more than one explanation paragraph", () => {
    // Arrange / Act — the part a blank form cannot teach is how much to write.
    const sample = buildSampleTushuntirish(new Date(2026, 7, 13))

    // Assert
    expect(sample.explanation.split("\n").filter(Boolean).length).toBe(2)
    expect(validateTushuntirish(sample)).toEqual({})
  })
})
