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
  initialSize?: QrSize
  initialErrorLevel?: QrErrorLevel
  onSuccess?: (message: string) => void
  onError?: (error: string) => void
}

export const useQrGenerator = ({
  initialSize = 200,
  initialErrorLevel = 'M',
  onSuccess,
  onError,
}: UseQrGeneratorProps = {}) => {
  const [inputText, setInputText] = useState('')
  const [qrSize, setQrSize] = useState<QrSize>(initialSize)
  const [errorLevel, setErrorLevel] = useState<QrErrorLevel>(initialErrorLevel)
  const [isGenerating, setIsGenerating] = useState(false)

  // QR code presets
  const presets: QrPreset[] = useMemo(
    () => [
      {
        label: 'Website URL',
        value: 'https://webiston.uz',
        description: 'Website havolasi',
        category: 'url',
      },
      {
        label: 'Email',
        value: 'mailto:info@webiston.uz?subject=Salom&body=Assalomu aleykum!',
        description: 'Email manzili',
        category: 'contact',
      },
      {
        label: 'Phone',
        value: 'tel:+998901234567',
        description: 'Telefon raqami',
        category: 'contact',
      },
      {
        label: 'SMS',
        value: 'sms:+998901234567?body=Salom! Qanday ahvolingiz?',
        description: 'SMS xabari',
        category: 'sms',
      },
      {
        label: 'WiFi',
        value: 'WIFI:T:WPA;S:MyNetwork;P:MyPassword;H:false;',
        description: "WiFi ulanish ma'lumotlari",
        category: 'wifi',
      },
      {
        label: 'vCard',
        value:
          'BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nORG:Webiston\nTEL:+998901234567\nEMAIL:john@webiston.uz\nEND:VCARD',
        description: 'Kontakt kartasi',
        category: 'contact',
      },
      {
        label: 'Location',
        value: 'geo:41.311151,69.279737?q=Tashkent,Uzbekistan',
        description: 'Geografik joylashuv',
        category: 'text',
      },
      {
        label: 'YouTube',
        value: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
        description: 'YouTube video',
        category: 'url',
      },
    ],
    [],
  )

  // Generate QR code URL
  const generateQrUrl = useCallback((text: string, size: QrSize, errorCorrectionLevel: QrErrorLevel) => {
    if (!text.trim()) return ''

    const encodedText = encodeURIComponent(text)
    const baseUrl = 'https://api.qrserver.com/v1/create-qr-code/'
    const params = new URLSearchParams({
      size: `${size}x${size}`,
      data: encodedText,
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
        a.download = filename || `qrcode-${Date.now()}.png`
        a.click()

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

  // Handle file upload
  const handleFileUpload = useCallback(
    (file: File) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
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
    if (!text.trim()) return 'empty'

    // URL detection
    if (text.match(/^https?:\/\//i)) return 'url'

    // Email detection
    if (text.match(/^mailto:/i) || text.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) return 'email'

    // Phone detection
    if (text.match(/^tel:/i) || text.match(/^\+?[\d\s\-\(\)]{7,}$/)) return 'phone'

    // SMS detection
    if (text.match(/^sms:/i)) return 'sms'

    // WiFi detection
    if (text.match(/^WIFI:/i)) return 'wifi'

    // vCard detection
    if (text.match(/^BEGIN:VCARD/i)) return 'vcard'

    // Location detection
    if (text.match(/^geo:/i)) return 'location'

    return 'text'
  }, [])

  // Input statistics
  const inputStats = useMemo(() => {
    const encoder = new TextEncoder()
    const bytes = encoder.encode(inputText).length
    const type = detectInputType(inputText)

    return [
      { label: 'Characters', value: inputText.length },
      { label: 'Bytes', value: bytes },
      { label: 'Type', value: type },
      { label: 'Size', value: qrSize },
    ]
  }, [inputText, qrSize, detectInputType])

  // Available sizes
  const availableSizes: QrSize[] = [150, 200, 300, 400]

  // Available error levels
  const errorLevels: { value: QrErrorLevel; label: string; description: string }[] = [
    { value: 'L', label: 'Low (7%)', description: 'Eng kam xato tuzatish' },
    { value: 'M', label: 'Medium (15%)', description: "O'rtacha xato tuzatish" },
    { value: 'Q', label: 'Quartile (25%)', description: 'Yuqori xato tuzatish' },
    { value: 'H', label: 'High (30%)', description: 'Eng yuqori xato tuzatish' },
  ]

  // Group presets by category
  const groupedPresets = useMemo(() => {
    return presets.reduce(
      (acc, preset) => {
        if (!acc[preset.category]) {
          acc[preset.category] = []
        }
        acc[preset.category].push(preset)
        return acc
      },
      {} as Record<string, QrPreset[]>,
    )
  }, [presets])

  return {
    // State
    inputText,
    qrSize,
    errorLevel,
    qrUrl,
    isGenerating,
    inputStats,
    presets,
    groupedPresets,
    availableSizes,
    errorLevels,

    // Setters
    setInputText,
    setQrSize,
    setErrorLevel,

    // Actions
    handlePresetSelect,
    handleClear,
    downloadQr,
    handleFileUpload,

    // Utilities
    generateQrUrl,
    detectInputType,
  }
}
