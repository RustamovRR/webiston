import Link from "next/link"
import ButtonLink from "@/components/shared/ButtonLink/ButtonLink"

/**
 * "That chapter does not exist" — rendered INSIDE `layout.tsx`, so the reader
 * keeps the book's sidebar, the table-of-contents rail, the breadcrumb and the
 * header. Only the content column changes.
 *
 * This is what `dynamicParams = true` on the page bought: under `false`, Next
 * rejected the URL at the routing layer and this file could never run, so one
 * mistyped chapter threw the reader out to a site-wide 404 with no way back
 * into the book they were reading.
 *
 * Two things the previous version got wrong, beyond never rendering:
 * `min-h-screen` inside a shell that already owns the viewport just pushed the
 * footer a screen down, and `<Link passHref><Button>` produced `<a><button>` —
 * interactive content nested inside interactive content, which is invalid HTML
 * and gives screen readers two controls where there is one.
 */
export default function ChapterNotFound() {
  return (
    <div className="not-prose py-16">
      <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-border-strong bg-card/60 px-3 py-1 font-mono text-[11px] tracking-[0.15em]">
        <span className="size-[5px] shrink-0 rounded-[1.5px] bg-primary" />
        <span className="text-muted-foreground">404</span>
      </div>

      <h1 className="text-balance font-bold text-3xl text-foreground leading-[1.12] tracking-[-0.02em]">
        Bu bo'lim topilmadi
      </h1>

      <p className="mt-5 max-w-xl text-pretty text-base text-muted-foreground leading-relaxed">
        Manzil noto'g'ri yozilgan yoki bo'lim ko'chirilgan bo'lishi mumkin.
        Kitobning qolgan bo'limlari joyida — chapdagi mundarijadan tanlashingiz
        mumkin.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink
          isNextLink
          href="/books"
          variant="primary"
          className="h-11 px-5 text-base"
        >
          Barcha kitoblar
        </ButtonLink>
        <ButtonLink
          isNextLink
          href="/"
          variant="outline"
          className="h-11 px-5 text-base"
        >
          Bosh sahifa
        </ButtonLink>
      </div>

      <p className="mt-10 font-mono text-[11px] text-muted-foreground">
        Yoki <kbd className="text-foreground">⌘K</kbd> bilan qidiring —{" "}
        <Link
          href="/books"
          className="transition-colors duration-200 hover:text-foreground"
        >
          /books
        </Link>
      </p>
    </div>
  )
}
