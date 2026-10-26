/** biome-ignore-all lint/security/noDangerouslySetInnerHtml: JSON-LD has no
 * React equivalent; every payload here is a constant or an i18n string, and
 * `jsonLd()` escapes `<` so a value can never close the script element. */

import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { LocaleMessages } from "@/components/shared/LocaleMessages/LocaleMessages"
import { PrivateContent } from "@/components/shared/PrivateContent"
import { RelatedTools } from "@/components/shared/RelatedTools"
import { NEW_ALPHABET_PATH } from "@/constants/ui"
import { withLocale } from "@/lib/seo"
// Deep imports, NOT `@/modules/tools`: that barrel re-exports every tool
// module, all of them `'use client'`.
//
// The converter is the Latin-Cyrillic one. This page is a second front door
// to the same tool — its own heading, letter table and FAQ for the search
// "yangi alifbo" — not a second tool: a visitor here can convert into all
// three alphabets, with files, exceptions and the keyboard shortcuts.
import {
  LatinCyrillicPage as Converter,
  ExtensionCallout
} from "@/modules/tools/LatinCyrillic"
import { LetterTable, NewAlphabetFaq } from "@/modules/tools/NewAlphabet"
import {
  generateApplicationSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  getNewAlphabetMetadata
} from "@/modules/tools/NewAlphabet/seo"

const PATH = NEW_ALPHABET_PATH

// The converter's namespace and the shared `Common` — named as a constant
// because `scripts/i18n-parity.mjs` reads the provided set from it. This
// page's own `NewAlphabetPage` stays on the server: the heading is passed in
// as props, and the table and FAQ are Server Components.
const CLIENT_NAMESPACES = ["LatinCyrillicPage", "Common"]

function jsonLd(schema: unknown): string {
  return JSON.stringify(schema).replace(/</g, "\\u003c")
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  return withLocale(getNewAlphabetMetadata(locale), locale, PATH)
}

export default async function YangiAlifboPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  // The FAQ schema reads the same messages the visible FAQ renders.
  const tFaq = await getTranslations({
    locale,
    namespace: "NewAlphabetPage.faq"
  })
  const tHeader = await getTranslations({
    locale,
    namespace: "NewAlphabetPage.ToolHeader"
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(generateApplicationSchema(locale))
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(generateFAQSchema(tFaq)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(generateBreadcrumbSchema(locale))
        }}
      />

      {/* `locale` is load-bearing: without it LocaleMessages falls back to
          `getLocale()`, which returns "uz" on /en/tools/*. */}
      <PrivateContent>
        <LocaleMessages locale={locale} namespaces={CLIENT_NAMESPACES}>
          <Converter
            page="yangi-alifbo"
            title={tHeader("title")}
            description={tHeader("description")}
          />
        </LocaleMessages>
      </PrivateContent>

      {/* Same order as the Latin-Cyrillic page, so the two siblings read
          alike: the extension, related tools, then the reference table, then
          the FAQ. The extension converts into the new alphabet since 1.1.0,
          so its "stop coming back to this page" is true here too. */}
      <div className="mx-auto w-full max-w-[1536px] px-4 pb-16 sm:px-6 lg:px-8">
        <ExtensionCallout locale={locale} />
        <RelatedTools locale={locale} href={PATH} className="pt-10" />
        <LetterTable locale={locale} />
        <NewAlphabetFaq locale={locale} />
      </div>
    </>
  )
}
