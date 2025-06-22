'use client'

import { Metadata } from 'next'

// export const metadata: Metadata = {
//   title: "Qurilma Ma'lumotlari - Brauzer va Tizim Haqida Batafsil | Webiston",
//   description:
//     "Brauzer, qurilma va operatsion tizim haqida batafsil ma'lumot oling. Device Information tool - screen resolution, browser details, system info.",
//   keywords: [
//     'device info',
//     'browser info',
//     'system information',
//     "qurilma ma'lumotlari",
//     "brauzer ma'lumotlari",
//     "tizim ma'lumotlari",
//   ],
//   openGraph: {
//     title: "Qurilma Ma'lumotlari - Device Information Tool",
//     description: "Brauzer, qurilma va operatsion tizim haqida batafsil ma'lumot oling",
//     type: 'website',
//     locale: 'uz_UZ',
//   },
//   twitter: {
//     card: 'summary_large_image',
//     title: "Qurilma Ma'lumotlari - Device Information Tool",
//     description: "Brauzer, qurilma va operatsion tizim haqida batafsil ma'lumot oling",
//   },
//   alternates: {
//     canonical: '/tools/device-info',
//   },
// }

import { useState, useEffect } from 'react'
import { Monitor, Smartphone, Cpu, HardDrive, Wifi } from 'lucide-react'
import { ToolHeader } from '@/components/shared/ToolHeader'
import { Card } from '@/components/ui/card'
import { StatsDisplay } from '@/components/shared/StatsDisplay'

interface DeviceInfo {
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

export default function DeviceInfoPage() {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const detectDevice = () => {
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
    }

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
            : null,
        )
      }
    }

    window.addEventListener('online', handleOnlineChange)
    window.addEventListener('offline', handleOnlineChange)

    return () => {
      window.removeEventListener('online', handleOnlineChange)
      window.removeEventListener('offline', handleOnlineChange)
    }
  }, [])

  if (isLoading || !deviceInfo) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4">
        <ToolHeader
          title="Qurilma Ma'lumotlari"
          description="Brauzer, qurilma va tizim haqida batafsil ma'lumot oling"
        />
        <div className="py-12 text-center">
          <div className="text-lg text-zinc-400">Ma'lumotlar yuklanmoqda...</div>
        </div>
      </div>
    )
  }

  const stats = [
    { label: 'qurilma turi', value: deviceInfo.device.type },
    { label: 'brauzer', value: deviceInfo.browser.name },
    { label: 'til', value: deviceInfo.system.language },
  ]

  return (
    <div className="mx-auto w-full max-w-4xl px-4">
      <ToolHeader title="Qurilma Ma'lumotlari" description="Brauzer, qurilma va tizim haqida batafsil ma'lumot oling" />

      <div className="mb-6">
        <StatsDisplay stats={stats} />
      </div>

      <div className="space-y-6">
        {/* Browser Info */}
        <Card className="border-zinc-800 bg-zinc-900/80">
          <div className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Monitor className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-100">Brauzer Ma'lumotlari</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="text-sm text-zinc-400">Brauzer nomi</div>
                <div className="text-zinc-100">{deviceInfo.browser.name}</div>
              </div>
              <div>
                <div className="text-sm text-zinc-400">Versiya</div>
                <div className="text-zinc-100">{deviceInfo.browser.version}</div>
              </div>
              <div className="sm:col-span-2">
                <div className="text-sm text-zinc-400">User Agent</div>
                <div className="mt-1 rounded bg-zinc-800/50 p-2 text-xs break-all text-zinc-300">
                  {deviceInfo.browser.userAgent}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* System Info */}
        <Card className="border-zinc-800 bg-zinc-900/80">
          <div className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <Cpu className="h-5 w-5 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-100">Tizim Ma'lumotlari</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="text-sm text-zinc-400">Platforma</div>
                <div className="text-zinc-100">{deviceInfo.system.platform}</div>
              </div>
              <div>
                <div className="text-sm text-zinc-400">Asosiy til</div>
                <div className="text-zinc-100">{deviceInfo.system.language}</div>
              </div>
              <div>
                <div className="text-sm text-zinc-400">Vaqt zonasi</div>
                <div className="text-zinc-100">{deviceInfo.system.timezone}</div>
              </div>
              <div>
                <div className="text-sm text-zinc-400">Onlayn holati</div>
                <div className={`${deviceInfo.system.onlineStatus ? 'text-green-400' : 'text-red-400'}`}>
                  {deviceInfo.system.onlineStatus ? 'Onlayn' : 'Oflayn'}
                </div>
              </div>
              <div>
                <div className="text-sm text-zinc-400">Cookie yoqilgan</div>
                <div className={`${deviceInfo.system.cookieEnabled ? 'text-green-400' : 'text-red-400'}`}>
                  {deviceInfo.system.cookieEnabled ? 'Ha' : "Yo'q"}
                </div>
              </div>
              <div>
                <div className="text-sm text-zinc-400">Qo'llab-quvvatlanadigan tillar</div>
                <div className="text-zinc-100">{deviceInfo.system.languages.slice(0, 3).join(', ')}</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Screen Info */}
        <Card className="border-zinc-800 bg-zinc-900/80">
          <div className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <Smartphone className="h-5 w-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-100">Ekran Ma'lumotlari</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="text-sm text-zinc-400">Ekran o'lchami</div>
                <div className="text-zinc-100">
                  {deviceInfo.screen.width} × {deviceInfo.screen.height}
                </div>
              </div>
              <div>
                <div className="text-sm text-zinc-400">Mavjud o'lcham</div>
                <div className="text-zinc-100">
                  {deviceInfo.screen.availWidth} × {deviceInfo.screen.availHeight}
                </div>
              </div>
              <div>
                <div className="text-sm text-zinc-400">Rang chuqurligi</div>
                <div className="text-zinc-100">{deviceInfo.screen.colorDepth} bit</div>
              </div>
              <div>
                <div className="text-sm text-zinc-400">Piksel nisbati</div>
                <div className="text-zinc-100">{deviceInfo.screen.pixelRatio}x</div>
              </div>
              <div>
                <div className="text-sm text-zinc-400">Yo'nalish</div>
                <div className="text-zinc-100 capitalize">{deviceInfo.screen.orientation}</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Device Info */}
        <Card className="border-zinc-800 bg-zinc-900/80">
          <div className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                <HardDrive className="h-5 w-5 text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-100">Qurilma Xususiyatlari</h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="text-sm text-zinc-400">Qurilma turi</div>
                <div className="text-zinc-100">{deviceInfo.device.type}</div>
              </div>
              <div>
                <div className="text-sm text-zinc-400">Sensorli ekran</div>
                <div className={`${deviceInfo.device.touchSupport ? 'text-green-400' : 'text-red-400'}`}>
                  {deviceInfo.device.touchSupport ? 'Ha' : "Yo'q"}
                </div>
              </div>
              <div>
                <div className="text-sm text-zinc-400">Maksimal sensor nuqtalari</div>
                <div className="text-zinc-100">{deviceInfo.device.maxTouchPoints}</div>
              </div>
              {deviceInfo.memory && (
                <>
                  <div>
                    <div className="text-sm text-zinc-400">Xotira (GB)</div>
                    <div className="text-zinc-100">{deviceInfo.memory.deviceMemory}</div>
                  </div>
                  <div>
                    <div className="text-sm text-zinc-400">CPU yadrolar</div>
                    <div className="text-zinc-100">{deviceInfo.memory.hardwareConcurrency}</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </Card>

        {/* Connection Info */}
        {deviceInfo.connection && (
          <Card className="border-zinc-800 bg-zinc-900/80">
            <div className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
                  <Wifi className="h-5 w-5 text-cyan-400" />
                </div>
                <h3 className="text-lg font-semibold text-zinc-100">Internet Ulanishi</h3>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-sm text-zinc-400">Ulanish turi</div>
                  <div className="text-zinc-100 capitalize">{deviceInfo.connection.effectiveType}</div>
                </div>
                <div>
                  <div className="text-sm text-zinc-400">Tezlik (Mbps)</div>
                  <div className="text-zinc-100">{deviceInfo.connection.downlink}</div>
                </div>
                <div>
                  <div className="text-sm text-zinc-400">Latency (ms)</div>
                  <div className="text-zinc-100">{deviceInfo.connection.rtt}</div>
                </div>
                <div>
                  <div className="text-sm text-zinc-400">Data tejash rejimi</div>
                  <div className={`${deviceInfo.connection.saveData ? 'text-green-400' : 'text-red-400'}`}>
                    {deviceInfo.connection.saveData ? 'Yoqilgan' : "O'chirilgan"}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Yordam */}
        <Card className="border-zinc-800 bg-zinc-900/80">
          <div className="p-6">
            <h4 className="mb-3 font-medium text-zinc-200">Qurilma ma'lumotlari nima uchun kerak?</h4>
            <div className="space-y-2 text-sm text-zinc-400">
              <p>• Web saytingizni turli qurilmalarda optimallashtirish uchun</p>
              <p>• Texnik qo'llab-quvvatlash va muammolarni hal qilish uchun</p>
              <p>• Brauzer muvofiqligini tekshirish uchun</p>
              <p>• Responsive dizayn uchun ekran o'lchamlarini bilish</p>
              <p>• Performance optimallashtirish uchun qurilma imkoniyatlarini aniqlash</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
