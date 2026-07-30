import { describe, expect, it } from "vitest"
import {
  buildAlphabet,
  CHAR_SETS,
  generatePassword,
  NoCharactersSelectedError,
  type PasswordSettings,
  type RandomInt,
  secureRandomInt
} from "./generate-password"

const settings = (over: Partial<PasswordSettings> = {}): PasswordSettings => ({
  length: 16,
  includeUppercase: true,
  includeLowercase: true,
  includeNumbers: true,
  includeSymbols: true,
  excludeSimilar: false,
  passwordType: "random",
  ...over
})

/** Deterministic RandomInt: always the first candidate. */
const alwaysZero: RandomInt = () => 0

/** Deterministic RandomInt cycling 0,1,2,… so output varies but is predictable. */
const counting = (): RandomInt => {
  let n = 0
  return (max) => n++ % max
}

describe("secureRandomInt", () => {
  it("stays within [0, max)", () => {
    for (const max of [1, 2, 26, 95, 1000]) {
      for (let i = 0; i < 200; i++) {
        const v = secureRandomInt(max)
        expect(v).toBeGreaterThanOrEqual(0)
        expect(v).toBeLessThan(max)
      }
    }
  })

  it("rejects a non-positive range instead of returning NaN", () => {
    expect(() => secureRandomInt(0)).toThrow(RangeError)
    expect(() => secureRandomInt(-1)).toThrow(RangeError)
  })

  it("covers the whole range, not just part of it", () => {
    // A biased or truncated implementation shows up as missing buckets.
    const seen = new Set<number>()
    for (let i = 0; i < 2000; i++) seen.add(secureRandomInt(10))
    expect(seen.size).toBe(10)
  })

  it("does not use Math.random", () => {
    // The whole point of the extraction. If someone reintroduces Math.random,
    // stubbing it to a constant would make the output constant — it must not.
    const spy = Math.random
    let called = false
    Math.random = () => {
      called = true
      return 0
    }
    try {
      secureRandomInt(26)
      expect(called).toBe(false)
    } finally {
      Math.random = spy
    }
  })
})

describe("buildAlphabet", () => {
  it("includes only the enabled classes", () => {
    expect(buildAlphabet(settings({ includeSymbols: false }))).not.toContain(
      "!"
    )
    expect(buildAlphabet(settings({ includeNumbers: false }))).not.toContain(
      "5"
    )
    expect(buildAlphabet(settings({ includeUppercase: false }))).not.toContain(
      "A"
    )
  })

  it("is empty when nothing is enabled", () => {
    expect(
      buildAlphabet(
        settings({
          includeUppercase: false,
          includeLowercase: false,
          includeNumbers: false,
          includeSymbols: false
        })
      )
    ).toBe("")
  })

  it("removes every look-alike glyph when excludeSimilar is on", () => {
    const alphabet = buildAlphabet(settings({ excludeSimilar: true }))
    for (const c of CHAR_SETS.similar) {
      expect(alphabet, `should not contain "${c}"`).not.toContain(c)
    }
  })
})

describe("generatePassword — random", () => {
  it("returns exactly the requested length", () => {
    for (const length of [1, 6, 16, 64, 128]) {
      expect(generatePassword(settings({ length })).length).toBe(length)
    }
  })

  it("draws only from the enabled alphabet", () => {
    const s = settings({ includeSymbols: false, includeUppercase: false })
    const allowed = new Set(buildAlphabet(s))
    for (const c of generatePassword(s)) expect(allowed.has(c)).toBe(true)
  })

  it("throws rather than returning an empty password when nothing is enabled", () => {
    // An empty string would look like success to the caller.
    expect(() =>
      generatePassword(
        settings({
          includeUppercase: false,
          includeLowercase: false,
          includeNumbers: false,
          includeSymbols: false
        })
      )
    ).toThrow(NoCharactersSelectedError)
  })

  it("produces different passwords across calls", () => {
    const seen = new Set(
      Array.from({ length: 50 }, () => generatePassword(settings()))
    )
    expect(seen.size).toBe(50)
  })

  it("is deterministic when the randomness is injected", () => {
    const a = generatePassword(settings({ length: 8 }), alwaysZero)
    const b = generatePassword(settings({ length: 8 }), alwaysZero)
    expect(a).toBe(b)
  })
})

describe("generatePassword — strong", () => {
  it("contains at least one character from every enabled class", () => {
    const s = settings({ passwordType: "strong", length: 20 })
    for (let i = 0; i < 40; i++) {
      const pw = generatePassword(s)
      expect(pw, "uppercase").toMatch(/[A-Z]/)
      expect(pw, "lowercase").toMatch(/[a-z]/)
      expect(pw, "number").toMatch(/[0-9]/)
      expect(pw, "symbol").toMatch(/[^A-Za-z0-9]/)
    }
  })

  it("never exceeds the requested length, even below the class count", () => {
    // 4 classes enabled but only 2 characters requested.
    const pw = generatePassword(settings({ passwordType: "strong", length: 2 }))
    expect(pw).toHaveLength(2)
  })

  it("shuffles — required characters are not pinned to the front", () => {
    const s = settings({ passwordType: "strong", length: 24 })
    const firstFourAlwaysOrdered = Array.from({ length: 30 }, () =>
      /^[A-Z][a-z][0-9]/.test(generatePassword(s))
    )
    expect(firstFourAlwaysOrdered.every(Boolean)).toBe(false)
  })
})

describe("generatePassword — memorable", () => {
  it("is built from dictionary words, digits and an optional symbol", () => {
    const pw = generatePassword(
      settings({ passwordType: "memorable", length: 32 }),
      counting()
    )
    expect(pw).toMatch(/[A-Z][a-z]+/)
    expect(pw).toMatch(/\d{3}/)
  })

  it("truncates to the requested length when the words overflow it", () => {
    const pw = generatePassword(
      settings({ passwordType: "memorable", length: 8 })
    )
    expect(pw).toHaveLength(8)
  })

  it("omits the symbol when symbols are disabled", () => {
    const s = settings({
      passwordType: "memorable",
      includeSymbols: false,
      length: 40
    })
    // Padding still comes from the alphabet, which has no symbols here.
    expect(generatePassword(s)).not.toMatch(/[!@#$%^&*]/)
  })

  it("does not hang when no alphabet is available to pad with", () => {
    // Regression guard: the padding loop is `while (len < target && alphabet)`.
    // Without the alphabet check this spins forever.
    const s = settings({
      passwordType: "memorable",
      length: 200,
      includeUppercase: false,
      includeLowercase: false,
      includeNumbers: false,
      includeSymbols: false
    })
    const pw = generatePassword(s)
    expect(pw.length).toBeGreaterThan(0)
    expect(pw.length).toBeLessThan(200)
  })
})
