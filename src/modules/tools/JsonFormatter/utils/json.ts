/**
 * Parsing, formatting and — the part that was missing — saying WHERE it broke.
 *
 * Pure on purpose. This used to live inside a `useMemo` in the hook, with
 * `useTranslations` called from the same memo so the translator function was a
 * dependency of the parse. That made the one piece of real logic in the tool
 * both untestable and coupled to the locale.
 *
 * The error mapping returns a KEY, not a sentence. The component translates.
 */

/** Which of the JSON syntax failures this is, for the message. */
export type JsonErrorKind =
  | "unexpectedToken"
  | "unexpectedEnd"
  | "propertyName"
  | "unexpectedString"
  | "missingComma"
  | "missingColon"
  /** Unclassified. The name matches the message key so no mapping is needed. */
  | "invalidJsonFormat"

export interface JsonPosition {
  line: number
  column: number
}

/** What the document contains — the readout a serious formatter shows. */
export interface JsonStats {
  /** Object keys, counted through the whole document. */
  keys: number
  /** Array elements, likewise. */
  items: number
  /** Deepest nesting level. A bare scalar is 0. */
  depth: number
}

export interface JsonAnalysis {
  formatted: string
  minified: string
  isValid: boolean
  /** The parsed document itself — what the tree view walks. */
  value?: unknown
  stats?: JsonStats
  errorKind?: JsonErrorKind
  /** The engine's own words, kept for the ones we do not classify. */
  errorDetail?: string
  /** Where to look. Every serious formatter shows this; ours showed none. */
  position?: JsonPosition
}

const EMPTY: JsonAnalysis = {
  formatted: "",
  minified: "",
  isValid: false
}

/**
 * `JSON.stringify` takes a number of spaces OR a literal string, which is how
 * tab indentation works. `"\t"` must not go through `Number.parseInt`, or it
 * becomes `NaN` and the output silently collapses to one line.
 */
function indentArgument(indent: string): string | number {
  if (indent === "\t") return "\t"
  const spaces = Number.parseInt(indent, 10)
  return Number.isFinite(spaces) ? spaces : 2
}

export function analyseJson(source: string, indent: string): JsonAnalysis {
  if (!source.trim()) return EMPTY

  try {
    const parsed = JSON.parse(source)
    return {
      formatted: JSON.stringify(parsed, null, indentArgument(indent)),
      minified: JSON.stringify(parsed),
      isValid: true,
      value: parsed,
      stats: measure(parsed)
    }
  } catch (error) {
    if (!(error instanceof SyntaxError)) {
      return { ...EMPTY, errorKind: "invalidJsonFormat" }
    }

    return {
      ...EMPTY,
      errorKind: classify(error.message),
      errorDetail: error.message,
      position: locate(error.message, source)
    }
  }
}

/**
 * Map the engine's sentence to one of ours.
 *
 * The inherited version was written against OLD V8 wording and had gone stale:
 * today's engine says "Expected \',\' or \'}\' after property value in JSON" for
 * a missing comma and "Expected \':\' after property name in JSON" for a missing
 * colon — the two mistakes people actually make — and neither matched any
 * pattern, so both fell through to a flat "invalid JSON format".
 *
 * ORDER IS LOAD-BEARING: the missing-colon message also contains the words
 * "property name", so it has to be tested first or it is misreported.
 */
function classify(message: string): JsonErrorKind {
  if (message.includes("Unexpected end")) return "unexpectedEnd"
  if (message.includes("Unexpected token")) return "unexpectedToken"
  if (message.includes("Unexpected string")) return "unexpectedString"
  if (message.includes("after property name")) return "missingColon"
  if (message.includes("after property value")) return "missingComma"
  if (message.includes("Expected ','")) return "missingComma"
  if (message.includes("property name")) return "propertyName"
  return "invalidJsonFormat"
}

/**
 * Turn the engine's character offset into a line and column.
 *
 * Engines disagree on the wording — V8 says "at position 12" and newer builds
 * add "(line 2 column 5)", Firefox says "at line 2 column 5" — so both shapes
 * are read, and the offset is converted ourselves when only that is offered.
 * Columns are 1-based, because that is what an editor's gutter shows.
 */
function locate(message: string, source: string): JsonPosition | undefined {
  const explicit = /line (\d+) column (\d+)/.exec(message)
  if (explicit) {
    return { line: Number(explicit[1]), column: Number(explicit[2]) }
  }

  const offset = /position (\d+)/.exec(message)
  if (!offset) return undefined

  const index = Math.min(Number(offset[1]), source.length)
  const before = source.slice(0, index)
  const lineBreaks = before.split("\n")

  return {
    line: lineBreaks.length,
    column: lineBreaks[lineBreaks.length - 1].length + 1
  }
}

/**
 * One walk over the parsed document.
 *
 * Recursion depth here equals the document's nesting depth, which
 * `JSON.parse` has already survived one line earlier — so any input that
 * reaches this function cannot blow the stack in it.
 */
function measure(value: unknown): JsonStats {
  if (Array.isArray(value)) {
    let keys = 0
    let items = value.length
    let depth = 1
    for (const entry of value) {
      const inner = measure(entry)
      keys += inner.keys
      items += inner.items
      depth = Math.max(depth, 1 + inner.depth)
    }
    return { keys, items, depth }
  }

  if (value !== null && typeof value === "object") {
    const entries = Object.values(value)
    let keys = entries.length
    let items = 0
    let depth = 1
    for (const entry of entries) {
      const inner = measure(entry)
      keys += inner.keys
      items += inner.items
      depth = Math.max(depth, 1 + inner.depth)
    }
    return { keys, items, depth }
  }

  return { keys: 0, items: 0, depth: 0 }
}

/** Size of a result, for the footer. Bytes, not characters — JSON is UTF-8. */
export function byteSize(text: string): number {
  return new TextEncoder().encode(text).length
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(bytes < 10240 ? 2 : 0)} KB`
  }
  // The tool accepts files up to 10 MB; "10240 KB" is a unit failure.
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
