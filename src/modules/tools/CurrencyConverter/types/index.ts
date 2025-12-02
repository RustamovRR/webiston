// Currency Converter Types

export interface CurrencyRate {
  id: number
  code: string // "USD", "EUR", "RUB"
  name_uz: string // "AQSH dollari"
  name_en: string // "US Dollar"
  name_ru: string // "Доллар США"
  rate: number // 11895.57 (UZS ga nisbatan)
  nominal: number // 1 (ba'zi valyutalar 10)
  diff: number // -45.38 (kunlik o'zgarish)
  date: string // "02.12.2025"
}

export interface HistoricalRate {
  date: string
  rate: number
}

export interface CurrencyPair {
  from: string
  to: string
  rate: number
  inverseRate: number
}

export interface RateAlert {
  id: string
  currencyCode: string
  targetRate: number
  condition: 'above' | 'below'
  isActive: boolean
  createdAt: string
}

export interface ConversionResult {
  amount: number
  fromCurrency: string
  toCurrency: string
  result: number
  rate: number
  timestamp: string
}

export interface PopularPair {
  from: string
  to: string
  label_uz: string
  label_en: string
  label_ru: string
  icon?: string
}

export type TimeRange = '7d' | '30d' | '90d' | '1y'

export interface ChartDataPoint {
  date: string
  rate: number
  formattedDate: string
}
