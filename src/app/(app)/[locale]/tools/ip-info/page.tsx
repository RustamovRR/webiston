/** biome-ignore-all lint/security/noDangerouslySetInnerHtml: JSON-LD has no
 * React equivalent; every payload here is a constant or an i18n string, and
 * `jsonLd()` escapes `<` so a value can never close the script element. */
import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { LocaleMessages } from "@/components/shared/LocaleMessages/LocaleMessages"
import { withLocale } from "@/lib/seo"
// Deep import, NOT `@/modules/tools`. That barrel re-exports all 21 tool
// modules and every one of them is `'use client'`.
import { IpFaq, IpInfo, PrivacyNote } from "@/modules/tools/IpInfo"
import {
  applicationSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  getIpInfoMetadata
} from "@/modules/tools/IpInfo/seo"

// Only this tool's namespace reaches the client, plus the shared `Common`.
const TOOL_NAMESPACE = "IpInfoPage"

/**
 * `<` inside a JSON string can close the surrounding `<script>` element. Every
 * value here is a constant or an i18n string, so there is no injection path
 * today; escaping removes the class of problem rather than the instance.
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
  return withLocale(getIpInfoMetadata(locale), locale, "/tools/ip-info")
}

export default async function IpInfoPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  // The FAQ schema reads the same messages `IpFaq` renders, so the structured
  // data can never describe a page that does not exist.
  const tFaq = await getTranslations({ locale, namespace: "IpInfoPage.faq" })

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
          `getLocale()`, which returns "uz" on /en/tools/*. */}
      <LocaleMessages locale={locale} namespaces={[TOOL_NAMESPACE, "Common"]}>
        <IpInfo />
      </LocaleMessages>
      {/* Server Components, siblings of the client island. The privacy note
          comes FIRST after the data — it is what replaced the fabricated
          security score, and it is the honest half of this page. */}
      <PrivacyNote locale={locale} />
      <IpFaq locale={locale} />
    </>
  )
}
