import React, { CSSProperties, ComponentPropsWithoutRef } from 'react'

import { cn } from '@/lib'

export interface ShimmerButtonProps extends ComponentPropsWithoutRef<'button'> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  shimmerColor?: string
  shimmerSize?: string
  borderRadius?: string
  shimmerDuration?: string
  background?: string
  className?: string
  children?: React.ReactNode
}

export const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      variant = 'default',
      size = 'default',
      shimmerColor = '#6366f1',
      shimmerSize = '0.1em',
      shimmerDuration = '2s',
      borderRadius = '0.5rem',
      background,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const getVariantStyles = () => {
      switch (variant) {
        case 'destructive':
          return {
            bg: 'linear-gradient(135deg, #dc2626, #b91c1c)',
            shimmer: '#fecaca',
            border: 'border-red-500/20',
            text: 'text-white',
          }
        case 'outline':
          return {
            bg: 'rgba(39, 39, 42, 0.8)',
            shimmer: '#a1a1aa',
            border: 'border-zinc-700',
            text: 'text-zinc-300',
          }
        case 'secondary':
          return {
            bg: 'linear-gradient(135deg, #3f3f46, #52525b)',
            shimmer: '#d4d4d8',
            border: 'border-zinc-600/20',
            text: 'text-zinc-100',
          }
        case 'ghost':
          return {
            bg: 'rgba(39, 39, 42, 0.4)',
            shimmer: '#71717a',
            border: 'border-transparent',
            text: 'text-zinc-300 hover:text-zinc-100',
          }
        default:
          return {
            bg: 'linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4)',
            shimmer: '#c7d2fe',
            border: 'border-indigo-500/20',
            text: 'text-white',
          }
      }
    }

    const getSizeStyles = () => {
      switch (size) {
        case 'sm':
          return 'h-8 px-3 text-xs'
        case 'lg':
          return 'h-12 px-8 text-base'
        case 'icon':
          return 'h-9 w-9 p-0'
        default:
          return 'h-10 px-6 text-sm'
      }
    }

    const variantStyles = getVariantStyles()
    const actualBackground = background || variantStyles.bg

    return (
      <button
        className={cn(
          // Base styles
          'group relative inline-flex cursor-pointer items-center justify-center overflow-hidden rounded-lg font-medium transition-all duration-300 ease-in-out',
          'focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 focus-visible:outline-none',
          'disabled:pointer-events-none disabled:cursor-not-allowed disabled:border disabled:border-zinc-300 disabled:!bg-inherit disabled:text-zinc-500 disabled:opacity-50',
          'dark:disabled:border-zinc-600 dark:disabled:text-zinc-400',

          // Size styles
          getSizeStyles(),

          // Variant-specific styles
          variantStyles.border,
          variantStyles.text,

          // Interactive states
          'transform-gpu hover:scale-[1.02] active:translate-y-px active:scale-[0.98]',

          className
        )}
        style={
          {
            background: actualBackground,
            '--shimmer-color': shimmerColor || variantStyles.shimmer,
            '--radius': borderRadius,
            '--speed': shimmerDuration,
            '--cut': shimmerSize,
            '--bg': actualBackground,
            ...(props as any).style,
          } as CSSProperties
        }
        ref={ref}
        {...props}
      >
        {/* Shimmer effect */}
        <div className="absolute inset-0 rounded-lg">
          <div className="absolute inset-0 animate-[shimmer_2s_ease-in-out_infinite] rounded-lg bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        </div>

        {/* Glow effect */}
        <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 opacity-0 blur transition-opacity duration-500 group-hover:opacity-100" />

        {/* Content */}
        <span className="relative z-10 flex items-center gap-2">{children}</span>

        {/* Inner shadow for depth */}
        <div className="pointer-events-none absolute inset-0 rounded-lg shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]" />
      </button>
    )
  }
)

ShimmerButton.displayName = 'ShimmerButton'
