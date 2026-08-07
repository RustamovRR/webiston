import { createNavigation } from "next-intl/navigation"
import { routing } from "./routing"

// Lightweight wrappers around Next.js' navigation
// APIs that consider the routing configuration
export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing)

/**
 * What to pass as `Link`'s `locale` prop from the site chrome.
 *
 * Two things collide here and neither is obvious.
 *
 * 1. `Link` resolves the prefix from next-intl's AMBIENT locale, and in the
 *    header and footer that value is the default rather than the request's:
 *    they render from `[locale]/layout.tsx`, whose `setRequestLocale` does not
 *    reach them (each page calls it in its own body, which is why page content
 *    is correct while the chrome is not). This is the same root cause that made
 *    `Header` take `locale` as a prop instead of calling `useTranslations`.
 *    So the chrome has to pass the locale explicitly.
 *
 * 2. But passing it explicitly FORCES the prefix, and `localePrefix` is
 *    `"as-needed"`. Passing `"uz"` produced `/uz/tools` and `/uz` — URLs that
 *    exist only to 307 back to `/tools` and `/`. Measured in the built HTML:
 *    every logo and nav click on the default locale, which is most of the
 *    traffic, would have paid for a redirect. `next-sitemap.config.js` excludes
 *    `/uz/*` for exactly this reason.
 *
 * So: pass it for the prefixed locales, omit it for the default and let the
 * ambient value — which IS the default here — produce the bare path.
 */
export function chromeLinkLocale(locale: string): string | undefined {
  return locale === routing.defaultLocale ? undefined : locale
}
