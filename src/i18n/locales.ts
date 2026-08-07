/**
 * The locales this site serves, and how to name them.
 *
 * One source of truth. Before this the list existed in **three** places —
 * `routing.ts`, `proxy.ts` (twice: the config and the matcher regex) and a
 * hardcoded array inside the language switcher — so adding a language meant
 * finding all four and getting the regex right. That is exactly the shape of
 * change that half-lands.
 *
 * `CATALOGUE` is every locale we know how to *name*; `LOCALES` is what is
 * actually served. Turning one on is adding its code to `LOCALES` and shipping
 * its `messages/**` files — nothing else in `src/` has to change.
 */

export interface LocaleInfo {
  code: string
  /**
   * The language's name IN that language.
   *
   * Endonyms, always: somebody looking for Russian is scanning for "Русский",
   * not for "Rus tili". Every switcher worth copying — GitHub, Stripe, Wikipedia
   * — does it this way, and it is the one label that needs no translation.
   */
  nativeName: string
  /** `<html lang>` and `hreflang`. */
  htmlLang: string
  /** Open Graph's `og:locale`. */
  ogLocale: string
}

/**
 * Deliberately no flags.
 *
 * A flag is a country, not a language, and the mapping is wrong in three ways
 * that all apply here: English is not the United States, Russian in Uzbekistan
 * is spoken by Uzbek citizens rather than by Russia, and Windows ships no
 * regional-indicator glyphs at all — so the previous switcher rendered a pair
 * of letters in a box for every visitor on Windows.
 */
export const CATALOGUE: Record<string, LocaleInfo> = {
  uz: {
    code: "uz",
    nativeName: "O'zbekcha",
    htmlLang: "uz",
    ogLocale: "uz_UZ"
  },
  en: {
    code: "en",
    nativeName: "English",
    htmlLang: "en",
    ogLocale: "en_US"
  },
  /**
   * Served for the shell and the tools only.
   *
   * `/ru/books/*` is deliberately not generated: `content/` holds 226 chapters
   * in Uzbek and the loader has no locale awareness, so a Russian book section
   * would be Uzbek prose under a Russian URL. A locale is either honest
   * everywhere it exists or it should not exist.
   */
  ru: {
    code: "ru",
    nativeName: "Русский",
    htmlLang: "ru",
    ogLocale: "ru_RU"
  }
}

/** What is actually served. Adding a locale is adding it here. */
export const LOCALES = ["uz", "en", "ru"] as const

export type Locale = (typeof LOCALES)[number]

export const DEFAULT_LOCALE: Locale = "uz"

/** `(uz|en)` — the alternation `proxy.ts` needs, built rather than retyped. */
export const LOCALE_PATTERN = LOCALES.join("|")

export function localeInfo(code: string): LocaleInfo {
  return CATALOGUE[code] ?? CATALOGUE[DEFAULT_LOCALE]
}

/** Every served locale, in the order they should appear in a switcher. */
export function servedLocales(): LocaleInfo[] {
  return LOCALES.map((code) => localeInfo(code))
}
