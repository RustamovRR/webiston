import type { Metadata } from "next"
import { notFound, unstable_rethrow } from "next/navigation"
import {
  ErrorContent,
  TutorialContent,
  TutorialLanding
} from "@/components/mdx"
import {
  getAllTutorialPaths,
  getMDXContent,
  getTutorialInfo,
  serializeContent
} from "@/lib/mdx"
import { SITE_URL } from "@/lib/seo"

interface BookPageProps {
  params: Promise<{ slug: string[] }>
}

/** MDX frontmatter comes from hand-authored `.mdx` files, so every field is
 *  unknown until it has been checked. Typing it `any` hid four real holes here:
 *  a numeric or missing `title` would have been interpolated as-is. */
function asString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined
}

/** Share card for a chapter. Rendered by `src/app/api/og/route.tsx`. */
function ogImage(title: string, path: string) {
  return [
    {
      url: `/api/og?title=${encodeURIComponent(title)}&path=${encodeURIComponent(path)}`,
      width: 1200,
      height: 630
    }
  ]
}

export async function generateStaticParams() {
  const paths = await getAllTutorialPaths()
  return paths
}

// Dinamik metadata yaratish.
//
// Every branch sets its own `alternates.canonical`. Without it these pages
// inherit the site-wide `canonical: "https://webiston.uz"` from the root layout,
// which told Google that all 229 chapters were duplicates of the homepage.
// Titles carry no "| Webiston" suffix — the root layout's `%s | Webiston`
// template appends it.
export async function generateMetadata({
  params
}: BookPageProps): Promise<Metadata> {
  const { slug } = await params

  if (!slug || slug.length === 0) {
    return {
      title: "Not Found",
      description: "The page you are looking for does not exist.",
      robots: { index: false, follow: false }
    }
  }

  try {
    // Get tutorial ID
    const tutorialId = slug[0]

    // Get tutorial info
    const tutorialInfo = await getTutorialInfo(tutorialId)

    // Agar bu tutorial landing page bo'lsa
    if (slug.length === 1) {
      const title = tutorialInfo?.title || "Darslik"
      const description =
        tutorialInfo?.description ||
        "Keng qamrovli darsliklarimiz orqali dasturlashni o'rganing."
      const path = `/books/${tutorialId}`

      return {
        title,
        description,
        alternates: { canonical: `${SITE_URL}${path}` },
        openGraph: {
          title,
          description,
          url: `${SITE_URL}${path}`,
          images: ogImage(title, path)
        }
      }
    }

    // Agar bu tutorial content page bo'lsa - frontmatter'dan metadata olish
    const currentPath = slug.slice(1).join("/")
    const contentText = await getMDXContent(tutorialId, currentPath)

    if (contentText) {
      // Frontmatter'ni parse qilish uchun MDX serialize qilamiz
      const serializedContent = await serializeContent(contentText, false)

      // Frontmatter'dan metadata olish
      const frontmatter: Record<string, unknown> =
        serializedContent.frontmatter || {}
      const title =
        asString(frontmatter.title) ??
        slug[slug.length - 1]
          .split("-")
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")

      const description =
        asString(frontmatter.description) ??
        `Keng qamrovli darsligimizda ${title} haqida batafsil o'rganing.`
      const keywords = asString(frontmatter.keywords)
      const author = asString(frontmatter.author)

      const pageTitle = `${title} | ${tutorialInfo?.title || "Darslik"}`
      const path = `/books/${slug.join("/")}`

      return {
        title: pageTitle,
        description,
        keywords: keywords?.split(",").map((k) => k.trim()),
        authors: author ? [{ name: author }] : undefined,
        alternates: { canonical: `${SITE_URL}${path}` },
        openGraph: {
          title: pageTitle,
          description,
          url: `${SITE_URL}${path}`,
          images: ogImage(title, path)
        },
        twitter: {
          card: "summary_large_image",
          title: pageTitle,
          description
        }
      }
    }

    // Fallback agar content topilmasa
    const fallbackTitle = slug[slug.length - 1]
      .split("-")
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")

    const pageTitle = `${fallbackTitle} | ${tutorialInfo?.title || "Darslik"}`
    const description = `Keng qamrovli darsligimizda ${fallbackTitle} haqida batafsil o'rganing.`
    const path = `/books/${slug.join("/")}`

    return {
      title: pageTitle,
      description,
      alternates: { canonical: `${SITE_URL}${path}` },
      openGraph: {
        title: pageTitle,
        description,
        url: `${SITE_URL}${path}`,
        images: ogImage(fallbackTitle, path)
      }
    }
  } catch (error) {
    console.error("Error generating metadata:", error)
    return {
      title: "Error",
      description: "An error occurred while loading this page.",
      robots: { index: false, follow: false }
    }
  }
}

export default async function TutorialPage({ params }: BookPageProps) {
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
      <div className="mx-auto pt-4 pb-2">
        <TutorialContent slug={slug} />
      </div>
    )
  } catch (error) {
    // `notFound()` signals by throwing, so this catch was swallowing it and
    // returning `<ErrorContent />` with HTTP 200 — an unknown book id rendered
    // an empty landing page instead of a 404.
    unstable_rethrow(error)

    console.error("Error in tutorial page:", error)
    return <ErrorContent />
  }
}
