import { setRequestLocale } from "next-intl/server"
import Footer from "@/components/shared/Footer/Footer"
import Header from "@/components/shared/Header/Header"
import { routing } from "@/i18n/routing"

// `/books/**` sits outside the `[locale]` segment — it is Uzbek-only by design
// (see CLAUDE.md). Header/Footer still call `useTranslations`, so without this
// they reach for `headers()` and all 229 chapters render on demand.
export default function BooksLayout({
  children
}: {
  children: React.ReactNode
}) {
  setRequestLocale(routing.defaultLocale)

  return (
    <div className="flex min-h-screen flex-col">
      <Header showLanguageSelector={false} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
