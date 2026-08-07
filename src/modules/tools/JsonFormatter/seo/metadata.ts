/**
 * SEO metadata for the JSON formatter.
 *
 * Same shape as the other 14 refactored tools' `seo/` segments. What it
 * replaces lived inline in the route file as ONE hardcoded Uzbek object, so
 * /en/tools/json-formatter and /ru/tools/json-formatter both shipped an Uzbek
 * `<title>` and `<meta description>` — a page in one language advertised in
 * another cannot rank for either.
 *
 * On the wording: a JSON formatter is a commodity in a saturated space, so the
 * copy claims only the two things that are actually differentiating and
 * actually true of `utils/json.ts` — the document never leaves the browser
 * (there is no upload path; `FileReader` reads locally), and it VALIDATES as
 * well as formats, reporting the line and column of the failure. It does not
 * claim conversion to or from YAML/CSV/XML, because the module does none.
 *
 * No `alternates` and no `og:image` here on purpose: the canonical, the
 * hreflang set and the generated share card all depend on the request locale,
 * so the page derives them with `withLocale`. The title carries no
 * "| Webiston" suffix either — the root layout applies a `%s | Webiston`
 * template on top of it.
 */

import type { Metadata } from "next"

import { PRIMARY_KEYWORDS } from "./keywords"

const BASE_URL = "https://webiston.uz"

const COPY = {
  uz: {
    title: "JSON Formatter — JSON'ni formatlash va tekshirish",
    description:
      "JSON'ni o'qish uchun formatlaydi, siqadi va daraxt ko'rinishida ko'rsatadi. Xato bo'lsa, qaysi qator va belgida ekanini aytadi. Matn brauzerdan chiqmaydi.",
    social:
      "JSON'ni formatlang, tekshiring va siqing — bepul, brauzeringizda ishlaydi.",
    ogLocale: "uz_UZ"
  },
  en: {
    // "…— Free, in Your Browser" rendered at 63 chars once the root template
    // appends " | Webiston", past Google's ~60-char cut. The browser claim
    // survives in the description, where there is room for it.
    title: "JSON Formatter and Validator",
    description:
      "Format, minify and browse JSON as a tree, and see the exact line and column when it fails to parse. Free, no signup, and nothing is uploaded to a server.",
    social:
      "Format, validate and minify JSON — free, and nothing leaves your browser.",
    ogLocale: "en_US"
  },
  ru: {
    title: "Форматтер и валидатор JSON — онлайн и бесплатно",
    description:
      "Форматируйте, сжимайте и просматривайте JSON в виде дерева. Если разбор не удался, покажем строку и столбец с ошибкой. Данные не покидают браузер.",
    social:
      "Форматируйте и проверяйте JSON прямо в браузере — бесплатно, без регистрации.",
    ogLocale: "ru_RU"
  }
} as const

/**
 * The static half — everything that does not vary by locale.
 *
 * Kept as a named export because that is what the other tools do and because
 * `getJsonFormatterMetadata` spreads it; the per-locale function below is the
 * one the route calls.
 */
export const jsonFormatterMetadata: Metadata = {
  title: COPY.uz.title,
  description: COPY.uz.description,
  keywords: PRIMARY_KEYWORDS,
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

export function getJsonFormatterMetadata(locale: string): Metadata {
  const copy = COPY[locale as keyof typeof COPY] ?? COPY.uz
  const path =
    locale === "uz"
      ? "/tools/json-formatter"
      : `/${locale}/tools/json-formatter`

  return {
    ...jsonFormatterMetadata,
    title: copy.title,
    description: copy.description,
    openGraph: {
      title: `${copy.title} — Webiston`,
      description: copy.social,
      type: "website",
      locale: copy.ogLocale,
      siteName: "Webiston",
      url: `${BASE_URL}${path}`
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
