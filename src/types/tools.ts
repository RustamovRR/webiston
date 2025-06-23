import { ConversionMode } from './common'

// Tool specific types

// Base64 Converter
export interface Base64ConversionOptions {
  mode: ConversionMode
  handleImages?: boolean
  outputFormat?: 'text' | 'dataurl'
}

export interface Base64Result {
  output: string
  error: string
  isValid: boolean
  mode: ConversionMode
}

// JSON Formatter
export interface JsonFormatterOptions {
  indentation: number
  minified?: boolean
  showLineNumbers?: boolean
}

// URL Encoder
export interface UrlEncoderOptions {
  mode: ConversionMode
  component?: boolean
}

export interface UrlResult {
  output: string
  error: string | null
  isValid: boolean
  urlInfo?: UrlInfo
}

export interface UrlInfo {
  protocol?: string
  hostname?: string
  pathname?: string
  search?: string
  hash?: string
  isValidUrl: boolean
}

// Hash Generator
export type HashAlgorithm = 'md5' | 'sha1' | 'sha256' | 'sha512'

export interface HashGeneratorOptions {
  algorithm: HashAlgorithm
  encoding?: 'hex' | 'base64'
}

// Password Generator
export interface PasswordOptions {
  length: number
  includeUppercase: boolean
  includeLowercase: boolean
  includeNumbers: boolean
  includeSymbols: boolean
  excludeSimilar?: boolean
}

// Color Converter
export type ColorFormat = 'hex' | 'rgb' | 'hsl' | 'hsv'

export interface ColorValue {
  format: ColorFormat
  value: string
  rgb?: { r: number; g: number; b: number }
  hsl?: { h: number; s: number; l: number }
  hex?: string
}

// JWT Decoder
export interface JwtPayload {
  header: Record<string, any>
  payload: Record<string, any>
  signature: string
  isValid: boolean
  error?: string
}

// QR Generator
export interface QrGeneratorOptions {
  text: string
  size: number
  errorCorrection: 'L' | 'M' | 'Q' | 'H'
  margin: number
  darkColor: string
  lightColor: string
}

export interface QrPreset {
  id: string
  name: string
  data: string
  description: string
}
