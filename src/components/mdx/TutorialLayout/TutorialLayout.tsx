'use client'

import { cn } from '@/lib'
import type { TutorialNavigation } from '@/lib/mdx'
import Sidebar from '../Sidebar'
import TableOfContents from '../TableOfContents'
import TutorialLayoutContent from '../TutorialLayoutContent'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { PanelsTopLeft, PanelTop } from 'lucide-react'

interface DocLayoutProps {
  children: React.ReactNode
  className?: string
  params: {
    slug: string[]
  }
  pageTitle?: string
  navigationItems: TutorialNavigation[]
  tutorialTitle: string
}

export default function TutorialLayout({
  children,
  className,
  params,
  pageTitle,
  navigationItems,
  tutorialTitle,
}: DocLayoutProps) {
  const { slug } = params
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const tutorialId = slug[0]

  return (
    <div className="relative mx-auto flex min-h-[calc(100vh-3.5rem)] max-w-[1536px]">
      <aside
        className={cn(
          'sticky top-[3.5rem] left-0 z-30 h-[calc(100vh-3.5rem)] transition-all duration-500 ease-in-out max-lg:hidden',
          isSidebarOpen ? 'border-border w-72 border-r' : 'w-0 border-r-transparent',
        )}
      >
        <div
          className={cn(
            'h-full overflow-hidden py-6 pl-4 transition-opacity duration-200',
            isSidebarOpen ? 'opacity-100' : 'opacity-0 delay-150',
          )}
        >
          <Sidebar tutorialId={tutorialId} navigationItems={navigationItems} />
        </div>
        <Button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          variant="ghost"
          size="icon"
          className={cn(
            'absolute top-[21px] left-[calc(100%+0.3rem)] h-10 w-10 cursor-pointer transition-transform duration-500 ease-in-out',
            {
              'translate-x-4': !isSidebarOpen,
            },
          )}
        >
          {isSidebarOpen ? <PanelsTopLeft /> : <PanelTop />}
        </Button>
      </aside>

      <section className={cn('mr-4 flex-1 overflow-y-auto transition-all duration-300 ease-in-out', className)}>
        <div
          className={cn('mx-auto pt-8 pl-12 transition-transform duration-500 ease-in-out', {
            'translate-x-4': !isSidebarOpen,
          })}
        >
          <TutorialLayoutContent tutorialTitle={tutorialTitle} navigationItems={navigationItems} pageTitle={pageTitle}>
            {children}
          </TutorialLayoutContent>
        </div>
      </section>

      <nav className="sticky top-[3.5rem] hidden h-[calc(100vh-3.5rem)] w-64 flex-shrink-0 max-lg:hidden lg:block">
        <div className="h-full px-4 py-6">
          <TableOfContents slug={slug} />
        </div>
      </nav>
    </div>
  )
}
