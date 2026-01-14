import { Index } from "flexsearch"
import { ISearchHit } from "@/types/common"

export interface SearchDocument {
  id: string
  title: string
  content: string
  url: string
  category: string
  tags?: string[]
  hierarchy?: {
    lvl0: string
    lvl1: string
  }
}

class SearchEngine {
  private index: Index
  private documents: Map<string, SearchDocument> = new Map()
  private initialized = false

  constructor() {
    this.index = new Index({
      tokenize: "forward",
      cache: true,
      resolution: 9
    })
  }

  async initialize() {
    if (this.initialized) return

    try {
      // Try to load static index first
      const staticResponse = await fetch("/search-index.json")
      if (staticResponse.ok) {
        const documents: SearchDocument[] = await staticResponse.json()
        this.addDocuments(documents)
        console.log(`Loaded ${documents.length} documents from static index`)
      } else {
        // Fallback to API
        const response = await fetch("/api/search/documents")
        if (response.ok) {
          const documents: SearchDocument[] = await response.json()
          this.addDocuments(documents)
        } else {
          // Final fallback: hardcoded documents
          this.addFallbackDocuments()
        }
      }
      this.initialized = true
    } catch (error) {
      console.error("Search initialization failed:", error)
      this.addFallbackDocuments()
      this.initialized = true
    }
  }

  private addDocuments(documents: SearchDocument[]) {
    documents.forEach((doc) => {
      this.documents.set(doc.id, doc)
      // Title va content'ni birlashtirb index qilamiz
      const searchText = `${doc.title} ${doc.content} ${doc.tags?.join(" ") || ""}`
      this.index.add(doc.id, searchText)
    })
  }

  private addFallbackDocuments() {
    const fallbackDocs: SearchDocument[] = [
      {
        id: "tools",
        title: "Onlayn Vositalar",
        content:
          "JSON formatter, URL encoder, Base64 converter, QR generator, Password generator va boshqa foydali onlayn vositalar to'plami. Dasturchilar uchun zarur bo'lgan barcha vositalar bir joyda.",
        url: "/tools",
        category: "tools",
        tags: [
          "tools",
          "utilities",
          "json",
          "url",
          "base64",
          "qr",
          "password",
          "developer",
          "programming"
        ]
      },
      {
        id: "tools-json-formatter",
        title: "JSON Formatter",
        content:
          "JSON ma'lumotlarini formatlash, validatsiya qilish va xatolarni topish uchun asbob. JSON strukturasini chiroyli ko'rinishda ko'rsatadi va sintaksis xatolarini aniqlaydi.",
        url: "/tools/json-formatter",
        category: "tools",
        tags: [
          "json",
          "formatter",
          "validator",
          "prettify",
          "syntax",
          "javascript",
          "api",
          "data"
        ]
      },
      {
        id: "tools-url-encoder",
        title: "URL Encoder/Decoder",
        content:
          "URL manzillarini encode va decode qilish uchun asbob. URL-safe formatga o'tkazish va qaytarish, percent encoding operatsiyalari.",
        url: "/tools/url-encoder",
        category: "tools",
        tags: [
          "url",
          "encoder",
          "decoder",
          "percent-encoding",
          "web",
          "http",
          "uri"
        ]
      },
      {
        id: "tools-base64-converter",
        title: "Base64 Converter",
        content:
          "Matn va fayllarni Base64 formatiga o'tkazish va qaytarish. Encode va decode operatsiyalari, binary data bilan ishlash.",
        url: "/tools/base64-converter",
        category: "tools",
        tags: [
          "base64",
          "converter",
          "encoder",
          "decoder",
          "binary",
          "data",
          "file"
        ]
      },
      {
        id: "tools-qr-generator",
        title: "QR Code Generator",
        content:
          "Matn, URL va boshqa ma'lumotlar uchun QR kod yaratish. Turli o'lcham va formatlar, barcode generator.",
        url: "/tools/qr-generator",
        category: "tools",
        tags: ["qr", "qrcode", "generator", "barcode", "mobile", "scanner"]
      },
      {
        id: "tools-password-generator",
        title: "Password Generator",
        content:
          "Xavfsiz parollar yaratish uchun asbob. Turli uzunlik va murakkablik darajalari, kriptografik xavfsizlik.",
        url: "/tools/password-generator",
        category: "tools",
        tags: [
          "password",
          "generator",
          "security",
          "random",
          "cryptography",
          "authentication"
        ]
      },
      {
        id: "books-fluent-react",
        title: "Fluent React",
        content:
          "React.js bo'yicha chuqur qo'llanma va amaliy darslar. React hooks, state management, component lifecycle, performance optimization va zamonaviy React development texnikalari.",
        url: "/books/fluent-react",
        category: "books",
        tags: [
          "react",
          "javascript",
          "frontend",
          "tutorial",
          "hooks",
          "jsx",
          "components",
          "state",
          "props",
          "virtual-dom"
        ]
      },
      {
        id: "react-basics",
        title: "React Asoslari",
        content:
          "React.js ning asosiy tushunchalari: JSX, components, props, state. React dasturlash uchun zarur bo'lgan barcha bilimlar.",
        url: "/books/fluent-react/basics",
        category: "books",
        tags: [
          "react",
          "basics",
          "jsx",
          "components",
          "props",
          "state",
          "beginner"
        ]
      },
      {
        id: "react-hooks",
        title: "React Hooks",
        content:
          "React hooks: useState, useEffect, useContext, useReducer va boshqa hooklar. Functional components bilan ishlash.",
        url: "/books/fluent-react/hooks",
        category: "books",
        tags: [
          "react",
          "hooks",
          "useState",
          "useEffect",
          "useContext",
          "functional-components"
        ]
      },
      {
        id: "react-performance",
        title: "React Performance",
        content:
          "React ilovalarini optimallashtirishning eng yaxshi usullari. Memo, useMemo, useCallback va boshqa performance texnikalari.",
        url: "/books/fluent-react/performance",
        category: "books",
        tags: [
          "react",
          "performance",
          "optimization",
          "memo",
          "useMemo",
          "useCallback"
        ]
      }
    ]

    this.addDocuments(fallbackDocs)
  }

  async search(query: string): Promise<ISearchHit[][]> {
    if (!this.initialized) {
      await this.initialize()
    }

    if (!query.trim()) return []

    try {
      const searchQuery = query.toLowerCase().trim()

      // Multiple search strategies for better results
      const exactResults = this.index.search(searchQuery, { limit: 15 })

      // Also search for individual words
      const words = searchQuery.split(/\s+/)
      const wordResults: (string | number)[] = []
      for (const word of words) {
        if (word.length > 2) {
          const wordRes = this.index.search(word, { limit: 10 })
          wordResults.push(...wordRes)
        }
      }

      // Combine and deduplicate results
      const allResults = [...new Set([...exactResults, ...wordResults])]
      const hits: ISearchHit[] = []

      for (const id of allResults) {
        const doc = this.documents.get(id as string)
        if (doc) {
          // More sophisticated relevance scoring
          const titleMatch = doc.title.toLowerCase().includes(searchQuery)
          const contentMatch = doc.content.toLowerCase().includes(searchQuery)
          const tagMatch = doc.tags?.some((tag) =>
            tag.toLowerCase().includes(searchQuery)
          )

          // Check for partial word matches
          const titleWordMatch = words.some((word) =>
            doc.title.toLowerCase().includes(word)
          )
          const contentWordMatch = words.some((word) =>
            doc.content.toLowerCase().includes(word)
          )

          // Calculate relevance score
          let relevance = 0
          if (titleMatch) relevance += 10
          if (contentMatch) relevance += 5
          if (tagMatch) relevance += 3
          if (titleWordMatch) relevance += 2
          if (contentWordMatch) relevance += 1

          // Skip if no relevance
          if (relevance === 0) continue

          const hit: ISearchHit & { _relevance?: number } = {
            objectID: doc.id,
            content: this.highlightText(doc.content, searchQuery),
            hierarchy: doc.hierarchy || {
              lvl0: doc.category === "tools" ? "Vositalar" : "Kitoblar",
              lvl1: doc.title
            },
            contentType: doc.category === "tools" ? "article" : "tutorial",
            path: doc.url,
            fullPath: new URL(doc.url, window.location.origin).toString(),
            _relevance: relevance
          }
          hits.push(hit)
        }
      }

      // Sort by relevance
      hits.sort(
        (a, b) => ((b as any)._relevance || 0) - ((a as any)._relevance || 0)
      )

      // Category bo'yicha guruhlash
      const grouped = this.groupByCategory(hits)
      return grouped
    } catch (error) {
      console.error("Search failed:", error)
      return []
    }
  }

  private highlightText(text: string, query: string): string {
    if (!query.trim()) return text

    const regex = new RegExp(
      `(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    )
    return text.replace(regex, "<mark>$1</mark>")
  }

  private groupByCategory(hits: ISearchHit[]): ISearchHit[][] {
    const groups: Record<string, ISearchHit[]> = {}

    hits.forEach((hit) => {
      const category = hit.hierarchy.lvl0 || "Boshqa"
      if (!groups[category]) {
        groups[category] = []
      }
      groups[category].push(hit)
    })

    return Object.values(groups).filter((group) => group.length > 0)
  }
}

// Singleton instance
export const searchEngine = new SearchEngine()
