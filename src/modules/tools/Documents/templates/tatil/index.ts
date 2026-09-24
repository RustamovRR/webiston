import type { DocumentTemplate } from "../../types"
import { composeTatil, validateTatil } from "./compose"
import {
  buildSampleTatil,
  EMPTY_TATIL,
  TATIL_FAQ_KEYS,
  type TatilData
} from "./constants"
import { TatilFields } from "./TatilFields"

/** Ta'til arizasi — annual (MK 217/221) or unpaid (MK 241) leave. */
export const TATIL_TEMPLATE: DocumentTemplate<TatilData> = {
  slug: "tatil",
  href: "/tools/tatil-arizasi",
  namespace: "TatilPage",
  fileName: "tatil-arizasi",
  empty: EMPTY_TATIL,
  buildSample: buildSampleTatil,
  compose: composeTatil,
  validate: validateTatil,
  faqKeys: TATIL_FAQ_KEYS,
  Fields: TatilFields
}

export type { LeaveKind, TatilData } from "./constants"
export { TATIL_FAQ_KEYS } from "./constants"
