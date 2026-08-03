import { getTranslations } from "next-intl/server"

import { FAQ_KEYS } from "../constants"

/**
 * The FAQ, actually on the page.
 *
 * This shipped as the shared Radix `FaqAccordion`, and the answers were not in
 * the document at all — Radix unmounts closed collapsible content, and nothing
 * opens by default. So the route was publishing four `acceptedAnswer.text`
 * values as `FAQPage` structured data with no on-page counterpart, which is the
 * exact Search guidelines problem the accordion was introduced to fix. (The
 * earlier check only compared the QUESTIONS, which DO render — they live in the
 * trigger.)
 *
 * `forceMount` is NOT the fix, and that is worth writing down: in the installed
 * `@radix-ui/react-collapsible@1.1.20`, `isOpen = context.open || isPresent`
 * (dist/index.mjs:97) with `isPresent` seeded from `forceMount`, so
 * `hidden: !isOpen` (:129) resolves false and every answer would render
 * permanently OPEN on every FAQ on the site.
 *
 * Native `<details>` is the right shape for this content: always in the HTML,
 * collapsed by default, keyboard- and screen-reader-native, works before
 * hydration, and ships zero JavaScript. A Server Component with no client leaf
 * at all.
 */
export async function ColorFaq({ locale }: { locale: string }) {
  const t = await getTranslations({
    locale,
    namespace: "ColorConverterPage.faq"
  })

  return (
    <section className="mx-auto w-full max-w-[1536px] px-4 pt-10 pb-16 sm:px-6 lg:px-8">
      <h2 className="text-balance font-bold text-2xl text-foreground tracking-[-0.01em] sm:text-3xl">
        {t("title")}
      </h2>

      <dl className="mt-6 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {FAQ_KEYS.map((key) => (
          <details key={key} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-base text-foreground transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset">
              <dt className="font-medium">{t(`items.${key}.question`)}</dt>
              <span
                aria-hidden="true"
                className="shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
              >
                ⌄
              </span>
            </summary>
            <dd className="px-5 pb-4 text-muted-foreground text-sm leading-relaxed">
              {t(`items.${key}.answer`)}
            </dd>
          </details>
        ))}
      </dl>
    </section>
  )
}
