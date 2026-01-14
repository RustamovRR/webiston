"use client"

import { useTranslations } from "next-intl"
import { ToolHeader } from "@/components/shared"
import {
  ControlPanel,
  BrowserInfoPanel,
  SystemInfoPanel,
  ScreenInfoPanel,
  DeviceInfoPanel,
  ConnectionInfoPanel,
  InfoSection
} from "./components"
import { useDeviceInfo } from "./hooks/useDeviceInfo"

export default function DeviceInfoPage() {
  const t = useTranslations("DeviceInfoPage.ToolHeader")

  const {
    deviceInfo,
    isLoading,
    copied,
    refreshDeviceInfo,
    downloadDeviceInfo,
    copyAllInfo,
    copySection
  } = useDeviceInfo({
    onSuccess: (message) => {
      console.log("Success:", message)
    },
    onError: (error) => {
      console.error("Error:", error)
    }
  })

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <ToolHeader title={t("title")} description={t("description")} />

      <ControlPanel
        isLoading={isLoading || !deviceInfo}
        copied={copied}
        onRefresh={refreshDeviceInfo}
        onCopyAll={copyAllInfo}
        onDownload={downloadDeviceInfo}
      />

      {deviceInfo && (
        <div className="space-y-6">
          <BrowserInfoPanel browserInfo={deviceInfo.browser} />
          <SystemInfoPanel systemInfo={deviceInfo.system} />
          <ScreenInfoPanel screenInfo={deviceInfo.screen} />
          <DeviceInfoPanel deviceInfo={deviceInfo.device} />
          {deviceInfo.connection && (
            <ConnectionInfoPanel
              connectionInfo={deviceInfo.connection as any}
            />
          )}
          <InfoSection />
        </div>
      )}
    </div>
  )
}
