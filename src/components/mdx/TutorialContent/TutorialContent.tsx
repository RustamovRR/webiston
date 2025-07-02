'use client'

// import { useGetTutorialContentPath } from '@/hooks/queries'
import { flattenNavigation, isMarkdownContent, processContentForVideos } from '@/lib/content'
import { useEffect, useRef, useState } from 'react'
import MDXContent from '../MDXContent'
import { serializeContent } from '@/lib'
import ContentMeta from '../ContentMeta'
import ErrorContent from '../ErrorContent'
import { Pagination } from './Pagination'

// Client-side cache for MDX content
const mdxCache = new Map()

interface TutorialContentProps {
  slug: string[]
}

export default function TutorialContent({ slug }: TutorialContentProps) {
  const [mdxSource, setMdxSource] = useState<any>(null)
  const [flattenedNav, setFlattenedNav] = useState<{ title: string; path: string; fullPath: string }[]>([])
  const [contentData, setContentData] = useState<{ updatedAt?: string | null }>({})
  const [error, setError] = useState<Error | null>(null)
  const [isFirstLoad, setIsFirstLoad] = useState(true)
  const previousMdxRef = useRef<any>(null)

  // Current path is everything after the tutorial ID
  const currentPath = slug.slice(1).join('/')
  const tutorialId = slug[0]
  const cacheKey = `${tutorialId}-${currentPath}`

  // Use the new custom hook to get content data
  // const { navigation, contentResponse, isLoading, error: contentError, isFetching } = useGetTutorialContentPath(slug)

  // Process content when it's available
  // useEffect(() => {
  //   if (contentResponse?.data?.content) {
  //     const processContent = async () => {
  //       try {
  //         // Check if we have cached MDX for this content
  //         if (mdxCache.has(cacheKey)) {
  //           const cachedData = mdxCache.get(cacheKey)
  //           setMdxSource(cachedData.mdxSource)
  //           setFlattenedNav(cachedData.flattenedNav)
  //           setContentData(cachedData.contentData)
  //           setError(null)
  //           setIsFirstLoad(false)
  //           return
  //         }

  //         // Get content text
  //         const contentText = contentResponse.data.content

  //         // Process the content for videos without escaping HTML
  //         const processedContent = processContentForVideos(contentText)

  //         // Check if content is MD or MDX based on file extension
  //         const markdownType = isMarkdownContent(slug)

  //         const serializedContent = await serializeContent(processedContent, markdownType)

  //         // Create flattened navigation for pagination
  //         const flattenedNavigation = flattenNavigation(navigation || [])

  //         // Cache the processed content
  //         mdxCache.set(cacheKey, {
  //           mdxSource: serializedContent,
  //           flattenedNav: flattenedNavigation,
  //           contentData: contentResponse.data || {},
  //         })

  //         // Keep previous MDX while new one is loading
  //         previousMdxRef.current = mdxSource

  //         // Update state
  //         setMdxSource(serializedContent)
  //         setFlattenedNav(flattenedNavigation)
  //         setContentData(contentResponse.data || {})
  //         setError(null)
  //         setIsFirstLoad(false)
  //       } catch (err) {
  //         console.error('Error processing content:', err)
  //         setError(err instanceof Error ? err : new Error('Error processing content'))
  //       }
  //     }

  //     processContent()
  //   }
  // }, [contentResponse, navigation, slug, cacheKey])

  // Handle retry function
  const handleRetry = () => {
    setError(null)
    mdxCache.delete(cacheKey)
    // Force a refetch of the content
    window.location.reload()
  }

  // Show error only if we have an error and we're not loading
  // if ((error || contentError) && !isLoading && !isFetching) {
  //   return <ErrorContent message={error?.message || 'Kontent yuklashda xatolik yuz berdi'} onRetry={handleRetry} />
  // }

  // Use previous MDX while new one is loading
  const currentMdx = mdxSource || previousMdxRef.current

  return (
    <>
      <div className="markdown-content mx-auto w-full">
        <MDXContent source={currentMdx} />
      </div>

      {/* Content Metadata */}
      <ContentMeta repoName={slug[0]} updatedAt={contentData?.updatedAt} />

      {/* Pagination */}
      <Pagination currentPath={currentPath} tutorialId={slug[0]} flattenedNavigation={flattenedNav} />
    </>
  )
}
