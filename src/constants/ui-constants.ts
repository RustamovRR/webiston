// UI Design Constants - re-exported from @webiston/ui + app-specific additions
import { TOOL_COLORS, UI_PATTERNS } from "@webiston/ui"

export { TOOL_COLORS, UI_PATTERNS }

// Tool-specific color mappings (app-level, not in shared package)
export const TOOL_COLOR_MAP = {
  "base64-converter": TOOL_COLORS.CONVERTERS,
  "json-formatter": TOOL_COLORS.CONVERTERS,
  "url-encoder": TOOL_COLORS.CONVERTERS,
  "latin-cyrillic": TOOL_COLORS.CONVERTERS,
  "color-converter": TOOL_COLORS.CONVERTERS,
  "jwt-decoder": TOOL_COLORS.CONVERTERS,

  "hash-generator": TOOL_COLORS.GENERATORS,
  "uuid-generator": TOOL_COLORS.GENERATORS,
  "qr-generator": TOOL_COLORS.GENERATORS,
  "password-generator": TOOL_COLORS.GENERATORS,
  "og-meta-generator": TOOL_COLORS.GENERATORS,
  "lorem-ipsum": TOOL_COLORS.GENERATORS,

  "device-info": TOOL_COLORS.UTILITIES,
  "camera-recorder": TOOL_COLORS.UTILITIES,
  "microphone-test": TOOL_COLORS.UTILITIES,
  "keycode-info": TOOL_COLORS.UTILITIES,
  "screen-resolution": TOOL_COLORS.UTILITIES,
  "user-agent-analyzer": TOOL_COLORS.UTILITIES,
  "ip-info": TOOL_COLORS.UTILITIES,
  "website-status": TOOL_COLORS.UTILITIES
}

// Common text styles
export const TEXT_STYLES = {
  TITLE: "text-xl font-bold text-zinc-100",
  SUBTITLE: "text-lg font-semibold text-zinc-100",
  BODY: "text-sm text-zinc-400 leading-relaxed",
  CAPTION: "text-xs text-zinc-500",
  ERROR: "text-sm text-red-300 font-mono",
  SUCCESS: "text-sm text-green-300"
}

// Common animations
export const ANIMATIONS = {
  BUTTON_HOVER:
    "transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
  FADE_IN: "animate-in fade-in duration-300",
  SLIDE_UP: "animate-in slide-in-from-bottom-4 duration-300",
  PULSE: "animate-pulse"
}

// macOS-style window dots
export const MACOS_DOTS = [
  { color: "bg-red-500/80", hover: "hover:bg-red-500" },
  { color: "bg-yellow-500/80", hover: "hover:bg-yellow-500" },
  { color: "bg-green-500/80", hover: "hover:bg-green-500" }
]

// Utility function to get tool colors
export const getToolColor = (toolId: string) => {
  return (
    TOOL_COLOR_MAP[toolId as keyof typeof TOOL_COLOR_MAP] ||
    TOOL_COLORS.CONVERTERS
  )
}
