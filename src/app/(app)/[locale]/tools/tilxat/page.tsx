/** biome-ignore-all lint/security/noDangerouslySetInnerHtml: JSON-LD has no
 * React equivalent; every payload here is a constant or an i18n string, and
 * `jsonLd()` escapes `<` so a value can never close the script element. */

import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { LocaleMessages } from "@/components/shared/LocaleMessages/LocaleMessages"
import { RelatedTools } from "@/components/shared/RelatedTools"
import { withLocale } from "@/lib/seo"
// Deep import, NOT `@/modules/tools`. That barrel re-exports every tool module
// and all of them are `'use client'`.
import {
  DocumentFaq,
  TemplateSwitcher,
  TILXAT_TEMPLATE,
  TilxatTool
} from "@/modules/tools/Documents"
import {
  applicationSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  getTilxatMetadata
} from "@/modules/tools/Documents/templates/tilxat/seo"

// This document's namespace plus the shell's, and the shared `Common`.
const CLIENT_NAMESPACES = ["TilxatPage", "DocumentsShared", "Common"]

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
  return withLocale(getTilxatMetadata(locale), locale, "/tools/tilxat")
}

export default async function TilxatPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  // The FAQ schema reads the same messages `DocumentFaq` renders, so the
  // structured data can never describe a page that does not exist.
  const tFaq = await getTranslations({ locale, namespace: "TilxatPage.faq" })

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
        <TilxatTool>
          <TemplateSwitcher locale={locale} current="tilxat" />
        </TilxatTool>
      </LocaleMessages>
      {/* Server Component, a sibling of the client island. */}
      <DocumentFaq
        locale={locale}
        namespace="TilxatPage"
        keys={TILXAT_TEMPLATE.faqKeys}
      />
      <RelatedTools locale={locale} href="/tools/tilxat" />
    </>
  )
}
