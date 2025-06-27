import { Hash, Clock, Shuffle, FileText, Settings, Dice6 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GradientTabs } from '@/components/ui'
import { cn } from '@/lib'
import type { UuidVersion, UuidFormat } from '@/hooks/tools/useUuidGenerator'

interface ConfigurationPanelProps {
  version: UuidVersion
  format: UuidFormat
  count: number
  isGenerating: boolean
  sampleCounts: Array<{ label: string; value: number }>
  setVersion: (version: UuidVersion) => void
  setFormat: (format: UuidFormat) => void
  setCount: (count: number) => void
  loadSampleCount: (count: number) => void
  getVersionInfo: (version: UuidVersion) => any
  getFormatInfo: (format: UuidFormat) => any
}

export const ConfigurationPanel = ({
  version,
  format,
  count,
  isGenerating,
  sampleCounts,
  setVersion,
  setFormat,
  setCount,
  loadSampleCount,
  getVersionInfo,
  getFormatInfo,
}: ConfigurationPanelProps) => {
  const versionOptions = [
    {
      value: 'v4',
      label: 'UUID v4',
      icon: <Shuffle size={16} />,
    },
    {
      value: 'v1',
      label: 'UUID v1',
      icon: <Clock size={16} />,
    },
    {
      value: 'nil',
      label: 'NIL',
      icon: <Hash size={16} />,
    },
  ]

  const formatOptions = [
    {
      value: 'standard',
      label: 'Standard',
      icon: <Hash size={16} />,
    },
    {
      value: 'compact',
      label: 'Compact',
      icon: <FileText size={16} />,
    },
    {
      value: 'brackets',
      label: 'Brackets',
      icon: <Settings size={16} />,
    },
    {
      value: 'uppercase',
      label: 'UPPER',
      icon: <Dice6 size={16} />,
    },
  ]

  const currentVersionInfo = getVersionInfo(version)
  const currentFormatInfo = getFormatInfo(format)

  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1
    setCount(value)
  }

  return (
    <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-sm font-medium text-zinc-300">Tool Konfiguratsiya</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <span className="text-xs text-zinc-500">Ready</span>
        </div>
      </div>

      {/* Panel Content */}
      <div className="p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* UUID Version */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-300">UUID Versiyasi:</label>
            <GradientTabs
              options={versionOptions}
              value={version}
              onChange={(value) => setVersion(value as UuidVersion)}
              toolCategory="generators"
            />
            <div className="rounded-lg bg-zinc-800/50 p-3">
              <div className="text-xs text-zinc-400">{currentVersionInfo.description}</div>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs text-zinc-500">Xavfsizlik:</span>
                <span
                  className={cn(
                    'text-xs font-medium',
                    currentVersionInfo.security === 'High' && 'text-green-400',
                    currentVersionInfo.security === 'Medium' && 'text-yellow-400',
                    currentVersionInfo.security === 'None' && 'text-red-400',
                  )}
                >
                  {currentVersionInfo.security}
                </span>
                {currentVersionInfo.recommended && (
                  <span className="rounded bg-green-900/30 px-1.5 py-0.5 text-xs text-green-400">Tavsiya</span>
                )}
              </div>
            </div>
          </div>

          {/* UUID Format */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-300">Format:</label>
            <GradientTabs
              options={formatOptions}
              value={format}
              onChange={(value) => setFormat(value as UuidFormat)}
              toolCategory="generators"
            />
            <div className="rounded-lg bg-zinc-800/50 p-3">
              <div className="text-xs text-zinc-400">{currentFormatInfo.description}</div>
              <div className="mt-1 font-mono text-xs text-zinc-500">{currentFormatInfo.example}</div>
            </div>
          </div>
        </div>

        {/* Boshqaruv Panel */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Soni */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-zinc-300">Soni:</label>
              <input
                type="number"
                min="1"
                max="1000"
                value={count}
                onChange={handleCountChange}
                disabled={isGenerating}
                className="w-20 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 transition-colors focus:border-zinc-600 focus:outline-none disabled:opacity-50"
              />
              <span className="text-xs text-zinc-500">(1-1000)</span>
            </div>

            {/* Namuna tanlovlari */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-400">Namuna:</span>
              {sampleCounts.map((sample) => (
                <Button
                  key={sample.value}
                  onClick={() => loadSampleCount(sample.value)}
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs"
                >
                  {sample.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
