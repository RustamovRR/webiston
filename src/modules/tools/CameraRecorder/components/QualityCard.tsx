"use client"

import { cn } from "@webiston/ui"
import { CopyButton } from "@webiston/ui/composites/CopyButton"
import { useTranslations } from "next-intl"

import { DetailList, type DetailListRow } from "@/components/shared/DetailList"
import { ToggleChip } from "@/components/shared/ToggleChip"
import { ToolCard } from "@/components/shared/ToolCard"
import { environmentReportLines, formatReport } from "@/lib/utils/media"

import { QUALITY_PRESETS } from "../constants"
import type { CameraSettings, QualityPreset } from "../types"

/**
 * What you asked the camera for, and what it gave you.
 *
 * Both columns, side by side, because they disagree constantly and only one of
 * them is a fact. Ask a 720p webcam for 4K and it returns 1280×720 without
 * complaint; the panel this replaces printed the REQUEST as "video info", so
 * the page confidently reported a resolution the stream did not have.
 *
 * That is also the most useful thing this tool can tell somebody buying or
 * debugging a camera: the maximum it will actually produce, found by asking for
 * more than it has.
 */

interface QualityCardProps {
  presetId: string
  onPresetChange: (id: string) => void
  requested: QualityPreset
  actual: CameraSettings | null
  /** Held while recording: changing quality reopens the stream. */
  locked: boolean
  /** Shown in the report, so the reader knows which camera it describes. */
  deviceLabel: string | null
  /** The stream is being reopened after a settings change. */
  isBusy: boolean
}

export function QualityCard({
  presetId,
  onPresetChange,
  requested,
  actual,
  locked,
  deviceLabel,
  isBusy
}: QualityCardProps) {
  const t = useTranslations("CameraRecorderPage.quality")
  const tValues = useTranslations("CameraRecorderPage.values")

  const matched =
    actual?.width === requested.width && actual?.height === requested.height

  // Plain values: React Compiler is on, so hand-written memoisation around a
  // mapped array duplicates what the build already does.
  const rows: DetailListRow[] = [
    {
      key: "requested",
      label: t("rows.requested"),
      value: `${requested.width} × ${requested.height}`
    },
    {
      key: "actual",
      label: t("rows.actual"),
      value:
        actual?.width && actual?.height
          ? `${actual.width} × ${actual.height}`
          : null
    },
    {
      key: "frameRate",
      label: t("rows.frameRate"),
      value: actual?.frameRate ? `${Math.round(actual.frameRate)} fps` : null
    },
    {
      key: "facingMode",
      label: t("rows.facingMode"),
      value: actual?.facingMode ? tValues(`facing.${actual.facingMode}`) : null
    }
  ]

  /** The report — the paste-into-a-support-ticket block. */
  const report = formatReport(t("reportTitle"), [
    {
      heading: t("reportDevice"),
      lines: [
        `${t("reportDeviceLabel")}: ${deviceLabel || "—"}`,
        ...rows.map((row) => `${row.label}: ${row.value ?? "—"}`)
      ]
    },
    { heading: t("reportEnvironment"), lines: environmentReportLines() }
  ])

  return (
    <ToolCard
      title={t("title")}
      bodyClassName="p-0"
      actions={
        <CopyButton text={report} disabled={!report} label={t("copyReport")} />
      }
    >
      <div className="space-y-3 p-5">
        <div className="flex flex-wrap gap-2">
          {QUALITY_PRESETS.map((preset) => (
            <ToggleChip
              key={preset.id}
              pressed={preset.id === presetId}
              disabled={locked}
              onToggle={() => {
                onPresetChange(preset.id)
              }}
            >
              {t(`presets.${preset.id}`)}
            </ToggleChip>
          ))}
        </div>

        {/* Only when they differ. A permanent note saying "these may differ" is
            furniture; one that appears the moment they do is information. */}
        {actual && !matched ? (
          <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-muted-foreground text-sm leading-relaxed">
            {t("negotiated")}
          </p>
        ) : null}
      </div>

      {/* Dimmed rather than blanked while the camera reopens: replacing filled
          rows with "not reported" and refilling them is the flash this used to
          produce. */}
      <div
        aria-busy={isBusy}
        className={cn(
          "transition-opacity duration-200 ease-out",
          isBusy && "opacity-50"
        )}
      >
        <DetailList rows={rows} emptyLabel={tValues("unavailable")} />
      </div>
    </ToolCard>
  )
}
