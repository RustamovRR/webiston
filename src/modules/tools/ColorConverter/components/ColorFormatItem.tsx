import React, { useState } from 'react'
import { Check, Copy } from 'lucide-react'

interface ColorFormatItemProps {
  title: string
  value: string
  description: string
  colorClass: string
  onCopy?: (value: string) => void
}

const ColorFormatItem: React.FC<ColorFormatItemProps> = ({ title, value, description, colorClass, onCopy }) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e?: React.MouseEvent) => {
    e?.stopPropagation() // Prevent event bubbling when clicking copy button

    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      onCopy?.(value)

      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const handleItemClick = () => {
    handleCopy()
  }

  return (
    <div
      onClick={handleItemClick}
      className="group cursor-pointer rounded-lg border border-zinc-200 bg-zinc-50 p-3 transition-all hover:bg-zinc-100 hover:shadow-sm active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:bg-zinc-800/70"
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className={`font-semibold ${colorClass}`}>{title}</h3>
        <button
          onClick={handleCopy}
          className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-200 text-zinc-600 opacity-0 transition-all group-hover:opacity-100 hover:bg-zinc-300 dark:bg-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-600"
          title="Copy to clipboard"
        >
          {copied ? <Check size={14} className="text-green-600 dark:text-green-400" /> : <Copy size={14} />}
        </button>
      </div>
      <div className="font-mono text-base text-zinc-900 dark:text-zinc-100">{value}</div>
      <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{description}</div>
    </div>
  )
}

export default ColorFormatItem
