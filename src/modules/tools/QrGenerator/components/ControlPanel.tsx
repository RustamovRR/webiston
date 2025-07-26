import React, { useState, useEffect } from 'react'
import { Download, Upload, Hash, Zap, X, Settings, QrCode, Image } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { ShimmerButton, GradientTabs } from '@/components/ui'
import { cn } from '@/lib'
import { QrSize, QrErrorLevel, QrPreset } from '@/hooks/tools/useQrGenerator'

interface ControlPanelProps {
  qrSize: QrSize
  errorLevel: QrErrorLevel
  isGenerating: boolean
  availableSizes: ReadonlyArray<{ readonly value: number; readonly label: string; readonly description: string }>
  errorLevels: ReadonlyArray<{ readonly value: string; readonly label: string; readonly description: string }>
  groupedPresets: Record<string, QrPreset[]>
  canDownload: boolean
  inputText: string
  onSizeChange: (size: QrSize) => void
  onErrorLevelChange: (level: QrErrorLevel) => void
  onPresetSelect: (preset: QrPreset) => void
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  onClear: () => void
  onDownload: () => void
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  qrSize,
  errorLevel,
  isGenerating,
  availableSizes,
  errorLevels,
  groupedPresets,
  canDownload,
  inputText,
  onSizeChange,
  onErrorLevelChange,
  onPresetSelect,
  onFileUpload,
  onClear,
  onDownload,
}) => {
  const t = useTranslations('QrGeneratorPage.ControlPanel')
  const tCategories = useTranslations('QrGeneratorPage.Categories')
  const tSizes = useTranslations('QrGeneratorPage.Sizes')
  const tErrorLevels = useTranslations('QrGeneratorPage.ErrorLevels')

  const [activeCategory, setActiveCategory] = useState('url')
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)

  // Reset selected preset when input text changes manually
  useEffect(() => {
    if (selectedPreset && inputText.trim() !== selectedPreset.trim()) {
      setSelectedPreset(null)
    }
  }, [inputText, selectedPreset])

  const categoryOptions = [
    {
      value: 'url',
      label: tCategories('url'),
      icon: <Hash size={16} />,
    },
    {
      value: 'contact',
      label: tCategories('contact'),
      icon: <Zap size={16} />,
    },
    {
      value: 'text',
      label: tCategories('text'),
      icon: <X size={16} />,
    },
    {
      value: 'wifi',
      label: tCategories('wifi'),
      icon: <Settings size={16} />,
    },
    {
      value: 'sms',
      label: tCategories('sms'),
      icon: <QrCode size={16} />,
    },
  ]

  const sizeOptions = availableSizes.map((size) => ({
    value: size.value.toString(),
    label: size.label,
    icon: <Image size={16} />,
  }))

  return (
    <div className="mb-6 rounded-xl border border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500"></div>
            <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
            <div className="h-3 w-3 rounded-full bg-green-500"></div>
          </div>
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('title')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-green-500"></div>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">{t('status')}</span>
        </div>
      </div>

      {/* Panel Content */}
      <div className="p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Category Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('categoryLabel')}</label>
            <GradientTabs
              options={categoryOptions}
              value={activeCategory}
              onChange={setActiveCategory}
              toolCategory="generators"
            />
            <div className="rounded-lg bg-zinc-100/50 p-3 dark:bg-zinc-800/50">
              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                {tCategories(`descriptions.${activeCategory}`)}
              </div>
            </div>
          </div>

          {/* QR Size */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('sizeLabel')}</label>
            <GradientTabs
              options={sizeOptions}
              value={qrSize.toString()}
              onChange={(value) => onSizeChange(Number(value) as QrSize)}
              toolCategory="generators"
            />
            <div className="rounded-lg bg-zinc-100/50 p-3 dark:bg-zinc-800/50">
              <div className="text-xs text-zinc-600 dark:text-zinc-400">{tSizes('description')}</div>
            </div>
          </div>
        </div>

        {/* Error Level */}
        <div className="mt-6 space-y-3">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('errorLevelLabel')}</label>
          <div className="grid gap-2 md:grid-cols-4">
            {errorLevels.map((level) => (
              <label
                key={level.value}
                className={cn(
                  'flex cursor-pointer items-center gap-2 rounded-lg border p-3 transition-colors',
                  errorLevel === level.value
                    ? 'border-green-500 bg-green-500/10 text-green-600 dark:text-green-300'
                    : 'border-zinc-300 text-zinc-600 hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200',
                )}
              >
                <input
                  type="radio"
                  name="errorLevel"
                  value={level.value}
                  checked={errorLevel === level.value}
                  onChange={(e) => onErrorLevelChange(e.target.value as QrErrorLevel)}
                  className="sr-only"
                />
                <div className="text-sm font-medium">{level.label}</div>
                <div className="text-xs opacity-75">{level.description}</div>
              </label>
            ))}
          </div>
        </div>

        {/* Preset Selection */}
        {groupedPresets[activeCategory] && (
          <div className="mt-6 space-y-3">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('presetsLabel')}</label>
            <div className="grid gap-2 md:grid-cols-2">
              {groupedPresets[activeCategory].map((preset: QrPreset, index: number) => {
                const isActive = inputText.trim() === preset.value.trim()

                const handlePresetClick = () => {
                  setSelectedPreset(preset.value)
                  onPresetSelect(preset)
                }

                return (
                  <div
                    key={index}
                    className={cn(
                      'flex items-center justify-between rounded-lg border p-3 transition-colors',
                      isActive
                        ? 'border-blue-500 bg-blue-500/10 dark:border-blue-400 dark:bg-blue-400/10'
                        : 'border-zinc-300 bg-zinc-100/30 hover:bg-zinc-100/50 dark:border-zinc-700 dark:bg-zinc-800/30 dark:hover:bg-zinc-800/50',
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <div
                        className={cn(
                          'text-sm font-medium',
                          isActive ? 'text-blue-700 dark:text-blue-300' : 'text-zinc-800 dark:text-zinc-200',
                        )}
                      >
                        {preset.label}
                      </div>
                      <div
                        className={cn(
                          'text-xs',
                          isActive ? 'text-blue-600 dark:text-blue-400' : 'text-zinc-600 dark:text-zinc-400',
                        )}
                      >
                        {preset.description}
                      </div>
                    </div>
                    <Button
                      onClick={handlePresetClick}
                      variant={isActive ? 'default' : 'outline'}
                      size="sm"
                      className={cn(
                        'ml-2',
                        isActive && 'bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600',
                      )}
                    >
                      {isActive ? t('selected') : t('load')}
                    </Button>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* File Upload */}
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept=".txt,.json,.csv,.md"
                onChange={onFileUpload}
                className="hidden"
                id="file-upload"
              />
              <Button variant="outline" size="sm" asChild>
                <label htmlFor="file-upload" className="cursor-pointer">
                  <Upload size={16} className="mr-2" />
                  {t('fileUpload')}
                </label>
              </Button>
            </div>

            {/* Clear */}
            {inputText && (
              <Button onClick={onClear} variant="outline" size="sm">
                <X size={16} className="mr-2" />
                {t('clear')}
              </Button>
            )}
          </div>

          {/* Download */}
          {canDownload && (
            <ShimmerButton onClick={onDownload} disabled={isGenerating} size="sm">
              <Download size={16} className="mr-2" />
              {isGenerating ? t('downloading') : t('download')}
            </ShimmerButton>
          )}
        </div>
      </div>
    </div>
  )
}

export default ControlPanel
