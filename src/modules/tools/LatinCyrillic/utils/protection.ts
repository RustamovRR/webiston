/**
 * Content protection system
 * Preserves URLs, emails, code blocks, and technical terms from transliteration
 */

import { NON_TRANSLITERATABLE_WORDS, UZBEK_SUFFIXES } from "../constants"

const PLACEHOLDER_PREFIX = "\u0000"
const PLACEHOLDER_SUFFIX = "\u0000"

function createPlaceholder(index: number): string {
  return `${PLACEHOLDER_PREFIX}${index}${PLACEHOLDER_SUFFIX}`
}

// Create regex pattern for protected words with optional Uzbek suffixes
function buildProtectedWordsPattern(): string {
  const sortedWords = [...NON_TRANSLITERATABLE_WORDS].sort(
    (a, b) => b.length - a.length
  )
  const suffixPattern = `(?:${UZBEK_SUFFIXES.join("|")})?`
  return `\\b(${sortedWords.join("|")})${suffixPattern}\\b`
}

function buildProtectionRegex(): RegExp {
  const patterns = [
    // Code blocks (triple backticks)
    "```[\\s\\S]*?```",
    // Inline code (single backticks)
    "`[^`]+?`",
    // HTML tags: <tag>, </tag>, <tag attr="value">
    "<\\/?[a-zA-Z][a-zA-Z0-9]*(?:\\s[^>]*)?\\/?>",
    // Email addresses
    "\\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}\\b",
    // Social media handles (@username, @user_name, @user123)
    "@[a-zA-Z_][a-zA-Z0-9_]*",
    // URLs
    "\\b(https?|ftp):\\/\\/[^\\s/$.?#].[^\\s]*",
    // File names with extensions (config.json, backup_v2.tar.gz)
    "\\b[a-zA-Z0-9_-]+(?:\\.[a-zA-Z0-9]+)+\\b",
    // Technical terms with hyphen+number at END (COVID-19, v2.3, NOT Tez-tibbiy)
    "\\b[A-Za-z]+-\\d+(?:\\.\\d+)*\\b",
    // HTML heading tags (h1-h6)
    "\\bh[1-6]\\b",
    // Protected words with optional Uzbek suffixes
    buildProtectedWordsPattern()
  ]
  return new RegExp(patterns.join("|"), "gi")
}

const protectionRegex = buildProtectionRegex()

export interface ProtectionResult {
  maskedText: string
  protectedParts: string[]
}

/**
 * Protect special content from transliteration
 * Replaces URLs, emails, code blocks, etc. with placeholders
 */
export function protectContent(text: string): ProtectionResult {
  const protectedParts: string[] = []

  const maskedText = text.replace(protectionRegex, (match) => {
    const index = protectedParts.length
    protectedParts.push(match)
    return createPlaceholder(index)
  })

  return { maskedText, protectedParts }
}

/**
 * Restore protected content after transliteration
 * Replaces placeholders with original content
 */
export function restoreContent(text: string, protectedParts: string[]): string {
  const placeholderRegex = new RegExp(
    `${PLACEHOLDER_PREFIX}(\\d+)${PLACEHOLDER_SUFFIX}`,
    "g"
  )
  return text.replace(placeholderRegex, (_, indexStr) => {
    return protectedParts[parseInt(indexStr, 10)] || ""
  })
}
