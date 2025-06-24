'use client'

import { useState } from 'react'
import { Check, Copy, Download, Upload, X, Hash, FileDown, Zap } from 'lucide-react'
import { useCopyToClipboard } from 'usehooks-ts'
import { Button } from '@/components/ui/button'
import { ToolHeader } from '@/components/shared/ToolHeader'
import { DualTextPanel } from '@/components/shared/DualTextPanel'
import { ShimmerButton, GradientTabs } from '@/components/ui'
import { useHashGenerator, HashAlgorithm } from '@/hooks/tools/useHashGenerator'
import { UI_PATTERNS, TOOL_COLOR_MAP } from '@/constants/ui-constants'

const HashGenerator = () => {
  const [copied, setCopied] = useState('')
  const [_, copy] = useCopyToClipboard()
  const toolColors = TOOL_COLOR_MAP['hash-generator']

  const {
    inputText,
    selectedAlgorithms,
    hashResults,
    isGenerating,
    inputStats,
    availableAlgorithms,
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

  const handleCopy = async (hash: string, algorithm: string) => {
    try {
      await copy(hash)
      setCopied(algorithm)
      setTimeout(() => setCopied(''), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  const handleFileUploadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const presetTexts = [
    { label: 'Hello World', value: 'Hello, World!' },
    { label: 'Salom Dunyo', value: 'Salom, Dunyo!' },
    { label: 'Lorem Ipsum', value: 'Lorem ipsum dolor sit amet consectetur adipiscing elit' },
    { label: 'Test String', value: 'Bu test matni hash yaratish uchun' },
  ]

  const hashResultText =
    hashResults.length > 0 ? hashResults.map((result) => `${result.algorithm}: ${result.hash}`).join('\n\n') : ''

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <ToolHeader
        title="Hash Generator"
        description="MD5, SHA256, SHA512 va boshqa hash algoritmlar bilan ma'lumotlarni hash qilish"
      />

      {/* Algorithm Selection */}
      <div className={`mb-6 ${UI_PATTERNS.CONTROL_PANEL}`}>
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-zinc-300">Hash Algoritmlari:</h3>
          <div className="flex flex-wrap gap-2">
            {availableAlgorithms.map((algorithm) => {
              const info = getAlgorithmInfo(algorithm)
              const isActive = selectedAlgorithms.includes(algorithm)
              return (
                <Button
                  key={algorithm}
                  onClick={() => toggleAlgorithm(algorithm)}
                  variant="outline"
                  size="sm"
                  className={`cursor-pointer text-xs transition-all ${
                    isActive
                      ? `${toolColors.border} ${toolColors.bg} ${toolColors.text}`
                      : 'border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{algorithm}</span>
                    <span
                      className={`rounded px-1.5 py-0.5 text-xs ${
                        info.status === 'deprecated'
                          ? 'bg-red-900/30 text-red-400'
                          : info.status === 'weak'
                            ? 'bg-yellow-900/30 text-yellow-400'
                            : info.status === 'secure'
                              ? 'bg-blue-900/30 text-blue-400'
                              : 'bg-green-900/30 text-green-400'
                      }`}
                    >
                      {info.security}
                    </span>
                  </div>
                </Button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Sample Data */}
      <div className={`mb-6 ${UI_PATTERNS.CONTROL_PANEL}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-zinc-300">Namuna ma'lumotlar:</span>
            <div className="flex flex-wrap gap-2">
              {presetTexts.map((preset, index) => (
                <Button
                  key={index}
                  onClick={() => setInputText(preset.value)}
                  variant="outline"
                  size="sm"
                  className="cursor-pointer border-zinc-700 text-xs text-zinc-400 transition-all hover:border-zinc-600 hover:text-zinc-200"
                >
                  {preset.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className={`mb-6 ${UI_PATTERNS.CONTROL_PANEL}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept=".txt,.json,.csv,.md"
                onChange={handleFileUploadChange}
                className="hidden"
                id="file-upload"
              />
              <Button variant="outline" size="sm" asChild>
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload size={16} className="mr-2" />
                  Fayl yuklash
                </label>
              </Button>
            </div>

            {inputText && (
              <Button onClick={handleClear} variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-200">
                <X size={16} className="mr-2" />
                Tozalash
              </Button>
            )}
          </div>

          {hashResults.length > 0 && (
            <div className="flex items-center gap-2">
              <ShimmerButton onClick={downloadHashes} variant="outline" size="sm">
                <Download size={16} className="mr-2" />
                TXT yuklab olish
              </ShimmerButton>

              <ShimmerButton onClick={downloadAsJson} variant="default" size="sm">
                <FileDown size={16} className="mr-2" />
                JSON yuklab olish
              </ShimmerButton>
            </div>
          )}
        </div>
      </div>

      {/* Main Panel */}
      <DualTextPanel
        sourceText={inputText}
        convertedText={hashResultText}
        sourcePlaceholder="Hash qilmoqchi bo'lgan matnni kiriting..."
        sourceLabel="Input Text"
        targetLabel="Hash Natijalari"
        onSourceChange={setInputText}
        onClear={handleClear}
        variant="terminal"
      />

      {/* Hash Results Detail */}
      {hashResults.length > 0 && (
        <div className={`mt-6 ${UI_PATTERNS.CONTROL_PANEL}`}>
          <h3 className="mb-4 text-lg font-semibold text-zinc-100">Batafsil Hash Natijalari</h3>
          <div className="space-y-4">
            {hashResults.map((result) => {
              const info = getAlgorithmInfo(result.algorithm)

              return (
                <div key={result.algorithm} className="rounded-xl bg-zinc-900/80 shadow-inner">
                  <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-4">
                    <div className="flex items-center gap-3">
                      <Hash size={18} className="text-zinc-400" />
                      <span className="text-lg font-semibold text-zinc-100">{result.algorithm}</span>
                      <span className="text-sm text-zinc-400">({result.length} chars)</span>
                      <span
                        className={`rounded px-2 py-1 text-xs ${
                          result.status === 'deprecated'
                            ? 'bg-red-900/30 text-red-400'
                            : result.status === 'weak'
                              ? 'bg-yellow-900/30 text-yellow-400'
                              : result.status === 'secure'
                                ? 'bg-blue-900/30 text-blue-400'
                                : 'bg-green-900/30 text-green-400'
                        }`}
                      >
                        {info.description}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(result.hash, result.algorithm)}
                      className="rounded-full p-2.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
                      aria-label={`Copy ${result.algorithm} hash`}
                    >
                      {copied === result.algorithm ? (
                        <Check size={18} className="text-green-500" />
                      ) : (
                        <Copy size={18} />
                      )}
                    </button>
                  </div>

                  <div className="p-4">
                    <div className="rounded bg-zinc-800/50 p-3 font-mono text-sm break-all whitespace-pre-wrap text-zinc-100">
                      {result.hash}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Hash Comparison */}
      {hashResults.length > 1 && (
        <div className={`mt-6 ${UI_PATTERNS.CONTROL_PANEL}`}>
          <h3 className="mb-4 text-lg font-semibold text-zinc-100">Hash Taqqoslash</h3>
          <div className="grid gap-3">
            {hashResults.map((result) => {
              const info = getAlgorithmInfo(result.algorithm)

              return (
                <div
                  key={result.algorithm}
                  className="flex items-center justify-between rounded border border-zinc-700 bg-zinc-800/30 p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-16 font-medium text-zinc-300">{result.algorithm}:</span>
                    <span className="font-mono text-sm text-zinc-400">{result.length} characters</span>
                    <span className="text-xs text-zinc-500">Output: {info.outputLength} hex chars</span>
                  </div>
                  <div
                    className={`rounded px-2 py-1 text-xs ${
                      result.status === 'deprecated'
                        ? 'bg-red-900/30 text-red-400'
                        : result.status === 'weak'
                          ? 'bg-yellow-900/30 text-yellow-400'
                          : result.status === 'secure'
                            ? 'bg-blue-900/30 text-blue-400'
                            : 'bg-green-900/30 text-green-400'
                    }`}
                  >
                    {result.security} Security
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className={`mt-8 ${UI_PATTERNS.CONTROL_PANEL}`}>
        <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-100">
          <Zap size={20} className={toolColors.text.replace('text-', 'text-')} />
          Hash Algoritmlari haqida
        </h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h4 className="mb-3 font-medium text-zinc-200">Foydalanish sohalari:</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                Parol hashing va autentifikatsiya
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                File integrity tekshirish
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                Digital signatures yaratish
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                Data verification va checksums
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-cyan-500"></div>
                Blockchain va cryptocurrency
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-medium text-zinc-200">Xavfsizlik darajalari:</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center justify-between">
                <span className="font-medium text-red-400">MD5</span>
                <span className="rounded bg-red-900/30 px-2 py-1 text-xs text-red-400">Deprecated - Ishlatmang</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="font-medium text-yellow-400">SHA1</span>
                <span className="rounded bg-yellow-900/30 px-2 py-1 text-xs text-yellow-400">Zaif - Deprecated</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="font-medium text-blue-400">SHA256</span>
                <span className="rounded bg-blue-900/30 px-2 py-1 text-xs text-blue-400">
                  Xavfsiz - Tavsiya etiladi
                </span>
              </li>
              <li className="flex items-center justify-between">
                <span className="font-medium text-green-400">SHA512</span>
                <span className="rounded bg-green-900/30 px-2 py-1 text-xs text-green-400">
                  Eng xavfsiz - Professional
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 border-t border-zinc-700 pt-6">
          <h4 className="mb-2 font-medium text-zinc-200">Muhim eslatmalar:</h4>
          <ul className="space-y-1 text-sm text-zinc-400">
            <li>• Hash funksiyalari bir tomonlama (irreversible) hisoblanadi</li>
            <li>• Bir xil matn har doim bir xil hash beradi</li>
            <li>• Kichik o'zgarish butunlay boshqa hash yaratadi</li>
            <li>• Parollar uchun faqat SHA256 yoki SHA512 ishlating</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default HashGenerator
