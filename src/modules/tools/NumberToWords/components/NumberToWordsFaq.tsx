import { getTranslations } from "next-intl/server"

import { Faq } from "@/components/shared/Faq"

import { FAQ_KEYS } from "../constants"

/**
 * This tool's questions, rendered by the suite's shared `Faq`.
 *
 * A Server Component and a sibling of the client island, so none of this prose
 * costs the visitor any JavaScript — and it is the prose that makes the page
 * rank for the queries this tool exists to answer.
 *
 * The tool owns its CONTENT; the shared component owns the chrome. The route
 * publishes the structured data from the same keys.
 */
export async function NumberToWordsFaq({ locale }: { locale: string }) {
  const t = await getTranslations({
    locale,
    namespace: "NumberToWordsPage.faq"
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
