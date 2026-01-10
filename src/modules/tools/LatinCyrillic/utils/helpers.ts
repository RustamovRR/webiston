/**
 * Helper utilities for transliteration
 * Pure functions with no side effects
 */

import { APOSTROPHE_VARIANTS } from "../constants"

/**
 * Normalize all apostrophe variants to standard apostrophe
 * Handles: ` ´ ' ' ʻ ʼ ʿ ˈ ′ → '
 */
export function normalizeApostrophes(text: string): string {
  const pattern = new RegExp(`[${APOSTROPHE_VARIANTS.join("")}]`, "g")
  return text.replace(pattern, "'")
}

/**
 * Check if a character is uppercase
 * Handles edge cases where toLowerCase === toUpperCase (numbers, symbols)
 */
export function isUpperCase(char: string): boolean {
  return char === char.toUpperCase() && char !== char.toLowerCase()
}

/**
 * Check if a character is lowercase
 */
export function isLowerCase(char: string): boolean {
  return char === char.toLowerCase() && char !== char.toUpperCase()
}

/**
 * Preserve the case pattern from source to target
 * Handles single chars and multi-char strings (digraphs)
 */
export function preserveCase(source: string, target: string): string {
  if (target.length === 0) return target
  if (source.length === 0) return target

  // Single character
  if (target.length === 1) {
    return isUpperCase(source[0]) ? target.toUpperCase() : target.toLowerCase()
  }

  // Multi-character (digraph like "sh" → "ш" or "ш" → "sh")
  const firstUpper = isUpperCase(source[0])
  const allUpper =
    source.length > 1 &&
    [...source].every((c) => isUpperCase(c) || !isLowerCase(c))

  if (allUpper) {
    return target.toUpperCase()
  }

  if (firstUpper) {
    return target.charAt(0).toUpperCase() + target.slice(1).toLowerCase()
  }

  return target.toLowerCase()
}

/**
 * Check if character is a vowel (Latin)
 */
export function isLatinVowel(char: string): boolean {
  return "aeiouAEIOU".includes(char)
}

/**
 * Check if character is a vowel (Cyrillic - Uzbek)
 */
export function isCyrillicVowel(char: string): boolean {
  return "аеёиоуўэюяАЕЁИОУЎЭЮЯ".includes(char)
}

/**
 * Check if position is at word boundary
 */
export function isWordBoundary(text: string, index: number): boolean {
  if (index === 0) return true
  if (index >= text.length) return true
  return /[\s(\-"'«»„"".,!?;:]/.test(text[index - 1])
}

/**
 * Create a placeholder for protected content
 */
export function createPlaceholder(index: number): string {
  return `\u0000${index}\u0000`
}

/**
 * Extract index from placeholder
 */
export function extractPlaceholderIndex(placeholder: string): number | null {
  const match = placeholder.match(/\u0000(\d+)\u0000/)
  return match ? parseInt(match[1], 10) : null
}
