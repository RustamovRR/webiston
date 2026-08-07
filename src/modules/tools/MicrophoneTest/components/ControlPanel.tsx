"use client"

import { Mic, MicOff, RefreshCw } from "lucide-react"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import type { AudioDevice } from "../hooks/useMicrophoneTest"

interface ControlPanelProps {
  audioDevices: AudioDevice[]
  selectedDevice: string
  isListening: boolean
  audioQuality: { text: string; color: string }
  onStartListening: () => void
  onStopListening: () => void
  onRefreshDevices: () => void
  onSwitchMicrophone: (deviceId: string) => void
}

export function ControlPanel({
  audioDevices,
  selectedDevice,
  isListening,
  audioQuality,
  onStartListening,
  onStopListening,
  onRefreshDevices,
  onSwitchMicrophone
}: ControlPanelProps) {
  const t = useTranslations("MicrophoneTestPage.ControlPanel")

  return (
    <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-sm font-medium text-foreground">
            {t("title")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${isListening ? "bg-green-500" : "bg-zinc-500"}`}
          ></div>
          <span className="text-xs text-muted-foreground">
            {isListening ? t("status.active") : t("status.inactive")}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="md:col-span-2 lg:col-span-1">
            <label
              htmlFor="controlpanel-microphone-label"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              {t("microphone.label")}
            </label>
            <Select
              value={selectedDevice}
              onValueChange={onSwitchMicrophone}
              disabled={audioDevices.length === 0}
            >
              <SelectTrigger
                id="controlpanel-microphone-label"
                className="h-10 w-full border-border bg-card text-foreground hover:bg-muted focus:border-zinc-400 dark:focus:border-zinc-600"
              >
                <SelectValue placeholder={t("microphone.placeholder")} />
              </SelectTrigger>
              <SelectContent
                className="max-w-[300px] border-border bg-card"
                position="popper"
                side="bottom"
                align="start"
              >
                {audioDevices.map((device) => (
                  <SelectItem
                    key={device.deviceId}
                    value={device.deviceId}
                    className="max-w-[280px] truncate text-foreground hover:bg-muted focus:bg-muted"
                  >
                    <span className="truncate" title={device.label}>
                      {device.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <span className="mb-2 block text-sm font-medium text-foreground">
              {t("quality.label")}
            </span>
            <div className="flex h-10 items-center rounded-lg border border-border bg-card px-3">
              <div
                className={`mr-2 h-2 w-2 rounded-full ${
                  audioQuality.text === "Ajoyib"
                    ? "bg-green-500"
                    : audioQuality.text === "Yaxshi"
                      ? "bg-blue-500"
                      : audioQuality.text === "O'rtacha"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                }`}
              ></div>
              <span className={`text-sm font-medium ${audioQuality.color}`}>
                {audioQuality.text}
              </span>
            </div>
          </div>

          <div className="flex items-end">
            <Button
              onClick={onRefreshDevices}
              variant="outline"
              className="w-full border-border hover:bg-muted"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {t("buttons.refresh")}
            </Button>
          </div>

          <div className="flex items-end gap-2">
            {!isListening ? (
              <ShimmerButton
                onClick={onStartListening}
                disabled={!selectedDevice || audioDevices.length === 0}
                className="flex-1"
              >
                <Mic className="mr-2 h-4 w-4" />
                {t("buttons.startMicrophone")}
              </ShimmerButton>
            ) : (
              <Button
                onClick={onStopListening}
                variant="destructive"
                className="flex-1"
              >
                <MicOff className="mr-2 h-4 w-4" />
                {t("buttons.stopMicrophone")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
