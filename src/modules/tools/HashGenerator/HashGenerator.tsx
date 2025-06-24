'use client'

import { useState } from 'react'
import { Hash, Upload, Download, FileDown, Shield, Zap, RefreshCw, X, ChevronDown, FileText } from 'lucide-react'

// UI Components
import { Button } from '@/components/ui/button'
import { ShimmerButton, GradientTabs } from '@/components/ui'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

// Shared Components
import { ToolHeader } from '@/components/shared/ToolHeader'
import { CopyButton } from '@/components/shared/CopyButton'
import { StatsDisplay } from '@/components/shared/StatsDisplay'

// Utils & Hooks
import { useHashGenerator, HashAlgorithm } from '@/hooks/tools/useHashGenerator'

const HashGenerator = () => {
  const [activeTab, setActiveTab] = useState<'text' | 'file'>('text')

  const {
    inputText,
    selectedAlgorithms,
    hashResults,
    isGenerating,
    inputStats,
    outputStats,
    availableAlgorithms,
    sampleTexts,
    setInputText,
    generateAllHashes,
    toggleAlgorithm,
    handleClear,
    handleFileUpload,
    downloadHashes,
    downloadAsJson,
    getAlgorithmInfo,
  } = useHashGenerator({
    onSuccess: (message) => console.log(message),
    onError: (error) => console.error(error),
  })

  const handleFileUploadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(file)
      setActiveTab('text')
    }
  }

  const hashOutputText =
    hashResults.length > 0 ? hashResults.map((result) => `${result.algorithm}: ${result.hash}`).join('\n\n') : ''

  const tabOptions = [
    { value: 'text', label: 'Matn Hash', icon: <Hash size={16} /> },
    { value: 'file', label: 'Fayl Hash', icon: <Upload size={16} /> },
  ]

  const canDownload = hashResults.length > 0

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <ToolHeader
        title="Hash Generator"
        description="MD5, SHA256, SHA512 va boshqa kriptografik hash algoritmlar bilan ma'lumotlarni hash qilish"
      />

      {/* Boshqaruv paneli */}
      <div className="mb-6 rounded-lg bg-zinc-900/60 p-4 backdrop-blur-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            {/* Gradient Tabs for Mode Selection */}
            <GradientTabs
              value={activeTab}
              options={tabOptions}
              onChange={(tab) => setActiveTab(tab as 'text' | 'file')}
              toolCategory="utilities"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* File Upload */}
            <input
              type="file"
              accept=".txt,.json,.csv,.md,.xml,.log"
              onChange={handleFileUploadChange}
              className="hidden"
              id="file-upload"
              disabled={isGenerating}
            />
            <Button variant="outline" size="sm" asChild disabled={isGenerating}>
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload size={16} className="mr-2" />
                Fayl yuklash
              </label>
            </Button>

            {/* Sample Data Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <FileText size={16} className="mr-2" />
                  Namuna Hash
                  <ChevronDown size={16} className="ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {sampleTexts.map((sample, index) => (
                  <DropdownMenuItem key={index} onClick={() => setInputText(sample.value)}>
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
            <ShimmerButton onClick={downloadHashes} disabled={!canDownload || isGenerating} variant="outline" size="sm">
              <Download size={16} className="mr-2" />
              TXT yuklab olish
            </ShimmerButton>

            <ShimmerButton
              onClick={downloadAsJson}
              disabled={!canDownload || isGenerating}
              variant={canDownload ? 'default' : 'outline'}
              size="sm"
            >
              <Download size={16} className="mr-2" />
              JSON yuklab olish
            </ShimmerButton>
          </div>
        </div>
      </div>

      {/* Algorithm Selection */}
      <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/80 p-6 backdrop-blur-sm">
        {/* macOS Window Controls */}
        <div className="mb-4 flex items-center gap-2">
          <div className="h-3 w-3 rounded-full bg-red-500"></div>
          <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
          <div className="h-3 w-3 rounded-full bg-green-500"></div>
          <span className="ml-4 text-sm font-medium text-zinc-300">Hash Algoritmlari</span>
        </div>

        <div className="flex flex-wrap gap-3">
          {availableAlgorithms.map((algorithm) => {
            const info = getAlgorithmInfo(algorithm)
            const isActive = selectedAlgorithms.includes(algorithm)
            return (
              <button
                key={algorithm}
                onClick={() => toggleAlgorithm(algorithm)}
                className={`flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? 'border-blue-500 bg-blue-500/20 text-blue-400'
                    : 'border-zinc-700 bg-zinc-800/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                }`}
              >
                <span>{algorithm}</span>
                <span
                  className={`rounded px-2 py-0.5 text-xs ${
                    info.status === 'deprecated'
                      ? 'bg-red-900/50 text-red-400'
                      : info.status === 'weak'
                        ? 'bg-yellow-900/50 text-yellow-400'
                        : info.status === 'secure'
                          ? 'bg-blue-900/50 text-blue-400'
                          : 'bg-green-900/50 text-green-400'
                  }`}
                >
                  {info.recommendation}
                </span>
              </button>
            )
          })}
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
                {activeTab === 'text' ? 'Matn Kirish' : 'Fayl Hash Kirish'}
              </span>
            </div>
            <div className="text-xs text-zinc-400">
              {inputText.length > 0 && (
                <span className="flex items-center gap-1 text-blue-400">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-400"></div>
                  Hash yaratishga tayyor
                </span>
              )}
            </div>
          </div>

          <div className="relative flex-grow" style={{ minHeight: '500px', maxHeight: '500px' }}>
            {activeTab === 'text' ? (
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="absolute inset-0 h-full w-full resize-none border-0 bg-transparent p-4 font-mono text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none"
                placeholder="Hash qilmoqchi bo'lgan matnni kiriting..."
                disabled={isGenerating}
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <label className="flex cursor-pointer flex-col items-center gap-4 rounded-lg border-2 border-dashed border-zinc-600 p-8 transition-colors hover:border-zinc-500">
                  <Upload size={48} className="text-zinc-500" />
                  <div className="text-center">
                    <p className="text-sm font-medium text-zinc-300">Faylni tanlang</p>
                    <p className="text-xs text-zinc-500">TXT, JSON, CSV, MD, XML, LOG (10MB gacha)</p>
                  </div>
                  <input
                    type="file"
                    accept=".txt,.json,.csv,.md,.xml,.log"
                    onChange={handleFileUploadChange}
                    className="hidden"
                  />
                </label>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between border-t border-zinc-800 bg-zinc-800/30 px-4 py-3">
            <StatsDisplay stats={inputStats} />
            {isGenerating && (
              <div className="text-right">
                <p className="text-xs text-blue-400">Ishlanmoqda...</p>
              </div>
            )}
          </div>
        </div>

        {/* Chiqish paneli */}
        <div className="flex flex-col rounded-xl border border-zinc-800/50 bg-zinc-900/80 shadow-2xl backdrop-blur-sm">
          <div className="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-800/50 px-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500/80"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500/80"></div>
              <div className="h-3 w-3 rounded-full bg-green-500/80"></div>
              <span className="ml-2 text-lg font-semibold text-zinc-100">Hash Natijalari</span>
            </div>
            <CopyButton text={hashOutputText} disabled={hashResults.length === 0} />
          </div>

          <div className="relative flex-grow" style={{ minHeight: '500px', maxHeight: '500px' }}>
            <div className="absolute inset-0 h-full w-full overflow-y-auto">
              {hashResults.length > 0 ? (
                <div className="p-4">
                  <pre className="font-mono text-sm break-all whitespace-pre-wrap text-zinc-100">{hashOutputText}</pre>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center p-8 text-center">
                  <div className="text-zinc-500">
                    <Hash size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-sm">Hash natijalari bu yerda ko'rsatiladi</p>
                    <p className="mt-2 text-xs opacity-75">Matn kiriting va algoritm tanlang</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between border-t border-zinc-800 bg-zinc-800/30 px-4 py-3">
            <StatsDisplay stats={outputStats} />
            {hashResults.length > 0 && (
              <div className="text-xs text-zinc-400">
                <span className="text-zinc-500">Hash soni:</span>{' '}
                <span className="text-zinc-300">{hashResults.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Hash Results */}
      {hashResults.length > 0 && (
        <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
          <div className="flex h-16 items-center border-b border-zinc-800 px-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
              <span className="ml-4 text-lg font-semibold text-zinc-100">Batafsil Hash Natijalari</span>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              {hashResults.map((result) => {
                const info = getAlgorithmInfo(result.algorithm)
                return (
                  <div key={result.algorithm} className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Hash size={20} className="text-zinc-400" />
                        <span className="text-lg font-semibold text-zinc-100">{result.algorithm}</span>
                        <span className="text-sm text-zinc-400">({result.length} belgi)</span>
                        <span
                          className={`rounded px-2 py-1 text-xs ${
                            result.status === 'deprecated'
                              ? 'bg-red-900/50 text-red-400'
                              : result.status === 'weak'
                                ? 'bg-yellow-900/50 text-yellow-400'
                                : result.status === 'secure'
                                  ? 'bg-blue-900/50 text-blue-400'
                                  : 'bg-green-900/50 text-green-400'
                          }`}
                        >
                          {info.description}
                        </span>
                      </div>
                      <CopyButton text={result.hash} />
                    </div>
                    <div className="rounded bg-zinc-900 p-3 font-mono text-sm text-zinc-100">{result.hash}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Info Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-6 backdrop-blur-sm">
          <div className="mb-4 flex items-center gap-2">
            <Shield size={20} className="text-blue-400" />
            <h3 className="font-semibold text-zinc-100">Xavfsizlik Darajalari</h3>
          </div>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center justify-between">
              <span className="text-red-400">MD5</span>
              <span className="rounded bg-red-900/30 px-2 py-1 text-xs text-red-400">Deprecated</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-yellow-400">SHA1</span>
              <span className="rounded bg-yellow-900/30 px-2 py-1 text-xs text-yellow-400">Zaif</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-blue-400">SHA256</span>
              <span className="rounded bg-blue-900/30 px-2 py-1 text-xs text-blue-400">Xavfsiz</span>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-green-400">SHA512</span>
              <span className="rounded bg-green-900/30 px-2 py-1 text-xs text-green-400">Eng xavfsiz</span>
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-6 backdrop-blur-sm">
          <div className="mb-4 flex items-center gap-2">
            <Zap size={20} className="text-purple-400" />
            <h3 className="font-semibold text-zinc-100">Foydalanish Sohalari</h3>
          </div>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
              Parol hashing
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
              File integrity
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
              Digital signatures
            </li>
            <li className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
              Blockchain
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-6 backdrop-blur-sm">
          <div className="mb-4 flex items-center gap-2">
            <Hash size={20} className="text-green-400" />
            <h3 className="font-semibold text-zinc-100">Muhim Eslatmalar</h3>
          </div>
          <ul className="space-y-1 text-sm text-zinc-400">
            <li>• Hash funksiyalar qaytarilmas</li>
            <li>• Bir xil input → bir xil hash</li>
            <li>• Kichik o'zgarish → butunlay boshqa hash</li>
            <li>• SHA256+ algoritmlarni ishlating</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default HashGenerator
