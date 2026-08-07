/** biome-ignore-all lint/security/noDangerouslySetInnerHtml: JSON-LD has no React equivalent; the payload is a hardcoded schema object */
import type { Metadata } from "next"
import Link from "next/link"
import { getTranslations, setRequestLocale } from "next-intl/server"
import type { CSSProperties } from "react"
import { ArrowRightIcon, ToolsIcon } from "@/assets/icons"
import type { HeroPaletteGroup } from "@/components/shared"
import {
  BookSection,
  ButtonLink,
  HeroPalette,
  SectionDivider,
  ToolsSection
} from "@/components/shared"
import {
  BOOK_SECTIONS,
  HERO_PALETTE_QUERY,
  HERO_TOPICS,
  REACT_CHAPTERS,
  TOOLS_LIST
} from "@/constants"
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

  // The palette's results must be REAL matches — a mocked search that invents
  // hits is a screenshot of a product that does not exist. Half A types
  // "react" (110 pages under `content/fluent-react`, zero tools — hence a
  // books-only group). Half B types the locale's generator query ("yarat" /
  // "gener"), which genuinely matches the three generator tools shown. Both
  // queries are 5 characters — the CSS cadence is steps(5).
  // Tool rows share one builder: title from the Tools namespace, meta from the
  // tool's own category slug — lowercase mono, authentic to a dev palette and
  // needing no translation.
  const toolRows = (tKeys: string[], fallbackCategory: string) =>
    tKeys.map((tKey) => ({
      title: tTools(`${tKey}.title`),
      meta:
        TOOLS_LIST.find((tool) => tool.tKey === tKey)?.category ??
        fallbackCategory
    }))
  const heroPaletteGroups: HeroPaletteGroup[] = [
    {
      query: HERO_PALETTE_QUERY,
      label: tHome("palette.label"),
      rows: [
        { title: "Fluent React", meta: `${REACT_CHAPTERS.length} bo'lim` },
        ...REACT_CHAPTERS.slice(0, 2).map((c) => ({
          title: c.title,
          meta: "Fluent React"
        }))
      ]
    },
    {
      query: tHome("palette.queryTools"),
      label: tHome("palette.labelTools"),
      rows: toolRows(
        ["qrGenerator", "passwordGenerator", "hashGenerator"],
        "generators"
      )
    },
    {
      // "o'gir" / "conve" — verified to match exactly these three titles in
      // each locale, and 5 characters like the others.
      query: tHome("palette.queryConverters"),
      label: tHome("palette.labelTools"),
      rows: toolRows(
        ["latinCyrillic", "base64Converter", "colorConverter"],
        "converters"
      )
    }
  ]

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

      {/* Main Content.
          `px-4 sm:px-6 lg:px-8` — the SAME padding scale as the header's inner
          container, on purpose: the hero previously used `px-16`, so its left
          edge sat ~32px right of the logo and the two surfaces read as
          unrelated. One shared gutter, one vertical line down the page. */}
      <div className="w-full px-4 pb-16 sm:px-6 lg:px-8">
        {/* The hero is no longer `min-h-screen`. At exactly 100vh nothing below
            the fold was even hinted, so the 41 cards that are the actual
            substance of this page were invisible until the user guessed to
            scroll. ~78vh leaves the top of the first section showing, which is
            the cheapest possible scroll affordance. */}
        {/* Two columns, not centred. Three reasons this beats the centred
            version it replaces: a long Uzbek headline gets a consistent scan
            start instead of a moving one; there is room for a visual that shows
            the PRODUCT rather than decoration; and the palette answers "what is
            this site" so the headline no longer has to, which is why the
            evocative original copy is back. */}
        {/* `max-w-[1536px]` matches the header container and every section
            below, so the headline starts exactly under the logo. */}
        <header className="hero mx-auto w-full max-w-[1536px] py-12 lg:py-16">
          {/* Two nested elements, not one pseudo-element: the mask lives on the
              outer one and the drift on the inner, because a `transform` would
              otherwise drag the mask's fade-out across the screen with it.
              Purely decorative, so it is hidden from assistive tech. */}
          <div className="hero-backdrop" aria-hidden="true">
            {/* Rain is nested INSIDE the grid so it inherits the same drift
                transform and origin — that is what keeps the falling light
                registered to the column lines instead of sliding across them. */}
            <div className="hero-grid">
              <div className="hero-rain">
                <span className="hero-streak" />
                <span className="hero-streak" />
                <span className="hero-streak" />
              </div>
              {/* Throwaway load-in layers: the axes are split and offset so the
                  lines read as arriving in parallel rather than as one flicker. */}
              <div className="hero-flash-v" />
              <div className="hero-flash-h" />
            </div>
            {/* Order matters and is not z-index: the scrim dims the grid and beam
                behind the text, and the aurora sits AFTER it so the brand glow
                behind the headline is not flattened too. */}
            <div className="hero-scrim" />
            <div className="hero-aurora" />
          </div>

          {/* Fixed-max columns, not `1.05fr/.95fr`: fr columns stretch with the
              container, so on a wide screen the text hugged the left edge, the
              palette hugged the right, and the middle was a gulf. Capped
              columns keep the composition COMPACT — text, a ~90px seam, the
              palette — with any spare width falling to the right, where the
              backdrop fills it. The left edge stays on the logo's gutter. */}
          <div className="grid items-center gap-14 lg:grid-cols-[minmax(0,680px)_minmax(0,560px)] lg:gap-20 xl:gap-24">
            <div>
              {/* An announcement slot, not a static badge — it is a real link, so
                  the newest book gets an entry point from the first thing the eye
                  lands on. Previously this was inert text. */}
              <Link
                href="/books/ai-engineering"
                className="rise group mb-6 inline-flex items-center gap-2.5 rounded-full border border-border-strong bg-card/60 py-1.5 pr-4 pl-1.5 text-xs backdrop-blur-sm transition-colors hover:border-input hover:bg-accent"
                style={{ "--i": 0 } as CSSProperties}
              >
                <span className="rounded-full bg-primary/15 px-2.5 py-0.5 font-mono text-primary">
                  {tHome("eyebrowBadge")}
                </span>
                <span className="text-muted-foreground">
                  {tHome("eyebrowText")}
                </span>
                <span className="text-muted-foreground transition-transform duration-300 ease-out group-hover:translate-x-0.5">
                  →
                </span>
              </Link>

              {/* `titleLead` / `titleAccent` are two keys rather than one string
                  with markup spliced in: the accent span has to be a translatable
                  unit, and "teran nigoh" is not the same substring position as
                  "web technologies". */}
              <h1
                className="rise text-balance font-bold text-5xl tracking-[-0.035em] leading-[1.06] sm:text-6xl lg:text-[64px]"
                style={{ "--i": 1 } as CSSProperties}
              >
                <span className="bg-gradient-to-b from-foreground to-foreground/85 bg-clip-text text-transparent">
                  {tHome("titleLead")}
                </span>{" "}
                <span className="hero-accent">{tHome("titleAccent")}</span>
              </h1>

              <p
                className="rise mt-7 max-w-xl text-pretty text-lg text-muted-foreground leading-relaxed"
                style={{ "--i": 2 } as CSSProperties}
              >
                {tHome("description")}
              </p>

              <div
                className="rise mt-8 flex flex-col gap-4 sm:flex-row"
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
                className="rise mt-9 flex flex-wrap items-center gap-x-8 gap-y-3"
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

              {/* Named in a constant, not inline: these are the technologies the
                  library actually covers, and they are the same list a future
                  filter or SEO keyword set would need. */}
              <div
                className="rise mt-6 flex flex-wrap gap-2"
                style={{ "--i": 5 } as CSSProperties}
              >
                {HERO_TOPICS.map((topic) => (
                  <span
                    key={topic}
                    className="rounded-md border border-border bg-card/50 px-2.5 py-1 font-mono text-[11px] text-muted-foreground"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>

            {/* Hidden below `lg`: at phone width this would push the CTAs a full
                screen down, and a 320px-wide screenshot of a search palette is
                unreadable anyway. The real palette is in the header on every
                breakpoint. */}
            <div
              className="rise hidden lg:block"
              style={{ "--i": 4 } as CSSProperties}
            >
              <HeroPalette
                groups={heroPaletteGroups}
                hints={tHome("palette.hints")}
              />
            </div>
          </div>
        </header>

        <SectionDivider label={tHome("sectionBooks")} count="03" />

        {/* One component per book: header with the real cover, the first five
            chapters, and an explicit "all chapters" door. The previous layout
            rendered every top-level chapter of every book — 24 identical cards
            in which a 5-chapter book weighed the same as an 11-chapter one. */}
        {BOOK_SECTIONS.map(({ id, title, chapters, descriptionKey }) => (
          <BookSection
            key={id}
            id={id}
            title={title}
            description={tHome(descriptionKey)}
            coverSrc={getTutorialImage(id)}
            bookHref={`/books/${id}`}
            chapters={chapters.slice(0, 5)}
            moreLabel={tHome("allChapters")}
            meta={`${chapters.length} ${tHome("stats.chapters")} · ${id}`}
          />
        ))}

        <SectionDivider
          label={tHome("sectionTools")}
          count={String(TOOLS_LIST.length)}
        />

        <ToolsSection
          tools={TOOLS_LIST.slice(0, 7).map((tool) => ({
            title: tTools(`${tool.tKey}.title`),
            description: tTools(`${tool.tKey}.description`),
            href: tool.href,
            category: tool.category,
            icon: <tool.icon className="size-4" />
          }))}
          moreLabel={tHome("allTools")}
          moreMeta={`${TOOLS_LIST.length} ${tHome("stats.tools")}`}
          toolsHref="/tools"
        />
      </div>
    </>
  )
}
