import { ArrowUpRightIcon } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

const isExternalLink = (href: string) => href?.startsWith('http') || href?.startsWith('https')

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

// Recursively process children to find and transform anchor tags
const processChildren = (children: React.ReactNode): React.ReactNode => {
  return React.Children.map(children, (child) => {
    // Handle string children - check if it contains HTML
    if (typeof child === 'string') {
      return child
    }

    // If not a valid element, return as is
    if (!React.isValidElement(child)) {
      return child
    }

    const element = child as React.ReactElement<any>

    // Skip heading anchor links (aria-hidden)
    if (element.type === 'a' && (element.props['aria-hidden'] === 'true' || element.props['aria-hidden'] === true)) {
      return element
    }

    // Transform anchor tags
    if (element.type === 'a') {
      const { href, children: linkChildren, ...linkProps } = element.props || {}
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

    // Recursively process children of other elements
    if (element.props && element.props.children) {
      return React.cloneElement(element, {
        ...element.props,
        children: processChildren(element.props.children),
      })
    }

    return element
  })
}

// Reusable helper to transform anchor children into internal/external links
const LinkifyChildren = ({ children }: { children: React.ReactNode }) => {
  return <>{processChildren(children)}</>
}

export default LinkifyChildren
