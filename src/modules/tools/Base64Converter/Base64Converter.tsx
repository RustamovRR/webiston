'use client'

import { useState } from 'react'
import { Download, Upload, ArrowLeftRight, FileJson, Image, Type, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ToolHeader } from '@/components/shared/ToolHeader'
import { DualTextPanel } from '@/components/shared/DualTextPanel'
import { ShimmerButton, GradientTabs } from '@/components/ui'
import { useBase64Converter } from '@/hooks'
import { BASE64_SAMPLE_TEXTS } from '@/constants'
import { UI_PATTERNS, TOOL_COLOR_MAP } from '@/constants/ui-constants'

const Base64Converter = () => {
  const [selectedSample, setSelectedSample] = useState<string>('')

  const toolColors = TOOL_COLOR_MAP['base64-converter']

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
    acceptedFileTypes,
  } = useBase64Converter({
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

  const samples = [
    { key: 'UZBEK_GREETING', label: "O'zbek salomlashuvi", value: BASE64_SAMPLE_TEXTS.UZBEK_GREETING },
    { key: 'JSON_SAMPLE', label: 'JSON namunasi', value: BASE64_SAMPLE_TEXTS.JSON_SAMPLE },
    { key: 'URL_SAMPLE', label: 'URL namunasi', value: BASE64_SAMPLE_TEXTS.URL_SAMPLE },
    { key: 'EMAIL_SAMPLE', label: 'Email namunasi', value: BASE64_SAMPLE_TEXTS.EMAIL_SAMPLE },
  ]

  const tabOptions = [
    {
      value: 'encode',
      label: 'Kodlash',
      icon: <Type size={16} />,
    },
    {
      value: 'decode',
      label: 'Dekodlash',
      icon: <Zap size={16} />,
    },
  ]

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <ToolHeader
        title="Base64 O'giruvchi"
        description="Matn va fayllarni Base64 formatiga o'girish va aksincha dekodlash vositasi"
      />

      {/* Rejim tanlash paneli */}
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
          <Button
            onClick={handleClear}
            variant="ghost"
            size="sm"
            className="cursor-pointer text-zinc-400 hover:text-zinc-200"
          >
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
                accept={acceptedFileTypes}
                onChange={handleFileUploadWrapper}
                className="hidden"
                id="file-upload"
                disabled={isProcessing}
              />
              <Button variant="outline" size="sm" asChild disabled={isProcessing}>
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload size={16} className="mr-2" />
                  {mode === 'encode' ? (
                    <>
                      <Image size={14} className="mr-1" />
                      Fayl yuklash (Matn/Rasm)
                    </>
                  ) : (
                    <>
                      <FileJson size={14} className="mr-1" />
                      Fayl yuklash (Matn)
                    </>
                  )}
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

      {/* Asosiy panel */}
      <DualTextPanel
        sourceText={inputText}
        convertedText={result.output}
        sourcePlaceholder={
          mode === 'encode'
            ? "Kodlamoqchi bo'lgan matnni kiriting yoki fayl yuklang..."
            : "Dekodlamoqchi bo'lgan Base64 matnni kiriting..."
        }
        sourceLabel={mode === 'encode' ? 'Oddiy matn' : 'Base64 matn'}
        targetLabel={mode === 'encode' ? 'Base64 matn' : 'Oddiy matn'}
        onSourceChange={setInputText}
        onSwap={handleModeSwitch}
        onClear={handleClear}
        error={result.error}
        variant="terminal"
      />

      {/* Ma'lumot va yordam bo'limi */}
      <div className={`mt-8 ${UI_PATTERNS.CONTROL_PANEL}`}>
        <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-100">
          <Zap size={20} className={toolColors.text.replace('text-', 'text-')} />
          Base64 haqida ma'lumot
        </h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
              <div className="h-2 w-2 rounded-full bg-blue-400"></div>
              Base64 nima?
            </h4>
            <p className="text-sm leading-relaxed text-zinc-400">
              Base64 - binary ma'lumotlarni matn formatida ifodalash uchun kodlash usuli. 64 ta belgidan foydalanadi:
              A-Z, a-z, 0-9, +, /
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
              Asosiy xususiyatlari
            </h4>
            <ul className="space-y-1 text-sm text-zinc-400">
              <li>• 6-bit ga asoslangan kodlash</li>
              <li>• Platform mustaqil format</li>
              <li>• Matn protokollarda xavfsiz</li>
              <li>• Keng qo'llab-quvvatlash</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
              <div className="h-2 w-2 rounded-full bg-purple-400"></div>
              Qo'llanish sohalari
            </h4>
            <ul className="space-y-1 text-sm text-zinc-400">
              <li>• Email da rasm yuborish</li>
              <li>• Veb sahifada rasm joylash</li>
              <li>• API orqali fayl uzatish</li>
              <li>• Ma'lumotlarni xavfsiz saqlash</li>
            </ul>
          </div>
        </div>

        {/* Base64 format tushuntirishi */}
        <div className="mt-6 rounded-lg border border-zinc-700/30 bg-zinc-800/30 p-4">
          <h4 className="mb-3 flex items-center gap-2 font-semibold text-zinc-200">
            <FileJson size={16} className={toolColors.text.replace('text-', 'text-')} />
            Base64 format misoli
          </h4>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-2 text-xs text-zinc-500">Oddiy matn:</p>
              <code className="block rounded bg-zinc-900/50 p-2 font-mono text-sm text-zinc-300">Salom dunyo!</code>
            </div>
            <div>
              <p className="mb-2 text-xs text-zinc-500">Base64 kodlangan:</p>
              <code className="block rounded bg-zinc-900/50 p-2 font-mono text-sm break-all text-zinc-300">
                U2Fsb20gZHVueW8h
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Base64Converter
