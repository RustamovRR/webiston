/** biome-ignore-all lint/security/noDangerouslySetInnerHtml: JSON-LD has no
 * React equivalent; every payload here is a constant, and `jsonLd()` escapes
 * `<` so a value can never close the script element. */
import type { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"

import { LocaleMessages } from "@/components/shared/LocaleMessages/LocaleMessages"
import { withLocale } from "@/lib/seo"
// Deep import, NOT `@/modules/tools`. That barrel re-exports every tool module
// and all of them are `'use client'`.
import { ResumeBuilder } from "@/modules/tools/ResumeBuilder"
import {
  applicationSchema,
  generateBreadcrumbSchema,
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

      {/* `locale` is load-bearing: without it LocaleMessages falls back to
          `getLocale()`, which returns "uz" on /en/tools/*. */}
      <LocaleMessages locale={locale} namespaces={CLIENT_NAMESPACES}>
        <ResumeBuilder />
      </LocaleMessages>
    </>
  )
}
