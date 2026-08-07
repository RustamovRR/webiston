/**
 * Tool-scoped constants.
 *
 * The preset swatches are COLOUR DATA — the design system's documented
 * exception to token-only styling — and live here as named data rather than
 * inline in the component.
 */

import type {
  ExportNotation,
  ExportTarget,
  GradientType,
  PaletteType,
  PrimaryFormatKey,
  SecondaryFormatKey,
  WorkbenchView
} from "../types"

/**
 * All three schemes render at once now, so this is an iteration order rather
 * than a set of options behind a switch. The switch is gone: it made the
 * visitor choose before seeing anything, and the three answers together fit in
 * the space one of them used to occupy.
 */
export const PALETTE_TYPES: readonly PaletteType[] = [
  "monochromatic",
  "analogous",
  "complementary"
]

/** The workbench's four settings, in the order they are offered. */
export const WORKBENCH_VIEWS: readonly WorkbenchView[] = [
  "scale",
  "palette",
  "gradient",
  "saved"
]

/** Always visible in the pinned summary. */
export const PRIMARY_FORMATS: readonly PrimaryFormatKey[] = [
  "hex",
  "rgb",
  "hsl",
  "oklch"
]

/** Behind the disclosure — real, indexable, one click away. */
export const SECONDARY_FORMATS: readonly SecondaryFormatKey[] = [
  "oklab",
  "lch",
  "lab"
]

export const EXPORT_TARGETS: readonly ExportTarget[] = [
  "css",
  "tailwind",
  "scss"
]

/**
 * HEX stays the default deliberately: switching the default to OKLCH would
 * change what every returning visitor's clipboard receives.
 */
export const EXPORT_NOTATIONS: readonly ExportNotation[] = ["hex", "oklch"]

/** Used when the colour has no name to lend the export its token prefix. */
export const DEFAULT_TOKEN_NAME = "primary"

export const GRADIENT_TYPES: readonly GradientType[] = [
  "linear",
  "radial",
  "conic"
]

/** The colour the tool opens on — the site's own brand family, not grey. */
export const DEFAULT_COLOR = "#0d5a6b"

/** The two backdrops every contrast reading is taken against. */
export const WHITE = "#ffffff"
export const BLACK = "#000000"

/**
 * Where the optional third contrast reading starts: a dark slate, because the
 * backdrop people actually want to test against is their own dark theme.
 */
export const DEFAULT_COMPARISON_BACKDROP = "#0f172a"

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

/** Beyond five stops a gradient stops being a scheme and starts being noise. */
export const MAX_GRADIENT_STOPS = 5
export const MIN_GRADIENT_STOPS = 2

/** How long a copy button says "copied". */
export const COPIED_FEEDBACK_MS = 2000

/**
 * The questions the page both RENDERS and publishes as structured data. One
 * list, so the markup can never describe a FAQ the visitor cannot see.
 */
export const FAQ_KEYS = ["formats", "contrast", "privacy", "export"] as const

/** The rows of the static format reference under the tool. */
export const REFERENCE_FORMATS = [
  "hex",
  "rgb",
  "hsl",
  "oklch",
  "oklab",
  "lch",
  "lab"
] as const

/**
 * The alpha checkerboard, drawn from tokens so it follows the theme. Two
 * 45°-offset gradients at 16px is the conventional transparency backdrop —
 * without it a translucent swatch is indistinguishable from an opaque one
 * sitting on the card.
 */
export const CHECKERBOARD_STYLE = {
  backgroundImage:
    "linear-gradient(45deg, var(--muted) 25%, transparent 25%), linear-gradient(-45deg, var(--muted) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, var(--muted) 75%), linear-gradient(-45deg, transparent 75%, var(--muted) 75%)",
  backgroundSize: "16px 16px",
  backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0px"
} as const
