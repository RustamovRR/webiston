import { resolveLanguage } from "./highlight"

/**
 * Drop a file on the editor and get its code and its language in one gesture.
 *
 * The extension is better evidence than anything `detect.ts` can infer — it is
 * what the author already declared — so a drop never needs the scorer.
 *
 * **Most of the mapping is Shiki's, not ours.** Shiki's alias table already
 * turns `py` into `python`, `rs` into `rust`, `yml` into `yaml` and 57 others,
 * so `resolveLanguage` does the work and this file only carries the exceptions.
 * Checked on disk: of 71 common extensions, **60 resolve for free**.
 */

/**
 * The extensions Shiki's aliases do NOT cover.
 *
 * Deliberately short. Every entry here is a maintenance cost, so nothing goes
 * in that `resolveLanguage` already answers — and the test asserts exactly
 * that, so the list cannot quietly grow duplicates of Shiki's own table.
 */
const EXTRA_EXTENSIONS: Record<string, string> = {
  h: "c",
  cc: "cpp",
  hpp: "cpp",
  htm: "html",
  pl: "perl",
  ex: "elixir",
  exs: "elixir",
  sol: "solidity",
  env: "dotenv",
  patch: "diff"
}

/** Files whose NAME is the type — no extension to read. */
const BY_FILENAME: Record<string, string> = {
  dockerfile: "docker",
  makefile: "make",
  ".env": "dotenv",
  ".gitignore": "ini"
}

/**
 * How much text is worth accepting.
 *
 * Not an arbitrary round number: past the browser's canvas cap the picture
 * cannot be drawn at all (`canvas-limits.ts`), which lands at roughly 3,000
 * lines. 256 KB is comfortably more source than that, so anything larger was
 * never going to become an image — and reading it in would freeze the tab
 * while the tokeniser walked a file nobody can use.
 */
export const MAX_DROPPED_BYTES = 256 * 1024

/** What a drop can fail with; each maps to a message key under `errors`. */
export type DropFailure = "tooBig" | "notText" | "unreadable"

export interface DroppedFile {
  code: string
  /** Canonical Shiki id, or null when the extension says nothing. */
  language: string | null
  /** Without the extension — a sensible default for the window title. */
  title: string
}

/**
 * The canonical Shiki id for a filename, or `null`.
 *
 * `null` is a real answer: the caller falls back to `detectLanguage` on the
 * contents, which is the right order — a `.txt` holding Python should be read
 * as Python, and the extension has no opinion worth overriding that.
 */
export function languageFromFilename(name: string): string | null {
  const lower = name.toLowerCase()

  const byName = BY_FILENAME[lower]
  if (byName) return byName

  const extension = lower.includes(".") ? lower.split(".").pop() : ""
  if (!extension) return null

  const extra = EXTRA_EXTENSIONS[extension]
  if (extra) return extra

  // `resolveLanguage` answers `text` for anything it does not know, and `text`
  // here would mean "the extension told us it is plain" — which it did not.
  const resolved = resolveLanguage(extension)
  return resolved === "text" ? null : resolved
}

/**
 * A byte that no source file contains.
 *
 * The cheap, reliable binary test. Dropping a PNG otherwise fills the editor
 * with replacement characters and paints a picture of garbage — `File.type` is
 * not enough on its own, because the browser leaves it empty for most of the
 * extensions this tool cares about (`.rs`, `.go`, `.vue` all arrive as `""`).
 */
const NUL = "\u0000"

/**
 * Read a dropped file, or reject with a `DropFailure`.
 *
 * Rejects rather than returning a partial result: every failure here is one
 * the visitor has to be told about, and a silent no-op after dragging a file
 * onto a target that visibly accepted it is the worst of the options.
 */
export async function readDroppedFile(file: File): Promise<DroppedFile> {
  if (file.size > MAX_DROPPED_BYTES) throw new Error("tooBig")

  let text: string
  try {
    text = await file.text()
  } catch {
    throw new Error("unreadable")
  }

  if (text.includes(NUL)) throw new Error("notText")

  return {
    code: text.replace(/\r\n/g, "\n"),
    language: languageFromFilename(file.name),
    title: file.name
  }
}
