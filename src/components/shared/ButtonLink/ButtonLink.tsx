import { FC, ReactNode } from "react"
import { Link as I18nLink } from "@/i18n/navigation"
import Link from "next/link"
import { cn } from "@/lib"

interface IProps {
  variant?: "primary" | "secondary" | "outline"
  children: ReactNode
  href: string
  className?: string
  isNextLink?: boolean
  [key: string]: any // For any other props
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
    {
      "bg-white text-black hover:bg-gray-100 dark:bg-white dark:text-black dark:hover:bg-gray-100":
        variant === "primary",
      "bg-zinc-900 text-white border border-zinc-700 hover:bg-zinc-800 dark:bg-zinc-900 dark:text-white dark:border-zinc-700 dark:hover:bg-zinc-800":
        variant === "secondary",
      "bg-transparent text-zinc-900 border border-zinc-300 hover:bg-zinc-100 hover:border-zinc-400 dark:text-white dark:border-white/20 dark:hover:bg-white/10 dark:hover:border-white/30":
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
