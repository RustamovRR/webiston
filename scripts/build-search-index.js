const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')

// Build search index at build time
async function buildSearchIndex() {
  console.log('🔍 Building search index...')

  const documents = []

  // Add tools
  const toolsPages = [
    {
      id: 'tools',
      title: 'Veb Asboblar',
      content:
        "JSON formatter, URL encoder, Base64 converter, QR generator, Password generator va boshqa foydali veb asboblar to'plami",
      url: '/tools',
      category: 'tools',
      tags: ['tools', 'utilities', 'json', 'url', 'base64', 'qr', 'password'],
    },
    // Add all other tools...
  ]

  documents.push(...toolsPages)

  // Process MDX files
  const booksDir = path.join(process.cwd(), 'content')
  if (fs.existsSync(booksDir)) {
    const bookFolders = fs
      .readdirSync(booksDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)

    for (const bookFolder of bookFolders) {
      const bookPath = path.join(booksDir, bookFolder)
      await processBookDirectory(bookPath, bookFolder, documents, '')
    }
  }

  // Write index to public directory
  const indexPath = path.join(process.cwd(), 'public', 'search-index.json')
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
    } else if (file.name.endsWith('.mdx') && file.name !== '_meta.json') {
      try {
        const content = fs.readFileSync(filePath, 'utf-8')
        const { data: frontmatter, content: markdownContent } = matter(content)

        const urlPath = `/books/${bookName}/${currentPath ? currentPath + '/' : ''}${file.name.replace('.mdx', '')}`
          .replace(/\/+/g, '/')
          .replace(/\/$/, '')

        // Clean markdown content more thoroughly
        const cleanContent = markdownContent
          .replace(/```[\s\S]*?```/g, ' ')
          .replace(/`[^`]*`/g, ' ')
          .replace(/#{1,6}\s+/g, '')
          .replace(/\*\*([^*]*)\*\*/g, '$1')
          .replace(/\*([^*]*)\*/g, '$1')
          .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
          .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
          .replace(/>\s*/g, '')
          .replace(/\n+/g, ' ')
          .replace(/\s+/g, ' ')
          .trim()

        const keywords = extractKeywords(cleanContent, frontmatter.title || file.name)

        documents.push({
          id: `book-${bookName}-${newPath.replace(/[\/\\]/g, '-').replace('.mdx', '')}`,
          title: frontmatter.title || formatTitle(file.name.replace('.mdx', '')),
          content: cleanContent, // Full content for better search
          url: urlPath,
          category: 'books',
          tags: [
            bookName,
            'tutorial',
            'guide',
            'react',
            'javascript',
            'frontend',
            ...keywords,
            ...(frontmatter.tags || []),
          ],
        })
      } catch (error) {
        console.error(`Error processing file ${filePath}:`, error)
      }
    }
  }
}

function formatTitle(filename) {
  return filename.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())
}

function extractKeywords(content, title) {
  const commonWords = new Set([
    'the',
    'a',
    'an',
    'and',
    'or',
    'but',
    'in',
    'on',
    'at',
    'to',
    'for',
    'of',
    'with',
    'by',
    'is',
    'are',
    'was',
    'were',
    'be',
    'been',
    'have',
    'has',
    'had',
    'do',
    'does',
    'did',
    'will',
    'would',
    'could',
    'should',
    'may',
    'might',
    'can',
    'this',
    'that',
    'these',
    'those',
  ])

  const words = (content + ' ' + title)
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
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
