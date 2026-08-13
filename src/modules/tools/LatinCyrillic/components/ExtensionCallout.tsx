import { Puzzle } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { EXTENSION_FEATURE_KEYS, EXTENSION_STORE_URL } from "../constants"

/**
 * The extension, offered at the moment it makes sense.
 *
 * Placed BELOW the converter and above the alphabet table: someone who has
 * just pasted text in and copied the result is exactly the person who would
 * rather not come back to this page next time. Above the tool it would be an
 * ad in front of the thing they came for.
 *
 * A Server Component — three sentences and a link, so it costs the client
 * bundle nothing. `rel="noopener"` because it opens in a new tab.
 */
export async function ExtensionCallout({ locale }: { locale: string }) {
  const t = await getTranslations({
    locale,
    namespace: "LatinCyrillicPage.extension"
  })

  return (
    // No width or horizontal padding of its own: the route already wraps this
    // section in the page container, and repeating it inset the card. The top
    // margin is what separates it from the converter — without it the card
    // reads as part of the tool rather than as an aside about it.
    <section>
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Puzzle className="size-5" aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-base text-foreground">
            {t("title")}
          </h2>
          <p className="mt-1 text-muted-foreground text-sm">
            {t("description")}
          </p>
          <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
            {EXTENSION_FEATURE_KEYS.map((key) => (
              <li
                key={key}
                className="flex items-center gap-1.5 text-muted-foreground text-xs"
              >
                <span
                  className="size-1 shrink-0 rounded-full bg-primary"
                  aria-hidden="true"
                />
                {t(`features.${key}`)}
              </li>
            ))}
          </ul>
        </div>

        <a
          href={EXTENSION_STORE_URL}
          target="_blank"
          rel="noopener"
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-md bg-primary px-4 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90"
        >
          {t("cta")}
        </a>
      </div>
    </section>
  )
}
