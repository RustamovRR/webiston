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
    "relative group transform transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg rounded-lg overflow-hidden border border-border hover:bg-accent select-none",
    {
      "pointer-events-none opacity-50": disabled
    },
    className
  )

  const content = (
    <div className="flex flex-col items-center p-6 text-center">
      <div className="text-center">
        <h3 className="mb-2 text-xl font-semibold text-foreground">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
      </div>
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
