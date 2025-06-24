'use client'

import { useState } from 'react'
import { Download, Upload, Hash, Zap, X, QrCode, Image, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ShimmerButton, GradientTabs } from '@/components/ui'
import { ToolHeader, StatsDisplay, DualTextPanel } from '@/components/shared'
import { cn } from '@/lib'
import { useQrGenerator, QrSize, QrErrorLevel, QrPreset } from '@/hooks'

const QrGenerator = () => {
  const [activeCategory, setActiveCategory] = useState('url')

  const {
    inputText,
    qrUrl,
    qrSize,
    errorLevel,
    isGenerating,
    stats,
    inputStats,
    outputStats,
    presets,
    groupedPresets,
    availableSizes,
    errorLevels,
    setInputText,
    setQrSize,
    setErrorLevel,
    handlePresetSelect,
    handleClear,
    downloadQr,
    handleFileUpload,
    detectInputType,
  } = useQrGenerator({
    onSuccess: (message) => console.log(message),
    onError: (error) => console.error(error),
  })

  const handleFileUploadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const categoryOptions = [
    {
      value: 'url',
      label: 'URL',
      icon: <Hash size={16} />,
    },
    {
      value: 'contact',
      label: 'Kontakt',
      icon: <Zap size={16} />,
    },
    {
      value: 'text',
      label: 'Matn',
      icon: <X size={16} />,
    },
    {
      value: 'wifi',
      label: 'WiFi',
      icon: <Settings size={16} />,
    },
    {
      value: 'sms',
      label: 'SMS',
      icon: <QrCode size={16} />,
    },
  ]

  const sizeOptions = availableSizes.map((size) => ({
    value: size.value.toString(),
    label: size.label,
    icon: <Image size={16} />,
  }))

  const inputType = detectInputType(inputText)
  const canDownload = !!qrUrl

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <ToolHeader
        title="QR Kod Generator"
        description="Professional QR kod yaratish vositasi. URL, matn, kontakt va WiFi ma'lumotlari uchun QR kodlar yaratish."
      />

      {/* Konfiguratsiya Panel */}
      <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
        {/* Panel Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-sm font-medium text-zinc-300">Tool Konfiguratsiya</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-zinc-500">Ready</span>
          </div>
        </div>

        {/* Panel Content */}
        <div className="p-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Category Selection */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-zinc-300">Kategoriya:</label>
              <GradientTabs
                options={categoryOptions}
                value={activeCategory}
                onChange={setActiveCategory}
                toolCategory="generators"
              />
              <div className="rounded-lg bg-zinc-800/50 p-3">
                <div className="text-xs text-zinc-400">
                  {activeCategory === 'url' && 'Web sahifalar va linklar uchun QR kodlar'}
                  {activeCategory === 'contact' && "Telefon, email va kontakt ma'lumotlari"}
                  {activeCategory === 'text' && "Oddiy matn va ma'lumotlar"}
                  {activeCategory === 'wifi' && "WiFi ulanish ma'lumotlari"}
                  {activeCategory === 'sms' && 'SMS va xabar yuborish'}
                </div>
              </div>
            </div>

            {/* QR Size */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-zinc-300">QR O'lchami:</label>
              <GradientTabs
                options={sizeOptions}
                value={qrSize.toString()}
                onChange={(value) => setQrSize(Number(value) as QrSize)}
                toolCategory="generators"
              />
              <div className="rounded-lg bg-zinc-800/50 p-3">
                <div className="text-xs text-zinc-400">Katta o'lchamlar sifatli chop etish uchun mos</div>
              </div>
            </div>
          </div>

          {/* Error Level */}
          <div className="mt-6 space-y-3">
            <label className="text-sm font-medium text-zinc-300">Xato Tuzatish Darajasi:</label>
            <div className="grid gap-2 md:grid-cols-4">
              {errorLevels.map((level) => (
                <label
                  key={level.value}
                  className={cn(
                    'flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition-colors',
                    errorLevel === level.value
                      ? 'border-green-500 bg-green-500/10 text-green-300'
                      : 'border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200',
                  )}
                >
                  <input
                    type="radio"
                    name="errorLevel"
                    value={level.value}
                    checked={errorLevel === level.value}
                    onChange={(e) => setErrorLevel(e.target.value as QrErrorLevel)}
                    className="sr-only"
                  />
                  <div className="text-sm font-medium">{level.label}</div>
                  <div className="text-xs opacity-75">{level.description}</div>
                </label>
              ))}
            </div>
          </div>

          {/* Preset Selection */}
          {groupedPresets[activeCategory] && (
            <div className="mt-6 space-y-3">
              <label className="text-sm font-medium text-zinc-300">Namuna Tanlovlari:</label>
              <div className="grid gap-2 md:grid-cols-2">
                {groupedPresets[activeCategory].map((preset: QrPreset, index: number) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-lg border border-zinc-700 bg-zinc-800/30 p-3 transition-colors hover:bg-zinc-800/50"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-zinc-200">{preset.label}</div>
                      <div className="text-xs text-zinc-400">{preset.description}</div>
                    </div>
                    <Button onClick={() => handlePresetSelect(preset)} variant="outline" size="sm" className="ml-2">
                      Yuklash
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {/* File Upload */}
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

              {/* Clear */}
              {inputText && (
                <Button onClick={handleClear} variant="outline" size="sm">
                  <X size={16} className="mr-2" />
                  Tozalash
                </Button>
              )}
            </div>

            {/* Download */}
            {canDownload && (
              <ShimmerButton onClick={() => downloadQr()} disabled={isGenerating} size="sm">
                <Download size={16} className="mr-2" />
                {isGenerating ? 'Yuklanmoqda...' : 'QR Yuklab olish'}
              </ShimmerButton>
            )}
          </div>
        </div>
      </div>

      {/* Dual Panel Layout */}
      <DualTextPanel
        sourceText={inputText}
        convertedText={
          qrUrl
            ? `QR kod muvaffaqiyatli yaratildi!\n\nO'lcham: ${qrSize}x${qrSize} pixels\nXato tuzatish: ${errorLevel}\nTur: ${inputType}\n\nQR Kodi quyida ko'rinadi.`
            : ''
        }
        sourceLabel="Tool Kirish"
        targetLabel="Tool Natija"
        onSourceChange={setInputText}
        sourcePlaceholder="QR kod uchun matn kiriting (URL, kontakt ma'lumotlari, WiFi sozlamalari va h.k.)"
        onClear={handleClear}
        showSwapButton={false}
        isProcessing={isGenerating}
        variant="terminal"
      />

      {/* QR Code Display */}
      {qrUrl && (
        <div className="mt-6 rounded-xl border border-zinc-800 bg-zinc-900/80 p-6 backdrop-blur-sm">
          <div className="mb-6 flex items-center justify-between border-b border-zinc-800 pb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <span className="text-sm font-medium text-zinc-300">QR Kod Natijasi</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-xs text-zinc-500">Generated</span>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="rounded-lg border border-zinc-700 bg-zinc-800/30 p-4">
              <img
                src={qrUrl}
                alt="Generated QR Code"
                className="mx-auto max-w-full rounded-lg"
                style={{ maxWidth: '300px', height: 'auto' }}
              />
              <div className="mt-3 text-center">
                <div className="text-xs text-zinc-500">
                  {qrSize}x{qrSize} pixels • {errorLevel} xato tuzatish • {inputType}
                </div>
                <div className="mt-2 flex justify-center gap-2 text-xs">
                  <span className="rounded bg-zinc-700 px-2 py-1 text-zinc-300">{stats.characters} belgi</span>
                  <span className="rounded bg-zinc-700 px-2 py-1 text-zinc-300">{stats.words} so'z</span>
                  <span className="rounded bg-zinc-700 px-2 py-1 text-zinc-300">{stats.lines} qator</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ma'lumot Section */}
      <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/80 p-6 backdrop-blur-sm">
        <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-100">
          <QrCode size={20} className="text-purple-400" />
          QR kodlar va ularning qo'llanilishi
        </h3>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h4 className="mb-3 font-medium text-zinc-200">QR kod turlari:</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                <strong>URL QR kodlari:</strong> Website havolalari, landing pagelar va online resurslar
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                <strong>Kontakt QR kodlari:</strong> vCard format, telefon raqami va email manzillari
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                <strong>WiFi QR kodlari:</strong> Tarmoq nomlari, parollar va xavfsizlik sozlamalari
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                <strong>SMS QR kodlari:</strong> Telefon raqami va tayyor xabar matni
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-cyan-500"></div>
                <strong>Matn QR kodlari:</strong> Har qanday matn ma'lumotlari, ma'lumotlar
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-pink-500"></div>
                <strong>Email QR kodlari:</strong> Qabul qiluvchi, mavzu va xabar matni
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-medium text-zinc-200">Professional maslahatlar:</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                Katta o'lchamlar (300x300+) chop etish uchun mos
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                Yuqori xato tuzatish darajasi (H) zarar ko'rgan kodlarni o'qiydi
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                QR kod atrofida oq chegaralar qoldiring (quiet zone)
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                URL'larda qisqa linklar (bit.ly) ishlatish tavsiya etiladi
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-cyan-500"></div>
                QR kod o'lchami va masofa optimal nisbatini saqlang
              </li>
            </ul>

            <div className="mt-4 rounded-lg bg-purple-500/10 p-3">
              <div className="text-sm text-purple-400">
                <strong>Muhim:</strong> QR kodlar 2000+ belgigacha ma'lumot saqlashi mumkin. Ko'proq ma'lumot kod
                murakkabligini oshiradi, shuning uchun qisqa linklar foydalaning.
              </div>
            </div>
          </div>
        </div>

        {/* QR Size & Error Level Info */}
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-blue-500/10 p-4">
            <div className="mb-2 font-medium text-blue-400">150x150 px</div>
            <div className="text-sm text-zinc-400">Digital, ekran va social media uchun minimal o'lcham</div>
          </div>

          <div className="rounded-lg bg-green-500/10 p-4">
            <div className="mb-2 font-medium text-green-400">200x200 px</div>
            <div className="text-sm text-zinc-400">Business card va kichik chop materiallar uchun optimal</div>
          </div>

          <div className="rounded-lg bg-orange-500/10 p-4">
            <div className="mb-2 font-medium text-orange-400">300x300 px</div>
            <div className="text-sm text-zinc-400">Poster, flyer va katta chop materiallari uchun</div>
          </div>

          <div className="rounded-lg bg-purple-500/10 p-4">
            <div className="mb-2 font-medium text-purple-400">400x400 px</div>
            <div className="text-sm text-zinc-400">Billboard va professional chop uchun yuqori sifat</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default QrGenerator
