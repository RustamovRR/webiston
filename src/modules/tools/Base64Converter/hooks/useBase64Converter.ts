'use client'

import { useState, useMemo, useCallback } from 'react'
import { useTranslations } from 'next-intl'

// Sample Base64 data constants
export const SAMPLE_BASE64_DATA = {
  UZBEK_GREETING: 'Assalomu alaykum, Webiston!',
  JSON_SAMPLE: '{"ism": "Ali", "yosh": 25, "shahar": "Toshkent"}',
  URL_SAMPLE: 'https://webiston.uz/tools/base64-converter',
  EMAIL_SAMPLE: 'info@webiston.uz',
}

// Base64 encoded versions of sample data
export const SAMPLE_BASE64_ENCODED = {
  UZBEK_GREETING: 'QXNzYWxvbXUgYWxheWt1bSwgV2ViaXN0b24h',
  JSON_SAMPLE: 'eyJpc20iOiAiQWxpIiwgInlvc2giOiAyNSwgInNoYWhhciI6ICJUb3Noa2VudCJ9',
  URL_SAMPLE: 'aHR0cHM6Ly93ZWJpc3Rvbi51ei90b29scy9iYXNlNjQtY29udmVydGVy',
  EMAIL_SAMPLE: 'aW5mb0B3ZWJpc3Rvbi51eg==',
}

type ConversionMode = 'encode' | 'decode'

interface Base64Result {
  output: string
  error: string
  isValid: boolean
}

export const useBase64Converter = () => {
  const tErrors = useTranslations('Base64ConverterPage.Errors')
  const tSamples = useTranslations('Base64ConverterPage.Samples')
  const [inputText, setInputText] = useState('')
  const [mode, setMode] = useState<ConversionMode>('encode')
  const [isProcessing, setIsProcessing] = useState(false)

  // Dynamic samples based on current mode
  const samples = useMemo(() => {
    if (mode === 'encode') {
      return [
        { key: 'UZBEK_GREETING', label: tSamples('uzbekGreeting'), value: SAMPLE_BASE64_DATA.UZBEK_GREETING },
        { key: 'JSON_SAMPLE', label: tSamples('jsonSample'), value: SAMPLE_BASE64_DATA.JSON_SAMPLE },
        { key: 'URL_SAMPLE', label: tSamples('urlSample'), value: SAMPLE_BASE64_DATA.URL_SAMPLE },
        { key: 'EMAIL_SAMPLE', label: tSamples('emailSample'), value: SAMPLE_BASE64_DATA.EMAIL_SAMPLE },
      ]
    } else {
      return [
        { key: 'UZBEK_GREETING', label: tSamples('base64Text'), value: SAMPLE_BASE64_ENCODED.UZBEK_GREETING },
        { key: 'JSON_SAMPLE', label: tSamples('base64Json'), value: SAMPLE_BASE64_ENCODED.JSON_SAMPLE },
        { key: 'URL_SAMPLE', label: tSamples('base64Url'), value: SAMPLE_BASE64_ENCODED.URL_SAMPLE },
        { key: 'EMAIL_SAMPLE', label: tSamples('base64Email'), value: SAMPLE_BASE64_ENCODED.EMAIL_SAMPLE },
      ]
    }
  }, [mode, tSamples])

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
            error: tErrors('invalidBase64Format'),
            isValid: false,
          }
        }

        const decoded = decodeURIComponent(escape(atob(inputText.replace(/\s/g, ''))))
        return { output: decoded, error: '', isValid: true }
      }
    } catch (error) {
      let errorMessage = tErrors('conversionError')

      if (mode === 'decode') {
        if (error instanceof DOMException && error.name === 'InvalidCharacterError') {
          errorMessage = tErrors('invalidBase64Text')
        } else {
          errorMessage = tErrors('base64DecodeError')
        }
      } else {
        errorMessage = tErrors('textEncodeError')
      }

      return { output: '', error: errorMessage, isValid: false }
    }
  }, [inputText, mode, tErrors])

  const handleModeSwitch = useCallback(() => {
    const newMode: ConversionMode = mode === 'encode' ? 'decode' : 'encode'
    setMode(newMode)

    // Sample mapping for both directions
    const sampleMapping = [
      {
        key: 'UZBEK_GREETING',
        plain: SAMPLE_BASE64_DATA.UZBEK_GREETING,
        encoded: SAMPLE_BASE64_ENCODED.UZBEK_GREETING,
      },
      { key: 'JSON_SAMPLE', plain: SAMPLE_BASE64_DATA.JSON_SAMPLE, encoded: SAMPLE_BASE64_ENCODED.JSON_SAMPLE },
      { key: 'URL_SAMPLE', plain: SAMPLE_BASE64_DATA.URL_SAMPLE, encoded: SAMPLE_BASE64_ENCODED.URL_SAMPLE },
      { key: 'EMAIL_SAMPLE', plain: SAMPLE_BASE64_DATA.EMAIL_SAMPLE, encoded: SAMPLE_BASE64_ENCODED.EMAIL_SAMPLE },
    ]

    // Check if current input matches any sample
    const matchingSample = sampleMapping.find((sample) =>
      mode === 'encode' ? sample.plain === inputText : sample.encoded === inputText
    )

    if (matchingSample) {
      // Switch to corresponding sample in new mode
      setInputText(newMode === 'encode' ? matchingSample.plain : matchingSample.encoded)
    } else if (result.output && result.isValid) {
      // If we have valid output, use it as input for the opposite mode
      setInputText(result.output)
    } else if (inputText.trim()) {
      // If we have input text but no valid output, try to convert it anyway
      // This handles cases where user has invalid input but we still want to swap
      try {
        if (mode === 'encode') {
          // Current mode is encode, switching to decode
          // Try to decode current input if it looks like Base64
          const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/
          if (base64Regex.test(inputText.replace(/\s/g, ''))) {
            const decoded = decodeURIComponent(escape(atob(inputText.replace(/\s/g, ''))))
            setInputText(decoded)
          }
          // If not valid Base64, keep current input
        } else {
          // Current mode is decode, switching to encode
          // Encode current input
          const encoded = btoa(unescape(encodeURIComponent(inputText)))
          setInputText(encoded)
        }
      } catch (error) {
        // If conversion fails, keep current input
        // User will see the error in the new mode
      }
    }
    // If no input text, do nothing (keep empty)
  }, [mode, result, inputText])

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
              throw new Error(tErrors('imageReadError'))
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
              throw new Error(tErrors('fileReadError'))
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
              : 'Dekodlash uchun faqat matn fayllarni yuklash mumkin.'
          )
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Faylni yuklashda xatolik yuz berdi.'
        alert(errorMessage)
        setIsProcessing(false)
      }
    },
    [mode]
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
