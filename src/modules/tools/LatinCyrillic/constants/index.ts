/**
 * LatinCyrillic module constants
 */

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
  "isFree",
  "accuracy",
  "files",
  "privacy",
  "difference"
] as const

export type FaqKey = (typeof FAQ_KEYS)[number]
