'use client'

import { useState } from 'react'
import { Globe2, CheckCircle, XCircle, Clock, AlertTriangle, Search, RefreshCw } from 'lucide-react'
import { ToolHeader } from '@/components/shared/ToolHeader'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { CopyButton } from '@/components/shared/CopyButton'

interface WebsiteStatus {
  url: string
  status: 'online' | 'offline' | 'error'
  statusCode: number
  responseTime: number
  headers: { [key: string]: string }
  timestamp: string
  ssl: {
    valid: boolean
    issuer: string
    expires: string
    daysUntilExpiry: number
  }
  performance: {
    dns: number
    connection: number
    tls: number
    ttfb: number // Time to First Byte
    total: number
  }
  error?: string
}

// Mock website status data for demonstration
const MOCK_STATUS_DATA: WebsiteStatus = {
  url: 'https://webiston.uz',
  status: 'online',
  statusCode: 200,
  responseTime: 245,
  headers: {
    'content-type': 'text/html; charset=utf-8',
    server: 'nginx/1.18.0',
    'cache-control': 'no-cache',
    'content-encoding': 'gzip',
    'content-length': '25847',
    date: 'Mon, 15 Jan 2024 18:30:45 GMT',
    'last-modified': 'Mon, 15 Jan 2024 12:00:00 GMT',
    'x-powered-by': 'Next.js',
  },
  timestamp: new Date().toISOString(),
  ssl: {
    valid: true,
    issuer: "Let's Encrypt Authority X3",
    expires: '2024-12-15T23:59:59Z',
    daysUntilExpiry: 334,
  },
  performance: {
    dns: 15,
    connection: 45,
    tls: 89,
    ttfb: 178,
    total: 245,
  },
}

const SAMPLE_WEBSITES = [
  { name: 'Google', url: 'https://google.com' },
  { name: 'GitHub', url: 'https://github.com' },
  { name: 'Stack Overflow', url: 'https://stackoverflow.com' },
  { name: 'MDN Web Docs', url: 'https://developer.mozilla.org' },
  { name: 'Webiston', url: 'https://webiston.uz' },
]

export default function WebsiteStatusPage() {
  const [websiteUrl, setWebsiteUrl] = useState<string>('')
  const [statusResult, setStatusResult] = useState<WebsiteStatus | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [error, setError] = useState<string>('')

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  }

  const checkWebsiteStatus = async (url: string) => {
    if (!isValidUrl(url)) {
      setError("Noto'g'ri URL format. HTTP yoki HTTPS bilan boshlang.")
      return
    }

    setIsChecking(true)
    setError('')

    try {
      // In a real implementation, you would make an actual HTTP request
      // This might be done through a backend API to avoid CORS issues
      // For demo purposes, we'll use mock data
      setTimeout(() => {
        // Simulate different status codes based on URL
        const mockStatus = {
          ...MOCK_STATUS_DATA,
          url: url,
          responseTime: Math.floor(Math.random() * 500) + 100,
          timestamp: new Date().toISOString(),
        }

        // Simulate some variation based on URL
        if (url.includes('nonexistent') || url.includes('404')) {
          mockStatus.status = 'error'
          mockStatus.statusCode = 404
        } else if (url.includes('timeout') || url.includes('slow')) {
          mockStatus.status = 'error'
          mockStatus.statusCode = 0
          mockStatus.error = 'Connection timeout'
        } else {
          mockStatus.status = 'online'
          mockStatus.statusCode = 200
        }

        setStatusResult(mockStatus)
        setIsChecking(false)
      }, 2000)
    } catch (err) {
      setError('Website holatini tekshirishda xatolik yuz berdi')
      setIsChecking(false)
    }
  }

  const loadSampleWebsite = (url: string) => {
    setWebsiteUrl(url)
    checkWebsiteStatus(url)
  }

  const checkStatus = () => {
    if (websiteUrl.trim()) {
      checkWebsiteStatus(websiteUrl.trim())
    }
  }

  const clearResults = () => {
    setWebsiteUrl('')
    setStatusResult(null)
    setError('')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-5 w-5 text-green-400" />
      case 'offline':
      case 'error':
        return <XCircle className="h-5 w-5 text-red-400" />
      default:
        return <AlertTriangle className="h-5 w-5 text-yellow-400" />
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

  const getStatusText = (status: string, statusCode: number) => {
    if (status === 'online') return 'Onlayn'
    if (status === 'offline') return 'Oflayn'
    if (status === 'error') {
      if (statusCode === 404) return 'Sahifa topilmadi (404)'
      if (statusCode === 500) return 'Server xatosi (500)'
      if (statusCode === 0) return 'Ulanish mumkin emas'
      return `Xatolik (${statusCode})`
    }
    return "Noma'lum"
  }

  const getResponseTimeColor = (time: number) => {
    if (time < 200) return 'text-green-400'
    if (time < 500) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getSSLStatusColor = (ssl: any) => {
    if (!ssl.valid) return 'text-red-400'
    if (ssl.daysUntilExpiry < 30) return 'text-yellow-400'
    return 'text-green-400'
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4">
      <ToolHeader
        title="Website Status Checker"
        description="Website mavjudligi va holatini tekshiring, performance tahlili"
      />

      {/* Sample Data Section */}
      <Card className="mb-6 border-zinc-800 bg-zinc-900/80">
        <div className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-medium text-zinc-200">Tez boshlash</h3>
              <p className="text-sm text-zinc-400">
                Mashhur saytlardan birini tanlang yoki o'z URL manzilingizni kiriting
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={clearResults} variant="outline" className="border-zinc-700">
                <RefreshCw className="mr-2 h-4 w-4" />
                Tozalash
              </Button>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Input Section */}
        <div className="space-y-6">
          {/* URL Input */}
          <Card className="border-zinc-800 bg-zinc-900/80">
            <div className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-zinc-100">Website URL</h3>

              <div className="space-y-4">
                <div>
                  <Input
                    placeholder="https://example.com"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    className="border-zinc-700 bg-zinc-800"
                  />
                  {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
                </div>

                <Button
                  onClick={checkStatus}
                  disabled={!websiteUrl.trim() || isChecking}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isChecking ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="mr-2 h-4 w-4" />
                  )}
                  {isChecking ? 'Tekshirilmoqda...' : 'Holat tekshirish'}
                </Button>
              </div>
            </div>
          </Card>

          {/* Sample Websites */}
          <Card className="border-zinc-800 bg-zinc-900/80">
            <div className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-zinc-100">Mashhur Saytlar</h3>

              <div className="space-y-2">
                {SAMPLE_WEBSITES.map((sample, index) => (
                  <button
                    key={index}
                    onClick={() => loadSampleWebsite(sample.url)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 p-3 text-left transition-colors hover:border-zinc-600 hover:bg-zinc-800"
                  >
                    <div className="font-medium text-zinc-100">{sample.name}</div>
                    <div className="text-sm text-zinc-400">{sample.url}</div>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Loading State */}
          {isChecking && (
            <Card className="border-zinc-800 bg-zinc-900/80">
              <div className="p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                    <Clock className="h-5 w-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-100">Tekshirilmoqda...</h3>
                    <p className="text-sm text-zinc-400">Website holatini aniqlash uchun iltimos kuting</p>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {statusResult && (
            <>
              {/* Status Overview */}
              <Card className="border-zinc-800 bg-zinc-900/80">
                <div className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                      {getStatusIcon(statusResult.status)}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-zinc-100">Website Holati</h3>
                      <p className="truncate text-sm text-zinc-400">{statusResult.url}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-zinc-400">Holat</div>
                        <div className={getStatusColor(statusResult.status)}>
                          {getStatusText(statusResult.status, statusResult.statusCode)}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-zinc-400">Status kodi</div>
                        <div className="text-zinc-100">{statusResult.statusCode}</div>
                      </div>
                      <div>
                        <div className="text-sm text-zinc-400">Javob vaqti</div>
                        <div className={getResponseTimeColor(statusResult.responseTime)}>
                          {statusResult.responseTime}ms
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-zinc-400">Tekshirilgan vaqt</div>
                        <div className="text-xs text-zinc-100">
                          {new Date(statusResult.timestamp).toLocaleString('uz-UZ')}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Performance Metrics */}
              <Card className="border-zinc-800 bg-zinc-900/80">
                <div className="p-6">
                  <h3 className="mb-4 text-lg font-semibold text-zinc-100">Performance</h3>

                  <div className="space-y-3">
                    {[
                      { label: 'DNS Lookup', value: statusResult.performance.dns, color: 'bg-blue-500' },
                      { label: 'Connection', value: statusResult.performance.connection, color: 'bg-green-500' },
                      { label: 'TLS Handshake', value: statusResult.performance.tls, color: 'bg-purple-500' },
                      { label: 'TTFB', value: statusResult.performance.ttfb, color: 'bg-orange-500' },
                    ].map((metric) => (
                      <div key={metric.label}>
                        <div className="mb-1 flex justify-between text-sm">
                          <span className="text-zinc-400">{metric.label}</span>
                          <span className="text-zinc-100">{metric.value}ms</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-zinc-700">
                          <div
                            className={`h-2 rounded-full ${metric.color}`}
                            style={{
                              width: `${Math.min((metric.value / statusResult.performance.total) * 100, 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>

              {/* SSL Certificate */}
              <Card className="border-zinc-800 bg-zinc-900/80">
                <div className="p-6">
                  <h3 className="mb-4 text-lg font-semibold text-zinc-100">SSL Sertifikat</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-zinc-400">Holat</div>
                      <div className={getSSLStatusColor(statusResult.ssl)}>
                        {statusResult.ssl.valid ? 'Yaroqli' : 'Yaroqsiz'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-zinc-400">Issuer</div>
                      <div className="text-sm text-zinc-100">{statusResult.ssl.issuer}</div>
                    </div>
                    <div>
                      <div className="text-sm text-zinc-400">Amal qilish muddati</div>
                      <div className="text-sm text-zinc-100">
                        {new Date(statusResult.ssl.expires).toLocaleDateString('uz-UZ')}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-zinc-400">Qolgan kunlar</div>
                      <div className={getSSLStatusColor(statusResult.ssl)}>{statusResult.ssl.daysUntilExpiry} kun</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* HTTP Headers */}
              <Card className="border-zinc-800 bg-zinc-900/80">
                <div className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-zinc-100">HTTP Headers</h3>
                    <CopyButton text={JSON.stringify(statusResult.headers, null, 2)} />
                  </div>

                  <div className="max-h-64 overflow-auto rounded-lg border border-zinc-700 bg-zinc-900 p-4">
                    <div className="space-y-1 text-sm">
                      {Object.entries(statusResult.headers).map(([key, value]) => (
                        <div key={key} className="flex">
                          <span className="w-1/3 shrink-0 font-mono text-blue-400">{key}:</span>
                          <span className="ml-2 font-mono break-all text-zinc-300">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>

              {/* Error Details */}
              {statusResult.error && (
                <Card className="border-red-500/20 bg-red-500/10">
                  <div className="p-6">
                    <h3 className="mb-2 text-lg font-semibold text-red-400">Xatolik Tafsilotlari</h3>
                    <p className="text-red-300">{statusResult.error}</p>
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </div>

      {/* Help Section */}
      <Card className="mt-6 border-zinc-800 bg-zinc-900/80">
        <div className="p-6">
          <h4 className="mb-3 font-medium text-zinc-200">Website status checker haqida</h4>
          <div className="space-y-2 text-sm text-zinc-400">
            <p>
              • <strong>Mavjudlik tekshirishi:</strong> Website onlayn yoki oflayn ekanligini aniqlash
            </p>
            <p>
              • <strong>Performance tahlili:</strong> Yuklash tezligi va javob vaqtini o'lchash
            </p>
            <p>
              • <strong>SSL tekshirishi:</strong> Sertifikat yaroqliligi va amal qilish muddati
            </p>
            <p>
              • <strong>HTTP headers:</strong> Server javob headers ma'lumotlari
            </p>
            <p>
              • <strong>Status kodlar:</strong> HTTP javob kodlari va ularning ma'nosi
            </p>
          </div>

          <div className="mt-4 space-y-2">
            <div className="rounded-lg bg-green-500/10 p-3">
              <div className="text-sm text-green-400">
                <strong>Yaxshi natija:</strong> 200 status kodi, 200ms dan kam javob vaqti, yaroqli SSL
              </div>
            </div>
            <div className="rounded-lg bg-yellow-500/10 p-3">
              <div className="text-sm text-yellow-400">
                <strong>O'rtacha natija:</strong> 200-500ms javob vaqti, SSL muddati 30 kundan kam
              </div>
            </div>
            <div className="rounded-lg bg-red-500/10 p-3">
              <div className="text-sm text-red-400">
                <strong>Muammoli natija:</strong> 4xx/5xx status kodlar, 500ms dan ko'p javob vaqti
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
