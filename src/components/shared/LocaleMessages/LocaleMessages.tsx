import { NextIntlClientProvider } from "next-intl"
import { getMessages } from "next-intl/server"
import type { ReactNode } from "react"

interface LocaleMessagesProps {
  /** Every namespace the CLIENT components in this subtree call
   *  `useTranslations` with. A missing one is a runtime error, not a fallback. */
  namespaces: readonly string[]
  /**
   * The locale from `params`. REQUIRED.
   *
   * Without it this used to fall back to `getLocale()`, which is measurably
   * wrong on this site: on /en/tools/* it returns "uz" even though
   * `params.locale` is "en", because `setRequestLocale` writes into a
   * React.cache value that `getRequestConfig` does not read back here. The
   * result is an English route rendering the Uzbek bundle.
   *
   * It was optional — "each should start passing it as it is revisited" — and
   * that is exactly how the one route that never got revisited stayed broken:
   * 17 of 18 call sites passed it, `/tools` did not, and `/ru/tools` and
   * `/en/tools` both prerendered the Uzbek `<h1>` in production. An optional
   * prop whose absence is a silent content bug is the wrong shape; required
   * turns it into a compile error, which is the only kind that cannot be
   * forgotten.
   */
  locale: string
  children: ReactNode
}

/**
 * A `NextIntlClientProvider` carrying only the namespaces its subtree uses.
 *
 * `[locale]/layout.tsx` used to hand the client the WHOLE message bundle — all
 * 19 tool namespaces, 91 KB of Uzbek strings, serialised into the HTML of every
 * localised page. `/tools/json-formatter` shipped the strings for the camera
 * recorder, the QR generator and the transliterator.
 *
 * Nesting matters: an inner provider REPLACES the outer one for its subtree, it
 * does not merge. So a subtree's list must name everything it needs, including
 * the shared namespaces (`Common`) that components like `ToolHeader` use.
 */
export async function LocaleMessages({
  namespaces,
  locale,
  children
}: LocaleMessagesProps) {
  const messages = await getMessages({ locale })

  // Naming a namespace that does not exist is silent otherwise: the provider
  // gets `{ Foo: undefined }`, next-intl falls back to printing the key path,
  // and the page still renders and still returns 200. Fail the render — and
  // therefore the prerender, and therefore the build — instead.
  const missing = namespaces.filter((ns) => messages[ns] === undefined)
  if (missing.length) {
    throw new Error(
      `LocaleMessages: namespace(s) not found in the ${locale} bundle: ${missing.join(", ")}. ` +
        "Check messages/ — a typo here ships as visible key paths, not an error."
    )
  }

  const picked = Object.fromEntries(namespaces.map((ns) => [ns, messages[ns]]))

  return (
    <NextIntlClientProvider locale={locale} messages={picked}>
      {children}
    </NextIntlClientProvider>
  )
}
