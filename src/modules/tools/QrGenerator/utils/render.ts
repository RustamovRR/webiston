import type { QrStyle } from "../types"
import { eyeBallPath, eyeFramePath } from "./eyes"
import {
  type FrameId,
  type FrameLayout,
  type FrameSpec,
  frameById,
  layoutFrame
} from "./frames"
import { neighboursOf, type QrMatrix } from "./matrix"
import { modulePath } from "./shapes"

/**
 * Turn text + a style into a drawable model.
 *
 * A MODEL, not markup: the React preview maps it to elements and the exporter
 * serialises the same object, so what the visitor approves on screen and what
 * lands in the downloaded file cannot drift apart. The version this replaces
 * had exactly that bug — gradients were applied in the download path only, so
 * the preview and the PNG were different pictures.
 *
 * All geometry is in module units scaled to `extent`, so the output is
 * resolution-independent: one model serves a 320px preview and a 1024px PNG.
 */

/**
 * The light border around the code, in modules.
 *
 * ISO/IEC 18004 requires four. Measured on the previous implementation, ours
 * was 1.5 — narrow enough that a code placed on a coloured background or
 * printed against artwork can fail to be found at all, because the reader has
 * nothing to tell it where the symbol ends.
 */
export const STANDARD_QUIET_ZONE = 4

export interface QrModel {
  /** viewBox extent; every coordinate below is inside 0..extent. */
  extent: number
  moduleSize: number
  moduleCount: number
  background: { fill: string; radius: number }
  /** Every data module, merged into one path. */
  dataPath: string
  eyeFrames: string[]
  eyeBalls: string[]
  gradient?: {
    id: string
    type: "linear" | "radial"
    from: string
    to: string
  }
  logo?: { href: string; x: number; y: number; size: number }
  /** What the ink resolves to — a colour, or `url(#id)` for a gradient. */
  ink: string
}

export interface RenderInput {
  /**
   * The encoded symbol, built separately on purpose.
   *
   * Encoding is 73% of the total cost (measured: 2.563 ms of 3.508 ms for a
   * 250-character vCard) and it depends only on the TEXT — not on any colour,
   * shape or slider. Taking it as an argument is what lets a colour drag or a
   * preset click repaint without re-encoding, and what lets the preset strip
   * draw eight thumbnails from one encode.
   */
  matrix: QrMatrix
  style: QrStyle
  /** Edge length of the output box in user units. */
  extent: number
  /** Quiet zone in MODULES. */
  quietZone: number
  /**
   * Namespace for `<defs>` ids.
   *
   * `<defs>` ids are document-global, so several codes on one page — the
   * preview and the eight preset thumbnails — must not mint the same id.
   * Measured in the browser: without this, the "Brend" thumbnail and the
   * preview both emitted `qr-linear-062a33-0d5a6b`.
   */
  idScope?: string
}

export function buildQrModel({
  matrix,
  style,
  extent,
  quietZone,
  idScope
}: RenderInput): QrModel {
  const { size } = matrix

  // The quiet zone is expressed in modules, so the module size has to account
  // for it: a fixed pixel margin gives a different (and usually wrong) number
  // of modules on every QR version, because the version grows with the data.
  const moduleSize = extent / (size + quietZone * 2)
  const origin = quietZone * moduleSize

  const at = (index: number) => origin + index * moduleSize

  // Modules the logo sits on are dropped rather than painted over. Painting
  // over them leaves the ink visible through a transparent logo and forces the
  // opaque white box the old canvas code drew.
  const hidden = logoFootprint(size, style)

  const dataSegments: string[] = []
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (!matrix.isData(row, col)) continue
      if (hidden?.(row, col)) continue

      dataSegments.push(
        modulePath(style.dotType, {
          x: at(col),
          y: at(row),
          size: moduleSize,
          neighbours: neighboursOf(matrix, row, col)
        })
      )
    }
  }

  const eyeOrigins = [
    { x: at(0), y: at(0) },
    { x: at(size - 7), y: at(0) },
    { x: at(0), y: at(size - 7) }
  ]

  const gradient = style.gradientColor
    ? {
        // Derived from the colours, not just the type, for two reasons: it is
        // stable per palette so React does not churn <defs> on every
        // keystroke, AND `<defs>` ids are document-global — several codes on
        // one page (the preset thumbnails and the preview) would otherwise all
        // resolve `url(#qr-gradient-linear)` to whichever one rendered first.
        id: gradientId(
          idScope,
          style.gradientType,
          style.foregroundColor,
          style.gradientColor
        ),
        type: style.gradientType,
        from: style.foregroundColor,
        to: style.gradientColor
      }
    : undefined

  return {
    extent,
    moduleSize,
    moduleCount: size,
    background: {
      fill: style.backgroundColor,
      radius: style.backgroundRound * (extent / 2)
    },
    dataPath: dataSegments.join(" "),
    eyeFrames: eyeOrigins.map((origin) =>
      eyeFramePath(style.cornerSquareType, { ...origin, module: moduleSize })
    ),
    eyeBalls: eyeOrigins.map((origin) =>
      eyeBallPath(style.cornerDotType, { ...origin, module: moduleSize })
    ),
    gradient,
    logo: style.logo
      ? {
          href: style.logo,
          size: extent * style.logoSize,
          x: (extent - extent * style.logoSize) / 2,
          y: (extent - extent * style.logoSize) / 2
        }
      : undefined,
    ink: gradient ? `url(#${gradient.id})` : style.foregroundColor
  }
}

/** A DOM-safe, collision-free id for a gradient's `<defs>` entry. */
function gradientId(
  scope: string | undefined,
  type: string,
  from: string,
  to: string
): string {
  const safe = (value: string) => value.replace(/[^a-z0-9]/gi, "")
  return [scope && safe(scope), "qr", type, safe(from), safe(to)]
    .filter(Boolean)
    .join("-")
}

/** Which modules the logo covers, with one module of breathing room. */
function logoFootprint(
  size: number,
  style: QrStyle
): ((row: number, col: number) => boolean) | null {
  if (!style.logo) return null

  const covered = Math.ceil(size * style.logoSize) + 2
  const from = Math.floor((size - covered) / 2)
  const to = from + covered

  return (row, col) => row >= from && row < to && col >= from && col < to
}

/**
 * The finished picture: the code, plus whatever surrounds it.
 *
 * Composed rather than baked in, because a frame is pure decoration around a
 * finished symbol — it must not be able to influence how the code is drawn.
 */
export interface QrDocument {
  model: QrModel
  frame: FrameSpec
  layout: FrameLayout
  label: string
  /** Surface and caption colours, derived from the code's own palette. */
  surfaceFill: string
  accent: string
  onAccent: string
}

export function buildDocument(input: {
  model: QrModel
  frameId: FrameId
  label: string
  style: QrStyle
}): QrDocument {
  const frame = frameById(input.frameId)

  return {
    model: input.model,
    frame,
    layout: layoutFrame(frame, input.model.extent),
    label: input.label,
    // The surround borrows the code's own colours so a frame can never
    // introduce a palette the visitor did not choose.
    surfaceFill: input.style.backgroundColor,
    accent: input.style.foregroundColor,
    onAccent: input.style.backgroundColor
  }
}

export function documentToSvg(doc: QrDocument): string {
  const { model, frame, layout, label } = doc
  const inner = modelToSvg(model)
    .replace(/^<svg[^>]*>/, "")
    .replace(/<\/svg>$/, "")

  const surface =
    frame.surface === "none" && !layout.label
      ? ""
      : `<rect x="0" y="0" width="${layout.width}" height="${layout.height}" rx="${frame.radius * model.extent}" fill="${doc.surfaceFill}" ${frame.surface === "outline" ? `stroke="${doc.accent}" stroke-width="${model.extent * 0.012}"` : ""}/>`

  const labelBar = layout.label
    ? `<rect x="${layout.label.x}" y="${layout.label.y}" width="${layout.label.width}" height="${layout.label.height}" fill="${
        frame.labelOnAccent ? doc.accent : "none"
      }"/><text x="${layout.width / 2}" y="${layout.label.y + layout.label.height / 2}" text-anchor="middle" dominant-baseline="central" font-family="system-ui, sans-serif" font-weight="700" font-size="${layout.label.height * 0.46}" letter-spacing="${layout.label.height * 0.06}" fill="${frame.labelOnAccent ? doc.onAccent : doc.accent}">${escapeXml(label)}</text>`
    : ""

  const brackets = layout.brackets
    ? `<path d="${layout.brackets}" fill="none" stroke="${doc.accent}" stroke-width="${model.extent * 0.02}" stroke-linecap="round"/>`
    : ""

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${layout.width}" height="${layout.height}" viewBox="0 0 ${layout.width} ${layout.height}">`,
    surface,
    `<g transform="translate(${layout.qrX},${layout.qrY})">${inner}</g>`,
    labelBar,
    brackets,
    "</svg>"
  ].join("")
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
}

/** The code alone, as a standalone SVG file. */
export function modelToSvg(model: QrModel): string {
  const { extent, background, ink } = model

  const defs = model.gradient
    ? `<defs>${
        model.gradient.type === "radial"
          ? `<radialGradient id="${model.gradient.id}">`
          : `<linearGradient id="${model.gradient.id}" x1="0" y1="0" x2="1" y2="1">`
      }<stop offset="0" stop-color="${model.gradient.from}"/><stop offset="1" stop-color="${model.gradient.to}"/>${
        model.gradient.type === "radial"
          ? "</radialGradient>"
          : "</linearGradient>"
      }</defs>`
    : ""

  const logo = model.logo
    ? `<image href="${model.logo.href}" x="${model.logo.x}" y="${model.logo.y}" width="${model.logo.size}" height="${model.logo.size}" preserveAspectRatio="xMidYMid meet"/>`
    : ""

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${extent}" height="${extent}" viewBox="0 0 ${extent} ${extent}">`,
    defs,
    `<rect width="${extent}" height="${extent}" rx="${background.radius}" fill="${background.fill}"/>`,
    `<path d="${model.dataPath}" fill="${ink}"/>`,
    ...model.eyeFrames.map(
      (d) => `<path d="${d}" fill="${ink}" fill-rule="evenodd"/>`
    ),
    ...model.eyeBalls.map((d) => `<path d="${d}" fill="${ink}"/>`),
    logo,
    "</svg>"
  ].join("")
}
