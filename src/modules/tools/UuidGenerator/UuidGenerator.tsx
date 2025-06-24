'use client'

import { Download, RefreshCw, Hash, Clock, Shuffle, FileText, Settings, Dice6 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ToolHeader, StatsDisplay, CopyButton } from '@/components/shared'
import { ShimmerButton, GradientTabs } from '@/components/ui'
import { NumberTicker } from '@/components/ui/number-ticker'
import { useUuidGenerator, UuidVersion, UuidFormat } from '@/hooks'
import { cn } from '@/lib'

const UuidGenerator = () => {
  const {
    uuids,
    count,
    version,
    format,
    isGenerating,
    stats,
    outputStats,
    sampleCounts,
    setCount,
    setVersion,
    setFormat,
    handleGenerate,
    handleClear,
    downloadUuids,
    downloadAsJson,
    loadSampleCount,
    getVersionInfo,
    getFormatInfo,
  } = useUuidGenerator({
    onSuccess: (message) => {
      console.log('Success:', message)
    },
    onError: (error) => {
      console.error('Error:', error)
    },
  })

  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1
    setCount(value)
  }

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
  const canDownload = uuids.length > 0

  // Input stats with proper number types
  const displayInputStats = [
    { label: 'soni', value: count },
    { label: 'versiya', value: 0 }, // will display as string below
    { label: 'format', value: 0 }, // will display as string below
  ]

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <ToolHeader
        title="UUID Generator"
        description="Professional UUID yaratish vositasi. Turli formatlar va versiyalar bilan noyob identifikatorlar yaratish."
      />

      {/* Konfiguratsiya Panel */}
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

            <div className="flex items-center gap-3">
              {/* Generate */}
              <ShimmerButton onClick={handleGenerate} disabled={isGenerating} size="sm">
                <RefreshCw size={16} className={cn('mr-2', isGenerating && 'animate-spin')} />
                {isGenerating ? 'Yaratilmoqda...' : 'UUID Yaratish'}
              </ShimmerButton>

              {/* Clear */}
              {uuids.length > 0 && (
                <Button onClick={handleClear} variant="outline" size="sm">
                  Tozalash
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Dual Panel Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Panel - Sozlamalar */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
          {/* Panel Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-sm font-medium text-zinc-300">Tool Kirish</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <span className="text-xs text-zinc-500">Input</span>
            </div>
          </div>

          {/* Panel Content */}
          <div className="p-6">
            {/* Custom Stats Display */}
            <div className="mb-6">
              <h3 className="mb-3 text-sm font-medium text-zinc-300">Sozlamalar</h3>
              <div className="flex gap-4 text-sm text-zinc-500">
                <span className="flex items-center gap-1">
                  <span className="font-mono text-zinc-300">{count}</span>
                  <span>soni</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="font-mono text-zinc-300">{version.toUpperCase()}</span>
                  <span>versiya</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="font-mono text-zinc-300">{format}</span>
                  <span>format</span>
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg bg-zinc-800/50 p-4">
                <h3 className="mb-2 text-sm font-medium text-zinc-300">UUID Versiya Ma'lumoti</h3>
                <div className="space-y-2 text-sm text-zinc-400">
                  <div>
                    <span className="text-zinc-300">Nom:</span> {currentVersionInfo.name}
                  </div>
                  <div>
                    <span className="text-zinc-300">Tavsif:</span> {currentVersionInfo.description}
                  </div>
                  <div>
                    <span className="text-zinc-300">Xavfsizlik:</span> {currentVersionInfo.security}
                  </div>
                </div>
              </div>

              <div className="rounded-lg bg-zinc-800/50 p-4">
                <h3 className="mb-2 text-sm font-medium text-zinc-300">Format Ma'lumoti</h3>
                <div className="space-y-2 text-sm text-zinc-400">
                  <div>
                    <span className="text-zinc-300">Nom:</span> {currentFormatInfo.name}
                  </div>
                  <div>
                    <span className="text-zinc-300">Pattern:</span>
                  </div>
                  <div className="font-mono text-xs text-zinc-500">{currentFormatInfo.description}</div>
                  <div>
                    <span className="text-zinc-300">Misol:</span>
                  </div>
                  <div className="font-mono text-xs text-zinc-500">{currentFormatInfo.example}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Natijalar */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
          {/* Panel Header */}
          <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-sm font-medium text-zinc-300">Tool Natija</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={cn('h-2 w-2 rounded-full', uuids.length > 0 ? 'bg-green-500' : 'bg-zinc-500')}></div>
                <span className="text-xs text-zinc-500">{uuids.length > 0 ? 'Generated' : 'Empty'}</span>
              </div>

              {/* Download Buttons */}
              {canDownload && (
                <div className="flex items-center gap-2">
                  <Button onClick={downloadUuids} variant="outline" size="sm" className="h-8">
                    <Download size={14} className="mr-1" />
                    TXT
                  </Button>
                  <Button onClick={downloadAsJson} variant="outline" size="sm" className="h-8">
                    <Download size={14} className="mr-1" />
                    JSON
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Panel Content */}
          <div className="p-6">
            {uuids.length > 0 && <StatsDisplay stats={outputStats} className="mb-6" />}

            {uuids.length === 0 ? (
              <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-zinc-700">
                <div className="text-center">
                  <Hash className="mx-auto h-12 w-12 text-zinc-600" />
                  <p className="mt-2 text-sm text-zinc-500">UUID yaratish uchun yuqoridagi tugmani bosing</p>
                </div>
              </div>
            ) : (
              <div className="max-h-96 space-y-2 overflow-y-auto">
                {uuids.map((item, index) => (
                  <div
                    key={item.id}
                    className="group flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-800/30 p-3 transition-colors hover:bg-zinc-800/50"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-mono text-sm break-all text-zinc-200">{item.uuid}</div>
                      <div className="text-xs text-zinc-500">
                        #{index + 1} • {item.version.toUpperCase()} • {item.format}
                      </div>
                    </div>
                    <CopyButton
                      text={item.uuid}
                      variant="ghost"
                      size="sm"
                      className="ml-2 opacity-0 group-hover:opacity-100"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistika Panel */}
      {uuids.length > 0 && (
        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/80 p-6 backdrop-blur-sm">
          <h3 className="mb-4 text-lg font-semibold text-zinc-200">Batafsil Statistika</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-zinc-100">
                <NumberTicker value={stats.total} />
              </div>
              <div className="text-sm text-zinc-400">Jami UUID</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-zinc-100">
                <NumberTicker value={stats.unique} />
              </div>
              <div className="text-sm text-zinc-400">Noyob UUID</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-zinc-100">
                <NumberTicker value={stats.duplicates} />
              </div>
              <div className="text-sm text-zinc-400">Dublikat</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-zinc-100">
                <NumberTicker value={stats.bytes} />
              </div>
              <div className="text-sm text-zinc-400">Jami Bayt</div>
            </div>
          </div>
        </div>
      )}

      {/* Ma'lumot Section */}
      <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/80 p-6 backdrop-blur-sm">
        <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-100">
          <Hash size={20} className="text-blue-400" />
          UUID nima va nima uchun ishlatiladi?
        </h3>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h4 className="mb-3 font-medium text-zinc-200">UUID versiyalari:</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                <strong>UUID v4 (Random):</strong> Tasodifiy qiymatlar asosida, eng xavfsiz va mashhur
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                <strong>UUID v1 (Timestamp):</strong> Vaqt va MAC address asosida, ketma-ketlik saqlaydi
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-yellow-500"></div>
                <strong>NIL UUID:</strong> Barcha noldan iborat, bo'sh holatni bildiradi
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                <strong>UUID v3/v5:</strong> Namespace va nom asosida, deterministic
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                <strong>UUID v6/v7/v8:</strong> Yangi standartlar, kelajakda qo'llab-quvvatlanadi
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-medium text-zinc-200">Qo'llanish sohalari:</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                <strong>Database Primary Keys:</strong> Auto-increment o'rniga global unique identifiers
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                <strong>Microservices:</strong> Distributed systemlarda noyob ID yaratish
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                <strong>File naming:</strong> Fayl va resurs nomlari uchun collision-free identifiers
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                <strong>Session IDs:</strong> Web application'larda session tracking
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-cyan-500"></div>
                <strong>API Keys:</strong> Service authentication va authorization
              </li>
            </ul>

            <div className="mt-4 rounded-lg bg-blue-500/10 p-3">
              <div className="text-sm text-blue-400">
                <strong>Muhim:</strong> UUID v4 ning collision ehtimoli 5.3×10⁻³⁶ ga teng, bu amalda noyoblikni
                kafolatlaydi.
              </div>
            </div>
          </div>
        </div>

        {/* Format Types Info */}
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-blue-500/10 p-4">
            <div className="mb-2 font-medium text-blue-400">Standard Format</div>
            <div className="mb-2 text-sm text-zinc-400">8-4-4-4-12 format bilan chiziqli ajratilgan</div>
            <div className="font-mono text-xs text-zinc-500">550e8400-e29b-41d4-a716-446655440000</div>
          </div>

          <div className="rounded-lg bg-green-500/10 p-4">
            <div className="mb-2 font-medium text-green-400">Compact Format</div>
            <div className="mb-2 text-sm text-zinc-400">Chiziqsiz, 32 belgilik format</div>
            <div className="font-mono text-xs text-zinc-500">550e8400e29b41d4a716446655440000</div>
          </div>

          <div className="rounded-lg bg-purple-500/10 p-4">
            <div className="mb-2 font-medium text-purple-400">Brackets Format</div>
            <div className="mb-2 text-sm text-zinc-400">Qavslar bilan o'ralgan format</div>
            <div className="font-mono text-xs text-zinc-500">{'{550e8400-e29b-41d4-a716-446655440000}'}</div>
          </div>

          <div className="rounded-lg bg-orange-500/10 p-4">
            <div className="mb-2 font-medium text-orange-400">Uppercase Format</div>
            <div className="mb-2 text-sm text-zinc-400">Katta harflar bilan yozilgan</div>
            <div className="font-mono text-xs text-zinc-500">550E8400-E29B-41D4-A716-446655440000</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UuidGenerator
