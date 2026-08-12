const fs = require("node:fs")
const path = require("node:path")
const matter = require("gray-matter")

/**
 * One search document per tool.
 *
 * This function replaces a comment. The index shipped with `// Add all other
 * tools...` where the tools were meant to go, so of 1,078 documents exactly ONE
 * concerned the tools — the `/tools` directory page — and none of the 21 tools
 * themselves. Measured against the live index: ⌘K on "parol", "uuid", "jwt" or
 * "kod rasm" returned **nothing**, and "lotin" returned four book chapters.
 * The fastest path a returning visitor has to a tool did not reach any tool.
 *
 * (There IS a hand-written list of a few tools inside
 * `src/lib/search/flexsearch.ts`, but it is the FALLBACK for a failed fetch of
 * this file, so it never runs in practice. Left alone — it is not this
 * script's to delete — but it is now duplicated data and will drift.)
 *
 * Everything here is derived, never re-typed:
 *
 * - **which tools exist** — `tools-list.json`, generated from the route folders
 *   by `update-tools-list.js` in the same `postbuild` step, so a parked or
 *   deleted route cannot leave a dead search hit behind;
 * - **what they are called** — the `Tools` namespace the cards already use.
 *
 * The `keywords` string in that namespace is already trilingual ("Base64
 * decoder, кодировщик Base64, …"), so folding it into `tags` makes a Russian or
 * English query find the tool for free, without translating the index itself.
 */
function buildToolDocuments() {
  const listPath = path.join(process.cwd(), "tools-list.json")
  const messagesPath = path.join(
    process.cwd(),
    "messages",
    "tools",
    "tools-page"
  )

  if (!fs.existsSync(listPath)) {
    console.warn("⚠️  tools-list.json missing — no tools indexed")
    return []
  }

  const slugs = JSON.parse(fs.readFileSync(listPath, "utf8"))
  const locales = ["uz", "en", "ru"]
  const byLocale = {}
  for (const locale of locales) {
    const file = path.join(messagesPath, `${locale}.json`)
    byLocale[locale] = fs.existsSync(file)
      ? (JSON.parse(fs.readFileSync(file, "utf8")).Tools ?? {})
      : {}
  }

  // `latin-cyrillic` -> `latinCyrillic`, the key the cards are already stored
  // under. Derived rather than mapped by hand so a new tool needs no edit here.
  const toKey = (slug) =>
    slug.replace(/-([a-z0-9])/g, (_, char) => char.toUpperCase())

  /**
   * The tool's own SEO keywords, read back out of its prerendered page.
   *
   * Only two of the twenty-two `Tools` entries carry a `keywords` string, but
   * every tool module already maintains a rich trilingual list in its
   * `seo/keywords.ts` — that is what `<meta name="keywords">` is built from.
   * This script runs in `postbuild`, after `next build`, so those pages are on
   * disk: reading them back means the search index and the SEO metadata cannot
   * disagree, and neither list has to be typed twice.
   *
   * Absent (a standalone run with no build) it simply returns nothing and the
   * tool stays findable by its title and description.
   */
  const keywordsFromBuild = (slug) => {
    const page = path.join(
      process.cwd(),
      ".next",
      "server",
      "app",
      "uz",
      "tools",
      `${slug}.html`
    )
    if (!fs.existsSync(page)) return []
    const html = fs.readFileSync(page, "utf8")
    const meta = html.match(/<meta name="keywords" content="([^"]*)"/)
    if (!meta) return []
    return meta[1]
      .replace(/&#x27;|&apos;/g, "'")
      .replace(/&amp;/g, "&")
      .split(",")
      .map((term) => term.trim().toLowerCase())
      .filter(Boolean)
  }

  const documents = []
  for (const slug of slugs) {
    const key = toKey(slug)
    const uz = byLocale.uz[key]
    if (!uz) {
      // Loud, not silent: a routed tool with no card copy is a tool nobody can
      // search for, which is the exact defect this function exists to end.
      console.warn(`⚠️  no "Tools.${key}" copy for /tools/${slug} — not indexed`)
      continue
    }

    const tags = new Set([slug, "tools", ...keywordsFromBuild(slug)])
    for (const locale of locales) {
      const entry = byLocale[locale][key]
      if (!entry) continue
      for (const term of String(entry.keywords ?? "").split(",")) {
        const trimmed = term.trim().toLowerCase()
        if (trimmed) tags.add(trimmed)
      }
      // The English and Russian NAMES matter as much as the keywords: someone
      // typing "Color Converter" on the Uzbek site should still land on it.
      if (locale !== "uz" && entry.title) tags.add(entry.title.toLowerCase())
    }

    documents.push({
      id: `tool-${slug}`,
      title: uz.title,
      content: uz.description ?? "",
      url: `/tools/${slug}`,
      category: "tools",
      tags: [...tags]
    })
  }

  console.log(`   ${documents.length} of ${slugs.length} tools indexed`)
  return documents
}

// Build search index at build time
async function buildSearchIndex() {
  console.log("🔍 Building search index...")

  const documents = []

  documents.push({
    id: "tools",
    title: "Onlayn Vositalar",
    content:
      "JSON formatter, URL encoder, Base64 converter, QR generator, Password generator va boshqa foydali onlayn vositalar to'plami",
    url: "/tools",
    category: "tools",
    tags: ["tools", "utilities", "json", "url", "base64", "qr", "password"]
  })

  documents.push(...buildToolDocuments())

  // Process MDX files
  const booksDir = path.join(process.cwd(), "content")
  if (fs.existsSync(booksDir)) {
    const bookFolders = fs
      .readdirSync(booksDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)

    for (const bookFolder of bookFolders) {
      const bookPath = path.join(booksDir, bookFolder)
      await processBookDirectory(bookPath, bookFolder, documents, "")
    }
  }

  // Write index to public directory
  const indexPath = path.join(process.cwd(), "public", "search-index.json")
  fs.writeFileSync(indexPath, JSON.stringify(documents, null, 2))

  console.log(`✅ Search index built with ${documents.length} documents`)
}

async function processBookDirectory(dirPath, bookName, documents, currentPath) {
  const files = fs.readdirSync(dirPath, { withFileTypes: true })

  for (const file of files) {
    const filePath = path.join(dirPath, file.name)
    const newPath = currentPath ? `${currentPath}/${file.name}` : file.name

    if (file.isDirectory()) {
      await processBookDirectory(filePath, bookName, documents, newPath)
    } else if (file.name.endsWith(".mdx") && file.name !== "_meta.json") {
      try {
        const content = fs.readFileSync(filePath, "utf-8")
        const { data: frontmatter, content: markdownContent } = matter(content)

        let urlPath =
          `/books/${bookName}/${currentPath ? `${currentPath}/` : ""}${file.name.replace(".mdx", "")}`
            .replace(/\/+/g, "/")
            .replace(/\/$/, "")

        // Remove /page suffix if exists
        if (urlPath.endsWith("/page")) {
          urlPath = urlPath.replace("/page", "")
        }

        const pageTitle =
          frontmatter.title || formatTitle(file.name.replace(".mdx", ""))

        // Parse content into sections based on headers
        const sections = parseContentSections(
          markdownContent,
          pageTitle,
          urlPath
        )

        // Add main page document
        const mainContent = markdownContent
          .replace(/```[\s\S]*?```/g, " ")
          .replace(/`[^`]*`/g, " ")
          .replace(/#{1,6}\s+/g, "")
          .replace(/\*\*([^*]*)\*\*/g, "$1")
          .replace(/\*([^*]*)\*/g, "$1")
          .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
          .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
          .replace(/>\s*/g, "")
          .replace(/\n+/g, " ")
          .replace(/\s+/g, " ")
          .trim()

        const keywords = extractKeywords(mainContent, pageTitle)

        // Main page document
        documents.push({
          id: `book-${bookName}-${newPath.replace(/[/\\]/g, "-").replace(".mdx", "")}`,
          title: pageTitle,
          content:
            mainContent.substring(0, 300) +
            (mainContent.length > 300 ? "..." : ""),
          url: urlPath,
          category: "books",
          tags: [
            bookName,
            "tutorial",
            "guide",
            "react",
            "javascript",
            "frontend",
            ...keywords,
            ...(frontmatter.tags || [])
          ],
          hierarchy: {
            lvl0: pageTitle,
            lvl1: null
          }
        })

        // Add section documents
        sections.forEach((section, index) => {
          documents.push({
            id: `book-${bookName}-${newPath.replace(/[/\\]/g, "-").replace(".mdx", "")}-section-${index}`,
            title: section.title,
            content:
              section.content.substring(0, 200) +
              (section.content.length > 200 ? "..." : ""),
            url: `${urlPath}#${section.anchor}`,
            category: "books",
            tags: [
              bookName,
              "tutorial",
              "guide",
              "react",
              "javascript",
              "frontend",
              ...extractKeywords(section.content, section.title),
              ...(frontmatter.tags || [])
            ],
            hierarchy: {
              lvl0: pageTitle,
              lvl1: section.title
            }
          })
        })
      } catch (error) {
        console.error(`Error processing file ${filePath}:`, error)
      }
    }
  }
}

// Parse content into sections based on headers
function parseContentSections(markdownContent, _pageTitle, _urlPath) {
  const sections = []
  const lines = markdownContent.split("\n")
  let currentSection = null
  let currentContent = []

  for (const line of lines) {
    // Check for headers (## or ###)
    const headerMatch = line.match(/^(#{2,3})\s+(.+)$/)

    if (headerMatch) {
      // Save previous section if exists
      if (currentSection) {
        const cleanContent = currentContent
          .join("\n")
          .replace(/```[\s\S]*?```/g, " ")
          .replace(/`[^`]*`/g, " ")
          .replace(/#{1,6}\s+/g, "")
          .replace(/\*\*([^*]*)\*\*/g, "$1")
          .replace(/\*([^*]*)\*/g, "$1")
          .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
          .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
          .replace(/>\s*/g, "")
          .replace(/\n+/g, " ")
          .replace(/\s+/g, " ")
          .trim()

        if (cleanContent.length > 50) {
          // Only add sections with meaningful content
          sections.push({
            title: currentSection,
            content: cleanContent,
            anchor: createAnchor(currentSection)
          })
        }
      }

      // Start new section
      currentSection = headerMatch[2].trim()
      currentContent = []
    } else if (currentSection) {
      // Add content to current section
      currentContent.push(line)
    }
  }

  // Add last section
  if (currentSection && currentContent.length > 0) {
    const cleanContent = currentContent
      .join("\n")
      .replace(/```[\s\S]*?```/g, " ")
      .replace(/`[^`]*`/g, " ")
      .replace(/#{1,6}\s+/g, "")
      .replace(/\*\*([^*]*)\*\*/g, "$1")
      .replace(/\*([^*]*)\*/g, "$1")
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
      .replace(/>\s*/g, "")
      .replace(/\n+/g, " ")
      .replace(/\s+/g, " ")
      .trim()

    if (cleanContent.length > 50) {
      sections.push({
        title: currentSection,
        content: cleanContent,
        anchor: createAnchor(currentSection)
      })
    }
  }

  return sections
}

// Create URL-friendly anchor from title
function createAnchor(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim()
}

function formatTitle(filename) {
  return filename.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
}

function extractKeywords(content, title) {
  const commonWords = new Set([
    "the",
    "a",
    "an",
    "and",
    "or",
    "but",
    "in",
    "on",
    "at",
    "to",
    "for",
    "of",
    "with",
    "by",
    "is",
    "are",
    "was",
    "were",
    "be",
    "been",
    "have",
    "has",
    "had",
    "do",
    "does",
    "did",
    "will",
    "would",
    "could",
    "should",
    "may",
    "might",
    "can",
    "this",
    "that",
    "these",
    "those"
  ])

  const words = `${content} ${title}`
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !commonWords.has(word))

  const wordCount = {}
  words.forEach((word) => {
    wordCount[word] = (wordCount[word] || 0) + 1
  })

  return Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15)
    .map(([word]) => word)
}

buildSearchIndex().catch(console.error)
