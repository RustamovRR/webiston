import path from "node:path"
import { serialize } from "next-mdx-remote/serialize"
import rehypeAutolinkHeadings from "rehype-autolink-headings"
import rehypeRaw from "rehype-raw"
import rehypeSlug from "rehype-slug"
import remarkGfm from "remark-gfm"

/**
 * Serializes markdown content to MDX
 */
export async function serializeMarkdown(content: string) {
  try {
    // Use more permissive config for regular markdown with rehype-raw
    return await serialize(content, {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeRaw, // Allow HTML in markdown
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: "wrap" }]
        ],
        // Do not use MDX-specific features for regular markdown
        format: "md",
        development: process.env.NODE_ENV === "development"
      },
      parseFrontmatter: true // Frontmatter'ni parse qilish
    })
  } catch (mdError) {
    console.error("Error parsing markdown:", mdError)
    // Fallback to simpler parsing if needed
    return await serialize(content, {
      parseFrontmatter: true // Frontmatter'ni parse qilish
    })
  }
}

/**
 * Serializes MDX content
 */
export async function serializeMdx(content: string) {
  try {
    // Use full MDX compilation
    return await serialize(content, {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: "wrap" }]
        ],
        development: process.env.NODE_ENV === "development"
      },
      parseFrontmatter: true // Frontmatter'ni parse qilish
    })
  } catch (mdxError) {
    console.error(
      "Error parsing MDX, falling back to markdown parser:",
      mdxError
    )
    // If MDX parsing fails, try with markdown parser
    return await serialize(content, {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeRaw, // Allow HTML in markdown
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: "wrap" }]
        ],
        format: "md"
      },
      parseFrontmatter: true // Frontmatter'ni parse qilish
    })
  }
}

/**
 * Serializes content based on type (markdown or MDX)
 */
export async function serializeContent(content: string, isMarkdown: boolean) {
  if (isMarkdown) {
    console.log("Using plain markdown parser for .md file")
    return serializeMarkdown(content)
  } else {
    console.log("Using MDX parser")
    return serializeMdx(content)
  }
}

export interface NavigationItem {
  title: string
  path: string
  hasIndex?: boolean
  children?: Record<string, NavigationItem>
}

export interface TutorialNavigation {
  title: string
  path: string
  hasIndex: boolean
  list?: TutorialNavigation[]
}

// Meta fayldan navigatsiya ma'lumotlarini olish
export async function getTutorialNavigation(
  tutorialId: string
): Promise<TutorialNavigation[]> {
  try {
    const { promises: fs } = await import("node:fs")
    const metaPath = path.resolve(
      process.cwd(),
      "content",
      tutorialId,
      "_meta.json"
    )

    // Fayl mavjudligini tekshirish
    await fs.access(metaPath)

    // JSON faylni o'qish
    const fileContent = await fs.readFile(metaPath, "utf8")
    const metaData = JSON.parse(fileContent)

    return convertMetaToNavigation(metaData)
  } catch (error) {
    console.error("Error loading tutorial navigation:", error)
    console.error(
      "Tried path:",
      path.resolve(process.cwd(), "content", tutorialId, "_meta.json")
    )
    return []
  }
}

// Meta ma'lumotlarini navigatsiya strukturasiga o'tkazish
function convertMetaToNavigation(
  metaData: Record<string, any>
): TutorialNavigation[] {
  const navigation: TutorialNavigation[] = []

  for (const [key, value] of Object.entries(metaData)) {
    if (typeof value === "object" && value.title) {
      // Path'dan '/page' qismini olib tashlash
      const cleanPath = value.path ? value.path.replace(/\/page$/, "") : key

      const item: TutorialNavigation = {
        title: value.title,
        path: cleanPath,
        hasIndex: value.hasIndex || false
      }

      // Agar children bo'lsa, recursively convert qilish
      if (value.children) {
        item.list = convertMetaToNavigation(value.children)
      }

      navigation.push(item)
    }
  }

  return navigation
}

// MDX fayl content'ini olish
export async function getMDXContent(
  tutorialId: string,
  contentPath: string
): Promise<string | null> {
  try {
    const { promises: fs } = await import("node:fs")

    // The candidates are tracked RELATIVE to `content/`, and the join back to
    // an absolute path happens at the single read below.
    //
    // Turbopack traces filesystem access statically. When the value handed to
    // `readFile` is a `let` reassigned inside a loop it cannot tell which
    // subtree is being read, so it falls back to tracing the WHOLE project
    // into the server bundle — every source file plus `public/` and `docs/`.
    // `path.join(process.cwd(), "content", relative)` is the shape its
    // analyser recognises as scoped ("Dynamic filesystem access causes tracing
    // of the whole project" build warning).
    const contentRoot = path.join(process.cwd(), "content")

    let relativePath: string | null = null

    // Path bo'sh bo'lsa yoki "/" bo'lsa, asosiy page.mdx faylni olish
    if (!contentPath || contentPath === "" || contentPath === "/") {
      relativePath = path.join(tutorialId, "page.mdx")
    } else {
      // Content path'ni tozalash
      const cleanPath = contentPath.replace(/^\//, "").replace(/\/$/, "")

      // Turli variantlarni sinab ko'rish
      const possiblePaths = [
        path.join(tutorialId, cleanPath, "page.mdx"),
        path.join(tutorialId, `${cleanPath}.mdx`),
        path.join(tutorialId, cleanPath, "index.mdx")
      ]

      for (const possiblePath of possiblePaths) {
        try {
          await fs.access(path.join(contentRoot, possiblePath))
          relativePath = possiblePath
          break
        } catch {
          // Continue to next path
        }
      }

      if (!relativePath) {
        console.error(`MDX file not found for path: ${contentPath}`)
        console.error("Tried paths:", possiblePaths)
        return null
      }
    }

    const content = await fs.readFile(
      path.join(process.cwd(), "content", relativePath),
      "utf8"
    )
    return content
  } catch (error) {
    console.error("Error reading MDX file:", error)
    return null
  }
}

/** A book id is a directory name under `content/`. Anything else is a URL
 *  someone typed — reject it before it reaches the filesystem. */
const BOOK_ID = /^[a-z0-9][a-z0-9-]*$/

// Tutorial ma'lumotlarini olish
export async function getTutorialInfo(tutorialId: string) {
  try {
    // This used to build an info object for ANY id: `getTutorialTitle` falls
    // back to the raw string, so /books/anything rendered an empty landing page
    // with HTTP 200 — a soft 404 over an unbounded URL space. A book exists iff
    // its `_meta.json` does.
    if (!BOOK_ID.test(tutorialId)) return null

    const { promises: fs } = await import("node:fs")
    try {
      await fs.access(
        path.resolve(process.cwd(), "content", tutorialId, "_meta.json")
      )
    } catch {
      return null
    }

    const navigation = await getTutorialNavigation(tutorialId)

    // Tutorial asosiy ma'lumotlari
    const tutorialInfo = {
      id: tutorialId,
      title: getTutorialTitle(tutorialId),
      description: getTutorialDescription(tutorialId),
      image: getTutorialImage(tutorialId),
      copyright: getCopyrightText(tutorialId),
      navigation
    }

    return tutorialInfo
  } catch (error) {
    console.error("Error getting tutorial info:", error)
    return null
  }
}

// Tutorial sarlavhasini olish
export function getTutorialTitle(tutorialId: string): string {
  const titles: Record<string, string> = {
    "ai-engineering":
      "AI Engineering: Fundamental Modellar bilan Ilovalar Yaratish",
    "javascript-definitive-guide":
      "JavaScript: The Definitive Guide, 7th Edition",
    "fluent-react": "Fluent React: Zamonaviy React Dasturlash"
  }

  return titles[tutorialId] || tutorialId
}

// Tutorial tavsifini olish
function getTutorialDescription(tutorialId: string): string {
  const descriptions: Record<string, string> = {
    "ai-engineering":
      "Sun'iy intellekt muhandisligi bo'yicha keng qamrovli qo'llanma. Fundamental modellar, prompt muhandisligi, baholash metodologiyasi va zamonaviy AI texnologiyalarini professional darajada o'zlashtirish uchun to'liq resurs.",
    "javascript-definitive-guide":
      "JavaScript bo'yicha klassik asarning to'liq o'zbekcha tarjimasi. Tilning poydevoridan boshlab, eng ilg'or xususiyatlarigacha — barchasi bitta qo'llanmada.",
    "fluent-react":
      "React'ning fundamental konsepsiyalariga chuqur sho'ng'ish. Komponentlar mantig'idan tortib, ilg'or arxitektura pattern'larigacha — React'ni professional darajada o'zlashtirish uchun to'liq qo'llanma."
  }

  return (
    descriptions[tutorialId] || "Dasturlash bo'yicha professional qo'llanma"
  )
}

// Tutorial rasmini olish
export function getTutorialImage(tutorialId: string): string {
  const images: Record<string, string> = {
    "ai-engineering": "/ai-engineering/book-logo.jpeg",
    "javascript-definitive-guide":
      "/javascript-definitive-guide/book-logo.jpeg",
    "fluent-react": "/fluent-react/book-logo.jpeg"
  }

  return images[tutorialId] || "/assets/default-cover.png"
}

// Tutorial mualliflik huquqi matnini olish
function getCopyrightText(tutorialId: string): string {
  const copyrights: Record<string, string> = {
    "ai-engineering":
      "Ushbu kitobning o'zbekcha tarjimasi: AI Engineering, Chip Huyen. Mualliflik huquqi 2024 Chip Huyen. O'Reilly Media, Inc. tomonidan nashr etilgan. Ruxsat bilan foydalanilgan.",
    "javascript-definitive-guide":
      "Ushbu kitobning o'zbekcha tarjimasi: JavaScript: The Definitive Guide, 7-nashr, David Flanagan. Mualliflik huquqi 2020 David Flanagan. O'Reilly Media, Inc. tomonidan nashr etilgan. Ruxsat bilan foydalanilgan.",
    "fluent-react":
      "Ushbu kitobning o'zbekcha tarjimasi: Fluent React, Tejas Kumar. Mualliflik huquqi 2024 Tejas Kumar. O'Reilly Media, Inc. tomonidan nashr etilgan. Ruxsat bilan foydalanilgan."
  }
  return copyrights[tutorialId] || ""
}

// Barcha tutoriallar ro'yxatini olish
export async function getAllTutorials() {
  try {
    // Eng yangi kitobni birinchi o'ringa qo'yamiz
    const aiEngineering = await getTutorialInfo("ai-engineering")
    const javascriptDefinitiveGuide = await getTutorialInfo(
      "javascript-definitive-guide"
    )
    const fluentReact = await getTutorialInfo("fluent-react")
    return [aiEngineering, javascriptDefinitiveGuide, fluentReact]
  } catch (error) {
    console.error("Error getting all tutorials:", error)
    return []
  }
}

// Barcha darslik sahifalarining yo'llarini (paths) olish
export async function getAllTutorialPaths() {
  const { promises: fs } = await import("node:fs")
  const contentDir = path.join(process.cwd(), "content")
  const tutorials = await fs.readdir(contentDir, { withFileTypes: true })
  const allPaths: { slug: string[] }[] = []

  for (const tutorial of tutorials) {
    if (tutorial.isDirectory()) {
      const tutorialId = tutorial.name
      // Har bir darslik uchun asosiy sahifa
      allPaths.push({ slug: [tutorialId] })

      const tutorialDir = path.join(contentDir, tutorialId)
      const _filesAndDirs = await fs.readdir(tutorialDir, {
        withFileTypes: true
      })

      const processDirectory = async (
        currentDir: string,
        basePath: string[]
      ) => {
        const items = await fs.readdir(currentDir, { withFileTypes: true })
        for (const item of items) {
          const itemPath = path.join(currentDir, item.name)
          if (item.isDirectory()) {
            await processDirectory(itemPath, [...basePath, item.name])
          } else if (item.name.endsWith(".mdx") || item.name.endsWith(".md")) {
            const slugPath = [...basePath]
            if (item.name !== "page.mdx" && item.name !== "index.mdx") {
              slugPath.push(item.name.replace(/\.mdx?$/, ""))
            }
            // Duplikatlarni tekshirish
            if (
              !allPaths.some((p) => p.slug.join("/") === slugPath.join("/"))
            ) {
              allPaths.push({ slug: slugPath })
            }
          }
        }
      }
      await processDirectory(tutorialDir, [tutorialId])
    }
  }

  // Asosiy darslik sahifalarini qo'shish (duplikatlarsiz)
  const uniquePaths = Array.from(
    new Set(allPaths.map((p) => JSON.stringify(p)))
  ).map((s) => JSON.parse(s))

  return uniquePaths
}
