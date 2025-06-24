import { useState, useCallback, useMemo } from 'react'

export type HashAlgorithm = 'MD5' | 'SHA1' | 'SHA256' | 'SHA512'

export interface HashResult {
  algorithm: HashAlgorithm
  hash: string
  length: number
  security: 'Low' | 'Medium' | 'High' | 'Very High'
  status: 'deprecated' | 'weak' | 'secure' | 'recommended'
}

interface UseHashGeneratorProps {
  onSuccess?: (message: string) => void
  onError?: (error: string) => void
}

// Sample data constants
const SAMPLE_TEXTS = [
  { label: 'Hello World', value: 'Hello, World!' },
  { label: 'Salom Dunyo', value: 'Salom, Dunyo!' },
  { label: 'Lorem Ipsum', value: 'Lorem ipsum dolor sit amet consectetur adipiscing elit' },
  { label: 'Test String', value: 'Bu test matni hash yaratish uchun' },
  { label: 'Password Example', value: 'MySecurePassword123!' },
  { label: 'JSON Data', value: '{"name": "John", "age": 30, "active": true}' },
] as const

// Available algorithms with metadata
const ALGORITHM_INFO = {
  MD5: {
    security: 'Low' as const,
    status: 'deprecated' as const,
    description: 'Zaif, faqat demo uchun',
    outputLength: 32,
    recommendation: 'Ishlatmang - deprecated',
  },
  SHA1: {
    security: 'Medium' as const,
    status: 'weak' as const,
    description: 'Deprecated, ishlatmang',
    outputLength: 40,
    recommendation: 'Zaif - faqat legacy uchun',
  },
  SHA256: {
    security: 'High' as const,
    status: 'secure' as const,
    description: 'Xavfsiz va tez',
    outputLength: 64,
    recommendation: 'Tavsiya etiladi',
  },
  SHA512: {
    security: 'Very High' as const,
    status: 'recommended' as const,
    description: 'Eng xavfsiz',
    outputLength: 128,
    recommendation: 'Eng yaxshi tanlov',
  },
} as const

const AVAILABLE_ALGORITHMS: HashAlgorithm[] = ['MD5', 'SHA1', 'SHA256', 'SHA512']

// File validation constants
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_FILE_TYPES = ['.txt', '.json', '.csv', '.md', '.xml', '.log']

export const useHashGenerator = ({ onSuccess, onError }: UseHashGeneratorProps = {}) => {
  const [inputText, setInputText] = useState('')
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<HashAlgorithm[]>(['SHA256'])
  const [hashResults, setHashResults] = useState<HashResult[]>([])
  const [isGenerating, setIsGenerating] = useState(false)

  // Simple MD5 implementation for demo purposes
  const simpleMD5 = useCallback((text: string): string => {
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }
    return Math.abs(hash).toString(16).padStart(8, '0').repeat(4).substring(0, 32)
  }, [])

  // Generate hash for specific algorithm
  const generateHash = useCallback(
    async (text: string, algorithm: HashAlgorithm): Promise<string> => {
      if (!text.trim()) throw new Error('Matn kiritilmagan')

      const encoder = new TextEncoder()
      const data = encoder.encode(text)

      try {
        switch (algorithm) {
          case 'MD5':
            return simpleMD5(text)

          case 'SHA1': {
            const hashBuffer = await crypto.subtle.digest('SHA-1', data)
            return Array.from(new Uint8Array(hashBuffer))
              .map((b) => b.toString(16).padStart(2, '0'))
              .join('')
          }

          case 'SHA256': {
            const hashBuffer = await crypto.subtle.digest('SHA-256', data)
            return Array.from(new Uint8Array(hashBuffer))
              .map((b) => b.toString(16).padStart(2, '0'))
              .join('')
          }

          case 'SHA512': {
            const hashBuffer = await crypto.subtle.digest('SHA-512', data)
            return Array.from(new Uint8Array(hashBuffer))
              .map((b) => b.toString(16).padStart(2, '0'))
              .join('')
          }

          default:
            throw new Error(`Noma'lum algoritm: ${algorithm}`)
        }
      } catch (error) {
        throw new Error(`${algorithm} hash yaratishda xatolik`)
      }
    },
    [simpleMD5],
  )

  // Generate all selected hashes
  const generateAllHashes = useCallback(async () => {
    if (!inputText.trim()) {
      onError?.('Matn kiritilmagan')
      return
    }

    if (selectedAlgorithms.length === 0) {
      onError?.('Kamida bitta algoritm tanlang')
      return
    }

    setIsGenerating(true)
    const newResults: HashResult[] = []

    try {
      for (const algorithm of selectedAlgorithms) {
        const hash = await generateHash(inputText, algorithm)
        const info = ALGORITHM_INFO[algorithm]

        newResults.push({
          algorithm,
          hash,
          length: hash.length,
          security: info.security,
          status: info.status,
        })
      }

      setHashResults(newResults)
      onSuccess?.(`${selectedAlgorithms.length} ta hash muvaffaqiyatli yaratildi`)
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Hash yaratishda xatolik')
    } finally {
      setIsGenerating(false)
    }
  }, [inputText, selectedAlgorithms, generateHash, onSuccess, onError])

  // Auto-generate on text/algorithm change
  const handleTextChange = useCallback(
    (text: string) => {
      setInputText(text)
      if (text.trim() && selectedAlgorithms.length > 0) {
        // Debounced auto-generation
        const timer = setTimeout(() => {
          generateAllHashes()
        }, 500)
        return () => clearTimeout(timer)
      } else {
        setHashResults([])
      }
    },
    [selectedAlgorithms, generateAllHashes],
  )

  // Toggle algorithm selection
  const toggleAlgorithm = useCallback(
    (algorithm: HashAlgorithm) => {
      setSelectedAlgorithms((prev) => {
        const updated = prev.includes(algorithm) ? prev.filter((a) => a !== algorithm) : [...prev, algorithm]

        // Auto-regenerate if text exists
        if (inputText.trim() && updated.length > 0) {
          setTimeout(() => generateAllHashes(), 100)
        }

        return updated
      })
    },
    [inputText, generateAllHashes],
  )

  // Clear all data
  const handleClear = useCallback(() => {
    setInputText('')
    setHashResults([])
  }, [])

  // Handle file upload with validation
  const handleFileUpload = useCallback(
    (file: File) => {
      // File size validation
      if (file.size > MAX_FILE_SIZE) {
        onError?.(`Fayl hajmi ${MAX_FILE_SIZE / 1024 / 1024}MB dan katta bo'lmasligi kerak`)
        return
      }

      // File type validation
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
      if (!ALLOWED_FILE_TYPES.includes(fileExtension)) {
        onError?.(`Faqat ${ALLOWED_FILE_TYPES.join(', ')} fayl turlari qo'llab-quvvatlanadi`)
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        if (content) {
          setInputText(content)
          onSuccess?.(`Fayl muvaffaqiyatli yuklandi: ${file.name}`)
        }
      }
      reader.onerror = () => {
        onError?.("Faylni o'qishda xatolik yuz berdi")
      }
      reader.readAsText(file)
    },
    [onSuccess, onError],
  )

  // Download hashes as TXT
  const downloadHashes = useCallback(() => {
    if (hashResults.length === 0) {
      onError?.('Yuklab olish uchun hash mavjud emas')
      return
    }

    const content = [
      '=== HASH GENERATOR NATIJALARI ===',
      '',
      `Yaratilgan vaqt: ${new Date().toLocaleString('uz-UZ')}`,
      `Matn uzunligi: ${inputText.length} belgi`,
      `Tanlangan algoritmlar: ${selectedAlgorithms.join(', ')}`,
      '',
      '=== HASH NATIJALARI ===',
      '',
      ...hashResults.map((result) => {
        const info = ALGORITHM_INFO[result.algorithm]
        return [
          `${result.algorithm}:`,
          `  Hash: ${result.hash}`,
          `  Xavfsizlik: ${info.recommendation}`,
          `  Uzunlik: ${result.length} belgi`,
          '',
        ].join('\n')
      }),
      '=== MATN NAMUNASI ===',
      '',
      inputText.substring(0, 500) + (inputText.length > 500 ? '...' : ''),
    ].join('\n')

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hash-natijalari-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    onSuccess?.('Hash natijalari TXT formatda yuklab olindi')
  }, [hashResults, inputText, selectedAlgorithms, onSuccess, onError])

  // Download as JSON
  const downloadAsJson = useCallback(() => {
    if (hashResults.length === 0) {
      onError?.('Yuklab olish uchun hash mavjud emas')
      return
    }

    const data = {
      metadata: {
        generated_at: new Date().toISOString(),
        input_length: inputText.length,
        algorithms_count: selectedAlgorithms.length,
        tool: 'Webiston Hash Generator',
      },
      input: {
        text: inputText,
        preview: inputText.substring(0, 100) + (inputText.length > 100 ? '...' : ''),
      },
      algorithms: selectedAlgorithms,
      results: hashResults.map((result) => ({
        algorithm: result.algorithm,
        hash: result.hash,
        length: result.length,
        security: result.security,
        status: result.status,
        recommendation: ALGORITHM_INFO[result.algorithm].recommendation,
      })),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hash-natijalari-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    onSuccess?.('Hash natijalari JSON formatda yuklab olindi')
  }, [hashResults, inputText, selectedAlgorithms, onSuccess, onError])

  // Get algorithm information
  const getAlgorithmInfo = useCallback((algorithm: HashAlgorithm) => {
    return ALGORITHM_INFO[algorithm]
  }, [])

  // Input statistics
  const inputStats = useMemo(() => {
    if (!inputText) {
      return [
        { label: 'belgi', value: 0 },
        { label: "so'z", value: 0 },
        { label: 'qator', value: 0 },
      ]
    }

    const words = inputText.trim() ? inputText.trim().split(/\s+/).length : 0
    const lines = inputText.split('\n').length

    return [
      { label: 'belgi', value: inputText.length },
      { label: "so'z", value: words },
      { label: 'qator', value: lines },
    ]
  }, [inputText])

  // Output statistics
  const outputStats = useMemo(() => {
    if (hashResults.length === 0) {
      return [
        { label: 'algoritm', value: 0 },
        { label: 'hash', value: 0 },
        { label: 'belgi', value: 0 },
      ]
    }

    const totalChars = hashResults.reduce((acc, result) => acc + result.hash.length, 0)

    return [
      { label: 'algoritm', value: hashResults.length },
      { label: 'hash', value: hashResults.length },
      { label: 'belgi', value: totalChars },
    ]
  }, [hashResults])

  return {
    // State
    inputText,
    selectedAlgorithms,
    hashResults,
    isGenerating,
    inputStats,
    outputStats,
    availableAlgorithms: AVAILABLE_ALGORITHMS,
    sampleTexts: SAMPLE_TEXTS,

    // Actions
    setInputText: handleTextChange,
    generateAllHashes,
    toggleAlgorithm,
    handleClear,
    handleFileUpload,
    downloadHashes,
    downloadAsJson,

    // Utilities
    getAlgorithmInfo,
  }
}
