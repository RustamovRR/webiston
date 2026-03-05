/**
 * Count words in a text string
 * @param text - The text to count words in
 * @returns Number of words
 */
export const countWords = (text: string): number => {
  if (!text?.trim()) return 0
  return text.trim().split(/\s+/).length
}

/**
 * Count lines in a text string
 * @param text - The text to count lines in
 * @returns Number of lines
 */
export const countLines = (text: string): number => {
  if (!text) return 0
  return text.split("\n").length
}

/**
 * Get text statistics
 * @param text - The text to analyze
 * @returns Object with character, word, and line counts
 */
export const getTextStats = (text: string) => ({
  characters: text.length,
  words: countWords(text),
  lines: countLines(text)
})

/**
 * Truncate text to specified length
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @param suffix - Suffix to add when truncated (default: '...')
 * @returns Truncated text
 */
export const truncateText = (
  text: string,
  maxLength: number,
  suffix = "..."
): string => {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - suffix.length) + suffix
}

/**
 * Clean and normalize text
 * @param text - Text to clean
 * @returns Cleaned text
 */
export const cleanText = (text: string): string => {
  return text
    .replace(/\r\n/g, "\n") // Normalize line endings
    .replace(/\r/g, "\n") // Handle legacy Mac line endings
    .trim()
}

/**
 * Check if text is valid JSON
 * @param text - Text to validate
 * @returns Boolean indicating if text is valid JSON
 */
export const isValidJson = (text: string): boolean => {
  try {
    JSON.parse(text)
    return true
  } catch {
    return false
  }
}
