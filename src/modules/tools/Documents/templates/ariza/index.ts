import type { DocumentTemplate } from "../../types"
import { ArizaFields } from "./ArizaFields"
import { composeAriza, validateAriza } from "./compose"
import {
  ARIZA_FAQ_KEYS,
  type ArizaData,
  buildSampleAriza,
  EMPTY_ARIZA
} from "./constants"

/** Ishdan bo'shash arizasi — resignation, under Mehnat kodeksi 160-modda. */
export const ARIZA_TEMPLATE: DocumentTemplate<ArizaData> = {
  slug: "ariza",
  href: "/tools/ishdan-boshash-arizasi",
  namespace: "ArizaPage",
  fileName: "ariza",
  empty: EMPTY_ARIZA,
  buildSample: buildSampleAriza,
  compose: composeAriza,
  validate: validateAriza,
  headings: { lotin: "ARIZA", kirill: "АРИЗА" },
  faqKeys: ARIZA_FAQ_KEYS,
  Fields: ArizaFields
}

export type { ArizaData } from "./constants"
export { ARIZA_FAQ_KEYS } from "./constants"
