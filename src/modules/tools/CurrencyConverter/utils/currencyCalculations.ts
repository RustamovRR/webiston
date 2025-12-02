/**
 * Currency Calculation Utilities
 * Valyuta hisoblash funksiyalari
 */

/**
 * Valyutani konvertatsiya qilish
 * @param amount - Konvertatsiya qilinadigan miqdor
 * @param fromRate - Manba valyuta kursi (UZS ga nisbatan)
 * @param toRate - Maqsad valyuta kursi (UZS ga nisbatan)
 * @param fromNominal - Manba valyuta nominali (default: 1)
 * @param toNominal - Maqsad valyuta nominali (default: 1)
 * @returns Konvertatsiya natijasi
 */
export function convertCurrency(
  amount: number,
  fromRate: number,
  toRate: number,
  fromNominal: number = 1,
  toNominal: number = 1,
): number {
  if (amount === 0) return 0
  if (fromRate === 0 || toRate === 0) return 0

  // Agar ikkala valyuta ham bir xil bo'lsa
  if (fromRate === toRate && fromNominal === toNominal) {
    return amount
  }

  // Avval UZS ga o'tkazamiz
  const amountInUZS = amount * (fromRate / fromNominal)

  // Keyin maqsad valyutaga o'tkazamiz
  const result = amountInUZS / (toRate / toNominal)

  return result
}

/**
 * Cross-rate hisoblash (ikki valyuta orasidagi to'g'ridan-to'g'ri kurs)
 * @param fromRate - Manba valyuta kursi
 * @param toRate - Maqsad valyuta kursi
 * @returns Cross-rate
 */
export function calculateCrossRate(fromRate: number, toRate: number): number {
  if (fromRate === 0) return 0
  return toRate / fromRate
}

/**
 * Foiz o'zgarishini hisoblash
 * @param current - Joriy qiymat
 * @param previous - Oldingi qiymat
 * @returns Foiz o'zgarish
 */
export function calculatePercentChange(current: number, previous: number): number {
  if (previous === 0) return 0
  return ((current - previous) / previous) * 100
}

/**
 * Teskari kursni hisoblash
 * @param rate - Kurs
 * @returns Teskari kurs
 */
export function calculateInverseRate(rate: number): number {
  if (rate === 0) return 0
  return 1 / rate
}

/**
 * O'rtacha kursni hisoblash
 * @param rates - Kurslar massivi
 * @returns O'rtacha kurs
 */
export function calculateAverageRate(rates: number[]): number {
  if (rates.length === 0) return 0
  const sum = rates.reduce((acc, rate) => acc + rate, 0)
  return sum / rates.length
}

/**
 * Minimal va maksimal kurslarni topish
 * @param rates - Kurslar massivi
 * @returns { min, max }
 */
export function findMinMaxRates(rates: number[]): { min: number; max: number } {
  if (rates.length === 0) return { min: 0, max: 0 }

  return {
    min: Math.min(...rates),
    max: Math.max(...rates),
  }
}

/**
 * Kurs o'zgarish trendini aniqlash
 * @param current - Joriy kurs
 * @param previous - Oldingi kurs
 * @returns 'up' | 'down' | 'neutral'
 */
export function determineTrend(current: number, previous: number): 'up' | 'down' | 'neutral' {
  const diff = current - previous
  const threshold = 0.01 // 0.01% dan kam o'zgarish neutral hisoblanadi

  if (Math.abs(diff) < threshold) return 'neutral'
  return diff > 0 ? 'up' : 'down'
}

/**
 * Valyuta miqdorini yaxlitlash
 * @param amount - Miqdor
 * @param decimals - Kasr raqamlar soni (default: 2)
 * @returns Yaxlitlangan miqdor
 */
export function roundCurrency(amount: number, decimals: number = 2): number {
  const multiplier = Math.pow(10, decimals)
  return Math.round(amount * multiplier) / multiplier
}

/**
 * Katta sonlarni qisqartirish (1000000 → 1M)
 * @param num - Son
 * @returns Qisqartirilgan string
 */
export function compactNumber(num: number): string {
  if (num < 1000) return num.toFixed(2)
  if (num < 1000000) return (num / 1000).toFixed(1) + 'K'
  if (num < 1000000000) return (num / 1000000).toFixed(1) + 'M'
  return (num / 1000000000).toFixed(1) + 'B'
}
