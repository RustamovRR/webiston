/**
 * Rasterise the brand mark into every icon a browser actually asks for.
 *
 * RUN BY HAND, not by the build:  `node scripts/generate-icons.mjs`
 * The outputs are committed. They change when the brand changes — roughly
 * never — so making 300 page builds pay for them would be silly.
 *
 * Source of truth is `src/app/icon.svg`. This script does not redraw the mark;
 * it re-frames it, because the four surfaces below want four different
 * framings and only one of them is "the SVG, but as a PNG":
 *
 *   src/app/favicon.ico   32x32, SINGLE FRAME. Not negotiable: Next reads the
 *                         FIRST directory entry to fill `sizes=`, so the old
 *                         3-frame 16/32/48 file would advertise `sizes="16x16"`
 *                         and lose the Chrome tie-break against the SVG.
 *   src/app/apple-icon.png 180x180, OPAQUE and full-bleed. iOS composites
 *                         transparency to black and applies its own rounded
 *                         mask, so our own rounded corners would be clipped
 *                         into a dark fringe.
 *   public/icon-192.png   manifest icon, mark as drawn.
 *   public/icon-512.png   same, larger.
 *   public/icon-mask.png  512 maskable. Android crops to a circle of radius
 *                         40% of the width, so everything that must survive
 *                         sits inside the central 80%. A SEPARATE file, never
 *                         `purpose: "any maskable"` — that pads the plain icon
 *                         for nothing.
 *   public/logo.png       512x512 on a WHITE plate, for the JSON-LD
 *                         Organization logo. Google's requirement is that it
 *                         "looks how you intend it to look on a purely white
 *                         background", and ~20 JSON-LD references already
 *                         point at this exact path — regenerating it in place
 *                         fixes all of them without touching a line of code.
 *
 * `sharp` is not a dependency of this repo and must not become one. It is
 * present in the pnpm store as a transitive optional dep of `next`, so it is
 * resolved by globbing rather than by bare specifier — the version hash in
 * that path changes on install, which is exactly why this is not hardcoded.
 */

import { readdirSync, readFileSync, writeFileSync } from "node:fs"
import { createRequire } from "node:module"
import path from "node:path"
import { fileURLToPath } from "node:url"

const require = createRequire(import.meta.url)
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")

function loadSharp() {
  const store = path.join(ROOT, "node_modules", ".pnpm")
  const dir = readdirSync(store).find((name) => name.startsWith("sharp@"))
  if (!dir) {
    throw new Error(
      "sharp not found in the pnpm store. It ships as a transitive optional " +
        "dependency of next; run `pnpm install` first."
    )
  }
  return require(path.join(store, dir, "node_modules", "sharp"))
}

// The light branch of `src/app/icon.svg`. A rasteriser resolves no
// prefers-color-scheme, so every PNG below is the light mark — which is the
// correct choice anyway: these are composited onto surfaces we do not control.
const PRIMARY = "#0a6c80" // --primary            light = --brand-700
const INK = "#fafafa" // --primary-foreground light

/**
 * The `w` and its cursor pixel, lifted OUT of `src/app/icon.svg` rather than
 * retyped here.
 *
 * Retyping it is how the favicon and the PNGs end up being different logos six
 * months apart, each edited once. The SVG cannot be rasterised directly — its
 * colours live in a `<style>` block with a `prefers-color-scheme` query that a
 * rasteriser resolves to nothing — so the geometry is extracted and recoloured.
 * If the shape of that file changes enough that these patterns stop matching,
 * this throws instead of silently emitting a badge with no letter on it.
 */
function readGlyphGeometry() {
  const svg = readFileSync(path.join(ROOT, "src/app/icon.svg"), "utf8")

  const stroke = svg.match(/<path[^>]*?\sd="([^"]+)"[^>]*?>/s)
  const width = svg.match(/stroke-width="([\d.]+)"/)
  const pixel = svg.match(
    /<rect[^>]*?\sx="([\d.]+)"[^>]*?y="([\d.]+)"[^>]*?width="([\d.]+)"[^>]*?height="([\d.]+)"/
  )
  const radius = svg.match(/rx="([\d.]+)"/)

  if (!stroke || !width || !pixel || !radius) {
    throw new Error(
      "Could not read the mark's geometry out of src/app/icon.svg. That file " +
        "is the source of truth for the shape; update the patterns here to " +
        "match it rather than hardcoding a second copy of the artwork."
    )
  }

  return {
    path: stroke[1],
    strokeWidth: width[1],
    pixel: { x: pixel[1], y: pixel[2], size: pixel[3] },
    radius: radius[1]
  }
}

const MARK = readGlyphGeometry()

/** The `w` and its cursor pixel, in the 32-unit coordinate space. */
const glyph = (ink) => `
  <path d="${MARK.path}" fill="none" stroke="${ink}"
        stroke-width="${MARK.strokeWidth}" stroke-linecap="round"
        stroke-linejoin="round" />
  <rect x="${MARK.pixel.x}" y="${MARK.pixel.y}" width="${MARK.pixel.size}"
        height="${MARK.pixel.size}" fill="${ink}" />`

/**
 * The mark, optionally inset inside a larger opaque canvas.
 *
 * `scale` is the fraction of the canvas the badge occupies — 1 for a
 * full-bleed icon, 0.8 for the maskable safe zone, 0.78 for the white plate.
 */
function markSvg({ size, scale = 1, plate = null, radius = MARK.radius }) {
  const inner = 32 * scale
  const offset = (32 - inner) / 2
  const background = plate
    ? `<rect width="32" height="32" fill="${plate}" />`
    : ""

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
  ${background}
  <g transform="translate(${offset} ${offset}) scale(${scale})">
    <rect width="32" height="32" rx="${radius}" fill="${PRIMARY}" />
    ${glyph(INK)}
  </g>
</svg>`
}

/**
 * Wrap one PNG as a single-frame .ico.
 *
 * 6-byte ICONDIR + one 16-byte ICONDIRENTRY + the PNG verbatim. PNG-compressed
 * frames are legal in ICO and understood by everything still shipping, so
 * there is no BMP encoding to do and no reason to add a dependency for 22
 * bytes of header.
 */
function icoFromPng(png, dimension) {
  const header = Buffer.alloc(6)
  header.writeUInt16LE(0, 0) // reserved
  header.writeUInt16LE(1, 2) // 1 = icon
  header.writeUInt16LE(1, 4) // one image

  const entry = Buffer.alloc(16)
  entry.writeUInt8(dimension === 256 ? 0 : dimension, 0) // 0 means 256
  entry.writeUInt8(dimension === 256 ? 0 : dimension, 1)
  entry.writeUInt8(0, 2) // palette size — 0 for truecolour
  entry.writeUInt8(0, 3) // reserved
  entry.writeUInt16LE(1, 4) // colour planes
  entry.writeUInt16LE(32, 6) // bits per pixel
  entry.writeUInt32LE(png.length, 8)
  entry.writeUInt32LE(header.length + entry.length, 12) // offset to the data

  return Buffer.concat([header, entry, png])
}

const sharp = loadSharp()
const render = (svg, size) =>
  sharp(Buffer.from(svg))
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toBuffer()

const TARGETS = [
  {
    file: "src/app/apple-icon.png",
    size: 180,
    // Full-bleed and opaque. iOS rounds it for us; our own corners would be
    // cropped into a dark fringe, and any transparency becomes black.
    svg: () => markSvg({ size: 180, scale: 1, plate: PRIMARY, radius: 0 })
  },
  {
    file: "public/icon-192.png",
    size: 192,
    svg: () => markSvg({ size: 192 })
  },
  {
    file: "public/icon-512.png",
    size: 512,
    svg: () => markSvg({ size: 512 })
  },
  {
    file: "public/icon-mask.png",
    size: 512,
    // Everything inside the central 80% — Android's mask is a circle of radius
    // 40% of the width, and the outer band is discardable by definition.
    svg: () => markSvg({ size: 512, scale: 0.7, plate: PRIMARY, radius: 0 })
  },
  {
    file: "public/logo.png",
    size: 512,
    // The white plate is the requirement, not a preference: Google renders the
    // Organization logo on white, and a mark that assumes a dark page vanishes.
    svg: () => markSvg({ size: 512, scale: 0.78, plate: "#ffffff", radius: 8 })
  }
]

const written = []

for (const target of TARGETS) {
  const png = await render(target.svg(), target.size)
  writeFileSync(path.join(ROOT, target.file), png)
  written.push([target.file, png.length])
}

const faviconPng = await render(markSvg({ size: 32 }), 32)
const ico = icoFromPng(faviconPng, 32)
writeFileSync(path.join(ROOT, "src/app/favicon.ico"), ico)
written.push(["src/app/favicon.ico", ico.length])

for (const [file, bytes] of written) {
  console.log(`${String(bytes).padStart(7)} B  ${file}`)
}
