import { ErrorContent, TutorialContent, TutorialLanding } from '@/components/mdx'
import { getAllTutorials, getTutorialInfo } from '@/lib/mdx'
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

    // Agar bu tutorial content page bo'lsa
    // Path-ni yaratish
    const path = slug.join('/')

    // Sarlavhani olish (oxirgi slug)
    const title = slug[slug.length - 1]
      .split('-')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    return {
      title: `${title} | ${tutorialInfo?.title || 'Darslik'} | Webiston`,
      description: `Keng qamrovli darsligimizda ${title} haqida batafsil o'rganing.`,
      openGraph: {
        title: `${title} | ${tutorialInfo?.title || 'Darslik'} | Webiston`,
        description: `Keng qamrovli darsligimizda ${title} haqida batafsil o'rganing.`,
        url: `https://webiston.uz/books/${path}`,
        images: [
          {
            url: `/api/og?title=${encodeURIComponent(title)}&path=books/${path}`,
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
    return <TutorialContent slug={slug} />
  } catch (error) {
    console.error('Error in tutorial page:', error)
    return <ErrorContent />
  }
}
