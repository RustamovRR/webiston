import { describe, expect, it } from "vitest"

import { DEFAULT_LOCALE, LOCALES, localePath } from "./locales"

describe("localePath", () => {
  it("serves the default locale unprefixed — /uz/x is a redirect", () => {
    expect(localePath(DEFAULT_LOCALE, "/tools/yangi-alifbo")).toBe(
      "/tools/yangi-alifbo"
    )
  })

  it.each(LOCALES.filter((locale) => locale !== DEFAULT_LOCALE))(
    "prefixes %s",
    (locale) => {
      expect(localePath(locale, "/extension")).toBe(`/${locale}/extension`)
    }
  )
})
