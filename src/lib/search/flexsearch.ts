import { Index } from "flexsearch"
import type { ISearchHit } from "@/types/common"

/**
 * The five characters that can change the meaning of markup. Applied to search
 * result text before any `<mark>` is inserted — see `highlightText`.
 */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

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

  /**
   * Single-flight guard. Without it, `warm()` on hover followed by
   * `initialize()` on open would fetch and index the 1.07 MB payload TWICE.
   */
  private pending: Promise<void> | null = null

  /**
   * Start loading without awaiting — call on hover/focus of the search trigger.
   * By the time the dialog opens the index is usually built, so the entrance
   * animation gets a clear main thread. This is the fix for the visible flicker
   * on first open: indexing ~1000 documents is a long synchronous task, and it
   * used to start at the exact moment the dialog began animating in.
   */
  warm() {
    void this.initialize()
  }

  async initialize() {
    if (this.initialized) return
    // Coalesce concurrent callers (hover + open, or two rapid ⌘K presses).
    if (this.pending) return this.pending
    this.pending = this.doInitialize().finally(() => {
      this.pending = null
    })
    return this.pending
  }

  private async doInitialize() {
    try {
      // Try to load static index first
      const staticResponse = await fetch("/search-index.json")
      if (staticResponse.ok) {
        const documents: SearchDocument[] = await staticResponse.json()
        await this.addDocuments(documents)
      } else {
        // Fallback to API
        const response = await fetch("/api/search/documents")
        if (response.ok) {
          const documents: SearchDocument[] = await response.json()
          await this.addDocuments(documents)
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

  /**
   * Indexes in chunks, yielding to the browser between them.
   *
   * `index.add()` over ~1000 documents in one synchronous `forEach` is a single
   * long task — long enough to drop the frames the search dialog needs for its
   * entrance. Yielding every CHUNK keeps each task short, so animation and
   * indexing interleave instead of competing.
   */
  private async addDocuments(documents: SearchDocument[]) {
    const CHUNK = 150
    for (let i = 0; i < documents.length; i += CHUNK) {
      for (const doc of documents.slice(i, i + CHUNK)) {
        this.documents.set(doc.id, doc)
        // Title va content'ni birlashtirb index qilamiz
        const searchText = `${doc.title} ${doc.content} ${doc.tags?.join(" ") || ""}`
        this.index.add(doc.id, searchText)
      }
      if (i + CHUNK < documents.length) {
        await new Promise((resolve) => setTimeout(resolve, 0))
      }
    }
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

  /**
   * The output of this goes straight into `dangerouslySetInnerHTML` in
   * `SearchComponents`, so it is the one place in the app where a string from
   * `content/**` becomes live markup.
   *
   * It escapes the text FIRST and inserts `<mark>` after, which is the whole
   * trick: the only tags that can survive are the two this function wrote
   * itself. Before, the chapter text was passed through untouched — the index
   * builder strips markdown but not HTML, so a raw tag written in prose (as
   * opposed to inside a code fence, which IS stripped) would have been injected
   * verbatim.
   *
   * Measured against the built index today: 1,078 documents, **0** contain a
   * script/img/iframe/handler, and the 4 that contain `<` at all are MDX
   * component tags like `<Callout type="info"`. So this was not a live hole —
   * it is the class of hole being closed, at the cost of three lines and no
   * sanitiser dependency.
   *
   * `escapeHtml` runs on the QUERY too, via the same path: the query is only
   * used to build the regex, and the replacement inserts `$1` from the already
   * escaped text, never from raw input.
   */
  private highlightText(text: string, query: string): string {
    const safe = escapeHtml(text)
    if (!query.trim()) return safe

    // The query has to be escaped the same way before matching, or a search for
    // `<` would never line up with the `&lt;` now sitting in `safe`.
    const needle = escapeHtml(query).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    return safe.replace(new RegExp(`(${needle})`, "gi"), "<mark>$1</mark>")
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
