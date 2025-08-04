import { Inter } from 'next/font/google'
import Footer from '@/components/shared/Footer/Footer'
import Header from '@/components/shared/Header/Header'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'

const inter = Inter({ subsets: ['latin'] })
const locales = ['uz', 'en']

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'Metadata' })

  return {
    metadataBase: new URL('https://webiston.uz'),
    title: {
      default: 'Webiston - Veb texnologiyalar dunyosiga teran nigoh',
      template: '%s | Webiston',
    },
    description: t('description'),
    keywords: t('keywords'),
    // ... other metadata from root layout should be here
  }
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!locales.includes(locale)) notFound()

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
