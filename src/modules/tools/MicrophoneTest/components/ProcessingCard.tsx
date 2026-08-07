"use client"

import { cn } from "@webiston/ui"
import { useTranslations } from "next-intl"

import { DetailList, type DetailListRow } from "@/components/shared/DetailList"
import { ToolCard } from "@/components/shared/ToolCard"

import type { ProcessingOptions } from "../types"

/**
 * What the browser is doing to your voice, and the switches to undo it.
 *
 * This is the panel that makes the tool worth opening twice. Every browser
 * runs three processors on a microphone by default — echo cancellation, noise
 * suppression and automatic gain — and every one of them changes how you
 * sound. They are why a good microphone can sound thin on a call, why a room
 * fan disappears but so does the top of your voice, and why your level creeps
 * up during a silence.
 *
 * The tool this replaces requested all three unconditionally and displayed the
 * result as three read-only rows. Turning them off and listening is the whole
 * experiment, and no free tool in this category offers it.
 *
 * **Requested and applied are shown separately**, because they disagree: a
 * constraint is a request, and `getSettings()` is what the device and the
 * browser actually did with it. A switch that says "on" over a device that
 * ignored it would be the same lie the read-only panel told.
 */

interface ProcessingCardProps {
  processing: ProcessingOptions
  onChange: (next: Partial<ProcessingOptions>) => void
  settings: MediaTrackSettings | null
  disabled: boolean
}

const OPTIONS = [
  "echoCancellation",
  "noiseSuppression",
  "autoGainControl"
] as const

export function ProcessingCard({
  processing,
  onChange,
  settings,
  disabled
}: ProcessingCardProps) {
  const t = useTranslations("MicrophoneTestPage.processing")
  const tValues = useTranslations("MicrophoneTestPage.values")

  const rows: DetailListRow[] = [
    {
      key: "sampleRate",
      label: t("rows.sampleRate"),
      value: settings?.sampleRate ? `${settings.sampleRate} Hz` : null
    },
    {
      key: "channelCount",
      label: t("rows.channelCount"),
      value: settings?.channelCount
        ? tValues(settings.channelCount > 1 ? "stereo" : "mono")
        : null
    },
    ...OPTIONS.map((key) => ({
      key,
      label: t(`rows.${key}`),
      // The spec lets `echoCancellation` report a MODE string — "all",
      // "remote-only" — instead of a boolean, and any reported mode means it
      // is on. Reading it as a boolean turned those browsers into "off".
      value:
        settings && key in settings
          ? tValues(settings[key] ? "applied" : "notApplied")
          : null
    }))
  ]

  return (
    <ToolCard title={t("title")} bodyClassName="p-0">
      <div className="space-y-3 p-5">
        <p className="text-muted-foreground text-sm leading-relaxed">
          {t("intro")}
        </p>

        <div className="flex flex-wrap gap-2">
          {OPTIONS.map((key) => {
            const active = processing[key]
            return (
              <button
                key={key}
                type="button"
                aria-pressed={active}
                disabled={disabled}
                onClick={() => {
                  onChange({ [key]: !active })
                }}
                className={cn(
                  "rounded-lg border px-3 py-1.5 text-sm transition-colors",
                  "disabled:cursor-not-allowed disabled:opacity-50",
                  active
                    ? "border-primary bg-primary/10 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {t(`rows.${key}`)}
              </button>
            )
          })}
        </div>

        <p className="text-muted-foreground text-xs leading-relaxed">
          {t("restartNote")}
        </p>
      </div>

      <DetailList rows={rows} emptyLabel={tValues("unavailable")} />
    </ToolCard>
  )
}
