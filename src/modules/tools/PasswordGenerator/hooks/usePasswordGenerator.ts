import { useCallback, useEffect, useMemo, useState } from "react"
import {
  generatePassword as generate,
  NoCharactersSelectedError,
  type PasswordSettings
} from "../utils/generate-password"

interface PasswordStrength {
  level: number
  text: string
  color: string
}

interface UsePasswordGeneratorProps {
  onSuccess?: (message: string) => void
  onError?: (error: string) => void
}

// Preset configurations - these will be replaced with translations in the component
const getPresetSettings = (t: any) => [
  {
    label: t("PresetSettings.standard.label"),
    description: t("PresetSettings.standard.description"),
    settings: {
      length: 16,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeSimilar: false,
      passwordType: "random" as const
    }
  },
  {
    label: t("PresetSettings.secure.label"),
    description: t("PresetSettings.secure.description"),
    settings: {
      length: 24,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeSimilar: true,
      passwordType: "strong" as const
    }
  },
  {
    label: t("PresetSettings.easy.label"),
    description: t("PresetSettings.easy.description"),
    settings: {
      length: 12,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: false,
      excludeSimilar: true,
      passwordType: "memorable" as const
    }
  },
  {
    label: t("PresetSettings.pin.label"),
    description: t("PresetSettings.pin.description"),
    settings: {
      length: 6,
      includeUppercase: false,
      includeLowercase: false,
      includeNumbers: true,
      includeSymbols: false,
      excludeSimilar: false,
      passwordType: "random" as const
    }
  },
  {
    label: t("PresetSettings.wifi.label"),
    description: t("PresetSettings.wifi.description"),
    settings: {
      length: 32,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: false,
      excludeSimilar: true,
      passwordType: "random" as const
    }
  }
]

export const usePasswordGenerator = (
  { onSuccess, onError }: UsePasswordGeneratorProps = {},
  t?: any,
  tStrength?: any
) => {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(true)
  const [copied, setCopied] = useState(false)

  const [settings, setSettings] = useState<PasswordSettings>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false,
    passwordType: "random"
  })

  // Generation lives in utils/generate-password.ts: it is pure, it is unit
  // tested, and it draws from crypto.getRandomValues instead of Math.random.
  // This callback only wires it to state and messaging.
  const generatePassword = useCallback(() => {
    try {
      const result = generate(settings)
      setPassword(result)
      onSuccess?.(`${result.length} belgili parol yaratildi`)
    } catch (error) {
      if (error instanceof NoCharactersSelectedError) {
        onError?.("Kamida bitta belgi turi tanlanishi kerak")
        return
      }
      onError?.("Parol yaratishda xatolik yuz berdi")
    }
  }, [settings, onSuccess, onError])

  // Calculate password strength - this will be replaced with translations in the component
  const getPasswordStrength = (
    password: string,
    tStrength: any
  ): PasswordStrength => {
    if (!password)
      return {
        level: 0,
        text: tStrength("notGenerated"),
        color: "text-zinc-500"
      }

    let score = 0

    // Length scoring (0-4 points)
    if (password.length >= 20) score += 4
    else if (password.length >= 16) score += 3
    else if (password.length >= 12) score += 2
    else if (password.length >= 8) score += 1

    // Character type scoring (0-4 points)
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 1

    // Diversity scoring (0-2 points)
    const uniqueChars = new Set(password).size
    if (uniqueChars / password.length > 0.8) score += 2
    else if (uniqueChars / password.length > 0.6) score += 1

    // Pattern detection (-1 point for common patterns)
    if (/(.)\1{2,}/.test(password)) score -= 1 // Repeated characters
    if (/123|abc|qwe/i.test(password)) score -= 1 // Common sequences

    if (score <= 2)
      return { level: 1, text: tStrength("weak"), color: "text-red-400" }
    if (score <= 4)
      return { level: 2, text: tStrength("fair"), color: "text-yellow-400" }
    if (score <= 6)
      return { level: 3, text: tStrength("good"), color: "text-blue-400" }
    if (score <= 8)
      return { level: 4, text: tStrength("strong"), color: "text-green-400" }
    return {
      level: 5,
      text: tStrength("veryStrong"),
      color: "text-emerald-400"
    }
  }

  // Copy to clipboard
  const handleCopy = useCallback(async () => {
    if (!password) {
      onError?.("Parol mavjud emas")
      return
    }

    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      onSuccess?.("Parol nusxalandi")
    } catch (_error) {
      onError?.("Nusxalashda xatolik yuz berdi")
    }
  }, [password, onSuccess, onError])

  // Download password as file
  const downloadPassword = useCallback(() => {
    if (!password) {
      onError?.("Parol mavjud emas")
      return
    }

    try {
      const content = [
        "# Yaratilgan Parol - Webiston",
        "",
        `Parol: ${password}`,
        `Uzunlik: ${password.length} belgi`,
        `Turi: ${settings.passwordType === "memorable" ? "Eslab qolinadigan" : settings.passwordType === "strong" ? "Kuchli" : "Tasodifiy"}`,
        `Mustahkamlik: ${tStrength ? getPasswordStrength(password, tStrength).text : "N/A"}`,
        "",
        "Sozlamalar:",
        `- Katta harflar: ${settings.includeUppercase ? "Ha" : "Yo'q"}`,
        `- Kichik harflar: ${settings.includeLowercase ? "Ha" : "Yo'q"}`,
        `- Raqamlar: ${settings.includeNumbers ? "Ha" : "Yo'q"}`,
        `- Maxsus belgilar: ${settings.includeSymbols ? "Ha" : "Yo'q"}`,
        `- O'xshash belgilarni chiqarish: ${settings.excludeSimilar ? "Ha" : "Yo'q"}`,
        "",
        `Yaratilgan: ${new Date().toLocaleString("uz-UZ")}`,
        "",
        "DIQQAT: Bu parolni xavfsiz joyda saqlang va boshqalar bilan ulashmang!"
      ].join("\n")

      const blob = new Blob([content], { type: "text/plain" })
      const url = URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = `parol-${Date.now()}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      URL.revokeObjectURL(url)
      onSuccess?.("Parol fayl sifatida saqlandi")
    } catch (_error) {
      onError?.("Faylni yuklab olishda xatolik yuz berdi")
    }
  }, [password, settings, tStrength, onSuccess, onError, getPasswordStrength])

  // Load preset settings
  const loadPreset = useCallback(
    (preset: {
      label: string
      description: string
      settings: Partial<PasswordSettings>
    }) => {
      setSettings(preset.settings as PasswordSettings)
      onSuccess?.(`"${preset.label}" sozlamalari yuklandi`)
    },
    [onSuccess]
  )

  // Update settings
  const updateSettings = useCallback(
    (newSettings: Partial<PasswordSettings>) => {
      setSettings((prev) => ({ ...prev, ...newSettings }))
    },
    []
  )

  // Toggle password visibility
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev)
  }, [])

  // Statistics
  const stats = useMemo(() => {
    const textLength = password.length
    const uniqueChars = new Set(password).size
    const entropy = Math.log2(95 ** textLength) // Approximate entropy
    const passwordStrengthLevel = tStrength
      ? getPasswordStrength(password, tStrength).level
      : 0

    return {
      characters: textLength,
      unique: uniqueChars,
      entropy: Math.round(entropy),
      strength: passwordStrengthLevel
    }
  }, [password, tStrength, getPasswordStrength])

  // Input/Output statistics
  const inputStats = useMemo(
    () => [
      { label: "uzunlik", value: settings.length },
      { label: "turi", value: 0 }, // will display as string
      { label: "belgilar", value: 0 } // will display as string
    ],
    [settings]
  )

  const outputStats = useMemo(
    () => [
      { label: "belgi", value: stats.characters },
      { label: "noyob", value: stats.unique },
      { label: "entropiya", value: stats.entropy }
    ],
    [stats]
  )

  // Auto-generate on settings change
  useEffect(() => {
    if (settings.length > 0) {
      generatePassword()
    }
  }, [settings.length, generatePassword])

  // Password display text (masked/visible)
  const passwordDisplayText = useMemo(() => {
    if (!password) return ""
    return showPassword ? password : "•".repeat(password.length)
  }, [password, showPassword])

  return {
    // State
    password,
    showPassword,
    copied,
    settings,
    passwordDisplayText,
    passwordStrength: tStrength
      ? getPasswordStrength(password, tStrength)
      : { level: 0, text: "", color: "text-zinc-500" },
    stats,
    inputStats,
    outputStats,

    // Data
    presetSettings: t ? getPresetSettings(t) : [],

    // Actions
    generatePassword,
    handleCopy,
    downloadPassword,
    loadPreset,
    togglePasswordVisibility,
    updateSettings
  }
}
