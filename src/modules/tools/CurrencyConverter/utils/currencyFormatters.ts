/**
 * Currency Formatting Utilities
 * Valyuta formatlash funksiyalari
 */

/**
 * Valyutani formatlash
 * @param amount - Miqdor
 * @param currencyCode - Valyuta kodi (USD, EUR, UZS, etc.)
 * @param locale - Til kodi (uz-UZ, en-US, ru-RU)
 * @returns Formatlangan string
 */
export function formatCurrency(amount: number, currencyCode: string, locale: string = 'uz-UZ'): string {
  try {
    // UZS uchun maxsus formatlash (so'm belgisi bilan)
    if (currencyCode === 'UZS') {
      return (
        new Intl.NumberFormat(locale, {
          style: 'decimal',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(amount) + " so'm"
      )
    }

    // Boshqa valyutalar uchun standart formatlash
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch (error) {
    // Agar valyuta kodi noto'g'ri bo'lsa, oddiy formatlash
    return `${formatNumber(amount, 2)} ${currencyCode}`
  }
}

/**
 * Sonni formatlash (vergul bilan)
 * @param num - Son
 * @param decimals - Kasr raqamlar soni (default: 2)
 * @param locale - Til kodi
 * @returns Formatlangan string
 */
export function formatNumber(num: number, decimals: number = 2, locale: string = 'uz-UZ'): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num)
}

/**
 * Katta sonlarni qisqartirish (1,000,000 → 1M)
 * @param num - Son
 * @param locale - Til kodi
 * @returns Qisqartirilgan string
 */
export function formatCompactNumber(num: number, locale: string = 'uz-UZ'): string {
  return new Intl.NumberFormat(locale, {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1,
  }).format(num)
}

/**
 * Foizni formatlash
 * @param percent - Foiz qiymati
 * @param decimals - Kasr raqamlar soni (default: 2)
 * @param showSign - + yoki - belgisini ko'rsatish (default: true)
 * @returns Formatlangan string
 */
export function formatPercent(percent: number, decimals: number = 2, showSign: boolean = true): string {
  const sign = showSign && percent > 0 ? '+' : ''
  return `${sign}${percent.toFixed(decimals)}%`
}

/**
 * Kursni formatlash (1 USD = 11,895.57 UZS)
 * @param fromCurrency - Manba valyuta
 * @param toCurrency - Maqsad valyuta
 * @param rate - Kurs
 * @param locale - Til kodi
 * @returns Formatlangan string
 */
export function formatRate(fromCurrency: string, toCurrency: string, rate: number, locale: string = 'uz-UZ'): string {
  const formattedRate = formatNumber(rate, 2, locale)
  return `1 ${fromCurrency} = ${formattedRate} ${toCurrency}`
}

/**
 * Sanani formatlash
 * @param date - Sana (string yoki Date)
 * @param locale - Til kodi
 * @param format - Format turi ('short' | 'medium' | 'long')
 * @returns Formatlangan sana
 */
export function formatDate(
  date: string | Date,
  locale: string = 'uz-UZ',
  format: 'short' | 'medium' | 'long' = 'medium',
): string {
  let dateObj: Date

  if (typeof date === 'string') {
    // CBU format: "02.12.2025" (DD.MM.YYYY) → "2025-12-02" (YYYY-MM-DD)
    if (date.includes('.')) {
      const [day, month, year] = date.split('.')
      dateObj = new Date(`${year}-${month}-${day}`)
    } else {
      dateObj = new Date(date)
    }
  } else {
    dateObj = date
  }

  const optionsMap: Record<string, Intl.DateTimeFormatOptions> = {
    short: { day: '2-digit', month: '2-digit', year: 'numeric' },
    medium: { day: '2-digit', month: 'short', year: 'numeric' },
    long: { day: '2-digit', month: 'long', year: 'numeric' },
  }

  return new Intl.DateTimeFormat(locale, optionsMap[format]).format(dateObj)
}

/**
 * Vaqtni formatlash
 * @param date - Sana (string yoki Date)
 * @param locale - Til kodi
 * @returns Formatlangan vaqt
 */
export function formatTime(date: string | Date, locale: string = 'uz-UZ'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj)
}

/**
 * Sana va vaqtni formatlash
 * @param date - Sana (string yoki Date)
 * @param locale - Til kodi
 * @returns Formatlangan sana va vaqt
 */
export function formatDateTime(date: string | Date, locale: string = 'uz-UZ'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date

  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj)
}

/**
 * Nisbiy vaqtni formatlash (2 soat oldin, 3 kun oldin)
 * @param date - Sana (string yoki Date)
 * @param locale - Til kodi
 * @returns Nisbiy vaqt
 */
export function formatRelativeTime(date: string | Date, locale: string = 'uz-UZ'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })

  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, 'second')
  } else if (diffInSeconds < 3600) {
    return rtf.format(-Math.floor(diffInSeconds / 60), 'minute')
  } else if (diffInSeconds < 86400) {
    return rtf.format(-Math.floor(diffInSeconds / 3600), 'hour')
  } else if (diffInSeconds < 2592000) {
    return rtf.format(-Math.floor(diffInSeconds / 86400), 'day')
  } else if (diffInSeconds < 31536000) {
    return rtf.format(-Math.floor(diffInSeconds / 2592000), 'month')
  } else {
    return rtf.format(-Math.floor(diffInSeconds / 31536000), 'year')
  }
}

/**
 * Input qiymatini tozalash (faqat raqamlar va nuqta)
 * @param value - Input qiymati
 * @returns Tozalangan qiymat
 */
export function sanitizeNumberInput(value: string): string {
  // Faqat raqamlar, nuqta va vergulni qoldirish
  let cleaned = value.replace(/[^\d.,]/g, '')

  // Vergulni nuqtaga almashtirish
  cleaned = cleaned.replace(/,/g, '.')

  // Faqat birinchi nuqtani qoldirish
  const parts = cleaned.split('.')
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('')
  }

  return cleaned
}

/**
 * Sonni parse qilish (string → number)
 * @param value - String qiymat
 * @returns Number yoki 0
 */
export function parseNumberInput(value: string): number {
  const cleaned = sanitizeNumberInput(value)
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}
