"use client"

import { Check, Copy } from "lucide-react"
import { useState } from "react"
import { useCopyToClipboard } from "usehooks-ts"
import { Button } from "../../primitives/button"

interface CopyButtonProps {
  text: string
  disabled?: boolean
  size?: "sm" | "default" | "lg"
  variant?: "default" | "secondary" | "ghost" | "outline"
  className?: string
  onCopy?: () => void
  /**
   * Accessible name. The default is Uzbek because this package predates the
   * English locale reaching the tools; pass the translated string from any
   * consumer that has a translator in scope, so `/en` is announced in English.
   */
  label?: string
}

export function CopyButton({
  text,
  disabled = false,
  size = "sm",
  variant = "ghost",
  className = "",
  onCopy,
  label = "Nusxalash"
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false)
  const [_, copy] = useCopyToClipboard()

  const handleCopy = async () => {
    if (!text || disabled) return

    try {
      await copy(text)
      setCopied(true)
      onCopy?.()
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Nusxalashda xatolik:", error)
    }
  }

  return (
    <Button
      onClick={handleCopy}
      disabled={disabled || !text}
      size={size}
      variant={variant}
      className={`${className} cursor-pointer transition-colors`}
      aria-label={label}
    >
      {copied ? (
        <Check size={18} className="text-success" />
      ) : (
        <Copy size={18} />
      )}
    </Button>
  )
}
