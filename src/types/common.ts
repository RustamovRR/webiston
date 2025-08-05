// Common tool types
export interface ToolResult<T = string> {
  output: T
  error: string
  isValid?: boolean
}

export interface FileUploadResult {
  content: string
  error?: string
}

// Conversion modes
export type ConversionMode = 'encode' | 'decode'
export type TransliterationMode = 'latin-to-cyrillic' | 'cyrillic-to-latin'

// Statistics types
export interface StatItem {
  label: string
  value: number
}

// File processing types
export interface ProcessedFile {
  name: string
  size: number
  type: string
  content?: string
  base64?: string
}

// Tool configuration types
export interface ToolConfig {
  name: string
  description: string
  features: string[]
  supportedFormats?: string[]
}

export type TLocale = 'uz' | 'en'

export interface IClassName {
  className?: string
}

export interface ISearchHit {
  objectID: string
  content: string
  hierarchy: {
    lvl0: string
    lvl1?: string
    lvl2?: string
    lvl3?: string
  }
  contentType: 'tutorial' | 'article'
  path: string // Reverted back to string
  fullPath: string
  metadata?: {
    language?: string
    title?: string
  }
}
