/**
 * Shared plumbing for the two tools that ask the browser for a camera or a
 * microphone.
 *
 * Both of them used to do this work inline, differently, and both got the same
 * things wrong: every `getUserMedia` rejection became one generic "access
 * error", so "you clicked Block", "there is no camera attached" and "Zoom
 * already has it" were indistinguishable — and only one of those three is
 * something the visitor can fix by clicking Allow.
 *
 * Kept DOM-free apart from the two feature checks, so the interesting parts are
 * unit-testable without a browser.
 */

/**
 * Why an attempt to open a device failed, in terms the page can act on.
 *
 * Each of these maps to different advice, which is the entire reason they are
 * separate: a denied permission needs browser instructions, a busy device needs
 * "close the other app", and an insecure context needs a different URL.
 */
export type MediaFailure =
  | "insecureContext"
  | "unsupported"
  | "denied"
  | "notFound"
  | "inUse"
  | "constraints"
  | "unknown"

/**
 * A `getUserMedia` rejection, classified.
 *
 * The names come from the Media Capture spec; the aliases are the older names
 * some browsers still throw, and dropping them is how a "no camera attached"
 * ends up rendered as "permission denied".
 */
export function describeMediaFailure(error: unknown): MediaFailure {
  const name =
    error && typeof error === "object" && "name" in error
      ? String((error as { name: unknown }).name)
      : ""

  switch (name) {
    case "NotAllowedError":
    // Pre-spec Chrome, still seen in the wild.
    case "PermissionDeniedError":
      return "denied"

    case "NotFoundError":
    case "DevicesNotFoundError":
      return "notFound"

    // The device exists and we are allowed to use it, but something else has
    // it open — or the OS refused at the driver level.
    case "NotReadableError":
    case "TrackStartError":
      return "inUse"

    case "OverconstrainedError":
    case "ConstraintNotSatisfiedError":
      return "constraints"

    // Thrown when the page is not a secure context, which we normally catch
    // before ever calling getUserMedia.
    case "SecurityError":
      return "insecureContext"

    default:
      return "unknown"
  }
}

/**
 * Is `getUserMedia` reachable at all?
 *
 * `navigator.mediaDevices` is `undefined` outside a secure context, so on plain
 * HTTP the old code threw a `TypeError` on property access and showed the
 * generic error — the one message that cannot possibly help, because no amount
 * of clicking Allow fixes an `http://` URL.
 */
export function mediaSupport(): MediaFailure | null {
  if (typeof window === "undefined") return "unsupported"
  if (!window.isSecureContext) return "insecureContext"
  if (!navigator.mediaDevices?.getUserMedia) return "unsupported"
  return null
}

/**
 * Container formats, best first.
 *
 * Order is deliberate: Opus in WebM is the best-supported free audio codec and
 * what Chrome and Firefox produce; MP4/AAC is the Safari path. The tool this
 * replaces hardcoded `audio/webm;codecs=opus` and called `new MediaRecorder`
 * with it, so on Safari the constructor threw and recording simply did nothing.
 */
export const AUDIO_MIME_CANDIDATES = [
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/mp4;codecs=mp4a.40.2",
  "audio/mp4",
  "audio/ogg;codecs=opus"
] as const

export const VIDEO_MIME_CANDIDATES = [
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
  "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
  "video/mp4"
] as const

/** The first candidate this browser will actually record, or `null`. */
export function pickRecorderMimeType(
  candidates: readonly string[]
): string | null {
  if (typeof MediaRecorder === "undefined") return null
  for (const candidate of candidates) {
    if (MediaRecorder.isTypeSupported(candidate)) return candidate
  }
  // `null` rather than a guess: passing an unsupported type to the constructor
  // throws, and passing none lets the browser choose its own default.
  return null
}

/** File extension matching a recorder mime type, for the download name. */
export function fileExtensionFor(mimeType: string | null): string {
  if (!mimeType) return "bin"
  if (mimeType.includes("mp4")) return "mp4"
  if (mimeType.includes("ogg")) return "ogg"
  if (mimeType.includes("webm")) return "webm"
  return "bin"
}

/**
 * A filename that sorts chronologically and is legal on every platform.
 *
 * Colons come out of `toISOString` and are illegal in a Windows filename and
 * meaningful to a Mac; both tools stripped them with their own inline regex.
 */
export function timestampedFilename(
  prefix: string,
  extension: string,
  at: Date
): string {
  const stamp = at.toISOString().slice(0, 19).replace(/:/g, "-")
  return `${prefix}-${stamp}.${extension}`
}

/**
 * Level of a time-domain buffer, as dBFS.
 *
 * **The measurement both tools got wrong.** They read `getByteFrequencyData`
 * and computed an "RMS" from it. That buffer holds per-bin magnitudes that the
 * analyser has already converted to decibels, scaled to 0–255 and smoothed —
 * it is not a signal, and the root-mean-square of it is not a level. It moved
 * when you spoke, which is why nobody noticed, but the number meant nothing and
 * the "quality" rating built on top of it meant less.
 *
 * This reads the time domain, which is the actual waveform: samples arrive as
 * bytes centred on 128, so `(sample - 128) / 128` recovers the range -1..1, and
 * the RMS of that is the real level. dBFS because it is the unit every audio
 * tool a developer has ever used reports — 0 is full scale and everything real
 * is negative.
 */
export function levelInDbfs(timeDomain: Uint8Array): number {
  if (timeDomain.length === 0) return SILENCE_DBFS

  let sum = 0
  for (let i = 0; i < timeDomain.length; i++) {
    const sample = (timeDomain[i] - 128) / 128
    sum += sample * sample
  }

  const rms = Math.sqrt(sum / timeDomain.length)
  if (rms <= 0) return SILENCE_DBFS

  return Math.max(SILENCE_DBFS, 20 * Math.log10(rms))
}

/** Peak sample of a time-domain buffer, as dBFS. */
export function peakInDbfs(timeDomain: Uint8Array): number {
  if (timeDomain.length === 0) return SILENCE_DBFS

  let peak = 0
  for (let i = 0; i < timeDomain.length; i++) {
    peak = Math.max(peak, Math.abs(timeDomain[i] - 128) / 128)
  }

  if (peak <= 0) return SILENCE_DBFS
  return Math.max(SILENCE_DBFS, 20 * Math.log10(peak))
}

/**
 * The floor the meter bottoms out at.
 *
 * -60 dBFS, not -Infinity: a meter has to have a bottom to draw, and 60 dB of
 * range is what a hardware level meter shows. Quieter than this is silence as
 * far as a person testing a microphone is concerned.
 */
export const SILENCE_DBFS = -60

/**
 * A sample at or above this counts as clipping.
 *
 * -1 dBFS rather than 0: digital clipping is not a single sample hitting full
 * scale, it is the waveform flattening as it approaches it, and by the time a
 * meter reads exactly 0 the recording is already damaged.
 */
export const CLIPPING_DBFS = -1

/**
 * The environment half of a diagnostic report.
 *
 * **The premium feature nobody in this category ships free.** When a call fails,
 * the vendor's support asks for exactly this: browser, platform, whether the
 * page was secure, which containers the browser can record. People answer it
 * with five screenshots of five panels, or not at all.
 *
 * Shared, because it is identical for both media tools — each appends its own
 * device rows to it. Plain text rather than JSON: it is going into a support
 * form or a chat message, and a wall of braces gets deleted before it is read.
 */
export function environmentReportLines(): string[] {
  // Guarded rather than assumed: this is called from a memo, and a memo runs
  // during render — including a render on the server, if a caller ever places
  // this panel somewhere that prerenders.
  if (typeof navigator === "undefined") return []

  return [
    `User agent: ${navigator.userAgent}`,
    `Platform: ${navigator.platform || "—"}`,
    `Language: ${navigator.language}`,
    `Secure context: ${String(window.isSecureContext)}`,
    `Media support: ${mediaSupport() ?? "ok"}`,
    `Audio recording: ${pickRecorderMimeType(AUDIO_MIME_CANDIDATES) ?? "not supported"}`,
    `Video recording: ${pickRecorderMimeType(VIDEO_MIME_CANDIDATES) ?? "not supported"}`
  ]
}

/**
 * A report, assembled.
 *
 * Sections keep the device rows apart from the environment rows, because the
 * person reading it is scanning for one or the other.
 */
export function formatReport(
  title: string,
  sections: readonly { heading: string; lines: readonly string[] }[]
): string {
  const body = sections
    .filter((section) => section.lines.length > 0)
    .map((section) => `## ${section.heading}\n${section.lines.join("\n")}`)
    .join("\n\n")

  return `# ${title}\n\n${body}\n`
}

/** dBFS to a 0–100 meter position, linear in decibels the way a meter is. */
export function dbfsToPercent(dbfs: number): number {
  if (!Number.isFinite(dbfs)) return 0
  const clamped = Math.max(SILENCE_DBFS, Math.min(0, dbfs))
  return ((clamped - SILENCE_DBFS) / -SILENCE_DBFS) * 100
}
