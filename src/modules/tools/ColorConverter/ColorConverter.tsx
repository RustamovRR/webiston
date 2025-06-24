'use client'

import { useState } from 'react'
import { Palette, Eye, Droplets, Shuffle, RefreshCw, Download } from 'lucide-react'

// UI Components
import { Button } from '@/components/ui/button'
import { ShimmerButton, GradientTabs, CodeHighlight } from '@/components/ui'

// Shared Components
import { ToolHeader } from '@/components/shared/ToolHeader'
import { CopyButton } from '@/components/shared/CopyButton'
import { StatsDisplay } from '@/components/shared/StatsDisplay'

// Utils & Hooks
import { countWords } from '@/lib/utils'
import { useColorConverter } from '@/hooks'

const ColorConverter = () => {
  const [paletteType, setPaletteType] = useState<'monochromatic' | 'analogous' | 'complementary'>('monochromatic')

  const { inputColor, setInputColor, colorFormats, generatePalette, getColorName } = useColorConverter({
    onSuccess: (message) => {
      console.log('Success:', message)
    },
    onError: (error) => {
      console.error('Error:', error)
    },
  })

  const handleRandomColor = () => {
    const randomColor =
      '#' +
      Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, '0')
    setInputColor(randomColor)
  }

  const handleDownloadPalette = () => {
    if (!colorFormats) return

    const palette = generatePalette(inputColor, paletteType)
    const paletteData = {
      baseColor: inputColor,
      type: paletteType,
      colors: palette,
      formats: colorFormats,
      timestamp: new Date().toISOString(),
    }

    const blob = new Blob([JSON.stringify(paletteData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `color-palette-${paletteType}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

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

  const paletteOptions = [
    {
      value: 'monochromatic',
      label: 'Monoxromatik',
      icon: <Droplets size={16} />,
    },
    {
      value: 'analogous',
      label: 'Analogik',
      icon: <Eye size={16} />,
    },
    {
      value: 'complementary',
      label: 'Komplementar',
      icon: <Shuffle size={16} />,
    },
  ]

  const generatedPalette = generatePalette(inputColor, paletteType)

  const inputStats = [
    { label: 'format', value: 'HEX' },
    { label: 'qiymat', value: inputColor },
  ]

  const formatContent = colorFormats?.isValid
    ? JSON.stringify(
        {
          hex: colorFormats.hex,
          rgb: colorFormats.rgb,
          hsl: colorFormats.hsl,
          rgbValues: colorFormats.rgbValues,
          hslValues: colorFormats.hslValues,
        },
        null,
        2,
      )
    : ''

  const outputStats = colorFormats?.isValid
    ? [
        { label: 'formatlar', value: 3 },
        { label: 'belgi', value: formatContent.length },
        { label: 'qator', value: formatContent.split('\n').length },
      ]
    : [
        { label: 'formatlar', value: 0 },
        { label: 'belgi', value: 0 },
        { label: 'qator', value: 0 },
      ]

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <ToolHeader
        title="Color Converter va Palette Generator"
        description="HEX, RGB, HSL formatlar orasida rang konvertatsiyasi va palette generatsiya vositasi"
      />

      {/* Boshqaruv paneli */}
      <div className="mb-6 rounded-lg bg-zinc-900/60 p-4 backdrop-blur-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-zinc-400">Palette turi:</span>

            <GradientTabs
              options={paletteOptions}
              value={paletteType}
              onChange={(value) => setPaletteType(value as 'monochromatic' | 'analogous' | 'complementary')}
              toolCategory="converters"
            />

            <ShimmerButton onClick={handleRandomColor} variant="outline" size="sm">
              <RefreshCw size={16} className="mr-2" />
              Tasodifiy rang
            </ShimmerButton>
          </div>

          <div className="flex items-center gap-2">
            {colorFormats?.isValid && (
              <ShimmerButton onClick={handleDownloadPalette} variant="outline" size="sm">
                <Download size={16} className="mr-2" />
                Palette yuklab olish
              </ShimmerButton>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Rang tanlash paneli */}
        <div className="flex flex-col rounded-xl border border-zinc-800/50 bg-zinc-900/80 shadow-2xl backdrop-blur-sm">
          <div className="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-800/50 px-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500/80"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500/80"></div>
              <div className="h-3 w-3 rounded-full bg-green-500/80"></div>
              <span className="ml-2 text-lg font-semibold text-zinc-100">Rang Tanlash</span>
            </div>
            <div className="text-xs text-zinc-400">
              {colorFormats?.isValid ? (
                <span className="flex items-center gap-1 text-green-400">
                  <div className="h-1.5 w-1.5 rounded-full bg-green-400"></div>
                  To'g'ri format
                </span>
              ) : (
                <span className="flex items-center gap-1 text-red-400">
                  <div className="h-1.5 w-1.5 rounded-full bg-red-400"></div>
                  Noto'g'ri format
                </span>
              )}
            </div>
          </div>

          <div className="relative flex-grow p-4" style={{ minHeight: '400px' }}>
            {/* Color picker va input */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-zinc-300">Rang:</label>
                <div className="relative">
                  <input
                    type="color"
                    value={inputColor}
                    onChange={(e) => setInputColor(e.target.value)}
                    className="h-10 w-16 cursor-pointer rounded-lg border border-zinc-700 bg-zinc-800"
                  />
                </div>
                <input
                  type="text"
                  value={inputColor}
                  onChange={(e) => setInputColor(e.target.value)}
                  className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 font-mono text-sm text-zinc-100 focus:border-zinc-600 focus:outline-none"
                  placeholder="#000000"
                />
              </div>

              {/* Rang ko'rinishi */}
              {colorFormats?.isValid && (
                <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="h-16 w-16 rounded-lg border border-zinc-700"
                      style={{ backgroundColor: inputColor }}
                    />
                    <div>
                      <h3 className="font-semibold text-zinc-200">Rang ma'lumotlari</h3>
                      <p className="text-sm text-zinc-400">Rang nomi: {getColorName(inputColor)}</p>
                      <div className="mt-1 text-xs text-zinc-500">
                        RGB: {colorFormats.rgbValues.r}, {colorFormats.rgbValues.g}, {colorFormats.rgbValues.b}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Preset colors */}
              <div>
                <h3 className="mb-3 text-sm font-medium text-zinc-300">Tayyor ranglar:</h3>
                <div className="grid grid-cols-6 gap-2">
                  {presetColors.map((preset, index) => (
                    <button
                      key={index}
                      onClick={() => setInputColor(preset.color)}
                      className={`h-8 w-8 rounded-lg border transition-all hover:scale-110 ${
                        inputColor.toLowerCase() === preset.color.toLowerCase()
                          ? 'border-zinc-400 ring-2 ring-zinc-400/50'
                          : 'border-zinc-600 hover:border-zinc-400'
                      }`}
                      style={{ backgroundColor: preset.color }}
                      title={`${preset.name} (${preset.color})`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-zinc-800 bg-zinc-800/30 px-4 py-3">
            <StatsDisplay stats={inputStats as any} />
          </div>
        </div>

        {/* Formatlar va ma'lumotlar paneli */}
        <div className="flex flex-col rounded-xl border border-zinc-800/50 bg-zinc-900/80 shadow-2xl backdrop-blur-sm">
          <div className="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-800/50 px-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500/80"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500/80"></div>
              <div className="h-3 w-3 rounded-full bg-green-500/80"></div>
              <span className="ml-2 text-lg font-semibold text-zinc-100">Formatlar va Ma'lumotlar</span>
            </div>
            <CopyButton text={formatContent} disabled={!colorFormats?.isValid} />
          </div>

          <div className="relative flex-grow" style={{ minHeight: '400px' }}>
            <div className="absolute inset-0 h-full w-full overflow-y-auto">
              {!colorFormats?.isValid ? (
                <div className="flex h-full items-center justify-center p-8 text-center">
                  <div className="text-zinc-500">
                    <Palette size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-sm">To'g'ri HEX rang kiriting...</p>
                    <p className="mt-2 text-xs opacity-75">Rang formatlar bu yerda ko'rinadi</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 p-4">
                  {/* HEX Format */}
                  <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-semibold text-blue-400">HEX Format</h3>
                      <CopyButton text={colorFormats.hex} />
                    </div>
                    <div className="font-mono text-lg text-zinc-100">{colorFormats.hex}</div>
                    <div className="mt-1 text-xs text-zinc-400">Web dasturlashda eng keng tarqalgan</div>
                  </div>

                  {/* RGB Format */}
                  <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-semibold text-green-400">RGB Format</h3>
                      <CopyButton text={colorFormats.rgb} />
                    </div>
                    <div className="font-mono text-lg text-zinc-100">{colorFormats.rgb}</div>
                    <div className="mt-1 text-xs text-zinc-400">
                      R: {colorFormats.rgbValues.r}, G: {colorFormats.rgbValues.g}, B: {colorFormats.rgbValues.b}
                    </div>
                  </div>

                  {/* HSL Format */}
                  <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="font-semibold text-purple-400">HSL Format</h3>
                      <CopyButton text={colorFormats.hsl} />
                    </div>
                    <div className="font-mono text-lg text-zinc-100">{colorFormats.hsl}</div>
                    <div className="mt-1 text-xs text-zinc-400">
                      H: {colorFormats.hslValues.h}°, S: {colorFormats.hslValues.s}%, L: {colorFormats.hslValues.l}%
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-zinc-800 bg-zinc-800/30 px-4 py-3">
            <StatsDisplay stats={outputStats} />
          </div>
        </div>
      </div>

      {/* Generated palette */}
      {colorFormats?.isValid && generatedPalette.length > 0 && (
        <div className="mt-6 rounded-xl border border-zinc-800/30 bg-zinc-900/60 p-6 backdrop-blur-sm">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-100">
            <Palette size={18} className="text-indigo-400" />
            {paletteType === 'monochromatic' && 'Monoxromatik palette'}
            {paletteType === 'analogous' && 'Analogik palette'}
            {paletteType === 'complementary' && 'Komplementar palette'}
          </h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
            {generatedPalette.map((color, index) => (
              <div key={index} className="group cursor-pointer" onClick={() => setInputColor(color)}>
                <div
                  className="h-16 w-full rounded-lg border border-zinc-700 transition-all group-hover:scale-105 group-hover:border-zinc-500"
                  style={{ backgroundColor: color }}
                />
                <div className="mt-2 text-center">
                  <div className="font-mono text-xs text-zinc-300">{color}</div>
                  <div className="text-xs text-zinc-500">{getColorName(color)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ma'lumot bo'limi */}
      <div className="mt-8 rounded-xl border border-zinc-800/30 bg-zinc-900/60 p-6 backdrop-blur-sm">
        <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-100">
          <Palette size={20} className="text-indigo-400" />
          Rang formatlar haqida ma'lumot
        </h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
              <div className="h-2 w-2 rounded-full bg-blue-400"></div>
              HEX Format
            </h4>
            <ul className="space-y-1 text-sm text-zinc-400">
              <li>• Web dasturlashda eng keng tarqalgan</li>
              <li>• #RRGGBB formatida (6 ta belgi)</li>
              <li>• CSS da bevosita ishlatiladi</li>
              <li>• 16 lik sanoq tizimida</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
              RGB Format
            </h4>
            <ul className="space-y-1 text-sm text-zinc-400">
              <li>• Red, Green, Blue qiymatlari</li>
              <li>• 0-255 oralig'ida har bir kanal</li>
              <li>• Monitor va ekranlar uchun</li>
              <li>• JavaScript da keng ishlatiladi</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
              <div className="h-2 w-2 rounded-full bg-purple-400"></div>
              HSL Format
            </h4>
            <ul className="space-y-1 text-sm text-zinc-400">
              <li>• Hue, Saturation, Lightness</li>
              <li>• Inson uchun tushunarli</li>
              <li>• CSS3 da qo'llab-quvvatlanadi</li>
              <li>• Rang moslamalari uchun qulay</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ColorConverter
