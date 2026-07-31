/**
 * The conversion policy, shared by every surface.
 *
 * `toCyrillic` / `toLatin` answer "how do I convert this string". This file
 * answers the question that comes first — "which way?" — and it lives in the
 * package because FOUR places were each answering it differently:
 *
 *   src/modules/tools/LatinCyrillic/hooks/useLatinCyrillic.ts  (the web tool)
 *   apps/extensions/.../popup/App.tsx                          (the popup)
 *   apps/extensions/.../content.ts                             (the popover)
 *   apps/extensions/.../background.ts                          (the context menu)
 *
 * They had drifted. The extension used a three-state preference (auto / to
 * Cyrillic / to Latin) and re-resolved on every keystroke. The web tool used a
 * two-state direction plus a heuristic that only re-detected when the text
 * LENGTH changed by more than five characters, which meant: typing Cyrillic
 * never switched, replacing a selection with the same number of characters
 * never switched, and deleting a paragraph counted as a paste and silently
 * overrode a direction the user had picked by hand.
 *
 * The extension's model was the right one. It is now the only one.
 */

import { isCyrillicDominant } from "./detect-script"
import { toCyrillic, toLatin } from "./transliterate"
import type { TransliterationDirection } from "./types"

/**
 * What the user asked for, which is not the same as what will happen.
 * `"auto"` defers to the text; the other two are an explicit override.
 */
export type DirectionPreference = "auto" | TransliterationDirection

/**
 * Turn a preference into the direction to actually run.
 *
 * Under `"auto"` the text decides, every time it changes — no paste detection,
 * no length deltas, no memory of what the last answer was. Script detection is
 * cheap (it is a scan, and it runs on already-masked text) and being wrong is
 * expensive, because a wrong direction shows the user their own input back.
 */
export function resolveDirection(
  text: string,
  preference: DirectionPreference
): TransliterationDirection {
  if (preference !== "auto") return preference

  return isCyrillicDominant(text) ? "cyrillic-to-latin" : "latin-to-cyrillic"
}

/**
 * Convert in a known direction. The single call site for both scripts, so a
 * caller never has to remember which of `toCyrillic` / `toLatin` matches which
 * direction string — a mapping three of the four surfaces had inlined.
 */
export function convert(
  text: string,
  direction: TransliterationDirection
): string {
  return direction === "latin-to-cyrillic" ? toCyrillic(text) : toLatin(text)
}

/**
 * Convert, letting the text pick the direction when the user has not.
 * Returns the direction that was used so the UI can reflect it.
 */
export function convertWithPreference(
  text: string,
  preference: DirectionPreference
): { text: string; direction: TransliterationDirection } {
  const direction = resolveDirection(text, preference)

  return { text: convert(text, direction), direction }
}

/**
 * The opposite direction, for the swap control.
 *
 * Swap meant three different things across the surfaces: the web tool flipped
 * the direction AND moved the output into the input, the popup exchanged the
 * two text boxes without reconverting (leaving the output pane showing
 * something that was not a conversion of the input), and the popover had no
 * swap at all. Flipping the direction is the part that is genuinely shared;
 * what each surface does with the text stays with that surface.
 */
export function oppositeDirection(
  direction: TransliterationDirection
): TransliterationDirection {
  return direction === "latin-to-cyrillic"
    ? "cyrillic-to-latin"
    : "latin-to-cyrillic"
}
