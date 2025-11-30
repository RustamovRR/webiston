import { CircleIcon, ArrowRightIcon, ToolsIcon } from '@/assets/icons'
import { ButtonLink, SimpleCard, SectionTitle } from '@/components/shared'
import { AI_ENGINEERING_CHAPTERS, JAVASCRIPT_CHAPTERS, REACT_CHAPTERS, TOOLS_LIST } from '@/constants'
import { getTutorialImage } from '@/lib/mdx'
import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'HomePage.Metadata' })

  const title = t('title')
  const description = t('description')
  const keywords = t('keywords')

  // Locale-specific enhanced keywords
  const enhancedKeywords =
    locale === 'uz'
      ? [
          // O'zbek tilida homepage uchun maxsus keywordlar
          'webiston bosh sahifa',
          "o'zbek dasturchilari platformasi",
          "dasturlash kitoblari o'zbek",
          "react kitob o'zbek",
          "javascript o'rganish o'zbek",
          "frontend o'rganish",
          "backend o'rganish",
          "web development o'zbek",
          "dasturlash o'rganish o'zbek tilida",
          'bepul dasturlash kurslari',
          'dasturlash vositalari',
          'foydali vositalar dasturchilar',
          "typing test o'zbek",
          "monkeytype o'zbek",
          "online tools o'zbek",
          "productivity tools o'zbek",
          "text processing o'zbek",
          "code utilities o'zbek",
          "web utilities o'zbek",
          "it ta'lim o'zbek",
          "software development o'zbek",
          'webiston tools',
          "online dasturlash o'zbek",
          'tech education uzbekistan',
          "o'zbek tech community",
          "coding platform o'zbek",
          "software tools o'zbek",
          keywords,
        ].join(', ')
      : [
          // English keywords
          'webiston homepage',
          'uzbek developers platform',
          'programming platform uzbekistan',
          'react book uzbek',
          'javascript tutorial uzbek',
          'frontend development uzbek',
          'backend development uzbek',
          'web development uzbekistan',
          'learn programming uzbek',
          'free programming courses',
          'developer tools uzbek',
          'coding resources uzbek',
          'tech services uzbekistan',
          'programming books uzbek language',
          'online tools uzbek',
          'productivity platform uzbek',
          'typing test uzbek',
          'monkeytype uzbek',
          'developer utilities uzbek',
          'tech community uzbekistan',
          'programming education uzbek',
          'software development uzbekistan',
          'uzbek tech ecosystem',
          'coding bootcamp uzbek',
          'tech learning platform',
          keywords,
        ].join(', ')

  return {
    title,
    description,
    keywords: enhancedKeywords,
    alternates: {
      canonical: locale === 'uz' ? 'https://webiston.uz' : `https://webiston.uz/${locale}`,
      languages: {
        uz: 'https://webiston.uz',
        en: 'https://webiston.uz/en',
        'x-default': 'https://webiston.uz',
      },
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: locale === 'uz' ? 'uz_UZ' : 'en_US',
      url: locale === 'uz' ? 'https://webiston.uz' : `https://webiston.uz/${locale}`,
      siteName: 'Webiston',
      images: [
        {
          url: 'https://webiston.uz/logo.png',
          width: 1200,
          height: 630,
          alt:
            locale === 'uz'
              ? "Webiston - O'zbek Dasturchilari uchun Professional Platforma"
              : 'Webiston - Professional Platform for Uzbek Developers',
          type: 'image/png',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      site: '@webiston_uz',
      creator: '@webiston_uz',
      title,
      description,
      images: ['https://webiston.uz/logo.png'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    category: 'education',
    classification: 'Programming Education',
    referrer: 'origin-when-cross-origin',
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
  }
}

export default async function HomePage() {
  const tHome = await getTranslations('HomePage')
  const tTools = await getTranslations('Tools')

  // Homepage-specific structured data
  const homepageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Webiston - Homepage',
    description: "O'zbek dasturchilari uchun keng qamrovli xizmatlar va resurslar platformasi",
    url: 'https://webiston.uz',
    mainEntity: {
      '@type': 'Organization',
      name: 'Webiston',
      description: "O'zbek dasturchilari uchun professional xizmatlar platformasi",
      serviceType: [
        'Programming Education',
        'Developer Tools',
        'Online Utilities',
        'Productivity Services',
        'Text Processing',
        'Code Generation',
        'Typing Tests',
      ],
      areaServed: 'Uzbekistan',
      audience: 'Developers, Programmers, Students',
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://webiston.uz',
        },
      ],
    },
    potentialAction: [
      {
        '@type': 'ReadAction',
        target: 'https://webiston.uz/books',
        name: 'Read Programming Books',
      },
      {
        '@type': 'UseAction',
        target: 'https://webiston.uz/tools',
        name: 'Use Developer Tools',
      },
    ],
  }

  return (
    <>
      {/* Homepage Structured Data */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageSchema) }} />

      {/* Main Content */}
      <div className="w-full px-16 pb-16 max-sm:px-6">
        <header className="background-pattern mt-8 flex h-full min-h-screen w-full flex-col items-center gap-10 p-10 pt-20 text-center max-[471px]:min-h-[120vh] max-lg:px-0">
          <div className="horizontal-line-1 max-sm:hidden"></div>
          <div className="horizontal-line-2 max-sm:hidden"></div>
          <div className="horizontal-line-3 max-sm:hidden"></div>
          <div className="horizontal-line-4 max-sm:hidden"></div>

          <div className="vertical-line-1 max-sm:hidden"></div>
          <div className="vertical-line-2 max-sm:hidden"></div>

          <CircleIcon className="animate-fadeIn absolute top-[20%] left-[12%] max-sm:hidden" />
          <CircleIcon className="animate-fadeIn absolute top-[70%] right-[32%] max-sm:hidden" />

          <h1 className="animate-fadeInText // Light mode gradient dark:bg-gradient-text // Dark mode klass o‘z holicha max-xl:text-dynamic bg-gradient-to-r from-neutral-600 to-neutral-900 bg-clip-text p-6 text-7xl font-extrabold text-transparent max-lg:text-5xl max-md:p-0">
            {tHome('title')}
          </h1>

          <p className="animate-fadeInText max-w-[750px] text-center text-xl text-zinc-600 md:w-full! dark:text-zinc-400">
            {tHome('description')}
          </p>

          <div className="mt-10 flex gap-4 max-sm:flex-col">
            <ButtonLink
              isNextLink
              href="/books"
              variant="secondary"
              className="group border-zinc-300 bg-white text-black hover:bg-zinc-100"
            >
              {tHome('startLearning')}
              <span className="ml-2 transform transition-all duration-300 ease-in-out group-hover:translate-x-1">
                <ArrowRightIcon />
              </span>
            </ButtonLink>
            <ButtonLink href="/tools" variant="outline" className="group">
              {tHome('usefulTools')}
              <span className="ml-2 transform transition-all duration-300 ease-in-out group-hover:scale-110">
                <ToolsIcon className="h-4 w-4" />
              </span>
            </ButtonLink>
          </div>
        </header>

        <section className="group mx-auto flex w-full max-w-[1536px] flex-col gap-8">
          <SectionTitle
            title="AI Engineering"
            href="/books/ai-engineering"
            description={tHome('aiSectionDescription')}
            icon={
              <Image
                src={getTutorialImage('ai-engineering')}
                alt="AI Engineering"
                width={40}
                height={40}
                className="h-12 w-12 object-contain duration-300 ease-in-out group-hover:scale-110"
              />
            }
          />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
            {AI_ENGINEERING_CHAPTERS.map((card, index) => (
              <SimpleCard key={index} isNextLink href={card.href} title={card.title} description={card.description} />
            ))}
          </div>
        </section>

        <section className="group mx-auto mt-12 flex w-full max-w-[1536px] flex-col gap-8">
          <SectionTitle
            title="JavaScript: The Definitive Guide, 7th Edition"
            href="/books/javascript-definitive-guide"
            description={tHome('jsSectionDescription')}
            icon={
              <Image
                src={getTutorialImage('javascript-definitive-guide')}
                alt="JavaScript: The Definitive Guide, 7th Edition"
                width={40}
                height={40}
                className="h-12 w-12 object-contain duration-300 ease-in-out group-hover:scale-110"
              />
            }
          />
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
            {JAVASCRIPT_CHAPTERS.map((card, index) => (
              <SimpleCard key={index} isNextLink href={card.href} title={card.title} description={card.description} />
            ))}
          </div>
        </section>

        <section className="group 8 mx-auto mt-12 flex w-full max-w-[1536px] flex-col gap-8">
          <SectionTitle
            title="Fluent React"
            href="/books/fluent-react"
            description={tHome('reactSectionDescription')}
            icon={
              <Image
                src={getTutorialImage('fluent-react')}
                alt="Fluent React"
                width={40}
                height={40}
                className="h-12 w-12 object-contain duration-300 ease-in-out group-hover:scale-110"
              />
            }
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
            {REACT_CHAPTERS.map((card, index) => (
              <SimpleCard key={index} isNextLink href={card.href} title={card.title} description={card.description} />
            ))}
          </div>
        </section>

        <section className="group mx-auto mt-12 flex w-full max-w-[1536px] flex-col gap-8">
          <SectionTitle
            href="/tools"
            title={tHome('toolsSectionTitle')}
            description={tHome('toolsSectionDescription')}
            icon={<ToolsIcon className="h-10 w-10 duration-300 ease-in-out group-hover:scale-110" />}
          />

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {TOOLS_LIST.map((tool, index) => (
              <SimpleCard
                key={index}
                href={tool.href}
                title={tTools(`${tool.tKey}.title`)}
                description={tTools(`${tool.tKey}.description`)}
              />
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
