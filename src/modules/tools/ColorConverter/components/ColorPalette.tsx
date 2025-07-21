import React from 'react'
import { Palette } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface ColorPaletteProps {
  isValid: boolean
  generatedPalette: string[]
  paletteType: 'monochromatic' | 'analogous' | 'complementary'
  getColorName: (color: string) => string
  onColorSelect: (color: string) => void
}

const ColorPalette: React.FC<ColorPaletteProps> = ({
  isValid,
  generatedPalette,
  paletteType,
  getColorName,
  onColorSelect,
}) => {
  const t = useTranslations('ColorConverterPage.ColorPalette')

  if (!isValid || generatedPalette.length === 0) {
    return null
  }

  const getPaletteTitle = () => {
    switch (paletteType) {
      case 'monochromatic':
        return t('monochromatic') || 'Monoxromatik palette'
      case 'analogous':
        return t('analogous') || 'Analogik palette'
      case 'complementary':
        return t('complementary') || 'Komplementar palette'
      default:
        return 'Color Palette'
    }
  }

  return (
    <div className="animate-in slide-in-from-bottom-2 fade-in mt-6 rounded-xl border border-zinc-200 bg-white/80 p-6 backdrop-blur-sm transition-all duration-200 hover:shadow-md dark:border-zinc-800/30 dark:bg-zinc-900/60">
      <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        <Palette size={18} className="text-indigo-500 dark:text-indigo-400" />
        {getPaletteTitle()}
      </h3>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
        {generatedPalette.map((color, index) => (
          <div
            key={index}
            className="group cursor-pointer transition-all duration-200 hover:scale-105"
            onClick={() => onColorSelect(color)}
          >
            <div
              className="h-20 w-full rounded-lg border-2 border-zinc-200 shadow-sm transition-all duration-200 group-hover:border-zinc-400 group-hover:shadow-lg dark:border-zinc-700 dark:group-hover:border-zinc-500"
              style={{ backgroundColor: color }}
              title={`${getColorName(color)} - ${color}`}
            />
            <div className="mt-2 text-center">
              <div className="font-mono text-xs font-medium text-zinc-700 dark:text-zinc-300">{color}</div>
              <div className="text-xs text-zinc-500 dark:text-zinc-400">{getColorName(color)}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          {t('clickToSelect') || 'Rangni tanlash uchun bosing'}
        </p>
      </div>
    </div>
  )
}

export default ColorPalette
