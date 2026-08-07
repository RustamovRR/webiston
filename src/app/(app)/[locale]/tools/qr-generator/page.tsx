/** biome-ignore-all lint/security/noDangerouslySetInnerHtml: JSON-LD has no
 * React equivalent; every payload here is a constant or an i18n string, and
 * `jsonLd()` escapes `<` so a value can never close the script element. */
import type { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"

import { Faq } from "@/components/shared/Faq"
import { LocaleMessages } from "@/components/shared/LocaleMessages/LocaleMessages"
import { faqPageSchema, withLocale } from "@/lib/seo"
// Deep import, NOT `@/modules/tools`. That barrel re-exports all 21 tool
// modules and every one of them is `'use client'`.
import { QrGenerator } from "@/modules/tools/QrGenerator"
import {
  applicationSchema,
  generateBreadcrumbSchema,
  getFaqItems,
  getQrGeneratorMetadata
} from "@/modules/tools/QrGenerator/seo"

// Only this tool's namespace reaches the client, plus the shared
// `Common` used by ToolHeader/ToolPanel. See LocaleMessages.
const TOOL_NAMESPACE = "QrGeneratorPage"

/**
 * `<` inside a JSON string can close the surrounding `<script>` element. Every
 * value here is a constant or an i18n string, so there is no injection path
 * today; escaping removes the class of problem rather than the instance.
 */
function jsonLd(schema: unknown): string {
  return JSON.stringify(schema).replace(/</g, "\\u003c")
}

/**
 * The metadata is per-locale now.
 *
 * It used to be one hardcoded Uzbek object, so this route — the site's second
 * most-visited tool — served `/en` and `/ru` a title and description in a
 * language those visitors had not asked for. `withLocale` puts the canonical,
 * the hreflang set and the share card on top.
 */
export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  return withLocale(
    getQrGeneratorMetadata(locale),
    locale,
    "/tools/qr-generator"
  )
}

export default async function QrGeneratorPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = (await params) || { locale: "uz" }
  setRequestLocale(locale)

  // One array, two consumers: the schema below and the visible section at the
  // bottom. They cannot describe different pages.
  const faqItems = getFaqItems(locale)

  return (
    <>
      {/* Main Application Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(applicationSchema) }}
      />

      {/* FAQ Schema for rich snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(faqPageSchema(faqItems)) }}
      />

      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(generateBreadcrumbSchema(locale))
        }}
      />

      {/* `locale` is load-bearing: without it LocaleMessages falls back to
          `getLocale()`, which returns "uz" on /en/tools/*. */}
      <LocaleMessages locale={locale} namespaces={[TOOL_NAMESPACE, "Common"]}>
        <QrGenerator />
      </LocaleMessages>

      {/* Server-rendered sibling of the client island: the answers reach the
          HTML, which is what the schema above has always claimed. */}
      <Faq locale={locale} items={faqItems} />
    </>
  )
}
