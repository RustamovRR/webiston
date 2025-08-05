import React from 'react'
import { useTranslations } from 'next-intl'
import { Palette, Copy, Check, Plus, Minus, RotateCcw } from 'lucide-react'
import { TerminalInput } from '@/components/shared/TerminalInput'
import { Button } from '@/components/ui/button'
import { hexToRgb, rgbToHex, hslToRgb, rgbToHsl } from '@/lib/utils'

interface GradientColor {
  color: string
  position: number
}

interface GradientGeneratorProps {
  baseColor: string
  isValid: boolean
}

const GradientGenerator: React.FC<GradientGeneratorProps> = ({ baseColor, isValid }) => {
  const t = useTranslations('ColorConverterPage.GradientGenerator')
  const [gradientType, setGradientType] = React.useState<'linear' | 'radial' | 'conic'>('linear')
  const [direction, setDirection] = React.useState(90) // degrees for linear
  const [colors, setColors] = React.useState<GradientColor[]>([
    { color: baseColor, position: 0 },
    { color: '#ffffff', position: 100 },
  ])
  const [copiedItem, setCopiedItem] = React.useState<string | null>(null)

  // Update first color when baseColor changes
  React.useEffect(() => {
    if (isValid) {
      setColors((prev) => [{ ...prev[0], color: baseColor }, ...prev.slice(1)])
    }
  }, [baseColor, isValid])

  const copyToClipboard = async (text: string, item: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedItem(item)
      setTimeout(() => setCopiedItem(null), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  const addColor = () => {
    if (colors.length >= 5) return // Max 5 colors

    const newPosition = colors.length > 0 ? Math.round((colors[colors.length - 1].position + 100) / 2) : 50

    setColors((prev) => [...prev, { color: '#000000', position: newPosition }])
  }

  const removeColor = (index: number) => {
    if (colors.length <= 2) return // Min 2 colors
    setColors((prev) => prev.filter((_, i) => i !== index))
  }

  const updateColor = (index: number, color: string) => {
    setColors((prev) => prev.map((item, i) => (i === index ? { ...item, color } : item)))
  }

  const updatePosition = (index: number, position: number) => {
    setColors((prev) =>
      prev.map((item, i) => (i === index ? { ...item, position: Math.max(0, Math.min(100, position)) } : item)),
    )
  }

  const generateRandomGradient = () => {
    const randomColors = []
    const numColors = Math.floor(Math.random() * 3) + 2 // 2-4 colors

    for (let i = 0; i < numColors; i++) {
      const hue = Math.floor(Math.random() * 360)
      const saturation = Math.floor(Math.random() * 50) + 50 // 50-100%
      const lightness = Math.floor(Math.random() * 40) + 30 // 30-70%

      const rgb = hslToRgb(hue, saturation, lightness)
      const hex = rgbToHex(rgb.r, rgb.g, rgb.b)

      randomColors.push({
        color: hex,
        position: Math.round((100 / (numColors - 1)) * i),
      })
    }

    setColors(randomColors)
    setDirection(Math.floor(Math.random() * 360))
  }

  const generateCSS = () => {
    const sortedColors = [...colors].sort((a, b) => a.position - b.position)
    const colorStops = sortedColors.map((c) => `${c.color} ${c.position}%`).join(', ')

    switch (gradientType) {
      case 'linear':
        return `linear-gradient(${direction}deg, ${colorStops})`
      case 'radial':
        return `radial-gradient(circle, ${colorStops})`
      case 'conic':
        return `conic-gradient(from ${direction}deg, ${colorStops})`
      default:
        return `linear-gradient(${direction}deg, ${colorStops})`
    }
  }

  const generateTailwindCSS = () => {
    const sortedColors = [...colors].sort((a, b) => a.position - b.position)
    const fromColor = sortedColors[0]?.color || '#000000'
    const toColor = sortedColors[sortedColors.length - 1]?.color || '#ffffff'

    // Convert to Tailwind color names (simplified)
    const getColorName = (hex: string) => {
      const rgb = hexToRgb(hex)
      if (!rgb) return 'gray-500'

      const { r, g, b } = rgb
      const brightness = (r * 299 + g * 587 + b * 114) / 1000

      if (brightness > 200) return 'gray-100'
      if (brightness < 50) return 'gray-900'
      return 'gray-500'
    }

    const directionClass =
      direction === 0
        ? 'bg-gradient-to-t'
        : direction === 90
          ? 'bg-gradient-to-r'
          : direction === 180
            ? 'bg-gradient-to-b'
            : direction === 270
              ? 'bg-gradient-to-l'
              : 'bg-gradient-to-br'

    return `${directionClass} from-[${fromColor}] to-[${toColor}]`
  }

  const customContent = (
    <div className="space-y-6 p-4">
      {isValid ? (
        <>
          {/* Gradient Preview */}
          <div className="space-y-4">
            <div
              className="h-32 w-full rounded-lg border-2 border-zinc-200 shadow-lg dark:border-zinc-700"
              style={{ background: generateCSS() }}
              title="Gradient Preview"
            />

            {/* Gradient Controls */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {/* Type Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('type') || 'Turi:'}</label>
                <div className="flex gap-1">
                  {(['linear', 'radial', 'conic'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setGradientType(type)}
                      className={`rounded-md px-3 py-1 text-xs transition-colors ${
                        gradientType === type
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Direction Control */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {t('direction') || "Yo'nalish:"} {direction}°
                </label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={direction}
                  onChange={(e) => setDirection(parseInt(e.target.value))}
                  className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-zinc-200 dark:bg-zinc-700"
                />
              </div>

              {/* Random Button */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  {t('actions') || 'Amallar:'}
                </label>
                <Button onClick={generateRandomGradient} variant="outline" size="sm" className="w-full">
                  <RotateCcw size={14} className="mr-2" />
                  {t('random') || 'Tasodifiy'}
                </Button>
              </div>
            </div>
          </div>

          {/* Color Stops */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {t('colorStops') || 'Rang nuqtalari:'}
              </h4>
              <Button onClick={addColor} variant="outline" size="sm" disabled={colors.length >= 5}>
                <Plus size={14} className="mr-1" />
                {t('addColor') || "Rang qo'shish"}
              </Button>
            </div>

            <div className="space-y-3">
              {colors.map((colorStop, index) => (
                <div key={index} className="flex items-center gap-3">
                  <input
                    type="color"
                    value={colorStop.color}
                    onChange={(e) => updateColor(index, e.target.value)}
                    className="h-10 w-16 cursor-pointer rounded border border-zinc-300 dark:border-zinc-600"
                  />

                  <input
                    type="text"
                    value={colorStop.color}
                    onChange={(e) => updateColor(index, e.target.value)}
                    className="flex-1 rounded border border-zinc-300 px-3 py-2 font-mono text-sm dark:border-zinc-600 dark:bg-zinc-800"
                  />

                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={colorStop.position}
                      onChange={(e) => updatePosition(index, parseInt(e.target.value) || 0)}
                      className="w-16 rounded border border-zinc-300 px-2 py-2 text-sm dark:border-zinc-600 dark:bg-zinc-800"
                    />
                    <span className="text-sm text-zinc-500">%</span>
                  </div>

                  <Button
                    onClick={() => removeColor(index)}
                    variant="outline"
                    size="sm"
                    disabled={colors.length <= 2}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Minus size={14} />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Export Options */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t('exportOptions') || 'Export variantlari:'}
            </h4>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {/* CSS Gradient */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(generateCSS(), 'css')}
                className="justify-start text-left"
              >
                {copiedItem === 'css' ? (
                  <Check size={14} className="mr-2 text-green-500" />
                ) : (
                  <Copy size={14} className="mr-2" />
                )}
                CSS Gradient
              </Button>

              {/* Tailwind CSS */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(generateTailwindCSS(), 'tailwind')}
                className="justify-start text-left"
              >
                {copiedItem === 'tailwind' ? (
                  <Check size={14} className="mr-2 text-green-500" />
                ) : (
                  <Copy size={14} className="mr-2" />
                )}
                Tailwind CSS
              </Button>
            </div>

            {/* CSS Code Preview */}
            <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800">
              <code className="font-mono text-sm text-zinc-800 dark:text-zinc-200">background: {generateCSS()};</code>
            </div>
          </div>
        </>
      ) : (
        <div className="flex h-32 items-center justify-center text-zinc-500 dark:text-zinc-400">
          <div className="text-center">
            <Palette size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">{t('noValidColor') || "To'g'ri rang kiriting"}</p>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <TerminalInput
      title={t('title') || 'Gradient Generator'}
      subtitle={isValid ? `Base: ${baseColor}` : undefined}
      customContent={customContent}
      variant={isValid ? 'info' : 'default'}
      showShadow={true}
      animate={true}
      minHeight="400px"
    />
  )
}

export default GradientGenerator
