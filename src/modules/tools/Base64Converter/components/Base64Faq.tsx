import { getTranslations } from "next-intl/server"

import { Faq } from "@/components/shared/Faq"

import { FAQ_KEYS } from "../constants"

/**
 * This tool's questions, rendered by the suite's shared `Faq`.
 *
 * The tool owns its CONTENT; the shared component owns the chrome. The route
 * publishes the structured data from the same keys, so the markup and the
 * schema are one source.
 */
export async function Base64Faq({ locale }: { locale: string }) {
  const t = await getTranslations({
    locale,
    namespace: "Base64ConverterPage.faq"
  })

  return (
    <Faq
      locale={locale}
      title={t("title")}
      items={FAQ_KEYS.map((key) => ({
        question: t(`items.${key}.question`),
        answer: t(`items.${key}.answer`)
      }))}
    />
  )
}
