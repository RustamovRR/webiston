import {
  detectUzbekScript,
  isScriptPreference,
  type ScriptPreference,
  type UzbekScript
} from "@webiston/transliteration"

/**
 * The alphabet switch, as the extension's surfaces share it.
 *
 * The POPUP owns the choice and remembers it; the in-page panel and the
 * keyboard shortcut open on whatever it holds. That is the whole reason it is
 * stored: a reader who writes in the 2027 alphabet should select text on any
 * page and get the new alphabet back, not "auto" and a click every time.
 * The panel's own buttons stay a per-panel override — a one-off "this one
 * into Cyrillic" should not quietly change how every later panel opens.
 */

type MessageKey = Parameters<typeof browser.i18n.getMessage>[0]

/** `browser.storage.local` key, beside `theme` and `quickConvertEnabled`. */
const STORAGE_KEY = "scriptPreference"

/**
 * The stored choice, or "auto" when there is none or it is one this build
 * does not know — storage outlives updates, and a value from a newer version
 * must not reach the engine after a rollback.
 */
export async function loadScriptPreference(): Promise<ScriptPreference> {
  const stored = await browser.storage.local.get(STORAGE_KEY)
  const value = stored[STORAGE_KEY]
  return isScriptPreference(value) ? value : "auto"
}

export function saveScriptPreference(preference: ScriptPreference) {
  return browser.storage.local.set({ [STORAGE_KEY]: preference })
}

/**
 * What a panel or the shortcut opens on for THIS text: the stored choice,
 * unless the text is already in that alphabet.
 *
 * The popup is a converter as well as the settings page, so its switch
 * records whatever was last converted there — someone who pressed "Кирилл"
 * once would otherwise get every Cyrillic selection back unchanged, and the
 * shortcut, which has no UI to notice it in, would copy the selection as-is.
 * Falling back to auto in exactly that case keeps what a stored choice is
 * for — the new alphabet, which auto never picks, and "Lotin" taking
 * new-alphabet text back to the 1995 spelling — and changes nothing else:
 * everywhere else auto lands where the stored choice would.
 */
export function openingPreference(
  stored: ScriptPreference,
  text: string
): ScriptPreference {
  if (stored === "auto") return "auto"
  return detectUzbekScript(text) === stored ? "auto" : stored
}

/** Switch labels. The scripts name themselves, as on the web tool. */
export const OPTION_LABEL_KEY: Record<ScriptPreference, MessageKey> = {
  auto: "dirAuto",
  cyrillic: "dirToCyrillic",
  latin: "dirToLatin",
  "latin-2027": "dirToLatin2027"
}

/** The source panel's caption: the alphabet the text was read as. */
export const SOURCE_LABEL_KEY: Record<UzbekScript, MessageKey> = {
  latin: "sourceLatin",
  cyrillic: "sourceCyrillic",
  "latin-2027": "sourceLatin2027"
}

/** The result panel's caption: the alphabet it went into. */
export const RESULT_LABEL_KEY: Record<UzbekScript, MessageKey> = {
  latin: "resultLatin",
  cyrillic: "resultCyrillic",
  "latin-2027": "resultLatin2027"
}
