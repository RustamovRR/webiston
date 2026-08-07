"use client"

import { cn } from "@webiston/ui"
import { Button } from "@webiston/ui/primitives/button"
import { Headphones, Square } from "lucide-react"
import { useTranslations } from "next-intl"

import { DeviceSelect } from "@/components/shared/MediaAccessPanel"
import type { MediaAccessDevice } from "@/hooks/useMediaAccess"

/**
 * The controls, as a row rather than a card.
 *
 * The panel this replaces was a bordered "control panel" holding a device
 * dropdown, a start button and a "quality" badge that graded a number which
 * did not measure anything. A box around controls that are not one thing reads
 * as though something is missing from it; the cards below are the panels, this
 * is a row — the same call the JSON and colour tools already made.
 */

interface MicToolbarProps {
  devices: readonly MediaAccessDevice[]
  deviceId: string | null
  onSelect: (deviceId: string) => void
  onStop: () => void
  isMonitoring: boolean
  onMonitorChange: (next: boolean) => void
}

export function MicToolbar({
  devices,
  deviceId,
  onSelect,
  onStop,
  isMonitoring,
  onMonitorChange
}: MicToolbarProps) {
  const t = useTranslations("MicrophoneTestPage.toolbar")

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <DeviceSelect
        devices={devices}
        value={deviceId}
        onChange={onSelect}
        kind="microphone"
      />

      <div className="flex flex-wrap items-center gap-2">
        {/*
          Hearing yourself is the feature that turns a level meter into a
          microphone test: a bar that moves proves the browser gets a signal,
          but only playback proves it is a signal anyone would want to listen
          to. It is off until asked, and it says why — through laptop speakers
          this is a feedback loop, and the fix is headphones.
        */}
        <Button
          type="button"
          variant={isMonitoring ? "default" : "outline"}
          aria-pressed={isMonitoring}
          onClick={() => {
            onMonitorChange(!isMonitoring)
          }}
          className="gap-2"
        >
          <Headphones aria-hidden="true" className="size-4" />
          {t("monitor")}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={onStop}
          className="gap-2"
        >
          <Square aria-hidden="true" className="size-4" />
          {t("stop")}
        </Button>
      </div>

      {isMonitoring ? (
        <p
          // `status`, not `alert`: it is a caution attached to a control the
          // visitor just operated, not an interruption.
          role="status"
          className={cn(
            "w-full rounded-lg border border-warning/40 bg-warning/10 px-3 py-2",
            "text-foreground text-sm"
          )}
        >
          {t("monitorWarning")}
        </p>
      ) : null}
    </div>
  )
}
