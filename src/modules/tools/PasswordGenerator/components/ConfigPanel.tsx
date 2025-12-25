'use client'

import { useState } from 'react'
import { RefreshCw, Eye, EyeOff, Download, Copy, Check, Key, Shield } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { ShimmerButton, GradientTabs } from '@/components/ui'
import { cn } from '@/lib'

interface PasswordSettings {
  passwordType: 'random' | 'memorable' | 'strong'
  length: number
  includeUppercase: boolean
  includeLowercase: boolean
  includeNumbers: boolean
  includeSymbols: boolean
  excludeSimilar: boolean
}

interface PasswordSettings {
  passwordType: 'random' | 'memorable' | 'strong'
  length: number
  includeUppercase: boolean
  includeLowercase: boolean
  includeNumbers: boolean
  includeSymbols: boolean
  excludeSimilar: boolean
}

interface PresetSetting {
  label: string
  description: string
  settings: Partial<PasswordSettings>
}

interface ConfigPanelProps {
  settings: PasswordSettings
  password: string
  showPassword: boolean
  copied: boolean
  presetSettings: PresetSetting[]
  onUpdateSettings: (settings: Partial<PasswordSettings>) => void
  onGeneratePassword: () => void
  onTogglePasswordVisibility: () => void
  onCopy: () => void
  onDownload: () => void
  onLoadPreset: (preset: { label: string; description: string; settings: Partial<PasswordSettings> }) => void
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({
  settings,
  password,
  showPassword,
  copied,
  presetSettings,
  onUpdateSettings,
  onGeneratePassword,
  onTogglePasswordVisibility,
  onCopy,
  onDownload,
  onLoadPreset,
}) => {
  const t = useTranslations('PasswordGeneratorPage.ConfigPanel')
  const tTypes = useTranslations('PasswordGeneratorPage.PasswordTypes')
  const tLength = useTranslations('PasswordGeneratorPage.LengthLabels')
  const tChar = useTranslations('PasswordGeneratorPage.CharacterOptions')

  const passwordTypeOptions = [
    {
      value: 'random',
      label: tTypes('random'),
      icon: <RefreshCw size={16} />,
    },
    {
      value: 'memorable',
      label: tTypes('memorable'),
      icon: <Key size={16} />,
    },
    {
      value: 'strong',
      label: tTypes('strong'),
      icon: <Shield size={16} />,
    },
  ]

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
          <span className="text-xs text-zinc-500 dark:text-zinc-500">{t('status')}</span>
        </div>
      </div>

      {/* Panel Content */}
      <div className="p-6">
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Password Type Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('passwordType')}</label>
            <GradientTabs
              options={passwordTypeOptions}
              value={settings.passwordType}
              onChange={(value) => onUpdateSettings({ passwordType: value as 'random' | 'memorable' | 'strong' })}
              toolCategory="generators"
            />
            <div className="rounded-lg bg-zinc-100/50 p-3 dark:bg-zinc-800/50">
              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                {settings.passwordType === 'random' && tTypes('randomDesc')}
                {settings.passwordType === 'memorable' && tTypes('memorableDesc')}
                {settings.passwordType === 'strong' && tTypes('strongDesc')}
              </div>
            </div>
          </div>

          {/* Length Setting */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t('passwordLength')} <span className="text-blue-400">{settings.length}</span>
            </label>
            <input
              type="range"
              min="4"
              max="128"
              value={settings.length}
              onChange={(e) => onUpdateSettings({ length: parseInt(e.target.value) })}
              className="w-full accent-blue-500"
            />
            <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-500">
              <span>4 ({tLength('short')})</span>
              <span>16 ({tLength('standard')})</span>
              <span>32 ({tLength('strong')})</span>
              <span>128 ({tLength('maximum')})</span>
            </div>
          </div>
        </div>

        {/* Character Options */}
        <div className="mt-6 space-y-3">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('characterTypes')}</label>
          <div className="grid gap-3 md:grid-cols-2">
            <label
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors',
                settings.includeUppercase
                  ? 'border-green-500 bg-green-500/10 text-green-600 dark:text-green-300'
                  : 'border-zinc-300 text-zinc-600 hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200'
              )}
            >
              <input
                type="checkbox"
                checked={settings.includeUppercase}
                onChange={(e) => onUpdateSettings({ includeUppercase: e.target.checked })}
                className="sr-only"
              />
              <div className="text-sm font-medium">{tChar('uppercase')}</div>
            </label>

            <label
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors',
                settings.includeLowercase
                  ? 'border-green-500 bg-green-500/10 text-green-600 dark:text-green-300'
                  : 'border-zinc-300 text-zinc-600 hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200'
              )}
            >
              <input
                type="checkbox"
                checked={settings.includeLowercase}
                onChange={(e) => onUpdateSettings({ includeLowercase: e.target.checked })}
                className="sr-only"
              />
              <div className="text-sm font-medium">{tChar('lowercase')}</div>
            </label>

            <label
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors',
                settings.includeNumbers
                  ? 'border-green-500 bg-green-500/10 text-green-600 dark:text-green-300'
                  : 'border-zinc-300 text-zinc-600 hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200'
              )}
            >
              <input
                type="checkbox"
                checked={settings.includeNumbers}
                onChange={(e) => onUpdateSettings({ includeNumbers: e.target.checked })}
                className="sr-only"
              />
              <div className="text-sm font-medium">{tChar('numbers')}</div>
            </label>

            <label
              className={cn(
                'flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors',
                settings.includeSymbols
                  ? 'border-green-500 bg-green-500/10 text-green-600 dark:text-green-300'
                  : 'border-zinc-300 text-zinc-600 hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200'
              )}
            >
              <input
                type="checkbox"
                checked={settings.includeSymbols}
                onChange={(e) => onUpdateSettings({ includeSymbols: e.target.checked })}
                className="sr-only"
              />
              <div className="text-sm font-medium">{tChar('symbols')}</div>
            </label>
          </div>

          {/* Additional Options */}
          <label
            className={cn(
              'flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors',
              settings.excludeSimilar
                ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-300'
                : 'border-zinc-300 text-zinc-600 hover:border-zinc-400 hover:text-zinc-800 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-600 dark:hover:text-zinc-200'
            )}
          >
            <input
              type="checkbox"
              checked={settings.excludeSimilar}
              onChange={(e) => onUpdateSettings({ excludeSimilar: e.target.checked })}
              className="sr-only"
            />
            <div className="text-sm font-medium">{tChar('excludeSimilar')}</div>
          </label>
        </div>

        {/* Preset Settings */}
        <div className="mt-6 space-y-3">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('quickSettings')}</label>
          <div className="grid gap-2 md:grid-cols-3 lg:grid-cols-5">
            {presetSettings.map((preset, index) => (
              <div
                key={index}
                className="flex flex-col gap-2 rounded-lg border border-zinc-200 bg-zinc-100/30 p-3 transition-colors hover:bg-zinc-100/50 dark:border-zinc-700 dark:bg-zinc-800/30 dark:hover:bg-zinc-800/50"
              >
                <div className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{preset.label}</div>
                <div className="text-xs text-zinc-600 dark:text-zinc-400">{preset.description}</div>
                <Button onClick={() => onLoadPreset(preset)} variant="outline" size="sm" className="mt-auto">
                  {t('loadButton')}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Controls */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Generate Button */}
            <ShimmerButton onClick={onGeneratePassword} size="sm">
              <RefreshCw size={16} className="mr-2" />
              {t('generateButton')}
            </ShimmerButton>

            {/* Visibility Toggle */}
            <Button onClick={onTogglePasswordVisibility} variant="outline" size="sm">
              {showPassword ? <EyeOff size={16} className="mr-2" /> : <Eye size={16} className="mr-2" />}
              {showPassword ? t('hideButton') : t('showButton')}
            </Button>
          </div>

          {/* Action Buttons */}
          {password && (
            <div className="flex items-center gap-2">
              <Button onClick={onCopy} variant="outline" size="sm">
                {copied ? <Check size={16} className="mr-2 text-green-500" /> : <Copy size={16} className="mr-2" />}
                {copied ? t('copiedButton') : t('copyButton')}
              </Button>

              <Button onClick={onDownload} variant="outline" size="sm">
                <Download size={16} className="mr-2" />
                {t('downloadButton')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConfigPanel
