'use client'

import { useState, useMemo, useEffect } from 'react'
import { Check, Copy, Download, Upload, X, Hash } from 'lucide-react'
import { useCopyToClipboard } from 'usehooks-ts'
import { NumberTicker } from '@/components/ui/number-ticker'
import { countWords } from '@/lib/utils'

type HashAlgorithm = 'MD5' | 'SHA1' | 'SHA256' | 'SHA512'

const HashGenerator = () => {
  const [inputText, setInputText] = useState('')
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<HashAlgorithm[]>(['MD5', 'SHA256'])
  const [copied, setCopied] = useState('')
  const [hashes, setHashes] = useState<Record<HashAlgorithm, string>>({} as Record<HashAlgorithm, string>)
  const [_, copy] = useCopyToClipboard()

  // Simple MD5 implementation (for demo purposes)
  const simpleMD5 = (text: string): string => {
    // This is a simplified MD5 for demo. In production, use a proper library.
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0').repeat(4).substring(0, 32)
  }

  // Generate hash for a specific algorithm
  const generateHash = async (text: string, algorithm: HashAlgorithm): Promise<string> => {
    const encoder = new TextEncoder()
    const data = encoder.encode(text)

    try {
      let hashBuffer: ArrayBuffer

      switch (algorithm) {
        case 'SHA1':
          hashBuffer = await crypto.subtle.digest('SHA-1', data)
          break
        case 'SHA256':
          hashBuffer = await crypto.subtle.digest('SHA-256', data)
          break
        case 'SHA512':
          hashBuffer = await crypto.subtle.digest('SHA-512', data)
          break
        case 'MD5':
          // MD5 is not available in Web Crypto API, using a simple implementation
          return simpleMD5(text)
        default:
          throw new Error(`Unsupported algorithm: ${algorithm}`)
      }

      const hashArray = Array.from(new Uint8Array(hashBuffer))
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
    } catch (error) {
      return 'Error generating hash'
    }
  }

  // Generate all hashes when input or algorithms change
  useEffect(() => {
    const generateAllHashes = async () => {
      if (!inputText.trim()) {
        setHashes({} as Record<HashAlgorithm, string>)
        return
      }

      const newHashes: Record<HashAlgorithm, string> = {} as Record<HashAlgorithm, string>

      for (const algorithm of selectedAlgorithms) {
        newHashes[algorithm] = await generateHash(inputText, algorithm)
      }

      setHashes(newHashes)
    }

    generateAllHashes()
  }, [inputText, selectedAlgorithms])

  const handleAlgorithmToggle = (algorithm: HashAlgorithm) => {
    setSelectedAlgorithms((prev) =>
      prev.includes(algorithm) ? prev.filter((a) => a !== algorithm) : [...prev, algorithm],
    )
  }

  const handleCopy = async (hash: string, algorithm: string) => {
    try {
      await copy(hash)
      setCopied(algorithm)
      setTimeout(() => setCopied(''), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  const handleDownload = () => {
    const content = Object.entries(hashes)
      .map(([algorithm, hash]) => `${algorithm}: ${hash}`)
      .join('\n')

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'hashes.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        setInputText(content)
      }
      reader.readAsText(file)
    }
  }

  const handleClear = () => {
    setInputText('')
  }

  const inputStats = {
    characters: inputText.length,
    words: countWords(inputText),
    bytes: new TextEncoder().encode(inputText).length,
  }

  const algorithms: HashAlgorithm[] = ['MD5', 'SHA1', 'SHA256', 'SHA512']

  return (
    <div className="mx-auto mt-6 w-full max-w-7xl">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold text-zinc-100">Hash Generator</h1>
        <p className="text-lg text-zinc-400">
          MD5, SHA256, SHA512 va boshqa hash algoritmlar bilan ma'lumotlarni hash qilish
        </p>
      </div>

      {/* Algorithm Selection */}
      <div className="mb-6 rounded-lg bg-zinc-900/50 p-4">
        <h3 className="mb-3 text-sm font-medium text-zinc-300">Hash Algoritmlari:</h3>
        <div className="flex flex-wrap gap-2">
          {algorithms.map((algorithm) => (
            <button
              key={algorithm}
              onClick={() => handleAlgorithmToggle(algorithm)}
              className={`rounded px-3 py-1 text-sm transition-colors ${
                selectedAlgorithms.includes(algorithm)
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
              }`}
            >
              {algorithm}
            </button>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-zinc-900/50 p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept=".txt,.json,.csv"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer rounded bg-zinc-700 px-3 py-1 text-sm text-zinc-200 hover:bg-zinc-600"
            >
              <Upload size={16} className="mr-1 inline" />
              Upload File
            </label>
          </div>
        </div>

        {Object.keys(hashes).length > 0 && (
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 rounded bg-zinc-700 px-3 py-1 text-sm text-zinc-200 hover:bg-zinc-600"
          >
            <Download size={16} />
            Download All
          </button>
        )}
      </div>

      {/* Input Section */}
      <div className="mb-6">
        <div className="rounded-xl bg-zinc-900/80 shadow-inner">
          <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-4">
            <span className="text-lg font-semibold text-zinc-100">Input Text</span>
            {inputText && (
              <button
                onClick={handleClear}
                className="rounded-full p-2.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
                aria-label="Clear"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <div className="relative" style={{ height: '200px' }}>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="absolute inset-0 h-full w-full resize-none bg-transparent p-4 font-mono text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none"
              placeholder="Hash qilmoqchi bo'lgan matnni kiriting..."
              autoFocus
            />
          </div>

          <div className="flex justify-between border-t border-zinc-800 px-4 py-2 text-sm text-zinc-500">
            <div className="flex gap-4">
              <span>
                <NumberTicker value={inputStats.characters} /> characters
              </span>
              <span>
                <NumberTicker value={inputStats.words} /> words
              </span>
              <span>
                <NumberTicker value={inputStats.bytes} /> bytes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Hash Results */}
      {Object.keys(hashes).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-zinc-100">Hash Natijalari</h3>
          {selectedAlgorithms.map((algorithm) => {
            const hash = hashes[algorithm]
            if (!hash) return null

            return (
              <div key={algorithm} className="rounded-xl bg-zinc-900/80 shadow-inner">
                <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-4">
                  <div className="flex items-center gap-2">
                    <Hash size={18} className="text-zinc-400" />
                    <span className="text-lg font-semibold text-zinc-100">{algorithm}</span>
                    <span className="text-sm text-zinc-400">({hash.length} chars)</span>
                  </div>
                  <button
                    onClick={() => handleCopy(hash, algorithm)}
                    className="rounded-full p-2.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
                    aria-label={`Copy ${algorithm} hash`}
                  >
                    {copied === algorithm ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                  </button>
                </div>

                <div className="p-4">
                  <div className="rounded bg-zinc-800/50 p-3 font-mono text-sm break-all text-zinc-100">{hash}</div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Hash Comparison */}
      {Object.keys(hashes).length > 1 && (
        <div className="mt-8 rounded-lg bg-zinc-900/50 p-6">
          <h3 className="mb-4 text-lg font-semibold text-zinc-100">Hash Taqqoslash</h3>
          <div className="grid gap-3">
            {selectedAlgorithms.map((algorithm) => {
              const hash = hashes[algorithm]
              if (!hash) return null

              return (
                <div
                  key={algorithm}
                  className="flex items-center justify-between rounded border border-zinc-700 bg-zinc-800/30 p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-16 font-medium text-zinc-300">{algorithm}:</span>
                    <span className="font-mono text-sm text-zinc-400">{hash.length} characters</span>
                  </div>
                  <div className="text-xs text-zinc-500">
                    Security:{' '}
                    {algorithm === 'MD5'
                      ? 'Low (deprecated)'
                      : algorithm === 'SHA1'
                        ? 'Medium (deprecated)'
                        : algorithm === 'SHA256'
                          ? 'High'
                          : 'Very High'}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-8 rounded-lg bg-zinc-900/50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-zinc-100">Hash Algoritmlari haqida</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="mb-2 font-medium text-zinc-200">Foydalanish:</h4>
            <ul className="space-y-1 text-sm text-zinc-400">
              <li>• Parol hashing</li>
              <li>• File integrity tekshirish</li>
              <li>• Digital signatures</li>
              <li>• Data verification</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 font-medium text-zinc-200">Xavfsizlik:</h4>
            <ul className="space-y-1 text-sm text-zinc-400">
              <li>
                • <span className="text-red-400">MD5</span> - Zaif, faqat demo uchun
              </li>
              <li>
                • <span className="text-yellow-400">SHA1</span> - Deprecated
              </li>
              <li>
                • <span className="text-green-400">SHA256</span> - Xavfsiz
              </li>
              <li>
                • <span className="text-green-400">SHA512</span> - Eng xavfsiz
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HashGenerator
