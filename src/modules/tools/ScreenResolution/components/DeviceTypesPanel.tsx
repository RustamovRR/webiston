"use client"

import { useTranslations } from "next-intl"

interface DeviceType {
  name: string
  range: string
}

interface DeviceTypesPanelProps {
  deviceTypes: DeviceType[]
  currentDeviceType?: string
}

const DeviceTypesPanel: React.FC<DeviceTypesPanelProps> = ({
  deviceTypes,
  currentDeviceType
}) => {
  const t = useTranslations("ScreenResolutionPage.DeviceTypes")

  return (
    <div className="rounded-lg border border-border bg-card/50 p-6">
      <h3 className="mb-4 text-lg font-semibold text-foreground">
        {t("title")}
      </h3>
      <div className="space-y-3">
        {deviceTypes.map((device, index) => (
          <div
            key={index}
            className={`flex items-center justify-between rounded-lg p-3 transition-colors ${
              currentDeviceType === device.name
                ? "border border-success/30 bg-success/20"
                : "bg-muted/50"
            }`}
          >
            <div>
              <div className="font-medium text-zinc-700 dark:text-zinc-300">
                {device.name}
              </div>
              <div className="text-xs text-zinc-500 dark:text-zinc-500">
                {device.range}
              </div>
            </div>
            {currentDeviceType === device.name && (
              <div className="h-2 w-2 rounded-full bg-success"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default DeviceTypesPanel
