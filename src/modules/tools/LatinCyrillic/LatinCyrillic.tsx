'use client'

import React from 'react'
import { FileText, ArrowLeftRight, X, ChevronDown, Download } from 'lucide-react'

// UI Components
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ShimmerButton, GradientTabs } from '@/components/ui'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Card } from '@/components/ui/card'

// Shared Components
import { ToolHeader } from '@/components/shared/ToolHeader'
import { CopyButton } from '@/components/shared/CopyButton'
import { StatsDisplay } from '@/components/shared/StatsDisplay'

// Utils & Hooks
import { useLatinCyrillic } from '@/hooks/tools/useLatinCyrillic'
import { SectionTitle } from '@/components'
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Kirish paneli */}
        <div className="flex flex-col rounded-xl border border-zinc-800/50 bg-zinc-900/80 shadow-2xl backdrop-blur-sm">
          <div className="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-800/50 px-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500/80"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500/80"></div>
              <div className="h-3 w-3 rounded-full bg-green-500/80"></div>
              <span className="ml-2 text-lg font-semibold text-zinc-100">{sourceLang} Matn Kirish</span>
            </div>
            <div className="text-xs text-zinc-400">
              {sourceText.length > 0 && (
                <span className="flex items-center gap-1 text-blue-400">
                  <div className="h-1.5 w-1.5 rounded-full bg-blue-400"></div>
                  O'girishga tayyor
                </span>
              )}
            </div>
          </div>

          <div className="relative flex-grow" style={{ minHeight: '500px', maxHeight: '500px' }}>
            <Textarea
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              className="absolute inset-0 h-full w-full resize-none border-0 bg-transparent p-4 font-mono text-sm text-zinc-50 placeholder:text-zinc-500 focus:ring-0"
              placeholder={sourcePlaceholder}
            />
          </div>

          <div className="flex items-center justify-between border-t border-zinc-800 bg-zinc-800/30 px-4 py-3">
            <StatsDisplay stats={inputStats} />
          </div>
        </div>

        {/* Swap Button - Markazda */}
        <div className="relative lg:absolute lg:top-1/2 lg:left-1/2 lg:z-10 lg:-translate-x-1/2 lg:-translate-y-1/2">
          <div className="flex justify-center lg:justify-start">
            <ShimmerButton
              onClick={handleSwap}
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-full border-2 border-zinc-700 bg-zinc-900/90 shadow-xl backdrop-blur-sm hover:border-indigo-500/50 hover:bg-zinc-800/90"
              title="Yo'nalishni almashtirish"
            >
              <ArrowLeftRight size={20} className="text-zinc-300" />
            </ShimmerButton>
          </div>
        </div>

        {/* Chiqish paneli */}
        <div className="flex flex-col rounded-xl border border-zinc-800/50 bg-zinc-900/80 shadow-2xl backdrop-blur-sm">
          <div className="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-800/50 px-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500/80"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500/80"></div>
              <div className="h-3 w-3 rounded-full bg-green-500/80"></div>
              <span className="ml-2 text-lg font-semibold text-zinc-100">{targetLang} Natija</span>
            </div>
            <CopyButton text={convertedText} disabled={!convertedText} />
          </div>

          <div className="relative flex-grow" style={{ minHeight: '500px', maxHeight: '500px' }}>
            <div className="absolute inset-0 h-full w-full overflow-y-auto">
              {convertedText ? (
                <div className="p-4">
                  <pre className="font-mono text-sm break-all whitespace-pre-wrap text-zinc-100">{convertedText}</pre>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center p-8 text-center">
                  <div className="text-zinc-500">
                    <FileText size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-sm">O'girilgan matn bu yerda ko'rinadi...</p>
                    <p className="mt-2 text-xs opacity-75">Matn kiriting yoki namuna yuklang</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between border-t border-zinc-800 bg-zinc-800/30 px-4 py-3">
            <StatsDisplay stats={outputStats} />
            {convertedText && (
              <div className="text-xs text-zinc-400">
                <span className="text-zinc-500">Alifbo:</span> <span className="text-zinc-300">{targetLang}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Section - Card Based Layout */}
      <div className="mt-12">
        <SectionTitle
          icon={<FileText className="h-6 w-6" />}
          title="Lotin-Kirill Alifbosi Haqida"
          description="O'zbek tilida yozish uchun zarur bo'lgan ma'lumotlar"
        />

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Lotin Alifbosi */}
          <Card className="border-zinc-800/30 bg-zinc-900/60 backdrop-blur-sm">
            <div className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/20">
                  <FileText className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white">Lotin Alifbosi</h3>
              </div>
              <p className="mb-4 leading-relaxed text-zinc-400">
                O'zbek tilida 1992-yildan beri rasmiy ravishda ishlatilayotgan yozuv tizimi.
              </p>
              <div className="space-y-2 text-sm">
                <p className="text-zinc-300">
                  <strong>Harflar soni:</strong> 29 ta
                </p>
                <p className="text-zinc-300">
                  <strong>Maxsus belgilar:</strong> o', g', sh, ch, ng
                </p>
                <p className="text-zinc-300">
                  <strong>Xususiyat:</strong> Kompyuterda yozish uchun qulay
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
                <h3 className="text-xl font-semibold text-white">Кирилл Алифбоси</h3>
              </div>
              <p className="mb-4 leading-relaxed text-zinc-400">
                Совет даврида ишлатилган ва ҳозирда ҳам баъзи соҳаларда қўлланилади.
              </p>
              <div className="space-y-2 text-sm">
                <p className="text-zinc-300">
                  <strong>Ҳарфлар сони:</strong> 35 та
                </p>
                <p className="text-zinc-300">
                  <strong>Махсус ҳарфлар:</strong> ў, ғ, қ, ҳ
                </p>
                <p className="text-zinc-300">
                  <strong>Хусусият:</strong> Рус тилига яқин
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
                <h3 className="text-xl font-semibold text-white">O'girish Qoidalari</h3>
              </div>
              <div className="space-y-3 text-sm leading-relaxed text-zinc-400">
                <div>
                  <p className="font-medium text-zinc-300">Lotin → Kirill:</p>
                  <p>o' → ў, g' → ғ, sh → ш, ch → ч</p>
                </div>
                <div>
                  <p className="font-medium text-zinc-300">Kirill → Lotin:</p>
                  <p>ў → o', ғ → g', ш → sh, ч → ch</p>
                </div>
                <p className="mt-3 text-xs">Avtomatik o'girish 99.9% aniqlikda ishlaydi.</p>
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
                <h3 className="text-xl font-semibold text-white">Tarixiy Ma'lumot</h3>
              </div>
              <div className="space-y-2 text-sm leading-relaxed text-zinc-400">
                <p>
                  <strong className="text-zinc-300">1928-1940:</strong> Lotin alifbosi
                </p>
                <p>
                  <strong className="text-zinc-300">1940-1992:</strong> Kirill alifbosi
                </p>
                <p>
                  <strong className="text-zinc-300">1992-hozir:</strong> Lotin alifbosi
                </p>
                <p className="mt-3 text-xs">O'zbekiston mustaqillik olganidan keyin lotin alifbosiga qaytildi.</p>
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
                <h3 className="text-xl font-semibold text-white">Qo'llanish</h3>
              </div>
              <div className="space-y-2 text-sm leading-relaxed text-zinc-400">
                <p>
                  <strong className="text-zinc-300">Lotin:</strong> Rasmiy hujjatlar, ta'lim
                </p>
                <p>
                  <strong className="text-zinc-300">Kirill:</strong> Adabiyot, arxiv
                </p>
                <p>
                  <strong className="text-zinc-300">Aralash:</strong> Internet, ijtimoiy tarmoqlar
                </p>
                <p className="mt-3 text-xs">Ikki alifbo ham o'z o'rniga ega va muhim.</p>
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
                <h3 className="text-xl font-semibold text-white">Maslahatlar</h3>
              </div>
              <div className="space-y-2 text-sm leading-relaxed text-zinc-400">
                <p>• Matnni to'liq kiritib, keyin o'giring</p>
                <p>• Namuna matnlardan foydalaning</p>
                <p>• Natijani tekshirib ko'ring</p>
                <p>• Fayl sifatida saqlash mumkin</p>
                <p className="mt-3 text-xs">Professional natijalar uchun matnni diqqat bilan tayyorlang.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
