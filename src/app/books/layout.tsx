import { NextIntlClientProvider } from "next-intl"
import { getMessages, setRequestLocale } from "next-intl/server"
import Footer from "@/components/shared/Footer/Footer"
import Header from "@/components/shared/Header/Header"
import { routing } from "@/i18n/routing"

// `/books/**` sits outside the `[locale]` segment and stays Uzbek-only by
// design (CLAUDE.md). Nothing here makes it multilingual: the locale is pinned
// to `routing.defaultLocale`, there is no `/en/books` route, and the Header is
// rendered with `showLanguageSelector={false}`.
//
// What this layout does have to handle is the shared chrome:
//
// 1. `setRequestLocale` — Header and Footer are Server Components that call
//    `useTranslations`. Without it they resolve the locale through `headers()`,
//    which forces all 229 chapters to render on demand.
// 2. `NextIntlClientProvider` — Header also renders `Search` and `ThemeToggle`,
//    which are CLIENT components reading the same message files. With no
//    provider in this subtree they threw "context from NextIntlClientProvider
//    was not found" on every book page; the server render of that subtree failed
//    and React quietly recovered on the client. Prerendering turns that same
//    error into a hard build failure, which is how it surfaced.
//
// Only the two namespaces those client components use are sent — `Search` and
// `Common` — not the whole bundle. Verified by grep: no component reachable from
// `/books` calls `useTranslations` with any other namespace on the client.
const CLIENT_NAMESPACES = ["Search", "Common"] as const

export default async function BooksLayout({
  children
}: {
  children: React.ReactNode
}) {
  setRequestLocale(routing.defaultLocale)

  const messages = await getMessages()
  const clientMessages = Object.fromEntries(
    CLIENT_NAMESPACES.map((ns) => [ns, messages[ns]])
  )

  return (
    <NextIntlClientProvider
      locale={routing.defaultLocale}
      messages={clientMessages}
    >
      <div className="flex min-h-screen flex-col">
        <Header showLanguageSelector={false} />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </NextIntlClientProvider>
  )
}
