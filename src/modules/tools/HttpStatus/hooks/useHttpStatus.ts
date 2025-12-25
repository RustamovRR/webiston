'use client'

import { useState, useMemo, useCallback } from 'react'

export interface HttpStatusCode {
  code: number
  title: string
  description: string
  category: 'informational' | 'success' | 'redirection' | 'client-error' | 'server-error'
  rfc?: string
  example?: string
  usage?: string
  color: string
}

const HTTP_STATUS_CODES: HttpStatusCode[] = [
  // 1xx Informational
  {
    code: 100,
    title: 'Continue',
    description: "Server so'rovni qabul qildi va mijoz davom etishi mumkin",
    category: 'informational',
    rfc: 'RFC 9110',
    example: "POST so'rovlarda ishlatiladi",
    usage: "Mijoz so'rovni davom ettirish uchun kutishi kerak",
    color: 'bg-blue-500',
  },
  {
    code: 101,
    title: 'Switching Protocols',
    description: "Server protokolni o'zgartirishga rozi bo'ldi",
    category: 'informational',
    rfc: 'RFC 9110',
    example: "WebSocket'ga o'tishda ishlatiladi",
    usage: "Protocol upgrade so'rovlarida",
    color: 'bg-blue-500',
  },
  {
    code: 102,
    title: 'Processing',
    description: "Server so'rovni qayta ishlayapti, ammo hali javob tayyor emas",
    category: 'informational',
    rfc: 'RFC 2518',
    example: 'WebDAV operatsiyalarida ishlatiladi',
    usage: 'Uzoq vaqt talab qiladigan operatsiyalar uchun',
    color: 'bg-blue-500',
  },
  {
    code: 103,
    title: 'Early Hints',
    description: "Serverdan dastlabki ma'lumotlar yuborilmoqda",
    category: 'informational',
    rfc: 'RFC 8297',
    example: 'Link preload uchun ishlatiladi',
    usage: 'Performance optimizatsiya uchun',
    color: 'bg-blue-500',
  },

  // 2xx Success
  {
    code: 200,
    title: 'OK',
    description: "So'rov muvaffaqiyatli bajarildi",
    category: 'success',
    rfc: 'RFC 9110',
    example: "GET, POST so'rovlar uchun standart javob",
    usage: "Eng keng qo'llaniladigan muvaffaqiyat kodi",
    color: 'bg-green-500',
  },
  {
    code: 201,
    title: 'Created',
    description: 'Yangi resurs muvaffaqiyatli yaratildi',
    category: 'success',
    rfc: 'RFC 9110',
    example: "POST so'rov bilan yangi user yaratilganda",
    usage: "POST so'rovlar natijasida yangi resurs yaratilganda",
    color: 'bg-green-500',
  },
  {
    code: 202,
    title: 'Accepted',
    description: "So'rov qabul qilindi, lekin hali qayta ishlanmagan",
    category: 'success',
    rfc: 'RFC 9110',
    example: 'Asinxron operatsiyalar uchun',
    usage: "Background task'lar uchun",
    color: 'bg-green-500',
  },
  {
    code: 204,
    title: 'No Content',
    description: "So'rov muvaffaqiyatli, lekin qaytarilayotgan kontent yo'q",
    category: 'success',
    rfc: 'RFC 9110',
    example: 'DELETE operatsiyasida ishlatiladi',
    usage: "O'chirish yoki yangilash operatsiyalarida",
    color: 'bg-green-500',
  },

  // 3xx Redirection
  {
    code: 300,
    title: 'Multiple Choices',
    description: 'Bir nechta variant mavjud, mijoz tanlashi kerak',
    category: 'redirection',
    rfc: 'RFC 9110',
    example: "Turli format'larda fayl mavjud bo'lganda",
    usage: 'Content negotiation uchun',
    color: 'bg-yellow-500',
  },
  {
    code: 301,
    title: 'Moved Permanently',
    description: "Resurs doimiy ravishda yangi joyga ko'chirilgan",
    category: 'redirection',
    rfc: 'RFC 9110',
    example: "SEO uchun URL o'zgartirish",
    usage: 'Permanent redirect uchun',
    color: 'bg-yellow-500',
  },
  {
    code: 302,
    title: 'Found',
    description: 'Resurs vaqtincha boshqa joyda topildi',
    category: 'redirection',
    rfc: 'RFC 9110',
    example: "Login sahifasiga yo'naltirish",
    usage: 'Temporary redirect uchun',
    color: 'bg-yellow-500',
  },
  {
    code: 304,
    title: 'Not Modified',
    description: "Resurs o'zgartirilmagan, cache'dan foydalanish mumkin",
    category: 'redirection',
    rfc: 'RFC 9110',
    example: "Browser cache'da mavjud fayl uchun",
    usage: 'Caching optimization uchun',
    color: 'bg-yellow-500',
  },
  {
    code: 307,
    title: 'Temporary Redirect',
    description: "Vaqtincha redirect, method o'zgartirilmaydi",
    category: 'redirection',
    rfc: 'RFC 9110',
    example: "Maintenance sahifasiga yo'naltirish",
    usage: "302 ga o'xshash, lekin method saqlanadi",
    color: 'bg-yellow-500',
  },
  {
    code: 308,
    title: 'Permanent Redirect',
    description: "Doimiy redirect, method o'zgartirilmaydi",
    category: 'redirection',
    rfc: 'RFC 9110',
    example: "HTTPS ga majburiy o'tish",
    usage: "301 ga o'xshash, lekin method saqlanadi",
    color: 'bg-yellow-500',
  },

  // 4xx Client Error
  {
    code: 400,
    title: 'Bad Request',
    description: "Noto'g'ri so'rov yuborildi",
    category: 'client-error',
    rfc: 'RFC 9110',
    example: "Noto'g'ri JSON format",
    usage: "Mijoz tomonidan xato so'rov",
    color: 'bg-red-500',
  },
  {
    code: 401,
    title: 'Unauthorized',
    description: 'Autentifikatsiya talab qilinadi',
    category: 'client-error',
    rfc: 'RFC 9110',
    example: 'Login qilmagan foydalanuvchi',
    usage: "Noto'g'ri login yoki parol",
    color: 'bg-red-500',
  },
  {
    code: 403,
    title: 'Forbidden',
    description: 'Resurse kirish taqiqlangan',
    category: 'client-error',
    rfc: 'RFC 9110',
    example: 'Admin sahifasiga oddiy user kirishga urinishi',
    usage: "Ruxsat yo'q, lekin autentifikatsiya bor",
    color: 'bg-red-500',
  },
  {
    code: 404,
    title: 'Not Found',
    description: 'Resurs topilmadi',
    category: 'client-error',
    rfc: 'RFC 9110',
    example: "Mavjud bo'lmagan sahifa",
    usage: 'Eng mashhur error kod',
    color: 'bg-red-500',
  },
  {
    code: 405,
    title: 'Method Not Allowed',
    description: 'HTTP method ruxsat etilmagan',
    category: 'client-error',
    rfc: 'RFC 9110',
    example: "GET faqat endpoint'ga POST yuborish",
    usage: "Noto'g'ri HTTP method ishlatilganda",
    color: 'bg-red-500',
  },
  {
    code: 409,
    title: 'Conflict',
    description: "So'rov hozirgi resurs holati bilan ziddiyatda",
    category: 'client-error',
    rfc: 'RFC 9110',
    example: 'Bir xil email bilan ikkinchi user yaratish',
    usage: 'Data conflict yuzaga kelganda',
    color: 'bg-red-500',
  },
  {
    code: 410,
    title: 'Gone',
    description: "Resurs o'chirilgan va qaytib kelmaydi",
    category: 'client-error',
    rfc: 'RFC 9110',
    example: "O'chirilgan blog post",
    usage: "404 ga o'xshash, lekin intentional deletion",
    color: 'bg-red-500',
  },
  {
    code: 418,
    title: "I'm a teapot",
    description: 'Men choynak, qahva tayyorlay olmayman',
    category: 'client-error',
    rfc: 'RFC 2324',
    example: "April Fool's joke",
    usage: 'HTCPCP protokoli uchun',
    color: 'bg-red-500',
  },
  {
    code: 422,
    title: 'Unprocessable Entity',
    description: "Syntax to'g'ri, lekin semantic xato",
    category: 'client-error',
    rfc: 'RFC 9110',
    example: 'Validation error',
    usage: "Form validation muvaffaqiyatsiz bo'lganda",
    color: 'bg-red-500',
  },
  {
    code: 429,
    title: 'Too Many Requests',
    description: "Juda ko'p so'rov yuborildi",
    category: 'client-error',
    rfc: 'RFC 6585',
    example: 'Rate limiting ishga tushdi',
    usage: 'API rate limit oshib ketganda',
    color: 'bg-red-500',
  },

  // 5xx Server Error
  {
    code: 500,
    title: 'Internal Server Error',
    description: 'Serverda ichki xato yuz berdi',
    category: 'server-error',
    rfc: 'RFC 9110',
    example: 'PHP fatal error',
    usage: 'Server kodi ishlamay qolganda',
    color: 'bg-purple-500',
  },
  {
    code: 501,
    title: 'Not Implemented',
    description: "Server bu method'ni qo'llab-quvvatlamaydi",
    category: 'server-error',
    rfc: 'RFC 9110',
    example: "PATCH method qo'llab-quvvatlanmaydi",
    usage: 'Feature hali implement qilinmagan',
    color: 'bg-purple-500',
  },
  {
    code: 502,
    title: 'Bad Gateway',
    description: "Gateway yoki proxy serverdan noto'g'ri javob oldi",
    category: 'server-error',
    rfc: 'RFC 9110',
    example: 'Nginx backend serverga ulana olmadi',
    usage: 'Proxy server xatolari',
    color: 'bg-purple-500',
  },
  {
    code: 503,
    title: 'Service Unavailable',
    description: 'Server vaqtincha mavjud emas',
    category: 'server-error',
    rfc: 'RFC 9110',
    example: 'Maintenance mode',
    usage: 'Overload yoki maintenance',
    color: 'bg-purple-500',
  },
  {
    code: 504,
    title: 'Gateway Timeout',
    description: 'Gateway timeout yuz berdi',
    category: 'server-error',
    rfc: 'RFC 9110',
    example: 'Upstream server juda sekin javob berdi',
    usage: 'Timeout xatolari',
    color: 'bg-purple-500',
  },
]

export const useHttpStatus = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedStatus, setSelectedStatus] = useState<HttpStatusCode | null>(null)

  const categories = [
    { value: 'all', label: 'Barcha kategoriyalar', color: 'bg-gray-500' },
    { value: 'informational', label: "1xx - Ma'lumot", color: 'bg-blue-500' },
    { value: 'success', label: '2xx - Muvaffaqiyat', color: 'bg-green-500' },
    { value: 'redirection', label: "3xx - Yo'naltirish", color: 'bg-yellow-500' },
    { value: 'client-error', label: '4xx - Mijoz xatosi', color: 'bg-red-500' },
    { value: 'server-error', label: '5xx - Server xatosi', color: 'bg-purple-500' },
  ]

  const filteredCodes = useMemo(() => {
    let filtered = HTTP_STATUS_CODES

    if (selectedCategory !== 'all') {
      filtered = filtered.filter((code) => code.category === selectedCategory)
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (code) =>
          code.code.toString().includes(term) ||
          code.title.toLowerCase().includes(term) ||
          code.description.toLowerCase().includes(term)
      )
    }

    return filtered
  }, [searchTerm, selectedCategory])

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term)
  }, [])

  const handleCategoryFilter = useCallback((category: string) => {
    setSelectedCategory(category)
  }, [])

  const selectStatus = useCallback((status: HttpStatusCode) => {
    setSelectedStatus(status)
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedStatus(null)
  }, [])

  const getStats = useCallback(() => {
    return [
      { label: 'Jami kodlar', value: HTTP_STATUS_CODES.length },
      { label: 'Kategoriyalar', value: 5 },
      { label: 'Filtrlangan', value: filteredCodes.length },
    ]
  }, [filteredCodes.length])

  // Sample status codes for quick access
  const popularCodes = useMemo(
    () => [
      HTTP_STATUS_CODES.find((code) => code.code === 200)!,
      HTTP_STATUS_CODES.find((code) => code.code === 404)!,
      HTTP_STATUS_CODES.find((code) => code.code === 500)!,
      HTTP_STATUS_CODES.find((code) => code.code === 301)!,
      HTTP_STATUS_CODES.find((code) => code.code === 401)!,
      HTTP_STATUS_CODES.find((code) => code.code === 403)!,
    ],
    []
  )

  return {
    searchTerm,
    selectedCategory,
    selectedStatus,
    filteredCodes,
    categories,
    popularCodes,
    handleSearch,
    handleCategoryFilter,
    selectStatus,
    clearSelection,
    getStats,
    allCodes: HTTP_STATUS_CODES,
  }
}
