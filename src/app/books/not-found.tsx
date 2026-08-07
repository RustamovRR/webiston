import ButtonLink from "@/components/shared/ButtonLink/ButtonLink"
import { getAllTutorials } from "@/lib/mdx"

/**
 * "That book does not exist" — the middle rung of the 404 ladder.
 *
 * Reached when `books/[...slug]/layout.tsx` calls `notFound()` for an unknown
 * book id. A `notFound()` thrown from a layout bubbles PAST that layout's own
 * `not-found.tsx` (it would have had to render inside the very layout that
 * failed), so it lands here — inside `books/layout.tsx`, which still supplies
 * the site header and footer.
 *
 * There is nothing to be "inside" for an invented book, so unlike the chapter
 * one this is centred in the column rather than aligned to a reading measure.
 * It lists the books that DO exist, read from `content/**` rather than typed
 * out, because "not found" is only useful next to "here is what is".
 */
export default async function BookNotFound() {
  const tutorials = (await getAllTutorials()).filter(Boolean)

  return (
    <div className="mx-auto flex w-full max-w-[1536px] flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8">
      <div className="mb-5 inline-flex items-center gap-2.5 rounded-full border border-border-strong bg-card/60 px-3 py-1 font-mono text-[11px] tracking-[0.15em]">
        <span className="size-[5px] shrink-0 rounded-[1.5px] bg-primary" />
        <span className="text-muted-foreground">404</span>
      </div>

      <h1 className="text-balance font-bold text-3xl text-foreground leading-[1.12] tracking-[-0.02em] sm:text-4xl">
        Bunday kitob yo'q
      </h1>

      <p className="mt-5 max-w-md text-pretty text-base text-muted-foreground leading-relaxed">
        Manzil noto'g'ri yozilgan bo'lishi mumkin. Hozircha mavjud kitoblar:
      </p>

      {/* Derived from `content/**`, never typed in — a hardcoded list here
          would be the first thing to go stale when a fourth book lands. */}
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        {tutorials.map((tutorial) => (
          <ButtonLink
            key={tutorial?.id}
            isNextLink
            href={`/books/${tutorial?.id}`}
            variant="outline"
            className="h-11 px-5 text-base"
          >
            {tutorial?.title?.split(":")[0]}
          </ButtonLink>
        ))}
      </div>

      <div className="mt-8">
        <ButtonLink
          isNextLink
          href="/books"
          variant="primary"
          className="h-11 px-5 text-base"
        >
          Barcha kitoblar
        </ButtonLink>
      </div>
    </div>
  )
}
