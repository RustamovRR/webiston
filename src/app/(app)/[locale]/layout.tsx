import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { notFound } from "next/navigation"
import { hasLocale, NextIntlClientProvider } from "next-intl"
import {
  getMessages,
  getTranslations,
  setRequestLocale
} from "next-intl/server"
import Footer from "@/components/shared/Footer/Footer"
import Header from "@/components/shared/Header/Header"
import { routing } from "@/i18n/routing"

const _inter = Inter({ subsets: ["latin"] })

// Enumerating the locales is half of the static-rendering opt-in; the other
// half is `setRequestLocale` below, in this layout AND in every page.
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: "Metadata" })

  return {
    metadataBase: new URL("https://webiston.uz"),
    title: {
      default: "Webiston - Veb texnologiyalar dunyosiga teran nigoh",
      template: "%s | Webiston"
    },
    description: t("description"),
    keywords: t("keywords")
    // ... other metadata from root layout should be here
  }
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()

  // Without this, `useTranslations` inside Header/Footer resolves the locale
  // through `headers()`, which opts the whole tree into dynamic rendering.
  // It must run BEFORE any child renders — i.e. here in the layout body.
  setRequestLocale(locale)

  const messages = await getMessages()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </NextIntlClientProvider>
  )
}
