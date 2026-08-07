/** biome-ignore-all lint/security/noDangerouslySetInnerHtml: JSON-LD has no
 * React equivalent; every payload here is a constant or an i18n string, and
 * `jsonLd()` escapes `<` so a value can never close the script element. */
import type { Metadata } from "next"
import { getTranslations, setRequestLocale } from "next-intl/server"

import { LocaleMessages } from "@/components/shared/LocaleMessages/LocaleMessages"
import { withLocale } from "@/lib/seo"
// Deep import, NOT `@/modules/tools`. That barrel re-exports all 21 tool
// modules and every one of them is `'use client'`.
import { CameraFaq, CameraRecorder } from "@/modules/tools/CameraRecorder"
import {
  applicationSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  getCameraRecorderMetadata
} from "@/modules/tools/CameraRecorder/seo"

// Only this tool's namespace reaches the client, plus the shared `Common` —
// which now also carries the media permission strings both media tools share.
const TOOL_NAMESPACE = "CameraRecorderPage"

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
    getCameraRecorderMetadata(locale),
    locale,
    "/tools/camera-recorder"
  )
}

export default async function CameraRecorderPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)

  // The FAQ schema reads the same messages `CameraFaq` renders, so the
  // structured data can never describe a page that does not exist.
  const tFaq = await getTranslations({
    locale,
    namespace: "CameraRecorderPage.faq"
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
          `getLocale()`, which returns "uz" on /en/tools/*. */}
      <LocaleMessages locale={locale} namespaces={[TOOL_NAMESPACE, "Common"]}>
        <CameraRecorder />
      </LocaleMessages>
      {/* A Server Component sibling of the client island: the answers are in
          the HTML, which is what the search queries this page ranks for
          actually ask. */}
      <CameraFaq locale={locale} />
    </>
  )
}
