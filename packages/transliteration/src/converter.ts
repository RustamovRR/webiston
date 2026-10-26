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

import { detectUzbekScript, isCyrillicDominant } from "./detect-script"
import { protectContent } from "./protection"
import {
  type ConversionOptions,
  toCyrillic,
  toLatin,
  toUzbekScript
} from "./transliterate"
import type { TransliterationDirection, UzbekScript } from "./types"

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
  direction: TransliterationDirection,
  options?: ConversionOptions
): string {
  return direction === "latin-to-cyrillic"
    ? toCyrillic(text, options)
    : toLatin(text, options)
}

/**
 * Convert, letting the text pick the direction when the user has not.
 * Returns the direction that was used so the UI can reflect it.
 */
export function convertWithPreference(
  text: string,
  preference: DirectionPreference,
  options?: ConversionOptions
): { text: string; direction: TransliterationDirection } {
  const direction = resolveDirection(text, preference)

  return { text: convert(text, direction, options), direction }
}

/**
 * The distinct spans this text will come back with UNCHANGED.
 *
 * Preserving links, e-mail addresses, code and known technical terms is the
 * engine's most useful behaviour and its least visible one: the user sees
 * `React` survive a conversion and concludes the converter is broken. There is
 * no way to tell "deliberately left alone" from "missed" by looking at the
 * output, so the surface has to say it.
 *
 * De-duplicated and in first-seen order, because this is copy for a human, not
 * a token stream — a document mentioning `GitHub` forty times should read
 * "GitHub", once.
 */
export function findPreservedTerms(
  text: string,
  options?: ConversionOptions
): string[] {
  if (!text) return []

  const seen = new Set<string>()
  const terms: string[] = []

  for (const part of protectContent(text, options?.preserve).protectedParts) {
    const key = part.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    terms.push(part)
  }

  return terms
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

/**
 * The same policy, for the three-alphabet switch.
 *
 * `DirectionPreference` above is the Latin ↔ Cyrillic pair. The 2027 alphabet
 * (Law OʻRQ-1184) made the question "into which alphabet?" rather than "which
 * way?", and the web tool answered it first — in a private copy inside its
 * hook. The extension is the second surface that needs the answer, so it
 * lives here now and both import it.
 */
export type ScriptPreference = "auto" | UzbekScript

/**
 * Every position a switch has, in the order the surfaces show them. Also the
 * whitelist a STORED preference is checked against: localStorage and
 * `browser.storage` outlive deploys, and a value this build does not know must
 * not reach the engine.
 */
export const SCRIPT_PREFERENCES: readonly ScriptPreference[] = [
  "auto",
  "cyrillic",
  "latin",
  "latin-2027"
]

export const isScriptPreference = (value: unknown): value is ScriptPreference =>
  SCRIPT_PREFERENCES.some((option) => option === value)

/**
 * "Auto" is the Latin ↔ Cyrillic flip, by the rule `resolveDirection` uses:
 * Cyrillic text goes to the 1995 Latin, everything else to Cyrillic. The new
 * alphabet is never a guess — until the spelling rules and the transition
 * programme are out, it is something a person picks, not something a surface
 * decides for them.
 */
export function resolveTarget(
  preference: ScriptPreference,
  source: UzbekScript
): UzbekScript {
  if (preference !== "auto") return preference
  return source === "cyrillic" ? "latin" : "cyrillic"
}

/**
 * The alphabet a person converting INTO `target` most likely typed. Names an
 * empty source panel, and is where swap goes when the text was already in the
 * target. "→ Lotin" waits for Cyrillic; the other two wait for the 1995 Latin
 * everybody types today.
 */
export const EXPECTED_SOURCE: Record<UzbekScript, UzbekScript> = {
  cyrillic: "latin",
  latin: "cyrillic",
  "latin-2027": "latin"
}

/**
 * Where swap pins the switch: back to the alphabet the text came from.
 *
 * When the text was ALREADY in the target — "Lotin" pinned over Latin, or a
 * half-converted document that one ğ makes read as new-alphabet — going back
 * is the same position and the button would do nothing, so it goes to the
 * alphabet that target is usually fed from instead.
 */
export function swapTarget(
  source: UzbekScript,
  target: UzbekScript
): UzbekScript {
  return source === target ? EXPECTED_SOURCE[target] : source
}

/**
 * Convert into the alphabet a preference names. Returns what the text was
 * read as and what it went into, so a surface can caption both panels.
 */
export function convertToScript(
  text: string,
  preference: ScriptPreference,
  options?: ConversionOptions
): { text: string; source: UzbekScript; target: UzbekScript } {
  const source = detectUzbekScript(text)
  const target = resolveTarget(preference, source)

  return { text: toUzbekScript(text, target, options), source, target }
}
