// Bu fayl endi kerak emas, lekin uni o'chirish o'rniga
// vaqtinchalik statik konfiguratsiya qaytaradigan qilib qo'yamiz.
// Kelajakda next-intl'ni to'g'ri sozlaganda kerak bo'ladi.

export default async function getRequestConfig() {
  const locale = 'uz'
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
}
