const fs = require("fs")
const path = require("path")
const matter = require("gray-matter")

// Build search index at build time
async function buildSearchIndex() {
  console.log("🔍 Building search index...")

  const documents = []

  // Add tools
  const toolsPages = [
    {
      id: "tools",
      title: "Onlayn Vositalar",
      content:
        "JSON formatter, URL encoder, Base64 converter, QR generator, Password generator va boshqa foydali onlayn vositalar to'plami",
      url: "/tools",
      category: "tools",
      tags: ["tools", "utilities", "json", "url", "base64", "qr", "password"]
    }
    // Add all other tools...
  ]

  documents.push(...toolsPages)

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
          `/books/${bookName}/${currentPath ? currentPath + "/" : ""}${file.name.replace(".mdx", "")}`
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
          id: `book-${bookName}-${newPath.replace(/[\/\\]/g, "-").replace(".mdx", "")}`,
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
            id: `book-${bookName}-${newPath.replace(/[\/\\]/g, "-").replace(".mdx", "")}-section-${index}`,
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
function parseContentSections(markdownContent, pageTitle, urlPath) {
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

  const words = (content + " " + title)
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
