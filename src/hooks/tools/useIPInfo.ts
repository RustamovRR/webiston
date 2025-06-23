import { useState, useEffect } from 'react'

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

export const useIPInfo = () => {
  const [ipAddress, setIpAddress] = useState<string>('')
  const [ipInfo, setIpInfo] = useState<IPInfo | null>(null)
  const [currentIP, setCurrentIP] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')

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

  const getIPInfo = async (ip: string) => {
    if (!isValidIP(ip)) {
      setError("Noto'g'ri IP manzil formati")
      return
    }

    setIsLoading(true)
    setError('')

    try {
      // Use ipapi.co for free IP geolocation (no API key required)
      const response = await fetch(`https://ipapi.co/${ip}/json/`)

      if (!response.ok) {
        throw new Error('API request failed')
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.reason || "IP ma'lumotlarini olishda xatolik")
      }

      // Transform the data to match our interface
      const transformedData: IPInfo = {
        ip: data.ip,
        type: data.version === 6 ? 'ipv6' : 'ipv4',
        continent_code: data.continent_code || '',
        continent_name:
          data.continent_code === 'AS'
            ? 'Asia'
            : data.continent_code === 'EU'
              ? 'Europe'
              : data.continent_code === 'NA'
                ? 'North America'
                : data.continent_code === 'SA'
                  ? 'South America'
                  : data.continent_code === 'AF'
                    ? 'Africa'
                    : data.continent_code === 'OC'
                      ? 'Oceania'
                      : data.continent_code === 'AN'
                        ? 'Antarctica'
                        : 'Unknown',
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
      }

      setIpInfo(transformedData)
      setIsLoading(false)
    } catch (err) {
      console.error('Error fetching IP info:', err)
      setError("IP ma'lumotlarini olishda xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring.")
      setIsLoading(false)
    }
  }

  const analyzeIP = () => {
    if (ipAddress.trim()) {
      getIPInfo(ipAddress.trim())
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

  const clearData = () => {
    setIpAddress('')
    setIpInfo(null)
    setError('')
  }

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
  }
}

export type { IPInfo }
