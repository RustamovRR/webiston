import { getTranslations } from "next-intl/server"

import { Faq } from "@/components/shared/Faq"

/**
 * A document's questions — and on these pages the FAQ carries more weight than
 * most: it is where the legal grounding is stated WITH its sources (FK 732/733
 * for the tilxat, MK 160 for the ariza), so the visitor can check the claims
 * rather than trust a web page about the law.
 *
 * Server Component, sibling of the client island; the route publishes the
 * FAQPage schema from the same keys, so the structured data can never describe
 * a page that does not exist.
 */
export async function DocumentFaq({
  locale,
  namespace,
  keys
}: {
  locale: string
  /** The template's namespace, e.g. "TilxatPage". */
  namespace: string
  keys: readonly string[]
}) {
  const t = await getTranslations({ locale, namespace: `${namespace}.faq` })

  return (
    <Faq
      locale={locale}
      title={t("title")}
      items={keys.map((key) => ({
        question: t(`items.${key}.question`),
        answer: t(`items.${key}.answer`)
      }))}
    />
  )
}
