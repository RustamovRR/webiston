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

/** A generated 1200×630 share card — see `src/app/api/og/route.tsx`. */
export function ogCardUrl(title: string, path: string): string {
  return `/api/og?title=${encodeURIComponent(title)}&path=${encodeURIComponent(path)}`
}

const OG_CARD_SIZE = { width: 1200, height: 630 }

/**
 * Overlay the locale- and path-dependent fields onto a page's static metadata.
 *
 * Tool pages carry ~140 lines of hand-written metadata each; almost none of it
 * varies. What does: the canonical, the OpenGraph URL, the OpenGraph locale —
 * and the share card.
 *
 * On the card: every page previously pointed OpenGraph at `/logo.png` while
 * declaring it `1200×630`. The file is actually **1120×1120**, so social
 * platforms laid out a wide card and got a square image. Routing through
 * `/api/og` makes the declared size true, gives each page a titled card
 * instead of the same logo, and drops a 209 KB PNG from every share fetch.
 * Only pages whose `title` is a plain string get one — a templated title
 * object has no single text to draw.
 */
export function withLocale(
  base: Metadata,
  locale: string,
  path: string
): Metadata {
  const titleText = typeof base.title === "string" ? base.title : undefined
  const card = titleText
    ? [{ url: ogCardUrl(titleText, path), ...OG_CARD_SIZE, alt: titleText }]
    : undefined

  return {
    ...base,
    alternates: localeAlternates(locale, path),
    openGraph: base.openGraph && {
      ...base.openGraph,
      url: localeUrl(locale, path),
      locale: OG_LOCALE[locale] ?? OG_LOCALE[routing.defaultLocale],
      alternateLocale: routing.locales
        .filter((l) => l !== locale)
        .map((l) => OG_LOCALE[l]),
      ...(card && { images: card })
    },
    twitter: base.twitter && {
      ...base.twitter,
      ...(titleText && { images: [ogCardUrl(titleText, path)] })
    }
  }
}

/**
 * `FAQPage` structured data from the SAME array the page renders.
 *
 * Every tool route built this inline, and 15 of the 17 published it against a
 * page that showed no FAQ at all — the schema was the only place the questions
 * existed. Taking the items as an argument means the visible section and the
 * markup are one source by construction; they cannot drift apart again.
 */
export const faqPageSchema = (
  items: readonly { question: string; answer: string }[]
) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer
    }
  }))
})
