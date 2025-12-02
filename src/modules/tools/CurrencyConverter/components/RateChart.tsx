'use client'

import React from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { cn } from '@/lib'
import { formatNumber } from '../utils/currencyFormatters'
import type { ChartDataPoint, TimeRange } from '../types'

interface RateChartProps {
  data: ChartDataPoint[]
  currencyCode: string
  timeRange: TimeRange
  onTimeRangeChange: (range: TimeRange) => void
  isLoading?: boolean
  stats?: {
    min: number
    max: number
    average: number
    change: number
    changePercent: number
  }
  locale?: string
}

const TIME_RANGES: { value: TimeRange; label: string }[] = [
  { value: '7d', label: '7 kun' },
  { value: '30d', label: '30 kun' },
  { value: '90d', label: '90 kun' },
  { value: '1y', label: '1 yil' },
]

export function RateChart({
  data,
  currencyCode,
  timeRange,
  onTimeRangeChange,
  isLoading = false,
  stats,
  locale = 'uz',
}: RateChartProps) {
  /**
   * Custom Tooltip
   */
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null

    const data = payload[0].payload
    return (
      <div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
        <p className="text-sm font-medium text-zinc-900 dark:text-white">{data.formattedDate}</p>
        <p className="mt-1 text-lg font-bold text-blue-500">
          {formatNumber(data.rate, 2, locale)} <span className="text-sm font-normal">UZS</span>
        </p>
      </div>
    )
  }

  /**
   * Trend aniqlash
   */
  const trend = stats && stats.changePercent > 0 ? 'up' : stats && stats.changePercent < 0 ? 'down' : 'neutral'

  const trendColors = {
    up: 'text-green-500',
    down: 'text-red-500',
    neutral: 'text-zinc-400',
  }

  const trendIcons = {
    up: <TrendingUp className="h-5 w-5" />,
    down: <TrendingDown className="h-5 w-5" />,
    neutral: <Activity className="h-5 w-5" />,
  }

  return (
    <Card className="border-zinc-200 bg-white/80 p-6 backdrop-blur-sm dark:border-zinc-800/30 dark:bg-zinc-900/60">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-white">Kurs tarixi</h3>
            <p className="text-sm text-zinc-500">
              {currencyCode} / UZS - {TIME_RANGES.find((r) => r.value === timeRange)?.label}
            </p>
          </div>

          {/* Time Range Selector */}
          <div className="flex gap-2">
            {TIME_RANGES.map((range) => (
              <Button
                key={range.value}
                variant={timeRange === range.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => onTimeRangeChange(range.value)}
                disabled={isLoading}
              >
                {range.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {/* Change */}
            <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800/50">
              <div className="flex items-center gap-2">
                <div className={cn(trendColors[trend])}>{trendIcons[trend]}</div>
                <span className="text-xs text-zinc-600 dark:text-zinc-400">O'zgarish</span>
              </div>
              <div className={cn('mt-1 text-lg font-bold', trendColors[trend])}>
                {stats.changePercent > 0 && '+'}
                {stats.changePercent.toFixed(2)}%
              </div>
            </div>

            {/* Min */}
            <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800/50">
              <span className="text-xs text-zinc-600 dark:text-zinc-400">Eng past</span>
              <div className="mt-1 text-lg font-bold text-zinc-900 dark:text-white">
                {formatNumber(stats.min, 2, locale)}
              </div>
            </div>

            {/* Max */}
            <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800/50">
              <span className="text-xs text-zinc-600 dark:text-zinc-400">Eng yuqori</span>
              <div className="mt-1 text-lg font-bold text-zinc-900 dark:text-white">
                {formatNumber(stats.max, 2, locale)}
              </div>
            </div>

            {/* Average */}
            <div className="rounded-lg bg-zinc-100 p-3 dark:bg-zinc-800/50">
              <span className="text-xs text-zinc-600 dark:text-zinc-400">O'rtacha</span>
              <div className="mt-1 text-lg font-bold text-zinc-900 dark:text-white">
                {formatNumber(stats.average, 2, locale)}
              </div>
            </div>
          </div>
        )}

        {/* Chart */}
        <div className="h-[300px] w-full">
          {isLoading ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                <p className="mt-2 text-sm text-zinc-500">Yuklanmoqda...</p>
              </div>
            </div>
          ) : data.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-zinc-500">Ma'lumot yo'q</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-zinc-700" />
                <XAxis
                  dataKey="formattedDate"
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="#9ca3af"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => formatNumber(value, 0, locale)}
                  domain={['dataMin - 100', 'dataMax + 100']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="rate"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fill="url(#colorRate)"
                  animationDuration={500}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </Card>
  )
}
