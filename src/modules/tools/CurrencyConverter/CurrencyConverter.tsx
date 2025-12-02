'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { Loader2 } from 'lucide-react'

// Shared Components
import { ToolHeader } from '@/components/shared/ToolHeader'

// Local Components
import { ConverterPanel, QuickPairs, RateChart, InfoSection } from './components'

// Hooks
import { useCurrencyRates, useCurrencyConverter, useRateHistory } from './hooks'

export default function CurrencyConverter() {
  const t = useTranslations('CurrencyConverterPage')

  // Fetch currency rates
  const { rates, isLoading: ratesLoading, error, lastUpdate, refreshRates, getCurrencyByCode } = useCurrencyRates()

  // Converter logic
  const {
    amount,
    fromCurrency,
    toCurrency,
    result,
    rate,
    isValid,
    setAmount,
    setFromCurrency,
    setToCurrency,
    swapCurrencies,
    fromCurrencyData,
    toCurrencyData,
  } = useCurrencyConverter({
    rates,
    defaultFrom: 'USD',
    defaultTo: 'UZS',
    defaultAmount: 1,
  })

  // Historical data
  const {
    chartData,
    isLoading: historyLoading,
    timeRange,
    setTimeRange,
    stats,
  } = useRateHistory({
    currencyCode: fromCurrency,
    timeRange: '30d',
  })

  /**
   * Quick pair selection handler
   */
  const handleQuickPairSelect = (from: string, to: string) => {
    setFromCurrency(from)
    setToCurrency(to)
  }

  /**
   * Error state
   */
  if (error) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6">
        <ToolHeader title={t('ToolHeader.title')} description={t('ToolHeader.description')} />

        <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/30 dark:bg-red-900/10">
          <p className="text-red-800 dark:text-red-200">
            <strong>Xatolik:</strong> {error}
          </p>
          <button onClick={refreshRates} className="mt-4 rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600">
            Qayta urinish
          </button>
        </div>
      </div>
    )
  }

  /**
   * Loading state (initial)
   */
  if (ratesLoading && rates.length === 0) {
    return (
      <div className="mx-auto w-full max-w-7xl px-4 py-6">
        <ToolHeader title={t('ToolHeader.title')} description={t('ToolHeader.description')} />

        <div className="mt-6 flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-500" />
            <p className="mt-4 text-zinc-600 dark:text-zinc-400">Kurslar yuklanmoqda...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <ToolHeader title={t('ToolHeader.title')} description={t('ToolHeader.description')} />

      {/* Quick Pairs */}
      <div className="mt-6">
        <QuickPairs currencies={rates} onSelectPair={handleQuickPairSelect} />
      </div>

      {/* Main Converter */}
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Converter Panel */}
        <div className="lg:col-span-1">
          <ConverterPanel
            amount={amount}
            fromCurrency={fromCurrency}
            toCurrency={toCurrency}
            onAmountChange={setAmount}
            onFromCurrencyChange={setFromCurrency}
            onToCurrencyChange={setToCurrency}
            onSwap={swapCurrencies}
            result={result}
            rate={rate}
            isValid={isValid}
            currencies={rates}
            fromCurrencyData={fromCurrencyData}
            toCurrencyData={toCurrencyData}
            lastUpdate={lastUpdate}
            onRefresh={refreshRates}
            isLoading={ratesLoading}
          />
        </div>

        {/* Rate Chart */}
        <div className="lg:col-span-2">
          <RateChart
            data={chartData}
            currencyCode={fromCurrency}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
            isLoading={historyLoading}
            stats={stats}
          />
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-6">
        <InfoSection />
      </div>
    </div>
  )
}
