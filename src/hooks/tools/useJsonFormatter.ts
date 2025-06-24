'use client'

import { useState, useMemo, useCallback } from 'react'

// Sample JSON data moved to constants
export const SAMPLE_JSON_DATA = {
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

interface JsonResult {
  formatted: string
  minified: string
  error: string
  isValid: boolean
}

export const useJsonFormatter = () => {
  const [inputJson, setInputJson] = useState('')
  const [indentation, setIndentation] = useState('2')
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  const [isMinified, setIsMinified] = useState(false)

  const jsonResult = useMemo((): JsonResult => {
    if (!inputJson.trim()) {
      return { formatted: '', error: '', isValid: false, minified: '' }
    }

    try {
      const parsed = JSON.parse(inputJson)
      const formatted = JSON.stringify(parsed, null, parseInt(indentation))
      const minified = JSON.stringify(parsed)
      return { formatted, error: '', isValid: true, minified }
    } catch (error) {
      let errorMessage = "Noto'g'ri JSON format"

      if (error instanceof SyntaxError) {
        const message = error.message
        if (message.includes('Unexpected token')) {
          errorMessage = 'Kutilmagan belgi. JSON formatini tekshiring.'
        } else if (message.includes('Unexpected end')) {
          errorMessage = 'JSON tugallanmagan. Qavslar yoki tirnoqlarni tekshiring.'
        } else if (message.includes('property name')) {
          errorMessage = "Xususiyat nomi qo'sh tirnoqda bo'lishi kerak."
        } else if (message.includes('Unexpected string')) {
          errorMessage = 'Kutilmagan matn. Vergul yoki qavslarni tekshiring.'
        } else {
          errorMessage = `JSON xatoligi: ${message}`
        }
      }

      return {
        formatted: '',
        error: errorMessage,
        isValid: false,
        minified: '',
      }
    }
  }, [inputJson, indentation])

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // File type validation
    const validTypes = ['application/json', 'text/plain', 'text/json']
    if (!validTypes.includes(file.type) && !file.name.endsWith('.json') && !file.name.endsWith('.txt')) {
      alert('Faqat JSON yoki TXT fayllarni yuklash mumkin.')
      return
    }

    // File size validation (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert("Fayl hajmi 10MB dan kichik bo'lishi kerak.")
      return
    }

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setInputJson(content)
    }
    reader.onerror = () => {
      alert("Faylni o'qishda xatolik yuz berdi.")
    }
    reader.readAsText(file)
  }, [])

  const loadSampleJson = useCallback(() => {
    setInputJson(JSON.stringify(SAMPLE_JSON_DATA, null, 2))
  }, [])

  const downloadResult = useCallback(() => {
    if (!jsonResult.isValid) return

    const content = isMinified ? jsonResult.minified : jsonResult.formatted
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `json-${isMinified ? 'minified' : 'formatted'}-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [jsonResult.isValid, jsonResult.formatted, jsonResult.minified, isMinified])

  const clearInput = useCallback(() => {
    setInputJson('')
  }, [])

  const toggleMinify = useCallback(() => {
    setIsMinified((prev) => !prev)
  }, [])

  const toggleLineNumbers = useCallback(() => {
    setShowLineNumbers((prev) => !prev)
  }, [])

  return {
    // State
    inputJson,
    setInputJson,
    indentation,
    setIndentation,
    showLineNumbers,
    isMinified,
    jsonResult,
    // Actions
    handleFileUpload,
    loadSampleJson,
    downloadResult,
    clearInput,
    toggleMinify,
    toggleLineNumbers,
  }
}
