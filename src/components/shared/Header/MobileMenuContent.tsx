'use client'

import { Sidebar } from '@/components/mdx'
import { getTutorialNavigation, type TutorialNavigation } from '@/lib/mdx'
import { useEffect, useState } from 'react'
import { useNavigationStore } from '@/stores/navigationStore'
import { Skeleton } from '@/components/ui/skeleton'

interface MobileMenuContentProps {
  tutorialId: string
}

export default function MobileMenuContent({ tutorialId }: MobileMenuContentProps) {
  const storedItems = useNavigationStore((state) => state.navigationItems[tutorialId])
  const setStoredItems = useNavigationStore((state) => state.setNavigationItems)
  const [navigationItems, setNavigationItems] = useState<TutorialNavigation[] | undefined>(storedItems)

  useEffect(() => {
    if (storedItems) {
      setNavigationItems(storedItems)
      return
    }

    let isMounted = true
    const fetchNavigationItems = async () => {
      try {
        const items = await getTutorialNavigation(tutorialId)
        if (isMounted) {
          setNavigationItems(items)
          setStoredItems(tutorialId, items) // Update the store
        }
      } catch (error) {
        console.error('Failed to fetch navigation items for mobile menu:', error)
      }
    }

    if (!storedItems && tutorialId) {
      fetchNavigationItems()
    }

    return () => {
      isMounted = false
    }
  }, [tutorialId, storedItems, setStoredItems])

  if (!tutorialId) {
    return <div className="text-muted-foreground p-4 text-sm">Navigatsiya uchun darslik ID'si topilmadi.</div>
  }

  if (navigationItems === undefined) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-8 w-2/3" />
      </div>
    )
  }

  return <Sidebar tutorialId={tutorialId} navigationItems={navigationItems} />
}
