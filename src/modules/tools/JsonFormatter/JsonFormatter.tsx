'use client'

import { Download, Upload, FileJson, Eye, EyeOff, X } from 'lucide-react'

// UI Components
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { CodeHighlight, ShimmerButton } from '@/components/ui'

// Shared Components
import {
  CopyButton,
  createCustomPanel,
  createTextInputPanel,
  ToolHeader,
  UniversalDualPanel,
} from '@/components/shared'

// Local Components
import { JsonInputPanel, JsonOutputPanel } from './components'

// Utils & Hooks
import { countWords } from '@/lib/utils'
import { useJsonFormatter } from '@/hooks/tools/useJsonFormatter'

const JsonFormatter = () => {
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

  const renderJsonDisplay = () => {
    if (jsonResult.error && !jsonResult.isValid) {
      return (
        <div className="p-4">
          <div className="rounded-lg border border-red-800/30 bg-red-900/20 p-4">
            <div className="mb-2 flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-red-400"></div>
              <strong className="text-sm text-red-400">JSON Format Xatoligi</strong>
            </div>
            <p className="font-mono text-sm text-red-300">{jsonResult.error}</p>
          </div>
        </div>
      )
    }

    if (!displayJson) {
      return (
        <div className="flex h-full items-center justify-center p-8 text-center">
          <div className="text-zinc-500">
            <FileJson size={48} className="mx-auto mb-4 opacity-50" />
            <p className="text-sm">Formatlangan JSON bu yerda ko'rinadi...</p>
            <p className="mt-2 text-xs opacity-75">JSON kiriting yoki fayl yuklang</p>
          </div>
        </div>
      )
    }

    return (
      <div className="absolute inset-0 h-full w-full overflow-hidden">
        <CodeHighlight language="json" code={displayJson} showLineNumbers={showLineNumbers} className="h-full" />
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <ToolHeader
        title="JSON Formatlash va Tekshirish"
        description="JSON ma'lumotlarni formatlash, tekshirish va optimallashtirish vositasi"
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
              Namuna JSON
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
              className={`text-sm transition-colors ${isMinified ? 'text-orange-400 hover:text-orange-300' : 'text-zinc-400 hover:text-zinc-200'}`}
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

      <UniversalDualPanel
        sourcePanel={createTextInputPanel(
          'JSON Kirish',
          inputJson,
          setInputJson,
          "JSON ma'lumotlaringizni bu yerga kiriting yoki fayl yuklang...",
          inputJson.length > 0
            ? jsonResult.isValid
              ? { type: 'valid', message: "To'g'ri format" }
              : { type: 'error', message: 'Xatolik mavjud' }
            : { type: 'ready' },
          inputStats,
        )}
        targetPanel={createCustomPanel(
          isMinified ? 'Siqilgan JSON' : 'Formatlangan JSON',
          renderJsonDisplay(),
          jsonResult.isValid ? { type: 'success' } : { type: 'ready' },
          outputStats,
          <div className="flex items-center gap-3">
            {displayJson && (
              <>
                <span className="text-zinc-500">Hajm:</span>
                <span className="text-zinc-300">{fileSizeKB} KB</span>
              </>
            )}
            <CopyButton text={displayJson} disabled={!jsonResult.isValid} />
          </div>,
        )}
        variant="terminal"
      />

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
              JSON (JavaScript Object Notation) - ma'lumotlarni almashish uchun yengil format. Insonlar oson o'qiydi va
              yozadi, mashinalar esa oson tahlil qiladi.
            </p>
          </div>
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
              <div className="h-2 w-2 rounded-full bg-green-400"></div>
              Afzalliklari
            </h4>
            <ul className="space-y-1 text-sm text-zinc-400">
              <li>• Yengil va tez</li>
              <li>• Ko'p tillar qo'llab-quvvatlaydi</li>
              <li>• Odam o'qiydi</li>
              <li>• Standart format</li>
            </ul>
          </div>
          <div className="space-y-3">
            <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
              <div className="h-2 w-2 rounded-full bg-purple-400"></div>
              Qo'llanish
            </h4>
            <ul className="space-y-1 text-sm text-zinc-400">
              <li>• API javoblari</li>
              <li>• Konfiguratsiya fayllari</li>
              <li>• Ma'lumotlar bazasi</li>
              <li>• Veb ilovalar</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JsonFormatter
