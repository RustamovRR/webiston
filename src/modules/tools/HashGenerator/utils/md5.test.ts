import { describe, expect, it } from "vitest"

import { toHex } from "./digest"
import { md5 } from "./md5"

/**
 * The suite MD5 ships with.
 *
 * These are not vectors somebody chose: RFC 1321 appendix A.5 publishes them
 * with the algorithm, and an implementation that passes all seven is the
 * algorithm. What this tool shipped before passes none of them — it was a
 * 32-bit string hash printed four times.
 */

const bytes = (text: string) => new TextEncoder().encode(text)
const hash = (text: string) => toHex(md5(bytes(text)))

describe("md5, against RFC 1321 appendix A.5", () => {
  const VECTORS: ReadonlyArray<readonly [string, string]> = [
    ["", "d41d8cd98f00b204e9800998ecf8427e"],
    ["a", "0cc175b9c0f1b6a831c399e269772661"],
    ["abc", "900150983cd24fb0d6963f7d28e17f72"],
    ["message digest", "f96b697d7cb7938d525a2f31aaf161d0"],
    ["abcdefghijklmnopqrstuvwxyz", "c3fcd3d76192e4007dfb496cca67e13b"],
    [
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
      "d174ab98d277d9f5a5611c2c9f419d9f"
    ],
    [
      "12345678901234567890123456789012345678901234567890123456789012345678901234567890",
      "57edf4a22be3c955ac49da2e2107b67a"
    ]
  ]

  it.each(VECTORS)("md5(%j)", (input, expected) => {
    // Arrange + Act
    const result = hash(input)

    // Assert
    expect(result).toBe(expected)
  })
})

describe("padding, which is where a hand-written MD5 goes wrong", () => {
  it("gets the block boundary right at 55, 56 and 57 bytes", () => {
    // Arrange — 56 is the first length that needs a SECOND block just to hold
    // the 8-byte length field, so an off-by-one in the padding shows up here
    // and nowhere else.
    const at = (n: number) => hash("a".repeat(n))

    // Act + Assert — values from `md5sum` for the same inputs
    expect(at(55)).toBe("ef1772b6dff9a122358552954ad0df65")
    expect(at(56)).toBe("3b0c8ac703f828b04c6c197006d17218")
    expect(at(57)).toBe("652b906d60af96844ebd21b674f35e93")
  })

  it("hashes bytes, not UTF-16 code units", () => {
    // Arrange — `Oʻ` is O plus U+02BB, which is two bytes in UTF-8. A hash
    // built over `charCodeAt` gets a different and wrong answer.
    const input = "Oʻzbekiston"

    // Act
    const result = hash(input)

    // Assert — 11 UTF-16 code units, 12 UTF-8 bytes
    expect(input).toHaveLength(11)
    expect(bytes(input)).toHaveLength(12)
    expect(result).toBe("e5446f985d3af8ffac717ba6e3de7538")
  })

  it("is not the 32-bit string hash it used to be", () => {
    // Arrange — the shipped implementation returned eight hex characters
    // repeated four times, so the second quarter always equalled the first
    const result = hash("Hello, World!")

    // Assert
    expect(result).toBe("65a8e27d8879283831b664bd8b7f0ad4")
    expect(result.slice(0, 8)).not.toBe(result.slice(8, 16))
  })
})
