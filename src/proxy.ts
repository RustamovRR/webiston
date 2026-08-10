// `proxy.ts`, not `middleware.ts`: Next 16.3 deprecated the middleware file
// convention and renamed it. The import path stays `next-intl/middleware` —
// that is the library's own entrypoint, unrelated to Next's file name.
import createMiddleware from "next-intl/middleware"

import { DEFAULT_LOCALE, LOCALES } from "./i18n/locales"

export default createMiddleware({
  locales: [...LOCALES],
  defaultLocale: DEFAULT_LOCALE,

  // Disable automatic locale detection
  localeDetection: false,

  // Only add locale prefix for non-default locales
  localePrefix: "as-needed"
})

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Enable a redirect to a matching locale at the root
    "/",

    /**
     * Set a cookie to remember the previous locale for all requests that have
     * a locale prefix.
     *
     * **This one alternation has to be typed by hand.** Next parses `config`
     * statically at build time, so a template literal built from `LOCALES`
     * fails the build outright — which is how this comment came to exist. It
     * is also the place where forgetting a locale fails *silently*: the routes
     * still exist and still render, the middleware simply never runs on them,
     * so the locale cookie is never set. `proxy.test.ts` compares this string
     * against `LOCALES` and fails when they drift.
     */
    "/(uz|en|ru)/:path*",

    /**
     * Every UNPREFIXED route that lives under `[locale]`.
     *
     * `localePrefix: "as-needed"` means the default locale is served without a
     * prefix, so `/tools/json-formatter` has to be rewritten to
     * `/uz/tools/json-formatter` by the middleware. A route missing from this
     * list is not "unprefixed", it is a **404**: nothing rewrites it and no
     * file sits at `app/(app)/<route>`.
     *
     * That is exactly how `/privacy-policy` shipped broken — the page existed
     * and prerendered in all three locales, `/uz/privacy-policy` worked, and
     * the bare URL 404'd. `proxy.test.ts` now derives this list from the
     * filesystem, so the next route added under `[locale]` fails a test
     * instead of a visitor.
     *
     * A catch-all matcher would remove the problem and is what next-intl
     * suggests — but `/books/**` sits OUTSIDE `[locale]` on purpose (226
     * Uzbek-only chapters), and routing it through the locale middleware is
     * precisely what must not happen. Narrow and enumerated is the price of
     * that split.
     */
    "/tools/:path*",
    "/privacy-policy"
  ]
}
