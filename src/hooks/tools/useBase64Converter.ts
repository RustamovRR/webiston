'use client'

import { useState, useMemo, useCallback } from 'react'

// Sample Base64 data constants
export const SAMPLE_BASE64_DATA = {
  UZBEK_GREETING: 'Assalomu alaykum, Webiston!',
  JSON_SAMPLE: '{"ism": "Ali", "yosh": 25, "shahar": "Toshkent"}',
  URL_SAMPLE: 'https://webiston.uz/tools/base64-converter',
  EMAIL_SAMPLE: 'info@webiston.uz',
}

const samples = [
  { key: 'UZBEK_GREETING', label: "O'zbek salomlashuvi", value: SAMPLE_BASE64_DATA.UZBEK_GREETING },
  { key: 'JSON_SAMPLE', label: 'JSON namunasi', value: SAMPLE_BASE64_DATA.JSON_SAMPLE },
  { key: 'URL_SAMPLE', label: 'URL namunasi', value: SAMPLE_BASE64_DATA.URL_SAMPLE },
  { key: 'EMAIL_SAMPLE', label: 'Email namunasi', value: SAMPLE_BASE64_DATA.EMAIL_SAMPLE },
]

type ConversionMode = 'encode' | 'decode'

interface Base64Result {
  output: string
  error: string
  isValid: boolean
}

export const useBase64Converter = () => {
  const [inputText, setInputText] = useState('')
  const [mode, setMode] = useState<ConversionMode>('encode')
  const [isProcessing, setIsProcessing] = useState(false)

  const result = useMemo((): Base64Result => {
    if (!inputText.trim()) {
      return { output: '', error: '', isValid: false }
    }

    try {
      if (mode === 'encode') {
        const encoded = btoa(unescape(encodeURIComponent(inputText)))
        return { output: encoded, error: '', isValid: true }
      } else {
        // Decode mode
        // First validate Base64 format
        const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
        if (!base64Regex.test(inputText.replace(/\s/g, ''))) {
          return {
            output: '',
            error: "Noto'g'ri Base64 format. Faqat A-Z, a-z, 0-9, +, / va = belgilardan foydalaning.",
            isValid: false,
          }
        }

        const decoded = decodeURIComponent(escape(atob(inputText.replace(/\s/g, ''))))
        return { output: decoded, error: '', isValid: true }
      }
    } catch (error) {
      let errorMessage = 'Konvertatsiya xatoligi'

      if (mode === 'decode') {
        if (error instanceof DOMException && error.name === 'InvalidCharacterError') {
          errorMessage = "Noto'g'ri Base64 format. Matn to'g'ri kodlanganligini tekshiring."
        } else {
          errorMessage = "Base64 dekodlashda xatolik. Format to'g'riligini tekshiring."
        }
      } else {
        errorMessage = 'Matnni kodlashda xatolik yuz berdi.'
      }

      return { output: '', error: errorMessage, isValid: false }
    }
  }, [inputText, mode])

  const handleModeSwitch = useCallback(() => {
    const newMode: ConversionMode = mode === 'encode' ? 'decode' : 'encode'
    setMode(newMode)

    // If we have valid output, use it as input for the opposite mode
    if (result.output && result.isValid) {
      setInputText(result.output)
    }
  }, [mode, result])

  const handleClear = useCallback(() => {
    setInputText('')
  }, [])

  const loadSampleText = useCallback((sample: string) => {
    setInputText(sample)
  }, [])

  const handleFileUpload = useCallback(
    async (file: File): Promise<void> => {
      setIsProcessing(true)

      try {
        // File size validation (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          throw new Error("Fayl hajmi 10MB dan kichik bo'lishi kerak.")
        }

        // File type validation
        const validTextTypes = ['text/plain', 'application/json', 'text/json']
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

        if (mode === 'encode' && [...validTextTypes, ...validImageTypes].includes(file.type)) {
          if (validImageTypes.includes(file.type)) {
            // Handle image files for encoding to base64
            const reader = new FileReader()
            reader.onload = (e) => {
              const result = e.target?.result as string
              const base64 = result.split(',')[1] // Remove data:image/...;base64, prefix
              setInputText(base64)
              setIsProcessing(false)
            }
            reader.onerror = () => {
              throw new Error("Rasm faylini o'qishda xatolik yuz berdi.")
            }
            reader.readAsDataURL(file)
          } else {
            // Handle text files
            const reader = new FileReader()
            reader.onload = (e) => {
              const content = e.target?.result as string
              setInputText(content)
              setIsProcessing(false)
            }
            reader.onerror = () => {
              throw new Error("Fayl mazmunini o'qishda xatolik yuz berdi.")
            }
            reader.readAsText(file)
          }
        } else if (mode === 'decode' && validTextTypes.includes(file.type)) {
          // For decode mode, only accept text files
          const reader = new FileReader()
          reader.onload = (e) => {
            const content = e.target?.result as string
            setInputText(content)
            setIsProcessing(false)
          }
          reader.onerror = () => {
            throw new Error("Fayl mazmunini o'qishda xatolik yuz berdi.")
          }
          reader.readAsText(file)
        } else {
          throw new Error(
            mode === 'encode'
              ? 'Faqat matn va rasm fayllarni yuklash mumkin.'
              : 'Dekodlash uchun faqat matn fayllarni yuklash mumkin.',
          )
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Faylni yuklashda xatolik yuz berdi.'
        alert(errorMessage)
        setIsProcessing(false)
      }
    },
    [mode],
  )

  const downloadResult = useCallback(() => {
    if (!result.isValid || !result.output) return

    try {
      const blob = new Blob([result.output], { type: 'text/plain; charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `base64-${mode === 'encode' ? 'kodlangan' : 'dekodlangan'}-${Date.now()}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      alert('Faylni yuklab olishda xatolik yuz berdi.')
    }
  }, [result, mode])

  const canDownload = Boolean(result.output && result.isValid)

  const acceptedFileTypes = mode === 'encode' ? '.txt,.json,image/*' : '.txt,.json'

  return {
    // State
    inputText,
    setInputText,
    mode,
    setMode,
    isProcessing,
    result,
    // Actions
    handleModeSwitch,
    handleClear,
    handleFileUpload,
    downloadResult,
    loadSampleText,
    // Computed
    canDownload,
    acceptedFileTypes,
    samples,
  }
}
