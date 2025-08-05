'use client'

import { Globe } from 'lucide-react'
import { useTranslations } from 'next-intl'

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

export default function SampleIpsPanel({ samples, onLoadSample, selectedIp }: SampleIpsPanelProps) {
  const t = useTranslations('IpInfoPage.ControlPanel')
  const tSamples = useTranslations('IpInfoPage.SampleIps')

  return (
    <div className="rounded-xl border border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      <div className="border-b border-zinc-200 bg-zinc-50/50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900/50">
        <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('sampleIpsTitle')}</h3>
      </div>
      <div className="p-4">
        <div className="space-y-2">
          {samples.map((sample, index) => {
            // Create proper translation key mapping
            const getTranslationKey = (name: string) => {
              const lowerName = name.toLowerCase()
              if (lowerName.includes('google')) return 'google'
              if (lowerName.includes('cloudflare')) return 'cloudflare'
              if (lowerName.includes('opendns')) return 'open'
              if (lowerName.includes('quad9') && lowerName.includes('ibm')) return 'ibmquad9'
              if (lowerName.includes('quad9')) return 'quad9'
              if (lowerName.includes('level3')) return 'level3'
              return 'google' // fallback
            }

            const sampleKey = getTranslationKey(sample.name)
            const isSelected = selectedIp === sample.ip

            return (
              <button
                key={index}
                onClick={() => onLoadSample(sample)}
                className={`w-full rounded-lg border p-3 text-left transition-all ${
                  isSelected
                    ? 'border-blue-500/50 bg-blue-50/50 dark:border-blue-400/50 dark:bg-blue-900/20'
                    : 'border-zinc-200/50 bg-zinc-100/30 hover:border-zinc-300 hover:bg-zinc-100/50 dark:border-zinc-700/50 dark:bg-zinc-800/30 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/50'
                }`}
              >
                <div className="mb-1 flex items-center justify-between">
                  <span
                    className={`font-medium ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-zinc-800 dark:text-zinc-200'}`}
                  >
                    {tSamples(`${sampleKey}.name`)}
                  </span>
                  <Globe
                    className={`h-3 w-3 ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-blue-500 dark:text-blue-400'}`}
                  />
                </div>
                <p
                  className={`text-xs ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-600 dark:text-zinc-500'}`}
                >
                  {tSamples(`${sampleKey}.description`)}
                </p>
                <div
                  className={`mt-2 font-mono text-sm ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-zinc-600 dark:text-zinc-400'}`}
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
