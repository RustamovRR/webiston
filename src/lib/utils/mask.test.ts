import { describe, expect, it } from "vitest"

import { maskAmount, maskPassport, maskPhone, maskPinfl } from "./mask"

/**
 * The masks exist because the owner typed "asdfasdfad" into a passport field
 * and it accepted every character. Every case below is that class of input.
 */

describe("maskPassport", () => {
  it("keeps only two letters and seven digits, spaced", () => {
    // Arrange / Act / Assert — typed lazily, pasted, or shouted.
    expect(maskPassport("ab1234567")).toBe("AB 1234567")
    expect(maskPassport("AB 1234567")).toBe("AB 1234567")
    expect(maskPassport("ab-1234567")).toBe("AB 1234567")
  })

  it("refuses to grow past the format, however much is typed", () => {
    // Arrange / Act / Assert — the screenshot's input, and then some.
    expect(maskPassport("asdfasdfad")).toBe("AS")
    expect(maskPassport("aa12341234123412341234")).toBe("AA 1234123")
    expect(maskPassport("qwefqwefqwefqw")).toBe("QW")
  })

  it("holds every legal prefix on the way to a full one", () => {
    // Arrange / Act / Assert — typing "AB1234567" one key at a time must
    // never produce a value the visitor did not ask for.
    expect(maskPassport("a")).toBe("A")
    expect(maskPassport("ab")).toBe("AB")
    expect(maskPassport("ab1")).toBe("AB 1")
    expect(maskPassport("")).toBe("")
  })

  it("is idempotent, so re-masking cannot move the value", () => {
    // Arrange / Act — this is what makes it safe in a controlled onChange.
    const once = maskPassport("ab1234567")

    // Assert
    expect(maskPassport(once)).toBe(once)
  })
})

describe("maskPinfl", () => {
  it("keeps fourteen digits and drops everything else", () => {
    // Arrange / Act / Assert
    expect(maskPinfl("30412900123456")).toBe("30412900123456")
    expect(maskPinfl("qwefqwefqwefqw")).toBe("")
    expect(maskPinfl("3041 2900 1234 56")).toBe("30412900123456")
    expect(maskPinfl("304129001234567890")).toBe("30412900123456")
  })
})

describe("maskAmount", () => {
  it("strips what could never be part of a sum, keeping what could", () => {
    // Arrange / Act / Assert — a figure pasted out of a chat message.
    expect(maskAmount("5 000 000 so'm")).toBe("5 000 000 ")
    expect(maskAmount("15000000,50")).toBe("15000000,50")
    expect(maskAmount("besh million")).toBe("")
  })
})

describe("maskPhone", () => {
  it("formats an Uzbek number the way a document writes it", () => {
    // Arrange / Act / Assert
    expect(maskPhone("998901234567")).toBe("+998 90 123 45 67")
    expect(maskPhone("+998901234567")).toBe("+998 90 123 45 67")
  })

  it("formats progressively as the digits arrive", () => {
    // Arrange / Act / Assert — the field only ever holds a legal prefix.
    expect(maskPhone("+998 9")).toBe("+998 9")
    expect(maskPhone("+998 90")).toBe("+998 90")
    expect(maskPhone("+998 901")).toBe("+998 90 1")
    expect(maskPhone("+998 9012345")).toBe("+998 90 123 45")
  })

  it("can be backspaced all the way to empty", () => {
    // Arrange / Act / Assert — the trap this mask exists to avoid: a mask
    // that re-adds "+998" cannot be deleted past, and the visitor is stuck.
    expect(maskPhone("+998 9")).toBe("+998 9")
    expect(maskPhone("+998 ")).toBe("+998")
    expect(maskPhone("+99")).toBe("+99")
    expect(maskPhone("+")).toBe("+")
    expect(maskPhone("")).toBe("")
  })

  it("never invents a country code", () => {
    // Arrange / Act / Assert — typing a bare local number stays bare until
    // the visitor says otherwise.
    expect(maskPhone("901234567")).toBe("90 123 45 67")
  })

  it("groups a foreign number instead of correcting it", () => {
    // Arrange / Act / Assert
    expect(maskPhone("+15551234567")).toBe("+15 551 23 45 67")
  })

  it("caps an Uzbek number at nine national digits", () => {
    // Arrange / Act / Assert
    expect(maskPhone("+9989012345678888")).toBe("+998 90 123 45 67")
  })

  it("is idempotent", () => {
    // Arrange / Act / Assert — what makes it safe in a controlled onChange.
    for (const value of ["+998 90 123 45 67", "+998", "", "90 123 45 67"]) {
      expect(maskPhone(maskPhone(value))).toBe(maskPhone(value))
    }
  })
})
