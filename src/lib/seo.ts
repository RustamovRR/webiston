import type { Metadata } from "next"
import { routing } from "@/i18n/routing"

/** Canonical origin. Also `metadataBase` in `src/app/layout.tsx`. */
export const SITE_URL = "https://webiston.uz"

/** OpenGraph wants a BCP-47-ish `language_TERRITORY` pair, not a bare locale. */
const OG_LOCALE: Record<string, string> = {
  uz: "uz_UZ",
  en: "en_US"
}

/**
 * Absolute URL for `path` in `locale`.
 *
 * `localePrefix` is `"as-needed"` (`src/i18n/routing.ts`), so the default
 * locale is served unprefixed and every other locale carries its prefix.
 * Getting this wrong is not cosmetic: a canonical pointing at the other
 * locale's URL tells Google the page is a duplicate and drops it.
 */
export function localeUrl(locale: string, path: string): string {
  const suffix = path === "/" ? "" : path
  return locale === routing.defaultLocale
    ? `${SITE_URL}${suffix}`
    : `${SITE_URL}/${locale}${suffix}`
}

/**
 * Self-referencing canonical plus the full hreflang set for a localised page.
 *
 * Every locale's URL is listed on every locale's page — that reciprocity is
 * what makes hreflang valid; a one-way declaration is ignored.
 */
export function localeAlternates(
  locale: string,
  path: string
): Metadata["alternates"] {
  const languages: Record<string, string> = {}
  for (const l of routing.locales) languages[l] = localeUrl(l, path)
  languages["x-default"] = localeUrl(routing.defaultLocale, path)

  return {
    canonical: localeUrl(locale, path),
    languages
  }
}

/**
 * Overlay the locale-dependent fields onto a page's static metadata.
 *
 * Tool pages carry ~140 lines of hand-written metadata each. Only three parts
 * actually vary by locale — the canonical, the OpenGraph URL, and the
 * OpenGraph locale — so this patches those instead of re-authoring the rest.
 */
export function withLocale(
  base: Metadata,
  locale: string,
  path: string
): Metadata {
  return {
    ...base,
    alternates: localeAlternates(locale, path),
    openGraph: base.openGraph && {
      ...base.openGraph,
      url: localeUrl(locale, path),
      locale: OG_LOCALE[locale] ?? OG_LOCALE[routing.defaultLocale],
      alternateLocale: routing.locales
        .filter((l) => l !== locale)
        .map((l) => OG_LOCALE[l])
    }
  }
}
