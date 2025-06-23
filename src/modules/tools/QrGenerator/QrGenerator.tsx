'use client'

import { useState } from 'react'
import { Check, Copy, Download, Upload, X, QrCode, FileDown } from 'lucide-react'
import { useCopyToClipboard } from 'usehooks-ts'
import { ToolHeader } from '@/components/shared/ToolHeader'
import { ToolPanel, TextInputPanel } from '@/components/ui/tool-panel'
import { ShimmerButton } from '@/components/ui'
import { useQrGenerator, QrPreset } from '@/hooks/tools/useQrGenerator'
import { getToolColor } from '@/constants/ui-constants'

const QrGenerator = () => {
  const [copied, setCopied] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>('url')
  const [_, copy] = useCopyToClipboard()
  const toolColors = getToolColor('qr-generator')

  const {
    inputText,
    qrSize,
    errorLevel,
    qrUrl,
    isGenerating,
    inputStats,
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

  const handleCopy = async () => {
    if (!inputText) return
    try {
      await copy(inputText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
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

  const categoryLabels = {
    url: 'URL va Linklar',
    contact: "Kontakt ma'lumotlari",
    text: "Matn va Ma'lumot",
    wifi: 'WiFi ulanish',
    sms: 'SMS va Xabar',
  }

  const inputType = detectInputType(inputText)

  // Convert inputStats to proper format
  const formattedStats = inputStats.map((stat) => ({
    label: stat.label,
    value: typeof stat.value === 'string' ? 0 : stat.value,
  }))

  return (
    <div className="mx-auto mt-6 w-full max-w-7xl">
      <ToolHeader
        title="QR Code Generator"
        description="Matn, URL va ma'lumotlar uchun professional QR kod yaratish vositasi"
      />

      {/* Preset Categories */}
      <ToolPanel title="Namuna kategoriyalari" variant="simple" className="mb-6">
        <div className="flex flex-wrap gap-2">
          {Object.keys(groupedPresets).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                activeCategory === category
                  ? 'bg-gradient-to-r ' + toolColors.primary + ' text-white shadow-lg'
                  : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
              }`}
            >
              {categoryLabels[category as keyof typeof categoryLabels] || category}
            </button>
          ))}
        </div>
      </ToolPanel>

      {/* Presets for Active Category */}
      {groupedPresets[activeCategory] && (
        <ToolPanel
          title={`${categoryLabels[activeCategory as keyof typeof categoryLabels]} namunalari`}
          variant="simple"
          className="mb-6"
        >
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {groupedPresets[activeCategory].map((preset: QrPreset, index: number) => (
              <div
                key={index}
                className="flex flex-col gap-2 rounded-lg border border-zinc-700 bg-zinc-800/30 p-3 transition-all hover:bg-zinc-800/50"
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-zinc-200">{preset.label}</span>
                  <ShimmerButton
                    onClick={() => handlePresetSelect(preset)}
                    className="bg-gradient-to-r from-zinc-700 to-zinc-600 text-zinc-300 hover:from-zinc-600 hover:to-zinc-500"
                    size="sm"
                  >
                    Yuklash
                  </ShimmerButton>
                </div>
                <p className="text-xs text-zinc-400">{preset.description}</p>
                <div className="overflow-hidden rounded bg-zinc-900/50 p-2 font-mono text-xs text-zinc-500">
                  {preset.value.length > 60 ? preset.value.substring(0, 60) + '...' : preset.value}
                </div>
              </div>
            ))}
          </div>
        </ToolPanel>
      )}

      {/* QR Settings */}
      <ToolPanel title="QR kod sozlamalari" variant="simple" className="mb-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">QR o'lchami:</label>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setQrSize(size)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    qrSize === size
                      ? 'bg-gradient-to-r ' + toolColors.primary + ' text-white shadow-lg'
                      : 'bg-zinc-700 text-zinc-300 hover:bg-zinc-600'
                  }`}
                >
                  {size}x{size}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">Xato tuzatish darajasi:</label>
            <div className="space-y-2">
              {errorLevels.map((level) => (
                <label key={level.value} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    checked={errorLevel === level.value}
                    onChange={() => setErrorLevel(level.value)}
                    className="text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-sm text-zinc-300">{level.label}</span>
                  <span className="text-xs text-zinc-500">- {level.description}</span>
                </label>
              ))}
            </div>
          </div>
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

          {qrUrl && (
            <div className="flex items-center gap-2">
              <ShimmerButton
                onClick={() => downloadQr()}
                disabled={isGenerating}
                className="bg-gradient-to-r from-emerald-600 to-emerald-500 text-white hover:from-emerald-500 hover:to-emerald-400"
              >
                <Download size={16} className="mr-1" />
                {isGenerating ? 'Yuklanmoqda...' : 'QR kod yuklab olish'}
              </ShimmerButton>
            </div>
          )}
        </div>
      </ToolPanel>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <TextInputPanel
          title="Input Text/URL"
          value={inputText}
          onChange={setInputText}
          placeholder="QR kodga aylantirmoqchi bo'lgan matn, URL yoki ma'lumotni kiriting..."
          stats={formattedStats}
          minHeight="300px"
          actions={
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
              {inputText && (
                <button
                  onClick={handleCopy}
                  disabled={!inputText}
                  className="rounded-full p-2.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200 disabled:opacity-50"
                >
                  {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                </button>
              )}
            </div>
          }
        />

        {/* QR Code Display */}
        <ToolPanel title="QR Code" variant="terminal" className="min-h-[400px]">
          <div className="flex min-h-[350px] items-center justify-center p-8">
            {qrUrl ? (
              <div className="space-y-4 text-center">
                <img
                  src={qrUrl}
                  alt="Generated QR Code"
                  className="mx-auto rounded-lg bg-white p-4 shadow-xl"
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
              <div className="text-center text-zinc-500">
                <QrCode size={64} className="mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">QR kod yaratish uchun</p>
                <p className="text-sm">matn yoki URL kiriting</p>
              </div>
            )}
          </div>
        </ToolPanel>
      </div>

      {/* QR Code Information */}
      {qrUrl && (
        <ToolPanel title="QR kod ma'lumotlari" variant="simple" className="mt-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded border border-zinc-700 bg-zinc-800/30 p-4">
              <h4 className="mb-2 font-medium text-zinc-200">O'lcham</h4>
              <p className="text-2xl font-bold text-emerald-400">{qrSize}px</p>
              <p className="text-xs text-zinc-500">Kvadrat format</p>
            </div>

            <div className="rounded border border-zinc-700 bg-zinc-800/30 p-4">
              <h4 className="mb-2 font-medium text-zinc-200">Xato tuzatish</h4>
              <p className="text-2xl font-bold text-blue-400">{errorLevel}</p>
              <p className="text-xs text-zinc-500">{errorLevels.find((e) => e.value === errorLevel)?.description}</p>
            </div>

            <div className="rounded border border-zinc-700 bg-zinc-800/30 p-4">
              <h4 className="mb-2 font-medium text-zinc-200">Ma'lumot turi</h4>
              <p className="text-2xl font-bold text-purple-400 capitalize">{inputType}</p>
              <p className="text-xs text-zinc-500">Autodetect</p>
            </div>
          </div>
        </ToolPanel>
      )}

      {/* Help Section */}
      <ToolPanel title="QR Code haqida ma'lumot" variant="simple" className="mt-8">
        <div className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h4 className="mb-3 font-medium text-zinc-200">QR Code turlari:</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                  URL va web linklar
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                  Email manzillari va xabarlar
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                  Telefon raqamlari va SMS
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                  WiFi ulanish ma'lumotlari
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-cyan-500"></div>
                  vCard kontakt kartalari
                </li>
              </ul>
            </div>
            <div>
              <h4 className="mb-3 font-medium text-zinc-200">Foydalanish sohalari:</h4>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-indigo-500"></div>
                  Marketing va reklama kampaniyalari
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-pink-500"></div>
                  Event ro'yxatdan o'tish
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-yellow-500"></div>
                  Menu va narx ro'yxatlari
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-teal-500"></div>
                  App download linklari
                </li>
                <li className="flex items-center gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500"></div>
                  To'lov va kontakt ma'lumotlari
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-zinc-700 pt-4">
            <h4 className="mb-2 font-medium text-zinc-200">Xato tuzatish darajalari:</h4>
            <div className="grid gap-2 md:grid-cols-4">
              {errorLevels.map((level) => (
                <div key={level.value} className="text-center">
                  <div className="text-lg font-bold text-emerald-400">{level.value}</div>
                  <div className="text-xs text-zinc-400">{level.label}</div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm text-zinc-500">
              Yuqori xato tuzatish darajasi QR kodning zarar ko'rgan taqdirda ham o'qilishini ta'minlaydi, lekin kod
              murakkablashadi.
            </p>
          </div>
        </div>
      </ToolPanel>
    </div>
  )
}

export default QrGenerator
