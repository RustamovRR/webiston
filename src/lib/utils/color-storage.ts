/**
 * Color history and favorites storage utilities
 */

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

// Color History Functions
export const getColorHistory = (): ColorHistoryItem[] => {
  if (typeof window === "undefined") return []

  try {
    const stored = localStorage.getItem(HISTORY_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error("Error reading color history:", error)
    return []
  }
}

export const addToColorHistory = (hex: string, name?: string): void => {
  if (typeof window === "undefined") return

  try {
    const history = getColorHistory()

    // Remove if already exists (to move to top)
    const filtered = history.filter(
      (item) => item.hex.toLowerCase() !== hex.toLowerCase()
    )

    // Add to beginning
    const newItem: ColorHistoryItem = {
      hex: hex.toUpperCase(),
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
    return stored ? JSON.parse(stored) : []
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

  try {
    const favorites = getColorFavorites()

    // Check if already exists
    const exists = favorites.some(
      (item) => item.hex.toLowerCase() === hex.toLowerCase()
    )
    if (exists) return

    const newFavorite: ColorFavorite = {
      hex: hex.toUpperCase(),
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

  try {
    const favorites = getColorFavorites()
    const filtered = favorites.filter(
      (item) => item.hex.toLowerCase() !== hex.toLowerCase()
    )
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error("Error removing from color favorites:", error)
  }
}

export const isColorFavorite = (hex: string): boolean => {
  const favorites = getColorFavorites()
  return favorites.some((item) => item.hex.toLowerCase() === hex.toLowerCase())
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
