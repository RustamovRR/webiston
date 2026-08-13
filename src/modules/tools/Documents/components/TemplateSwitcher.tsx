import { cn } from "@webiston/ui"
import { getTranslations } from "next-intl/server"

import { Link } from "@/i18n/navigation"

import { TEMPLATE_LINKS } from "../templates/links"

/**
 * The document picker — LINKS, not a dropdown, and that is the whole design.
 *
 * A dropdown would leave every document on one URL, and Uzbek document search
 * is document-name-specific: people type "tilxat namunasi" and "ishdan
 * bo'shash arizasi namunasi", never "hujjat namunalari". One page cannot rank
 * for both, so each document keeps its own route, its own title and its own
 * FAQ — and this row is how a visitor who landed on the wrong one gets to the
 * right one without going back to /tools.
 *
 * A Server Component: it renders three links and reads no state, so it costs
 * the client bundle nothing and is crawlable as ordinary markup.
 */
export async function TemplateSwitcher({
  locale,
  current
}: {
  locale: string
  current: string
}) {
  const t = await getTranslations({ locale, namespace: "DocumentsShared" })

  return (
    <nav aria-label={t("switcher.label")} className="mt-6 flex justify-center">
      <ul className="flex flex-wrap gap-2">
        {TEMPLATE_LINKS.map((template) => {
          const active = template.slug === current
          return (
            <li key={template.slug}>
              <Link
                href={template.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "inline-flex items-center rounded-md border px-3 py-1.5 font-medium text-sm transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                {t(`switcher.items.${template.slug}`)}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
