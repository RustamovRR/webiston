export type { Base64Failure, DecodeResult } from "./base64"
export {
  byteLength,
  decodeBase64,
  encodeBase64,
  encodeBytes
} from "./base64"
// Text utilities

// Color contrast utilities
export type { ContrastGrades, Rgb } from "./color-contrast"
export {
  compositeOver,
  contrastRatio,
  gradeContrast,
  relativeLuminance,
  WCAG_THRESHOLDS
} from "./color-contrast"
// Color conversion utilities
export {
  hexToRgb,
  hslToRgb,
  isValidHex,
  rgbToHex,
  rgbToHsl
} from "./color-conversions"
// Color palette utilities
export { generatePalette, generateTailwindShades } from "./color-palettes"
// Color parser utilities
export type { ParsedColor } from "./color-parser"
export { isValidColor, parseColorInput } from "./color-parser"

// Color space utilities
export {
  labToLch,
  labToRgb,
  lchToLab,
  oklabToOklch,
  oklabToRgb,
  oklchToOklab,
  rgbToLab,
  rgbToOklab
} from "./color-spaces"
// Color storage utilities
export type { ColorFavorite, ColorHistoryItem } from "./color-storage"
export {
  addToColorFavorites,
  addToColorHistory,
  clearColorFavorites,
  clearColorHistory,
  getColorFavorites,
  getColorHistory,
  getFavoriteCategories,
  isColorFavorite,
  removeFromColorFavorites
} from "./color-storage"
export {
  cleanText,
  countLines,
  countWords,
  getTextStats,
  isValidJson,
  truncateText
} from "./text"
// URL utilities
export {
  analyzeUrl,
  extractDomain,
  extractQueryParams,
  isEmailUrl,
  isSecureUrl,
  isValidUrl,
  normalizeUrl
} from "./url"
