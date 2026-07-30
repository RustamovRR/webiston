/** biome-ignore-all lint/security/noDangerouslySetInnerHtml: <explanation> */
import type { Metadata } from "next"
import Image from "next/image"
import { getTranslations, setRequestLocale } from "next-intl/server"
import type { CSSProperties } from "react"
import { ArrowRightIcon, ToolsIcon } from "@/assets/icons"
import { ButtonLink, SectionTitle, SimpleCard } from "@/components/shared"
import { BOOK_SECTIONS, TOOLS_LIST } from "@/constants"
import {
  getAllTutorialPaths,
  getAllTutorials,
  getTutorialImage
} from "@/lib/mdx"
import { localeAlternates, localeUrl, ogCardUrl } from "@/lib/seo"

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: "HomePage.Metadata" })

  const title = t("title")
  const description = t("description")
  const keywords = t("keywords")

  // Locale-specific enhanced keywords
  const enhancedKeywords =
    locale === "uz"
      ? [
          // O'zbek tilida homepage uchun maxsus keywordlar
          "webiston bosh sahifa",
          "o'zbek dasturchilari platformasi",
          "dasturlash kitoblari o'zbek",
          "react kitob o'zbek",
          "javascript o'rganish o'zbek",
          "frontend o'rganish",
          "backend o'rganish",
          "web development o'zbek",
          "dasturlash o'rganish o'zbek tilida",
          "bepul dasturlash kurslari",
          "dasturlash vositalari",
          "foydali vositalar dasturchilar",
          "typing test o'zbek",
          "monkeytype o'zbek",
          "online tools o'zbek",
          "productivity tools o'zbek",
          "text processing o'zbek",
          "code utilities o'zbek",
          "web utilities o'zbek",
          "it ta'lim o'zbek",
          "software development o'zbek",
          "webiston tools",
          "online dasturlash o'zbek",
          "tech education uzbekistan",
          "o'zbek tech community",
          "coding platform o'zbek",
          "software tools o'zbek",
          keywords
        ].join(", ")
      : [
          // English keywords
          "webiston homepage",
          "uzbek developers platform",
          "programming platform uzbekistan",
          "react book uzbek",
          "javascript tutorial uzbek",
          "frontend development uzbek",
          "backend development uzbek",
          "web development uzbekistan",
          "learn programming uzbek",
          "free programming courses",
          "developer tools uzbek",
          "coding resources uzbek",
          "tech services uzbekistan",
          "programming books uzbek language",
          "online tools uzbek",
          "productivity platform uzbek",
          "typing test uzbek",
          "monkeytype uzbek",
          "developer utilities uzbek",
          "tech community uzbekistan",
          "programming education uzbek",
          "software development uzbekistan",
          "uzbek tech ecosystem",
          "coding bootcamp uzbek",
          "tech learning platform",
          keywords
        ].join(", ")

  return {
    // `absolute` opts out of the root layout's `%s | Webiston` template — the
    // homepage title already leads with the brand, so the template appended it
    // twice ("Webiston | … | Webiston").
    title: { absolute: title },
    description,
    keywords: enhancedKeywords,
    alternates: localeAlternates(locale, "/"),
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "uz" ? "uz_UZ" : "en_US",
      url: localeUrl(locale, "/"),
      siteName: "Webiston",
      // `/logo.png` is 1120×1120 but was declared 1200×630 here — the generated
      // card actually is that size. See `ogCardUrl`.
      images: [
        {
          url: ogCardUrl(title, ""),
          width: 1200,
          height: 630,
          alt:
            locale === "uz"
              ? "Webiston - O'zbek Dasturchilari uchun Professional Platforma"
              : "Webiston - Professional Platform for Uzbek Developers"
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      site: "@webiston_uz",
      creator: "@webiston_uz",
      title,
      description,
      images: [ogCardUrl(title, "")]
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1
      }
    },
    category: "education",
    classification: "Programming Education",
    referrer: "origin-when-cross-origin",
    formatDetection: {
      email: false,
      address: false,
      telephone: false
    }
  }
}

export default async function HomePage({
  params
}: {
  params: Promise<{ locale: string }>
}) {
  // Every page needs its own `setRequestLocale`, not just the layout — without
  // it this was the one route left rendering on demand.
  const { locale } = await params
  setRequestLocale(locale)

  const tHome = await getTranslations("HomePage")
  const tTools = await getTranslations("Tools")

  // Derived at build time from the content tree and the routed tool list, never
  // typed in — a hand-written "226 chapters" is a claim that silently goes stale
  // the first time a chapter is added. This page is prerendered, so the walk
  // costs nothing at runtime.
  const [tutorialPaths, tutorials] = await Promise.all([
    getAllTutorialPaths(),
    getAllTutorials()
  ])
  const HOME_STATS = [
    // One entry per book is also in `tutorialPaths`, so subtract them to count
    // chapters rather than chapters-plus-landing-pages.
    {
      value: tutorialPaths.length - tutorials.length,
      labelKey: "stats.chapters"
    },
    { value: tutorials.length, labelKey: "stats.books" },
    { value: TOOLS_LIST.length, labelKey: "stats.tools" }
  ] as const

  // Homepage-specific structured data
  const homepageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Webiston - Homepage",
    description:
      "O'zbek dasturchilari uchun keng qamrovli xizmatlar va resurslar platformasi",
    url: "https://webiston.uz",
    mainEntity: {
      "@type": "Organization",
      name: "Webiston",
      description:
        "O'zbek dasturchilari uchun professional xizmatlar platformasi",
      serviceType: [
        "Programming Education",
        "Developer Tools",
        "Online Utilities",
        "Productivity Services",
        "Text Processing",
        "Code Generation",
        "Typing Tests"
      ],
      areaServed: "Uzbekistan",
      audience: "Developers, Programmers, Students"
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "Home",
          item: "https://webiston.uz"
        }
      ]
    },
    potentialAction: [
      {
        "@type": "ReadAction",
        target: "https://webiston.uz/books",
        name: "Read Programming Books"
      },
      {
        "@type": "UseAction",
        target: "https://webiston.uz/tools",
        name: "Use Developer Tools"
      }
    ]
  }

  return (
    <>
      {/* Homepage Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageSchema) }}
      />

      {/* Main Content */}
      <div className="w-full px-16 pb-16 max-sm:px-6">
        {/* The hero is no longer `min-h-screen`. At exactly 100vh nothing below
            the fold was even hinted, so the 41 cards that are the actual
            substance of this page were invisible until the user guessed to
            scroll. ~78vh leaves the top of the first section showing, which is
            the cheapest possible scroll affordance. */}
        <header className="hero mx-auto flex min-h-[78svh] w-full max-w-5xl flex-col items-center justify-center gap-6 py-24 text-center">
          {/* Two nested elements, not one pseudo-element: the mask lives on the
              outer one and the drift on the inner, because a `transform` would
              otherwise drag the mask's fade-out across the screen with it.
              Purely decorative, so it is hidden from assistive tech. */}
          <div className="hero-backdrop" aria-hidden="true">
            {/* The beam is nested INSIDE the grid so it inherits the same drift
                transform and origin — that is what keeps the travelling light
                registered to the lines instead of sliding across them. */}
            <div className="hero-grid">
              <div className="hero-beam">
                <div className="hero-beam-band" />
              </div>
            </div>
            <div className="hero-aurora" />
          </div>

          {/* Eyebrow: answers "what IS this?" before the headline has to. The
              old hero opened with a metaphor, so a first-time visitor could not
              tell a book library from an agency. */}
          <p
            className="rise flex items-center gap-2 rounded-full border border-border-strong bg-card/60 px-3 py-1 text-muted-foreground text-xs backdrop-blur-sm"
            style={{ "--i": 0 } as CSSProperties}
          >
            <span className="size-1.5 rounded-full bg-primary" />
            {tHome("eyebrow")}
          </p>

          {/* `text-balance` evens the line lengths instead of leaving one orphan
              word — it is why "teran nigoh" no longer strands on its own line.
              Tracking is negative because display type at 72px set at `normal`
              looks loose; `leading-[1.05]` replaces `line-height: 1` which was
              clipping Uzbek descenders and apostrophes.
              The eight junk classes that used to be here (`//`, `Light`, `mode`,
              `gradient`, `Dark`, `klass`, `o‘z`, `holicha`) came from `//`
              comments written inside the class string — Tailwind has no comment
              syntax there, so all eight shipped to production as real classes. */}
          <h1
            className="rise max-w-4xl text-balance bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text font-extrabold text-5xl text-transparent tracking-[-0.02em] leading-[1.05] sm:text-6xl lg:text-7xl"
            style={{ "--i": 1 } as CSSProperties}
          >
            {tHome("title")}
          </h1>

          <p
            className="rise max-w-2xl text-pretty text-lg text-muted-foreground leading-relaxed sm:text-xl"
            style={{ "--i": 2 } as CSSProperties}
          >
            {tHome("description")}
          </p>

          <div
            className="rise mt-4 flex flex-col items-center gap-4 sm:flex-row"
            style={{ "--i": 3 } as CSSProperties}
          >
            <ButtonLink
              isNextLink
              href="/books"
              variant="primary"
              className="group"
            >
              {tHome("startLearning")}
              <span className="ml-2 transition-transform duration-300 ease-out group-hover:translate-x-1">
                <ArrowRightIcon />
              </span>
            </ButtonLink>
            <ButtonLink href="/tools" variant="outline" className="group">
              {tHome("usefulTools")}
              <span className="ml-2 transition-transform duration-300 ease-out group-hover:scale-110">
                <ToolsIcon className="h-4 w-4" />
              </span>
            </ButtonLink>
          </div>

          {/* Proof row. The highest-leverage thing missing from this page: the
              library's actual scale was nowhere on it. These are derived from
              the content tree and the routed tool list, not typed in, so they
              cannot drift away from the truth. */}
          <dl
            className="rise mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3"
            style={{ "--i": 4 } as CSSProperties}
          >
            {HOME_STATS.map(({ value, labelKey }) => (
              <div key={labelKey} className="flex items-baseline gap-1.5">
                <dt className="font-semibold text-foreground text-xl tabular-nums">
                  {value}
                </dt>
                <dd className="text-muted-foreground text-sm">
                  {tHome(labelKey)}
                </dd>
              </div>
            ))}
          </dl>
        </header>

        {/* Three byte-identical section blocks collapsed into one loop. They
            differed only in book id, title and data array — and had already
            drifted: the React section carried a stray `8` class and an extra
            blank line, which is exactly how copy-pasted markup rots. */}
        {BOOK_SECTIONS.map(({ id, title, chapters, descriptionKey }) => (
          <section
            key={id}
            className="group mx-auto mt-16 flex w-full max-w-[1536px] flex-col gap-8"
          >
            <SectionTitle
              title={title}
              href={`/books/${id}`}
              description={tHome(descriptionKey)}
              icon={
                <Image
                  src={getTutorialImage(id)}
                  alt={title}
                  width={48}
                  height={48}
                  className="h-12 w-12 object-contain duration-300 ease-in-out group-hover:scale-110"
                />
              }
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {chapters.map((card) => (
                <SimpleCard
                  key={card.href}
                  isNextLink
                  className="reveal"
                  href={card.href}
                  title={card.title}
                  description={card.description}
                />
              ))}
            </div>
          </section>
        ))}

        <section className="group mx-auto mt-16 flex w-full max-w-[1536px] flex-col gap-8">
          <SectionTitle
            href="/tools"
            title={tHome("toolsSectionTitle")}
            description={tHome("toolsSectionDescription")}
            icon={
              <ToolsIcon className="h-10 w-10 duration-300 ease-in-out group-hover:scale-110" />
            }
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {TOOLS_LIST.map((tool) => (
              <SimpleCard
                key={tool.href}
                className="reveal"
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
