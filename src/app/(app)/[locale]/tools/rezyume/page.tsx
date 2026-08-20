/** biome-ignore-all lint/security/noDangerouslySetInnerHtml: JSON-LD has no
 * React equivalent; every payload here is a constant, and `jsonLd()` escapes
 * `<` so a value can never close the script element. */
import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { LocaleMessages } from "@/components/shared/LocaleMessages/LocaleMessages"
import { withLocale } from "@/lib/seo"
// Deep import, NOT `@/modules/tools`. That barrel re-exports every tool module
// and all of them are `'use client'`.
import { ResumeBuilder, ResumeFaq } from "@/modules/tools/ResumeBuilder"
import {
  applicationSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  getResumeMetadata
} from "@/modules/tools/ResumeBuilder/seo"

// This tool's namespace plus the shared `Common`.
const CLIENT_NAMESPACES = ["ResumePage", "Common"]

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
  return withLocale(getResumeMetadata(locale), locale, "/tools/rezyume")
}

export default async function RezyumePage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  // The FAQ schema reads the same messages `ResumeFaq` renders, so the
  // structured data can never describe an answer the page does not contain.
  const tFaq = await getTranslations({ locale, namespace: "ResumePage.faq" })

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(applicationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(generateBreadcrumbSchema(locale))
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(generateFAQSchema(tFaq)) }}
      />

      {/* `locale` is load-bearing: without it LocaleMessages falls back to
          `getLocale()`, which returns "uz" on /en/tools/*. */}
      <LocaleMessages locale={locale} namespaces={CLIENT_NAMESPACES}>
        <ResumeBuilder />
      </LocaleMessages>

      {/* Below the tool, and a SERVER component: this is the prose Google
          reads and the questions the audience actually types. It needs no
          interactivity, so it costs the page no client JavaScript. */}
      <ResumeFaq locale={locale} />
    </>
  )
}
