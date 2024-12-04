import Image from 'next/image'
import { useRouter } from 'next/router'
import type { DocsThemeConfig } from 'nextra-theme-docs'
import { useConfig } from 'nextra-theme-docs'
import { socialLinks } from '@/constants'

const config: DocsThemeConfig = {
  project: {
    link: 'https://github.com/RustamovRR/webiston',
  },
  docsRepositoryBase: 'https://github.com/RustamovRR/webiston/tree/main/docs',
  logo: (
    <>
      <Image src="/logo.png" height="50" width="50" alt="Webiston" />
      <span style={{ marginLeft: '.4em', fontWeight: 800 }}>Webiston</span>
    </>
  ),
  head: function useHead() {
    const { title } = useConfig()
    const { route } = useRouter()
    const socialCard = route === '/' || !title ? '/logo.png' : `/api/og?title=${title}`

    return (
      <>
        <meta name="google-site-verification" content="Xz0YDnKOB7hdnXLb0nSAIiFs4cRw7zA8wchJDKi08uU" />
        <meta name="yandex-verification" content="0c91a9b588bee8d3" />
        <title>{title ? title + ' – Webiston' : 'Webiston - Veb texnologiyalar dunyosiga teran nigoh'}</title>
        <meta name="msapplication-TileColor" content="#fff" />
        <meta name="theme-color" content="#fff" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Language" content="uz" />
        <meta
          name="og:description"
          content="Zamonaviy veb-dasturlash texnologiyalari haqida o'zbek tilidagi qo'llanma."
        />

        <meta
          name="description"
          content="O'zbek tilidagi eng mukammal React va zamonaviy veb-dasturlash qo'llanmasi. React, JavaScript, TypeScript va boshqa texnologiyalar haqida batafsil ma'lumot."
        />
        <meta
          name="keywords"
          content="react, javascript, typescript, o'zbek tili, dasturlash, veb dasturlash, frontend, nextjs, reactjs tutorial, react darslari, jsx, tsx, reconciliation, virtual DOM, real DOM, react server components, react server komponentlari, memo, usememo, usecallback, usememo, usecallback, react concurrent, react concurrent mode, webiston, vebiston, webistan, vebistan"
        />
        <meta property="og:site_name" content="Webiston" />
        <meta
          property="og:title"
          content={title ? title + ' – Webiston' : 'Webiston - Veb texnologiyalar dunyosiga teran nigoh'}
        />
        <meta property="og:image" content={socialCard} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={socialCard} />
        <meta property="og:description" content={`Veb texnologiyalar dunyosiga teran nigoh.`} />

        <meta name="apple-mobile-web-app-title" content="Webiston" />

        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />

        <link rel="manifest" href="/site.webmanifest" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Webiston',
              url: 'https://webiston.uz',
              description: "O'zbek tilidagi eng so'nggi React va zamonaviy veb-dasturlash qo'llanmasi",
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://webiston.uz/search?q={search_term_string}',
                },
                'query-input': 'required name=search_term_string',
              },
              sameAs: [
                'https://github.com/RustamovRR/webiston',
                'https://t.me/webiston_uz',
                'https://linkedin.com/company/webiston',
                'https://x.com/webiston_uz',
              ],
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SiteNavigationElement',
              name: [
                "React paydo bo'lishi",
                'JSX',
                'Virtual DOM',
                'Reconciliation',
                'useMemo, useCallback va memo',
                'React patternlar',
                'Server tomonda React',
                'React Server Components',
                'React Concurrent',
                'React freymvorklari',
              ],
              url: [
                'https://webiston.uz/docs/react/entry-level-stuff',
                'https://webiston.uz/docs/react/jsx',
                'https://webiston.uz/docs/react/virtual-dom',
                'https://webiston.uz/docs/react/inside-reconciliation',
                'https://webiston.uz/docs/react/common-questions',
                'https://webiston.uz/docs/react/powerful-patterns',
                'https://webiston.uz/docs/react/server-side-react',
                'https://webiston.uz/docs/react/react-server-components',
                'https://webiston.uz/docs/react/concurrent-react',
                'https://webiston.uz/docs/react/frameworks',
              ],
            }),
          }}
        />
      </>
    )
  },
  sidebar: {
    defaultMenuCollapseLevel: 2,
  },
  editLink: {
    content: "GitHub'da tahrirlash →",
  },
  feedback: {
    content: 'Savollaringiz bormi? Fikr bildiring →',
    labels: 'feedback',
  },
  search: {
    placeholder: 'Dokumentatsiyadan qidirish...',
  },
  footer: {
    content: (
      <div className="flex w-full flex-col items-center gap-4 sm:items-start">
        <div className="flex flex-wrap items-center justify-center gap-4 sm:justify-start">
          {socialLinks.map(({ id, href, icon, label }) => (
            <a
              key={id}
              href={href}
              aria-label={label}
              title={label}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-current transition-colors hover:text-gray-900 dark:hover:text-gray-100"
            >
              {icon}
            </a>
          ))}
        </div>

        <p className="mt-2 text-center text-xs sm:text-left">
          {new Date().getFullYear()} Webiston. Barcha huquqlar himoyalangan.
        </p>
      </div>
    ),
  },
  themeSwitch: {
    component: null,
  },
  darkMode: true,
  nextThemes: {
    defaultTheme: 'dark',
    forcedTheme: 'dark',
  },
  toc: {
    backToTop: true,
  },
}

export default config
