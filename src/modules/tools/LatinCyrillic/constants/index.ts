import type { UzbekScript } from "@webiston/transliteration"

import type { ScriptPreference } from "../types"

/**
 * LatinCyrillic module constants
 */

/**
 * The routes this converter is the tool on, and where each one's switch opens.
 *
 * One converter, two front doors. /tools/latin-cyrillic answers the search
 * "lotin kirill", /tools/yangi-alifbo the search "yangi alifbo" — and both
 * offer every alphabet, so neither visitor is sent to the other page to finish
 * the job. Only the first position differs: the new-alphabet page opens on the
 * new alphabet because that is what its visitor came for. Each route
 * remembers its own last choice, so picking "→ Yangi lotin" on one does not
 * change how the other opens.
 */
export const DEFAULT_PREFERENCE = {
  "latin-cyrillic": "auto",
  "yangi-alifbo": "latin-2027"
} as const satisfies Record<string, ScriptPreference>

export type ConverterPage = keyof typeof DEFAULT_PREFERENCE

/**
 * Every position the alphabet switch has, in the order it shows them. Also
 * the whitelist a stored preference is checked against: localStorage outlives
 * deploys, and a value this build does not know must not reach the engine.
 */
export const SCRIPT_PREFERENCES: readonly ScriptPreference[] = [
  "auto",
  "cyrillic",
  "latin",
  "latin-2027"
]

/** The message key that names each alphabet: `latin-2027` is not a key. */
export const SCRIPT_LABEL_KEY: Record<UzbekScript, string> = {
  latin: "latin",
  "latin-2027": "latin2027",
  cyrillic: "cyrillic"
}

/**
 * The one sample, offered inline in the empty source panel.
 *
 * There used to be four behind a dropdown labelled "Namuna matnlar", plus two
 * Russian ones with no UI path at all. A first-time visitor does not open a
 * dropdown to find out what a tool does — they need one thing to click, where
 * they are already looking. Latin is the right default: the tool opens in
 * Latin → Cyrillic, and it is the script most visitors arrive typing.
 */
export const SAMPLE_TEXT =
  "Assalomu alaykum! O'zbekiston — go'zal mamlakat. Bugun Toshkent shahrida ishchilar san'at va madaniyat haqida suhbatlashdi."

/**
 * Files we can actually read in the browser.
 *
 * The limit is 10 MB, not the 200 MB that used to be here (and that the FAQ
 * structured data published to Google). A 200 MB PDF has to be read into an
 * ArrayBuffer and parsed on the main thread — it exhausts the tab long before
 * it finishes. 10 MB of text is roughly 2,000 pages, which is past any real
 * use of this tool.
 */
export const MAX_FILE_SIZE_MB = 10
export const MAX_FILE_SIZE = MAX_FILE_SIZE_MB * 1024 * 1024
export const SUPPORTED_EXTENSIONS = [".txt", ".pdf", ".docx"] as const

/**
 * The Latin ↔ Cyrillic correspondence, in the official alphabet order.
 *
 * This replaces six "info cards" whose content was either a restatement of the
 * buttons above them or unsourced statistics. It is also what people search
 * for next to this tool ("lotin kirill alifbo jadvali"), and it renders on the
 * server with no JavaScript.
 *
 * `note` marks the rows where the mapping is not one-to-one — the only rows a
 * reader needs to stop at. Its value is an i18n key under `table.notes`.
 */
export interface AlphabetRow {
  latin: string
  cyrillic: string
  note?: string
}

export const ALPHABET_ROWS: readonly AlphabetRow[] = [
  { latin: "A a", cyrillic: "А а" },
  { latin: "B b", cyrillic: "Б б" },
  { latin: "D d", cyrillic: "Д д" },
  { latin: "E e", cyrillic: "Э э / Е е", note: "e" },
  { latin: "F f", cyrillic: "Ф ф" },
  { latin: "G g", cyrillic: "Г г" },
  { latin: "H h", cyrillic: "Ҳ ҳ", note: "hx" },
  { latin: "I i", cyrillic: "И и" },
  { latin: "J j", cyrillic: "Ж ж" },
  { latin: "K k", cyrillic: "К к" },
  { latin: "L l", cyrillic: "Л л" },
  { latin: "M m", cyrillic: "М м" },
  { latin: "N n", cyrillic: "Н н" },
  { latin: "O o", cyrillic: "О о" },
  { latin: "P p", cyrillic: "П п" },
  { latin: "Q q", cyrillic: "Қ қ" },
  { latin: "R r", cyrillic: "Р р" },
  { latin: "S s", cyrillic: "С с" },
  { latin: "T t", cyrillic: "Т т" },
  { latin: "U u", cyrillic: "У у" },
  { latin: "V v", cyrillic: "В в" },
  { latin: "X x", cyrillic: "Х х", note: "hx" },
  { latin: "Y y", cyrillic: "Й й" },
  { latin: "Z z", cyrillic: "З з" },
  { latin: "O' o'", cyrillic: "Ў ў" },
  { latin: "G' g'", cyrillic: "Ғ ғ" },
  { latin: "Sh sh", cyrillic: "Ш ш", note: "sh" },
  { latin: "Ch ch", cyrillic: "Ч ч", note: "sh" },
  { latin: "Ng ng", cyrillic: "Нг нг" },
  { latin: "'", cyrillic: "Ъ ъ", note: "apostrophe" }
]

/**
 * Combinations that have no single-letter Latin form. Shown beside the table
 * because they are the second thing anyone looks for.
 */
export const COMPOUND_ROWS: readonly AlphabetRow[] = [
  { latin: "Ya ya", cyrillic: "Я я" },
  { latin: "Yo yo", cyrillic: "Ё ё" },
  { latin: "Yu yu", cyrillic: "Ю ю" },
  { latin: "Ye ye", cyrillic: "Е е" },
  { latin: "Ts ts", cyrillic: "Ц ц", note: "ts" }
]

/** i18n keys under `faq.items`, rendered visibly AND as FAQPage structured data. */
export const FAQ_KEYS = [
  "howToUse",
  "newAlphabet",
  "isFree",
  "accuracy",
  "files",
  "privacy",
  "difference"
] as const

export type FaqKey = (typeof FAQ_KEYS)[number]

/* `EXTENSION_STORES` and `EXTENSION_FEATURE_KEYS` moved to
 * `src/constants/extension.ts` when `/extension` became their second
 * consumer — the promotion this file predicted. §14. */
