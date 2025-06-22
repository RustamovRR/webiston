'use client'

import { useState, useMemo } from 'react'
import { Check, Copy, Download, Upload, X, ArrowLeftRight, Link } from 'lucide-react'
import { useCopyToClipboard } from 'usehooks-ts'
import { NumberTicker } from '@/components/ui/number-ticker'
import { countWords } from '@/lib/utils'

type Mode = 'encode' | 'decode'

const UrlEncoder = () => {
  const [mode, setMode] = useState<Mode>('encode')
  const [inputText, setInputText] = useState('')
  const [copied, setCopied] = useState(false)
  const [_, copy] = useCopyToClipboard()

  const result = useMemo(() => {
    if (!inputText.trim()) return { output: '', error: null, isValid: true }

    try {
      if (mode === 'encode') {
        const encoded = encodeURIComponent(inputText)
        return { output: encoded, error: null, isValid: true }
      } else {
        const decoded = decodeURIComponent(inputText)
        return { output: decoded, error: null, isValid: true }
      }
    } catch (error) {
      return {
        output: '',
        error: mode === 'encode' ? 'Encoding xatosi' : "Noto'g'ri URL kodlash formati",
        isValid: false,
      }
    }
  }, [inputText, mode])

  // URL validity check for decoded results
  const urlInfo = useMemo(() => {
    if (mode === 'decode' && result.output && result.isValid) {
      try {
        const url = new URL(result.output.startsWith('http') ? result.output : `https://${result.output}`)
        return {
          protocol: url.protocol,
          hostname: url.hostname,
          pathname: url.pathname,
          search: url.search,
          hash: url.hash,
          isValidUrl: true,
        }
      } catch {
        return { isValidUrl: false }
      }
    }
    return null
  }, [result.output, mode, result.isValid])

  const handleCopy = async () => {
    if (!result.output) return
    try {
      await copy(result.output)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  const handleDownload = () => {
    if (!result.output) return
    const blob = new Blob([result.output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = mode === 'encode' ? 'encoded-url.txt' : 'decoded-url.txt'
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

  const handleSwitch = () => {
    setMode(mode === 'encode' ? 'decode' : 'encode')
    if (result.output && !result.error) {
      setInputText(result.output)
    }
  }

  const handleClear = () => {
    setInputText('')
  }

  const inputStats = {
    characters: inputText.length,
    words: countWords(inputText),
    lines: inputText.split('\n').length,
  }

  const outputStats = {
    characters: result.output.length,
    words: countWords(result.output),
    lines: result.output.split('\n').length,
  }

  // Common URL encoding examples
  const examples = [
    { original: 'Hello World!', encoded: 'Hello%20World%21' },
    { original: 'user@example.com', encoded: 'user%40example.com' },
    { original: 'price=$100&tax=5%', encoded: 'price%3D%24100%26tax%3D5%25' },
    { original: 'search?q=react+hooks', encoded: 'search%3Fq%3Dreact%2Bhooks' },
  ]

  return (
    <div className="mx-auto mt-6 w-full max-w-7xl">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold text-zinc-100">URL Encoder/Decoder</h1>
        <p className="text-lg text-zinc-400">
          URL manzillarini xavfsiz formatga kodlash va dekodlash uchun professional vosita
        </p>
      </div>

      {/* Mode Switch */}
      <div className="mb-6 flex items-center justify-center gap-4">
        <div className="flex rounded-lg bg-zinc-900/50 p-1">
          <button
            onClick={() => setMode('encode')}
            className={`rounded px-4 py-2 text-sm font-medium transition-colors ${
              mode === 'encode' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Encode (Kodlash)
          </button>
          <button
            onClick={() => setMode('decode')}
            className={`rounded px-4 py-2 text-sm font-medium transition-colors ${
              mode === 'decode' ? 'bg-blue-600 text-white' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Decode (Dekodlash)
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-lg bg-zinc-900/50 p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input type="file" accept=".txt,.json" onChange={handleFileUpload} className="hidden" id="file-upload" />
            <label
              htmlFor="file-upload"
              className="cursor-pointer rounded bg-zinc-700 px-3 py-1 text-sm text-zinc-200 hover:bg-zinc-600"
            >
              <Upload size={16} className="mr-1 inline" />
              Upload File
            </label>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleSwitch}
            className="flex items-center gap-2 rounded bg-zinc-700 px-3 py-1 text-sm text-zinc-200 hover:bg-zinc-600"
          >
            <ArrowLeftRight size={16} />
            Switch Mode
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Input Section */}
        <div className="flex-1">
          <div className="rounded-xl bg-zinc-900/80 shadow-inner">
            <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-4">
              <span className="text-lg font-semibold text-zinc-100">
                {mode === 'encode' ? 'Plain URL/Text' : 'Encoded URL/Text'}
              </span>
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

            <div className="relative" style={{ height: '400px' }}>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="absolute inset-0 h-full w-full resize-none bg-transparent p-4 font-mono text-sm text-zinc-50 placeholder:text-zinc-500 focus:outline-none"
                placeholder={
                  mode === 'encode'
                    ? 'https://example.com/search?q=hello world&filter=active'
                    : 'https%3A//example.com/search%3Fq%3Dhello%20world%26filter%3Dactive'
                }
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
                  <NumberTicker value={inputStats.lines} /> lines
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Output Section */}
        <div className="flex-1">
          <div className="rounded-xl bg-zinc-900/80 shadow-inner">
            <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-4">
              <span className="text-lg font-semibold text-zinc-100">
                {mode === 'encode' ? 'Encoded Result' : 'Decoded Result'}
              </span>
              <div className="flex gap-2">
                {urlInfo?.isValidUrl && (
                  <div className="flex items-center gap-1 text-green-500">
                    <Link size={16} />
                    <span className="text-xs">Valid URL</span>
                  </div>
                )}
                <button
                  onClick={handleDownload}
                  disabled={!result.output}
                  className="rounded-full p-2.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Download"
                >
                  <Download size={18} />
                </button>
                <button
                  onClick={handleCopy}
                  disabled={!result.output}
                  className="rounded-full p-2.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Copy"
                >
                  {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                </button>
              </div>
            </div>

            <div className="relative" style={{ height: '400px' }}>
              <div className="absolute inset-0 h-full w-full overflow-y-auto p-4">
                {result.error ? (
                  <div className="text-red-400">
                    <div className="mb-2 font-semibold">Xatolik:</div>
                    <div className="text-sm">{result.error}</div>
                  </div>
                ) : (
                  <div>
                    <pre className="font-mono text-sm break-all whitespace-pre-wrap text-zinc-50">{result.output}</pre>

                    {/* URL Info Display */}
                    {urlInfo?.isValidUrl && (
                      <div className="mt-4 rounded border border-zinc-700 bg-zinc-800/50 p-3">
                        <div className="mb-2 text-xs font-semibold text-zinc-300">URL Tuzilishi:</div>
                        <div className="space-y-1 text-xs text-zinc-400">
                          <div>
                            <span className="text-zinc-300">Protocol:</span> {urlInfo.protocol}
                          </div>
                          <div>
                            <span className="text-zinc-300">Hostname:</span> {urlInfo.hostname}
                          </div>
                          {urlInfo.pathname && (
                            <div>
                              <span className="text-zinc-300">Path:</span> {urlInfo.pathname}
                            </div>
                          )}
                          {urlInfo.search && (
                            <div>
                              <span className="text-zinc-300">Query:</span> {urlInfo.search}
                            </div>
                          )}
                          {urlInfo.hash && (
                            <div>
                              <span className="text-zinc-300">Hash:</span> {urlInfo.hash}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between border-t border-zinc-800 px-4 py-2 text-sm text-zinc-500">
              <div className="flex gap-4">
                <span>
                  <NumberTicker value={outputStats.characters} /> characters
                </span>
                <span>
                  <NumberTicker value={outputStats.words} /> words
                </span>
                <span>
                  <NumberTicker value={outputStats.lines} /> lines
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Examples Section */}
      <div className="mt-8 rounded-lg bg-zinc-900/50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-zinc-100">Misollar</h3>
        <div className="grid gap-3 md:grid-cols-2">
          {examples.map((example, index) => (
            <div key={index} className="rounded border border-zinc-700 bg-zinc-800/30 p-3">
              <div className="mb-1 text-xs text-zinc-400">Original:</div>
              <div className="mb-2 font-mono text-sm text-zinc-200">{example.original}</div>
              <div className="mb-1 text-xs text-zinc-400">Encoded:</div>
              <div className="font-mono text-sm text-zinc-300">{example.encoded}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-6 rounded-lg bg-zinc-900/50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-zinc-100">URL Encoding haqida</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="mb-2 font-medium text-zinc-200">Qachon kerak?</h4>
            <ul className="space-y-1 text-sm text-zinc-400">
              <li>• URL'da maxsus belgilar ishlatganda</li>
              <li>• Query parametrlarida bo'shliq, &, ? ishlatganda</li>
              <li>• Form data yuborishda</li>
              <li>• API requestlarida</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 font-medium text-zinc-200">Kodlanadigan belgilar:</h4>
            <ul className="space-y-1 text-sm text-zinc-400">
              <li>• Bo'shliq → %20</li>
              <li>• @ → %40</li>
              <li>• & → %26</li>
              <li>• ? → %3F</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UrlEncoder
