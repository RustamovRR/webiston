import Link from 'next/link'
import { ArrowUpRightIcon } from 'lucide-react'

interface CustomLinkProps {
  href?: string
  children: React.ReactNode
  [key: string]: any
}

export default function CustomLink({ href, children, ...props }: CustomLinkProps) {
  // Skip heading anchor links (they have aria-hidden)
  if (props['aria-hidden'] === 'true' || props['aria-hidden'] === true) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    )
  }

  const isExternal = href?.startsWith('http') || href?.startsWith('https')

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center !font-normal text-sky-500 transition-colors duration-200 hover:text-sky-400"
        {...props}
      >
        <span className="!font-normal">{children}</span>
        <ArrowUpRightIcon
          width={14}
          height={14}
          className="!stroke-sky-500 duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:!stroke-sky-400"
        />
      </a>
    )
  }

  return (
    <Link
      href={href || '#'}
      className="!font-normal text-sky-500 underline transition-colors duration-200 hover:text-sky-400"
      {...props}
    >
      {children}
    </Link>
  )
}
