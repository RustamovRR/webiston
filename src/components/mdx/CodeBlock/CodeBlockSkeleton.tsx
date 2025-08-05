import { cn } from '@/lib/'

interface CodeBlockSkeletonProps {
  codeString: string
  className?: string
}

export const CodeBlockSkeleton = ({ codeString, className }: CodeBlockSkeletonProps) => {
  const lines = codeString.split('\n')
  // Limit for performance
  const displayLines = lines.slice(0, 30)

  return (
    <div className={cn('rounded-lg border p-4 pt-6 dark:border-[#2C2C2E] dark:bg-[#0A0A0A]', className)}>
      {displayLines.map((line, i) => {
        // Indent: count leading spaces/tabs
        const match = line.match(/^(\s*)/)
        const indentSpaces = match ? match[1].replace(/\t/g, '    ').length : 0
        // Each space = 0.6em
        const marginLeft = indentSpaces * 0.6
        // Width: proportional to line length, but not too small/large
        const widthEm = Math.max(2, Math.min(40, line.length * 0.6))
        const isEmpty = line.trim() === ''

        return (
          <div
            key={i}
            className={cn(
              'mb-2.5 animate-pulse rounded bg-gray-200 transition-all duration-300 dark:bg-gray-700',
              isEmpty && 'animate-none opacity-0',
            )}
            style={{
              width: isEmpty ? '40%' : `${widthEm}em`,
              height: '1em',
              marginLeft: `${marginLeft}em`,
            }}
          />
        )
      })}
    </div>
  )
}
