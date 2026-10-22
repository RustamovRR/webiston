/**
 * NewAlphabet module constants.
 */

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
