import { useState, useEffect, useCallback } from 'react'

export interface ParsedUserAgent {
  browser: {
    name: string
    version: string
    major: string
  }
  engine: {
    name: string
    version: string
  }
  os: {
    name: string
    version: string
  }
  device: {
    vendor: string
    model: string
    type: string
  }
  cpu: {
    architecture: string
  }
}

export interface UserAgentSample {
  name: string
  ua: string
  description?: string
}

interface UseUserAgentAnalyzerOptions {
  onSuccess?: (message: string) => void
  onError?: (error: string) => void
}

const SAMPLE_USER_AGENTS: UserAgentSample[] = [
  {
    name: 'Chrome on Windows',
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    description: 'Windows 10/11 da Google Chrome brauzer',
  },
  {
    name: 'Chrome on macOS',
    ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    description: 'macOS da Google Chrome brauzer',
  },
  {
    name: 'Firefox on Windows',
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/120.0',
    description: 'Windows 10/11 da Mozilla Firefox brauzer',
  },
  {
    name: 'Firefox on macOS',
    ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/120.0',
    description: 'macOS da Mozilla Firefox brauzer',
  },
  {
    name: 'Safari on macOS',
    ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
    description: 'macOS da Safari brauzer',
  },
  {
    name: 'Edge on Windows',
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    description: 'Windows da Microsoft Edge brauzer',
  },
  {
    name: 'Edge on macOS',
    ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
    description: 'macOS da Microsoft Edge brauzer',
  },
  {
    name: 'Opera on Windows',
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 OPR/106.0.0.0',
    description: 'Windows da Opera brauzer',
  },
]

export const useUserAgentAnalyzer = (options: UseUserAgentAnalyzerOptions = {}) => {
  const [userAgent, setUserAgent] = useState<string>('')
  const [parsedUA, setParsedUA] = useState<ParsedUserAgent | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [currentUA, setCurrentUA] = useState<string>('')

  const { onSuccess, onError } = options

  // Initialize with current browser's User Agent
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent
      setCurrentUA(ua)
      setUserAgent(ua)
      parseUserAgent(ua)
    }
  }, [])

  const parseUserAgent = useCallback(
    (ua: string): ParsedUserAgent | null => {
      if (!ua.trim()) {
        return null
      }

      setIsAnalyzing(true)

      try {
        const parsed: ParsedUserAgent = {
          browser: { name: 'Unknown', version: 'Unknown', major: 'Unknown' },
          engine: { name: 'Unknown', version: 'Unknown' },
          os: { name: 'Unknown', version: 'Unknown' },
          device: { vendor: 'Unknown', model: 'Unknown', type: 'Unknown' },
          cpu: { architecture: 'Unknown' },
        }

        // Browser detection
        if (ua.includes('OPR/') || ua.includes('Opera/')) {
          parsed.browser.name = 'Opera'
          const match = ua.match(/(?:OPR|Opera)\/([0-9.]+)/)
          if (match) {
            parsed.browser.version = match[1]
            parsed.browser.major = match[1].split('.')[0]
          }
        } else if (ua.includes('Edg/')) {
          parsed.browser.name = 'Microsoft Edge'
          const match = ua.match(/Edg\/([0-9.]+)/)
          if (match) {
            parsed.browser.version = match[1]
            parsed.browser.major = match[1].split('.')[0]
          }
        } else if (ua.includes('Chrome/') && !ua.includes('Edg')) {
          parsed.browser.name = 'Google Chrome'
          const match = ua.match(/Chrome\/([0-9.]+)/)
          if (match) {
            parsed.browser.version = match[1]
            parsed.browser.major = match[1].split('.')[0]
          }
        } else if (ua.includes('Firefox/')) {
          parsed.browser.name = 'Mozilla Firefox'
          const match = ua.match(/Firefox\/([0-9.]+)/)
          if (match) {
            parsed.browser.version = match[1]
            parsed.browser.major = match[1].split('.')[0]
          }
        } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
          parsed.browser.name = 'Safari'
          const match = ua.match(/Version\/([0-9.]+)/)
          if (match) {
            parsed.browser.version = match[1]
            parsed.browser.major = match[1].split('.')[0]
          }
        }

        // Engine detection
        if (ua.includes('Gecko/')) {
          parsed.engine.name = 'Gecko'
          const match = ua.match(/rv:([0-9.]+)/)
          if (match) parsed.engine.version = match[1]
        } else if (ua.includes('WebKit/')) {
          parsed.engine.name = 'WebKit'
          const match = ua.match(/WebKit\/([0-9.]+)/)
          if (match) parsed.engine.version = match[1]
        } else if (ua.includes('Trident/')) {
          parsed.engine.name = 'Trident'
          const match = ua.match(/Trident\/([0-9.]+)/)
          if (match) parsed.engine.version = match[1]
        }

        // OS detection
        if (ua.includes('Windows NT')) {
          parsed.os.name = 'Windows'
          const match = ua.match(/Windows NT ([0-9.]+)/)
          if (match) {
            const version = match[1]
            const windowsVersions: { [key: string]: string } = {
              '10.0': '10/11',
              '6.3': '8.1',
              '6.2': '8',
              '6.1': '7',
              '6.0': 'Vista',
              '5.2': 'XP',
              '5.1': 'XP',
            }
            parsed.os.version = windowsVersions[version] || version
          }
        } else if (ua.includes('Mac OS X')) {
          parsed.os.name = 'macOS'
          const match = ua.match(/Mac OS X ([0-9_]+)/)
          if (match) {
            parsed.os.version = match[1].replace(/_/g, '.')
          }
        } else if (ua.includes('Linux')) {
          parsed.os.name = 'Linux'
          if (ua.includes('Android')) {
            parsed.os.name = 'Android'
            const match = ua.match(/Android ([0-9.]+)/)
            if (match) parsed.os.version = match[1]
          }
        } else if (ua.includes('iPhone')) {
          parsed.os.name = 'iOS'
          const match = ua.match(/OS ([0-9_]+)/)
          if (match) parsed.os.version = match[1].replace(/_/g, '.')
        }

        // Device detection
        if (ua.includes('iPhone')) {
          parsed.device.vendor = 'Apple'
          parsed.device.model = 'iPhone'
          parsed.device.type = 'mobile'
        } else if (ua.includes('iPad')) {
          parsed.device.vendor = 'Apple'
          parsed.device.model = 'iPad'
          parsed.device.type = 'tablet'
        } else if (ua.includes('Android')) {
          if (ua.includes('Mobile')) {
            parsed.device.type = 'mobile'
          } else {
            parsed.device.type = 'tablet'
          }
          // Extract Android device model
          const deviceMatch = ua.match(/Android [0-9.]+; ([^)]+)\)/)
          if (deviceMatch) {
            const deviceInfo = deviceMatch[1]
            if (deviceInfo.includes('SM-')) {
              parsed.device.vendor = 'Samsung'
              parsed.device.model = deviceInfo
            } else {
              parsed.device.model = deviceInfo
            }
          }
        } else {
          // Desktop/Laptop detection
          parsed.device.type = 'desktop'

          if (ua.includes('Macintosh') || ua.includes('Mac OS X')) {
            parsed.device.vendor = 'Apple'
            parsed.device.model = 'Mac'

            // Determine if it's Intel or Apple Silicon
            if (ua.includes('Intel')) {
              parsed.device.model = 'Mac (Intel)'
            } else if (ua.includes('arm64')) {
              parsed.device.model = 'Mac (Apple Silicon)'
            }
          } else if (ua.includes('Windows')) {
            parsed.device.vendor = 'Microsoft'
            parsed.device.model = 'PC'

            // Detect specific Windows device types
            if (ua.includes('Windows NT 10.0')) {
              parsed.device.model = 'Windows PC'
            }
          } else if (ua.includes('Linux')) {
            parsed.device.vendor = 'Linux'
            parsed.device.model = 'PC'

            // Detect common Linux distributions
            if (ua.includes('Ubuntu')) {
              parsed.device.model = 'Ubuntu PC'
            } else if (ua.includes('Fedora')) {
              parsed.device.model = 'Fedora PC'
            }
          }
        }

        // CPU architecture
        if (ua.includes('x64') || ua.includes('x86_64')) {
          parsed.cpu.architecture = 'amd64'
        } else if (ua.includes('x86')) {
          parsed.cpu.architecture = 'ia32'
        } else if (ua.includes('arm64') || ua.includes('aarch64')) {
          parsed.cpu.architecture = 'arm64'
        } else if (ua.includes('arm')) {
          parsed.cpu.architecture = 'arm'
        }

        return parsed
      } catch (error) {
        console.error('User Agent parsing error:', error)
        onError?.('User Agent tahlil qilishda xatolik yuz berdi')
        return null
      } finally {
        setIsAnalyzing(false)
      }
    },
    [onError]
  )

  const analyzeUserAgent = useCallback(() => {
    if (!userAgent.trim()) {
      onError?.('User Agent stringini kiriting')
      return
    }

    const result = parseUserAgent(userAgent)
    setParsedUA(result)

    if (result) {
      onSuccess?.('User Agent muvaffaqiyatli tahlil qilindi')
    }
  }, [userAgent, parseUserAgent, onSuccess, onError])

  const loadSampleUA = useCallback(
    (sample: UserAgentSample) => {
      setUserAgent(sample.ua)
      const result = parseUserAgent(sample.ua)
      setParsedUA(result)
      onSuccess?.(`${sample.name} namunasi yuklandi`)
    },
    [parseUserAgent, onSuccess]
  )

  const loadCurrentUA = useCallback(() => {
    setUserAgent(currentUA)
    const result = parseUserAgent(currentUA)
    setParsedUA(result)
    onSuccess?.("Joriy brauzer ma'lumotlari yuklandi")
  }, [currentUA, parseUserAgent, onSuccess])

  const clearAll = useCallback(() => {
    setUserAgent('')
    setParsedUA(null)
  }, [])

  const downloadAnalysis = useCallback(() => {
    if (!parsedUA || !userAgent) {
      onError?.("Yuklab olish uchun tahlil ma'lumotlari mavjud emas")
      return
    }

    const data = {
      timestamp: new Date().toISOString(),
      originalUserAgent: userAgent,
      parsedData: parsedUA,
      analysis: {
        isBot: userAgent.toLowerCase().includes('bot'),
        isMobile: parsedUA.device.type === 'mobile',
        isTablet: parsedUA.device.type === 'tablet',
        isDesktop: parsedUA.device.type === 'desktop',
        browserFamily: parsedUA.browser.name.split(' ')[0],
        osFamily: parsedUA.os.name,
      },
    }

    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `user-agent-analysis-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    onSuccess?.("User Agent tahlil ma'lumotlari yuklab olindi")
  }, [parsedUA, userAgent, onSuccess, onError])

  const getStats = useCallback(() => {
    if (!userAgent) return []

    return [
      { label: 'belgi', value: userAgent.length },
      { label: "so'z", value: userAgent.split(/\s+/).length },
      { label: 'versiya', value: parsedUA?.browser.major ? parseInt(parsedUA.browser.major) : 0 },
    ]
  }, [userAgent, parsedUA])

  return {
    // State
    userAgent,
    parsedUA,
    isAnalyzing,
    currentUA,

    // Actions
    setUserAgent,
    analyzeUserAgent,
    loadSampleUA,
    loadCurrentUA,
    clearAll,
    downloadAnalysis,

    // Data
    samples: SAMPLE_USER_AGENTS,
    getStats,

    // Computed
    canDownload: !!parsedUA && !!userAgent,
    isEmpty: !userAgent.trim(),
  }
}
