import type { PopularPair } from '../types'

// O'zbekiston uchun eng mashhur valyuta juftliklari
export const POPULAR_PAIRS: PopularPair[] = [
  {
    from: 'USD',
    to: 'UZS',
    label_uz: "Dollar → So'm",
    label_en: 'Dollar → Sum',
    label_ru: 'Доллар → Сум',
    icon: '🇺🇸',
  },
  {
    from: 'RUB',
    to: 'UZS',
    label_uz: "Rubl → So'm",
    label_en: 'Ruble → Sum',
    label_ru: 'Рубль → Сум',
    icon: '🇷🇺',
  },
  {
    from: 'EUR',
    to: 'UZS',
    label_uz: "Yevro → So'm",
    label_en: 'Euro → Sum',
    label_ru: 'Евро → Сум',
    icon: '🇪🇺',
  },
  {
    from: 'KZT',
    to: 'UZS',
    label_uz: "Tenge → So'm",
    label_en: 'Tenge → Sum',
    label_ru: 'Тенге → Сум',
    icon: '🇰🇿',
  },
  {
    from: 'TRY',
    to: 'UZS',
    label_uz: "Lira → So'm",
    label_en: 'Lira → Sum',
    label_ru: 'Лира → Сум',
    icon: '🇹🇷',
  },
  {
    from: 'GBP',
    to: 'UZS',
    label_uz: "Funt → So'm",
    label_en: 'Pound → Sum',
    label_ru: 'Фунт → Сум',
    icon: '🇬🇧',
  },
]

// Valyuta bayroqlari mapping
export const CURRENCY_FLAGS: Record<string, string> = {
  USD: '🇺🇸',
  EUR: '🇪🇺',
  RUB: '🇷🇺',
  GBP: '🇬🇧',
  JPY: '🇯🇵',
  CNY: '🇨🇳',
  KZT: '🇰🇿',
  TRY: '🇹🇷',
  AED: '🇦🇪',
  SAR: '🇸🇦',
  INR: '🇮🇳',
  KRW: '🇰🇷',
  CHF: '🇨🇭',
  CAD: '🇨🇦',
  AUD: '🇦🇺',
  BRL: '🇧🇷',
  MXN: '🇲🇽',
  ZAR: '🇿🇦',
  SGD: '🇸🇬',
  THB: '🇹🇭',
  UZS: '🇺🇿',
  AZN: '🇦🇿',
  GEL: '🇬🇪',
  AMD: '🇦🇲',
  KGS: '🇰🇬',
  TJS: '🇹🇯',
  TMT: '🇹🇲',
  BYN: '🇧🇾',
  UAH: '🇺🇦',
  PLN: '🇵🇱',
  CZK: '🇨🇿',
  HUF: '🇭🇺',
  RON: '🇷🇴',
  BGN: '🇧🇬',
  HRK: '🇭🇷',
  RSD: '🇷🇸',
  NOK: '🇳🇴',
  SEK: '🇸🇪',
  DKK: '🇩🇰',
  ISK: '🇮🇸',
}

// Valyuta kategoriyalari
export const CURRENCY_CATEGORIES = {
  popular: ['USD', 'EUR', 'RUB', 'GBP', 'JPY', 'CNY'],
  cis: ['KZT', 'KGS', 'TJS', 'TMT', 'AZN', 'GEL', 'AMD', 'BYN', 'UAH'],
  asian: ['CNY', 'JPY', 'KRW', 'INR', 'THB', 'SGD', 'MYR', 'IDR', 'PHP', 'VND'],
  european: ['EUR', 'GBP', 'CHF', 'PLN', 'CZK', 'HUF', 'RON', 'BGN', 'NOK', 'SEK', 'DKK'],
  american: ['USD', 'CAD', 'MXN', 'BRL', 'ARS', 'CLP'],
  middle_east: ['AED', 'SAR', 'QAR', 'KWD', 'BHD', 'OMR', 'JOD', 'ILS'],
  african: ['ZAR', 'EGP', 'NGN', 'KES'],
  oceania: ['AUD', 'NZD'],
}

// Valyuta nomlari (fallback agar API dan kelmasa)
export const CURRENCY_NAMES: Record<string, { uz: string; en: string; ru: string }> = {
  UZS: {
    uz: "O'zbekiston so'mi",
    en: 'Uzbekistan Sum',
    ru: 'Узбекский сум',
  },
  USD: {
    uz: 'AQSH dollari',
    en: 'US Dollar',
    ru: 'Доллар США',
  },
  EUR: {
    uz: 'Yevro',
    en: 'Euro',
    ru: 'Евро',
  },
  RUB: {
    uz: 'Rossiya rubli',
    en: 'Russian Ruble',
    ru: 'Российский рубль',
  },
  GBP: {
    uz: 'Angliya funt sterlingi',
    en: 'British Pound Sterling',
    ru: 'Фунт стерлингов',
  },
  JPY: {
    uz: 'Yaponiya iyenasi',
    en: 'Japanese Yen',
    ru: 'Японская иена',
  },
  CNY: {
    uz: 'Xitoy yuani',
    en: 'Chinese Yuan',
    ru: 'Китайский юань',
  },
  KZT: {
    uz: "Qozog'iston tengesi",
    en: 'Kazakhstani Tenge',
    ru: 'Казахстанский тенге',
  },
  TRY: {
    uz: 'Turkiya lirasi',
    en: 'Turkish Lira',
    ru: 'Турецкая лира',
  },
}
