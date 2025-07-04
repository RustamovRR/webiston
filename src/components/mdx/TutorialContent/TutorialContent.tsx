import { getMDXContent, getTutorialNavigation } from '@/lib/mdx'
import { flattenNavigation, processContentForVideos } from '@/lib/content'
import MDXContent from '../MDXContent'
import { serializeContent } from '@/lib'
import ContentMeta from '../ContentMeta'
import ErrorContent from '../ErrorContent'
import { Pagination } from './Pagination'

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

    // Process the content for videos without escaping HTML
    const processedContent = processContentForVideos(contentText)

    // Serialize the MDX content
    const serializedContent = await serializeContent(processedContent, false)

    // Create flattened navigation for pagination
    const navigationArray = Array.isArray(navigation) ? navigation : []
    const flattenedNavigation = flattenNavigation(navigationArray)

    const contentData = { updatedAt: new Date().toISOString() }

    return (
      <>
        <div className="markdown-content mx-auto w-full">
          <MDXContent source={serializedContent} />
        </div>

        {/* Content Metadata */}
        <ContentMeta updatedAt={contentData?.updatedAt} />

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
