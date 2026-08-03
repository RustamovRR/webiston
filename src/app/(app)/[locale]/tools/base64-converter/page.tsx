/** biome-ignore-all lint/security/noDangerouslySetInnerHtml: JSON-LD has no
 * React equivalent; every payload here is a constant or an i18n string, and
 * `jsonLd()` escapes `<` so a value can never close the script element. */
import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { LocaleMessages } from "@/components/shared/LocaleMessages/LocaleMessages"
import { withLocale } from "@/lib/seo"
// Deep import, NOT `@/modules/tools`. That barrel re-exports all 21 tool
// modules and every one of them is `'use client'`, so importing through it put
// CameraRecorder, QrGenerator and nineteen others into THIS route's client
// reference manifest.
import {
  Base64Converter,
  Base64Faq,
  Base64Reference
} from "@/modules/tools/Base64Converter"
import {
  applicationSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  getBase64ConverterMetadata
} from "@/modules/tools/Base64Converter/seo"

// Only this tool's namespace reaches the client, plus the shared
// `Common` used by ToolHeader/DualTextPanel. See LocaleMessages.
const TOOL_NAMESPACE = "Base64ConverterPage"

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
    getBase64ConverterMetadata(locale),
    locale,
    "/tools/base64-converter"
  )
}

export default async function Base64ConverterPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  // The FAQ schema reads the same messages `Base64Faq` renders, so the
  // structured data can never describe a page that does not exist.
  const tFaq = await getTranslations({
    locale,
    namespace: "Base64ConverterPage.faq"
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

      {/* `locale` is load-bearing: without it LocaleMessages falls back to
          `getLocale()`, which returns "uz" on /en/tools/* — the English page
          then renders the Uzbek UI under an English <title>. */}
      <LocaleMessages locale={locale} namespaces={[TOOL_NAMESPACE, "Common"]}>
        <Base64Converter />
      </LocaleMessages>
      {/* Server Components, siblings of the client island: static prose costs
          no client JavaScript, and the FAQ answers reach the HTML. */}
      <Base64Reference locale={locale} />
      <Base64Faq locale={locale} />
    </>
  )
}
