'use client'

import { useState } from 'react'
import { Check, Copy, Download, Upload, X, ArrowLeftRight, Link, Globe, ExternalLink } from 'lucide-react'
import { useCopyToClipboard } from 'usehooks-ts'
import { Button } from '@/components/ui/button'
import { ToolHeader } from '@/components/shared/ToolHeader'
import { ShimmerButton, GradientTabs, TextInputPanel, OutputPanel } from '@/components/ui'
import { useUrlEncoder } from '@/hooks'
import { URL_SAMPLE_TEXTS, ENCODING_EXAMPLES } from '@/constants'
import { UI_PATTERNS, TOOL_COLOR_MAP } from '@/constants/ui-constants'

const UrlEncoder = () => {
  const [copied, setCopied] = useState(false)
  const [selectedSample, setSelectedSample] = useState<string>('')
  const [_, copy] = useCopyToClipboard()

  const toolColors = TOOL_COLOR_MAP['url-encoder']

  const {
    inputText,
    mode,
    result,
    isProcessing,
    setInputText,
    setMode,
    handleModeSwitch,
    handleClear,
    handleFileUpload,
    downloadResult,
    loadSampleText,
    canDownload,
    inputStats,
    outputStats,
  } = useUrlEncoder({
    onSuccess: (message) => {
      console.log('Success:', message)
    },
    onError: (error) => {
      console.error('Error:', error)
    },
  })

  const handleFileUploadWrapper = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleSampleLoad = (sample: string) => {
    loadSampleText(sample)
    setSelectedSample(sample)
  }

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

  const samples = [
    { key: 'SIMPLE_URL', label: 'Oddiy URL', value: URL_SAMPLE_TEXTS.SIMPLE_URL },
    { key: 'COMPLEX_URL', label: 'Murakkab URL', value: URL_SAMPLE_TEXTS.COMPLEX_URL },
    { key: 'QUERY_STRING', label: "Qidiruv so'rovi", value: URL_SAMPLE_TEXTS.QUERY_STRING },
    { key: 'EMAIL_QUERY', label: 'Email havolasi', value: URL_SAMPLE_TEXTS.EMAIL_QUERY },
    { key: 'SOCIAL_SHARE', label: 'Ijtimoiy tarmoq', value: URL_SAMPLE_TEXTS.SOCIAL_SHARE },
  ]

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

  const tabOptions = [
    {
      value: 'encode',
      label: 'Kodlash',
      icon: <Link size={16} />,
    },
    {
      value: 'decode',
      label: 'Dekodlash',
      icon: <Globe size={16} />,
    },
  ]

  // URL info component
  const urlInfoContent = result.urlInfo?.isValidUrl ? (
    <div className="mt-4 rounded-lg border border-zinc-700 bg-zinc-800/50 p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-zinc-300">
        <Link size={16} className={toolColors.text.replace('text-', 'text-')} />
        URL Tuzilishi:
      </div>
      <div className="space-y-2 text-sm text-zinc-400">
        <div className="flex items-center gap-2">
          <span className="min-w-[80px] font-medium text-zinc-300">Protocol:</span>
          <code className="rounded bg-zinc-900/50 px-2 py-1 text-zinc-200">{result.urlInfo.protocol}</code>
        </div>
        <div className="flex items-center gap-2">
          <span className="min-w-[80px] font-medium text-zinc-300">Hostname:</span>
          <code className="rounded bg-zinc-900/50 px-2 py-1 text-zinc-200">{result.urlInfo.hostname}</code>
        </div>
        {result.urlInfo.pathname && (
          <div className="flex items-center gap-2">
            <span className="min-w-[80px] font-medium text-zinc-300">Path:</span>
            <code className="rounded bg-zinc-900/50 px-2 py-1 text-zinc-200">{result.urlInfo.pathname}</code>
          </div>
        )}
        {result.urlInfo.search && (
          <div className="flex items-center gap-2">
            <span className="min-w-[80px] font-medium text-zinc-300">Query:</span>
            <code className="rounded bg-zinc-900/50 px-2 py-1 text-zinc-200">{result.urlInfo.search}</code>
          </div>
        )}
        {result.urlInfo.hash && (
          <div className="flex items-center gap-2">
            <span className="min-w-[80px] font-medium text-zinc-300">Hash:</span>
            <code className="rounded bg-zinc-900/50 px-2 py-1 text-zinc-200">{result.urlInfo.hash}</code>
          </div>
        )}
      </div>
    </div>
  ) : undefined

  const outputActions = (
    <>
      {result.urlInfo?.isValidUrl && (
        <div className="flex items-center gap-1 text-green-500">
          <ExternalLink size={16} />
          <span className="text-xs">To'g'ri URL</span>
        </div>
      )}
      <button
        onClick={handleCopy}
        disabled={!result.output}
        className="cursor-pointer rounded-full p-2.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
        aria-label="Nusxalash"
      >
        {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
      </button>
    </>
  )

  const inputActions = inputText ? (
    <button
      onClick={handleClear}
      className="cursor-pointer rounded-full p-2.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
      aria-label="Tozalash"
    >
      <X size={18} />
    </button>
  ) : undefined

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <ToolHeader
        title="URL Encoder/Decoder"
        description="URL manzillarini xavfsiz formatga kodlash va dekodlash uchun professional vosita"
      />

      {/* Rejim tanlash va sample data paneli */}
      <div className={`mb-6 ${UI_PATTERNS.CONTROL_PANEL}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Gradient Tabs */}
            <GradientTabs
              options={tabOptions}
              value={mode}
              onChange={(value) => setMode(value as 'encode' | 'decode')}
              toolCategory="converters"
            />

            {/* Sample data buttons */}
            <div className="flex flex-wrap gap-2">
              {samples.map((sample) => (
                <Button
                  key={sample.key}
                  onClick={() => handleSampleLoad(sample.value)}
                  variant="outline"
                  size="sm"
                  className={`cursor-pointer text-xs transition-all ${
                    selectedSample === sample.value
                      ? `${toolColors.border} ${toolColors.bg} ${toolColors.text}`
                      : 'border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                  }`}
                >
                  {sample.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Tozalash tugmasi */}
          <Button onClick={handleClear} variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-200">
            Tozalash
          </Button>
        </div>
      </div>

      {/* Boshqaruv tugmalari */}
      <div className={`mb-6 ${UI_PATTERNS.CONTROL_PANEL}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Fayl yuklash */}
            <div className="flex items-center gap-2">
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
            </div>

            {/* Mode switch button */}
            <ShimmerButton onClick={handleModeSwitch} variant="outline" size="sm" disabled={isProcessing}>
              <ArrowLeftRight size={16} className="mr-2" />
              Rejimni almashtirish
            </ShimmerButton>
          </div>

          {/* Yuklab olish */}
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Kirish paneli */}
        <TextInputPanel
          title={mode === 'encode' ? 'Oddiy URL/Matn' : 'Kodlangan URL/Matn'}
          value={inputText}
          onChange={setInputText}
          placeholder={
            mode === 'encode'
              ? 'https://example.com/search?q=hello world&filter=active'
              : 'https%3A//example.com/search%3Fq%3Dhello%20world%26filter%3Dactive'
          }
          autoFocus
          stats={inputStatsArray}
          actions={inputActions}
          variant="terminal"
        />

        {/* Chiqish paneli */}
        <OutputPanel
          title={mode === 'encode' ? 'Kodlangan natija' : 'Dekodlangan natija'}
          content={result.output}
          error={result.error || undefined}
          emptyStateIcon={<Link size={48} />}
          emptyStateMessage="Kodlangan/dekodlangan natija bu yerda ko'rinadi..."
          additionalContent={urlInfoContent}
          stats={outputStatsArray}
          actions={outputActions}
          variant="terminal"
        />
      </div>

      {/* Misollar bo'limi */}
      <div className={`mt-8 ${UI_PATTERNS.CONTROL_PANEL}`}>
        <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-100">
          <Link size={20} className={toolColors.text.replace('text-', 'text-')} />
          URL Encoding misollari
        </h3>
        <div className="grid gap-4 md:grid-cols-2">
          {ENCODING_EXAMPLES.map((example, index) => (
            <div key={index} className="rounded-lg border border-zinc-700 bg-zinc-800/30 p-4">
              <div className="mb-3 text-xs font-medium text-zinc-400">{example.description}</div>
              <div className="space-y-3">
                <div>
                  <div className="mb-1 text-xs text-zinc-500">Asl holati:</div>
                  <code className="block rounded bg-zinc-900/50 p-2 font-mono text-sm break-all text-zinc-200">
                    {example.original}
                  </code>
                </div>
                <div>
                  <div className="mb-1 text-xs text-zinc-500">Kodlangan:</div>
                  <code className="block rounded bg-zinc-900/50 p-2 font-mono text-sm break-all text-zinc-300">
                    {example.encoded}
                  </code>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ma'lumot va yordam bo'limi */}
      <div className={`mt-8 ${UI_PATTERNS.CONTROL_PANEL}`}>
        <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-100">
          <Globe size={20} className={toolColors.text.replace('text-', 'text-')} />
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
                • Bo'shliq → <code className={toolColors.text.replace('text-', 'text-')}>%20</code>
              </li>
              <li>
                • @ → <code className={toolColors.text.replace('text-', 'text-')}>%40</code>
              </li>
              <li>
                • & → <code className={toolColors.text.replace('text-', 'text-')}>%26</code>
              </li>
              <li>
                • ? → <code className={toolColors.text.replace('text-', 'text-')}>%3F</code>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UrlEncoder
