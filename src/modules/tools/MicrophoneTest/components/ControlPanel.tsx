"use client"

import { Mic, MicOff, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { ShimmerButton } from "@/components/ui/shimmer-button"
import { useTranslations } from "next-intl"
import { AudioDevice } from "../hooks/useMicrophoneTest"

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
    <div className="rounded-xl border border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t("title")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${isListening ? "bg-green-500" : "bg-zinc-500"}`}
          ></div>
          <span className="text-xs text-zinc-500 dark:text-zinc-500">
            {isListening ? t("status.active") : t("status.inactive")}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="md:col-span-2 lg:col-span-1">
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-200">
              {t("microphone.label")}
            </label>
            <Select
              value={selectedDevice}
              onValueChange={onSwitchMicrophone}
              disabled={audioDevices.length === 0}
            >
              <SelectTrigger className="h-10 w-full border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50 focus:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 dark:focus:border-zinc-600">
                <SelectValue placeholder={t("microphone.placeholder")} />
              </SelectTrigger>
              <SelectContent
                className="max-w-[300px] border-zinc-300 bg-white dark:border-zinc-700 dark:bg-zinc-800"
                position="popper"
                side="bottom"
                align="start"
              >
                {audioDevices.map((device) => (
                  <SelectItem
                    key={device.deviceId}
                    value={device.deviceId}
                    className="max-w-[280px] truncate text-zinc-900 hover:bg-zinc-100 focus:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-zinc-700 dark:focus:bg-zinc-700"
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
            <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-200">
              {t("quality.label")}
            </label>
            <div className="flex h-10 items-center rounded-lg border border-zinc-300 bg-white px-3 dark:border-zinc-700 dark:bg-zinc-800">
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
              className="w-full border-zinc-300 hover:bg-zinc-50 dark:border-zinc-700 dark:hover:bg-zinc-700"
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
