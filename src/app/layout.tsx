import "./globals.css"
import { Metadata } from "next"
import Script from "next/script"
import dynamic from "next/dynamic"
import { Inter } from "next/font/google"
import { Toaster } from "sonner"
import { ThemeProvider } from "@/components/shared/Providers"
import NextTopLoader from "nextjs-toploader"

const inter = Inter({ subsets: ["latin"] })

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
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Webiston - O'zbek Dasturchilari uchun Professional Platforma",
        type: "image/png"
      }
    ]
  },
  other: {
    "msapplication-TileColor": "#000000",
    "theme-color": "#000000"
  },
  twitter: {
    card: "summary_large_image",
    site: "@webiston_uz",
    creator: "@webiston_uz",
    title: "Webiston - O'zbek Dasturchilari uchun Professional Platforma",
    description:
      "O'zbek dasturchilari uchun keng qamrovli xizmatlar. Dasturlash kitoblari, foydali vositalar va professional resurslar.",
    images: ["/logo.png"]
  },
  alternates: {
    canonical: "https://webiston.uz",
    languages: {
      uz: "https://webiston.uz",
      en: "https://webiston.uz/en",
      "x-default": "https://webiston.uz"
    }
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
  icons: {
    icon: [
      { type: "image/png", url: "/favicon-32x32.png", sizes: "32x32" },
      { type: "image/png", url: "/favicon-16x16.png", sizes: "16x16" },
      { type: "image/x-icon", url: "/favicon.ico", sizes: "48x48" }
    ],
    shortcut: "/favicon.ico",
    apple: {
      sizes: "180x180",
      url: "/apple-touch-icon.png",
      href: "/apple-touch-icon.png"
    }
  },
  manifest: "/site.webmanifest",
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
  inLanguage: ["uz", "en"],
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
      <body className={inter.className}>
        <NextTopLoader color="#3b82f6" height={2} showSpinner={false} />
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
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_ID}');
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
