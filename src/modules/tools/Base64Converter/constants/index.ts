import {
  BASE64_SUPPORTED_IMAGE_TYPES,
  BASE64_SUPPORTED_TEXT_TYPES,
  FILE_SIZE_LIMITS
} from "@/constants/tools"

/**
 * Tool-scoped constants.
 *
 * The three lists below were re-declared inside the hook while these exact
 * names already sat in `src/constants/tools.ts`, unused by anything — so the
 * app-wide limit said 1 MB for text and the tool enforced 10 MB for everything.
 * One definition, imported.
 */

export const SUPPORTED_TEXT_TYPES = BASE64_SUPPORTED_TEXT_TYPES
export const SUPPORTED_IMAGE_TYPES = BASE64_SUPPORTED_IMAGE_TYPES

/**
 * Encoding a file means reading all of it into a string, so the ceiling is
 * about the browser tab, not about politeness. `FILE_SIZE_LIMITS.JSON` is the
 * app's existing 10 MB bound.
 */
export const MAX_FILE_BYTES = FILE_SIZE_LIMITS.JSON

/** The two directions, in the order they are offered. */
export const CONVERSION_MODES = ["encode", "decode"] as const

/**
 * Sample inputs, as PLAIN text only.
 *
 * The encoded halves used to be a second hand-written table sitting beside
 * this one — four base64 strings maintained by hand, which is a table that can
 * disagree with itself. They are derived now, so a sample cannot decode to
 * something other than the sample it came from.
 */
export const SAMPLE_KEYS = ["greeting", "json", "url", "email"] as const

export const SAMPLE_TEXTS: Record<(typeof SAMPLE_KEYS)[number], string> = {
  greeting: "Assalomu alaykum, Webiston!",
  json: '{"ism": "Ali", "yosh": 25, "shahar": "Toshkent"}',
  url: "https://webiston.uz/tools/base64-converter",
  email: "info@webiston.uz"
}

/** How long a copy button says "copied". */
export const COPIED_FEEDBACK_MS = 2000

/** The questions the page both RENDERS and publishes as structured data. */
export const FAQ_KEYS = ["what", "urlSafe", "files", "privacy"] as const
