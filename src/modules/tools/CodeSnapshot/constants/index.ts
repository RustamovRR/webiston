import type { Background, SnapshotOptions, ThemePalette } from "../types"
import palette from "./theme-palette.json"

/**
 * Geometry of the window chrome.
 *
 * Named for what they mean, not what they equal — `code-rules.md` §14. Every
 * one of these is a pixel value at scale 1; the exporter multiplies.
 */
/** Breathing room between the card's edge and the first glyph. */
export const WINDOW_INSET = 20
/** The macOS title bar. Three dots plus the filename sit inside it. */
export const TITLE_BAR_HEIGHT = 40
/** Radius of the card. Matches the site's `--radius-lg` in feel, not value. */
export const WINDOW_RADIUS = 12
/** Gap between the line-number column and the code. */
export const GUTTER_GAP = 16
/** The three macOS dots. */
export const DOT_RADIUS = 6
export const DOT_GAP = 8
export const DOT_INSET = 18
/** The filename in the macOS bar. Not the code's size — chrome, not content. */
export const TITLE_FONT_SIZE = 13

/**
 * Right edge of the last traffic-light dot, measured from the card's left.
 *
 * Derived from the three constants above rather than written as `64`, because
 * the painter positions the dots from the same numbers and the two must not be
 * able to drift.
 */
export const DOTS_WIDTH =
  DOT_INSET + 2 * (DOT_RADIUS * 2 + DOT_GAP) + DOT_RADIUS
/** Traffic-light colours. Brand-illustration exception in `code-rules.md` §11. */
export const MACOS_DOTS = ["#FF5F57", "#FEBC2E", "#28C840"] as const

/**
 * What Tab inserts.
 *
 * Two spaces, not a tab character: the canvas advances by measured width and
 * has no tab stops, so a literal \t would draw as one blank of whatever width
 * the font gives it and the picture would not match any editor.
 */
export const INDENT = "  "

/** Opacity applied to lines outside `focusLines`. */
export const DIMMED_OPACITY = 0.35

/**
 * Ink and paper for the split second before a theme has loaded, and for the
 * tokens a theme declines to colour.
 *
 * These are CANVAS colours, not interface colours, which is why they are hex
 * rather than semantic tokens — see the chart/brand-illustration exception in
 * `code-rules.md` §11. The exported PNG has to look the same whether the
 * visitor is reading the site in light or dark mode.
 */
/**
 * The ink `canvas-limits.ts` draws with when probing how large a canvas this
 * engine will allocate. Not a design decision — it is written at the far edge
 * and read straight back, and opaque white is simply the easiest value to
 * assert on.
 */
export const PROBE_INK = "#ffffff"

export const FALLBACK_FOREGROUND = "#e6e6e6"
export const FALLBACK_BACKGROUND = "#101010"

/**
 * Export scales offered in the UI.
 *
 * 2 is the default because a 1x PNG of an 18px font looks soft the moment it
 * is dropped into a retina README or a slide.
 */
export const EXPORT_SCALES = [1, 2, 3] as const
export type ExportScale = (typeof EXPORT_SCALES)[number]
export const DEFAULT_EXPORT_SCALE: ExportScale = 2

/**
 * The four faces, loaded through `next/font/google` on this route only.
 *
 * Each was checked for a `cyrillic` subset against
 * `next/dist/compiled/@next/font/dist/google/index.d.ts` — the audience writes
 * comments in Cyrillic and a missing subset means tofu in the export.
 *
 * `cssVariable` is filled in by the route, which owns the font instances; this
 * list only names them so the picker and the layout agree on the order.
 */
export const CODE_FONTS = [
  { id: "jetbrains-mono", label: "JetBrains Mono", ligatures: true },
  { id: "fira-code", label: "Fira Code", ligatures: true },
  { id: "geist-mono", label: "Geist Mono", ligatures: false },
  { id: "ibm-plex-mono", label: "IBM Plex Mono", ligatures: false }
] as const

export type CodeFontId = (typeof CODE_FONTS)[number]["id"]
export const DEFAULT_FONT: CodeFontId = "jetbrains-mono"

/** Sizes the picker offers. Below 12 the export stops being readable. */
export const FONT_SIZES = [12, 13, 14, 16, 18, 20, 24] as const
export const LINE_HEIGHTS = [1.4, 1.5, 1.6, 1.8, 2] as const
export const PADDINGS = [16, 32, 64, 96, 128] as const

/**
 * Gradient presets.
 *
 * The documented chart/brand-illustration exception to the token rule
 * (`code-rules.md` §11): these are picture content, not interface colour, so
 * they are literals — but named literals in one place, never inline.
 */
export const BACKGROUND_PRESETS: readonly { id: string; value: Background }[] =
  [
    {
      id: "midnight",
      value: { kind: "gradient", from: "#0f172a", to: "#334155", angle: 135 }
    },
    {
      id: "sunset",
      value: { kind: "gradient", from: "#f97316", to: "#db2777", angle: 135 }
    },
    {
      id: "meadow",
      value: { kind: "gradient", from: "#059669", to: "#65a30d", angle: 135 }
    },
    {
      id: "ocean",
      value: { kind: "gradient", from: "#0ea5e9", to: "#6366f1", angle: 135 }
    },
    {
      id: "ember",
      value: { kind: "gradient", from: "#7c3aed", to: "#db2777", angle: 135 }
    },
    { id: "slate", value: { kind: "solid", from: "#1e293b" } },
    { id: "paper", value: { kind: "solid", from: "#f8fafc" } },
    { id: "none", value: { kind: "none", from: "transparent" } }
  ] as const

export const DEFAULT_OPTIONS: SnapshotOptions = {
  fontFamily: "",
  fontSize: 14,
  lineHeight: 1.6,
  padding: 64,
  frame: "macos",
  title: "",
  showLineNumbers: false,
  firstLineNumber: 1,
  background: BACKGROUND_PRESETS[0].value,
  focusLines: []
}

/**
 * The themes people actually name, first in the picker.
 *
 * Ids only. The label and the colours come from the generated palette below —
 * an earlier version carried its own labels here and they had already drifted
 * ("Dracula" against Shiki's "Dracula Theme", "SynthWave '84" against
 * "Synthwave '84"), which is what a second source of truth always costs.
 */
const FEATURED_THEME_IDS = [
  "github-dark-default",
  "github-light-default",
  "catppuccin-mocha",
  "catppuccin-latte",
  "dracula",
  "tokyo-night",
  "one-dark-pro",
  "vitesse-dark",
  "vitesse-light",
  "rose-pine",
  "kanagawa-wave",
  "everforest-dark",
  "nord",
  "monokai",
  "night-owl",
  "synthwave-84",
  "vesper",
  "poimandres",
  "ayu-dark",
  "gruvbox-dark-medium"
]

/**
 * All 65 bundled themes with their real colours, featured ones first.
 *
 * ~16 KB of generated JSON — the whole reason the swatches are affordable. The
 * alternative is importing 65 theme modules at ~16–24 KB each just to draw a
 * coloured rectangle, which would undo the lazy loading in `utils/highlight.ts`
 * that the rest of this tool is built around.
 *
 * Regenerate with `pnpm themes` after a Shiki upgrade; `pnpm themes --check`
 * fails the gate when the two have drifted apart.
 */
export const THEME_PALETTES: readonly ThemePalette[] = [
  ...FEATURED_THEME_IDS.map((id) =>
    palette.themes.find((theme) => theme.id === id)
  ).filter((theme) => theme !== undefined),
  ...palette.themes.filter((theme) => !FEATURED_THEME_IDS.includes(theme.id))
]

export const DEFAULT_THEME = "github-dark-default"
export const DEFAULT_LANGUAGE = "typescript"
