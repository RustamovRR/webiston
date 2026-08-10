import Link from "next/link"
import { getTranslations } from "next-intl/server"
import { BOOK_SECTIONS, socialLinks } from "@/constants"
import { chromeLinkLocale, Link as I18nLink } from "@/i18n/navigation"
import Logo from "../Header/Logo"

/**
 * Site footer, matching the header/hero system: same 1536px container, same
 * gutter, mono small text for the meta row. Was a single centered row of
 * icons + copyright — no navigation, no identity.
 *
 * Server Component. `getTranslations({ locale })` rather than
 * `useTranslations`: the latter resolved the DEFAULT locale here, so the
 * footer was Uzbek on every `/en` page — the same bug the header carried.
 */
export default async function Footer({ locale }: { locale: string }) {
  const t = await getTranslations({ locale, namespace: "Footer" })
  const tHeader = await getTranslations({ locale, namespace: "Header" })

  return (
    <footer className="border-border border-t">
      <div className="mx-auto w-full max-w-[1536px] px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col justify-between gap-10 md:flex-row">
          {/* Identity */}
          <div className="max-w-sm">
            <Logo locale={locale} />
            <p className="mt-4 text-pretty text-muted-foreground text-sm leading-relaxed">
              {t("tagline")}
            </p>
            <div className="mt-5 flex items-center gap-1">
              {socialLinks.map(({ id, href, icon, label }) => (
                <a
                  key={id}
                  href={href}
                  aria-label={label}
                  title={label}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex size-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Navigation. Books are uz-only routes (plain Link); tools are
              localized (i18n Link) — same split as everywhere else. */}
          <nav className="flex gap-16">
            <div>
              <div className="font-mono text-[11px] text-muted-foreground uppercase tracking-[0.15em]">
                {tHeader("books")}
              </div>
              <ul className="mt-4 space-y-2.5">
                {BOOK_SECTIONS.map(({ id, title }) => (
                  <li key={id}>
                    <Link
                      href={`/books/${id}`}
                      className="text-foreground/80 text-sm transition-colors hover:text-foreground"
                    >
                      {title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className="font-mono text-[11px] text-muted-foreground uppercase tracking-[0.15em]">
                {tHeader("tools")}
              </div>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <I18nLink
                    href="/tools"
                    locale={chromeLinkLocale(locale)}
                    className="text-foreground/80 text-sm transition-colors hover:text-foreground"
                  >
                    {t("allTools")}
                  </I18nLink>
                </li>
              </ul>
            </div>
          </nav>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-2 border-border border-t pt-6 font-mono text-[11px] text-muted-foreground sm:flex-row sm:items-center">
          <span>
            © {new Date().getFullYear()} Webiston · {t("allRightsReserved")}
          </span>
          {/* The extension stores fetch this URL to verify the policy exists,
              and a policy nobody can reach from the site is a policy in name
              only. `Link` from `@/i18n/navigation` keeps the locale prefix. */}
          <I18nLink
            href="/privacy-policy"
            locale={chromeLinkLocale(locale)}
            className="transition-colors hover:text-foreground"
          >
            {t("privacy")}
          </I18nLink>
        </div>
      </div>
    </footer>
  )
}
