import { NextResponse } from 'next/server'
import { SearchDocument } from '@/lib/search/flexsearch'
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'

export async function GET() {
  try {
    const documents: SearchDocument[] = []

    // Tools pages qo'shamiz
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
      {
        id: 'tools-json-formatter',
        title: 'JSON Formatter',
        content:
          "JSON ma'lumotlarini formatlash, validatsiya qilish va xatolarni topish uchun asbob. JSON strukturasini chiroyli ko'rinishda ko'rsatadi.",
        url: '/tools/json-formatter',
        category: 'tools',
        tags: ['json', 'formatter', 'validator', 'prettify'],
      },
      {
        id: 'tools-url-encoder',
        title: 'URL Encoder/Decoder',
        content: "URL manzillarini encode va decode qilish uchun asbob. URL-safe formatga o'tkazish va qaytarish.",
        url: '/tools/url-encoder',
        category: 'tools',
        tags: ['url', 'encoder', 'decoder', 'percent-encoding'],
      },
      {
        id: 'tools-base64-converter',
        title: 'Base64 Converter',
        content: "Matn va fayllarni Base64 formatiga o'tkazish va qaytarish. Encode va decode operatsiyalari.",
        url: '/tools/base64-converter',
        category: 'tools',
        tags: ['base64', 'converter', 'encoder', 'decoder'],
      },
      {
        id: 'tools-qr-generator',
        title: 'QR Code Generator',
        content: "Matn, URL va boshqa ma'lumotlar uchun QR kod yaratish. Turli o'lcham va formatlar.",
        url: '/tools/qr-generator',
        category: 'tools',
        tags: ['qr', 'qrcode', 'generator', 'barcode'],
      },
      {
        id: 'tools-password-generator',
        title: 'Password Generator',
        content: 'Xavfsiz parollar yaratish uchun asbob. Turli uzunlik va murakkablik darajalari.',
        url: '/tools/password-generator',
        category: 'tools',
        tags: ['password', 'generator', 'security', 'random'],
      },
      {
        id: 'tools-color-converter',
        title: 'Color Converter',
        content: "Ranglarni turli formatlar o'rtasida o'tkazish: HEX, RGB, HSL, CMYK.",
        url: '/tools/color-converter',
        category: 'tools',
        tags: ['color', 'converter', 'hex', 'rgb', 'hsl'],
      },
      {
        id: 'tools-hash-generator',
        title: 'Hash Generator',
        content: 'MD5, SHA1, SHA256 va boshqa hash algoritmlar yordamida hash yaratish.',
        url: '/tools/hash-generator',
        category: 'tools',
        tags: ['hash', 'md5', 'sha1', 'sha256', 'generator'],
      },
      {
        id: 'tools-uuid-generator',
        title: 'UUID Generator',
        content: "Unique identifier yaratish uchun asbob. V1, V4 UUID formatlarini qo'llab-quvvatlaydi.",
        url: '/tools/uuid-generator',
        category: 'tools',
        tags: ['uuid', 'generator', 'unique', 'identifier'],
      },
      {
        id: 'tools-jwt-decoder',
        title: 'JWT Decoder',
        content: "JSON Web Token'larni decode qilish va ma'lumotlarini ko'rish uchun asbob.",
        url: '/tools/jwt-decoder',
        category: 'tools',
        tags: ['jwt', 'decoder', 'json', 'web', 'token'],
      },
      {
        id: 'tools-latin-cyrillic',
        title: 'Lotin-Kirill Konverter',
        content: "O'zbek matnini lotin va kirill yozuvlari o'rtasida o'tkazish uchun asbob.",
        url: '/tools/latin-cyrillic',
        category: 'tools',
        tags: ['latin', 'cyrillic', 'uzbek', 'converter', 'transliteration'],
      },
    ]

    documents.push(...toolsPages)

    // Books content qo'shamiz
    try {
      const booksDir = path.join(process.cwd(), 'content')
      if (fs.existsSync(booksDir)) {
        const bookFolders = fs
          .readdirSync(booksDir, { withFileTypes: true })
          .filter((dirent) => dirent.isDirectory())
          .map((dirent) => dirent.name)

        for (const bookFolder of bookFolders) {
          const bookPath = path.join(booksDir, bookFolder)
          await processBookDirectory(bookPath, bookFolder, documents)
        }
      }
    } catch (error) {
      console.error('Error processing books:', error)
    }

    return NextResponse.json(documents)
  } catch (error) {
    console.error('Error generating search documents:', error)
    return NextResponse.json([], { status: 500 })
  }
}

async function processBookDirectory(dirPath: string, bookName: string, documents: SearchDocument[]) {
  try {
    const files = fs.readdirSync(dirPath, { withFileTypes: true })

    for (const file of files) {
      const filePath = path.join(dirPath, file.name)

      if (file.isDirectory()) {
        await processBookDirectory(filePath, bookName, documents)
      } else if (file.name.endsWith('.mdx')) {
        try {
          const content = fs.readFileSync(filePath, 'utf-8')
          const { data: frontmatter, content: markdownContent } = matter(content)

          const relativePath = path.relative(path.join(process.cwd(), 'content'), filePath)
          const urlPath = `/books/${relativePath.replace(/\.mdx$/, '').replace(/\\/g, '/')}`

          // Clean markdown content
          const cleanContent = markdownContent
            .replace(/```[\s\S]*?```/g, '') // Remove code blocks
            .replace(/`[^`]*`/g, '') // Remove inline code
            .replace(/#{1,6}\s/g, '') // Remove headers
            .replace(/\*\*([^*]*)\*\*/g, '$1') // Remove bold
            .replace(/\*([^*]*)\*/g, '$1') // Remove italic
            .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // Remove links
            .replace(/\n+/g, ' ') // Replace newlines with spaces
            .trim()

          documents.push({
            id: `book-${bookName}-${path.basename(file.name, '.mdx')}`,
            title: frontmatter.title || path.basename(file.name, '.mdx'),
            content: cleanContent.substring(0, 300) + (cleanContent.length > 300 ? '...' : ''),
            url: urlPath,
            category: 'books',
            tags: [bookName, 'tutorial', 'guide', ...(frontmatter.tags || [])],
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
