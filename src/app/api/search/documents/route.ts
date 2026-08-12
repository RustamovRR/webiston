import fs from "node:fs"
import path from "node:path"
import matter from "gray-matter"
import { NextResponse } from "next/server"
import type { SearchDocument } from "@/lib/search/flexsearch"

// This handler reads nothing from the request — it walks the whole `content/`
// tree and returns all 1,078 documents. Left dynamic, it redid that walk on
// every call. The corpus only changes at build, so evaluate it once at build
// and serve the result as a static asset.
//
// It is the fallback path: `flexsearch.ts` fetches `/search-index.json` first
// and only calls this when that 404s.
export const dynamic = "force-static"

export async function GET() {
  try {
    const documents: SearchDocument[] = []

    // Tools pages qo'shamiz
    const toolsPages = [
      {
        id: "tools",
        title: "Onlayn Vositalar",
        content:
          "JSON formatter, URL encoder, Base64 converter, QR generator, Password generator va boshqa foydali onlayn vositalar to'plami",
        url: "/tools",
        category: "tools",
        tags: ["tools", "utilities", "json", "url", "base64", "qr", "password"]
      },
      {
        id: "tools-json-formatter",
        title: "JSON Formatter",
        content:
          "JSON ma'lumotlarini formatlash, validatsiya qilish va xatolarni topish uchun asbob. JSON strukturasini chiroyli ko'rinishda ko'rsatadi.",
        url: "/tools/json-formatter",
        category: "tools",
        tags: ["json", "formatter", "validator", "prettify"]
      },
      {
        id: "tools-url-encoder",
        title: "URL Encoder/Decoder",
        content:
          "URL manzillarini encode va decode qilish uchun asbob. URL-safe formatga o'tkazish va qaytarish.",
        url: "/tools/url-encoder",
        category: "tools",
        tags: ["url", "encoder", "decoder", "percent-encoding"]
      },
      {
        id: "tools-base64-converter",
        title: "Base64 Converter",
        content:
          "Matn va fayllarni Base64 formatiga o'tkazish va qaytarish. Encode va decode operatsiyalari.",
        url: "/tools/base64-converter",
        category: "tools",
        tags: ["base64", "converter", "encoder", "decoder"]
      },
      {
        id: "tools-qr-generator",
        title: "QR Code Generator",
        content:
          "Matn, URL va boshqa ma'lumotlar uchun QR kod yaratish. Turli o'lcham va formatlar.",
        url: "/tools/qr-generator",
        category: "tools",
        tags: ["qr", "qrcode", "generator", "barcode"]
      },
      {
        id: "tools-code-snapshot",
        title: "Code to Image",
        content:
          "Koddan chiroyli rasm yasash: 65 ta mavzu, 360 dan ortiq dasturlash tili, PNG eksport. Kod skrinshoti, code screenshot, \u043a\u043e\u0434 \u0432 \u043a\u0430\u0440\u0442\u0438\u043d\u043a\u0443.",
        url: "/tools/code-snapshot",
        category: "tools",
        tags: ["code", "screenshot", "image", "snippet", "png", "kod", "rasm"]
      },
      {
        id: "tools-password-generator",
        title: "Password Generator",
        content:
          "Xavfsiz parollar yaratish uchun asbob. Turli uzunlik va murakkablik darajalari.",
        url: "/tools/password-generator",
        category: "tools",
        tags: ["password", "generator", "security", "random"]
      },
      {
        id: "tools-color-converter",
        title: "Color Converter",
        // CMYK was listed here and the tool has never supported it — it
        // depends on a print profile and cannot be computed in a browser.
        content:
          "Ranglarni HEX, RGB, HSL, Lab va OKLCH formatlari o'rtasida o'tkazish, WCAG kontrastini tekshirish va palette yaratish.",
        url: "/tools/color-converter",
        category: "tools",
        tags: ["color", "converter", "hex", "rgb", "hsl", "oklch", "contrast"]
      },
      {
        id: "tools-hash-generator",
        title: "Hash Generator",
        content:
          "MD5, SHA1, SHA256 va boshqa hash algoritmlar yordamida hash yaratish.",
        url: "/tools/hash-generator",
        category: "tools",
        tags: ["hash", "md5", "sha1", "sha256", "generator"]
      },
      {
        id: "tools-uuid-generator",
        title: "UUID Generator",
        content:
          "Unique identifier yaratish uchun asbob. V1, V4 UUID formatlarini qo'llab-quvvatlaydi.",
        url: "/tools/uuid-generator",
        category: "tools",
        tags: ["uuid", "generator", "unique", "identifier"]
      },
      {
        id: "tools-jwt-decoder",
        title: "JWT Decoder",
        content:
          "JSON Web Token'larni decode qilish va ma'lumotlarini ko'rish uchun asbob.",
        url: "/tools/jwt-decoder",
        category: "tools",
        tags: ["jwt", "decoder", "json", "web", "token"]
      },
      {
        id: "tools-latin-cyrillic",
        title: "Lotin-Kirill Konverter",
        content:
          "O'zbek matnini lotin va kirill yozuvlari o'rtasida o'tkazish uchun asbob.",
        url: "/tools/latin-cyrillic",
        category: "tools",
        tags: ["latin", "cyrillic", "uzbek", "converter", "transliteration"]
      }
    ]

    documents.push(...toolsPages)

    // Books content qo'shamiz - barcha MDX fayllarni indekslash
    try {
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
    } catch (error) {
      console.error("Error processing books:", error)
    }

    console.log(`Indexed ${documents.length} documents`)
    return NextResponse.json(documents)
  } catch (error) {
    console.error("Error generating search documents:", error)
    return NextResponse.json([], { status: 500 })
  }
}

async function processBookDirectory(
  dirPath: string,
  bookName: string,
  documents: SearchDocument[],
  currentPath: string
) {
  try {
    const files = fs.readdirSync(dirPath, { withFileTypes: true })

    for (const file of files) {
      const filePath = path.join(dirPath, file.name)
      const newPath = currentPath ? `${currentPath}/${file.name}` : file.name

      if (file.isDirectory()) {
        // Recursive directory processing
        await processBookDirectory(filePath, bookName, documents, newPath)
      } else if (file.name.endsWith(".mdx") && file.name !== "_meta.json") {
        try {
          const content = fs.readFileSync(filePath, "utf-8")
          const { data: frontmatter, content: markdownContent } =
            matter(content)

          // Create proper URL path
          let urlPath =
            `/books/${bookName}/${currentPath ? `${currentPath}/` : ""}${file.name.replace(".mdx", "")}`
              .replace(/\/+/g, "/") // Remove double slashes
              .replace(/\/$/, "") // Remove trailing slash

          // Remove /page suffix if exists
          if (urlPath.endsWith("/page")) {
            urlPath = urlPath.replace("/page", "")
          }

          // Clean markdown content more thoroughly
          const cleanContent = markdownContent
            .replace(/```[\s\S]*?```/g, " ") // Remove code blocks
            .replace(/`[^`]*`/g, " ") // Remove inline code
            .replace(/#{1,6}\s+/g, "") // Remove headers
            .replace(/\*\*([^*]*)\*\*/g, "$1") // Remove bold
            .replace(/\*([^*]*)\*/g, "$1") // Remove italic
            .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // Remove links
            .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1") // Remove images
            .replace(/>\s*/g, "") // Remove blockquotes
            .replace(/\n+/g, " ") // Replace newlines with spaces
            .replace(/\s+/g, " ") // Normalize spaces
            .trim()

          // Extract meaningful keywords from content
          const keywords = extractKeywords(
            cleanContent,
            frontmatter.title || file.name
          )

          const pageTitle =
            frontmatter.title || formatTitle(file.name.replace(".mdx", ""))

          // Parse content into sections based on headers
          const sections = parseContentSections(
            markdownContent,
            pageTitle,
            urlPath
          )

          // Add main page document
          documents.push({
            id: `book-${bookName}-${newPath.replace(/[/\\]/g, "-").replace(".mdx", "")}`,
            title: pageTitle,
            content:
              cleanContent.substring(0, 200) +
              (cleanContent.length > 200 ? "..." : ""),
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
            ]
          })

          // Add section documents
          sections.forEach((section, index) => {
            const sectionContent = section.content
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

            documents.push({
              id: `book-${bookName}-${newPath.replace(/[/\\]/g, "-").replace(".mdx", "")}-section-${index}`,
              title: section.title,
              content:
                sectionContent.substring(0, 200) +
                (sectionContent.length > 200 ? "..." : ""),
              url: `${urlPath}#${section.anchor}`,
              category: "books",
              tags: [
                bookName,
                "tutorial",
                "guide",
                "react",
                "javascript",
                "frontend",
                ...extractKeywords(sectionContent, section.title),
                ...(frontmatter.tags || [])
              ]
            })
          })
        } catch (error) {
          console.error(`Error processing file ${filePath}:`, error)
        }
      }
    }
  } catch (error) {
    console.error(`Error processing directory ${dirPath}:`, error)
  }
}

// Helper function to format titles
function formatTitle(filename: string): string {
  return filename.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
}

// Helper function to extract keywords from content
function extractKeywords(content: string, title: string): string[] {
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

  // Count word frequency
  const wordCount: Record<string, number> = {}
  words.forEach((word) => {
    wordCount[word] = (wordCount[word] || 0) + 1
  })

  // Return top 10 most frequent words
  return Object.entries(wordCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([word]) => word)
}

// Parse content into sections based on headers
function parseContentSections(
  markdownContent: string,
  _pageTitle: string,
  _urlPath: string
) {
  const sections: Array<{ title: string; content: string; anchor: string }> = []
  const lines = markdownContent.split("\n")
  let currentSection: string | null = null
  let currentContent: string[] = []

  for (const line of lines) {
    // Check for headers (## or ###)
    const headerMatch = line.match(/^(#{2,3})\s+(.+)$/)

    if (headerMatch) {
      // Save previous section if exists
      if (currentSection && currentContent.length > 0) {
        const cleanContent = currentContent.join("\n").trim()
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
    const cleanContent = currentContent.join("\n").trim()
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
function createAnchor(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, "") // Remove special characters
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with single
    .trim()
}
