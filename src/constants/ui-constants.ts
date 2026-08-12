// UI design constants for consistency across tools.
//
// TOOL_COLORS and UI_PATTERNS are OWNED BY @webiston/ui (packages/ui is their
// primary consumer — a package may never import app code via `@/`). They are
// re-exported here so existing app call sites keep working; there is exactly one
// definition. See docs/adr/0004 and initiatives/code-structure.md.
//
// The DEEP path matters, and it is the whole reason this comment exists.
// `from "@webiston/ui"` pulls the package's root barrel, and a barrel drags
// every CLIENT module it re-exports into the importing route's client reference
// manifest. This file is reached from `@/constants` → `Footer` → every page,
// so two colour constants were putting `aurora-text`, `code-highlight`,
// `gradient-tabs`, `number-ticker`, `select`, `typing-animation` and
// `BaseModal` on all 226 prerendered book chapters. Measured, not theorised.
export { TOOL_COLORS, UI_PATTERNS } from "@webiston/ui/constants/ui-patterns"

import { TOOL_COLORS } from "@webiston/ui/constants/ui-patterns"

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
  "number-to-words": TOOL_COLORS.CONVERTERS,
  tilxat: TOOL_COLORS.GENERATORS,
  "color-converter": TOOL_COLORS.CONVERTERS,
  "jwt-decoder": TOOL_COLORS.CONVERTERS,

  "hash-generator": TOOL_COLORS.GENERATORS,
  "uuid-generator": TOOL_COLORS.GENERATORS,
  "qr-generator": TOOL_COLORS.GENERATORS,
  "code-snapshot": TOOL_COLORS.GENERATORS,
  "password-generator": TOOL_COLORS.GENERATORS,
  "og-meta-generator": TOOL_COLORS.GENERATORS,
  "lorem-ipsum": TOOL_COLORS.GENERATORS,

  "device-info": TOOL_COLORS.UTILITIES,
  "camera-recorder": TOOL_COLORS.UTILITIES,
  "microphone-test": TOOL_COLORS.UTILITIES,
  "screen-resolution": TOOL_COLORS.UTILITIES,
  "ip-info": TOOL_COLORS.UTILITIES
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

/**
 * Per-CATEGORY accent classes for tool cards and filter chips.
 *
 * Colour here is DATA, not decoration — it encodes which category a tool
 * belongs to, so the icon chip and the filter chip agree at a glance. That is
 * the documented exception in `design-system.md`: categorical/chart colour in a
 * named constant rather than inline.
 *
 * Built on `--chart-1..4`, which already exist in `tokens.css` with separate
 * light/dark values, so these need no `dark:` variants. Deliberately FOUR hues
 * (one per category), not seventeen: `TOOLS_LIST[].color` used to carry an
 * ad-hoc per-tool palette — 17 raw Tailwind classes including blue three times
 * — which was colourful but meaningless.
 */
export const CATEGORY_ACCENTS: Record<string, { chip: string; icon: string }> =
  {
    converters: {
      chip: "border-chart-1 bg-chart-1/15 font-medium text-chart-1",
      icon: "bg-chart-1/12 text-chart-1"
    },
    generators: {
      chip: "border-chart-2 bg-chart-2/15 font-medium text-chart-2",
      icon: "bg-chart-2/12 text-chart-2"
    },
    analyzers: {
      chip: "border-chart-3 bg-chart-3/15 font-medium text-chart-3",
      icon: "bg-chart-3/12 text-chart-3"
    },
    utilities: {
      chip: "border-chart-4 bg-chart-4/15 font-medium text-chart-4",
      icon: "bg-chart-4/12 text-chart-4"
    }
  }

/** Fallback for the "all" chip and any unmapped category. */
export const CATEGORY_ACCENT_NEUTRAL = {
  chip: "border-primary bg-primary/15 font-medium text-primary",
  icon: "bg-primary/12 text-primary"
}
