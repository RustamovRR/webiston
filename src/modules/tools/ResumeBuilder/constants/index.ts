import type { ResumeData } from "../types"

/**
 * The two templates, and why exactly two: the trash competitors differentiate
 * on template COUNT; this tool differentiates on the two being finished.
 * Each maps to a real local use case, not a style whim. Ids double as
 * message keys and CSS discriminators.
 */
export const TEMPLATES = [
  /** An'anaviy bir ustun — state orgs, traditional employers. Georgia. */
  { id: "klassik" },
  /** Ikki ustunli sidebar — hh.uz office roles. Sans + one accent. */
  { id: "zamonaviy" }
] as const

/**
 * Zamonaviy's accent palette — the §11 documented exception (like the chart
 * palettes): a CV is paper, its colours must not flip with the site theme,
 * so these are literal values in ONE named constant, never inline.
 *
 * Five, all dark enough to carry white text and print legibly in grayscale.
 */
export const ACCENTS = [
  { id: "kok", value: "#1e5a8a" },
  { id: "toq", value: "#1f2937" },
  { id: "yashil", value: "#166534" },
  { id: "qizil", value: "#7f1d1d" },
  { id: "binafsha", value: "#4c1d95" }
] as const

/** The sheet: A4 geometry shared by both templates. Same PAPER exception. */
export const RESUME_PAPER = {
  background: "#ffffff",
  ink: "#111111",
  /** Klassik's face; docx-safe (Georgia ships with Windows and macOS). */
  serifFamily: "Georgia, 'Times New Roman', serif",
  /** Zamonaviy's face on screen; the docx export writes Calibri. */
  sansFamily: "-apple-system, 'Segoe UI', Calibri, Helvetica, Arial, sans-serif"
} as const

/**
 * How a repeating row enters and leaves.
 *
 * One named block rather than four copies of the same props inline, so every
 * section of this form moves identically. Short and small: 180ms with a 4px
 * rise reads as the row settling into place; anything longer starts to feel
 * like waiting, on a form where someone may add ten rows in a row.
 *
 * `height: 0` on exit is what makes the rows below slide up instead of
 * snapping — the collapse and the fade run together.
 */
export const ROW_MOTION = {
  initial: { opacity: 0, height: 0, y: -4 },
  animate: { opacity: 1, height: "auto", y: 0 },
  exit: { opacity: 0, height: 0, y: -4 },
  transition: { duration: 0.18, ease: [0.4, 0, 0.2, 1] }
} as const

/** A fresh form. Template and accent carry defaults; everything else empty. */
export const EMPTY_RESUME: ResumeData = {
  template: "klassik",
  language: "uz",
  script: "lotin",
  accent: "kok",
  photo: "",
  fullName: "",
  role: "",
  contact: {
    phone: "",
    email: "",
    city: "",
    telegram: "",
    linkedin: ""
  },
  personal: { birthDate: "", maritalStatus: "" },
  summary: "",
  experience: [],
  education: [],
  skills: [],
  languages: []
}

/**
 * A worked example — "rezyume namunasi" is the query, so the tool must be
 * able to SHOW one. Deliberately NOT an IT persona: the audience decision
 * (initiatives/resume-builder.md) is the mass jobseeker, and the sample
 * teaches them what a finished one looks like — a sales specialist with two
 * jobs, real Uzbek institutions, and the languages block filled the way the
 * local convention writes it.
 */
export const buildSampleResume = (): ResumeData => ({
  template: "klassik",
  language: "uz",
  script: "lotin",
  accent: "kok",
  photo: "",
  fullName: "Karimova Nilufar Anvarovna",
  role: "Savdo bo'limi mutaxassisi",
  contact: {
    phone: "+998 90 123 45 67",
    email: "nilufar.karimova@example.com",
    city: "Toshkent shahri",
    telegram: "@nilufar_karimova",
    linkedin: ""
  },
  personal: { birthDate: "1999-04-12", maritalStatus: "" },
  summary:
    "Chakana savdoda 4 yillik tajribaga ega mutaxassis: mijozlar bilan " +
    "ishlash, savdo rejasini bajarish va yangi xodimlarni o'rgatish. " +
    "1C hamda CRM tizimlarida ishlayman.",
  experience: [
    {
      id: "sample-exp-1",
      company: "«Texnomart» MChJ",
      role: "Katta savdo maslahatchisi",
      from: "2024-03",
      to: "",
      current: true,
      description:
        "Oylik savdo rejasini o'rtacha 112% ga bajardim.\n" +
        "5 nafar yangi maslahatchini o'qitib, jamoaga moslashtirdim.\n" +
        "Mijozlar shikoyatlarini hal qilish tartibini joriy qildim."
    },
    {
      id: "sample-exp-2",
      company: "«Havas» supermarketlar tarmog'i",
      role: "Savdo maslahatchisi",
      from: "2021-06",
      to: "2024-02",
      current: false,
      description:
        "Kassa va savdo zalida mijozlarga xizmat ko'rsatdim.\n" +
        "Tovarlarni hisobga olish va inventarizatsiyada qatnashdim."
    }
  ],
  education: [
    {
      id: "sample-edu-1",
      institution: "Toshkent davlat iqtisodiyot universiteti",
      field: "Marketing (bakalavr)",
      from: "2017-09",
      to: "2021-06"
    }
  ],
  skills: [
    "Mijozlar bilan ishlash",
    "1C: Savdo",
    "CRM (Bitrix24)",
    "Excel",
    "Muzokara olib borish"
  ],
  languages: [
    { id: "sample-lang-1", name: "O'zbek", level: "ona tili" },
    { id: "sample-lang-2", name: "Rus", level: "erkin" },
    { id: "sample-lang-3", name: "Ingliz", level: "B1" }
  ]
})

/**
 * The three languages a CV can be PRINTED in, and the two scripts Uzbek has.
 *
 * Ordered the way the audience needs them: Uzbek first because that is who
 * this tool is for, Russian second because the local business language is
 * Russian in a large share of offices.
 */
export const DOCUMENT_LANGUAGES = ["uz", "ru", "en"] as const
export const DOCUMENT_SCRIPTS = ["lotin", "kirill"] as const
