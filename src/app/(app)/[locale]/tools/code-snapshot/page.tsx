/** biome-ignore-all lint/security/noDangerouslySetInnerHtml: JSON-LD has no
 * React equivalent; every payload here is a constant or an i18n string, and
 * `jsonLd()` escapes `<` so a value can never close the script element. */
import type { Metadata } from "next"
import {
  Fira_Code,
  Geist_Mono,
  IBM_Plex_Mono,
  JetBrains_Mono
} from "next/font/google"
import { setRequestLocale } from "next-intl/server"

import { Faq } from "@/components/shared/Faq"
import { LocaleMessages } from "@/components/shared/LocaleMessages/LocaleMessages"
import { faqPageSchema, withLocale } from "@/lib/seo"
// Deep import, NOT `@/modules/tools`. That barrel re-exports every tool module
// and all of them are `'use client'`.
import { CodeSnapshot } from "@/modules/tools/CodeSnapshot"
import type { CodeFontId } from "@/modules/tools/CodeSnapshot/constants"
import {
  applicationSchema,
  generateBreadcrumbSchema,
  getCodeSnapshotMetadata,
  getFaqItems
} from "@/modules/tools/CodeSnapshot/seo"

const TOOL_NAMESPACE = "CodeSnapshotPage"

/**
 * The four code faces, loaded HERE and nowhere else.
 *
 * `next/font` scopes the `@font-face` rules and the preload hints to the
 * routes that reference the instance, so declaring them in this file is what
 * keeps them off every other page. Putting them in `src/app/layout.tsx` — the
 * obvious place, and where `Inter` lives — would hand all four to all 226 book
 * chapters for a tool none of them opens.
 *
 * `cyrillic` is in every subset list on purpose: the audience writes comments
 * in Cyrillic, and a missing subset renders them as tofu in the export.
 *
 * `display: "block"` rather than `swap`. Everywhere else swap is right, since
 * text that arrives late beats text that arrives never. Here the "text" is a
 * canvas that gets *measured*: painting with the fallback and repainting with
 * the real face would flash a differently-sized picture. The hook waits on
 * `document.fonts.load()` anyway, so the block period is never visible.
 *
 * **The subset list is repeated four times on purpose.** Hoisting it to a
 * `SUBSETS` constant and spreading it fails the build outright — `next/font`
 * is a compile-time transform that reads its arguments statically, so
 * `subsets: [...SUBSETS]` is "Unexpected spread". Same constraint, and the
 * same reason, as the hand-typed locale alternation in `src/proxy.ts`.
 */
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin", "latin-ext", "cyrillic"],
  display: "block"
})
const firaCode = Fira_Code({
  subsets: ["latin", "latin-ext", "cyrillic"],
  display: "block"
})
const geistMono = Geist_Mono({
  subsets: ["latin", "latin-ext", "cyrillic"],
  display: "block"
})
const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "700"],
  display: "block"
})

/**
 * `style.fontFamily`, not `.variable`.
 *
 * The canvas needs a family string it can put straight into `ctx.font`; a CSS
 * custom property would have to be resolved off a DOM node first, and the
 * offscreen canvas the measurer uses is not in the document.
 */
const FONT_FAMILIES: Record<CodeFontId, string> = {
  "jetbrains-mono": jetbrainsMono.style.fontFamily,
  "fira-code": firaCode.style.fontFamily,
  "geist-mono": geistMono.style.fontFamily,
  "ibm-plex-mono": ibmPlexMono.style.fontFamily
}

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
    getCodeSnapshotMetadata(locale),
    locale,
    "/tools/code-snapshot"
  )
}

export default async function CodeSnapshotPage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = (await params) || { locale: "uz" }
  setRequestLocale(locale)

  const faqItems = getFaqItems(locale)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(applicationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(faqPageSchema(faqItems)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd(generateBreadcrumbSchema(locale))
        }}
      />

      <LocaleMessages locale={locale} namespaces={[TOOL_NAMESPACE, "Common"]}>
        <CodeSnapshot fontFamilies={FONT_FAMILIES} />
      </LocaleMessages>

      <Faq locale={locale} items={faqItems} />
    </>
  )
}
