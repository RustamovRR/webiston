"use client"

import React from "react"
import { X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useTranslations } from "next-intl"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/shared/CopyButton"
import { StatsDisplay } from "@/components/shared/StatsDisplay"
import { MACOS_DOTS } from "@/constants/ui-constants"
import { cn } from "@/lib"

export interface TerminalInputAction {
  type: "clear" | "copy" | "download" | "custom"
  icon?: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  tooltip?: string
  text?: string // for copy action
  component?: React.ReactNode // for custom action
}

export interface TerminalInputProps {
  // Content
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
  readOnly?: boolean
  customContent?: React.ReactNode

  // Header
  title: string
  subtitle?: string
  titleRight?: React.ReactNode

  // Actions
  actions?: TerminalInputAction[]
  showStats?: boolean
  stats?: Array<{ label: string; value: number }>
  statsPosition?: "header" | "footer" | "both"

  // Styling
  className?: string
  headerClassName?: string
  contentClassName?: string
  variant?: "default" | "success" | "warning" | "error" | "info" | "dynamic"

  // Behavior
  disabled?: boolean
  loading?: boolean
  minHeight?: string
  maxHeight?: string

  // Animation
  showShadow?: boolean
  animate?: boolean

  // Dynamic color props
  dynamicColor?: string
  dynamicOpacity?: number
}

const variantStyles = {
  default: {
    border: "border-zinc-200 dark:border-zinc-800/30",
    bg: "bg-white/80 dark:bg-zinc-900/60",
    header: "bg-zinc-100/50 dark:bg-zinc-800/50",
    footer: "bg-zinc-100/30 dark:bg-zinc-800/30"
  },
  success: {
    border: "border-green-200 dark:border-green-800/30",
    bg: "bg-green-50/80 dark:bg-green-900/10",
    header: "bg-green-100/50 dark:bg-green-800/20",
    footer: "bg-green-100/30 dark:bg-green-800/10"
  },
  warning: {
    border: "border-amber-200 dark:border-amber-800/30",
    bg: "bg-amber-50/80 dark:bg-amber-900/10",
    header: "bg-amber-100/50 dark:bg-amber-800/20",
    footer: "bg-amber-100/30 dark:bg-amber-800/10"
  },
  error: {
    border: "border-red-200 dark:border-red-800/30",
    bg: "bg-red-50/80 dark:bg-red-900/10",
    header: "bg-red-100/50 dark:bg-red-800/20",
    footer: "bg-red-100/30 dark:bg-red-800/10"
  },
  info: {
    border: "border-blue-200 dark:border-blue-800/30",
    bg: "bg-blue-50/80 dark:bg-blue-900/10",
    header: "bg-blue-100/50 dark:bg-blue-800/20",
    footer: "bg-blue-100/30 dark:bg-blue-800/10"
  },
  dynamic: {
    border: "",
    bg: "",
    header: "",
    footer: ""
  }
}

const getRGBFromColor = (color: string): [number, number, number] => {
  try {
    const canvas = document.createElement("canvas")
    canvas.width = canvas.height = 1
    const ctx = canvas.getContext("2d")!
    ctx.fillStyle = color
    ctx.fillRect(0, 0, 1, 1)
    const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
    return [r, g, b]
  } catch {
    return [59, 130, 246] // fallback blue color
  }
}

// Dynamic styles generator
const getDynamicStyles = (color: string, opacity: number = 1) => {
  const [r, g, b] = getRGBFromColor(color)

  return {
    borderColor: `rgba(${r}, ${g}, ${b}, ${Math.min(opacity * 0.3, 0.3)})`,
    backgroundColor: `rgba(${r}, ${g}, ${b}, ${Math.min(opacity * 0.05, 0.05)})`,
    "--header-bg": `rgba(${r}, ${g}, ${b}, ${Math.min(opacity * 0.1, 0.1)})`,
    "--footer-bg": `rgba(${r}, ${g}, ${b}, ${Math.min(opacity * 0.08, 0.08)})`
  } as React.CSSProperties
}

export const TerminalInput: React.FC<TerminalInputProps> = ({
  value = "",
  onChange,
  placeholder,
  readOnly = false,
  customContent,
  title,
  subtitle,
  titleRight,
  actions = [],
  showStats = false,
  stats = [],
  statsPosition = "header",
  className,
  headerClassName,
  contentClassName,
  variant = "default",
  disabled = false,
  loading = false,
  minHeight = "120px",
  maxHeight,
  showShadow = false,
  animate = true,
  dynamicColor,
  dynamicOpacity = 1
}) => {
  const tCommon = useTranslations("Common")
  const styles = variantStyles[variant]

  const dynamicStyles =
    variant === "dynamic" && dynamicColor
      ? getDynamicStyles(dynamicColor, dynamicOpacity)
      : {}

  const renderAction = (action: TerminalInputAction, index: number) => {
    if (action.type === "custom" && action.component) {
      return <div key={index}>{action.component}</div>
    }

    if (action.type === "copy") {
      return (
        <CopyButton
          key={index}
          text={action.text || value}
          disabled={action.disabled || !value || loading}
        />
      )
    }

    if (action.type === "clear") {
      return (
        <AnimatePresence key={index}>
          {value.length > 0 && (
            <motion.div
              initial={animate ? { opacity: 0, scale: 0.8 } : {}}
              animate={animate ? { opacity: 1, scale: 1 } : {}}
              exit={animate ? { opacity: 0, scale: 0.8 } : {}}
            >
              <Button
                onClick={action.onClick}
                variant="ghost"
                size="sm"
                className="text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                title={action.tooltip || tCommon("clear")}
                disabled={action.disabled || disabled || loading}
              >
                {action.icon || <X size={18} />}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      )
    }

    return (
      <Button
        key={index}
        onClick={action.onClick}
        variant="ghost"
        size="sm"
        className="text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
        title={action.tooltip}
        disabled={action.disabled || disabled || loading}
      >
        {action.icon}
      </Button>
    )
  }

  return (
    <div
      className={cn(
        "rounded-lg border backdrop-blur-sm transition-all duration-200",
        styles.border,
        styles.bg,
        showShadow && "shadow-lg hover:shadow-xl",
        className
      )}
      style={variant === "dynamic" ? dynamicStyles : {}}
    >
      {/* Header */}
      <div
        className={cn(
          "flex items-center justify-between border-b border-zinc-200 px-4 py-3 dark:border-zinc-800",
          styles.header,
          headerClassName
        )}
      >
        <div className="flex items-center gap-2">
          {/* MacOS Dots */}
          <div className="flex gap-1.5">
            {MACOS_DOTS.map((dot, index) => (
              <div
                key={index}
                className={cn(
                  "h-3 w-3 rounded-full transition-all duration-200",
                  dot.color,
                  animate && "hover:scale-110"
                )}
              />
            ))}
          </div>

          <div className="ml-2">
            <span className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
              {title}
            </span>
            {subtitle && (
              <div className="text-xs text-zinc-500 dark:text-zinc-400">
                {subtitle}
              </div>
            )}
          </div>
        </div>

        {/* Title Right and Actions - separate for proper justify-between */}
        <div className="flex items-center gap-2">
          {titleRight && <div className="flex items-center">{titleRight}</div>}

          {/* Stats in Header */}
          {showStats &&
            stats.length > 0 &&
            (statsPosition === "header" || statsPosition === "both") && (
              <StatsDisplay stats={stats} />
            )}

          {/* Actions */}
          {actions.map((action, index) => renderAction(action, index))}
        </div>
      </div>

      {/* Content */}
      <div
        className={cn("relative", contentClassName)}
        style={{
          minHeight,
          maxHeight
        }}
      >
        {customContent ? (
          customContent
        ) : readOnly ? (
          <div className="p-4">
            <pre className="font-mono text-sm break-all whitespace-pre-wrap text-zinc-900 dark:text-zinc-100">
              {value}
            </pre>
          </div>
        ) : (
          <Textarea
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={placeholder}
            className="h-full resize-none border-0 bg-transparent font-mono text-sm text-zinc-900 placeholder-zinc-500 focus-visible:ring-0 dark:text-zinc-100 dark:placeholder-zinc-500"
            disabled={disabled || loading}
            style={{
              minHeight,
              maxHeight
            }}
          />
        )}

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-zinc-900/50">
            <div className="text-sm text-zinc-500 dark:text-zinc-400">
              {tCommon("processing")}
            </div>
          </div>
        )}
      </div>

      {/* Footer (optional) */}
      {showStats &&
        stats.length > 0 &&
        (statsPosition === "footer" || statsPosition === "both") && (
          <div
            className={cn(
              "flex items-center justify-end border-t border-zinc-200 px-4 py-3 dark:border-zinc-800",
              styles.footer
            )}
          >
            <StatsDisplay stats={stats} />
          </div>
        )}
    </div>
  )
}

export default TerminalInput
