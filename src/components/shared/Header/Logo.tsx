import Link from "next/link"
import Image from "next/image"

export default function Logo() {
  return (
    <Link href="/" className="relative flex items-center gap-2">
      <Image src="/logo.png" alt="Webiston Logo" width={50} height={50} />
      <span className="hidden text-lg font-bold sm:inline">Webiston</span>
    </Link>
  )
}
