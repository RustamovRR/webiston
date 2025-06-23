'use client'

import { useState, useMemo } from 'react'
import { Download, Upload, ArrowLeftRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ToolHeader } from '@/components/shared/ToolHeader'
import { DualTextPanel } from '@/components/shared/DualTextPanel'

type ConversionMode = 'encode' | 'decode'

const Base64Converter = () => {
  const [inputText, setInputText] = useState('')
  const [mode, setMode] = useState<ConversionMode>('encode')

  const result = useMemo(() => {
    if (!inputText.trim()) return { output: '', error: '' }

    try {
      if (mode === 'encode') {
        const encoded = btoa(unescape(encodeURIComponent(inputText)))
        return { output: encoded, error: '' }
      } else {
        const decoded = decodeURIComponent(escape(atob(inputText)))
        return { output: decoded, error: '' }
      }
    } catch (error) {
      return {
        output: '',
        error: mode === 'encode' ? 'Kodlashda xatolik' : "Noto'g'ri Base64 format",
      }
    }
  }, [inputText, mode])

  const handleModeSwitch = () => {
    const newMode = mode === 'encode' ? 'decode' : 'encode'
    setMode(newMode)
    if (result.output && !result.error) {
      setInputText(result.output)
    }
  }

  const handleClear = () => {
    setInputText('')
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      if (mode === 'encode' && file.type.startsWith('image/')) {
        // Rasm faylini Base64 ga o'girish
        const reader = new FileReader()
        reader.onload = (e) => {
          const result = e.target?.result as string
          const base64 = result.split(',')[1] // data:image/...;base64, qismini olib tashlash
          setInputText(base64)
        }
        reader.readAsDataURL(file)
      } else {
        // Matn faylini o'qish
        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result as string
          setInputText(content)
        }
        reader.readAsText(file)
      }
    }
  }

  const downloadResult = () => {
    if (!result.output) return
    const blob = new Blob([result.output], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = mode === 'encode' ? 'kodlangan.txt' : 'dekodlangan.txt'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4">
      <ToolHeader title="Base64 O'giruvchi" description="Matn va fayllarni Base64 formatiga o'girish va aksincha" />

      {/* Rejim tanlash */}
      <div className="mb-6 flex items-center justify-center">
        <div className="flex rounded-lg bg-zinc-900/50 p-1">
          <Button
            onClick={() => setMode('encode')}
            variant={mode === 'encode' ? 'default' : 'ghost'}
            size="sm"
            className={mode === 'encode' ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            Kodlash
          </Button>
          <Button
            onClick={() => setMode('decode')}
            variant={mode === 'decode' ? 'default' : 'ghost'}
            size="sm"
            className={mode === 'decode' ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            Dekodlash
          </Button>
        </div>
      </div>

      {/* Boshqaruv tugmalari */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept={mode === 'encode' ? '.txt,.json,image/*' : '.txt,.json'}
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <Button variant="outline" size="sm" asChild>
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload size={16} className="mr-2" />
                Fayl yuklash {mode === 'encode' ? '(Matn/Rasm)' : '(Matn)'}
              </label>
            </Button>
          </div>
        </div>

        <Button onClick={downloadResult} disabled={!result.output || !!result.error} variant="outline" size="sm">
          <Download size={16} className="mr-2" />
          Yuklab olish
        </Button>
      </div>

      {/* Asosiy panel */}
      <DualTextPanel
        sourceText={inputText}
        convertedText={result.output}
        sourcePlaceholder={
          mode === 'encode'
            ? "Kodlamoqchi bo'lgan matnni kiriting..."
            : "Dekodlamoqchi bo'lgan Base64 matnni kiriting..."
        }
        sourceLabel={mode === 'encode' ? 'Oddiy matn' : 'Base64 matn'}
        targetLabel={mode === 'encode' ? 'Base64 matn' : 'Oddiy matn'}
        onSourceChange={setInputText}
        onSwap={handleModeSwitch}
        onClear={handleClear}
        error={result.error}
      />

      {/* Yordam */}
      <div className="mt-8 rounded-lg bg-zinc-900/80 p-6">
        <h3 className="mb-4 text-lg font-semibold text-zinc-100">Base64 haqida ma'lumot</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <h4 className="mb-2 font-medium text-zinc-200">Base64 nima?</h4>
            <p className="text-sm text-zinc-400">
              Base64 - binary ma'lumotlarni matn formatida ifodalash uchun kodlash usuli. 64 ta belgidan foydalanadi:
              A-Z, a-z, 0-9, +, /
            </p>
          </div>
          <div>
            <h4 className="mb-2 font-medium text-zinc-200">Qo'llanish:</h4>
            <ul className="space-y-1 text-sm text-zinc-400">
              <li>• Email da rasm yuborish</li>
              <li>• Veb sahifada rasm joylash</li>
              <li>• API orqali fayl uzatish</li>
              <li>• Ma'lumotlarni xavfsiz saqlash</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Base64Converter
