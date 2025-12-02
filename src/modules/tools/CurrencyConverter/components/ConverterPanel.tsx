'use client'

import React from 'react'
import { ArrowLeftRight, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib'
import { CurrencySelector } from './CurrencySelector'
import { formatNumber, formatRate, formatRelativeTime } from '../utils/currencyFormatters'
import { determineTrend } from '../utils/currencyCalculations'
import type { CurrencyRate } from '../types'

interface ConverterPanelProps {
  // Input states
  amount: string
  fromCurrency: string
  toCurrency: string
  onAmountChange: (amount: string) => void
  onFromCurrencyChange: (code: string) => void
  onToCurrencyChange: (code: string) => void
  onSwap: () => void

  // Computed values
  result: number
  rate: number
  isValid: boolean

  // Currency data
  currencies: CurrencyRate[]
  fromCurrencyData?: CurrencyRate
  toCurrencyData?: CurrencyRate

  // Other
  lastUpdate: string | null
  onRefresh?: () => void
  isLoading?: boolean
  locale?: string
}

export function ConverterPanel({
  amount,
  fromCurrency,
  toCurrency,
  onAmountChange,
  onFromCurrencyChange,
  onToCurrencyChange,
  onSwap,
  result,
  rate,
  isValid,
  currencies,
  fromCurrencyData,
  toCurrencyData,
  lastUpdate,
  onRefresh,
  isLoading = false,
  locale = 'uz',
}: ConverterPanelProps) {
  /**
   * Trend aniqlash
   */
  const trend = fromCurrencyData
    ? determineTrend(fromCurrencyData.rate, fromCurrencyData.rate - fromCurrencyData.diff)
    : 'neutral'

  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-zinc-400',
  }

  const trendIcons = {
    up: '↑',
    down: '↓',
    neutral: '→',
  }

  return (
    <Card className="border-zinc-200 bg-white/80 p-6 backdrop-blur-sm dark:border-zinc-800/30 dark:bg-zinc-900/60">
      <div className="space-y-6">
        {/* Amount Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Miqdor</label>
          <Input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            placeholder="0.00"
            className="text-2xl font-semibold"
            disabled={isLoading}
          />
        </div>

        {/* From Currency */}
        <CurrencySelector
          currencies={currencies}
          value={fromCurrency}
          onChange={onFromCurrencyChange}
          label="Dan"
          disabled={isLoading}
          locale={locale}
        />

        {/* Swap Button */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="icon"
            onClick={onSwap}
            disabled={isLoading}
            className="h-10 w-10 rounded-full transition-transform hover:rotate-180"
          >
            <ArrowLeftRight className="h-5 w-5" />
          </Button>
        </div>

        {/* To Currency */}
        <CurrencySelector
          currencies={currencies}
          value={toCurrency}
          onChange={onToCurrencyChange}
          label="Ga"
          disabled={isLoading}
          locale={locale}
        />

        {/* Result */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Natija</label>
          <div
            className={cn(
              'rounded-lg border-2 border-dashed p-4 text-center transition-colors',
              isValid
                ? 'border-blue-500/50 bg-blue-500/5 dark:border-blue-500/30 dark:bg-blue-500/10'
                : 'border-zinc-300 bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-800',
            )}
          >
            {isValid ? (
              <>
                <div className="text-3xl font-bold text-zinc-900 dark:text-white">
                  {formatNumber(result, 2, locale)}
                </div>
                <div className="mt-1 text-sm text-zinc-500">{toCurrency}</div>
              </>
            ) : (
              <div className="text-zinc-400">Miqdor kiriting...</div>
            )}
          </div>
        </div>

        {/* Rate Info */}
        {isValid && fromCurrencyData && toCurrencyData && (
          <div className="space-y-3 rounded-lg bg-zinc-100 p-4 dark:bg-zinc-800/50">
            {/* Exchange Rate */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">Kurs:</span>
              <span className="font-semibold text-zinc-900 dark:text-white">
                {formatRate(fromCurrency, toCurrency, rate, locale)}
              </span>
            </div>

            {/* Inverse Rate */}
            <div className="flex items-center justify-between">
              <span className="text-sm text-zinc-600 dark:text-zinc-400">Teskari kurs:</span>
              <span className="font-semibold text-zinc-900 dark:text-white">
                {formatRate(toCurrency, fromCurrency, 1 / rate, locale)}
              </span>
            </div>

            {/* Daily Change (faqat UZS ga nisbatan) */}
            {fromCurrency !== 'UZS' && fromCurrencyData.diff !== 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Bugungi o'zgarish:</span>
                <span className={cn('flex items-center gap-1 font-semibold', trendColors[trend])}>
                  <span>{trendIcons[trend]}</span>
                  <span>
                    {formatNumber(Math.abs(fromCurrencyData.diff), 2, locale)} UZS (
                    {((fromCurrencyData.diff / fromCurrencyData.rate) * 100).toFixed(2)}%)
                  </span>
                </span>
              </div>
            )}

            {/* Last Update */}
            {lastUpdate && (
              <div className="flex items-center justify-between border-t border-zinc-200 pt-3 dark:border-zinc-700">
                <span className="text-xs text-zinc-500">Oxirgi yangilanish:</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-600 dark:text-zinc-400">
                    {formatRelativeTime(lastUpdate, locale)}
                  </span>
                  {onRefresh && (
                    <Button variant="ghost" size="icon" onClick={onRefresh} disabled={isLoading} className="h-6 w-6">
                      <RefreshCw className={cn('h-3 w-3', isLoading && 'animate-spin')} />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
