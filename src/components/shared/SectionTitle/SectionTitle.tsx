import { cn } from "@webiston/ui"
import Link from "next/link"
import type { FC, ReactNode } from "react"

interface IProps {
  icon: ReactNode
  title: string | ReactNode
  description: string
  className?: string
  disabled?: boolean
  href: string
}

const SectionTitle: FC<IProps> = ({
  icon,
  title,
  description,
  className,
  disabled,
  href
}) => {
  const classNames = cn("flex gap-4", { "opacity-70": disabled }, className)

  return (
    <div className={classNames}>
      <div className="mt-1 shrink-0 transition-transform duration-700 ease-in-out">
        {icon}
      </div>
      <div>
        <h3 className="gradient-text text-xl font-semibold">
          <Link href={href}>{title} </Link>
        </h3>

        <p className="text-zinc-600 dark:text-zinc-400">{description}</p>
      </div>
    </div>
  )
}

export default SectionTitle
