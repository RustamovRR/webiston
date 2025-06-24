'use client'

import {
  Monitor,
  Smartphone,
  Cpu,
  HardDrive,
  Wifi,
  Copy,
  Download,
  RefreshCw,
  Check,
  Zap,
  Globe,
  Shield,
} from 'lucide-react'
import { ToolHeader, CopyButton } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { ShimmerButton, CodeHighlight } from '@/components/ui'
import { useDeviceInfo } from '@/hooks/tools'

export default function DeviceInfoPage() {
  const { deviceInfo, isLoading, copied, refreshDeviceInfo, downloadDeviceInfo, copyAllInfo, copySection } =
    useDeviceInfo({
      onSuccess: (message) => {
        console.log('Success:', message)
      },
      onError: (error) => {
        console.error('Error:', error)
      },
    })

  if (isLoading || !deviceInfo) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6">
        <ToolHeader
          title="Qurilma Ma'lumotlari"
          description="Brauzer, qurilma va operatsion tizim haqida batafsil ma'lumot oling"
        />
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 p-8 backdrop-blur-sm">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
            <div className="text-lg text-zinc-400">Ma'lumotlar yuklanmoqda...</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <ToolHeader
        title="Qurilma Ma'lumotlari"
        description="Brauzer, qurilma va operatsion tizim haqida batafsil ma'lumot oling"
      />

      {/* Control Panel */}
      <div className="mb-6 rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-red-500"></div>
              <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
              <div className="h-3 w-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-sm font-medium text-zinc-300">Tool Boshqaruv</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="text-xs text-zinc-500">Ready</span>
          </div>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h3 className="font-medium text-zinc-200">Qurilma ma'lumotlari</h3>
              <p className="text-sm text-zinc-400">Joriy brauzer va qurilma haqida batafsil ma'lumot</p>
            </div>

            <div className="flex items-center gap-2">
              <ShimmerButton onClick={refreshDeviceInfo} size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Yangilash
              </ShimmerButton>

              <Button onClick={copyAllInfo} variant="outline" size="sm">
                {copied === 'all' ? (
                  <Check className="mr-2 h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="mr-2 h-4 w-4" />
                )}
                {copied === 'all' ? 'Nusxalandi!' : 'Nusxalash'}
              </Button>

              <Button onClick={downloadDeviceInfo} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                JSON
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Browser Info */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <Monitor className="h-5 w-5 text-blue-400" />
              <span className="text-sm font-medium text-zinc-300">Brauzer Ma'lumotlari</span>
            </div>
            <div className="flex items-center gap-2">
              <CopyButton text={JSON.stringify(deviceInfo.browser, null, 2)} size="sm" variant="ghost" />
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <span className="text-xs text-zinc-500">Browser</span>
            </div>
          </div>

          <div className="p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="text-sm text-zinc-400">Brauzer nomi</div>
                <div className="mt-1 text-zinc-100">{deviceInfo.browser.name}</div>
              </div>
              <div>
                <div className="text-sm text-zinc-400">Versiya</div>
                <div className="mt-1 text-zinc-100">{deviceInfo.browser.version}</div>
              </div>
              <div className="sm:col-span-2">
                <div className="mb-2 text-sm text-zinc-400">User Agent</div>
                <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-3">
                  <code className="font-mono text-xs break-all text-zinc-300">{deviceInfo.browser.userAgent}</code>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* System Info */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <Cpu className="h-5 w-5 text-green-400" />
              <span className="text-sm font-medium text-zinc-300">Tizim Ma'lumotlari</span>
            </div>
            <div className="flex items-center gap-2">
              <CopyButton text={JSON.stringify(deviceInfo.system, null, 2)} size="sm" variant="ghost" />
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="text-xs text-zinc-500">System</span>
            </div>
          </div>

          <div className="p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="text-sm text-zinc-400">Platforma</div>
                <div className="mt-1 text-zinc-100">{deviceInfo.system.platform}</div>
              </div>
              <div>
                <div className="text-sm text-zinc-400">Asosiy til</div>
                <div className="mt-1 text-zinc-100">{deviceInfo.system.language}</div>
              </div>
              <div>
                <div className="text-sm text-zinc-400">Vaqt zonasi</div>
                <div className="mt-1 text-zinc-100">{deviceInfo.system.timezone}</div>
              </div>
              <div>
                <div className="text-sm text-zinc-400">Onlayn holati</div>
                <div
                  className={`mt-1 flex items-center gap-2 ${deviceInfo.system.onlineStatus ? 'text-green-400' : 'text-red-400'}`}
                >
                  <div
                    className={`h-2 w-2 rounded-full ${deviceInfo.system.onlineStatus ? 'bg-green-500' : 'bg-red-500'}`}
                  ></div>
                  {deviceInfo.system.onlineStatus ? 'Onlayn' : 'Oflayn'}
                </div>
              </div>
              <div>
                <div className="text-sm text-zinc-400">Cookie yoqilgan</div>
                <div
                  className={`mt-1 flex items-center gap-2 ${deviceInfo.system.cookieEnabled ? 'text-green-400' : 'text-red-400'}`}
                >
                  <div
                    className={`h-2 w-2 rounded-full ${deviceInfo.system.cookieEnabled ? 'bg-green-500' : 'bg-red-500'}`}
                  ></div>
                  {deviceInfo.system.cookieEnabled ? 'Ha' : "Yo'q"}
                </div>
              </div>
              <div>
                <div className="text-sm text-zinc-400">Qo'llab-quvvatlanadigan tillar</div>
                <div className="mt-1 text-zinc-100">{deviceInfo.system.languages.slice(0, 3).join(', ')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Screen Info */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <Smartphone className="h-5 w-5 text-purple-400" />
              <span className="text-sm font-medium text-zinc-300">Ekran Ma'lumotlari</span>
            </div>
            <div className="flex items-center gap-2">
              <CopyButton text={JSON.stringify(deviceInfo.screen, null, 2)} size="sm" variant="ghost" />
              <div className="h-2 w-2 rounded-full bg-purple-500"></div>
              <span className="text-xs text-zinc-500">Screen</span>
            </div>
          </div>

          <div className="p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="text-sm text-zinc-400">Ekran o'lchami</div>
                <div className="mt-1 text-zinc-100">
                  {deviceInfo.screen.width} × {deviceInfo.screen.height} px
                </div>
              </div>
              <div>
                <div className="text-sm text-zinc-400">Mavjud o'lcham</div>
                <div className="mt-1 text-zinc-100">
                  {deviceInfo.screen.availWidth} × {deviceInfo.screen.availHeight} px
                </div>
              </div>
              <div>
                <div className="text-sm text-zinc-400">Rang chuqurligi</div>
                <div className="mt-1 text-zinc-100">{deviceInfo.screen.colorDepth} bit</div>
              </div>
              <div>
                <div className="text-sm text-zinc-400">Piksel nisbati</div>
                <div className="mt-1 text-zinc-100">{deviceInfo.screen.pixelRatio}x</div>
              </div>
              <div>
                <div className="text-sm text-zinc-400">Yo'nalish</div>
                <div className="mt-1 text-zinc-100 capitalize">{deviceInfo.screen.orientation}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Device Info */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <HardDrive className="h-5 w-5 text-orange-400" />
              <span className="text-sm font-medium text-zinc-300">Qurilma Xususiyatlari</span>
            </div>
            <div className="flex items-center gap-2">
              <CopyButton text={JSON.stringify(deviceInfo.device, null, 2)} size="sm" variant="ghost" />
              <div className="h-2 w-2 rounded-full bg-orange-500"></div>
              <span className="text-xs text-zinc-500">Device</span>
            </div>
          </div>

          <div className="p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="text-sm text-zinc-400">Qurilma turi</div>
                <div className="mt-1 text-zinc-100">{deviceInfo.device.type}</div>
              </div>
              <div>
                <div className="text-sm text-zinc-400">Sensorli ekran</div>
                <div
                  className={`mt-1 flex items-center gap-2 ${deviceInfo.device.touchSupport ? 'text-green-400' : 'text-red-400'}`}
                >
                  <div
                    className={`h-2 w-2 rounded-full ${deviceInfo.device.touchSupport ? 'bg-green-500' : 'bg-red-500'}`}
                  ></div>
                  {deviceInfo.device.touchSupport ? "Qo'llab-quvvatlaydi" : "Qo'llab-quvvatlamaydi"}
                </div>
              </div>
              <div>
                <div className="text-sm text-zinc-400">Maksimal sensor nuqtalar</div>
                <div className="mt-1 text-zinc-100">{deviceInfo.device.maxTouchPoints}</div>
              </div>
              <div>
                <div className="text-sm text-zinc-400">Mobil qurilma</div>
                <div
                  className={`mt-1 flex items-center gap-2 ${deviceInfo.device.isMobile ? 'text-green-400' : 'text-zinc-400'}`}
                >
                  <div
                    className={`h-2 w-2 rounded-full ${deviceInfo.device.isMobile ? 'bg-green-500' : 'bg-zinc-500'}`}
                  ></div>
                  {deviceInfo.device.isMobile ? 'Ha' : "Yo'q"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Connection Info */}
        {deviceInfo.connection && (
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
            <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500"></div>
                  <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                  <div className="h-3 w-3 rounded-full bg-green-500"></div>
                </div>
                <Globe className="h-5 w-5 text-cyan-400" />
                <span className="text-sm font-medium text-zinc-300">Internet Ulanishi</span>
              </div>
              <div className="flex items-center gap-2">
                <CopyButton text={JSON.stringify(deviceInfo.connection, null, 2)} size="sm" variant="ghost" />
                <div className="h-2 w-2 rounded-full bg-cyan-500"></div>
                <span className="text-xs text-zinc-500">Connection</span>
              </div>
            </div>

            <div className="p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <div className="text-sm text-zinc-400">Ulanish turi</div>
                  <div className="mt-1 text-zinc-100 capitalize">{deviceInfo.connection.effectiveType}</div>
                </div>
                <div>
                  <div className="text-sm text-zinc-400">Tezlik (Mbps)</div>
                  <div className="mt-1 text-zinc-100">{deviceInfo.connection.downlink}</div>
                </div>
                <div>
                  <div className="text-sm text-zinc-400">Latency (ms)</div>
                  <div className="mt-1 text-zinc-100">{deviceInfo.connection.rtt}</div>
                </div>
                <div>
                  <div className="text-sm text-zinc-400">Data tejash rejimi</div>
                  <div
                    className={`mt-1 flex items-center gap-2 ${deviceInfo.connection.saveData ? 'text-green-400' : 'text-red-400'}`}
                  >
                    <div
                      className={`h-2 w-2 rounded-full ${deviceInfo.connection.saveData ? 'bg-green-500' : 'bg-red-500'}`}
                    ></div>
                    {deviceInfo.connection.saveData ? 'Yoqilgan' : "O'chirilgan"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help and Information */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
          <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <Shield className="h-5 w-5 text-pink-400" />
              <span className="text-sm font-medium text-zinc-300">Qurilma ma'lumotlari haqida</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-pink-500"></div>
              <span className="text-xs text-zinc-500">Information</span>
            </div>
          </div>

          <div className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="mb-3 font-medium text-zinc-200">Asosiy foydalanish joylari:</h4>
                <ul className="space-y-2 text-sm text-zinc-400">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-violet-500"></div>
                    <strong>Web Development:</strong> Responsive dizayn uchun ekran o'lchamlari
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-pink-500"></div>
                    <strong>Browser Testing:</strong> Turli brauzerlarda muvofiqlikni tekshirish
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                    <strong>Performance:</strong> Qurilma imkoniyatlariga qarab optimallashtirish
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-cyan-500"></div>
                    <strong>Analytics:</strong> Foydalanuvchi qurilmalari statistikasi
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                    <strong>Support:</strong> Texnik qo'llab-quvvatlash va debugging
                  </li>
                </ul>
              </div>

              <div>
                <h4 className="mb-3 font-medium text-zinc-200">Professional maslahatlar:</h4>
                <ul className="space-y-2 text-sm text-zinc-400">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-violet-500"></div>
                    User Agent ma'lumotlarini server-side detection uchun ishlatib ko'ring
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-pink-500"></div>
                    Screen resolution'ni responsive breakpoint'lar uchun tahlil qiling
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-orange-500"></div>
                    Device memory va CPU core'larni performance tuning uchun ishlatib ko'ring
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-cyan-500"></div>
                    Connection type'ni lazy loading strategiyasi uchun hisobga oling
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-green-500"></div>
                    Touch support'ni mobile-first dizayn uchun tekshirib ko'ring
                  </li>
                </ul>

                <div className="mt-4 rounded-lg bg-pink-500/10 p-3">
                  <div className="text-sm text-pink-400">
                    <strong>Maslahat:</strong> Bu ma'lumotlarni JSON formatida yuklab olib, web analytics va performance
                    monitoring uchun ishlatib ko'ring.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
