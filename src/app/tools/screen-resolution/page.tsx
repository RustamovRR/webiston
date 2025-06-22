'use client'

import { useState, useEffect } from 'react'
import { Ruler, Monitor, Smartphone, RefreshCw } from 'lucide-react'
import { ToolHeader } from '@/components/shared/ToolHeader'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface ScreenInfo {
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

export default function ScreenResolutionPage() {
  const [screenInfo, setScreenInfo] = useState<ScreenInfo | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const getScreenInfo = () => {
    const info: ScreenInfo = {
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

    setScreenInfo(info)
  }

  useEffect(() => {
    getScreenInfo()

    const handleResize = () => {
      getScreenInfo()
    }

    const handleScroll = () => {
      setScreenInfo((prev) =>
        prev
          ? {
              ...prev,
              scrollX: window.scrollX,
              scrollY: window.scrollY,
            }
          : null,
      )
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
      setTimeout(getScreenInfo, 100) // Small delay for accurate measurements
    }

    window.addEventListener('resize', handleResize)
    window.addEventListener('scroll', handleScroll)
    window.addEventListener('orientationchange', handleResize)
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('orientationchange', handleResize)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  const refreshInfo = () => {
    getScreenInfo()
  }

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen()
      } catch (err) {
        console.error('Error entering fullscreen:', err)
      }
    } else {
      try {
        await document.exitFullscreen()
      } catch (err) {
        console.error('Error exiting fullscreen:', err)
      }
    }
  }

  const getDeviceType = () => {
    if (!screenInfo) return 'Unknown'

    const { width, height } = screenInfo
    const maxDimension = Math.max(width, height)

    if (maxDimension <= 768) return 'Mobile'
    if (maxDimension <= 1024) return 'Tablet'
    if (maxDimension <= 1920) return 'Desktop'
    return 'Large Desktop'
  }

  const getResolutionCategory = () => {
    if (!screenInfo) return 'Unknown'

    const { width, height } = screenInfo
    const pixels = width * height

    if (pixels >= 3840 * 2160) return '4K UHD'
    if (pixels >= 2560 * 1440) return '2K QHD'
    if (pixels >= 1920 * 1080) return 'Full HD'
    if (pixels >= 1366 * 768) return 'HD'
    if (pixels >= 1024 * 768) return 'XGA'
    return 'Lower Resolution'
  }

  const getAspectRatio = () => {
    if (!screenInfo) return 'Unknown'

    const { width, height } = screenInfo
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
    const divisor = gcd(width, height)

    return `${width / divisor}:${height / divisor}`
  }

  if (!screenInfo) {
    return (
      <div className="mx-auto w-full max-w-4xl px-4">
        <ToolHeader title="Ekran O'lchami" description="Ekran o'lchami va resolution ma'lumotlari" />
        <div className="py-12 text-center">
          <div className="text-lg text-zinc-400">Ma'lumotlar yuklanmoqda...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4">
      <ToolHeader title="Ekran O'lchami" description="Ekran o'lchami va resolution ma'lumotlari" />

      {/* Controls */}
      <Card className="mb-6 border-zinc-800 bg-zinc-900/80">
        <div className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-medium text-zinc-200">Ekran ma'lumotlari</h3>
              <p className="text-sm text-zinc-400">Real vaqtda ekran o'lchami va resolution ma'lumotlari</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={refreshInfo} variant="outline" className="border-zinc-700">
                <RefreshCw className="mr-2 h-4 w-4" />
                Yangilash
              </Button>
              <Button onClick={toggleFullscreen} variant="outline" className="border-zinc-700">
                <Monitor className="mr-2 h-4 w-4" />
                {isFullscreen ? 'Fullscreen dan chiqish' : 'Fullscreen'}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Overview Cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="border-zinc-800 bg-zinc-900/80">
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {screenInfo.width} × {screenInfo.height}
            </div>
            <div className="text-sm text-zinc-400">Ekran o'lchami</div>
          </div>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900/80">
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{getResolutionCategory()}</div>
            <div className="text-sm text-zinc-400">Resolution turi</div>
          </div>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900/80">
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-400">{getAspectRatio()}</div>
            <div className="text-sm text-zinc-400">Nisbat</div>
          </div>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900/80">
          <div className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-400">{getDeviceType()}</div>
            <div className="text-sm text-zinc-400">Qurilma turi</div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Screen Information */}
        <Card className="border-zinc-800 bg-zinc-900/80">
          <div className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                <Ruler className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-100">Ekran Ma'lumotlari</h3>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-zinc-400">Umumiy o'lcham</div>
                  <div className="font-mono text-zinc-100">
                    {screenInfo.width} × {screenInfo.height}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-zinc-400">Mavjud o'lcham</div>
                  <div className="font-mono text-zinc-100">
                    {screenInfo.availWidth} × {screenInfo.availHeight}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-zinc-400">Rang chuqurligi</div>
                  <div className="text-zinc-100">{screenInfo.colorDepth} bit</div>
                </div>
                <div>
                  <div className="text-sm text-zinc-400">Piksel chuqurligi</div>
                  <div className="text-zinc-100">{screenInfo.pixelDepth} bit</div>
                </div>
                <div>
                  <div className="text-sm text-zinc-400">Piksel nisbati</div>
                  <div className="text-zinc-100">{screenInfo.pixelRatio}x</div>
                </div>
                <div>
                  <div className="text-sm text-zinc-400">Yo'nalish</div>
                  <div className="text-zinc-100">{screenInfo.orientation}</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Browser Window */}
        <Card className="border-zinc-800 bg-zinc-900/80">
          <div className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                <Monitor className="h-5 w-5 text-green-400" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-100">Brauzer Oynasi</h3>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-zinc-400">Ichki o'lcham</div>
                  <div className="font-mono text-zinc-100">
                    {screenInfo.innerWidth} × {screenInfo.innerHeight}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-zinc-400">Tashqi o'lcham</div>
                  <div className="font-mono text-zinc-100">
                    {screenInfo.outerWidth} × {screenInfo.outerHeight}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-zinc-400">Scroll X</div>
                  <div className="text-zinc-100">{Math.round(screenInfo.scrollX)}px</div>
                </div>
                <div>
                  <div className="text-sm text-zinc-400">Scroll Y</div>
                  <div className="text-zinc-100">{Math.round(screenInfo.scrollY)}px</div>
                </div>
                <div>
                  <div className="text-sm text-zinc-400">Fullscreen</div>
                  <div className={`${isFullscreen ? 'text-green-400' : 'text-red-400'}`}>
                    {isFullscreen ? 'Ha' : "Yo'q"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-zinc-400">Umumiy piksellar</div>
                  <div className="text-zinc-100">{(screenInfo.width * screenInfo.height).toLocaleString()}</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Resolution Categories */}
        <Card className="border-zinc-800 bg-zinc-900/80">
          <div className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                <Smartphone className="h-5 w-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-100">Resolution Turlari</h3>
            </div>

            <div className="space-y-2 text-sm">
              {[
                { name: '4K UHD', resolution: '3840×2160', active: getResolutionCategory() === '4K UHD' },
                { name: '2K QHD', resolution: '2560×1440', active: getResolutionCategory() === '2K QHD' },
                { name: 'Full HD', resolution: '1920×1080', active: getResolutionCategory() === 'Full HD' },
                { name: 'HD', resolution: '1366×768', active: getResolutionCategory() === 'HD' },
                { name: 'XGA', resolution: '1024×768', active: getResolutionCategory() === 'XGA' },
              ].map((item) => (
                <div
                  key={item.name}
                  className={`flex justify-between rounded p-2 ${
                    item.active ? 'bg-blue-500/20 text-blue-400' : 'text-zinc-400'
                  }`}
                >
                  <span>{item.name}</span>
                  <span className="font-mono">{item.resolution}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Device Types */}
        <Card className="border-zinc-800 bg-zinc-900/80">
          <div className="p-6">
            <div className="mb-4 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                <Monitor className="h-5 w-5 text-orange-400" />
              </div>
              <h3 className="text-lg font-semibold text-zinc-100">Qurilma Turlari</h3>
            </div>

            <div className="space-y-2 text-sm">
              {[
                { name: 'Mobile', range: '≤ 768px', active: getDeviceType() === 'Mobile' },
                { name: 'Tablet', range: '769px - 1024px', active: getDeviceType() === 'Tablet' },
                { name: 'Desktop', range: '1025px - 1920px', active: getDeviceType() === 'Desktop' },
                { name: 'Large Desktop', range: '> 1920px', active: getDeviceType() === 'Large Desktop' },
              ].map((item) => (
                <div
                  key={item.name}
                  className={`flex justify-between rounded p-2 ${
                    item.active ? 'bg-green-500/20 text-green-400' : 'text-zinc-400'
                  }`}
                >
                  <span>{item.name}</span>
                  <span className="font-mono text-xs">{item.range}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* Help Section */}
      <Card className="mt-6 border-zinc-800 bg-zinc-900/80">
        <div className="p-6">
          <h4 className="mb-3 font-medium text-zinc-200">Ekran o'lchami vositasi haqida</h4>
          <div className="space-y-2 text-sm text-zinc-400">
            <p>
              • <strong>Umumiy o'lcham:</strong> Ekranning to'liq fizik o'lchami
            </p>
            <p>
              • <strong>Mavjud o'lcham:</strong> Taskbar va boshqa tizim elementlaridan tashqari
            </p>
            <p>
              • <strong>Ichki o'lcham:</strong> Brauzer oynasining kontent maydoni
            </p>
            <p>
              • <strong>Tashqi o'lcham:</strong> Brauzer oynasining to'liq o'lchami
            </p>
            <p>
              • <strong>Piksel nisbati:</strong> Fizik va mantiqiy piksellar nisbati (Retina ekranlar uchun)
            </p>
            <p>
              • <strong>Scroll:</strong> Sahifa gorizontal va vertikal scroll pozitsiyasi
            </p>
          </div>

          <div className="mt-4 rounded-lg bg-blue-500/10 p-3">
            <div className="text-sm text-blue-400">
              <strong>Maslahat:</strong> Responsive dizayn uchun turli ekran o'lchamlarida saytingizni sinab ko'ring.
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
