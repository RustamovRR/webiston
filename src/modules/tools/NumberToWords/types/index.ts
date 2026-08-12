import type { OutputMode } from "../constants"
import type { AmountError } from "../utils/amount"
import type { SumInWords } from "../utils/words"

/**
 * What the tool knows at any moment.
 *
 * A discriminated union rather than a bag of nullable fields: the UI has to
 * render exactly one of these three, and a shape that allows `words` and
 * `error` to be set at once is a shape where they eventually both are.
 */
export type ConversionState =
  | { status: "idle" }
  | { status: "error"; error: AmountError }
  | {
      status: "ready"
      /** The parsed amount, regrouped — the "you typed this" echo. */
      formatted: string
      words: SumInWords
      /**
       * Set when the visitor typed tiyin in `plain` mode, where Uzbek has no
       * simple reading for a decimal and the fractional part is dropped. Said
       * out loud rather than silently discarded.
       */
      fractionIgnored: boolean
    }

export type { OutputMode }
