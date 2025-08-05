'use client'

import { ISearchHit } from '@/types'
import { useRouter } from 'next/navigation'
import { CustomSearchBox, GroupedHit, NoResults } from './SearchComponents'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AnimatePresence, motion } from 'framer-motion'
import { FileSearch } from 'lucide-react'
import { useMobileMenuStore } from '@/stores'

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  query: string
  hits: ISearchHit[][]
  loading: boolean
  onSearch: (value: string) => void
  onClearSearch: () => void
}

export default function SearchDialog({
  open,
  onOpenChange,
  query,
  hits,
  loading,
  onSearch,
  onClearSearch,
}: SearchDialogProps) {
  const router = useRouter()
  const closeMobileMenu = useMobileMenuStore((state) => state.close)

  const handleHitClick = (path: string) => {
    onOpenChange(false) // Close the search dialog
    onClearSearch()
    closeMobileMenu() // Close the mobile menu
  }

  const hasResults = hits.length > 0
  const showInitialState = !loading && !hasResults && !query
  const showNoResults = !loading && !hasResults && query
  const showLoading = loading && !hasResults

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex h-[450px] max-h-[90vh] flex-col overflow-hidden p-0 sm:max-w-[600px]">
        <DialogHeader className="border-b px-4 pt-4 pb-3">
          <DialogTitle>Sayt bo'yicha qidiruv</DialogTitle>
        </DialogHeader>

        <div className="px-4 pt-4">
          <CustomSearchBox value={query} onChange={onSearch} />
        </div>

        <div className="flex-1 overflow-y-auto px-4">
          <AnimatePresence mode="wait">
            {showLoading && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full items-center justify-center text-sm text-gray-500"
              >
                Qidirilmoqda...
              </motion.div>
            )}

            {showNoResults && (
              <motion.div key="no-results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <NoResults query={query} />
              </motion.div>
            )}

            {showInitialState && (
              <motion.div
                key="initial"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex h-full flex-col items-center justify-center text-center"
              >
                <FileSearch className="h-10 w-10 text-gray-300 dark:text-gray-700" />
                <p className="mt-3 text-sm text-gray-500">Qidiruv orqali kerakli mavzuni tezda toping.</p>
              </motion.div>
            )}

            {hasResults && (
              <motion.div key="results" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                {hits.map((groupedHits, index) => (
                  <GroupedHit key={groupedHits[0]?.objectID || index} hits={groupedHits} onHitClick={handleHitClick} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  )
}
