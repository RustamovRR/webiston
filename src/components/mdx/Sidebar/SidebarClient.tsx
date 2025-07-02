'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
// import { useGetTutorialContent } from '@/hooks/queries'
import { cn } from '@/lib'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'

interface SidebarClientProps {
  navigationItems: any[]
  tutorialId: string
  defaultOpenItem?: string
  onClose?: () => void
}

const SidebarClient = memo(
  ({ navigationItems, tutorialId, defaultOpenItem, onClose }: SidebarClientProps) => {
    const pathname = usePathname()
    const router = useRouter()
    const sidebarRef = useRef<HTMLDivElement>(null)
    // const { prefetchContent } = useGetTutorialContent([tutorialId, ''], false)
    const [localNavigation, setLocalNavigation] = useState(navigationItems)
    const [isInitialLoad, setIsInitialLoad] = useState(true)
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
    const memoizedNavigation = useMemo(() => localNavigation, [localNavigation])

    // Custom navigation handler
    const handleNavigation = useCallback(
      (path: string) => {
        // Save current scroll position
        if (sidebarRef.current) {
          sessionStorage.setItem('sidebarScrollPosition', sidebarRef.current.scrollTop.toString())
        }

        // Navigate without scroll
        router.push(`/tutorials/${tutorialId}/${path}`, { scroll: false })
        onClose?.()
      },
      [router, tutorialId, onClose],
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
      (items: any[]): string | null => {
        for (const item of items) {
          if (pathname === `/tutorials/${tutorialId}/${item.path}`) {
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
    const findParentPaths = useCallback((items: any[], targetPath: string): string[] => {
      const parentPaths: string[] = []

      function findParents(items: any[], targetPath: string, currentPath: string = ''): boolean {
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

    // Restore scroll position on initial load
    useEffect(() => {
      if (isInitialLoad && sidebarRef.current) {
        const savedScrollPosition = sessionStorage.getItem('sidebarScrollPosition')
        if (savedScrollPosition) {
          sidebarRef.current.scrollTop = parseInt(savedScrollPosition)
          sessionStorage.removeItem('sidebarScrollPosition')
        }
        setIsInitialLoad(false)
      }
    }, [isInitialLoad])

    // Memoize the renderNavigationItems function
    const renderNavigationItems = useCallback(
      (items: any[], parentPath: string = '') => {
        return items.map((item, index) => {
          const itemPath = parentPath ? `${parentPath}/${item.path}` : item.path
          const isActive = pathname === `/tutorials/${tutorialId}/${item.path}`
          const isActiveParent = pathname.includes(`/tutorials/${tutorialId}/${item.path}/`)

          // Find active item path and parent paths
          const activeItemPath = findActiveItemPath(navigationItems)
          const parentPaths = activeItemPath ? findParentPaths(navigationItems, activeItemPath) : []

          // Check if this item is a parent of the active item
          const isParentOfActive = parentPaths.includes(itemPath)

          if (item.list && item.list.length > 0) {
            const shouldBeOpen =
              isActiveParent ||
              isParentOfActive ||
              (index === 0 && defaultOpenItem === 'first') ||
              defaultOpenItem === item.path ||
              openAccordionItems.includes(item.path)

            return (
              <Accordion
                key={index}
                type="single"
                collapsible
                defaultValue={shouldBeOpen ? item.path : undefined}
                className="space-y-2"
              >
                <AccordionItem value={item.path} className="border-none">
                  {item.hasIndex ? (
                    <div className="relative">
                      <Link
                        href={`/tutorials/${tutorialId}/${item.path}`}
                        // onMouseEnter={() => prefetchContent(item.path, item.fullPath)}
                      >
                        <AccordionTrigger
                          onClick={(e) => handleAccordionTriggerClick(e, item.path)}
                          className={cn(
                            'group text-muted-foreground flex w-full cursor-pointer items-center gap-2 rounded-md py-2 pl-2 text-sm font-semibold transition-colors duration-200 hover:text-black dark:hover:text-white dark:hover:[&[data-state=open]>svg]:text-white',
                            {
                              'font-semibold text-sky-400 [&[data-state=open]>svg]:text-sky-400': isActive,
                            },
                          )}
                        >
                          {item.title}
                        </AccordionTrigger>
                      </Link>
                    </div>
                  ) : (
                    <AccordionTrigger
                      className={cn(
                        'group text-muted-foreground flex w-full cursor-pointer items-center gap-2 rounded-md py-2 pl-2 text-sm font-semibold transition-colors duration-200 hover:text-black dark:hover:text-white dark:hover:[&[data-state=open]>svg]:text-white',
                        {
                          'font-medium text-sky-400 [&[data-state=open]>svg]:text-sky-400': isActive,
                        },
                      )}
                    >
                      {item.title}
                    </AccordionTrigger>
                  )}
                  <AccordionContent className="pt-1 pb-0 pl-4">
                    <div className="flex flex-col gap-1">{renderNavigationItems(item.list, itemPath)}</div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )
          }

          return (
            <Link
              key={index}
              href={`/tutorials/${tutorialId}/${item.path}`}
              // onMouseEnter={() => prefetchContent(item.path, item.fullPath)}
              className={cn(
                'block cursor-pointer rounded-md text-sm transition-colors duration-200 hover:text-black dark:hover:text-white',
                isActive ? 'font-medium text-sky-400' : 'text-muted-foreground',
              )}
            >
              <div className="h-full w-full px-2 py-1.5" onClick={() => handleNavigation(item.path)}>
                {item.title}
              </div>
            </Link>
          )
        })
      },
      [
        pathname,
        tutorialId,
        defaultOpenItem,
        findActiveItemPath,
        findParentPaths,
        navigationItems,
        // prefetchContent,
        handleNavigation,
        handleAccordionTriggerClick,
        openAccordionItems,
      ],
    )

    // Memoize the rendered navigation items
    const renderedNavigationItems = useMemo(
      () => renderNavigationItems(memoizedNavigation),
      [renderNavigationItems, memoizedNavigation],
    )

    return (
      <nav className="scrollbar-custom h-full overflow-y-auto py-6" ref={sidebarRef}>
        {memoizedNavigation.length > 0 ? (
          renderedNavigationItems
        ) : (
          <div className="text-muted-foreground text-sm">
            Hech qanday navigatsiya elementi topilmadi. Iltimos, darslik kontenti mavjudligini tekshiring.
          </div>
        )}
      </nav>
    )
  },
  (prevProps, nextProps) => {
    // Only rerender if tutorialId or navigationItems change
    return prevProps.tutorialId === nextProps.tutorialId && prevProps.navigationItems === nextProps.navigationItems
  },
)

SidebarClient.displayName = 'SidebarClient'

export default SidebarClient
