import matter from "gray-matter"
import { notFound } from "next/navigation"
import { TutorialLayout } from "@/components/mdx"
import NavigationStoreInitializer from "@/components/mdx/NavigationStoreInitializer"
import {
  getMDXContent,
  getTutorialInfo,
  getTutorialNavigation,
  getTutorialTitle
} from "@/lib/mdx"

/**
 * This layout is where the 404 SPLIT is decided, and the split is the whole
 * point of `dynamicParams = true` on the page.
 *
 * - An unknown BOOK (`/books/xyz`) has no chrome to render — there is no
 *   sidebar, no table of contents, nothing to be "inside". `notFound()` thrown
 *   from a layout bubbles PAST that layout's own `not-found.tsx`, so it lands
 *   on `books/not-found.tsx`, which sits inside `books/layout.tsx` and still
 *   has the site header and footer.
 * - An unknown CHAPTER of a real book (`/books/ai-engineering/xyz`) is caught
 *   further in, by `page.tsx`, and renders this segment's `not-found.tsx`
 *   INSIDE this layout — sidebar, table of contents and all.
 *
 * That is the difference between "this book does not exist" and "you are still
 * in this book, that chapter does not exist", and the reader should be able to
 * tell them apart without reading the URL.
 */
export default async function TutorialsLayout({ children, params }: any) {
  const { slug } = await params

  if (!slug || slug.length === 0) {
    return notFound()
  }

  const tutorialId = slug[0]
  const currentPath = slug.slice(1).join("/")

  // The bound on the render surface that `dynamicParams = true` would otherwise
  // open. `getTutorialInfo` returns null unless the id matches `^[a-z0-9-]+$`
  // AND `content/<id>/_meta.json` exists, so an invented id is rejected here
  // after one `fs.access`, before any content lookup happens below.
  if (!(await getTutorialInfo(tutorialId))) {
    return notFound()
  }

  // Fetch navigation and title on the server
  const navigationItems = await getTutorialNavigation(tutorialId)
  const tutorialTitle = getTutorialTitle(tutorialId)

  let pageTitle = ""

  // Only fetch content and title for actual content pages, not the landing page
  if (currentPath) {
    const contentText = await getMDXContent(tutorialId, currentPath)
    if (contentText) {
      // Prioritize H1 from content, fallback to frontmatter title
      const h1Match = contentText.match(/^# (.*)/m)
      const h1Title = h1Match ? h1Match[1].trim() : null

      if (h1Title) {
        pageTitle = h1Title
      } else {
        // Frontmatter only — see the note in this route's `page.tsx` for why
        // this is `gray-matter` and not a full MDX compile.
        pageTitle = (matter(contentText).data?.title as string) || ""
      }
    }
  }

  return (
    <>
      <NavigationStoreInitializer
        tutorialId={tutorialId}
        navigationItems={navigationItems}
      />
      <TutorialLayout
        params={await params}
        pageTitle={pageTitle}
        navigationItems={navigationItems}
        tutorialTitle={tutorialTitle}
      >
        {children}
      </TutorialLayout>
    </>
  )
}
