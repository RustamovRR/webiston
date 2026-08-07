import { closeSync, openSync, readSync } from "node:fs"
import { join } from "node:path"

/**
 * Intrinsic pixel dimensions of an image in `public/`, read from its header.
 *
 * SERVER ONLY — uses `node:fs`. Do not re-export this from `src/lib/index.ts`;
 * that barrel is imported by client components.
 *
 * Why this exists: `ImageViewer` passed `width={0} height={0}`, so no aspect
 * ratio was reserved and all 90 book figures shifted the layout as they loaded.
 * The files are on disk at build time, so the real numbers are free — no
 * dependency, no guessing, no hand-maintained manifest.
 *
 * Only the first 64 bytes (PNG) or a short scan (JPEG) is read, not the file.
 */

export interface ImageSize {
  width: number
  height: number
}

const HEADER_BYTES = 64 * 1024

function readHeader(absPath: string): Buffer | null {
  let fd: number | undefined
  try {
    fd = openSync(absPath, "r")
    const buf = Buffer.alloc(HEADER_BYTES)
    const read = readSync(fd, buf, 0, HEADER_BYTES, 0)
    return buf.subarray(0, read)
  } catch {
    return null
  } finally {
    if (fd !== undefined) closeSync(fd)
  }
}

/** PNG: 8-byte signature, then the IHDR chunk carries width/height as BE u32. */
function pngSize(buf: Buffer): ImageSize | null {
  if (buf.length < 24) return null
  if (buf.readUInt32BE(0) !== 0x89504e47) return null // \x89PNG
  if (buf.toString("ascii", 12, 16) !== "IHDR") return null
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
}

/** JPEG: walk the segment markers to the SOFn frame header. */
function jpegSize(buf: Buffer): ImageSize | null {
  if (buf.length < 4 || buf.readUInt16BE(0) !== 0xffd8) return null // SOI
  let i = 2
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) {
      i++ // resync; padding bytes are legal between segments
      continue
    }
    const marker = buf[i + 1]
    // SOF0..SOF15, excluding DHT (c4), JPG (c8) and DAC (cc)
    const isSOF =
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc
    if (isSOF) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) }
    }
    if (marker === 0xd8 || (marker >= 0xd0 && marker <= 0xd9)) {
      i += 2 // standalone marker, no length field
      continue
    }
    i += 2 + buf.readUInt16BE(i + 2)
  }
  return null
}

/**
 * Resolve a public-root-relative `src` (e.g. `/fluent-react/1.1-figure.png`).
 * Returns `null` for remote URLs, missing files, or formats we cannot read —
 * callers must keep working without dimensions.
 */
export function getPublicImageSize(src: string): ImageSize | null {
  if (!src.startsWith("/") || src.startsWith("//")) return null

  // `src` comes from MDX authored by hand. Refuse anything that could climb out
  // of public/ before touching the filesystem.
  if (src.includes("..")) return null

  const buf = readHeader(join(process.cwd(), "public", decodeURIComponent(src)))
  if (!buf) return null

  const size = pngSize(buf) ?? jpegSize(buf)
  if (!size?.width || !size.height) return null
  return size
}
