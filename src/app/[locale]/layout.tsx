import '../globals.css'
import { Metadata } from 'next'
import Image from 'next/image'
import Script from 'next/script'
import dynamic from 'next/dynamic'
import { getMessages } from 'next-intl/server'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import Footer from '@/components/shared/Footer/Footer'
import Header from '@/components/shared/Header/Header'
import { ThemeProvider } from '@/components/shared/Providers'
import { NextIntlClientProvider } from 'next-intl'
import Head from 'next/head'

const OpenReplayNoSSR = dynamic(() => import('@/lib/config/openreplay'))
const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://webiston.uz'),
  title: {
    default: 'Webiston - Veb texnologiyalar dunyosiga teran nigoh',
    template: '%s | Webiston',
  },
  description: 'Veb texnologiyalar dunyosiga teran nigoh',
  applicationName: 'Webiston',
  appleWebApp: {
    title: 'Webiston',
  },
  keywords: [
    'Webiston',
    'Vebiston',
    'Onlayn platforma',
    'Fluent React',
    'React.js',
    'Next.js',
    'React',
    'Veb dasturlash',
    'Veb texnologiyalar',
    'JavaScript',
    'TypeScript',
    'Node.js',
  ],
  authors: [{ name: 'Webiston', url: 'https://webiston.uz' }],
  creator: 'Webiston',
  publisher: 'https://github.com/rustamovRR',
  generator: 'Next.js',
  verification: { google: 'Xz0YDnKOB7hdnXLb0nSAIiFs4cRw7zA8wchJDKi08uU', yandex: '0c91a9b588bee8d3' },
  openGraph: {
    url: 'https://webiston.uz',
    title: 'Webiston - Veb texnologiyalar dunyosiga teran nigoh',
    siteName: 'Webiston',
    locale: 'en_US',
    type: 'website',
    description: "Zamonaviy veb-dasturlash texnologiyalari haqida o'zbek tilidagi qo'llanma",
    countryName: 'Uzbekistan',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 630,
        alt: 'Webiston - Veb texnologiyalar dunyosiga teran nigoh',
      },
    ],
  },
  other: {
    'msapplication-TileColor': '#fff',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@webiston_uz',
    creator: '@Rustamov_RR',
    title: 'Webiston - Veb texnologiyalar dunyosiga teran nigoh',
    description:
      "Webiston - Veb texnologiyalar dunyosiga teran nigoh. Zamonaviy veb-dasturlash texnologiyalari haqida o'zbek tilidagi qo'llanma.",
    images: ['/logo.png'],
  },
  alternates: {
    canonical: './',
  },
  icons: {
    icon: [
      { type: 'image/png', url: '/favicon-32x32.png', sizes: '32x32' },
      { type: 'image/png', url: '/favicon-16x16.png', sizes: '16x16' },
      { type: 'image/x-icon', url: '/favicon.ico', sizes: '48x48' },
    ],
    shortcut: '/favicon.ico',
    apple: {
      sizes: '180x180',
      url: '/apple-touch-icon.png',
      href: '/apple-touch-icon.png',
    },
  },
  manifest: '/site.webmanifest',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID
  const YM_ID = process.env.NEXT_PUBLIC_YM_ID
  const isDevelopment = process.env.NODE_ENV === 'development'

  const messages = await getMessages({ locale: 'uz' })

  return (
    <html lang="uz" dir="ltr" suppressHydrationWarning>
      <Head>
        {!isDevelopment && (
          <>
            {/* Google Analytics */}
            <Script strategy="lazyOnload" src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} />
            <Script
              id="ga-script"
              strategy="lazyOnload"
              dangerouslySetInnerHTML={{
                __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `,
              }}
            />
            {/* Yandex Metrica */}
            <Script
              id="ym-script"
              strategy="lazyOnload"
              dangerouslySetInnerHTML={{
                __html: `
            (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
            (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

            ym(${YM_ID}, "init", {
              clickmap:true,
              trackLinks:true,
              accurateTrackBounce:true,
              webvisor:true
            });
          `,
              }}
            />
            {/* Yandex Metrica noscript */}
            <noscript>
              <div>
                <Image
                  src={`https://mc.yandex.ru/watch/${YM_ID}`}
                  style={{ position: 'absolute', left: '-9999px' }}
                  alt=""
                />
              </div>
            </noscript>

            <OpenReplayNoSSR />
          </>
        )}
      </Head>

      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem storageKey="theme">
          <NextIntlClientProvider locale="uz" messages={messages}>
            <header className="border-border/40 bg-background/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b backdrop-blur">
              <Header />
            </header>
            <main data-pagefind-body>{children}</main>
            <Footer />
            <Toaster />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
