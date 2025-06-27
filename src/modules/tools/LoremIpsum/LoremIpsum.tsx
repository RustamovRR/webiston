'use client'

import { FileType, Copy, RefreshCw, Settings, Download, Check, Zap, Type } from 'lucide-react'
import {
  ToolHeader,
  UniversalDualPanel,
  createDisplayPanel,
  createCustomPanel,
  CopyButton,
  StatsDisplay,
} from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ShimmerButton, GradientTabs } from '@/components/ui'
import { useLoremIpsum } from '@/hooks/tools'

type GenerationType = 'paragraphs' | 'sentences' | 'words' | 'bytes'

export default function LoremIpsumPage() {
  const {
    generatedText,
    copied,
    settings,
    textInfo,
    alternativeTexts,
    textStats,
    generateText,
    clearText,
    loadSample,
    updateSettings,
    handleCopy,
    downloadText,
  } = useLoremIpsum()

  const generationTypeOptions = [
    {
      value: 'paragraphs',
      label: 'Paragraflar',
      icon: <Type size={16} />,
    },
    {
      value: 'sentences',
      label: 'Jumlalar',
      icon: <FileType size={16} />,
    },
    {
      value: 'words',
      label: "So'zlar",
      icon: <Settings size={16} />,
    },
    {
      value: 'bytes',
      label: 'Belgilar',
      icon: <Copy size={16} />,
    },
  ]

  const renderGeneratedTextContent = () => {
    if (!generatedText) {
      return (
        <div className="flex h-full items-center justify-center p-8 text-center">
          <div className="text-zinc-500">
            <Type size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-sm">Yaratilgan matn bu yerda ko'rinadi...</p>
            <p className="mt-2 text-xs opacity-75">Yuqoridagi 'Yangi matn yaratish' tugmasini bosing</p>
          </div>
        </div>
      )
    }

    return (
      <div className="absolute inset-0 h-full w-full overflow-y-auto p-4">
        <pre className="font-mono text-sm break-all whitespace-pre-wrap text-zinc-100">{generatedText}</pre>
      </div>
    )
  }

  const renderTextInfoContent = () => {
    if (!textInfo) {
      return (
        <div className="flex h-full items-center justify-center p-8 text-center">
          <div className="text-zinc-500">
            <FileType size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-sm">Matn ma'lumoti bu yerda ko'rinadi...</p>
            <p className="mt-2 text-xs opacity-75">Matn yaratilgandan keyin</p>
          </div>
        </div>
      )
    }

    return (
      <div className="absolute inset-0 h-full w-full overflow-y-auto p-4">
        <pre className="font-mono text-sm break-all whitespace-pre-wrap text-zinc-100">{textInfo}</pre>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <ToolHeader
        title="Lorem Ipsum Generator"
        description="Professional placeholder matn va paragraflar yaratish uchun zamonaviy vosita"
      />

      {/* Konfiguratsiya Panel */}
      <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
        {/* Panel Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-sm font-medium text-zinc-300">Tool Konfiguratsiya</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-zinc-500">Ready</span>
          </div>
        </div>

        {/* Panel Content */}
        <div className="p-6">
          {/* Quick Start */}
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-medium text-zinc-200">Tez boshlash</h3>
              <p className="text-sm text-zinc-400">
                Standart Lorem Ipsum bilan boshlang yoki sozlamalarni o'zgartiring
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={loadSample} variant="outline" size="sm">
                <FileType className="mr-2 h-4 w-4" />
                Namuna yuklash
              </Button>
            </div>
          </div>

          {/* Generation Type */}
          <div className="mb-6 space-y-4">
            <h3 className="text-sm font-medium text-zinc-300">Yaratish turi:</h3>
            <GradientTabs
              options={generationTypeOptions}
              value={settings.generationType}
              onChange={(value: string) => updateSettings({ generationType: value as GenerationType })}
              toolCategory="utilities"
            />
          </div>

          {/* Settings Grid */}
          <div className="mb-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* Amount Setting */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-200">Miqdor: {settings.amount}</label>
              <Input
                type="number"
                min="1"
                max="1000"
                value={settings.amount}
                onChange={(e) => updateSettings({ amount: parseInt(e.target.value) || 1 })}
                className="border-zinc-700 bg-zinc-800/50"
              />
              <p className="mt-1 text-xs text-zinc-500">1 dan 1000 gacha</p>
            </div>

            {/* Text Type */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-200">Matn turi</label>
              <Select value={settings.textType} onValueChange={(value) => updateSettings({ textType: value })}>
                <SelectTrigger className="border-zinc-700 bg-zinc-800/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(alternativeTexts).map(([key, data]) => (
                    <SelectItem key={key} value={key}>
                      {data.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Lorem Checkbox */}
            {settings.textType === 'cicero' && (
              <div className="flex items-center gap-3 md:col-span-2">
                <input
                  type="checkbox"
                  id="startWithLorem"
                  checked={settings.startWithLorem}
                  onChange={(e) => updateSettings({ startWithLorem: e.target.checked })}
                  className="rounded border-zinc-700 bg-zinc-800 accent-blue-500"
                />
                <label htmlFor="startWithLorem" className="text-sm text-zinc-200">
                  "Lorem ipsum" bilan boshlash
                </label>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <ShimmerButton onClick={generateText} size="sm">
              <Type className="mr-2 h-4 w-4" />
              Yangi matn yaratish
            </ShimmerButton>

            {generatedText && (
              <div className="flex items-center gap-2">
                <Button onClick={handleCopy} variant="outline" size="sm">
                  {copied ? <Check size={16} className="mr-2 text-green-500" /> : <Copy size={16} className="mr-2" />}
                  {copied ? 'Nusxalandi!' : 'Nusxalash'}
                </Button>

                <Button onClick={downloadText} variant="outline" size="sm">
                  <Download size={16} className="mr-2" />
                  Yuklab olish
                </Button>

                <Button onClick={clearText} variant="outline" size="sm">
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Tozalash
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Display */}
      {generatedText && <StatsDisplay stats={textStats} className="mb-6" />}

      {/* Main Panel */}
      <UniversalDualPanel
        sourcePanel={createCustomPanel(
          'Yaratilgan matn',
          renderGeneratedTextContent(),
          generatedText ? { type: 'success', message: 'Generated' } : { type: 'ready' },
          generatedText ? textStats : undefined,
          <CopyButton text={generatedText} disabled={!generatedText} />,
        )}
        targetPanel={createCustomPanel(
          "Matn ma'lumoti",
          renderTextInfoContent(),
          textInfo ? { type: 'success', message: 'Generated' } : { type: 'ready' },
          undefined,
        )}
        variant="terminal"
      />

      {/* Yordam va ma'lumot bo'limi */}
      <div className="mt-8 rounded-xl border border-zinc-800/30 bg-zinc-900/60 p-6 backdrop-blur-sm">
        <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-100">
          <Type size={20} className="text-indigo-400" />
          Lorem Ipsum haqida ma'lumot
        </h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
              <div className="h-2 w-2 rounded-full bg-blue-400"></div>
              Lorem Ipsum nima?
            </h4>
            <p className="text-sm leading-relaxed text-zinc-400">
              Lorem Ipsum - matn va grafik dizayn sanoatida placeholder sifatida ishlatiladigan standart dummy matn.
              1500-yillardan beri ishlatilmoqda.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
              Nima uchun ishlatiladi?
            </h4>
            <ul className="space-y-1 text-sm text-zinc-400">
              <li>• Dizayn prototipleshtirish</li>
              <li>• Matn joylashuvini ko'rsatish</li>
              <li>• Diqqatni tarkibdan chalg'itmaslik</li>
              <li>• Professional ko'rinish berish</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
              <div className="h-2 w-2 rounded-full bg-purple-400"></div>
              Foydalanish sohalari
            </h4>
            <ul className="space-y-1 text-sm text-zinc-400">
              <li>• Web dizayn va development</li>
              <li>• Grafik dizayn loyihalari</li>
              <li>• Nashriyot va matbuot</li>
              <li>• Prototiplash va mockup</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
