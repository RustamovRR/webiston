import { useState, useCallback, useMemo } from 'react'

export type UuidVersion = 'v4' | 'v1' | 'nil'
export type UuidFormat = 'standard' | 'compact' | 'brackets' | 'uppercase'

export interface GeneratedUuid {
  id: string
  uuid: string
  timestamp: number
  version: UuidVersion
  format: UuidFormat
}

interface UseUuidGeneratorProps {
  onSuccess?: (message: string) => void
  onError?: (error: string) => void
}

// Sample data constants
const SAMPLE_COUNTS = [
  { label: '1 UUID', value: 1 },
  { label: '5 UUID', value: 5 },
  { label: '10 UUID', value: 10 },
  { label: '50 UUID', value: 50 },
  { label: '100 UUID', value: 100 },
] as const

// UUID version info
const UUID_VERSION_INFO = {
  v4: {
    name: 'UUID v4',
    description: 'Random-based UUID',
    icon: 'Shuffle',
    security: 'High',
    recommended: true,
  },
  v1: {
    name: 'UUID v1',
    description: 'Timestamp-based UUID',
    icon: 'Clock',
    security: 'Medium',
    recommended: false,
  },
  nil: {
    name: 'NIL UUID',
    description: 'All zeros UUID',
    icon: 'Hash',
    security: 'None',
    recommended: false,
  },
} as const

// UUID format info
const UUID_FORMAT_INFO = {
  standard: {
    name: 'Standard',
    description: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
    example: '550e8400-e29b-41d4-a716-446655440000',
  },
  compact: {
    name: 'Compact',
    description: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    example: '550e8400e29b41d4a716446655440000',
  },
  brackets: {
    name: 'Brackets',
    description: '{xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx}',
    example: '{550e8400-e29b-41d4-a716-446655440000}',
  },
  uppercase: {
    name: 'Uppercase',
    description: 'XXXXXXXX-XXXX-XXXX-XXXX-XXXXXXXXXXXX',
    example: '550E8400-E29B-41D4-A716-446655440000',
  },
} as const

export const useUuidGenerator = ({ onSuccess, onError }: UseUuidGeneratorProps = {}) => {
  const [uuids, setUuids] = useState<GeneratedUuid[]>([])
  const [count, setCount] = useState(1)
  const [version, setVersion] = useState<UuidVersion>('v4')
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
          version,
          format,
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

  // Set count with validation
  const setCountSafe = useCallback((newCount: number) => {
    const validCount = Math.max(1, Math.min(1000, newCount))
    setCount(validCount)
  }, [])

  // Load sample count
  const loadSampleCount = useCallback(
    (sampleCount: number) => {
      setCountSafe(sampleCount)
    },
    [setCountSafe],
  )

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
      case '4':
        version = 'v4 (random)'
        break
      default:
        version = 'Unknown'
    }

    let variant: string
    const variantInt = parseInt(variantBits, 16)
    if ((variantInt & 0x8) === 0) variant = 'NCS'
    else if ((variantInt & 0xc) === 0x8) variant = 'RFC 4122'
    else variant = 'Other'

    return {
      version,
      variant,
      isValid: true,
      timestamp: versionDigit === '1' ? parseInt(cleanUuid.substring(0, 12), 16) : null,
    }
  }, [])

  // Download UUIDs as TXT
  const downloadUuids = useCallback(() => {
    if (uuids.length === 0) {
      onError?.('Yuklab olish uchun UUID mavjud emas')
      return
    }

    const content = [
      '=== UUID GENERATOR NATIJALARI ===',
      '',
      `Yaratilgan vaqt: ${new Date().toLocaleString('uz-UZ')}`,
      `UUID soni: ${uuids.length}`,
      `Versiya: ${UUID_VERSION_INFO[version].name}`,
      `Format: ${UUID_FORMAT_INFO[format].name}`,
      '',
      "=== UUID RO'YXATI ===",
      '',
      ...uuids.map((item, index) => `${index + 1}. ${item.uuid}`),
      '',
      "=== QISQACHA MA'LUMOT ===",
      '',
      `Jami: ${uuids.length} ta UUID`,
      `Noyob: ${new Set(uuids.map((u) => u.uuid)).size} ta`,
      `Format: ${UUID_FORMAT_INFO[format].description}`,
    ].join('\n')

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `uuid-natijalari-${Date.now()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    onSuccess?.('UUID natijalari TXT formatda yuklab olindi')
  }, [uuids, version, format, onSuccess, onError])

  // Download as JSON
  const downloadAsJson = useCallback(() => {
    if (uuids.length === 0) {
      onError?.('Yuklab olish uchun UUID mavjud emas')
      return
    }

    const data = {
      metadata: {
        generated_at: new Date().toISOString(),
        count: uuids.length,
        version: UUID_VERSION_INFO[version].name,
        format: UUID_FORMAT_INFO[format].name,
        tool: 'Webiston UUID Generator',
      },
      settings: {
        version,
        format,
        count,
      },
      uuids: uuids.map((item, index) => ({
        index: index + 1,
        uuid: item.uuid,
        version: item.version,
        format: item.format,
        timestamp: item.timestamp,
        generated_at: new Date(item.timestamp).toISOString(),
      })),
      statistics: {
        total: uuids.length,
        unique: new Set(uuids.map((u) => u.uuid)).size,
        format_info: UUID_FORMAT_INFO[format],
        version_info: UUID_VERSION_INFO[version],
      },
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `uuid-natijalari-${Date.now()}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    onSuccess?.('UUID natijalari JSON formatda yuklab olindi')
  }, [uuids, version, format, count, onSuccess, onError])

  // Get version info
  const getVersionInfo = useCallback((version: UuidVersion) => {
    return UUID_VERSION_INFO[version]
  }, [])

  // Get format info
  const getFormatInfo = useCallback((format: UuidFormat) => {
    return UUID_FORMAT_INFO[format]
  }, [])

  // Statistics
  const stats = useMemo(() => {
    if (uuids.length === 0) {
      return {
        total: 0,
        unique: 0,
        duplicates: 0,
        bytes: 0,
      }
    }

    const uniqueUuids = new Set(uuids.map((u) => u.uuid))
    const totalBytes = uuids.reduce((acc, u) => acc + u.uuid.length, 0)

    return {
      total: uuids.length,
      unique: uniqueUuids.size,
      duplicates: uuids.length - uniqueUuids.size,
      bytes: totalBytes,
    }
  }, [uuids])

  // Input statistics
  const inputStats = useMemo(
    () => [
      { label: 'soni', value: count },
      { label: 'versiya', value: version.toUpperCase() },
      { label: 'format', value: format },
    ],
    [count, version, format],
  )

  // Output statistics
  const outputStats = useMemo(
    () => [
      { label: 'jami', value: stats.total },
      { label: 'noyob', value: stats.unique },
      { label: 'bayt', value: stats.bytes },
    ],
    [stats],
  )

  return {
    // State
    uuids,
    count,
    version,
    format,
    isGenerating,
    stats,
    inputStats,
    outputStats,
    sampleCounts: SAMPLE_COUNTS,

    // Actions
    setCount: setCountSafe,
    setVersion,
    setFormat,
    handleGenerate,
    handleClear,
    downloadUuids,
    downloadAsJson,
    loadSampleCount,

    // Utilities
    validateUuid,
    getUuidInfo,
    getVersionInfo,
    getFormatInfo,
  }
}
