'use client'

// import { useGetTutorialContentPath } from '@/hooks/queries'
import { cn } from '@/lib'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'

interface Heading {
  id: string
  text: string
  level: number
  element: HTMLElement
}

interface IProps {
  slug: string[]
}

export default function TableOfContents({ slug }: IProps) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')

  // const { contentResponse, isLoading, isFetching } = useGetTutorialContentPath(slug)

  // Function to get all headings
  const getHeadings = useCallback(() => {
    const elements = Array.from(document.querySelectorAll('article h2, article h3, article h4'))
    return elements.map((element) => ({
      id: element.id,
      text: element.textContent || '',
      level: Number(element.tagName.charAt(1)),
      element: element as HTMLElement,
    }))
  }, [])

  // Function to check which heading is currently in view
  const getActiveHeading = useCallback((headings: Heading[]) => {
    // Get the middle of the viewport
    const viewportMiddle = window.innerHeight / 3

    // Find the first heading that's above the middle of the viewport
    for (const heading of headings) {
      const rect = heading.element.getBoundingClientRect()
      if (rect.top <= viewportMiddle) {
        continue
      }
      // Return the previous heading as it's the active one
      const index = headings.indexOf(heading)
      return index > 0 ? headings[index - 1].id : headings[0].id
    }

    // If we're at the bottom of the page, return the last heading
    return headings[headings.length - 1]?.id
  }, [])

  // Update active heading on scroll
  useEffect(() => {
    const updateActiveHeading = () => {
      const currentHeadings = getHeadings()
      if (currentHeadings.length > 0) {
        const activeHeadingId = getActiveHeading(currentHeadings)
        setActiveId(activeHeadingId)
      }
    }

    // Initial update
    updateActiveHeading()

    // Add scroll listener
    window.addEventListener('scroll', updateActiveHeading, { passive: true })
    return () => window.removeEventListener('scroll', updateActiveHeading)
  }, [getActiveHeading, getHeadings])

  // Initial heading setup
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentHeadings = getHeadings()
      setHeadings(currentHeadings)

      // Check for hash in URL on initial load
      const hash = window.location.hash.slice(1)
      if (hash) {
        setActiveId(hash)
        const element = document.getElementById(hash)
        if (element) {
          // Use scrollIntoView with instant behavior
          element.scrollIntoView({ behavior: 'instant' })
          // Backup method if scrollIntoView doesn't work as expected
          window.scrollTo({
            top: element.offsetTop - 100,
            behavior: 'instant',
          })
        }
      }
    }, 100)
    return () => clearTimeout(timer)
  }, [getHeadings])

  if (headings.length === 0) {
    return null
  }

  return (
    <div className="scrollbar-custom relative max-h-[calc(100vh-8rem)] min-w-0 overflow-y-auto">
      <div className="sticky top-0 z-10">
        <div className="bg-background pb-2 text-sm font-semibold">Ushbu sahifada</div>
        <div className="from-background pointer-events-none h-2 bg-gradient-to-b to-transparent" />
      </div>
      <ul className="space-y-1 text-sm">
        {headings.map((heading) => (
          <li
            key={`${heading.id} ${heading.level} ${heading.text}`}
            className={cn(
              'group relative overflow-y-auto rounded-md',
              heading.level === 2 && 'font-semibold',
              heading.level === 3 && 'ml-3',
              heading.level === 4 && 'ml-6'
            )}
          >
            <Link
              href={`#${heading.id}`}
              className={cn(
                'block rounded-r-md px-2 py-1 pr-2 text-sm break-all transition-colors duration-200',
                'text-muted-foreground dark:text-muted-foreground hover:text-black dark:hover:text-white',
                activeId === heading.id && 'font-semibold text-black dark:text-white'
              )}
              style={{
                wordBreak: 'break-word',
              }}
              onClick={(e) => {
                e.preventDefault()
                const element = document.getElementById(heading.id)
                if (element) {
                  // Use instant scroll behavior
                  window.scrollTo({
                    top: element.offsetTop - 100,
                    behavior: 'instant',
                  })
                  setActiveId(heading.id)
                  window.history.pushState(null, '', `#${heading.id}`)
                }
              }}
            >
              {heading.text}
            </Link>
          </li>
        ))}
      </ul>
      <div className="from-background pointer-events-none sticky right-0 bottom-0 left-0 h-8 bg-gradient-to-t to-transparent" />
    </div>
  )
}
