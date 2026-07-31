import { getTranslations } from "next-intl/server"

import { FAQ_KEYS } from "../constants"

/**
 * The FAQ, on the page.
 *
 * These six questions were already being emitted as `FAQPage` structured data
 * on every request — but nowhere in the document. Structured data that has no
 * visible counterpart is a Google guidelines violation, and this is the site's
 * highest-traffic URL. The schema and this component now read the SAME i18n
 * keys, so the two cannot drift apart again.
 *
 * Plain `<details>` rather than the Accordion primitive: it is a Server
 * Component this way, works with JavaScript disabled, and is what a screen
 * reader already understands.
 */
export async function ConverterFaq({ locale }: { locale: string }) {
  // Explicit locale — see the note in AlphabetTable.
  const t = await getTranslations({
    locale,
    namespace: "LatinCyrillicPage.faq"
  })

  return (
    <section className="mt-16">
      <h2 className="text-balance font-bold text-2xl text-foreground tracking-[-0.01em] sm:text-3xl">
        {t("title")}
      </h2>

      <div className="mt-6 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {FAQ_KEYS.map((key) => (
          <details key={key} className="group px-5 py-4">
            <summary // `list-none` + `flex` is what actually removes the disclosure
              // triangle (a flex container renders no ::marker); verified in
              // the browser, listStyleType "none" and marker content "normal".
              className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium text-foreground text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            >
              {t(`items.${key}.question`)}
              <span
                aria-hidden="true"
                className="shrink-0 text-muted-foreground transition-transform duration-200 group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="mt-3 text-pretty text-muted-foreground text-sm leading-relaxed">
              {t(`items.${key}.answer`)}
            </p>
          </details>
        ))}
      </div>
    </section>
  )
}
