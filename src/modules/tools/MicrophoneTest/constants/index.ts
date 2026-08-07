import type { ProcessingOptions } from "../types"

/**
 * Tool-scoped constants.
 */

/**
 * Analyser window size.
 *
 * 2048 samples is about 46ms at 44.1kHz — long enough for a stable level
 * reading and short enough that the meter still feels attached to your voice.
 * It also gives 1024 frequency bins, which is more than a spectrum this size
 * can draw, so the display is never the limiting factor.
 */
export const FFT_SIZE = 2048

/**
 * Analyser smoothing, for the SPECTRUM only.
 *
 * The level meter reads the time domain, which the analyser does not smooth —
 * so the number reacts immediately while the bars stay readable. The old tool
 * smoothed at 0.8 and then measured the smoothed data, which is why its level
 * lagged behind the sound by a visible fraction of a second.
 */
export const SPECTRUM_SMOOTHING = 0.75

/**
 * How long a peak stays on the meter after the sound has gone.
 *
 * 1.2 seconds. A transient — a plosive, a tap on the desk — is over in a few
 * milliseconds, far too fast to read off a moving bar, and it is exactly the
 * thing that clips a recording.
 */
export const PEAK_HOLD_MS = 1200

/**
 * How often the numeric readouts update.
 *
 * The canvas draws every animation frame; the numbers do not need to. At 60Hz
 * a dBFS reading is unreadable anyway, and a `setState` per frame re-renders
 * the whole panel sixty times a second for a number nobody can follow.
 */
export const READOUT_INTERVAL_MS = 80

/**
 * Below this, for this long, and the page offers an explanation.
 *
 * The single most common reason someone opens a microphone test is that a call
 * could not hear them — and the most common cause is a hardware mute switch or
 * the wrong input selected. A silent meter says "no signal"; it should also say
 * what to check.
 */
export const SILENCE_HINT_DBFS = -50
export const SILENCE_HINT_MS = 4000

/**
 * How many recordings are kept.
 *
 * Each one is a blob in memory with an object URL; without a cap a long session
 * of testing quietly grows until the tab is killed. Ten is more than anyone
 * compares at once, and the oldest is revoked rather than merely dropped.
 */
export const MAX_RECORDINGS = 10

/**
 * What the browser is asked to do to the signal by default.
 *
 * All three on, matching what a video call requests — that is the state most
 * people want to hear, because it is the state their calls will use. The point
 * of making them toggles is that turning them OFF is how you find out that
 * noise suppression is what makes your voice sound underwater.
 */
export const DEFAULT_PROCESSING: ProcessingOptions = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true
}
