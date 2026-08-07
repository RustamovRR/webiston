"use client"

import { SegmentedControl } from "@webiston/ui"
import { Button } from "@webiston/ui/primitives/button"
import { Circle, Pause, Play, Square } from "lucide-react"
import { useTranslations } from "next-intl"
import { type RefObject, useState } from "react"

import { ToolCard } from "@/components/shared/ToolCard"
import { formatDuration } from "@/lib/utils"

import type { LevelReading, ScopeMode } from "../types"
import { LevelMeter } from "./LevelMeter"
import { Scope } from "./Scope"

/**
 * The live panel: what the microphone is hearing, right now.
 *
 * Everything that answers "is it working" is in one card and visible at once —
 * the waveform, the level, and the record button. The layout this replaces
 * split them across a sticky "preview panel" and a separate "control panel", so
 * pressing record meant looking away from the meter that tells you whether
 * recording is worth doing.
 */

interface ListenCardProps {
  analyserRef: RefObject<AnalyserNode | null>
  level: LevelReading
  isLive: boolean
  isSilent: boolean
  recorder: {
    isRecording: boolean
    isPaused: boolean
    elapsed: number
    canRecord: boolean
    start: () => void
    stop: () => void
    pause: () => void
    resume: () => void
  }
}

export function ListenCard({
  analyserRef,
  level,
  isLive,
  isSilent,
  recorder
}: ListenCardProps) {
  const t = useTranslations("MicrophoneTestPage.listen")
  const [mode, setMode] = useState<ScopeMode>("waveform")

  return (
    <ToolCard
      title={t("title")}
      actions={
        <SegmentedControl
          options={[
            { value: "waveform", label: t("waveform") },
            { value: "spectrum", label: t("spectrum") }
          ]}
          value={mode}
          onChange={setMode}
          label={t("viewLabel")}
        />
      }
    >
      <div className="space-y-4">
        <Scope analyserRef={analyserRef} mode={mode} idle={!isLive} />

        <LevelMeter level={level} idle={!isLive} />

        {/*
          The one piece of diagnosis this tool exists to give. A meter that
          sits at the floor is the symptom people arrive with, and "no signal"
          is not the answer — the answer is the list of things that cause it,
          in the order they are worth checking.
        */}
        {isLive && isSilent ? (
          <p
            role="status"
            className="rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-foreground text-sm leading-relaxed"
          >
            {t("silentHint")}
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-2 border-border border-t pt-4">
          {recorder.isRecording ? (
            <>
              <Button
                variant="destructive"
                onClick={recorder.stop}
                className="gap-2"
              >
                <Square aria-hidden="true" className="size-4" />
                {t("stopRecording")}
              </Button>
              <Button
                variant="outline"
                onClick={recorder.isPaused ? recorder.resume : recorder.pause}
                className="gap-2"
              >
                {recorder.isPaused ? (
                  <Play aria-hidden="true" className="size-4" />
                ) : (
                  <Pause aria-hidden="true" className="size-4" />
                )}
                {recorder.isPaused ? t("resume") : t("pause")}
              </Button>
              {/* The clock counts audio, not wall time — a paused recording
                  stops counting, because the seconds it did not capture are
                  not in the file. */}
              <span
                role="timer"
                aria-live="off"
                className="ml-auto font-mono text-foreground text-sm tabular-nums"
              >
                {formatDuration(recorder.elapsed)}
                {recorder.isPaused ? ` · ${t("paused")}` : ""}
              </span>
            </>
          ) : (
            <>
              <Button
                onClick={recorder.start}
                disabled={!recorder.canRecord}
                className="gap-2"
              >
                <Circle aria-hidden="true" className="size-4 fill-current" />
                {t("record")}
              </Button>
              <span className="text-muted-foreground text-sm">
                {recorder.canRecord ? t("recordHint") : t("recordUnavailable")}
              </span>
            </>
          )}
        </div>
      </div>
    </ToolCard>
  )
}
