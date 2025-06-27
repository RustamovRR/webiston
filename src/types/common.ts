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
