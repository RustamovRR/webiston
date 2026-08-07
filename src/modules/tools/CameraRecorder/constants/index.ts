import type { QualityPreset } from "../types"

/**
 * Tool-scoped constants.
 */

/**
 * Resolutions worth offering.
 *
 * Four, each of which means something: 480p is what a bad connection falls back
 * to, 720p is what most webcams and every video call actually use, 1080p is the
 * ceiling of a good built-in camera, and 4K is there for the external ones that
 * can do it. Requesting a size a camera cannot produce is not an error — the
 * browser returns the closest it has, which is why the panel shows both.
 */
export const QUALITY_PRESETS: readonly QualityPreset[] = [
  { id: "sd", width: 854, height: 480 },
  { id: "hd", width: 1280, height: 720 },
  { id: "fhd", width: 1920, height: 1080 },
  { id: "uhd", width: 3840, height: 2160 }
]

/** The one everything starts at: universally supported, and the call default. */
export const DEFAULT_PRESET_ID = "hd"

/**
 * How many captures are kept.
 *
 * Photos and videos share the cap because they share the memory: each is a blob
 * behind an object URL, and a 1080p recording is measured in megabytes per
 * minute. The oldest is revoked as it falls off the end.
 */
export const MAX_CAPTURES = 12

/**
 * Frame rate to request.
 *
 * `ideal`, never `exact`. A camera that cannot do 30 will return what it can;
 * an exact constraint would reject the whole stream over a number nobody
 * testing their webcam is choosing deliberately.
 */
export const IDEAL_FRAME_RATE = 30
