/** biome-ignore-all lint/security/noDangerouslySetInnerHtml: JSON-LD has no
 * React equivalent; every payload here is a constant or an i18n string, and
 * `jsonLd()` escapes `<` so a value can never close the script element. */
import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { LocaleMessages } from "@/components/shared/LocaleMessages/LocaleMessages"
import { withLocale } from "@/lib/seo"
// Deep import, NOT `@/modules/tools`. That barrel re-exports all 21 tool
// modules, and every one of them is `'use client'` — so importing through it
// put Base64Converter, CameraRecorder, QrGenerator and eighteen others into
// THIS route's client reference manifest. Measured: 62 app client modules
// before, and the same 62 on every other tool route, because they all import
// the same barrel.
import {
  AlphabetTable,
  ConverterFaq,
  LatinCyrillicPage as LatinCyrillic
} from "@/modules/tools/LatinCyrillic"
import {
  applicationSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  getLatinCyrillicMetadata,
  howToSchema
} from "@/modules/tools/LatinCyrillic/seo"

// Only this tool's namespace reaches the client, plus the shared
// `Common` used by ToolHeader/DualTextPanel. See LocaleMessages.
const TOOL_NAMESPACE = "LatinCyrillicPage"

/**
 * `<` inside a JSON string can close the surrounding `<script>` element — a
 * value containing `</script>` would end the block early and everything after
 * it would parse as markup. Every value here is a hardcoded constant or an
 * i18n string, so there is no injection path today; escaping costs one pass
 * and removes the class of problem rather than the instance.
 */
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
  return withLocale(
    getLatinCyrillicMetadata(locale),
    locale,
    "/tools/latin-cyrillic"
  )
}

export default async function LatinCyrillicPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  // The FAQ schema reads the same messages the visible FAQ renders, so the
  // structured data can never describe a page that does not exist.
  const tFaq = await getTranslations({
    locale,
    namespace: "LatinCyrillicPage.faq"
  })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(applicationSchema) }}
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(howToSchema) }}
      />

      {/* The client island is only the converter. The alphabet table and the
          FAQ are Server Components rendered as siblings, so the static two
          thirds of this page cost no JavaScript. */}
      <LocaleMessages locale={locale} namespaces={[TOOL_NAMESPACE, "Common"]}>
        <LatinCyrillic />
      </LocaleMessages>

      <div className="mx-auto w-full max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <AlphabetTable locale={locale} />
        <ConverterFaq locale={locale} />
      </div>
    </>
  )
}
