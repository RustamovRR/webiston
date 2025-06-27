'use client'

import { useState, useMemo, useCallback } from 'react'

// Sample URL data constants
export const SAMPLE_URL_DATA = {
  SIMPLE_URL: 'https://webiston.uz/tools/url-encoder',
  COMPLEX_URL: 'https://webiston.uz/search?q=hello world&category=tools&lang=uz',
  QUERY_STRING: 'name=Ali Valiyev&age=25&city=Toshkent&email=ali@webiston.uz',
  EMAIL_QUERY: 'mailto:info@webiston.uz?subject=Savolim bor&body=Assalomu alaykum',
  SOCIAL_SHARE: 'https://facebook.com/sharer/sharer.php?u=https://webiston.uz&t=Foydali veb tools',
}

const samples = [
  { key: 'SIMPLE_URL', label: 'Oddiy URL', value: SAMPLE_URL_DATA.SIMPLE_URL },
  { key: 'COMPLEX_URL', label: 'Murakkab URL', value: SAMPLE_URL_DATA.COMPLEX_URL },
  { key: 'QUERY_STRING', label: "Qidiruv so'rovi", value: SAMPLE_URL_DATA.QUERY_STRING },
  { key: 'EMAIL_QUERY', label: 'Email havolasi', value: SAMPLE_URL_DATA.EMAIL_QUERY },
  { key: 'SOCIAL_SHARE', label: 'Ijtimoiy tarmoq', value: SAMPLE_URL_DATA.SOCIAL_SHARE },
]

type ConversionMode = 'encode' | 'decode'

interface UrlInfo {
  isValidUrl: boolean
  protocol?: string
  hostname?: string
  pathname?: string
  search?: string
  hash?: string
}

interface UrlResult {
  output: string
  error: string
  isValid: boolean
  urlInfo?: UrlInfo
}

const analyzeUrl = (urlString: string): UrlInfo => {
  try {
    const url = new URL(urlString)
    return {
      isValidUrl: true,
      protocol: url.protocol,
      hostname: url.hostname,
      pathname: url.pathname,
      search: url.search,
      hash: url.hash,
    }
  } catch {
    return { isValidUrl: false }
  }
}

export const useUrlEncoder = () => {
  const [inputText, setInputText] = useState('')
  const [mode, setMode] = useState<ConversionMode>('encode')
  const [isProcessing, setIsProcessing] = useState(false)

  const result = useMemo((): UrlResult => {
    if (!inputText.trim()) {
      return { output: '', error: '', isValid: false }
    }

    // Check text length limit (1MB)
    if (inputText.length > 1024 * 1024) {
      return {
        output: '',
        error: 'Matn juda uzun (maksimal 1MB)',
        isValid: false,
      }
    }

    try {
      let output: string
      let urlInfo: UrlInfo | undefined = undefined

      if (mode === 'encode') {
        output = encodeURIComponent(inputText)
      } else {
        output = decodeURIComponent(inputText)

        // Analyze decoded URL if it looks like a URL
        if (output.startsWith('http') || output.startsWith('mailto:')) {
          urlInfo = analyzeUrl(output)
        }
      }

      return {
        output,
        error: '',
        isValid: true,
        urlInfo,
      }
    } catch (error) {
      let errorMessage = 'Konvertatsiya xatoligi'

      if (mode === 'decode') {
        if (error instanceof URIError) {
          errorMessage = "Noto'g'ri URL kodlash formati. Percent encoding to'g'riligini tekshiring."
        } else {
          errorMessage = "URL dekodlashda xatolik. Format to'g'riligini tekshiring."
        }
      } else {
        errorMessage = 'URL kodlashda xatolik yuz berdi.'
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

  const handleFileUpload = useCallback(async (file: File): Promise<void> => {
    setIsProcessing(true)

    try {
      // File size validation (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error("Fayl hajmi 10MB dan kichik bo'lishi kerak.")
      }

      // File type validation
      const validTypes = ['text/plain', 'application/json', 'text/json']
      if (!validTypes.includes(file.type) && !file.name.endsWith('.txt') && !file.name.endsWith('.json')) {
        throw new Error('Faqat matn fayllarni yuklash mumkin.')
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        if (content.length > 1024 * 1024) {
          alert('Fayl tarkibi juda uzun (maksimal 1MB)')
        } else {
          setInputText(content)
        }
        setIsProcessing(false)
      }
      reader.onerror = () => {
        throw new Error("Faylni o'qishda xatolik yuz berdi.")
      }
      reader.readAsText(file)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Faylni yuklashda xatolik yuz berdi.'
      alert(errorMessage)
      setIsProcessing(false)
    }
  }, [])

  const downloadResult = useCallback(() => {
    if (!result.isValid || !result.output) return

    try {
      const blob = new Blob([result.output], { type: 'text/plain; charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `url-${mode === 'encode' ? 'kodlangan' : 'dekodlangan'}-${Date.now()}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      alert('Faylni yuklab olishda xatolik yuz berdi.')
    }
  }, [result, mode])

  const canDownload = Boolean(result.output && result.isValid)

  const inputStats = useMemo(
    () => ({
      characters: inputText.length,
      words: inputText.split(/\s+/).filter((word) => word.length > 0).length,
      lines: inputText.split('\n').length,
    }),
    [inputText],
  )

  const outputStats = useMemo(
    () => ({
      characters: result.output.length,
      words: result.output.split(/\s+/).filter((word) => word.length > 0).length,
      lines: result.output.split('\n').length,
    }),
    [result.output],
  )

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
    inputStats,
    outputStats,
    samples,
  }
}
