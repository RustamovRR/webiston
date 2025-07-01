'use client'

import { Button } from '@/components/ui/button'
import { ISearchHit } from '@/types'
import { useRouter } from 'next/navigation'
import { CustomSearchBox, GroupedHit, NoResults } from './SearchComponents'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  query: string
  hits: ISearchHit[][]
  loading: boolean
  filter: string
  onFilterChange: (type: string) => void
  onSearch: (value: string) => void
  onClearSearch: () => void
}

export default function SearchDialog({
  open,
  onOpenChange,
  query,
  hits,
  loading,
  filter,
  onFilterChange,
  onSearch,
  onClearSearch,
}: SearchDialogProps) {
  const router = useRouter()

  // Function to handle hit click and close dialog
  const handleHitClick = (path: string) => {
    // Close dialog
    onOpenChange(false)
    // Clear search
    onClearSearch()
    // Navigate to path with hash if available
    router.push(path)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-hidden p-0 sm:max-w-[600px]">
        <DialogHeader className="p-6 pb-3">
          <DialogTitle>Qidiruv</DialogTitle>
        </DialogHeader>

        <div className="px-6">
          <CustomSearchBox value={query} onChange={onSearch} />
        </div>

        <div className="bg-background sticky top-0 z-10 flex items-center justify-between border-t border-b px-6 py-2">
          <span className="text-sm font-medium">Qidiruv natijalari</span>
          <div className="text-muted-foreground flex items-center gap-2 text-sm">
            <button
              className={`hover:text-blue-secondary cursor-pointer ${!filter ? 'text-blue-secondary' : ''}`}
              onClick={() => onFilterChange('')}
            >
              Barchasi
            </button>
            <button
              className={`hover:text-blue-secondary cursor-pointer ${filter === 'contentType:tutorial' ? 'text-blue-secondary' : ''}`}
              onClick={() => onFilterChange('tutorial')}
            >
              Darslik
            </button>
            <button
              className={`hover:text-blue-secondary cursor-pointer ${filter === 'contentType:article' ? 'text-blue-secondary' : ''}`}
              onClick={() => onFilterChange('article')}
            >
              Maqola
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6">
          {loading ? (
            <div className="py-10 text-center text-sm text-gray-500">Yuklanmoqda...</div>
          ) : (
            <>
              {hits.length > 0 ? (
                <div className="space-y-6 py-4">
                  {hits.map((groupedHits, index) => {
                    return (
                      <GroupedHit
                        key={groupedHits[0]?.objectID || index}
                        hits={groupedHits}
                        onHitClick={handleHitClick}
                      />
                    )
                  })}
                </div>
              ) : (
                <NoResults query={query} />
              )}
            </>
          )}
        </div>

        <div className="border-t p-6 pt-3">
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => {
              if (query) {
                const searchParams = new URLSearchParams()
                searchParams.set('q', query)
                if (filter) {
                  searchParams.set('filter', filter)
                }
                // Close modal before navigation
                onOpenChange(false)
                onClearSearch()
                router.push(`/search?${searchParams.toString()}`)
              }
            }}
          >
            Barcha natijalarni ko'rish
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
