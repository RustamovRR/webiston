import { describe, expect, it } from "vitest"

import type { HashOutput } from "../types"
import {
  digest,
  hmac,
  stripChecksumLabel,
  toBase64,
  toHex,
  verifyChecksum
} from "./digest"

const bytes = (text: string) => new TextEncoder().encode(text)

describe("digest", () => {
  it.each([
    ["SHA-1", "a9993e364706816aba3e25717850c26c9cd0d89d"],
    [
      "SHA-256",
      "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"
    ],
    [
      "SHA-384",
      "cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7"
    ],
    [
      "SHA-512",
      "ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f"
    ],
    ["MD5", "900150983cd24fb0d6963f7d28e17f72"]
  ] as const)(
    "%s of 'abc' matches the published vector",
    async (algorithm, expected) => {
      // Arrange + Act
      const result = await digest(bytes("abc"), algorithm)

      // Assert
      expect(toHex(result)).toBe(expected)
    }
  )

  it("renders Base64 the way Subresource Integrity publishes it", async () => {
    // Arrange + Act — the `sha256-…` value in an SRI attribute is this string
    const result = await digest(bytes("abc"), "SHA-256")

    // Assert
    expect(toBase64(result)).toBe(
      "ungWv48Bz+pBQUDeXa4iI7ADYaOWF3qctBD/YfIAFa0="
    )
  })
})

describe("hmac, against RFC 4231 test case 2", () => {
  it("signs with SHA-256", async () => {
    // Arrange
    const key = bytes("Jefe")
    const message = bytes("what do ya want for nothing?")

    // Act
    const result = await hmac(message, key, "SHA-256")

    // Assert
    expect(toHex(result)).toBe(
      "5bdcc146bf60754e6a042426089575c75a003f089d2739839dec58b964ec3843"
    )
  })

  it("is not the same as hashing key + message", async () => {
    // Arrange — the naive construction people reach for when they do not have
    // an HMAC to hand. It is a different value, and it is forgeable.
    const naive = await digest(
      bytes("Jefewhat do ya want for nothing?"),
      "SHA-256"
    )

    // Act
    const keyed = await hmac(
      bytes("what do ya want for nothing?"),
      bytes("Jefe"),
      "SHA-256"
    )

    // Assert
    expect(toHex(keyed)).not.toBe(toHex(naive))
  })
})

describe("stripChecksumLabel — the four shapes checksums are published in", () => {
  const HEX = "65a8e27d8879283831b664bd8b7f0ad4"

  it.each([
    ["bare", HEX],
    ["coreutils", `${HEX}  ubuntu-24.04.iso`],
    ["BSD", `MD5 (ubuntu-24.04.iso) = ${HEX}`],
    ["OCI", `md5:${HEX}`]
  ])("reads the %s form", (_shape, line) => {
    // Arrange + Act
    const result = stripChecksumLabel(line)

    // Assert
    expect(result).toBe(HEX)
  })

  it("does not mistake Base64 padding for a BSD separator", () => {
    // Arrange — `=` ends a padded Base64 digest, and a naive `/=\s*(.+)$/`
    // would capture the empty string after it
    const b64 = "ZajifYh5KDgxtmS9i38K1A=="

    // Act
    const result = stripChecksumLabel(b64)

    // Assert
    expect(result).toBe(b64)
  })
})

describe("verifyChecksum", () => {
  const outputs: HashOutput[] = [
    {
      algorithm: "SHA-256",
      hex: "ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad",
      base64: "ungWv48Bz+pBQUDeXa4iI7ADYaOWF3qctBD/YfIAFa0="
    },
    {
      algorithm: "MD5",
      hex: "900150983cd24fb0d6963f7d28e17f72",
      base64: "kAFQmDzST7DWlj99KOF/cg=="
    }
  ]

  it("names the algorithm on a match", () => {
    // Arrange + Act
    const verdict = verifyChecksum(outputs[0].hex, outputs)

    // Assert
    expect(verdict).toEqual({ kind: "match", algorithm: "SHA-256" })
  })

  it("accepts the uppercase hex half the world publishes", () => {
    // Arrange + Act
    const verdict = verifyChecksum(outputs[1].hex.toUpperCase(), outputs)

    // Assert
    expect(verdict).toEqual({ kind: "match", algorithm: "MD5" })
  })

  it("does NOT fold case on Base64, where case is significant", () => {
    // Arrange — lowercasing a Base64 digest makes it a different digest, and
    // reporting a match there would be worse than reporting nothing
    const verdict = verifyChecksum(outputs[0].base64.toLowerCase(), outputs)

    // Assert
    expect(verdict?.kind).not.toBe("match")
  })

  it("names the algorithm even when it does not match", () => {
    // Arrange — 64 hex characters can only be a SHA-256, and saying so is more
    // use than "no"
    const wrong = "0".repeat(64)

    // Act
    const verdict = verifyChecksum(wrong, outputs)

    // Assert
    expect(verdict).toEqual({ kind: "mismatch", algorithm: "SHA-256" })
  })

  it("does not call a 44-character hex string a Base64 SHA-256", () => {
    // Arrange — 44 is SHA-256's BASE64 length, so a fallthrough from the hex
    // check to the Base64 one would name an algorithm here on a coincidence
    const verdict = verifyChecksum("a".repeat(44), outputs)

    // Assert
    expect(verdict).toEqual({ kind: "unknown" })
  })

  it("says so when the length is nobody's digest", () => {
    // Arrange + Act — the shape of a truncated copy-paste
    const verdict = verifyChecksum("ba7816bf8f01", outputs)

    // Assert
    expect(verdict).toEqual({ kind: "unknown" })
  })

  it("reads a whole line copied off a release page", () => {
    // Arrange + Act
    const verdict = verifyChecksum(
      `SHA256 (ubuntu-24.04.iso) = ${outputs[0].hex}`,
      outputs
    )

    // Assert
    expect(verdict).toEqual({ kind: "match", algorithm: "SHA-256" })
  })

  it("stays quiet on an empty field", () => {
    // Arrange + Act
    const verdict = verifyChecksum("   ", outputs)

    // Assert
    expect(verdict).toBeNull()
  })
})
