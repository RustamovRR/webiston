import { Check, Copy } from "lucide-react"
import type React from "react"
import { useState } from "react"

interface ColorFormatItemProps {
  title: string
  value: string
  description: string
  colorClass: string
  onCopy?: (value: string) => void
}

const ColorFormatItem: React.FC<ColorFormatItemProps> = ({
  title,
  value,
  description,
  colorClass,
  onCopy
}) => {
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
      console.error("Failed to copy:", error)
    }
  }

  const handleItemClick = () => {
    handleCopy()
  }

  return (
    <button
      type="button"
      onClick={handleItemClick}
      aria-label={`${title}: ${value} — copy`}
      className="group focus-visible:ring-ring w-full cursor-pointer rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-left transition-all hover:bg-zinc-100 hover:shadow-sm focus-visible:ring-2 focus-visible:outline-none active:scale-[0.98] dark:border-zinc-700 dark:bg-zinc-800/50 dark:hover:bg-zinc-800/70"
    >
      <div className="mb-2 flex items-center justify-between">
        <h3 className={`font-semibold ${colorClass}`}>{title}</h3>
        <span
          aria-hidden="true"
          className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-200 text-zinc-600 opacity-0 transition-all group-hover:opacity-100 dark:bg-zinc-700 dark:text-zinc-300"
        >
          {copied ? (
            <Check size={14} className="text-green-600 dark:text-green-400" />
          ) : (
            <Copy size={14} />
          )}
        </span>
      </div>
      <div className="font-mono text-base text-zinc-900 dark:text-zinc-100">
        {value}
      </div>
      <div className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
        {description}
      </div>
    </button>
  )
}

export default ColorFormatItem
