import React from "react"
import { Button } from "./button"
import { cn } from "@/lib"
import { TOOL_COLORS, UI_PATTERNS } from "@/constants/ui-constants"

interface ModeSwitchOption {
  value: string
  label: string
  icon?: React.ReactNode
}

interface ModeSwitchProps {
  options: ModeSwitchOption[]
  value: string
  onChange: (value: string) => void
  toolCategory?: "converters" | "generators" | "utilities"
  className?: string
  size?: "sm" | "md" | "lg"
}

export const ModeSwitch: React.FC<ModeSwitchProps> = ({
  options,
  value,
  onChange,
  toolCategory = "converters",
  className,
  size = "sm"
}) => {
  const colors =
    TOOL_COLORS[toolCategory.toUpperCase() as keyof typeof TOOL_COLORS]

  const sizeClasses = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-2.5 text-base",
    lg: "px-6 py-3 text-lg"
  }

  return (
    <div className={cn(UI_PATTERNS.SWITCH_CONTAINER, className)}>
      {options.map((option) => {
        const isActive = value === option.value

        return (
          <Button
            key={option.value}
            onClick={() => onChange(option.value)}
            variant="ghost"
            size="sm"
            className={cn(
              "relative cursor-pointer transition-all duration-300 ease-out",
              sizeClasses[size],
              isActive
                ? cn(
                    UI_PATTERNS.SWITCH_BUTTON_ACTIVE,
                    `bg-gradient-to-r ${colors.primary}`,
                    "hover:from-blue-600 hover:to-indigo-700" // Dynamic hover will be added
                  )
                : cn(UI_PATTERNS.SWITCH_BUTTON_INACTIVE, "hover:bg-zinc-700/50")
            )}
            style={
              isActive
                ? ({
                    backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
                    "--tw-gradient-from": colors.primary.includes("blue")
                      ? "#3b82f6"
                      : colors.primary.includes("purple")
                        ? "#8b5cf6"
                        : "#10b981",
                    "--tw-gradient-to": colors.primary.includes("blue")
                      ? "#4f46e5"
                      : colors.primary.includes("purple")
                        ? "#ec4899"
                        : "#0d9488"
                  } as React.CSSProperties)
                : undefined
            }
          >
            <div className="flex items-center gap-2">
              {option.icon && (
                <span
                  className={cn(
                    "transition-colors",
                    isActive ? "text-white" : "text-zinc-400"
                  )}
                >
                  {option.icon}
                </span>
              )}
              <span
                className={cn(
                  "font-medium transition-colors",
                  isActive ? "text-white" : "text-zinc-300"
                )}
              >
                {option.label}
              </span>
            </div>
          </Button>
        )
      })}
    </div>
  )
}
