'use client'

import { cn } from '@/lib'
import { useTheme } from 'next-themes'
import { ReactNode, useLayoutEffect, useState } from 'react'
import { highlight } from './highlight'
import { CopyButton } from '@/components/shared'
import { CodeBlockSkeleton } from './CodeBlockSkeleton'

export default function CodeBlock({ children }: { children?: any }) {
  const [nodes, setNodes] = useState<ReactNode | string | null>(children)
  const { theme, resolvedTheme } = useTheme()
  const [isLoading, setIsLoading] = useState(true)

  const codeString = String(children || '').trim()

  useLayoutEffect(() => {
    setIsLoading(true)

    const currentTheme = theme === 'system' ? resolvedTheme : theme
    if (!currentTheme || !codeString) {
      setNodes(null)
      setIsLoading(false)
      return
    }

    async function highlightCode() {
      try {
        const highlighted = await highlight(children, 'ts', theme)
        setNodes(highlighted)
      } finally {
        setIsLoading(false)
      }
    }
    void highlightCode()
  }, [children, theme])

  if (isLoading) {
    return codeString ? <CodeBlockSkeleton codeString={codeString} /> : null
  }

  return (
    <div className={cn('group relative rounded-lg border bg-white py-2 dark:border-[#2C2C2E] dark:bg-[#0A0A0A]')}>
      {codeString && (
        <div className={cn('absolute top-2 right-2 z-10')}>
          <CopyButton text={codeString} />
        </div>
      )}

      <div className={cn('overflow-auto rounded-lg')}>{nodes}</div>
    </div>
  )
}
