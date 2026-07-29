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
    // DOCUMENTED EXCEPTION — fixed-palette hero CTA.
    //
    // `primary` and `secondary` are deliberately theme-INVARIANT: a white pill
    // with black text and a dark pill with white text, identical in both
    // schemes. Semantic tokens are exactly wrong here — `bg-card` flips with the
    // scheme, which would put black text on a dark surface. These stay as fixed
    // values. `outline` is the theme-aware variant and uses tokens for its edge.
    {
      "bg-white text-black hover:bg-gray-100 dark:bg-white dark:text-black dark:hover:bg-gray-100":
        variant === "primary",
      "bg-zinc-900 text-white border border-zinc-700 hover:bg-zinc-800 dark:bg-zinc-900 dark:text-white dark:border-zinc-700 dark:hover:bg-zinc-800":
        variant === "secondary",
      "bg-transparent text-foreground border border-border hover:bg-accent hover:border-input":
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
