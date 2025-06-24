'use client'

import { useState } from 'react'
import { Download, Upload, Hash, Zap, FileDown, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ToolHeader } from '@/components/shared/ToolHeader'
import { DualTextPanel } from '@/components/shared/DualTextPanel'
import { ShimmerButton, GradientTabs } from '@/components/ui'
import { useQrGenerator, QrSize, QrErrorLevel, QrPreset } from '@/hooks/tools/useQrGenerator'
import { UI_PATTERNS, TOOL_COLOR_MAP } from '@/constants/ui-constants'

const QrGenerator = () => {
  const [activeCategory, setActiveCategory] = useState('url')
  const toolColors = TOOL_COLOR_MAP['qr-generator']

  const {
    inputText,
    qrUrl,
    qrSize,
    errorLevel,
    isGenerating,
    inputStats,
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

  const categoryLabels = {
    url: 'URL va Linklar',
    contact: "Kontakt ma'lumotlari",
    text: "Matn va Ma'lumot",
    wifi: 'WiFi ulanish',
    sms: 'SMS va Xabar',
  }

  const inputType = detectInputType(inputText)

  const qrResultText = qrUrl
    ? `QR kod muvaffaqiyatli yaratildi!\n\nO'lcham: ${qrSize}x${qrSize} pixels\nXato tuzatish: ${errorLevel}\nTur: ${inputType}\n\nQR URL: ${qrUrl}`
    : ''

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <ToolHeader
        title="QR Kod Generator"
        description="URL, matn, kontakt ma'lumotlari va boshqalar uchun QR kodlar yaratish"
      />

      {/* Category Selection */}
      <div className={`mb-6 ${UI_PATTERNS.CONTROL_PANEL}`}>
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-zinc-300">Kategoriya tanlang:</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(categoryLabels).map(([category, label]) => (
              <Button
                key={category}
                onClick={() => setActiveCategory(category)}
                variant="outline"
                size="sm"
                className={`cursor-pointer text-xs transition-all ${
                  activeCategory === category
                    ? `${toolColors.border} ${toolColors.bg} ${toolColors.text}`
                    : 'border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                }`}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Presets for Active Category */}
      {groupedPresets[activeCategory] && (
        <div className={`mb-6 ${UI_PATTERNS.CONTROL_PANEL}`}>
          <h3 className="mb-4 text-sm font-medium text-zinc-300">
            {categoryLabels[activeCategory as keyof typeof categoryLabels]} namunalari:
          </h3>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {groupedPresets[activeCategory].map((preset: QrPreset, index: number) => (
              <div
                key={index}
                className="flex flex-col gap-2 rounded-lg border border-zinc-700 bg-zinc-800/30 p-3 transition-all hover:bg-zinc-800/50"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-zinc-200">{preset.label}</h4>
                  <Button
                    onClick={() => handlePresetSelect(preset)}
                    variant="outline"
                    size="sm"
                    className="cursor-pointer text-xs"
                  >
                    Yuklash
                  </Button>
                </div>
                <p className="text-xs text-zinc-400">{preset.description}</p>
                <div className="overflow-hidden rounded bg-zinc-900/50 p-2 font-mono text-xs text-zinc-500">
                  {preset.value.length > 60 ? preset.value.substring(0, 60) + '...' : preset.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QR Settings */}
      <div className={`mb-6 ${UI_PATTERNS.CONTROL_PANEL}`}>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-6">
            {/* QR Size */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">QR o'lchami:</label>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => (
                  <Button
                    key={size}
                    onClick={() => setQrSize(size)}
                    variant="outline"
                    size="sm"
                    className={`cursor-pointer text-xs transition-all ${
                      qrSize === size
                        ? `${toolColors.border} ${toolColors.bg} ${toolColors.text}`
                        : 'border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                    }`}
                  >
                    {size}x{size}
                  </Button>
                ))}
              </div>
            </div>

            {/* Error Level */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Xato tuzatish darajasi:</label>
              <div className="space-y-2">
                {errorLevels.map((level) => (
                  <label key={level.value} className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      name="errorLevel"
                      value={level.value}
                      checked={errorLevel === level.value}
                      onChange={(e) => setErrorLevel(e.target.value as QrErrorLevel)}
                      className="text-blue-500"
                    />
                    <span className="text-sm text-zinc-300">{level.label}</span>
                    <span className="text-xs text-zinc-500">- {level.description}</span>
                  </label>
                ))}
              </div>
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

            <div className="flex items-center gap-2">
              {inputType !== 'empty' && (
                <span
                  className={`rounded px-2 py-1 text-xs ${
                    inputType === 'url'
                      ? 'bg-blue-900/30 text-blue-400'
                      : inputType === 'email'
                        ? 'bg-green-900/30 text-green-400'
                        : inputType === 'phone'
                          ? 'bg-purple-900/30 text-purple-400'
                          : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {inputType.toUpperCase()}
                </span>
              )}
            </div>
          </div>

          {qrUrl && (
            <ShimmerButton onClick={() => downloadQr()} disabled={isGenerating} variant="default" size="sm">
              <Download size={16} className="mr-2" />
              QR kodni yuklab olish
            </ShimmerButton>
          )}
        </div>
      </div>

      {/* Main Panel */}
      <DualTextPanel
        sourceText={inputText}
        convertedText={qrResultText}
        sourcePlaceholder="QR kod yaratish uchun matn, URL yoki ma'lumot kiriting..."
        sourceLabel="QR kodi uchun matn"
        targetLabel="QR kod ma'lumoti"
        onSourceChange={setInputText}
        onClear={handleClear}
        variant="terminal"
      />

      {/* QR Code Preview */}
      {(qrUrl || isGenerating) && (
        <div className={`mt-6 ${UI_PATTERNS.CONTROL_PANEL}`}>
          <h3 className="mb-4 text-lg font-semibold text-zinc-100">QR Kod</h3>
          <div className="flex min-h-[350px] items-center justify-center p-8">
            {qrUrl ? (
              <div className="space-y-4 text-center">
                <img
                  src={qrUrl}
                  alt="Generated QR Code"
                  className="mx-auto rounded-lg border border-zinc-700 bg-white p-2"
                  style={{ width: qrSize, height: qrSize }}
                />
                <div className="space-y-1 text-sm text-zinc-400">
                  <p>
                    {qrSize}x{qrSize} pixels
                  </p>
                  <p>Error Level: {errorLevel}</p>
                  <p className="capitalize">Type: {inputType}</p>
                </div>
              </div>
            ) : (
              <div className="text-center text-zinc-400">
                <Hash size={48} className="mx-auto mb-4 text-zinc-600" />
                <p>QR kod yaratilmoqda...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* QR Stats */}
      {qrUrl && (
        <div className={`mt-6 ${UI_PATTERNS.CONTROL_PANEL}`}>
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <h4 className="mb-2 font-medium text-zinc-200">O'lcham</h4>
              <p className="text-2xl font-bold text-blue-400">
                {qrSize}×{qrSize}
              </p>
              <p className="text-xs text-zinc-500">pixels</p>
            </div>
            <div>
              <h4 className="mb-2 font-medium text-zinc-200">Ma'lumot turi</h4>
              <p className="text-2xl font-bold text-green-400 capitalize">{inputType}</p>
              <p className="text-xs text-zinc-500">Aniqlangan tur</p>
            </div>
            <div>
              <h4 className="mb-2 font-medium text-zinc-200">Xato tuzatish</h4>
              <p className="text-2xl font-bold text-blue-400">{errorLevel}</p>
              <p className="text-xs text-zinc-500">{errorLevels.find((e) => e.value === errorLevel)?.description}</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-zinc-500">
            Yuqori xato tuzatish darajasi QR kodning zarar ko'rgan taqdirda ham o'qilishini ta'minlaydi, lekin kod
            murakkablashadi.
          </p>
        </div>
      )}

      {/* Help Section */}
      <div className={`mt-8 ${UI_PATTERNS.CONTROL_PANEL}`}>
        <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-100">
          <Zap size={20} className={toolColors.text.replace('text-', 'text-')} />
          QR Kodlar haqida ma'lumot
        </h3>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h4 className="mb-3 font-medium text-zinc-200">Foydalanish sohalari:</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                Website URL va linklar ulashish
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                Kontakt ma'lumotlari (vCard)
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                WiFi parol va ulanish ma'lumotlari
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                To'lov ma'lumotlari va banking
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-cyan-500"></div>
                Event va kalendar ma'lumotlari
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 font-medium text-zinc-200">Texnik ma'lumotlar:</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li>• Maksimal sig'im: 7,089 raqam yoki 4,296 harf</li>
              <li>• Xato tuzatish: L(7%), M(15%), Q(25%), H(30%)</li>
              <li>• ISO/IEC 18004 standard asosida</li>
              <li>• Barcha smartphone va qurilmalarda qo'llab-quvvatlanadi</li>
              <li>• JPEG va PNG formatlarida yuklab olish</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 border-t border-zinc-700 pt-6">
          <h4 className="mb-2 font-medium text-zinc-200">Maslahatlar:</h4>
          <ul className="space-y-1 text-sm text-zinc-400">
            <li>• Katta o'lchamlar (512px+) chop etish uchun yaxshiroq</li>
            <li>• Yuqori xato tuzatish zarar ko'rgan kodlarni ham o'qiydi</li>
            <li>• WiFi ma'lumotlari uchun WIFI: formatidan foydalaning</li>
            <li>• vCard formatida to'liq kontakt ma'lumotlarini saqlash mumkin</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default QrGenerator
