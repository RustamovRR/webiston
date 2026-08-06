"use client"

import { CopyButton } from "@webiston/ui/composites/CopyButton"
import { useTranslations } from "next-intl"

import { ToolCard } from "@/components/shared/ToolCard"

import type { InfoGroup } from "../types"

/**
 * One group of facts.
 *
 * A definition list, because that is what this is — the old panels used a
 * `<div>` grid, so nothing tied a value to its label for a screen reader.
 * Each panel also carried three fake macOS window buttons and a blue "status"
 * dot; five panels meant fifteen decorative circles on one page.
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

  const asText = group.rows
    .map((row) => `${tRows(row.key)}: ${format(row.value) ?? "—"}`)
    .join("\n")

  return (
    <ToolCard
      title={t(`groups.${group.key}`)}
      actions={<CopyButton text={asText} label={t("copyGroup")} />}
      bodyClassName="p-0"
    >
      <dl className="divide-y divide-border">
        {group.rows.map((row) => {
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
                    ? "mt-1 break-all font-mono text-foreground text-xs leading-relaxed"
                    : "min-w-0 truncate text-right font-mono text-foreground text-sm"
                }
              >
                {value ?? (
                  // Not omitted: a row that disappears reads as a bug, and
                  // WHY it is missing is the interesting part.
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
