import Image from 'next/image'
import { useRouter } from 'next/router'
import type { DocsThemeConfig } from 'nextra-theme-docs'
import { useConfig } from 'nextra-theme-docs'

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
        <meta name="msapplication-TileColor" content="#fff" />
        <meta name="theme-color" content="#fff" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta httpEquiv="Content-Language" content="uz" />
        <meta
          name="og:description"
          content="Zamonaviy veb-dasturlash texnologiyalari haqida o'zbek tilidagi qo'llanma."
        />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content={socialCard} />
        <meta name="twitter:site:domain" content="webiston.uz" />
        <meta name="twitter:url" content="https://webiston.uz" />

        <meta property="og:title" content={title ? title + ' – Webiston' : 'Webiston'} />
        <meta property="og:image" content={socialCard} />
        <meta property="og:description" content={`Veb texnologiyalar dunyosiga teran nigoh.`} />

        <meta name="apple-mobile-web-app-title" content="Webiston" />
        <link rel="icon" href="/favicon.ico" type="image/svg+xml" />
        <link rel="icon" href="/logo.png" type="image/png" />
        <link rel="icon" href="/logo.png" type="image/svg+xml" media="(prefers-color-scheme: dark)" />
        <link rel="icon" href="/logo.png" type="image/png" media="(prefers-color-scheme: dark)" />
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
      <div className="flex w-full flex-col items-center text-center sm:items-start">
        <a
          className="flex items-center gap-1 text-current"
          target="_blank"
          rel="noopener noreferrer"
          title="webiston.uz"
          href="https://webiston.uz"
        >
          <span>Powered by</span>&nbsp;
          <span className="font-bold">Webiston</span>
        </a>
        <p className="mt-6 text-xs"> {new Date().getFullYear()} Webiston. Barcha huquqlar himoyalangan.</p>
      </div>
    ),
  },
  themeSwitch: {
    component: null,
  },
  toc: {
    backToTop: true,
  },
}

export default config
