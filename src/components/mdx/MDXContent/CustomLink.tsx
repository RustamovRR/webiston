import { ArrowUpRightIcon } from "lucide-react"
import Link from "next/link"

interface CustomLinkProps {
  href?: string
  children: React.ReactNode
  [key: string]: any
}

export default function CustomLink({
  href,
  children,
  ...props
}: CustomLinkProps) {
  // Skip heading anchor links (they have aria-hidden)
  if (props["aria-hidden"] === "true" || props["aria-hidden"] === true) {
    return (
      <Link href={href || "#"} {...props}>
        {children}
      </Link>
    )
  }

  const isExternal = href?.startsWith("http") || href?.startsWith("https")

  // `text-primary`, not `text-sky-500`. Prose links were the one place on the
  // site still painted in Tailwind's `sky` palette, which is a different blue
  // from the 217° brand hue — two blues, side by side, in the same paragraph.
  //
  // The icon uses `stroke-current` so it simply inherits the link colour
  // instead of naming it a second time (and a third for hover).
  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="group inline-flex items-center !font-normal text-primary transition-colors duration-200 hover:text-primary/80"
        {...props}
      >
        <span className="!font-normal">{children}</span>
        <ArrowUpRightIcon
          width={14}
          height={14}
          className="!stroke-current duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      </a>
    )
  }

  return (
    <Link
      href={href || "#"}
      className="!font-normal text-primary underline transition-colors duration-200 hover:text-primary/80"
      {...props}
    >
      {children}
    </Link>
  )
}
