/**
 * NewAlphabet module constants.
 */

import { TELEGRAM_CHANNEL_URL } from "@/constants/navigation"

/**
 * The law, as published on lex.uz. Cited from the letter table and the FAQ;
 * one constant so the link cannot drift between them.
 */
export const LAW_URL = "https://lex.uz/uz/docs/8548754"

/** i18n keys under `faq.items`, rendered visibly AND as FAQPage structured data. */
export const FAQ_KEYS = [
  "whenInForce",
  "whatChanged",
  "unicode",
  "howToType",
  "oldDocuments",
  "accuracy"
] as const

/**
 * i18n keys under `letters.notes`, in reading order. `full` leads: someone
 * searching "yangi alifbo" expects to see the alphabet, and the table above
 * shows only the four letters that change. Its order is art. 1 of the law —
 * Ç comes after Ş — typed by hand, because lex.uz's own table has a Cyrillic
 * А in row 1 and a Cyrillic е in "pе".
 */
export const NOTE_KEYS = ["full", "ng", "tutuq", "noC", "lookalike"] as const

/**
 * The dated facts, under `law.<key>` and `law.<key>Value`. Only what the law's
 * own text states — art. 3 gives the programme "ikki oy muddatda" and no start
 * date, so the page says two months and does not compute a deadline.
 */
export const LAW_FACT_KEYS = [
  "signed",
  "inForce",
  "programme",
  "spelling"
] as const

/** A key list drawn under a typing method, derived from the letter table. */
export type KeyboardCodes = "unicode" | "macExtended"

/**
 * The typing guide: per platform, the methods in the order to try them —
 * i18n keys under `keyboard.platforms.<id>.methods.<key>`.
 *
 * Left out on purpose: Alt + 0231-style codes, which cover only ç and ö and
 * type whatever the system's code page puts at that number — a page read on
 * Russian- and Uzbek-locale Windows cannot promise which letter that is. And
 * the Turkish layout on a computer, which gets a warning instead of a slot.
 */
export const KEYBOARD_PLATFORMS: readonly {
  readonly id: string
  readonly methods: readonly {
    readonly key: string
    readonly codes?: KeyboardCodes
  }[]
}[] = [
  {
    id: "windows",
    methods: [{ key: "emojiPanel" }, { key: "word", codes: "unicode" }]
  },
  {
    id: "mac",
    methods: [{ key: "extended", codes: "macExtended" }, { key: "abc" }]
  },
  { id: "phone", methods: [{ key: "turkish" }, { key: "dotless" }] }
]

/**
 * ABC – Extended's dead keys per new letter, keyed by the 1995 spelling;
 * Shift on the second key gives the capital. Read from the layout itself
 * (UCKeyTranslate on macOS, 2026-10-29), not from a cheat sheet: ⌥C then S is
 * U+015F, ⌥B then G is U+011F — the law's code points, not look-alikes.
 */
export const MAC_EXTENDED_KEYS: Readonly<
  Record<string, readonly [string, string]>
> = {
  "g'": ["⌥B", "G"],
  "o'": ["⌥U", "O"],
  sh: ["⌥C", "S"],
  ch: ["⌥C", "C"]
}

/**
 * Where an organisation's request lands: the channel's direct messages.
 * Telegram's monoforum link (`?direct`, core.telegram.org/api/links) takes no
 * `text` parameter, so the card itself says what to write. Metrica's
 * `trackLinks` counts the click as an outbound link, and the suffix keeps it
 * apart from the footer's link to the same channel.
 */
export const ORGANISATIONS_CONTACT_URL = `${TELEGRAM_CHANNEL_URL}?direct`
