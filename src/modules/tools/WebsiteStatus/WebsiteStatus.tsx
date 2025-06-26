'use client'

import {
  Globe2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Search,
  RefreshCw,
  Monitor,
  Wifi,
  Shield,
} from 'lucide-react'
import { ToolHeader, DualTextPanel, StatsDisplay, CopyButton } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useWebsiteStatus } from '@/hooks/tools'
import { ShimmerButton } from '@/components/ui/shimmer-button'
import { CodeHighlight } from '@/components/ui/code-highlight'

export default function WebsiteStatus() {
  const {
    input,
    result,
    isChecking,
    error,
    samples,
    handleInputChange,
    checkCurrentInput,
    loadSample,
    clearAll,
    downloadResults,
    getStats,
    getStatusText,
    getResponseTimeCategory,
  } = useWebsiteStatus()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case 'offline':
      case 'error':
        return <XCircle className="h-4 w-4 text-red-400" />
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'text-green-400'
      case 'offline':
      case 'error':
        return 'text-red-400'
      default:
        return 'text-yellow-400'
    }
  }

  const getResponseTimeColor = (time: number) => {
    if (time < 200) return 'text-green-400'
    if (time < 500) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4">
      <ToolHeader
        title="Website Status Checker"
        description="Professional sayt holati tekshirish va performance tahlil vositasi"
      />

      {/* Stats Display */}
      <StatsDisplay stats={getStats()} />

      {/* Main Content */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Panel - Input */}
        <div className="space-y-6">
          {/* Input Panel */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
            <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/50 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <span className="ml-2 text-sm font-medium text-zinc-400">Tool Kirish</span>
            </div>

            <div className="p-6">
              <div className="space-y-4">
                <div className="space-y-3">
                  <label className="text-sm font-medium text-zinc-300">Website URL manzili:</label>
                  <textarea
                    value={input}
                    onChange={(e) => handleInputChange(e.target.value)}
                    placeholder="https://example.com"
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800 p-3 text-zinc-100 placeholder:text-zinc-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
                    rows={3}
                  />
                  {error && <p className="text-sm text-red-400">{error}</p>}
                </div>

                <ShimmerButton
                  onClick={checkCurrentInput}
                  disabled={!input.trim() || isChecking}
                  className="w-full"
                  size="lg"
                >
                  <Monitor className="mr-2 h-4 w-4" />
                  {isChecking ? 'Tekshirilmoqda...' : 'Holatni Tekshirish'}
                </ShimmerButton>
              </div>
            </div>
          </div>

          {/* Sample Websites */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
            <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/50 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <span className="ml-2 text-sm font-medium text-zinc-400">Mashhur Saytlar</span>
            </div>

            <div className="p-6">
              <div className="grid gap-3">
                {samples.map((sample, index) => (
                  <button
                    key={index}
                    onClick={() => loadSample(sample)}
                    className="group rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-4 text-left transition-all duration-200 hover:border-zinc-600 hover:bg-zinc-800/60"
                    disabled={isChecking}
                  >
                    <div className="mb-1 flex items-center justify-between">
                      <span className="font-medium text-zinc-200">{sample.name}</span>
                      <Globe2 className="h-3 w-3 text-blue-400" />
                    </div>
                    <p className="text-xs text-zinc-500">{sample.description}</p>
                    <div className="mt-2 font-mono text-sm text-zinc-400">{sample.url}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Results */}
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
            <div className="flex items-center gap-2 border-b border-zinc-800 bg-zinc-900/50 px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-3 w-3 rounded-full bg-red-500"></div>
                <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                <div className="h-3 w-3 rounded-full bg-green-500"></div>
              </div>
              <span className="ml-2 text-sm font-medium text-zinc-400">Tool Natija/Chiqish</span>
              <div className="ml-auto flex items-center gap-2">
                {result && (
                  <>
                    <div
                      className={`h-2 w-2 rounded-full ${result.status === 'online' ? 'bg-green-400' : 'bg-red-400'}`}
                    ></div>
                    <span className={`text-xs ${getStatusColor(result.status)}`}>
                      {getStatusText(result.status, result.statusCode, result.error)}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="p-6">
              {result ? (
                <div className="space-y-6">
                  {/* Status Overview */}
                  <div className="space-y-4">
                    <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
                      {getStatusIcon(result.status)}
                      Sayt Holati
                    </h4>
                    <div className="grid grid-cols-2 gap-4 rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-4">
                      <div>
                        <div className="text-xs text-zinc-500">Holat</div>
                        <div className={getStatusColor(result.status)}>
                          {getStatusText(result.status, result.statusCode, result.error)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500">Javob vaqti</div>
                        <div className={getResponseTimeColor(result.responseTime)}>{result.responseTime}ms</div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500">Status kod</div>
                        <div className="text-zinc-100">{result.statusCode || "Noma'lum"}</div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500">Tekshirilgan</div>
                        <div className="text-zinc-100">{new Date(result.timestamp).toLocaleTimeString('uz-UZ')}</div>
                      </div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  {result.status === 'online' && result.performance.total > 0 && (
                    <div className="space-y-4">
                      <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
                        <Wifi className="h-4 w-4 text-green-400" />
                        Performance Tahlili
                      </h4>
                      <div className="space-y-3 rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-4">
                        {[
                          { label: 'DNS Qidiruv', value: result.performance.dns, color: 'bg-blue-500' },
                          { label: 'Ulanish', value: result.performance.connection, color: 'bg-green-500' },
                          { label: 'TLS Handshake', value: result.performance.tls, color: 'bg-purple-500' },
                          { label: 'TTFB', value: result.performance.ttfb, color: 'bg-orange-500' },
                        ]
                          .filter((metric) => metric.value > 0)
                          .map((metric) => (
                            <div key={metric.label}>
                              <div className="mb-2 flex justify-between text-sm">
                                <span className="text-zinc-400">{metric.label}</span>
                                <span className="text-zinc-100">{metric.value}ms</span>
                              </div>
                              <div className="h-2 w-full rounded-full bg-zinc-700">
                                <div
                                  className={`h-2 rounded-full ${metric.color}`}
                                  style={{
                                    width: `${Math.min((metric.value / result.performance.total) * 100, 100)}%`,
                                  }}
                                />
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* SSL Information */}
                  {result.url.startsWith('https://') && (
                    <div className="space-y-4">
                      <h4 className="flex items-center gap-2 font-semibold text-zinc-200">
                        <Shield className="h-4 w-4 text-blue-400" />
                        SSL Sertifikat
                      </h4>
                      <div className="grid grid-cols-2 gap-4 rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-4">
                        <div>
                          <div className="text-xs text-zinc-500">SSL Holati</div>
                          <div className={result.ssl.valid ? 'text-green-400' : 'text-red-400'}>
                            {result.ssl.valid ? 'Haqiqiy' : "Noto'g'ri"}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-zinc-500">Protokol</div>
                          <div className="text-zinc-100">HTTPS</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center text-zinc-500">
                  <div className="text-center">
                    <Monitor className="mx-auto mb-2 h-8 w-8 opacity-50" />
                    <p>Website holatini tekshirish uchun chap paneldan foydalaning</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* JSON Export */}
          {result && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
              <div className="flex items-center justify-between border-b border-zinc-800 bg-zinc-900/50 px-4 py-3">
                <h4 className="text-sm font-medium text-zinc-300">JSON Ma'lumotlar</h4>
                <div className="flex gap-2">
                  <ShimmerButton onClick={downloadResults} size="sm" variant="outline">
                    Yuklab olish
                  </ShimmerButton>
                  <CopyButton text={JSON.stringify(result, null, 2)} />
                </div>
              </div>
              <div className="p-4">
                <CodeHighlight
                  code={JSON.stringify(result, null, 2)}
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
          <h2 className="mb-4 text-3xl font-bold text-zinc-100">Website Status Checker Haqida</h2>
          <p className="mx-auto max-w-2xl text-lg text-zinc-400">
            Professional website monitoring va performance tahlil vositasi. Real-time sayt holati, server javob vaqti va
            SSL sertifikat tekshiruvi.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {/* Real-time Monitoring */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8">
            <h3 className="mb-6 text-xl font-semibold text-zinc-100">Real-time Monitoring</h3>
            <p className="mb-6 text-zinc-400">Website holatini real-time tekshirish va tahlil qilish:</p>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li className="flex items-center gap-3">
                <code className="rounded bg-green-500/20 px-2 py-1 text-green-300">HTTP Status</code>
                <span>Server javob kodini aniqlash</span>
              </li>
              <li className="flex items-center gap-3">
                <code className="rounded bg-blue-500/20 px-2 py-1 text-blue-300">Response Time</code>
                <span>Sayt yuklash tezligini o'lchash</span>
              </li>
              <li className="flex items-center gap-3">
                <code className="rounded bg-purple-500/20 px-2 py-1 text-purple-300">Availability</code>
                <span>Sayt mavjudligini tekshirish</span>
              </li>
              <li className="flex items-center gap-3">
                <code className="rounded bg-orange-500/20 px-2 py-1 text-orange-300">Performance</code>
                <span>Ulanish tezligi tahlili</span>
              </li>
            </ul>
          </div>

          {/* Technical Analysis */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8">
            <h3 className="mb-6 text-xl font-semibold text-zinc-100">Texnik Tahlil</h3>
            <p className="mb-6 text-zinc-400">Server va tarmoq performance'ini batafsil tahlil qilish:</p>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li className="flex items-center gap-3">
                <code className="rounded bg-cyan-500/20 px-2 py-1 text-cyan-300">DNS Lookup</code>
                <span>Domain nom yechish vaqti</span>
              </li>
              <li className="flex items-center gap-3">
                <code className="rounded bg-yellow-500/20 px-2 py-1 text-yellow-300">Connection</code>
                <span>Server bilan ulanish vaqti</span>
              </li>
              <li className="flex items-center gap-3">
                <code className="rounded bg-red-500/20 px-2 py-1 text-red-300">TLS Handshake</code>
                <span>SSL/TLS shifrlash vaqti</span>
              </li>
              <li className="flex items-center gap-3">
                <code className="rounded bg-indigo-500/20 px-2 py-1 text-indigo-300">TTFB</code>
                <span>Birinchi byte olish vaqti</span>
              </li>
            </ul>
          </div>

          {/* Security Features */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8">
            <h3 className="mb-6 text-xl font-semibold text-zinc-100">Xavfsizlik Tekshiruvi</h3>
            <p className="mb-6 text-zinc-400">Website xavfsizlik holatini comprehensive tahlil qilish:</p>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li className="flex items-center gap-3">
                <code className="rounded bg-pink-500/20 px-2 py-1 text-pink-300">SSL Sertifikat</code>
                <span>HTTPS shifrlash holati</span>
              </li>
              <li className="flex items-center gap-3">
                <code className="rounded bg-teal-500/20 px-2 py-1 text-teal-300">Protocol</code>
                <span>HTTP/HTTPS protokol aniqlash</span>
              </li>
              <li className="flex items-center gap-3">
                <code className="rounded bg-violet-500/20 px-2 py-1 text-violet-300">Headers</code>
                <span>HTTP header ma'lumotlari</span>
              </li>
              <li className="flex items-center gap-3">
                <code className="rounded bg-emerald-500/20 px-2 py-1 text-emerald-300">Expires</code>
                <span>Sertifikat amal qilish muddati</span>
              </li>
            </ul>
          </div>
        </div>

        {/* API Information */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-8">
          <h3 className="mb-6 text-xl font-semibold text-zinc-100">API Integratsiya va Ma'lumot Manbalari</h3>
          <p className="mb-8 text-zinc-400">
            Website Status Checker professional API'lar bilan integratsiya qilingan va real-time ma'lumotlar bilan
            ishlaydi:
          </p>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-6">
              <h4 className="mb-3 font-semibold text-zinc-200">Real-time Ma'lumot Olish</h4>
              <p className="mb-3 text-sm text-zinc-400">
                Professional website monitoring service bilan real-time ma'lumot olish imkoniyati.
              </p>
              <code className="text-xs text-green-300">HTTP request monitoring integratsiyasi</code>
            </div>

            <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-6">
              <h4 className="mb-3 font-semibold text-zinc-200">Performance Metrikalari</h4>
              <p className="mb-3 text-sm text-zinc-400">
                DNS, Connection, TLS va TTFB metrikalarini professional tahlil qilish.
              </p>
              <code className="text-xs text-blue-300">Comprehensive performance analysis</code>
            </div>

            <div className="rounded-lg border border-zinc-700/50 bg-zinc-800/30 p-6">
              <h4 className="mb-3 font-semibold text-zinc-200">SSL Sertifikat Tekshiruvi</h4>
              <p className="mb-3 text-sm text-zinc-400">
                HTTPS protokol va SSL sertifikat validatsiyasi bilan xavfsizlik tahlili.
              </p>
              <code className="text-xs text-purple-300">SSL certificate validation</code>
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
              <h4 className="mb-4 font-semibold text-zinc-200">Veb Dasturlash va DevOps</h4>
              <ul className="space-y-3 text-sm text-zinc-400">
                <li>• Server health monitoring va uptime tracking</li>
                <li>• Performance bottleneck'larni aniqlash</li>
                <li>• SSL sertifikat holati va muddatini kuzatish</li>
                <li>• Website deployment testing va validation</li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-zinc-200">Biznes va Analitika</h4>
              <ul className="space-y-3 text-sm text-zinc-400">
                <li>• Konkurent website'lar performance tahlili</li>
                <li>• CDN va hosting xizmatlari baholash</li>
                <li>• User experience optimization</li>
                <li>• Service Level Agreement (SLA) monitoring</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Professional Tips */}
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-8">
          <h4 className="mb-4 font-semibold text-blue-200">Professional Maslahatlar</h4>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm text-blue-100">
                <strong>CORS Cheklovi:</strong> Ba'zi saytlar browser'dan to'g'ridan-to'g'ri tekshirilmasligi mumkin.
                Bunday holatlarda proxy service yoki server-side checking tavsiya etiladi.
              </p>
            </div>
            <div>
              <p className="text-sm text-blue-100">
                <strong>Aniqlik Uchun:</strong> Eng aniq natijalar olish uchun
                <code className="mx-1 rounded bg-blue-500/20 px-1 text-blue-300">to'liq URL</code>
                (protokol bilan) kiritishni unutmang.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
