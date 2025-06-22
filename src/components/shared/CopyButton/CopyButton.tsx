'use client'

import { Check, Copy } from 'lucide-react'
import { useCopyToClipboard } from 'usehooks-ts'
import { useState } from 'react'
import { Button } from '@/components/ui/button'

interface CopyButtonProps {
  text: string
  disabled?: boolean
  size?: 'sm' | 'default' | 'lg'
  variant?: 'default' | 'secondary' | 'ghost' | 'outline'
  className?: string
  onCopy?: () => void
}

export function CopyButton({
  text,
  disabled = false,
  size = 'sm',
  variant = 'ghost',
  className = '',
  onCopy,
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
      console.error('Nusxalashda xatolik:', error)
    }
  }

  return (
    <Button
      onClick={handleCopy}
      disabled={disabled || !text}
      size={size}
      variant={variant}
      className={`${className} transition-colors`}
      aria-label="Nusxalash"
    >
      {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
    </Button>
  )
}
