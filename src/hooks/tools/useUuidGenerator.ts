import { useState, useCallback } from 'react'

export interface GeneratedUuid {
  id: string
  uuid: string
  timestamp: number
  format: 'standard' | 'compact' | 'brackets'
}

export type UuidVersion = 'v4' | 'v1' | 'nil'
export type UuidFormat = 'standard' | 'compact' | 'brackets' | 'uppercase'

interface UseUuidGeneratorProps {
  initialCount?: number
  defaultVersion?: UuidVersion
  onSuccess?: (message: string) => void
  onError?: (error: string) => void
}

export const useUuidGenerator = ({
  initialCount = 1,
  defaultVersion = 'v4',
  onSuccess,
  onError,
}: UseUuidGeneratorProps = {}) => {
  const [uuids, setUuids] = useState<GeneratedUuid[]>([])
  const [count, setCount] = useState(initialCount)
  const [version, setVersion] = useState<UuidVersion>(defaultVersion)
  const [format, setFormat] = useState<UuidFormat>('standard')
  const [isGenerating, setIsGenerating] = useState(false)

  // Generate UUID v4 (random)
  const generateUuidV4 = useCallback((): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = (Math.random() * 16) | 0
      const v = c === 'x' ? r : (r & 0x3) | 0x8
      return v.toString(16)
    })
  }, [])

  // Generate UUID v1 (timestamp based - simplified)
  const generateUuidV1 = useCallback((): string => {
    const timestamp = Date.now()
    const timeHex = timestamp.toString(16).padStart(12, '0')
    const randomPart = Math.random().toString(16).substring(2, 14)

    // Format as UUID v1 structure
    return `${timeHex.substring(0, 8)}-${timeHex.substring(8, 12)}-1${randomPart.substring(0, 3)}-${randomPart.substring(3, 7)}-${randomPart.substring(7, 11)}${Math.random().toString(16).substring(2, 6)}`
  }, [])

  // Generate NIL UUID
  const generateNilUuid = useCallback((): string => {
    return '00000000-0000-0000-0000-000000000000'
  }, [])

  // Generate UUID based on version
  const generateUuid = useCallback(
    (version: UuidVersion): string => {
      switch (version) {
        case 'v1':
          return generateUuidV1()
        case 'nil':
          return generateNilUuid()
        case 'v4':
        default:
          return generateUuidV4()
      }
    },
    [generateUuidV4, generateUuidV1, generateNilUuid],
  )

  // Format UUID based on selected format
  const formatUuid = useCallback((uuid: string, format: UuidFormat): string => {
    switch (format) {
      case 'compact':
        return uuid.replace(/-/g, '')
      case 'brackets':
        return `{${uuid}}`
      case 'uppercase':
        return uuid.toUpperCase()
      case 'standard':
      default:
        return uuid.toLowerCase()
    }
  }, [])

  // Generate multiple UUIDs
  const handleGenerate = useCallback(async () => {
    if (count < 1 || count > 1000) {
      onError?.("Soni 1 dan 1000 gacha bo'lishi kerak")
      return
    }

    setIsGenerating(true)

    try {
      const newUuids: GeneratedUuid[] = Array.from({ length: count }, (_, index) => {
        const rawUuid = generateUuid(version)
        const formattedUuid = formatUuid(rawUuid, format)

        return {
          id: `uuid_${Date.now()}_${index}`,
          uuid: formattedUuid,
          timestamp: Date.now(),
          format: format === 'standard' ? 'standard' : 'compact',
        }
      })

      setUuids(newUuids)
      onSuccess?.(`${count} ta UUID muvaffaqiyatli yaratildi`)
    } catch (error) {
      onError?.('UUID yaratishda xatolik yuz berdi')
    } finally {
      setIsGenerating(false)
    }
  }, [count, version, format, generateUuid, formatUuid, onSuccess, onError])

  // Clear all UUIDs
  const handleClear = useCallback(() => {
    setUuids([])
  }, [])

  // Validate UUID
  const validateUuid = useCallback((uuid: string): boolean => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    const compactRegex = /^[0-9a-f]{32}$/i
    const bracketRegex = /^\{[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\}$/i

    return uuidRegex.test(uuid) || compactRegex.test(uuid) || bracketRegex.test(uuid)
  }, [])

  // Get UUID info
  const getUuidInfo = useCallback((uuid: string) => {
    const cleanUuid = uuid.replace(/[{}]/g, '').replace(/-/g, '')

    if (cleanUuid.length !== 32) {
      return { version: null, variant: null, isValid: false }
    }

    const versionDigit = cleanUuid[12]
    const variantBits = cleanUuid[16]

    let version: string
    switch (versionDigit) {
      case '1':
        version = 'v1 (timestamp-based)'
        break
      case '2':
        version = 'v2 (DCE Security)'
        break
      case '3':
        version = 'v3 (name-based MD5)'
        break
      case '4':
        version = 'v4 (random)'
        break
      case '5':
        version = 'v5 (name-based SHA-1)'
        break
      default:
        version = 'Unknown'
    }

    let variant: string
    const variantInt = parseInt(variantBits, 16)
    if ((variantInt & 0x8) === 0) variant = 'NCS backward compatibility'
    else if ((variantInt & 0xc) === 0x8) variant = 'RFC 4122'
    else if ((variantInt & 0xe) === 0xc) variant = 'Microsoft backward compatibility'
    else variant = 'Future definition'

    return {
      version,
      variant,
      isValid: true,
      timestamp: versionDigit === '1' ? parseInt(cleanUuid.substring(0, 12), 16) : null,
    }
  }, [])

  // Download UUIDs
  const downloadUuids = useCallback(
    (filename: string = 'uuids.txt') => {
      if (uuids.length === 0) {
        onError?.("Yuklab olish uchun UUID lar yo'q")
        return
      }

      const content = uuids.map((item) => item.uuid).join('\n')
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    },
    [uuids, onError],
  )

  // Download as JSON
  const downloadAsJson = useCallback(() => {
    if (uuids.length === 0) {
      onError?.("Yuklab olish uchun UUID lar yo'q")
      return
    }

    const data = {
      generated_at: new Date().toISOString(),
      version,
      format,
      count: uuids.length,
      uuids: uuids.map((item) => ({
        uuid: item.uuid,
        timestamp: item.timestamp,
        created_at: new Date(item.timestamp).toISOString(),
      })),
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `uuids-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [uuids, version, format, onError])

  // Statistics
  const stats = {
    total: uuids.length,
    totalCharacters: uuids.reduce((acc, item) => acc + item.uuid.length, 0),
    averageLength:
      uuids.length > 0 ? Math.round(uuids.reduce((acc, item) => acc + item.uuid.length, 0) / uuids.length) : 0,
    uniqueCount: new Set(uuids.map((item) => item.uuid)).size,
    duplicates: uuids.length - new Set(uuids.map((item) => item.uuid)).size,
  }

  return {
    // State
    uuids,
    count,
    version,
    format,
    isGenerating,
    stats,

    // Setters
    setCount,
    setVersion,
    setFormat,

    // Actions
    handleGenerate,
    handleClear,
    downloadUuids,
    downloadAsJson,

    // Utilities
    validateUuid,
    getUuidInfo,
    formatUuid: (uuid: string, targetFormat: UuidFormat) => formatUuid(uuid, targetFormat),
    generateSingle: () => generateUuid(version),
  }
}
