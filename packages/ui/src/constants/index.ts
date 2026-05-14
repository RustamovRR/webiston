// UI Design Constants for shared components

// Color themes for different tool categories
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

// Component design patterns
export const UI_PATTERNS = {
  GLASS_PANEL:
    "rounded-xl bg-zinc-900/80 backdrop-blur-sm border border-zinc-800/50 shadow-2xl",
  CONTROL_PANEL:
    "rounded-lg bg-zinc-900/60 p-4 backdrop-blur-sm border border-zinc-800/30",

  INPUT_PANEL: {
    container:
      "flex flex-col rounded-xl bg-zinc-900/80 shadow-xl backdrop-blur-sm border border-zinc-800/50",
    header:
      "flex h-14 items-center justify-between border-b border-zinc-800 px-4 bg-zinc-800/50",
    content: "relative flex-grow",
    footer:
      "flex justify-between border-t border-zinc-800 bg-zinc-800/30 px-4 py-3"
  },

  TERMINAL_PANEL: {
    container:
      "flex flex-col rounded-xl bg-zinc-900/80 shadow-2xl backdrop-blur-sm border border-zinc-800/50",
    header:
      "flex h-16 items-center justify-between border-b border-zinc-800 px-4 bg-zinc-800/50",
    dots: "flex items-center gap-2",
    content: "relative flex-grow",
    footer:
      "flex justify-between border-t border-zinc-800 bg-zinc-800/30 px-4 py-3"
  },

  SWITCH_CONTAINER:
    "flex rounded-lg dark:bg-zinc-800/50 p-1 border dark:border-zinc-700/50",
  SWITCH_BUTTON_ACTIVE:
    "bg-gradient-to-r text-white shadow-lg transform scale-105",
  SWITCH_BUTTON_INACTIVE:
    "text-zinc-300 hover:text-zinc-100 hover:bg-zinc-700/50",

  SAMPLE_BUTTON_ACTIVE: "text-xs transition-all transform hover:scale-105",
  SAMPLE_BUTTON_INACTIVE:
    "border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:border-zinc-600"
}
