import matter from "gray-matter"
import type { Metadata } from "next"
import { notFound, unstable_rethrow } from "next/navigation"
import {
  ErrorContent,
  TutorialContent,
  TutorialLanding
} from "@/components/mdx"
import { getAllTutorialPaths, getMDXContent, getTutorialInfo } from "@/lib/mdx"
import { SITE_URL } from "@/lib/seo"

interface BookPageProps {
  params: Promise<{ slug: string[] }>
}

/** MDX frontmatter comes from hand-authored `.mdx` files, so every field is
 *  unknown until it has been checked. Typing it `any` hid four real holes here:
 *  a numeric or missing `title` would have been interpolated as-is. */
function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined
}

/** Share card for a chapter. Rendered by `src/app/api/og/route.tsx`. */
function ogImage(title: string, path: string) {
  return [
    {
      url: `/api/og?title=${encodeURIComponent(title)}&path=${encodeURIComponent(path)}`,
      width: 1200,
      height: 630
    }
  ]
}

export async function generateStaticParams() {
  const paths = await getAllTutorialPaths()
  return paths
}

// `true`, deliberately — and this is a UX decision, not a perf one.
//
// Every known path is still prerendered: `generateStaticParams` reads
// `content/**` and emits all 226 chapters plus the three landing pages, and
// none of that changes here. What `dynamicParams` controls is only what happens
// to an UNKNOWN path.
//
// With `false`, Next rejected unknown params at the ROUTING layer, before the
// segment rendered. That sounds cheaper, and it is — but it also means
// `notFound()` is never reached, so `not-found.tsx` in this segment could never
// render, and a reader who mistyped one chapter of a book they were already
// reading was thrown out to a site-wide 404 with no sidebar, no table of
// contents and no way back into the book.
//
// With `true` the segment renders, `notFound()` fires, and Next renders this
// segment's `not-found.tsx` INSIDE `layout.tsx` — so the book's chrome survives
// and the message appears where the chapter would have been. The status is
// still 404.
//
// The render surface stays bounded: `layout.tsx` rejects any id that is not a
// real book before this page runs (see the guard there), so an unknown path
// costs one cheap render that ends in `notFound()`, not a content lookup.
export const dynamicParams = true

// Dinamik metadata yaratish.
//
// Every branch sets its own `alternates.canonical`. Without it these pages
// inherit the site-wide `canonical: "https://webiston.uz"` from the root layout,
// which told Google that all 229 chapters were duplicates of the homepage.
// Titles carry no "| Webiston" suffix — the root layout's `%s | Webiston`
// template appends it.
export async function generateMetadata({
  params
}: BookPageProps): Promise<Metadata> {
  const { slug } = await params

  // `generateMetadata` runs independently of the render, so it cannot see that
  // the page is about to call `notFound()`. Without these two guards a 404
  // shipped a title claiming the page exists: an unknown chapter got its slug
  // title-cased into "ModelingXXX | AI Engineering…", and an unknown book got
  // the bare fallback "Darslik". Next injects `noindex` on a 404 response by
  // itself; the misleading TITLE is ours to prevent.
  const NOT_FOUND_METADATA: Metadata = {
    title: "Topilmadi",
    description: "Siz izlagan sahifa mavjud emas.",
    robots: { index: false, follow: true }
  }

  if (!slug || slug.length === 0) {
    return NOT_FOUND_METADATA
  }

  try {
    // Get tutorial ID
    const tutorialId = slug[0]

    // Get tutorial info
    const tutorialInfo = await getTutorialInfo(tutorialId)

    // The same guard the layout applies, for the same reason — an invented book
    // id must not produce a page title that sounds like a real book.
    if (!tutorialInfo) {
      return NOT_FOUND_METADATA
    }

    // Agar bu tutorial landing page bo'lsa
    if (slug.length === 1) {
      const title = tutorialInfo?.title || "Darslik"
      const description =
        tutorialInfo?.description ||
        "Keng qamrovli darsliklarimiz orqali dasturlashni o'rganing."
      const path = `/books/${tutorialId}`

      return {
        title,
        description,
        alternates: { canonical: `${SITE_URL}${path}` },
        openGraph: {
          title,
          description,
          url: `${SITE_URL}${path}`,
          images: ogImage(title, path)
        }
      }
    }

    // Agar bu tutorial content page bo'lsa - frontmatter'dan metadata olish
    const currentPath = slug.slice(1).join("/")
    const contentText = await getMDXContent(tutorialId, currentPath)

    if (contentText) {
      // `gray-matter`, not a full MDX compile.
      //
      // This used to call `serializeContent(contentText, false)` — remark,
      // rehype, acorn and JSX codegen over the entire chapter — and then read
      // **one property**: `.frontmatter`. Everything else was thrown away, for
      // all 226 chapters, on every build.
      //
      // It was also the source of the three "Could not parse expression with
      // acorn" build errors. `serializeContent` runs WITHOUT `remark-math`, so
      // KaTeX braces like `^{-\frac{1}{n}}` reached the MDX parser as JSX
      // expressions. The rendered page never had that problem — `MDXContent`
      // compiles with `remarkMath` + `rehypeKatex` — so this was a compile
      // nothing rendered, failing on syntax nothing rendered.
      //
      // `TutorialContent` has always read frontmatter this way. Same parser,
      // same result, no compiler.
      const frontmatter: Record<string, unknown> = matter(contentText).data
      const title =
        asString(frontmatter.title) ??
        slug[slug.length - 1]
          .split("-")
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")

      const description =
        asString(frontmatter.description) ??
        `Keng qamrovli darsligimizda ${title} haqida batafsil o'rganing.`
      const keywords = asString(frontmatter.keywords)
      const author = asString(frontmatter.author)

      const pageTitle = `${title} | ${tutorialInfo?.title || "Darslik"}`
      const path = `/books/${slug.join("/")}`

      return {
        title: pageTitle,
        description,
        keywords: keywords?.split(",").map((k) => k.trim()),
        authors: author ? [{ name: author }] : undefined,
        alternates: { canonical: `${SITE_URL}${path}` },
        openGraph: {
          title: pageTitle,
          description,
          url: `${SITE_URL}${path}`,
          images: ogImage(title, path)
        },
        twitter: {
          card: "summary_large_image",
          title: pageTitle,
          description
        }
      }
    }

    // No content for this path means `TutorialContent` is about to call
    // `notFound()`. The old fallback here invented a plausible title from the
    // URL — `/…/modelingXXX` became "ModelingXXX | AI Engineering…", complete
    // with a canonical URL and an OG image, for a page that returns 404.
    return NOT_FOUND_METADATA
  } catch (error) {
    console.error("Error generating metadata:", error)
    return {
      title: "Error",
      description: "An error occurred while loading this page.",
      robots: { index: false, follow: false }
    }
  }
}

export default async function TutorialPage({ params }: BookPageProps) {
  const { slug } = await params

  if (!slug || slug.length === 0) {
    return notFound()
  }

  try {
    // Get tutorial ID
    const tutorialId = slug[0]

    // Get tutorial info
    const tutorialInfo = await getTutorialInfo(tutorialId)

    if (!tutorialInfo) {
      return notFound()
    }

    // If this is a tutorial landing page (only has tutorial ID, no content path)
    if (slug.length === 1) {
      return (
        <TutorialLanding
          tutorialId={tutorialId}
          tutorialData={tutorialInfo}
          navigationItems={tutorialInfo.navigation || []}
        />
      )
    }

    // For content pages, use the server-side TutorialContent component
    return (
      <div className="mx-auto pt-4 pb-2">
        <TutorialContent slug={slug} />
      </div>
    )
  } catch (error) {
    // `notFound()` signals by throwing, so this catch was swallowing it and
    // returning `<ErrorContent />` with HTTP 200 — an unknown book id rendered
    // an empty landing page instead of a 404.
    unstable_rethrow(error)

    console.error("Error in tutorial page:", error)
    return <ErrorContent />
  }
}
