import Image from "next/image"
import Link from "next/link"

export default function Logo() {
  return (
    <Link href="/" className="relative flex items-center gap-2">
      {/* `/logo-100.png`, not `/logo.png`. The original is 1120×1120 / 209 KB
          and `images.unoptimized: true` (next.config.ts) means Next serves it
          byte-for-byte — 209 KB downloaded on every page to paint a 50 px mark.
          This is the same artwork at 100×100 (2× for retina): 5.5 KB.
          `/logo.png` is still the source of truth for share cards and JSON-LD,
          where the large square is correct. */}
      <Image
        src="/logo-100.png"
        alt="Webiston Logo"
        width={50}
        height={50}
        priority
      />
      <span className="hidden text-lg font-bold sm:inline">Webiston</span>
    </Link>
  )
}
