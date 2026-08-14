import type { DocumentLanguage } from "../types"

/**
 * The headings PRINTED on the CV — document content, not interface copy.
 *
 * Deliberately here and not in `messages/`, for the same reason the document
 * family keeps its prose in `compose.ts`: these belong to the language of the
 * PAPER, which is a choice the visitor makes, not the language of the site
 * they happen to be reading. A Russian-speaking visitor in Tashkent applying
 * to an Uzbek state organisation writes a Russian-interfaced form and an Uzbek
 * CV, and `useTranslations` cannot express that — it only knows the request
 * locale.
 */
export const SHEET_LABELS = {
  uz: {
    summary: "Qisqacha",
    experience: "Ish tajribasi",
    education: "Ta'lim",
    skills: "Ko'nikmalar",
    languages: "Tillar",
    contact: "Bog'lanish",
    personal: "Qo'shimcha",
    birthDate: "Tug'ilgan sana",
    present: "hozirgacha"
  },
  ru: {
    summary: "Коротко",
    experience: "Опыт работы",
    education: "Образование",
    skills: "Навыки",
    languages: "Языки",
    contact: "Контакты",
    personal: "Дополнительно",
    birthDate: "Дата рождения",
    present: "по настоящее время"
  },
  en: {
    summary: "Summary",
    experience: "Work experience",
    education: "Education",
    skills: "Skills",
    languages: "Languages",
    contact: "Contact",
    personal: "Details",
    birthDate: "Born",
    present: "present"
  }
} as const satisfies Record<DocumentLanguage, Record<string, string>>

export type SheetLabels = (typeof SHEET_LABELS)[DocumentLanguage]
