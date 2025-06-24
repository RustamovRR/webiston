'use client'

import { FileType, Copy, RefreshCw, Settings, Download, Check, Zap, Type } from 'lucide-react'
import { ToolHeader, StatsDisplay } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ShimmerButton, GradientTabs } from '@/components/ui'
import { DualTextPanel } from '@/components/shared/DualTextPanel'
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
      <DualTextPanel
        sourceText={generatedText}
        convertedText={textInfo}
        sourcePlaceholder="Yuqoridagi 'Yangi matn yaratish' tugmasini bosing..."
        sourceLabel="Yaratilgan matn"
        targetLabel="Matn ma'lumoti"
        onSourceChange={(text) => {
          // Allow manual editing if needed
        }}
        variant="terminal"
        showSwapButton={false}
        showClearButton={false}
      />

      {/* Ma'lumot Section */}
      <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/80 p-6 backdrop-blur-sm">
        <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-100">
          <Zap size={20} className="text-blue-400" />
          Matn turlari haqida
        </h3>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg bg-blue-500/10 p-4">
            <div className="mb-2 font-medium text-blue-400">Cicero (Klasik)</div>
            <div className="text-sm text-zinc-400">
              Asl Lorem Ipsum matni, klassik dizayn va maket uchun eng mashhur variant
            </div>
          </div>

          <div className="rounded-lg bg-orange-500/10 p-4">
            <div className="mb-2 font-medium text-orange-400">Bacon Ipsum</div>
            <div className="text-sm text-zinc-400">
              Go'sht va ovqat atamalaridan tashkil topgan mazali va qiziqarli matn variant
            </div>
          </div>

          <div className="rounded-lg bg-purple-500/10 p-4">
            <div className="mb-2 font-medium text-purple-400">Hipster Ipsum</div>
            <div className="text-sm text-zinc-400">
              Zamonaviy va trendy so'zlar bilan yaratilgan, kreativ loyihalar uchun
            </div>
          </div>

          <div className="rounded-lg bg-pink-500/10 p-4">
            <div className="mb-2 font-medium text-pink-400">Cupcake Ipsum</div>
            <div className="text-sm text-zinc-400">
              Shirinlik va desert nomlari bilan, qiziqarli va shirin matn turi
            </div>
          </div>

          {alternativeTexts.uzbek && (
            <div className="rounded-lg bg-green-500/10 p-4 md:col-span-2 lg:col-span-2">
              <div className="mb-2 font-medium text-green-400">O'zbek Lorem</div>
              <div className="text-sm text-zinc-400">
                O'zbek tilida texnologiya va dasturlash sohasidagi so'zlar bilan yaratilgan maxsus variant
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-8 rounded-xl border border-zinc-800 bg-zinc-900/80 p-6 backdrop-blur-sm">
        <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-100">
          <Settings size={20} className="text-green-400" />
          Lorem Ipsum nima uchun ishlatiladi?
        </h3>

        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h4 className="mb-3 font-medium text-zinc-200">Asosiy foydalanish joylari:</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                <strong>Web dizayn:</strong> Sahifa maketlarini yaratishda
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                <strong>Grafik dizayn:</strong> Buklet va poster dizaynida
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                <strong>Typography:</strong> Shrift va matn ko'rinishini sinovdan o'tkazishda
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                <strong>Prototyping:</strong> Loyiha prototiplarida
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-cyan-500"></div>
                <strong>Testing:</strong> Kontent-independent sinovlarda
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-pink-500"></div>
                <strong>Placeholder:</strong> Haqiqiy kontent tayyor bo'lgunga qadar
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-3 font-medium text-zinc-200">Professional maslahatlar:</h4>
            <ul className="space-y-2 text-sm text-zinc-400">
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                Haqiqiy kontentning taxminiy uzunligini hisobga oling
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                Turli xil matn uzunliklarini sinab ko'ring
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-purple-500"></div>
                Responsive dizayn uchun turli ekran o'lchamlarida tekshiring
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                Mijoz uchun munosib matn turi tanlang
              </li>
              <li className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-cyan-500"></div>
                Matn hierarxiyasini to'g'ri tuzish uchun ishlatib ko'ring
              </li>
            </ul>

            <div className="mt-4 rounded-lg bg-blue-500/10 p-3">
              <div className="text-sm text-blue-400">
                <strong>Maslahat:</strong> Lorem Ipsum mazmundan chalg'itmasdan dizayn elementlariga e'tibor qaratish
                imkonini beradi va professional natijaga erishishga yordam beradi.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
