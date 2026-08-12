import {
  BACKGROUND_PRESETS,
  CODE_FONTS,
  type CodeFontId,
  DEFAULT_EXPORT_SCALE,
  DEFAULT_FONT,
  DEFAULT_LANGUAGE,
  DEFAULT_OPTIONS,
  DEFAULT_THEME,
  EXPORT_SCALES,
  type ExportScale,
  FONT_SIZES,
  LINE_HEIGHTS,
  PADDINGS
} from "../constants"
import type { SnapshotOptions, WindowFrame } from "../types"
import { resolveLanguage } from "./highlight"

/**
 * The whole picture in a link.
 *
 * Carbon has this and ray.so has it partly, but the reason to build it is not
 * parity: right now the only way to show someone the image you just made is to
 * send them the PNG. A link lets them open it, change it and make it theirs —
 * and every shared link is a way back into the site.
 *
 * **In the HASH, not the query string.** The hash is never sent to the server,
 * so no CDN or platform limit applies to it, and Next's router does not
 * re-render on a hash change. A query string carrying a few thousand
 * characters of source is how this feature ships broken — a 414 from an edge
 * that nobody can reproduce locally.
 *
 * **Compressed, with the browser's own compressor.** Measured on a realistic
 * 485-character snippet: `encodeURIComponent` of the JSON is **979** chars,
 * `deflate-raw` + base64url is **487** — 2× smaller, and the ratio improves
 * with length. `CompressionStream` is native everywhere current, and the one
 * character of format marker means a browser without it still produces a link
 * every other browser can read.
 */

/** What travels. Short keys, because every byte is in the URL. */
interface ShareState {
  c: string
  l: string
  t: string
  f: string
  s: number
  h: number
  p: number
  w: string
  ti: string
  n: boolean
  fn: number
  bg: string
  fo: number[]
  x: number
}

/** The tool's state, in the shape the hook actually holds it. */
export interface SharedSnapshot {
  code: string
  language: string
  theme: string
  font: CodeFontId
  scale: ExportScale
  options: Omit<SnapshotOptions, "fontFamily">
}

/**
 * A hostile or merely stale link must not be able to hang the tab.
 *
 * The canvas cannot draw much past 3,000 lines anyway (`canvas-limits.ts`), so
 * anything beyond this was never going to become a picture — it would only
 * spend the visitor's first second tokenising something unusable.
 */
const MAX_SHARED_CODE = 100_000

/** `1` — deflate-raw, base64url. `0` — plain, URI-encoded JSON. */
const PACKED = "1"
const PLAIN = "0"

const toBase64Url = (bytes: ArrayBuffer) =>
  btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "")

function fromBase64Url(text: string): Uint8Array {
  const padded = text.replace(/-/g, "+").replace(/_/g, "/")
  const binary = atob(padded)
  return Uint8Array.from(binary, (char) => char.charCodeAt(0))
}

async function through(stream: TransformStream, bytes: Uint8Array) {
  const writer = stream.writable.getWriter()
  void writer.write(bytes)
  void writer.close()
  return new Response(stream.readable).arrayBuffer()
}

/** The fragment for this configuration — no leading `#`. */
export async function encodeSnapshot(
  snapshot: SharedSnapshot
): Promise<string> {
  const { options } = snapshot
  const background =
    BACKGROUND_PRESETS.find(
      (preset) =>
        preset.value.from === options.background.from &&
        preset.value.to === options.background.to
    )?.id ?? BACKGROUND_PRESETS[0].id

  const state: ShareState = {
    c: snapshot.code,
    l: snapshot.language,
    t: snapshot.theme,
    f: snapshot.font,
    s: options.fontSize,
    h: options.lineHeight,
    p: options.padding,
    w: options.frame,
    ti: options.title,
    n: options.showLineNumbers,
    fn: options.firstLineNumber,
    bg: background,
    fo: options.focusLines,
    x: snapshot.scale
  }

  const json = JSON.stringify(state)

  if (typeof CompressionStream === "undefined") {
    return PLAIN + encodeURIComponent(json)
  }
  const packed = await through(
    new CompressionStream("deflate-raw"),
    new TextEncoder().encode(json)
  )
  return PACKED + toBase64Url(packed)
}

/** One of `allowed`, or the fallback. Keeps a hand-edited URL in range. */
function oneOf<T>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.includes(value as T) ? (value as T) : fallback
}

/**
 * Read a fragment back, or `null` if it is not one of ours.
 *
 * NEVER throws and never trusts. Everything here arrives from a URL a
 * stranger may have written, so each field is checked against the set the UI
 * itself offers — a `fontSize` of 40000 would produce a canvas the browser
 * refuses to allocate, and a `focusLines` of `["x"]` would break the layout's
 * `Set` arithmetic in a way that is very hard to trace back to a link.
 */
export async function decodeSnapshot(
  fragment: string
): Promise<SharedSnapshot | null> {
  if (!fragment) return null

  let json: string
  try {
    const marker = fragment[0]
    const body = fragment.slice(1)
    if (marker === PLAIN) {
      json = decodeURIComponent(body)
    } else if (marker === PACKED) {
      if (typeof DecompressionStream === "undefined") return null
      const bytes = await through(
        new DecompressionStream("deflate-raw"),
        fromBase64Url(body)
      )
      json = new TextDecoder().decode(bytes)
    } else {
      return null
    }
  } catch {
    return null
  }

  let state: Partial<ShareState>
  try {
    const parsed: unknown = JSON.parse(json)
    if (!parsed || typeof parsed !== "object") return null
    state = parsed as Partial<ShareState>
  } catch {
    return null
  }

  const code = typeof state.c === "string" ? state.c : ""
  if (!code) return null

  const preset =
    BACKGROUND_PRESETS.find((item) => item.id === state.bg) ??
    BACKGROUND_PRESETS[0]

  return {
    code: code.slice(0, MAX_SHARED_CODE),
    language:
      typeof state.l === "string" ? resolveLanguage(state.l) : DEFAULT_LANGUAGE,
    theme: typeof state.t === "string" ? state.t : DEFAULT_THEME,
    font: oneOf<CodeFontId>(
      state.f,
      CODE_FONTS.map((item) => item.id),
      DEFAULT_FONT
    ),
    scale: oneOf<ExportScale>(state.x, EXPORT_SCALES, DEFAULT_EXPORT_SCALE),
    options: {
      fontSize: oneOf(state.s, FONT_SIZES, DEFAULT_OPTIONS.fontSize),
      lineHeight: oneOf(state.h, LINE_HEIGHTS, DEFAULT_OPTIONS.lineHeight),
      padding: oneOf(state.p, PADDINGS, DEFAULT_OPTIONS.padding),
      frame: oneOf<WindowFrame>(
        state.w,
        ["macos", "plain", "none"],
        DEFAULT_OPTIONS.frame
      ),
      // Trimmed rather than rejected: a title is free text, and the only
      // thing that matters is that it cannot be long enough to widen the
      // card past what the canvas can hold.
      title: typeof state.ti === "string" ? state.ti.slice(0, 120) : "",
      showLineNumbers: state.n === true,
      firstLineNumber:
        typeof state.fn === "number" &&
        Number.isInteger(state.fn) &&
        state.fn > 0
          ? state.fn
          : DEFAULT_OPTIONS.firstLineNumber,
      background: preset.value,
      focusLines: Array.isArray(state.fo)
        ? state.fo.filter(
            (line): line is number =>
              typeof line === "number" && Number.isInteger(line) && line > 0
          )
        : []
    }
  }
}
