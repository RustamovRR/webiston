// UI design constants for consistency across tools.
//
// TOOL_COLORS and UI_PATTERNS are OWNED BY @webiston/ui (packages/ui is their
// primary consumer — a package may never import app code via `@/`). They are
// re-exported here so existing app call sites keep working; there is exactly one
// definition. See docs/adr/0004 and initiatives/code-structure.md.
export { TOOL_COLORS, UI_PATTERNS } from "@webiston/ui"

import { TOOL_COLORS } from "@webiston/ui"

// Tool-specific color mappings.
//
// DOCUMENTED EXCEPTION: TOOL_COLORS are per-category accent *gradients* — a
// deliberate visual system that distinguishes converters from generators from
// utilities. Flattening them to semantic tokens would erase that distinction,
// which is a product decision, not a cleanup. The design spec allows brand and
// decorative colour precisely when it lives in a named constant like this one.
// See docs/reference/design-system.md § chart/viz/brand exception.
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

// Common text styles — SEMANTIC TOKENS ONLY.
//
// These were dark-only (`text-zinc-100` / `text-zinc-400` / `text-zinc-500`) and
// are consumed by 5 call sites, so body text rendered at ~2.6:1 on a light card —
// a WCAG failure on every tool that used them. Semantic tokens are verified at
// ≥4.5:1 on BOTH surfaces in BOTH schemes: run `pnpm contrast`.
export const TEXT_STYLES = {
  TITLE: "text-xl font-bold text-foreground",
  SUBTITLE: "text-lg font-semibold text-foreground",
  BODY: "text-sm text-muted-foreground leading-relaxed",
  CAPTION: "text-xs text-muted-foreground",
  ERROR: "text-sm text-destructive font-mono",
  SUCCESS: "text-sm text-success"
}

// Common animations (no colour — nothing to tokenise)
export const ANIMATIONS = {
  BUTTON_HOVER:
    "transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]",
  FADE_IN: "animate-in fade-in duration-300",
  SLIDE_UP: "animate-in slide-in-from-bottom-4 duration-300",
  PULSE: "animate-pulse"
}

// macOS-style window dots.
//
// DOCUMENTED EXCEPTION: these are a literal skeuomorphic reference — macOS
// traffic lights ARE red/yellow/green. Mapping them to destructive/warning/success
// would be semantically wrong (they signal nothing) and would change colour with
// the brand. They stay as fixed palette values, in this named constant.
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
