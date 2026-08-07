/**
 * Tool-scoped types.
 */

/**
 * What the browser is doing to the signal before we ever see it.
 *
 * These are constraints going in and facts coming out: you ask for echo
 * cancellation, and `getSettings()` tells you whether the device and the
 * browser actually applied it. The tool this replaces asked for all three
 * unconditionally and never told anyone — so a microphone that sounded thin in
 * a recording sounded thin for a reason the page was hiding.
 */
export interface ProcessingOptions {
  echoCancellation: boolean
  noiseSuppression: boolean
  autoGainControl: boolean
}

/** A level reading, in the units audio tools actually use. */
export interface LevelReading {
  /** Average level over the last frame, dBFS. */
  rms: number
  /** Loudest sample in the last frame, dBFS. */
  peak: number
  /** Highest peak seen recently, so a transient does not vanish in one frame. */
  hold: number
  /** True while the signal is close enough to full scale to be damaged. */
  clipping: boolean
}

/** Which view the scope is drawing. */
export type ScopeMode = "waveform" | "spectrum"
