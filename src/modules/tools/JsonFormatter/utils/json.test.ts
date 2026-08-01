import { describe, expect, it } from "vitest"

import { analyseJson, byteSize, formatBytes } from "./json"

describe("analyseJson", () => {
  it("formats with the requested indentation", () => {
    // Arrange
    const source = '{"a":1}'

    // Act
    const two = analyseJson(source, "2")
    const four = analyseJson(source, "4")

    // Assert
    expect(two.formatted).toBe('{\n  "a": 1\n}')
    expect(four.formatted).toBe('{\n    "a": 1\n}')
  })

  // The Tab option has been in `JSON_INDENTATION_OPTIONS` since the tool
  // shipped, but the old code ran `parseInt("\t")` — `NaN`, which
  // `JSON.stringify` treats as no indentation at all.
  it("indents with a real tab, not NaN", () => {
    expect(analyseJson('{"a":1}', "\t").formatted).toBe('{\n\t"a": 1\n}')
  })

  it("minifies independently of the formatted output", () => {
    const result = analyseJson('{\n  "a": [1, 2]\n}', "4")

    expect(result.minified).toBe('{"a":[1,2]}')
    expect(result.isValid).toBe(true)
  })

  it("treats blank input as nothing to do, not as an error", () => {
    for (const blank of ["", "   ", "\n\t "]) {
      const result = analyseJson(blank, "2")
      expect(result.isValid).toBe(false)
      expect(result.errorKind).toBeUndefined()
    }
  })

  // Written against what the engine ACTUALLY says today, printed and pasted in
  // rather than remembered — the inherited classifier was matching V8 wording
  // that has since changed.
  it.each([
    ['{"a": 1,}', "propertyName"], // Expected double-quoted property name
    ["{a: 1}", "propertyName"], // Expected property name or '}'
    ['{"a" 1}', "missingColon"], // Expected ':' after property name
    ['{"a": 1', "missingComma"], // Expected ',' or '}' after property value
    ['{"a": "b" "c"}', "missingComma"],
    ["[1, 2,]", "unexpectedToken"],
    ['{"a":', "unexpectedEnd"]
  ])("classifies %s", (source, kind) => {
    expect(analyseJson(source, "2").errorKind).toBe(kind)
  })

  // The missing-colon message contains the words "property name" too, so a
  // classifier that checks in the wrong order reports the wrong mistake.
  it("does not mistake a missing colon for a bad property name", () => {
    expect(analyseJson('{"a" 1}', "2").errorKind).not.toBe("propertyName")
  })

  // The feature the tool did not have: "it is broken" without "here".
  it("reports where the error is", () => {
    // Arrange — the mistake is on line 3
    const source = '{\n  "a": 1,\n  "b" 2\n}'

    // Act
    const result = analyseJson(source, "2")

    // Assert
    expect(result.isValid).toBe(false)
    expect(result.position?.line).toBe(3)
    expect(result.position?.column).toBeGreaterThan(1)
  })

  // "Unexpected end of JSON input" carries no position at all, and inventing
  // one would point the visitor at the wrong character.
  it("offers no position when the engine gives none", () => {
    const result = analyseJson('{"a":', "2")

    expect(result.errorKind).toBe("unexpectedEnd")
    expect(result.position).toBeUndefined()
  })

  it("keeps the engine's own words for the ones it cannot classify", () => {
    const classified = analyseJson('{"a": 1,}', "2")

    expect(classified.errorKind).not.toBe("invalidJsonFormat")
    // Kept regardless, so an unclassified failure can still say something.
    expect(classified.errorDetail).toBeTruthy()
  })

  it("round-trips a payload with Uzbek keys and apostrophes", () => {
    // Arrange — the sample the tool ships
    const source = JSON.stringify({ "ko'cha": "Amir Temur", faol: true })

    // Act
    const result = analyseJson(source, "2")

    // Assert
    expect(result.isValid).toBe(true)
    expect(JSON.parse(result.formatted)).toEqual(JSON.parse(source))
    expect(result.minified).toBe(source)
  })
})

describe("size reporting", () => {
  // Characters and bytes are not the same thing, and JSON is UTF-8. The old
  // footer divided `length` by 1024 and called the result KB, so a Cyrillic or
  // emoji payload was reported at roughly half its real size.
  it("counts bytes, not characters", () => {
    expect(byteSize("abc")).toBe(3)
    expect(byteSize("салом")).toBe(10)
    expect(byteSize("🙂")).toBe(4)
  })

  it("uses B below a kilobyte", () => {
    expect(formatBytes(512)).toBe("512 B")
    expect(formatBytes(1024)).toBe("1.00 KB")
    expect(formatBytes(20480)).toBe("20 KB")
  })
})
