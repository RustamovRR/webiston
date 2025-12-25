import { TutorialLayout } from "@/components/mdx"
import {
  getMDXContent,
  getTutorialNavigation,
  getTutorialTitle,
  serializeContent
} from "@/lib/mdx"
import { notFound } from "next/navigation"
import NavigationStoreInitializer from "@/components/mdx/NavigationStoreInitializer"

export default async function TutorialsLayout({ children, params }: any) {
  const { slug } = await params

  if (!slug || slug.length === 0) {
    return notFound()
  }

  const tutorialId = slug[0]
  const currentPath = slug.slice(1).join("/")

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
        const serializedContent = await serializeContent(contentText, false)
        pageTitle = (serializedContent.frontmatter?.title as string) || ""
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
