/** biome-ignore-all lint/security/noDangerouslySetInnerHtml: JSON-LD has no
 * React equivalent; every payload here is a constant or a locale-keyed string,
 * and `jsonLd()` escapes `<` so a value can never close the script element. */
import type { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"

import { Faq } from "@/components/shared/Faq"
import { LocaleMessages } from "@/components/shared/LocaleMessages/LocaleMessages"
import { faqPageSchema, withLocale } from "@/lib/seo"
// Deep import, NOT `@/modules/tools`. That barrel re-exports all 21 tool
// modules and every one of them is `'use client'`.
import { PasswordGenerator } from "@/modules/tools/PasswordGenerator"
import {
  applicationSchema,
  generateBreadcrumbSchema,
  getFaqItems,
  getPasswordGeneratorMetadata
} from "@/modules/tools/PasswordGenerator/seo"

// Only this tool's namespace reaches the client, plus the shared
// `Common` used by ToolHeader/ToolPanel. See LocaleMessages.
const TOOL_NAMESPACE = "PasswordGeneratorPage"

/**
 * `<` inside a JSON string can close the surrounding `<script>` element. Every
 * value here is a constant or a locale-keyed string, so there is no injection
 * path today; escaping removes the class of problem rather than the instance.
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
    getPasswordGeneratorMetadata(locale),
    locale,
    "/tools/password-generator"
  )
}

export default async function PasswordGeneratorPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = (await params) || { locale: "uz" }
  setRequestLocale(locale)

  // Generate locale-specific schemas
  const faqItems = getFaqItems(locale)
  const faqSchema = faqPageSchema(faqItems)
  const breadcrumbSchema = generateBreadcrumbSchema(locale)

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
        dangerouslySetInnerHTML={{ __html: jsonLd(faqSchema) }}
      />

      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbSchema) }}
      />

      {/* `locale` is load-bearing: without it LocaleMessages falls back to
          `getLocale()`, which returns "uz" on /en/tools/* and /ru/tools/*. */}
      <LocaleMessages locale={locale} namespaces={[TOOL_NAMESPACE, "Common"]}>
        <PasswordGenerator />
      </LocaleMessages>

      {/* Server-rendered sibling of the client island: the answers reach the
          HTML, which is what the schema above has always claimed. */}
      <Faq locale={locale} items={faqItems} />
    </>
  )
}
