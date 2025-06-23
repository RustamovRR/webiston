'use client'

import { useState, useEffect } from 'react'
import { Check, Copy, Download, Upload, X, Hash, FileDown } from 'lucide-react'
import { useCopyToClipboard } from 'usehooks-ts'
import { ToolHeader } from '@/components/shared/ToolHeader'
import { ToolPanel, TextInputPanel } from '@/components/ui/tool-panel'
import { ShimmerButton } from '@/components/ui'
import { useHashGenerator, HashAlgorithm } from '@/hooks/tools/useHashGenerator'
import { getToolColor } from '@/constants/ui-constants'

const HashGenerator = () => {
  const [copied, setCopied] = useState('')
  const [_, copy] = useCopyToClipboard()
  const toolColors = getToolColor('hash-generator')

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

  // Auto-generate hashes when input or algorithms change
  useEffect(() => {
    generateAllHashes()
  }, [generateAllHashes])

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

  // Convert inputStats to the required format
  const formattedStats = [
    { label: 'Characters', value: inputStats.characters },
    { label: 'Words', value: inputStats.words },
    { label: 'Lines', value: inputStats.lines },
    { label: 'Bytes', value: inputStats.bytes },
  ]

  return (
    <div className="mx-auto mt-6 w-full max-w-7xl">
      <ToolHeader
        title="Hash Generator"
        description="MD5, SHA256, SHA512 va boshqa hash algoritmlar bilan ma'lumotlarni hash qilish"
      />

      {/* Algorithm Selection */}
      <ToolPanel title="Hash Algoritmlari" variant="simple" className="mb-6">
        <div className="flex flex-wrap gap-2">
          {availableAlgorithms.map((algorithm) => {
            const info = getAlgorithmInfo(algorithm)
            const isActive = selectedAlgorithms.includes(algorithm)
            return (
              <button
                key={algorithm}
                onClick={() => toggleAlgorithm(algorithm)}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r ' + toolColors.primary + ' text-white shadow-lg'
                    : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
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
              </button>
            )
          })}
        </div>
      </ToolPanel>

      {/* Sample Data */}
      <ToolPanel title="Namuna ma'lumotlar" variant="simple" className="mb-6">
        <div className="flex flex-wrap gap-2">
          {presetTexts.map((preset, index) => (
            <ShimmerButton
              key={index}
              onClick={() => setInputText(preset.value)}
              className="bg-gradient-to-r from-zinc-700 to-zinc-600 text-zinc-300 hover:from-zinc-600 hover:to-zinc-500"
            >
              {preset.label}
            </ShimmerButton>
          ))}
        </div>
      </ToolPanel>

      {/* Controls */}
      <ToolPanel title="Fayl yuklash va yuklab olish" variant="simple" className="mb-6">
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
              <label
                htmlFor="file-upload"
                className="flex cursor-pointer items-center gap-2 rounded bg-zinc-700 px-3 py-1.5 text-sm text-zinc-200 transition-colors hover:bg-zinc-600"
              >
                <Upload size={16} />
                Fayl yuklash
              </label>
            </div>

            {inputText && (
              <ShimmerButton
                onClick={handleClear}
                className="bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400"
              >
                <X size={16} className="mr-1" />
                Tozalash
              </ShimmerButton>
            )}
          </div>

          {hashResults.length > 0 && (
            <div className="flex items-center gap-2">
              <ShimmerButton
                onClick={downloadHashes}
                className="bg-gradient-to-r from-zinc-700 to-zinc-600 text-zinc-200 hover:from-zinc-600 hover:to-zinc-500"
              >
                <Download size={16} className="mr-1" />
                TXT yuklab olish
              </ShimmerButton>

              <ShimmerButton
                onClick={downloadAsJson}
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400"
              >
                <FileDown size={16} className="mr-1" />
                JSON yuklab olish
              </ShimmerButton>
            </div>
          )}
        </div>
      </ToolPanel>

      {/* Input Section */}
      <TextInputPanel
        title="Input Text"
        value={inputText}
        onChange={setInputText}
        placeholder="Hash qilmoqchi bo'lgan matnni kiriting..."
        stats={formattedStats}
        minHeight="200px"
        actions={
          inputText ? (
            <button
              onClick={handleClear}
              className="rounded-full p-2.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
              aria-label="Clear"
            >
              <X size={18} />
            </button>
          ) : null
        }
      />

      {/* Hash Results */}
      {hashResults.length > 0 && (
        <div className="mt-6 space-y-4">
          <h3 className="text-lg font-semibold text-zinc-100">Hash Natijalari</h3>
          {hashResults.map((result) => {
            const info = getAlgorithmInfo(result.algorithm)

            return (
              <ToolPanel
                key={result.algorithm}
                title={`${result.algorithm} Hash (${result.length} chars)`}
                variant="terminal"
                className="mb-4"
                actions={
                  <div className="flex items-center gap-3">
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
                }
              >
                <div className="rounded bg-zinc-800/50 p-3 font-mono text-sm break-all whitespace-pre-wrap text-zinc-100">
                  {result.hash}
                </div>
              </ToolPanel>
            )
          })}
        </div>
      )}

      {/* Hash Comparison */}
      {hashResults.length > 1 && (
        <ToolPanel title="Hash Taqqoslash" variant="simple" className="mt-8">
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
        </ToolPanel>
      )}

      {/* Help Section */}
      <ToolPanel title="Hash Algoritmlari haqida" variant="simple" className="mt-8">
        <div className="space-y-6">
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

          <div className="border-t border-zinc-700 pt-4">
            <h4 className="mb-2 font-medium text-zinc-200">Muhim eslatmalar:</h4>
            <ul className="space-y-1 text-sm text-zinc-400">
              <li>• Hash funksiyalari bir tomonlama (irreversible) hisoblanadi</li>
              <li>• Bir xil matn har doim bir xil hash beradi</li>
              <li>• Kichik o'zgarish butunlay boshqa hash yaratadi</li>
              <li>• Parollar uchun faqat SHA256 yoki SHA512 ishlating</li>
            </ul>
          </div>
        </div>
      </ToolPanel>
    </div>
  )
}

export default HashGenerator
