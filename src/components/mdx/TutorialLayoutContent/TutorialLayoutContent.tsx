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
import { Skeleton } from '@/components/ui/skeleton'
// import useGetNavigation from '@/hooks/queries/useGetNavigation'
import { cn } from '@/lib'
import Link from 'next/link'
import { useParams, usePathname } from 'next/navigation'

interface TutorialLayoutContentProps {
  children: React.ReactNode
  lastUpdated?: string
}

export default function TutorialLayoutContent({ children, lastUpdated }: TutorialLayoutContentProps) {
  const pathname = usePathname()
  const { slug } = useParams()
  const tutorialId = slug?.[0] as string
  // const { data: navigationData, isLoading } = useGetNavigation(tutorialId)

  const findNavigationItem = (items: any[] | null, currentPath: string): any | null => {
    if (!items) return null

    for (const item of items) {
      if (currentPath.includes(item.path)) {
        if (item.list) {
          const foundInChildren = findNavigationItem(item.list, currentPath)
          if (foundInChildren) return foundInChildren
        }
        return item
      }
    }
    return null
  }

  const getBreadcrumbItems = () => {
    // if (!navigationData) return []

    const items = []
    const currentPath = pathname.replace('/tutorials/', '')

    items.push({
      title: 'Bosh sahifa',
      path: '/',
      hasIndex: true,
    })

    // const currentItem = findNavigationItem(navigationData, currentPath)
    // if (!currentItem) return items

    // const pathParts = currentItem.path.split('/')
    // let currentPathPart = tutorialId

    // const tutorialItem = findNavigationItem(navigationData, tutorialId)
    // if (tutorialItem) {
    //   items.push({
    //     title: tutorialItem.title,
    //     path: `/tutorials/${tutorialId}`,
    //     hasIndex: tutorialItem.hasIndex,
    //   })
    // }

    // for (const part of pathParts) {
    //   currentPathPart += (currentPathPart ? '/' : '') + part
    //   const item = findNavigationItem(navigationData, currentPathPart)
    //   if (item) {
    //     items.push({
    //       title: item.title,
    //       path: `/tutorials/${currentPathPart}`,
    //       hasIndex: item.hasIndex,
    //     })
    //   }
    // }

    return items
  }

  const breadcrumbItems = getBreadcrumbItems()

  const renderBreadcrumbItems = () => {
    if (breadcrumbItems.length <= 3) {
      return breadcrumbItems.map((item, index) => (
        <BreadcrumbItem key={item.path}>
          {index > 0 && <BreadcrumbSeparator />}
          {item.hasIndex ? (
            <Link
              href={item.path}
              title={item.title}
              className="hover:text-foreground max-w-[150px] overflow-hidden text-sm font-medium text-ellipsis transition-colors max-sm:max-w-[100px]"
            >
              {item.title}
            </Link>
          ) : (
            <BreadcrumbPage
              title={item.title}
              className="max-w-[150px] overflow-hidden text-ellipsis max-sm:max-w-[100px]"
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
          <Link href={firstItem.path} className="hover:text-foreground text-sm font-medium transition-colors">
            {firstItem.title}
          </Link>
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
              className="hover:text-foreground max-w-[150px] overflow-hidden text-sm font-medium text-ellipsis transition-colors max-sm:max-w-[100px]"
            >
              {lastItem.title}
            </Link>
          ) : (
            <BreadcrumbPage className="max-w-[200px] overflow-hidden text-ellipsis max-sm:max-w-[100px]">
              {lastItem.title}
            </BreadcrumbPage>
          )}
        </BreadcrumbItem>
      </>
    )
  }

  const renderBreadcrumbSkeleton = () => {
    return (
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-20" />
        <BreadcrumbSeparator />
        <Skeleton className="h-4 w-24" />
        <BreadcrumbSeparator />
        <Skeleton className="h-4 w-32" />
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* Breadcrumb Navigation */}
      <section className="flex items-center justify-between">
        <Breadcrumb className="max-w-4/5">
          <BreadcrumbList className="flex-nowrap overflow-hidden text-ellipsis whitespace-nowrap">
            {/* {isLoading ? renderBreadcrumbSkeleton() : renderBreadcrumbItems()} */}
          </BreadcrumbList>
        </Breadcrumb>

        <div className="m-0 flex cursor-pointer items-center gap-1">{/* <ShareButton /> */}</div>
      </section>

      {/* Main Article Content */}
      <article
        className={cn(
          'prose prose-slate dark:prose-invert',
          'dark:prose-headings:text-white prose-headings:scroll-mt-28',
          'prose-a:font-semibold prose-a:no-underline prose-pre:m-0 prose-p:my2',
          'max-w-none',
        )}
      >
        {children}
      </article>
    </div>
  )
}
