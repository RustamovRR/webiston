import { UrlInfo } from '@/types'

/**
 * Validate URL format
 * @param url - URL string to validate
 * @returns Boolean indicating if URL is valid
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url.startsWith('http') ? url : `https://${url}`)
    return true
  } catch {
    return false
  }
}

/**
 * Analyze URL structure
 * @param url - URL string to analyze
 * @returns UrlInfo object with URL components
 */
export const analyzeUrl = (url: string): UrlInfo | null => {
  if (!url?.trim()) return null

  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
    return {
      protocol: urlObj.protocol,
      hostname: urlObj.hostname,
      pathname: urlObj.pathname !== '/' ? urlObj.pathname : undefined,
      search: urlObj.search || undefined,
      hash: urlObj.hash || undefined,
      isValidUrl: true,
    }
  } catch {
    return { isValidUrl: false }
  }
}

/**
 * Extract domain from URL
 * @param url - URL string
 * @returns Domain name or null if invalid
 */
export const extractDomain = (url: string): string | null => {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
    return urlObj.hostname
  } catch {
    return null
  }
}

/**
 * Check if URL is email link
 * @param url - URL string to check
 * @returns Boolean indicating if URL is email link
 */
export const isEmailUrl = (url: string): boolean => {
  return url.startsWith('mailto:')
}

/**
 * Check if URL is secure (HTTPS)
 * @param url - URL string to check
 * @returns Boolean indicating if URL uses HTTPS
 */
export const isSecureUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * Normalize URL by adding protocol if missing
 * @param url - URL string to normalize
 * @returns Normalized URL
 */
export const normalizeUrl = (url: string): string => {
  if (!url?.trim()) return ''

  const trimmed = url.trim()
  if (trimmed.includes('://')) {
    return trimmed
  }

  return `https://${trimmed}`
}

/**
 * Extract query parameters from URL
 * @param url - URL string
 * @returns Object with query parameters
 */
export const extractQueryParams = (url: string): Record<string, string> => {
  try {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`)
    const params: Record<string, string> = {}

    urlObj.searchParams.forEach((value, key) => {
      params[key] = value
    })

    return params
  } catch {
    return {}
  }
}
