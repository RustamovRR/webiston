"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion"
import type { TutorialNavigation } from "@/lib/mdx"
import { cn } from "@/lib"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"

interface SidebarProps {
  tutorialId: string
  navigationItems: TutorialNavigation[]
  onLinkClick?: () => void
}

const Sidebar = memo(
  ({ tutorialId, navigationItems, onLinkClick }: SidebarProps) => {
    const pathname = usePathname()
    const router = useRouter()
    const sidebarRef = useRef<HTMLDivElement>(null)

    // Hydration flag to avoid initial flicker by disabling transitions until mounted
    const [isHydrated, setIsHydrated] = useState(false)

    // NOTE: moved saving effect below openAccordionItems declaration to avoid use-before-init

    // Memoize the navigation items to prevent unnecessary rerenders
    const memoizedNavigation = useMemo(() => navigationItems, [navigationItems])

    // Find parent paths of active item
    const findParentPaths = useCallback(
      (items: TutorialNavigation[], targetPath: string): string[] => {
        const parentPaths: string[] = []

        function findParents(
          items: TutorialNavigation[],
          targetPath: string,
          currentPath: string = ""
        ): boolean {
          for (const item of items) {
            const itemPath = currentPath
              ? `${currentPath}/${item.path}`
              : item.path

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
      },
      []
    )

    // Find an item by its path
    const findItemByPath = useCallback(
      (
        items: TutorialNavigation[],
        targetPath: string
      ): TutorialNavigation | null => {
        for (const item of items) {
          if (item.path === targetPath) return item
          if (item.list && item.list.length > 0) {
            const found = findItemByPath(item.list, targetPath)
            if (found) return found
          }
        }
        return null
      },
      []
    )

    // Handle accordion toggle
    const handleAccordionToggle = useCallback((path: string) => {
      setOpenAccordionItems((prev) => {
        // If the clicked item is already open, close it.
        if (prev.includes(path)) {
          return []
        } else {
          // Otherwise, close all others and open the new one.
          return [path]
        }
      })
    }, [])

    // Custom navigation handler
    const handleNavigation = useCallback(
      (path: string, isAccordion: boolean) => {
        if (sidebarRef.current) {
          sessionStorage.setItem(
            `sidebarScrollPosition_${tutorialId}`,
            sidebarRef.current.scrollTop.toString()
          )
        }

        if (isAccordion) {
          // This is a toggle click on an accordion item itself.
          handleAccordionToggle(path)
        } else {
          // This is a click on a child link.
          const parentPaths = findParentPaths(navigationItems, path)
          setOpenAccordionItems(parentPaths)
          router.push(`/books/${tutorialId}/${path}`, { scroll: false })
        }

        if (onLinkClick) {
          onLinkClick()
        }
      },
      [
        router,
        tutorialId,
        onLinkClick,
        findParentPaths,
        navigationItems,
        handleAccordionToggle
      ]
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
      [pathname, tutorialId]
    )

    // Derive initial open accordions from active path so SSR and hydration match (no flicker)
    const initialOpenFromActive = useMemo(() => {
      const activePath = findActiveItemPath(navigationItems)
      if (!activePath) return [] as string[]
      const parents = findParentPaths(navigationItems, activePath)
      const activeItem = findItemByPath(navigationItems, activePath)
      // If active item itself is an accordion (has children), include it so it's open too
      if (activeItem && activeItem.list && activeItem.list.length > 0) {
        return [...parents, activePath]
      }
      return parents
    }, [findActiveItemPath, findParentPaths, findItemByPath, navigationItems])

    const [openAccordionItems, setOpenAccordionItems] = useState<string[]>(
      initialOpenFromActive
    )

    // On mount, mark hydrated; do NOT merge with saved accordion state to avoid multiple open
    useEffect(() => {
      setIsHydrated(true)
    }, [])

    // Save accordion state to sessionStorage whenever it changes
    useEffect(() => {
      if (typeof window !== "undefined") {
        sessionStorage.setItem(
          `accordionState_${tutorialId}`,
          JSON.stringify(openAccordionItems)
        )
      }
    }, [openAccordionItems, tutorialId])

    // Restore scroll position on every navigation, not just initial load
    useEffect(() => {
      const savedScrollPosition = sessionStorage.getItem(
        `sidebarScrollPosition_${tutorialId}`
      )
      if (sidebarRef.current && savedScrollPosition) {
        sidebarRef.current.scrollTop = parseInt(savedScrollPosition, 10)
      }
    }, [pathname, tutorialId]) // This now correctly depends on the pathname

    // Memoize the renderNavigationItems function
    const renderNavigationItems = useCallback(
      (items: TutorialNavigation[], parentPath: string = "") => {
        return items.map((item, index) => {
          const itemPath = parentPath ? `${parentPath}/${item.path}` : item.path
          const isActive = pathname === `/books/${tutorialId}/${item.path}`

          // Check if this item is a parent of the active item
          if (item.list && item.list.length > 0) {
            return (
              <Accordion
                key={index}
                type="multiple"
                value={openAccordionItems}
                className="space-y-2"
              >
                <AccordionItem value={item.path} className="border-none">
                  <AccordionTrigger
                    onClick={() => handleAccordionToggle(item.path)}
                    className={cn(
                      "group text-muted-foreground flex w-full cursor-pointer items-center gap-2 rounded-none py-2 pr-4 pl-3 text-sm font-semibold hover:text-black dark:hover:text-white dark:hover:[&[data-state=open]>svg]:text-white",
                      isHydrated
                        ? "transition-colors duration-200"
                        : "transition-none",
                      {
                        "border-l border-[#BABABB] bg-[#E9F4FF] font-semibold text-black !no-underline dark:border-[#878787] dark:bg-[#022248] dark:text-white [&[data-state=open]>svg]:text-white dark:[&[data-state=open]>svg]:text-white":
                          isActive
                      }
                    )}
                  >
                    <Link
                      href={`/books/${tutorialId}/${item.path}`}
                      prefetch={false}
                      onClick={(e) => {
                        // Allow new-tab or modifier-intent navigations
                        if (
                          e.metaKey ||
                          e.ctrlKey ||
                          e.shiftKey ||
                          e.altKey ||
                          (e as any).button === 1
                        ) {
                          return
                        }
                        // Prevent toggling when clicking the title; let Link navigate
                        e.stopPropagation()
                        // Ensure only this accordion is open, others closed
                        setOpenAccordionItems([item.path])
                        if (sidebarRef.current) {
                          sessionStorage.setItem(
                            `sidebarScrollPosition_${tutorialId}`,
                            sidebarRef.current.scrollTop.toString()
                          )
                        }
                      }}
                      className="min-w-0 flex-1 text-left no-underline hover:underline"
                      title={item.title}
                    >
                      {item.title}
                    </Link>
                  </AccordionTrigger>

                  <AccordionContent
                    disableAnimation={!isHydrated}
                    className="pt-1 pb-0 pl-4"
                  >
                    <div className="flex flex-col gap-1">
                      {renderNavigationItems(item.list, itemPath)}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )
          } else {
            return (
              <Link
                key={index}
                href={`/books/${tutorialId}/${item.path}`}
                onClick={() => handleNavigation(item.path, false)} // Not an accordion
                className={cn(
                  "text-muted-foreground group flex cursor-pointer items-center gap-2 py-2 pl-3 text-sm hover:text-black dark:hover:text-white",
                  isHydrated
                    ? "transition-colors duration-200"
                    : "transition-none",
                  {
                    "border-l border-[#BABABB] bg-[#E9F4FF] font-semibold text-black dark:border-[#878787] dark:bg-[#022248] dark:text-white":
                      isActive
                  }
                )}
              >
                <span className="pr-4" title={item.title}>
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
        handleNavigation,
        handleAccordionToggle,
        findParentPaths,
        onLinkClick
      ]
    )

    // Show loading state if no navigation items
    if (!navigationItems || navigationItems.length === 0) {
      return (
        <div>
          <p className="text-muted-foreground text-sm">
            Navigatsiya yuklanmoqda...
          </p>
        </div>
      )
    }

    return (
      <div
        ref={sidebarRef}
        className="md:h-[calc(100vh-8rem)] md:overflow-y-auto"
      >
        <nav className="space-y-1">
          {renderNavigationItems(memoizedNavigation)}
        </nav>
      </div>
    )
  }
)

Sidebar.displayName = "Sidebar"

export default Sidebar
