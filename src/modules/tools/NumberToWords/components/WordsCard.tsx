"use client"

import { CopyButton } from "@webiston/ui"

interface WordsCardProps {
  /** "Lotin" / "Kirill" — the script, not a sentence. */
  label: string
  words: string
  copyLabel: string
  copiedLabel: string
}

/**
 * One script's answer, and the button that takes it.
 *
 * The words are `select-all` and sit in a real block rather than an input:
 * this is the thing the visitor came for, and a disabled-looking text field
 * makes it read as a form value rather than a result. The copy button carries
 * its label in words for the same reason it does in `DualTextPanel` — most
 * people using this are accountants, not developers, and the two-squares glyph
 * is a developer convention.
 */
export function WordsCard({
  label,
  words,
  copyLabel,
  copiedLabel
}: WordsCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border-strong bg-card/60 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-wider">
          {label}
        </span>
        <CopyButton
          text={words}
          variant="outline"
          showLabel
          label={copyLabel}
          copiedLabel={copiedLabel}
        />
      </div>
      {/* `select-all` so one click takes the whole sum — on a phone, dragging a
          selection across a long line of words is the part people give up on.
          `max-w-[70ch]` is the reading measure: on a 1536px page this card is
          ~1050px wide, and a sum stretched across all of it reads worse than
          the same words wrapped at book width. The card keeps its size; only
          the text stops chasing the edge. */}
      <p className="max-w-[70ch] select-all text-pretty text-base text-foreground leading-relaxed">
        {words}
      </p>
    </div>
  )
}
