"use client"

import { Globe } from "lucide-react"
import { useTranslations } from "next-intl"

interface SampleIP {
  ip: string
  name: string
  description: string
}

interface SampleIpsPanelProps {
  samples: SampleIP[]
  onLoadSample: (sample: SampleIP) => void
  selectedIp?: string
}

export default function SampleIpsPanel({
  samples,
  onLoadSample,
  selectedIp
}: SampleIpsPanelProps) {
  const t = useTranslations("IpInfoPage.ControlPanel")
  const tSamples = useTranslations("IpInfoPage.SampleIps")

  return (
    <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm">
      <div className="border-b border-border bg-muted/50 px-4 py-3">
        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {t("sampleIpsTitle")}
        </h3>
      </div>
      <div className="p-4">
        <div className="space-y-2">
          {samples.map((sample, index) => {
            // Create proper translation key mapping
            const getTranslationKey = (name: string) => {
              const lowerName = name.toLowerCase()
              if (lowerName.includes("google")) return "google"
              if (lowerName.includes("cloudflare")) return "cloudflare"
              if (lowerName.includes("opendns")) return "open"
              if (lowerName.includes("quad9") && lowerName.includes("ibm"))
                return "ibmquad9"
              if (lowerName.includes("quad9")) return "quad9"
              if (lowerName.includes("level3")) return "level3"
              return "google" // fallback
            }

            const sampleKey = getTranslationKey(sample.name)
            const isSelected = selectedIp === sample.ip

            return (
              <button
                key={index}
                onClick={() => onLoadSample(sample)}
                className={`w-full rounded-lg border p-3 text-left transition-all ${
                  isSelected
                    ? "border-info/50 bg-info/50"
                    : "border-border/50 bg-muted/30 hover:border-border hover:bg-muted/50"
                }`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span
                    className={`font-medium ${isSelected ? "text-info" : "text-foreground"}`}
                  >
                    {tSamples(`${sampleKey}.name`)}
                  </span>
                  <Globe
                    className={`h-3 w-3 ${isSelected ? "text-info" : "text-info"}`}
                  />
                </div>
                <p
                  className={`text-xs ${isSelected ? "text-info" : "text-muted-foreground"}`}
                >
                  {tSamples(`${sampleKey}.description`)}
                </p>
                <div
                  className={`mt-2 font-mono text-sm ${isSelected ? "text-info" : "text-muted-foreground"}`}
                >
                  {sample.ip}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
