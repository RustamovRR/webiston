/** biome-ignore-all lint/security/noDangerouslySetInnerHtml: JSON-LD has no
 * React equivalent; every payload here is a constant or an i18n string, and
 * `jsonLd()` escapes `<` so a value can never close the script element. */
import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { LocaleMessages } from "@/components/shared/LocaleMessages/LocaleMessages"
import { withLocale } from "@/lib/seo"
// Deep import, NOT `@/modules/tools`. That barrel re-exports every tool module
// and all of them are `'use client'`.
import {
  ARIZA_TEMPLATE,
  ArizaTool,
  DocumentFaq,
  TemplateSwitcher
} from "@/modules/tools/Documents"
import {
  applicationSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  getArizaMetadata
} from "@/modules/tools/Documents/templates/ariza/seo"

// This document's namespace plus the shell's, and the shared `Common`.
const CLIENT_NAMESPACES = ["ArizaPage", "DocumentsShared", "Common"]

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
    getArizaMetadata(locale),
    locale,
    "/tools/ishdan-boshash-arizasi"
  )
}

export default async function ArizaPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  const tFaq = await getTranslations({ locale, namespace: "ArizaPage.faq" })

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
      <LocaleMessages locale={locale} namespaces={CLIENT_NAMESPACES}>
        <ArizaTool>
          <TemplateSwitcher locale={locale} current="ariza" />
        </ArizaTool>
      </LocaleMessages>
      <DocumentFaq
        locale={locale}
        namespace="ArizaPage"
        keys={ARIZA_TEMPLATE.faqKeys}
      />
    </>
  )
}
