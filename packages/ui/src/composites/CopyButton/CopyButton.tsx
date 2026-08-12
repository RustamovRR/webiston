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
  /**
   * Show the label as TEXT beside the icon, not only to a screen reader.
   *
   * Off by default, because in a dense row — a token part, a colour swatch, a
   * table cell — an icon is the right density and the surrounding context
   * already says what will be copied.
   *
   * Turn it on where copying is the POINT of the screen. Most visitors to
   * these tools are not developers, and the two-overlapping-squares glyph is a
   * developer convention, not a universal one: it has no meaning outside
   * software and nothing about it suggests "clipboard" to someone who has not
   * been taught it. A person who cannot find this button falls back to
   * scrolling and selecting the text by hand.
   */
  showLabel?: boolean
  /** Replaces the label while the confirmation is showing. */
  copiedLabel?: string
}

export function CopyButton({
  text,
  disabled = false,
  size = "sm",
  variant = "ghost",
  className = "",
  onCopy,
  label = "Nusxalash",
  showLabel = false,
  copiedLabel
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
        <Check size={18} className="text-success" aria-hidden="true" />
      ) : (
        <Copy size={18} aria-hidden="true" />
      )}
      {showLabel && <span>{copied ? (copiedLabel ?? label) : label}</span>}
    </Button>
  )
}
