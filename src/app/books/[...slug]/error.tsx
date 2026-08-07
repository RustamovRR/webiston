"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

/**
 * A chapter that fails to render. Like the not-found beside it, this renders
 * INSIDE `layout.tsx`, so the book's sidebar and table of contents survive and
 * only the content column is replaced — the reader can still move to a chapter
 * that works instead of being ejected from the book.
 *
 * Three fixes from the previous version:
 * - `min-h-screen` inside a shell that already owns the viewport pushed the
 *   footer a screen down.
 * - `<Link passHref><Button>` rendered `<a><button>` — interactive content
 *   inside interactive content, invalid HTML and two controls where there is
 *   one. `asChild` makes the Button *be* the link.
 * - A `useEffect` existed only to `console.error` the error. React already logs
 *   it, and `digest` is the value that actually identifies a production
 *   failure, so it is surfaced to the reader to quote instead.
 */
export default function BookChapterError({
  error,
  reset
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="not-prose py-16">
      <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-border-strong bg-card/60 px-3 py-1 font-mono text-[11px] tracking-[0.15em]">
        <span className="size-[5px] shrink-0 rounded-[1.5px] bg-destructive" />
        <span className="text-muted-foreground">Xatolik</span>
      </div>

      <h1 className="text-balance font-bold text-3xl text-foreground leading-[1.12] tracking-[-0.02em]">
        Bo'limni ochib bo'lmadi
      </h1>

      <p className="mt-5 max-w-xl text-pretty text-base text-muted-foreground leading-relaxed">
        Bu bo'limni yuklashda kutilmagan xatolik yuz berdi. Qayta urinib ko'ring
        — kitobning qolgan bo'limlari ochilaveradi.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Button
          onClick={() => reset()}
          className="h-11 cursor-pointer px-5 text-base"
        >
          Qayta urinish
        </Button>
        {/* `asChild`: the Button becomes the anchor instead of sitting inside
            one. */}
        <Button asChild variant="outline" className="h-11 px-5 text-base">
          <Link href="/books">Barcha kitoblar</Link>
        </Button>
      </div>

      {error.digest && (
        <p className="mt-10 font-mono text-[11px] text-muted-foreground">
          Xatolik kodi: <span className="text-foreground">{error.digest}</span>
        </p>
      )}
    </div>
  )
}
