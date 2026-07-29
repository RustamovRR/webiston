// Design constants owned by @webiston/ui.
//
// These moved here from src/constants/ui-constants.ts because packages/ui is
// their real owner: `mode-switch` and `gradient-tabs` are the primary consumers,
// and a package may never import app code via the `@/` alias. The app re-exports
// them from src/constants/ui-constants.ts so existing call sites keep working.
//
// ⚠️ These values are hardcoded Tailwind palette classes, which the design system
// forbids in components. They are moved verbatim here on purpose — converting
// them to semantic tokens is design Phase C, and mixing a move with a rewrite
// would make both unreviewable. See docs/roadmap/active.md.

// Color themes for different tool categories with shimmer-like gradients
export const TOOL_COLORS = {
  CONVERTERS: {
    primary: "from-indigo-500 via-purple-500 to-cyan-500",
    primaryHover: "from-indigo-600 via-purple-600 to-cyan-600",
    accent: "indigo-500",
    accentHover: "indigo-600",
    light: "indigo-400",
    border: "border-indigo-500",
    bg: "bg-indigo-600/20",
    text: "text-indigo-300",
    shimmerBg: "linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)",
    shimmerGlow: "from-indigo-500/20 via-purple-500/20 to-cyan-500/20"
  },
  GENERATORS: {
    primary: "from-emerald-500 via-teal-500 to-blue-500",
    primaryHover: "from-emerald-600 via-teal-600 to-blue-600",
    accent: "emerald-500",
    accentHover: "emerald-600",
    light: "emerald-400",
    border: "border-emerald-500",
    bg: "bg-emerald-600/20",
    text: "text-emerald-300",
    shimmerBg: "linear-gradient(135deg, #10b981, #14b8a6, #3b82f6)",
    shimmerGlow: "from-emerald-500/20 via-teal-500/20 to-blue-500/20"
  },
  UTILITIES: {
    primary: "from-violet-500 via-pink-500 to-orange-500",
    primaryHover: "from-violet-600 via-pink-600 to-orange-600",
    accent: "violet-500",
    accentHover: "violet-600",
    light: "violet-400",
    border: "border-violet-500",
    bg: "bg-violet-600/20",
    text: "text-violet-300",
    shimmerBg: "linear-gradient(135deg, #8b5cf6, #ec4899, #f97316)",
    shimmerGlow: "from-violet-500/20 via-pink-500/20 to-orange-500/20"
  }
}

// Component design patterns — SEMANTIC TOKENS ONLY.
//
// These were dark-only (`bg-zinc-900/80` with no light variant) and shipped to
// every tool, so every tool panel rendered as a dark slab in light mode. They now
// use semantic tokens, which means light/dark is handled by the token block and
// **no `dark:` variant is needed here** — that is the whole point of the tokens.
//
// `bg-card` for raised surfaces, `bg-muted` for recessed ones (headers/footers),
// `border-border` for every edge.
export const UI_PATTERNS = {
  // Panel styles
  // ⚠️ GLASS_PANEL / CONTROL_PANEL / SAMPLE_BUTTON_* currently have ZERO
  // consumers (verified by grep across src/ and packages/). Converted rather
  // than deleted because deletions need explicit approval.
  GLASS_PANEL:
    "rounded-xl bg-card/80 backdrop-blur-sm border border-border shadow-2xl",
  CONTROL_PANEL:
    "rounded-lg bg-card/60 p-4 backdrop-blur-sm border border-border",

  // Input/Output panels
  INPUT_PANEL: {
    container:
      "flex flex-col rounded-xl bg-card shadow-xl backdrop-blur-sm border border-border",
    header:
      "flex h-14 items-center justify-between border-b border-border px-4 bg-muted/50",
    content: "relative flex-grow",
    footer: "flex justify-between border-t border-border bg-muted/30 px-4 py-3"
  },

  // Terminal-style panels (with macOS dots)
  TERMINAL_PANEL: {
    container:
      "flex flex-col rounded-xl bg-card shadow-2xl backdrop-blur-sm border border-border",
    header:
      "flex h-16 items-center justify-between border-b border-border px-4 bg-muted/50",
    dots: "flex items-center gap-2",
    content: "relative flex-grow",
    footer: "flex justify-between border-t border-border bg-muted/30 px-4 py-3"
  },

  // Switch button styles.
  // ACTIVE pairs `bg-gradient-to-r` with a TOOL_COLORS gradient supplied by the
  // caller, so the text colour must be the on-primary foreground.
  SWITCH_CONTAINER: "flex rounded-lg bg-muted p-1 border border-border",
  SWITCH_BUTTON_ACTIVE:
    "bg-gradient-to-r text-primary-foreground shadow-lg transform scale-105",
  SWITCH_BUTTON_INACTIVE:
    "text-muted-foreground hover:text-foreground hover:bg-accent",

  // Sample button styles
  SAMPLE_BUTTON_ACTIVE: "text-xs transition-all transform hover:scale-105",
  SAMPLE_BUTTON_INACTIVE:
    "border-border text-muted-foreground hover:text-foreground hover:border-input"
}
