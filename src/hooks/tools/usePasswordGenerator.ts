import { useState, useEffect, useMemo, useCallback } from 'react'

interface PasswordSettings {
  length: number
  includeUppercase: boolean
  includeLowercase: boolean
  includeNumbers: boolean
  includeSymbols: boolean
  excludeSimilar: boolean
  passwordType: 'random' | 'memorable' | 'strong'
}

interface PasswordStrength {
  level: number
  text: string
  color: string
}

interface UsePasswordGeneratorProps {
  onSuccess?: (message: string) => void
  onError?: (error: string) => void
}

// Sample data constants
const MEMORABLE_WORDS = [
  'Computer',
  'Security',
  'Password',
  'Digital',
  'Network',
  'System',
  'Data',
  'Server',
  'Cloud',
  'Mobile',
  'Website',
  'Application',
  'Software',
  'Hardware',
  'Internet',
  'Protocol',
  'Crypto',
  'Secure',
  'Strong',
  'Safe',
  'Tech',
  'Code',
  'User',
  'Admin',
  'Login',
  'Access',
  'Guard',
  'Shield',
  'Vault',
  'Key',
  'Lock',
  'Token',
]

// Character sets
const CHAR_SETS = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  similar: 'il1Lo0O',
}

// Preset configurations
const PRESET_SETTINGS = [
  {
    label: 'Standart',
    description: '16 belgi, aralash',
    settings: {
      length: 16,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeSimilar: false,
      passwordType: 'random' as const,
    },
  },
  {
    label: 'Xavfsiz',
    description: '24 belgi, maksimal',
    settings: {
      length: 24,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeSimilar: true,
      passwordType: 'strong' as const,
    },
  },
  {
    label: 'Oson',
    description: '12 belgi, eslab qolinadigan',
    settings: {
      length: 12,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: false,
      excludeSimilar: true,
      passwordType: 'memorable' as const,
    },
  },
  {
    label: 'PIN',
    description: '6 raqam',
    settings: {
      length: 6,
      includeUppercase: false,
      includeLowercase: false,
      includeNumbers: true,
      includeSymbols: false,
      excludeSimilar: false,
      passwordType: 'random' as const,
    },
  },
  {
    label: 'WiFi',
    description: '32 belgi, router uchun',
    settings: {
      length: 32,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: false,
      excludeSimilar: true,
      passwordType: 'random' as const,
    },
  },
]

export const usePasswordGenerator = ({ onSuccess, onError }: UsePasswordGeneratorProps = {}) => {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(true)
  const [copied, setCopied] = useState(false)

  const [settings, setSettings] = useState<PasswordSettings>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false,
    passwordType: 'random',
  })

  // Generate password with improved logic
  const generatePassword = useCallback(() => {
    let result = ''

    try {
      if (settings.passwordType === 'memorable') {
        // Memorable password: Word1Word2123!
        const word1 = MEMORABLE_WORDS[Math.floor(Math.random() * MEMORABLE_WORDS.length)]
        const word2 = MEMORABLE_WORDS[Math.floor(Math.random() * MEMORABLE_WORDS.length)]
        const number = Math.floor(Math.random() * 1000)
          .toString()
          .padStart(3, '0')
        const symbol = settings.includeSymbols ? '!@#$%^&*'[Math.floor(Math.random() * 8)] : ''

        result = `${word1}${word2}${number}${symbol}`

        // Adjust length if needed
        if (result.length > settings.length) {
          result = result.substring(0, settings.length)
        } else if (result.length < settings.length) {
          // Add random chars to reach desired length
          let chars = ''
          if (settings.includeUppercase) chars += CHAR_SETS.uppercase
          if (settings.includeLowercase) chars += CHAR_SETS.lowercase
          if (settings.includeNumbers) chars += CHAR_SETS.numbers
          if (settings.includeSymbols) chars += CHAR_SETS.symbols

          while (result.length < settings.length && chars) {
            result += chars.charAt(Math.floor(Math.random() * chars.length))
          }
        }
      } else {
        // Random/Strong password generation
        let chars = ''

        if (settings.includeUppercase) chars += CHAR_SETS.uppercase
        if (settings.includeLowercase) chars += CHAR_SETS.lowercase
        if (settings.includeNumbers) chars += CHAR_SETS.numbers
        if (settings.includeSymbols) chars += CHAR_SETS.symbols

        if (settings.excludeSimilar) {
          chars = chars
            .split('')
            .filter((char) => !CHAR_SETS.similar.includes(char))
            .join('')
        }

        if (!chars) {
          onError?.('Kamida bitta belgi turi tanlanishi kerak')
          return
        }

        // Enhanced generation for strong passwords
        if (settings.passwordType === 'strong') {
          // Ensure at least one character from each selected type
          const requiredChars = []
          if (settings.includeUppercase)
            requiredChars.push(CHAR_SETS.uppercase[Math.floor(Math.random() * CHAR_SETS.uppercase.length)])
          if (settings.includeLowercase)
            requiredChars.push(CHAR_SETS.lowercase[Math.floor(Math.random() * CHAR_SETS.lowercase.length)])
          if (settings.includeNumbers)
            requiredChars.push(CHAR_SETS.numbers[Math.floor(Math.random() * CHAR_SETS.numbers.length)])
          if (settings.includeSymbols)
            requiredChars.push(CHAR_SETS.symbols[Math.floor(Math.random() * CHAR_SETS.symbols.length)])

          // Fill remaining with random chars
          for (let i = requiredChars.length; i < settings.length; i++) {
            requiredChars.push(chars.charAt(Math.floor(Math.random() * chars.length)))
          }

          // Shuffle the array
          for (let i = requiredChars.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1))
            ;[requiredChars[i], requiredChars[j]] = [requiredChars[j], requiredChars[i]]
          }

          result = requiredChars.join('')
        } else {
          // Standard random generation
          for (let i = 0; i < settings.length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length))
          }
        }
      }

      setPassword(result)
      onSuccess?.(`${result.length} belgili parol yaratildi`)
    } catch (error) {
      onError?.('Parol yaratishda xatolik yuz berdi')
    }
  }, [settings, onSuccess, onError])

  // Calculate password strength
  const passwordStrength = useMemo((): PasswordStrength => {
    if (!password) return { level: 0, text: 'Parol yaratilmagan', color: 'text-zinc-500' }

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

    if (score <= 2) return { level: 1, text: 'Zaif', color: 'text-red-400' }
    if (score <= 4) return { level: 2, text: "O'rtacha", color: 'text-yellow-400' }
    if (score <= 6) return { level: 3, text: 'Yaxshi', color: 'text-blue-400' }
    if (score <= 8) return { level: 4, text: 'Kuchli', color: 'text-green-400' }
    return { level: 5, text: 'Juda kuchli', color: 'text-emerald-400' }
  }, [password])

  // Copy to clipboard
  const handleCopy = useCallback(async () => {
    if (!password) {
      onError?.('Parol mavjud emas')
      return
    }

    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      onSuccess?.('Parol nusxalandi')
    } catch (error) {
      onError?.('Nusxalashda xatolik yuz berdi')
    }
  }, [password, onSuccess, onError])

  // Download password as file
  const downloadPassword = useCallback(() => {
    if (!password) {
      onError?.('Parol mavjud emas')
      return
    }

    try {
      const content = [
        '# Yaratilgan Parol - Webiston',
        '',
        `Parol: ${password}`,
        `Uzunlik: ${password.length} belgi`,
        `Turi: ${settings.passwordType === 'memorable' ? 'Eslab qolinadigan' : settings.passwordType === 'strong' ? 'Kuchli' : 'Tasodifiy'}`,
        `Mustahkamlik: ${passwordStrength.text}`,
        '',
        'Sozlamalar:',
        `- Katta harflar: ${settings.includeUppercase ? 'Ha' : "Yo'q"}`,
        `- Kichik harflar: ${settings.includeLowercase ? 'Ha' : "Yo'q"}`,
        `- Raqamlar: ${settings.includeNumbers ? 'Ha' : "Yo'q"}`,
        `- Maxsus belgilar: ${settings.includeSymbols ? 'Ha' : "Yo'q"}`,
        `- O'xshash belgilarni chiqarish: ${settings.excludeSimilar ? 'Ha' : "Yo'q"}`,
        '',
        `Yaratilgan: ${new Date().toLocaleString('uz-UZ')}`,
        '',
        'DIQQAT: Bu parolni xavfsiz joyda saqlang va boshqalar bilan ulashmang!',
      ].join('\n')

      const blob = new Blob([content], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)

      const a = document.createElement('a')
      a.href = url
      a.download = `parol-${Date.now()}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)

      URL.revokeObjectURL(url)
      onSuccess?.('Parol fayl sifatida saqlandi')
    } catch (error) {
      onError?.('Faylni yuklab olishda xatolik yuz berdi')
    }
  }, [password, settings, passwordStrength.text, onSuccess, onError])

  // Load preset settings
  const loadPreset = useCallback(
    (preset: (typeof PRESET_SETTINGS)[0]) => {
      setSettings(preset.settings)
      onSuccess?.(`"${preset.label}" sozlamalari yuklandi`)
    },
    [onSuccess],
  )

  // Update settings
  const updateSettings = useCallback((newSettings: Partial<PasswordSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }))
  }, [])

  // Toggle password visibility
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev)
  }, [])

  // Statistics
  const stats = useMemo(() => {
    const textLength = password.length
    const uniqueChars = new Set(password).size
    const entropy = Math.log2(Math.pow(95, textLength)) // Approximate entropy

    return {
      characters: textLength,
      unique: uniqueChars,
      entropy: Math.round(entropy),
      strength: passwordStrength.level,
    }
  }, [password, passwordStrength.level])

  // Input/Output statistics
  const inputStats = useMemo(
    () => [
      { label: 'uzunlik', value: settings.length },
      { label: 'turi', value: 0 }, // will display as string
      { label: 'belgilar', value: 0 }, // will display as string
    ],
    [settings],
  )

  const outputStats = useMemo(
    () => [
      { label: 'belgi', value: stats.characters },
      { label: 'noyob', value: stats.unique },
      { label: 'entropiya', value: stats.entropy },
    ],
    [stats],
  )

  // Auto-generate on settings change
  useEffect(() => {
    if (settings.length > 0) {
      generatePassword()
    }
  }, [settings.length, settings.passwordType])

  // Password display text (masked/visible)
  const passwordDisplayText = useMemo(() => {
    if (!password) return ''
    return showPassword ? password : '•'.repeat(password.length)
  }, [password, showPassword])

  return {
    // State
    password,
    showPassword,
    copied,
    settings,
    passwordDisplayText,
    passwordStrength,
    stats,
    inputStats,
    outputStats,

    // Data
    presetSettings: PRESET_SETTINGS,

    // Actions
    generatePassword,
    handleCopy,
    downloadPassword,
    loadPreset,
    togglePasswordVisibility,
    updateSettings,
  }
}
