import { serialize } from 'next-mdx-remote/serialize'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeRaw from 'rehype-raw'
import rehypeSlug from 'rehype-slug'
import remarkGfm from 'remark-gfm'
import path from 'path'

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
          [rehypeAutolinkHeadings, { behavior: 'wrap' }],
        ],
        // Do not use MDX-specific features for regular markdown
        format: 'md',
        development: process.env.NODE_ENV === 'development',
      },
      parseFrontmatter: true, // Frontmatter'ni parse qilish
    })
  } catch (mdError) {
    console.error('Error parsing markdown:', mdError)
    // Fallback to simpler parsing if needed
    return await serialize(content, {
      parseFrontmatter: true, // Frontmatter'ni parse qilish
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
        rehypePlugins: [rehypeSlug, [rehypeAutolinkHeadings, { behavior: 'wrap' }]],
        development: process.env.NODE_ENV === 'development',
      },
      parseFrontmatter: true, // Frontmatter'ni parse qilish
    })
  } catch (mdxError) {
    console.error('Error parsing MDX, falling back to markdown parser:', mdxError)
    // If MDX parsing fails, try with markdown parser
    return await serialize(content, {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
        rehypePlugins: [
          rehypeRaw, // Allow HTML in markdown
          rehypeSlug,
          [rehypeAutolinkHeadings, { behavior: 'wrap' }],
        ],
        format: 'md',
      },
      parseFrontmatter: true, // Frontmatter'ni parse qilish
    })
  }
}

/**
 * Serializes content based on type (markdown or MDX)
 */
export async function serializeContent(content: string, isMarkdown: boolean) {
  if (isMarkdown) {
    console.log('Using plain markdown parser for .md file')
    return serializeMarkdown(content)
  } else {
    console.log('Using MDX parser')
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
export async function getTutorialNavigation(tutorialId: string): Promise<TutorialNavigation[]> {
  try {
    const { promises: fs } = await import('fs')
    const metaPath = path.resolve(process.cwd(), 'content', tutorialId, '_meta.json')

    // Fayl mavjudligini tekshirish
    await fs.access(metaPath)

    // JSON faylni o'qish
    const fileContent = await fs.readFile(metaPath, 'utf8')
    const metaData = JSON.parse(fileContent)

    return convertMetaToNavigation(metaData)
  } catch (error) {
    console.error('Error loading tutorial navigation:', error)
    console.error('Tried path:', path.resolve(process.cwd(), 'content', tutorialId, '_meta.json'))
    return []
  }
}

// Meta ma'lumotlarini navigatsiya strukturasiga o'tkazish
function convertMetaToNavigation(metaData: Record<string, any>): TutorialNavigation[] {
  const navigation: TutorialNavigation[] = []

  for (const [key, value] of Object.entries(metaData)) {
    if (typeof value === 'object' && value.title) {
      // Path'dan '/page' qismini olib tashlash
      const cleanPath = value.path ? value.path.replace(/\/page$/, '') : key

      const item: TutorialNavigation = {
        title: value.title,
        path: cleanPath,
        hasIndex: value.hasIndex || false,
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
export async function getMDXContent(tutorialId: string, contentPath: string): Promise<string | null> {
  try {
    const { promises: fs } = await import('fs')
    let filePath: string | null = null

    // Path bo'sh bo'lsa yoki "/" bo'lsa, asosiy page.mdx faylni olish
    if (!contentPath || contentPath === '' || contentPath === '/') {
      filePath = path.join(process.cwd(), 'content', tutorialId, 'page.mdx')
    } else {
      // Content path'ni tozalash
      const cleanPath = contentPath.replace(/^\//, '').replace(/\/$/, '')

      // Turli variantlarni sinab ko'rish
      const possiblePaths = [
        path.join(process.cwd(), 'content', tutorialId, cleanPath, 'page.mdx'),
        path.join(process.cwd(), 'content', tutorialId, cleanPath + '.mdx'),
        path.join(process.cwd(), 'content', tutorialId, cleanPath, 'index.mdx'),
      ]

      for (const possiblePath of possiblePaths) {
        try {
          await fs.access(possiblePath)
          filePath = possiblePath
          break
        } catch {
          // Continue to next path
        }
      }

      if (!filePath) {
        console.error(`MDX file not found for path: ${contentPath}`)
        console.error('Tried paths:', possiblePaths)
        return null
      }
    }

    const content = await fs.readFile(filePath, 'utf8')
    return content
  } catch (error) {
    console.error('Error reading MDX file:', error)
    return null
  }
}

// Tutorial ma'lumotlarini olish
export async function getTutorialInfo(tutorialId: string) {
  try {
    const navigation = await getTutorialNavigation(tutorialId)

    // Tutorial asosiy ma'lumotlari
    const tutorialInfo = {
      id: tutorialId,
      title: getTutorialTitle(tutorialId),
      description: getTutorialDescription(tutorialId),
      image: getTutorialImage(tutorialId),
      navigation,
    }

    return tutorialInfo
  } catch (error) {
    console.error('Error getting tutorial info:', error)
    return null
  }
}

// Tutorial sarlavhasini olish
export function getTutorialTitle(tutorialId: string): string {
  const titles: Record<string, string> = {
    'fluent-react': 'Fluent React',
    'javascript-definitive-guide': 'JavaScript Definitive Guide',
  }

  return titles[tutorialId] || tutorialId
}

// Tutorial tavsifini olish
function getTutorialDescription(tutorialId: string): string {
  const descriptions: Record<string, string> = {
    'fluent-react': "React'ni chuqur o'rganish uchun to'liq qo'llanma",
    'javascript-definitive-guide': "JavaScript'ni chuqur o'rganish uchun to'liq qo'llanma",
  }

  return descriptions[tutorialId] || "Dasturlash bo'yicha qo'llanma"
}

// Tutorial rasmini olish
export function getTutorialImage(tutorialId: string): string {
  const images: Record<string, string> = {
    'fluent-react': 'https://www.oreilly.com/covers/urn:orm:book:9781098138707/900w/',
    'javascript-definitive-guide': 'https://www.oreilly.com/covers/urn:orm:book:9781491952016/900w/',
  }

  return images[tutorialId] || '/assets/default-cover.png'
}

// Barcha tutoriallar ro'yxatini olish
export async function getAllTutorials() {
  try {
    // Static qilib qo'yamiz, chunki bizda faqat bitta tutorial bor
    const fluentReact = await getTutorialInfo('fluent-react')
    const javascriptDefinitiveGuide = await getTutorialInfo('javascript-definitive-guide')
    return [fluentReact, javascriptDefinitiveGuide]
  } catch (error) {
    console.error('Error getting all tutorials:', error)
    return []
  }
}

// Barcha darslik sahifalarining yo'llarini (paths) olish
export async function getAllTutorialPaths() {
  const { promises: fs } = await import('fs')
  const contentDir = path.join(process.cwd(), 'content')
  const tutorials = await fs.readdir(contentDir, { withFileTypes: true })
  const allPaths: { slug: string[] }[] = []

  for (const tutorial of tutorials) {
    if (tutorial.isDirectory()) {
      const tutorialId = tutorial.name
      // Har bir darslik uchun asosiy sahifa
      allPaths.push({ slug: [tutorialId] })

      const tutorialDir = path.join(contentDir, tutorialId)
      const filesAndDirs = await fs.readdir(tutorialDir, { withFileTypes: true })

      const processDirectory = async (currentDir: string, basePath: string[]) => {
        const items = await fs.readdir(currentDir, { withFileTypes: true })
        for (const item of items) {
          const itemPath = path.join(currentDir, item.name)
          if (item.isDirectory()) {
            await processDirectory(itemPath, [...basePath, item.name])
          } else if (item.name.endsWith('.mdx') || item.name.endsWith('.md')) {
            let slugPath = [...basePath]
            if (item.name !== 'page.mdx' && item.name !== 'index.mdx') {
              slugPath.push(item.name.replace(/\.mdx?$/, ''))
            }
            // Duplikatlarni tekshirish
            if (!allPaths.some((p) => p.slug.join('/') === slugPath.join('/'))) {
              allPaths.push({ slug: slugPath })
            }
          }
        }
      }
      await processDirectory(tutorialDir, [tutorialId])
    }
  }

  // Asosiy darslik sahifalarini qo'shish (duplikatlarsiz)
  const uniquePaths = Array.from(new Set(allPaths.map((p) => JSON.stringify(p)))).map((s) => JSON.parse(s))

  return uniquePaths
}
