'use client'

import React from 'react'
import { FileText, ArrowLeftRight, X, ChevronDown, Download } from 'lucide-react'

// UI Components
import { Button } from '@/components/ui/button'
import { ShimmerButton, GradientTabs } from '@/components/ui'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

// Shared Components
import {
  ToolHeader,
  UniversalDualPanel,
  createTextInputPanel,
  createDisplayPanel,
  CopyButton,
} from '@/components/shared'

// Utils & Hooks
import { useLatinCyrillic } from '@/hooks/tools/useLatinCyrillic'
import { countWords } from '@/lib/utils'

export default function LatinCyrillicPage() {
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
      "# Lotin-Kirill O'giruvchi - Natija",
      '',
      `Yaratilgan: ${new Date().toLocaleString()}`,
      `Yo'nalish: ${sourceLang} → ${targetLang}`,
      '',
      '## Asl matn:',
      sourceText,
      '',
      "## O'girilgan matn:",
      convertedText,
      '',
      '---',
      '',
      "Webiston.uz - Lotin-Kirill O'giruvchi tomonidan yaratilgan",
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
    { value: 'latin-to-cyrillic', label: 'Lotin → Kirill', icon: <ArrowLeftRight size={16} /> },
    { value: 'cyrillic-to-latin', label: 'Kirill → Lotin', icon: <ArrowLeftRight size={16} className="rotate-180" /> },
  ]

  const inputStats = [
    { label: 'belgi', value: sourceText.length },
    { label: "so'z", value: countWords(sourceText) },
    { label: 'qator', value: sourceText.split('\n').length },
  ]

  const outputStats = [
    { label: 'belgi', value: convertedText.length },
    { label: "so'z", value: countWords(convertedText) },
    { label: 'qator', value: convertedText.split('\n').length },
  ]

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <ToolHeader
        title="Lotin-Kirill O'giruvchi"
        description="O'zbek tilidagi matnlarni lotinchadan kirillchaga va aksincha o'girish vositasi"
      />

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
                  Namuna matnlar
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
              Tozalash
            </Button>

            {/* Download */}
            <ShimmerButton
              onClick={downloadResult}
              disabled={!convertedText}
              variant={convertedText ? 'default' : 'outline'}
              size="sm"
            >
              <Download size={16} className="mr-2" />
              Yuklab olish
            </ShimmerButton>
          </div>
        </div>
      </div>

      <UniversalDualPanel
        sourcePanel={createTextInputPanel(
          `${sourceLang} Matn Kirish`,
          sourceText,
          setSourceText,
          sourcePlaceholder,
          sourceText.length > 0 ? { type: 'valid', message: "O'girishga tayyor" } : { type: 'ready' },
          inputStats,
        )}
        targetPanel={createDisplayPanel(
          `${targetLang} Natija`,
          convertedText,
          convertedText.length > 0 ? { type: 'success' } : { type: 'ready' },
          outputStats,
          undefined,
          {
            icon: <FileText size={48} className="mx-auto mb-4 opacity-50" />,
            message: `${targetLang}cha matn bu yerda ko'rinadi...`,
            subMessage: 'Matn kiriting',
          },
          undefined,
          <CopyButton text={convertedText} disabled={!convertedText} />,
        )}
        swapConfig={{
          show: true,
          onClick: handleSwap,
          disabled: !convertedText,
          icon: <ArrowLeftRight size={20} className="text-zinc-300" />,
        }}
        variant="terminal"
      />

      {/* Yordam va ma'lumot bo'limi */}
      <div className="mt-8 rounded-xl border border-zinc-800/30 bg-zinc-900/60 p-6 backdrop-blur-sm">
        <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-100">
          <FileText size={20} className="text-indigo-400" />
          Lotin-Kirill O'giruvchi haqida
        </h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
              <div className="h-2 w-2 rounded-full bg-blue-400"></div>
              Nima uchun kerak?
            </h4>
            <p className="text-sm leading-relaxed text-zinc-400">
              O'zbek tilidagi matnlarni lotin va kirill yozuvlari o'rtasida o'girish uchun. Rasmiy hujjatlar, web
              saytlar va shaxsiy foydalanish uchun qulay.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
              Xususiyatlari
            </h4>
            <ul className="space-y-1 text-sm text-zinc-400">
              <li>• Real vaqtda o'girish</li>
              <li>• To'g'ri harflar moslamasi</li>
              <li>• Ikki tomonlama konvertatsiya</li>
              <li>• Uzun matnlar bilan ishlash</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
              <div className="h-2 w-2 rounded-full bg-purple-400"></div>
              Qo'llanish
            </h4>
            <ul className="space-y-1 text-sm text-zinc-400">
              <li>• Hujjatlar tayyorlash</li>
              <li>• Web kontent o'girish</li>
              <li>• Ta'lim materiallar</li>
              <li>• Shaxsiy xatlar</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
