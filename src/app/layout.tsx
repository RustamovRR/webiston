import "./globals.css"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"
import NextTopLoader from "nextjs-toploader"
import { Toaster } from "sonner"
import { ThemeProvider } from "@/components/shared/Providers"
import { ogCardUrl, SITE_URL } from "@/lib/seo"

// `cyrillic` is required, not optional: the product ships Cyrillic Uzbek
// (the transliteration tool and book content both render it). With a latin-only
// subset those glyphs fell back to a system font mid-paragraph.
// Exposed as a CSS variable so `--font-sans` in globals.css owns the cascade —
// see the token block there.
const inter = Inter({
  subsets: ["latin", "latin-ext", "cyrillic"],
  display: "swap",
  variable: "--font-inter"
})

/**
 * The colour the mobile browser paints its own chrome with.
 *
 * A `<meta content>` is not CSS: it cannot read a custom property, and there
 * is no runtime hook to make it token-driven. So these are the sRGB values of
 * `--background` from `src/styles/tokens.css` (`:182` light, `:252` dark),
 * kept in one named constant with each key pointing at its token — the same
 * documented exception `OG_BRAND` takes in `src/app/api/og/route.tsx`.
 *
 * It tracks `--background`, NOT the brand colour. The job of `theme-color` is
 * to make the browser's bar disappear into the page; a teal bar above a white
 * page reads as a rendering bug, not as branding.
 */
export const BROWSER_CHROME = {
  light: "#ffffff", // --background light — oklch(1 0 0)
  dark: "#070b0c" // --background dark  — oklch(0.145 0.008 217)
} as const

/**
 * `themeColor` lives on the viewport export, not on metadata.
 *
 * Next 16 warns when it is found on `metadata`
 * (`resolve-metadata.js:298-303`) — but the warning is keyed to the property
 * name, so the previous `other: { "theme-color": … }` slipped past it through
 * a blind `Object.assign` (`:274`) and shipped a black chrome tint nobody
 * chose. It was one of THREE declared theme colours: black here, white in
 * `public/site.webmanifest`, and Tailwind's `blue-500` — not a brand hue at
 * all — in `src/app/manifest.ts`. All three are now this one pair.
 */
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: BROWSER_CHROME.light },
    { media: "(prefers-color-scheme: dark)", color: BROWSER_CHROME.dark }
  ]
}

export const metadata: Metadata = {
  metadataBase: new URL("https://webiston.uz"),
  title: {
    default: "Webiston - O'zbek Dasturchilari uchun Professional Platforma",
    template: "%s | Webiston"
  },
  description:
    "Webiston - O'zbek dasturchilari uchun keng qamrovli xizmatlar platformasi. Dasturlash kitoblari, foydali vositalar, typing test va professional resurslar. Barcha xizmatlar o'zbek tilida va bepul!",
  applicationName: "Webiston",
  appleWebApp: {
    title: "Webiston",
    statusBarStyle: "default",
    capable: true
  },
  keywords: [
    // O'zbek tilida asosiy keywordlar
    "Webiston",
    "Vebiston",
    "o'zbek dasturchilari",
    "o'zbek developers",
    "uzbek developers platform",
    "o'zbek dasturlash",
    "dasturlash o'zbek tilida",
    "o'zbekcha dasturlash",
    "uzbek programming resources",
    "o'zbek IT xizmatlari",
    "uzbek tech services",

    // Texnologiyalar
    "React.js",
    "Next.js",
    "JavaScript",
    "TypeScript",
    "Node.js",
    "HTML",
    "CSS",
    "Tailwind CSS",
    "MongoDB",
    "PostgreSQL",
    "Express.js",
    "Nest.js",
    "Vue.js",
    "Angular",
    "Python",
    "Django",
    "Flask",
    "PHP",
    "Laravel",
    "Git",
    "Docker",
    "Kubernetes",

    // Dasturlash yo'nalishlari
    "Frontend development",
    "Backend development",
    "Full-stack development",
    "Web development",
    "Mobile development",
    "React Native",
    "Flutter",
    "Android development",
    "iOS development",
    "DevOps",
    "Cloud computing",
    "Machine Learning",
    "AI development",

    // Ta'lim va resurslar
    "dasturlash kitoblari",
    "programming books uzbek",
    "coding tutorials",
    "web development course",
    "dasturlash darslari o'zbek",
    "programming tutorials uzbek",
    "bepul dasturlash kurslari",
    "free programming courses",
    "online coding bootcamp",
    "software engineering",
    "computer science",
    "tech education uzbek",

    // Vositalar va tools
    "programming tools",
    "developer tools",
    "coding tools",
    "web tools",
    "online tools",
    "productivity tools",
    "qr code generator",
    "base64 converter",
    "json formatter",
    "color picker",
    "lorem ipsum generator",
    "typing test",
    "monkeytype uzbek",
    "speed typing test",
    "coding practice",
    "algorithm practice",
    "code formatter",
    "regex tester",
    "api tester",
    "markdown editor",

    // Keng qamrovli xizmatlar
    "online services uzbek",
    "digital tools uzbek",
    "productivity platform",
    "utility tools",
    "web utilities",
    "developer utilities",
    "text tools",
    "image tools",
    "conversion tools",
    "calculation tools",
    "testing tools",
    "validation tools",

    // Ingliz tilida
    "uzbek developers community",
    "uzbekistan tech platform",
    "coding resources uzbek",
    "programming tools uzbek",
    "tech services uzbekistan",
    "developer platform uzbek",
    "uzbek tech ecosystem",
    "central asia developers",

    // Rus tilida
    "узбекские разработчики",
    "платформа для разработчиков узбекистан",
    "программирование узбекистан",
    "it сервисы узбекистан",
    "инструменты разработчика узбекский",
    "техническое образование узбекистан",
    "веб-разработка узбекистан",
    "онлайн инструменты узбекский",

    // Long-tail keywords
    "o'zbek dasturchilari uchun professional platforma",
    "comprehensive developer platform uzbekistan",
    "платформа для узбекских разработчиков",
    "webiston developer services",
    "uzbek tech community platform",
    "central asia programming resources",
    "multilingual developer tools uzbek",
    "professional services for uzbek developers"
  ],
  authors: [{ name: "Webiston Team", url: "https://webiston.uz" }],
  creator: "Webiston",
  publisher: "Webiston",
  generator: "Next.js",
  category: "education",
  classification: "Programming Education Platform",
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION
  },
  openGraph: {
    url: "https://webiston.uz",
    title: "Webiston - O'zbek Dasturchilari uchun Professional Platforma",
    siteName: "Webiston",
    locale: "uz_UZ",
    type: "website",
    description:
      "O'zbek dasturchilari uchun keng qamrovli xizmatlar platformasi. Dasturlash kitoblari, foydali vositalar va professional resurslar.",
    countryName: "Uzbekistan",
    images: [
      {
        url: ogCardUrl("Webiston", ""),
        width: 1200,
        height: 630,
        alt: "Webiston - O'zbek Dasturchilari uchun Professional Platforma",
        type: "image/png"
      }
    ]
  },
  other: {
    "msapplication-TileColor": "#000000"
  },
  twitter: {
    card: "summary_large_image",
    site: "@webiston_uz",
    creator: "@webiston_uz",
    title: "Webiston - O'zbek Dasturchilari uchun Professional Platforma",
    description:
      "O'zbek dasturchilari uchun keng qamrovli xizmatlar. Dasturlash kitoblari, foydali vositalar va professional resurslar.",
    images: [ogCardUrl("Webiston", "")]
  },
  // No site-wide `alternates` here on purpose.
  //
  // A root-level `canonical: "https://webiston.uz"` is inherited by every page
  // that does not set its own — which is how 229 book chapters ended up
  // declaring themselves duplicates of the homepage. Each route now owns its
  // canonical (`localeAlternates` for localised pages, an explicit one for
  // `/books/**`), and a page that forgets simply gets none, which is safe.
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
  // NO `icons` KEY HERE — deliberately, and it must stay that way.
  //
  // Next resolves file-convention icons (`src/app/icon.svg`, `favicon.ico`,
  // `apple-icon.png`) behind an `if (!resolvedMetadata.icons)` guard —
  // `next/dist/lib/metadata/resolve-metadata.js:812`. Setting this key from ANY
  // layout or page makes that guard false and **every convention icon in the
  // tree is silently discarded**: no error, no warning, just a document with no
  // favicon. That is why the icons are not declared here.
  //
  // What the convention buys over a hand-written list: Next appends a content
  // hash to each URL, so a redrawn mark invalidates the browser's separate,
  // very long-lived favicon cache by itself. Hand-written URLs need a manual
  // `?v=2` that someone has to remember.
  //
  // `manifest` is absent for a related reason: `src/app/manifest.ts` already
  // wins. `mergeStaticMetadata` assigns the discovered manifest AFTER the
  // metadata export is merged (`resolve-metadata.js:160`, called at `:311`), so
  // a `manifest:` value here is overwritten before it reaches the document.
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false
  }
}

// Global Organization Schema
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Webiston",
  alternateName: ["Vebiston", "Webiston Platform"],
  description:
    "O'zbek dasturchilari uchun keng qamrovli xizmatlar va resurslar platformasi",
  url: "https://webiston.uz",
  logo: "https://webiston.uz/logo.png",
  foundingDate: "2024",
  founders: [
    {
      "@type": "Person",
      name: "Webiston Team"
    }
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: ["Uzbek", "English", "Russian"]
  },
  sameAs: ["https://github.com/webiston", "https://twitter.com/webiston_uz"],
  areaServed: {
    "@type": "Country",
    name: "Uzbekistan"
  },
  knowsAbout: [
    "Web Development",
    "JavaScript Programming",
    "React.js",
    "Next.js",
    "Programming Education",
    "Software Development",
    "Frontend Development",
    "Backend Development",
    "Developer Tools",
    "Productivity Tools",
    "Online Utilities",
    "Text Processing",
    "Code Generation",
    "API Testing",
    "Performance Testing"
  ],
  educationalCredentialAwarded: "Programming Skills",
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Developer Services and Tools",
    itemListElement: [
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "Course",
          name: "Programming Books",
          description: "Dasturlash bo'yicha professional kitoblar"
        }
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "SoftwareApplication",
          name: "Developer Tools",
          description: "Dasturchilar uchun foydali vositalar va utilities"
        }
      },
      {
        "@type": "Offer",
        itemOffered: {
          "@type": "WebApplication",
          name: "Online Services",
          description: "Typing test, text processing va boshqa online xizmatlar"
        }
      }
    ]
  }
}

// Website Schema
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Webiston",
  alternateName: "Vebiston",
  url: "https://webiston.uz",
  description:
    "O'zbek dasturchilari uchun keng qamrovli xizmatlar va resurslar platformasi",
  publisher: {
    "@type": "Organization",
    name: "Webiston"
  },
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://webiston.uz/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  },
  // Kept in step with `LOCALES` in `src/i18n/locales.ts`. It said `["uz","en"]`
  // for the whole of the Russian launch — the site advertising that it does
  // not serve a language it does serve.
  inLanguage: ["uz", "en", "ru"],
  audience: {
    "@type": "Audience",
    audienceType:
      "Developers, Programmers, Software Engineers, Students, Tech Professionals",
    geographicArea: {
      "@type": "Country",
      name: "Uzbekistan"
    }
  },
  mainEntity: {
    "@type": "ItemList",
    name: "Platform Services",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        item: {
          "@type": "Service",
          name: "Programming Books",
          description: "Professional programming books in Uzbek"
        }
      },
      {
        "@type": "ListItem",
        position: 2,
        item: {
          "@type": "Service",
          name: "Developer Tools",
          description: "Useful tools and utilities for developers"
        }
      },
      {
        "@type": "ListItem",
        position: 3,
        item: {
          "@type": "Service",
          name: "Online Services",
          description: "Typing tests, text processing and productivity tools"
        }
      }
    ]
  }
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  const GA_ID = process.env.NEXT_PUBLIC_GA_ID
  const YM_ID = process.env.NEXT_PUBLIC_YM_ID
  const isDevelopment = process.env.NODE_ENV === "development"

  /**
   * Analytics record the production host and nothing else.
   *
   * `NODE_ENV` alone was never the right gate: `next start` sets it to
   * "production", so every local production run and every Vercel preview
   * deployment reported into the live counters. Measured before this landed —
   * 38 of 1,303 Metrica visits in one 30-day window came from localhost, and
   * `/tools/rezyume` showed 24 visits while it was still a 404 in production.
   * A metric you have to mentally subtract noise from is a metric you stop
   * trusting.
   *
   * The check is CLIENT-side deliberately. Reading the request host on the
   * server would opt this layout — and therefore every page under it — into
   * dynamic rendering, which is a real cost on a static content site to solve
   * a reporting problem.
   *
   * gtag.js is still fetched off-host; with no `config` call it measures
   * nothing, and one inert request on a preview URL does not justify
   * restructuring the loader.
   */
  const onProductionHost = `location.hostname === ${JSON.stringify(
    new URL(SITE_URL).hostname
  )}`

  return (
    <html lang="uz" dir="ltr" suppressHydrationWarning>
      <head>
        {/* Global Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema)
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      {/* .variable (not .className) — it defines --font-inter, which
          --font-sans consumes; `font-sans` is applied on body in globals.css.

          suppressHydrationWarning: browser extensions stamp attributes onto
          <body> before React hydrates — `cz-shortcut-listen` (ColorZilla),
          `bis_register`, `__processed_<uuid>__` — and React reports every one
          as a server/client mismatch. The flag applies to ONE element only,
          so the one already on <html> does not cover <body>. It suppresses
          the attribute diff on this element, not on anything inside it. */}
      <body className={inter.variable} suppressHydrationWarning>
        {/* `var(--primary)`, not `#3b82f6`. That hex is Tailwind's `blue-500`
            and it is NOT our brand hue (217°) — the one piece of chrome that
            appears on every single navigation was the one piece painted in
            someone else's blue.
            The library injects `background:${color}` and
            `box-shadow: 0 0 10px ${color}, 0 0 5px ${color}` into a <style>
            tag, so a custom property resolves normally and the bar now follows
            the token through both schemes with no second value to maintain. */}
        <NextTopLoader color="var(--primary)" height={2} showSpinner={false} />
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          storageKey="theme"
        >
          {children}
          <Toaster />
        </ThemeProvider>

        {/* Analytics Scripts - Production only */}
        {!isDevelopment && GA_ID && (
          <>
            {/* Google Analytics */}
            <Script
              strategy="lazyOnload"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
            />
            <Script
              id="ga-script"
              strategy="lazyOnload"
              dangerouslySetInnerHTML={{
                __html: `
                  if (${onProductionHost}) {
                    window.dataLayer = window.dataLayer || [];
                    window.gtag = function(){ window.dataLayer.push(arguments); };
                    gtag('js', new Date());
                    gtag('config', '${GA_ID}');
                  }
                `
              }}
            />
          </>
        )}

        {!isDevelopment && YM_ID && (
          <>
            {/* Yandex Metrica */}
            <Script
              id="ym-script"
              strategy="lazyOnload"
              dangerouslySetInnerHTML={{
                __html: `
                  if (${onProductionHost}) {
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
                  }
                `
              }}
            />
            {/* Yandex Metrica noscript */}
            <noscript>
              <div>
                <img
                  src={`https://mc.yandex.ru/watch/${YM_ID}`}
                  style={{ position: "absolute", left: "-9999px" }}
                  alt=""
                  width="1"
                  height="1"
                />
              </div>
            </noscript>
          </>
        )}
      </body>
    </html>
  )
}
