'use client'

import { useState, useEffect } from 'react'
import { User, Search, RefreshCw, Copy } from 'lucide-react'
import { ToolHeader } from '@/components/shared/ToolHeader'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { CopyButton } from '@/components/shared/CopyButton'

interface ParsedUserAgent {
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

const SAMPLE_USER_AGENTS = [
  {
    name: 'Chrome on Windows',
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  },
  {
    name: 'Safari on macOS',
    ua: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15',
  },
  {
    name: 'Firefox on Linux',
    ua: 'Mozilla/5.0 (X11; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/119.0',
  },
  {
    name: 'Edge on Windows',
    ua: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Edg/120.0.0.0',
  },
  {
    name: 'Chrome on Android',
    ua: 'Mozilla/5.0 (Linux; Android 13; SM-G991B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  },
  {
    name: 'Safari on iPhone',
    ua: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Mobile/15E148 Safari/604.1',
  },
]

export default function UserAgentAnalyzerPage() {
  const [userAgent, setUserAgent] = useState<string>('')
  const [parsedUA, setParsedUA] = useState<ParsedUserAgent | null>(null)
  const [currentUA, setCurrentUA] = useState<string>('')

  useEffect(() => {
    const ua = navigator.userAgent
    setCurrentUA(ua)
    setUserAgent(ua)
    parseUserAgent(ua)
  }, [])

  const parseUserAgent = (ua: string) => {
    if (!ua.trim()) {
      setParsedUA(null)
      return
    }

    // Simple parser - in production, you might want to use a library like UAParser.js
    const parsed: ParsedUserAgent = {
      browser: { name: 'Unknown', version: 'Unknown', major: 'Unknown' },
      engine: { name: 'Unknown', version: 'Unknown' },
      os: { name: 'Unknown', version: 'Unknown' },
      device: { vendor: 'Unknown', model: 'Unknown', type: 'Unknown' },
      cpu: { architecture: 'Unknown' },
    }

    // Browser detection
    if (ua.includes('Edg/')) {
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
      // Try to extract Android device model
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
      parsed.device.type = 'desktop'
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

    setParsedUA(parsed)
  }

  const loadSampleUA = (sampleUA: string) => {
    setUserAgent(sampleUA)
    parseUserAgent(sampleUA)
  }

  const loadCurrentUA = () => {
    setUserAgent(currentUA)
    parseUserAgent(currentUA)
  }

  const analyzeUA = () => {
    parseUserAgent(userAgent)
  }

  const clearUA = () => {
    setUserAgent('')
    setParsedUA(null)
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4">
      <ToolHeader
        title="User Agent Tahlil"
        description="Brauzer User Agent ma'lumotlarini tahlil qiling va batafsil ma'lumot oling"
      />

      {/* Sample Data Section */}
      <Card className="mb-6 border-zinc-800 bg-zinc-900/80">
        <div className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-medium text-zinc-200">Tez boshlash</h3>
              <p className="text-sm text-zinc-400">Joriy brauzeringiz yoki namuna User Agent bilan boshlang</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={loadCurrentUA}
                variant="outline"
                className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
              >
                <User className="mr-2 h-4 w-4" />
                Joriy brauzer
              </Button>
              <Button onClick={clearUA} variant="outline" className="border-zinc-700">
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
          {/* User Agent Input */}
          <Card className="border-zinc-800 bg-zinc-900/80">
            <div className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-zinc-100">User Agent String</h3>

              <div className="space-y-4">
                <Textarea
                  placeholder="User Agent stringini kiriting yoki pastdagi namunalardan birini tanlang..."
                  value={userAgent}
                  onChange={(e) => setUserAgent(e.target.value)}
                  rows={4}
                  className="border-zinc-700 bg-zinc-800 font-mono text-sm"
                />

                <Button
                  onClick={analyzeUA}
                  disabled={!userAgent.trim()}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  <Search className="mr-2 h-4 w-4" />
                  Tahlil qilish
                </Button>
              </div>
            </div>
          </Card>

          {/* Sample User Agents */}
          <Card className="border-zinc-800 bg-zinc-900/80">
            <div className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-zinc-100">Namuna User Agents</h3>

              <div className="space-y-2">
                {SAMPLE_USER_AGENTS.map((sample, index) => (
                  <button
                    key={index}
                    onClick={() => loadSampleUA(sample.ua)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 p-3 text-left transition-colors hover:border-zinc-600 hover:bg-zinc-800"
                  >
                    <div className="mb-1 font-medium text-zinc-100">{sample.name}</div>
                    <div className="truncate font-mono text-xs text-zinc-400">{sample.ua}</div>
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Analysis Results */}
        <div className="space-y-6">
          {parsedUA && (
            <>
              {/* Browser Info */}
              <Card className="border-zinc-800 bg-zinc-900/80">
                <div className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-zinc-100">Brauzer Ma'lumotlari</h3>
                    <CopyButton text={JSON.stringify(parsedUA.browser, null, 2)} />
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-zinc-400">Nomi</div>
                        <div className="text-zinc-100">{parsedUA.browser.name}</div>
                      </div>
                      <div>
                        <div className="text-sm text-zinc-400">Versiya</div>
                        <div className="text-zinc-100">{parsedUA.browser.version}</div>
                      </div>
                      <div>
                        <div className="text-sm text-zinc-400">Asosiy versiya</div>
                        <div className="text-zinc-100">{parsedUA.browser.major}</div>
                      </div>
                      <div>
                        <div className="text-sm text-zinc-400">Engine</div>
                        <div className="text-zinc-100">{parsedUA.engine.name}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Operating System */}
              <Card className="border-zinc-800 bg-zinc-900/80">
                <div className="p-6">
                  <h3 className="mb-4 text-lg font-semibold text-zinc-100">Operatsion Tizim</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-zinc-400">Tizim nomi</div>
                      <div className="text-zinc-100">{parsedUA.os.name}</div>
                    </div>
                    <div>
                      <div className="text-sm text-zinc-400">Versiya</div>
                      <div className="text-zinc-100">{parsedUA.os.version}</div>
                    </div>
                    <div>
                      <div className="text-sm text-zinc-400">Arxitektura</div>
                      <div className="text-zinc-100">{parsedUA.cpu.architecture}</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Device Info */}
              <Card className="border-zinc-800 bg-zinc-900/80">
                <div className="p-6">
                  <h3 className="mb-4 text-lg font-semibold text-zinc-100">Qurilma Ma'lumotlari</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-zinc-400">Turi</div>
                      <div className="text-zinc-100 capitalize">{parsedUA.device.type}</div>
                    </div>
                    <div>
                      <div className="text-sm text-zinc-400">Brend</div>
                      <div className="text-zinc-100">{parsedUA.device.vendor}</div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-sm text-zinc-400">Model</div>
                      <div className="text-zinc-100">{parsedUA.device.model}</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Raw Data */}
              <Card className="border-zinc-800 bg-zinc-900/80">
                <div className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-zinc-100">JSON Ma'lumotlar</h3>
                    <CopyButton text={JSON.stringify(parsedUA, null, 2)} />
                  </div>

                  <div className="overflow-auto rounded-lg border border-zinc-700 bg-zinc-900 p-4">
                    <pre className="text-sm text-zinc-300">{JSON.stringify(parsedUA, null, 2)}</pre>
                  </div>
                </div>
              </Card>
            </>
          )}

          {/* Original User Agent */}
          {userAgent && (
            <Card className="border-zinc-800 bg-zinc-900/80">
              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-zinc-100">Asl User Agent</h3>
                  <CopyButton text={userAgent} />
                </div>

                <div className="rounded-lg border border-zinc-700 bg-zinc-900 p-4">
                  <div className="font-mono text-sm break-all text-zinc-300">{userAgent}</div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Help Section */}
      <Card className="mt-6 border-zinc-800 bg-zinc-900/80">
        <div className="p-6">
          <h4 className="mb-3 font-medium text-zinc-200">User Agent nima va nima uchun muhim?</h4>
          <div className="space-y-2 text-sm text-zinc-400">
            <p>
              • <strong>Identifikatsiya:</strong> Web serverlar brauzer va qurilmani tanib olish uchun
            </p>
            <p>
              • <strong>Moslashuvchanlik:</strong> Turli qurilmalar uchun mos kontent taqdim etish
            </p>
            <p>
              • <strong>Analytics:</strong> Website trafikini tahlil qilish va statistika yig'ish
            </p>
            <p>
              • <strong>Debugging:</strong> Browser-specific muammolarni hal qilish
            </p>
            <p>
              • <strong>Feature Detection:</strong> Brauzer imkoniyatlarini aniqlash
            </p>
            <p>
              • <strong>Security:</strong> Bot va zararli traffikni filtrlash
            </p>
          </div>

          <div className="mt-4 space-y-2">
            <div className="rounded-lg bg-blue-500/10 p-3">
              <div className="text-sm text-blue-400">
                <strong>Eslatma:</strong> User Agent ma'lumotlari osonlik bilan o'zgartirilishi mumkin, shuning uchun
                100% ishonchli emas.
              </div>
            </div>
            <div className="rounded-lg bg-yellow-500/10 p-3">
              <div className="text-sm text-yellow-400">
                <strong>Maslahat:</strong> Feature detection'dan foydalanish User Agent detection'dan ko'ra yaxshiroq
                hisoblanadi.
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
