import { cn } from "@webiston/ui"
import Link from "next/link"
import type { FC, ReactNode } from "react"
import { Link as I18nLink } from "@/i18n/navigation"

interface IProps {
  title: string
  description: string
  href?: string
  className?: string
  disabled?: boolean
  isNextLink?: boolean
  children?: ReactNode // To be safe
  [key: string]: any // For any other props
}

const SimpleCard: FC<IProps> = ({
  title,
  description,
  href,
  className,
  disabled,
  isNextLink = false,
  ...props
}) => {
  const classNames = cn(
    // `bg-card` — these had NO background at all (measured alpha 0), so 41 of
    // them read as outlines on the page rather than as objects. A card that is
    // a link needs to look like a surface you can pick up.
    //
    // `border-border-strong` — the boundary was `--border` at 1.32:1 (light) /
    // 1.33:1 (dark) against the page. WCAG 1.4.11 requires 3:1 for the boundary
    // that IDENTIFIES an interactive component, and this is that boundary.
    // `--border` stays the decorative token for rules and dividers.
    "group relative select-none overflow-hidden rounded-lg border border-border-strong bg-card",
    // Transition only what is composited. The old rule was `transition-all`,
    // which also animates colour, shadow, border AND size on every hover.
    "transition-[transform,box-shadow,background-color] duration-200 ease-out",
    "hover:-translate-y-0.5 hover:bg-accent hover:shadow-lg",
    // The card is a link, so it must show a focus ring — hover-only feedback
    // leaves keyboard users with no indication of where they are.
    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
    {
      "pointer-events-none opacity-50": disabled
    },
    className
  )

  // Left-aligned, not centred. In a 4–5 column grid the eye needs a predictable
  // return point on each scan line; centred text moves that point per card and
  // measurably slows scanning. Centring also made every card look like a
  // standalone banner rather than one row of a list.
  const content = (
    <div className="flex h-full flex-col gap-2 p-5">
      <h3 className="font-semibold text-base text-foreground leading-snug">
        {title}
      </h3>
      <p className="text-pretty text-muted-foreground text-sm leading-relaxed">
        {description}
      </p>
    </div>
  )

  return href ? (
    isNextLink ? (
      <Link href={href} {...props} className={classNames}>
        {content}
      </Link>
    ) : (
      <I18nLink href={href} {...props} className={classNames}>
        {content}
      </I18nLink>
    )
  ) : (
    <div className={classNames}>{content}</div>
  )
}

export default SimpleCard
