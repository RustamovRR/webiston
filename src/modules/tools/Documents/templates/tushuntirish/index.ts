import type { DocumentTemplate } from "../../types"
import { composeTushuntirish, validateTushuntirish } from "./compose"
import {
  buildSampleTushuntirish,
  EMPTY_TUSHUNTIRISH,
  TUSHUNTIRISH_FAQ_KEYS,
  type TushuntirishData
} from "./constants"
import { TushuntirishFields } from "./TushuntirishFields"

/** Tushuntirish xati — the written explanation under Mehnat kodeksi 313-modda. */
export const TUSHUNTIRISH_TEMPLATE: DocumentTemplate<TushuntirishData> = {
  slug: "tushuntirish",
  href: "/tools/tushuntirish-xati",
  namespace: "TushuntirishPage",
  fileName: "tushuntirish-xati",
  empty: EMPTY_TUSHUNTIRISH,
  buildSample: buildSampleTushuntirish,
  compose: composeTushuntirish,
  validate: validateTushuntirish,
  faqKeys: TUSHUNTIRISH_FAQ_KEYS,
  Fields: TushuntirishFields
}

export type { Stance, TushuntirishData } from "./constants"
export { TUSHUNTIRISH_FAQ_KEYS } from "./constants"
