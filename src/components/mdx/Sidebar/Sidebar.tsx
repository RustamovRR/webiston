'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import type { TutorialNavigation } from '@/lib/mdx'
import { cn } from '@/lib'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface SidebarProps {
  tutorialId: string
  navigationItems: TutorialNavigation[]
}

const Sidebar = memo(({ tutorialId, navigationItems }: SidebarProps) => {
  const pathname = usePathname()
  const router = useRouter()
  const sidebarRef = useRef<HTMLDivElement>(null)

  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>(() => {
    // Initialize from sessionStorage on component mount
    if (typeof window !== 'undefined') {
      const savedState = sessionStorage.getItem(`accordionState_${tutorialId}`)
      return savedState ? JSON.parse(savedState) : []
    }
    return []
  })

  // Save accordion state to sessionStorage whenever it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(`accordionState_${tutorialId}`, JSON.stringify(openAccordionItems))
    }
  }, [openAccordionItems, tutorialId])

  // Memoize the navigation items to prevent unnecessary rerenders
  const memoizedNavigation = useMemo(() => navigationItems, [navigationItems])

  // Custom navigation handler
  const handleNavigation = useCallback(
    (path: string) => {
      // Save current scroll position with a tutorial-specific key
      if (sidebarRef.current) {
        sessionStorage.setItem(`sidebarScrollPosition_${tutorialId}`, sidebarRef.current.scrollTop.toString())
      }

      // Navigate without scroll
      router.push(`/books/${tutorialId}/${path}`, { scroll: false })
    },
    [router, tutorialId],
  )

  // Handle accordion trigger click
  const handleAccordionTriggerClick = useCallback(
    (e: React.MouseEvent, path: string) => {
      // Toggle accordion state
      setOpenAccordionItems((prev) => {
        if (prev.includes(path)) {
          return prev.filter((item) => item !== path)
        } else {
          return [...prev, path]
        }
      })

      // Handle navigation
      handleNavigation(path)
    },
    [handleNavigation],
  )

  // Find active item path
  const findActiveItemPath = useCallback(
    (items: TutorialNavigation[]): string | null => {
      for (const item of items) {
        if (pathname === `/books/${tutorialId}/${item.path}`) {
          return item.path
        }
        if (item.list && item.list.length > 0) {
          const found = findActiveItemPath(item.list)
          if (found) return found
        }
      }
      return null
    },
    [pathname, tutorialId],
  )

  // Find parent paths of active item
  const findParentPaths = useCallback((items: TutorialNavigation[], targetPath: string): string[] => {
    const parentPaths: string[] = []

    function findParents(items: TutorialNavigation[], targetPath: string, currentPath: string = ''): boolean {
      for (const item of items) {
        const itemPath = currentPath ? `${currentPath}/${item.path}` : item.path

        if (item.path === targetPath) {
          return true
        }

        if (item.list && item.list.length > 0) {
          if (findParents(item.list, targetPath, itemPath)) {
            parentPaths.push(itemPath)
            return true
          }
        }
      }
      return false
    }

    findParents(items, targetPath)
    return parentPaths
  }, [])

  // Restore scroll position on every navigation, not just initial load
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem(`sidebarScrollPosition_${tutorialId}`)
    if (sidebarRef.current && savedScrollPosition) {
      sidebarRef.current.scrollTop = parseInt(savedScrollPosition, 10)
    }
  }, [pathname, tutorialId]) // This now correctly depends on the pathname

  // Memoize the renderNavigationItems function
  const renderNavigationItems = useCallback(
    (items: TutorialNavigation[], parentPath: string = '') => {
      return items.map((item, index) => {
        const itemPath = parentPath ? `${parentPath}/${item.path}` : item.path
        const isActive = pathname === `/books/${tutorialId}/${item.path}`
        const isActiveParent = pathname.includes(`/books/${tutorialId}/${item.path}/`)

        // Find active item path and parent paths
        const activeItemPath = findActiveItemPath(navigationItems)
        const parentPaths = activeItemPath ? findParentPaths(navigationItems, activeItemPath) : []

        // Check if this item is a parent of the active item
        const isParentOfActive = parentPaths.includes(itemPath)

        if (item.list && item.list.length > 0) {
          const shouldBeOpen =
            isActiveParent || isParentOfActive || index === 0 || openAccordionItems.includes(item.path)

          return (
            <Accordion
              key={index}
              type="single"
              collapsible
              defaultValue={shouldBeOpen ? item.path : undefined}
              className="space-y-2"
            >
              <AccordionItem value={item.path} className="border-none">
                <Link href={`/books/${tutorialId}/${item.path}`}>
                  <AccordionTrigger
                    onClick={(e) => handleAccordionTriggerClick(e, item.path)}
                    className={cn(
                      'group text-muted-foreground flex w-full cursor-pointer items-center gap-2 rounded-none py-2 pr-4 pl-3 text-sm font-semibold transition-colors duration-200 hover:text-black dark:hover:text-white dark:hover:[&[data-state=open]>svg]:text-white',
                      {
                        'border-l border-[#BABABB] bg-[#E9F4FF] font-semibold text-black !no-underline dark:border-[#878787] dark:bg-[#022248] dark:text-white [&[data-state=open]>svg]:text-white dark:[&[data-state=open]>svg]:text-white':
                          isActive,
                      },
                    )}
                  >
                    <span className="flex-1 truncate text-left" title={item.title}>
                      {item.title}
                    </span>
                  </AccordionTrigger>
                </Link>

                <AccordionContent className="pt-1 pb-0 pl-4">
                  <div className="flex flex-col gap-1">{renderNavigationItems(item.list, itemPath)}</div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )
        } else {
          return (
            <Link
              key={index}
              href={`/books/${tutorialId}/${item.path}`}
              onClick={() => {
                if (sidebarRef.current) {
                  sessionStorage.setItem(`sidebarScrollPosition_${tutorialId}`, sidebarRef.current.scrollTop.toString())
                }
              }}
              className={cn(
                'text-muted-foreground group flex cursor-pointer items-center gap-2 py-2 pl-3 text-sm transition-colors duration-200 hover:text-black dark:hover:text-white',
                {
                  'border-l border-[#BABABB] bg-[#E9F4FF] font-semibold text-black dark:border-[#878787] dark:bg-[#022248] dark:text-white':
                    isActive,
                },
              )}
            >
              <span className="truncate pr-4" title={item.title}>
                {item.title}
              </span>
            </Link>
          )
        }
      })
    },
    [
      pathname,
      tutorialId,
      navigationItems,
      findActiveItemPath,
      findParentPaths,
      openAccordionItems,
      handleAccordionTriggerClick,
    ],
  )

  // Show loading state if no navigation items
  if (!navigationItems || navigationItems.length === 0) {
    return (
      <div>
        <p className="text-muted-foreground text-sm">Navigatsiya yuklanmoqda...</p>
      </div>
    )
  }

  return (
    <div ref={sidebarRef} className="h-[calc(100vh-8rem)] overflow-y-auto">
      <nav className="space-y-1">{renderNavigationItems(memoizedNavigation)}</nav>
    </div>
  )
})

Sidebar.displayName = 'Sidebar'

export default Sidebar
