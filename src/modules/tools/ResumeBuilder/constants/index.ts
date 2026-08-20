import type { ResumeData } from "../types"

/**
 * The two templates, and why exactly two: the trash competitors differentiate
 * on template COUNT; this tool differentiates on the two being finished.
 * Each maps to a real local use case, not a style whim. Ids double as
 * message keys and CSS discriminators.
 */
export const TEMPLATES = [
  /** An'anaviy bir ustun — state orgs, traditional employers. Serif. */
  { id: "klassik" },
  /** Ikki ustunli sidebar — hh.uz office roles. Sans + one accent. */
  { id: "zamonaviy" }
] as const

/**
 * Zamonaviy's suggested accents — the §11 documented exception (like the chart
 * palettes): a CV is paper, its colours must not flip with the site theme,
 * so these are literal values in ONE named constant, never inline.
 *
 * PRESETS, not the whole choice: `data.accent` holds a hex, and the picker
 * next to these five opens the OS colour wheel. Five curated swatches answer
 * "I just want it to look right" in one click; the wheel answers "our company
 * colour is this exact green", which is a real thing people ask a CV to do.
 * The guard against a neon-yellow heading is not a locked palette — it is the
 * contrast readout the picker shows, which states the problem instead of
 * quietly overruling the choice.
 *
 * All five are dark enough to carry the headings on white and to survive a
 * grayscale printer.
 */
export const ACCENTS = [
  { id: "kok", value: "#1e5a8a" },
  { id: "toq", value: "#1f2937" },
  { id: "yashil", value: "#166534" },
  { id: "qizil", value: "#7f1d1d" },
  { id: "binafsha", value: "#4c1d95" }
] as const

/** What an unset — or unreadable — accent falls back to. */
export const DEFAULT_ACCENT = ACCENTS[0].value

/**
 * The ratio an accent must clear against the paper to be used as TEXT.
 *
 * WCAG AA for body text. The section headings are 11–12px, so the large-text
 * allowance (3:1) does not apply to them, and a CV that a tired recruiter
 * cannot skim has failed at the only job it has.
 */
export const ACCENT_MIN_CONTRAST = 4.5

/** The sheet: A4 geometry shared by both templates. Same PAPER exception. */
export const RESUME_PAPER = {
  background: "#ffffff",
  ink: "#111111",
  /**
   * Klassik's face — and the reason it is NOT Georgia any more.
   *
   * Georgia's figures are OLDSTYLE: 3, 4, 5, 7 and 9 hang below the baseline
   * and 0, 1, 2 sit at x-height. Beautiful in running prose, wrong on a CV,
   * where the numbers are a phone number and a set of dates and they read as
   * broken type — which is exactly how it was reported. `font-variant-numeric:
   * lining-nums` does NOT fix it: rendered side by side, the default, the
   * `lining-nums` and the `'lnum' 1` lines are pixel-identical, because plain
   * Georgia carries no lining set to switch to. So the face changes instead.
   *
   * Charter (macOS) → Cambria (Windows, since Vista — a system font, not an
   * Office one) → Times New Roman (everywhere). All three are book serifs with
   * lining figures, and the fallback is never reached before a real serif is.
   */
  serifFamily: "Charter, Cambria, 'Times New Roman', Times, serif",
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
  accent: DEFAULT_ACCENT,
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
  accent: DEFAULT_ACCENT,
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

/**
 * The page-break hairline drawn across the preview every A4.
 *
 * Part of the PAPER exception: it is an artefact of the sheet, not interface
 * chrome, so it must not flip with the site theme. Hidden in print — the
 * paper genuinely ends there, so a printed line would be a lie.
 */
export const PAGE_GUIDE =
  "repeating-linear-gradient(to bottom, transparent 0, transparent calc(297mm - 1px), rgba(17,17,17,0.18) calc(297mm - 1px), rgba(17,17,17,0.18) 297mm)"

/**
 * The questions this tool answers below the form.
 *
 * Not decoration and not filler: 18 of the 21 tools here publish a FAQ, and
 * the resume builder was one of the three without one — the single largest
 * on-page SEO gap it had, because these questions ARE the search queries.
 * "rezyumega surat kerakmi" is typed, not browsed.
 *
 * The route publishes `FAQPage` structured data from the same message keys
 * this list renders, so the rich result can never describe an answer the page
 * does not contain — Google treats that as a violation, and rightly.
 *
 * Ordered by what stops someone finishing a CV, not by what is easiest to
 * answer: the photo and the language decision come before formatting trivia.
 */
export const FAQ_KEYS = [
  "photo",
  "language",
  "script",
  "length",
  "personal",
  "fileFormat",
  "noExperience",
  "privacy"
] as const
