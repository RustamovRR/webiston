/**
 * Tool-scoped constants.
 *
 * The preset swatches are COLOUR DATA — the design system's documented
 * exception to token-only styling — and live here as named data rather than
 * inline in the component. They are deliberately vivid, spread around the
 * wheel, so every palette type has something to show from the first click.
 */

export type PaletteType = "monochromatic" | "analogous" | "complementary"

export const PALETTE_TYPES: readonly PaletteType[] = [
  "monochromatic",
  "analogous",
  "complementary"
]

/** The colour the tool opens on — the site's own brand family, not grey. */
export const DEFAULT_COLOR = "#0d5a6b"

/** Quick-start swatches. Hex only; the name comes from the shared registry. */
export const PRESET_COLORS: readonly string[] = [
  "#ef4444",
  "#f97316",
  "#f59e0b",
  "#84cc16",
  "#10b981",
  "#14b8a6",
  "#06b6d4",
  "#3b82f6",
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f43f5e"
]
