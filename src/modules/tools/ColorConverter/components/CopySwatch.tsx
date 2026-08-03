"use client"

import { Check, Copy } from "lucide-react"
import { useTranslations } from "next-intl"

import { useCopyFeedback } from "../hooks/useCopyFeedback"

/**
 * A colour square that copies itself on click — the idiom the palette, the
 * shade scale and the history all share (third consumer is what earned the
 * extraction). The caption slots render under the square.
 *
 * `bg-clip-padding` on the swatch is load-bearing too: `--border` is a
 * translucent WHITE in dark mode, and the default `border-box` clip paints the
 * colour UNDER the border, so the border composites on top and every swatch
 * carried a pale rim that was not the colour it claimed to be.
 *
 * `w-full min-w-0` on the button is load-bearing. A `<button>` sizes to its
 * content, and `truncate` only clips the caption's own box — so a long caption
 * pushed the BUTTON past its grid cell while the cell stayed 67px wide.
 * Measured on a history entry reading `RGBA(59, 130, 246, 0.74)`: the cell was
 * 67px, the button 144px, and the swatches painted over each other and out
 * through the card's right edge. The cell is the authority on width now.
 *
 * The acknowledgement does NOT hide behind `:hover`, and that is a fix rather
 * than a preference. Clicking a swatch can move it: the palette recentres on
 * the colour you picked, so the node slides to a new track. A browser does not
 * re-evaluate `:hover` until the pointer moves again — measured, a swatch
 * clicked at x=418 sat at x=53 with `:hover` still matching and the badge lit,
 * and it went out the moment the mouse twitched. Tying the badge to the
 * COPY rather than to the pointer makes it follow the swatch honestly instead
 * of blinking on whatever the stale hover happens to be pointing at.
 */

interface CopySwatchProps {
  color: string
  /** Extra click behaviour besides the copy, e.g. "make this the input". */
  onSelect?: () => void
  caption?: React.ReactNode
  swatchClassName?: string
  title?: string
}

export function CopySwatch({
  color,
  onSelect,
  caption,
  swatchClassName = "h-16",
  title
}: CopySwatchProps) {
  const t = useTranslations("ColorConverterPage.ColorInput")
  // Keyed on the colour: the scale reuses one instance per SHADE across every
  // colour picked, so without this the badge outlives the value it is about.
  const { copied, copy } = useCopyFeedback(color)

  const activate = () => {
    onSelect?.()
    void copy(color)
  }

  return (
    <button
      type="button"
      onClick={activate}
      title={title ?? color}
      aria-label={color}
      className="group w-full min-w-0 cursor-pointer rounded-lg text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="relative block">
        <span
          className={`block w-full rounded-lg border border-border bg-clip-padding transition-colors group-hover:border-border-strong ${swatchClassName}`}
          style={{ backgroundColor: color }}
        />
        <span
          aria-hidden="true"
          className={`absolute inset-0 flex items-center justify-center transition-opacity ${
            copied
              ? "opacity-100"
              : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
          }`}
        >
          <span className="flex items-center gap-1 rounded-full bg-foreground/75 px-2 py-0.5 font-medium text-[11px] text-background shadow-sm">
            {copied ? <Check size={11} /> : <Copy size={11} />}
          </span>
        </span>
      </span>
      {/* The badge is decorative, so a screen reader gets nothing when the one
          verb this tool exists for succeeds. Announced from inside the button
          because clicking one focuses it. NOT verified against a real screen
          reader — the conventional pattern, shipped as such. */}
      <span className="sr-only" role="status">
        {copied ? t("copied") : ""}
      </span>
      {caption}
    </button>
  )
}
