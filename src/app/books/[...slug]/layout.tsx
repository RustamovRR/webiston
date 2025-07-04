import { TutorialLayout } from '@/components/mdx'
import { getMDXContent, serializeContent } from '@/lib'
import { notFound } from 'next/navigation'

export default async function TutorialsLayout({ children, params }: any) {
  const { slug } = await params

  if (!slug || slug.length === 0) {
    return notFound()
  }

  const tutorialId = slug[0]
  const currentPath = slug.slice(1).join('/')

  let pageTitle = ''

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
        const serializedContent = await serializeContent(contentText, false)
        pageTitle = (serializedContent.frontmatter?.title as string) || ''
      }
    }
  }

  return (
    <TutorialLayout className="px-8 max-lg:px-4" params={await params} pageTitle={pageTitle}>
      {children}
    </TutorialLayout>
  )
}
