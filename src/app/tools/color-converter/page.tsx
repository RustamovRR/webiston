'use client'

import { useState, useMemo } from 'react'
import { Check, Copy, Palette } from 'lucide-react'
import { useCopyToClipboard } from 'usehooks-ts'

const ColorConverter = () => {
  const [inputColor, setInputColor] = useState('#3b82f6')
  const [copied, setCopied] = useState('')
  const [_, copy] = useCopyToClipboard()

  const colorFormats = useMemo(() => {
    const hex = inputColor

    // Convert hex to RGB
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
          }
        : null
    }

    // Convert RGB to HSL
    const rgbToHsl = (r: number, g: number, b: number) => {
      r /= 255
      g /= 255
      b /= 255
      const max = Math.max(r, g, b),
        min = Math.min(r, g, b)
      let h,
        s,
        l = (max + min) / 2

      if (max === min) {
        h = s = 0 // achromatic
      } else {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0)
            break
          case g:
            h = (b - r) / d + 2
            break
          case b:
            h = (r - g) / d + 4
            break
          default:
            h = 0
        }
        h /= 6
      }

      return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100),
      }
    }

    const rgb = hexToRgb(hex)
    if (!rgb) return null

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b)

    return {
      hex: hex.toUpperCase(),
      rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
      hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
      rgbValues: rgb,
      hslValues: hsl,
    }
  }, [inputColor])

  const handleCopy = async (value: string, type: string) => {
    try {
      await copy(value)
      setCopied(type)
      setTimeout(() => setCopied(''), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }

  const presetColors = [
    '#3b82f6',
    '#ef4444',
    '#10b981',
    '#f59e0b',
    '#8b5cf6',
    '#ec4899',
    '#06b6d4',
    '#84cc16',
    '#f97316',
    '#6366f1',
    '#14b8a6',
    '#f43f5e',
  ]

  return (
    <div className="mx-auto mt-6 w-full max-w-4xl">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold text-zinc-100">Color Converter</h1>
        <p className="text-lg text-zinc-400">HEX, RGB, HSL formatlar orasida rang konvertatsiyasi vositasi</p>
      </div>

      {/* Color Picker */}
      <div className="mb-6 rounded-lg bg-zinc-900/80 p-6">
        <div className="mb-4 flex items-center gap-4">
          <label className="text-lg font-semibold text-zinc-100">Rang tanlang:</label>
          <input
            type="color"
            value={inputColor}
            onChange={(e) => setInputColor(e.target.value)}
            className="h-12 w-12 cursor-pointer rounded border-2 border-zinc-700"
          />
          <input
            type="text"
            value={inputColor}
            onChange={(e) => setInputColor(e.target.value)}
            className="rounded border border-zinc-700 bg-zinc-800 px-3 py-2 font-mono text-zinc-100"
            placeholder="#000000"
          />
        </div>

        {/* Preset Colors */}
        <div>
          <h3 className="mb-3 text-sm font-medium text-zinc-300">Tayyor ranglar:</h3>
          <div className="flex flex-wrap gap-2">
            {presetColors.map((color, index) => (
              <button
                key={index}
                onClick={() => setInputColor(color)}
                className="h-8 w-8 rounded border-2 border-zinc-600 transition-colors hover:border-zinc-400"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Color Preview */}
      {colorFormats && (
        <div className="mb-6 rounded-lg bg-zinc-900/80 p-6">
          <div className="mb-4 flex items-center gap-4">
            <div className="h-24 w-24 rounded-lg border-2 border-zinc-700" style={{ backgroundColor: inputColor }} />
            <div>
              <h3 className="mb-2 text-lg font-semibold text-zinc-100">Rang ko'rinishi</h3>
              <p className="text-sm text-zinc-400">Bu rang turli formatlarda qanday ko'rinadi</p>
            </div>
          </div>
        </div>
      )}

      {/* Color Formats */}
      {colorFormats && (
        <div className="grid gap-4 md:grid-cols-3">
          {/* HEX */}
          <div className="rounded-lg bg-zinc-900/80 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-zinc-100">HEX</h3>
              <button
                onClick={() => handleCopy(colorFormats.hex, 'hex')}
                className="rounded-full p-2 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
              >
                {copied === 'hex' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              </button>
            </div>
            <div className="mb-2 font-mono text-lg text-zinc-200">{colorFormats.hex}</div>
            <div className="text-sm text-zinc-400">Hexadecimal format</div>
          </div>

          {/* RGB */}
          <div className="rounded-lg bg-zinc-900/80 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-zinc-100">RGB</h3>
              <button
                onClick={() => handleCopy(colorFormats.rgb, 'rgb')}
                className="rounded-full p-2 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
              >
                {copied === 'rgb' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              </button>
            </div>
            <div className="mb-2 font-mono text-lg text-zinc-200">{colorFormats.rgb}</div>
            <div className="text-sm text-zinc-400">
              R: {colorFormats.rgbValues.r}, G: {colorFormats.rgbValues.g}, B: {colorFormats.rgbValues.b}
            </div>
          </div>

          {/* HSL */}
          <div className="rounded-lg bg-zinc-900/80 p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-zinc-100">HSL</h3>
              <button
                onClick={() => handleCopy(colorFormats.hsl, 'hsl')}
                className="rounded-full p-2 text-zinc-400 hover:bg-zinc-700 hover:text-zinc-200"
              >
                {copied === 'hsl' ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
              </button>
            </div>
            <div className="mb-2 font-mono text-lg text-zinc-200">{colorFormats.hsl}</div>
            <div className="text-sm text-zinc-400">
              H: {colorFormats.hslValues.h}°, S: {colorFormats.hslValues.s}%, L: {colorFormats.hslValues.l}%
            </div>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="mt-8 rounded-lg bg-zinc-900/50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-zinc-100">Rang formatlar haqida</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <h4 className="mb-2 font-medium text-zinc-200">HEX:</h4>
            <ul className="space-y-1 text-sm text-zinc-400">
              <li>• Web dasturlashda eng keng tarqalgan</li>
              <li>• #RRGGBB formatida</li>
              <li>• CSS da ishlatiladi</li>
              <li>• 6 ta hexadecimal raqam</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 font-medium text-zinc-200">RGB:</h4>
            <ul className="space-y-1 text-sm text-zinc-400">
              <li>• Red, Green, Blue qiymatlari</li>
              <li>• 0-255 oralig'ida</li>
              <li>• Ekranlar uchun</li>
              <li>• JavaScript da keng ishlatiladi</li>
            </ul>
          </div>
          <div>
            <h4 className="mb-2 font-medium text-zinc-200">HSL:</h4>
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
