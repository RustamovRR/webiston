import type { QrCustomization, QrErrorLevel, QrSize } from "../types"

/**
 * The two pure pieces of the QR tool: what the user typed, and the URL we ask
 * the QR service for. Both lived inside `useCallback`s in the hook, so neither
 * could be tested.
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

const QR_SERVICE = "https://api.qrserver.com/v1/create-qr-code/"

/**
 * The QR service URL for a payload.
 *
 * Returns "" for blank input so callers can treat "nothing to show" as falsy
 * rather than requesting a QR code of an empty string.
 */
export function buildQrUrl(
  text: string,
  size: QrSize,
  errorCorrectionLevel: QrErrorLevel,
  custom: Pick<
    QrCustomization,
    "margin" | "foregroundColor" | "backgroundColor"
  >
): string {
  if (!text?.trim()) return ""

  const params = new URLSearchParams({
    size: `${size}x${size}`,
    data: text,
    ecc: errorCorrectionLevel,
    format: "png",
    margin: String(custom.margin),
    // The service wants bare hex, no leading '#'.
    color: custom.foregroundColor.replace("#", ""),
    bgcolor: custom.backgroundColor.replace("#", "")
  })

  return `${QR_SERVICE}?${params.toString()}`
}
