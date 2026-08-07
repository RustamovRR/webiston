"use client"

import { CopyButton } from "@webiston/ui/composites/CopyButton"
import { useTranslations } from "next-intl"

import { ToolCard } from "@/components/shared/ToolCard"

import type { DetailGroup, DetailRow } from "../types"

/**
 * One group of facts about an address.
 *
 * A definition list, so a screen reader ties each value to its label — the
 * panels this replaces used `<div>` pairs, which associate nothing.
 *
 * A row the provider could not answer is KEPT and says so. Dropping it makes
 * the panel look complete when it is not, and *which* field is missing is
 * often the interesting part: the fallback provider returns no ASN or ISP at
 * all, and a reader deserves to see that rather than a shorter table.
 */

interface DetailGroupCardProps {
  /**
   * Which group this card is, whether or not there is data yet.
   *
   * Passed separately rather than read off `group`: before the first lookup
   * every card would otherwise fall back to the same key and all three would
   * be titled "Location".
   */
  groupKey: DetailGroup["key"]
  group: DetailGroup | null
  /** Row keys to render before the first answer, so the layout is reserved. */
  placeholderKeys: readonly string[]
}

export function DetailGroupCard({
  groupKey,
  group,
  placeholderKeys
}: DetailGroupCardProps) {
  const t = useTranslations("IpInfoPage")
  const tRows = useTranslations("IpInfoPage.rows")
  const tValues = useTranslations("IpInfoPage.values")

  const format = (value: DetailRow["value"]) => {
    if (value === null || value === "") return null
    if (typeof value === "boolean") return tValues(value ? "yes" : "no")
    return String(value)
  }

  const rows: DetailRow[] =
    group?.rows ?? placeholderKeys.map((key) => ({ key, value: null }))

  const asText = group
    ? group.rows
        .map((row) => `${tRows(row.key)}: ${format(row.value) ?? "—"}`)
        .join("\n")
    : ""

  return (
    <ToolCard
      title={t(`groups.${groupKey}`)}
      actions={
        <CopyButton text={asText} disabled={!asText} label={t("copyGroup")} />
      }
      bodyClassName="p-0"
    >
      <dl className="divide-y divide-border">
        {rows.map((row) => {
          const value = format(row.value)
          return (
            <div
              key={row.key}
              className={
                row.wide
                  ? "px-5 py-3"
                  : "flex items-baseline justify-between gap-4 px-5 py-3"
              }
            >
              <dt className="shrink-0 text-muted-foreground text-sm">
                {tRows(row.key)}
              </dt>
              <dd
                className={
                  row.wide
                    ? "mt-1 break-all font-mono text-foreground text-sm"
                    : // Wraps rather than truncates: this is a page whose only
                      // job is showing values, and an organisation name cut off
                      // with an ellipsis is data withheld.
                      "min-w-0 break-words text-right font-mono text-foreground text-sm"
                }
              >
                {value ?? (
                  <span className="text-muted-foreground italic">
                    {tValues("unavailable")}
                  </span>
                )}
              </dd>
            </div>
          )
        })}
      </dl>
    </ToolCard>
  )
}
