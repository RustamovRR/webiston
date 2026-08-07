/**
 * SEO for the tools INDEX (`/tools`, `/en/tools`, `/ru/tools`).
 *
 * Same shape as a tool's `seo/metadata.ts` — `COPY` keyed by locale, a getter
 * that picks a branch, and `withLocale` on the route supplying the canonical,
 * the hreflang set and the share card. It lives HERE rather than under
 * `src/modules/tools/` because this page has no module folder:
 * `ToolsMainPage.tsx` is a flat file, and inventing a `ToolsIndex/` directory
 * to hold one metadata file would be a folder built for a convention rather
 * than for a consumer. Co-locating is already how this route tree handles
 * page-specific code (`microphone-test/MicrophoneTestClient.tsx`,
 * `camera-recorder/CameraRecorderClient.tsx`), and only the reserved App
 * Router filenames — `page`, `layout`, `route`, `template`, `default`,
 * `loading`, `error`, `not-found` — are special, so `seo.ts` is inert.
 *
 * What it replaces: one hardcoded Uzbek object served to all three locales, so
 * `/en/tools` and `/ru/tools` published the title "Bepul Onlayn Vositalar" and
 * an Uzbek description. This is the site's main hub page; those two URLs could
 * not rank for an English or Russian query at all.
 */

import type { Metadata } from "next"

import { TOOLS_LIST } from "@/constants"
import { BREADCRUMB_ROOT, localeUrl } from "@/lib/seo"

/**
 * Counted, never typed.
 *
 * The copy below promises a number of tools, and a promise in a `<meta
 * description>` is the kind that rots quietly — the schema block on this very
 * page shipped `numberOfItems: 15` against 17 tools until it was derived. The
 * same list the page renders is the one the sentence counts.
 */
const TOOL_COUNT = TOOLS_LIST.length

/**
 * The title and description a person reads in a search result.
 *
 * Written as sentences, not keyword lists — the ranking value of stuffing the
 * description died a decade ago, and the human deciding whether to click is
 * still there. The keyword ARRAY below keeps that job.
 *
 * `title` carries no "| Webiston" suffix: the root layout applies a
 * `%s | Webiston` template on top (`src/app/layout.tsx:61`), so adding one
 * here double-suffixes. Each title also matches the H1 the page actually
 * renders (`ToolsPage.Main.title` in `messages/tools/tools-page/*`), because a
 * search result that promises a different heading than the page shows is a
 * bounce.
 *
 * The claims are deliberately narrow. "Runs in your browser" is true of all
 * 17 — they are client-side tools and none needs an account. "Your data never
 * leaves the browser" would NOT be: IP Info calls an external lookup
 * (`src/modules/tools/IpInfo/hooks/useIpLookup.ts:116`). That per-tool promise
 * belongs on the tools that can keep it, not on the hub.
 */
const COPY = {
  uz: {
    title: `Onlayn vositalar — ${TOOL_COUNT} ta bepul dasturchi vositasi`,
    description: `JSON formatlash, Base64, JWT, hash, QR kod, parol va rang o'giruvchi — ${TOOL_COUNT} ta bepul vosita. Hammasi brauzeringizda ishlaydi, ro'yxatdan o'tish shart emas.`,
    social: `${TOOL_COUNT} ta bepul dasturchi vositasi: JSON, Base64, JWT, hash, QR kod. Brauzerda ishlaydi.`,
    ogLocale: "uz_UZ"
  },
  en: {
    title: `Online Tools — ${TOOL_COUNT} Free Utilities for Developers`,
    description: `JSON formatting, Base64, JWT decoding, hashes, QR codes, passwords and color conversion — ${TOOL_COUNT} free tools that run in your browser, with no signup.`,
    social: `${TOOL_COUNT} free developer tools: JSON, Base64, JWT, hashes, QR codes. They run in your browser.`,
    ogLocale: "en_US"
  },
  ru: {
    title: `Онлайн-инструменты — ${TOOL_COUNT} бесплатных утилит`,
    description: `Форматтер JSON, Base64, декодер JWT, хеши, QR-коды, генератор паролей и конвертер цветов — ${TOOL_COUNT} бесплатных инструментов прямо в браузере, без регистрации.`,
    social: `${TOOL_COUNT} бесплатных инструментов для разработчиков: JSON, Base64, JWT, хеши, QR-коды. Прямо в браузере.`,
    ogLocale: "ru_RU"
  }
} as const

/**
 * Kept verbatim from the inline metadata this file replaces.
 *
 * Trilingual by design — this hub is the one page where a Russian and an
 * English head term compete for the same document, and `keywords` is the field
 * where that belongs, rather than in the sentence a human reads.
 */
export const TOOLS_INDEX_KEYWORDS = [
  // O'zbek tilida eng ko'p qidirilgan
  "bepul vositalar",
  "onlayn tools",
  "developer tools",
  "dasturchi vositalari",
  "web tools",
  "veb vositalar",
  "utility tools",
  "foydali vositalar",
  "programming tools",
  "dasturlash vositalari",
  "qr generator",
  "json formatter",
  "base64 converter",
  "url encoder",
  "password generator",
  "parol yaratish",
  "latin kirill",
  "jwt decoder",
  "color converter",
  "rang konverter",
  "webiston tools",
  "professional tools",

  // Ingliz tilida
  "free online tools",
  "developer tools",
  "web development tools",
  "programming utilities",
  "coding tools",
  "online utilities",
  "free web tools",
  "developer utilities",
  "programming resources",
  "web developer tools",
  "online developer tools",
  "free coding tools",
  "utility applications",
  "development resources",
  "web utilities",

  // Rus tilida
  "бесплатные онлайн инструменты",
  "инструменты разработчика",
  "веб инструменты",
  "утилиты программирования",
  "инструменты кодирования",
  "онлайн утилиты",
  "бесплатные веб инструменты",
  "ресурсы разработчика",
  "программные утилиты",

  // Long-tail keywords
  "bepul onlayn dasturchi vositalari",
  "professional web development tools free",
  "бесплатные профессиональные инструменты разработчика",
  "webiston developer tools collection",
  "uzbek developer tools"
] as const

/** The locale-independent half — robots, category, and the rest. */
export const toolsIndexMetadata: Metadata = {
  title: COPY.uz.title,
  description: COPY.uz.description,
  keywords: [...TOOLS_INDEX_KEYWORDS],
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
  category: "technology",
  classification: "Tools and Utilities",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false
  }
}

/**
 * The page's metadata in the requested locale.
 *
 * No `alternates` and no hardcoded OpenGraph image: the route wraps this in
 * `withLocale(..., locale, "/tools")`, which owns the canonical, the hreflang
 * set, `og:url`, `og:locale` and the generated share card. The `url` and
 * `locale` set here are the pattern the 14 refactored tools use; `withLocale`
 * overwrites both.
 */
export function getToolsIndexMetadata(locale: string): Metadata {
  const copy = COPY[locale as keyof typeof COPY] ?? COPY.uz

  return {
    ...toolsIndexMetadata,
    title: copy.title,
    description: copy.description,
    openGraph: {
      title: `${copy.title} — Webiston`,
      description: copy.social,
      type: "website",
      locale: copy.ogLocale,
      siteName: "Webiston",
      url: localeUrl(locale, "/tools")
    },
    twitter: {
      card: "summary_large_image",
      site: "@webiston_uz",
      creator: "@webiston_uz",
      title: `${copy.title} — Webiston`,
      description: copy.social
    }
  }
}

/**
 * `BreadcrumbList` for the index — two crumbs, Home → Tools.
 *
 * Not `toolBreadcrumbSchema`: that one is three crumbs ending at
 * `/tools/<slug>`, and a trail whose terminal URL is not the page it sits on
 * is discarded by Google. The labels come from the SAME table the tool pages
 * use, so the second crumb here and the second crumb on every tool page can
 * never disagree, and the URLs come from `localeUrl` — the function the
 * canonical is built from — so `/ru/tools` finally publishes `/ru` URLs
 * instead of the Uzbek ones the old `locale === "en"` branch produced.
 */
export function generateBreadcrumbSchema(locale: string) {
  const labels =
    BREADCRUMB_ROOT[locale as keyof typeof BREADCRUMB_ROOT] ??
    BREADCRUMB_ROOT.uz

  const trail = [
    { name: labels.home, path: "/" },
    { name: labels.tools, path: "/tools" }
  ]

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: localeUrl(locale, crumb.path)
    }))
  }
}
