/**
 * Sample texts for demonstration and testing
 * Organized by script type for easy selection
 */
export const SAMPLE_TEXTS = {
  // Uzbek Latin samples
  LATIN_GREETING: "Assalomu alaykum! Bu Lotin-Kirill o'giruvchi vositasi.",
  LATIN_PARAGRAPH:
    "O'zbekiston Respublikasi mustaqil davlat hisoblanadi. Uning poytaxti Toshkent shahri.",

  // Uzbek Cyrillic samples
  CYRILLIC_GREETING: "Ассалому алайкум! Бу Лотин-Кирилл ўгирувчи воситаси.",
  CYRILLIC_PARAGRAPH:
    "Ўзбекистон Республикаси мустақил давлат ҳисобланади. Унинг пойтахти Тошкент шаҳри.",

  // Russian Cyrillic samples (for testing Russian support)
  RUSSIAN_GREETING: "Привет! Это инструмент транслитерации.",
  RUSSIAN_PARAGRAPH:
    "Щедрый юноша съел яйцо. Эта фраза содержит все особые буквы."
} as const

export type SampleTextKey = keyof typeof SAMPLE_TEXTS
