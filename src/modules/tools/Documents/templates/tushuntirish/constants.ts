import { addCalendarDays, isoDate } from "../../utils/dates"

/**
 * Tushuntirish xati — the written explanation an employer must ask for BEFORE
 * applying a disciplinary sanction.
 *
 * The ground is the new Mehnat kodeksi (in force 30 April 2023), **313-modda**:
 * a disciplinary measure may not be applied until a written explanation has
 * been demanded from the employee. Refusing to write one does not stop the
 * sanction — the employer records the refusal in a statement drawn up with
 * witnesses — which is exactly why writing one matters, and why it is worth
 * writing well. Sources cited on the page: lex.uz (MK 313-modda),
 * toshkent-vil.adliya.uz, yuristpro.uz.
 *
 * What this tool CONTRIBUTES over the .doc dumps: the closing position. A
 * tushuntirish xati that admits the act and one that denies it are different
 * documents in a dispute — the first is evidence against the writer, the
 * second obliges the employer to gather more proof. People copy a template
 * that admits everything without noticing they had a choice.
 */

export interface TushuntirishData {
  /** «Webiston» MChJ — written as the visitor would write it on the form. */
  organisation: string
  /** "direktori", "rahbari", "bosh shifokori" — already a genitive. */
  managerRole: string
  managerName: string
  employeeName: string
  position: string
  /** ISO. The day the thing being explained happened. */
  incidentDate: string
  /** What happened, worded as the sentence takes it: "ishga kechikib kelganim". */
  subject: string
  /** The explanation itself. Each line becomes its own paragraph. */
  explanation: string
  stance: Stance
  /** ISO. The day the note is handed in. */
  documentDate: string
}

/**
 * How the note ENDS — the one choice with legal weight on this page.
 *
 * Three, not two: the middle one is what most real cases are. It admits the
 * fact while putting the cause on the record, which is what makes a sanction
 * disproportionate rather than unfounded.
 */
export const STANCES = [
  {
    id: "qisman",
    phrase:
      "Holat yuz berganini tan olaman, biroq u yuqorida ko'rsatilgan uzrli " +
      "sabab tufayli sodir bo'ldi. Shuni inobatga olishingizni so'rayman."
  },
  {
    id: "tan",
    phrase:
      "Yuqorida bayon etilgan holatni to'liq tan olaman va kelgusida bunday " +
      "hol takrorlanishiga yo'l qo'ymasligimga kafolat beraman."
  },
  {
    id: "rad",
    phrase:
      "Mazkur holatda mehnat intizomini buzganim yo'q deb hisoblayman va " +
      "yuqorida bayon etilgan sabablarni inobatga olishingizni so'rayman."
  }
] as const

export type Stance = (typeof STANCES)[number]["id"]

export const TUSHUNTIRISH_FAQ_KEYS = [
  "law",
  "deadline",
  "refuse",
  "deny",
  "content",
  "privacy"
] as const

/** A fresh form. "direktori" is pre-filled: it fits most workplaces. */
export const EMPTY_TUSHUNTIRISH: TushuntirishData = {
  organisation: "",
  managerRole: "direktori",
  managerName: "",
  employeeName: "",
  position: "",
  incidentDate: "",
  subject: "",
  explanation: "",
  stance: "qisman",
  documentDate: ""
}

/**
 * A worked example — the whole reason people search "tushuntirish xati
 * namunasi", and the part a blank form cannot teach: what belongs in the
 * explanation and how much of it.
 *
 * The incident is YESTERDAY and the note is TODAY, because that is the real
 * sequence — the note is written after the employer asks, never on the day
 * itself. Two paragraphs, because the second one (what the writer did about
 * it) is the part people leave out and the part that reads best.
 */
export const buildSampleTushuntirish = (now: Date): TushuntirishData => ({
  organisation: "«Webiston» MChJ",
  managerRole: "direktori",
  managerName: "Aliyev Anvar Alisherovich",
  employeeName: "Karimov Salim Anvarovich",
  position: "dasturchi",
  incidentDate: addCalendarDays(isoDate(now), -1),
  subject: "ish kunining boshlanishiga 40 daqiqa kechikib kelganim",
  explanation:
    "O'sha kuni ertalab yashash joyimdan ish joyiga qatnaydigan yo'lda yo'l-" +
    "transport hodisasi yuz berdi va jamoat transporti harakati to'xtab " +
    "qoldi. Boshqa yo'nalish orqali yetib kelishga harakat qildim.\n" +
    "Kechikishim haqida bevosita rahbarimni telefon orqali darhol " +
    "ogohlantirdim va ish vaqtining yo'qotilgan qismini o'sha kuni ish " +
    "kunidan so'ng qoplab berdim.",
  stance: "qisman",
  documentDate: isoDate(now)
})
