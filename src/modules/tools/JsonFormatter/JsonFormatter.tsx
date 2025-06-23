'use client'

import { useState, useMemo } from 'react'
import { Download, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToolHeader } from '@/components/shared/ToolHeader'
import { CopyButton } from '@/components/shared/CopyButton'
import { StatsDisplay } from '@/components/shared/StatsDisplay'
import { countWords } from '@/lib/utils'

const JSONFormatter = () => {
  const [inputJson, setInputJson] = useState('')
  const [indentation, setIndentation] = useState('2')

  const jsonResult = useMemo(() => {
    if (!inputJson.trim()) {
      return { formatted: '', error: '', isValid: false }
    }

    try {
      const parsed = JSON.parse(inputJson)
      const formatted = JSON.stringify(parsed, null, parseInt(indentation))
      return { formatted, error: '', isValid: true }
    } catch (error) {
      return {
        formatted: '',
        error: error instanceof Error ? error.message : "Noto'g'ri JSON format",
        isValid: false,
      }
    }
  }, [inputJson, indentation])

  const inputStats = [
    { label: 'belgi', value: inputJson.length },
    { label: "so'z", value: countWords(inputJson) },
    { label: 'qator', value: inputJson.split('\n').length },
  ]

  const outputStats = [
    { label: 'belgi', value: jsonResult.formatted.length },
    { label: "so'z", value: countWords(jsonResult.formatted) },
    { label: 'qator', value: jsonResult.formatted.split('\n').length },
  ]

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        setInputJson(content)
      }
      reader.readAsText(file)
    }
  }

  const downloadResult = () => {
    if (!jsonResult.formatted) return

    const blob = new Blob([jsonResult.formatted], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'formatted.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4">
      <ToolHeader title="JSON Formatlash" description="JSON ma'lumotlarni formatlash va tasdiqlash vositasi" />

      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input type="file" accept=".json,.txt" onChange={handleFileUpload} className="hidden" id="file-upload" />
            <Button variant="outline" size="sm" asChild>
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload size={16} className="mr-2" />
                Fayl yuklash
              </label>
            </Button>
          </div>

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
            <span className="text-sm text-zinc-400">bo'sh joy</span>
          </div>
        </div>

        <Button onClick={downloadResult} disabled={!jsonResult.isValid} variant="outline" size="sm">
          <Download size={16} className="mr-2" />
          Yuklab olish
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Kirish */}
        <div className="flex flex-col rounded-xl bg-zinc-900/80 shadow-inner">
          <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-4">
            <span className="text-lg font-semibold text-zinc-100">Kirish</span>
          </div>

          <div className="relative flex-grow" style={{ minHeight: '400px', maxHeight: '400px' }}>
            <Textarea
              value={inputJson}
              onChange={(e) => setInputJson(e.target.value)}
              className="absolute inset-0 h-full w-full resize-none border-0 bg-transparent p-4 font-mono text-sm text-zinc-50 placeholder:text-zinc-500"
              placeholder="JSON ma'lumotlaringizni bu yerga kiriting..."
            />
          </div>

          <div className="flex justify-between border-t border-zinc-800 px-4 py-2">
            <StatsDisplay stats={inputStats} />
          </div>
        </div>

        {/* Chiqish */}
        <div className="flex flex-col rounded-xl bg-zinc-900/80 shadow-inner">
          <div className="flex h-16 items-center justify-between border-b border-zinc-800 px-4">
            <span className="text-lg font-semibold text-zinc-100">Natija</span>
            <CopyButton text={jsonResult.formatted} disabled={!jsonResult.isValid} />
          </div>

          <div className="relative flex-grow" style={{ minHeight: '400px', maxHeight: '400px' }}>
            <div className="absolute inset-0 h-full w-full overflow-y-auto p-4">
              {jsonResult.error ? (
                <div className="text-sm text-red-400">
                  <strong>Xatolik:</strong> {jsonResult.error}
                </div>
              ) : (
                <pre className="font-mono text-sm whitespace-pre-wrap text-zinc-50">{jsonResult.formatted}</pre>
              )}
            </div>
          </div>

          <div className="flex justify-between border-t border-zinc-800 px-4 py-2">
            <StatsDisplay stats={outputStats} />
          </div>
        </div>
      </div>

      {/* Yordam */}
      <div className="mt-8 rounded-lg bg-zinc-900/80 p-6">
        <h3 className="mb-4 text-lg font-semibold text-zinc-100">JSON haqida ma'lumot</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="mb-2 font-medium text-zinc-200">JSON nima?</h4>
            <p className="text-sm text-zinc-400">
              JSON (JavaScript Object Notation) - ma'lumotlarni saqlash va uzatish uchun yengil format. Dasturlashda
              keng qo'llaniladi.
            </p>
          </div>
          <div>
            <h4 className="mb-2 font-medium text-zinc-200">Qo'llanish:</h4>
            <ul className="space-y-1 text-sm text-zinc-400">
              <li>• API javoblari</li>
              <li>• Konfiguratsiya fayllari</li>
              <li>• Ma'lumotlar bazasi export</li>
              <li>• Veb ilovalar uchun ma'lumot uzatish</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JSONFormatter
