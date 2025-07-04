import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import Link from 'next/link'

interface PaginationProps {
  currentPath: string
  tutorialId: string
  flattenedNavigation: { title: string; path: string; fullPath: string }[]
}

export function Pagination({ currentPath, tutorialId, flattenedNavigation }: PaginationProps) {
  // Find current page index in flattened navigation
  const currentIndex = flattenedNavigation.findIndex((item) => item.path === currentPath)

  // Get prev/next pages
  const prevPage =
    currentIndex > 0
      ? {
          title: flattenedNavigation[currentIndex - 1].title,
          href: `/books/${tutorialId}/${flattenedNavigation[currentIndex - 1].path}`,
        }
      : undefined

  const nextPage =
    currentIndex < flattenedNavigation.length - 1
      ? {
          title: flattenedNavigation[currentIndex + 1].title,
          href: `/books/${tutorialId}/${flattenedNavigation[currentIndex + 1].path}`,
        }
      : undefined

  return (
    <div className="my-5 flex items-center justify-between gap-8">
      {prevPage ? (
        <div className="flex w-1/2 justify-start">
          <Link className="group flex items-end gap-2" href={prevPage.href} prefetch>
            <ChevronLeftIcon className="stroke-[1px] text-[#8D8D93] duration-200 group-hover:text-black dark:group-hover:text-white" />
            <div className="group flex flex-col">
              <span className="text-xs font-normal text-[#8D8D93] transition-all duration-200 group-hover:text-black max-sm:text-sm dark:group-hover:text-white">
                Oldingi
              </span>
              <span className="text-lg text-black max-sm:text-base dark:text-white">{prevPage.title}</span>
            </div>
          </Link>
        </div>
      ) : (
        <div />
      )}
      {nextPage && (
        <div className="flex w-1/2 justify-end">
          <Link className="group flex flex-col items-start" href={nextPage.href} prefetch>
            <span className="text-xs font-normal text-[#8D8D93] transition-all duration-200 group-hover:text-black max-sm:text-sm dark:group-hover:text-white">
              Keyingi
            </span>
            <div className="group flex items-center gap-2">
              <span className="line-clamp-2 text-lg text-black max-sm:text-base dark:text-white">{nextPage.title}</span>
              <div className="justify-self-end">
                <ChevronRightIcon className="stroke-[1px] text-[#8D8D93] duration-200 group-hover:text-black dark:group-hover:text-white" />
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  )
}
