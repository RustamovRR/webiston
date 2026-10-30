import { Building2 } from "lucide-react"
import { getTranslations } from "next-intl/server"

import { ORGANISATIONS_CONTACT_URL } from "../constants"

/**
 * The offer to organisations — a demand test before it is a product.
 *
 * When the law comes into force every organisation's site, channel and forms
 * change; whether any of them would rather have it done for them is what this
 * card asks. The answer arrives as a conversation, not a form: no backend to
 * build until someone writes.
 *
 * Under the extension card on purpose: that one speaks to a person converting
 * their own text, this one to whoever has a whole organisation's worth of it.
 * A Server Component — a heading, two sentences and a link.
 */
export async function OrganisationsCallout({ locale }: { locale: string }) {
  const t = await getTranslations({
    locale,
    namespace: "NewAlphabetPage.organisations"
  })

  return (
    <section className="mt-4">
      <div className="flex flex-col gap-4 rounded-lg border border-border bg-card p-5 sm:flex-row sm:items-center sm:gap-6 sm:p-6">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <Building2 className="size-5" aria-hidden="true" />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="font-semibold text-base text-foreground">
            {t("title")}
          </h2>
          <p className="mt-1 text-muted-foreground text-sm">
            {t("description")}
          </p>
          <p className="mt-3 text-muted-foreground text-xs">{t("hint")}</p>
        </div>

        <a
          href={ORGANISATIONS_CONTACT_URL}
          target="_blank"
          rel="noopener"
          className="inline-flex h-10 shrink-0 items-center justify-center rounded-md bg-primary px-4 font-medium text-primary-foreground text-sm transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {t("cta")}
        </a>
      </div>
    </section>
  )
}
