import type { DocumentTemplate } from "../../types"
import { composeTilxat, validateTilxat } from "./compose"
import {
  buildSampleTilxat,
  EMPTY_TILXAT,
  TILXAT_FAQ_KEYS,
  type TilxatData
} from "./constants"
import { TilxatFields } from "./TilxatFields"

/** The qarz tilxati — a loan receipt, and the family's first document. */
export const TILXAT_TEMPLATE: DocumentTemplate<TilxatData> = {
  slug: "tilxat",
  href: "/tools/tilxat",
  namespace: "TilxatPage",
  fileName: "tilxat",
  empty: EMPTY_TILXAT,
  buildSample: buildSampleTilxat,
  compose: composeTilxat,
  validate: validateTilxat,
  headings: { lotin: "TILXAT", kirill: "ТИЛХАТ" },
  faqKeys: TILXAT_FAQ_KEYS,
  Fields: TilxatFields
}

export type { TilxatData } from "./constants"
export { TILXAT_FAQ_KEYS } from "./constants"
