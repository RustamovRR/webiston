"use client"

import { CopyButton } from "@webiston/ui/composites/CopyButton"
import { useTranslations } from "next-intl"

import { DetailList, type DetailListRow } from "@/components/shared/DetailList"
import { ToolCard } from "@/components/shared/ToolCard"

import type { DetailGroup, DetailRow } from "../types"

/**
 * One group of facts about an address.
 *
 * The table itself is `DetailList`, shared with `device-info` — this component
 * owns only what is specific to this tool: which group it is, how a raw value
 * becomes a string, and the per-group copy button (copying just the network
 * section into a bug report is the actual use).
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

  const rows: DetailListRow[] = group
    ? group.rows.map((row) => ({
        key: row.key,
        label: tRows(row.key),
        value: format(row.value)
      }))
    : placeholderKeys.map((key) => ({
        key,
        label: tRows(key),
        value: null
      }))

  const asText = group
    ? rows.map((row) => `${row.label}: ${row.value ?? "—"}`).join("\n")
    : ""

  return (
    <ToolCard
      title={t(`groups.${groupKey}`)}
      actions={
        <CopyButton text={asText} disabled={!asText} label={t("copyGroup")} />
      }
      bodyClassName="p-0"
    >
      <DetailList rows={rows} emptyLabel={tValues("unavailable")} />
    </ToolCard>
  )
}
