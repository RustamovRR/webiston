'use client'

import { Download, Upload, Link, Globe, ArrowLeftRight, ChevronDown, X, ExternalLink } from 'lucide-react'

// UI Components
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ShimmerButton, GradientTabs } from '@/components/ui'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

// Shared Components
import { ToolHeader } from '@/components/shared/ToolHeader'
import { CopyButton } from '@/components/shared/CopyButton'
import { StatsDisplay } from '@/components/shared/StatsDisplay'

// Utils & Hooks
import { useUrlEncoder } from '@/hooks/tools/useUrlEncoder'

const UrlEncoder = () => {
  const {
    inputText,
    setInputText,
    mode,
    setMode,
    isProcessing,
    result,
    handleModeSwitch,
    handleClear,
    handleFileUpload,
    downloadResult,
    loadSampleText,
    canDownload,
    inputStats,
    outputStats,
    samples,
  } = useUrlEncoder()

  const handleFileUploadWrapper = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const displayOutput = result.output || ''

  const inputStatsArray = [
    { label: 'belgi', value: inputStats.characters },
    { label: "so'z", value: inputStats.words },
    { label: 'qator', value: inputStats.lines },
  ]

  const outputStatsArray = [
    { label: 'belgi', value: outputStats.characters },
    { label: "so'z", value: outputStats.words },
    { label: 'qator', value: outputStats.lines },
  ]

  const fileSizeKB = Math.round((displayOutput.length / 1024) * 100) / 100

  const tabOptions = [
    { value: 'encode', label: 'Kodlash (Encode)', icon: <Link size={16} /> },
    { value: 'decode', label: 'Dekodlash (Decode)', icon: <Globe size={16} /> },
  ]

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <ToolHeader
        title="URL Kodlash va Dekodlash"
        description="URL manzillarini xavfsiz formatga kodlash va dekodlash uchun professional vosita"
      />

      {/* Boshqaruv paneli */}
      <div className="mb-6 rounded-lg bg-zinc-900/60 p-4 backdrop-blur-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            {/* Gradient Tabs for Mode Selection */}
            <GradientTabs
              options={tabOptions}
              value={mode}
              onChange={(value) => setMode(value as 'encode' | 'decode')}
              toolCategory="converters"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* File Upload */}
            <input
              type="file"
              accept=".txt,.json"
              onChange={handleFileUploadWrapper}
              className="hidden"
              id="file-upload"
              disabled={isProcessing}
            />
            <Button variant="outline" size="sm" asChild disabled={isProcessing}>
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload size={16} className="mr-2" />
                Fayl yuklash
              </label>
            </Button>

            {/* Sample Data */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Link size={16} className="mr-2" />
                  Namuna URL
                  <ChevronDown size={16} className="ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {samples.map((sample) => (
                  <DropdownMenuItem key={sample.key} onClick={() => loadSampleText(sample.value)}>
                    {sample.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="sm" onClick={handleClear}>
              <X size={16} className="mr-2" />
              Tozalash
            </Button>

            {/* Download */}
            <ShimmerButton
              onClick={downloadResult}
              disabled={!canDownload || isProcessing}
              variant={canDownload ? 'default' : 'outline'}
              size="sm"
            >
              <Download size={16} className="mr-2" />
              Yuklab olish
            </ShimmerButton>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Kirish paneli */}
        <div className="flex flex-col rounded-xl border border-zinc-800/50 bg-zinc-900/80 shadow-2xl backdrop-blur-sm">
          <div className="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-800/50 px-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500/80"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500/80"></div>
              <div className="h-3 w-3 rounded-full bg-green-500/80"></div>
              <span className="ml-2 text-lg font-semibold text-zinc-100">
                {mode === 'encode' ? 'Oddiy URL/Matn Kirish' : 'Kodlangan URL Kirish'}
              </span>
            </div>
            <div className="text-xs text-zinc-400">
              {inputText.length > 0 && (
                <span className="flex items-center gap-1 text-blue-400">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-400"></div>
                  {mode === 'encode' ? 'Kodlashga tayyor' : 'Dekodlashga tayyor'}
                </span>
              )}
            </div>
          </div>

          <div className="relative flex-grow" style={{ minHeight: '500px', maxHeight: '500px' }}>
            <Textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="absolute inset-0 h-full w-full resize-none border-0 bg-transparent p-4 font-mono text-sm text-zinc-50 placeholder:text-zinc-500 focus:ring-0"
              placeholder={
                mode === 'encode'
                  ? 'https://webiston.uz/search?q=hello world&filter=active'
                  : 'https%3A//webiston.uz/search%3Fq%3Dhello%20world%26filter%3Dactive'
              }
              disabled={isProcessing}
            />
          </div>

          <div className="flex items-center justify-between border-t border-zinc-800 bg-zinc-800/30 px-4 py-3">
            <StatsDisplay stats={inputStatsArray} />
            {isProcessing && (
              <div className="text-right">
                <p className="text-xs text-blue-400">Ishlanmoqda...</p>
              </div>
            )}
          </div>
        </div>

        {/* Swap Button - Markazda */}
        <div className="relative lg:absolute lg:top-1/2 lg:left-1/2 lg:z-10 lg:-translate-x-1/2 lg:-translate-y-1/2">
          <div className="flex justify-center lg:justify-start">
            <ShimmerButton
              onClick={handleModeSwitch}
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full border-2 border-zinc-700 bg-zinc-900/90 shadow-xl backdrop-blur-sm hover:border-indigo-500/50 hover:bg-zinc-800/90"
              title="Rejimni almashtirish"
              disabled={!result.isValid || isProcessing}
            >
              <ArrowLeftRight size={20} className="text-zinc-300" />
            </ShimmerButton>
          </div>
        </div>

        {/* Chiqish paneli */}
        <div className="flex flex-col rounded-xl border border-zinc-800/50 bg-zinc-900/80 shadow-2xl backdrop-blur-sm">
          <div className="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-800/50 px-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500/80"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500/80"></div>
              <div className="h-3 w-3 rounded-full bg-green-500/80"></div>
              <span className="ml-2 text-lg font-semibold text-zinc-100">
                {mode === 'encode' ? 'Kodlangan URL Natija' : 'Dekodlangan URL Natija'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {result.urlInfo?.isValidUrl && (
                <div className="flex items-center gap-1 text-green-400">
                  <ExternalLink size={14} />
                  <span className="text-xs">To'g'ri URL</span>
                </div>
              )}
              <CopyButton text={displayOutput} disabled={!result.isValid} />
            </div>
          </div>

          <div className="relative flex-grow" style={{ minHeight: '500px', maxHeight: '500px' }}>
            <div className="absolute inset-0 h-full w-full overflow-y-auto">
              {result.error && !result.isValid ? (
                <div className="p-4">
                  <div className="rounded-lg border border-red-800/30 bg-red-900/20 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-400"></div>
                      <strong className="text-sm text-red-400">URL Konvertatsiya Xatoligi</strong>
                    </div>
                    <p className="font-mono text-sm text-red-300">{result.error}</p>
                  </div>
                </div>
              ) : displayOutput ? (
                <div className="space-y-4 p-4">
                  <pre className="font-mono text-sm break-all whitespace-pre-wrap text-zinc-100">{displayOutput}</pre>

                  {/* URL Info Section */}
                  {result.urlInfo?.isValidUrl && (
                    <div className="rounded-lg border border-zinc-700/30 bg-zinc-800/30 p-4">
                      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-300">
                        <Link size={16} className="text-indigo-400" />
                        URL Tuzilishi:
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="min-w-[80px] font-medium text-zinc-300">Protocol:</span>
                          <code className="rounded bg-zinc-900/50 px-2 py-1 text-zinc-200">
                            {result.urlInfo.protocol}
                          </code>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="min-w-[80px] font-medium text-zinc-300">Hostname:</span>
                          <code className="rounded bg-zinc-900/50 px-2 py-1 text-zinc-200">
                            {result.urlInfo.hostname}
                          </code>
                        </div>
                        {result.urlInfo.pathname && (
                          <div className="flex items-center gap-2">
                            <span className="min-w-[80px] font-medium text-zinc-300">Path:</span>
                            <code className="rounded bg-zinc-900/50 px-2 py-1 text-zinc-200">
                              {result.urlInfo.pathname}
                            </code>
                          </div>
                        )}
                        {result.urlInfo.search && (
                          <div className="flex items-center gap-2">
                            <span className="min-w-[80px] font-medium text-zinc-300">Query:</span>
                            <code className="rounded bg-zinc-900/50 px-2 py-1 text-zinc-200">
                              {result.urlInfo.search}
                            </code>
                          </div>
                        )}
                        {result.urlInfo.hash && (
                          <div className="flex items-center gap-2">
                            <span className="min-w-[80px] font-medium text-zinc-300">Hash:</span>
                            <code className="rounded bg-zinc-900/50 px-2 py-1 text-zinc-200">
                              {result.urlInfo.hash}
                            </code>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center p-8 text-center">
                  <div className="text-zinc-500">
                    <Link size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-sm">
                      {mode === 'encode'
                        ? "Kodlangan URL bu yerda ko'rinadi..."
                        : "Dekodlangan URL bu yerda ko'rinadi..."}
                    </p>
                    <p className="mt-2 text-xs opacity-75">URL kiriting yoki fayl yuklang</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between border-t border-zinc-800 bg-zinc-800/30 px-4 py-3">
            <StatsDisplay stats={outputStatsArray} />
            {displayOutput && (
              <div className="text-xs text-zinc-400">
                <span className="text-zinc-500">Hajm:</span> <span className="text-zinc-300">{fileSizeKB} KB</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Misollar bo'limi */}
      <div className="mt-8 rounded-xl border border-zinc-800/30 bg-zinc-900/60 p-6 backdrop-blur-sm">
        <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-100">
          <Link size={20} className="text-indigo-400" />
          URL Encoding misollari
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-zinc-700/30 bg-zinc-800/30 p-4">
            <div className="mb-3 text-xs font-medium text-zinc-400">Bo'shliq va maxsus belgilar</div>
            <div className="space-y-3">
              <div>
                <div className="mb-1 text-xs text-zinc-500">Asl holati:</div>
                <code className="block rounded bg-zinc-900/50 p-2 font-mono text-sm break-all text-zinc-200">
                  hello world & symbols
                </code>
              </div>
              <div>
                <div className="mb-1 text-xs text-zinc-500">Kodlangan:</div>
                <code className="block rounded bg-zinc-900/50 p-2 font-mono text-sm break-all text-zinc-300">
                  hello%20world%20%26%20symbols
                </code>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-zinc-700/30 bg-zinc-800/30 p-4">
            <div className="mb-3 text-xs font-medium text-zinc-400">Query parametrlari</div>
            <div className="space-y-3">
              <div>
                <div className="mb-1 text-xs text-zinc-500">Asl holati:</div>
                <code className="block rounded bg-zinc-900/50 p-2 font-mono text-sm break-all text-zinc-200">
                  name=Ali Valiyev&city=Toshkent
                </code>
              </div>
              <div>
                <div className="mb-1 text-xs text-zinc-500">Kodlangan:</div>
                <code className="block rounded bg-zinc-900/50 p-2 font-mono text-sm break-all text-zinc-300">
                  name%3DAli%20Valiyev%26city%3DToshkent
                </code>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Yordam va ma'lumot bo'limi */}
      <div className="mt-8 rounded-xl border border-zinc-800/30 bg-zinc-900/60 p-6 backdrop-blur-sm">
        <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-100">
          <Globe size={20} className="text-indigo-400" />
          URL Encoding haqida ma'lumot
        </h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
              <div className="h-2 w-2 rounded-full bg-blue-400"></div>
              URL Encoding nima?
            </h4>
            <p className="text-sm leading-relaxed text-zinc-400">
              URL Encoding (Percent Encoding) - URL larda maxsus ma'noga ega bo'lgan belgilarni xavfsiz formatga
              o'girish usuli. Har bir belgi % va ikkita hex raqam bilan almashtiriladi.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
              Qachon kerak?
            </h4>
            <ul className="space-y-1 text-sm text-zinc-400">
              <li>• URL da bo'shliq va maxsus belgilar ishlatganda</li>
              <li>• Query parametrlarida &, ?, = ishlatganda</li>
              <li>• Form ma'lumotlarini yuborishda</li>
              <li>• API so'rovlarida xavfsizlik uchun</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
              <div className="h-2 w-2 rounded-full bg-purple-400"></div>
              Kodlanadigan belgilar
            </h4>
            <ul className="space-y-1 text-sm text-zinc-400">
              <li>
                • Bo'shliq → <code className="text-indigo-400">%20</code>
              </li>
              <li>
                • @ → <code className="text-indigo-400">%40</code>
              </li>
              <li>
                • & → <code className="text-indigo-400">%26</code>
              </li>
              <li>
                • ? → <code className="text-indigo-400">%3F</code>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UrlEncoder
