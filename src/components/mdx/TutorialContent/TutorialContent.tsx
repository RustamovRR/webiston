import matter from "gray-matter"
import { notFound, unstable_rethrow } from "next/navigation"
import { flattenNavigation, processContentForVideos } from "@/lib/content"
import { getMDXContent, getTutorialNavigation } from "@/lib/mdx"
import ContentMeta from "../ContentMeta"
import ErrorContent from "../ErrorContent"
import MDXContent from "../MDXContent"
import { Pagination } from "./Pagination"

interface TutorialContentProps {
  slug: string[]
}

export default async function TutorialContent({ slug }: TutorialContentProps) {
  try {
    // Current path is everything after the tutorial ID
    const currentPath = slug.slice(1).join("/")
    const tutorialId = slug[0]

    // Load navigation data
    const navigation = await getTutorialNavigation(tutorialId)

    // Load MDX content
    const contentText = await getMDXContent(tutorialId, currentPath)

    // A chapter that does not exist is a 404, not a rendered error page.
    // This used to `throw new Error(...)`, get caught below, and return
    // `<ErrorContent>` with HTTP **200** — a soft 404. Google indexes those and
    // spends crawl budget on them. `notFound()` sets the real status.
    if (!contentText) {
      notFound()
    }

    // Parse frontmatter and content from the raw string using gray-matter
    const { content: mdxContent, data: frontmatter } = matter(contentText)

    // Process the content for videos without escaping HTML
    const processedContent = processContentForVideos(mdxContent)

    // Create flattened navigation for pagination
    const navigationArray = Array.isArray(navigation) ? navigation : []
    const flattenedNavigation = flattenNavigation(navigationArray)

    // Use frontmatter for metadata, for example:
    const updatedAt = frontmatter.updatedAt || new Date().toISOString()

    return (
      <>
        <div className="markdown-content mx-auto w-full">
          <MDXContent source={processedContent} />
        </div>

        {/* Content Metadata */}
        <ContentMeta updatedAt={updatedAt} />

        {/* Pagination */}
        <Pagination
          currentPath={currentPath}
          tutorialId={slug[0]}
          flattenedNavigation={flattenedNavigation}
        />
      </>
    )
  } catch (err) {
    // `notFound()` and `redirect()` signal through thrown errors. Swallowing
    // them here would turn a real 404 back into a 200 error page — which is
    // exactly the bug above, one layer up.
    unstable_rethrow(err)

    console.error("Error loading content:", err)
    const errorMessage =
      err instanceof Error ? err.message : "Kontent yuklashda xatolik yuz berdi"
    return <ErrorContent message={errorMessage} />
  }
}
