'use client'

import Sidebar from '@/components/mdx/Sidebar'
import { Skeleton } from '@/components/ui/skeleton'
import Search from '../Search'
import { ThemeSwitcher } from '../ThemeSwitcher'
import { useNavigationStore } from '@/stores/navigationStore'

interface MobileMenuContentProps {
  tutorialId: string
  onClose: () => void
}

export default function MobileMenuContent({ tutorialId, onClose }: MobileMenuContentProps) {
  const navigationItems = useNavigationStore((state) => state.navigationItems[tutorialId])

  if (!tutorialId) {
    return <div className="text-muted-foreground p-4 text-sm">Navigatsiya uchun darslik ID'si topilmadi.</div>
  }

  if (!navigationItems) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-8 w-2/3" />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <section className="p-4">
        <Search />
      </section>
      <section className="flex-grow overflow-y-auto px-4">
        <Sidebar tutorialId={tutorialId} navigationItems={navigationItems} onLinkClick={onClose} />
      </section>
      <section className="flex-shrink-0 border-t p-4">
        <div className="flex items-center justify-end">
          <ThemeSwitcher />
        </div>
      </section>
    </div>
  )
}
