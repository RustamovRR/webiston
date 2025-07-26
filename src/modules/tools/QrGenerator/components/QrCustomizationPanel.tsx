import React, { useState, useRef } from 'react'
import { Upload, X, RefreshCw, Palette, Image, Settings } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { GradientTabs, ShimmerButton } from '@/components/ui'
import { TerminalInput } from '@/components/shared/TerminalInput'
import { cn } from '@/lib'

export interface QrCustomization {
  foregroundColor: string
  backgroundColor: string
  logo?: string
  logoSize: number
  cornerStyle: 'square' | 'rounded' | 'extraRounded' | 'circle'
  patternStyle: 'square' | 'circle' | 'rounded' | 'diamond'
  margin: number
  borderRadius: number
  gradientEnabled: boolean
  gradientDirection: 'horizontal' | 'vertical' | 'diagonal' | 'radial'
  gradientEndColor?: string
}

interface QrCustomizationPanelProps {
  customization: QrCustomization
  onCustomizationChange: (customization: QrCustomization) => void
  isValid: boolean
}

const QrCustomizationPanel: React.FC<QrCustomizationPanelProps> = ({
  customization,
  onCustomizationChange,
  isValid,
}) => {
  const t = useTranslations('QrGeneratorPage.CustomizationPanel')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [logoUploading, setLogoUploading] = useState(false)

  // Preset styles
  const presetStyles = [
    {
      name: 'classic',
      label: t('styles.classic'),
      style: {
        foregroundColor: '#000000',
        backgroundColor: '#ffffff',
        cornerStyle: 'square' as const,
        patternStyle: 'square' as const,
        gradientEnabled: false,
        borderRadius: 0,
        margin: 10,
      },
    },
    {
      name: 'modern',
      label: t('styles.modern'),
      style: {
        foregroundColor: '#1f2937',
        backgroundColor: '#f9fafb',
        cornerStyle: 'rounded' as const,
        patternStyle: 'rounded' as const,
        gradientEnabled: false,
        borderRadius: 8,
        margin: 15,
      },
    },
    {
      name: 'rounded',
      label: t('styles.rounded'),
      style: {
        foregroundColor: '#3b82f6',
        backgroundColor: '#ffffff',
        cornerStyle: 'circle' as const,
        patternStyle: 'circle' as const,
        gradientEnabled: false,
        borderRadius: 12,
        margin: 20,
      },
    },
    {
      name: 'gradient',
      label: t('styles.gradient'),
      style: {
        foregroundColor: '#8b5cf6',
        backgroundColor: '#ffffff',
        cornerStyle: 'rounded' as const,
        patternStyle: 'rounded' as const,
        gradientEnabled: true,
        gradientEndColor: '#ec4899',
        gradientDirection: 'diagonal' as const,
        borderRadius: 10,
        margin: 15,
      },
    },
    {
      name: 'minimal',
      label: t('styles.minimal'),
      style: {
        foregroundColor: '#374151',
        backgroundColor: '#ffffff',
        cornerStyle: 'square' as const,
        patternStyle: 'square' as const,
        gradientEnabled: false,
        borderRadius: 0,
        margin: 5,
      },
    },
    {
      name: 'colorful',
      label: t('styles.colorful'),
      style: {
        foregroundColor: '#ef4444',
        backgroundColor: '#fef3c7',
        cornerStyle: 'extraRounded' as const,
        patternStyle: 'diamond' as const,
        gradientEnabled: true,
        gradientEndColor: '#f59e0b',
        gradientDirection: 'radial' as const,
        borderRadius: 15,
        margin: 20,
      },
    },
  ]

  // Corner style options
  const cornerOptions = [
    { value: 'square', label: t('corners.square'), icon: <div className="h-3 w-3 bg-current" /> },
    { value: 'rounded', label: t('corners.rounded'), icon: <div className="h-3 w-3 rounded-sm bg-current" /> },
    {
      value: 'extraRounded',
      label: t('corners.extraRounded'),
      icon: <div className="h-3 w-3 rounded-md bg-current" />,
    },
    { value: 'circle', label: t('corners.circle'), icon: <div className="h-3 w-3 rounded-full bg-current" /> },
  ]

  // Pattern style options
  const patternOptions = [
    { value: 'square', label: t('patterns.square'), icon: <div className="h-3 w-3 bg-current" /> },
    { value: 'circle', label: t('patterns.circle'), icon: <div className="h-3 w-3 rounded-full bg-current" /> },
    { value: 'rounded', label: t('patterns.rounded'), icon: <div className="h-3 w-3 rounded-sm bg-current" /> },
    { value: 'diamond', label: t('patterns.diamond'), icon: <div className="h-3 w-3 rotate-45 bg-current" /> },
  ]

  // Gradient direction options
  const gradientOptions = [
    {
      value: 'horizontal',
      label: t('gradients.horizontal'),
      icon: <div className="h-2 w-4 bg-gradient-to-r from-current to-transparent" />,
    },
    {
      value: 'vertical',
      label: t('gradients.vertical'),
      icon: <div className="h-4 w-2 bg-gradient-to-b from-current to-transparent" />,
    },
    {
      value: 'diagonal',
      label: t('gradients.diagonal'),
      icon: <div className="h-3 w-3 bg-gradient-to-br from-current to-transparent" />,
    },
    {
      value: 'radial',
      label: t('gradients.radial'),
      icon: <div className="bg-gradient-radial h-3 w-3 rounded-full from-current to-transparent" />,
    },
  ]

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert(t('invalidFile'))
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      // 2MB
      alert(t('fileTooLarge'))
      return
    }

    setLogoUploading(true)

    try {
      const reader = new FileReader()
      reader.onload = (e) => {
        const logoDataUrl = e.target?.result as string
        onCustomizationChange({
          ...customization,
          logo: logoDataUrl,
        })
        setLogoUploading(false)
      }
      reader.readAsDataURL(file)
    } catch (error) {
      setLogoUploading(false)
      alert(t('invalidFile'))
    }
  }

  const handleRemoveLogo = () => {
    onCustomizationChange({
      ...customization,
      logo: undefined,
    })
  }

  const handleApplyPreset = (preset: (typeof presetStyles)[0]) => {
    onCustomizationChange({
      ...customization,
      ...preset.style,
    })
  }

  const handleResetToDefault = () => {
    onCustomizationChange({
      foregroundColor: '#000000',
      backgroundColor: '#ffffff',
      logoSize: 20,
      cornerStyle: 'square',
      patternStyle: 'square',
      margin: 10,
      borderRadius: 0,
      gradientEnabled: false,
      gradientDirection: 'horizontal',
    })
  }

  const statusComponent = (
    <span className="flex items-center gap-1 text-xs text-purple-500 dark:text-purple-400">
      <div className="h-1.5 w-1.5 rounded-full bg-purple-500 dark:bg-purple-400"></div>
      {t('status')}
    </span>
  )

  const customContent = (
    <div className="space-y-6 p-4">
      {/* Preset Styles */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('presetStyles')}</label>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
          {presetStyles.map((preset) => (
            <button
              key={preset.name}
              onClick={() => handleApplyPreset(preset)}
              className="group relative rounded-lg border border-zinc-300 p-3 text-left transition-all hover:border-purple-400 hover:bg-purple-50 dark:border-zinc-600 dark:hover:border-purple-500 dark:hover:bg-purple-900/20"
            >
              <div className="mb-2 flex items-center gap-2">
                <div
                  className="h-4 w-4 rounded border"
                  style={{
                    backgroundColor: preset.style.foregroundColor,
                    borderColor: preset.style.backgroundColor,
                  }}
                />
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{preset.label}</span>
              </div>
              <div className="text-xs text-zinc-600 dark:text-zinc-400">
                {preset.style.gradientEnabled ? 'Gradient' : 'Solid'} • {preset.style.cornerStyle}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Color Settings */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('foregroundColor')}</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={customization.foregroundColor}
              onChange={(e) =>
                onCustomizationChange({
                  ...customization,
                  foregroundColor: e.target.value,
                })
              }
              className="h-10 w-16 cursor-pointer rounded-lg border-2 border-zinc-300 bg-transparent transition-all hover:border-zinc-400 focus:border-purple-500 dark:border-zinc-600 dark:hover:border-zinc-500"
            />
            <input
              type="text"
              value={customization.foregroundColor}
              onChange={(e) =>
                onCustomizationChange({
                  ...customization,
                  foregroundColor: e.target.value,
                })
              }
              className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm text-zinc-900 transition-colors focus:border-purple-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-purple-400"
              placeholder="#000000"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('backgroundColor')}</label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={customization.backgroundColor}
              onChange={(e) =>
                onCustomizationChange({
                  ...customization,
                  backgroundColor: e.target.value,
                })
              }
              className="h-10 w-16 cursor-pointer rounded-lg border-2 border-zinc-300 bg-transparent transition-all hover:border-zinc-400 focus:border-purple-500 dark:border-zinc-600 dark:hover:border-zinc-500"
            />
            <input
              type="text"
              value={customization.backgroundColor}
              onChange={(e) =>
                onCustomizationChange({
                  ...customization,
                  backgroundColor: e.target.value,
                })
              }
              className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm text-zinc-900 transition-colors focus:border-purple-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-purple-400"
              placeholder="#ffffff"
            />
          </div>
        </div>
      </div>

      {/* Gradient Settings */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="gradientEnabled"
            checked={customization.gradientEnabled}
            onChange={(e) =>
              onCustomizationChange({
                ...customization,
                gradientEnabled: e.target.checked,
              })
            }
            className="h-4 w-4 rounded border-zinc-300 text-purple-600 focus:ring-purple-500 dark:border-zinc-600"
          />
          <label htmlFor="gradientEnabled" className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t('gradientEnabled')}
          </label>
        </div>

        {customization.gradientEnabled && (
          <div className="space-y-4 rounded-lg bg-zinc-50 p-4 dark:bg-zinc-800/50">
            <div className="space-y-3">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('gradientDirection')}</label>
              <GradientTabs
                options={gradientOptions}
                value={customization.gradientDirection}
                onChange={(value) =>
                  onCustomizationChange({
                    ...customization,
                    gradientDirection: value as any,
                  })
                }
                toolCategory="generators"
              />
            </div>

            <div className="space-y-3">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Gradient End Color:</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={customization.gradientEndColor || customization.foregroundColor}
                  onChange={(e) =>
                    onCustomizationChange({
                      ...customization,
                      gradientEndColor: e.target.value,
                    })
                  }
                  className="h-10 w-16 cursor-pointer rounded-lg border-2 border-zinc-300 bg-transparent transition-all hover:border-zinc-400 focus:border-purple-500 dark:border-zinc-600 dark:hover:border-zinc-500"
                />
                <input
                  type="text"
                  value={customization.gradientEndColor || customization.foregroundColor}
                  onChange={(e) =>
                    onCustomizationChange({
                      ...customization,
                      gradientEndColor: e.target.value,
                    })
                  }
                  className="flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm text-zinc-900 transition-colors focus:border-purple-500 focus:outline-none dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-purple-400"
                  placeholder="#000000"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Style Settings */}
      <div className="space-y-6">
        <div className="space-y-3">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('cornerStyle')}</label>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {cornerOptions.map((option) => (
              <button
                key={option.value}
                onClick={() =>
                  onCustomizationChange({
                    ...customization,
                    cornerStyle: option.value as any,
                  })
                }
                className={`flex flex-col items-center gap-2 rounded-lg border p-3 text-center transition-all ${
                  customization.cornerStyle === option.value
                    ? 'border-purple-500 bg-purple-50 text-purple-700 dark:border-purple-400 dark:bg-purple-900/20 dark:text-purple-300'
                    : 'border-zinc-300 text-zinc-600 hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:bg-zinc-800/50'
                }`}
              >
                <div className="text-purple-500 dark:text-purple-400">{option.icon}</div>
                <span className="text-xs font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('patternStyle')}</label>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {patternOptions.map((option) => (
              <button
                key={option.value}
                onClick={() =>
                  onCustomizationChange({
                    ...customization,
                    patternStyle: option.value as any,
                  })
                }
                className={`flex flex-col items-center gap-2 rounded-lg border p-3 text-center transition-all ${
                  customization.patternStyle === option.value
                    ? 'border-purple-500 bg-purple-50 text-purple-700 dark:border-purple-400 dark:bg-purple-900/20 dark:text-purple-300'
                    : 'border-zinc-300 text-zinc-600 hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-600 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:bg-zinc-800/50'
                }`}
              >
                <div className="text-purple-500 dark:text-purple-400">{option.icon}</div>
                <span className="text-xs font-medium">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Logo Upload */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{t('logoUpload')}</label>
        <div className="flex items-center gap-3">
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />

          {customization.logo ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 rounded-lg border border-green-300 bg-green-50 px-3 py-2 dark:border-green-600 dark:bg-green-900/20">
                <img src={customization.logo} alt="Logo" className="h-6 w-6 rounded object-cover" />
                <span className="text-sm text-green-700 dark:text-green-300">{t('logoUploaded')}</span>
              </div>
              <Button
                onClick={handleRemoveLogo}
                variant="outline"
                size="sm"
                className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <X size={16} className="mr-1" />
                {t('removeLogo')}
              </Button>
            </div>
          ) : (
            <Button onClick={() => fileInputRef.current?.click()} variant="outline" size="sm" disabled={logoUploading}>
              <Upload size={16} className="mr-2" />
              {logoUploading ? 'Uploading...' : t('uploadLogo')}
            </Button>
          )}
        </div>

        {customization.logo && (
          <div className="space-y-3">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              {t('logoSize')} ({customization.logoSize}%)
            </label>
            <input
              type="range"
              min="10"
              max="40"
              value={customization.logoSize}
              onChange={(e) =>
                onCustomizationChange({
                  ...customization,
                  logoSize: parseInt(e.target.value),
                })
              }
              className="w-full"
            />
          </div>
        )}
      </div>

      {/* Numeric Settings */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t('margin')} ({customization.margin}px)
          </label>
          <input
            type="range"
            min="0"
            max="50"
            value={customization.margin}
            onChange={(e) =>
              onCustomizationChange({
                ...customization,
                margin: parseInt(e.target.value),
              })
            }
            className="w-full"
          />
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {t('borderRadius')} ({customization.borderRadius}px)
          </label>
          <input
            type="range"
            min="0"
            max="20"
            value={customization.borderRadius}
            onChange={(e) =>
              onCustomizationChange({
                ...customization,
                borderRadius: parseInt(e.target.value),
              })
            }
            className="w-full"
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-700">
        <Button
          onClick={handleResetToDefault}
          variant="outline"
          size="sm"
          className="text-zinc-600 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
        >
          <RefreshCw size={16} className="mr-2" />
          {t('resetToDefault')}
        </Button>

        <div className="text-xs text-zinc-500 dark:text-zinc-400">
          {isValid ? 'Customization ready' : 'Enter valid QR data first'}
        </div>
      </div>
    </div>
  )

  return <div className="h-auto min-h-[600px]">{customContent}</div>
}

export default QrCustomizationPanel
