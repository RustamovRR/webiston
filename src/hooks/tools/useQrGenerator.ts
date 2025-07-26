import { useState, useCallback, useMemo } from 'react'

export type QrSize = 150 | 200 | 300 | 400
export type QrErrorLevel = 'L' | 'M' | 'Q' | 'H'

export interface QrPreset {
  label: string
  value: string
  description: string
  category: 'url' | 'contact' | 'text' | 'wifi' | 'sms'
}

interface UseQrGeneratorProps {
  onSuccess?: (message: string) => void
  onError?: (error: string) => void
}

// Sample data constants
const SAMPLE_PRESETS: QrPreset[] = [
  {
    label: 'Website URL',
    value: 'https://webiston.uz',
    description: 'Website havolasi',
    category: 'url',
  },
  {
    label: 'GitHub Profile',
    value: 'https://github.com/webiston',
    description: 'GitHub profil sahifasi',
    category: 'url',
  },
  {
    label: 'YouTube Channel',
    value: 'https://youtube.com/@webiston',
    description: 'YouTube kanal',
    category: 'url',
  },
  {
    label: 'Email Contact',
    value: 'mailto:info@webiston.uz?subject=Salom&body=Assalomu aleykum!',
    description: 'Email manzili',
    category: 'contact',
  },
  {
    label: 'Phone Number',
    value: 'tel:+998901234567',
    description: 'Telefon raqami',
    category: 'contact',
  },
  {
    label: 'vCard Contact',
    value:
      'BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nORG:Webiston\nTEL:+998901234567\nEMAIL:john@webiston.uz\nURL:https://webiston.uz\nEND:VCARD',
    description: 'Kontakt kartasi',
    category: 'contact',
  },
  {
    label: 'SMS Message',
    value: 'sms:+998901234567?body=Salom! Qanday ahvolingiz?',
    description: 'SMS xabari',
    category: 'sms',
  },
  {
    label: 'WhatsApp Message',
    value: 'https://wa.me/998901234567?text=Salom!%20Qanday%20yordam%20kerak?',
    description: 'WhatsApp xabari',
    category: 'sms',
  },
  {
    label: 'WiFi Network',
    value: 'WIFI:T:WPA;S:MyNetwork;P:MyPassword;H:false;',
    description: 'WiFi ulanish',
    category: 'wifi',
  },
  {
    label: 'WiFi Guest',
    value: 'WIFI:T:WPA;S:GuestNetwork;P:guest123;H:false;',
    description: 'Mehmon WiFi',
    category: 'wifi',
  },
  {
    label: 'Simple Text',
    value: "Bu oddiy matn. QR kod orqali o'qish mumkin.",
    description: 'Oddiy matn',
    category: 'text',
  },
  {
    label: 'Location',
    value: 'geo:41.311151,69.279737?q=Tashkent,Uzbekistan',
    description: 'Geografik joylashuv',
    category: 'text',
  },
]

// QR size options with descriptions
const QR_SIZE_OPTIONS = [
  { value: 150, label: '150x150', description: 'Kichik' },
  { value: 200, label: '200x200', description: "O'rtacha" },
  { value: 300, label: '300x300', description: 'Katta' },
  { value: 400, label: '400x400', description: 'Juda katta' },
] as const

// Error correction levels with descriptions
const ERROR_LEVELS = [
  { value: 'L', label: 'Past (L)', description: '~7% tiklash' },
  { value: 'M', label: "O'rtacha (M)", description: '~15% tiklash' },
  { value: 'Q', label: 'Yuqori (Q)', description: '~25% tiklash' },
  { value: 'H', label: 'Maksimal (H)', description: '~30% tiklash' },
] as const

export const useQrGenerator = ({ onSuccess, onError }: UseQrGeneratorProps = {}) => {
  const [inputText, setInputText] = useState('')
  const [qrSize, setQrSize] = useState<QrSize>(300)
  const [errorLevel, setErrorLevel] = useState<QrErrorLevel>('M')
  const [isGenerating, setIsGenerating] = useState(false)

  // Generate QR code URL
  const generateQrUrl = useCallback((text: string, size: QrSize, errorCorrectionLevel: QrErrorLevel) => {
    if (!text.trim()) return ''

    const baseUrl = 'https://api.qrserver.com/v1/create-qr-code/'
    const params = new URLSearchParams({
      size: `${size}x${size}`,
      data: text, // URLSearchParams avtomatik encode qiladi, qo'shimcha encoding kerak emas
      ecc: errorCorrectionLevel,
      format: 'png',
      margin: '10',
    })

    return `${baseUrl}?${params.toString()}`
  }, [])

  // Current QR URL
  const qrUrl = useMemo(() => {
    return generateQrUrl(inputText, qrSize, errorLevel)
  }, [inputText, qrSize, errorLevel, generateQrUrl])

  // Handle preset selection
  const handlePresetSelect = useCallback(
    (preset: QrPreset) => {
      setInputText(preset.value)
      onSuccess?.(`"${preset.label}" namunasi yuklandi`)
    },
    [onSuccess],
  )

  // Set text with validation
  const setTextSafe = useCallback(
    (text: string) => {
      if (text.length > 2000) {
        onError?.('Matn 2000 belgidan oshmasligi kerak')
        return
      }
      setInputText(text)
    },
    [onError],
  )

  // Clear input
  const handleClear = useCallback(() => {
    setInputText('')
  }, [])

  // Download QR code
  const downloadQr = useCallback(
    async (filename?: string) => {
      if (!qrUrl) {
        onError?.('QR kod mavjud emas')
        return
      }

      try {
        setIsGenerating(true)

        const response = await fetch(qrUrl)
        if (!response.ok) throw new Error("QR kod yuklab bo'lmadi")

        const blob = await response.blob()
        const url = URL.createObjectURL(blob)

        const a = document.createElement('a')
        a.href = url
        a.download = filename || `qr-kod-${Date.now()}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)

        URL.revokeObjectURL(url)
        onSuccess?.('QR kod muvaffaqiyatli yuklab olindi')
      } catch (error) {
        onError?.('QR kod yuklab olishda xatolik yuz berdi')
      } finally {
        setIsGenerating(false)
      }
    },
    [qrUrl, onSuccess, onError],
  )

  // Handle file upload with validation
  const handleFileUpload = useCallback(
    (file: File) => {
      // File validation
      const maxSize = 1 * 1024 * 1024 // 1MB
      const allowedTypes = ['text/plain', 'application/json', 'text/csv', 'text/markdown']

      if (file.size > maxSize) {
        onError?.('Fayl hajmi 1MB dan oshmasligi kerak')
        return
      }

      if (!allowedTypes.includes(file.type) && !file.name.match(/\.(txt|json|csv|md)$/i)) {
        onError?.("Faqat TXT, JSON, CSV, MD fayl turlari qo'llab-quvvatlanadi")
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        if (content.length > 2000) {
          onError?.('Fayl tarkibi 2000 belgidan oshmasligi kerak')
          return
        }
        setInputText(content)
        onSuccess?.('Fayl muvaffaqiyatli yuklandi')
      }
      reader.onerror = () => {
        onError?.("Faylni o'qishda xatolik yuz berdi")
      }
      reader.readAsText(file)
    },
    [onSuccess, onError],
  )

  // Detect input type
  const detectInputType = useCallback((text: string) => {
    if (!text.trim()) return "Bo'sh"

    // URL detection
    if (text.match(/^https?:\/\//i)) return 'URL'

    // Email detection
    if (text.match(/^mailto:/i) || text.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return 'Email'

    // Phone detection
    if (text.match(/^tel:/i) || text.match(/^\+?[\d\s\-\(\)]{7,}$/)) return 'Telefon'

    // SMS detection
    if (text.match(/^sms:/i)) return 'SMS'

    // WiFi detection
    if (text.match(/^WIFI:/i)) return 'WiFi'

    // vCard detection
    if (text.match(/^BEGIN:VCARD/i)) return 'vCard'

    // Location detection
    if (text.match(/^geo:/i)) return 'Joylashuv'

    return 'Matn'
  }, [])

  // Group presets by category
  const groupedPresets = useMemo(() => {
    return SAMPLE_PRESETS.reduce(
      (acc, preset) => {
        if (!acc[preset.category]) {
          acc[preset.category] = []
        }
        acc[preset.category].push(preset)
        return acc
      },
      {} as Record<string, QrPreset[]>,
    )
  }, [])

  // Statistics
  const stats = useMemo(() => {
    const textLength = inputText.length
    const lines = inputText.split('\n').length
    const words = inputText.trim() ? inputText.trim().split(/\s+/).length : 0

    return {
      characters: textLength,
      words,
      lines,
      qrSize: qrSize,
      errorLevel,
    }
  }, [inputText, qrSize, errorLevel])

  // Input statistics
  const inputStats = useMemo(
    () => [
      { label: 'belgi', value: stats.characters },
      { label: "so'z", value: stats.words },
      { label: 'qator', value: stats.lines },
    ],
    [stats],
  )

  // Output statistics
  const outputStats = useMemo(
    () => [
      { label: "o'lcham", value: stats.qrSize },
      { label: 'xato tuzatish', value: 0 }, // will display as string
      { label: 'turi', value: 0 }, // will display as string
    ],
    [stats],
  )

  return {
    // State
    inputText,
    qrUrl,
    qrSize,
    errorLevel,
    isGenerating,
    stats,
    inputStats,
    outputStats,

    // Data
    presets: SAMPLE_PRESETS,
    groupedPresets,
    availableSizes: QR_SIZE_OPTIONS,
    errorLevels: ERROR_LEVELS,

    // Actions
    setInputText: setTextSafe,
    setQrSize,
    setErrorLevel,
    handlePresetSelect,
    handleClear,
    downloadQr,
    handleFileUpload,

    // Utilities
    detectInputType,
    generateQrUrl,
  }
}
