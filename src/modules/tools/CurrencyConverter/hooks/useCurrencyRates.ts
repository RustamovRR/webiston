'use client'

import { useState, useEffect, useCallback } from 'react'
import { fetchCurrentRates } from '@/lib/api/cbu'
import type { CurrencyRate } from '../types'

const CACHE_KEY = 'currency_rates_cache'
const CACHE_DURATION = 3600000 // 1 soat (ms)

interface CacheData {
  rates: CurrencyRate[]
  lastUpdate: string
  expiresAt: string
}

interface UseCurrencyRatesResult {
  rates: CurrencyRate[]
  isLoading: boolean
  error: string | null
  lastUpdate: string | null
  refreshRates: () => Promise<void>
  getCurrencyByCode: (code: string) => CurrencyRate | undefined
}

/**
 * Valyuta kurslarini boshqarish hook
 * - LocalStorage cache
 * - Auto-refresh
 * - Error handling
 */
export function useCurrencyRates(): UseCurrencyRatesResult {
  const [rates, setRates] = useState<CurrencyRate[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<string | null>(null)

  /**
   * Cache dan ma'lumot o'qish
   */
  const loadFromCache = useCallback((): CurrencyRate[] | null => {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      if (!cached) return null

      const data: CacheData = JSON.parse(cached)
      const expiresAt = new Date(data.expiresAt)

      // Cache muddati tugagan bo'lsa
      if (expiresAt < new Date()) {
        localStorage.removeItem(CACHE_KEY)
        return null
      }

      setLastUpdate(data.lastUpdate)
      return data.rates
    } catch (error) {
      console.error('Error loading from cache:', error)
      return null
    }
  }, [])

  /**
   * Cache ga saqlash
   */
  const saveToCache = useCallback((rates: CurrencyRate[]) => {
    try {
      const now = new Date()
      const cacheData: CacheData = {
        rates,
        lastUpdate: now.toISOString(),
        expiresAt: new Date(now.getTime() + CACHE_DURATION).toISOString(),
      }

      localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData))
      setLastUpdate(cacheData.lastUpdate)
    } catch (error) {
      console.error('Error saving to cache:', error)
    }
  }, [])

  /**
   * API dan ma'lumot olish
   */
  const fetchRates = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await fetchCurrentRates()
      setRates(data)
      saveToCache(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch rates'
      setError(errorMessage)
      console.error('Error fetching rates:', err)
    } finally {
      setIsLoading(false)
    }
  }, [saveToCache])

  /**
   * Kurslarni yangilash (manual)
   */
  const refreshRates = useCallback(async () => {
    await fetchRates()
  }, [fetchRates])

  /**
   * Valyutani kod bo'yicha topish
   */
  const getCurrencyByCode = useCallback(
    (code: string): CurrencyRate | undefined => {
      return rates.find((rate) => rate.code === code)
    },
    [rates],
  )

  /**
   * Initial load
   */
  useEffect(() => {
    // Avval cache dan yuklash
    const cachedRates = loadFromCache()

    if (cachedRates && cachedRates.length > 0) {
      setRates(cachedRates)
      setIsLoading(false)
    } else {
      // Cache bo'sh bo'lsa, API dan olish
      fetchRates()
    }
  }, [loadFromCache, fetchRates])

  return {
    rates,
    isLoading,
    error,
    lastUpdate,
    refreshRates,
    getCurrencyByCode,
  }
}
