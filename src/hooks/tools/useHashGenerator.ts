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
  initialAlgorithms?: HashAlgorithm[]
  onSuccess?: (message: string) => void
  onError?: (error: string) => void
}

export const useHashGenerator = ({
  initialAlgorithms = ['MD5', 'SHA256'],
  onSuccess,
  onError,
}: UseHashGeneratorProps = {}) => {
  const [inputText, setInputText] = useState('')
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<HashAlgorithm[]>(initialAlgorithms)
  const [hashes, setHashes] = useState<Record<HashAlgorithm, string>>({} as Record<HashAlgorithm, string>)
  const [isGenerating, setIsGenerating] = useState(false)

  // Simple MD5 implementation (for demo purposes)
  const simpleMD5 = useCallback((text: string): string => {
    // This is a simplified MD5 for demo. In production, use a proper library.
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0').repeat(4).substring(0, 32)
  }, [])

  // Generate hash for a specific algorithm
  const generateHash = useCallback(
    async (text: string, algorithm: HashAlgorithm): Promise<string> => {
      const encoder = new TextEncoder()
      const data = encoder.encode(text)

      try {
        let hashBuffer: ArrayBuffer

        switch (algorithm) {
          case 'SHA1':
            hashBuffer = await crypto.subtle.digest('SHA-1', data)
            break
          case 'SHA256':
            hashBuffer = await crypto.subtle.digest('SHA-256', data)
            break
          case 'SHA512':
            hashBuffer = await crypto.subtle.digest('SHA-512', data)
            break
          case 'MD5':
            // MD5 is not available in Web Crypto API, using a simple implementation
            return simpleMD5(text)
          default:
            throw new Error(`Noma'lum algoritm: ${algorithm}`)
        }

        const hashArray = Array.from(new Uint8Array(hashBuffer))
        return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
      } catch (error) {
        throw new Error('Hash yaratishda xatolik')
      }
    },
    [simpleMD5],
  )

  // Generate all hashes
  const generateAllHashes = useCallback(async () => {
    if (!inputText.trim()) {
      setHashes({} as Record<HashAlgorithm, string>)
      return
    }

    setIsGenerating(true)

    try {
      const newHashes: Record<HashAlgorithm, string> = {} as Record<HashAlgorithm, string>

      for (const algorithm of selectedAlgorithms) {
        newHashes[algorithm] = await generateHash(inputText, algorithm)
      }

      setHashes(newHashes)
      onSuccess?.(`${selectedAlgorithms.length} ta hash muvaffaqiyatli yaratildi`)
    } catch (error) {
      onError?.('Hash yaratishda xatolik yuz berdi')
    } finally {
      setIsGenerating(false)
    }
  }, [inputText, selectedAlgorithms, generateHash, onSuccess, onError])

  // Toggle algorithm selection
  const toggleAlgorithm = useCallback((algorithm: HashAlgorithm) => {
    setSelectedAlgorithms((prev) =>
      prev.includes(algorithm) ? prev.filter((a) => a !== algorithm) : [...prev, algorithm],
    )
  }, [])

  // Clear all data
  const handleClear = useCallback(() => {
    setInputText('')
    setHashes({} as Record<HashAlgorithm, string>)
  }, [])

  // Handle file upload
  const handleFileUpload = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setInputText(content)
    }
    reader.readAsText(file)
  }, [])

  // Download all hashes
  const downloadHashes = useCallback(() => {
    if (Object.keys(hashes).length === 0) {
      onError?.("Yuklab olish uchun hash lar yo'q")
      return
    }

    const content = Object.entries(hashes)
      .map(([algorithm, hash]) => `${algorithm}: ${hash}`)
      .join('\n')

    const additionalInfo = [
      '',
      "--- Ma'lumot ---",
      `Input text: ${inputText.substring(0, 100)}${inputText.length > 100 ? '...' : ''}`,
      `Text length: ${inputText.length} characters`,
      `Generated at: ${new Date().toLocaleString()}`,
      `Algorithms used: ${selectedAlgorithms.join(', ')}`,
    ].join('\n')

    const fullContent = content + additionalInfo

    const blob = new Blob([fullContent], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hashes-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }, [hashes, inputText, selectedAlgorithms, onError])

  // Download as JSON
  const downloadAsJson = useCallback(() => {
    if (Object.keys(hashes).length === 0) {
      onError?.("Yuklab olish uchun hash lar yo'q")
      return
    }

    const data = {
      input_text: inputText,
      input_length: inputText.length,
      generated_at: new Date().toISOString(),
      algorithms: selectedAlgorithms,
      hashes: Object.entries(hashes).map(([algorithm, hash]) => ({
        algorithm,
        hash,
        length: hash.length,
        security: getAlgorithmInfo(algorithm as HashAlgorithm).security,
        status: getAlgorithmInfo(algorithm as HashAlgorithm).status,
      })),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `hashes-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [hashes, inputText, selectedAlgorithms, onError])

  // Get algorithm information
  const getAlgorithmInfo = useCallback((algorithm: HashAlgorithm) => {
    const algorithmInfo = {
      MD5: {
        security: 'Low' as const,
        status: 'deprecated' as const,
        description: 'Zaif, faqat demo uchun',
        outputLength: 32,
      },
      SHA1: {
        security: 'Medium' as const,
        status: 'weak' as const,
        description: 'Deprecated, ishlatmang',
        outputLength: 40,
      },
      SHA256: {
        security: 'High' as const,
        status: 'secure' as const,
        description: 'Xavfsiz va tez',
        outputLength: 64,
      },
      SHA512: {
        security: 'Very High' as const,
        status: 'recommended' as const,
        description: 'Eng xavfsiz',
        outputLength: 128,
      },
    }
    return algorithmInfo[algorithm]
  }, [])

  // Hash results with metadata
  const hashResults = useMemo((): HashResult[] => {
    return Object.entries(hashes).map(([algorithm, hash]) => {
      const info = getAlgorithmInfo(algorithm as HashAlgorithm)
      return {
        algorithm: algorithm as HashAlgorithm,
        hash,
        length: hash.length,
        security: info.security,
        status: info.status,
      }
    })
  }, [hashes, getAlgorithmInfo])

  // Input statistics
  const inputStats = useMemo(() => {
    const encoder = new TextEncoder()
    const bytes = encoder.encode(inputText).length
    const words = inputText.trim() ? inputText.trim().split(/\s+/).length : 0
    const lines = inputText.split('\n').length

    return {
      characters: inputText.length,
      words,
      lines,
      bytes,
    }
  }, [inputText])

  // Available algorithms
  const availableAlgorithms: HashAlgorithm[] = ['MD5', 'SHA1', 'SHA256', 'SHA512']

  return {
    // State
    inputText,
    selectedAlgorithms,
    hashes,
    hashResults,
    isGenerating,
    inputStats,
    availableAlgorithms,

    // Setters
    setInputText,
    setSelectedAlgorithms,

    // Actions
    generateAllHashes,
    toggleAlgorithm,
    handleClear,
    handleFileUpload,
    downloadHashes,
    downloadAsJson,

    // Utilities
    getAlgorithmInfo,
    generateSingleHash: (text: string, algorithm: HashAlgorithm) => generateHash(text, algorithm),
  }
}
