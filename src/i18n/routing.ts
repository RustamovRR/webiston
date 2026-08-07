import { defineRouting } from "next-intl/routing"

import { DEFAULT_LOCALE, LOCALES } from "./locales"

export const routing = defineRouting({
  // The served list lives in `locales.ts`, with the display names the switcher
  // needs. It used to be duplicated here, in `proxy.ts` twice, and inside the
  // switcher itself.
  locales: [...LOCALES],

  defaultLocale: DEFAULT_LOCALE,

  // Only add locale prefix for non-default locales
  localePrefix: "as-needed"
})
