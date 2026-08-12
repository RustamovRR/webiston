import { getTranslations } from "next-intl/server"

import { Faq } from "@/components/shared/Faq"

import { FAQ_KEYS } from "../constants"

/**
 * The tilxat's questions — and this tool's FAQ carries more weight than most:
 * it is where the legal grounding (FK 732/733, the ten-BHM written-form
 * threshold, notarisation being optional) is stated with its sources, so the
 * visitor can check the claims rather than trust a web page about the law.
 *
 * Server Component, sibling of the client island; the route publishes the
 * FAQPage schema from the same keys.
 */
export async function TilxatFaq({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "TilxatPage.faq" })

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
