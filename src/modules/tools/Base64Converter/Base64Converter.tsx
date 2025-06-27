'use client'

import { Download, Upload, FileText, ArrowLeftRight, ChevronDown, X, Zap } from 'lucide-react'

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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Kirish paneli */}
        <div className="flex flex-col rounded-xl border border-zinc-800/50 bg-zinc-900/80 shadow-2xl backdrop-blur-sm">
          <div className="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-800/50 px-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500/80"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500/80"></div>
              <div className="h-3 w-3 rounded-full bg-green-500/80"></div>
              <span className="ml-2 text-lg font-semibold text-zinc-100">
                {mode === 'encode' ? 'Oddiy Matn Kirish' : 'Base64 Matn Kirish'}
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
                  ? "Kodlamoqchi bo'lgan matnni kiriting yoki fayl yuklang..."
                  : "Dekodlamoqchi bo'lgan Base64 matnni kiriting..."
              }
              disabled={isProcessing}
            />
          </div>

          <div className="flex items-center justify-between border-t border-zinc-800 bg-zinc-800/30 px-4 py-3">
            <StatsDisplay stats={inputStats} />
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
                {mode === 'encode' ? 'Base64 Natija' : 'Dekodlangan Natija'}
              </span>
            </div>
            <CopyButton text={displayOutput} disabled={!result.isValid} />
          </div>

          <div className="relative flex-grow" style={{ minHeight: '500px', maxHeight: '500px' }}>
            <div className="absolute inset-0 h-full w-full overflow-y-auto">
              {result.error && !result.isValid ? (
                <div className="p-4">
                  <div className="rounded-lg border border-red-800/30 bg-red-900/20 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-400"></div>
                      <strong className="text-sm text-red-400">Konvertatsiya Xatoligi</strong>
                    </div>
                    <p className="font-mono text-sm text-red-300">{result.error}</p>
                  </div>
                </div>
              ) : displayOutput ? (
                <div className="p-4">
                  <pre className="font-mono text-sm break-all whitespace-pre-wrap text-zinc-100">{displayOutput}</pre>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center p-8 text-center">
                  <div className="text-zinc-500">
                    <FileText size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-sm">
                      {mode === 'encode'
                        ? "Kodlangan Base64 bu yerda ko'rinadi..."
                        : "Dekodlangan matn bu yerda ko'rinadi..."}
                    </p>
                    <p className="mt-2 text-xs opacity-75">Matn kiriting yoki fayl yuklang</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between border-t border-zinc-800 bg-zinc-800/30 px-4 py-3">
            <StatsDisplay stats={outputStats} />
            {displayOutput && (
              <div className="text-xs text-zinc-400">
                <span className="text-zinc-500">Hajm:</span> <span className="text-zinc-300">{fileSizeKB} KB</span>
              </div>
            )}
          </div>
        </div>
      </div>

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
