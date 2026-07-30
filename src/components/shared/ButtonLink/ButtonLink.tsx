import Link from "next/link"
import type { ComponentPropsWithoutRef, FC, ReactNode } from "react"
import { Link as I18nLink } from "@/i18n/navigation"
import { cn } from "@/lib"

// The rest props are spread onto an anchor, so type them as anchor props.
// This previously read `[key: string]: any`, which silently widened EVERY prop
// to `any` — including misspelled ones — so the interface above bought nothing.
interface IProps
  extends Omit<ComponentPropsWithoutRef<"a">, "href" | "className"> {
  variant?: "primary" | "secondary" | "outline"
  children: ReactNode
  href: string
  className?: string
  isNextLink?: boolean
}

const ButtonLink: FC<IProps> = ({
  children,
  variant = "primary",
  className,
  isNextLink = false,
  ...props
}) => {
  const classNames = cn(
    "relative h-12 px-6 py-2 rounded-lg font-medium text-lg transition-colors duration-300 ease-in-out flex items-center justify-center",
    // The previous version pinned `primary` to `bg-white text-black` in BOTH
    // schemes and called it a "documented exception", on the reasoning that
    // semantic tokens flip with the scheme and would put black text on a dark
    // surface. That reasoning held for `bg-card`, but it made the hero's main
    // call to action a **white pill on a white page** in light mode — measured
    // invisible, only its text readable.
    //
    // `bg-foreground text-background` is the pair that was wanted all along:
    // the two flip TOGETHER, so the intent ("maximum-contrast pill, inverted
    // from the page") survives in both schemes instead of being pinned to one.
    // Dark mode is unchanged — still a white pill with dark text.
    //
    //   light  near-black on white  -> 17.4:1
    //   dark   near-white on dark   -> 18.7:1
    {
      "bg-foreground text-background hover:bg-foreground/90":
        variant === "primary",
      "bg-card text-card-foreground border border-border-strong hover:bg-accent":
        variant === "secondary",
      // `border-strong`, not `border`: this is the only thing that makes the
      // secondary CTA perceivable as a button at all, and at `--border` it sat
      // at 1.35:1 against the page — measured, and below WCAG 1.4.11's 3:1.
      "bg-transparent text-foreground border border-border-strong hover:bg-accent hover:border-input":
        variant === "outline"
    },
    className
  )

  return isNextLink ? (
    <Link {...props} className={classNames}>
      {children}
    </Link>
  ) : (
    <I18nLink {...props} className={classNames}>
      {children}
    </I18nLink>
  )
}

export default ButtonLink
