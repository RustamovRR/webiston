'use client'

import { Globe, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import dynamic from 'next/dynamic'

// Skeleton loading component
const LanguageSelectorSkeleton = () => (
  <Button
    variant="ghost"
    size="sm"
    className="flex cursor-pointer items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-800"
    disabled
  >
    <div className="animate-pulse">
      <Globe size={16} className="text-gray-400 dark:text-gray-500" />
    </div>
    <div className="relative h-4 w-6 overflow-hidden rounded bg-gray-200 dark:bg-gray-700">
      <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent bg-[length:200%_100%] dark:via-gray-400/30"></div>
    </div>
    <div className="animate-pulse">
      <ChevronDown size={14} className="text-gray-400 dark:text-gray-500" />
    </div>
  </Button>
)

// Dynamic import to avoid SSR issues
const LanguageSelectorContent = dynamic(() => import('./LanguageSelectorContent'), {
  ssr: false,
  loading: () => <LanguageSelectorSkeleton />,
})

export default function LanguageSelector() {
  return <LanguageSelectorContent />
}
