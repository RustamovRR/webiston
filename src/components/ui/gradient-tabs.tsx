'use client'

import { cn } from '@/lib'
import { TOOL_COLORS, UI_PATTERNS } from '@/constants/ui-constants'

export interface TabOption {
  value: string
  label: string
  icon?: React.ReactNode
}

export interface GradientTabsProps {
  options: TabOption[]
  value: string
  onChange: (value: string) => void
  toolCategory?: 'converters' | 'generators' | 'utilities'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
}

export const GradientTabs: React.FC<GradientTabsProps> = ({
  options,
  value,
  onChange,
  toolCategory = 'converters',
  size = 'md',
  disabled = false,
}) => {
  const colors = TOOL_COLORS[toolCategory.toUpperCase() as keyof typeof TOOL_COLORS]

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  }

  const sizeClassContainer = {
    sm: 'p-1',
    md: 'p-1',
    lg: 'p-1.5',
  }

  return (
    <div className={cn('gap-1', UI_PATTERNS.SWITCH_CONTAINER, sizeClassContainer[size])}>
      {options.map((option) => {
        const isActive = value === option.value

        return (
          <button
            key={option.value}
            onClick={() => !disabled && onChange(option.value)}
            disabled={disabled}
            className={cn(
              'group relative cursor-pointer overflow-hidden rounded-md font-medium transition-all duration-300 ease-in-out',
              sizeClasses[size],
              disabled && 'cursor-not-allowed opacity-50',
              isActive
                ? 'scale-[1.02] transform text-white shadow-lg'
                : 'text-zinc-600 hover:bg-zinc-500/10 dark:text-zinc-300 dark:hover:bg-zinc-700/50 dark:hover:text-zinc-100',
            )}
            style={
              isActive
                ? ({
                    background: colors.shimmerBg,
                  } as React.CSSProperties)
                : undefined
            }
          >
            {/* Shimmer effect for active tab */}
            {isActive && (
              <div className="absolute inset-0 rounded-md">
                <div className="absolute inset-0 animate-[shimmer_2s_ease-in-out_infinite] rounded-md bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </div>
            )}

            {/* Glow effect for active tab */}
            {isActive && (
              <div
                className={cn(
                  'absolute -inset-1 rounded-md opacity-0 blur transition-opacity duration-500 group-hover:opacity-100',
                  `bg-gradient-to-r ${colors.shimmerGlow}`,
                )}
              />
            )}

            <div className="relative z-10 flex items-center gap-2">
              {option.icon && (
                <span className={cn('transition-colors', isActive ? 'text-white' : 'text-zinc-400')}>
                  {option.icon}
                </span>
              )}
              <span className="font-medium">{option.label}</span>
            </div>

            {/* Inner shadow for depth on active tab */}
            {isActive && (
              <div className="pointer-events-none absolute inset-0 rounded-md shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]" />
            )}
          </button>
        )
      })}
    </div>
  )
}

export default GradientTabs
