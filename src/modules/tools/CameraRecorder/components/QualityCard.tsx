"use client"

import { cn } from "@webiston/ui"
import { useTranslations } from "next-intl"

import { DetailList, type DetailListRow } from "@/components/shared/DetailList"
import { ToolCard } from "@/components/shared/ToolCard"

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
}

export function QualityCard({
  presetId,
  onPresetChange,
  requested,
  actual,
  locked
}: QualityCardProps) {
  const t = useTranslations("CameraRecorderPage.quality")
  const tValues = useTranslations("CameraRecorderPage.values")

  const matched =
    actual?.width === requested.width && actual?.height === requested.height

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

  return (
    <ToolCard title={t("title")} bodyClassName="p-0">
      <div className="space-y-3 p-5">
        <div className="flex flex-wrap gap-2">
          {QUALITY_PRESETS.map((preset) => {
            const active = preset.id === presetId
            return (
              <button
                key={preset.id}
                type="button"
                aria-pressed={active}
                disabled={locked}
                onClick={() => {
                  onPresetChange(preset.id)
                }}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-sm transition-colors",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  active
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {t(`presets.${preset.id}`)}
              </button>
            )
          })}
        </div>

        {/* Only when they differ. A permanent note saying "these may differ" is
            furniture; one that appears the moment they do is information. */}
        {actual && !matched ? (
          <p className="rounded-lg border border-border bg-muted/40 px-3 py-2 text-muted-foreground text-sm leading-relaxed">
            {t("negotiated")}
          </p>
        ) : null}
      </div>

      <DetailList rows={rows} emptyLabel={tValues("unavailable")} />
    </ToolCard>
  )
}
