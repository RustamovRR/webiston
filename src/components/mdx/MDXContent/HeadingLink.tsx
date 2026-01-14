import React from "react"
import Link from "next/link"
import { LinkIcon } from "lucide-react"

interface HeadingLinkProps {
  id?: string
  children: React.ReactNode
  level: 1 | 2 | 3 | 4 | 5 | 6
  className?: string
}

export default function HeadingLink({
  id,
  children,
  level,
  className = ""
}: HeadingLinkProps) {
  const Tag = `h${level}` as keyof React.JSX.IntrinsicElements

  const iconSizes = {
    1: "h-5 w-5",
    2: "h-5 w-5",
    3: "h-4 w-4",
    4: "h-3 w-3",
    5: "h-2 w-2",
    6: "h-2 w-2"
  }

  if (!id) {
    return <Tag className={className}>{children}</Tag>
  }

  return (
    <Tag id={id} className={`group ${className}`}>
      <Link
        href={`#${id}`}
        className="flex cursor-pointer items-center gap-2 no-underline"
      >
        <span>{children}</span>
        <LinkIcon
          className={`${iconSizes[level]} text-slate-400 opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:text-slate-600 dark:text-slate-300 dark:hover:text-slate-100`}
        />
      </Link>
    </Tag>
  )
}
