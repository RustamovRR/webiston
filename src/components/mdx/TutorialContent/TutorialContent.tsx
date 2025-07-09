import { getMDXContent, getTutorialNavigation } from '@/lib/mdx'
import { flattenNavigation, processContentForVideos } from '@/lib/content'
import MDXContent from '../MDXContent'
import ContentMeta from '../ContentMeta'
import ErrorContent from '../ErrorContent'
import { Pagination } from './Pagination'
import matter from 'gray-matter'

interface TutorialContentProps {
  slug: string[]
}

export default async function TutorialContent({ slug }: TutorialContentProps) {
  try {
    // Current path is everything after the tutorial ID
    const currentPath = slug.slice(1).join('/')
    const tutorialId = slug[0]

    // Load navigation data
    const navigation = await getTutorialNavigation(tutorialId)

    // Load MDX content
    const contentText = await getMDXContent(tutorialId, currentPath)

    if (!contentText) {
      throw new Error('Kontent topilmadi')
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
        <Pagination currentPath={currentPath} tutorialId={slug[0]} flattenedNavigation={flattenedNavigation} />
      </>
    )
  } catch (err) {
    console.error('Error loading content:', err)
    const errorMessage = err instanceof Error ? err.message : 'Kontent yuklashda xatolik yuz berdi'
    return <ErrorContent message={errorMessage} />
  }
}
