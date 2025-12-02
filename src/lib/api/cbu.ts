/**
 * O'zbekiston Markaziy Banki (CBU) API Client
 * Uses Next.js API routes to avoid CORS issues
 */

import type { CurrencyRate, HistoricalRate } from '@/modules/tools/CurrencyConverter/types'

// CBU API dan keladigan ma'lumot strukturasi
export interface CBURate {
  id: number
  Code: string
  Ccy: string
  CcyNm_UZ: string
  CcyNm_EN: string
  CcyNm_RU: string
  CcyNm_UZC?: string
  Nominal: string
  Rate: string
  Diff: string
  Date: string
}

/**
 * Joriy valyuta kurslarini olish
 * @returns CurrencyRate[] - Barcha valyutalar ro'yxati
 */
export async function fetchCurrentRates(): Promise<CurrencyRate[]> {
  try {
    // Use Next.js API route to avoid CORS
    const response = await fetch('/api/currency/rates', {
      cache: 'no-store', // Client-side da cache yo'q, server cache bor
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data: CBURate[] = await response.json()

    // UZS ni qo'shish (bazaviy valyuta)
    const rates: CurrencyRate[] = [
      {
        id: 0,
        code: 'UZS',
        name_uz: "O'zbekiston so'mi",
        name_en: 'Uzbekistan Sum',
        name_ru: 'Узбекский сум',
        rate: 1,
        nominal: 1,
        diff: 0,
        date: data[0]?.Date || new Date().toLocaleDateString('en-GB'),
      },
      ...data.map((item) => ({
        id: item.id,
        code: item.Ccy,
        name_uz: item.CcyNm_UZ,
        name_en: item.CcyNm_EN,
        name_ru: item.CcyNm_RU,
        rate: parseFloat(item.Rate),
        nominal: parseInt(item.Nominal),
        diff: parseFloat(item.Diff),
        date: item.Date,
      })),
    ]

    return rates
  } catch (error) {
    console.error('Error fetching current rates from CBU:', error)
    throw error
  }
}

/**
 * Tarixiy valyuta kurslarini olish
 * @param currencyCode - Valyuta kodi (USD, EUR, etc.)
 * @param startDate - Boshlanish sanasi (YYYY-MM-DD)
 * @param endDate - Tugash sanasi (optional, YYYY-MM-DD)
 * @returns HistoricalRate[] - Tarixiy kurslar
 */
export async function fetchHistoricalRates(
  currencyCode: string,
  startDate: string,
  endDate?: string,
): Promise<HistoricalRate[]> {
  try {
    // UZS uchun maxsus holat (har doim 1)
    if (currencyCode === 'UZS') {
      return [
        {
          date: startDate,
          rate: 1,
        },
      ]
    }

    // Build query params
    const params = new URLSearchParams({
      code: currencyCode,
      startDate,
    })

    if (endDate) {
      params.append('endDate', endDate)
    }

    // Use Next.js API route to avoid CORS
    const response = await fetch(`/api/currency/history?${params.toString()}`, {
      cache: 'no-store', // Client-side da cache yo'q, server cache bor
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data: CBURate[] = await response.json()

    return data.map((item) => ({
      date: item.Date,
      rate: parseFloat(item.Rate) / parseInt(item.Nominal),
    }))
  } catch (error) {
    console.error('Error fetching historical rates from CBU:', error)
    throw error
  }
}

/**
 * Barcha valyutalarning tarixiy kurslarini olish
 * @param date - Sana (YYYY-MM-DD)
 * @returns CurrencyRate[] - O'sha kundagi barcha kurslar
 */
export async function fetchRatesByDate(date: string): Promise<CurrencyRate[]> {
  try {
    // Note: This endpoint is not commonly used, so we keep direct fetch
    // If CORS issues occur, create a separate API route
    const url = `https://cbu.uz/uz/arkhiv-kursov-valyut/json/all/${date}/`

    const response = await fetch(url, {
      next: { revalidate: 86400 }, // 24 soat cache
    })

    if (!response.ok) {
      throw new Error(`CBU API error: ${response.status}`)
    }

    const data: CBURate[] = await response.json()

    return data.map((item) => ({
      id: item.id,
      code: item.Ccy,
      name_uz: item.CcyNm_UZ,
      name_en: item.CcyNm_EN,
      name_ru: item.CcyNm_RU,
      rate: parseFloat(item.Rate),
      nominal: parseInt(item.Nominal),
      diff: parseFloat(item.Diff),
      date: item.Date,
    }))
  } catch (error) {
    console.error('Error fetching rates by date from CBU:', error)
    throw error
  }
}

/**
 * Sanani CBU formatiga o'tkazish (DD.MM.YYYY → YYYY-MM-DD)
 * @param cbuDate - CBU sanasi (DD.MM.YYYY)
 * @returns ISO sana (YYYY-MM-DD)
 */
export function parseCBUDate(cbuDate: string): string {
  const [day, month, year] = cbuDate.split('.')
  return `${year}-${month}-${day}`
}

/**
 * ISO sanani CBU formatiga o'tkazish (YYYY-MM-DD → DD.MM.YYYY)
 * @param isoDate - ISO sana (YYYY-MM-DD)
 * @returns CBU sanasi (DD.MM.YYYY)
 */
export function formatCBUDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-')
  return `${day}.${month}.${year}`
}
