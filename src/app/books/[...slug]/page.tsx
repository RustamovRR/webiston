import { ErrorContent, TutorialContent, TutorialLanding } from '@/components/mdx'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'
export const revalidate = 3600

const navigationCache = new Map()

// Dinamik metadata yaratish
export async function generateMetadata({ params }: any): Promise<any> {
  const { slug } = await params

  if (!slug || slug.length === 0) {
    return {
      title: 'Not Found | Nolbir',
      description: 'The page you are looking for does not exist.',
    }
  }

  try {
    // Get tutorial ID
    const tutorialId = slug[0]

    // Get tutorial info
    // const allTutorials = await getAllTutorials().catch((error) => {
    //   console.error('Error fetching tutorials:', error)
    //   return { data: [] }
    // })

    // const tutorial = allTutorials?.data?.find((t: { id: string }) => t.id === tutorialId)

    // Agar bu tutorial landing page bo'lsa
    // if (slug.length === 1) {
    //   return {
    //     title: `${tutorial?.title || 'Darslik'} | Nolbir`,
    //     description: tutorial?.description || "Keng qamrovli darsliklarimiz orqali dasturlashni o'rganing.",
    //     openGraph: {
    //       title: `${tutorial?.title || 'Darslik'} | Nolbir`,
    //       description: tutorial?.description || "Keng qamrovli darsliklarimiz orqali dasturlashni o'rganing.",
    //       url: `https://documentation-site-ui.vercel.app/tutorials/${tutorialId}`,
    //       images: [
    //         {
    //           url: `/api/og?title=${encodeURIComponent(tutorial?.title || 'Tutorial')}&path=tutorials/${tutorialId}`,
    //           width: 1200,
    //           height: 630,
    //         },
    //       ],
    //     },
    //   }
    // }

    // Agar bu tutorial content page bo'lsa
    // Path-ni yaratish
    const path = slug.join('/')

    // Sarlavhani olish (oxirgi slug)
    const title = slug[slug.length - 1]
      .split('-')
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')

    return {
      title: `${title} | ${'Darslik'} | Nolbir`,
      description: `Keng qamrovli darsligimizda ${title} haqida batafsil o'rganing.`,
      openGraph: {
        title: `${title} | ${'Darslik'} | Nolbir`,
        description: `Keng qamrovli darsligimizda ${title} haqida batafsil o'rganing.`,
        url: `https://documentation-site-ui.vercel.app/tutorials/${path}`,
        images: [
          {
            url: `/api/og?title=${encodeURIComponent(title)}&path=tutorials/${path}`,
            width: 1200,
            height: 630,
          },
        ],
      },
    }
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Error | Nolbir',
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

    // Create cache key for navigation
    const navCacheKey = `nav-${tutorialId}`

    // Get navigation data with caching
    let navigation
    if (navigationCache.has(navCacheKey)) {
      navigation = navigationCache.get(navCacheKey)
    } else {
      // navigation = await getTutorialNavigation(tutorialId).catch((error) => {
      //   console.error('Error fetching navigation:', error)
      //   return { data: [] }
      // })
      // navigationCache.set(navCacheKey, navigation)
    }

    // If this is a tutorial landing page (only has tutorial ID, no content path)
    if (slug.length === 1) {
      // Cache key for tutorials list
      const tutorialsCacheKey = 'all-tutorials'

      // Get tutorial info with caching
      let allTutorials
      if (navigationCache.has(tutorialsCacheKey)) {
        allTutorials = navigationCache.get(tutorialsCacheKey)
      } else {
        // allTutorials = await getAllTutorials().catch((error) => {
        //   console.error('Error fetching tutorials:', error)
        //   return { data: [] }
        // })
        // navigationCache.set(tutorialsCacheKey, allTutorials)
      }

      const tutorial = allTutorials?.data?.find((t: { id: string }) => t.id === tutorialId)

      return (
        <TutorialLanding
          tutorialId={tutorialId}
          tutorialData={tutorial || {}}
          navigationItems={navigation?.data || []}
        />
      )
    }

    // For content pages, use the client-side TutorialContent component
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
