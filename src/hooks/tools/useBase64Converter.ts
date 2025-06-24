import { useState, useMemo, useCallback } from 'react'
import { ConversionMode, ToolResult } from '@/types'
import {
  BASE64_SUPPORTED_IMAGE_TYPES,
  BASE64_SUPPORTED_TEXT_TYPES,
  FILE_SIZE_LIMITS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  BASE64_SAMPLE_TEXTS,
} from '@/constants'

interface UseBase64ConverterOptions {
  initialMode?: ConversionMode
  onSuccess?: (message: string) => void
  onError?: (error: string) => void
}

const samples = [
  { key: 'UZBEK_GREETING', label: "O'zbek salomlashuvi", value: BASE64_SAMPLE_TEXTS.UZBEK_GREETING },
  { key: 'JSON_SAMPLE', label: 'JSON namunasi', value: BASE64_SAMPLE_TEXTS.JSON_SAMPLE },
  { key: 'URL_SAMPLE', label: 'URL namunasi', value: BASE64_SAMPLE_TEXTS.URL_SAMPLE },
  { key: 'EMAIL_SAMPLE', label: 'Email namunasi', value: BASE64_SAMPLE_TEXTS.EMAIL_SAMPLE },
]

interface UseBase64ConverterReturn {
  // State
  inputText: string
  mode: ConversionMode
  result: ToolResult
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
  acceptedFileTypes: string
  samples: typeof samples
}

export const useBase64Converter = (options: UseBase64ConverterOptions = {}): UseBase64ConverterReturn => {
  const { initialMode = 'encode', onSuccess, onError } = options

  const [inputText, setInputText] = useState('')
  const [mode, setMode] = useState<ConversionMode>(initialMode)
  const [isProcessing, setIsProcessing] = useState(false)

  const result = useMemo((): ToolResult => {
    if (!inputText.trim()) {
      return { output: '', error: '' }
    }

    try {
      if (mode === 'encode') {
        const encoded = btoa(unescape(encodeURIComponent(inputText)))
        return { output: encoded, error: '', isValid: true }
      } else {
        const decoded = decodeURIComponent(escape(atob(inputText)))
        return { output: decoded, error: '', isValid: true }
      }
    } catch (error) {
      const errorMessage = mode === 'encode' ? 'Kodlashda xatolik' : ERROR_MESSAGES.INVALID_BASE64

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
      onSuccess?.(SUCCESS_MESSAGES.FILE_UPLOADED)
    },
    [onSuccess],
  )

  const handleFileUpload = useCallback(
    async (file: File): Promise<void> => {
      setIsProcessing(true)

      try {
        // File size validation
        if (file.size > FILE_SIZE_LIMITS.IMAGE) {
          throw new Error(ERROR_MESSAGES.FILE_TOO_LARGE)
        }

        if (mode === 'encode' && BASE64_SUPPORTED_IMAGE_TYPES.includes(file.type)) {
          // Handle image files for encoding
          const reader = new FileReader()
          reader.onload = (e) => {
            const result = e.target?.result as string
            const base64 = result.split(',')[1] // Remove data:image/...;base64, prefix
            setInputText(base64)
            onSuccess?.(SUCCESS_MESSAGES.FILE_UPLOADED)
            setIsProcessing(false)
          }
          reader.onerror = () => {
            onError?.(ERROR_MESSAGES.UNKNOWN_ERROR)
            setIsProcessing(false)
          }
          reader.readAsDataURL(file)
        } else if (BASE64_SUPPORTED_TEXT_TYPES.includes(file.type) || file.type === '') {
          // Handle text files
          const reader = new FileReader()
          reader.onload = (e) => {
            const content = e.target?.result as string
            setInputText(content)
            onSuccess?.(SUCCESS_MESSAGES.FILE_UPLOADED)
            setIsProcessing(false)
          }
          reader.onerror = () => {
            onError?.(ERROR_MESSAGES.UNKNOWN_ERROR)
            setIsProcessing(false)
          }
          reader.readAsText(file)
        } else {
          throw new Error(ERROR_MESSAGES.UNSUPPORTED_FORMAT)
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR
        onError?.(errorMessage)
        setIsProcessing(false)
      }
    },
    [mode, onError, onSuccess],
  )

  const downloadResult = useCallback(() => {
    if (!result.output || result.error) return

    try {
      const blob = new Blob([result.output], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = mode === 'encode' ? 'kodlangan.txt' : 'dekodlangan.txt'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      onSuccess?.(SUCCESS_MESSAGES.DOWNLOAD_STARTED)
    } catch (error) {
      onError?.(ERROR_MESSAGES.UNKNOWN_ERROR)
    }
  }, [result, mode, onSuccess, onError])

  const canDownload = Boolean(result.output && !result.error)

  const acceptedFileTypes = mode === 'encode' ? '.txt,.json,image/*' : '.txt,.json'

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
    acceptedFileTypes,
    samples,
  }
}
