"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useEffect } from "react"

export default function Error({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Xatoni log qilish
    console.error("Tutorial content error:", error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-24 text-center">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Kontent yuklashda xatolik</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Kechirasiz, kontent yuklashda xatolik yuz berdi.
        </p>
        <div className="flex flex-row gap-4 pt-4">
          <Button onClick={() => reset()} variant="outline">
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
