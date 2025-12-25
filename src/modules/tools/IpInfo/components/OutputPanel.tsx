"use client"

import { Search, MapPin, Wifi, Clock, Shield } from "lucide-react"
import { CodeHighlight } from "@/components/ui/code-highlight"
import { CopyButton } from "@/components/shared/CopyButton"
import { useTranslations } from "next-intl"
import MapView from "./MapView"
import SecurityAnalysis from "./SecurityAnalysis"

interface IPInfo {
  ip: string
  type: string
  country_name: string
  region_name: string
  city: string
  latitude: number
  longitude: number
  location: {
    country_flag_emoji: string
    calling_code: string
    is_eu: boolean
  }
  connection: {
    isp: string
    asn: number
    usage_type: string
  }
  continent_name: string
  time_zone: {
    id: string
  }
  currency: {
    code: string
    name: string
  }
}

interface OutputPanelProps {
  ipInfo: IPInfo | null
}

export default function OutputPanel({ ipInfo }: OutputPanelProps) {
  const t = useTranslations("IpInfoPage.OutputPanel")

  return (
    <div className="space-y-6">
      {/* Terminal Output Panel */}
      <div className="rounded-xl border border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
        {/* Terminal Header */}
        <div className="flex items-center gap-2 border-b border-zinc-200 bg-zinc-50/50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/50">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <span className="ml-2 text-sm font-medium text-zinc-600 dark:text-zinc-400">
            {t("title")}
          </span>
          <div className="ml-auto flex items-center gap-2">
            {ipInfo && (
              <>
                <div className="h-2 w-2 rounded-full bg-green-500 dark:bg-green-400"></div>
                <span className="text-xs text-green-600 dark:text-green-400">
                  {t("dataAvailable")}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Analysis Content */}
        <div className="p-6">
          {ipInfo ? (
            <div className="space-y-6">
              {/* Location Information */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 font-semibold text-zinc-800 dark:text-zinc-200">
                  <MapPin className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                  {t("locationInfoTitle")}
                </h4>
                <div className="grid grid-cols-2 gap-4 rounded-lg border border-zinc-200/50 bg-zinc-100/30 p-4 dark:border-zinc-700/50 dark:bg-zinc-800/30">
                  <div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-500">
                      {t("ipAddress")}
                    </div>
                    <div className="font-mono text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {ipInfo.ip}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-500">
                      {t("ipType")}
                    </div>
                    <div className="text-sm font-medium text-zinc-800 uppercase dark:text-zinc-200">
                      {ipInfo.type}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-500">
                      {t("country")}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {ipInfo.location.country_flag_emoji}
                      {ipInfo.country_name || t("unknown")}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-500">
                      {t("region")}
                    </div>
                    <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {ipInfo.region_name || t("unknown")}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-500">
                      {t("city")}
                    </div>
                    <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {ipInfo.city || t("unknown")}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-500">
                      {t("coordinates")}
                    </div>
                    <div className="font-mono text-sm text-zinc-800 dark:text-zinc-200">
                      {ipInfo.latitude.toFixed(4)},{" "}
                      {ipInfo.longitude.toFixed(4)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Network Information */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 font-semibold text-zinc-800 dark:text-zinc-200">
                  <Wifi className="h-4 w-4 text-green-500 dark:text-green-400" />
                  {t("networkInfoTitle")}
                </h4>
                <div className="grid grid-cols-2 gap-4 rounded-lg border border-zinc-200/50 bg-zinc-100/30 p-4 dark:border-zinc-700/50 dark:bg-zinc-800/30">
                  <div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-500">
                      {t("isp")}
                    </div>
                    <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {ipInfo.connection.isp || t("unknown")}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-500">
                      {t("asn")}
                    </div>
                    <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {ipInfo.connection.asn
                        ? `AS${ipInfo.connection.asn}`
                        : t("unknown")}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-500">
                      {t("connectionType")}
                    </div>
                    <div className="text-sm font-medium text-zinc-800 capitalize dark:text-zinc-200">
                      {ipInfo.connection.usage_type || t("unknown")}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-500">
                      {t("continent")}
                    </div>
                    <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {ipInfo.continent_name}
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 font-semibold text-zinc-800 dark:text-zinc-200">
                  <Clock className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                  {t("additionalInfoTitle")}
                </h4>
                <div className="grid grid-cols-2 gap-4 rounded-lg border border-zinc-200/50 bg-zinc-100/30 p-4 dark:border-zinc-700/50 dark:bg-zinc-800/30">
                  <div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-500">
                      {t("timezone")}
                    </div>
                    <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {ipInfo.time_zone.id || t("unknown")}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-500">
                      {t("currency")}
                    </div>
                    <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {ipInfo.currency.code
                        ? `${ipInfo.currency.name} (${ipInfo.currency.code})`
                        : t("unknown")}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-500">
                      {t("callingCode")}
                    </div>
                    <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {ipInfo.location.calling_code
                        ? `${ipInfo.location.calling_code}`
                        : t("unknown")}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-600 dark:text-zinc-500">
                      {t("euMember")}
                    </div>
                    <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                      {ipInfo.location.is_eu ? t("yes") : t("no")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Analysis */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 font-semibold text-zinc-800 dark:text-zinc-200">
                  <Shield className="h-4 w-4 text-red-500 dark:text-red-400" />
                  {t("securityTitle")}
                </h4>
                <SecurityAnalysis ipInfo={ipInfo} />
              </div>

              {/* Interactive Map */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 font-semibold text-zinc-800 dark:text-zinc-200">
                  <MapPin className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                  {t("mapTitle")}
                </h4>
                <MapView
                  latitude={ipInfo.latitude}
                  longitude={ipInfo.longitude}
                  country={ipInfo.country_name}
                  city={ipInfo.city}
                  ip={ipInfo.ip}
                />
              </div>
            </div>
          ) : (
            <div className="flex h-40 items-center justify-center text-zinc-500 dark:text-zinc-500">
              <div className="text-center">
                <Search className="mx-auto mb-2 h-8 w-8 opacity-50" />
                <p>{t("waitingTitle")}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* JSON Output */}
      {ipInfo && (
        <div className="rounded-xl border border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
          <div className="flex items-center justify-between border-b border-zinc-200 bg-zinc-50/50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/50">
            <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t("jsonDataTitle")}
            </h4>
            <CopyButton text={JSON.stringify(ipInfo, null, 2)} />
          </div>
          <div className="p-4">
            <CodeHighlight
              code={JSON.stringify(ipInfo, null, 2)}
              language="json"
              className="max-h-80 overflow-auto"
            />
          </div>
        </div>
      )}
    </div>
  )
}
