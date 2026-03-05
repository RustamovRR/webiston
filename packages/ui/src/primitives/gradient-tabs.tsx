"use client"

/**
 * GradientTabs Component
 * Animated tab switcher with gradient backgrounds
 * Uses CSS transitions for smooth, performant animations on all devices
 */

import { TOOL_COLORS, UI_PATTERNS } from "@/constants/ui-constants"
import { cn } from "../utils/cn"

export interface TabOption {
  value: string
  label: string
  icon?: React.ReactNode
}

export interface GradientTabsProps {
  options: TabOption[]
  value: string
  onChange: (value: string) => void
  toolCategory?: "converters" | "generators" | "utilities"
  size?: "sm" | "md" | "lg"
  disabled?: boolean
}

export function GradientTabs({
  options,
  value,
  onChange,
  toolCategory = "converters",
  size = "md",
  disabled = false
}: GradientTabsProps) {
  const colors =
    TOOL_COLORS[toolCategory.toUpperCase() as keyof typeof TOOL_COLORS]

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-sm",
    lg: "px-6 py-3 text-base"
  }

  const sizeClassContainer = {
    sm: "p-1",
    md: "p-1",
    lg: "p-1.5"
  }

  return (
    <div
      role="tablist"
      className={cn(
        "gap-1",
        UI_PATTERNS.SWITCH_CONTAINER,
        sizeClassContainer[size]
      )}
    >
      {options.map((option) => {
        const isActive = value === option.value

        return (
          <button
            key={option.value}
            role="tab"
            aria-selected={isActive}
            onClick={() => !disabled && onChange(option.value)}
            disabled={disabled}
            className={cn(
              "group relative cursor-pointer overflow-hidden rounded-md font-medium",
              // Smooth CSS transition - works great on all devices
              "transition-all duration-200 ease-out",
              sizeClasses[size],
              disabled && "cursor-not-allowed opacity-50",
              isActive
                ? "text-white shadow-lg"
                : [
                    "text-zinc-600 hover:bg-zinc-500/10",
                    "dark:text-zinc-300 dark:hover:bg-zinc-700/50 dark:hover:text-zinc-100"
                  ]
            )}
            style={isActive ? { background: colors.shimmerBg } : undefined}
          >
            {/* Shimmer effect for active tab - CSS only */}
            {isActive && (
              <div
                className="absolute inset-0 animate-shimmer rounded-md bg-linear-to-r from-transparent via-white/10 to-transparent"
                aria-hidden="true"
              />
            )}

            {/* Content */}
            <span className="relative z-10 flex items-center gap-2">
              {option.icon && (
                <span
                  className={cn(
                    "transition-colors duration-200",
                    isActive ? "text-white" : "text-zinc-400"
                  )}
                  aria-hidden="true"
                >
                  {option.icon}
                </span>
              )}
              <span>{option.label}</span>
            </span>

            {/* Inner highlight for depth */}
            {isActive && (
              <div
                className="pointer-events-none absolute inset-0 rounded-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]"
                aria-hidden="true"
              />
            )}
          </button>
        )
      })}
    </div>
  )
}

export default GradientTabs
