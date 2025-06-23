'use client'

import { useState } from 'react'
import { Check, Copy, Download, RefreshCw, Hash, Clock, Shuffle, FileText, BarChart3, Fingerprint } from 'lucide-react'
import { useCopyToClipboard } from 'usehooks-ts'
import { Button } from '@/components/ui/button'
import { ToolHeader } from '@/components/shared/ToolHeader'
import { ShimmerButton, GradientTabs, ToolPanel } from '@/components/ui'
import { NumberTicker } from '@/components/ui/number-ticker'
import { useUuidGenerator, UuidVersion, UuidFormat } from '@/hooks'
import { UI_PATTERNS, TOOL_COLOR_MAP } from '@/constants/ui-constants'

const UuidGenerator = () => {
  const [copied, setCopied] = useState('')
  const [showInfo, setShowInfo] = useState(false)
  const [_, copy] = useCopyToClipboard()

  const toolColors = TOOL_COLOR_MAP['uuid-generator']

  const {
    uuids,
    count,
    version,
    format,
    isGenerating,
    stats,
    setCount,
    setVersion,
    setFormat,
    handleGenerate,
    handleClear,
    downloadUuids,
    downloadAsJson,
    validateUuid,
    getUuidInfo,
  } = useUuidGenerator({
    onSuccess: (message) => {
      console.log('Success:', message)
    },
    onError: (error) => {
      console.error('Error:', error)
    },
  })

  const handleCopy = async (uuid: string, index: string) => {
    try {
      await copy(uuid)
      setCopied(index)
      setTimeout(() => setCopied(''), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  const handleCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value) || 1
    setCount(Math.max(1, Math.min(1000, value)))
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
      label: 'NIL UUID',
      icon: <Hash size={16} />,
    },
  ]

  const formatOptions = [
    {
      value: 'standard',
      label: 'Standart',
      icon: <Hash size={16} />,
    },
    {
      value: 'compact',
      label: 'Compact',
      icon: <Fingerprint size={16} />,
    },
    {
      value: 'brackets',
      label: 'Brackets',
      icon: <FileText size={16} />,
    },
    {
      value: 'uppercase',
      label: 'UPPERCASE',
      icon: <BarChart3 size={16} />,
    },
  ]

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <ToolHeader
        title="UUID Generator"
        description="Noyob identifikatorlar (UUID) yaratish uchun professional vosita. Turli formatlar va versiyalar."
      />

      {/* Version va Format tanlash paneli */}
      <div className={`mb-6 ${UI_PATTERNS.CONTROL_PANEL}`}>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-6">
            {/* UUID Version */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">UUID Versiyasi:</label>
              <GradientTabs
                options={versionOptions}
                value={version}
                onChange={(value) => setVersion(value as UuidVersion)}
                toolCategory="generators"
              />
            </div>

            {/* UUID Format */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Format:</label>
              <GradientTabs
                options={formatOptions}
                value={format}
                onChange={(value) => setFormat(value as UuidFormat)}
                toolCategory="generators"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Boshqaruv paneli */}
      <div className={`mb-6 ${UI_PATTERNS.CONTROL_PANEL}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Count input */}
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-zinc-300">Soni:</label>
              <input
                type="number"
                min="1"
                max="1000"
                value={count}
                onChange={handleCountChange}
                disabled={isGenerating}
                className="w-20 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 transition-colors focus:border-zinc-600 focus:outline-none"
              />
              <span className="text-xs text-zinc-500">(1-1000)</span>
            </div>

            {/* Generate button */}
            <ShimmerButton onClick={handleGenerate} disabled={isGenerating} variant="default" size="sm">
              <RefreshCw size={16} className={`mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Yaratilmoqda...' : 'UUID Yaratish'}
            </ShimmerButton>

            {/* Info toggle */}
            <Button
              onClick={() => setShowInfo(!showInfo)}
              variant="outline"
              size="sm"
              className={showInfo ? `${toolColors.border} ${toolColors.bg} ${toolColors.text}` : ''}
            >
              <BarChart3 size={16} className="mr-2" />
              {showInfo ? "Ma'lumotni yashirish" : "Ma'lumot ko'rsatish"}
            </Button>
          </div>

          {/* Clear button */}
          {uuids.length > 0 && (
            <Button onClick={handleClear} variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-200">
              Tozalash
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Panel */}
      {uuids.length > 0 && (
        <div className={`mb-6 ${UI_PATTERNS.CONTROL_PANEL}`}>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            <div className="text-center">
              <div className="text-2xl font-bold text-zinc-100">
                <NumberTicker value={stats.total} />
              </div>
              <div className="text-sm text-zinc-400">Jami UUID</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-zinc-100">
                <NumberTicker value={stats.uniqueCount} />
              </div>
              <div className="text-sm text-zinc-400">Noyob</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-zinc-100">
                <NumberTicker value={stats.duplicates} />
              </div>
              <div className="text-sm text-zinc-400">Takrorlangan</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-zinc-100">
                <NumberTicker value={stats.averageLength} />
              </div>
              <div className="text-sm text-zinc-400">O'rtacha uzunlik</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-zinc-100">
                <NumberTicker value={stats.totalCharacters} />
              </div>
              <div className="text-sm text-zinc-400">Jami belgilar</div>
            </div>
          </div>
        </div>
      )}

      {/* Results Panel */}
      {uuids.length > 0 && (
        <div className="mb-6">
          <ToolPanel
            title={`Yaratilgan UUID lar (${stats.total})`}
            variant="terminal"
            actions={
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleCopy(uuids.map((u) => u.uuid).join('\n'), 'all')}
                  className="cursor-pointer rounded-full p-2.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
                  aria-label="Barchasini nusxalash"
                  title="Barchasini nusxalash"
                >
                  {copied === 'all' ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                </button>
                <button
                  onClick={() => downloadUuids()}
                  className="cursor-pointer rounded-full p-2.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
                  aria-label="TXT sifatida yuklab olish"
                  title="TXT sifatida yuklab olish"
                >
                  <Download size={18} />
                </button>
                <button
                  onClick={() => downloadAsJson()}
                  className="cursor-pointer rounded-full p-2.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
                  aria-label="JSON sifatida yuklab olish"
                  title="JSON sifatida yuklab olish"
                >
                  <FileText size={18} />
                </button>
              </div>
            }
          >
            <div className="absolute inset-0 h-full w-full overflow-y-auto p-4">
              <div className="space-y-3">
                {uuids.map((item, index) => {
                  const uuidInfo = getUuidInfo(item.uuid)
                  return (
                    <div
                      key={item.id}
                      className="group flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-800/50 p-4 transition-colors hover:border-zinc-600"
                    >
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-3">
                          <code className="font-mono text-sm break-all text-zinc-100">{item.uuid}</code>
                          {showInfo && uuidInfo.isValid && (
                            <div className="flex items-center gap-2">
                              <span className="rounded bg-zinc-700 px-2 py-1 text-xs text-zinc-300">
                                {uuidInfo.version}
                              </span>
                              <span className="text-xs text-zinc-500">
                                {new Date(item.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                          )}
                        </div>
                        {showInfo && (
                          <div className="text-xs text-zinc-500">
                            Index: {index + 1} | Uzunlik: {item.uuid.length} belgi | Format: {format} | Yaratilgan:{' '}
                            {new Date(item.timestamp).toLocaleString()}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => handleCopy(item.uuid, item.id)}
                        className="ml-4 rounded-full p-2 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
                        aria-label="UUID ni nusxalash"
                      >
                        {copied === item.id ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          </ToolPanel>
        </div>
      )}

      {/* Empty State */}
      {uuids.length === 0 && (
        <div className="mb-6 flex h-64 items-center justify-center rounded-lg border-2 border-dashed border-zinc-700 bg-zinc-900/20">
          <div className="text-center">
            <div className="mx-auto mb-4 flex items-center justify-center opacity-50">
              <Hash size={48} className="text-zinc-500" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-zinc-300">UUID lar bu yerda ko'rinadi</h3>
            <p className="text-sm text-zinc-500">Yuqoridagi "UUID Yaratish" tugmasini bosing</p>
          </div>
        </div>
      )}

      {/* Ma'lumot va yordam bo'limi */}
      <div className={`mt-8 ${UI_PATTERNS.CONTROL_PANEL}`}>
        <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-100">
          <Hash size={20} className={toolColors.text.replace('text-', 'text-')} />
          UUID haqida ma'lumot
        </h3>

        <div className="space-y-6">
          {/* UUID Versions */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
                <Shuffle size={16} className="text-purple-400" />
                UUID v4 (Random)
              </h4>
              <ul className="space-y-1 text-sm text-zinc-400">
                <li>• Tasodifiy raqamlar asosida</li>
                <li>• Eng xavfsiz va keng ishlatiladi</li>
                <li>• Unique ehtimoli 99.999%</li>
                <li>• 122-bit entropy</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
                <Clock size={16} className="text-blue-400" />
                UUID v1 (Timestamp)
              </h4>
              <ul className="space-y-1 text-sm text-zinc-400">
                <li>• Vaqt va MAC address asosida</li>
                <li>• Vaqt tartibini saqlaydi</li>
                <li>• Machine info ochib berishi mumkin</li>
                <li>• Database sorting uchun yaxshi</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
                <Hash size={16} className="text-gray-400" />
                NIL UUID
              </h4>
              <ul className="space-y-1 text-sm text-zinc-400">
                <li>• Faqat 0 lardan iborat</li>
                <li>• Test va debugging uchun</li>
                <li>• NULL qiymat o'rniga ishlatiladi</li>
                <li>• RFC 4122 standartida belgilangan</li>
              </ul>
            </div>
          </div>

          {/* Formats */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
                <Hash size={16} className="text-green-400" />
                Standart Format
              </h4>
              <div className="rounded bg-zinc-900/50 p-3">
                <code className="text-xs break-all text-zinc-300">550e8400-e29b-41d4-a716-446655440000</code>
              </div>
              <p className="text-xs text-zinc-500">36 belgi, tire bilan</p>
            </div>
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
                <Fingerprint size={16} className="text-orange-400" />
                Compact Format
              </h4>
              <div className="rounded bg-zinc-900/50 p-3">
                <code className="text-xs break-all text-zinc-300">550e8400e29b41d4a716446655440000</code>
              </div>
              <p className="text-xs text-zinc-500">32 belgi, tiresiz</p>
            </div>
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
                <FileText size={16} className="text-blue-400" />
                Brackets Format
              </h4>
              <div className="rounded bg-zinc-900/50 p-3">
                <code className="text-xs break-all text-zinc-300">{'{550e8400-e29b-41d4-a716-446655440000}'}</code>
              </div>
              <p className="text-xs text-zinc-500">38 belgi, {} bilan</p>
            </div>
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
                <BarChart3 size={16} className="text-yellow-400" />
                UPPERCASE
              </h4>
              <div className="rounded bg-zinc-900/50 p-3">
                <code className="text-xs break-all text-zinc-300">550E8400-E29B-41D4-A716-446655440000</code>
              </div>
              <p className="text-xs text-zinc-500">Katta harflar</p>
            </div>
          </div>

          {/* Use Cases */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
                <div className="h-2 w-2 rounded-full bg-purple-400"></div>
                Foydalanish joylari
              </h4>
              <ul className="space-y-1 text-sm text-zinc-400">
                <li>• Database primary keys</li>
                <li>• Session identifiers</li>
                <li>• API request tracking</li>
                <li>• File naming va versioning</li>
                <li>• Distributed systems</li>
                <li>• Message queuing</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
                <div className="h-2 w-2 rounded-full bg-green-400"></div>
                Afzalliklari
              </h4>
              <ul className="space-y-1 text-sm text-zinc-400">
                <li>• Global unique identifier</li>
                <li>• Collision resistance</li>
                <li>• Decentralized generation</li>
                <li>• Cross-platform compatibility</li>
                <li>• Standard RFC 4122 format</li>
                <li>• No coordination required</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UuidGenerator
