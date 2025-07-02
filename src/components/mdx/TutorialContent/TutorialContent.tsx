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
        <article className="prose prose-lg dark:prose-invert prose-headings:scroll-mt-16 prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg prose-pre:bg-gray-900 dark:prose-pre:bg-gray-800 prose-code:text-pink-600 dark:prose-code:text-pink-400 w-full max-w-none">
          <MDXContent source={serializedContent} />
        </article>

        {/* Content Metadata */}
        <ContentMeta repoName={slug[0]} updatedAt={contentData?.updatedAt} />

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
