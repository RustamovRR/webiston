'use client'

// UI Components
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { CodeHighlight } from '@/components/ui/code-highlight'

// Shared Components
import { ToolHeader } from '@/components/shared/ToolHeader'
import { CopyButton } from '@/components/shared/CopyButton'
import { StatsDisplay } from '@/components/shared/StatsDisplay'

// Utils & Hooks
import { useIPInfo } from '@/hooks'

// Icons
import { MapPin, Globe, Wifi, RefreshCw, Search, Download, Shield, Clock } from 'lucide-react'

export default function IpInfo() {
  const {
    ipAddress,
    ipInfo,
    currentIP,
    isLoading,
    error,
    setIpAddress,
    analyzeIP,
    loadSampleIP,
    loadCurrentIP,
    clearData,
    downloadInfo,
    getStats,
    samples,
    canDownload,
    isEmpty,
  } = useIPInfo()

  return (
    <div className="mx-auto w-full max-w-7xl px-4">
      <ToolHeader
        title="IP Ma'lumotlari"
        description="IP manzil va geolokatsiya ma'lumotlarini professional tahlil qiling, ISP va xavfsizlik ma'lumotlari"
      />

      {/* Quick Actions */}
      <div className="mb-6 flex flex-wrap gap-3">
        <Button
          onClick={loadCurrentIP}
          variant="outline"
          size="sm"
          className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
          disabled={!currentIP}
        >
          <MapPin className="mr-2 h-4 w-4" />
          Joriy IP
        </Button>
        <Button onClick={clearData} variant="outline" size="sm" className="border-zinc-700 hover:bg-zinc-800">
          <RefreshCw className="mr-2 h-4 w-4" />
          Tozalash
        </Button>
        {canDownload && (
          <Button
            onClick={downloadInfo}
            variant="outline"
            size="sm"
            className="border-green-500/50 text-green-400 hover:bg-green-500/10"
          >
            <Download className="mr-2 h-4 w-4" />
            JSON yuklab olish
          </Button>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Panel - Input */}
        <div className="space-y-6">
          {/* Terminal Input Panel */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
            {/* Terminal Header */}
            <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/50 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <span className="ml-2 text-sm font-medium text-zinc-400">Tool Kirish</span>
            </div>

            {/* Input Content */}
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <Input
                    placeholder="IP manzilni kiriting (masalan: 8.8.8.8)"
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    className="border-zinc-700 bg-zinc-800/50 font-mono text-sm"
                  />
                  {error && (
                    <p className="mt-2 flex items-center gap-2 text-sm text-red-400">
                      <div className="h-1.5 w-1.5 rounded-full bg-red-400"></div>
                      {error}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <StatsDisplay stats={getStats()} />
                  <ShimmerButton
                    onClick={analyzeIP}
                    disabled={isEmpty || isLoading}
                    className="bg-gradient-to-r from-blue-600 to-purple-600"
                  >
                    <Search className="mr-2 h-4 w-4" />
                    {isLoading ? 'Tahlil qilinmoqda...' : 'Tahlil qilish'}
                  </ShimmerButton>
                </div>
              </div>
            </div>
          </div>

          {/* Current IP Display */}
          {currentIP && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
              <div className="border-b border-zinc-800 bg-zinc-900/50 px-4 py-3">
                <h3 className="text-sm font-medium text-zinc-300">Sizning IP Manzilingiz</h3>
              </div>
              <div className="p-4">
                <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-3">
                  <div className="font-mono text-lg text-zinc-100">{currentIP}</div>
                  <div className="mt-1 text-sm text-zinc-400">Joriy IP manzil</div>
                </div>
              </div>
            </div>
          )}

          {/* Sample IPs */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
            <div className="border-b border-zinc-800 bg-zinc-900/50 px-4 py-3">
              <h3 className="text-sm font-medium text-zinc-300">Namuna IP Manzillar</h3>
            </div>
            <div className="p-4">
              <div className="space-y-2">
                {samples.map((sample, index) => (
                  <button
                    key={index}
                    onClick={() => loadSampleIP(sample)}
                    className="w-full rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-3 text-left transition-all hover:border-zinc-600 hover:bg-zinc-800/50"
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-medium text-zinc-200">{sample.name}</span>
                      <Globe className="h-3 w-3 text-blue-400" />
                    </div>
                    <p className="text-xs text-zinc-500">{sample.description}</p>
                    <div className="mt-2 font-mono text-sm text-zinc-400">{sample.ip}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Results */}
        <div className="space-y-6">
          {/* Terminal Output Panel */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
            {/* Terminal Header */}
            <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/50 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <span className="ml-2 text-sm font-medium text-zinc-400">Tool Natija/Chiqish</span>
              <div className="ml-auto flex items-center gap-2">
                {ipInfo && (
                  <>
                    <div className="h-2 w-2 rounded-full bg-green-400"></div>
                    <span className="text-xs text-green-400">Tahlil tayyor</span>
                  </>
                )}
              </div>
            </div>

            {/* Analysis Content */}
            <div className="p-6">
              {ipInfo ? (
                <div className="space-y-6">
                  {/* Location Information */}
                  <div className="space-y-3">
                    <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
                      <MapPin className="h-4 w-4 text-blue-400" />
                      Joylashuv Ma'lumotlari
                    </h4>
                    <div className="grid grid-cols-2 gap-4 rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-4">
                      <div>
                        <div className="text-xs text-zinc-500">IP manzil</div>
                        <div className="font-mono text-sm font-medium text-zinc-200">{ipInfo.ip}</div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500">IP turi</div>
                        <div className="text-sm font-medium text-zinc-200 uppercase">{ipInfo.type}</div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500">Mamlakat</div>
                        <div className="flex items-center gap-2 text-sm font-medium text-zinc-200">
                          {ipInfo.location.country_flag_emoji}
                          {ipInfo.country_name || "Noma'lum"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500">Viloyat/Shtat</div>
                        <div className="text-sm font-medium text-zinc-200">{ipInfo.region_name || "Noma'lum"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500">Shahar</div>
                        <div className="text-sm font-medium text-zinc-200">{ipInfo.city || "Noma'lum"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500">Koordinatalar</div>
                        <div className="font-mono text-sm text-zinc-200">
                          {ipInfo.latitude.toFixed(4)}, {ipInfo.longitude.toFixed(4)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Network Information */}
                  <div className="space-y-3">
                    <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
                      <Wifi className="h-4 w-4 text-green-400" />
                      Tarmoq Ma'lumotlari
                    </h4>
                    <div className="grid grid-cols-2 gap-4 rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-4">
                      <div>
                        <div className="text-xs text-zinc-500">Internet Provayider</div>
                        <div className="text-sm font-medium text-zinc-200">{ipInfo.connection.isp || "Noma'lum"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500">ASN</div>
                        <div className="text-sm font-medium text-zinc-200">
                          {ipInfo.connection.asn ? `AS${ipInfo.connection.asn}` : "Noma'lum"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500">Ulanish turi</div>
                        <div className="text-sm font-medium text-zinc-200 capitalize">
                          {ipInfo.connection.usage_type || "Noma'lum"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500">Qit'a</div>
                        <div className="text-sm font-medium text-zinc-200">{ipInfo.continent_name}</div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  <div className="space-y-3">
                    <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
                      <Clock className="h-4 w-4 text-purple-400" />
                      Qo'shimcha Ma'lumotlar
                    </h4>
                    <div className="grid grid-cols-2 gap-4 rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-4">
                      <div>
                        <div className="text-xs text-zinc-500">Vaqt zonasi</div>
                        <div className="text-sm font-medium text-zinc-200">{ipInfo.time_zone.id || "Noma'lum"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500">Valyuta</div>
                        <div className="text-sm font-medium text-zinc-200">
                          {ipInfo.currency.code ? `${ipInfo.currency.name} (${ipInfo.currency.code})` : "Noma'lum"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500">Qo'ng'iroq kodi</div>
                        <div className="text-sm font-medium text-zinc-200">
                          {ipInfo.location.calling_code ? `${ipInfo.location.calling_code}` : "Noma'lum"}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500">EU a'zosi</div>
                        <div className="text-sm font-medium text-zinc-200">{ipInfo.location.is_eu ? 'Ha' : "Yo'q"}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center text-zinc-500">
                  <div className="text-center">
                    <Search className="mx-auto mb-2 h-8 w-8 opacity-50" />
                    <p>IP manzil tahlil qilish uchun chap paneldan foydalaning</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* JSON Output */}
          {ipInfo && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-4 py-3">
                <h4 className="text-sm font-medium text-zinc-300">JSON Ma'lumotlar</h4>
                <CopyButton text={JSON.stringify(ipInfo, null, 2)} />
              </div>
              <div className="p-4">
                <CodeHighlight
                  code={JSON.stringify(ipInfo, null, 2)}
                  language="json"
                  className="max-h-80 overflow-auto"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Professional Info Section */}
      <div className="mt-12 space-y-8">
        <div className="text-center">
          <h2 className="mb-4 text-3xl font-bold text-zinc-100">IP Ma'lumotlari Haqida</h2>
          <p className="mx-auto max-w-2xl text-lg text-zinc-400">
            Professional IP geolocation va tarmoq tahlil vositasi. IP manzillar asosida joylashuv, ISP va xavfsizlik
            ma'lumotlarini real-time olish imkoniyati.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Geolocation Features */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8">
            <h3 className="mb-6 text-xl font-semibold text-zinc-100">Geolokatsiya Aniqlash</h3>
            <p className="mb-6 text-zinc-400">IP manzil asosida aniq joylashuv va geografik ma'lumotlarni aniqlash:</p>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li className="flex items-center gap-3">
                <code className="rounded bg-blue-500/20 px-2 py-1 text-blue-300">Mamlakat</code>
                <span>Davlat va bayroq ma'lumotlari</span>
              </li>
              <li className="flex items-center gap-3">
                <code className="rounded bg-green-500/20 px-2 py-1 text-green-300">Mintaqa</code>
                <span>Viloyat va shahar ma'lumotlari</span>
              </li>
              <li className="flex items-center gap-3">
                <code className="rounded bg-purple-500/20 px-2 py-1 text-purple-300">Koordinatalar</code>
                <span>Kenglik va uzunlik daraja</span>
              </li>
              <li className="flex items-center gap-3">
                <code className="rounded bg-orange-500/20 px-2 py-1 text-orange-300">Vaqt Zonasi</code>
                <span>Mintaqaviy vaqt va UTC offset</span>
              </li>
            </ul>
          </div>

          {/* Network Analysis */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8">
            <h3 className="mb-6 text-xl font-semibold text-zinc-100">Tarmoq Tahlili</h3>
            <p className="mb-6 text-zinc-400">
              Internet provayider va tarmoq tafsilotlarini professional tahlil qilish:
            </p>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li className="flex items-center gap-3">
                <code className="rounded bg-cyan-500/20 px-2 py-1 text-cyan-300">ISP</code>
                <span>Internet Xizmat Provayderi</span>
              </li>
              <li className="flex items-center gap-3">
                <code className="rounded bg-yellow-500/20 px-2 py-1 text-yellow-300">ASN</code>
                <span>Avtonom Tizim Raqami</span>
              </li>
              <li className="flex items-center gap-3">
                <code className="rounded bg-red-500/20 px-2 py-1 text-red-300">IP Turi</code>
                <span>IPv4 yoki IPv6 protokol turi</span>
              </li>
              <li className="flex items-center gap-3">
                <code className="rounded bg-indigo-500/20 px-2 py-1 text-indigo-300">Ulanish</code>
                <span>Tarmoq turi va foydalanuvchi klassi</span>
              </li>
            </ul>
          </div>

          {/* Country Information */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8">
            <h3 className="mb-6 text-xl font-semibold text-zinc-100">Mamlakat Ma'lumotlari</h3>
            <p className="mb-6 text-zinc-400">Davlat va mintaqa haqida keng qamrovli ma'lumotlar:</p>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li className="flex items-center gap-3">
                <code className="rounded bg-pink-500/20 px-2 py-1 text-pink-300">Valyuta</code>
                <span>Milliy valyuta va kod</span>
              </li>
              <li className="flex items-center gap-3">
                <code className="rounded bg-teal-500/20 px-2 py-1 text-teal-300">Poytaxt</code>
                <span>Bosh shahar ma'lumotlari</span>
              </li>
              <li className="flex items-center gap-3">
                <code className="rounded bg-violet-500/20 px-2 py-1 text-violet-300">Telefon Kodi</code>
                <span>Xalqaro qo'ng'iroq kodi</span>
              </li>
              <li className="flex items-center gap-3">
                <code className="rounded bg-emerald-500/20 px-2 py-1 text-emerald-300">EU Holati</code>
                <span>Yevropa Ittifoqi a'zoligi</span>
              </li>
            </ul>
          </div>
        </div>

        {/* API Information */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8">
          <h3 className="mb-6 text-xl font-semibold text-zinc-100">API Integratsiya va Ma'lumot Manbalari</h3>
          <p className="mb-8 text-zinc-400">
            IP Ma'lumotlari vositasi professional geolocation API'lar bilan integratsiya qilingan va real-time
            ma'lumotlar bilan ishlaydi:
          </p>

          <div className="mt-2 grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-6">
              <h4 className="mb-3 font-semibold text-zinc-200">Real-time Ma'lumot Olish</h4>
              <p className="mb-3 text-sm text-zinc-400">
                Professional IP geolokatsiya xizmati bilan real-time ma'lumot olish imkoniyati.
              </p>
              <code className="text-xs text-green-300">ipapi.co, ipify.org API integratsiyasi</code>
            </div>

            <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-6">
              <h4 className="mb-3 font-semibold text-zinc-200">Ma'lumot Aniqligi</h4>
              <p className="mb-3 text-sm text-zinc-400">
                ISP va tarmoq ma'lumotlari 95%+ aniqlik bilan taqdim etiladi.
              </p>
              <code className="text-xs text-blue-300">Yuqori sifatli geolokatsiya bazasi</code>
            </div>

            <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-6">
              <h4 className="mb-3 font-semibold text-zinc-200">IPv4 va IPv6 Qo'llab-quvvatlash</h4>
              <p className="mb-3 text-sm text-zinc-400">
                Ikkala IP protokol versiyasi uchun to'liq qo'llab-quvvatlash mavjud.
              </p>
              <code className="text-xs text-purple-300">Universal IP protokol qo'llab-quvvatlash</code>
            </div>

            <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-6">
              <h4 className="mb-3 font-semibold text-zinc-200">JSON Eksport</h4>
              <p className="mb-3 text-sm text-zinc-400">Tahlil natijalarini JSON formatda yuklab olish imkoniyati.</p>
              <code className="text-xs text-orange-300">Strukturaviy ma'lumot eksport funksiyasi</code>
            </div>
          </div>
        </div>

        {/* Use Cases */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8">
          <h3 className="mb-6 text-xl font-semibold text-zinc-100">Foydalanish Holatlari</h3>
          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h4 className="mb-4 font-semibold text-zinc-200">Veb Dasturlash va Xavfsizlik</h4>
              <ul className="space-y-3 text-sm text-zinc-400">
                <li>• Geo-targeting va mintaqaviy kontent yetkazib berish</li>
                <li>• Firibgarlik aniqlash va xavfsizlik monitoring</li>
                <li>• Foydalanuvchi joylashuviga asoslangan shaxsiylashtirish</li>
                <li>• Tarmoq muammolarini hal qilish va diagnostika</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-zinc-200">Analitika va Biznes Ma'lumotlari</h4>
              <ul className="space-y-3 text-sm text-zinc-400">
                <li>• Veb-sayt traffigi geografik tahlili</li>
                <li>• Bozor tadqiqoti va foydalanuvchi demografiyasi</li>
                <li>• CDN optimallashtirish va server joylashuvi rejalashtirish</li>
                <li>• Qonunchilik va tartibga solish talablari</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Final Tips */}
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-8">
          <h4 className="mb-4 font-semibold text-blue-200">Professional Maslahatlar</h4>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm text-blue-100">
                <strong>Maxfiylik Eslatmasi:</strong> Hech qanday IP manzil ma'lumotlari serverda saqlanmaydi. Barcha
                ma'lumotlar real-time API orqali olinadi va xavfsizlik ta'minlanadi.
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-100">
                <strong>Aniqlik Eslatmasi:</strong> VPN va proxy serverlar orqali ulangan IP'lar uchun
                <code className="mx-1 rounded bg-blue-500/20 px-1 text-blue-300">haqiqiy joylashuv</code>
                ko'rsatilmasligi mumkin.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
