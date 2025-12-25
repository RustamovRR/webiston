import { useState, useEffect, useCallback } from 'react'
import { useCopyToClipboard } from 'usehooks-ts'

// Sample detection results for demo
const SAMPLE_DEVICE_INFO = {
  browser: {
    name: 'Chrome',
    version: '120.0.6099.109',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
  },
  system: {
    platform: 'MacIntel',
    language: 'uz-UZ',
    languages: ['uz-UZ', 'en-US', 'ru-RU'],
    timezone: 'Asia/Tashkent',
    cookieEnabled: true,
    onlineStatus: true,
  },
  screen: {
    width: 1920,
    height: 1080,
    availWidth: 1920,
    availHeight: 1050,
    colorDepth: 24,
    pixelRatio: 2.0,
    orientation: 'landscape',
  },
  device: {
    type: 'Desktop',
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    touchSupport: false,
    maxTouchPoints: 0,
  },
}

export interface DeviceInfo {
  browser: {
    name: string
    version: string
    userAgent: string
  }
  system: {
    platform: string
    language: string
    languages: string[]
    timezone: string
    cookieEnabled: boolean
    onlineStatus: boolean
  }
  screen: {
    width: number
    height: number
    availWidth: number
    availHeight: number
    colorDepth: number
    pixelRatio: number
    orientation: string
  }
  device: {
    type: string
    isMobile: boolean
    isTablet: boolean
    isDesktop: boolean
    touchSupport: boolean
    maxTouchPoints: number
  }
  memory?: {
    deviceMemory?: number
    hardwareConcurrency?: number
  }
  connection?: {
    effectiveType?: string
    downlink?: number
    rtt?: number
    saveData?: boolean
  }
}

interface UseDeviceInfoOptions {
  onSuccess?: (message: string) => void
  onError?: (error: string) => void
}

export const useDeviceInfo = (options: UseDeviceInfoOptions = {}) => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState('')
  const [_, copy] = useCopyToClipboard()

  const { onSuccess, onError } = options

  const detectDevice = useCallback(() => {
    try {
      const ua = navigator.userAgent
      const platform = navigator.platform

      // Browser detection
      let browserName = 'Unknown'
      let browserVersion = 'Unknown'

      if (ua.includes('Chrome') && !ua.includes('Edg')) {
        browserName = 'Chrome'
        browserVersion = ua.match(/Chrome\/([0-9.]+)/)?.[1] || ''
      } else if (ua.includes('Firefox')) {
        browserName = 'Firefox'
        browserVersion = ua.match(/Firefox\/([0-9.]+)/)?.[1] || ''
      } else if (ua.includes('Safari') && !ua.includes('Chrome')) {
        browserName = 'Safari'
        browserVersion = ua.match(/Version\/([0-9.]+)/)?.[1] || ''
      } else if (ua.includes('Edg')) {
        browserName = 'Edge'
        browserVersion = ua.match(/Edg\/([0-9.]+)/)?.[1] || ''
      }

      // Device type detection
      const isMobile = /Mobi|Android/i.test(ua)
      const isTablet = /Tablet|iPad/i.test(ua)
      const isDesktop = !isMobile && !isTablet

      let deviceType = 'Desktop'
      if (isMobile) deviceType = 'Mobile'
      else if (isTablet) deviceType = 'Tablet'

      // Screen orientation
      let orientation = 'landscape'
      if (screen.width < screen.height) orientation = 'portrait'

      const info: DeviceInfo = {
        browser: {
          name: browserName,
          version: browserVersion,
          userAgent: ua,
        },
        system: {
          platform: platform,
          language: navigator.language,
          languages: Array.from(navigator.languages),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          cookieEnabled: navigator.cookieEnabled,
          onlineStatus: navigator.onLine,
        },
        screen: {
          width: screen.width,
          height: screen.height,
          availWidth: screen.availWidth,
          availHeight: screen.availHeight,
          colorDepth: screen.colorDepth,
          pixelRatio: window.devicePixelRatio,
          orientation: orientation,
        },
        device: {
          type: deviceType,
          isMobile,
          isTablet,
          isDesktop,
          touchSupport: 'ontouchstart' in window,
          maxTouchPoints: navigator.maxTouchPoints || 0,
        },
      }

      // Additional APIs if available
      if ('deviceMemory' in navigator) {
        info.memory = {
          deviceMemory: (navigator as any).deviceMemory,
          hardwareConcurrency: navigator.hardwareConcurrency,
        }
      }

      if ('connection' in navigator) {
        const conn = (navigator as any).connection
        info.connection = {
          effectiveType: conn.effectiveType,
          downlink: conn.downlink,
          rtt: conn.rtt,
          saveData: conn.saveData,
        }
      }

      setDeviceInfo(info)
      setIsLoading(false)
      onSuccess?.("Qurilma ma'lumotlari muvaffaqiyatli yuklandi")
    } catch (error) {
      console.error('Device detection error:', error)
      onError?.("Qurilma ma'lumotlarini yuklashda xatolik yuz berdi")
      setIsLoading(false)
    }
  }, [])

  const handleCopy = useCallback(
    async (text: string, type: string) => {
      try {
        await copy(text)
        setCopied(type)
        setTimeout(() => setCopied(''), 2000)
        onSuccess?.(`${type} ma'lumotlari nusxalandi`)
      } catch (error) {
        console.error('Copy failed:', error)
        onError?.('Nusxalashda xatolik yuz berdi')
      }
    },
    [copy, onSuccess, onError]
  )

  const downloadDeviceInfo = useCallback(() => {
    if (!deviceInfo) {
      onError?.("Yuklab olish uchun ma'lumot mavjud emas")
      return
    }

    try {
      const data = {
        timestamp: new Date().toISOString(),
        device_info: deviceInfo,
        generated_by: 'Webiston Device Info Tool',
        url: window.location.href,
      }

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `device-info-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      onSuccess?.("Qurilma ma'lumotlari muvaffaqiyatli yuklab olindi")
    } catch (error) {
      console.error('Download failed:', error)
      onError?.('Yuklab olishda xatolik yuz berdi')
    }
  }, [deviceInfo, onSuccess, onError])

  const refreshDeviceInfo = useCallback(() => {
    setIsLoading(true)
    setTimeout(() => {
      detectDevice()
    }, 500)
  }, [detectDevice])

  const copySection = useCallback(
    (section: keyof DeviceInfo) => {
      if (!deviceInfo || !deviceInfo[section]) {
        onError?.("Nusxalash uchun ma'lumot mavjud emas")
        return
      }

      const sectionData = JSON.stringify(deviceInfo[section], null, 2)
      handleCopy(sectionData, section)
    },
    [deviceInfo, handleCopy, onError]
  )

  const copyAllInfo = useCallback(() => {
    if (!deviceInfo) {
      onError?.("Nusxalash uchun ma'lumot mavjud emas")
      return
    }

    const allData = JSON.stringify(deviceInfo, null, 2)
    handleCopy(allData, 'all')
  }, [deviceInfo, handleCopy, onError])

  const getDeviceSpecs = useCallback(() => {
    if (!deviceInfo) return null

    return {
      deviceType: deviceInfo.device.type,
      browserInfo: `${deviceInfo.browser.name} ${deviceInfo.browser.version}`,
      screenResolution: `${deviceInfo.screen.width}x${deviceInfo.screen.height}`,
      platform: deviceInfo.system.platform,
      language: deviceInfo.system.language,
      isOnline: deviceInfo.system.onlineStatus,
      touchSupport: deviceInfo.device.touchSupport,
      memoryInfo: deviceInfo.memory
        ? `${deviceInfo.memory.deviceMemory}GB RAM, ${deviceInfo.memory.hardwareConcurrency} cores`
        : null,
      connectionInfo: deviceInfo.connection
        ? `${deviceInfo.connection.effectiveType}, ${deviceInfo.connection.downlink}Mbps`
        : null,
    }
  }, [deviceInfo])

  useEffect(() => {
    detectDevice()

    // Listen for online/offline changes
    const handleOnlineChange = () => {
      if (deviceInfo) {
        setDeviceInfo((prev) =>
          prev
            ? {
                ...prev,
                system: { ...prev.system, onlineStatus: navigator.onLine },
              }
            : null
        )
      }
    }

    // Listen for orientation changes
    const handleOrientationChange = () => {
      if (deviceInfo) {
        const newOrientation = screen.width < screen.height ? 'portrait' : 'landscape'
        setDeviceInfo((prev) =>
          prev
            ? {
                ...prev,
                screen: { ...prev.screen, orientation: newOrientation },
              }
            : null
        )
      }
    }

    window.addEventListener('online', handleOnlineChange)
    window.addEventListener('offline', handleOnlineChange)
    window.addEventListener('orientationchange', handleOrientationChange)
    window.addEventListener('resize', handleOrientationChange)

    return () => {
      window.removeEventListener('online', handleOnlineChange)
      window.removeEventListener('offline', handleOnlineChange)
      window.removeEventListener('orientationchange', handleOrientationChange)
      window.removeEventListener('resize', handleOrientationChange)
    }
  }, [])

  return {
    // State
    deviceInfo,
    isLoading,
    copied,

    // Actions
    refreshDeviceInfo,
    downloadDeviceInfo,
    copyAllInfo,
    copySection,

    // Utilities
    getDeviceSpecs,
  }
}
