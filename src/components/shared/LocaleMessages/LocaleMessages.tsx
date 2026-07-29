import { NextIntlClientProvider } from "next-intl"
import { getLocale, getMessages } from "next-intl/server"
import type { ReactNode } from "react"

interface LocaleMessagesProps {
  /** Every namespace the CLIENT components in this subtree call
   *  `useTranslations` with. A missing one is a runtime error, not a fallback. */
  namespaces: readonly string[]
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
  children
}: LocaleMessagesProps) {
  // Both read the locale the page already pinned with `setRequestLocale`, so
  // this does not reach for `headers()` and routes stay statically rendered.
  const locale = await getLocale()
  const messages = await getMessages()

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
