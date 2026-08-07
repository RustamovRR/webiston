import { getTranslations } from "next-intl/server"

import { Faq } from "@/components/shared/Faq"

import { FAQ_KEYS } from "../constants/faq"

/**
 * This tool's questions, rendered by the suite's shared `Faq`.
 *
 * A Server Component sibling of the client island, so the answers are in the
 * HTML — which matters here, because "my camera is not working" is the query
 * that brings people and the answer has to be indexable.
 */
export async function CameraFaq({ locale }: { locale: string }) {
  const t = await getTranslations({
    locale,
    namespace: "CameraRecorderPage.faq"
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
