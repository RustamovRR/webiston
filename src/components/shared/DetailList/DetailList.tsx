import { cn } from "@webiston/ui"

/**
 * A label/value table, shared by every panel in the suite that shows facts.
 *
 * A definition list, so a screen reader ties each value to its label. Two
 * tools had grown their own near-identical copy of this markup — `ip-info` and
 * `device-info` — and both carried the same layout bug, which is exactly the
 * argument for one owner.
 *
 * **The bug they shared.** Whether a value sat on the label's line or dropped
 * to its own full-width row was decided per FIELD, statically, by the code that
 * builds the data: `ip` and `org` were flagged `wide: true` for all time. So
 * `213.230.78.204` — fourteen characters — took a whole row, while the row
 * directly above it showed *the same organisation string* right-aligned and
 * inline, because that field happened not to carry the flag. The rule was
 * about the field's worst case, and every value paid for it.
 *
 * It is decided per VALUE here, which is the only thing that can be right for
 * both a short address and a 250-character user-agent string. It also puts the
 * decision where it belongs: a data-shaping util has no business setting a CSS
 * class.
 */

/**
 * How long a value may be and still share a line with its label.
 *
 * Derived from the card, not picked: a panel body is roughly 600px wide at the
 * desktop breakpoint, a label and its gap take about 110 of them, and the mono
 * face at 14px runs a bit over 8px per character. So this is the point past
 * which a value stops fitting beside a typical label — a threshold, not a
 * guarantee, and values below it still wrap inside their cell on a narrow
 * screen the way they always have.
 */
const INLINE_VALUE_MAX_CHARS = 48

export interface DetailListRow {
  key: string
  label: string
  /**
   * Already formatted for display. `null` means the source could not supply
   * it, and renders as `emptyLabel` rather than being dropped — a row that
   * disappears reads as a bug, and *which* field is missing is often the
   * interesting part.
   */
  value: string | null
}

interface DetailListProps {
  rows: readonly DetailListRow[]
  /** Translated words for "not available". */
  emptyLabel: string
  /** Applied to every value, for tools that need a different size. */
  valueClassName?: string
}

export function DetailList({
  rows,
  emptyLabel,
  valueClassName
}: DetailListProps) {
  return (
    <dl className="divide-y divide-border">
      {rows.map((row) => {
        const ownLine =
          row.value !== null && row.value.length > INLINE_VALUE_MAX_CHARS

        return (
          <div
            key={row.key}
            className={cn(
              "px-5 py-3",
              !ownLine && "flex items-baseline justify-between gap-4"
            )}
          >
            <dt className="shrink-0 text-muted-foreground text-sm">
              {row.label}
            </dt>
            <dd
              className={cn(
                "font-mono text-foreground text-sm",
                ownLine
                  ? // `break-all`, because the values that reach this branch —
                    // user agents, long IPv6 addresses — have few natural break
                    // points, and a line that overflows its card is worse than
                    // one that breaks mid-token.
                    "mt-1 break-all"
                  : // Wraps rather than truncates: these are pages whose only
                    // job is showing values, and a name cut off with an
                    // ellipsis is data withheld.
                    "min-w-0 wrap-break-word text-right",
                valueClassName
              )}
            >
              {row.value ?? (
                <span className="text-muted-foreground italic">
                  {emptyLabel}
                </span>
              )}
            </dd>
          </div>
        )
      })}
    </dl>
  )
}
