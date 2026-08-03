/**
 * MD5, RFC 1321.
 *
 * This exists because the Web Crypto API deliberately does not implement MD5 —
 * and because what this tool shipped instead was not MD5 at all:
 *
 * ```
 * let hash = 0
 * for (…) hash = (hash << 5) - hash + char
 * return Math.abs(hash).toString(16).padStart(8, "0").repeat(4).slice(0, 32)
 * ```
 *
 * That is a 32-bit string hash, printed four times to reach 32 characters. It
 * looks like a digest and is not one: `md5("Hello, World!")` is
 * `65a8e27d8879283831b664bd8b7f0ad4`, and the tool answered
 * `5955b8155955b8155955b8155955b815`. Anyone checking a download against a
 * published MD5 got a mismatch every single time, and the only thing the tool
 * told them was that their file was corrupt.
 *
 * MD5 is broken for anything security-related and the reference table says so.
 * It stays because verifying a legacy download's published MD5 is a real job
 * that nothing else does.
 */

/**
 * `K[i] = floor(abs(sin(i + 1)) × 2^32)` — RFC 1321 §3.4.
 *
 * Derived rather than pasted as 64 literals: the derivation is checkable
 * against the RFC in one line, a table of magic numbers is not.
 */
const K = new Uint32Array(64)
for (let i = 0; i < 64; i += 1) {
  K[i] = Math.floor(Math.abs(Math.sin(i + 1)) * 2 ** 32)
}

/** Per-round left-rotation amounts, RFC 1321 §3.4. */
const SHIFTS = [
  7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 5, 9, 14, 20, 5,
  9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11,
  16, 23, 4, 11, 16, 23, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15,
  21
]

const rotateLeft = (value: number, by: number) =>
  (value << by) | (value >>> (32 - by))

/**
 * The 16-byte digest of `bytes`.
 *
 * Takes bytes, not a string, for the same reason the rest of this tool does:
 * a hash is defined over bytes, and deciding how text becomes bytes is the
 * caller's job.
 */
export function md5(bytes: Uint8Array): Uint8Array {
  const length = bytes.length

  // 0x80, then zeros, then eight bytes of bit length — padded to whichever
  // multiple of 64 leaves room for all nine.
  const blocks = Math.floor((length + 8) / 64) + 1
  const padded = new Uint8Array(blocks * 64)
  padded.set(bytes)
  padded[length] = 0x80

  const view = new DataView(padded.buffer)

  // The length is written as a 64-bit little-endian bit count. `length * 8`
  // passes 2^32 at 512 MB, so the high word is a division rather than a shift:
  // JavaScript's bitwise operators truncate to 32 bits and would silently
  // write zero.
  const bitLength = length * 8
  view.setUint32(padded.length - 8, bitLength >>> 0, true)
  view.setUint32(padded.length - 4, Math.floor(bitLength / 0x1_0000_0000), true)

  let a0 = 0x67452301
  let b0 = 0xefcdab89
  let c0 = 0x98badcfe
  let d0 = 0x10325476

  const words = new Uint32Array(16)

  for (let offset = 0; offset < padded.length; offset += 64) {
    for (let i = 0; i < 16; i += 1) {
      words[i] = view.getUint32(offset + i * 4, true)
    }

    let a = a0
    let b = b0
    let c = c0
    let d = d0

    for (let i = 0; i < 64; i += 1) {
      let mixed: number
      let index: number

      if (i < 16) {
        mixed = (b & c) | (~b & d)
        index = i
      } else if (i < 32) {
        mixed = (d & b) | (~d & c)
        index = (5 * i + 1) % 16
      } else if (i < 48) {
        mixed = b ^ c ^ d
        index = (3 * i + 5) % 16
      } else {
        mixed = c ^ (b | ~d)
        index = (7 * i) % 16
      }

      // `| 0` keeps every intermediate a signed 32-bit integer; without it the
      // sum leaves the safe-integer range and the rotation reads garbage.
      const sum = (mixed + a + K[i] + words[index]) | 0
      a = d
      d = c
      c = b
      b = (b + rotateLeft(sum, SHIFTS[i])) | 0
    }

    a0 = (a0 + a) | 0
    b0 = (b0 + b) | 0
    c0 = (c0 + c) | 0
    d0 = (d0 + d) | 0
  }

  const digest = new Uint8Array(16)
  const out = new DataView(digest.buffer)
  out.setUint32(0, a0 >>> 0, true)
  out.setUint32(4, b0 >>> 0, true)
  out.setUint32(8, c0 >>> 0, true)
  out.setUint32(12, d0 >>> 0, true)
  return digest
}
