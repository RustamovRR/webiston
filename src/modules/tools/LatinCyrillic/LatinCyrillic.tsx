'use client'

import React from 'react'
import { FileText, ArrowLeftRight, X, ChevronDown, Download } from 'lucide-react'
import { useTranslations } from 'next-intl'

// UI Components
import { Button } from '@/components/ui/button'
import { ShimmerButton, GradientTabs } from '@/components/ui'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

// Shared Components
import { ToolHeader } from '@/components/shared/ToolHeader'
import { DualTextPanel } from '@/components/shared/DualTextPanel'

// Local Components
import { InfoSection } from './components'

// Utils & Hooks
import { useLatinCyrillic } from '@/hooks/tools/useLatinCyrillic'

export default function LatinCyrillicPage() {
  const t = useTranslations('LatinCyrillicPage')
  const {
    direction,
    sourceText,
    convertedText,
    sourceLang,
    targetLang,
    sourcePlaceholder,
    samples,
    setDirection,
    setSourceText,
    handleSwap,
    handleClear,
    loadSample,
  } = useLatinCyrillic()

  const downloadResult = () => {
    if (!convertedText) return

    const content = [
      t('downloadFile.title'),
      '',
      `${t('downloadFile.createdAt')}: ${new Date().toLocaleString()}`,
      `${t('downloadFile.direction')}: ${sourceLang} → ${targetLang}`,
      '',
      t('downloadFile.sourceText'),
      sourceText,
      '',
      t('downloadFile.convertedText'),
      convertedText,
      '',
      '---',
      '',
      t('downloadFile.generatedBy'),
    ].join('\n')

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `latin-cyrillic-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const tabOptions = [
    { value: 'latin-to-cyrillic', label: t('latinToCyrillic'), icon: <ArrowLeftRight size={16} /> },
    {
      value: 'cyrillic-to-latin',
      label: t('cyrillicToLatin'),
      icon: <ArrowLeftRight size={16} className="rotate-180" />,
    },
  ]

  const statusComponent =
    sourceText.length > 0 ? (
      <span className="flex items-center gap-1 text-xs text-blue-400">
        <div className="h-1.5 w-1.5 rounded-full bg-blue-400"></div>
        {t('statusReady')}
      </span>
    ) : null

  const targetEmptyState = (
    <div className="flex h-full items-center justify-center p-8 text-center">
      <div className="text-zinc-500">
        <FileText size={48} className="mx-auto mb-4 opacity-50" />
        <p className="text-sm">{t('emptyStateTitle')}</p>
        <p className="mt-2 text-xs opacity-75">{t('emptyStateDescription')}</p>
      </div>
    </div>
  )

  const targetFooterComponent = convertedText ? (
    <div className="text-xs text-zinc-400">
      <span className="text-zinc-500">{t('alphabet')}:</span> <span className="text-zinc-300">{targetLang}</span>
    </div>
  ) : null

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <ToolHeader title={t('ToolHeader.title')} description={t('ToolHeader.description')} />

      {/* Boshqaruv paneli */}
      <div className="mb-6 rounded-lg border p-4 backdrop-blur-sm dark:border-none dark:bg-zinc-900/60">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-4">
            {/* Gradient Tabs for Direction Selection */}
            <GradientTabs
              options={tabOptions}
              value={direction}
              onChange={(value) => setDirection(value as any)}
              toolCategory="converters"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Sample Data */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <FileText size={16} className="mr-2" />
                  {t('sampleTexts')}
                  <ChevronDown size={16} className="ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {samples.map((sample) => (
                  <DropdownMenuItem key={sample.key} onClick={() => loadSample(sample.key as any)}>
                    {sample.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button variant="ghost" size="sm" onClick={handleClear}>
              <X size={16} className="mr-2" />
              {t('clear')}
            </Button>

            {/* Download */}
            <ShimmerButton
              onClick={downloadResult}
              disabled={!convertedText}
              variant={convertedText ? 'default' : 'outline'}
              size="sm"
            >
              <Download size={16} className="mr-2" />
              {t('download')}
            </ShimmerButton>
          </div>
        </div>
      </div>

      <DualTextPanel
        sourceText={sourceText}
        convertedText={convertedText}
        sourcePlaceholder={sourcePlaceholder}
        sourceLabel={t('sourceInput', { sourceLang })}
        targetLabel={t('targetResult', { targetLang })}
        onSourceChange={setSourceText}
        onSwap={handleSwap}
        onClear={handleClear}
        swapButtonTitle={t('swapDirection')}
        statusComponent={statusComponent}
        targetEmptyState={targetEmptyState}
        targetFooterComponent={targetFooterComponent}
        showShadow
      />

      <InfoSection />
    </div>
  )
}
