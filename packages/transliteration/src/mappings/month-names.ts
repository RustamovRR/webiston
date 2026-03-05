/**
 * Russian month names to Uzbek Latin mapping
 * Russian months end with ь (soft sign) which should be dropped in Uzbek
 */

export const RUSSIAN_MONTHS_TO_UZBEK: Record<string, string> = {
  // Full month names (Russian → Uzbek Latin)
  январь: "yanvar",
  февраль: "fevral",
  март: "mart",
  апрель: "aprel",
  май: "may",
  июнь: "iyun",
  июль: "iyul",
  август: "avgust",
  сентябрь: "sentabr",
  октябрь: "oktabr",
  ноябрь: "noyabr",
  декабрь: "dekabr",

  // Days of week
  понедельник: "dushanba",
  вторник: "seshanba",
  среда: "chorshanba",
  четверг: "payshanba",
  пятница: "juma",
  суббота: "shanba",
  воскресенье: "yakshanba"
}

/**
 * Check if a word is a Russian month/day name
 */
export function isRussianTimeName(word: string): boolean {
  return word.toLowerCase() in RUSSIAN_MONTHS_TO_UZBEK
}

/**
 * Get Uzbek equivalent of Russian month/day name
 */
export function getRussianTimeNameInUzbek(word: string): string | null {
  return RUSSIAN_MONTHS_TO_UZBEK[word.toLowerCase()] || null
}
