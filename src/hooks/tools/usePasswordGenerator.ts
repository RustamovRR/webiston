import { useState, useEffect, useMemo, useCallback } from 'react'
import { useCopyToClipboard } from 'usehooks-ts'

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

const memorableWords = [
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
]

const charSets = {
  uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  lowercase: 'abcdefghijklmnopqrstuvwxyz',
  numbers: '0123456789',
  symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
  similar: 'il1Lo0O',
}

const presetSettings = [
  {
    label: 'Standart',
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
    settings: {
      length: 24,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeSimilar: true,
      passwordType: 'random' as const,
    },
  },
  {
    label: 'Oson',
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
]

export const usePasswordGenerator = () => {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(true)
  const [copied, setCopied] = useState(false)
  const [_, copy] = useCopyToClipboard()

  const [settings, setSettings] = useState<PasswordSettings>({
    length: 16,
    includeUppercase: true,
    includeLowercase: true,
    includeNumbers: true,
    includeSymbols: true,
    excludeSimilar: false,
    passwordType: 'random',
  })

  const generatePassword = useCallback(() => {
    let result = ''

    if (settings.passwordType === 'memorable') {
      // Memorable password generation
      const word1 = memorableWords[Math.floor(Math.random() * memorableWords.length)]
      const word2 = memorableWords[Math.floor(Math.random() * memorableWords.length)]
      const number = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0')
      const symbol = settings.includeSymbols ? '!@#$%^&*'[Math.floor(Math.random() * 8)] : ''
      result = `${word1}${word2}${number}${symbol}`
    } else {
      // Random password generation
      let chars = ''

      if (settings.includeUppercase) chars += charSets.uppercase
      if (settings.includeLowercase) chars += charSets.lowercase
      if (settings.includeNumbers) chars += charSets.numbers
      if (settings.includeSymbols) chars += charSets.symbols

      if (settings.excludeSimilar) {
        chars = chars
          .split('')
          .filter((char) => !charSets.similar.includes(char))
          .join('')
      }

      if (!chars) {
        setPassword('')
        return
      }

      for (let i = 0; i < settings.length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
      }
    }

    setPassword(result)
  }, [settings])

  const getPasswordStrength = useMemo((): PasswordStrength => {
    if (!password) return { level: 0, text: 'Parol yaratilmagan', color: 'text-zinc-500' }

    let score = 0

    // Length scoring
    if (password.length >= 16) score += 3
    else if (password.length >= 12) score += 2
    else if (password.length >= 8) score += 1

    // Character type scoring
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[^A-Za-z0-9]/.test(password)) score += 2

    // Unique characters
    const uniqueChars = new Set(password).size
    if (uniqueChars / password.length > 0.8) score += 1

    if (score <= 3) return { level: 1, text: 'Zaif', color: 'text-red-400' }
    if (score <= 5) return { level: 2, text: "O'rtacha", color: 'text-yellow-400' }
    if (score <= 7) return { level: 3, text: 'Yaxshi', color: 'text-blue-400' }
    return { level: 4, text: 'Kuchli', color: 'text-green-400' }
  }, [password])

  const handleCopy = useCallback(async () => {
    if (!password) return
    try {
      await copy(password)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Copy failed:', error)
    }
  }, [password, copy])

  const downloadPassword = useCallback(() => {
    if (!password) return

    const content = [
      '# Yaratilgan parol',
      '',
      `Parol: ${password}`,
      `Uzunlik: ${password.length} belgi`,
      `Turi: ${settings.passwordType === 'memorable' ? 'Eslab qolinadigan' : 'Tasodifiy'}`,
      `Mustahkamlik: ${getPasswordStrength.text}`,
      '',
      '--- Sozlamalar ---',
      `Katta harflar: ${settings.includeUppercase ? 'Ha' : "Yo'q"}`,
      `Kichik harflar: ${settings.includeLowercase ? 'Ha' : "Yo'q"}`,
      `Raqamlar: ${settings.includeNumbers ? 'Ha' : "Yo'q"}`,
      `Maxsus belgilar: ${settings.includeSymbols ? 'Ha' : "Yo'q"}`,
      `O'xshash belgilarni chiqarish: ${settings.excludeSimilar ? 'Ha' : "Yo'q"}`,
      '',
      `Yaratilgan: ${new Date().toLocaleString()}`,
      '',
      "⚠️ Bu parolni xavfsiz joyda saqlang va boshqalar bilan baham ko'rmang!",
    ].join('\n')

    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `password-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }, [password, settings, getPasswordStrength])

  const loadPreset = useCallback((preset: (typeof presetSettings)[0]) => {
    setSettings(preset.settings)
  }, [])

  const togglePasswordVisibility = useCallback(() => {
    setShowPassword((prev) => !prev)
  }, [])

  const updateSettings = useCallback((updates: Partial<PasswordSettings>) => {
    setSettings((prev) => ({ ...prev, ...updates }))
  }, [])

  // Auto-generate on component mount
  useEffect(() => {
    generatePassword()
  }, [])

  // Auto-generate when settings change
  useEffect(() => {
    if (password) {
      generatePassword()
    }
  }, [settings, generatePassword])

  const passwordDisplayText = showPassword ? password : '•'.repeat(password.length)
  const passwordInfo = password
    ? `Yaratilgan parol:\n\nParol: ${password}\nUzunlik: ${password.length} belgi\nMustahkamlik: ${getPasswordStrength.text}\nTuri: ${settings.passwordType === 'memorable' ? 'Eslab qolinadigan' : 'Tasodifiy'}\n\nSozlamalar:\n- Katta harflar: ${settings.includeUppercase ? 'Ha' : "Yo'q"}\n- Kichik harflar: ${settings.includeLowercase ? 'Ha' : "Yo'q"}\n- Raqamlar: ${settings.includeNumbers ? 'Ha' : "Yo'q"}\n- Maxsus belgilar: ${settings.includeSymbols ? 'Ha' : "Yo'q"}`
    : ''

  return {
    // State
    password,
    showPassword,
    copied,
    settings,
    passwordDisplayText,
    passwordInfo,

    // Computed
    passwordStrength: getPasswordStrength,
    presetSettings,

    // Actions
    generatePassword,
    handleCopy,
    downloadPassword,
    loadPreset,
    togglePasswordVisibility,
    updateSettings,
  }
}
