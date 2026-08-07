import { getTranslations } from "next-intl/server"

import { Faq } from "@/components/shared/Faq"

import { FAQ_KEYS } from "../constants/faq"

/**
 * This tool's questions, rendered by the suite's shared `Faq`.
 *
 * A Server Component sibling of the client island, so the answers are in the
 * HTML — which matters more here than on most tools, because the questions
 * people arrive with ("why can't my browser hear me") are the search queries
 * that bring them.
 */
export async function MicFaq({ locale }: { locale: string }) {
  const t = await getTranslations({
    locale,
    namespace: "MicrophoneTestPage.faq"
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
