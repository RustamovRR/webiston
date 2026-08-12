import { LIVE_REFRESH_INTERVAL, RETOKENISE_DELAY } from "../constants"

/**
 * How long a re-highlight may wait, for the documents too big to do it live.
 *
 * A plain trailing debounce — which is what this tool shipped with — has a
 * failure mode that only appears when someone types *well*: every keystroke
 * clears the pending timer, so a steady 80ms-per-character typist never lets
 * it fire and the canvas holds the previous text until they stop. The picture
 * IS the editor here and the textarea's own glyphs are transparent, so what
 * that looks like is a caret moving across a blank line.
 *
 * The fix is a ceiling. The delay is still a debounce — a burst collapses into
 * one pass — but it shrinks as the time since the last delivered frame grows,
 * so a repaint lands at least every `LIVE_REFRESH_INTERVAL` no matter how fast
 * the keys come.
 *
 * A CHOICE is not a burst. Picking a theme or a language is one decision and
 * waits for nothing; 120ms of debounce on it was measured as part of the gap
 * between a preset landing and the colours catching up.
 *
 * @param typed         whether the code changed, as opposed to a setting
 * @param sinceDelivery ms since the canvas last received a fresh token set
 */
export function retokeniseDelay(typed: boolean, sinceDelivery: number): number {
  if (!typed) return 0
  const remaining = Math.max(0, LIVE_REFRESH_INTERVAL - sinceDelivery)
  return Math.min(RETOKENISE_DELAY, remaining)
}
