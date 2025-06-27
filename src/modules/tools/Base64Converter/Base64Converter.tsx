'use client'

import { Download, Upload, FileText, ArrowLeftRight, ChevronDown, X, Zap } from 'lucide-react'

// UI Components
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ShimmerButton, GradientTabs } from '@/components/ui'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

// Shared Components
import { ToolHeader, UniversalDualPanel } from '@/components/shared'

// Local Components
import { InputPanel, OutputPanel } from './components'

// Utils & Hooks
import { countWords } from '@/lib/utils'
import { useBase64Converter } from '@/hooks/tools/useBase64Converter'

const Base64Converter = () => {
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
    acceptedFileTypes,
    samples,
  } = useBase64Converter()

  const handleFileUploadWrapper = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const displayOutput = result.output || ''

  const inputStats = [
    { label: 'belgi', value: inputText.length },
    { label: "so'z", value: countWords(inputText) },
    { label: 'qator', value: inputText.split('\n').length },
  ]

  const outputStats = [
    { label: 'belgi', value: displayOutput.length },
    { label: "so'z", value: countWords(displayOutput) },
    { label: 'qator', value: displayOutput.split('\n').length },
  ]

  const fileSizeKB = Math.round((displayOutput.length / 1024) * 100) / 100

  const tabOptions = [
    { value: 'encode', label: 'Kodlash (Encode)', icon: <Zap size={16} /> },
    { value: 'decode', label: 'Dekodlash (Decode)', icon: <FileText size={16} /> },
  ]

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <ToolHeader
        title="Base64 Konverter va Kodlash"
        description="Matn va fayllarni Base64 formatiga o'girish va aksincha dekodlash vositasi"
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
              accept={acceptedFileTypes}
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
                  <FileText size={16} className="mr-2" />
                  Namuna Base64
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

      <UniversalDualPanel
        sourcePanel={InputPanel({
          mode,
          value: inputText,
          onChange: setInputText,
          status: isProcessing
            ? { type: 'processing', message: 'Ishlanmoqda...' }
            : inputText.length > 0
              ? { type: 'valid', message: mode === 'encode' ? 'Kodlashga tayyor' : 'Dekodlashga tayyor' }
              : { type: 'ready' },
          stats: inputStats,
        })}
        targetPanel={OutputPanel({
          mode,
          content: displayOutput,
          isValid: result.isValid,
          error: result.error && !result.isValid ? result.error : undefined,
          status: result.isValid ? { type: 'success' } : { type: 'ready' },
          stats: outputStats,
        })}
        swapConfig={{
          show: true,
          onClick: handleModeSwitch,
          disabled: !result.isValid || isProcessing,
          icon: <ArrowLeftRight size={20} className="text-zinc-300" />,
        }}
        variant="terminal"
      />

      {/* Yordam va ma'lumot bo'limi */}
      <div className="mt-8 rounded-xl border border-zinc-800/30 bg-zinc-900/60 p-6 backdrop-blur-sm">
        <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-100">
          <FileText size={20} className="text-indigo-400" />
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
            <FileText size={16} className="text-indigo-400" />
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
