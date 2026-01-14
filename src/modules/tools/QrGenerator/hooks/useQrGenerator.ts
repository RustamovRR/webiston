import React, { useState, useCallback, useMemo } from "react"

export type QrSize = 150 | 200 | 300 | 400
export type QrErrorLevel = "L" | "M" | "Q" | "H"

export interface QrPreset {
  label: string
  value: string
  description: string
  category: "url" | "contact" | "text" | "wifi" | "sms"
}

export interface QrCustomization {
  foregroundColor: string
  backgroundColor: string
  logo?: string
  logoSize: number
  cornerStyle: "square" | "rounded" | "extraRounded" | "circle"
  patternStyle: "square" | "circle" | "rounded" | "diamond"
  margin: number
  borderRadius: number
  gradientEnabled: boolean
  gradientDirection: "horizontal" | "vertical" | "diagonal" | "radial"
  gradientEndColor?: string
}

interface UseQrGeneratorProps {
  onSuccess?: (message: string) => void
  onError?: (error: string) => void
}

// Sample data constants
const SAMPLE_PRESETS: QrPreset[] = [
  {
    label: "Website URL",
    value: "https://webiston.uz",
    description: "Website havolasi",
    category: "url"
  },
  {
    label: "GitHub Profile",
    value: "https://github.com/webiston",
    description: "GitHub profil sahifasi",
    category: "url"
  },
  {
    label: "YouTube Channel",
    value: "https://youtube.com/@webiston",
    description: "YouTube kanal",
    category: "url"
  },
  {
    label: "Email Contact",
    value: "mailto:info@webiston.uz?subject=Salom&body=Assalomu aleykum!",
    description: "Email manzili",
    category: "contact"
  },
  {
    label: "Phone Number",
    value: "tel:+998901234567",
    description: "Telefon raqami",
    category: "contact"
  },
  {
    label: "vCard Contact",
    value:
      "BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nORG:Webiston\nTEL:+998901234567\nEMAIL:john@webiston.uz\nURL:https://webiston.uz\nEND:VCARD",
    description: "Kontakt kartasi",
    category: "contact"
  },
  {
    label: "SMS Message",
    value: "sms:+998901234567?body=Salom! Qanday ahvolingiz?",
    description: "SMS xabari",
    category: "sms"
  },
  {
    label: "WhatsApp Message",
    value: "https://wa.me/998901234567?text=Salom!%20Qanday%20yordam%20kerak?",
    description: "WhatsApp xabari",
    category: "sms"
  },
  {
    label: "WiFi Network",
    value: "WIFI:T:WPA;S:MyNetwork;P:MyPassword;H:false;",
    description: "WiFi ulanish",
    category: "wifi"
  },
  {
    label: "WiFi Guest",
    value: "WIFI:T:WPA;S:GuestNetwork;P:guest123;H:false;",
    description: "Mehmon WiFi",
    category: "wifi"
  },
  {
    label: "Simple Text",
    value: "Bu oddiy matn. QR kod orqali o'qish mumkin.",
    description: "Oddiy matn",
    category: "text"
  },
  {
    label: "Location",
    value: "geo:41.311151,69.279737?q=Tashkent,Uzbekistan",
    description: "Geografik joylashuv",
    category: "text"
  }
]

// QR size options with descriptions
const QR_SIZE_OPTIONS = [
  { value: 150, label: "150x150", description: "Kichik" },
  { value: 200, label: "200x200", description: "O'rtacha" },
  { value: 300, label: "300x300", description: "Katta" },
  { value: 400, label: "400x400", description: "Juda katta" }
] as const

// Error correction levels with descriptions
const ERROR_LEVELS = [
  { value: "L", label: "Past (L)", description: "~7% tiklash" },
  { value: "M", label: "O'rtacha (M)", description: "~15% tiklash" },
  { value: "Q", label: "Yuqori (Q)", description: "~25% tiklash" },
  { value: "H", label: "Maksimal (H)", description: "~30% tiklash" }
] as const

export const useQrGenerator = ({
  onSuccess,
  onError
}: UseQrGeneratorProps = {}) => {
  const [inputText, setInputText] = useState("")
  const [qrSize, setQrSize] = useState<QrSize>(300)
  const [errorLevel, setErrorLevel] = useState<QrErrorLevel>("M")
  const [isGenerating, setIsGenerating] = useState(false)
  const [customization, setCustomization] = useState<QrCustomization>({
    foregroundColor: "#000000",
    backgroundColor: "#ffffff",
    logoSize: 20,
    cornerStyle: "square",
    patternStyle: "square",
    margin: 10,
    borderRadius: 0,
    gradientEnabled: false,
    gradientDirection: "horizontal",
    gradientEndColor: "#8b5cf6" // Default gradient end color
  })

  // Generate QR code URL with customization
  const generateQrUrl = useCallback(
    (
      text: string,
      size: QrSize,
      errorCorrectionLevel: QrErrorLevel,
      custom: QrCustomization
    ) => {
      if (!text.trim()) return ""

      const baseUrl = "https://api.qrserver.com/v1/create-qr-code/"
      const params = new URLSearchParams({
        size: `${size}x${size}`,
        data: text,
        ecc: errorCorrectionLevel,
        format: "png",
        margin: custom.margin.toString(),
        color: custom.foregroundColor.replace("#", ""),
        bgcolor: custom.backgroundColor.replace("#", "")
      })

      return `${baseUrl}?${params.toString()}`
    },
    []
  )

  // Current QR URL (for preview)
  const qrUrl = useMemo(() => {
    return generateQrUrl(inputText, qrSize, errorLevel, customization)
  }, [inputText, qrSize, errorLevel, customization, generateQrUrl])

  // Generate custom QR with logo and styling
  const generateCustomQr = useCallback(
    async (
      text: string,
      size: QrSize,
      errorLevel: QrErrorLevel,
      custom: QrCustomization
    ) => {
      if (!text.trim()) return null

      try {
        // Create canvas
        const canvas = document.createElement("canvas")
        const ctx = canvas.getContext("2d")
        if (!ctx) throw new Error("Canvas not supported")

        canvas.width = size
        canvas.height = size

        // Get base QR image
        const baseQrUrl = generateQrUrl(text, size, errorLevel, custom)
        const qrImage = new Image()
        qrImage.crossOrigin = "anonymous"

        return new Promise<string>((resolve, reject) => {
          qrImage.onload = async () => {
            try {
              // Draw background
              ctx.fillStyle = custom.backgroundColor
              ctx.fillRect(0, 0, size, size)

              // Draw QR code
              ctx.drawImage(qrImage, 0, 0, size, size)

              // Add gradient overlay if enabled
              console.log("Gradient enabled:", custom.gradientEnabled)
              console.log("Gradient end color:", custom.gradientEndColor)
              if (custom.gradientEnabled && custom.gradientEndColor) {
                const gradient =
                  custom.gradientDirection === "radial"
                    ? ctx.createRadialGradient(
                        size / 2,
                        size / 2,
                        0,
                        size / 2,
                        size / 2,
                        size / 2
                      )
                    : custom.gradientDirection === "horizontal"
                      ? ctx.createLinearGradient(0, 0, size, 0)
                      : custom.gradientDirection === "vertical"
                        ? ctx.createLinearGradient(0, 0, 0, size)
                        : ctx.createLinearGradient(0, 0, size, size)

                gradient.addColorStop(0, custom.foregroundColor + "80")
                gradient.addColorStop(1, custom.gradientEndColor + "80")

                ctx.globalCompositeOperation = "multiply"
                ctx.fillStyle = gradient
                ctx.fillRect(0, 0, size, size)
                ctx.globalCompositeOperation = "source-over"
              }

              // Add logo if present
              if (custom.logo) {
                const logoImage = new Image()
                logoImage.crossOrigin = "anonymous"
                logoImage.onload = () => {
                  const logoSize = (size * custom.logoSize) / 100
                  const logoX = (size - logoSize) / 2
                  const logoY = (size - logoSize) / 2

                  // Draw white background for logo
                  ctx.fillStyle = "white"
                  ctx.fillRect(logoX - 4, logoY - 4, logoSize + 8, logoSize + 8)

                  // Draw logo
                  ctx.drawImage(logoImage, logoX, logoY, logoSize, logoSize)

                  resolve(canvas.toDataURL("image/png"))
                }
                logoImage.onerror = () => resolve(canvas.toDataURL("image/png"))
                logoImage.src = custom.logo
              } else {
                resolve(canvas.toDataURL("image/png"))
              }
            } catch (error) {
              reject(error)
            }
          }
          qrImage.onerror = () => reject(new Error("Failed to load QR image"))
          qrImage.src = baseQrUrl
        })
      } catch (error) {
        throw error
      }
    },
    [generateQrUrl]
  )

  // Custom QR URL with styling (for advanced preview)
  const [customQrUrl, setCustomQrUrl] = useState<string>("")

  // Generate custom QR for preview
  const updateCustomPreview = useCallback(async () => {
    if (!inputText.trim()) {
      setCustomQrUrl("")
      return
    }

    try {
      const customUrl = await generateCustomQr(
        inputText,
        qrSize,
        errorLevel,
        customization
      )
      if (customUrl) {
        setCustomQrUrl(customUrl)
      }
    } catch (error) {
      console.error("Preview generation error:", error)
      setCustomQrUrl("")
    }
  }, [inputText, qrSize, errorLevel, customization, generateCustomQr])

  // Update preview when customization changes
  React.useEffect(() => {
    const timeoutId = setTimeout(() => {
      updateCustomPreview()
    }, 300) // Debounce for performance

    return () => clearTimeout(timeoutId)
  }, [updateCustomPreview])

  // Handle preset selection
  const handlePresetSelect = useCallback(
    (preset: QrPreset) => {
      setInputText(preset.value)
      onSuccess?.(`"${preset.label}" namunasi yuklandi`)
    },
    [onSuccess]
  )

  // Set text with validation
  const setTextSafe = useCallback(
    (text: string) => {
      if (text.length > 2000) {
        onError?.("Matn 2000 belgidan oshmasligi kerak")
        return
      }
      setInputText(text)
    },
    [onError]
  )

  // Clear input
  const handleClear = useCallback(() => {
    setInputText("")
  }, [])

  // Download QR code
  const downloadQr = useCallback(async () => {
    if (!inputText.trim()) {
      onError?.("QR kod mavjud emas")
      return
    }

    try {
      setIsGenerating(true)

      // Generate custom QR with logo and styling
      const customQrDataUrl = await generateCustomQr(
        inputText,
        qrSize,
        errorLevel,
        customization
      )

      if (!customQrDataUrl) {
        throw new Error("QR kod yaratilmadi")
      }

      // Create download link
      const a = document.createElement("a")
      a.href = customQrDataUrl

      // Generate proper filename
      const now = new Date()
      const timestamp =
        now.getFullYear() +
        "-" +
        String(now.getMonth() + 1).padStart(2, "0") +
        "-" +
        String(now.getDate()).padStart(2, "0") +
        "_" +
        String(now.getHours()).padStart(2, "0") +
        "-" +
        String(now.getMinutes()).padStart(2, "0") +
        "-" +
        String(now.getSeconds()).padStart(2, "0")

      // Clean text for filename
      let textPreview = inputText
        .slice(0, 20)
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .replace(/\s+/g, "_")
        .toLowerCase()

      // Ensure textPreview is not empty
      if (!textPreview || textPreview.trim().length === 0) {
        textPreview = "qr_code"
      }

      const defaultFilename = `qr-${textPreview}-${timestamp}.png`

      console.log("Input text:", inputText.slice(0, 20))
      console.log("Text preview:", textPreview)
      console.log("Generated filename:", defaultFilename)

      a.download = defaultFilename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      onSuccess?.("QR kod muvaffaqiyatli yuklab olindi")
    } catch (error) {
      console.error("Download error:", error)
      onError?.("QR kod yuklab olishda xatolik yuz berdi")
    } finally {
      setIsGenerating(false)
    }
  }, [
    inputText,
    qrSize,
    errorLevel,
    customization,
    generateCustomQr,
    onSuccess,
    onError
  ])

  // Handle file upload with validation
  const handleFileUpload = useCallback(
    (file: File) => {
      // File validation
      const maxSize = 1 * 1024 * 1024 // 1MB
      const allowedTypes = [
        "text/plain",
        "application/json",
        "text/csv",
        "text/markdown"
      ]

      if (file.size > maxSize) {
        onError?.("Fayl hajmi 1MB dan oshmasligi kerak")
        return
      }

      if (
        !allowedTypes.includes(file.type) &&
        !file.name.match(/\.(txt|json|csv|md)$/i)
      ) {
        onError?.("Faqat TXT, JSON, CSV, MD fayl turlari qo'llab-quvvatlanadi")
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        if (content.length > 2000) {
          onError?.("Fayl tarkibi 2000 belgidan oshmasligi kerak")
          return
        }
        setInputText(content)
        onSuccess?.("Fayl muvaffaqiyatli yuklandi")
      }
      reader.onerror = () => {
        onError?.("Faylni o'qishda xatolik yuz berdi")
      }
      reader.readAsText(file)
    },
    [onSuccess, onError]
  )

  // Detect input type
  const detectInputType = useCallback((text: string) => {
    if (!text.trim()) return "empty"

    // URL detection
    if (text.match(/^https?:\/\//i)) return "url"

    // Email detection
    if (text.match(/^mailto:/i) || text.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/))
      return "email"

    // Phone detection
    if (text.match(/^tel:/i) || text.match(/^\+?[\d\s\-()]{7,}$/))
      return "phone"

    // SMS detection
    if (text.match(/^sms:/i)) return "sms"

    // WiFi detection
    if (text.match(/^WIFI:/i)) return "wifi"

    // vCard detection
    if (text.match(/^BEGIN:VCARD/i)) return "vcard"

    // Location detection
    if (text.match(/^geo:/i)) return "location"

    return "text"
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
      {} as Record<string, QrPreset[]>
    )
  }, [])

  // Statistics
  const stats = useMemo(() => {
    const textLength = inputText.length
    const lines = inputText.split("\n").length
    const words = inputText.trim() ? inputText.trim().split(/\s+/).length : 0

    return {
      characters: textLength,
      words,
      lines,
      qrSize: qrSize,
      errorLevel
    }
  }, [inputText, qrSize, errorLevel])

  // Input statistics
  const inputStats = useMemo(
    () => [
      { label: "belgi", value: stats.characters },
      { label: "so'z", value: stats.words },
      { label: "qator", value: stats.lines }
    ],
    [stats]
  )

  // Output statistics
  const outputStats = useMemo(
    () => [
      { label: "o'lcham", value: stats.qrSize },
      { label: "xato tuzatish", value: 0 }, // will display as string
      { label: "turi", value: 0 } // will display as string
    ],
    [stats]
  )

  return {
    // State
    inputText,
    qrUrl,
    customQrUrl: customQrUrl || qrUrl, // Use custom QR if available, fallback to basic
    qrSize,
    errorLevel,
    isGenerating,
    stats,
    inputStats,
    outputStats,
    customization,

    // Data
    presets: SAMPLE_PRESETS,
    groupedPresets,
    availableSizes: QR_SIZE_OPTIONS,
    errorLevels: ERROR_LEVELS,

    // Actions
    setInputText: setTextSafe,
    setQrSize,
    setErrorLevel,
    setCustomization,
    handlePresetSelect,
    handleClear,
    downloadQr,
    handleFileUpload,

    // Utilities
    detectInputType,
    generateQrUrl,
    generateCustomQr
  }
}
