/**
 * Tool-scoped types.
 */

/** A resolution the visitor can ask the camera for. */
export interface QualityPreset {
  id: string
  width: number
  height: number
}

/**
 * A still frame taken from the preview.
 *
 * Kept separate from a `Recording`: a photo has no duration, and a gallery that
 * models both as one type ends up printing "00:00" under every screenshot.
 */
export interface Snapshot {
  id: string
  filename: string
  url: string
  width: number
  height: number
  size: number
  at: Date
}

/**
 * What the camera is actually doing, as opposed to what it was asked for.
 *
 * Cameras negotiate: ask a 720p webcam for 4K and it returns 1280×720 without
 * complaint. The tool this replaces displayed the REQUEST — so the panel said
 * 1920×1080 over a stream that was nothing of the sort.
 */
export interface CameraSettings {
  width: number | null
  height: number | null
  frameRate: number | null
  facingMode: string | null
}

/**
 * Hardware controls this particular camera exposes.
 *
 * Almost entirely a mobile story: `torch` is the flash, and `zoom` is the real
 * optical or sensor zoom rather than a CSS scale. Both are absent on the
 * average laptop webcam, so every control built on them renders only when
 * `getCapabilities()` says it exists.
 */
export interface CameraCapabilities {
  torch: boolean
  zoom: { min: number; max: number; step: number } | null
}
