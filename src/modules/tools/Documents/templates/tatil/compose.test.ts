import { describe, expect, it } from "vitest"
import {
  buildTatil,
  composeTatil,
  holidaysBetween,
  leavePeriod,
  parseDays,
  validateTatil
} from "./compose"
import type { TatilData } from "./constants"
import { buildSampleTatil, MOVABLE_HOLIDAYS } from "./constants"

/**
 * The end-date arithmetic is the product. Every competing result is a .doc
 * with "____dan ____gacha" in it; knowing that 1 October is inside a leave
 * that starts on 24 September, and that it is not counted (MK 221), is what
 * nobody else does — and a wrong end date is what an HR office sends back.
 */

const FULL: TatilData = {
  organisation: "«Webiston» MChJ",
  managerRole: "direktori",
  managerName: "Aliyev Anvar Alisherovich",
  employeeName: "Karimov Salim Anvarovich",
  position: "dasturchi",
  kind: "yillik",
  startDate: "2026-09-24",
  days: "21",
  reason: "",
  applicationDate: "2026-09-09"
}

describe("parseDays", () => {
  it("reads a whole number of days and nothing else", () => {
    // Arrange / Act / Assert
    expect(parseDays("21")).toBe(21)
    expect(parseDays(" 14 ")).toBe(14)
    expect(parseDays("0")).toBeNull()
    expect(parseDays("366")).toBeNull()
    expect(parseDays("2.5")).toBeNull()
    expect(parseDays("yigirma")).toBeNull()
    expect(parseDays("")).toBeNull()
  })
})

describe("holidaysBetween", () => {
  it("finds the fixed holidays and the announced hayit, in date order", () => {
    // Arrange / Act — March 2026 carries three of the nine.
    const found = holidaysBetween("2026-03-01", "2026-03-31")

    // Assert
    expect(found.map((holiday) => holiday.date)).toEqual([
      "2026-03-08",
      "2026-03-20",
      "2026-03-21"
    ])
    expect(found.map((holiday) => holiday.id)).toEqual([
      "xotinQizlar",
      "rozaHayit",
      "navruz"
    ])
  })

  it("includes both ends of the span", () => {
    // Arrange / Act / Assert
    expect(holidaysBetween("2026-10-01", "2026-10-01")).toHaveLength(1)
    expect(holidaysBetween("2026-10-02", "2026-11-30")).toHaveLength(0)
  })
})

describe("leavePeriod", () => {
  it("adds a day for a holiday inside an annual leave (MK 221)", () => {
    // Arrange / Act — 21 days from 24 September would end 14 October, but
    // 1 October is inside it and is not counted.
    const period = leavePeriod(FULL)

    // Assert
    expect(period?.end).toBe("2026-10-15")
    expect(period?.holidays.map((holiday) => holiday.id)).toEqual(["oqituvchi"])
    expect(period?.unknownYear).toBeNull()
  })

  it("leaves a leave without holidays at plain calendar arithmetic", () => {
    // Arrange / Act / Assert — 2 to 22 November: nothing inside.
    expect(
      leavePeriod({ ...FULL, startDate: "2026-11-02", days: "21" })?.end
    ).toBe("2026-11-22")
  })

  it("settles when the extra day itself lands on a holiday", () => {
    // Arrange / Act — 7 days from 14 March end on 20 March, Ro'za hayit;
    // the extra day is 21 March, Navro'z; so the leave ends on the 22nd. One
    // pass would have stopped a day early.
    const period = leavePeriod({ ...FULL, startDate: "2026-03-14", days: "7" })

    // Assert
    expect(period?.end).toBe("2026-03-22")
    expect(period?.holidays).toHaveLength(2)
  })

  it("does not extend unpaid leave — 221 is about annual leave only", () => {
    // Arrange / Act
    const period = leavePeriod({ ...FULL, kind: "haqsiz" })

    // Assert
    expect(period?.end).toBe("2026-10-14")
    expect(period?.holidays).toEqual([])
  })

  it("admits it cannot vouch for a year whose hayit is not announced", () => {
    // Arrange / Act — into 2027, for which there is no presidential act yet.
    const period = leavePeriod({ ...FULL, startDate: "2026-12-20" })

    // Assert — New Year is still counted; the flag says a hayit might not be.
    expect(period?.end).toBe("2027-01-10")
    expect(period?.unknownYear).toBe(2027)
  })

  it("does not trust a year with only ONE of its two hayit announced", () => {
    // Arrange — the two acts come about two months apart; the table will
    // hold Ro'za hayit alone for weeks every spring.
    MOVABLE_HOLIDAYS[2027] = [{ id: "rozaHayit", date: "2027-03-10" }]

    try {
      // Act — a leave across the (unannounced) Qurbon hayit of 2027.
      const period = leavePeriod({ ...FULL, startDate: "2027-05-10" })

      // Assert — still a lower bound, not an end date to print.
      expect(period?.unknownYear).toBe(2027)
      expect(buildTatil({ ...FULL, startDate: "2027-05-10" }).lotin).toContain(
        "dan boshlab"
      )
    } finally {
      delete MOVABLE_HOLIDAYS[2027]
    }
  })

  it("returns null until there is a start and a length", () => {
    // Arrange / Act / Assert
    expect(leavePeriod({ ...FULL, startDate: "" })).toBeNull()
    expect(leavePeriod({ ...FULL, days: "" })).toBeNull()
    expect(leavePeriod({ ...FULL, days: "abc" })).toBeNull()
  })
})

describe("buildTatil", () => {
  it("writes the whole request, with the counted end date", () => {
    // Arrange / Act
    const { lotin } = buildTatil(FULL)

    // Assert — the year once, since both dates are in 2026.
    expect(lotin).toContain("«Webiston» MChJ direktori")
    expect(lotin).toContain("Aliyev Anvar Alisherovichga")
    expect(lotin).toContain("dasturchi Karimov Salim Anvarovichdan")
    expect(lotin).toContain(
      "Menga 2026-yil 24-sentabrdan 15-oktabrgacha 21 kalendar kun muddatga navbatdagi yillik mehnat ta'tilini berishingizni so'rayman."
    )
    expect(lotin).toContain("2026-yil 9-sentabr")
    expect(lotin).toContain("Karimov S.A.")
  })

  it("puts the addressee column first and the title under it", () => {
    // Arrange / Act — the shape of every ariza in this family.
    const blocks = composeTatil(FULL)

    // Assert
    expect(blocks[0].width).toBe("half")
    expect(blocks[0].align).toBe("right")
    expect(blocks.findIndex((entry) => entry.heading)).toBe(1)
  })

  it("keeps the year on the end date when the leave crosses New Year", () => {
    // Arrange / Act — unpaid, so the unannounced 2027 hayit does not matter.
    const { lotin } = buildTatil({
      ...FULL,
      kind: "haqsiz",
      startDate: "2026-12-25",
      days: "10"
    })

    // Assert
    expect(lotin).toContain("2026-yil 25-dekabrdan 2027-yil 3-yanvargacha")
  })

  it("asks for a length instead of printing an end date it cannot vouch for", () => {
    // Arrange / Act
    const { lotin } = buildTatil({ ...FULL, startDate: "2026-12-20" })

    // Assert
    expect(lotin).toContain("2026-yil 20-dekabrdan boshlab 21 kalendar kun")
    expect(lotin).not.toContain("gacha")
  })

  it("words unpaid leave as the code does, with its reason", () => {
    // Arrange / Act
    const { lotin } = buildTatil({
      ...FULL,
      kind: "haqsiz",
      days: "5",
      reason: "oilaviy sharoitim"
    })

    // Assert
    expect(lotin).toContain(
      "5 kalendar kun muddatga ish haqi saqlanmaydigan ta'til berishingizni so'rayman."
    )
    expect(lotin).toContain("Sabab: oilaviy sharoitim.")
  })

  it("prints no reason on annual leave, even one left in the field", () => {
    // Arrange / Act — switched back from unpaid with the field still filled.
    const { lotin } = buildTatil({ ...FULL, reason: "oilaviy sharoitim" })

    // Assert
    expect(lotin).not.toContain("Sabab:")
  })

  it("keeps a reason with no words in it off the paper", () => {
    // Arrange / Act
    const { lotin } = buildTatil({ ...FULL, kind: "haqsiz", reason: "1234" })

    // Assert
    expect(lotin).not.toContain("1234")
    expect(lotin).not.toContain("Sabab:")
  })

  it("renders a fillable blank form rather than refusing an empty field", () => {
    // Arrange
    const empty: TatilData = {
      organisation: "",
      managerRole: "",
      managerName: "",
      employeeName: "",
      position: "",
      kind: "yillik",
      startDate: "",
      days: "",
      reason: "",
      applicationDate: ""
    }

    // Act
    const { lotin } = buildTatil(empty)

    // Assert
    expect(lotin).toContain("ARIZA")
    expect(lotin).toContain("______")
    expect(lotin).not.toContain("undefined")
    expect(lotin).not.toContain("NaN")
    expect(lotin).not.toContain("null")
  })

  it("converts the whole document to Cyrillic", () => {
    // Arrange / Act
    const { kirill } = buildTatil(FULL)

    // Assert
    expect(kirill).toContain("АРИЗА")
    expect(kirill).toContain("24-сентабрдан 15-октабргача")
    expect(kirill).toContain("йиллик меҳнат таътилини")
  })
})

describe("validateTatil", () => {
  it("accepts the full example", () => {
    // Arrange / Act / Assert
    expect(validateTatil(FULL)).toEqual({})
  })

  it("rejects a length that is not a number of days", () => {
    // Arrange / Act / Assert
    expect(validateTatil({ ...FULL, days: "abc" }).days).toBe("days")
    expect(validateTatil({ ...FULL, days: "0" }).days).toBe("days")
    // Empty is the blank form, not an error.
    expect(validateTatil({ ...FULL, days: "" }).days).toBeUndefined()
  })

  it("flags an annual leave under fourteen days without refusing it", () => {
    // Arrange / Act — lawful only as the short part of a split leave (MK 231).
    expect(validateTatil({ ...FULL, days: "7" }).days).toBe("shortPart")
    expect(validateTatil({ ...FULL, days: "14" }).days).toBeUndefined()

    // Assert — unpaid leave has no such floor.
    expect(
      validateTatil({ ...FULL, kind: "haqsiz", days: "3" }).days
    ).toBeUndefined()
  })

  it("holds unpaid leave to three months (MK 241)", () => {
    // Arrange — 1 October + 92 days ends 31 December: exactly three months.
    const base = { ...FULL, kind: "haqsiz" as const, startDate: "2026-10-01" }

    // Act / Assert — the boundary passes, one more day does not.
    expect(validateTatil({ ...base, days: "92" }).days).toBeUndefined()
    expect(validateTatil({ ...base, days: "93" }).days).toBe("unpaidLimit")
  })

  it("clamps the ceiling at a short month instead of rolling past it", () => {
    // Arrange — 30 November + 3 months is 28 February, not 2 March. Rolling
    // forward let a leave starting 30 November run to 1 March, a day LATER
    // than one starting 1 December was allowed to: the ceiling loosened as
    // the start moved earlier.
    const unpaid = { ...FULL, kind: "haqsiz" as const }

    // Act / Assert — 30 November may run to 27 February (90 days)…
    expect(
      validateTatil({ ...unpaid, startDate: "2026-11-30", days: "90" }).days
    ).toBeUndefined()
    expect(
      validateTatil({ ...unpaid, startDate: "2026-11-30", days: "91" }).days
    ).toBe("unpaidLimit")
    // …and 1 December to 28 February (90 days): a later start never ends
    // earlier than an earlier start may.
    expect(
      validateTatil({ ...unpaid, startDate: "2026-12-01", days: "90" }).days
    ).toBeUndefined()
    expect(
      validateTatil({ ...unpaid, startDate: "2026-12-01", days: "91" }).days
    ).toBe("unpaidLimit")
  })

  it("flags a leave that starts before the application", () => {
    // Arrange / Act / Assert
    expect(validateTatil({ ...FULL, startDate: "2026-09-01" }).startDate).toBe(
      "dateOrder"
    )
  })

  it("rejects digits in a name and accepts an empty field", () => {
    // Arrange / Act / Assert
    expect(validateTatil({ ...FULL, employeeName: "1234" }).employeeName).toBe(
      "name"
    )
    expect(
      validateTatil({ ...FULL, employeeName: "" }).employeeName
    ).toBeUndefined()
  })
})

describe("buildSampleTatil", () => {
  it("starts the leave fifteen days out, as MK 228 notice would", () => {
    // Arrange / Act
    const sample = buildSampleTatil(new Date(2026, 8, 24))

    // Assert
    expect(sample.applicationDate).toBe("2026-09-24")
    expect(sample.startDate).toBe("2026-10-09")
  })

  it("produces a document the tool's own validation accepts", () => {
    // Arrange / Act
    const sample = buildSampleTatil(new Date(2026, 8, 24))
    const segments = composeTatil(sample).flatMap((entry) => entry.segments)

    // Assert — no writing line survives, and nothing is flagged.
    expect(segments.filter((segment) => segment.kind === "blank")).toEqual([])
    expect(validateTatil(sample)).toEqual({})
  })
})
