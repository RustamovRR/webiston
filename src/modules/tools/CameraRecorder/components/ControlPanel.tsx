"use client"

import { Camera, CameraOff, RefreshCw } from "lucide-react"
import { useTranslations } from "next-intl"
import { ShimmerButton } from "@/components/ui"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"

interface ICamera {
  deviceId: string
  label: string
}

interface ControlPanelProps {
  isCameraActive: boolean
  cameras: ICamera[]
  selectedCamera: string
  selectedQuality: string
  onStartCamera: () => void
  onStopCamera: () => void
  onRefreshCameras: () => void
  onSwitchCamera: (deviceId: string) => void
  onQualityChange: (quality: string) => void
}

const QUALITY_OPTIONS = [
  { value: "hd", label: "HD (1280×720)", width: 1280, height: 720 },
  { value: "fhd", label: "Full HD (1920×1080)", width: 1920, height: 1080 },
  { value: "sd", label: "SD (640×480)", width: 640, height: 480 }
]

export function ControlPanel({
  isCameraActive,
  cameras,
  selectedCamera,
  selectedQuality,
  onStartCamera,
  onStopCamera,
  onRefreshCameras,
  onSwitchCamera,
  onQualityChange
}: ControlPanelProps) {
  const t = useTranslations("CameraRecorderPage.ControlPanel")

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
            className={`h-2 w-2 rounded-full ${isCameraActive ? "bg-green-500" : "bg-zinc-400 dark:bg-zinc-500"}`}
          ></div>
          <span className="text-xs text-muted-foreground">
            {isCameraActive ? t("status.active") : t("status.inactive")}
          </span>
        </div>
      </div>

      <div className="p-6">
        <div className="grid gap-4 md:grid-cols-4">
          <div>
            <label
              htmlFor="controlpanel-camera-label"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              {t("camera.label")}
            </label>
            <Select
              value={selectedCamera}
              onValueChange={onSwitchCamera}
              disabled={cameras.length === 0}
            >
              <SelectTrigger
                id="controlpanel-camera-label"
                className="border-border bg-card"
              >
                <SelectValue placeholder={t("camera.placeholder")} />
              </SelectTrigger>
              <SelectContent>
                {cameras.map((camera) => (
                  <SelectItem key={camera.deviceId} value={camera.deviceId}>
                    {camera.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label
              htmlFor="controlpanel-quality-label"
              className="mb-2 block text-sm font-medium text-foreground"
            >
              {t("quality.label")}
            </label>
            <Select value={selectedQuality} onValueChange={onQualityChange}>
              <SelectTrigger
                id="controlpanel-quality-label"
                className="border-border bg-card"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {QUALITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-end">
            <Button
              onClick={onRefreshCameras}
              variant="outline"
              className="w-full border-border"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              {t("camera.refresh")}
            </Button>
          </div>

          <div className="flex items-end gap-2">
            {!isCameraActive ? (
              <ShimmerButton
                onClick={onStartCamera}
                disabled={!selectedCamera || cameras.length === 0}
                className="flex-1"
              >
                <Camera className="mr-2 h-4 w-4" />
                {t("buttons.startCamera")}
              </ShimmerButton>
            ) : (
              <Button
                onClick={onStopCamera}
                variant="destructive"
                className="flex-1"
              >
                <CameraOff className="mr-2 h-4 w-4" />
                {t("buttons.stopCamera")}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
