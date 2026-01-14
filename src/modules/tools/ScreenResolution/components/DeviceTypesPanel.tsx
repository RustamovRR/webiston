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
    <div className="rounded-lg border border-zinc-200 bg-white/50 p-6 dark:border-zinc-800 dark:bg-zinc-900/50">
      <h3 className="mb-4 text-lg font-semibold text-zinc-800 dark:text-zinc-200">
        {t("title")}
      </h3>
      <div className="space-y-3">
        {deviceTypes.map((device, index) => (
          <div
            key={index}
            className={`flex items-center justify-between rounded-lg p-3 transition-colors ${
              currentDeviceType === device.name
                ? "border border-green-500/30 bg-green-500/20 dark:border-green-400/30 dark:bg-green-400/20"
                : "bg-zinc-100/50 dark:bg-zinc-800/30"
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
              <div className="h-2 w-2 rounded-full bg-green-500 dark:bg-green-400"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default DeviceTypesPanel
