'use client'

import { ArrowLeftRight } from 'lucide-react'
import { ShimmerButton } from '@/components/ui'
import { Panel } from './Panel'
import { cn } from '@/lib'
import type { UniversalDualPanelProps } from '@/types/panel'

export function UniversalDualPanel({
  sourcePanel,
  targetPanel,
  swapConfig,
  layout = 'horizontal',
  gap = 'md',
  variant = 'terminal',
  gridConfig,
  className,
}: UniversalDualPanelProps) {
  const gapClass = {
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
  }[gap]

  const layoutClass =
    layout === 'vertical'
      ? 'flex flex-col'
      : gridConfig
        ? `grid ${gridConfig.mobile || 'grid-cols-1'} ${gridConfig.tablet || 'md:grid-cols-2'} ${gridConfig.desktop || 'lg:grid-cols-2'}`
        : 'grid gap-6 lg:grid-cols-2'

  return (
    <div className={cn('relative', layoutClass, gapClass, className)}>
      {/* Source Panel */}
      <Panel
        header={sourcePanel.header}
        content={sourcePanel.content}
        footer={sourcePanel.footer}
        className={sourcePanel.className}
      />

      {/* Swap Button */}
      {swapConfig?.show && swapConfig.onClick && (
        <div
          className={cn(
            'flex justify-center',
            layout === 'horizontal'
              ? 'lg:absolute lg:top-1/2 lg:left-1/2 lg:z-10 lg:-translate-x-1/2 lg:-translate-y-1/2'
              : 'my-2',
          )}
        >
          <ShimmerButton
            onClick={swapConfig.onClick}
            variant="outline"
            size="icon"
            className="h-12 w-12 rounded-full border-2 border-zinc-700 bg-zinc-900/90 shadow-xl backdrop-blur-sm hover:border-indigo-500/50 hover:bg-zinc-800/90"
            title="Almashtirish"
            disabled={swapConfig.disabled}
          >
            {swapConfig.icon || <ArrowLeftRight size={20} className="text-zinc-300" />}
          </ShimmerButton>
        </div>
      )}

      {/* Target Panel */}
      <Panel
        header={targetPanel.header}
        content={targetPanel.content}
        footer={targetPanel.footer}
        className={targetPanel.className}
      />
    </div>
  )
}
