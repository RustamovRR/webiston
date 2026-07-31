import { FaqAccordion } from "@webiston/ui/composites/FaqAccordion"
import { getTranslations } from "next-intl/server"

import { FAQ_KEYS } from "../constants"

/**
 * The FAQ, on the page.
 *
 * These six questions were already being emitted as `FAQPage` structured data
 * on every request — but nowhere in the document. Structured data with no
 * visible counterpart is a Google guidelines violation, and this is the site's
 * highest-traffic URL. The schema and this component read the SAME i18n keys,
 * so the two cannot drift apart again.
 *
 * This half stays on the server and does the reading; the shared
 * `FaqAccordion` from `@webiston/ui` is the client leaf that opens and closes.
 */
export async function ConverterFaq({ locale }: { locale: string }) {
  // Explicit locale — see the note in AlphabetTable.
  const t = await getTranslations({
    locale,
    namespace: "LatinCyrillicPage.faq"
  })

  const items = FAQ_KEYS.map((key) => ({
    id: key,
    question: t(`items.${key}.question`),
    answer: t(`items.${key}.answer`)
  }))

  return (
    <section className="mt-16">
      <h2 className="text-balance font-bold text-2xl text-foreground tracking-[-0.01em] sm:text-3xl">
        {t("title")}
      </h2>

      <div className="mt-6">
        <FaqAccordion items={items} />
      </div>
    </section>
  )
}
