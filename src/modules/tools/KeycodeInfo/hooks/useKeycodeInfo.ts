import { useState, useEffect, useCallback } from "react"

export interface KeyInfo {
  key: string
  code: string
  keyCode: number
  which: number
  charCode: number
  location: number
  repeat: boolean
  ctrlKey: boolean
  altKey: boolean
  shiftKey: boolean
  metaKey: boolean
  timestamp: number
}

export interface CommonKey {
  name: string
  code: string
  keyCode: number
  description?: string
  category?: "navigation" | "function" | "modifier" | "special"
}

// Common keys with categories
const COMMON_KEYS: CommonKey[] = [
  // Navigation Keys
  {
    name: "Enter",
    code: "Enter",
    keyCode: 13,
    description: "Tasdiqlash tugmasi",
    category: "navigation"
  },
  {
    name: "Escape",
    code: "Escape",
    keyCode: 27,
    description: "Bekor qilish tugmasi",
    category: "navigation"
  },
  {
    name: "Space",
    code: "Space",
    keyCode: 32,
    description: "Bo'sh joy tugmasi",
    category: "navigation"
  },
  {
    name: "Tab",
    code: "Tab",
    keyCode: 9,
    description: "Tab tugmasi",
    category: "navigation"
  },
  {
    name: "Backspace",
    code: "Backspace",
    keyCode: 8,
    description: "O'chirish tugmasi",
    category: "navigation"
  },
  {
    name: "Delete",
    code: "Delete",
    keyCode: 46,
    description: "O'chirish tugmasi",
    category: "navigation"
  },

  // Arrow Keys
  {
    name: "Arrow Up",
    code: "ArrowUp",
    keyCode: 38,
    description: "Yuqoriga harakat",
    category: "navigation"
  },
  {
    name: "Arrow Down",
    code: "ArrowDown",
    keyCode: 40,
    description: "Pastga harakat",
    category: "navigation"
  },
  {
    name: "Arrow Left",
    code: "ArrowLeft",
    keyCode: 37,
    description: "Chapga harakat",
    category: "navigation"
  },
  {
    name: "Arrow Right",
    code: "ArrowRight",
    keyCode: 39,
    description: "O'ngga harakat",
    category: "navigation"
  },

  // Function Keys
  {
    name: "F1",
    code: "F1",
    keyCode: 112,
    description: "Yordam tugmasi",
    category: "function"
  },
  {
    name: "F5",
    code: "F5",
    keyCode: 116,
    description: "Yangilash tugmasi",
    category: "function"
  },
  {
    name: "F12",
    code: "F12",
    keyCode: 123,
    description: "Developer Tools",
    category: "function"
  },

  // Special Keys
  {
    name: "Home",
    code: "Home",
    keyCode: 36,
    description: "Boshiga o'tish",
    category: "special"
  },
  {
    name: "End",
    code: "End",
    keyCode: 35,
    description: "Oxiriga o'tish",
    category: "special"
  },
  {
    name: "Page Up",
    code: "PageUp",
    keyCode: 33,
    description: "Sahifa yuqoriga",
    category: "special"
  },
  {
    name: "Page Down",
    code: "PageDown",
    keyCode: 34,
    description: "Sahifa pastga",
    category: "special"
  }
]

export const useKeycodeInfo = () => {
  const [keyInfo, setKeyInfo] = useState<KeyInfo | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [keyHistory, setKeyHistory] = useState<KeyInfo[]>([])

  // Handle keyboard events
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    try {
      // Prevent default behavior for certain keys to avoid page navigation
      if (["F5", "F12", "Tab", "F1"].includes(event.code)) {
        event.preventDefault()
      }

      const info: KeyInfo = {
        key: event.key,
        code: event.code,
        keyCode: event.keyCode,
        which: event.which,
        charCode: event.charCode || 0,
        location: event.location,
        repeat: event.repeat,
        ctrlKey: event.ctrlKey,
        altKey: event.altKey,
        shiftKey: event.shiftKey,
        metaKey: event.metaKey,
        timestamp: Date.now()
      }

      setKeyInfo(info)
      setKeyHistory((prev) => [info, ...prev.slice(0, 19)]) // Keep last 20 keys
    } catch (error) {
      console.error("Tugma ma'lumotlarini olishda xatolik:", error)
    }
  }, [])

  // Start listening for keyboard events
  const startListening = useCallback(() => {
    setIsListening(true)
    setKeyInfo(null)
    setKeyHistory([])
  }, [])

  // Stop listening for keyboard events
  const stopListening = useCallback(() => {
    setIsListening(false)
  }, [])

  // Clear history
  const clearHistory = useCallback(() => {
    setKeyHistory([])
    setKeyInfo(null)
  }, [])

  // Get location name in Uzbek
  const getLocationName = useCallback((location: number): string => {
    switch (location) {
      case 0:
        return "Standart"
      case 1:
        return "Chap"
      case 2:
        return "O'ng"
      case 3:
        return "Numpad"
      default:
        return "Noma'lum"
    }
  }, [])

  // Simulate key press for common keys
  const simulateKey = useCallback((commonKey: CommonKey) => {
    try {
      const mockInfo: KeyInfo = {
        key: commonKey.name,
        code: commonKey.code,
        keyCode: commonKey.keyCode,
        which: commonKey.keyCode,
        charCode: 0,
        location: 0,
        repeat: false,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        metaKey: false,
        timestamp: Date.now()
      }

      setKeyInfo(mockInfo)
      setKeyHistory((prev) => [mockInfo, ...prev.slice(0, 19)])
    } catch (error) {
      console.error("Tugma simulyatsiyasida xatolik:", error)
    }
  }, [])

  // Format key info for copying
  const formatKeyInfo = useCallback(
    (info: KeyInfo): string => {
      const modifiers =
        [
          info.ctrlKey && "Ctrl",
          info.altKey && "Alt",
          info.shiftKey && "Shift",
          info.metaKey && "Meta"
        ]
          .filter(Boolean)
          .join(" + ") || "Yo'q"

      return `Tugma Ma'lumotlari:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Key: "${info.key}"
Code: ${info.code}
KeyCode: ${info.keyCode}
Which: ${info.which}
CharCode: ${info.charCode}
Location: ${getLocationName(info.location)}
Takrorlanish: ${info.repeat ? "Ha" : "Yo'q"}
Modifikatorlar: ${modifiers}
Vaqt: ${new Date(info.timestamp).toLocaleTimeString()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
    },
    [getLocationName]
  )

  // Get common keys by category
  const getCommonKeysByCategory = useCallback(
    (category?: CommonKey["category"]) => {
      if (!category) return COMMON_KEYS
      return COMMON_KEYS.filter((key) => key.category === category)
    },
    []
  )

  // Setup and cleanup event listeners
  useEffect(() => {
    if (isListening) {
      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isListening, handleKeyDown])

  return {
    // State
    keyInfo,
    isListening,
    keyHistory,
    commonKeys: COMMON_KEYS,

    // Actions
    startListening,
    stopListening,
    clearHistory,
    simulateKey,

    // Utilities
    getLocationName,
    formatKeyInfo,
    getCommonKeysByCategory
  }
}
