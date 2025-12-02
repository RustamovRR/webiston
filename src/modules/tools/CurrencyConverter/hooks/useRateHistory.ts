'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { fetchHistoricalRates } from '@/lib/api/cbu'
import type { HistoricalRate, TimeRange, ChartDataPoint } from '../types'
import { formatDate } from '../utils/currencyFormatters'

interface UseRateHistoryProps {
  currencyCode: string
  timeRange?: TimeRange
  locale?: string
}

interface UseRateHistoryResult {
  history: HistoricalRate[]
  chartData: ChartDataPoint[]
  isLoading: boolean
  error: string | null
  timeRange: TimeRange
  setTimeRange: (range: TimeRange) => void
  refreshHistory: () => Promise<void>
  stats: {
    min: number
    max: number
    average: number
    change: number
    changePercent: number
  }
}

/**
 * Valyuta tarixiy ma'lumotlarini boshqarish
 */
export function useRateHistory({
  currencyCode,
  timeRange = '30d',
  locale = 'uz-UZ',
}: UseRateHistoryProps): UseRateHistoryResult {
  const [history, setHistory] = useState<HistoricalRate[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTimeRange, setSelectedTimeRange] = useState<TimeRange>(timeRange)

  /**
   * Sana oralig'ini hisoblash
   */
  const getDateRange = useCallback((range: TimeRange): { startDate: string; endDate: string } => {
    const endDate = new Date()
    const startDate = new Date()

    switch (range) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7)
        break
      case '30d':
        startDate.setDate(endDate.getDate() - 30)
        break
      case '90d':
        startDate.setDate(endDate.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(endDate.getFullYear() - 1)
        break
    }

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    }
  }, [])

  /**
   * Tarixiy ma'lumotlarni yuklash
   */
  const fetchHistory = useCallback(async () => {
    if (!currencyCode) return

    setIsLoading(true)
    setError(null)

    try {
      const { startDate } = getDateRange(selectedTimeRange)
      const data = await fetchHistoricalRates(currencyCode, startDate)

      // Sanalar bo'yicha saralash (eng eskisi birinchi)
      const sorted = data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

      setHistory(sorted)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch history'
      setError(errorMessage)
      console.error('Error fetching history:', err)
    } finally {
      setIsLoading(false)
    }
  }, [currencyCode, selectedTimeRange, getDateRange])

  /**
   * Chart uchun ma'lumotlar
   */
  const chartData = useMemo((): ChartDataPoint[] => {
    return history.map((item) => ({
      date: item.date,
      rate: item.rate,
      formattedDate: formatDate(item.date, locale, 'short'),
    }))
  }, [history, locale])

  /**
   * Statistika
   */
  const stats = useMemo(() => {
    if (history.length === 0) {
      return {
        min: 0,
        max: 0,
        average: 0,
        change: 0,
        changePercent: 0,
      }
    }

    const rates = history.map((h) => h.rate)
    const min = Math.min(...rates)
    const max = Math.max(...rates)
    const average = rates.reduce((sum, rate) => sum + rate, 0) / rates.length

    const firstRate = history[0].rate
    const lastRate = history[history.length - 1].rate
    const change = lastRate - firstRate
    const changePercent = (change / firstRate) * 100

    return {
      min,
      max,
      average,
      change,
      changePercent,
    }
  }, [history])

  /**
   * Time range o'zgartirish
   */
  const setTimeRange = useCallback((range: TimeRange) => {
    setSelectedTimeRange(range)
  }, [])

  /**
   * Yangilash
   */
  const refreshHistory = useCallback(async () => {
    await fetchHistory()
  }, [fetchHistory])

  /**
   * Initial load va currency/timeRange o'zgarganda
   */
  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  return {
    history,
    chartData,
    isLoading,
    error,
    timeRange: selectedTimeRange,
    setTimeRange,
    refreshHistory,
    stats,
  }
}
