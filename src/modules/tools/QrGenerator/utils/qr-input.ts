/**
 * Classifying what the visitor pasted.
 *
 * This file used to also hold `buildQrUrl`, which assembled a request to
 * `api.qrserver.com`. The code is drawn in the browser now, so there is no URL
 * to build and no third party to send the payload to.
 */

/** The kinds of payload the tool recognises, for the UI's type badge. */
export type QrInputType =
  | "empty"
  | "url"
  | "email"
  | "phone"
  | "sms"
  | "wifi"
  | "vcard"
  | "location"
  | "text"

const MATCHERS: Array<[QrInputType, RegExp]> = [
  ["url", /^https?:\/\//i],
  ["email", /^mailto:/i],
  ["email", /^[^\s@]+@[^\s@]+\.[^\s@]+$/],
  ["phone", /^tel:/i],
  ["phone", /^\+?[\d\s\-()]{7,}$/],
  ["sms", /^sms:/i],
  ["wifi", /^WIFI:/i],
  ["vcard", /^BEGIN:VCARD/i],
  ["location", /^geo:/i]
]

/**
 * Classify the payload.
 *
 * Matches against the TRIMMED text. The previous version trimmed only for the
 * empty check and then tested the raw string, so a pasted value with a leading
 * space — the single most common way a URL arrives from a clipboard — was
 * classified as plain "text" and lost its badge.
 *
 * Order matters and is deliberate: the bare-email pattern must be tried before
 * the phone pattern, or an address made only of digits and dots would look like
 * a phone number.
 */
export function detectInputType(text: string): QrInputType {
  const value = text?.trim() ?? ""
  if (!value) return "empty"

  for (const [type, pattern] of MATCHERS) {
    if (pattern.test(value)) return type
  }
  return "text"
}
