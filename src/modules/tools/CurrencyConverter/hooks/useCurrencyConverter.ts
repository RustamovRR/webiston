'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { useDebounceValue } from 'usehooks-ts'
import type { CurrencyRate, ConversionResult } from '../types'
import { convertCurrency, calculateCrossRate } from '../utils/currencyCalculations'
import { parseNumberInput, sanitizeNumberInput } from '../utils/currencyFormatters'

interface UseCurrencyConverterProps {
  rates: CurrencyRate[]
  defaultFrom?: string
  defaultTo?: string
  defaultAmount?: number
}

interface UseCurrencyConverterResult {
  // Input states
  amount: string
  fromCurrency: string
  toCurrency: string

  // Computed values
  result: number
  rate: number
  inverseRate: number
  isValid: boolean

  // Actions
  setAmount: (amount: string) => void
  setFromCurrency: (code: string) => void
  setToCurrency: (code: string) => void
  swapCurrencies: () => void
  clear: () => void

  // Currency data
  fromCurrencyData: CurrencyRate | undefined
  toCurrencyData: CurrencyRate | undefined

  // Conversion result
  conversionResult: ConversionResult | null
}

/**
 * Valyuta konvertatsiya logikasi
 */
export function useCurrencyConverter({
  rates,
  defaultFrom = 'USD',
  defaultTo = 'UZS',
  defaultAmount = 1,
}: UseCurrencyConverterProps): UseCurrencyConverterResult {
  // Input states
  const [amount, setAmountState] = useState<string>(defaultAmount.toString())
  const [fromCurrency, setFromCurrency] = useState<string>(defaultFrom)
  const [toCurrency, setToCurrency] = useState<string>(defaultTo)

  // Debounce amount input
  const [debouncedAmount] = useDebounceValue(amount, 300)

  /**
   * Valyuta ma'lumotlarini topish
   */
  const fromCurrencyData = useMemo(() => {
    return rates.find((rate) => rate.code === fromCurrency)
  }, [rates, fromCurrency])

  const toCurrencyData = useMemo(() => {
    return rates.find((rate) => rate.code === toCurrency)
  }, [rates, toCurrency])

  /**
   * Amount ni parse qilish
   */
  const parsedAmount = useMemo(() => {
    return parseNumberInput(debouncedAmount)
  }, [debouncedAmount])

  /**
   * Validatsiya
   */
  const isValid = useMemo(() => {
    return (
      parsedAmount > 0 && fromCurrencyData !== undefined && toCurrencyData !== undefined && fromCurrency !== toCurrency
    )
  }, [parsedAmount, fromCurrencyData, toCurrencyData, fromCurrency, toCurrency])

  /**
   * Konvertatsiya natijasi
   */
  const result = useMemo(() => {
    if (!isValid || !fromCurrencyData || !toCurrencyData) return 0

    return convertCurrency(
      parsedAmount,
      fromCurrencyData.rate,
      toCurrencyData.rate,
      fromCurrencyData.nominal,
      toCurrencyData.nominal,
    )
  }, [isValid, parsedAmount, fromCurrencyData, toCurrencyData])

  /**
   * Kurs (1 from = X to)
   */
  const rate = useMemo(() => {
    if (!fromCurrencyData || !toCurrencyData) return 0

    return calculateCrossRate(
      fromCurrencyData.rate / fromCurrencyData.nominal,
      toCurrencyData.rate / toCurrencyData.nominal,
    )
  }, [fromCurrencyData, toCurrencyData])

  /**
   * Teskari kurs (1 to = X from)
   */
  const inverseRate = useMemo(() => {
    if (rate === 0) return 0
    return 1 / rate
  }, [rate])

  /**
   * Konvertatsiya natijasi obyekti
   */
  const conversionResult = useMemo((): ConversionResult | null => {
    if (!isValid) return null

    return {
      amount: parsedAmount,
      fromCurrency,
      toCurrency,
      result,
      rate,
      timestamp: new Date().toISOString(),
    }
  }, [isValid, parsedAmount, fromCurrency, toCurrency, result, rate])

  /**
   * Amount o'zgartirish (sanitize bilan)
   */
  const setAmount = useCallback((value: string) => {
    const sanitized = sanitizeNumberInput(value)
    setAmountState(sanitized)
  }, [])

  /**
   * Valyutalarni almashtirish
   */
  const swapCurrencies = useCallback(() => {
    setFromCurrency(toCurrency)
    setToCurrency(fromCurrency)

    // Agar natija bor bo'lsa, uni yangi amount qilib qo'yamiz
    if (result > 0) {
      setAmountState(result.toFixed(2))
    }
  }, [fromCurrency, toCurrency, result])

  /**
   * Tozalash
   */
  const clear = useCallback(() => {
    setAmountState('1')
  }, [])

  /**
   * Agar tanlangan valyutalar bir xil bo'lsa, avtomatik o'zgartirish
   */
  useEffect(() => {
    if (fromCurrency === toCurrency) {
      // Agar USD → USD bo'lsa, UZS ga o'tkazamiz
      if (toCurrency === 'USD') {
        setToCurrency('UZS')
      } else {
        setToCurrency('USD')
      }
    }
  }, [fromCurrency, toCurrency])

  return {
    // Input states
    amount,
    fromCurrency,
    toCurrency,

    // Computed values
    result,
    rate,
    inverseRate,
    isValid,

    // Actions
    setAmount,
    setFromCurrency,
    setToCurrency,
    swapCurrencies,
    clear,

    // Currency data
    fromCurrencyData,
    toCurrencyData,

    // Conversion result
    conversionResult,
  }
}
