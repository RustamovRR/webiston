import { getTranslations } from "next-intl/server"

import { Faq } from "@/components/shared/Faq"

import { FAQ_KEYS } from "../constants"

/**
 * This tool's questions, through the suite's shared `Faq` — a native
 * `<details>`, so every answer is in the document whether it is open or not,
 * which is what lets the FAQPage schema read the same keys honestly.
 */
export async function NewAlphabetFaq({ locale }: { locale: string }) {
  const t = await getTranslations({
    locale,
    namespace: "NewAlphabetPage.faq"
  })

  return (
    <Faq
      locale={locale}
      title={t("title")}
      className="mt-16"
      items={FAQ_KEYS.map((key) => ({
        question: t(`items.${key}.question`),
        answer: t(`items.${key}.answer`)
      }))}
    />
  )
}
