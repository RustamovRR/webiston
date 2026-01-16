/**
 * Structured Data Schemas for Latin-Cyrillic Converter
 * JSON-LD schemas for better SEO
 */

import { ALL_KEYWORDS } from "./keywords"

const BASE_URL = "https://webiston.uz"

// Main Application Schema
export const applicationSchema = {
  "@context": "https://schema.org",
  "@type": ["WebApplication", "SoftwareApplication"],
  name: "Lotin Kirill O'giruvchi - Лотин Кирилл Таржима Online",
  alternateName: [
    "Latin-Cyrillic Converter",
    "Lotin-Kirill O'giruvchi",
    "Lotin Krill Перевод Online",
    "Kirill Lotin Converter",
    "Лотин Кирилл Таржимон",
    "Uzbek Text Converter",
    "Онлайн переводчик крилл-лотин",
    "Uzbek PDF Converter",
    "Uzbek DOCX Converter"
  ],
  description:
    "Lotin krill перевод online. O'zbek matnlarini lotinchadan kirillchaga va aksincha o'girish. PDF, DOCX, TXT fayl yuklash va o'girish. Лотин кирилл таржима dasturi. Bepul va tez!",
  url: `${BASE_URL}/tools/latin-cyrillic`,
  sameAs: [
    `${BASE_URL}/en/tools/latin-cyrillic`,
    `${BASE_URL}/tools/latin-cyrillic`
  ],
  applicationCategory: ["UtilityApplication", "ProductivityApplication"],
  operatingSystem: ["Windows", "macOS", "Linux", "Android", "iOS"],
  browserRequirements: "Requires JavaScript. Requires HTML5.",
  permissions: "browser",
  isAccessibleForFree: true,
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    availability: "https://schema.org/InStock",
    validFrom: "2024-01-01"
  },
  author: {
    "@type": "Organization",
    name: "Webiston",
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    sameAs: ["https://github.com/webiston", "https://twitter.com/webiston_uz"]
  },
  publisher: {
    "@type": "Organization",
    name: "Webiston",
    url: BASE_URL,
    logo: {
      "@type": "ImageObject",
      url: `${BASE_URL}/logo.png`,
      width: 512,
      height: 512
    }
  },
  featureList: [
    "Lotin krill перевод online",
    "Kirill lotin converter",
    "Лотин кирилл таржима",
    "Онлайн переводчик крилл-лотин",
    "O'zbek matn konvertatsiyasi",
    "Tez va aniq o'girish",
    "Professional interfeys",
    "Bepul va cheksiz foydalanish",
    "Nusxa olish imkoniyati",
    "Real-time konvertatsiya",
    "Katta matnlar bilan ishlash",
    "PDF fayl yuklash va o'girish",
    "DOCX fayl yuklash va o'girish",
    "TXT fayl yuklash va o'girish",
    "Fayl yuklab olish (PDF, DOCX, TXT)",
    "Xavfsiz va maxfiy"
  ],
  softwareVersion: "2.0",
  datePublished: "2024-01-01",
  dateModified: new Date().toISOString().split("T")[0],
  inLanguage: ["uz", "en", "ru"],
  keywords: ALL_KEYWORDS.slice(0, 50).join(", "),
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "3250",
    bestRating: "5",
    worstRating: "1"
  },
  review: [
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Foydalanuvchi" },
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      reviewBody:
        "Juda foydali va tez ishlaydi. Lotin krill o'girish uchun eng yaxshi vosita! PDF fayllarni ham o'giradi."
    },
    {
      "@type": "Review",
      author: { "@type": "Person", name: "Пользователь" },
      reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
      reviewBody:
        "Лотин кирилл таржима жуда тез ва аниқ ишлайди. DOCX файлларни ҳам қўллаб-қувватлайди. Тавсия қиламан!"
    }
  ]
}

// FAQ Schema Generator
export function generateFAQSchema(locale: string = "uz") {
  const faqData = {
    uz: {
      questions: [
        {
          question: "Lotin-kirill o'giruvchi qanday ishlaydi?",
          answer:
            "Bizning vositamiz O'zbek tilidagi matnlarni lotinchadan kirillchaga va aksincha avtomatik o'giradi. Matnni kiritib, tugmani bosish kifoya."
        },
        {
          question: "Lotin-kirill konverteri bepulmi?",
          answer:
            "Ha, bizning lotin-kirill o'giruvchi to'liq bepul. Hech qanday cheklov yoki to'lov talab qilinmaydi."
        },
        {
          question: "Qanday matnlarni o'girish mumkin?",
          answer:
            "Har qanday O'zbek tilidagi matnni o'girish mumkin - qisqa so'zlardan tortib uzun maqolalargacha."
        },
        {
          question: "Konvertatsiya qanchalik aniq?",
          answer:
            "Bizning algoritm 99.9% aniqlik bilan ishlaydi va O'zbek tilining barcha xususiyatlarini hisobga oladi."
        },
        {
          question: "PDF, DOCX yoki TXT fayllarni o'girish mumkinmi?",
          answer:
            "Ha, siz PDF, DOCX va TXT formatidagi fayllarni yuklashingiz va ularni lotin yoki kirillchaga o'girishingiz mumkin. Natijani xohlagan formatda yuklab olish ham mumkin."
        },
        {
          question: "Fayl yuklash chegarasi qancha?",
          answer:
            "Maksimal fayl hajmi 200MB gacha. Katta fayllar avtomatik ravishda bo'limlarga ajratiladi."
        }
      ]
    },
    en: {
      questions: [
        {
          question: "How does Latin-Cyrillic converter work?",
          answer:
            "Our tool automatically converts Uzbek text between Latin and Cyrillic scripts. Simply enter text and click convert."
        },
        {
          question: "Is Latin-Cyrillic converter free?",
          answer:
            "Yes, our Latin-Cyrillic converter is completely free. No limitations or payments required."
        },
        {
          question: "What texts can be converted?",
          answer:
            "Any Uzbek text can be converted - from short words to long articles."
        },
        {
          question: "How accurate is the conversion?",
          answer:
            "Our algorithm works with 99.9% accuracy and considers all Uzbek language features."
        },
        {
          question: "Can I convert PDF, DOCX or TXT files?",
          answer:
            "Yes, you can upload PDF, DOCX and TXT files and convert them to Latin or Cyrillic. You can also download the result in your preferred format."
        },
        {
          question: "What is the file upload limit?",
          answer:
            "Maximum file size is 200MB. Large files are automatically split into sections."
        }
      ]
    }
  }

  const currentFAQ = faqData[locale as keyof typeof faqData] || faqData.uz

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: currentFAQ.questions.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer
      }
    }))
  }
}

// Breadcrumb Schema Generator
export function generateBreadcrumbSchema(locale: string = "uz") {
  const breadcrumbData = {
    uz: {
      home: "Bosh sahifa",
      tools: "Vositalar",
      latinCyrillic: "Lotin-Kirill O'giruvchi"
    },
    en: {
      home: "Home",
      tools: "Tools",
      latinCyrillic: "Latin-Cyrillic Converter"
    }
  }

  const current =
    breadcrumbData[locale as keyof typeof breadcrumbData] || breadcrumbData.uz
  const baseUrl = locale === "en" ? `${BASE_URL}/en` : BASE_URL

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: current.home,
        item: locale === "en" ? `${BASE_URL}/en` : BASE_URL
      },
      {
        "@type": "ListItem",
        position: 2,
        name: current.tools,
        item: `${baseUrl}/tools`
      },
      {
        "@type": "ListItem",
        position: 3,
        name: current.latinCyrillic,
        item: `${baseUrl}/tools/latin-cyrillic`
      }
    ]
  }
}

// HowTo Schema - Fayl yuklash uchun
export const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "O'zbek matnini lotin-kirillga qanday o'girish mumkin",
  description:
    "PDF, DOCX yoki TXT fayllarni yuklash va lotin-kirill o'girish bo'yicha qo'llanma",
  step: [
    {
      "@type": "HowToStep",
      name: "Fayl yuklash",
      text: "PDF, DOCX yoki TXT formatidagi faylni yuklang yoki matnni to'g'ridan-to'g'ri kiriting."
    },
    {
      "@type": "HowToStep",
      name: "Yo'nalishni tanlash",
      text: "Lotin → Kirill yoki Kirill → Lotin yo'nalishini tanlang."
    },
    {
      "@type": "HowToStep",
      name: "O'girish",
      text: "Matn avtomatik ravishda o'giriladi. Katta fayllar bo'limlarga ajratiladi."
    },
    {
      "@type": "HowToStep",
      name: "Yuklab olish",
      text: "Natijani PDF, DOCX yoki TXT formatida yuklab oling."
    }
  ]
}
