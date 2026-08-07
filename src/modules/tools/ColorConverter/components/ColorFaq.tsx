import { getTranslations } from "next-intl/server"

import { Faq } from "@/components/shared/Faq"

import { FAQ_KEYS } from "../constants"

/**
 * This tool's questions, rendered by the suite's shared `Faq`.
 *
 * The split is the composition rule the rest of the suite follows: the tool
 * owns its CONTENT (which keys, in which order, from its own namespace) and
 * the shared component owns the chrome. `page.tsx` publishes the structured
 * data from the same array, so the markup and the schema are one source.
 */
export async function ColorFaq({ locale }: { locale: string }) {
  const t = await getTranslations({
    locale,
    namespace: "ColorConverterPage.faq"
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
