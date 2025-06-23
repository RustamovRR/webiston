import { useState, useMemo, useCallback } from 'react'
import { ConversionMode, UrlResult } from '@/types'
import { URL_PATTERNS, PROCESSING_LIMITS, ERROR_MESSAGES } from '@/constants'
import { countWords, analyzeUrl } from '@/lib'

interface UseUrlEncoderOptions {
  initialMode?: ConversionMode
  onSuccess?: (message: string) => void
  onError?: (error: string) => void
}

interface UseUrlEncoderReturn {
  // State
  inputText: string
  mode: ConversionMode
  result: UrlResult
  isProcessing: boolean

  // Actions
  setInputText: (text: string) => void
  setMode: (mode: ConversionMode) => void
  handleModeSwitch: () => void
  handleClear: () => void
  handleFileUpload: (file: File) => Promise<void>
  downloadResult: () => void
  loadSampleText: (sample: string) => void

  // Computed
  canDownload: boolean
  inputStats: { characters: number; words: number; lines: number }
  outputStats: { characters: number; words: number; lines: number }
}

export const useUrlEncoder = (options: UseUrlEncoderOptions = {}): UseUrlEncoderReturn => {
  const { initialMode = 'encode', onSuccess, onError } = options

  const [inputText, setInputText] = useState('')
  const [mode, setMode] = useState<ConversionMode>(initialMode)
  const [isProcessing, setIsProcessing] = useState(false)

  const result = useMemo((): UrlResult => {
    if (!inputText.trim()) {
      return { output: '', error: null, isValid: true }
    }

    // Check text length limit
    if (inputText.length > PROCESSING_LIMITS.MAX_TEXT_LENGTH) {
      return {
        output: '',
        error: 'Matn juda uzun (maksimal 1M belgi)',
        isValid: false,
      }
    }

    try {
      let output: string
      let urlInfo = undefined

      if (mode === 'encode') {
        output = encodeURIComponent(inputText)
      } else {
        output = decodeURIComponent(inputText)
        // Analyze decoded URL if it looks like a URL
        if (URL_PATTERNS.HTTP_URL.test(output) || URL_PATTERNS.EMAIL.test(output)) {
          urlInfo = analyzeUrl(output)
        }
      }

      return {
        output,
        error: null,
        isValid: true,
        urlInfo: urlInfo || undefined,
      }
    } catch (error) {
      const errorMessage = mode === 'encode' ? 'Kodlashda xatolik yuz berdi' : "Noto'g'ri URL kodlash formati"

      onError?.(errorMessage)
      return { output: '', error: errorMessage, isValid: false }
    }
  }, [inputText, mode, onError])

  const handleModeSwitch = useCallback(() => {
    const newMode: ConversionMode = mode === 'encode' ? 'decode' : 'encode'
    setMode(newMode)

    if (result.output && !result.error) {
      setInputText(result.output)
    }
  }, [mode, result])

  const handleClear = useCallback(() => {
    setInputText('')
  }, [])

  const loadSampleText = useCallback(
    (sample: string) => {
      setInputText(sample)
      onSuccess?.('Namuna matn yuklandi')
    },
    [onSuccess],
  )

  const handleFileUpload = useCallback(
    async (file: File): Promise<void> => {
      setIsProcessing(true)

      try {
        // File size validation
        if (file.size > PROCESSING_LIMITS.MAX_FILE_SIZE) {
          throw new Error('Fayl hajmi juda katta (maksimal 10MB)')
        }

        // Only support text files
        if (!file.type.includes('text') && !file.name.endsWith('.txt')) {
          throw new Error("Faqat matn fayllari qo'llab-quvvatlanadi")
        }

        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result as string
          if (content.length > PROCESSING_LIMITS.MAX_TEXT_LENGTH) {
            onError?.('Fayl tarkibi juda uzun')
          } else {
            setInputText(content)
            onSuccess?.('Fayl muvaffaqiyatli yuklandi')
          }
          setIsProcessing(false)
        }
        reader.onerror = () => {
          onError?.("Faylni o'qishda xatolik")
          setIsProcessing(false)
        }
        reader.readAsText(file)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Noma'lum xatolik"
        onError?.(errorMessage)
        setIsProcessing(false)
      }
    },
    [onError, onSuccess],
  )

  const downloadResult = useCallback(() => {
    if (!result.output || result.error) return

    try {
      const blob = new Blob([result.output], { type: 'text/plain; charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = mode === 'encode' ? 'encoded-url.txt' : 'decoded-url.txt'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      onSuccess?.('Fayl yuklab olindi')
    } catch (error) {
      onError?.('Yuklab olishda xatolik')
    }
  }, [result, mode, onSuccess, onError])

  const canDownload = Boolean(result.output && !result.error)

  const inputStats = useMemo(
    () => ({
      characters: inputText.length,
      words: countWords(inputText),
      lines: inputText.split('\n').length,
    }),
    [inputText],
  )

  const outputStats = useMemo(
    () => ({
      characters: result.output.length,
      words: countWords(result.output),
      lines: result.output.split('\n').length,
    }),
    [result.output],
  )

  return {
    // State
    inputText,
    mode,
    result,
    isProcessing,

    // Actions
    setInputText,
    setMode,
    handleModeSwitch,
    handleClear,
    handleFileUpload,
    downloadResult,
    loadSampleText,

    // Computed
    canDownload,
    inputStats,
    outputStats,
  }
}
