import { ErrorContent, TutorialContent, TutorialLanding } from '@/components/mdx'
import { getAllTutorials, getTutorialInfo, getMDXContent } from '@/lib/mdx'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 3600

const navigationCache = new Map()

// Dinamik metadata yaratish
export async function generateMetadata({ params }: any): Promise<any> {
  const { slug } = await params

  if (!slug || slug.length === 0) {
    return {
      title: 'Not Found | Webiston',
      description: 'The page you are looking for does not exist.',
    }
  }

  try {
    // Get tutorial ID
    const tutorialId = slug[0]

    // Get tutorial info
    const tutorialInfo = await getTutorialInfo(tutorialId)

    // Agar bu tutorial landing page bo'lsa
    if (slug.length === 1) {
      return {
        title: `${tutorialInfo?.title || 'Darslik'} | Webiston`,
        description: tutorialInfo?.description || "Keng qamrovli darsliklarimiz orqali dasturlashni o'rganing.",
        openGraph: {
          title: `${tutorialInfo?.title || 'Darslik'} | Webiston`,
          description: tutorialInfo?.description || "Keng qamrovli darsliklarimiz orqali dasturlashni o'rganing.",
          url: `https://webiston.uz/books/${tutorialId}`,
          images: [
            {
              url: `/api/og?title=${encodeURIComponent(tutorialInfo?.title || 'Tutorial')}&path=books/${tutorialId}`,
              width: 1200,
              height: 630,
            },
          ],
        },
      }
    }

    // Agar bu tutorial content page bo'lsa - frontmatter'dan metadata olish
    const currentPath = slug.slice(1).join('/')
    const contentText = await getMDXContent(tutorialId, currentPath)

    if (contentText) {
      // Frontmatter'ni parse qilish uchun MDX serialize qilamiz
      const { serializeContent } = await import('@/lib')
      const serializedContent = await serializeContent(contentText, false)

      // Frontmatter'dan metadata olish
      const frontmatter = serializedContent.frontmatter || {}
      const title =
        frontmatter.title ||
        slug[slug.length - 1]
          .split('-')
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ')

      const description = frontmatter.description || `Keng qamrovli darsligimizda ${title} haqida batafsil o'rganing.`
      const keywords = frontmatter.keywords || ''

      return {
        title: `${title} | ${tutorialInfo?.title || 'Darslik'} | Webiston`,
        description,
        keywords:
          keywords && typeof keywords === 'string' ? keywords.split(',').map((k: string) => k.trim()) : undefined,
        authors: frontmatter.author ? [{ name: frontmatter.author }] : undefined,
        openGraph: {
          title: `${title} | ${tutorialInfo?.title || 'Darslik'} | Webiston`,
          description,
          url: `https://webiston.uz/books/${slug.join('/')}`,
          images: [
            {
              url: `/api/og?title=${encodeURIComponent(title)}&path=books/${slug.join('/')}`,
              width: 1200,
              height: 630,
            },
          ],
        },
        twitter: {
          card: 'summary_large_image',
          title: `${title} | ${tutorialInfo?.title || 'Darslik'} | Webiston`,
          description,
        },
      }
    }

    // Fallback agar content topilmasa
    const fallbackTitle = slug[slug.length - 1]
      .split('-')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    return {
      title: `${fallbackTitle} | ${tutorialInfo?.title || 'Darslik'} | Webiston`,
      description: `Keng qamrovli darsligimizda ${fallbackTitle} haqida batafsil o'rganing.`,
      openGraph: {
        title: `${fallbackTitle} | ${tutorialInfo?.title || 'Darslik'} | Webiston`,
        description: `Keng qamrovli darsligimizda ${fallbackTitle} haqida batafsil o'rganing.`,
        url: `https://webiston.uz/books/${slug.join('/')}`,
        images: [
          {
            url: `/api/og?title=${encodeURIComponent(fallbackTitle)}&path=books/${slug.join('/')}`,
            width: 1200,
            height: 630,
          },
        ],
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Error | Webiston',
      description: 'An error occurred while loading this page.',
    }
  }
}

export default async function TutorialPage({ params }: any) {
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
      <div className="container mx-auto py-8">
        <TutorialContent slug={slug} />
      </div>
    )
  } catch (error) {
    console.error('Error in tutorial page:', error)
    return <ErrorContent />
  }
}
