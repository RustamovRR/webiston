import React from 'react'
import { Palette } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { TerminalInput, type TerminalInputAction } from '@/components/shared/TerminalInput'
import { CopyButton } from '@/components/shared/CopyButton'
import type { ColorFormats } from '@/hooks/tools/useColorConverter'

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
              rgbValues: colorFormats.rgbValues,
              hslValues: colorFormats.hslValues,
            },
            null,
            2,
          )
        : '',
      disabled: !colorFormats?.isValid,
    },
  ]

  const stats = colorFormats?.isValid
    ? [
        { label: t('formats') || 'Formatlar', value: 3 },
        { label: t('characters') || 'Belgilar', value: JSON.stringify(colorFormats).length },
      ]
    : [
        { label: t('formats') || 'Formatlar', value: 0 },
        { label: t('characters') || 'Belgilar', value: 0 },
      ]

  const emptyState = (
    <div className="flex h-full items-center justify-center p-8 text-center">
      <div className="text-zinc-500 dark:text-zinc-400">
        <Palette size={48} className="mx-auto mb-4 opacity-50" />
        <p className="text-sm">{t('enterValidColor') || "To'g'ri HEX rang kiriting..."}</p>
        <p className="mt-2 text-xs opacity-75">{t('formatsWillAppear') || "Rang formatlar bu yerda ko'rinadi"}</p>
      </div>
    </div>
  )

  const formatContent = colorFormats?.isValid && (
    <div className="space-y-4 p-4">
      {/* HEX Format */}
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:bg-zinc-800/70">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold text-blue-600 dark:text-blue-400">HEX Format</h3>
          <CopyButton text={colorFormats.hex} />
        </div>
        <div className="font-mono text-lg text-zinc-900 dark:text-zinc-100">{colorFormats.hex}</div>
        <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          {t('hexDescription') || 'Web dasturlashda eng keng tarqalgan'}
        </div>
      </div>

      {/* RGB Format */}
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:bg-zinc-800/70">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold text-green-600 dark:text-green-400">RGB Format</h3>
          <CopyButton text={colorFormats.rgb} />
        </div>
        <div className="font-mono text-lg text-zinc-900 dark:text-zinc-100">{colorFormats.rgb}</div>
        <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          R: {colorFormats.rgbValues.r}, G: {colorFormats.rgbValues.g}, B: {colorFormats.rgbValues.b}
        </div>
      </div>

      {/* HSL Format */}
      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4 transition-colors hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:bg-zinc-800/70">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="font-semibold text-purple-600 dark:text-purple-400">HSL Format</h3>
          <CopyButton text={colorFormats.hsl} />
        </div>
        <div className="font-mono text-lg text-zinc-900 dark:text-zinc-100">{colorFormats.hsl}</div>
        <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
          H: {colorFormats.hslValues.h}°, S: {colorFormats.hslValues.s}%, L: {colorFormats.hslValues.l}%
        </div>
      </div>
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
      minHeight="400px"
      showShadow={true}
      animate={true}
      variant="default"
    />
  )
}

export default ColorFormatsPanel
