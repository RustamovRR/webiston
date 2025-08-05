import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'

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

export interface IPSample {
  name: string
  ip: string
  description: string
}

const SAMPLE_IPS: IPSample[] = [
  {
    name: 'Google DNS',
    ip: '8.8.8.8',
    description: 'Google DNS primary server',
  },
  {
    name: 'Cloudflare DNS',
    ip: '1.1.1.1',
    description: 'Cloudflare public DNS server',
  },
  {
    name: 'OpenDNS',
    ip: '208.67.222.222',
    description: 'OpenDNS primary server',
  },
  {
    name: 'Quad9 DNS',
    ip: '9.9.9.9',
    description: 'Quad9 secure DNS server',
  },
  {
    name: 'IBM Quad9',
    ip: '149.112.112.112',
    description: 'IBM Quad9 secondary server',
  },
  {
    name: 'Level3 DNS',
    ip: '4.2.2.2',
    description: 'Level3 public DNS server',
  },
]

// API Providers with fallback support
const API_PROVIDERS = [
  {
    name: 'ipapi.co',
    url: (ip: string) => `https://ipapi.co/${ip}/json/`,
    rateLimit: '1000/month',
    transform: (data: any): IPInfo => ({
      ip: data.ip,
      type: data.version === 6 ? 'ipv6' : 'ipv4',
      continent_code: data.continent_code || '',
      continent_name: getContinentName(data.continent_code),
      country_code: data.country_code || '',
      country_name: data.country_name || '',
      region_code: data.region_code || '',
      region_name: data.region || '',
      city: data.city || '',
      zip: data.postal || '',
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
      location: {
        geoname_id: 0,
        capital: data.country_capital || '',
        country_flag: `https://flagcdn.com/16x12/${data.country_code?.toLowerCase()}.png`,
        country_flag_emoji: data.country_emoji || '',
        calling_code: data.country_calling_code || '',
        is_eu: data.in_eu || false,
      },
      time_zone: {
        id: data.timezone || '',
        current_time: data.utc_offset || '',
        gmt_offset: 0,
        code: data.timezone?.split('/')[1] || '',
        is_daylight_saving: false,
      },
      currency: {
        code: data.currency || '',
        name: data.currency_name || '',
        plural: data.currency_name || '',
        symbol: '',
        symbol_native: '',
      },
      connection: {
        asn: data.asn ? parseInt(data.asn.replace('AS', '')) : 0,
        isp: data.org || '',
        domain: '',
        usage_type: data.connection_type || '',
        user_type: '',
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
    }),
  },
  {
    name: 'ip-api.com',
    url: (ip: string) =>
      `http://ip-api.com/json/${ip}?fields=status,message,continent,continentCode,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,query,proxy,hosting`,
    rateLimit: '1000/minute',
    transform: (data: any): IPInfo => ({
      ip: data.query,
      type: 'ipv4', // ip-api.com primarily supports IPv4
      continent_code: data.continentCode || '',
      continent_name: data.continent || '',
      country_code: data.countryCode || '',
      country_name: data.country || '',
      region_code: data.region || '',
      region_name: data.regionName || '',
      city: data.city || '',
      zip: data.zip || '',
      latitude: data.lat || 0,
      longitude: data.lon || 0,
      location: {
        geoname_id: 0,
        capital: '',
        country_flag: `https://flagcdn.com/16x12/${data.countryCode?.toLowerCase()}.png`,
        country_flag_emoji: '',
        calling_code: '',
        is_eu: false,
      },
      time_zone: {
        id: data.timezone || '',
        current_time: '',
        gmt_offset: 0,
        code: data.timezone?.split('/')[1] || '',
        is_daylight_saving: false,
      },
      currency: {
        code: '',
        name: '',
        plural: '',
        symbol: '',
        symbol_native: '',
      },
      connection: {
        asn: data.as ? parseInt(data.as.split(' ')[0].replace('AS', '')) : 0,
        isp: data.isp || data.org || '',
        domain: '',
        usage_type: data.hosting ? 'hosting' : 'isp',
        user_type: '',
      },
      security: {
        is_proxy: data.proxy || false,
        proxy_type: data.proxy ? 'detected' : '',
        is_crawler: false,
        crawler_name: '',
        crawler_type: '',
        is_tor: false,
        threat_level: data.proxy ? 'medium' : 'low',
        threat_types: data.proxy ? ['proxy'] : [],
      },
    }),
  },
  {
    name: 'ipinfo.io',
    url: (ip: string) => `https://ipinfo.io/${ip}/json`,
    rateLimit: '50000/month',
    transform: (data: any): IPInfo => ({
      ip: data.ip,
      type: 'ipv4',
      continent_code: '',
      continent_name: '',
      country_code: data.country || '',
      country_name: data.country || '',
      region_code: data.region || '',
      region_name: data.region || '',
      city: data.city || '',
      zip: data.postal || '',
      latitude: data.loc ? parseFloat(data.loc.split(',')[0]) : 0,
      longitude: data.loc ? parseFloat(data.loc.split(',')[1]) : 0,
      location: {
        geoname_id: 0,
        capital: '',
        country_flag: `https://flagcdn.com/16x12/${data.country?.toLowerCase()}.png`,
        country_flag_emoji: '',
        calling_code: '',
        is_eu: false,
      },
      time_zone: {
        id: data.timezone || '',
        current_time: '',
        gmt_offset: 0,
        code: data.timezone?.split('/')[1] || '',
        is_daylight_saving: false,
      },
      currency: {
        code: '',
        name: '',
        plural: '',
        symbol: '',
        symbol_native: '',
      },
      connection: {
        asn: 0,
        isp: data.org || '',
        domain: '',
        usage_type: 'isp',
        user_type: '',
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
    }),
  },
]

const getContinentName = (code: string): string => {
  const continents: { [key: string]: string } = {
    AS: 'Asia',
    EU: 'Europe',
    NA: 'North America',
    SA: 'South America',
    AF: 'Africa',
    OC: 'Oceania',
    AN: 'Antarctica',
  }
  return continents[code] || 'Unknown'
}

export const useIPInfo = () => {
  const t = useTranslations('IpInfoPage.Errors')
  const [ipAddress, setIpAddress] = useState<string>('')
  const [ipInfo, setIpInfo] = useState<IPInfo | null>(null)
  const [currentIP, setCurrentIP] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  const [currentProviderIndex, setCurrentProviderIndex] = useState(0)

  useEffect(() => {
    getCurrentIP()
  }, [])

  const getCurrentIP = async () => {
    try {
      // Use a free IP service to get user's current IP
      const response = await fetch('https://api.ipify.org?format=json')
      const data = await response.json()
      setCurrentIP(data.ip)
    } catch (err) {
      console.error('Error getting current IP:', err)
      // Fallback: try another service
      try {
        const response = await fetch('https://ipapi.co/ip/')
        const ip = await response.text()
        setCurrentIP(ip.trim())
      } catch (err2) {
        console.error('Error getting IP from fallback service:', err2)
      }
    }
  }

  const isValidIP = (ip: string): boolean => {
    const ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    const ipv6Regex = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/
    return ipv4Regex.test(ip) || ipv6Regex.test(ip)
  }

  const tryNextProvider = async (ip: string, startIndex: number = 0): Promise<IPInfo> => {
    for (let i = startIndex; i < API_PROVIDERS.length; i++) {
      const provider = API_PROVIDERS[i]

      try {
        console.log(`Trying provider: ${provider.name}`)
        const response = await fetch(provider.url(ip))

        if (!response.ok) {
          if (response.status === 429) {
            console.log(`Rate limit exceeded for ${provider.name}, trying next provider...`)
            continue
          }
          throw new Error(`HTTP ${response.status}`)
        }

        const data = await response.json()

        // Check for API-specific error responses
        if (data.error || data.status === 'fail') {
          console.log(`API error from ${provider.name}:`, data.error || data.message)
          continue
        }

        // Transform data using provider-specific transformer
        const transformedData = provider.transform(data)
        setCurrentProviderIndex(i)
        return transformedData
      } catch (err) {
        console.log(`Error with ${provider.name}:`, err)
        continue
      }
    }

    throw new Error('All providers failed')
  }

  const getIPInfo = async (ip: string) => {
    if (!isValidIP(ip)) {
      setError(t('invalidIpFormat'))
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const transformedData = await tryNextProvider(ip, currentProviderIndex)
      setIpInfo(transformedData)
      setIsLoading(false)
    } catch (err) {
      console.error('Error fetching IP info:', err)

      // Set appropriate error message based on error type
      if (err instanceof Error && err.message.includes('429')) {
        setError(t('rateLimitExceeded'))
      } else if (err instanceof Error && err.message.includes('network')) {
        setError(t('networkError'))
      } else {
        setError(t('apiRequestFailed'))
      }

      setIsLoading(false)
    }
  }

  const analyzeIP = () => {
    if (ipAddress.trim()) {
      getIPInfo(ipAddress.trim())
    }
  }

  const loadSampleIP = (sample: IPSample) => {
    setIpAddress(sample.ip)
    getIPInfo(sample.ip)
  }

  const loadCurrentIP = () => {
    if (currentIP) {
      setIpAddress(currentIP)
      getIPInfo(currentIP)
    }
  }

  const clearData = () => {
    setIpAddress('')
    setIpInfo(null)
    setError('')
  }

  const downloadInfo = () => {
    if (!ipInfo) {
      return
    }

    const data = {
      timestamp: new Date().toISOString(),
      analyzed_ip: ipInfo.ip,
      location: {
        country: ipInfo.country_name,
        region: ipInfo.region_name,
        city: ipInfo.city,
        coordinates: `${ipInfo.latitude}, ${ipInfo.longitude}`,
      },
      network: {
        isp: ipInfo.connection.isp,
        asn: ipInfo.connection.asn,
        type: ipInfo.type,
      },
      additional: {
        timezone: ipInfo.time_zone.id,
        currency: ipInfo.currency.code,
        calling_code: ipInfo.location.calling_code,
      },
      full_data: ipInfo,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ip-analysis-${ipInfo.ip}-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getStats = (tStats?: any) => {
    return [
      { label: tStats ? tStats('stats.characters') : 'Characters', value: ipAddress.length },
      {
        label: tStats ? tStats('stats.ipVersion') : 'IP Version',
        value: ipInfo ? (ipInfo.type === 'ipv4' ? 4 : 6) : 0,
      },
      { label: tStats ? tStats('stats.dataAvailable') : 'Data', value: ipInfo ? 1 : 0 },
    ]
  }

  const canDownload = !!ipInfo
  const isEmpty = !ipAddress.trim()

  return {
    ipAddress,
    setIpAddress,
    ipInfo,
    currentIP,
    isLoading,
    error,
    analyzeIP,
    loadSampleIP,
    loadCurrentIP,
    clearData,
    downloadInfo,
    getStats,
    samples: SAMPLE_IPS,
    canDownload,
    isEmpty,
    isValidIP,
  }
}
