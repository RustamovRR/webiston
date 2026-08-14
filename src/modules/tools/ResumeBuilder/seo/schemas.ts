import { toolBreadcrumbSchema } from "@/lib/seo"

/**
 * Structured data for the resume builder. Same rule as every tool here:
 * every claim in `featureList` is something the code actually does today —
 * no docx or template switcher listed until they ship.
 */

const BASE_URL = "https://webiston.uz"

export const applicationSchema = {
  "@context": "https://schema.org",
  "@type": ["WebApplication", "SoftwareApplication"],
  name: "Rezyume yaratish",
  alternateName: [
    "Rezyume namunasi",
    "CV yaratish",
    "Создать резюме онлайн (Узбекистан)"
  ],
  description:
    "Ish qidiruvchilar uchun bepul rezyume yaratish vositasi: ma'lumotlarni to'ldiring, tayyor rezyumeni chop eting. O'zbekistondagi talablar hisobga olingan, barcha ma'lumot faqat brauzerda saqlanadi.",
  url: `${BASE_URL}/tools/rezyume`,
  applicationCategory: ["BusinessApplication", "UtilityApplication"],
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  isAccessibleForFree: true,
  offers: { "@type": "Offer", price: "0", priceCurrency: "UZS" },
  author: { "@type": "Organization", name: "Webiston", url: BASE_URL },
  publisher: { "@type": "Organization", name: "Webiston", url: BASE_URL },
  featureList: [
    "Rezyumeni bo'limlar bo'yicha to'ldirish",
    "Ish tajribasi va ta'limni tartibini o'zgartirish",
    "O'zbekistondagi odat: tug'ilgan sana va suratga joy (ixtiyoriy)",
    "Tayyor namunani ko'rish",
    "Chop etishga tayyor A4 varaq",
    "Ma'lumot faqat qurilmangizda saqlanadi"
  ],
  inLanguage: ["uz", "en", "ru"]
}

export function generateBreadcrumbSchema(locale: string) {
  return toolBreadcrumbSchema(locale, "rezyume", "Rezyume yaratish")
}
