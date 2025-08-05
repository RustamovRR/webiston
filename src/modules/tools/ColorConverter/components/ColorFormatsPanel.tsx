import React from 'react'
import { Palette } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { TerminalInput, type TerminalInputAction } from '@/components/shared/TerminalInput'
import type { ColorFormats } from '@/hooks/tools/useColorConverter'
import ColorFormatItem from './ColorFormatItem'

interface ColorFormatsPanelProps {
  colorFormats: ColorFormats | null
}

const ColorFormatsPanel: React.FC<ColorFormatsPanelProps> = ({ colorFormats }) => {
  const t = useTranslations('ColorConverterPage.ColorFormats')

  const actions: TerminalInputAction[] = [
    {
      type: 'copy',
      text: colorFormats?.isValid
        ? JSON.stringify(
            {
              hex: colorFormats.hex,
              rgb: colorFormats.rgb,
              hsl: colorFormats.hsl,
              rgba: colorFormats.rgba,
              hsla: colorFormats.hsla,
              lab: colorFormats.lab,
              lch: colorFormats.lch,
              oklab: colorFormats.oklab,
              oklch: colorFormats.oklch,
              rgbValues: colorFormats.rgbValues,
              hslValues: colorFormats.hslValues,
              labValues: colorFormats.labValues,
              lchValues: colorFormats.lchValues,
              oklabValues: colorFormats.oklabValues,
              oklchValues: colorFormats.oklchValues,
            },
            null,
            2,
          )
        : '',
      disabled: !colorFormats?.isValid,
    },
  ]

  const formatCount = 9 // HEX, RGB, HSL, RGBA, HSLA, Lab, LCH, OKLab, OKLCH

  const stats = colorFormats?.isValid
    ? [
        { label: t('formats') || 'Formatlar', value: formatCount },
        { label: t('characters') || 'Belgilar', value: JSON.stringify(colorFormats).length },
      ]
    : [
        { label: t('formats') || 'Formatlar', value: 0 },
        { label: t('characters') || 'Belgilar', value: 0 },
      ]

  const emptyState = (
    <div className="flex h-[380px] items-center justify-center p-8 text-center">
      <div className="text-zinc-500 dark:text-zinc-400">
        <Palette size={48} className="mx-auto mb-4 opacity-50" />
        <p className="text-sm">{t('enterValidColor') || "To'g'ri HEX rang kiriting..."}</p>
        <p className="mt-2 text-xs opacity-75">{t('formatsWillAppear') || "Rang formatlar bu yerda ko'rinadi"}</p>
      </div>
    </div>
  )

  // Color formats data array
  const colorFormatItems = colorFormats?.isValid
    ? [
        {
          title: 'HEX',
          value: colorFormats.hex,
          description: t('hexDescription') || 'Web dasturlashda eng keng tarqalgan',
          colorClass: 'text-blue-600 dark:text-blue-400',
        },
        {
          title: 'RGB',
          value: colorFormats.rgb,
          description: `R: ${colorFormats.rgbValues.r}, G: ${colorFormats.rgbValues.g}, B: ${colorFormats.rgbValues.b}`,
          colorClass: 'text-green-600 dark:text-green-400',
        },
        {
          title: 'HSL',
          value: colorFormats.hsl,
          description: `H: ${colorFormats.hslValues.h}°, S: ${colorFormats.hslValues.s}%, L: ${colorFormats.hslValues.l}%`,
          colorClass: 'text-purple-600 dark:text-purple-400',
        },
        {
          title: 'RGBA',
          value: colorFormats.rgba,
          description: t('rgbaDescription') || 'Alpha kanal bilan RGB',
          colorClass: 'text-teal-600 dark:text-teal-400',
        },
        {
          title: 'HSLA',
          value: colorFormats.hsla,
          description: t('hslaDescription') || 'Alpha kanal bilan HSL',
          colorClass: 'text-indigo-600 dark:text-indigo-400',
        },
        {
          title: 'Lab',
          value: colorFormats.lab,
          description: `L: ${colorFormats.labValues.l}, a: ${colorFormats.labValues.a}, b: ${colorFormats.labValues.b}`,
          colorClass: 'text-pink-600 dark:text-pink-400',
        },
        {
          title: 'LCH',
          value: colorFormats.lch,
          description: `L: ${colorFormats.lchValues.l}, C: ${colorFormats.lchValues.c}, H: ${colorFormats.lchValues.h}°`,
          colorClass: 'text-rose-600 dark:text-rose-400',
        },
        {
          title: 'OKLab',
          value: colorFormats.oklab,
          description: `L: ${colorFormats.oklabValues.l}, a: ${colorFormats.oklabValues.a}, b: ${colorFormats.oklabValues.b}`,
          colorClass: 'text-emerald-600 dark:text-emerald-400',
        },
        {
          title: 'OKLCH',
          value: colorFormats.oklch,
          description: `L: ${colorFormats.oklchValues.l}, C: ${colorFormats.oklchValues.c}, H: ${colorFormats.oklchValues.h}°`,
          colorClass: 'text-cyan-600 dark:text-cyan-400',
        },
      ]
    : []

  const handleCopySuccess = (value: string) => {
    console.log('Copied:', value)
  }

  const formatContent = colorFormats?.isValid && (
    <div className="max-h-[380px] space-y-3 overflow-y-auto p-4">
      {colorFormatItems.map((item, index) => (
        <ColorFormatItem
          key={index}
          title={item.title}
          value={item.value}
          description={item.description}
          colorClass={item.colorClass}
          onCopy={handleCopySuccess}
        />
      ))}
    </div>
  )

  return (
    <TerminalInput
      title={t('title') || "Formatlar va Ma'lumotlar"}
      actions={actions}
      showStats={true}
      stats={stats}
      statsPosition="footer"
      customContent={colorFormats?.isValid ? formatContent : emptyState}
      showShadow={true}
      animate={true}
      variant="default"
      className="h-full"
    />
  )
}

export default ColorFormatsPanel
