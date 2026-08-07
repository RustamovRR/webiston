/**
 * Search terms for the password generator.
 *
 * Moved out of the route file — every entry the page shipped is still here, in
 * the same order, including the duplicated `"password generator"` and
 * `"password maker"` / `"password creator"` pairs that appear in both the
 * Uzbek and the English block. Nothing was removed; the two head terms the new
 * English and Russian copy is written for (`"strong random password"`,
 * `"надёжный пароль онлайн"`) were added.
 *
 * Two things worth knowing before anyone edits this list:
 *
 * 1. Several entries describe features this tool does not have —
 *    `"bulk password generator"`, `"pronounceable password"` and
 *    `"password strength checker"` (the meter grades the SETTINGS of a password
 *    it generated, it does not audit one you type in). They are kept because
 *    removing them is a deletion and deletions need the owner's approval; see
 *    the note in `schemas.ts` about the matching `featureList` entries.
 * 2. `keywords` has had no effect on Google ranking since 2009. The list is
 *    harmless and it is where our own search index picks terms up, which is the
 *    only reason to keep maintaining it.
 */

// Not `readonly`: Next's `Metadata["keywords"]` takes a mutable `string[]`.
export const PRIMARY_KEYWORDS: string[] = [
  // O'zbek tilida eng ko'p qidirilgan
  "password generator",
  "parol generator",
  "parol yaratuvchi",
  "parol yaratish",
  "parol yasash",
  "parol qilish",
  "xavfsiz parol",
  "kuchli parol",
  "tasodifiy parol",
  "random parol",
  "parol vositasi",
  "parol tool",
  "bepul password generator",
  "onlayn parol generator",
  "parol generatori",
  "secure password",
  "strong password",
  "password maker",
  "password creator",
  "cybersecurity",
  "xavfsizlik vositasi",
  "internet xavfsizligi",
  "account security",
  "hisob xavfsizligi",

  // Ingliz tilida
  "password generator",
  "password generator online",
  "free password generator",
  "secure password generator",
  "strong password generator",
  "strong random password",
  "random password generator",
  "password maker",
  "password creator",
  "password tool",
  "generate password",
  "create password",
  "safe password generator",
  "complex password generator",
  "custom password generator",
  "bulk password generator",
  "memorable password generator",
  "pronounceable password",
  "password strength checker",
  "cybersecurity tool",
  "security password",
  "account protection",
  "online security",
  "password policy",
  "enterprise password",
  "professional password tool",

  // Rus tilida
  "генератор паролей",
  "генератор паролей онлайн",
  "надёжный пароль онлайн",
  "создать пароль",
  "безопасный пароль",
  "сильный пароль",
  "случайный пароль",
  "надежный пароль",
  "сложный пароль",
  "бесплатный генератор паролей",
  "онлайн генератор паролей",
  "инструмент паролей",
  "кибербезопасность",
  "защита аккаунта",
  "интернет безопасность",
  "создание паролей",

  // Long-tail keywords
  "xavfsiz va kuchli parol yaratish vositasi",
  "professional secure password generator free",
  "генератор надежных паролей онлайн бесплатно",
  "webiston password tools",
  "custom length password generator online",
  "memorable secure password creator tool"
]
