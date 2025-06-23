// Base64 Constants
export const BASE64_SAMPLE_TEXTS = {
  UZBEK_GREETING: 'Assalomu alaykum! Xush kelibsiz!',
  JSON_SAMPLE: '{"name": "Ali", "age": 25, "city": "Toshkent"}',
  URL_SAMPLE: 'https://example.com/search?q=hello world&lang=uz',
  EMAIL_SAMPLE: 'ali@example.com',
}

export const BASE64_SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
]

export const BASE64_SUPPORTED_TEXT_TYPES = [
  'text/plain',
  'text/html',
  'text/css',
  'text/javascript',
  'application/json',
  'application/xml',
]

// File size limits (in bytes)
export const FILE_SIZE_LIMITS = {
  IMAGE: 5 * 1024 * 1024, // 5MB
  TEXT: 1 * 1024 * 1024, // 1MB
  JSON: 10 * 1024 * 1024, // 10MB
}

// JSON Formatter Constants
export const JSON_INDENTATION_OPTIONS = [
  { value: '2', label: "2 bo'sh joy" },
  { value: '4', label: "4 bo'sh joy" },
  { value: '8', label: "8 bo'sh joy" },
  { value: '\t', label: 'Tab' },
]

export const JSON_SAMPLE_DATA = {
  SIMPLE: {
    name: 'Ali Valiyev',
    age: 30,
    active: true,
  },
  COMPLEX: {
    user: {
      id: 1,
      name: 'Ali Valiyev',
      email: 'ali@example.com',
      profile: {
        bio: 'Developer',
        location: 'Toshkent',
        skills: ['JavaScript', 'React', 'Node.js'],
      },
    },
  },
}

// Common error messages
export const ERROR_MESSAGES = {
  INVALID_BASE64: "Noto'g'ri Base64 format",
  INVALID_JSON: "Noto'g'ri JSON format",
  FILE_TOO_LARGE: 'Fayl hajmi juda katta',
  UNSUPPORTED_FORMAT: "Qo'llab-quvvatlanmaydigan format",
  NETWORK_ERROR: 'Tarmoq xatosi',
  UNKNOWN_ERROR: "Noma'lum xatolik",
}

// Success messages
export const SUCCESS_MESSAGES = {
  COPIED_TO_CLIPBOARD: 'Buferga nusxalandi',
  FILE_UPLOADED: 'Fayl muvaffaqiyatli yuklandi',
  CONVERSION_COMPLETE: "O'girish yakunlandi",
  DOWNLOAD_STARTED: 'Yuklab olish boshlandi',
}
