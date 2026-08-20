import { getTranslations } from "next-intl/server"

import { Faq } from "@/components/shared/Faq"

import { FAQ_KEYS } from "../constants"

/**
 * The local-CV-format guidance, rendered by the suite's shared `Faq`.
 *
 * A SERVER component: this is prose, it never changes after render, and the
 * page it sits on is SEO-critical. The builder above it is the only island
 * that needs to be client-side.
 */
export async function ResumeFaq({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "ResumePage.faq" })

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
