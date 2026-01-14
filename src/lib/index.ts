// Utility functions

// Transliteration utilities
export { toCyrillic, toLatin } from "../modules/tools/LatinCyrillic/utils"

// Common utilities
export { cn } from "./common"

// Content utilities
export {
  flattenNavigation,
  formatTutorialName,
  isMarkdownContent,
  processContentForVideos
} from "./content"
export type { ColorFavorite, ColorHistoryItem } from "./utils"
// Re-export all utils
export {
  addToColorFavorites,
  addToColorHistory,
  analyzeUrl,
  cleanText,
  clearColorFavorites,
  clearColorHistory,
  countLines,
  // Text
  countWords,
  extractDomain,
  extractQueryParams,
  generatePalette,
  // Color palettes
  generateTailwindShades,
  getColorFavorites,
  // Color storage
  getColorHistory,
  getFavoriteCategories,
  getTextStats,
  hexToRgb,
  // Color conversions
  hslToRgb,
  isColorFavorite,
  isEmailUrl,
  isSecureUrl,
  isValidColor,
  isValidHex,
  isValidJson,
  // URL
  isValidUrl,
  labToLch,
  labToRgb,
  lchToLab,
  normalizeUrl,
  oklabToOklch,
  oklabToRgb,
  oklchToOklab,
  // Color parser
  parseColorInput,
  removeFromColorFavorites,
  rgbToHex,
  rgbToHsl,
  // Color spaces
  rgbToLab,
  rgbToOklab,
  truncateText
} from "./utils"
