'use client'

import { useState, useMemo, useCallback } from 'react'
import { useTranslations } from 'next-intl'

// Sample URL data constants
export const SAMPLE_URL_DATA = {
  SIMPLE_URL: 'https://webiston.uz/tools/url-encoder',
  COMPLEX_URL: 'https://webiston.uz/search?q=hello world&category=tools&lang=uz',
  QUERY_STRING: 'name=Ali Valiyev&age=25&city=Toshkent&email=ali@webiston.uz',
  EMAIL_QUERY: 'mailto:info@webiston.uz?subject=Savolim bor&body=Assalomu alaykum',
  SOCIAL_SHARE: 'https://facebook.com/sharer/sharer.php?u=https://webiston.uz&t=Foydali veb tools',
}

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
  const tErrors = useTranslations('UrlEncoderPage.Errors')
  const tSamples = useTranslations('UrlEncoderPage.Samples')
  const [inputText, setInputText] = useState('')
  const [mode, setMode] = useState<ConversionMode>('encode')
  const [isProcessing, setIsProcessing] = useState(false)

  // Dynamic samples based on current mode
  const samples = useMemo(
    () => [
      { key: 'SIMPLE_URL', label: tSamples('simpleUrl'), value: SAMPLE_URL_DATA.SIMPLE_URL },
      { key: 'COMPLEX_URL', label: tSamples('complexUrl'), value: SAMPLE_URL_DATA.COMPLEX_URL },
      { key: 'QUERY_STRING', label: tSamples('queryString'), value: SAMPLE_URL_DATA.QUERY_STRING },
      { key: 'EMAIL_QUERY', label: tSamples('emailQuery'), value: SAMPLE_URL_DATA.EMAIL_QUERY },
      { key: 'SOCIAL_SHARE', label: tSamples('socialShare'), value: SAMPLE_URL_DATA.SOCIAL_SHARE },
    ],
    [tSamples]
  )

  const result = useMemo((): UrlResult => {
    if (!inputText.trim()) {
      return { output: '', error: '', isValid: false }
    }

    // Check text length limit (1MB)
    if (inputText.length > 1024 * 1024) {
      return {
        output: '',
        error: tErrors('textTooLong'),
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
      let errorMessage = tErrors('conversionError')

      if (mode === 'decode') {
        if (error instanceof URIError) {
          errorMessage = tErrors('invalidUrlFormat')
        } else {
          errorMessage = tErrors('decodeError')
        }
      } else {
        errorMessage = tErrors('encodeError')
      }

      return { output: '', error: errorMessage, isValid: false }
    }
  }, [inputText, mode])

  const handleModeSwitch = useCallback(() => {
    const newMode: ConversionMode = mode === 'encode' ? 'decode' : 'encode'

    if (inputText.trim()) {
      // Try to convert current input to use as input for the opposite mode
      try {
        let newInput = inputText

        if (mode === 'encode') {
          // Current mode is encode, switching to decode
          // Use the encoded result as input for decode mode
          const encoded = encodeURIComponent(inputText)
          newInput = encoded
        } else {
          // Current mode is decode, switching to encode
          // Try to decode current input
          try {
            const decoded = decodeURIComponent(inputText)
            newInput = decoded
          } catch (error) {
            // If decoding fails, keep current input
          }
        }

        setMode(newMode)
        setInputText(newInput)
      } catch (error) {
        // If conversion fails, just switch mode and keep current input
        setMode(newMode)
      }
    } else {
      // If no input text, just switch mode
      setMode(newMode)
    }
  }, [mode, inputText])

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
          throw new Error(tErrors('fileSizeError'))
        }

        // File type validation
        const validTypes = ['text/plain', 'application/json', 'text/json']
        if (!validTypes.includes(file.type) && !file.name.endsWith('.txt') && !file.name.endsWith('.json')) {
          throw new Error(tErrors('fileTypeError'))
        }

        const reader = new FileReader()
        reader.onload = (e) => {
          const content = e.target?.result as string
          if (content.length > 1024 * 1024) {
            alert(tErrors('textTooLong'))
          } else {
            setInputText(content)
          }
          setIsProcessing(false)
        }
        reader.onerror = () => {
          throw new Error(tErrors('fileReadError'))
        }
        reader.readAsText(file)
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : tErrors('fileUploadError')
        alert(errorMessage)
        setIsProcessing(false)
      }
    },
    [tErrors]
  )

  const downloadResult = useCallback(() => {
    if (!result.isValid || !result.output) return

    try {
      const blob = new Blob([result.output], { type: 'text/plain; charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `url-${mode === 'encode' ? 'encoded' : 'decoded'}-${Date.now()}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      alert(tErrors('downloadError'))
    }
  }, [result, mode, tErrors])

  const canDownload = Boolean(result.output && result.isValid)

  const inputStats = useMemo(
    () => ({
      characters: inputText.length,
      words: inputText.split(/\s+/).filter((word) => word.length > 0).length,
      lines: inputText.split('\n').length,
    }),
    [inputText]
  )

  const outputStats = useMemo(
    () => ({
      characters: result.output.length,
      words: result.output.split(/\s+/).filter((word) => word.length > 0).length,
      lines: result.output.split('\n').length,
    }),
    [result.output]
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
