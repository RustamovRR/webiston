import { getTranslations } from "next-intl/server"

import { Faq } from "@/components/shared/Faq"

import { FAQ_KEYS } from "../constants"

/**
 * This tool's questions, rendered by the suite's shared `Faq`.
 *
 * It used to render the shared Radix `FaqAccordion`, and the note above it
 * claimed the six answers were "now visible". They were not: measured on the
 * prerendered HTML with every `<script>` stripped, this page shipped **6 of 6
 * questions and 0 of 6 ANSWERS**, because `AccordionContent` is a
 * `CollapsiblePrimitive.Content` with no `forceMount` and closed content is
 * never rendered. On the site's highest-traffic URL, the `FAQPage` schema was
 * publishing six answers with no on-page counterpart the whole time.
 *
 * The shared `Faq` is a native `<details>`, so the answers are in the document
 * whether a question is open or not — and it still slides, via `.disclosure`.
 */
export async function ConverterFaq({ locale }: { locale: string }) {
  // Explicit locale — see the note in AlphabetTable.
  const t = await getTranslations({
    locale,
    namespace: "LatinCyrillicPage.faq"
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
