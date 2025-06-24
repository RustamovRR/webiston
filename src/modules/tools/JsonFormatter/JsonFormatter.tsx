'use client'

import { Download, Upload, FileJson, Eye, EyeOff, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToolHeader } from '@/components/shared/ToolHeader'
import { CopyButton } from '@/components/shared/CopyButton'
import { StatsDisplay } from '@/components/shared/StatsDisplay'
import { countWords } from '@/lib/utils'
import { CodeHighlight, ShimmerButton } from '@/components/ui'
import { useJsonFormatter } from '@/hooks/tools/useJsonFormatter'

const sampleJson = {
  foydalanuvchi: {
    id: 1,
    ism: 'Ali Valiyev',
    email: 'ali@example.com',
    yosh: 30,
    manzil: {
      viloyat: 'Toshkent',
      tuman: 'Chilonzor',
      "ko'cha": "Amir Temur ko'chasi",
      uy: '15',
    },
    telefon: ['+998901234567', '+998712345678'],
    faol: true,
    "ro'yxatdanOtganSana": '2024-01-15T10:30:00Z',
    sozlamalar: {
      til: 'uz',
      xabarNomalar: true,
      "qorong'uRejim": false,
    },
  },
}

const JSONFormatter = () => {
  const {
    inputJson,
    setInputJson,
    indentation,
    setIndentation,
    showLineNumbers,
    isMinified,
    jsonResult,
    handleFileUpload,
    loadSampleJson,
    downloadResult,
    clearInput,
    toggleMinify,
    toggleLineNumbers,
  } = useJsonFormatter()

  const displayJson = isMinified ? jsonResult.minified : jsonResult.formatted

  const inputStats = [
    { label: 'belgi', value: inputJson.length },
    { label: "so'z", value: countWords(inputJson) },
    { label: 'qator', value: inputJson.split('\n').length },
  ]

  const outputStats = [
    { label: 'belgi', value: displayJson.length },
    { label: "so'z", value: countWords(displayJson) },
    { label: 'qator', value: displayJson.split('\n').length },
  ]

  const fileSizeKB = Math.round((displayJson.length / 1024) * 100) / 100

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <ToolHeader
        title="JSON Formatlash"
        description="JSON ma'lumotlarni formatlash, tasdiqlash va optimallashtirish vositasi"
      />

      {/* Boshqaruv paneli */}
      <div className="mb-6 rounded-lg bg-zinc-900/60 p-4 backdrop-blur-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            {/* Kirish amallari */}
            <span className="text-sm font-medium text-zinc-400">Amallar:</span>
            <input type="file" accept=".json,.txt" onChange={handleFileUpload} className="hidden" id="file-upload" />
            <Button variant="outline" size="sm" asChild>
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload size={16} className="mr-2" />
                Fayl yuklash
              </label>
            </Button>
            <ShimmerButton onClick={loadSampleJson} variant="outline" size="sm">
              <FileJson size={16} className="mr-2" />
              Namuna
            </ShimmerButton>
            <Button variant="ghost" size="sm" onClick={clearInput}>
              <X size={16} className="mr-2" />
              Tozalash
            </Button>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Sozlamalar */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-300">Chekinish:</span>
              <Select value={indentation} onValueChange={setIndentation}>
                <SelectTrigger className="w-20 border-zinc-700 bg-zinc-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2</SelectItem>
                  <SelectItem value="4">4</SelectItem>
                  <SelectItem value="8">8</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLineNumbers}
              className="text-zinc-400 hover:text-zinc-200"
              title={showLineNumbers ? 'Qator raqamlarini yashirish' : "Qator raqamlarini ko'rsatish"}
            >
              {showLineNumbers ? <EyeOff size={16} /> : <Eye size={16} />}
              <span className="ml-2 hidden sm:inline">Qator №</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMinify}
              className={`text-sm ${isMinified ? 'text-orange-400' : 'text-zinc-400'}`}
              title={isMinified ? "Kengaytirilgan ko'rinish" : "Siqilgan ko'rinish"}
            >
              {isMinified ? 'Kengaytirilgan' : 'Siqilgan'}
            </Button>

            {/* Yuklab olish */}
            <ShimmerButton
              onClick={downloadResult}
              disabled={!jsonResult.isValid}
              variant={jsonResult.isValid ? 'default' : 'outline'}
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
              <span className="ml-2 text-lg font-semibold text-zinc-100">Kirish</span>
            </div>
            <div className="text-xs text-zinc-400">
              {inputJson.length > 0 &&
                (jsonResult.isValid ? (
                  <span className="text-green-400">✓ To'g'ri format</span>
                ) : (
                  <span className="text-red-400">✗ Xatolik mavjud</span>
                ))}
            </div>
          </div>

          <div className="relative flex-grow" style={{ minHeight: '500px', maxHeight: '500px' }}>
            <Textarea
              value={inputJson}
              onChange={(e) => setInputJson(e.target.value)}
              className="absolute inset-0 h-full w-full resize-none border-0 bg-transparent p-4 font-mono text-sm text-zinc-50 placeholder:text-zinc-500 focus:ring-0"
              placeholder="JSON ma'lumotlaringizni bu yerga kiriting yoki fayl yuklang..."
            />
          </div>

          <div className="flex items-center justify-between border-t border-zinc-800 bg-zinc-800/30 px-4 py-3">
            <StatsDisplay stats={inputStats} />
            {!jsonResult.isValid && jsonResult.error && (
              <div className="text-right">
                <p className="font-mono text-xs text-red-400">{jsonResult.error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Chiqish paneli */}
        <div className="flex flex-col rounded-xl border border-zinc-800/50 bg-zinc-900/80 shadow-2xl backdrop-blur-sm">
          <div className="flex h-16 items-center justify-between border-b border-zinc-800 bg-zinc-800/50 px-4">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500/80"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500/80"></div>
              <div className="h-3 w-3 rounded-full bg-green-500/80"></div>
              <span className="ml-2 text-lg font-semibold text-zinc-100">
                {isMinified ? 'Siqilgan natija' : 'Formatlangan natija'}
              </span>
            </div>
            <CopyButton text={displayJson} disabled={!jsonResult.isValid} />
          </div>

          <div className="relative flex-grow" style={{ minHeight: '500px', maxHeight: '500px' }}>
            <div className="absolute inset-0 h-full w-full overflow-y-auto">
              {jsonResult.error && !jsonResult.isValid ? (
                <div className="p-4">
                  <div className="rounded-lg border border-red-800/30 bg-red-900/20 p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-400"></div>
                      <strong className="text-sm text-red-400">JSON Format Xatoligi</strong>
                    </div>
                    <p className="font-mono text-sm text-red-300">{jsonResult.error}</p>
                  </div>
                </div>
              ) : displayJson ? (
                <CodeHighlight code={displayJson} language="json" showLineNumbers={showLineNumbers} />
              ) : (
                <div className="flex h-full items-center justify-center p-8 text-center">
                  <div className="text-zinc-500">
                    <FileJson size={48} className="mx-auto mb-4 opacity-50" />
                    <p className="text-sm">Formatlangan JSON bu yerda ko'rinadi...</p>
                    <p className="mt-2 text-xs opacity-75">JSON kiriting yoki fayl yuklang</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between border-t border-zinc-800 bg-zinc-800/30 px-4 py-3">
            <StatsDisplay stats={outputStats} />
            {displayJson && (
              <div className="text-xs text-zinc-400">
                <span className="text-zinc-500">Hajm:</span> <span className="text-zinc-300">{fileSizeKB} KB</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Yordam va ma'lumot bo'limi */}
      <div className="mt-8 rounded-xl border border-zinc-800/30 bg-zinc-900/60 p-6 backdrop-blur-sm">
        <h3 className="mb-6 flex items-center gap-2 text-xl font-bold text-zinc-100">
          <FileJson size={20} className="text-indigo-400" />
          JSON haqida ma'lumot
        </h3>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
              <div className="h-2 w-2 rounded-full bg-blue-400"></div>
              JSON nima?
            </h4>
            <p className="text-sm leading-relaxed text-zinc-400">
              JSON (JavaScript Object Notation) - ma'lumotlarni saqlash va uzatish uchun yengil va tushunarli format.
              Zamonaviy veb-ilovalar va API larda keng qo'llaniladi.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
              Asosiy xususiyatlari
            </h4>
            <ul className="space-y-1 text-sm text-zinc-400">
              <li>• Odam o'qishi oson format</li>
              <li>• Til mustaqil standart</li>
              <li>• Kichik hajm va tez ishlov</li>
              <li>• Keng qo'llab-quvvatlash</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
              <div className="h-2 w-2 rounded-full bg-purple-400"></div>
              Qo'llanish sohalari
            </h4>
            <ul className="space-y-1 text-sm text-zinc-400">
              <li>• API javoblari va so'rovlari</li>
              <li>• Konfiguratsiya fayllari</li>
              <li>• Ma'lumotlar bazasi eksport</li>
              <li>• Veb ilovalar uchun ma'lumot uzatish</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JSONFormatter
