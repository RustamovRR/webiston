"use client"

import { Clock, MapPin, Search, Shield, Wifi } from "lucide-react"
import { useTranslations } from "next-intl"
import { CopyButton } from "@/components/shared/CopyButton"
import { CodeHighlight } from "@/components/ui/code-highlight"
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
      <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm">
        {/* Terminal Header */}
        <div className="flex items-center gap-2 border-b border-border bg-muted/50 px-4 py-3">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <span className="ml-2 text-sm font-medium text-muted-foreground">
            {t("title")}
          </span>
          <div className="ml-auto flex items-center gap-2">
            {ipInfo && (
              <>
                <div className="h-2 w-2 rounded-full bg-success"></div>
                <span className="text-xs text-success">
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
                <h4 className="flex items-center gap-2 font-semibold text-foreground">
                  <MapPin className="h-4 w-4 text-info" />
                  {t("locationInfoTitle")}
                </h4>
                <div className="grid grid-cols-2 gap-4 rounded-lg border border-border/50 bg-muted/30 p-4">
                  <div>
                    <div className="text-xs text-muted-foreground">
                      {t("ipAddress")}
                    </div>
                    <div className="font-mono text-sm font-medium text-foreground">
                      {ipInfo.ip}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">
                      {t("ipType")}
                    </div>
                    <div className="text-sm font-medium text-foreground uppercase">
                      {ipInfo.type}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">
                      {t("country")}
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                      {ipInfo.location.country_flag_emoji}
                      {ipInfo.country_name || t("unknown")}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">
                      {t("region")}
                    </div>
                    <div className="text-sm font-medium text-foreground">
                      {ipInfo.region_name || t("unknown")}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">
                      {t("city")}
                    </div>
                    <div className="text-sm font-medium text-foreground">
                      {ipInfo.city || t("unknown")}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">
                      {t("coordinates")}
                    </div>
                    <div className="font-mono text-sm text-foreground">
                      {ipInfo.latitude.toFixed(4)},{" "}
                      {ipInfo.longitude.toFixed(4)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Network Information */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 font-semibold text-foreground">
                  <Wifi className="h-4 w-4 text-success" />
                  {t("networkInfoTitle")}
                </h4>
                <div className="grid grid-cols-2 gap-4 rounded-lg border border-border/50 bg-muted/30 p-4">
                  <div>
                    <div className="text-xs text-muted-foreground">
                      {t("isp")}
                    </div>
                    <div className="text-sm font-medium text-foreground">
                      {ipInfo.connection.isp || t("unknown")}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">
                      {t("asn")}
                    </div>
                    <div className="text-sm font-medium text-foreground">
                      {ipInfo.connection.asn
                        ? `AS${ipInfo.connection.asn}`
                        : t("unknown")}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">
                      {t("connectionType")}
                    </div>
                    <div className="text-sm font-medium text-foreground capitalize">
                      {ipInfo.connection.usage_type || t("unknown")}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">
                      {t("continent")}
                    </div>
                    <div className="text-sm font-medium text-foreground">
                      {ipInfo.continent_name}
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 font-semibold text-foreground">
                  <Clock className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                  {t("additionalInfoTitle")}
                </h4>
                <div className="grid grid-cols-2 gap-4 rounded-lg border border-border/50 bg-muted/30 p-4">
                  <div>
                    <div className="text-xs text-muted-foreground">
                      {t("timezone")}
                    </div>
                    <div className="text-sm font-medium text-foreground">
                      {ipInfo.time_zone.id || t("unknown")}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">
                      {t("currency")}
                    </div>
                    <div className="text-sm font-medium text-foreground">
                      {ipInfo.currency.code
                        ? `${ipInfo.currency.name} (${ipInfo.currency.code})`
                        : t("unknown")}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">
                      {t("callingCode")}
                    </div>
                    <div className="text-sm font-medium text-foreground">
                      {ipInfo.location.calling_code
                        ? `${ipInfo.location.calling_code}`
                        : t("unknown")}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">
                      {t("euMember")}
                    </div>
                    <div className="text-sm font-medium text-foreground">
                      {ipInfo.location.is_eu ? t("yes") : t("no")}
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Analysis */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 font-semibold text-foreground">
                  <Shield className="h-4 w-4 text-destructive" />
                  {t("securityTitle")}
                </h4>
                <SecurityAnalysis ipInfo={ipInfo} />
              </div>

              {/* Interactive Map */}
              <div className="space-y-3">
                <h4 className="flex items-center gap-2 font-semibold text-foreground">
                  <MapPin className="h-4 w-4 text-info" />
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
            <div className="flex h-40 items-center justify-center text-muted-foreground">
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
        <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-3">
            <h4 className="text-sm font-medium text-foreground">
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
