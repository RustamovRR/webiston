'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

// Shared Components
import { ToolHeader } from '@/components/shared/ToolHeader'

// Local Components
import { ControlPanel, ColorInputPanel, ColorFormatsPanel, ColorPalette, InfoSection } from './components'
import TailwindShades from './components/TailwindShades'
import ColorHistory from './components/ColorHistory'

// Utils & Hooks
import { useColorConverter } from '@/hooks'

const ColorConverter = () => {
  const t = useTranslations('ColorConverterPage')
  const [paletteType, setPaletteType] = useState<'monochromatic' | 'analogous' | 'complementary'>('monochromatic')

  const { inputColor, setInputColor, colorFormats, generatePalette, generateTailwindShades, getColorName } =
    useColorConverter({
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

  const generatedPalette = generatePalette(inputColor, paletteType)
  const tailwindShades = generateTailwindShades(inputColor)

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <ToolHeader
        title={t('ToolHeader.title') || 'Color Converter va Palette Generator'}
        description={
          t('ToolHeader.description') ||
          'HEX, RGB, HSL formatlar orasida rang konvertatsiyasi va palette generatsiya vositasi'
        }
      />

      {/* Control Panel */}
      <ControlPanel
        paletteType={paletteType}
        setPaletteType={setPaletteType}
        onRandomColor={handleRandomColor}
        onDownloadPalette={handleDownloadPalette}
        isValid={colorFormats?.isValid || false}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Color Input Panel */}
        <ColorInputPanel
          inputColor={inputColor}
          setInputColor={setInputColor}
          colorFormats={colorFormats}
          getColorName={getColorName}
        />

        {/* Color Formats Panel */}
        <ColorFormatsPanel colorFormats={colorFormats} />
      </div>

      {/* Generated Palette */}
      <ColorPalette
        isValid={colorFormats?.isValid || false}
        generatedPalette={generatedPalette}
        paletteType={paletteType}
        getColorName={getColorName}
        onColorSelect={setInputColor}
      />

      {/* Color History & Favorites */}
      <div className="mt-6">
        <ColorHistory onColorSelect={setInputColor} currentColor={inputColor} />
      </div>

      {/* Tailwind Shades */}
      <div className="mt-6">
        <TailwindShades baseColor={inputColor} shades={tailwindShades} isValid={colorFormats?.isValid || false} />
      </div>

      {/* Information Section */}
      <InfoSection />
    </div>
  )
}

export default ColorConverter
