import { toolBreadcrumbSchema } from "@/lib/seo"

/**
 * Structured data for the code-snapshot tool.
 *
 * `featureList` claims only what the module does. It is tempting to write
 * "animated code presentations" because a competitor has them; a reviewer or a
 * visitor who arrives expecting one is a worse outcome than a shorter list.
 */
export const applicationSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Code Snapshot",
  url: "https://webiston.uz/tools/code-snapshot",
  applicationCategory: "DeveloperApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "UZS"
  },
  featureList: [
    "65 syntax themes",
    "360+ programming languages",
    "Four coding fonts with Cyrillic support",
    "macOS, plain or no window frame",
    "Gradient and solid backgrounds",
    "Optional line numbers",
    "PNG export at 1x, 2x and 3x",
    "Copy the image straight to the clipboard",
    "Runs entirely in the browser — nothing is uploaded"
  ],
  isAccessibleForFree: true,
  inLanguage: ["uz", "en", "ru"]
} as const

const FAQ_ITEMS = {
  uz: [
    {
      question: "Kodim serverga yuboriladimi?",
      answer:
        "Yo'q. Kod brauzeringizdan chiqmaydi — rangli ajratish ham, rasm chizish ham qurilmangizda bajariladi. Hech qanday server, hech qanday hisob kerak emas."
    },
    {
      question: "Qaysi dasturlash tillari qo'llab-quvvatlanadi?",
      answer:
        "360 dan ortiq til. Ular VS Code ishlatadigan grammatikalarning aynan o'zi, shuning uchun ranglar muharriringizdagi bilan bir xil chiqadi."
    },
    {
      question: "Rasm sifati qanday? Prezentatsiyaga yaraydimi?",
      answer:
        "1x, 2x va 3x variantlari bor. 2x standart — u Retina ekranda ham, slaydda ham aniq ko'rinadi. Rasm piksel bo'yicha qaytadan chiziladi, kattalashtirilmaydi."
    },
    {
      question: "Kirill harflari to'g'ri chiqadimi?",
      answer:
        "Ha. To'rtala shrift ham kirill qamrovi bilan yuklanadi, shuning uchun izohlaringiz kirillda bo'lsa ham rasm to'g'ri chiqadi."
    },
    {
      question: "Rasmni to'g'ridan-to'g'ri nusxalash mumkinmi?",
      answer:
        "Ha, «Nusxalash» tugmasi rasmni buferga yozadi — Telegram yoki hujjatga darhol qo'yishingiz mumkin. Brauzer ruxsat bermasa, u avtomatik yuklab olishga o'tadi."
    }
  ],
  en: [
    {
      question: "Is my code sent to a server?",
      answer:
        "No. Nothing leaves your browser — both the highlighting and the drawing happen on your device. There is no server and no account."
    },
    {
      question: "Which languages are supported?",
      answer:
        "Over 360. They are the same TextMate grammars VS Code uses, so the colours match what you see in your editor rather than approximating them."
    },
    {
      question: "What quality is the image? Is it good enough for slides?",
      answer:
        "Export at 1x, 2x or 3x. 2x is the default and stays sharp on a retina screen and in a presentation. The picture is redrawn at that resolution, never upscaled."
    },
    {
      question: "Does it handle Cyrillic?",
      answer:
        "Yes. All four fonts are loaded with Cyrillic coverage, so comments in Cyrillic render correctly instead of as empty boxes."
    },
    {
      question: "Can I copy the image directly?",
      answer:
        "Yes — the Copy button writes the image to your clipboard, ready to paste into a chat or a document. If your browser blocks it, the tool falls back to a download."
    }
  ],
  ru: [
    {
      question: "Отправляется ли мой код на сервер?",
      answer:
        "Нет. Код не покидает браузер — и подсветка, и отрисовка выполняются на вашем устройстве. Ни сервера, ни аккаунта."
    },
    {
      question: "Какие языки поддерживаются?",
      answer:
        "Более 360. Это те же грамматики TextMate, что использует VS Code, поэтому цвета совпадают с вашим редактором, а не приближаются к нему."
    },
    {
      question: "Какое качество картинки? Подойдёт для презентации?",
      answer:
        "Экспорт в 1x, 2x или 3x. По умолчанию 2x — этого хватает и для retina-экрана, и для слайда. Картинка перерисовывается в этом разрешении, а не растягивается."
    },
    {
      question: "Корректно ли отображается кириллица?",
      answer:
        "Да. Все четыре шрифта загружаются с кириллическим набором, поэтому комментарии на кириллице выглядят правильно."
    },
    {
      question: "Можно ли скопировать картинку сразу?",
      answer:
        "Да, кнопка «Копировать» кладёт изображение в буфер обмена. Если браузер это запрещает, инструмент автоматически предложит скачивание."
    }
  ]
} as const

export function getFaqItems(locale: string = "uz") {
  return FAQ_ITEMS[locale as keyof typeof FAQ_ITEMS] ?? FAQ_ITEMS.uz
}

/** Matches each locale's `ToolHeader.title`, so crumb and heading agree. */
const BREADCRUMB_NAME = {
  uz: "Koddan Rasm Yasash",
  en: "Code to Image",
  ru: "Код в картинку"
} as const

export function generateBreadcrumbSchema(locale: string = "uz") {
  const name =
    BREADCRUMB_NAME[locale as keyof typeof BREADCRUMB_NAME] ??
    BREADCRUMB_NAME.uz
  return toolBreadcrumbSchema(locale, "code-snapshot", name)
}
