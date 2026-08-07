"use client"

import { cn } from "@webiston/ui"
import { CopyButton } from "@webiston/ui/composites/CopyButton"
import { useTranslations } from "next-intl"
import { useMemo } from "react"

import { DetailList, type DetailListRow } from "@/components/shared/DetailList"
import { ToolCard } from "@/components/shared/ToolCard"
import { environmentReportLines, formatReport } from "@/lib/utils/media"

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
  /** Shown in the report, so the reader knows which microphone it describes. */
  deviceLabel: string | null
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
  disabled,
  deviceLabel
}: ProcessingCardProps) {
  const t = useTranslations("MicrophoneTestPage.processing")
  const tValues = useTranslations("MicrophoneTestPage.values")

  // Memoised so the report below can depend on it. An array rebuilt every
  // render is not a dependency — it is a guarantee that whatever depends on it
  // runs every render too.
  const rows: DetailListRow[] = useMemo(
    () => [
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
    ],
    [settings, t, tValues]
  )

  /**
   * The report — the paste-into-a-support-ticket block.
   *
   * `useMemo`, deliberately, and not the `useState` + `useEffect` this started
   * as. That version listed `rows` as a dependency; `rows` is a fresh array
   * every render, so the effect ran every render, and it called `setReport`
   * with a string containing a fresh timestamp — a value that never settles.
   * Render, set state, render. A memo cannot do that: recomputing costs a
   * string, not a render pass.
   */
  const report = useMemo(
    () =>
      formatReport(t("reportTitle"), [
        {
          heading: t("reportDevice"),
          lines: [
            `${t("reportDeviceLabel")}: ${deviceLabel || "—"}`,
            ...rows.map((row) => `${row.label}: ${row.value ?? "—"}`),
            `${t("reportRequested")}: ${
              OPTIONS.filter((key) => processing[key]).join(", ") || "—"
            }`
          ]
        },
        { heading: t("reportEnvironment"), lines: environmentReportLines() }
      ]),
    [t, rows, processing, deviceLabel]
  )

  return (
    <ToolCard
      title={t("title")}
      bodyClassName="p-0"
      actions={
        <CopyButton text={report} disabled={!report} label={t("copyReport")} />
      }
    >
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
