/**
 * Color history and favorites storage utilities
 */

import { rgbToHex } from "./color-conversions"
import { parseColorInput } from "./color-parser"

export interface ColorHistoryItem {
  hex: string
  timestamp: number
  name?: string
}

export interface ColorFavorite {
  hex: string
  name: string
  category?: string
  timestamp: number
}

const HISTORY_KEY = "webiston-color-history"
const FAVORITES_KEY = "webiston-color-favorites"
const MAX_HISTORY_ITEMS = 20

/**
 * `#RRGGBB`, or `#RRGGBBAA` when the colour is translucent — whatever notation
 * it was recorded in.
 *
 * Writes are canonical now, but records written earlier hold the raw input
 * string: `addToColorHistory` upper-cases whatever it is handed, so a visitor
 * who typed `rgba(59, 130, 246, 0.6)` has an entry that literally reads
 * `RGBA(59, 130, 246, 0.6)`. Those entries are still on real devices, they are
 * still valid CSS colours, and a swatch captioned with a 24-character string is
 * what pushed the history grid out through its card. Normalising on READ fixes
 * every existing device without a migration step.
 */
const canonicalHex = (value: string): string | null => {
  const parsed = parseColorInput(value)
  if (!parsed) return null
  const base = rgbToHex(parsed.r, parsed.g, parsed.b)
  const alpha =
    parsed.a < 1
      ? Math.round(parsed.a * 255)
          .toString(16)
          .padStart(2, "0")
      : ""
  return `${base}${alpha}`.toUpperCase()
}

/**
 * Normalises every stored entry and drops the ones that no longer parse, then
 * de-duplicates — two legacy notations of one colour collapse to one swatch.
 */
const normalizeEntries = <Item extends { hex: string }>(
  entries: unknown
): Item[] => {
  if (!Array.isArray(entries)) return []
  const seen = new Set<string>()
  const result: Item[] = []

  for (const entry of entries) {
    if (!entry || typeof entry.hex !== "string") continue
    const hex = canonicalHex(entry.hex)
    if (!hex || seen.has(hex)) continue
    seen.add(hex)
    result.push({ ...entry, hex })
  }

  return result
}

// Color History Functions
export const getColorHistory = (): ColorHistoryItem[] => {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(HISTORY_KEY)
    return stored ? normalizeEntries<ColorHistoryItem>(JSON.parse(stored)) : []
  } catch (error) {
    console.error("Error reading color history:", error)
    return []
  }
}

export const addToColorHistory = (hex: string, name?: string): void => {
  if (typeof window === "undefined") return

  // The canonical form is decided HERE, once, so no caller can put a raw
  // `rgba(…)` or a colour name into a field the whole UI reads as a hex.
  const canonical = canonicalHex(hex)
  if (!canonical) return

  try {
    const history = getColorHistory()

    // Remove if already exists (to move to top)
    const filtered = history.filter((item) => item.hex !== canonical)

    // Add to beginning
    const newItem: ColorHistoryItem = {
      hex: canonical,
      timestamp: Date.now(),
      name
    }

    const updatedHistory = [newItem, ...filtered].slice(0, MAX_HISTORY_ITEMS)
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory))
  } catch (error) {
    console.error("Error saving to color history:", error)
  }
}

export const clearColorHistory = (): void => {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem(HISTORY_KEY)
  } catch (error) {
    console.error("Error clearing color history:", error)
  }
}

// Color Favorites Functions
export const getColorFavorites = (): ColorFavorite[] => {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(FAVORITES_KEY)
    return stored ? normalizeEntries<ColorFavorite>(JSON.parse(stored)) : []
  } catch (error) {
    console.error("Error reading color favorites:", error)
    return []
  }
}

export const addToColorFavorites = (
  hex: string,
  name: string,
  category?: string
): void => {
  if (typeof window === "undefined") return

  const canonical = canonicalHex(hex)
  if (!canonical) return

  try {
    const favorites = getColorFavorites()

    // Check if already exists
    if (favorites.some((item) => item.hex === canonical)) return

    const newFavorite: ColorFavorite = {
      hex: canonical,
      name,
      category,
      timestamp: Date.now()
    }

    const updatedFavorites = [newFavorite, ...favorites]
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updatedFavorites))
  } catch (error) {
    console.error("Error saving to color favorites:", error)
  }
}

export const removeFromColorFavorites = (hex: string): void => {
  if (typeof window === "undefined") return

  const canonical = canonicalHex(hex)
  if (!canonical) return

  try {
    const favorites = getColorFavorites()
    const filtered = favorites.filter((item) => item.hex !== canonical)
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error("Error removing from color favorites:", error)
  }
}

export const isColorFavorite = (hex: string): boolean => {
  const canonical = canonicalHex(hex)
  if (!canonical) return false
  return getColorFavorites().some((item) => item.hex === canonical)
}

export const clearColorFavorites = (): void => {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem(FAVORITES_KEY)
  } catch (error) {
    console.error("Error clearing color favorites:", error)
  }
}

// Get favorite categories
export const getFavoriteCategories = (): string[] => {
  const favorites = getColorFavorites()
  const categories = favorites
    .map((item) => item.category)
    .filter((category): category is string => Boolean(category))

  return [...new Set(categories)].sort()
}
