'use client'

import { useState, useEffect } from 'react'
import { MapPin, Globe, Shield, Wifi, RefreshCw, Search } from 'lucide-react'
import { ToolHeader } from '@/components/shared/ToolHeader'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { CopyButton } from '@/components/shared/CopyButton'

interface IPInfo {
  ip: string
  type: string
  continent_code: string
  continent_name: string
  country_code: string
  country_name: string
  region_code: string
  region_name: string
  city: string
  zip: string
  latitude: number
  longitude: number
  location: {
    geoname_id: number
    capital: string
    country_flag: string
    country_flag_emoji: string
    calling_code: string
    is_eu: boolean
  }
  time_zone: {
    id: string
    current_time: string
    gmt_offset: number
    code: string
    is_daylight_saving: boolean
  }
  currency: {
    code: string
    name: string
    plural: string
    symbol: string
    symbol_native: string
  }
  connection: {
    asn: number
    isp: string
    domain: string
    usage_type: string
    user_type: string
  }
  security: {
    is_proxy: boolean
    proxy_type: string
    is_crawler: boolean
    crawler_name: string
    crawler_type: string
    is_tor: boolean
    threat_level: string
    threat_types: string[]
  }
}

// Mock IP info data for demonstration
const MOCK_IP_INFO: IPInfo = {
  ip: '8.8.8.8',
  type: 'ipv4',
  continent_code: 'NA',
  continent_name: 'North America',
  country_code: 'US',
  country_name: 'United States',
  region_code: 'CA',
  region_name: 'California',
  city: 'Mountain View',
  zip: '94043',
  latitude: 37.4056,
  longitude: -122.0775,
  location: {
    geoname_id: 5375480,
    capital: 'Washington D.C.',
    country_flag: 'https://assets.ipstack.com/flags/us.svg',
    country_flag_emoji: '🇺🇸',
    calling_code: '1',
    is_eu: false,
  },
  time_zone: {
    id: 'America/Los_Angeles',
    current_time: '2024-01-15T10:30:45-08:00',
    gmt_offset: -28800,
    code: 'PST',
    is_daylight_saving: false,
  },
  currency: {
    code: 'USD',
    name: 'US Dollar',
    plural: 'US dollars',
    symbol: '$',
    symbol_native: '$',
  },
  connection: {
    asn: 15169,
    isp: 'Google LLC',
    domain: 'google.com',
    usage_type: 'Data Center/Web Hosting/Transit',
    user_type: 'business',
  },
  security: {
    is_proxy: false,
    proxy_type: '',
    is_crawler: false,
    crawler_name: '',
    crawler_type: '',
    is_tor: false,
    threat_level: 'low',
    threat_types: [],
  },
}

const SAMPLE_IPS = [
  { name: 'Google DNS', ip: '8.8.8.8' },
  { name: 'Cloudflare DNS', ip: '1.1.1.1' },
  { name: 'OpenDNS', ip: '208.67.222.222' },
  { name: 'Quad9 DNS', ip: '9.9.9.9' },
]

export default function IPInfoPage() {
  const [ipAddress, setIpAddress] = useState<string>('')
  const [ipInfo, setIpInfo] = useState<IPInfo | null>(null)
  const [currentIP, setCurrentIP] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    // Get user's current IP
    getCurrentIP()
  }, [])

  const getCurrentIP = async () => {
    try {
      // In a real implementation, you would call an IP API
      // For demo purposes, we'll simulate with a mock IP
      setCurrentIP('192.168.1.100') // Mock current IP
    } catch (err) {
      console.error('Error getting current IP:', err)
    }
  }

  const isValidIP = (ip: string): boolean => {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
    return ipv4Regex.test(ip) || ipv6Regex.test(ip)
  }

  const getIPInfo = async (ip: string) => {
    if (!isValidIP(ip)) {
      setError("Noto'g'ri IP manzil formati")
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // In a real implementation, you would call an IP geolocation API
      // For demo purposes, we'll use mock data
      setTimeout(() => {
        setIpInfo({
          ...MOCK_IP_INFO,
          ip: ip,
        })
        setIsLoading(false)
      }, 1000)
    } catch (err) {
      setError("IP ma'lumotlarini olishda xatolik yuz berdi")
      setIsLoading(false)
    }
  }

  const loadSampleIP = (ip: string) => {
    setIpAddress(ip)
    getIPInfo(ip)
  }

  const loadCurrentIP = () => {
    if (currentIP) {
      setIpAddress(currentIP)
      getIPInfo(currentIP)
    }
  }

  const analyzeIP = () => {
    if (ipAddress.trim()) {
      getIPInfo(ipAddress.trim())
    }
  }

  const clearData = () => {
    setIpAddress('')
    setIpInfo(null)
    setError('')
  }

  const getThreatLevelColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'text-green-400'
      case 'medium':
        return 'text-yellow-400'
      case 'high':
        return 'text-red-400'
      default:
        return 'text-zinc-400'
    }
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-4">
      <ToolHeader title="IP Ma'lumotlari" description="IP manzil va joylashuv ma'lumotlari, xavfsizlik tahlili" />

      {/* Sample Data Section */}
      <Card className="mb-6 border-zinc-800 bg-zinc-900/80">
        <div className="p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-medium text-zinc-200">Tez boshlash</h3>
              <p className="text-sm text-zinc-400">Joriy IP manzilingiz yoki namuna IP bilan boshlang</p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={loadCurrentIP}
                variant="outline"
                className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                disabled={!currentIP}
              >
                <MapPin className="mr-2 h-4 w-4" />
                Joriy IP
              </Button>
              <Button onClick={clearData} variant="outline" className="border-zinc-700">
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
          {/* IP Input */}
          <Card className="border-zinc-800 bg-zinc-900/80">
            <div className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-zinc-100">IP Manzil Kiriting</h3>

              <div className="space-y-4">
                <div>
                  <Input
                    placeholder="Masalan: 8.8.8.8 yoki 2001:4860:4860::8888"
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    className="border-zinc-700 bg-zinc-800 font-mono"
                  />
                  {error && <p className="mt-1 text-sm text-red-400">{error}</p>}
                </div>

                <Button
                  onClick={analyzeIP}
                  disabled={!ipAddress.trim() || isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isLoading ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="mr-2 h-4 w-4" />
                  )}
                  {isLoading ? 'Tahlil qilinmoqda...' : 'Tahlil qilish'}
                </Button>
              </div>
            </div>
          </Card>

          {/* Sample IPs */}
          <Card className="border-zinc-800 bg-zinc-900/80">
            <div className="p-6">
              <h3 className="mb-4 text-lg font-semibold text-zinc-100">Namuna IP Manzillar</h3>

              <div className="space-y-2">
                {SAMPLE_IPS.map((sample, index) => (
                  <button
                    key={index}
                    onClick={() => loadSampleIP(sample.ip)}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-800/50 p-3 text-left transition-colors hover:border-zinc-600 hover:bg-zinc-800"
                  >
                    <div className="font-medium text-zinc-100">{sample.name}</div>
                    <div className="font-mono text-sm text-zinc-400">{sample.ip}</div>
                  </button>
                ))}
              </div>
            </div>
          </Card>

          {/* Current IP Info */}
          {currentIP && (
            <Card className="border-zinc-800 bg-zinc-900/80">
              <div className="p-6">
                <h3 className="mb-4 text-lg font-semibold text-zinc-100">Sizning IP Manzilingiz</h3>
                <div className="rounded-lg bg-zinc-800/50 p-3">
                  <div className="font-mono text-lg text-zinc-100">{currentIP}</div>
                  <div className="mt-1 text-sm text-zinc-400">Bu sizning joriy IP manzilingiz (taxminiy)</div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {ipInfo && (
            <>
              {/* Location Info */}
              <Card className="border-zinc-800 bg-zinc-900/80">
                <div className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                        <MapPin className="h-5 w-5 text-blue-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-zinc-100">Joylashuv</h3>
                    </div>
                    <div className="text-2xl">{ipInfo.location.country_flag_emoji}</div>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-zinc-400">IP manzil</div>
                        <div className="font-mono text-zinc-100">{ipInfo.ip}</div>
                      </div>
                      <div>
                        <div className="text-sm text-zinc-400">Turi</div>
                        <div className="text-zinc-100 uppercase">{ipInfo.type}</div>
                      </div>
                      <div>
                        <div className="text-sm text-zinc-400">Mamlakat</div>
                        <div className="text-zinc-100">{ipInfo.country_name}</div>
                      </div>
                      <div>
                        <div className="text-sm text-zinc-400">Viloyat</div>
                        <div className="text-zinc-100">{ipInfo.region_name}</div>
                      </div>
                      <div>
                        <div className="text-sm text-zinc-400">Shahar</div>
                        <div className="text-zinc-100">{ipInfo.city}</div>
                      </div>
                      <div>
                        <div className="text-sm text-zinc-400">Pochta indeksi</div>
                        <div className="text-zinc-100">{ipInfo.zip || "Noma'lum"}</div>
                      </div>
                    </div>

                    <div className="border-t border-zinc-700 pt-2">
                      <div className="mb-1 text-sm text-zinc-400">Koordinatalar</div>
                      <div className="font-mono text-zinc-100">
                        {ipInfo.latitude.toFixed(4)}, {ipInfo.longitude.toFixed(4)}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Network Info */}
              <Card className="border-zinc-800 bg-zinc-900/80">
                <div className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-500/10">
                      <Wifi className="h-5 w-5 text-green-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-100">Tarmoq Ma'lumotlari</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-zinc-400">ISP</div>
                      <div className="text-zinc-100">{ipInfo.connection.isp}</div>
                    </div>
                    <div>
                      <div className="text-sm text-zinc-400">ASN</div>
                      <div className="text-zinc-100">{ipInfo.connection.asn}</div>
                    </div>
                    <div>
                      <div className="text-sm text-zinc-400">Domen</div>
                      <div className="text-zinc-100">{ipInfo.connection.domain}</div>
                    </div>
                    <div>
                      <div className="text-sm text-zinc-400">Foydalanish turi</div>
                      <div className="text-zinc-100">{ipInfo.connection.usage_type}</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Security Info */}
              <Card className="border-zinc-800 bg-zinc-900/80">
                <div className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-500/10">
                      <Shield className="h-5 w-5 text-orange-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-100">Xavfsizlik</h3>
                  </div>

                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-zinc-400">Proxy</div>
                        <div className={ipInfo.security.is_proxy ? 'text-red-400' : 'text-green-400'}>
                          {ipInfo.security.is_proxy ? 'Ha' : "Yo'q"}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-zinc-400">Tor</div>
                        <div className={ipInfo.security.is_tor ? 'text-red-400' : 'text-green-400'}>
                          {ipInfo.security.is_tor ? 'Ha' : "Yo'q"}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-zinc-400">Bot/Crawler</div>
                        <div className={ipInfo.security.is_crawler ? 'text-yellow-400' : 'text-green-400'}>
                          {ipInfo.security.is_crawler ? 'Ha' : "Yo'q"}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-zinc-400">Xavf darajasi</div>
                        <div className={getThreatLevelColor(ipInfo.security.threat_level)}>
                          {ipInfo.security.threat_level === 'low'
                            ? 'Past'
                            : ipInfo.security.threat_level === 'medium'
                              ? "O'rtacha"
                              : ipInfo.security.threat_level === 'high'
                                ? 'Yuqori'
                                : "Noma'lum"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Time Zone & Currency */}
              <Card className="border-zinc-800 bg-zinc-900/80">
                <div className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                      <Globe className="h-5 w-5 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-zinc-100">Vaqt va Valyuta</h3>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-zinc-400">Vaqt zonasi</div>
                      <div className="text-zinc-100">{ipInfo.time_zone.id}</div>
                    </div>
                    <div>
                      <div className="text-sm text-zinc-400">GMT ofset</div>
                      <div className="text-zinc-100">{ipInfo.time_zone.gmt_offset / 3600}h</div>
                    </div>
                    <div>
                      <div className="text-sm text-zinc-400">Valyuta</div>
                      <div className="text-zinc-100">
                        {ipInfo.currency.name} ({ipInfo.currency.symbol})
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-zinc-400">Qo\'ng\'iroq kodi</div>
                      <div className="text-zinc-100">+{ipInfo.location.calling_code}</div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Raw Data */}
              <Card className="border-zinc-800 bg-zinc-900/80">
                <div className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-zinc-100">JSON Ma'lumotlar</h3>
                    <CopyButton text={JSON.stringify(ipInfo, null, 2)} />
                  </div>

                  <div className="max-h-64 overflow-auto rounded-lg border border-zinc-700 bg-zinc-900 p-4">
                    <pre className="text-sm text-zinc-300">{JSON.stringify(ipInfo, null, 2)}</pre>
                  </div>
                </div>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Help Section */}
      <Card className="mt-6 border-zinc-800 bg-zinc-900/80">
        <div className="p-6">
          <h4 className="mb-3 font-medium text-zinc-200">IP ma'lumotlari vositasi haqida</h4>
          <div className="space-y-2 text-sm text-zinc-400">
            <p>
              • <strong>Geolokatsiya:</strong> IP manzil asosida joylashuvni aniqlash
            </p>
            <p>
              • <strong>ISP ma'lumotlari:</strong> Internet provayideri va tarmoq tafsilotlari
            </p>
            <p>
              • <strong>Xavfsizlik tahlili:</strong> Proxy, Tor, va bot aniqlash
            </p>
            <p>
              • <strong>Vaqt zonasi:</strong> Mahalliy vaqt va GMT ofset ma'lumotlari
            </p>
            <p>
              • <strong>Valyuta:</strong> Mamlakat valyutasi va qo'ng'iroq kodi
            </p>
          </div>

          <div className="mt-4 space-y-2">
            <div className="rounded-lg bg-blue-500/10 p-3">
              <div className="text-sm text-blue-400">
                <strong>Eslatma:</strong> Bu ma'lumotlar taxminiy bo'lib, VPN va proxy ishlatilgan hollarda noto'g'ri
                bo'lishi mumkin.
              </div>
            </div>
            <div className="rounded-lg bg-yellow-500/10 p-3">
              <div className="text-sm text-yellow-400">
                <strong>Maxfiylik:</strong> Hech qanday IP manzil ma'lumotlari saqlanmaydi yoki uchinchi tomonlarga
                uzatilmaydi.
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
