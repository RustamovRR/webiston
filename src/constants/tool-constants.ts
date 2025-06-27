// URL Encoder Constants
export const URL_SAMPLE_TEXTS = {
  SIMPLE_URL: 'https://example.com/search?q=hello world',
  COMPLEX_URL: 'https://example.com/api/users?name=Ali Valiyev&age=30&city=Toshkent',
  QUERY_STRING: 'search?q=react+hooks&type=tutorial&lang=uz',
  EMAIL_QUERY: 'mailto:ali@example.com?subject=Salom&body=Qanday ahvolingiz?',
  SOCIAL_SHARE: 'https://twitter.com/intent/tweet?text=Assalomu alaykum&url=https://webiston.uz',
}

// File processing constants
export const PROCESSING_LIMITS = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_TEXT_LENGTH: 1000000, // 1M characters
  TIMEOUT_DURATION: 30000, // 30 seconds
}

// URL validation patterns
export const URL_PATTERNS = {
  HTTP_URL: /^https?:\/\/.+/,
  EMAIL: /^mailto:.+/,
  PROTOCOL: /^[a-z][a-z0-9+.-]*:/,
  DOMAIN: /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/,
}

// Common encoding examples
export const ENCODING_EXAMPLES = [
  {
    original: 'Hello World!',
    encoded: 'Hello%20World%21',
    description: "Bo'shliq va maxsus belgilar",
  },
  {
    original: 'user@example.com',
    encoded: 'user%40example.com',
    description: 'Email manzil',
  },
  {
    original: 'price=$100&tax=5%',
    encoded: 'price%3D%24100%26tax%3D5%25',
    description: 'Query parametrlari',
  },
  {
    original: 'search?q=react+hooks',
    encoded: 'search%3Fq%3Dreact%2Bhooks',
    description: "Qidiruv so'rovi",
  },
]

export const TOOL_CONSTANTS = {
  'base64-converter': {
    category: 'converters',
    featured: true,
    premium: false,
  },
  'url-encoder': {
    category: 'converters',
    featured: true,
    premium: false,
  },
  'color-converter': {
    category: 'converters',
    featured: true,
    premium: false,
  },
  'jwt-decoder': {
    category: 'converters',
    featured: true,
    premium: false,
  },
  'json-formatter': {
    category: 'utilities',
    featured: true,
    premium: false,
  },
  'hash-generator': {
    category: 'generators',
    featured: true,
    premium: false,
  },
  'password-generator': {
    category: 'generators',
    featured: true,
    premium: false,
  },
  'qr-generator': {
    category: 'generators',
    featured: true,
    premium: false,
  },
  'uuid-generator': {
    category: 'generators',
    featured: true,
    premium: false,
  },
  'lorem-ipsum': {
    category: 'generators',
    featured: true,
    premium: false,
  },
  'latin-cyrillic': {
    category: 'converters',
    featured: true,
    premium: false,
  },
} as const
