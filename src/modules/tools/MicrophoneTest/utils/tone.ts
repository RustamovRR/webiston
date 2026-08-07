/**
 * Playing a test tone out of the speakers.
 *
 * **The half of "my audio is broken" that a microphone test cannot answer.**
 * Someone whose call went wrong does not know whether the fault is input or
 * output, and a level meter can only ever prove the input half. Very often the
 * microphone is fine and the system output is still pointed at an HDMI monitor
 * or a Bluetooth headset that walked out of range.
 *
 * It needs no permission at all, which is why it is also the one thing on the
 * page that still works for a visitor who blocked the microphone.
 *
 * Deliberately a separate, short-lived `AudioContext` from the one the analyser
 * uses: the analyser's context may not exist yet — that is the whole point —
 * and a tone that outlived its own playback would hold an audio device open.
 */

/**
 * A above middle C.
 *
 * A pure sine, so there is nothing to mistake for a rattle in the speaker, and
 * a pitch that every speaker ever made reproduces cleanly — a low tone would
 * be inaudible on a laptop and a high one is unpleasant.
 */
const TONE_HZ = 440

/**
 * Peak gain.
 *
 * 0.18, not 1. A test tone is a full-scale continuous signal and this page is
 * often opened with headphones already on; anything near unity is genuinely
 * unpleasant and, held to the ear, unsafe.
 */
const PEAK_GAIN = 0.18

/** Long enough to be sure you heard it, short enough not to be a nuisance. */
const DURATION_S = 1.1

/**
 * Fade in and out.
 *
 * A tone that starts and stops at full amplitude is a step discontinuity, which
 * is a click — and a click through headphones is exactly what this feature must
 * not produce while telling someone their headphones work.
 */
const FADE_S = 0.04

export type ToneChannel = "left" | "both" | "right"

/**
 * Plays the tone and resolves when it has finished.
 *
 * Must be called from a user gesture: browsers start an `AudioContext` created
 * outside one in `suspended`, and a silent "test" is worse than no test.
 */
export async function playTestTone(channel: ToneChannel): Promise<void> {
  const context = new AudioContext()

  try {
    await context.resume()

    const oscillator = context.createOscillator()
    oscillator.type = "sine"
    oscillator.frequency.value = TONE_HZ

    const gain = context.createGain()
    const panner = context.createStereoPanner()
    // -1 hard left, +1 hard right. Hard, not partial: the question is "does
    // this side make any sound at all", and bleed into the other channel is
    // the one thing that would make the answer useless.
    panner.pan.value = channel === "left" ? -1 : channel === "right" ? 1 : 0

    oscillator.connect(gain)
    gain.connect(panner)
    panner.connect(context.destination)

    const start = context.currentTime
    const end = start + DURATION_S

    gain.gain.setValueAtTime(0, start)
    gain.gain.linearRampToValueAtTime(PEAK_GAIN, start + FADE_S)
    gain.gain.setValueAtTime(PEAK_GAIN, end - FADE_S)
    gain.gain.linearRampToValueAtTime(0, end)

    oscillator.start(start)
    oscillator.stop(end)

    await new Promise<void>((resolve) => {
      oscillator.onended = () => {
        resolve()
      }
    })
  } finally {
    // Closed either way. A leaked context keeps the audio device open, which on
    // some systems is enough to stop another application from using it — the
    // exact failure this page exists to diagnose.
    await context.close()
  }
}

/** Whether this browser can do it at all, checked before offering the control. */
export function canPlayTestTone(): boolean {
  return (
    typeof AudioContext !== "undefined" &&
    typeof AudioContext.prototype.createStereoPanner === "function"
  )
}
