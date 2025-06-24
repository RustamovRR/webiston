'use client'

import { useState, useMemo } from 'react'

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

export const useJsonFormatter = () => {
  const [inputJson, setInputJson] = useState('')
  const [indentation, setIndentation] = useState('2')
  const [showLineNumbers, setShowLineNumbers] = useState(true)
  const [isMinified, setIsMinified] = useState(false)

  const jsonResult = useMemo(() => {
    if (!inputJson.trim()) {
      return { formatted: '', error: '', isValid: false, minified: '' }
    }

    try {
      const parsed = JSON.parse(inputJson)
      const formatted = JSON.stringify(parsed, null, parseInt(indentation))
      const minified = JSON.stringify(parsed)
      return { formatted, error: '', isValid: true, minified }
    } catch (error) {
      return {
        formatted: '',
        error: error instanceof Error ? error.message : "Noto'g'ri JSON format",
        isValid: false,
        minified: '',
      }
    }
  }, [inputJson, indentation])

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

  const loadSampleJson = () => {
    setInputJson(JSON.stringify(sampleJson, null, 2))
  }

  const downloadResult = () => {
    if (!jsonResult.formatted) return

    const content = isMinified ? jsonResult.minified : jsonResult.formatted
    const blob = new Blob([content], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `formatted-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const clearInput = () => {
    setInputJson('')
  }

  const toggleMinify = () => {
    setIsMinified(!isMinified)
  }

  const toggleLineNumbers = () => {
    setShowLineNumbers((prev) => !prev)
  }

  return {
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
  }
}
