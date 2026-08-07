"use client"

import { CopyButton } from "@webiston/ui/composites/CopyButton"
import { useTranslations } from "next-intl"

import { DetailList, type DetailListRow } from "@/components/shared/DetailList"
import { ToolCard } from "@/components/shared/ToolCard"

import type { InfoGroup } from "../types"

/**
 * One group of facts.
 *
 * The table itself is `DetailList`, shared with `ip-info`. The old panels used
 * a `<div>` grid, so nothing tied a value to its label for a screen reader —
 * and each carried three fake macOS window buttons and a blue "status" dot,
 * which across five panels meant fifteen decorative circles on one page.
 *
 * The per-group copy button is kept, because copying just the browser section
 * into a bug report is the actual use.
 */

interface InfoGroupCardProps {
  group: InfoGroup
}

export function InfoGroupCard({ group }: InfoGroupCardProps) {
  const t = useTranslations("DeviceInfoPage")
  const tRows = useTranslations("DeviceInfoPage.rows")
  const tValues = useTranslations("DeviceInfoPage.values")

  const format = (value: InfoGroup["rows"][number]["value"]) => {
    if (value === null || value === "") return null
    if (typeof value === "boolean") return tValues(value ? "yes" : "no")
    return String(value)
  }

  const rows: DetailListRow[] = group.rows.map((row) => ({
    key: row.key,
    label: tRows(row.key),
    value: format(row.value)
  }))

  const asText = rows
    .map((row) => `${row.label}: ${row.value ?? "—"}`)
    .join("\n")

  return (
    <ToolCard
      title={t(`groups.${group.key}`)}
      actions={<CopyButton text={asText} label={t("copyGroup")} />}
      bodyClassName="p-0"
    >
      <DetailList rows={rows} emptyLabel={tValues("unavailable")} />
    </ToolCard>
  )
}
