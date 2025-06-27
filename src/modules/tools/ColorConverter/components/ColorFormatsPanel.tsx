import { Palette } from 'lucide-react'
import { CopyButton } from '@/components/shared'

interface ColorFormats {
  hex: string
  rgb: string
  hsl: string
  rgbValues: { r: number; g: number; b: number }
  hslValues: { h: number; s: number; l: number }
  isValid: boolean
}

interface ColorFormatsPanelProps {
  colorFormats: ColorFormats | null
}

export const ColorFormatsPanel = ({ colorFormats }: ColorFormatsPanelProps) => {
  if (!colorFormats?.isValid) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center">
        <div className="text-zinc-500">
          <Palette size={48} className="mx-auto mb-4 opacity-50" />
          <p className="text-sm">To'g'ri HEX rang kiriting...</p>
          <p className="mt-2 text-xs opacity-75">Rang formatlar bu yerda ko'rinadi</p>
        </div>
      </div>
    )
  }

  return (
    <div className="absolute inset-0 h-full w-full overflow-y-auto p-4">
      <div className="space-y-4">
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
    </div>
  )
}
