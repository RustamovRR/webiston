/**
 * Search terms for the JSON formatter.
 *
 * Carried over from the route file unchanged — every entry that lived in the
 * inline `baseMetadata.keywords` array is still here, in the same order, and
 * the language blocks keep their original grouping. The Russian block was
 * already correct to keep: /ru is a served locale (`src/i18n/locales.ts`), so
 * those terms describe a page that now actually exists in Russian.
 *
 * Two terms are ADDED at the end for the Russian and Uzbek phrasings that were
 * missing: a searcher types "json онлайн" far more often than
 * "онлайн json форматтер", and the tree view had no term at all.
 */

// Not `readonly`: Next's `Metadata["keywords"]` takes a mutable `string[]`.
export const PRIMARY_KEYWORDS: string[] = [
  // O'zbek tilida eng ko'p qidirilgan
  "json formatter",
  "json formatlash",
  "json beautify",
  "json validator",
  "json tekshirish",
  "json o'qish",
  "json tuzatish",
  "bepul json formatter",
  "onlayn json formatter",
  "json chiroylash",
  "json pretty print",
  "json minify",
  "json siqish",
  "json viewer",
  "json editor",
  "json parser",
  "json syntax check",
  "json xato aniqlash",
  "json validatsiya",

  // Ingliz tilida
  "json formatter",
  "json beautifier",
  "json validator",
  "json parser",
  "format json online",
  "json pretty print",
  "json minify",
  "free json formatter",
  "online json formatter",
  "json syntax checker",
  "json lint",
  "json viewer",
  "json editor",
  "validate json",
  "json formatter tool",

  // Rus tilida
  "json форматтер",
  "форматирование json",
  "json валидатор",
  "проверка json",
  "онлайн json форматтер",
  "бесплатный json форматтер",
  "json редактор",
  "json парсер",
  "форматировать json",
  "проверить json",

  // Long-tail keywords
  "json formatlash va tekshirish",
  "professional json formatter online",
  "format and validate json free",
  "форматирование и проверка json онлайн",
  "json ma'lumotlarini formatlash",
  "webiston json tools",

  // Added with the per-locale port — see the file header.
  "json онлайн",
  "json daraxt ko'rinishi"
]
