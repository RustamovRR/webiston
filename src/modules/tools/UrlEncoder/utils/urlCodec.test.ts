import { describe, expect, it } from "vitest"

import { convert, readQuery } from "./urlCodec"

/**
 * The two domain errors this tool shipped, and the properties the replacement
 * has to keep. Both were invisible to the old code because `encodeURIComponent`
 * never throws — it just returns the wrong answer.
 */

const WHOLE_URL = "https://webiston.uz/search?q=hello world&lang=uz"

describe("encoding", () => {
  it("does not destroy a whole URL", () => {
    // Arrange + Act — this exact string was the tool's own headline sample,
    // and one button ran `encodeURIComponent` over it
    const value = convert(WHOLE_URL, "encode", "value")
    const whole = convert(WHOLE_URL, "encode", "whole")

    // Assert — as a query VALUE the separators must be escaped; as a URL they
    // must not, and only the space changes
    expect(value).toEqual({
      ok: true,
      output:
        "https%3A%2F%2Fwebiston.uz%2Fsearch%3Fq%3Dhello%20world%26lang%3Duz"
    })
    expect(whole).toEqual({
      ok: true,
      output: "https://webiston.uz/search?q=hello%20world&lang=uz"
    })
  })

  it("escapes a literal plus in a query value", () => {
    // Arrange + Act — in form-encoded data a bare `+` means space, so a real
    // plus has to become %2B or it changes meaning on the way back
    const result = convert("a+b", "encode", "value")

    // Assert
    expect(result).toEqual({ ok: true, output: "a%2Bb" })
  })

  it("round-trips non-ASCII in both scopes", () => {
    // Arrange
    const input = "Oʻzbekiston · Тошкент"

    // Act + Assert
    for (const scope of ["value", "whole"] as const) {
      const encoded = convert(input, "encode", scope)
      expect(encoded.ok).toBe(true)
      if (!encoded.ok) return
      expect(convert(encoded.output, "decode", scope)).toEqual({
        ok: true,
        output: input
      })
    }
  })
})

describe("decoding", () => {
  it("reads + as a space in a query value", () => {
    // Arrange + Act — `decodeURIComponent("a+b")` returns "a+b", so every
    // query string copied out of an address bar decoded wrong, silently
    const result = convert("Ali+Valiyev", "decode", "value")

    // Assert
    expect(result).toEqual({ ok: true, output: "Ali Valiyev" })
  })

  it("leaves + alone when the input is a whole URL", () => {
    // Arrange + Act — outside a query value a plus is just a character, and a
    // path like /a+b must survive
    const result = convert("https://webiston.uz/a+b", "decode", "whole")

    // Assert
    expect(result).toEqual({ ok: true, output: "https://webiston.uz/a+b" })
  })

  it("names a malformed escape rather than throwing", () => {
    // Arrange + Act — a lone `%` is the only way decoding can fail
    expect(convert("100%", "decode", "value")).toEqual({
      ok: false,
      reason: "malformed"
    })
    expect(convert("%zz", "decode", "value")).toEqual({
      ok: false,
      reason: "malformed"
    })
  })

  it("keeps the structural characters when decoding a whole URL", () => {
    // Arrange + Act — `decodeURI` deliberately does NOT turn %26 into `&`,
    // because that would change how many parameters the URL has
    const result = convert(
      "https://webiston.uz/search?q=a%26b%20c",
      "decode",
      "whole"
    )

    // Assert
    expect(result).toEqual({
      ok: true,
      output: "https://webiston.uz/search?q=a%26b c"
    })
  })
})

describe("readQuery", () => {
  it("keeps repeated keys instead of collapsing them", () => {
    // Arrange + Act — `extractQueryParams` in lib/utils returns a plain
    // object, so `?tag=a&tag=b` loses one of them
    const pairs = readQuery("?tag=a&tag=b&lang=uz")

    // Assert
    expect(pairs).toEqual([
      { key: "tag", value: "a" },
      { key: "tag", value: "b" },
      { key: "lang", value: "uz" }
    ])
  })

  it("decodes each value, including + as space", () => {
    // Arrange + Act
    const pairs = readQuery(
      "?q=Ali+Valiyev&city=%D0%A2%D0%BE%D1%88%D0%BA%D0%B5%D0%BD%D1%82"
    )

    // Assert
    expect(pairs).toEqual([
      { key: "q", value: "Ali Valiyev" },
      { key: "city", value: "Тошкент" }
    ])
  })

  it("survives a pair with no value", () => {
    // Arrange + Act + Assert — `?debug` is legal and common
    expect(readQuery("?debug&q=1")).toEqual([
      { key: "debug", value: "" },
      { key: "q", value: "1" }
    ])
  })
})
