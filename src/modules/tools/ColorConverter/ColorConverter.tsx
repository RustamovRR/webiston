'use client'

import { useState } from 'react'
import { Check, Copy, Palette, Eye, Droplets, Shuffle, RefreshCw, Download } from 'lucide-react'
import { useCopyToClipboard } from 'usehooks-ts'
import { Button } from '@/components/ui/button'
import { ToolHeader } from '@/components/shared/ToolHeader'
import { ShimmerButton, GradientTabs, ToolPanel } from '@/components/ui'
import { useColorConverter } from '@/hooks'
import { UI_PATTERNS, TOOL_COLOR_MAP } from '@/constants/ui-constants'

const ColorConverter = () => {
  const [copied, setCopied] = useState('')
  const [paletteType, setPaletteType] = useState<'monochromatic' | 'analogous' | 'complementary'>('monochromatic')
  const [_, copy] = useCopyToClipboard()

  const toolColors = TOOL_COLOR_MAP['color-converter']

  const { inputColor, setInputColor, colorFormats, generatePalette, getColorName, setColorFromRgb, setColorFromHsl } =
    useColorConverter({
      onSuccess: (message) => {
        console.log('Success:', message)
      },
      onError: (error) => {
        console.error('Error:', error)
      },
    })

  const handleCopy = async (value: string, type: string) => {
    try {
      await copy(value)
      setCopied(type)
      setTimeout(() => setCopied(''), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

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

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <ToolHeader
        title="Color Converter"
        description="HEX, RGB, HSL formatlar orasida rang konvertatsiyasi va palette generatsiya vositasi"
      />

      {/* Palette turi tanlash paneli */}
      <div className={`mb-6 ${UI_PATTERNS.CONTROL_PANEL}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {/* Palette Type Tabs */}
            <GradientTabs
              options={paletteOptions}
              value={paletteType}
              onChange={(value) => setPaletteType(value as 'monochromatic' | 'analogous' | 'complementary')}
              toolCategory="converters"
            />

            {/* Random color button */}
            <ShimmerButton onClick={handleRandomColor} variant="outline" size="sm">
              <RefreshCw size={16} className="mr-2" />
              Tasodifiy rang
            </ShimmerButton>
          </div>

          {/* Download palette */}
          <ShimmerButton onClick={handleDownloadPalette} variant="outline" size="sm" disabled={!colorFormats?.isValid}>
            <Download size={16} className="mr-2" />
            Palette yuklab olish
          </ShimmerButton>
        </div>
      </div>

      {/* Rang tanlash paneli */}
      <div className={`mb-6 ${UI_PATTERNS.CONTROL_PANEL}`}>
        <div className="space-y-4">
          {/* Color picker va input */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3">
              <label className="text-lg font-semibold text-zinc-100">Rang tanlang:</label>
              <div className="relative">
                <input
                  type="color"
                  value={inputColor}
                  onChange={(e) => setInputColor(e.target.value)}
                  className="h-12 w-12 cursor-pointer rounded-lg border-2 border-zinc-700 transition-colors hover:border-zinc-600"
                />
                <div className="absolute -right-2 -bottom-2 rounded-full bg-zinc-800 p-1">
                  <Palette size={12} className="text-zinc-400" />
                </div>
              </div>
              <input
                type="text"
                value={inputColor}
                onChange={(e) => setInputColor(e.target.value)}
                className="rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 font-mono text-zinc-100 transition-colors focus:border-zinc-600 focus:outline-none"
                placeholder="#000000"
              />
            </div>

            {colorFormats?.isValid && (
              <div className="text-sm text-zinc-400">
                <span className="font-medium">Rang nomi:</span> {getColorName(inputColor)}
              </div>
            )}
          </div>

          {/* Preset colors */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-zinc-300">Tayyor ranglar:</h3>
            <div className="flex flex-wrap gap-3">
              {presetColors.map((preset, index) => (
                <button
                  key={index}
                  onClick={() => setInputColor(preset.color)}
                  className={`group relative h-10 w-10 rounded-lg border-2 transition-all hover:scale-110 ${
                    inputColor.toLowerCase() === preset.color.toLowerCase()
                      ? 'border-zinc-400 shadow-lg'
                      : 'border-zinc-600 hover:border-zinc-400'
                  }`}
                  style={{ backgroundColor: preset.color }}
                  title={`${preset.name} (${preset.color})`}
                >
                  <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 transform rounded bg-zinc-800 px-2 py-1 text-xs whitespace-nowrap text-zinc-300 opacity-0 transition-opacity group-hover:opacity-100">
                    {preset.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Rang ko'rinishi */}
      {colorFormats?.isValid && (
        <div className={`mb-6 ${UI_PATTERNS.CONTROL_PANEL}`}>
          <div className="flex flex-wrap items-center gap-6">
            <div
              className="h-24 w-24 rounded-xl border-2 border-zinc-700 shadow-lg"
              style={{ backgroundColor: inputColor }}
            />
            <div className="flex-1">
              <h3 className="mb-2 text-lg font-semibold text-zinc-100">Rang ko'rinishi</h3>
              <p className="mb-2 text-sm text-zinc-400">
                Bu rang turli formatlarda qanday ko'rinadi va rang palitralari
              </p>
              <div className="flex flex-wrap gap-4 text-xs text-zinc-500">
                <span>
                  RGB: {colorFormats.rgbValues.r}, {colorFormats.rgbValues.g}, {colorFormats.rgbValues.b}
                </span>
                <span>
                  HSL: {colorFormats.hslValues.h}°, {colorFormats.hslValues.s}%, {colorFormats.hslValues.l}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Color formats */}
      {colorFormats?.isValid && (
        <div className="mb-6 grid gap-6 lg:grid-cols-3">
          {/* HEX */}
          <ToolPanel
            title="HEX Format"
            variant="terminal"
            actions={
              <button
                onClick={() => handleCopy(colorFormats.hex, 'hex')}
                className="cursor-pointer rounded-full p-2.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
                aria-label="Copy HEX"
              >
                {copied === 'hex' ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
              </button>
            }
          >
            <div className="space-y-3 p-4">
              <div className="font-mono text-xl text-zinc-200">{colorFormats.hex}</div>
              <div className="text-sm text-zinc-400">Hexadecimal format</div>
              <div className="text-xs text-zinc-500">Web dasturlashda eng keng tarqalgan format</div>
            </div>
          </ToolPanel>

          {/* RGB */}
          <ToolPanel
            title="RGB Format"
            variant="terminal"
            actions={
              <button
                onClick={() => handleCopy(colorFormats.rgb, 'rgb')}
                className="cursor-pointer rounded-full p-2.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
                aria-label="Copy RGB"
              >
                {copied === 'rgb' ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
              </button>
            }
          >
            <div className="space-y-3 p-4">
              <div className="font-mono text-xl text-zinc-200">{colorFormats.rgb}</div>
              <div className="space-y-1 text-sm text-zinc-400">
                <div>R: {colorFormats.rgbValues.r}</div>
                <div>G: {colorFormats.rgbValues.g}</div>
                <div>B: {colorFormats.rgbValues.b}</div>
              </div>
              <div className="text-xs text-zinc-500">Red, Green, Blue qiymatlari (0-255)</div>
            </div>
          </ToolPanel>

          {/* HSL */}
          <ToolPanel
            title="HSL Format"
            variant="terminal"
            actions={
              <button
                onClick={() => handleCopy(colorFormats.hsl, 'hsl')}
                className="cursor-pointer rounded-full p-2.5 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
                aria-label="Copy HSL"
              >
                {copied === 'hsl' ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
              </button>
            }
          >
            <div className="space-y-3 p-4">
              <div className="font-mono text-xl text-zinc-200">{colorFormats.hsl}</div>
              <div className="space-y-1 text-sm text-zinc-400">
                <div>H: {colorFormats.hslValues.h}° (Hue)</div>
                <div>S: {colorFormats.hslValues.s}% (Saturation)</div>
                <div>L: {colorFormats.hslValues.l}% (Lightness)</div>
              </div>
              <div className="text-xs text-zinc-500">Inson uchun tushunarli format</div>
            </div>
          </ToolPanel>
        </div>
      )}

      {/* Generated palette */}
      {colorFormats?.isValid && generatedPalette.length > 0 && (
        <div className={`mb-6 ${UI_PATTERNS.CONTROL_PANEL}`}>
          <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-zinc-100">
            <Palette size={20} className={toolColors.text.replace('text-', 'text-')} />
            {paletteType === 'monochromatic' && 'Monoxromatik palette'}
            {paletteType === 'analogous' && 'Analogik palette'}
            {paletteType === 'complementary' && 'Komplementar palette'}
          </h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
            {generatedPalette.map((color, index) => (
              <div key={index} className="group cursor-pointer" onClick={() => setInputColor(color)}>
                <div
                  className="h-20 w-full rounded-lg border-2 border-zinc-700 transition-all group-hover:scale-105 group-hover:border-zinc-500"
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

      {/* Ma'lumot va yordam bo'limi */}
      <div className={`mt-8 ${UI_PATTERNS.CONTROL_PANEL}`}>
        <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-100">
          <Palette size={20} className={toolColors.text.replace('text-', 'text-')} />
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

        {/* Palette turlari haqida */}
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
              <Droplets size={16} className="text-blue-400" />
              Monoxromatik
            </h4>
            <p className="text-sm text-zinc-400">
              Bir rangning turli soyalari va tinglari. Harmonik va tinch ko'rinish beradi.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
              <Eye size={16} className="text-green-400" />
              Analogik
            </h4>
            <p className="text-sm text-zinc-400">
              Rang doirasida yaqin joylashgan ranglar. Tabiy va yumshoq ko'rinish.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
              <Shuffle size={16} className="text-purple-400" />
              Komplementar
            </h4>
            <p className="text-sm text-zinc-400">Qarama-qarshi ranglar. Yuqori kontrast va diqqatga tortuvchi.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ColorConverter
