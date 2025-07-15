'use client'

import React from 'react'
import { FileText, ArrowLeftRight, X, ChevronDown, Download } from 'lucide-react'
import { useTranslations } from 'next-intl'

// UI Components
import { Button } from '@/components/ui/button'
import { ShimmerButton, GradientTabs } from '@/components/ui'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Card } from '@/components/ui/card'

// Shared Components
import { ToolHeader } from '@/components/shared/ToolHeader'
import { DualTextPanel } from '@/components/shared/DualTextPanel'

// Utils & Hooks
import { useLatinCyrillic } from '@/hooks/tools/useLatinCyrillic'
import SectionTitle from '@/components/shared/SectionTitle'

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
      <div className="mb-6 rounded-lg bg-zinc-900/60 p-4 backdrop-blur-sm">
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
      />

      {/* Info Section - Card Based Layout */}
      <div className="mt-12">
        <SectionTitle
          icon={<FileText className="h-6 w-6" />}
          title={t('Info.title')}
          description={t('Info.description')}
        />

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Lotin Alifbosi */}
          <Card className="border-zinc-800/30 bg-zinc-900/60 backdrop-blur-sm">
            <div className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                  <FileText className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">{t('Info.latinAlphabet.title')}</h3>
              </div>
              <p className="mb-4 leading-relaxed text-zinc-400">{t('Info.latinAlphabet.description')}</p>
              <div className="space-y-2 text-sm">
                <p className="text-zinc-300">
                  <strong>{t('Info.latinAlphabet.letterCount')}:</strong> 29 ta
                </p>
                <p className="text-zinc-300">
                  <strong>{t('Info.latinAlphabet.specialChars')}:</strong> o', g', sh, ch, ng
                </p>
                <p className="text-zinc-300">
                  <strong>{t('Info.latinAlphabet.feature')}:</strong> {t('Info.latinAlphabet.featureDesc')}
                </p>
              </div>
            </div>
          </Card>

          {/* Kirill Alifbosi */}
          <Card className="border-zinc-800/30 bg-zinc-900/60 backdrop-blur-sm">
            <div className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/20">
                  <FileText className="h-5 w-5 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">{t('Info.cyrillicAlphabet.title')}</h3>
              </div>
              <p className="mb-4 leading-relaxed text-zinc-400">{t('Info.cyrillicAlphabet.description')}</p>
              <div className="space-y-2 text-sm">
                <p className="text-zinc-300">
                  <strong>{t('Info.cyrillicAlphabet.letterCount')}:</strong> 35 ta
                </p>
                <p className="text-zinc-300">
                  <strong>{t('Info.cyrillicAlphabet.specialChars')}:</strong> ў, ғ, қ, ҳ
                </p>
                <p className="text-zinc-300">
                  <strong>{t('Info.cyrillicAlphabet.feature')}:</strong> {t('Info.cyrillicAlphabet.featureDesc')}
                </p>
              </div>
            </div>
          </Card>

          {/* Transliteratsiya qoidalari */}
          <Card className="border-zinc-800/30 bg-zinc-900/60 backdrop-blur-sm">
            <div className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-yellow-500/20">
                  <ArrowLeftRight className="h-5 w-5 text-yellow-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">{t('Info.rules.title')}</h3>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-zinc-400">
                <div>
                  <p className="font-medium text-zinc-300">{t('Info.rules.latinToCyrillic')}</p>
                  <p>o' → ў, g' → ғ, sh → ш, ch → ч</p>
                </div>
                <div>
                  <p className="font-medium text-zinc-300">{t('Info.rules.cyrillicToLatin')}</p>
                  <p>ў → o', ғ → g', ш → sh, ч → ch</p>
                </div>
                <p className="mt-3 text-xs">{t('Info.rules.accuracy')}</p>
              </div>
            </div>
          </Card>

          {/* Tarix */}
          <Card className="border-zinc-800/30 bg-zinc-900/60 backdrop-blur-sm">
            <div className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/20">
                  <FileText className="h-5 w-5 text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">{t('Info.history.title')}</h3>
              </div>
              <div className="space-y-2 text-sm leading-relaxed text-zinc-400">
                <p>
                  <strong className="text-zinc-300">{t('Info.history.period1')}</strong>
                </p>
                <p>
                  <strong className="text-zinc-300">{t('Info.history.period2')}</strong>
                </p>
                <p>
                  <strong className="text-zinc-300">{t('Info.history.period3')}</strong>
                </p>
                <p className="mt-3 text-xs">{t('Info.history.note')}</p>
              </div>
            </div>
          </Card>

          {/* Qo'llanish sohalari */}
          <Card className="border-zinc-800/30 bg-zinc-900/60 backdrop-blur-sm">
            <div className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-500/20">
                  <FileText className="h-5 w-5 text-red-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">{t('Info.usage.title')}</h3>
              </div>
              <div className="space-y-2 text-sm leading-relaxed text-zinc-400">
                <p>
                  <strong className="text-zinc-300">{t('Info.usage.latin')}</strong> {t('Info.usage.latinDesc')}
                </p>
                <p>
                  <strong className="text-zinc-300">{t('Info.usage.cyrillic')}</strong> {t('Info.usage.cyrillicDesc')}
                </p>
                <p>
                  <strong className="text-zinc-300">{t('Info.usage.mixed')}</strong> {t('Info.usage.mixedDesc')}
                </p>
                <p className="mt-3 text-xs">{t('Info.usage.note')}</p>
              </div>
            </div>
          </Card>

          {/* Foydali maslahatlar */}
          <Card className="border-zinc-800/30 bg-zinc-900/60 backdrop-blur-sm">
            <div className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-500/20">
                  <FileText className="h-5 w-5 text-indigo-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">{t('Info.tips.title')}</h3>
              </div>
              <div className="space-y-2 text-sm leading-relaxed text-zinc-400">
                <p>{t('Info.tips.tip1')}</p>
                <p>{t('Info.tips.tip2')}</p>
                <p>{t('Info.tips.tip3')}</p>
                <p>{t('Info.tips.tip4')}</p>
                <p className="mt-3 text-xs">{t('Info.tips.note')}</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
