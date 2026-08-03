import { FILE_SIZE_LIMITS } from "@/constants/tools"

/**
 * Tool-scoped constants.
 */

export const CONVERSION_MODES = ["encode", "decode"] as const

/** Value vs whole URL — two standards, not a preference. See `utils/urlCodec`. */
export const URL_SCOPES = ["value", "whole"] as const

export const SUPPORTED_FILE_TYPES = ["text/plain", "application/json"]

/**
 * `FILE_SIZE_LIMITS.TEXT` (1 MB), matching the codec's own input ceiling. The
 * old tool accepted a 10 MB file and then refused the text it had just read
 * with "too long" — two limits that disagreed by a factor of ten.
 */
export const MAX_FILE_BYTES = FILE_SIZE_LIMITS.TEXT

/**
 * Samples, chosen so each one demonstrates a DIFFERENT job: a plain link, a
 * URL that needs its space fixed, a form-encoded query string, a mailto with
 * parameters, and one URL nested inside another as a value.
 */
export const SAMPLE_KEYS = [
  "link",
  "spaces",
  "query",
  "mailto",
  "nested"
] as const

export const SAMPLE_VALUES: Record<(typeof SAMPLE_KEYS)[number], string> = {
  link: "https://webiston.uz/tools/url-encoder",
  spaces: "https://webiston.uz/search?q=hello world&lang=uz",
  query: "name=Ali+Valiyev&city=Toshkent&email=ali%40webiston.uz",
  mailto: "mailto:info@webiston.uz?subject=Savolim bor&body=Assalomu alaykum",
  nested: "https://webiston.uz/go?to=https://webiston.uz/tools&ref=share"
}

/** The questions the page both RENDERS and publishes as structured data. */
export const FAQ_KEYS = ["difference", "plus", "when", "privacy"] as const
