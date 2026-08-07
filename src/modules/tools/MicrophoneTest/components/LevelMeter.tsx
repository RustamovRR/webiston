"use client"

import { cn } from "@webiston/ui"
import { useTranslations } from "next-intl"

import { CLIPPING_DBFS, dbfsToPercent, SILENCE_DBFS } from "@/lib/utils/media"

import type { LevelReading } from "../types"

/**
 * How loud you are, in the unit the rest of the audio world uses.
 *
 * The meter this replaces printed a 0–100 "level" derived from smoothed
 * frequency-bin magnitudes, and then graded it — *excellent* above 60,
 * *poor* below 20 — in four hardcoded Tailwind palette colours. The number was
 * not a measurement and the grade was not advice.
 *
 * dBFS instead, because it is what every recording tool a developer has seen
 * reports, and because it makes the one piece of real advice possible: aim for
 * a speaking level around -18 to -12, and never let the peak touch 0.
 *
 * Three things are drawn, not one:
 *
 * - the **average**, which is how loud you sound;
 * - the **peak hold**, which is the transient that will clip the recording and
 *   is over far too fast to see on a moving bar;
 * - the **target band**, so "loud enough" is a place on the meter rather than
 *   a number to remember.
 */

interface LevelMeterProps {
  level: LevelReading
  /** Nothing is being measured — the meter renders empty rather than absent. */
  idle: boolean
}

/**
 * The band a speaking voice should sit in.
 *
 * -18 dBFS is the broadcast reference a great many houses standardised on and
 * -12 leaves headroom for a laugh or a cough. Quieter than this and a call
 * turns you up along with your room; louder and the peaks have nowhere to go.
 */
const TARGET_MIN_DBFS = -18
const TARGET_MAX_DBFS = -12

export function LevelMeter({ level, idle }: LevelMeterProps) {
  const t = useTranslations("MicrophoneTestPage.meter")

  const rmsPercent = idle ? 0 : dbfsToPercent(level.rms)
  const holdPercent = idle ? 0 : dbfsToPercent(level.hold)
  const targetLeft = dbfsToPercent(TARGET_MIN_DBFS)
  const targetWidth = dbfsToPercent(TARGET_MAX_DBFS) - targetLeft

  const state = level.clipping
    ? "clipping"
    : level.rms >= TARGET_MIN_DBFS
      ? "good"
      : "low"

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-muted-foreground text-sm">{t("label")}</span>
        <span className="font-mono text-foreground text-sm tabular-nums">
          {idle || level.rms <= SILENCE_DBFS
            ? t("silent")
            : t("dbfs", { value: level.rms.toFixed(1) })}
        </span>
      </div>

      {/* `meter` rather than `progressbar`: this is a measurement within a
          known range, which is exactly the distinction the two roles draw. */}
      <div
        role="meter"
        aria-valuemin={SILENCE_DBFS}
        aria-valuemax={0}
        aria-valuenow={idle ? SILENCE_DBFS : Math.round(level.rms)}
        aria-valuetext={
          idle ? t("silent") : t("dbfs", { value: level.rms.toFixed(1) })
        }
        aria-label={t("label")}
        className="relative h-3 w-full overflow-hidden rounded-full bg-muted"
      >
        {/* The band you are aiming for, drawn under the fill. */}
        <div
          aria-hidden="true"
          className="absolute inset-y-0 bg-success/20"
          style={{ left: `${targetLeft}%`, width: `${targetWidth}%` }}
        />
        <div
          aria-hidden="true"
          className={cn(
            "absolute inset-y-0 left-0 rounded-full transition-[width] duration-75",
            state === "clipping" && "bg-destructive",
            state === "good" && "bg-success",
            state === "low" && "bg-primary"
          )}
          style={{ width: `${rmsPercent}%` }}
        />
        {/* Peak hold. A hairline, because it marks an instant rather than a
            quantity, and a filled bar would read as more signal than there is. */}
        {!idle && holdPercent > 0 ? (
          <div
            aria-hidden="true"
            className={cn(
              "absolute inset-y-0 w-0.5",
              level.hold >= CLIPPING_DBFS
                ? "bg-destructive"
                : "bg-foreground/70"
            )}
            style={{ left: `calc(${holdPercent}% - 1px)` }}
          />
        ) : null}
      </div>

      <div className="flex items-baseline justify-between gap-4 text-xs">
        <span className="text-muted-foreground">
          {t("peak")}{" "}
          <span className="font-mono text-foreground tabular-nums">
            {idle || level.hold <= SILENCE_DBFS
              ? "—"
              : t("dbfs", { value: level.hold.toFixed(1) })}
          </span>
        </span>
        {/* One line of advice, and only when it is true. A permanent "aim for
            -18" is noise; a warning that appears the moment you are clipping
            is the reason to have a meter at all. */}
        {!idle && level.clipping ? (
          <span className="font-medium text-destructive">{t("clipping")}</span>
        ) : !idle && state === "good" ? (
          <span className="text-success">{t("inRange")}</span>
        ) : (
          <span className="text-muted-foreground">{t("target")}</span>
        )}
      </div>
    </div>
  )
}
