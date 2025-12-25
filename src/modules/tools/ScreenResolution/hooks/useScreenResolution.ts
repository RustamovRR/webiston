import { useState, useEffect, useCallback } from 'react'

export interface ScreenInfo {
  width: number
  height: number
  availWidth: number
  availHeight: number
  colorDepth: number
  pixelDepth: number
  pixelRatio: number
  orientation: string
  innerWidth: number
  innerHeight: number
  outerWidth: number
  outerHeight: number
  scrollX: number
  scrollY: number
}

export interface ScreenAnalysis {
  deviceType: string
  resolutionCategory: string
  aspectRatio: string
  totalPixels: number
  isFullscreen: boolean
  viewportRatio: number
  isRetina: boolean
}

interface UseScreenResolutionOptions {
  onSuccess?: (message: string) => void
  onError?: (error: string) => void
}

const SAMPLE_SCREEN_INFO: ScreenInfo = {
  width: 1920,
  height: 1080,
  availWidth: 1920,
  availHeight: 1050,
  colorDepth: 24,
  pixelDepth: 24,
  pixelRatio: 2.0,
  orientation: 'Landscape',
  innerWidth: 1200,
  innerHeight: 800,
  outerWidth: 1200,
  outerHeight: 900,
  scrollX: 0,
  scrollY: 150,
}

export const useScreenResolution = (options: UseScreenResolutionOptions = {}) => {
  const [screenInfo, setScreenInfo] = useState<ScreenInfo | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const { onSuccess, onError } = options

  const getScreenInfo = useCallback((): ScreenInfo => {
    return {
      width: screen.width,
      height: screen.height,
      availWidth: screen.availWidth,
      availHeight: screen.availHeight,
      colorDepth: screen.colorDepth,
      pixelDepth: screen.pixelDepth,
      pixelRatio: window.devicePixelRatio,
      orientation: screen.width > screen.height ? 'Landscape' : 'Portrait',
      innerWidth: window.innerWidth,
      innerHeight: window.innerHeight,
      outerWidth: window.outerWidth,
      outerHeight: window.outerHeight,
      scrollX: window.scrollX,
      scrollY: window.scrollY,
    }
  }, [])

  const refreshInfo = useCallback(() => {
    try {
      const info = getScreenInfo()
      setScreenInfo(info)
      onSuccess?.("Ekran ma'lumotlari yangilandi")
    } catch (error) {
      console.error('Screen info error:', error)
      onError?.("Ekran ma'lumotlarini olishda xatolik yuz berdi")
    }
  }, [getScreenInfo, onSuccess, onError])

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen()
        onSuccess?.("Fullscreen rejimiga o'tildi")
      } else {
        await document.exitFullscreen()
        onSuccess?.('Fullscreen rejimidan chiqildi')
      }
    } catch (err) {
      console.error('Fullscreen error:', err)
      onError?.("Fullscreen rejimini o'zgartirishda xatolik yuz berdi")
    }
  }, [onSuccess, onError])

  const loadSampleData = useCallback(() => {
    setScreenInfo(SAMPLE_SCREEN_INFO)
    onSuccess?.("Demo ma'lumotlar yuklandi")
  }, [onSuccess])

  const downloadScreenInfo = useCallback(() => {
    if (!screenInfo) {
      onError?.("Yuklab olish uchun ma'lumot mavjud emas")
      return
    }

    const analysis = getScreenAnalysis(screenInfo)
    const data = {
      timestamp: new Date().toISOString(),
      screenInfo,
      analysis,
      browser: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
      },
    }

    const jsonString = JSON.stringify(data, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)

    const a = document.createElement('a')
    a.href = url
    a.download = `screen-resolution-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    onSuccess?.("Ekran ma'lumotlari yuklab olindi")
  }, [screenInfo, onSuccess, onError])

  const getDeviceType = useCallback((info: ScreenInfo): string => {
    const { width, height } = info
    const maxDimension = Math.max(width, height)

    if (maxDimension <= 768) return 'Mobile'
    if (maxDimension <= 1024) return 'Tablet'
    if (maxDimension <= 1920) return 'Desktop'
    return 'Large Desktop'
  }, [])

  const getResolutionCategory = useCallback((info: ScreenInfo): string => {
    const { width, height } = info
    const pixels = width * height

    if (pixels >= 3840 * 2160) return '4K UHD'
    if (pixels >= 2560 * 1440) return '2K QHD'
    if (pixels >= 1920 * 1080) return 'Full HD'
    if (pixels >= 1366 * 768) return 'HD'
    if (pixels >= 1024 * 768) return 'XGA'
    return 'Lower Resolution'
  }, [])

  const getAspectRatio = useCallback((info: ScreenInfo): string => {
    const { width, height } = info
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
    const divisor = gcd(width, height)

    return `${width / divisor}:${height / divisor}`
  }, [])

  const getScreenAnalysis = useCallback(
    (info: ScreenInfo): ScreenAnalysis => {
      return {
        deviceType: getDeviceType(info),
        resolutionCategory: getResolutionCategory(info),
        aspectRatio: getAspectRatio(info),
        totalPixels: info.width * info.height,
        isFullscreen,
        viewportRatio: Math.round((info.innerWidth / info.width) * 100),
        isRetina: info.pixelRatio > 1,
      }
    },
    [getDeviceType, getResolutionCategory, getAspectRatio, isFullscreen]
  )

  const getResolutionCategories = useCallback(
    () => [
      { name: '4K UHD', resolution: '3840×2160', active: false },
      { name: '2K QHD', resolution: '2560×1440', active: false },
      { name: 'Full HD', resolution: '1920×1080', active: false },
      { name: 'HD', resolution: '1366×768', active: false },
      { name: 'XGA', resolution: '1024×768', active: false },
    ],
    []
  )

  const getDeviceTypes = useCallback(
    () => [
      { name: 'Mobile', range: '≤ 768px', active: false },
      { name: 'Tablet', range: '769px - 1024px', active: false },
      { name: 'Desktop', range: '1025px - 1920px', active: false },
      { name: 'Large Desktop', range: '> 1920px', active: false },
    ],
    []
  )

  const getStats = useCallback(
    (translations?: any) => {
      if (!screenInfo) return []

      const totalPixels = screenInfo.width * screenInfo.height
      const pixelsInMillions = Math.round((totalPixels / 1000000) * 10) / 10 // Round to 1 decimal

      return [
        {
          label: translations?.('megapixels') || 'megapiksel',
          value: pixelsInMillions,
        },
        {
          label: translations?.('width') || 'kenglik',
          value: screenInfo.width,
        },
        {
          label: translations?.('height') || 'balandlik',
          value: screenInfo.height,
        },
      ]
    },
    [screenInfo]
  )

  // Event listeners
  useEffect(() => {
    const updateScreenInfo = () => {
      const info = getScreenInfo()
      setScreenInfo(info)
    }

    const handleScroll = () => {
      setScreenInfo((prev) =>
        prev
          ? {
              ...prev,
              scrollX: window.scrollX,
              scrollY: window.scrollY,
            }
          : null
      )
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
      setTimeout(updateScreenInfo, 100) // Small delay for accurate measurements
    }

    // Initial load
    updateScreenInfo()
    setIsLoading(false)

    // Event listeners
    window.addEventListener('resize', updateScreenInfo)
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('orientationchange', updateScreenInfo)
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      window.removeEventListener('resize', updateScreenInfo)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('orientationchange', updateScreenInfo)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [getScreenInfo])

  return {
    // State
    screenInfo,
    isFullscreen,
    isLoading,

    // Actions
    refreshInfo,
    toggleFullscreen,
    loadSampleData,
    downloadScreenInfo,

    // Computed
    getScreenAnalysis: () => (screenInfo ? getScreenAnalysis(screenInfo) : null),
    getResolutionCategories,
    getDeviceTypes,
    getStats,

    // Utilities
    getDeviceType: () => (screenInfo ? getDeviceType(screenInfo) : 'Unknown'),
    getResolutionCategory: () => (screenInfo ? getResolutionCategory(screenInfo) : 'Unknown'),
    getAspectRatio: () => (screenInfo ? getAspectRatio(screenInfo) : 'Unknown'),
  }
}
