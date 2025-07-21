import React from 'react'
import { useTranslations } from 'next-intl'
import { TerminalInput, type TerminalInputAction } from '@/components/shared/TerminalInput'
import type { ColorFormats } from '@/hooks/tools/useColorConverter'

interface ColorInputPanelProps {
  inputColor: string
  setInputColor: (color: string) => void
  colorFormats: ColorFormats | null
  getColorName: (color: string) => string
}

const ColorInputPanel: React.FC<ColorInputPanelProps> = ({ inputColor, setInputColor, colorFormats, getColorName }) => {
  const t = useTranslations('ColorConverterPage.ColorInput')

  const presetColors = [
    { color: '#3b82f6', name: "Ko'k" },
    { color: '#ef4444', name: 'Qizil' },
    { color: '#10b981', name: 'Yashil' },
    { color: '#f59e0b', name: 'Sariq' },
    { color: '#8b5cf6', name: 'Binafsha' },
    { color: '#ec4899', name: 'Pushti' },
    { color: '#06b6d4', name: 'Turkuaz' },
    { color: '#84cc16', name: 'Yashil-sariq' },
    { color: '#f97316', name: "To'q sariq" },
    { color: '#6366f1', name: 'Indigo' },
    { color: '#14b8a6', name: "Dengiz ko'ki" },
    { color: '#f43f5e', name: 'Qizil-pushti' },
  ]

  const actions: TerminalInputAction[] = []

  const stats = [
    { label: t('length') || 'Uzunlik', value: inputColor.length },
    { label: t('valid') || 'Yaroqli', value: colorFormats?.isValid ? 1 : 0 },
  ]

  const statusText = colorFormats?.isValid
    ? t('validFormat') || "To'g'ri format"
    : t('invalidFormat') || "Noto'g'ri format"

  const statusComponent = colorFormats?.isValid ? (
    <span className="flex items-center gap-1 text-xs text-green-500 dark:text-green-400">
      <div className="h-1.5 w-1.5 rounded-full bg-green-500 dark:bg-green-400"></div>
      {statusText}
    </span>
  ) : (
    <span className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
      <div className="h-1.5 w-1.5 rounded-full bg-red-500 dark:bg-red-400"></div>
      {statusText}
    </span>
  )

  const customContent = (
    <div className="space-y-6 p-4">
      {/* Large Color Picker and Input */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <label className="min-w-[60px] text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t('color') || 'Rang:'}
          </label>
          <div className="relative">
            <input
              type="color"
              value={inputColor}
              onChange={(e) => setInputColor(e.target.value)}
              className="h-16 w-24 cursor-pointer rounded-lg border-2 border-zinc-300 bg-transparent transition-all hover:border-zinc-400 focus:border-blue-500 dark:border-zinc-600 dark:hover:border-zinc-500"
              title={t('colorPicker') || 'Rang tanlash'}
            />
          </div>
          <input
            type="text"
            value={inputColor}
            onChange={(e) => setInputColor(e.target.value)}
            className="flex-1 rounded-lg border border-zinc-300 bg-white px-4 py-3 font-mono text-sm text-zinc-900 transition-colors focus:border-blue-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-blue-400"
            placeholder="#000000"
          />
        </div>

        {/* Color Preview */}
        {colorFormats?.isValid && (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800/50">
            <div className="flex items-center gap-4">
              <div
                className="h-20 w-20 rounded-xl border-2 border-zinc-300 shadow-lg dark:border-zinc-600"
                style={{ backgroundColor: inputColor }}
                title={inputColor}
              />
              <div className="flex-1">
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-100">
                  {t('colorInfo') || "Rang ma'lumotlari"}
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  {t('colorName') || 'Rang nomi'}: {getColorName(inputColor)}
                </p>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-zinc-500 dark:text-zinc-500">
                  <div>
                    <span className="font-medium">RGB:</span>
                    <br />
                    {colorFormats.rgbValues.r}, {colorFormats.rgbValues.g}, {colorFormats.rgbValues.b}
                  </div>
                  <div>
                    <span className="font-medium">HSL:</span>
                    <br />
                    {colorFormats.hslValues.h}°, {colorFormats.hslValues.s}%, {colorFormats.hslValues.l}%
                  </div>
                  <div>
                    <span className="font-medium">HEX:</span>
                    <br />
                    {colorFormats.hex}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Preset Colors */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t('presetColors') || 'Tayyor ranglar:'}
          </h3>
          <div className="grid grid-cols-6 gap-3">
            {presetColors.map((preset, index) => (
              <button
                key={index}
                onClick={() => setInputColor(preset.color)}
                className={`group relative h-10 w-10 rounded-lg border-2 transition-all hover:scale-110 hover:shadow-lg ${
                  inputColor.toLowerCase() === preset.color.toLowerCase()
                    ? 'border-blue-500 ring-2 ring-blue-500/30 dark:border-blue-400 dark:ring-blue-400/30'
                    : 'border-zinc-300 hover:border-zinc-400 dark:border-zinc-600 dark:hover:border-zinc-500'
                }`}
                style={{ backgroundColor: preset.color }}
                title={`${preset.name} (${preset.color})`}
              >
                {inputColor.toLowerCase() === preset.color.toLowerCase() && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-2 w-2 rounded-full bg-white shadow-lg" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <TerminalInput
      title={t('title') || 'Rang Tanlash'}
      subtitle={statusText}
      actions={actions}
      showStats={true}
      stats={stats}
      statsPosition="header"
      customContent={customContent}
      minHeight="400px"
      showShadow={true}
      animate={true}
      variant={colorFormats?.isValid ? 'success' : 'error'}
    />
  )
}

export default ColorInputPanel
