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

    // Enable redirects that add a locale prefix to all tools pages
    "/tools/:path*"
  ]
}
