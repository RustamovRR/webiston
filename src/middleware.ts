import createMiddleware from "next-intl/middleware"

export default createMiddleware({
  // A list of all locales that are supported
  locales: ["uz", "en"],

  // Used when no locale matches
  defaultLocale: "uz",

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

    // Set a cookie to remember the previous locale for
    // all requests that have a locale prefix
    "/(uz|en)/:path*",

    // Enable redirects that add a locale prefix to all tools pages
    "/tools/:path*"
  ]
}
