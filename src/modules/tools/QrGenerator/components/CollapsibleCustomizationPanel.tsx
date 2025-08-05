import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Palette, Sparkles } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib'
import QrCustomizationPanel, { type QrCustomization } from './QrCustomizationPanel'
import Image from 'next/image'

interface CollapsibleCustomizationPanelProps {
  customization: QrCustomization
  onCustomizationChange: (customization: QrCustomization) => void
  isValid: boolean
  qrUrl?: string
  inputText?: string
}

const CollapsibleCustomizationPanel: React.FC<CollapsibleCustomizationPanelProps> = ({
  customization,
  onCustomizationChange,
  isValid,
  qrUrl,
}) => {
  const t = useTranslations('QrGeneratorPage.CustomizationPanel')
  const [isExpanded, setIsExpanded] = useState(false)

  // Check if user has made any customizations
  const hasCustomizations =
    customization.foregroundColor !== '#000000' ||
    customization.backgroundColor !== '#ffffff' ||
    customization.logo ||
    customization.cornerStyle !== 'square' ||
    customization.patternStyle !== 'square' ||
    customization.gradientEnabled ||
    customization.margin !== 10 ||
    customization.borderRadius !== 0

  return (
    <div className="my-6">
      {/* Toggle Header */}
      <div className="rounded-t-xl border border-b-0 border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between p-4 text-left transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>

            <div className="flex items-center gap-2">
              <Palette size={18} className="text-purple-500 dark:text-purple-400" />
              <span className="font-medium text-zinc-700 dark:text-zinc-300">{t('title')}</span>

              {hasCustomizations && (
                <div className="animate-in fade-in flex items-center gap-1 duration-300">
                  <Sparkles size={14} className="text-purple-500 dark:text-purple-400" />
                  <span className="text-xs text-purple-600 dark:text-purple-400">{t('customized')}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Preview */}
            {hasCustomizations && (
              <div className="animate-in slide-in-from-right flex items-center gap-2 duration-300">
                <div
                  className="h-4 w-4 rounded border-2 border-white shadow-sm transition-transform hover:scale-110"
                  style={{
                    backgroundColor: customization.foregroundColor,
                  }}
                />
                {customization.logo && (
                  <div className="h-4 w-4 rounded border border-zinc-300 bg-zinc-100 p-0.5 dark:border-zinc-600 dark:bg-zinc-800">
                    <Image src={customization.logo} alt="Logo" className="h-full w-full rounded object-cover" />
                  </div>
                )}
                {customization.gradientEnabled && (
                  <div className="text-xs text-purple-600 dark:text-purple-400">{t('gradient')}</div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {isExpanded ? t('hide') : t('show')} {t('customization')}
              </span>
              <div className="transition-transform duration-200">
                {isExpanded ? (
                  <ChevronUp size={16} className="text-zinc-500 dark:text-zinc-400" />
                ) : (
                  <ChevronDown size={16} className="text-zinc-500 dark:text-zinc-400" />
                )}
              </div>
            </div>
          </div>
        </button>
      </div>

      {/* Collapsible Content */}
      <div
        className={cn(
          'transition-all duration-500 ease-in-out',
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 overflow-hidden opacity-0',
        )}
      >
        <div className="border-x border-b border-zinc-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
          {isExpanded && (
            <div className="grid gap-6 p-6 lg:grid-cols-3">
              {/* Customization Controls */}
              <div className="lg:col-span-2">
                <QrCustomizationPanel
                  customization={customization}
                  onCustomizationChange={onCustomizationChange}
                  isValid={isValid}
                />
              </div>

              {/* Enhanced Mini Preview */}
              <div className="lg:col-span-1">
                <div className="sticky top-[72px] z-10">
                  {qrUrl && isValid ? (
                    <div className="group rounded-xl border border-zinc-200 bg-gradient-to-br from-zinc-50/80 to-zinc-100/60 p-5 shadow-sm backdrop-blur-sm transition-all duration-500 hover:shadow-md dark:border-zinc-700 dark:from-zinc-800/60 dark:to-zinc-900/40">
                      {/* Header with animated icon */}
                      <div className="mb-4 flex items-center gap-2">
                        <div className="rounded-lg bg-purple-100 p-2 transition-colors group-hover:bg-purple-200 dark:bg-purple-900/30 dark:group-hover:bg-purple-800/40">
                          <Palette size={16} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <h4 className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{t('livePreview')}</h4>
                      </div>

                      {/* QR Preview with smooth transitions */}
                      <div className="flex justify-center">
                        <div
                          className="rounded-xl border-2 p-4 shadow-inner transition-all duration-500 ease-out"
                          style={{
                            backgroundColor: customization.backgroundColor,
                            borderColor: customization.foregroundColor + '30',
                            borderRadius: customization.borderRadius ? `${customization.borderRadius + 8}px` : '12px',
                          }}
                        >
                          <div className="relative overflow-hidden rounded-lg">
                            <Image
                              src={qrUrl}
                              alt="QR Preview"
                              className="h-36 w-36 transition-all duration-500 ease-out"
                              style={{
                                borderRadius: customization.borderRadius
                                  ? `${customization.borderRadius * 0.6}px`
                                  : '6px',
                                filter: customization.gradientEnabled ? 'contrast(1.1) saturate(1.1)' : 'none',
                              }}
                            />

                            {/* Logo Overlay with smooth animation */}
                            {customization.logo && (
                              <div
                                className="absolute top-[60%] left-[60%] -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white p-1 shadow-lg transition-all duration-300 ease-out"
                                style={{
                                  width: `${customization.logoSize}%`,
                                  height: `${customization.logoSize}%`,
                                  opacity: 1,
                                  transform: `translate(-50%, -50%) scale(1)`,
                                }}
                              >
                                <Image
                                  src={customization.logo}
                                  alt="Logo Preview"
                                  className="h-full w-full rounded object-contain transition-opacity duration-300"
                                />
                              </div>
                            )}

                            {/* Gradient overlay effect */}
                            {customization.gradientEnabled && (
                              <div
                                className="absolute inset-0 rounded-lg opacity-20 transition-opacity duration-500"
                                style={{
                                  background: `linear-gradient(${
                                    customization.gradientDirection === 'horizontal'
                                      ? 'to right'
                                      : customization.gradientDirection === 'vertical'
                                        ? 'to bottom'
                                        : customization.gradientDirection === 'diagonal'
                                          ? 'to bottom right'
                                          : 'radial-gradient(circle'
                                  }, ${customization.foregroundColor}40, transparent)`,
                                }}
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Enhanced Quick Info with animations */}
                      <div className="mt-4 space-y-2 rounded-lg bg-white/60 p-3 backdrop-blur-sm dark:bg-zinc-800/60">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-zinc-600 dark:text-zinc-400">{t('style')}:</span>
                          <span className="rounded bg-zinc-200 px-2 py-0.5 font-mono text-zinc-700 transition-colors dark:bg-zinc-700 dark:text-zinc-300">
                            {t(`corners.${customization.cornerStyle}`)}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-zinc-600 dark:text-zinc-400">{t('colors')}:</span>
                          <div className="flex items-center gap-1.5">
                            <div
                              className="h-4 w-4 rounded-full border-2 border-white shadow-sm transition-transform hover:scale-110"
                              style={{ backgroundColor: customization.foregroundColor }}
                              title={customization.foregroundColor}
                            />
                            <div
                              className="h-4 w-4 rounded-full border-2 border-white shadow-sm transition-transform hover:scale-110"
                              style={{ backgroundColor: customization.backgroundColor }}
                              title={customization.backgroundColor}
                            />
                          </div>
                        </div>

                        {customization.gradientEnabled && (
                          <div className="animate-in fade-in flex items-center justify-between text-xs duration-300">
                            <span className="font-medium text-zinc-600 dark:text-zinc-400">{t('gradient')}:</span>
                            <span className="rounded bg-purple-100 px-2 py-0.5 font-mono text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                              {t(`gradients.${customization.gradientDirection}`)}
                            </span>
                          </div>
                        )}

                        {customization.logo && (
                          <div className="animate-in fade-in flex items-center justify-between text-xs duration-300">
                            <span className="font-medium text-zinc-600 dark:text-zinc-400">{t('logo')}:</span>
                            <span className="rounded bg-green-100 px-2 py-0.5 font-mono text-green-700 dark:bg-green-900/30 dark:text-green-300">
                              {customization.logoSize}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-64 items-center justify-center rounded-xl border-2 border-dashed border-zinc-300 bg-gradient-to-br from-zinc-50/50 to-zinc-100/30 backdrop-blur-sm transition-all duration-300 hover:border-zinc-400 dark:border-zinc-600 dark:from-zinc-800/30 dark:to-zinc-900/20 dark:hover:border-zinc-500">
                      <div className="text-center text-zinc-500 dark:text-zinc-400">
                        <div className="mb-3 rounded-full bg-zinc-200/50 p-3 dark:bg-zinc-700/50">
                          <Palette size={24} className="mx-auto opacity-60" />
                        </div>
                        <p className="text-sm font-medium">{t('enterTextToPreview')}</p>
                        <p className="mt-1 text-xs opacity-75">Customize and see changes instantly</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions (when collapsed) */}
      {!isExpanded && hasCustomizations && (
        <div className="rounded-b-xl border border-t-0 border-zinc-200 bg-zinc-50/80 px-4 py-2 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
              <span>{t('activeCustomizations')}</span>
              {customization.foregroundColor !== '#000000' && (
                <span className="rounded bg-purple-100 px-2 py-0.5 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300">
                  {t('color')}
                </span>
              )}
              {customization.logo && (
                <span className="rounded bg-green-100 px-2 py-0.5 text-green-700 dark:bg-green-900/20 dark:text-green-300">
                  {t('logo')}
                </span>
              )}
              {customization.gradientEnabled && (
                <span className="rounded bg-blue-100 px-2 py-0.5 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                  {t('gradient')}
                </span>
              )}
              {customization.cornerStyle !== 'square' && (
                <span className="rounded bg-orange-100 px-2 py-0.5 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300">
                  {t('style')}
                </span>
              )}
            </div>

            <Button
              onClick={() => {
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
                  gradientEndColor: '#8b5cf6',
                })
              }}
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              {t('reset')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export default CollapsibleCustomizationPanel
