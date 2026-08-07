"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

interface ErrorContentProps {
  message?: string
  statusCode?: number
  onRetry?: () => void
}

export default function ErrorContent({
  message = "Kontent yuklashda xatolik yuz berdi",
  statusCode = 500,
  onRetry
}: ErrorContentProps) {
  const router = useRouter()

  const handleRetry = () => {
    if (onRetry) {
      onRetry()
    } else {
      // Refresh the current page
      router.refresh()
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-24 text-center">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">
          {statusCode && `${statusCode} - `}Xatolik
        </h1>
        <p className="text-lg text-muted-foreground">{message}</p>
        <div className="flex flex-row gap-4 pt-4">
          <Button onClick={handleRetry} variant="outline">
            Qayta urinib ko'rish
          </Button>
          <Link href="/books" passHref>
            <Button>Kitoblar sahifasiga qaytish</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
