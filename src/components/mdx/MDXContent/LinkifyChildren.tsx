import { ArrowUpRightIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const isExternalLink = (href: string) => href.startsWith('http') || href.startsWith('https')

const ExternalLink = ({ href, children }: { href: string; children: React.ReactNode }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center !font-normal text-sky-500 transition-colors duration-200 hover:text-sky-400 [&:has(code)]:!no-underline [&>code]:!text-sky-500 [&>span>code]:!text-sky-500"
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

// Reusable helper to transform anchor children into internal/external links
const LinkifyChildren = ({ children }: { children: React.ReactNode }) => {
  const mapped = React.Children.map(children, (child) => {
    if (child && typeof child === 'object' && (child as any).type === 'a') {
      const { href, children: linkChildren, ...linkProps } = (child as any).props || {}
      const external = isExternalLink(href)

      if (external) {
        return (
          <ExternalLink href={href} {...linkProps}>
            {linkChildren}
          </ExternalLink>
        )
      }

      return (
        <Link
          href={href || '#'}
          className="!font-normal text-sky-500 underline transition-colors duration-200 hover:text-sky-400"
          {...linkProps}
        >
          {linkChildren}
        </Link>
      )
    }
    return child
  })

  return <>{mapped}</>
}

export default LinkifyChildren
