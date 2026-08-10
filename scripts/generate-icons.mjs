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
 *   apps/extensions/latin-cyrillic/public/icon/{16,32,128}.png
 *                         the Chrome extension's toolbar, menu and store
 *                         icons, plus the mark the popup and the in-page
 *                         popover render. They were LEFT BEHIND when the 2026
 *                         mark shipped — committed at `4477533` and never
 *                         regenerated — so the browser's extension list wore
 *                         the July-2025 logo while every other surface had
 *                         moved on. The extension is a separate build (WXT)
 *                         and cannot import from `src/`, which is exactly why
 *                         its icons have to be produced HERE, from the same
 *                         `icon.svg`, rather than drawn again over there.
 *                         128 is Chrome's required store/detail size; 16 and
 *                         32 are the toolbar and the context menu.
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

/**
 * The DARK branch of `src/app/icon.svg` — the badge the owner signed off on.
 *
 * A rasteriser resolves no `prefers-color-scheme`, so every PNG here has to
 * commit to one scheme. Dark is the right commitment: a near-black rounded
 * badge is unmistakable on the white background Google composites the
 * Organization logo onto, on an iOS home screen, and in an Android launcher.
 * The light branch would put a near-white badge on white and leave the border
 * doing all the work.
 */
const CARD = "#141819" // card            dark
const TINT = "#40bedc" // primary         dark, at 30% in the corner
const EDGE = "rgb(255 255 255 / 34%)" // border-strong dark
const INK = "#fafafa" // foreground      dark
const ACCENT = "#40bedc" // primary       dark

/**
 * The mark's geometry, lifted OUT of `src/app/icon.svg` rather than retyped.
 *
 * Retyping it is how the favicon and the PNGs become two different logos six
 * months apart, each edited once. The SVG cannot be rasterised directly — its
 * colours live in a `<style>` block with a media query a rasteriser resolves to
 * nothing — so the geometry is extracted and recoloured.
 *
 * Every pattern is anchored on the element's `class`, NOT on its position. An
 * earlier version matched "the first `<rect>` with x/y/width/height" and "the
 * first `stroke-width`", which silently started reading the BADGE PLATE as the
 * accent pixel and the BORDER width as the glyph weight the moment the artwork
 * grew a border. It threw no error; it just drew the wrong logo.
 */
function readMarkGeometry() {
  const svg = readFileSync(path.join(ROOT, "src/app/icon.svg"), "utf8")

  // `.match()` yields the match ARRAY; the element text is entry 0.
  const element = (tag, cls) =>
    svg.match(new RegExp(`<${tag}\\b[^>]*class="${cls}"[^>]*>`, "s"))?.[0]

  const plateEl = element("rect", "plate")
  const edgeEl = element("rect", "edge")
  const pixelEl = element("rect", "pixel")
  // The letter is a <g class="glyph"> carrying the placement transform, with
  // Inter's raw outline on the <path> inside it.
  const glyphGroup = svg.match(/<g\b[^>]*class="glyph"[^>]*>[\s\S]*?<\/g>/)?.[0]
  const glyphPath = glyphGroup?.match(/<path\b[\s\S]*?\/>/)?.[0]

  const attr = (el, name) => el?.match(new RegExp(`${name}="([^"]+)"`))?.[1]

  const mark = {
    plate: {
      size: attr(plateEl, "width"),
      radius: attr(plateEl, "rx")
    },
    edge: {
      x: attr(edgeEl, "x"),
      size: attr(edgeEl, "width"),
      radius: attr(edgeEl, "rx"),
      width: attr(edgeEl, "stroke-width")
    },
    glyph: {
      transform: attr(glyphGroup, "transform"),
      path: attr(glyphPath, "d")
    },
    pixel: {
      x: attr(pixelEl, "x"),
      y: attr(pixelEl, "y"),
      size: attr(pixelEl, "width"),
      radius: attr(pixelEl, "rx") ?? "0"
    }
  }

  const missing = [
    !mark.plate.size && 'the badge plate (rect class="plate")',
    !mark.edge.width && 'the border (rect class="edge")',
    !mark.glyph.path && 'the letter outline (path inside g class="glyph")',
    !mark.glyph.transform && "the letter's placement transform",
    !mark.pixel.x && 'the accent pixel (rect class="pixel")'
  ].filter(Boolean)

  if (missing.length) {
    throw new Error(
      `Could not read ${missing.join(", ")} out of src/app/icon.svg.\n` +
        "That file is the source of truth for the shape. Fix the class names " +
        "or these patterns — do NOT hardcode a second copy of the artwork here."
    )
  }

  return mark
}

const MARK = readMarkGeometry()

/**
 * The badge, in the 32-unit coordinate space: plate, corner tint, border,
 * letter, accent pixel — the same five layers as the SVG, recoloured to the
 * dark branch because a rasteriser resolves no media query.
 *
 * `bleed` squares the corners and drops the border, for the surfaces the OS
 * masks anyway (iOS rounds its own; Android crops to a circle). Keeping our
 * rounded corners there would leave a dark fringe outside the OS mask.
 */
function badge({ bleed = false }) {
  const { size, radius } = MARK.plate
  const shape = bleed
    ? `width="32" height="32"`
    : `width="${size}" height="${size}" rx="${radius}"`

  const border = bleed
    ? ""
    : `<rect x="${MARK.edge.x}" y="${MARK.edge.x}" width="${MARK.edge.size}"
             height="${MARK.edge.size}" rx="${MARK.edge.radius}" fill="none"
             stroke="${EDGE}" stroke-width="${MARK.edge.width}" />`

  return `
    <rect ${shape} fill="${CARD}" />
    <rect ${shape} fill="url(#tint)" />
    ${border}
    <g transform="${MARK.glyph.transform}"><path d="${MARK.glyph.path}" fill="${INK}" /></g>
    <rect x="${MARK.pixel.x}" y="${MARK.pixel.y}" width="${MARK.pixel.size}"
          height="${MARK.pixel.size}" rx="${MARK.pixel.radius}" fill="${ACCENT}" />`
}

/**
 * The mark, optionally inset inside a larger canvas.
 *
 * `scale` is the fraction of the canvas the badge occupies — 1 full-bleed,
 * 0.7 for the maskable safe zone, 0.78 for the white plate.
 */
function markSvg({ size, scale = 1, plate = null, bleed = false }) {
  const inner = 32 * scale
  const offset = (32 - inner) / 2

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 32 32">
  <linearGradient id="tint" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="${TINT}" stop-opacity="0.3" />
    <stop offset="0.5" stop-color="${TINT}" stop-opacity="0" />
  </linearGradient>
  ${plate ? `<rect width="32" height="32" fill="${plate}" />` : ""}
  <g transform="translate(${offset} ${offset}) scale(${scale})">
    ${badge({ bleed })}
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
    svg: () => markSvg({ size: 180, scale: 1, plate: CARD, bleed: true })
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
    svg: () => markSvg({ size: 512, scale: 0.7, plate: CARD, bleed: true })
  },
  {
    file: "public/logo.png",
    size: 512,
    // The white plate is the requirement, not a preference: Google renders the
    // Organization logo on white, and a mark that assumes a dark page vanishes.
    svg: () => markSvg({ size: 512, scale: 0.78, plate: "#ffffff", radius: 8 })
  },
  // The extension's three sizes — the mark as drawn, same as the favicon.
  // Chrome composites these onto its own toolbar, which is light in one theme
  // and dark in the other, so the badge has to carry its own plate and edge.
  // That is the dark branch's whole argument, already made in `icon.svg`.
  ...[16, 32, 128].map((size) => ({
    file: `apps/extensions/latin-cyrillic/public/icon/${size}.png`,
    size,
    svg: () => markSvg({ size })
  })),
  /**
   * The Edge Add-ons store logo.
   *
   * Partner Center asks for a 1:1 logo per listing LANGUAGE and recommends
   * 300x300; the 128 the extension ships clears the minimum but arrives at the
   * store card already at its limit. Rendered from `icon.svg` at full size
   * rather than upscaled from the 128, so the plate edge stays a crisp 1px.
   *
   * Deliberately OUTSIDE `public/` — everything under there is copied into the
   * shipped bundle, and a 300px icon no manifest references is dead weight in
   * the package a reviewer reads.
   */
  {
    file: "apps/extensions/latin-cyrillic/store-assets/logo-300x300.png",
    size: 300,
    svg: () => markSvg({ size: 300 })
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
