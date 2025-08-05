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
}

export default function SampleIpsPanel({ samples, onLoadSample }: SampleIpsPanelProps) {
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
            const sampleKey = sample.name.toLowerCase().replace(/\s+/g, '').replace('dns', '')

            return (
              <button
                key={index}
                onClick={() => onLoadSample(sample)}
                className="w-full rounded-lg border border-zinc-200/50 bg-zinc-100/30 p-3 text-left transition-all hover:border-zinc-300 hover:bg-zinc-100/50 dark:border-zinc-700/50 dark:bg-zinc-800/30 dark:hover:border-zinc-600 dark:hover:bg-zinc-800/50"
              >
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-medium text-zinc-800 dark:text-zinc-200">{tSamples(`${sampleKey}.name`)}</span>
                  <Globe className="h-3 w-3 text-blue-500 dark:text-blue-400" />
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-500">{tSamples(`${sampleKey}.description`)}</p>
                <div className="mt-2 font-mono text-sm text-zinc-600 dark:text-zinc-400">{sample.ip}</div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
