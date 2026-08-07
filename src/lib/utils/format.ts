/**
 * Human-readable formatting for durations and byte sizes.
 *
 * These existed as FIVE separate copies across two tools, and they had drifted:
 *
 *   formatDuration(65)  ->  "01:05"  in useMicrophoneTest
 *                       ->  "1:05"   in AudioGridItem
 *
 * Both render inside the SAME tool, so a recording's duration was shown one way
 * in the list and another in the player. `formatFileSize(0)` was worse — the
 * MicrophoneTest copy had no zero guard, so `Math.log(0)` is `-Infinity` and the
 * output was the literal string "NaN undefined".
 */

/** Placeholder for a value we genuinely do not have. */
const UNKNOWN = "N/A"

const BYTE_UNITS = ["B", "KB", "MB", "GB", "TB"] as const

/**
 * `mm:ss`, or `h:mm:ss` past an hour.
 *
 * Zero-padded on both sides so a list of durations stays column-aligned — the
 * variant that padded only the seconds made "9:05" and "10:05" different widths.
 */
export function formatDuration(seconds?: number | null): string {
  if (seconds == null || !Number.isFinite(seconds) || seconds < 0) {
    return UNKNOWN
  }

  const total = Math.floor(seconds)
  const hrs = Math.floor(total / 3600)
  const mins = Math.floor((total % 3600) / 60)
  const secs = total % 60
  const pad = (n: number) => n.toString().padStart(2, "0")

  // Past an hour, "60:00" would be ambiguous with a one-minute reading.
  return hrs > 0
    ? `${hrs}:${pad(mins)}:${pad(secs)}`
    : `${pad(mins)}:${pad(secs)}`
}

/**
 * Byte count in the largest unit that keeps it readable, to 2 decimal places.
 *
 * Uses 1024, so the units are the binary ones — labelled KB/MB here to match
 * what the rest of the UI already says rather than switching to KiB mid-product.
 */
export function formatFileSize(bytes?: number | null): string {
  if (bytes == null || !Number.isFinite(bytes) || bytes < 0) return UNKNOWN
  // Guard the log: Math.log(0) is -Infinity, which indexed the unit array out of
  // bounds and produced "NaN undefined".
  if (bytes === 0) return `0 ${BYTE_UNITS[0]}`

  const exp = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    BYTE_UNITS.length - 1
  )
  const value = Math.round((bytes / 1024 ** exp) * 100) / 100
  return `${value} ${BYTE_UNITS[exp]}`
}
