'use client'

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { cn } from '@/lib'
import { type TutorialNavigation } from '@/lib/mdx'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { PanelLeftClose, PanelLeftOpen, PanelsTopLeft, PanelTop } from 'lucide-react'
import React from 'react'

interface BreadcrumbItemType {
  title: string
  path: string
  hasIndex?: boolean
}

interface TutorialLayoutContentProps {
  children: React.ReactNode
  lastUpdated?: string
  navigationItems: TutorialNavigation[]
  tutorialTitle: string
  pageTitle?: string
}

export default function TutorialLayoutContent({
  children,
  lastUpdated,
  navigationItems,
  tutorialTitle,
  pageTitle,
}: TutorialLayoutContentProps) {
  const { slug } = useParams<{ slug: string[] }>()
  const tutorialId = slug?.[0]

  const getBreadcrumbItems = () => {
    const items: BreadcrumbItemType[] = [
      { title: 'Bosh sahifa', path: '/books', hasIndex: true },
      { title: tutorialTitle, path: `/books/${tutorialId}`, hasIndex: true },
    ]

    if (!navigationItems || !slug || slug.length <= 1) {
      return items
    }

    const findPathRecursively = (
      nodes: TutorialNavigation[],
      pathSegments: string[],
      currentPath: string,
    ): BreadcrumbItemType[] => {
      if (pathSegments.length === 0) {
        return []
      }

      const [currentSegment, ...restSegments] = pathSegments
      const currentNode = nodes.find((node) => node.path === currentSegment)

      if (!currentNode) {
        return []
      }

      const newPath = `${currentPath}/${currentNode.path}`
      const breadcrumbPart: BreadcrumbItemType = {
        title: currentNode.title,
        path: newPath,
        hasIndex: currentNode.hasIndex || !!currentNode.list?.length,
      }

      if (restSegments.length > 0 && currentNode.list) {
        return [breadcrumbPart, ...findPathRecursively(currentNode.list, restSegments, newPath)]
      }

      return [breadcrumbPart]
    }

    const pagePathSegments = slug.slice(1)
    const breadcrumbTrail = findPathRecursively(navigationItems, pagePathSegments, `/books/${tutorialId}`)

    const finalItems = [...items, ...breadcrumbTrail]

    // If there's a specific page title from frontmatter, add it as the last, non-clickable item.
    if (pageTitle && finalItems.length > 0) {
      const lastItem = finalItems[finalItems.length - 1]
      // Ensure the title isn't duplicated
      if (lastItem.title !== pageTitle) {
        finalItems.push({
          title: pageTitle,
          path: lastItem.path, // Path is not really used as it won't be a link
          hasIndex: false,
        })
      }
    }

    return finalItems
  }

  const breadcrumbItems = getBreadcrumbItems()

  const renderBreadcrumbItems = () => {
    if (breadcrumbItems.length <= 3) {
      return breadcrumbItems.map((item, index) => (
        <BreadcrumbItem key={item.path}>
          {index > 0 && <BreadcrumbSeparator />}
          {index < breadcrumbItems.length - 1 && item.hasIndex ? (
            <Link
              href={item.path}
              title={item.title}
              className="hover:text-foreground max-w-[150px] truncate text-sm font-medium transition-colors max-sm:max-w-[100px]"
            >
              {item.title}
            </Link>
          ) : (
            <BreadcrumbPage
              title={item.title}
              className="text-foreground max-w-[150px] font-medium max-sm:max-w-[100px]"
            >
              {item.title}
            </BreadcrumbPage>
          )}
        </BreadcrumbItem>
      ))
    }

    const firstItem = breadcrumbItems[0]
    const lastItem = breadcrumbItems[breadcrumbItems.length - 1]
    const middleItems = breadcrumbItems.slice(1, -1)

    return (
      <>
        <BreadcrumbItem>
          {firstItem.hasIndex ? (
            <Link href={firstItem.path} className="hover:text-foreground text-sm font-medium transition-colors">
              {firstItem.title}
            </Link>
          ) : (
            <span className="text-sm font-medium">{firstItem.title}</span>
          )}
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex cursor-pointer items-center gap-1">
              <BreadcrumbEllipsis className="h-4 w-4" />
              <span className="sr-only">Menyuni almashtirish</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {middleItems.map((item) => (
                <DropdownMenuItem key={item.path}>
                  {item.hasIndex ? (
                    <Link href={item.path} className="w-full text-sm font-medium">
                      {item.title}
                    </Link>
                  ) : (
                    <span className="text-sm font-medium">{item.title}</span>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          {lastItem.hasIndex ? (
            <Link
              href={lastItem.path}
              className="hover:text-foreground max-w-[150px] text-sm font-medium transition-colors max-sm:max-w-[100px]"
            >
              {lastItem.title}
            </Link>
          ) : (
            <BreadcrumbPage className="text-foreground font-medium">{lastItem.title}</BreadcrumbPage>
          )}
        </BreadcrumbItem>
      </>
    )
  }

  return (
    <div className="flex flex-col">
      <section className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Breadcrumb className="max-w-4/5">
            <BreadcrumbList className="flex-nowrap whitespace-nowrap">{renderBreadcrumbItems()}</BreadcrumbList>
          </Breadcrumb>
        </div>
      </section>

      {/* Main Article Content */}
      <article
        className={cn(
          'prose prose-slate dark:prose-invert',
          'dark:prose-headings:text-white prose-headings:scroll-mt-28',
          'prose-a:font-semibold prose-a:no-underline prose-pre:m-0',
          'max-w-none pt-6',
        )}
      >
        {children}
      </article>
    </div>
  )
}
