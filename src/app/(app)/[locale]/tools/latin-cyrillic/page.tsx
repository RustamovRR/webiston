/** biome-ignore-all lint/security/noDangerouslySetInnerHtml: <explanation> */
import type { Metadata } from "next"
import { setRequestLocale } from "next-intl/server"
import { LocaleMessages } from "@/components/shared/LocaleMessages/LocaleMessages"
import { withLocale } from "@/lib/seo"
import { LatinCyrillic } from "@/modules/tools"
import {
  applicationSchema,
  generateBreadcrumbSchema,
  generateFAQSchema,
  howToSchema,
  latinCyrillicMetadata
} from "@/modules/tools/LatinCyrillic/seo"

// Only this tool's namespace reaches the client, plus the shared
// `Common` used by ToolHeader/ToolPanel. See LocaleMessages.
const TOOL_NAMESPACE = "LatinCyrillicPage"

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  return withLocale(latinCyrillicMetadata, locale, "/tools/latin-cyrillic")
}

export default async function LatinCyrillicPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = (await params) || { locale: "uz" }
  setRequestLocale(locale)

  const faqSchema = generateFAQSchema(locale)
  const breadcrumbSchema = generateBreadcrumbSchema(locale)

  return (
    <>
      {/* Main Application Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(applicationSchema) }}
      />

      {/* FAQ Schema for rich snippets */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* HowTo Schema for file upload guide */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />

      <LocaleMessages namespaces={[TOOL_NAMESPACE, "Common"]}>
        <LatinCyrillic />
      </LocaleMessages>
    </>
  )
}
