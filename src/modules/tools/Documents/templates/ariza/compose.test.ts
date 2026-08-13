import { describe, expect, it } from "vitest"
import {
  buildAriza,
  composeAriza,
  earliestRelease,
  effectiveRelease,
  validateAriza
} from "./compose"
import type { ArizaData } from "./constants"
import { buildSampleAriza } from "./constants"

/**
 * The notice-period arithmetic is the product. Everything else on this page
 * exists on a hundred portal sites as a .doc; counting fourteen calendar days
 * from the day the visitor is filling the form in does not, and a wrong date
 * there is what sends an ariza back for rewriting.
 */

const FULL: ArizaData = {
  organisation: "«Webiston» MChJ",
  managerRole: "direktori",
  managerName: "Aliyev Anvar Alisherovich",
  employeeName: "Karimov Salim Anvarovich",
  position: "dasturchi",
  category: "umumiy",
  applicationDate: "2026-08-13",
  releaseDate: "",
  reason: ""
}

describe("earliestRelease", () => {
  it("counts fourteen CALENDAR days for an ordinary employee", () => {
    // Arrange / Act / Assert — 13 + 14 = 27 August.
    expect(earliestRelease("2026-08-13", "umumiy")).toBe("2026-08-27")
  })

  it("crosses month and year boundaries the calendar way", () => {
    // Arrange / Act / Assert — the reason this is not `day + 14`.
    expect(earliestRelease("2026-08-25", "umumiy")).toBe("2026-09-08")
    expect(earliestRelease("2026-12-24", "umumiy")).toBe("2027-01-07")
    // February, where a naive 30-day month would be two days out.
    expect(earliestRelease("2027-02-20", "umumiy")).toBe("2027-03-06")
  })

  it("uses MONTHS, not 30-day blocks, for a head and a deputy", () => {
    // Arrange / Act / Assert — MK 160 says two months and one month; a day
    // count would land on the wrong date in every short month.
    expect(earliestRelease("2026-08-13", "rahbar")).toBe("2026-10-13")
    expect(earliestRelease("2026-08-13", "orinbosar")).toBe("2026-09-13")
  })

  it("gives the short periods to the people the article gives them to", () => {
    // Arrange / Act / Assert
    expect(earliestRelease("2026-08-13", "mavsumiy")).toBe("2026-08-16")
    expect(earliestRelease("2026-08-13", "mikrofirma")).toBe("2026-08-20")
  })

  it("returns empty for an unreadable date rather than NaN", () => {
    // Arrange / Act / Assert — a half-typed date must produce a blank line,
    // never "NaN-yil".
    expect(earliestRelease("", "umumiy")).toBe("")
    expect(earliestRelease("13.08.2026", "umumiy")).toBe("")
  })
})

describe("effectiveRelease", () => {
  it("falls back to the earliest lawful day when the field is empty", () => {
    // Arrange / Act / Assert — the document is correct before the visitor
    // has thought about the date at all.
    expect(effectiveRelease(FULL)).toBe("2026-08-27")
  })

  it("lets a date the visitor typed win, even an early one", () => {
    // Arrange / Act / Assert — MK 160 §8 makes an early date lawful; the
    // form flags it rather than overriding what someone deliberately chose.
    expect(effectiveRelease({ ...FULL, releaseDate: "2026-08-20" })).toBe(
      "2026-08-20"
    )
  })
})

describe("buildAriza", () => {
  it("carries every element the ariza needs, and cites the article", () => {
    // Arrange / Act
    const { lotin } = buildAriza(FULL)

    // Assert — addressee, sender, the request, the computed date, the ground.
    expect(lotin).toContain("ARIZA")
    expect(lotin).toContain("«Webiston» MChJ direktori")
    expect(lotin).toContain("Aliyev Anvar Alisherovichga")
    expect(lotin).toContain("Karimov Salim Anvarovichdan")
    expect(lotin).toContain("dasturchi lavozimidan")
    expect(lotin).toContain("2026-yil 27-avgust kunidan ozod qilishingizni")
    expect(lotin).toContain("Mehnat kodeksining 160-moddasi")
    expect(lotin).toContain("2026-yil 13-avgust")
    expect(lotin).toContain("Karimov S.A.")
  })

  it("puts the title AFTER the addressee column, the way an ariza reads", () => {
    // Arrange / Act — the first thing an office notices. A tilxat opens with
    // its title; an ariza opens with who it is addressed to.
    const blocks = composeAriza(FULL)
    const titleAt = blocks.findIndex((entry) => entry.heading)

    // Assert
    expect(titleAt).toBe(1)
    expect(blocks[0].width).toBe("half")
    // And it reads that way in the flat text the clipboard gets.
    const lines = buildAriza(FULL).lotin.split("\n").filter(Boolean)
    expect(lines[0]).toContain("«Webiston» MChJ direktori")
    expect(lines[3]).toBe("ARIZA")
  })

  it("puts the addressee block on the right, where an ariza puts it", () => {
    // Arrange / Act — the reason blocks exist at all: alignment belongs to a
    // paragraph, and a segment list could not express it.
    const blocks = composeAriza(FULL)

    // Assert — the addressee column and the signature, and nothing else.
    expect(blocks.filter((entry) => entry.align === "right")).toHaveLength(2)
    expect(blocks[0].align).toBe("right")
    // Addressee and sender are ONE block: two would put a paragraph gap
    // between them and the sender line reads as detached from the header.
    expect(blocks[0].segments.map((seg) => seg.text).join("")).toContain(
      "ga\ndasturchi"
    )
  })

  it("keeps the sender on ONE line, whatever the job title's length", () => {
    // Arrange / Act — a short title used to be stranded on a line of its own
    // above the name, which is not what an ariza header looks like.
    const short = buildAriza({ ...FULL, position: "kotib" }).lotin
    const long = buildAriza({
      ...FULL,
      position: "axborot xavfsizligi bo'yicha yetakchi mutaxassis"
    }).lotin

    // Assert — one line in both cases; the column wraps it, nothing is
    // positioned by hand.
    expect(short).toContain("kotib Karimov Salim Anvarovichdan")
    expect(long).toContain(
      "axborot xavfsizligi bo'yicha yetakchi mutaxassis Karimov Salim Anvarovichdan"
    )
  })

  it("indents the prose and nothing else", () => {
    // Arrange / Act — the abzas is how an Uzbek document separates
    // paragraphs; a date line or a signature line never takes one.
    const blocks = composeAriza({ ...FULL, reason: "pensiyaga chiqishim" })

    // Assert
    const indented = blocks.filter((entry) => entry.indent)
    const chrome = blocks.filter((entry) => !entry.indent)
    expect(indented).toHaveLength(3)
    expect(indented.every((entry) => entry.align === undefined)).toBe(true)
    // The addressee column and the signature are chrome, not prose.
    expect(chrome.filter((entry) => entry.align === "right")).toHaveLength(2)
    expect(blocks.filter((entry) => entry.width === "half")).toHaveLength(1)
  })

  it("adds the reason clause only when a reason is given", () => {
    // Arrange / Act
    const without = buildAriza(FULL).lotin
    const withReason = buildAriza({
      ...FULL,
      reason: "o'qishga kirganim sababli"
    }).lotin

    // Assert
    expect(without).not.toContain("Sabab:")
    expect(withReason).toContain("Sabab: o'qishga kirganim sababli.")
  })

  it("renders a fillable blank form rather than refusing an empty field", () => {
    // Arrange — nothing filled: the state every visitor starts in, and the
    // printable blank form some of them actually want.
    const empty: ArizaData = {
      organisation: "",
      managerRole: "",
      managerName: "",
      employeeName: "",
      position: "",
      category: "umumiy",
      applicationDate: "",
      releaseDate: "",
      reason: ""
    }

    // Act
    const { lotin } = buildAriza(empty)

    // Assert
    expect(lotin).toContain("______")
    expect(lotin).toContain("ARIZA")
    expect(lotin).not.toContain("undefined")
    expect(lotin).not.toContain("NaN")
  })

  it("converts the whole document to Cyrillic", () => {
    // Arrange / Act
    const { kirill } = buildAriza(FULL)

    // Assert
    expect(kirill).toContain("АРИЗА")
    expect(kirill).toContain("Меҳнат кодексининг 160-моддаси")
    expect(kirill).toContain("2026-йил 27-август")
  })
})

describe("validateAriza", () => {
  it("flags a release date inside the notice period, with its own message", () => {
    // Arrange / Act — a week's notice where the law asks for fourteen days.
    const errors = validateAriza({ ...FULL, releaseDate: "2026-08-20" })

    // Assert — "earlyRelease", not "invalid": the message names the two ways
    // it can still be lawful instead of calling the visitor wrong.
    expect(errors.releaseDate).toBe("earlyRelease")
  })

  it("flags a release date before the application itself", () => {
    // Arrange / Act
    const errors = validateAriza({ ...FULL, releaseDate: "2026-08-01" })

    // Assert
    expect(errors.releaseDate).toBe("dateOrder")
  })

  it("accepts the earliest lawful day and anything after it", () => {
    // Arrange / Act / Assert — the boundary itself must pass.
    expect(
      validateAriza({ ...FULL, releaseDate: "2026-08-27" }).releaseDate
    ).toBeUndefined()
    expect(
      validateAriza({ ...FULL, releaseDate: "2026-09-30" }).releaseDate
    ).toBeUndefined()
  })

  it("rejects digits in a name and accepts an empty field", () => {
    // Arrange / Act / Assert — only FILLED fields can be wrong.
    expect(
      validateAriza({ ...FULL, employeeName: "12341234" }).employeeName
    ).toBe("name")
    expect(
      validateAriza({ ...FULL, employeeName: "" }).employeeName
    ).toBeUndefined()
  })
})

describe("buildSampleAriza", () => {
  it("leaves the release date empty so the computation is what you see", () => {
    // Arrange / Act — the sample's whole job is demonstrating the one thing a
    // downloaded .doc cannot do.
    const sample = buildSampleAriza(new Date(2026, 7, 13))

    // Assert
    expect(sample.applicationDate).toBe("2026-08-13")
    expect(sample.releaseDate).toBe("")
    expect(effectiveRelease(sample)).toBe("2026-08-27")
  })

  it("produces a document the tool's own validation accepts", () => {
    // Arrange / Act
    const sample = buildSampleAriza(new Date(2026, 7, 13))
    const segments = composeAriza(sample).flatMap((entry) => entry.segments)

    // Assert — no writing line survives, and nothing is flagged.
    expect(segments.filter((segment) => segment.kind === "blank")).toEqual([])
    expect(validateAriza(sample)).toEqual({})
  })
})
