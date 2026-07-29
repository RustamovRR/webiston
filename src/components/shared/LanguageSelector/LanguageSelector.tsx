"use client"

import { ChevronDown, Globe } from "lucide-react"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"

// Skeleton loading component
const LanguageSelectorSkeleton = () => (
  <Button
    variant="ghost"
    size="sm"
    className="flex cursor-pointer items-center gap-2 hover:bg-accent"
    disabled
  >
    <div className="animate-pulse">
      <Globe size={16} className="text-muted-foreground" />
    </div>
    <div className="relative h-4 w-6 overflow-hidden rounded bg-muted">
      <div className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-foreground/20 to-transparent bg-[length:200%_100%]"></div>
    </div>
    <div className="animate-pulse">
      <ChevronDown size={14} className="text-muted-foreground" />
    </div>
  </Button>
)

// Dynamic import to avoid SSR issues
const LanguageSelectorContent = dynamic(
  () => import("./LanguageSelectorContent"),
  {
    ssr: false,
    loading: () => <LanguageSelectorSkeleton />
  }
)

export default function LanguageSelector() {
  return <LanguageSelectorContent />
}
