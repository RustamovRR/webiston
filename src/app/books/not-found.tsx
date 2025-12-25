import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-24 text-center">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">Darslik topilmadi</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Kechirasiz, siz izlayotgan darslik mavjud emas.
        </p>
        <div className="pt-4">
          <Link href="/" passHref>
            <Button>Bosh sahifaga qaytish</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
