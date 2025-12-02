'use client'

import React from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib'
import { POPULAR_PAIRS } from '../utils/popularPairs'
import { formatNumber } from '../utils/currencyFormatters'
import { determineTrend } from '../utils/currencyCalculations'
import type { CurrencyRate } from '../types'

interface QuickPairsProps {
  currencies: CurrencyRate[]
  onSelectPair: (from: string, to: string) => void
  locale?: string
}

export function QuickPairs({ currencies, onSelectPair, locale = 'uz' }: QuickPairsProps) {
  /**
   * Valyuta ma'lumotini topish
   */
  const getCurrency = (code: string): CurrencyRate | undefined => {
    return currencies.find((c) => c.code === code)
  }

  /**
   * Juftlik nomini olish
   */
  const getPairLabel = (pair: (typeof POPULAR_PAIRS)[0]): string => {
    switch (locale) {
      case 'en':
        return pair.label_en
      case 'ru':
        return pair.label_ru
      default:
        return pair.label_uz
    }
  }

  /**
   * Kursni hisoblash
   */
  const calculateRate = (fromCode: string, toCode: string): number | null => {
    const fromCurrency = getCurrency(fromCode)
    const toCurrency = getCurrency(toCode)

    if (!fromCurrency || !toCurrency) return null

    // UZS ga nisbatan kurs
    if (toCode === 'UZS') {
      return fromCurrency.rate / fromCurrency.nominal
    }

    // Cross-rate
    return toCurrency.rate / toCurrency.nominal / (fromCurrency.rate / fromCurrency.nominal)
  }

  /**
   * Trend aniqlash
   */
  const getTrend = (fromCode: string): 'up' | 'down' | 'neutral' => {
    const currency = getCurrency(fromCode)
    if (!currency || fromCode === 'UZS') return 'neutral'

    return determineTrend(currency.rate, currency.rate - currency.diff)
  }

  const trendIcons = {
    up: <TrendingUp className="h-4 w-4" />,
    down: <TrendingDown className="h-4 w-4" />,
    neutral: <Minus className="h-4 w-4" />,
  }

  const trendColors = {
    up: 'text-green-500 bg-green-500/10 border-green-500/20',
    down: 'text-red-500 bg-red-500/10 border-red-500/20',
    neutral: 'text-zinc-400 bg-zinc-500/10 border-zinc-500/20',
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Tez konvertatsiya</h3>
        <span className="text-sm text-zinc-500">Mashhur juftliklar</span>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {POPULAR_PAIRS.map((pair) => {
          const rate = calculateRate(pair.from, pair.to)
          const trend = getTrend(pair.from)

          return (
            <Card
              key={`${pair.from}-${pair.to}`}
              className="group cursor-pointer border-zinc-200 bg-white/80 p-4 transition-all hover:scale-105 hover:shadow-lg dark:border-zinc-800/30 dark:bg-zinc-900/60"
              onClick={() => onSelectPair(pair.from, pair.to)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Pair Label */}
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-2xl">{pair.icon}</span>
                    <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{getPairLabel(pair)}</span>
                  </div>

                  {/* Rate */}
                  {rate !== null ? (
                    <div className="space-y-1">
                      <div className="text-xl font-bold text-zinc-900 dark:text-white">
                        {formatNumber(rate, 2, locale)}
                      </div>
                      <div className="text-xs text-zinc-500">
                        1 {pair.from} = {formatNumber(rate, 2, locale)} {pair.to}
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-zinc-400">Ma'lumot yo'q</div>
                  )}
                </div>

                {/* Trend Indicator */}
                <div className={cn('rounded-full border p-1.5', trendColors[trend])}>{trendIcons[trend]}</div>
              </div>

              {/* Hover Effect */}
              <div className="mt-3 text-xs text-zinc-400 opacity-0 transition-opacity group-hover:opacity-100">
                Konvertatsiya qilish uchun bosing →
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
